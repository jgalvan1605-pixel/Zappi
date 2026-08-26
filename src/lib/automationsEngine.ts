export interface AutomationStep {
  id: string;
  type: 'TRIGGER' | 'DELAY' | 'SEND_WHATSAPP' | 'CONDITION';
  config: {
    delayMinutes?: number;
    delayHours?: number;
    templateName?: string;
    discountCode?: string;
    discountPercent?: string;
    messageText?: string;
    conditionType?: 'has_purchased' | 'has_clicked';
  };
}

export interface AutomationRecipe {
  id: string;
  name: string;
  description: string;
  triggerType: 'shopify_abandoned_cart' | 'shopify_order_paid' | 'vip_reactivation' | 'custom_webhook';
  category: 'VENTAS' | 'POST-COMPRA' | 'FIDELIZACIÓN';
  estimatedRoi: string;
  steps: AutomationStep[];
}

export const PREBUILT_RECIPES: AutomationRecipe[] = [
  {
    id: 'recipe_abandoned_cart_20m',
    name: 'Recuperación de Carrito Abandonado (Alta Conversión)',
    description: 'Espera 20 minutos tras abandonar el checkout y envía un mensaje persuasivo con botón directo a la compra y 10% de descuento.',
    triggerType: 'shopify_abandoned_cart',
    category: 'VENTAS',
    estimatedRoi: '+18.4% Recuperación',
    steps: [
      {
        id: 'step_1',
        type: 'TRIGGER',
        config: {}
      },
      {
        id: 'step_2',
        type: 'DELAY',
        config: { delayMinutes: 20 }
      },
      {
        id: 'step_3',
        type: 'SEND_WHATSAPP',
        config: {
          templateName: 'recuperacion_carrito_vip',
          discountCode: 'ZAPPI10',
          discountPercent: '10%'
        }
      }
    ]
  },
  {
    id: 'recipe_post_purchase_48h',
    name: 'Fidelización y Reseñas Post-Compra (48 Horas)',
    description: 'Envía un mensaje 48 horas después de recibir el pedido solicitando una valoración de 5 estrellas o recomendando un producto complementario.',
    triggerType: 'shopify_order_paid',
    category: 'POST-COMPRA',
    estimatedRoi: '+24% Reseñas Reales',
    steps: [
      {
        id: 'step_1',
        type: 'TRIGGER',
        config: {}
      },
      {
        id: 'step_2',
        type: 'DELAY',
        config: { delayHours: 48 }
      },
      {
        id: 'step_3',
        type: 'SEND_WHATSAPP',
        config: {
          templateName: 'seguimiento_pedido_postcompra'
        }
      }
    ]
  },
  {
    id: 'recipe_vip_reactivation_30d',
    name: 'Reactivación de Clientes Inactivos (+30 Días)',
    description: 'Detecta compradores recurrentes que llevan más de un mes sin comprar y les ofrece acceso VIP con portes gratis.',
    triggerType: 'vip_reactivation',
    category: 'FIDELIZACIÓN',
    estimatedRoi: '+12% LTV',
    steps: [
      {
        id: 'step_1',
        type: 'TRIGGER',
        config: {}
      },
      {
        id: 'step_2',
        type: 'SEND_WHATSAPP',
        config: {
          templateName: 'oferta_flash_exclusiva',
          discountPercent: '15%'
        }
      }
    ]
  }
];