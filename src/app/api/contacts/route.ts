import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeToE164 } from '@/lib/phoneNormalizer';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getAuthSession(req);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const tag = searchParams.get('tag')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '30', 10)));
    const skip = (page - 1) * limit;

    const whereClause: any = {
      organizationId: session.organizationId
    };

    if (tag) {
      whereClause.tags = { has: tag };
    }

    if (search) {
      whereClause.OR = [
        { phone: { contains: search } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [contacts, totalCount, allTagsRaw] = await Promise.all([
      prisma.contact.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { messages: true } }
        }
      }),
      prisma.contact.count({ where: whereClause }),
      prisma.contact.findMany({
        where: { organizationId: session.organizationId },
        select: { tags: true }
      })
    ]);

    const tagCounts: Record<string, number> = {};
    allTagsRaw.forEach(c => {
      c.tags.forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });

    const uniqueTags = Object.entries(tagCounts).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      contacts,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      },
      tags: uniqueTags
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession(req);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();
    const { phone, firstName, lastName, email, tags = [], customFields = {} } = body;

    if (!phone) {
      return NextResponse.json({ error: 'El número de teléfono es obligatorio.' }, { status: 400 });
    }

    const norm = normalizeToE164(phone);
    if (!norm.isValid) {
      return NextResponse.json({ error: norm.error || 'Formato de teléfono no válido.' }, { status: 400 });
    }

    const contact = await prisma.contact.upsert({
      where: {
        organizationId_phone: {
          organizationId: session.organizationId,
          phone: norm.normalizedPhone
        }
      },
      update: {
        firstName: firstName?.trim() || undefined,
        lastName: lastName?.trim() || undefined,
        email: email?.trim() || undefined,
        tags: Array.from(new Set(tags)),
        customFields
      },
      create: {
        organizationId: session.organizationId,
        phone: norm.normalizedPhone,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        email: email?.trim() || null,
        tags: Array.from(new Set(tags)),
        customFields
      }
    });

    return NextResponse.json({ success: true, contact });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession(req);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID de contacto requerido' }, { status: 400 });

    await prisma.contact.deleteMany({
      where: { id, organizationId: session.organizationId }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}