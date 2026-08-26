import { prisma } from './prisma';
import { cancelPendingJobs } from './jobQueue';

const OPTOUT_KEYWORDS = new Set([
  'stop',
  'baja',
  'cancelar',
  'unsubscribe',
  'no mas',
  'nomas',
  'borrarme',
  'darme de baja',
  'parar'
]);

const OPTIN_KEYWORDS = new Set([
  'start',
  'alta',
  'activar',
  'reanudar',
  'recibir'
]);

export interface ComplianceCheckResult {
  action: 'OPTOUT' | 'OPTIN' | 'NONE';
  replyMessage?: string;
}

/**
 * Detecta si el texto entrante contiene una orden legal de baja o reactivación
 */
export function evaluateComplianceMessage(text: string): ComplianceCheckResult {
  if (!text) return { action: 'NONE' };

  const clean = text.trim().toLowerCase().replace(/[^\w\s]/gi, '');

  if (OPTOUT_KEYWORDS.has(clean)) {
    return {
      action: 'OPTOUT',
      replyMessage: '✅ Has sido dado de baja correctamente de nuestras comunicaciones comerciales por WhatsApp (RGPD). No recibirás más promociones ni recordatorios. Si en el futuro deseas reactivar tus avisos, responde con la palabra ALTA.'
    };
  }

  if (OPTIN_KEYWORDS.has(clean)) {
    return {
      action: 'OPTIN',
      replyMessage: '🎉 ¡Bienvenido de nuevo! Has reactivado tus notificaciones y ofertas exclusivas por WhatsApp.'
    };
  }

  return { action: 'NONE' };
}

/**
 * Procesa la baja inmediata en base de datos y cancela tareas pendientes
 */
export async function executeOptOut(organizationId: string, phone: string) {
  // 1. Marcar contacto como optedOut
  const contact = await prisma.contact.findFirst({
    where: { organizationId, phone }
  });

  if (contact) {
    const updatedTags = Array.from(new Set([...contact.tags, 'RGPD_BAJA']));
    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        optedOut: true,
        optedOutAt: new Date(),
        tags: updatedTags
      }
    });
  }

  // 2. Cancelar todos los recordatorios o secuencias encoladas
  await cancelPendingJobs(organizationId, phone);
  console.log(`🛑 [RGPD] Contacto ${phone} dado de baja exitosamente en org ${organizationId}`);
}

/**
 * Procesa la reactivación voluntaria del cliente
 */
export async function executeOptIn(organizationId: string, phone: string) {
  const contact = await prisma.contact.findFirst({
    where: { organizationId, phone }
  });

  if (contact) {
    const updatedTags = contact.tags.filter(t => t !== 'RGPD_BAJA');
    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        optedOut: false,
        optedOutAt: null,
        tags: updatedTags
      }
    });
  }

  console.log(`🟢 [RGPD] Contacto ${phone} reactivado exitosamente en org ${organizationId}`);
}