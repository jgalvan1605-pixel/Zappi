import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeToE164 } from '@/lib/phoneNormalizer';
import { scheduleJob, cancelPendingJobs } from '@/lib/jobQueue';
import { verifyShopifyHmac } from '@/lib/shopifySecurity';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    const topic = req.headers.get('x-shopify-topic') || 'checkouts/create';

    let org = await prisma.organization.findFirst();
    if (!org) {
      return NextResponse.json({ status: 'ORGANIZATION_NOT_READY' }, { status: 200 });
    }

    // 1. Verificación Criptográfica de Seguridad HMAC
    const isValidSignature = verifyShopifyHmac(rawBody, hmacHeader, org.shopifyWebhookSecret);
    if (!isValidSignature) {
      console.warn('⚠️ Webhook de Shopify rechazado: Firma HMAC no válida');
      return NextResponse.json({ error: 'Firma HMAC inválida' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // 2. Extraer teléfono
    const rawPhone = body.phone || body.customer?.phone || body.shipping_address?.phone || body.billing_address?.phone;
    if (!rawPhone) {
      return NextResponse.json({ status: 'NO_PHONE_IN_PAYLOAD' }, { status: 200 });
    }

    const norm = normalizeToE164(rawPhone, '34');
    if (!norm.isValid) {
      return NextResponse.json({ status: 'INVALID_E164_PHONE' }, { status: 200 });
    }

    const firstName = body.customer?.first_name || body.shipping_address?.first_name || 'Estimado/a';
    const email = body.email || body.customer?.email || null;
    const checkoutUrl = body.abandoned_checkout_url || body.landing_site || 'https://mitienda.com/checkout';

    // 3. Comprobar si el cliente solicitó la baja (RGPD)
    const existingContact = await prisma.contact.findFirst({
      where: {
        organizationId: org.id,
        phone: norm.normalizedPhone
      }
    });

    if (existingContact?.optedOut) {
      console.log(`🛡️ [RGPD] Omitiendo secuencia para ${norm.normalizedPhone} porque está dado de baja.`);
      return NextResponse.json({ status: 'SKIPPED_DUE_TO_OPTOUT' }, { status: 200 });
    }

    // 4. Upsert de Contacto
    const isCheckout = topic.includes('checkout');
    await prisma.contact.upsert({
      where: {
        organizationId_phone: {
          organizationId: org.id,
          phone: norm.normalizedPhone
        }
      },
      update: {
        firstName: firstName !== 'Estimado/a' ? firstName : undefined,
        email: email || undefined,
        tags: isCheckout ? ['Carrito Abandonado', 'Shopify'] : ['Comprador Shopify', 'Shopify']
      },
      create: {
        organizationId: org.id,
        phone: norm.normalizedPhone,
        firstName: firstName !== 'Estimado/a' ? firstName : null,
        email,
        tags: isCheckout ? ['Carrito Abandonado', 'Shopify'] : ['Comprador Shopify', 'Shopify']
      }
    });

    // 5. Lógica de Disparo y Cancelación
    if (isCheckout) {
      const automation = await prisma.automation.findFirst({
        where: {
          organizationId: org.id,
          triggerType: 'shopify_abandoned_cart',
          isActive: true
        }
      });

      if (automation) {
        await scheduleJob({
          organizationId: org.id,
          jobType: 'abandoned_cart_reminder',
          targetPhone: norm.normalizedPhone,
          delayMinutes: 20,
          payload: {
            templateName: 'recuperacion_carrito_vip',
            firstName,
            discountCode: 'ZAPPI10',
            discountPercent: '10%',
            checkoutUrl
          }
        });
      }
    } else if (topic.includes('order')) {
      await cancelPendingJobs(org.id, norm.normalizedPhone, 'abandoned_cart_reminder');

      const postPurchaseAuto = await prisma.automation.findFirst({
        where: {
          organizationId: org.id,
          triggerType: 'shopify_order_paid',
          isActive: true
        }
      });

      if (postPurchaseAuto) {
        await scheduleJob({
          organizationId: org.id,
          jobType: 'post_purchase_followup',
          targetPhone: norm.normalizedPhone,
          delayMinutes: 48 * 60,
          payload: {
            templateName: 'seguimiento_pedido_postcompra',
            firstName,
            orderId: body.order_number || body.id
          }
        });
      }
    }

    return NextResponse.json({ status: 'WEBHOOK_PROCESSED_SUCCESS' }, { status: 200 });
  } catch (err: any) {
    console.error('Error en webhook de Shopify:', err);
    return NextResponse.json({ error: err.message }, { status: 200 });
  }
}