import React from "react";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/5 p-5 ${className ?? ""}`}
      {...props}
    />
  );
}

