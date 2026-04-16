import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

export function AnimatedNumber({
  value,
  suffix,
  durationMs = 900,
  format,
}: {
  value: number;
  suffix?: string;
  durationMs?: number;
  format?: (v: number) => string;
}) {
  const [current, setCurrent] = useState(0);
  const target = useMemo(() => (Number.isFinite(value) ? value : 0), [value]);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  const text = format ? format(current) : Math.round(current).toString();

  return (
    <motion.span
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {text}
      {suffix ?? ""}
    </motion.span>
  );
}

