import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchMetaTemplates, PREBUILT_TEMPLATES } from '@/lib/metaTemplates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const org = await prisma.organization.findFirst();
    if (!org || !org.wabaId || !org.accessToken) {
      return NextResponse.json({
        templates: PREBUILT_TEMPLATES,
        isCustomWaba: false,
        message: 'Mostrando plantillas estándar optimizadas para e-commerce.'
      });
    }

    const templates = await fetchMetaTemplates(org.wabaId, org.accessToken);
    return NextResponse.json({
      templates,
      isCustomWaba: true
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, templates: PREBUILT_TEMPLATES }, { status: 500 });
  }
}