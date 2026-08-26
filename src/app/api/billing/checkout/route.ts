import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStripeClient, ZAPPI_PLANS, CREDIT_PACKAGES } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, creditPackageId } = body;

    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Mi Empresa', plan: 'free' }
      });
    }

    const stripe = getStripeClient();
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // Modo simulación local si no hay clave de Stripe configurada
    if (!stripe) {
      if (planId && ZAPPI_PLANS[planId]) {
        const selected = ZAPPI_PLANS[planId];
        await prisma.organization.update({
          where: { id: org.id },
          data: {
            plan: selected.id,
            monthlyQuota: selected.messageQuota,
            messageCredits: { increment: selected.messageQuota }
          }
        });
        return NextResponse.json({
          simulated: true,
          message: `¡Plan ${selected.name} activado con éxito en modo de desarrollo!`
        });
      }

      if (creditPackageId) {
        const pkg = CREDIT_PACKAGES.find(p => p.id === creditPackageId);
        if (pkg) {
          await prisma.organization.update({
            where: { id: org.id },
            data: { messageCredits: { increment: pkg.credits } }
          });
          return NextResponse.json({
            simulated: true,
            message: `¡${pkg.credits.toLocaleString()} créditos recargados con éxito!`
          });
        }
      }
      return NextResponse.json({ error: 'Configura STRIPE_SECRET_KEY en tu .env' }, { status: 400 });
    }

    // 1. Checkout para Suscripción Mensual
    if (planId && ZAPPI_PLANS[planId]) {
      const selectedPlan = ZAPPI_PLANS[planId];
      if (selectedPlan.priceMonthly === 0) {
        await prisma.organization.update({
          where: { id: org.id },
          data: { plan: 'free', monthlyQuota: 250 }
        });
        return NextResponse.json({ success: true, message: 'Plan gratuito activado' });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: undefined,
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Zappi - Plan ${selectedPlan.name}`,
                description: selectedPlan.description
              },
              unit_amount: selectedPlan.priceMonthly * 100,
              recurring: { interval: 'month' }
            },
            quantity: 1
          }
        ],
        metadata: {
          organizationId: org.id,
          planId: selectedPlan.id,
          type: 'subscription'
        },
        success_url: `${origin}/?billing=success`,
        cancel_url: `${origin}/?billing=cancel`
      });

      return NextResponse.json({ url: session.url });
    }

    // 2. Checkout para Recarga de Créditos (One-Time)
    if (creditPackageId) {
      const pkg = CREDIT_PACKAGES.find(p => p.id === creditPackageId);
      if (!pkg) return NextResponse.json({ error: 'Paquete de créditos no válido' }, { status: 400 });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Zappi - ${pkg.name}`,
                description: `Recarga de ${pkg.credits.toLocaleString()} mensajes para WhatsApp Business`
              },
              unit_amount: pkg.price * 100
            },
            quantity: 1
          }
        ],
        metadata: {
          organizationId: org.id,
          credits: String(pkg.credits),
          type: 'credit_refill'
        },
        success_url: `${origin}/?billing=credits_success`,
        cancel_url: `${origin}/?billing=cancel`
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: 'Parámetros no válidos' }, { status: 400 });
  } catch (err: any) {
    console.error('Error en Stripe Checkout:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}