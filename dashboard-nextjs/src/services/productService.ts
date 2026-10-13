import type { ZodType } from 'zod';
import { ApiErrorResponseSchema, ProductListResponseSchema } from '@/schemas/product';
import type { ProductListResponse, ProductStatus } from '@/schemas/product';
import { ApiError, ForbiddenError, NetworkError, ResponseValidationError, UnauthorizedError } from './errors';

function getBaseUrl(): string {
  // Must be referenced statically so Next.js can inline it at build time.
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local.');
  }
  return url.replace(/\/+$/, '');
}

async function extractMessage(res: Response): Promise<string> {
  try {
    const parsed = ApiErrorResponseSchema.safeParse(await res.json());
    if (parsed.success) return parsed.data.error.message;
  } catch {
    // body was not JSON - fall through
  }
  return `Request failed with status ${res.status}.`;
}

/** Every API response goes through here: auth handling + Zod validation. */
async function request<T>(
  path: string,
  schema: ZodType<T>,
  options: { token: string; signal?: AbortSignal },
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}${path}`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${options.token}` },
      signal: options.signal,
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new NetworkError();
  }

  if (res.status === 401) throw new UnauthorizedError();
  if (res.status === 403) throw new ForbiddenError();
  if (!res.ok) throw new ApiError(await extractMessage(res), res.status);

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new ResponseValidationError('The server did not return valid JSON.');
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ResponseValidationError();
  return parsed.data;
}

export interface ListProductsParams {
  search?: string;
  status?: ProductStatus;
  page?: number;
  limit?: number;
}

export function listProducts(
  params: ListProductsParams,
  options: { token: string; signal?: AbortSignal },
): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  query.set('page', String(params.page ?? 1));
  query.set('limit', String(params.limit ?? 20));
  return request(`/api/products?${query.toString()}`, ProductListResponseSchema, options);
}
