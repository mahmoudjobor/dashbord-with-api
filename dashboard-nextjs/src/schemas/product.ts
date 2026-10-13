import { z } from 'zod';

export const PRODUCT_STATUSES = ['active', 'inactive', 'out_of_stock'] as const;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  status: z.enum(PRODUCT_STATUSES),
  createdAt: z.string(),
});

export const ProductListResponseSchema = z.object({
  data: z.array(ProductSchema),
  meta: z.object({
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
  }),
});

export const ApiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

// Types are inferred from the schemas - never written by hand.
export type Product = z.infer<typeof ProductSchema>;
export type ProductStatus = Product['status'];
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
