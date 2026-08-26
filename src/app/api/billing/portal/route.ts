import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStripeClient } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 });

    const stripe = getStripeClient();
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    if (!stripe || !org.stripeCustomerId) {
      return NextResponse.json({
        simulated: true,
        message: 'El portal de facturación se habilitará al realizar tu primer pago con tarjeta.'
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: origin
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}