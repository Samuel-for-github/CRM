import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { runAgent } from '@/agent/executor';

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const result = await runAgent({
    question: String(body.question ?? ''),
    actorId: session.sub,
    confirmWrite: Boolean(body.confirmWrite)
  });
  return NextResponse.json(result);
}