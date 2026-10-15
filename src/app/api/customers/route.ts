import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { customerUpsertSchema, customerListQuerySchema } from '@/lib/validation/customer';
import { createCustomer, listCustomers } from '@/services/customers/service';

export async function GET(request: Request) {
  if (!(await getSessionFromCookies())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = new URL(request.url);
  const params = customerListQuerySchema.parse({
    page: url.searchParams.get('page') ?? 1,
    limit: url.searchParams.get('limit') ?? 10,
    search: url.searchParams.get('search') ?? ''
  });
  const result = await listCustomers(params);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  if (!(await getSessionFromCookies())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = customerUpsertSchema.parse(await request.json());
  const customer = await createCustomer(payload);
  return NextResponse.json(customer, { status: 201 });
}