"use client";

import { useMemo, type CSSProperties } from "react";
import { cssFilterForPreset } from "@/lib/canvas/decorations";
import { getDoubleStripMirrorFrames, getLayout } from "@/lib/layouts";
import type { Photo, PhotoStrip as PhotoStripModel } from "@/lib/types";
import { formatBoothDate, cn } from "@/lib/utils";
import { DecorationsLayer } from "@/components/themes/DecorationsLayer";

export function PhotoStrip({
  strip,
  photos,
  className,
  maxHeight = 520,
  showDeveloping,
}: {
  strip: PhotoStripModel;
  photos: Photo[];
  className?: string;
  maxHeight?: number;
  showDeveloping?: boolean;
}) {
  const layout = getLayout(strip.layoutId);
  const theme = strip.theme;
  const photoMap = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos]);

  const height = maxHeight;
  const width = height * layout.aspectRatio;

  const frames =
    layout.id === "double-strip"
      ? [...layout.frames, ...getDoubleStripMirrorFrames()]
      : layout.frames;

  const patternStyle = patternBackground(theme);

  const fontFamily =
    theme.fontStyle === "handwritten"
      ? "var(--font-script), cursive"
      : theme.fontStyle === "typewriter"
        ? "ui-monospace, monospace"
        : theme.fontStyle === "display"
          ? "Impact, sans-serif"
          : theme.fontStyle === "modern"
            ? "var(--font-body), sans-serif"
            : "var(--font-display), Georgia, serif";

  return (
    <div
      className={cn(
        "relative mx-auto overflow-hidden shadow-xl",
        showDeveloping && "develop-in",
        className,
      )}
      style={{
        width,
        height,
        background: patternStyle.background,
        backgroundColor: theme.background.color,
        color: theme.textColor,
        border:
          theme.borderStyle === "none"
            ? "none"
            : theme.borderStyle === "thick"
              ? `8px solid ${theme.borderColor}`
              : theme.borderStyle === "dashed"
                ? `3px dashed ${theme.borderColor}`
                : theme.borderStyle === "double"
                  ? `4px double ${theme.borderColor}`
                  : `2px solid ${theme.borderColor}`,
        boxShadow:
          theme.borderStyle === "chrome"
            ? `0 0 0 4px ${theme.borderColor}, 0 12px 30px rgba(0,0,0,0.25)`
            : undefined,
      }}
    >
      {theme.background.pattern && theme.background.pattern !== "none" && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: theme.background.patternOpacity ?? 0.2,
            ...patternStyle.overlay,
          }}
        />
      )}

      {(layout.id === "double-strip" ? frames : frames).map((frame, i) => {
        const slotIndex = layout.id === "double-strip" ? i % 4 : i;
        const slot = strip.slots[slotIndex];
        const photo = slot?.photoId ? photoMap.get(slot.photoId) : undefined;
        const radius =
          theme.photoFrameStyle === "rounded" || theme.photoCornerRadius > 0
            ? Math.max(theme.photoCornerRadius, theme.photoFrameStyle === "rounded" ? 10 : 0)
            : 0;

        return (
          <div
            key={`${i}-${slotIndex}`}
            className="absolute overflow-hidden bg-black/10"
            style={{
              left: `${frame.x * 100}%`,
              top: `${frame.y * 100}%`,
              width: `${frame.w * 100}%`,
              height: `${frame.h * 100}%`,
              borderRadius: radius,
              border:
                theme.photoFrameStyle === "thin" || theme.photoFrameStyle === "vintage"
                  ? `1.5px solid ${theme.borderColor}`
                  : theme.photoFrameStyle === "polaroid" || theme.photoFrameStyle === "sticker"
                    ? "3px solid #fff"
                    : undefined,
              boxShadow:
                theme.photoFrameStyle === "polaroid"
                  ? "0 2px 0 #fff, 0 8px 0 #fff"
                  : undefined,
              filter: cssFilterForPreset(theme.filterPreset),
            }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.src}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-booth-muted">
                Empty
              </div>
            )}
            {theme.showNames && photo?.participantName && (
              <span className="absolute bottom-1 left-1 rounded bg-black/40 px-1 text-[9px] text-white">
                {photo.participantName}
              </span>
            )}
          </div>
        );
      })}

      <DecorationsLayer
        decorations={theme.decorations}
        layout={layout}
        width={width}
        height={height}
      />

      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center px-2 text-center"
        style={{
          height: `${layout.footerHeight * 100}%`,
          fontFamily,
          color: theme.textColor,
        }}
      >
        {theme.customText ? (
          <p className="text-[clamp(10px,2.8vw,16px)] font-semibold leading-tight">
            {theme.customText}
          </p>
        ) : null}
        {theme.dateStamp ? (
          <p className="text-[clamp(9px,2.2vw,13px)] opacity-80">{formatBoothDate()}</p>
        ) : null}
      </div>

      {theme.filmGrain && (
        <div
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      )}
    </div>
  );
}

function patternBackground(theme: PhotoStripModel["theme"]) {
  const p = theme.background.pattern;
  const accent = theme.background.secondaryColor ?? theme.borderColor;
  if (p === "checker") {
    return {
      background: theme.background.color,
      overlay: {
        backgroundImage: `repeating-conic-gradient(${accent} 0% 25%, transparent 0% 50%)`,
        backgroundSize: "16px 16px",
      } as CSSProperties,
    };
  }
  if (p === "dots") {
    return {
      background: theme.background.color,
      overlay: {
        backgroundImage: `radial-gradient(${accent} 1.2px, transparent 1.2px)`,
        backgroundSize: "14px 14px",
      } as CSSProperties,
    };
  }
  if (p === "waves") {
    return {
      background: theme.background.color,
      overlay: {
        backgroundImage: `repeating-linear-gradient(45deg, ${accent}22 0 8px, transparent 8px 16px)`,
      } as CSSProperties,
    };
  }
  if (p === "stars" || p === "glitter") {
    return {
      background: `linear-gradient(180deg, ${theme.background.color}, ${accent}55)`,
      overlay: {
        backgroundImage: `radial-gradient(#ffd700 1px, transparent 1px), radial-gradient(#fff 1px, transparent 1px)`,
        backgroundSize: "24px 24px, 36px 36px",
        backgroundPosition: "0 0, 12px 12px",
      } as CSSProperties,
    };
  }
  return { background: theme.background.color, overlay: {} as CSSProperties };
}
