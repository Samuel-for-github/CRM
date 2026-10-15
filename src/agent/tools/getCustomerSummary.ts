import { z } from 'zod';
import { getCustomerInsight } from '@/services/ai/service';

const schema = z.object({ customerId: z.string().min(1) });

export async function getCustomerSummaryTool(input: unknown, actorId: string) {
  if (!actorId) throw new Error('Unauthorized');
  const parsed = schema.parse(input);
  return getCustomerInsight(parsed.customerId);
}