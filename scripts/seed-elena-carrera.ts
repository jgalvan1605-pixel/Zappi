import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('💎 Inicializando entorno personalizado para BY ELENA CARRERA...');

  // 1. Crear o actualizar la Organización de Elena Carrera
  const org = await prisma.organization.upsert({
    where: { id: 'org_elena_carrera' },
    update: {
      name: 'By Elena Carrera - Alta Joyería',
      plan: 'pro',
      monthlyQuota: 5000,
      messageCredits: 4850,
      messagesSentThisMonth: 150, telegramChatId: "1034043897"
    },
    create: {
      id: 'org_elena_carrera',
      name: 'By Elena Carrera - Alta Joyería',
      plan: 'pro',
      monthlyQuota: 5000,
      messageCredits: 4850,
      messagesSentThisMonth: 150, telegramChatId: "1034043897"
    }
  });

  // 2. Crear usuario Director Comercial
  await prisma.user.upsert({
    where: { email: 'comercial@byelenacarrera.com' },
    update: {
      name: 'Asesora Atelier Elena Carrera',
      organizationId: org.id
    },
    create: {
      email: 'comercial@byelenacarrera.com',
      passwordHash: hashPassword('Elena2026!'),
      name: 'Asesora Atelier Elena Carrera',
      role: 'owner',
      organizationId: org.id
    }
  });

  // 3. Contactos VIP con joyas reales vistas / carritos
  const sampleContacts = [
    {
      phone: '+34612345678',
      firstName: 'Beatriz',
      lastName: 'de la Vega',
      email: 'b.delavega@madrid.com',
      tags: ['VIP La Moraleja', 'Alianzas Boda', 'Oro Rosa 18k'],
      customFields: {
        last_viewed_product: 'Alianza en Oro Blanco 18k con Diamantes Texturas 6mm',
        cart_value: 5800,
        anniversary: '2026-10-15'
      }
    },
    {
      phone: '+34622998877',
      firstName: 'Ignacio',
      lastName: 'Gómez-Acebo',
      email: 'ignacio.ga@inversiones.es',
      tags: ['Compromiso', 'Solitarios Bubbles'],
      customFields: {
        last_viewed_product: 'Solitario Oro Blanco 18k Diamante Colección Bubbles',
        cart_value: 2590,
        ring_size_doubt: 'Talla 14'
      }
    },
    {
      phone: '+34633445566',
      firstName: 'Carmen',
      lastName: 'Martínez-Bordiú',
      email: 'carmen.mb@patrimonio.com',
      tags: ['Joyas con Fe', 'Colección Texturas'],
      customFields: {
        last_viewed_product: 'Medalla Virgen Milagrosa Nácar Oro Rosa 18k',
        cart_value: 175
      }
    },
    {
      phone: '+34655112233',
      firstName: 'Sofía',
      lastName: 'Álvarez de Toledo',
      email: 'sofia.alvarez@luxury.es',
      tags: ['Pendientes Alta Joyería', 'Colección Mariposas'],
      customFields: {
        last_viewed_product: 'Pendientes de Aro 30mm Oro Rosa 18k con Diamantes Mariposa',
        cart_value: 2995
      }
    },
    {
      phone: '+34677889900',
      firstName: 'Rodrigo',
      lastName: 'Méndez',
      email: 'rodrigo.mendez@consultora.es',
      tags: ['Regalo Especial', 'Brazaletes'],
      customFields: {
        last_viewed_product: 'Brazalete Oro 18k Textura Arena',
        cart_value: 590
      }
    }
  ];

  for (const c of sampleContacts) {
    await prisma.contact.upsert({
      where: {
        organizationId_phone: {
          organizationId: org.id,
          phone: c.phone
        }
      },
      update: {
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        tags: c.tags,
        customFields: c.customFields
      },
      create: {
        organizationId: org.id,
        phone: c.phone,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        tags: c.tags,
        customFields: c.customFields
      }
    });
  }

  // 4. Campañas Masivas preparadas para By Elena Carrera
  const sampleCampaigns = [
    {
      name: 'Presentación Privada: Nueva Colección Texturas 18k',
      templateName: 'oferta_flash_exclusiva',
      status: 'completed',
      totalTarget: 180,
      sentCount: 180,
      deliveredCount: 178,
      readCount: 172,
      targetAudience: { tag: 'VIP La Moraleja' }
    },
    {
      name: 'Novias 2026: Selección de Alianzas y Cita en Atelier',
      templateName: 'recuperacion_carrito_vip',
      status: 'draft',
      totalTarget: 65,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      targetAudience: { tag: 'Alianzas Boda' }
    }
  ];

  for (const camp of sampleCampaigns) {
    await prisma.campaign.create({
      data: {
        organizationId: org.id,
        name: camp.name,
        templateName: camp.templateName,
        status: camp.status,
        totalTarget: camp.totalTarget,
        sentCount: camp.sentCount,
        deliveredCount: camp.deliveredCount,
        readCount: camp.readCount,
        targetAudience: camp.targetAudience
      }
    });
  }

  console.log('✅ Entorno By Elena Carrera cargado con éxito en la base de datos.');
}

main().catch(console.error).finally(() => prisma.$disconnect());