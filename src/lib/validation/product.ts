import { z } from 'zod';

export const productUpsertSchema = z.object({
  wooProductId: z.number().optional().nullable(),
  name: z.string().min(1),
  sku: z.string().default(''),
  description: z.string().default(''),
  type: z.string().default('simple'),
  status: z.enum(['publish', 'draft', 'private']).default('publish'),
  priceMinor: z.number().int().nonnegative().default(0),
  regularPriceMinor: z.number().int().nonnegative().default(0),
  salePriceMinor: z.number().int().nonnegative().default(0),
  currency: z.string().default('USD'),
  stockStatus: z.enum(['instock', 'lowstock', 'outofstock', 'onbackorder']).default('instock'),
  stockQuantity: z.number().int().nonnegative().default(0),
  manageStock: z.boolean().default(false),
  featured: z.boolean().default(false),
  onSale: z.boolean().default(false),
  categories: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional()
});

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().default('')
});
