import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { customerNoteSchema } from '@/lib/validation/customer';
import { addCustomerNote } from '@/services/customers/service';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = customerNoteSchema.parse(await request.json());
  const note = await addCustomerNote(params.id, payload.note, session.sub);
  return NextResponse.json(note, { status: 201 });
}