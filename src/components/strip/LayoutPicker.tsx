"use client";

import { STRIP_LAYOUTS } from "@/lib/layouts";
import { cn } from "@/lib/utils";

export function LayoutPicker({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {STRIP_LAYOUTS.map((layout) => {
        const selected = layout.id === selectedId;
        return (
          <button
            key={layout.id}
            type="button"
            onClick={() => onSelect(layout.id)}
            aria-pressed={selected}
            aria-label={`Select ${layout.name} layout`}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl p-3 text-left transition",
              selected
                ? "border-[3px] border-booth-curtain bg-[linear-gradient(165deg,rgba(255,252,248,0.99),rgba(255,244,234,0.98))] shadow-[0_0_0_3px_rgba(212,33,58,0.18),0_12px_28px_rgba(8,2,6,0.25)]"
                : "paper-card border-[3px] border-transparent hover:brightness-105",
            )}
          >
            <LayoutThumb
              layoutId={layout.id}
              frames={layout.frames}
              aspect={layout.aspectRatio}
              selected={selected}
            />
            <div className="w-full">
              <p
                className={cn(
                  "text-sm font-semibold",
                  selected ? "text-booth-curtain" : "text-booth-ink",
                )}
              >
                {layout.name}
              </p>
              <p className="mt-0.5 text-xs text-booth-muted">{layout.description}</p>
              <p className="mt-1 text-[11px] font-medium text-booth-curtain">
                {layout.slotCount} photos
                {selected ? " · Selected" : ""}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function LayoutThumb({
  frames,
  aspect,
  selected,
}: {
  layoutId: string;
  frames: { x: number; y: number; w: number; h: number }[];
  aspect: number;
  selected?: boolean;
}) {
  const h = 96;
  const w = Math.min(120, h * aspect * (aspect > 1.2 ? 0.9 : 1.4));
  return (
    <div
      className={cn(
        "relative rounded-sm bg-booth-paper shadow-inner",
        selected ? "outline outline-2 outline-booth-curtain outline-offset-2" : "",
      )}
      style={{
        width: w,
        height: h,
        border: selected
          ? "2px solid var(--booth-curtain)"
          : "1px solid rgba(26,20,16,0.12)",
      }}
    >
      {frames.map((f, i) => (
        <div
          key={i}
          className="absolute bg-[#d8c4b0]"
          style={{
            left: `${f.x * 100}%`,
            top: `${f.y * 100}%`,
            width: `${f.w * 100}%`,
            height: `${f.h * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
