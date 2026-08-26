import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeToE164 } from '@/lib/phoneNormalizer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customers = [] } = body;

    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Mi Empresa', plan: 'pro' }
      });
    }

    let imported = 0;

    for (const c of customers) {
      const rawPhone = c.phone || c.default_address?.phone;
      if (!rawPhone) continue;

      const norm = normalizeToE164(rawPhone, '34');
      if (!norm.isValid) continue;

      const tags = ['Shopify'];
      if (c.orders_count && Number(c.orders_count) > 0) {
        tags.push('Comprador Shopify');
      }
      if (c.total_spent && Number(c.total_spent) >= 300) {
        tags.push('VIP High-Ticket');
      }

      await prisma.contact.upsert({
        where: {
          organizationId_phone: {
            organizationId: org.id,
            phone: norm.normalizedPhone
          }
        },
        update: {
          firstName: c.first_name || undefined,
          lastName: c.last_name || undefined,
          email: c.email || undefined,
          tags,
          customFields: {
            orders_count: c.orders_count || 0,
            total_spent: c.total_spent || '0',
            currency: c.currency || 'EUR'
          }
        },
        create: {
          organizationId: org.id,
          phone: norm.normalizedPhone,
          firstName: c.first_name || null,
          lastName: c.last_name || null,
          email: c.email || null,
          tags,
          customFields: {
            orders_count: c.orders_count || 0,
            total_spent: c.total_spent || '0',
            currency: c.currency || 'EUR'
          }
        }
      });
      imported++;
    }

    return NextResponse.json({
      success: true,
      syncedCount: imported,
      message: `¡${imported} clientes de Shopify sincronizados y normalizados a E.164!`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}