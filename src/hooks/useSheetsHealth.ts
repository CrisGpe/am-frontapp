import { useState, useEffect, useCallback } from "react";

export function useSheetsHealth() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/health/sheets");
      if (res.ok) {
        const data = await res.json();
        setConnected(data.connected === true);
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return { connected, loading, checkHealth };
}
