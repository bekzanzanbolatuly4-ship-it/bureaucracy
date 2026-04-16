import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { api } from "@/lib/api";
import { useKPI } from "@/hooks/useKPI";
import { useRealtimeAlerts } from "@/hooks/useRealtime";
import type { AnalyzeResponse, AnalyzeWorkflow } from "@/types";
import BottleneckHeatmap from "@/components/BottleneckHeatmap/BottleneckHeatmap";
import RecommendationCard from "@/components/RecommendationCard/RecommendationCard";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const sampleWorkflow: AnalyzeWorkflow = {
  name: "Оборудование закупка",
  steps: [
    { name: "Заявка", duration_hours: 2, approvals: 1, cost_kzt_hour: 5000 },
    { name: "Главный инженер", duration_hours: 8, approvals: 1, cost_kzt_hour: 12000 },
    { name: "Фин директор", duration_hours: 48, approvals: 1, cost_kzt_hour: 20000 },
    { name: "Ген директор", duration_hours: 72, approvals: 1, cost_kzt_hour: 25000 },
  ],
};

export default function Dashboard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useKPI();

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const alerts = useRealtimeAlerts(token);

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const items = data?.items ?? [];

  const latestByMetric = useMemo(() => {
    const m = new Map<string, (typeof items)[number]>();
    const sorted = [...items].sort((a, b) => a.period_date.localeCompare(b.period_date));
    for (const it of sorted) m.set(it.metric_name, it);
    return m;
  }, [items]);

  const topMetrics = useMemo(() => {
    const arr = Array.from(latestByMetric.values());
    return arr.sort((a, b) => b.value - a.value).slice(0, 4);
  }, [latestByMetric]);

  const chartMetric = topMetrics[0]?.metric_name ?? null;
  const chartData = useMemo(() => {
    if (!chartMetric) return [];
    const points = items.filter((x) => x.metric_name === chartMetric);
    const sorted = points.sort((a, b) => a.period_date.localeCompare(b.period_date));
    return sorted.map((p) => ({ date: p.period_date, value: p.value }));
  }, [items, chartMetric]);

  const runAnalysis = async () => {
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const res = await api.post("/ai/analyze", {
        workflow: sampleWorkflow,
        total_monthly_volume: 45,
        target_reduction: "50%",
      });
      setAnalysis(res.data as AnalyzeResponse);
      // Nudge KPI refresh if AI implies new metrics later.
      queryClient.invalidateQueries({ queryKey: ["kpi", "summary"] });
    } catch (err: any) {
      setAnalysisError(err?.response?.data?.detail ?? "AI request failed");
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
        <div className="mt-1 text-white/70">{t("dashboard.subtitle")}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse h-28" />
            ))
          : topMetrics.map((m) => (
              <Card key={m.metric_name}>
                <div className="text-sm text-white/70">{m.metric_name}</div>
                <div className="mt-2 text-3xl font-semibold">{m.value.toLocaleString("ru-RU")}</div>
                <div className="mt-1 text-xs text-white/70">Target: {m.target.toLocaleString("ru-RU")}</div>
              </Card>
            ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 text-sm text-white/70">KPI Trends</div>
          {chartMetric ? (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#1E3A8A" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-sm text-white/70">Import KPI data to see trends.</div>
          )}
        </Card>

        <Card>
          <div className="mb-3 text-sm text-white/70">Live Alerts</div>
          {alerts.length === 0 ? (
            <div className="text-sm text-white/70">No alerts yet.</div>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 5).map((a, idx) => (
                <div key={idx} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
                  <div className="text-xs text-white/70">{a.type}</div>
                  <div className="mt-1">{a.message ?? "Alert"}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/70">Bottlenecks</div>
              <div className="mt-1 text-lg font-semibold">
                {analysis ? `${analysis.bottlenecks.length} bottlenecks` : "Run AI analysis"}
              </div>
            </div>
            <Button onClick={runAnalysis} disabled={analysisLoading}>
              {analysisLoading ? "Analyzing..." : "Analyze with GigaChat (MVP)"}
            </Button>
          </div>

          {analysisError && (
            <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">
              {analysisError}
            </div>
          )}

          <div className="mt-4">
            {analysis ? (
              <BottleneckHeatmap bottlenecks={analysis.bottlenecks} />
            ) : (
              <div className="text-sm text-white/70">AI results will appear here.</div>
            )}
          </div>
        </Card>

        <Card>
          <div className="text-sm text-white/70">Top Recommendations</div>
          <div className="mt-2 grid gap-3 sm:grid-cols-1">
            {analysis ? (
              analysis.recommendations.map((rec) => <RecommendationCard key={rec.action + rec.implementation_days} rec={rec} />)
            ) : (
              <div className="text-sm text-white/70">Recommendations will be generated after analysis.</div>
            )}
          </div>
          {analysis && (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs text-white/70">ROI</div>
              <div className="mt-1 text-2xl font-semibold">
                Save {analysis.overall_roi.total_monthly_saving_kzt.toLocaleString("ru-RU")} ₸ / month
              </div>
              <div className="mt-1 text-xs text-white/70">Payback confidence: {analysis.overall_roi.confidence}</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

