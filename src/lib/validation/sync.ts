import { z } from 'zod';

export const syncRequestSchema = z.object({
  scope: z.enum(['customers', 'orders', 'products', 'all']).default('all')
});

export const webhookEventSchema = z.object({
  id: z.union([z.string(), z.number()]),
  type: z.string(),
  data: z.record(z.any()).optional()
});