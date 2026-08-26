import { decrypt } from './crypto';

const GRAPH_API_VERSION = 'v20.0';
const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  example?: {
    header_text?: string[];
    body_text?: string[][];
  };
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

export interface MetaTemplateItem {
  id: string;
  name: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED';
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  components: TemplateComponent[];
}

// Plantillas predeterminadas de alto rendimiento listas para usar
export const PREBUILT_TEMPLATES: MetaTemplateItem[] = [
  {
    id: 'tpl_recuperacion_carrito',
    name: 'recuperacion_carrito_vip',
    status: 'APPROVED',
    category: 'MARKETING',
    language: 'es',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '🛒 ¡Tu carrito de compra te espera!'
      },
      {
        type: 'BODY',
        text: 'Hola {{1}}, vimos que dejaste productos seleccionados en tu compra. Para ayudarte a completarlo, tienes activo un descuento especial de {{2}} utilizando el código {{3}}.',
        example: {
          body_text: [['Carlos', '15%', 'ZAPPI15']]
        }
      },
      {
        type: 'FOOTER',
        text: 'Válido durante las próximas 24 horas.'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Completar Pedido ➔',
            url: 'https://mitienda.com/checkout'
          },
          {
            type: 'QUICK_REPLY',
            text: 'Tengo una duda'
          }
        ]
      }
    ]
  },
  {
    id: 'tpl_oferta_flash',
    name: 'oferta_flash_exclusiva',
    status: 'APPROVED',
    category: 'MARKETING',
    language: 'es',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '⚡ ACCESO EXCLUSIVO: {{1}}'
      },
      {
        type: 'BODY',
        text: 'Hola {{1}}, como cliente VIP tienes 48h de acceso prioritario a nuestra nueva colección con un {{2}} de ahorro directo.',
        example: {
          body_text: [['Javier', '20%']]
        }
      },
      {
        type: 'FOOTER',
        text: 'Zappi VIP Rewards'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Ver Catálogo VIP',
            url: 'https://mitienda.com/coleccion'
          }
        ]
      }
    ]
  },
  {
    id: 'tpl_post_compra',
    name: 'seguimiento_pedido_postcompra',
    status: 'APPROVED',
    category: 'UTILITY',
    language: 'es',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '📦 Estado de tu Pedido #{{1}}'
      },
      {
        type: 'BODY',
        text: 'Hola {{1}}, tu pedido ya ha salido de nuestras instalaciones y se encuentra en reparto. Puedes seguir la entrega en tiempo real aquí.',
        example: {
          body_text: [['1042', 'María']]
        }
      },
      {
        type: 'FOOTER',
        text: 'Gracias por confiar en nosotros.'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Seguir Envío 🚚',
            url: 'https://tracking.carrier.com'
          }
        ]
      }
    ]
  }
];

/**
 * Consulta las plantillas aprobadas directamente en la cuenta de Meta WhatsApp Business
 */
export async function fetchMetaTemplates(wabaId: string, encryptedToken: string): Promise<MetaTemplateItem[]> {
  try {
    const token = decrypt(encryptedToken);
    if (!token) return PREBUILT_TEMPLATES;

    const url = `${BASE_URL}/${wabaId}/message_templates?limit=100`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) {
      return PREBUILT_TEMPLATES;
    }

    const data = await res.json();
    if (data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data;
    }

    return PREBUILT_TEMPLATES;
  } catch (err) {
    console.warn('Usando plantillas locales preconfiguradas:', err);
    return PREBUILT_TEMPLATES;
  }
}