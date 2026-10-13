'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'ishtari_token';

export function useToken() {
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Read after mount so server and client markup match (no hydration warning).
  useEffect(() => {
    setTokenState(sessionStorage.getItem(KEY));
    setReady(true);
  }, []);

  const setToken = useCallback((value: string) => {
    sessionStorage.setItem(KEY, value);
    setTokenState(value);
  }, []);

  const clearToken = useCallback(() => {
    sessionStorage.removeItem(KEY);
    setTokenState(null);
  }, []);

  return { token, ready, setToken, clearToken };
}
