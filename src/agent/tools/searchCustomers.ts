import { z } from 'zod';
import { listCustomers } from '@/services/customers/service';

const schema = z.object({ query: z.string().min(1), limit: z.number().int().min(1).max(10).default(5) });

export async function searchCustomers(input: unknown, actorId: string) {
  if (!actorId) throw new Error('Unauthorized');
  const parsed = schema.parse(input);
  const result = await listCustomers({ page: 1, limit: parsed.limit, search: parsed.query });
  return result.data;
}