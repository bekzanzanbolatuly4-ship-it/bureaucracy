import React from "react";
import { useTranslation } from "react-i18next";

export default function Pricing() {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl">
      <h1 className="mb-2 text-2xl font-semibold">{t("pricing.title")}</h1>
      <p className="text-white/70">KZT pricing with enterprise-grade compliance.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="text-lg font-semibold">{t("pricing.starter")}</div>
          <div className="mt-2 text-3xl font-semibold">500 000 ₸/год</div>
          <div className="mt-3 text-sm text-white/70">до 50 пользователей, 1 интеграция</div>
        </div>
        <div className="rounded-xl border border-kz-blue bg-white/5 p-5 shadow-[0_0_0_1px_rgba(30,58,138,0.4)]">
          <div className="text-lg font-semibold">{t("pricing.pro")}</div>
          <div className="mt-2 text-3xl font-semibold">2 500 000 ₸/год</div>
          <div className="mt-3 text-sm text-white/70">до 250 пользователей, 3 интеграции</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="text-lg font-semibold">{t("pricing.enterprise")}</div>
          <div className="mt-2 text-3xl font-semibold">Custom</div>
          <div className="mt-3 text-sm text-white/70">белая маркировка, поддержка, SLA</div>
        </div>
      </div>
    </div>
  );
}

