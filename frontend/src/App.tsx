import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";

import { analyzeWithMockFallback, MOCK_ANALYSIS, type AnalyzeResponse } from "./api";
import { DEMO_PAYLOAD } from "./demoData";
import DashboardPage from "./pages/DashboardPage";
import DataUploadPage from "./pages/DataUploadPage";
import BottlenecksPage from "./pages/BottlenecksPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import StatisticsPage from "./pages/StatisticsPage";
import SettingsPage from "./pages/SettingsPage";
import { Sidebar } from "./ux/Sidebar";
import type { ThemeMode } from "./ux/theme";
import { getInitialTheme, applyTheme, getInitialDemoMode, getInitialLang } from "./ux/theme";

export type TabKey = "dashboard" | "upload" | "bottlenecks" | "recommendations" | "statistics" | "settings";

export default function App() {
  const { t, i18n } = useTranslation();

  const [tab, setTab] = useState<TabKey>("dashboard");
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [lang, setLang] = useState<"ru" | "kz" | "en">(() => getInitialLang());
  const [company, setCompany] = useState<string>(() => localStorage.getItem("company_profile") ?? "KAZ Minerals");
  const [demoMode, setDemoMode] = useState<boolean>(() => getInitialDemoMode());

  const [analysis, setAnalysis] = useState<AnalyzeResponse>(MOCK_ANALYSIS);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (lang !== i18n.language) i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  }, [lang, i18n]);

  useEffect(() => {
    localStorage.setItem("company_profile", company);
  }, [company]);

  useEffect(() => {
    localStorage.setItem("demo_mode", demoMode ? "1" : "0");
  }, [demoMode]);

  const runWithProgress = async (payload: unknown, opts?: { silent?: boolean }) => {
    setGenerating(true);
    setProgress(0);

    let raf = 0;
    const start = performance.now();
    const durationMs = opts?.silent ? 350 : 1200;
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(0.98, elapsed / durationMs);
      setProgress(Math.round(p * 100));
      if (p < 0.98) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const res = await analyzeWithMockFallback(payload);
    cancelAnimationFrame(raf);
    setProgress(100);
    setAnalysis(res);
    setGenerating(false);
  };

  useEffect(() => {
    if (!demoMode) return;
    // Demo mode: animate results even if backend is down.
    void runWithProgress(DEMO_PAYLOAD, { silent: false });
  }, [demoMode]);

  const page = useMemo(() => {
    switch (tab) {
      case "dashboard":
        return (
          <DashboardPage
            analysis={analysis}
            generating={generating}
            progress={progress}
            company={company}
            onRun={() => runWithProgress(DEMO_PAYLOAD)}
          />
        );
      case "upload":
        return (
          <DataUploadPage
            demoMode={demoMode}
            onAnalysis={(a) => {
              setAnalysis(a);
              setProgress(100);
            }}
            onRun={() => runWithProgress(DEMO_PAYLOAD, { silent: true })}
          />
        );
      case "bottlenecks":
        return <BottlenecksPage analysis={analysis} />;
      case "recommendations":
        return <RecommendationsPage analysis={analysis} />;
      case "statistics":
        return <StatisticsPage analysis={analysis} />;
      case "settings":
        return (
          <SettingsPage
            lang={lang}
            theme={theme}
            demoMode={demoMode}
            company={company}
            onChangeLang={(v) => setLang(v)}
            onChangeTheme={(v) => setTheme(v)}
            onChangeDemoMode={(v) => setDemoMode(v)}
            onChangeCompany={(v) => setCompany(v)}
          />
        );
      default:
        return null;
    }
  }, [analysis, generating, progress, tab, company, demoMode, lang, theme]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex min-h-screen">
        <Sidebar tab={tab} onTabChange={setTab} demoMode={demoMode} theme={theme} lang={lang} onOpenSettings={() => setTab("settings")} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {page}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

