"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BoothShell } from "@/components/ui/BoothShell";
import { getLayout } from "@/lib/layouts";
import { useSessionStore } from "@/lib/store/sessionStore";
import { cn } from "@/lib/utils";

export default function ReviewPage() {
  const router = useRouter();
  const photos = useSessionStore((s) => s.photos);
  const layoutId = useSessionStore((s) => s.layoutId);
  const togglePhotoSelected = useSessionStore((s) => s.togglePhotoSelected);
  const removePhoto = useSessionStore((s) => s.removePhoto);
  const autoFillSlots = useSessionStore((s) => s.autoFillSlots);
  const layout = getLayout(layoutId);
  const selectedCount = photos.filter((p) => p.selected).length;

  return (
    <BoothShell>
      <div className="paper-card rounded-3xl p-5 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-booth-curtain uppercase">
          Review
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
          Choose your keepers
        </h1>
        <p className="mt-2 text-sm text-booth-muted">
          Tap to keep or skip. You need {layout.slotCount} photos for this strip
          ({selectedCount} selected).
        </p>

        {photos.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-booth-muted">No photos yet.</p>
            <Link href="/booth/camera" className="btn-primary mt-4 inline-flex">
              Open camera
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo, i) => (
              <div key={photo.id} className="relative">
                <button
                  type="button"
                  onClick={() => togglePhotoSelected(photo.id)}
                  aria-pressed={photo.selected}
                  aria-label={`Photo ${i + 1}, ${photo.selected ? "selected" : "not selected"}`}
                  className={cn(
                    "develop-in block w-full overflow-hidden rounded-xl border-2",
                    photo.selected
                      ? "border-booth-curtain"
                      : "border-transparent opacity-50",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.src}
                    alt={`Capture ${i + 1}`}
                    className="aspect-[3/4] w-full object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-white"
                  aria-label={`Delete photo ${i + 1}`}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/booth/camera" className="btn-secondary w-full sm:w-auto">
            Retake / add more
          </Link>
          <button
            type="button"
            className="btn-primary w-full sm:w-auto"
            disabled={selectedCount < 1}
            onClick={() => {
              autoFillSlots();
              router.push("/booth/editor");
            }}
          >
            Customize strip
          </button>
        </div>
      </div>
    </BoothShell>
  );
}
