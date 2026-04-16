import React from "react";

import type { AnalyzeResponse } from "@/types";

export default function RecommendationCard({
  rec,
}: {
  rec: AnalyzeResponse["recommendations"][number];
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold">{rec.action}</div>
      <div className="mt-2 text-xs text-white/70">
        Ожидаемое снижение: {rec.expected_reduction}
      </div>
      <div className="mt-1 text-xs text-white/70">Срок внедрения: {rec.implementation_days} дн.</div>
      <div className="mt-3 text-lg font-semibold text-kz-green">
        +{rec.monthly_saving_kzt.toLocaleString("ru-RU")} ₸/мес
      </div>
      <div className="mt-1 text-xs text-white/70">Payback: {rec.payback_months} мес.</div>
    </div>
  );
}

