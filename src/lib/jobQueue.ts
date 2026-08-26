import { prisma } from './prisma';
import { sendTelegramCommercialAlert } from './telegramBot';

export interface ScheduleJobParams {
  organizationId: string;
  jobType: 'abandoned_cart_reminder' | 'post_purchase_followup' | 'broadcast_batch';
  targetPhone: string;
  delayMinutes?: number;
  executeAt?: Date;
  payload: {
    customerName?: string;
    totalAmount?: string | number;
    productName?: string;
    checkoutUrl?: string;
    discountCode?: string;
    discountPercent?: string;
    [key: string]: any;
  };
}

/**
 * Programa un nuevo trabajo en la base de datos con retardo persistente
 */
export async function scheduleJob({
  organizationId,
  jobType,
  targetPhone,
  delayMinutes = 20,
  executeAt,
  payload
}: ScheduleJobParams) {
  const executionDate = executeAt || new Date(Date.now() + delayMinutes * 60 * 1000);

  // Cancelar trabajos previos pendientes del mismo tipo para este mismo teléfono
  if (jobType === 'abandoned_cart_reminder') {
    await cancelPendingJobs(organizationId, targetPhone, 'abandoned_cart_reminder');
  }

  const job = await prisma.scheduledJob.create({
    data: {
      organizationId,
      jobType,
      targetPhone,
      payload,
      status: 'pending',
      executeAt: executionDate,
      attempts: 0,
      maxAttempts: 3
    }
  });

  console.log(`⏱️ [JobQueue] Trabajo "${jobType}" programado para ${targetPhone} a las ${executionDate.toISOString()}`);
  return job;
}

/**
 * Cancela trabajos pendientes para un número (vital cuando el cliente completa la compra)
 */
export async function cancelPendingJobs(
  organizationId: string,
  targetPhone: string,
  jobType?: string
) {
  const whereClause: any = {
    organizationId,
    targetPhone,
    status: 'pending'
  };

  if (jobType) {
    whereClause.jobType = jobType;
  }

  const result = await prisma.scheduledJob.updateMany({
    where: whereClause,
    data: {
      status: 'cancelled',
      lastError: 'Cancelado automáticamente por compra realizada.'
    }
  });

  if (result.count > 0) {
    console.log(`🚫 [JobQueue] Cancelados ${result.count} trabajos pendientes para ${targetPhone}`);
  }

  return result.count;
}

/**
 * Ejecutor en Lote: Busca trabajos vencidos y dispara la alerta interactiva a Telegram
 */
export async function processDueJobs(batchSize: number = 25): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const now = new Date();

  const dueJobs = await prisma.scheduledJob.findMany({
    where: {
      status: 'pending',
      executeAt: { lte: now }
    },
    include: { organization: true },
    orderBy: { executeAt: 'asc' },
    take: batchSize
  });

  if (dueJobs.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  let succeeded = 0;
  let failed = 0;

  for (const job of dueJobs) {
    await prisma.scheduledJob.update({
      where: { id: job.id },
      data: { status: 'processing', attempts: { increment: 1 } }
    });

    const org = job.organization;

    try {
      const payload = job.payload as any;
      const customerName = payload.customerName || payload.firstName || 'Cliente';
      const totalAmount = payload.totalAmount || '450';
      const productName = payload.productName || 'Artículo de la tienda';
      const discountCode = payload.discountCode || 'ZAPPI10';
      const checkoutUrl = payload.checkoutUrl;

      // Disparar la alerta interactiva al Telegram del comercial
      const telegramRes = await sendTelegramCommercialAlert({
        customerName,
        customerPhone: job.targetPhone,
        totalAmount,
        productName,
        checkoutUrl,
        discountCode,
        source: 'Shopify Carrito Abandonado'
      });

      if (telegramRes.success) {
        // Registrar en CRM
        let conversation = await prisma.conversation.findFirst({
          where: { organizationId: org.id, contactPhone: job.targetPhone }
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              organizationId: org.id,
              contactPhone: job.targetPhone,
              contactName: customerName,
              status: 'open'
            }
          });
        }

        const contact = await prisma.contact.findFirst({
          where: { organizationId: org.id, phone: job.targetPhone }
        });

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            contactId: contact?.id || null,
            direction: 'outbound',
            type: 'template',
            content: {
              alertType: 'telegram_commercial_notification',
              jobId: job.id,
              checkoutUrl
            },
            status: 'sent'
          }
        });

        await prisma.scheduledJob.update({
          where: { id: job.id },
          data: { status: 'completed' }
        });

        succeeded++;
        console.log(`✅ [JobQueue] Alerta de Telegram enviada con éxito para ${job.targetPhone}`);
      } else {
        throw new Error(telegramRes.error || 'Error al enviar alerta de Telegram');
      }
    } catch (err: any) {
      console.error(`❌ [JobQueue] Error en trabajo ${job.id}:`, err.message);
      const isLastAttempt = job.attempts + 1 >= job.maxAttempts;

      await prisma.scheduledJob.update({
        where: { id: job.id },
        data: {
          status: isLastAttempt ? 'failed' : 'pending',
          executeAt: isLastAttempt ? job.executeAt : new Date(Date.now() + 5 * 60 * 1000),
          lastError: err.message
        }
      });
      failed++;
    }
  }

  return { processed: dueJobs.length, succeeded, failed };
}