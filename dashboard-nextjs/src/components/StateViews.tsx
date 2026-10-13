import type { ErrorKind } from '@/hooks/useProducts';

export function LoadingState() {
  return (
    <div className="state" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>Loading products…</p>
    </div>
  );
}

export function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="state">
      <h3>{filtered ? 'No products match your filters' : 'No products yet'}</h3>
      <p className="muted">
        {filtered ? 'Try a different search term or clear the status filter.' : 'Products created through the API will show up here.'}
      </p>
    </div>
  );
}

const TITLES: Record<ErrorKind, string> = {
  unauthorized: 'Sign-in required',
  forbidden: 'Access denied',
  network: 'Server unreachable',
  'invalid-response': 'Unexpected response',
  unknown: 'Something went wrong',
};

interface ErrorProps {
  kind: ErrorKind;
  message: string;
  onRetry: () => void;
  onChangeToken: () => void;
}

export function ErrorState({ kind, message, onRetry, onChangeToken }: ErrorProps) {
  return (
    <div className="state error" role="alert">
      <h3>{TITLES[kind]}</h3>
      <p>{message}</p>
      <div className="row center">
        {kind === 'unauthorized' ? (
          <button className="btn primary" onClick={onChangeToken}>
            Enter a new token
          </button>
        ) : (
          <button className="btn primary" onClick={onRetry}>
            Try again
          </button>
        )}
        {kind === 'forbidden' && (
          <button className="btn" onClick={onChangeToken}>
            Use a different token
          </button>
        )}
      </div>
    </div>
  );
}
