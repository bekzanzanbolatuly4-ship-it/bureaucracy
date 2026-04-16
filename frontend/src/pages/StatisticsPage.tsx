import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

import type { AnalyzeResponse } from "../api";
import { AnimatedNumber } from "../ux/AnimatedNumber";

function kzt(n: number) {
  try {
    return Math.round(n).toLocaleString("ru-RU");
  } catch {
    return String(Math.round(n));
  }
}

export default function StatisticsPage({ analysis }: { analysis: AnalyzeResponse }) {
  const [slider, setSlider] = useState<number>(30);
  const totalLoss = analysis.total_loss_kzt ?? 78000000;

  const savings = useMemo(() => {
    const factor = slider / 100;
    return Math.round(totalLoss * factor * 0.6);
  }, [slider, totalLoss]);

  const newLoss = useMemo(() => Math.max(0, totalLoss - savings), [totalLoss, savings]);

  const series = useMemo(() => {
    const base = totalLoss;
    return Array.from({ length: 12 }, (_, i) => {
      const m = i;
      const decay = 1 - (slider / 100) * (m / 12);
      return Math.round(base * (0.7 + 0.3 * decay));
    });
  }, [totalLoss, slider]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-semibold">Statistics</div>
        <div className="mt-1 text-sm text-zinc-500 dark:text-white/60">
          Trend view + ROI improvement simulation.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-500 dark:text-white/60">Cost trend</div>
              <div className="mt-1 text-lg font-semibold">Monthly loss trajectory</div>
            </div>
          </div>

          <div className="mt-4">
            <svg viewBox="0 0 600 220" className="w-full">
              <defs>
                <linearGradient id="statLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke="url(#statLine)"
                strokeWidth="4"
                strokeLinecap="round"
                points={series
                  .map((v, i) => {
                    const x = (i / (series.length - 1)) * 560 + 20;
                    const max = Math.max(...series);
                    const y = 190 - (v / max) * 140;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
              <line x1="20" y1="190" x2="580" y2="190" stroke="rgba(255,255,255,0.08)" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-zinc-500 dark:text-white/60">ROI improvement simulation</div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-white/60">If we reduce delays by:</div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={60}
              value={slider}
              onChange={(e) => setSlider(Number(e.target.value))}
              className="flex-1"
            />
            <div className="w-12 text-right text-sm font-semibold">{slider}%</div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/10 bg-black/10 p-3 dark:bg-white/5">
              <div className="text-xs text-zinc-500 dark:text-white/60">Potential savings</div>
              <div className="mt-1 text-lg font-semibold">
                <AnimatedNumber value={savings} format={(v) => kzt(v)} suffix=" ₸/month" />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/10 p-3 dark:bg-white/5">
              <div className="text-xs text-zinc-500 dark:text-white/60">New estimated loss</div>
              <div className="mt-1 text-lg font-semibold">
                <AnimatedNumber value={newLoss} format={(v) => kzt(v)} suffix=" ₸" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

