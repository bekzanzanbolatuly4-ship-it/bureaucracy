import React, { useMemo } from "react";
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

export default function BottlenecksPage({ analysis }: { analysis: AnalyzeResponse }) {
  const bottlenecks = analysis.bottlenecks ?? [];
  const sorted = useMemo(() => {
    return [...bottlenecks].sort((a, b) => (b.loss_kzt ?? 0) - (a.loss_kzt ?? 0));
  }, [bottlenecks]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-semibold">Bottlenecks</div>
        <div className="mt-1 text-sm text-zinc-500 dark:text-white/60">
          Steps with long delays and high loss impact.
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-500 dark:text-white/60">
          No bottlenecks found. Upload CSV and run analysis.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sorted.map((b) => (
            <motion.div
              key={b.step}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-zinc-500 dark:text-white/60">Bottleneck step</div>
                  <div className="mt-1 text-lg font-semibold">{b.step}</div>
                </div>
                <div className="rounded-xl border border-kz-blue/30 bg-kz-blue/10 px-3 py-2 text-sm font-semibold text-kz-blue">
                  Loss
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/10 p-3 dark:bg-white/5">
                  <div className="text-xs text-zinc-500 dark:text-white/60">Delay</div>
                  <div className="mt-2 text-2xl font-semibold">
                    <AnimatedNumber value={b.delay_hours} suffix="h" format={(v) => String(Math.round(v))} />
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/10 p-3 dark:bg-white/5">
                  <div className="text-xs text-zinc-500 dark:text-white/60">Estimated loss</div>
                  <div className="mt-2 text-2xl font-semibold">
                    <AnimatedNumber value={b.loss_kzt} format={(v) => kzt(v)} suffix=" ₸" />
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-zinc-500 dark:text-white/60">
                Rule-of-thumb: delay &ge; 24h or approvals &gt;
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

