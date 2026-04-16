import React, { useMemo } from "react";
import { motion } from "framer-motion";

import type { AnalyzeResponse } from "../api";

function kzt(n: number) {
  try {
    return Math.round(n).toLocaleString("ru-RU");
  } catch {
    return String(Math.round(n));
  }
}

function difficultyFrom(b: { delay_hours: number; loss_kzt: number }, totalLoss: number) {
  const share = totalLoss > 0 ? b.loss_kzt / totalLoss : 0;
  if (b.delay_hours >= 60 || share >= 0.45) return "high";
  if (b.delay_hours >= 30 || share >= 0.25) return "medium";
  return "low";
}

function problemFrom(step: string) {
  const s = step.toLowerCase();
  if (s.includes("директор") || s.includes("ген")) return "Director approval blocks throughput.";
  if (s.includes("фин")) return "Finance approval slows contract/expense cycle.";
  if (s.includes("инжен")) return "Engineering review delays equipment lifecycle tasks.";
  if (s.includes("соглас")) return "Approval workflow is not optimized.";
  return "Step delay increases process cycle time.";
}

export default function RecommendationsPage({ analysis }: { analysis: AnalyzeResponse }) {
  const bottlenecks = analysis.bottlenecks ?? [];
  const sorted = useMemo(() => [...bottlenecks].sort((a, b) => b.loss_kzt - a.loss_kzt), [bottlenecks]);

  const totalLoss = analysis.total_loss_kzt ?? 78000000;
  const potentialSavingsPercent = 0.52;
  const potentialSavingsTotal = Math.round(totalLoss * potentialSavingsPercent);

  const cards = useMemo(() => {
    const recs = analysis.recommendations ?? [];
    const bestFix = (i: number) => recs[i] ?? "Automate approvals";
    const mapFix = (i: number, b: (typeof sorted)[number]) => {
      const diff = difficultyFrom(b, totalLoss);
      const sla = "Introduce SLA 24h";
      if (diff === "high") return `${bestFix(0)} + ${sla}`;
      if (diff === "medium") return `${bestFix(1)} + ${sla}`;
      return `${bestFix(2)} (low-effort improvement)`;
    };

    return sorted.slice(0, 3).map((b, idx) => {
      const share = totalLoss > 0 ? b.loss_kzt / totalLoss : 0;
      const expected = Math.round(potentialSavingsTotal * share);
      const diff = difficultyFrom(b, totalLoss);
      return {
        idx,
        step: b.step,
        problem: problemFrom(b.step),
        impactLoss: b.loss_kzt,
        fix: mapFix(idx, b),
        expectedSavings: expected,
        difficulty: diff,
      };
    });
  }, [analysis.recommendations, sorted, totalLoss, potentialSavingsTotal]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-semibold">Recommendations</div>
        <div className="mt-1 text-sm text-zinc-500 dark:text-white/60">
          Ranked AI insights (MVP deterministic contract).
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-500 dark:text-white/60">
          No insights yet. Run analysis first.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {cards.map((c) => {
            const badge =
              c.difficulty === "high"
                ? "bg-red-500/15 text-red-400 border-red-500/30"
                : c.difficulty === "medium"
                  ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
                  : "bg-green-500/15 text-green-300 border-green-500/30";
            return (
              <motion.div
                key={c.step}
                whileHover={{ y: -2 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-white/60">Top {c.idx + 1}</div>
                    <div className="mt-1 text-lg font-semibold">{c.step}</div>
                  </div>
                  <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${badge}`}>
                    {c.difficulty.toUpperCase()}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-white/60">Problem</div>
                    <div className="mt-1 text-sm font-semibold">{c.problem}</div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/10 p-3 dark:bg-white/5">
                    <div className="text-xs text-zinc-500 dark:text-white/60">Impact (loss)</div>
                    <div className="mt-1 text-lg font-semibold">{kzt(c.impactLoss)} ₸</div>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-500 dark:text-white/60">Fix</div>
                    <div className="mt-1 text-sm">{c.fix}</div>
                  </div>

                  <div className="rounded-xl border border-kz-blue/30 bg-kz-blue/10 p-3">
                    <div className="text-xs text-zinc-500 dark:text-white/60">Expected savings</div>
                    <div className="mt-1 text-lg font-semibold">+{kzt(c.expectedSavings)} ₸/month</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

