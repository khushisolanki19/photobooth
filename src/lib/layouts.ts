import type { StripLayout, StripSlot } from "./types";

/** Normalized strip layouts. Frames use 0–1 coords relative to strip size. */
export const STRIP_LAYOUTS: StripLayout[] = [
  {
    id: "classic-vertical-4",
    name: "Classic Vertical",
    description: "4 photos stacked — the iconic booth strip",
    slotCount: 4,
    aspectRatio: 0.32,
    footerHeight: 0.1,
    safeMargin: 0.04,
    frames: [
      { x: 0.08, y: 0.03, w: 0.84, h: 0.2 },
      { x: 0.08, y: 0.25, w: 0.84, h: 0.2 },
      { x: 0.08, y: 0.47, w: 0.84, h: 0.2 },
      { x: 0.08, y: 0.69, w: 0.84, h: 0.2 },
    ],
  },
  {
    id: "mini-vertical-3",
    name: "Mini Vertical",
    description: "3 photos in a shorter strip",
    slotCount: 3,
    aspectRatio: 0.38,
    footerHeight: 0.12,
    safeMargin: 0.04,
    frames: [
      { x: 0.08, y: 0.04, w: 0.84, h: 0.26 },
      { x: 0.08, y: 0.32, w: 0.84, h: 0.26 },
      { x: 0.08, y: 0.6, w: 0.84, h: 0.26 },
    ],
  },
  {
    id: "double-strip",
    name: "Double Strip",
    description: "Two identical 4-photo strips side by side",
    slotCount: 4,
    aspectRatio: 0.68,
    footerHeight: 0.1,
    safeMargin: 0.03,
    previewColumns: 2,
    frames: [
      { x: 0.05, y: 0.03, w: 0.4, h: 0.2 },
      { x: 0.05, y: 0.25, w: 0.4, h: 0.2 },
      { x: 0.05, y: 0.47, w: 0.4, h: 0.2 },
      { x: 0.05, y: 0.69, w: 0.4, h: 0.2 },
      // Mirror frames drawn separately for export double-print;
      // slot photos map to left strip; right is duplicate.
    ],
  },
  {
    id: "grid-2x2",
    name: "2×2 Grid",
    description: "Four photos in a square collage",
    slotCount: 4,
    aspectRatio: 0.85,
    footerHeight: 0.12,
    safeMargin: 0.04,
    frames: [
      { x: 0.06, y: 0.05, w: 0.42, h: 0.36 },
      { x: 0.52, y: 0.05, w: 0.42, h: 0.36 },
      { x: 0.06, y: 0.44, w: 0.42, h: 0.36 },
      { x: 0.52, y: 0.44, w: 0.42, h: 0.36 },
    ],
  },
  {
    id: "horizontal-4",
    name: "Horizontal Strip",
    description: "4 photos side by side",
    slotCount: 4,
    aspectRatio: 2.4,
    footerHeight: 0.14,
    safeMargin: 0.03,
    frames: [
      { x: 0.02, y: 0.08, w: 0.22, h: 0.7 },
      { x: 0.27, y: 0.08, w: 0.22, h: 0.7 },
      { x: 0.52, y: 0.08, w: 0.22, h: 0.7 },
      { x: 0.77, y: 0.08, w: 0.22, h: 0.7 },
    ],
  },
  {
    id: "vertical-6",
    name: "6-Photo Strip",
    description: "Six smaller vertically stacked photos",
    slotCount: 6,
    aspectRatio: 0.28,
    footerHeight: 0.08,
    safeMargin: 0.035,
    frames: [
      { x: 0.1, y: 0.02, w: 0.8, h: 0.135 },
      { x: 0.1, y: 0.165, w: 0.8, h: 0.135 },
      { x: 0.1, y: 0.31, w: 0.8, h: 0.135 },
      { x: 0.1, y: 0.455, w: 0.8, h: 0.135 },
      { x: 0.1, y: 0.6, w: 0.8, h: 0.135 },
      { x: 0.1, y: 0.745, w: 0.8, h: 0.135 },
    ],
  },
  {
    id: "mixed-collage",
    name: "Mixed Collage",
    description: "Feature photo plus supporting shots",
    slotCount: 4,
    aspectRatio: 0.72,
    footerHeight: 0.1,
    safeMargin: 0.035,
    frames: [
      { x: 0.06, y: 0.04, w: 0.88, h: 0.42 },
      { x: 0.06, y: 0.5, w: 0.28, h: 0.36 },
      { x: 0.36, y: 0.5, w: 0.28, h: 0.36 },
      { x: 0.66, y: 0.5, w: 0.28, h: 0.36 },
    ],
  },
];

export function getLayout(id: string): StripLayout {
  return STRIP_LAYOUTS.find((l) => l.id === id) ?? STRIP_LAYOUTS[0];
}

export function createEmptySlots(layoutId: string): StripSlot[] {
  const layout = getLayout(layoutId);
  return Array.from({ length: layout.slotCount }, (_, index) => ({
    index,
    photoId: null,
    participantId: null,
  }));
}

/** Double-strip right-side mirror frames for rendering */
export function getDoubleStripMirrorFrames(): StripLayout["frames"] {
  return [
    { x: 0.55, y: 0.03, w: 0.4, h: 0.2 },
    { x: 0.55, y: 0.25, w: 0.4, h: 0.2 },
    { x: 0.55, y: 0.47, w: 0.4, h: 0.2 },
    { x: 0.55, y: 0.69, w: 0.4, h: 0.2 },
  ];
}
