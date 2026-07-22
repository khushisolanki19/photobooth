"use client";

import type { CountdownSeconds } from "@/lib/types";

export function CameraControls({
  onCapture,
  onFlip,
  canFlip,
  countdown,
  onCountdownChange,
  disabled,
  capturing,
  remaining,
  total,
}: {
  onCapture: () => void;
  onFlip: () => void;
  canFlip: boolean;
  countdown: CountdownSeconds;
  onCountdownChange: (v: CountdownSeconds) => void;
  disabled?: boolean;
  capturing?: boolean;
  remaining: number;
  total: number;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-4 pb-[max(0.5rem,var(--safe-bottom))]">
      <p className="text-sm font-medium text-booth-blush">
        Photo {Math.min(total - remaining + (capturing ? 0 : 0), total)} of {total}
        {remaining > 0 ? ` · ${remaining} left` : " · done"}
      </p>

      <div className="flex items-center gap-2">
        <span className="text-xs text-booth-blush/80">Countdown</span>
        {([3, 5] as CountdownSeconds[]).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onCountdownChange(n)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              countdown === n
                ? "bg-booth-ivory text-booth-ink"
                : "bg-white/10 text-booth-ivory"
            }`}
            aria-pressed={countdown === n}
          >
            {n}s
          </button>
        ))}
      </div>

      <div className="flex w-full max-w-md items-center justify-center gap-6">
        <button
          type="button"
          onClick={onFlip}
          disabled={!canFlip}
          className="btn-ghost-light min-h-12 min-w-12 rounded-full disabled:opacity-40"
          aria-label="Switch camera"
        >
          Flip
        </button>

        <button
          type="button"
          onClick={onCapture}
          disabled={disabled || capturing}
          aria-label="Take photo"
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-booth-ivory shadow-[0_0_28px_rgba(255,77,106,0.25)] disabled:opacity-50"
        >
          <span className="absolute inset-2 rounded-full border-[3px] border-booth-curtain" />
          <span className="sr-only">Shutter</span>
        </button>

        <div className="min-w-12" aria-hidden />
      </div>
    </div>
  );
}
