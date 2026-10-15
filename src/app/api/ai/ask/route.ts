import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { answerDataQuestion } from '@/services/ai/service';

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await request.formData();
  const question = String(form.get('question') ?? '').trim();
  const context = String(form.get('context') ?? '').trim();
  if (!question) return NextResponse.json({ error: 'Question is required' }, { status: 400 });
  const answer = await answerDataQuestion(question, { context });
  return NextResponse.json({ answer });
}