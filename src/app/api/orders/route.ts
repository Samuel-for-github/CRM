import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { orderListQuerySchema } from '@/lib/validation/order';
import { listOrders } from '@/services/orders/service';

export async function GET(request: Request) {
  if (!(await getSessionFromCookies())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = new URL(request.url);
  const params = orderListQuerySchema.parse({
    page: url.searchParams.get('page') ?? 1,
    limit: url.searchParams.get('limit') ?? 10,
    search: url.searchParams.get('search') ?? '',
    status: url.searchParams.get('status') ?? ''
  });
  return NextResponse.json(await listOrders(params));
}