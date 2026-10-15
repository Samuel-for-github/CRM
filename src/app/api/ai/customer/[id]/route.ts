import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { getCustomerInsight } from '@/services/ai/service';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!(await getSessionFromCookies())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getCustomerInsight(params.id));
}