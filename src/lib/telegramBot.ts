export interface TelegramLeadNotification {
  customerName: string;
  customerPhone: string; // Formato E.164 (+34600000000)
  totalAmount?: string | number;
  productName?: string;
  checkoutUrl?: string;
  discountCode?: string;
  source?: string;
  overrideChatId?: string; // Para enviar a un tenant específico
}

/**
 * Genera el enlace universal Click-to-Chat de WhatsApp (wa.me)
 */
export function buildWhatsAppDeepLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Envía la notificación con botón interactivo al asesor comercial a través de Telegram
 */
export async function sendTelegramCommercialAlert(data: TelegramLeadNotification) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = data.overrideChatId || process.env.TELEGRAM_COMMERCIAL_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN o Chat ID no configurados.');
    return { success: false, error: 'Falta configurar el Chat ID de Telegram' };
  }

  // 1. Mensaje sugerido que se precargará en WhatsApp con tono de Alta Joyería
  const suggestedMessage = 
`Hola ${data.customerName}! 👋 
Vi que estuviste viendo nuestra pieza *${data.productName || 'de Alta Joyería'}* en la tienda. 

¿Tienes alguna duda con la talla, o te gustaría reservar una cita privada en nuestro Atelier para probártela en persona? ✨

Dime y te ayudo encantada. 💍`;

  // 2. Construir el Deep Link de WhatsApp
  const waUrl = buildWhatsAppDeepLink(data.customerPhone, suggestedMessage);

  // 3. Redactar el informe de alerta para Telegram
  const telegramText = 
`🚨 *¡NUEVO CARRITO DETECTADO! (Zappi Alert)*

👤 *Cliente:* ${data.customerName}
📞 *Teléfono:* \`${data.customerPhone}\`
💰 *Importe:* ${data.totalAmount ? `${data.totalAmount} €` : 'Consultar'}
💎 *Pieza:* ${data.productName || 'Joya Seleccionada'}
🏷️ *Origen:* ${data.source || 'Shopify Carrito Abandonado'}

👇 *Toca el botón para abrir WhatsApp con el mensaje ya redactado:*`;

  // 4. Disparar mensaje con Inline Keyboard (Botón URL directo a WhatsApp)
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📲 Abrir WhatsApp y Enviar (1 Clic)',
                url: waUrl
              }
            ],
            ...(data.checkoutUrl ? [
              [
                {
                  text: '🛒 Ver Carrito en Shopify',
                  url: data.checkoutUrl
                }
              ]
            ] : [])
          ]
        }
      })
    });

    const resData = await res.json();
    return { success: res.ok, data: resData, error: resData.description };
  } catch (err: any) {
    console.error('Error enviando alerta a Telegram:', err.message);
    return { success: false, error: err.message };
  }
}