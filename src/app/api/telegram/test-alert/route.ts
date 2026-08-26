import { NextResponse } from 'next/server';
import { sendTelegramCommercialAlert } from '@/lib/telegramBot';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      phone = '+34600000000', 
      name = 'Carlos Gómez', 
      amount = 450, 
      product = 'Sofá Modular 3 Plazas' 
    } = body;

    const result = await sendTelegramCommercialAlert({
      customerName: name,
      customerPhone: phone,
      totalAmount: amount,
      productName: product,
      discountCode: 'ZAPPI10',
      source: 'Prueba Manual'
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '¡Alerta de Telegram enviada con éxito al comercial!'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}