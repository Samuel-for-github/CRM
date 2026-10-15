import { z } from 'zod';

export const searchCustomersSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(10).default(5)
});

export const getCustomerOrdersSchema = z.object({
  customerId: z.string().min(1)
});

export const getCustomerSummarySchema = z.object({
  customerId: z.string().min(1)
});

export const findInactiveCustomersSchema = z.object({
  days: z.number().int().min(7).max(365).default(90)
});

export const createFollowUpTaskSchema = z.object({
  customerId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  dueDate: z.string().datetime(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  confirm: z.boolean().default(false)
});