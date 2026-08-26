import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'open'; // 'open', 'pending', 'closed', 'all'
    const search = searchParams.get('search')?.trim() || '';

    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Mi Empresa', plan: 'pro' }
      });
    }

    const whereClause: any = {
      organizationId: org.id
    };

    if (status !== 'all') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { contactPhone: { contains: search } },
        { contactName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    // Enriquecer con datos del contacto si existe
    const phones = conversations.map(c => c.contactPhone);
    const contacts = await prisma.contact.findMany({
      where: {
        organizationId: org.id,
        phone: { in: phones }
      }
    });

    const contactMap = new Map(contacts.map(c => [c.phone, c]));

    const enriched = conversations.map(conv => {
      const contact = contactMap.get(conv.contactPhone);
      const lastMessage = conv.messages[0] || null;

      let lastMessageText = '';
      if (lastMessage) {
        if (typeof lastMessage.content === 'object' && lastMessage.content !== null) {
          const contentObj = lastMessage.content as any;
          lastMessageText = contentObj.text || contentObj.templateName || '[Mensaje multimedia]';
        } else {
          lastMessageText = String(lastMessage.content);
        }
      }

      return {
        id: conv.id,
        contactPhone: conv.contactPhone,
        contactName: conv.contactName || contact?.firstName || 'Cliente WhatsApp',
        status: conv.status,
        assignedTo: conv.assignedTo,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt,
        lastMessage: lastMessage ? {
          text: lastMessageText,
          direction: lastMessage.direction,
          status: lastMessage.status,
          createdAt: lastMessage.createdAt
        } : null,
        contact: contact ? {
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          tags: contact.tags,
          customFields: contact.customFields
        } : null
      };
    });

    // Conteos globales de estado
    const [openCount, pendingCount, closedCount] = await Promise.all([
      prisma.conversation.count({ where: { organizationId: org.id, status: 'open' } }),
      prisma.conversation.count({ where: { organizationId: org.id, status: 'pending' } }),
      prisma.conversation.count({ where: { organizationId: org.id, status: 'closed' } })
    ]);

    return NextResponse.json({
      conversations: enriched,
      counts: {
        open: openCount,
        pending: pendingCount,
        closed: closedCount,
        total: openCount + pendingCount + closedCount
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, assignedTo, contactName } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de conversación requerido' }, { status: 400 });
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        status: status || undefined,
        assignedTo: assignedTo !== undefined ? assignedTo : undefined,
        contactName: contactName || undefined
      }
    });

    return NextResponse.json({ success: true, conversation: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}