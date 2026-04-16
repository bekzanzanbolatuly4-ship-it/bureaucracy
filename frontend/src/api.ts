export type Bottleneck = {
  step: string;
  delay_hours: number;
  loss_kzt: number;
};

export type AnalyzeResponse = {
  total_loss_kzt: number;
  bottlenecks: Bottleneck[];
  recommendations: string[];
};

export const MOCK_ANALYSIS: AnalyzeResponse = {
  total_loss_kzt: 78000000,
  bottlenecks: [{ step: "Director approval", delay_hours: 48, loss_kzt: 50000000 }],
  recommendations: ["Reduce approvals", "Add SLA limits", "Automate routine tasks"],
};

function safeJson<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

export async function analyzeWithMockFallback(payload: unknown): Promise<AnalyzeResponse> {
  try {
    const res = await fetch("https://bureaucracy.onrender.com/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload ?? {}),
    });
    if (!res.ok) return MOCK_ANALYSIS;
    const data = await safeJson<Partial<AnalyzeResponse>>(res);
    return {
      total_loss_kzt: Number(data.total_loss_kzt ?? MOCK_ANALYSIS.total_loss_kzt),
      bottlenecks: Array.isArray(data.bottlenecks) ? (data.bottlenecks as Bottleneck[]) : MOCK_ANALYSIS.bottlenecks,
      recommendations: Array.isArray(data.recommendations) ? (data.recommendations as string[]) : MOCK_ANALYSIS.recommendations,
    };
  } catch {
    return MOCK_ANALYSIS;
  }
}

export async function uploadCsvWithMockFallback(file: File): Promise<AnalyzeResponse> {
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/csv/upload", { method: "POST", body: form });
    if (!res.ok) return MOCK_ANALYSIS;
    const data = await safeJson<Partial<AnalyzeResponse>>(res);
    return {
      total_loss_kzt: Number(data.total_loss_kzt ?? MOCK_ANALYSIS.total_loss_kzt),
      bottlenecks: Array.isArray(data.bottlenecks) ? (data.bottlenecks as Bottleneck[]) : MOCK_ANALYSIS.bottlenecks,
      recommendations: Array.isArray(data.recommendations) ? (data.recommendations as string[]) : MOCK_ANALYSIS.recommendations,
    };
  } catch {
    return MOCK_ANALYSIS;
  }
}

