import { z } from 'zod';

export const customerUpsertSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(50).optional().nullable(),
  company: z.string().max(120).optional().nullable(),
  notesSummary: z.string().max(500).optional().nullable(),
  tags: z.array(z.string().min(1).max(40)).default([]),
  source: z.enum(['woocommerce', 'crm']).default('crm')
});

export const customerListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().default('')
});

export const customerNoteSchema = z.object({
  note: z.string().min(1).max(2000)
});