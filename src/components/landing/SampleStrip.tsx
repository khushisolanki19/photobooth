"use client";

import { cn } from "@/lib/utils";

const COLORS = [
  ["#f2c4b0", "#e8a890", "#d89078", "#c87860"],
  ["#c8d8f0", "#a8c0e0", "#90a8d0", "#7890c0"],
  ["#f0c8d8", "#e0a8c0", "#d090b0", "#c07898"],
];

export function SampleStrip({
  variant = 0,
  className,
  delay = 0,
}: {
  variant?: number;
  className?: string;
  delay?: number;
}) {
  const colors = COLORS[variant % COLORS.length];
  return (
    <div
      className={cn(
        "float-strip paper-card flex w-16 flex-col gap-1.5 rounded-sm p-2 sm:w-20",
        className,
      )}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden
    >
      {colors.map((c, i) => (
        <div
          key={i}
          className="aspect-[4/3] w-full rounded-[1px]"
          style={{ background: `linear-gradient(145deg, ${c}, ${c}bb)` }}
        />
      ))}
      <div className="pt-1 text-center font-[family-name:var(--font-script)] text-[10px] text-booth-muted">
        07.21.26
      </div>
    </div>
  );
}
