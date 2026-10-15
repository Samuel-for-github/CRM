import { z } from 'zod';
import { getOrdersForCustomer } from '@/services/orders/service';

const schema = z.object({ customerId: z.string().min(1) });

export async function getCustomerOrdersTool(input: unknown, actorId: string) {
  if (!actorId) throw new Error('Unauthorized');
  const parsed = schema.parse(input);
  return getOrdersForCustomer(parsed.customerId);
}