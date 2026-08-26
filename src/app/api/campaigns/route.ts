import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Mi Empresa', plan: 'pro' }
      });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular métricas globales
    const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
    const totalDelivered = campaigns.reduce((acc, c) => acc + c.deliveredCount, 0);
    const totalRead = campaigns.reduce((acc, c) => acc + c.readCount, 0);

    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 99;
    const readRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 96;

    return NextResponse.json({
      campaigns,
      stats: {
        totalCampaigns: campaigns.length,
        totalSent,
        totalDelivered,
        totalRead,
        deliveryRate,
        readRate
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, templateName, templateParams = {}, targetAudience = {} } = body;

    if (!name || !templateName) {
      return NextResponse.json({ error: 'Nombre de campaña y plantilla son obligatorios.' }, { status: 400 });
    }

    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Mi Empresa', plan: 'pro' }
      });
    }

    // Calcular tamaño de la audiencia objetivo
    const tag = targetAudience.tag;
    const whereContact: any = { organizationId: org.id };
    if (tag && tag !== 'ALL') {
      whereContact.tags = { has: tag };
    }

    const targetCount = await prisma.contact.count({ where: whereContact });

    const campaign = await prisma.campaign.create({
      data: {
        organizationId: org.id,
        name: name.trim(),
        templateName: templateName.trim(),
        templateParams,
        targetAudience,
        status: 'draft',
        totalTarget: targetCount,
        sentCount: 0,
        deliveredCount: 0,
        readCount: 0
      }
    });

    return NextResponse.json({ success: true, campaign });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}