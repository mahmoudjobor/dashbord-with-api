'use client';

import { useState } from 'react';
import { ProductTable } from '@/components/ProductTable';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import { TokenForm } from '@/components/TokenForm';
import { useProducts } from '@/hooks/useProducts';
import { useToken } from '@/hooks/useToken';
import { PRODUCT_STATUSES } from '@/schemas/product';
import type { ProductStatus } from '@/schemas/product';

const STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  out_of_stock: 'Out of stock',
};

function isProductStatus(value: string): value is ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(value);
}

export default function ProductsPage() {
  const { token, ready, setToken, clearToken } = useToken();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [reloadKey, setReloadKey] = useState(0);
  const state = useProducts(token, { search, status }, reloadKey);

  const hasFilters = search.trim() !== '' || status !== '';

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <h1>Products</h1>
          {state.phase === 'success' && (
            <p className="muted">
              {state.total} {state.total === 1 ? 'product' : 'products'}
              {hasFilters ? ' found' : ''}
            </p>
          )}
        </div>
        {token && (
          <button className="btn" onClick={clearToken}>
            Sign out
          </button>
        )}
      </header>

      {!ready ? null : !token ? (
        <TokenForm onSubmit={setToken} />
      ) : (
        <>
          <div className="toolbar">
            <input
              type="search"
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products by name"
            />
            <select
              value={status}
              onChange={(e) => setStatus(isProductStatus(e.target.value) ? e.target.value : '')}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {PRODUCT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <section className="panel" aria-live="polite">
            {state.phase === 'loading' && <LoadingState />}
            {state.phase === 'error' && (
              <ErrorState
                kind={state.kind}
                message={state.message}
                onRetry={() => setReloadKey((k) => k + 1)}
                onChangeToken={clearToken}
              />
            )}
            {state.phase === 'success' &&
              (state.products.length === 0 ? (
                <EmptyState filtered={hasFilters} />
              ) : (
                <ProductTable products={state.products} />
              ))}
          </section>
        </>
      )}
    </main>
  );
}
