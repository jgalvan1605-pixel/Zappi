import Stripe from 'stripe';

export interface PlanConfig {
  id: 'free' | 'pro' | 'scale';
  name: string;
  priceMonthly: number;
  messageQuota: number;
  description: string;
  features: string[];
  stripePriceId?: string;
  isPopular?: boolean;
}

export const ZAPPI_PLANS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Starter Beta',
    priceMonthly: 0,
    messageQuota: 250,
    description: 'Ideal para probar la conexión de WhatsApp y validar tus primeras campañas.',
    features: [
      '250 mensajes WhatsApp / mes incluidos',
      '1 Número de WhatsApp Business conectado',
      'Inbox unificado con respuestas rápidas (/)',
      'Importador de contactos CSV (E.164)',
      'Soporte estándar por comunidad'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro Growth',
    priceMonthly: 49,
    messageQuota: 5000,
    description: 'Para e-commerce que quieren recuperar carritos y lanzar campañas interactivas con ROI garantizado.',
    isPopular: true,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO || 'price_zappi_pro_monthly',
    features: [
      '5.000 mensajes WhatsApp / mes incluidos',
      'Flujos automáticos de Carrito Abandonado (Shopify)',
      'Simulador Mobile Live Preview en tiempo real',
      'Segmentación avanzada de audiencias y tags',
      'Plantillas HSM verificadas de alta conversión',
      'Soporte prioritario por WhatsApp en < 2h'
    ]
  },
  scale: {
    id: 'scale',
    name: 'Scale Unlimited',
    priceMonthly: 149,
    messageQuota: 25000,
    description: 'Para marcas consolidadas de alto volumen que requieren atención multiagente y automatizaciones complejas.',
    stripePriceId: process.env.STRIPE_PRICE_ID_SCALE || 'price_zappi_scale_monthly',
    features: [
      '25.000 mensajes WhatsApp / mes incluidos',
      'Todo lo del plan Pro Growth',
      'Bandeja Multiagente con asignación de tickets',
      'Webhooks personalizados y sincronización API',
      'Plantillas personalizadas ilimitadas en Meta',
      'Gestor de cuenta dedicado y setup personalizado'
    ]
  }
};

export const CREDIT_PACKAGES = [
  {
    id: 'credits_5k',
    name: 'Paquete 5.000 Mensajes',
    credits: 5000,
    price: 29,
    stripePriceId: process.env.STRIPE_PRICE_ID_CREDITS_5K || 'price_zappi_credits_5k'
  },
  {
    id: 'credits_15k',
    name: 'Paquete 15.000 Mensajes',
    credits: 15000,
    price: 69,
    stripePriceId: process.env.STRIPE_PRICE_ID_CREDITS_15K || 'price_zappi_credits_15k'
  }
];

export function getStripeClient(): Stripe | null {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) return null;
  return new Stripe(apiKey, {
    apiVersion: '2024-11-20.acacia' as any
  });
}