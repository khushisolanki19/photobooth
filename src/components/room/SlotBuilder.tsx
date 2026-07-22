"use client";

import type { Participant, Photo, StripSlot } from "@/lib/types";

export function SlotBuilder({
  slots,
  photos,
  participants,
  selectedPhotoId,
  onAssign,
  onSwap,
  readOnly,
}: {
  slots: StripSlot[];
  photos: Photo[];
  participants: Participant[];
  selectedPhotoId?: string | null;
  onAssign: (slotIndex: number, photoId: string | null) => void;
  onSwap?: (a: number, b: number) => void;
  readOnly?: boolean;
}) {
  const photoMap = new Map(photos.map((p) => [p.id, p]));
  const partMap = new Map(participants.map((p) => [p.id, p]));

  return (
    <div className="space-y-2">
      {slots.map((slot) => {
        const photo = slot.photoId ? photoMap.get(slot.photoId) : undefined;
        const person = photo?.participantId
          ? partMap.get(photo.participantId)
          : undefined;
        return (
          <div
            key={slot.index}
            onDragOver={(e) => {
              if (!readOnly) e.preventDefault();
            }}
            onDrop={(e) => {
              if (readOnly) return;
              e.preventDefault();
              const id = e.dataTransfer.getData("text/photo-id");
              if (id) onAssign(slot.index, id);
            }}
            className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/80 p-2"
          >
            <span className="w-14 text-xs font-semibold text-booth-muted">
              Slot {slot.index + 1}
            </span>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => {
                if (readOnly) return;
                if (selectedPhotoId) {
                  onAssign(slot.index, selectedPhotoId);
                } else if (slot.photoId) {
                  onAssign(slot.index, null);
                }
              }}
              className="flex flex-1 items-center gap-3 text-left disabled:opacity-70"
              aria-label={`Assign photo to slot ${slot.index + 1}`}
            >
              {photo ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.src}
                    alt=""
                    className="h-14 w-11 rounded-md object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold text-booth-ink">
                      Filled
                    </p>
                    {person && (
                      <p className="text-[11px]" style={{ color: person.color }}>
                        {person.name}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-booth-muted">
                  {selectedPhotoId
                    ? "Tap to place selected photo"
                    : "Empty — drag or tap a tray photo first"}
                </p>
              )}
            </button>
            {!readOnly && slot.index > 0 && onSwap && (
              <button
                type="button"
                className="text-[11px] font-medium text-booth-curtain"
                onClick={() => onSwap(slot.index - 1, slot.index)}
                aria-label={`Swap slot ${slot.index} with ${slot.index + 1}`}
              >
                Swap↑
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
