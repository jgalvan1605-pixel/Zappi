import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, companyName } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Comprobar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Ya existe una cuenta con este correo electrónico.' }, { status: 400 });
    }

    // 1. Crear Organización privada para el nuevo cliente
    const organization = await prisma.organization.create({
      data: {
        name: companyName?.trim() || `Tienda de ${name.trim()}`,
        plan: 'free',
        monthlyQuota: 250,
        messageCredits: 250
      }
    });

    // 2. Crear el Usuario propietario
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash: hashPassword(password),
        name: name.trim(),
        role: 'owner',
        organizationId: organization.id
      }
    });

    // 3. Generar token de sesión
    const sessionToken = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: organization.id,
      organizationName: organization.name,
      plan: organization.plan
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, organizationId: organization.id }
    });

    // Fijar Cookie HttpOnly
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 días
    });

    return response;
  } catch (err: any) {
    console.error('Error en registro:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}