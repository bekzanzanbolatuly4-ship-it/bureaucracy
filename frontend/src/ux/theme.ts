export type ThemeMode = "dark" | "light";

export function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

export function getInitialDemoMode(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem("demo_mode") === "1";
}

export function getInitialLang(): "ru" | "kz" | "en" {
  if (typeof window === "undefined") return "ru";
  const saved = window.localStorage.getItem("lang");
  if (saved === "ru" || saved === "kz" || saved === "en") return saved;
  const lang = window.navigator.language.toLowerCase();
  if (lang.startsWith("kk") || lang.startsWith("kaz")) return "kz";
  if (lang.startsWith("en")) return "en";
  return "ru";
}

