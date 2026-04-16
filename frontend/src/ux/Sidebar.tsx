import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import type { TabKey } from "../App";
import type { ThemeMode } from "./theme";

const nav = [
  { key: "dashboard", labelKey: "nav.dashboard" },
  { key: "upload", labelKey: "nav.upload" },
  { key: "bottlenecks", labelKey: "nav.bottlenecks" },
  { key: "recommendations", labelKey: "nav.recommendations" },
  { key: "statistics", labelKey: "nav.statistics" },
  { key: "settings", labelKey: "nav.settings" },
] as const;

export function Sidebar({
  tab,
  onTabChange,
  demoMode,
  theme,
  lang,
  onOpenSettings,
}: {
  tab: TabKey;
  onTabChange: (t: TabKey) => void;
  demoMode: boolean;
  theme: ThemeMode;
  lang: "ru" | "kz" | "en";
  onOpenSettings: () => void;
}) {
  const { t } = useTranslation();

  return (
    <aside className="w-72 border-r border-black/10 bg-white/60 backdrop-blur dark:border-white/10 dark:bg-black/30">
      <div className="flex h-full flex-col p-4">
        <div className="mb-6">
          <div className="text-sm font-semibold text-kz-blue">Bureaucracy Buster</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-white/60">Process Intelligence UI</div>
        </div>

        <nav className="flex-1 space-y-1">
          {nav.map((item) => (
            <motion.button
              key={item.key}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onTabChange(item.key as TabKey)}
              className={[
                "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition",
                tab === item.key
                  ? "border-kz-blue bg-kz-blue/10 text-zinc-900 dark:text-zinc-50"
                  : "border-transparent bg-transparent text-zinc-700 hover:border-white/10 hover:bg-white/40 dark:text-zinc-200 dark:hover:border-white/10 dark:hover:bg-white/5",
              ].join(" ")}
            >
              <span>{t(item.labelKey)}</span>
              {item.key === "dashboard" && demoMode && (
                <span className="rounded-full bg-kz-blue px-2 py-0.5 text-[11px] font-semibold text-white">DEMO</span>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="mt-4 rounded-xl border border-black/10 bg-white/40 p-3 text-xs dark:border-white/10 dark:bg-black/20">
          <div className="flex items-center justify-between gap-3">
            <div className="text-zinc-600 dark:text-white/60">Theme</div>
            <div className="font-semibold">{theme === "dark" ? "Dark" : "Light"}</div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="text-zinc-600 dark:text-white/60">Lang</div>
            <div className="font-semibold">{lang.toUpperCase()}</div>
          </div>
          <button
            className="mt-3 w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:brightness-110 dark:bg-white/90 dark:text-black"
            onClick={onOpenSettings}
          >
            Settings
          </button>
        </div>
      </div>
    </aside>
  );
}

