import React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-60";
  const styles =
    variant === "primary"
      ? "bg-kz-blue text-white hover:brightness-110"
      : "border border-white/10 bg-white/5 text-white hover:bg-white/10";
  return <button className={clsx(base, styles, className)} {...props} />;
}

