"use client";

import type { Participant, Photo } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SharedPhotoTray({
  photos,
  participants,
  selectedId,
  onSelect,
}: {
  photos: Photo[];
  participants: Participant[];
  selectedId?: string | null;
  onSelect?: (photoId: string) => void;
}) {
  const byId = new Map(participants.map((p) => [p.id, p]));

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 px-4 py-8 text-center text-sm text-booth-muted">
        Shared photo tray is empty. Take photos to drop them here.
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {photos.map((photo) => {
        const person = photo.participantId
          ? byId.get(photo.participantId)
          : undefined;
        return (
          <button
            key={photo.id}
            type="button"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/photo-id", photo.id)}
            onClick={() => onSelect?.(photo.id)}
            className={cn(
              "tray-drop shrink-0 overflow-hidden rounded-xl border-2 bg-white shadow-sm",
              selectedId === photo.id
                ? "border-booth-curtain"
                : "border-transparent",
            )}
            aria-label={`Photo from ${person?.name ?? "friend"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt="" className="h-28 w-20 object-cover" />
            <div
              className="px-1.5 py-1 text-[10px] font-semibold"
              style={{ color: person?.color ?? "#6b5e52" }}
            >
              {person?.name ?? "Friend"}
            </div>
          </button>
        );
      })}
    </div>
  );
}
