"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [sessionActive, setSessionActive] = useState(false);
  const [shotIndex, setShotIndex] = useState(0);

  const cancelledRef = useRef(false);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const needed = layout.slotCount;
  const taken = photos.length;
  const remaining = Math.max(0, needed - taken);

  const progressLabel = useMemo(
    () => `${taken} / ${needed} photos`,
    [taken, needed],
  );

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (!sessionActive && taken >= needed && needed > 0) {
      const id = window.setTimeout(() => router.push("/booth/review"), 500);
      return () => window.clearTimeout(id);
    }
  }, [taken, needed, router, sessionActive]);

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const runCountdown = useCallback(async (seconds: number) => {
    for (let n = seconds; n >= 1; n--) {
      if (cancelledRef.current) return false;
      setCount(n);
      await sleep(1000);
    }
    setCount(null);
    return !cancelledRef.current;
  }, []);

  const takeShot = useCallback(() => {
    const dataUrl = capture();
    if (!dataUrl) return false;
    setFlash(true);
    window.setTimeout(() => setFlash(false), 350);
    setLastShot(dataUrl);
    addPhoto(dataUrl);
    return true;
  }, [addPhoto, capture]);

  /** One click starts a full booth run: countdown → snap → pause → repeat */
  const beginBoothSession = useCallback(async () => {
    if (!ready || sessionActive || remaining <= 0) return;
    cancelledRef.current = false;
    setSessionActive(true);
    setLastShot(null);

    const startCount = photosRef.current.length;
    const toTake = needed - startCount;

    for (let i = 0; i < toTake; i++) {
      if (cancelledRef.current) break;
      setShotIndex(startCount + i + 1);

      const ok = await runCountdown(countdown);
      if (!ok) break;

      takeShot();
      // Brief "developing" beat between shots, like a real booth
      if (i < toTake - 1) {
        await sleep(700);
      }
    }

    if (!cancelledRef.current) {
      setSessionActive(false);
      setCount(null);
      await sleep(600);
      router.push("/booth/review");
    } else {
      setSessionActive(false);
      setCount(null);
    }
  }, [
    ready,
    sessionActive,
    remaining,
    needed,
    countdown,
    runCountdown,
    takeShot,
    router,
  ]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-booth-night text-booth-ivory">
      <header className="flex items-center justify-between px-4 pt-[max(0.75rem,var(--safe-top))]">
        <Link
          href="/booth"
          className="text-sm font-medium text-booth-blush"
          onClick={() => {
            cancelledRef.current = true;
          }}
        >
          ← Layouts
        </Link>
        <p className="text-sm font-semibold">{progressLabel}</p>
        <Link
          href="/booth/review"
          className="text-sm font-medium text-booth-blush"
          onClick={() => {
            cancelledRef.current = true;
          }}
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

          {sessionActive && (
            <p className="absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-booth-ivory">
              Shot {shotIndex} of {needed}
            </p>
          )}

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
              onCapture={() => void beginBoothSession()}
              onFlip={flip}
              canFlip={canFlip && !sessionActive}
              countdown={countdown}
              onCountdownChange={setCountdown}
              disabled={!ready || remaining <= 0}
              capturing={sessionActive}
              remaining={remaining}
              total={needed}
              boothMode
            />
          </div>
        )}
      </div>
    </div>
  );
}
