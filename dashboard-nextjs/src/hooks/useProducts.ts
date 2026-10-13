'use client';

import { useEffect, useState } from 'react';
import type { Product, ProductStatus } from '@/schemas/product';
import { listProducts } from '@/services/productService';
import { ForbiddenError, NetworkError, ResponseValidationError, UnauthorizedError } from '@/services/errors';

export type ErrorKind = 'unauthorized' | 'forbidden' | 'network' | 'invalid-response' | 'unknown';

export type ProductsState =
  | { phase: 'loading' }
  | { phase: 'error'; kind: ErrorKind; message: string }
  | { phase: 'success'; products: Product[]; total: number };

function classify(err: unknown): { kind: ErrorKind; message: string } {
  if (err instanceof UnauthorizedError) return { kind: 'unauthorized', message: err.message };
  if (err instanceof ForbiddenError) return { kind: 'forbidden', message: err.message };
  if (err instanceof NetworkError) return { kind: 'network', message: err.message };
  if (err instanceof ResponseValidationError) return { kind: 'invalid-response', message: err.message };
  return { kind: 'unknown', message: err instanceof Error ? err.message : 'Something went wrong.' };
}

interface Filters {
  search: string;
  status: ProductStatus | '';
}

export function useProducts(token: string | null, filters: Filters, reloadKey: number): ProductsState {
  const [state, setState] = useState<ProductsState>({ phase: 'loading' });
  const { search, status } = filters;

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setState({ phase: 'loading' });

    // Debounce typing so we don't hit the API on every keystroke.
    const timer = setTimeout(() => {
      listProducts(
        { search: search.trim() || undefined, status: status || undefined },
        { token, signal: controller.signal },
      )
        .then((res) => setState({ phase: 'success', products: res.data, total: res.meta.total }))
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setState({ phase: 'error', ...classify(err) });
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [token, search, status, reloadKey]);

  return state;
}
