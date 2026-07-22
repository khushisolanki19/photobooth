"use client";

import { cn } from "@/lib/utils";

const COLORS = [
  ["#ffc8d8", "#ffb0c4", "#f098b0", "#e080a0"],
  ["#c8e8f8", "#b0d8f0", "#98c8e4", "#80b4d4"],
  ["#ffe4b8", "#ffd4a0", "#f0c088", "#e0a870"],
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
        "float-strip paper-card relative flex w-16 flex-col gap-1.5 rounded-2xl p-2 sm:w-20",
        className,
      )}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden
    >
      <span className="absolute -top-1 -right-1 text-[10px] text-[#f2557a]">♡</span>
      {colors.map((c, i) => (
        <div
          key={i}
          className="aspect-[4/3] w-full rounded-md"
          style={{ background: `linear-gradient(145deg, ${c}, ${c}bb)` }}
        />
      ))}
      <div className="pt-1 text-center font-[family-name:var(--font-script)] text-[11px] text-booth-curtain">
        cuties
      </div>
    </div>
  );
}
