const { z } = require('zod');

const STATUSES = ['active', 'inactive', 'out_of_stock'];

const createProductBody = z
  .object({
    name: z.string().trim().min(1).max(120),
    price: z.number().nonnegative().max(1_000_000),
    status: z.enum(STATUSES).default('active'),
  })
  .strict(); // reject unknown keys

const updateStatusBody = z.object({ status: z.enum(STATUSES) }).strict();

const idParams = z.object({ id: z.string().uuid() });

const listQuery = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { STATUSES, createProductBody, updateStatusBody, idParams, listQuery };
