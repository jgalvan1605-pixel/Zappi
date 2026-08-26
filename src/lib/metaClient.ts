import { decrypt } from './crypto';

const GRAPH_API_VERSION = 'v20.0';
const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface SendTemplateParams {
  phoneNumberId: string;
  encryptedToken: string;
  to: string; // Formato E.164 (+34600000000)
  templateName: string;
  languageCode?: string;
  components?: any[];
}

export interface SendTextMessageParams {
  phoneNumberId: string;
  encryptedToken: string;
  to: string;
  text: string;
}

export interface SendInteractiveButtonParams {
  phoneNumberId: string;
  encryptedToken: string;
  to: string;
  bodyText: string;
  buttons: Array<{
    id: string;
    title: string;
  }>;
}

export interface MetaApiResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

/**
 * Envía una plantilla oficial aprobada por Meta (HSM)
 */
export async function sendWhatsAppTemplate({
  phoneNumberId,
  encryptedToken,
  to,
  templateName,
  languageCode = 'es',
  components = []
}: SendTemplateParams): Promise<{ success: boolean; wamid?: string; error?: string }> {
  try {
    const token = decrypt(encryptedToken);
    if (!token) throw new Error('Token de acceso no válido o no pudo ser desencriptado.');

    const recipient = cleanPhoneNumber(to);
    const url = `${BASE_URL}/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        components: components.length > 0 ? components : undefined
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Error en Meta Cloud API (Template):', data);
      return { success: false, error: data.error?.message || 'Error desconocido al enviar plantilla' };
    }

    const wamid = data.messages?.[0]?.id;
    return { success: true, wamid };
  } catch (err: any) {
    console.error('Meta API Exception (Template):', err);
    return { success: false, error: err.message };
  }
}

/**
 * Envía un mensaje de texto libre (requiere ventana de 24h abierta por el cliente)
 */
export async function sendWhatsAppText({
  phoneNumberId,
  encryptedToken,
  to,
  text
}: SendTextMessageParams): Promise<{ success: boolean; wamid?: string; error?: string }> {
  try {
    const token = decrypt(encryptedToken);
    if (!token) throw new Error('Token de acceso no válido o no pudo ser desencriptado.');

    const recipient = cleanPhoneNumber(to);
    const url = `${BASE_URL}/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'text',
      text: {
        preview_url: true,
        body: text
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Error en Meta Cloud API (Text):', data);
      return { success: false, error: data.error?.message || 'Error al enviar mensaje de texto' };
    }

    const wamid = data.messages?.[0]?.id;
    return { success: true, wamid };
  } catch (err: any) {
    console.error('Meta API Exception (Text):', err);
    return { success: false, error: err.message };
  }
}

/**
 * Consulta el estado y calidad del número telefónico en Meta
 */
export async function getPhoneNumberHealth(phoneNumberId: string, encryptedToken: string) {
  try {
    const token = decrypt(encryptedToken);
    if (!token) return null;

    const url = `${BASE_URL}/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,status`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}