import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ZAPPI_PLANS } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Mi Empresa', plan: 'pro', messageCredits: 5000, monthlyQuota: 5000 }
      });
    }

    const currentPlanConfig = ZAPPI_PLANS[org.plan] || ZAPPI_PLANS['free'];
    const usedCount = org.messagesSentThisMonth || 0;
    const totalCredits = org.messageCredits || 0;
    const quota = org.monthlyQuota || currentPlanConfig.messageQuota;
    const usagePercent = quota > 0 ? Math.min(100, Math.round((usedCount / quota) * 100)) : 0;

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        plan: org.plan,
        planDetails: currentPlanConfig,
        messageCredits: totalCredits,
        monthlyQuota: quota,
        messagesSentThisMonth: usedCount,
        usagePercent,
        isConfigured: Boolean(org.phoneNumberId && org.accessToken)
      },
      availablePlans: Object.values(ZAPPI_PLANS)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}