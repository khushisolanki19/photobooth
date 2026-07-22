"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BoothShell } from "@/components/ui/BoothShell";
import { PhotoStrip } from "@/components/strip/PhotoStrip";
import { ThemePicker } from "@/components/themes/ThemePicker";
import { EditDesignPanel } from "@/components/themes/EditDesignPanel";
import { surpriseTheme } from "@/lib/themes/surprise";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function EditorPage() {
  const router = useRouter();
  const photos = useSessionStore((s) => s.photos);
  const slots = useSessionStore((s) => s.slots);
  const layoutId = useSessionStore((s) => s.layoutId);
  const theme = useSessionStore((s) => s.theme);
  const applyThemePreset = useSessionStore((s) => s.applyThemePreset);
  const patchTheme = useSessionStore((s) => s.patchTheme);
  const setTheme = useSessionStore((s) => s.setTheme);
  const autoFillSlots = useSessionStore((s) => s.autoFillSlots);
  const assignPhotoToSlot = useSessionStore((s) => s.assignPhotoToSlot);
  const [mode, setMode] = useState<"themes" | "edit" | "slots">("themes");

  useEffect(() => {
    if (slots.every((s) => !s.photoId) && photos.length) {
      const id = window.setTimeout(() => autoFillSlots(), 0);
      return () => window.clearTimeout(id);
    }
  }, [slots, photos.length, autoFillSlots]);

  const strip = { layoutId, slots, theme };
  const selected = photos.filter((p) => p.selected);

  return (
    <BoothShell wide>
      <div className="grid gap-6 lg:grid-cols-[minmax(220px,320px)_1fr]">
        <div className="order-2 lg:order-1">
          <div className="paper-card sticky top-4 rounded-3xl p-4 sm:p-5">
            <div className="flex gap-2">
              {(
                [
                  ["themes", "Themes"],
                  ["edit", "Edit Design"],
                  ["slots", "Slots"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    mode === id
                      ? "bg-booth-curtain text-white"
                      : "bg-booth-soft text-booth-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
              {mode === "themes" && (
                <div className="space-y-4">
                  <button
                    type="button"
                    className="btn-secondary w-full"
                    onClick={() => setTheme(surpriseTheme())}
                  >
                    Surprise Me
                  </button>
                  <ThemePicker
                    selectedId={theme.themeId}
                    onSelect={applyThemePreset}
                  />
                </div>
              )}
              {mode === "edit" && (
                <EditDesignPanel theme={theme} onChange={patchTheme} />
              )}
              {mode === "slots" && (
                <div className="space-y-3">
                  <p className="text-xs text-booth-muted">
                    Tap a photo, then tap a slot — or drag on desktop.
                  </p>
                  <SlotAssigner
                    photos={selected}
                    slots={slots}
                    onAssign={assignPhotoToSlot}
                  />
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => router.push("/booth/export")}
              >
                Continue to export
              </button>
              <Link href="/booth/review" className="btn-ghost w-full">
                Back to review
              </Link>
            </div>
          </div>
        </div>

        <div className="order-1 flex flex-col items-center lg:order-2">
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-booth-blush uppercase">
            Live strip preview
          </p>
          <div className="strip-slide-in">
            <PhotoStrip strip={strip} photos={photos} maxHeight={560} showDeveloping />
          </div>
        </div>
      </div>
    </BoothShell>
  );
}

function SlotAssigner({
  photos,
  slots,
  onAssign,
}: {
  photos: { id: string; src: string; participantName?: string }[];
  slots: { index: number; photoId: string | null }[];
  onAssign: (slotIndex: number, photoId: string | null) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {photos.map((p) => (
          <button
            key={p.id}
            type="button"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/photo-id", p.id)}
            onClick={() => setPicked(p.id === picked ? null : p.id)}
            className={`shrink-0 overflow-hidden rounded-lg border-2 ${
              picked === p.id ? "border-booth-curtain" : "border-transparent"
            }`}
            aria-label="Select photo for a slot"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt="" className="h-16 w-12 object-cover" />
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {slots.map((slot) => {
          const photo = photos.find((p) => p.id === slot.photoId);
          return (
            <button
              key={slot.index}
              type="button"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/photo-id");
                if (id) onAssign(slot.index, id);
              }}
              onClick={() => {
                if (picked) {
                  onAssign(slot.index, picked);
                  setPicked(null);
                } else if (slot.photoId) {
                  onAssign(slot.index, null);
                }
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-black/10 bg-white/70 p-2 text-left"
            >
              <span className="text-xs font-semibold text-booth-muted">
                Slot {slot.index + 1}
              </span>
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.src} alt="" className="h-12 w-10 rounded object-cover" />
              ) : (
                <span className="text-xs text-booth-muted">Empty — tap to fill</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
