import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStripeClient, ZAPPI_PLANS } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: any;

    if (stripe && webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error('Firma de webhook de Stripe no válida:', err.message);
        return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
      }
    } else {
      event = JSON.parse(rawBody);
    }

    const dataObject = event.data?.object;

    switch (event.type) {
      case 'checkout.session.completed': {
        const metadata = dataObject.metadata || {};
        const organizationId = metadata.organizationId;
        const customerId = dataObject.customer;

        if (organizationId) {
          if (metadata.type === 'subscription' && metadata.planId) {
            const planConfig = ZAPPI_PLANS[metadata.planId];
            if (planConfig) {
              await prisma.organization.update({
                where: { id: organizationId },
                data: {
                  plan: planConfig.id,
                  stripeCustomerId: customerId || undefined,
                  stripeSubscriptionId: dataObject.subscription || undefined,
                  monthlyQuota: planConfig.messageQuota,
                  messageCredits: { increment: planConfig.messageQuota }
                }
              });
              console.log(`✓ Suscripción ${planConfig.name} activada para org ${organizationId}`);
            }
          } else if (metadata.type === 'credit_refill' && metadata.credits) {
            const creditsToAdd = parseInt(metadata.credits, 10);
            await prisma.organization.update({
              where: { id: organizationId },
              data: {
                messageCredits: { increment: creditsToAdd },
                stripeCustomerId: customerId || undefined
              }
            });
            console.log(`✓ ${creditsToAdd} créditos recargados para org ${organizationId}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subId = dataObject.id;
        await prisma.organization.updateMany({
          where: { stripeSubscriptionId: subId },
          data: {
            plan: 'free',
            monthlyQuota: 250
          }
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Error procesando webhook de Stripe:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}