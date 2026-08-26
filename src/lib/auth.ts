import crypto from 'crypto';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'zappi_jwt_master_secret_key_2026_super_secure!';
const COOKIE_NAME = 'zappi_session';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  organizationName: string;
  plan: string;
}

// 1. Funciones de Hashing de Contraseñas (PBKDF2)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const hashToVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(hashToVerify, 'hex'));
  } catch {
    return false;
  }
}

// 2. Funciones de Tokens de Sesión (JWT HMAC-SHA256)
export function createSessionToken(payload: AuthSession): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 días
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

export function verifySessionToken(token: string): AuthSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Token expirado
    }

    return payload as AuthSession;
  } catch {
    return null;
  }
}

// 3. Helper para extraer la sesión en Route Handlers (API Routes)
export async function getAuthSession(req: Request): Promise<AuthSession | null> {
  // 1. Comprobar cookie de sesión
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  const token = match ? decodeURIComponent(match[1]) : null;

  if (token) {
    const session = verifySessionToken(token);
    if (session) return session;
  }

  // 2. Fallback de desarrollo / Sandbox: Si no hay usuario logueado, usar o crear la org por defecto
  let defaultOrg = await prisma.organization.findFirst();
  if (!defaultOrg) {
    defaultOrg = await prisma.organization.create({
      data: { name: 'Mi Tienda Principal', plan: 'pro' }
    });
  }

  let defaultUser = await prisma.user.findFirst({
    where: { organizationId: defaultOrg.id }
  });

  if (!defaultUser) {
    defaultUser = await prisma.user.create({
      data: {
        email: 'admin@zappi.es',
        passwordHash: hashPassword('Admin2026!'),
        name: 'Administrador',
        role: 'owner',
        organizationId: defaultOrg.id
      }
    });
  }

  return {
    userId: defaultUser.id,
    email: defaultUser.email,
    name: defaultUser.name,
    role: defaultUser.role,
    organizationId: defaultOrg.id,
    organizationName: defaultOrg.name,
    plan: defaultOrg.plan
  };
}

export { COOKIE_NAME };