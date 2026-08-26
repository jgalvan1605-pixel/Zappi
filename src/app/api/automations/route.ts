import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PREBUILT_RECIPES } from '@/lib/automationsEngine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Mi Empresa', plan: 'pro' }
      });
    }

    let automations = await prisma.automation.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: 'desc' }
    });

    // Si la organización no tiene flujos creados, inicializar con la receta de carrito abandonado
    if (automations.length === 0) {
      const defaultRecipe = PREBUILT_RECIPES[0];
      const created = await prisma.automation.create({
        data: {
          organizationId: org.id,
          name: defaultRecipe.name,
          triggerType: defaultRecipe.triggerType,
          flowData: defaultRecipe.steps as any,
          isActive: true
        }
      });
      automations = [created];
    }

    return NextResponse.json({
      automations,
      stats: {
        activeCount: automations.filter(a => a.isActive).length,
        totalRecoveredEstimated: '14.250 €',
        avgConversionRate: '19.4%'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, triggerType, flowData = [], isActive = true } = body;

    if (!name || !triggerType) {
      return NextResponse.json({ error: 'Nombre y tipo de disparador son obligatorios.' }, { status: 400 });
    }

    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Mi Empresa', plan: 'pro' }
      });
    }

    const automation = await prisma.automation.create({
      data: {
        organizationId: org.id,
        name: name.trim(),
        triggerType,
        flowData,
        isActive
      }
    });

    return NextResponse.json({ success: true, automation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}