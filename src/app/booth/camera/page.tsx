"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CameraControls } from "@/components/camera/CameraControls";
import { CameraView } from "@/components/camera/CameraView";
import { CountdownTimer } from "@/components/camera/CountdownTimer";
import { useCamera } from "@/lib/camera/useCamera";
import { getLayout } from "@/lib/layouts";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function CameraPage() {
  const router = useRouter();
  const layoutId = useSessionStore((s) => s.layoutId);
  const photos = useSessionStore((s) => s.photos);
  const addPhoto = useSessionStore((s) => s.addPhoto);
  const countdown = useSessionStore((s) => s.countdown);
  const setCountdown = useSessionStore((s) => s.setCountdown);
  const layout = getLayout(layoutId);

  const { videoRef, ready, error, facingMode, canFlip, flip, capture, start } =
    useCamera();

  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [lastShot, setLastShot] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const needed = layout.slotCount;
  const taken = photos.length;
  const remaining = Math.max(0, needed - taken);

  const progressLabel = useMemo(
    () => `${taken} / ${needed} photos`,
    [taken, needed],
  );

  useEffect(() => {
    if (taken >= needed && needed > 0) {
      const id = window.setTimeout(() => router.push("/booth/review"), 400);
      return () => window.clearTimeout(id);
    }
  }, [taken, needed, router]);

  const takeShot = useCallback(() => {
    const dataUrl = capture();
    if (!dataUrl) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 350);
    setLastShot(dataUrl);
    addPhoto(dataUrl);
  }, [addPhoto, capture]);

  const beginCapture = useCallback(() => {
    if (!ready || capturing || remaining <= 0) return;
    setCapturing(true);
    setLastShot(null);
    let n = countdown;
    setCount(n);
    const timer = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        window.clearInterval(timer);
        setCount(null);
        takeShot();
        setCapturing(false);
      } else {
        setCount(n);
      }
    }, 1000);
  }, [ready, capturing, remaining, countdown, takeShot]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-booth-night text-booth-ivory">
      <header className="flex items-center justify-between px-4 pt-[max(0.75rem,var(--safe-top))]">
        <Link href="/booth" className="text-sm font-medium text-booth-blush">
          ← Layouts
        </Link>
        <p className="text-sm font-semibold">{progressLabel}</p>
        <Link
          href="/booth/review"
          className="text-sm font-medium text-booth-blush"
        >
          Review
        </Link>
      </header>

      <div className="relative mx-auto mt-3 flex w-full max-w-lg flex-1 flex-col px-3">
        <div className="relative min-h-0 flex-1">
          <CameraView
            ref={videoRef}
            mirrored={facingMode === "user"}
            flash={flash}
            className="absolute inset-0 h-full w-full"
          />
          <CountdownTimer value={count} />

          {lastShot && (
            <div className="absolute bottom-3 left-3 overflow-hidden rounded-lg border border-white/30 shadow-lg develop-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lastShot} alt="Last capture" className="h-20 w-16 object-cover" />
            </div>
          )}
        </div>

        {error ? (
          <div className="paper-card mt-4 rounded-2xl p-4 text-booth-ink" role="alert">
            <p className="font-semibold">Camera issue</p>
            <p className="mt-1 text-sm text-booth-muted">{error.message}</p>
            <button type="button" className="btn-primary mt-3" onClick={() => void start()}>
              Try again
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <CameraControls
              onCapture={beginCapture}
              onFlip={flip}
              canFlip={canFlip}
              countdown={countdown}
              onCountdownChange={setCountdown}
              disabled={!ready || remaining <= 0}
              capturing={capturing}
              remaining={remaining}
              total={needed}
            />
          </div>
        )}
      </div>
    </div>
  );
}
