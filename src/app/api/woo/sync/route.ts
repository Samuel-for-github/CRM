import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { syncRequestSchema } from '@/lib/validation/sync';
import { runInitialSync } from '@/services/woocommerce/sync';

export async function POST(request: NextRequest) {
  if (!(await getSessionFromCookies())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = syncRequestSchema.parse(await request.json().catch(() => ({ scope: 'all' })));
  return NextResponse.json(await runInitialSync(payload.scope));
}

export async function GET(request: NextRequest) {
  if (!(await getSessionFromCookies())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const scope = request.nextUrl.searchParams.get('scope') ?? 'all';
  const payload = syncRequestSchema.parse({ scope });
  return NextResponse.json(await runInitialSync(payload.scope));
}