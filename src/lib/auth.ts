import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';
import { getEnv } from './env';

export const SESSION_COOKIE_NAME = 'crm_admin_session';

export type SessionPayload = {
  sub: string;
  email: string;
  role: 'admin';
};

export type AdminCredentials = {
  email: string;
  passwordHash: string;
};

export const demoAdminPassword = 'Admin123!';
export const demoAdminEmail = 'admin@example.com';

let demoPasswordHash: string | undefined;

export async function getDemoAdminCredentials(): Promise<AdminCredentials> {
  demoPasswordHash ??= await bcrypt.hash(demoAdminPassword, 10);
  return { email: demoAdminEmail, passwordHash: demoPasswordHash };
}

export function getSessionSecret(): Uint8Array {
  const secret = getEnv().AUTH_SECRET ?? 'dev-secret-change-me-before-deploying';
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSessionSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, getSessionSecret());
    const { sub, email, role } = verified.payload as SessionPayload;
    if (!sub || !email || role !== 'admin') {
      return null;
    }

    return { sub, email, role };
  } catch {
    return null;
  }
}

export function getRequestIdentifier(): string {
  return headers().get('x-forwarded-for') ?? headers().get('x-real-ip') ?? 'local';
}

export async function getSessionFromCookies() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export function buildSessionCookie(token: string) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    }
  };
}

export function randomId(prefix = 'id'): string {
  return `${prefix}_${crypto.randomBytes(10).toString('hex')}`;
}