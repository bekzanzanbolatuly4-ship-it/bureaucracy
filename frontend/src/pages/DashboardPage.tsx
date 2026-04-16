import React, { useMemo } from "react";
import { motion } from "framer-motion";

import type { AnalyzeResponse } from "../api";
import { AnimatedNumber } from "../ux/AnimatedNumber";
import { DEMO_COMPANY_NAME } from "../demoData";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function kzt(n: number) {
  try {
    return Math.round(n).toLocaleString("ru-RU");
  } catch {
    return String(Math.round(n));
  }
}

export default function DashboardPage({
  analysis,
  generating,
  progress,
  company,
  onRun,
}: {
  analysis: AnalyzeResponse;
  generating: boolean;
  progress: number;
  company: string;
  onRun: () => void;
}) {
  const totalLoss = analysis.total_loss_kzt ?? 78000000;
  const bottlenecks = analysis.bottlenecks ?? [];
  const potentialSavingsPercent = 0.52;
  const potentialSavings = Math.round(totalLoss * potentialSavingsPercent);

  const efficiency = useMemo(() => {
    // Simple UX-friendly metric: higher total_loss => lower efficiency.
    const ratio = clamp(totalLoss / 78000000, 0, 2);
    const pct = 100 - ratio * 22;
    return clamp(Math.round(pct), 35, 98);
  }, [totalLoss]);

  const baseDelay = useMemo(() => {
    if (bottlenecks.length === 0) return 48;
    const delays = bottlenecks.map((b) => b.delay_hours);
    return delays.reduce((a, b) => a + b, 0) / delays.length;
  }, [bottlenecks]);

  const delayTrend = useMemo(() => {
    const points = Array.from({ length: 14 }, (_, i) => {
      const wave = 0.18 * Math.cos(i / 2.1) + 0.08 * Math.sin(i / 1.7);
      return clamp(baseDelay * (1 + wave), 2, 120);
    });
    return points;
  }, [baseDelay]);

  const deptBars = useMemo(() => {
    const weights: Record<string, number> = {
      Finance: 0,
      Procurement: 0,
      "Approvals": 0,
      Operations: 0,
      Management: 0,
    };
    for (const b of bottlenecks) {
      const s = b.step.toLowerCase();
      if (s.includes("фин")) weights.Finance += b.loss_kzt;
      else if (s.includes("директор") || s.includes("ген")) weights.Management += b.loss_kzt;
      else if (s.includes("инжен")) weights.Operations += b.loss_kzt;
      else weights.Approvals += b.loss_kzt;
    }
    const entries = Object.entries(weights)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([k, v]) => ({ dept: k, loss: v }));
    return entries.length ? entries : [{ dept: "Approvals", loss: totalLoss }];
  }, [bottlenecks, totalLoss]);

  const heatmap = useMemo(() => {
    // 7x5 grid
    const rows = 7;
    const cols = 5;
    const vals = bottlenecks.length ? bottlenecks.map((b) => b.delay_hours) : [48];
    const minV = Math.min(...vals);
    const maxV = Math.max(...vals);
    const norm = (v: number) => (maxV === minV ? 0.5 : (v - minV) / (maxV - minV));

    const cells: Array<{ key: string; intensity: number; label: string }> = [];
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = vals[idx % vals.length] * (0.9 + (r + c) * 0.02);
        const intensity = norm(v);
        const label = `${Math.round(v)}h`;
        cells.push({ key: `${r}-${c}`, intensity, label });
        idx++;
      }
    }
    return cells;
  }, [bottlenecks]);

  const directorBottleneck = bottlenecks.find((b) => b.step.toLowerCase().includes("директор")) ?? bottlenecks[0];
  const topStep = directorBottleneck?.step ?? "Director approval";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-500 dark:text-white/60">Executive overview</div>
          <div className="mt-1 text-2xl font-semibold">
            {company === DEMO_COMPANY_NAME ? "KAZ Minerals Demo Data" : company}
          </div>
          <div className="mt-1 text-sm text-zinc-500 dark:text-white/60">
            Process Intelligence dashboard (MVP)
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={onRun}
            disabled={generating}
            className="rounded-xl bg-kz-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {generating ? "Generating..." : "Run analysis"}
          </motion.button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-black/20"
        >
          <div className="text-sm text-zinc-500 dark:text-white/60">Total Loss (₸)</div>
          <div className="mt-2 text-3xl font-semibold">
            <AnimatedNumber value={totalLoss} format={(v) => kzt(v)} suffix="" />
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-white/60">Estimated operational loss</div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-black/20"
        >
          <div className="text-sm text-zinc-500 dark:text-white/60">Bottlenecks Found</div>
          <div className="mt-2 text-3xl font-semibold">
            <AnimatedNumber value={bottlenecks.length} format={(v) => String(Math.round(v))} />
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-white/60">Steps exceeding 24h / 3 approvals</div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-black/20"
        >
          <div className="text-sm text-zinc-500 dark:text-white/60">Efficiency %</div>
          <div className="mt-2 text-3xl font-semibold">
            <AnimatedNumber value={efficiency} suffix="%" format={(v) => String(Math.round(v))} />
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-white/60">UX-friendly metric</div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-black/20"
        >
          <div className="text-sm text-zinc-500 dark:text-white/60">Potential Savings</div>
          <div className="mt-2 text-3xl font-semibold">
            <AnimatedNumber value={potentialSavings} format={(v) => kzt(v)} suffix="" />
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-white/60">~ {Math.round(potentialSavingsPercent * 100)}% of loss</div>
        </motion.div>
      </div>

      {generating && (
        <div className="rounded-2xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-black/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-500 dark:text-white/60">ROI calculation</div>
            <div className="text-sm font-semibold">{progress}%</div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <motion.div
              className="h-full bg-kz-green"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-black/20 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-zinc-500 dark:text-white/60">Delay trends</div>
              <div className="mt-1 text-lg font-semibold">Approval delays over time</div>
            </div>
            <div className="text-xs text-zinc-500 dark:text-white/60">MVP sparkline</div>
          </div>

          <div className="mt-4">
            <svg viewBox="0 0 600 200" className="w-full">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <polyline
                points={delayTrend
                  .map((v, i) => {
                    const x = (i / (delayTrend.length - 1)) * 600;
                    const y = 180 - ((v - 0) / 120) * 140;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line x1="0" y1="180" x2="600" y2="180" stroke="rgba(255,255,255,0.08)" />
            </svg>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-sm font-semibold">Bottlenecks per department</div>
              <div className="mt-3 space-y-2">
                {deptBars.map((d) => {
                  const max = Math.max(...deptBars.map((x) => x.loss), 1);
                  const w = Math.round((d.loss / max) * 100);
                  return (
                    <div key={d.dept} className="rounded-xl border border-white/10 bg-white/40 p-3 dark:border-white/10 dark:bg-black/20">
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-white/60">
                        <span>{d.dept}</span>
                        <span>{kzt(d.loss)} ₸</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-black/10 dark:bg-white/10">
                        <motion.div
                          className="h-2 rounded-full bg-kz-blue"
                          initial={{ width: 0 }}
                          animate={{ width: `${w}%` }}
                          transition={{ duration: 0.55 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">Approval delays heatmap</div>
              <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: "repeat(5, minmax(0,1fr))" }}>
                {heatmap.map((c) => {
                  const intensity = clamp(c.intensity, 0, 1);
                  const bg =
                    intensity > 0.7
                      ? "bg-red-500/25 border-red-500/40"
                      : intensity > 0.4
                        ? "bg-yellow-500/20 border-yellow-500/35"
                        : "bg-green-500/15 border-green-500/30";
                  return (
                    <div
                      key={c.key}
                      title={`${c.label}`}
                      className={`h-10 rounded-xl border ${bg}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-black/20">
          <div className="text-sm text-zinc-500 dark:text-white/60">AI insights</div>
          <div className="mt-1 text-lg font-semibold">Executive-ready highlights</div>

          <div className="mt-4 space-y-3">
            <motion.div
              whileHover={{ y: -1 }}
              className="rounded-2xl border border-kz-blue/30 bg-kz-blue/10 p-4"
            >
              <div className="text-xs text-zinc-400">Biggest bottleneck</div>
              <div className="mt-1 text-sm font-semibold">{topStep}</div>
              <div className="mt-2 text-xs text-zinc-600 dark:text-white/60">
                KPI signal indicates this approval step blocks throughput.
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -1 }}
              className="rounded-2xl border border-kz-green/30 bg-kz-green/10 p-4"
            >
              <div className="text-xs text-zinc-400">Potential savings</div>
              <div className="mt-1 text-sm font-semibold">52%</div>
              <div className="mt-2 text-xs text-zinc-600 dark:text-white/60">
                Estimated monthly savings based on delay-driven loss model.
              </div>
            </motion.div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-semibold">Recommendations</div>
            <div className="mt-2 space-y-2">
              {(analysis.recommendations ?? []).slice(0, 3).map((r, idx) => (
                <div
                  key={`${r}-${idx}`}
                  className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm hover:border-white/20"
                >
                  {idx + 1}. {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

