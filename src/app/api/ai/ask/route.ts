import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { answerDataQuestion } from '@/services/ai/service';
import { toErrorMessage } from '@/lib/errors';

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const contentType = request.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await request.json()
    : Object.fromEntries(await (await request.formData()).entries());
  const question = String(payload.question ?? '').trim();
  const context = String(payload.context ?? '').trim();
  if (!question) return NextResponse.json({ error: 'Question is required' }, { status: 400 });
  try {
    const answer = await answerDataQuestion(question, { context });
    return NextResponse.json({ answer });
  } catch (error) {
    const details = toErrorMessage(error);
    return NextResponse.json({ error: details.message }, { status: details.status });
  }
}