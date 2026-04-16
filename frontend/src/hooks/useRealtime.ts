import { useEffect, useState } from "react";

import { getWsUrl, type WsAlert } from "@/lib/websocket";

export function useRealtimeAlerts(token: string | null) {
  const [alerts, setAlerts] = useState<WsAlert[]>([]);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(getWsUrl(token));
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        setAlerts((prev) => [data as WsAlert, ...prev].slice(0, 20));
      } catch {
        // ignore non-json
      }
    };

    return () => ws.close();
  }, [token]);

  return alerts;
}

