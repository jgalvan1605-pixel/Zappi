import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppTemplate, sendWhatsAppText } from '@/lib/metaClient';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, type = 'template', templateName = 'hello_world', text } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Debes indicar un número de teléfono destinatario.' }, { status: 400 });
    }

    const org = await prisma.organization.findFirst();
    if (!org || !org.phoneNumberId || !org.accessToken) {
      return NextResponse.json({ error: 'Debes conectar tu cuenta de WhatsApp en Ajustes antes de enviar.' }, { status: 400 });
    }

    let result;

    if (type === 'template') {
      result = await sendWhatsAppTemplate({
        phoneNumberId: org.phoneNumberId,
        encryptedToken: org.accessToken,
        to: phone,
        templateName
      });
    } else {
      result = await sendWhatsAppText({
        phoneNumberId: org.phoneNumberId,
        encryptedToken: org.accessToken,
        to: phone,
        text: text || '⚡ Mensaje de prueba enviado desde Zappi.'
      });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      wamid: result.wamid,
      message: `¡Mensaje enviado con éxito a ${phone}!`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}