import { getDoubleStripMirrorFrames, getLayout } from "../layouts";
import type { Photo, PhotoStrip } from "../types";
import { formatBoothDate } from "../utils";
import {
  drawDecoration,
  drawFilmGrain,
  resolveDecorationPosition,
} from "./decorations";

export interface RenderOptions {
  /** Longest side in pixels for high-res export */
  targetLongSide?: number;
  doublePrint?: boolean;
  date?: Date;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  ctx.save();
  if (radius > 0) {
    roundRect(ctx, x, y, w, h, radius);
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
  }
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function applyFilterToRegion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  preset: string,
) {
  if (preset === "none") return;
  const img = ctx.getImageData(x, y, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    if (preset === "bw") {
      const v = 0.299 * r + 0.587 * g + 0.114 * b;
      r = g = b = v;
    } else if (preset === "sepia") {
      const nr = 0.393 * r + 0.769 * g + 0.189 * b;
      const ng = 0.349 * r + 0.686 * g + 0.168 * b;
      const nb = 0.272 * r + 0.534 * g + 0.131 * b;
      r = Math.min(255, nr);
      g = Math.min(255, ng);
      b = Math.min(255, nb);
    } else if (preset === "warm") {
      r = Math.min(255, r * 1.08 + 8);
      g = Math.min(255, g * 1.02);
      b = Math.max(0, b * 0.92);
    } else if (preset === "faded") {
      r = r * 0.9 + 20;
      g = g * 0.9 + 18;
      b = b * 0.9 + 15;
    }
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
  }
  ctx.putImageData(img, x, y);
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: PhotoStrip["theme"],
) {
  const { pattern, patternOpacity = 0.2, secondaryColor } = theme.background;
  if (!pattern || pattern === "none") return;
  ctx.save();
  ctx.globalAlpha = patternOpacity;

  if (pattern === "dots") {
    ctx.fillStyle = secondaryColor ?? theme.borderColor;
    for (let y = 8; y < height; y += 18) {
      for (let x = 8; x < width; x += 18) {
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === "checker") {
    const cell = 16;
    for (let y = 0; y < height; y += cell) {
      for (let x = 0; x < width; x += cell) {
        if (((x / cell) + (y / cell)) % 2 === 0) {
          ctx.fillStyle = secondaryColor ?? "#1A1410";
          ctx.fillRect(x, y, cell, cell);
        }
      }
    }
  } else if (pattern === "waves") {
    ctx.strokeStyle = secondaryColor ?? theme.borderColor;
    ctx.lineWidth = 2;
    for (let y = 0; y < height; y += 28) {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 10) {
        const yy = y + Math.sin(x / 24) * 8;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
  } else if (pattern === "stars") {
    ctx.fillStyle = secondaryColor ?? "#FFD700";
    for (let i = 0; i < 40; i++) {
      const x = (i * 97) % width;
      const y = (i * 53) % height;
      ctx.beginPath();
      ctx.arc(x, y, 1.5 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (pattern === "glitter") {
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#FFD700" : "#FFFFFF";
      const x = (i * 67) % width;
      const y = (i * 89) % height;
      ctx.fillRect(x, y, 2, 2);
    }
  } else if (pattern === "paper" || pattern === "grain") {
    // light noise overlay later via film grain
  }

  ctx.restore();
}

function fontForStyle(style: string, size: number): string {
  switch (style) {
    case "handwritten":
      return `italic ${size}px "Segoe Script", "Bradley Hand", cursive`;
    case "typewriter":
      return `${size}px "Courier New", Courier, monospace`;
    case "display":
      return `700 ${size}px Impact, "Arial Black", sans-serif`;
    case "modern":
      return `500 ${size}px system-ui, sans-serif`;
    default:
      return `600 ${size}px Georgia, "Times New Roman", serif`;
  }
}

function drawBorder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: PhotoStrip["theme"],
) {
  const { borderStyle, borderColor } = theme;
  if (borderStyle === "none") return;
  ctx.strokeStyle = borderColor;
  const inset = 6;

  if (borderStyle === "thin") {
    ctx.lineWidth = 2;
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
  } else if (borderStyle === "thick") {
    ctx.lineWidth = 8;
    ctx.strokeRect(inset + 4, inset + 4, width - inset * 2 - 8, height - inset * 2 - 8);
  } else if (borderStyle === "dashed") {
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
    ctx.setLineDash([]);
  } else if (borderStyle === "double") {
    ctx.lineWidth = 2;
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
    ctx.strokeRect(inset + 6, inset + 6, width - inset * 2 - 12, height - inset * 2 - 12);
  } else if (borderStyle === "chrome") {
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, "#E8ECF0");
    g.addColorStop(0.5, borderColor);
    g.addColorStop(1, "#A8B0BC");
    ctx.strokeStyle = g;
    ctx.lineWidth = 6;
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
  } else if (borderStyle === "film" || borderStyle === "ribbon" || borderStyle === "scalloped" || borderStyle === "torn") {
    ctx.lineWidth = borderStyle === "ribbon" ? 10 : 4;
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
    if (borderStyle === "scalloped") {
      ctx.fillStyle = borderColor;
      const r = 6;
      for (let x = inset + 10; x < width - inset; x += 14) {
        ctx.beginPath();
        ctx.arc(x, inset, r, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, height - inset, r, Math.PI, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

async function renderSingleStrip(
  strip: PhotoStrip,
  photos: Photo[],
  opts: RenderOptions,
): Promise<HTMLCanvasElement> {
  const layout = getLayout(strip.layoutId);
  const theme = strip.theme;
  const longSide = opts.targetLongSide ?? 2400;
  const isWide = layout.aspectRatio >= 1;
  const width = isWide ? longSide : Math.round(longSide * layout.aspectRatio);
  const height = isWide ? Math.round(longSide / layout.aspectRatio) : longSide;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  // Background
  const bg = theme.background;
  if (bg.secondaryColor && (bg.pattern === "stars" || bg.pattern === "glitter")) {
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, bg.color);
    g.addColorStop(1, bg.secondaryColor);
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = bg.color;
  }
  ctx.fillRect(0, 0, width, height);
  drawPattern(ctx, width, height, theme);

  const photoMap = new Map(photos.map((p) => [p.id, p]));
  const images = new Map<string, HTMLImageElement>();
  await Promise.all(
    strip.slots.map(async (slot) => {
      if (!slot.photoId) return;
      const photo = photoMap.get(slot.photoId);
      if (!photo) return;
      try {
        images.set(slot.photoId, await loadImage(photo.src));
      } catch {
        /* skip broken */
      }
    }),
  );

  const frames =
    layout.id === "double-strip"
      ? [...layout.frames, ...getDoubleStripMirrorFrames()]
      : layout.frames;

  const drawFrame = (
    frame: (typeof frames)[number],
    slotIndex: number,
  ) => {
    const slot = strip.slots[slotIndex];
    const x = frame.x * width;
    const y = frame.y * height;
    const w = frame.w * width;
    const h = frame.h * height;
    const radius =
      theme.photoFrameStyle === "rounded" || theme.photoCornerRadius > 0
        ? Math.max(theme.photoCornerRadius, theme.photoFrameStyle === "rounded" ? 10 : 0) *
          (width / 400)
        : 0;

    // Frame backing
    if (theme.photoFrameStyle === "polaroid") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(x - 4, y - 4, w + 8, h + 18);
    } else if (theme.photoFrameStyle === "sticker") {
      ctx.fillStyle = "#FFFFFF";
      roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 8);
      ctx.fill();
    }

    if (slot?.photoId && images.has(slot.photoId)) {
      drawCover(ctx, images.get(slot.photoId)!, x, y, w, h, radius);
      applyFilterToRegion(ctx, Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h), theme.filterPreset);
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      if (radius) {
        roundRect(ctx, x, y, w, h, radius);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, w, h);
      }
    }

    if (theme.photoFrameStyle === "thin" || theme.photoFrameStyle === "vintage") {
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = theme.photoFrameStyle === "vintage" ? 3 : 1.5;
      if (radius) {
        roundRect(ctx, x, y, w, h, radius);
        ctx.stroke();
      } else {
        ctx.strokeRect(x, y, w, h);
      }
    }

    if (
      theme.showNames &&
      slot?.photoId &&
      photoMap.get(slot.photoId)?.participantName
    ) {
      const name = photoMap.get(slot.photoId)!.participantName!;
      ctx.fillStyle = theme.textColor;
      ctx.font = fontForStyle("modern", Math.max(10, width * 0.03));
      ctx.textAlign = "left";
      ctx.fillText(name, x + 4, y + h - 6);
    }
  };

  if (layout.id === "double-strip") {
    for (let i = 0; i < 4; i++) {
      drawFrame(frames[i], i);
      drawFrame(frames[i + 4], i);
    }
  } else {
    frames.forEach((frame, i) => drawFrame(frame, i));
  }

  drawBorder(ctx, width, height, theme);

  // Decorations
  const baseSize = Math.min(width, height) * 0.06;
  for (const item of theme.decorations) {
    if (!item.enabled) continue;
    const pos = resolveDecorationPosition(item, layout, width, height);
    drawDecoration(ctx, item, pos.x, pos.y, baseSize);
  }

  // Footer text
  const footerY = height * (1 - layout.footerHeight * 0.4);
  ctx.fillStyle = theme.textColor;
  ctx.textAlign = "center";
  const textSize = Math.max(14, Math.round(width * 0.045));
  ctx.font = fontForStyle(theme.fontStyle, textSize);

  const lines: string[] = [];
  if (theme.customText.trim()) lines.push(theme.customText.trim());
  if (theme.dateStamp) lines.push(formatBoothDate(opts.date));

  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, footerY + i * (textSize + 4));
  });

  if (theme.filmGrain || theme.background.pattern === "grain" || theme.background.pattern === "paper") {
    drawFilmGrain(ctx, width, height, theme.filmGrainIntensity || 0.25);
  }

  return canvas;
}

export async function renderStripToCanvas(
  strip: PhotoStrip,
  photos: Photo[],
  opts: RenderOptions = {},
): Promise<HTMLCanvasElement> {
  const single = await renderSingleStrip(strip, photos, opts);
  if (!opts.doublePrint) return single;

  // Two copies side by side like a real booth print
  const gap = 24;
  const canvas = document.createElement("canvas");
  canvas.width = single.width * 2 + gap;
  canvas.height = single.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return single;
  ctx.fillStyle = "#F5EDE0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(single, 0, 0);
  ctx.drawImage(single, single.width + gap, 0);
  return canvas;
}

export async function exportStripBlob(
  strip: PhotoStrip,
  photos: Photo[],
  format: "png" | "jpg",
  opts: RenderOptions = {},
): Promise<Blob> {
  const canvas = await renderStripToCanvas(strip, photos, opts);
  const type = format === "png" ? "image/png" : "image/jpeg";
  const quality = format === "jpg" ? 0.92 : undefined;
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
      type,
      quality,
    );
  });
}
