import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppText } from '@/lib/metaClient';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });

    const parsedMessages = messages.map(m => {
      let text = '';
      if (typeof m.content === 'object' && m.content !== null) {
        const c = m.content as any;
        text = c.text || (c.templateName ? `[Plantilla: ${c.templateName}]` : '[Mensaje]');
      } else {
        text = String(m.content);
      }

      return {
        id: m.id,
        wamid: m.wamid,
        direction: m.direction,
        type: m.type,
        text,
        status: m.status,
        createdAt: m.createdAt
      };
    });

    return NextResponse.json({ messages: parsedMessages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    const body = await req.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'El contenido del mensaje no puede estar vacío.' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { organization: true }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada.' }, { status: 404 });
    }

    const org = conversation.organization;
    if (!org.phoneNumberId || !org.accessToken) {
      return NextResponse.json({
        error: 'Debes conectar tu número oficial de WhatsApp en Ajustes antes de enviar mensajes.'
      }, { status: 400 });
    }

    // 1. Enviar mensaje de texto a través de Meta Cloud API
    const metaResult = await sendWhatsAppText({
      phoneNumberId: org.phoneNumberId,
      encryptedToken: org.accessToken,
      to: conversation.contactPhone,
      text: text.trim()
    });

    if (!metaResult.success) {
      return NextResponse.json({
        error: metaResult.error || 'No se pudo enviar el mensaje a través de WhatsApp.'
      }, { status: 400 });
    }

    // 2. Guardar el mensaje en base de datos
    const contact = await prisma.contact.findFirst({
      where: {
        organizationId: org.id,
        phone: conversation.contactPhone
      }
    });

    const newMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        contactId: contact?.id || null,
        wamid: metaResult.wamid || null,
        direction: 'outbound',
        type: 'text',
        content: { text: text.trim() },
        status: 'sent'
      }
    });

    // 3. Actualizar fecha de la conversación
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        wamid: newMessage.wamid,
        direction: newMessage.direction,
        type: newMessage.type,
        text: text.trim(),
        status: newMessage.status,
        createdAt: newMessage.createdAt
      }
    });
  } catch (err: any) {
    console.error('Error enviando mensaje desde Inbox:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}