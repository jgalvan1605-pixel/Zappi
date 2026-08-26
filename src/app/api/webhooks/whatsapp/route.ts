import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateComplianceMessage, executeOptOut, executeOptIn } from '@/lib/compliance';
import { sendWhatsAppText } from '@/lib/metaClient';

export const dynamic = 'force-dynamic';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'zappi_webhook_verify_token_2026';

/**
 * GET: Handshake de verificación de Meta Developers
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✓ Webhook de WhatsApp verificado correctamente con Meta.');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

/**
 * POST: Ingesta de mensajes y control automático de bajas RGPD (<50ms)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;
          if (!value) continue;

          const phoneNumberId = value.metadata?.phone_number_id;

          // 1. ACTUALIZAR ESTADOS DE ENTREGA (sent, delivered, read)
          if (value.statuses && Array.isArray(value.statuses)) {
            for (const statusObj of value.statuses) {
              const wamid = statusObj.id;
              const statusStr = statusObj.status;

              try {
                await prisma.message.updateMany({
                  where: { wamid },
                  data: { status: statusStr }
                });
              } catch (e) {}
            }
          }

          // 2. PROCESAR MENSAJES ENTRANTES Y BAJAS RGPD
          if (value.messages && Array.isArray(value.messages)) {
            const org = await prisma.organization.findFirst({
              where: { phoneNumberId }
            });

            if (org) {
              for (const msg of value.messages) {
                const fromPhone = `+${msg.from}`;
                const wamid = msg.id;
                const msgType = msg.type;
                const profileName = value.contacts?.[0]?.profile?.name || null;

                let textContent = '';
                if (msgType === 'text') {
                  textContent = msg.text?.body || '';
                } else if (msgType === 'interactive') {
                  textContent = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || 'Respuesta interactiva';
                } else {
                  textContent = `[Archivo ${msgType}]`;
                }

                // Evaluar si es orden de Baja / Alta RGPD
                const compliance = evaluateComplianceMessage(textContent);

                if (compliance.action === 'OPTOUT') {
                  await executeOptOut(org.id, fromPhone);
                } else if (compliance.action === 'OPTIN') {
                  await executeOptIn(org.id, fromPhone);
                }

                // Guardar / actualizar conversación
                let conversation = await prisma.conversation.findFirst({
                  where: {
                    organizationId: org.id,
                    contactPhone: fromPhone
                  }
                });

                if (!conversation) {
                  conversation = await prisma.conversation.create({
                    data: {
                      organizationId: org.id,
                      contactPhone: fromPhone,
                      contactName: profileName,
                      status: 'open'
                    }
                  });
                }

                // Guardar / actualizar contacto
                let contact = await prisma.contact.findFirst({
                  where: {
                    organizationId: org.id,
                    phone: fromPhone
                  }
                });

                if (!contact) {
                  contact = await prisma.contact.create({
                    data: {
                      organizationId: org.id,
                      phone: fromPhone,
                      firstName: profileName || 'Cliente WhatsApp',
                      tags: ['Inbound WhatsApp'],
                      optedOut: compliance.action === 'OPTOUT'
                    }
                  });
                }

                // Guardar mensaje entrante
                await prisma.message.create({
                  data: {
                    conversationId: conversation.id,
                    contactId: contact.id,
                    wamid,
                    direction: 'inbound',
                    type: msgType,
                    content: { text: textContent, raw: msg },
                    status: 'delivered'
                  }
                });

                // Si se detectó baja o alta, responder automáticamente con la confirmación legal
                if (compliance.replyMessage && org.accessToken && org.phoneNumberId) {
                  const replyRes = await sendWhatsAppText({
                    phoneNumberId: org.phoneNumberId,
                    encryptedToken: org.accessToken,
                    to: fromPhone,
                    text: compliance.replyMessage
                  });

                  if (replyRes.success && replyRes.wamid) {
                    await prisma.message.create({
                      data: {
                        conversationId: conversation.id,
                        contactId: contact.id,
                        wamid: replyRes.wamid,
                        direction: 'outbound',
                        type: 'text',
                        content: { text: compliance.replyMessage, complianceAutoReply: true },
                        status: 'sent'
                      }
                    });
                  }
                }
              }
            }
          }
        }
      }

      return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
    }

    return NextResponse.json({ status: 'IGNORED' }, { status: 200 });
  } catch (error: any) {
    console.error('Error en webhook de WhatsApp:', error);
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}