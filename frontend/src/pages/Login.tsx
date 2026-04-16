import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { api } from "@/lib/api";
import type { TokenPair } from "@/types";

type Mode = "login" | "register";

function decodeJwtPayload(token: string): any {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (payload.length % 4)) % 4;
  const padded = payload + "=".repeat(padLen);
  return JSON.parse(atob(padded));
}

export default function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let tokens: TokenPair;
      if (mode === "login") {
        const res = await api.post("/auth/login", { email, password });
        tokens = res.data as TokenPair;
      } else {
        const res = await api.post("/auth/register", {
          email,
          password,
          company_name: companyName,
          role: "analyst",
        });
        tokens = res.data as TokenPair;
      }

      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);

      const payload = decodeJwtPayload(tokens.access_token);
      if (payload?.company_id) localStorage.setItem("company_id", String(payload.company_id));

      onLoggedIn();
      window.location.reload();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex gap-2">
        <button
          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            mode === "login" ? "border-kz-blue" : "border-white/10"
          }`}
          onClick={() => setMode("login")}
          type="button"
        >
          {t("auth.login")}
        </button>
        <button
          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            mode === "register" ? "border-kz-blue" : "border-white/10"
          }`}
          onClick={() => setMode("register")}
          type="button"
        >
          {t("auth.register")}
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <div className="mb-1 text-sm text-white/70">{t("auth.email")}</div>
          <input
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </label>
        <label className="block">
          <div className="mb-1 text-sm text-white/70">{t("auth.password")}</div>
          <input
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </label>

        {mode === "register" && (
          <label className="block">
            <div className="mb-1 text-sm text-white/70">{t("auth.companyName")}</div>
            <input
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </label>
        )}

        {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm">{error}</div>}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-kz-blue px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          type="submit"
        >
          {loading ? "..." : t("auth.submit")}
        </button>
      </form>
    </div>
  );
}

