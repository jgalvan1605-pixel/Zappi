import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';
import { getPhoneNumberHealth } from '@/lib/metaClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Obtener la organización por defecto del MVP
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: 'Mi Empresa',
          plan: 'pro'
        }
      });
    }

    const isConfigured = Boolean(org.phoneNumberId && org.accessToken);
    let health = null;

    if (isConfigured && org.phoneNumberId && org.accessToken) {
      health = await getPhoneNumberHealth(org.phoneNumberId, org.accessToken);
    }

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        wabaId: org.wabaId,
        phoneNumberId: org.phoneNumberId,
        isConfigured,
        health
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wabaId, phoneNumberId, accessToken } = body;

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json({ error: 'Debes proporcionar phoneNumberId y accessToken.' }, { status: 400 });
    }

    const encryptedToken = encrypt(accessToken.trim());

    // Validar credenciales contra Meta
    const health = await getPhoneNumberHealth(phoneNumberId.trim(), encryptedToken);
    if (!health) {
      return NextResponse.json({
        error: 'No se pudo verificar el número con Meta. Revisa el Phone Number ID y que el Token tenga permisos de WhatsApp.'
      }, { status: 400 });
    }

    let org = await prisma.organization.findFirst();
    if (org) {
      org = await prisma.organization.update({
        where: { id: org.id },
        data: {
          wabaId: wabaId?.trim() || org.wabaId,
          phoneNumberId: phoneNumberId.trim(),
          accessToken: encryptedToken
        }
      });
    } else {
      org = await prisma.organization.create({
        data: {
          name: 'Mi Empresa',
          wabaId: wabaId?.trim() || null,
          phoneNumberId: phoneNumberId.trim(),
          accessToken: encryptedToken,
          plan: 'pro'
        }
      });
    }

    return NextResponse.json({
      success: true,
      health,
      message: '¡WhatsApp Business conectado y verificado con éxito!'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}