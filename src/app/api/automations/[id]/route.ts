import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const automationId = params.id;
    const body = await req.json();
    const { isActive, name, flowData } = body;

    const updated = await prisma.automation.update({
      where: { id: automationId },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
        name: name !== undefined ? name.trim() : undefined,
        flowData: flowData !== undefined ? flowData : undefined
      }
    });

    return NextResponse.json({ success: true, automation: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const automationId = params.id;

    await prisma.automation.delete({
      where: { id: automationId }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}