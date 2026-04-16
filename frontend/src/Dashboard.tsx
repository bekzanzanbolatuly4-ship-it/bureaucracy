import React, { useMemo, useState } from "react";

import { analyzeWithMockFallback, uploadCsvWithMockFallback, MOCK_ANALYSIS, type AnalyzeResponse } from "./api";

type UploadStatus = "idle" | "uploading" | "ready" | "error";

function formatKzt(n: number) {
  try {
    return Math.round(n).toLocaleString("ru-RU");
  } catch {
    return String(Math.round(n));
  }
}

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<AnalyzeResponse>(MOCK_ANALYSIS);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const samplePayload = useMemo(
    () => ({
      steps: [
        { step: "Заявка", duration_hours: 2, approvals: 1, cost_kzt_hour: 5000 },
        { step: "Director approval", duration_hours: 72, approvals: 1, cost_kzt_hour: 25000 },
      ],
    }),
    [],
  );

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeWithMockFallback(samplePayload);
      setAnalysis(res);
    } catch (e: any) {
      setError(e?.message ?? "Analyze failed");
      setAnalysis(MOCK_ANALYSIS);
    } finally {
      setLoading(false);
    }
  };

  const onPickCsv = async (file: File | null) => {
    if (!file) return;
    setUploadStatus("uploading");
    setError(null);
    try {
      const res = await uploadCsvWithMockFallback(file);
      setAnalysis(res);
      setUploadStatus("ready");
    } catch (e: any) {
      setUploadStatus("error");
      setError(e?.message ?? "CSV upload failed");
      setAnalysis(MOCK_ANALYSIS);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <div className="text-lg font-semibold">Bureaucracy Buster (MVP)</div>
        <div className="mt-1 text-sm text-white/70">
          Bottlenecks + ROI-style loss estimate for Kazakhstan workflows (₸).
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-white/70">Total estimated loss</div>
              <div className="mt-1 text-3xl font-semibold">{formatKzt(analysis.total_loss_kzt)} ₸</div>
            </div>
            <button
              className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              onClick={runAnalysis}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Run analysis"}
            </button>
          </div>

          {error && <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">{error}</div>}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/70">CSV upload</div>
          <div className="mt-2 text-sm">
            Upload a CSV with columns like: <span className="text-white/90">step,duration_hours,approvals,cost_kzt_hour</span>
          </div>
          <div className="mt-4">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => onPickCsv(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-white/70"
            />
            <div className="mt-2 text-xs text-white/60">
              Status: {uploadStatus}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/70">Bottlenecks</div>
          <div className="mt-3 space-y-3">
            {(analysis.bottlenecks ?? []).length === 0 ? (
              <div className="text-sm text-white/70">No bottlenecks found.</div>
            ) : (
              (analysis.bottlenecks ?? []).map((b, idx) => (
                <div key={`${b.step}-${idx}`} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="text-sm font-semibold">{b.step}</div>
                  <div className="mt-1 text-xs text-white/70">Delay: {b.delay_hours} h</div>
                  <div className="mt-1 text-xs text-white/70">
                    Loss: {formatKzt(b.loss_kzt)} ₸
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/70">Recommendations</div>
          <div className="mt-3 space-y-2">
            {(analysis.recommendations ?? []).length === 0 ? (
              <div className="text-sm text-white/70">No recommendations.</div>
            ) : (
              (analysis.recommendations ?? []).map((r, idx) => (
                <div key={`${r}-${idx}`} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
                  {r}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

