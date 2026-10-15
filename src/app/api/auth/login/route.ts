import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { getEnv, isDemoMode } from '@/lib/env';
import { createSessionToken, buildSessionCookie, getDemoAdminCredentials } from '@/lib/auth';
import { loginSchema } from '@/lib/validation/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { connectToDatabase } from '@/lib/db';
import { AdminUser } from '@/models/AdminUser';

export async function POST(request: Request) {
  const rate = checkRateLimit(`login:${request.headers.get('x-forwarded-for') ?? 'local'}`, 5, 15 * 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ error: 'Too many login attempts' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rate.resetAt - Date.now()) / 1000)) } });

  const payload = loginSchema.parse(await request.json());
  const env = getEnv();

  let userEmail = env.ADMIN_EMAIL ?? (await getDemoAdminCredentials()).email;
  let passwordHash = env.ADMIN_PASSWORD_HASH ?? (await getDemoAdminCredentials()).passwordHash;

  if (!isDemoMode() && env.MONGODB_URI) {
    await connectToDatabase();
    const existing = await AdminUser.findOne({ email: payload.email.toLowerCase() }).lean<{ email: string; passwordHash: string }>();
    if (existing) {
      userEmail = existing.email;
      passwordHash = existing.passwordHash;
    }
  }

  const valid = payload.email.toLowerCase() === userEmail.toLowerCase() && (await bcrypt.compare(payload.password, passwordHash));
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = await createSessionToken({ sub: payload.email.toLowerCase(), email: payload.email.toLowerCase(), role: 'admin' });
  const response = NextResponse.json({ ok: true, email: payload.email.toLowerCase() });
  response.cookies.set(buildSessionCookie(token));
  return response;
}