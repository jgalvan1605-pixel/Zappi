import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramCommercialAlert } from '@/lib/telegramBot';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) {
      return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        telegramChatId: org.telegramChatId || process.env.TELEGRAM_COMMERCIAL_CHAT_ID || null,
        isConfigured: Boolean(org.telegramChatId || process.env.TELEGRAM_COMMERCIAL_CHAT_ID)
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telegramChatId, testNow } = body;

    let org = await prisma.organization.findFirst();
    if (!org) {
      return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 });
    }

    if (telegramChatId) {
      org = await prisma.organization.update({
        where: { id: org.id },
        data: { telegramChatId: telegramChatId.trim() }
      });
    }

    const effectiveChatId = org.telegramChatId || process.env.TELEGRAM_COMMERCIAL_CHAT_ID;

    // Si se solicita prueba inmediata
    if (testNow && effectiveChatId) {
      const res = await sendTelegramCommercialAlert({
        customerName: 'Prueba de Conexión (Zappi)',
        customerPhone: '+34600112233',
        totalAmount: 1850,
        productName: 'Sortija Texturas Oro Rosa 18k con Diamantes',
        discountCode: 'ELENA10',
        source: 'Verificación del Asesor',
        overrideChatId: effectiveChatId
      });

      if (!res.success) {
        return NextResponse.json({ 
          error: `Error al enviar alerta a Telegram: ${res.error}. Verifica haber pulsado "Iniciar" en el bot.` 
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      message: '¡Canal de Telegram vinculado y verificado correctamente!',
      telegramChatId: effectiveChatId
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}