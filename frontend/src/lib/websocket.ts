export type WsAlert = {
  type: string;
  company_id?: string;
  message?: string;
};

export function getWsUrl(token: string) {
  const base = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
  return `${base}/ws/company?token=${encodeURIComponent(token)}`;
}

