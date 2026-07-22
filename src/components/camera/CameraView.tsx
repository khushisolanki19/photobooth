"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const CameraView = forwardRef<
  HTMLVideoElement,
  {
    mirrored?: boolean;
    className?: string;
    flash?: boolean;
  }
>(function CameraView({ mirrored = true, className, flash }, ref) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-black shadow-2xl",
        className,
      )}
    >
      <video
        ref={ref}
        playsInline
        muted
        autoPlay
        className={cn(
          "h-full w-full object-cover",
          mirrored && "scale-x-[-1]",
        )}
        aria-label="Live camera preview"
      />
      {flash && (
        <div className="camera-flash pointer-events-none absolute inset-0 bg-[var(--booth-flash)]" />
      )}
    </div>
  );
});
