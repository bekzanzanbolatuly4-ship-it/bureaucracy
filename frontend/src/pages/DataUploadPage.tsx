import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { AnalyzeResponse } from "../api";
import { MOCK_ANALYSIS, uploadCsvWithMockFallback } from "../api";
import { DEMO_CSV, DEMO_COMPANY_NAME } from "../demoData";

type UploadStatus = "idle" | "uploading" | "success" | "error";

type PreviewRow = Record<string, string>;
type Preview = { headers: string[]; rows: PreviewRow[] };

function normalizeHeader(s: string) {
  return s.trim().toLowerCase();
}

function splitCsvLine(line: string) {
  // MVP preview parser: split by comma; ignores complex CSV quoting.
  return line.split(",").map((x) => x.trim().replace(/^"|"$/g, ""));
}

function parseCsvPreview(text: string): Preview | null {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;
  const headers = splitCsvLine(lines[0]);
  const rows: PreviewRow[] = [];
  for (const line of lines.slice(1, 10)) {
    const cols = splitCsvLine(line);
    const row: PreviewRow = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    rows.push(row);
  }
  return { headers, rows };
}

function validatePreview(p: Preview | null) {
  if (!p) return { ok: false, reason: "No rows" };

  const cols = p.headers.map(normalizeHeader);
  const hasStep = cols.includes("step") || cols.includes("name");
  const hasDuration = cols.includes("duration_hours") || cols.includes("duration");
  const hasApprovals = cols.includes("approvals") || cols.includes("approval_count");
  const hasCost = cols.includes("cost_kzt_hour") || cols.includes("cost_per_hour_kzt") || cols.includes("cost");

  const ok = hasStep && hasDuration && hasApprovals && hasCost;
  return {
    ok,
    reason: ok
      ? "OK"
      : `Missing columns. Need: step|name, duration_hours, approvals, cost_kzt_hour|cost_per_hour_kzt`,
  };
}

export default function DataUploadPage({
  demoMode,
  onAnalysis,
}: {
  demoMode: boolean;
  onAnalysis: (a: AnalyzeResponse) => void;
  // onRun exists but not necessary; upload triggers analysis.
}) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validation = useMemo(() => validatePreview(preview), [preview]);

  const loadDemo = async () => {
    setFileName(DEMO_COMPANY_NAME);
    const p = parseCsvPreview(DEMO_CSV);
    setPreview(p);

    setStatus("uploading");
    setErrorMsg(null);

    // Demo mode: no backend required.
    if (demoMode) {
      await new Promise((r) => setTimeout(r, 600));
      onAnalysis(MOCK_ANALYSIS);
      setStatus("success");
      return;
    }

    // If demoMode is off, still keep it robust: try backend upload, fall back to mock.
    try {
      const blob = new Blob([DEMO_CSV], { type: "text/csv" });
      const file = new File([blob], "demo.csv", { type: "text/csv" });
      const res = await uploadCsvWithMockFallback(file);
      onAnalysis(res);
      setStatus("success");
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message ?? "Upload failed");
      onAnalysis(MOCK_ANALYSIS);
    }
  };

  useEffect(() => {
    if (demoMode) {
      // Auto-load sample dataset on demo mode enable.
      void loadDemo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  const onPickFile = async (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    setStatus("uploading");
    setErrorMsg(null);

    try {
      const text = await file.text();
      const p = parseCsvPreview(text);
      setPreview(p);
      const v = validatePreview(p);
      if (!v.ok) {
        setStatus("error");
        setErrorMsg(v.reason);
        onAnalysis(MOCK_ANALYSIS);
        return;
      }

      // CSV upload works with backend when available; fallback otherwise.
      const res = await uploadCsvWithMockFallback(file);
      onAnalysis(res);
      setStatus("success");
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message ?? "CSV read failed");
      onAnalysis(MOCK_ANALYSIS);
    }
  };

  const statusColor =
    status === "success" ? "border-kz-green/40 bg-kz-green/10" : status === "error" ? "border-red-500/40 bg-red-500/10" : "border-white/10 bg-white/5";

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-semibold">CSV / 1C import</div>
        <div className="mt-1 text-sm text-zinc-500 dark:text-white/60">
          Drag & drop, validate columns, then run bottleneck analysis.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <motion.div
            whileHover={{ y: -1 }}
            className={`rounded-2xl border p-4 transition ${statusColor}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0] ?? null;
              void onPickFile(f);
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-zinc-500 dark:text-white/60">Upload zone</div>
                <div className="mt-1 text-lg font-semibold">
                  {status === "idle" ? "Drag & drop your CSV" : status === "uploading" ? "Processing..." : status === "success" ? "Validated ✓" : "Validation error"}
                </div>
                <div className="mt-2 text-xs text-zinc-500 dark:text-white/60">
                  Headers: step|name, duration_hours, approvals, cost_kzt_hour|cost_per_hour_kzt
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-white/90 dark:text-black">
                  Choose file
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => void loadDemo()}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/10 dark:text-zinc-100"
                >
                  Try demo data
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">File preview</div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-white/60">
              {fileName ? `Source: ${fileName}` : "No file selected"}
            </div>

            {preview ? (
              <div className="mt-4 overflow-auto rounded-xl border border-black/10 bg-white/30 dark:border-white/10 dark:bg-black/20">
                <table className="min-w-[640px] w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-black/10 dark:bg-white/5">
                      {preview.headers.map((h) => (
                        <th key={h} className="border-b border-white/10 px-3 py-2 text-left font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5">
                        {preview.headers.map((h) => (
                          <td key={h} className="border-b border-white/10 px-3 py-2 text-zinc-700 dark:text-zinc-200">
                            {r[h] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4 text-sm text-zinc-500 dark:text-white/60">Upload a CSV to see preview.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:h-fit">
          <div className="text-sm font-semibold">Validation</div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-white/60">
            {validation.ok ? "Structure matches expected columns." : "Waiting for a valid CSV header."}
          </div>
          <div className={`mt-3 rounded-xl border p-3 text-sm ${validation.ok ? "border-kz-green/40 bg-kz-green/10" : "border-red-500/40 bg-red-500/10"}`}>
            {validation.ok ? "Success ✓" : `Error: ${validation.reason}`}
          </div>

          <div className="mt-4 text-xs text-zinc-500 dark:text-white/60">
            Demo mode:
            <div className="mt-1 font-semibold">{demoMode ? "ON (backend-free)" : "OFF"}</div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-semibold">What happens next?</div>
            <div className="mt-2 space-y-2 text-sm text-zinc-500 dark:text-white/60">
              <div>1) Parse CSV</div>
              <div>2) Detect bottleneck steps</div>
              <div>3) Return strict ROI contract JSON</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

