"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraErrorKind } from "../types";

export interface UseCameraOptions {
  facingMode?: "user" | "environment";
}

export function useCamera(options: UseCameraOptions = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    options.facingMode ?? "user",
  );
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<{ kind: CameraErrorKind; message: string } | null>(
    null,
  );
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [canFlip, setCanFlip] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setReady(false);
    stop();

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError({
        kind: "unsupported",
        message: "Camera is not supported in this browser. Try Chrome or Safari.",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        setReady(true);
      }

      const all = await navigator.mediaDevices.enumerateDevices();
      const cams = all.filter((d) => d.kind === "videoinput");
      setDevices(cams);
      setCanFlip(cams.length > 1);
    } catch (err) {
      const e = err as DOMException;
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setError({
          kind: "permission-denied",
          message:
            "Camera permission was denied. Allow camera access in your browser settings and try again.",
        });
      } else if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
        setError({
          kind: "not-found",
          message: "No camera was found on this device.",
        });
      } else if (e.name === "NotReadableError" || e.name === "TrackStartError") {
        setError({
          kind: "unavailable",
          message: "Camera is in use by another app. Close it and try again.",
        });
      } else {
        setError({
          kind: "unknown",
          message: "Could not start the camera. Please try again.",
        });
      }
    }
  }, [facingMode, stop]);

  const flip = useCallback(() => {
    setFacingMode((m) => (m === "user" ? "environment" : "user"));
  }, []);

  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !ready) return null;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return null;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    // Mirror front camera for natural selfies
    if (facingMode === "user") {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.92);
  }, [facingMode, ready]);

  useEffect(() => {
    let cancelled = false;
    // Start camera after mount; stop tracks on leave to avoid leaks.
    const id = window.setTimeout(() => {
      if (!cancelled) void start();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
      stop();
    };
  }, [start, stop]);

  return {
    videoRef,
    ready,
    error,
    facingMode,
    canFlip,
    devices,
    start,
    stop,
    flip,
    capture,
  };
}
