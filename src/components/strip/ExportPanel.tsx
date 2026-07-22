"use client";

import { useState } from "react";
import { exportStripBlob } from "@/lib/canvas/renderStrip";
import type { Photo, PhotoStrip } from "@/lib/types";
import { canNativeShare, downloadBlob, shareImageBlob } from "@/lib/utils";

export function ExportPanel({
  strip,
  photos,
}: {
  strip: PhotoStrip;
  photos: Photo[];
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(
    format: "png" | "jpg",
    opts: { doublePrint?: boolean; share?: boolean } = {},
  ) {
    setBusy(true);
    setError(null);
    try {
      const blob = await exportStripBlob(strip, photos, format, {
        targetLongSide: 2400,
        doublePrint: opts.doublePrint,
      });
      const name = `photo-booth-strip${opts.doublePrint ? "-double" : ""}.${format === "png" ? "png" : "jpg"}`;
      if (opts.share) {
        const shared = await shareImageBlob(blob, name);
        if (!shared) downloadBlob(blob, name);
      } else {
        downloadBlob(blob, name);
      }
    } catch {
      setError("Could not export the strip. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function saveIndividual() {
    const first = strip.slots.map((s) => s.photoId).find(Boolean);
    const photo = photos.find((p) => p.id === first);
    if (!photo) {
      setError("No photo to save.");
      return;
    }
    try {
      const res = await fetch(photo.src);
      const blob = await res.blob();
      downloadBlob(blob, `photo-booth-${photo.id}.jpg`);
    } catch {
      setError("Could not save that photo.");
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="btn-primary"
          disabled={busy}
          onClick={() => void run("png")}
        >
          Download PNG
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={busy}
          onClick={() => void run("jpg")}
        >
          Download JPG
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={busy}
          onClick={() => void run("png", { doublePrint: true })}
        >
          Double print (2 copies)
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={busy}
          onClick={() => void saveIndividual()}
        >
          Save one photo
        </button>
        {canNativeShare() && (
          <button
            type="button"
            className="btn-secondary sm:col-span-2"
            disabled={busy}
            onClick={() => void run("png", { share: true })}
          >
            Share…
          </button>
        )}
      </div>
    </div>
  );
}
