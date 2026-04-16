import React from "react";
import { motion } from "framer-motion";

import type { ThemeMode } from "../ux/theme";

export default function SettingsPage({
  lang,
  theme,
  demoMode,
  company,
  onChangeLang,
  onChangeTheme,
  onChangeDemoMode,
  onChangeCompany,
}: {
  lang: "ru" | "kz" | "en";
  theme: ThemeMode;
  demoMode: boolean;
  company: string;
  onChangeLang: (v: "ru" | "kz" | "en") => void;
  onChangeTheme: (v: ThemeMode) => void;
  onChangeDemoMode: (v: boolean) => void;
  onChangeCompany: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-semibold">Settings</div>
        <div className="mt-1 text-sm text-zinc-500 dark:text-white/60">
          Personalise language, theme and demo mode.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Language</div>
            <div className="mt-2 flex gap-2">
              {(["ru", "kz", "en"] as const).map((code) => (
                <button
                  key={code}
                  onClick={() => onChangeLang(code)}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-semibold",
                    lang === code
                      ? "bg-kz-blue text-white"
                      : "border border-white/10 bg-white/5 text-zinc-700 hover:bg-white/10 dark:text-zinc-100",
                  ].join(" ")}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Theme</div>
            <div className="mt-2 flex gap-2">
              {(["dark", "light"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => onChangeTheme(m)}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-semibold",
                    theme === m
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                      : "border border-white/10 bg-white/5 text-zinc-700 hover:bg-white/10 dark:text-zinc-100",
                  ].join(" ")}
                >
                  {m === "dark" ? "Dark" : "Light"}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Company profile</div>
            <div className="mt-2 text-xs text-zinc-500 dark:text-white/60">
              This name appears in the dashboard header.
            </div>
            <div className="mt-3">
              <input
                value={company}
                onChange={(e) => onChangeCompany(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-sm dark:bg-white/5"
                placeholder="KAZ Minerals"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold">Demo mode</div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-white/60">
            When enabled, the app auto-loads KAZ Minerals demo dataset, animates results and works fully offline.
          </div>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onChangeDemoMode(!demoMode)}
            className={[
              "mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
              demoMode ? "bg-kz-green text-white" : "bg-zinc-900 text-white dark:bg-white dark:text-black",
            ].join(" ")}
          >
            <span
              className={[
                "h-2 w-2 rounded-full",
                demoMode ? "bg-emerald-300" : "bg-zinc-500",
              ].join(" ")}
            />
            {demoMode ? "Demo Mode ON" : "Demo Mode OFF"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

