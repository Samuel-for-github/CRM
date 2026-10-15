import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { customerUpsertSchema } from '@/lib/validation/customer';
import { deleteCustomer, getCustomerById, updateCustomer } from '@/services/customers/service';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!(await getSessionFromCookies())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const customer = await getCustomerById(params.id);
  return NextResponse.json(customer);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await getSessionFromCookies())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = customerUpsertSchema.parse(await request.json());
  const customer = await updateCustomer(params.id, payload);
  return NextResponse.json(customer);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await getSessionFromCookies())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await deleteCustomer(params.id);
  return NextResponse.json(result);
}