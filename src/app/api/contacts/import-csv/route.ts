import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeToE164 } from '@/lib/phoneNormalizer';

export const dynamic = 'force-dynamic';

interface ImportContactItem {
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      contacts = [], 
      defaultPrefix = '34', 
      globalTags = [] 
    } = body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'No se recibieron contactos para importar.' }, { status: 400 });
    }

    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Mi Empresa', plan: 'pro' }
      });
    }

    let validCount = 0;
    let invalidCount = 0;
    const invalidSamples: Array<{ raw: string; error?: string }> = [];
    const validUpserts: ImportContactItem[] = [];

    // 1. Fase de Validación y Normalización E.164
    for (const item of contacts) {
      const norm = normalizeToE164(item.phone, defaultPrefix);

      if (!norm.isValid) {
        invalidCount++;
        if (invalidSamples.length < 5) {
          invalidSamples.push({ raw: item.phone, error: norm.error });
        }
        continue;
      }

      const mergedTags = Array.from(new Set([
        ...(item.tags || []),
        ...globalTags
      ])).filter(Boolean);

      validUpserts.push({
        phone: norm.normalizedPhone,
        firstName: item.firstName?.trim() || undefined,
        lastName: item.lastName?.trim() || undefined,
        email: item.email?.trim() || undefined,
        tags: mergedTags,
        customFields: item.customFields || {}
      });
      validCount++;
    }

    // 2. Fase de Inserción / Upsert en Lotes
    const BATCH_SIZE = 50;
    for (let i = 0; i < validUpserts.length; i += BATCH_SIZE) {
      const chunk = validUpserts.slice(i, i + BATCH_SIZE);

      await Promise.all(
        chunk.map(contact => 
          prisma.contact.upsert({
            where: {
              organizationId_phone: {
                organizationId: org!.id,
                phone: contact.phone
              }
            },
            update: {
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              tags: contact.tags,
              customFields: contact.customFields
            },
            create: {
              organizationId: org!.id,
              phone: contact.phone,
              firstName: contact.firstName || null,
              lastName: contact.lastName || null,
              email: contact.email || null,
              tags: contact.tags || [],
              customFields: contact.customFields || {}
            }
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalSubmitted: contacts.length,
        validImported: validCount,
        invalidDiscarded: invalidCount,
        invalidSamples
      }
    });
  } catch (err: any) {
    console.error('Error en importación masiva CSV:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}