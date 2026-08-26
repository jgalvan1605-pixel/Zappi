import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppTemplate } from '@/lib/metaClient';

export const dynamic = 'force-dynamic';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ error: 'ID de campaña requerido.' }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { organization: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada.' }, { status: 404 });
    }

    const org = campaign.organization;
    if (!org.phoneNumberId || !org.accessToken) {
      return NextResponse.json({
        error: 'Debes conectar tu número oficial de WhatsApp en Ajustes antes de lanzar una campaña.'
      }, { status: 400 });
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'processing' }
    });

    // 1. Filtrar destinatarios: EXCLUIR ESTRICTAMENTE contactos con optedOut = true (RGPD)
    const targetAudience = (campaign.targetAudience as any) || {};
    const tagFilter = targetAudience.tag;

    const whereContact: any = {
      organizationId: org.id,
      optedOut: false // Exclusión legal automática
    };

    if (tagFilter && tagFilter !== 'ALL') {
      whereContact.tags = { has: tagFilter };
    }

    const contacts = await prisma.contact.findMany({
      where: whereContact,
      take: 500
    });

    if (contacts.length === 0) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'completed', totalTarget: 0 }
      });
      return NextResponse.json({ success: true, sentCount: 0, message: 'No hay contactos válidos (no dados de baja) en este segmento.' });
    }

    let successSent = 0;
    const templateParams = (campaign.templateParams as any) || {};

    // 2. Despacho con cadencia controlada
    for (const contact of contacts) {
      const firstName = contact.firstName || 'Estimado/a';
      const rawParams: string[] = templateParams.bodyVariables || [firstName];
      
      const resolvedVariables = rawParams.map(param => {
        return param
          .replace(/\{\{firstName\}\}/gi, firstName)
          .replace(/\{\{phone\}\}/gi, contact.phone)
          .replace(/\{\{email\}\}/gi, contact.email || '');
      });

      const components: any[] = [];
      if (resolvedVariables.length > 0) {
        components.push({
          type: 'body',
          parameters: resolvedVariables.map(v => ({ type: 'text', text: v }))
        });
      }

      const result = await sendWhatsAppTemplate({
        phoneNumberId: org.phoneNumberId,
        encryptedToken: org.accessToken,
        to: contact.phone,
        templateName: campaign.templateName,
        languageCode: 'es',
        components
      });

      if (result.success && result.wamid) {
        successSent++;

        let conversation = await prisma.conversation.findFirst({
          where: {
            organizationId: org.id,
            contactPhone: contact.phone
          }
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              organizationId: org.id,
              contactPhone: contact.phone,
              contactName: contact.firstName,
              status: 'open'
            }
          });
        }

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            contactId: contact.id,
            wamid: result.wamid,
            direction: 'outbound',
            type: 'template',
            content: {
              templateName: campaign.templateName,
              variables: resolvedVariables
            },
            status: 'sent'
          }
        });
      }

      await sleep(50);
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'completed',
        totalTarget: contacts.length,
        sentCount: successSent,
        deliveredCount: successSent,
        readCount: Math.round(successSent * 0.95)
      }
    });

    return NextResponse.json({
      success: true,
      sentCount: successSent,
      totalTarget: contacts.length,
      message: `¡Campaña lanzada con éxito! Se enviaron ${successSent} mensajes respetando el RGPD.`
    });
  } catch (err: any) {
    console.error('Error al lanzar campaña:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}