import React from "react";

import type { AnalyzeResponse } from "@/types";

export default function BottleneckHeatmap({
  bottlenecks,
}: {
  bottlenecks: AnalyzeResponse["bottlenecks"];
}) {
  const maxCost = Math.max(1, ...bottlenecks.map((b) => b.monthly_cost_kzt));
  return (
    <div>
      <div className="mb-3 text-sm text-white/70">Heatmap (MVP)</div>
      <div className="grid gap-3 md:grid-cols-2">
        {bottlenecks.map((b) => {
          const intensity = Math.round((b.monthly_cost_kzt / maxCost) * 100);
          const bg =
            intensity > 70
              ? "bg-red-500/15 border-red-500/40"
              : intensity > 40
                ? "bg-yellow-500/15 border-yellow-500/40"
                : "bg-green-500/10 border-green-500/30";
          return (
            <div
              key={b.step_name}
              className={`rounded-xl border ${bg} p-4`}
            >
              <div className="text-sm font-semibold">{b.step_name}</div>
              <div className="mt-2 text-xs text-white/70">
                Delay: {Math.round(b.current_delay_hours)}ч
              </div>
              <div className="mt-1 text-xs text-white/70">
                Impact: {b.impact_score}
              </div>
              <div className="mt-3 text-lg font-semibold">{b.monthly_cost_kzt.toLocaleString("ru-RU")} ₸</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

