import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.redirect(new URL('/login', 'http://localhost'));
  response.cookies.set(SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return response;
}