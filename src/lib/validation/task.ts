import { z } from 'zod';

export const taskUpsertSchema = z.object({
  customerId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  dueDate: z.string().datetime(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['pending', 'in progress', 'completed']).default('pending')
});

export const taskListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().default(''),
  status: z.string().default('')
});