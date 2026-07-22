"use client";

export function CountdownTimer({ value }: { value: number | null }) {
  if (value === null) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span
        key={value}
        className="countdown-pop font-[family-name:var(--font-display)] text-8xl font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] sm:text-9xl"
      >
        {value}
      </span>
    </div>
  );
}
