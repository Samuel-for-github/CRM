import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { productListQuerySchema, productUpsertSchema } from '@/lib/validation/product';
import { createProduct, listProducts } from '@/services/products/service';

export async function GET(request: Request) {
  if (!(await getSessionFromCookies())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const params = productListQuerySchema.parse({
    page: url.searchParams.get('page') ?? 1,
    limit: url.searchParams.get('limit') ?? 10,
    search: url.searchParams.get('search') ?? ''
  });

  return NextResponse.json(await listProducts(params));
}

export async function POST(request: Request) {
  if (!(await getSessionFromCookies())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = productUpsertSchema.parse(await request.json());
  const product = await createProduct(payload);
  return NextResponse.json(product, { status: 201 });
}
