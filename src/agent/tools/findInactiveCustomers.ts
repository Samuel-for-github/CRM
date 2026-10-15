import { z } from 'zod';
import { findInactiveCustomers } from '@/services/customers/service';

const schema = z.object({ days: z.number().int().min(7).max(365).default(90) });

export async function findInactiveCustomersTool(input: unknown, actorId: string) {
  if (!actorId) throw new Error('Unauthorized');
  const parsed = schema.parse(input);
  return findInactiveCustomers(parsed.days);
}