'use client';

import { useState } from 'react';

interface Props {
  onSubmit: (token: string) => void;
  message?: string;
}

export function TokenForm({ onSubmit, message }: Props) {
  const [value, setValue] = useState('');

  return (
    <div className="panel token-panel" role="region" aria-label="Sign in">
      <h2>Enter your access token</h2>
      <p className="muted">{message ?? 'Paste a JWT issued for this API to load the product list.'}</p>
      <div className="row">
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="eyJhbGciOi..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Access token"
        />
        <button className="btn primary" disabled={!value.trim()} onClick={() => onSubmit(value.trim())}>
          Load products
        </button>
      </div>
    </div>
  );
}
