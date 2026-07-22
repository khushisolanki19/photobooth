import type { DecorationItem, StripLayout } from "../types";

/** Safe positions that sit in margins / between frames, not over face centers */
export function resolveDecorationPosition(
  item: DecorationItem,
  layout: StripLayout,
  width: number,
  height: number,
): { x: number; y: number } {
  const m = layout.safeMargin;
  const footerY = height * (1 - layout.footerHeight * 0.55);
  const ox = (item.offsetX ?? 0) * width;
  const oy = (item.offsetY ?? 0) * height;

  const map: Record<string, { x: number; y: number }> = {
    "strip-tl": { x: width * m, y: height * m },
    "strip-tr": { x: width * (1 - m), y: height * m },
    "strip-bl": { x: width * m, y: footerY },
    "strip-br": { x: width * (1 - m), y: footerY },
    "strip-top": { x: width * 0.5, y: height * (m * 0.8) },
    "strip-bottom": { x: width * 0.5, y: height * (1 - layout.footerHeight * 0.35) },
    "between-photos": {
      x: width * 0.5,
      y: height * (layout.frames[0] ? layout.frames[0].y + layout.frames[0].h + 0.01 : 0.25),
    },
    footer: { x: width * 0.5, y: footerY },
    "margin-left": { x: width * (m * 0.45), y: height * 0.45 },
    "margin-right": { x: width * (1 - m * 0.45), y: height * 0.45 },
  };

  const base = map[item.anchor] ?? map["strip-tl"];
  return { x: base.x + ox, y: base.y + oy };
}

function poly(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
  fill: string,
) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function drawDecoration(
  ctx: CanvasRenderingContext2D,
  item: DecorationItem,
  x: number,
  y: number,
  baseSize: number,
) {
  if (!item.enabled) return;
  const s = baseSize * item.size;
  const color = item.color ?? "#E85A7A";
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(((item.rotation ?? 0) * Math.PI) / 180);

  switch (item.kind) {
    case "heart": {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s * 0.9, s * 0.35, 0, s * 0.95);
      ctx.bezierCurveTo(s * 0.9, s * 0.35, s * 0.5, -s * 0.3, 0, s * 0.3);
      ctx.fill();
      break;
    }
    case "star": {
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? s : s * 0.4;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "bow": {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(-s * 0.45, 0, s * 0.4, s * 0.28, 0, 0, Math.PI * 2);
      ctx.ellipse(s * 0.45, 0, s * 0.4, s * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-s * 0.15, -s * 0.2, s * 0.3, s * 0.4);
      break;
    }
    case "sparkle": {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1.5, s * 0.12);
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(0, s);
      ctx.moveTo(-s, 0);
      ctx.lineTo(s, 0);
      ctx.moveTo(-s * 0.65, -s * 0.65);
      ctx.lineTo(s * 0.65, s * 0.65);
      ctx.moveTo(s * 0.65, -s * 0.65);
      ctx.lineTo(-s * 0.65, s * 0.65);
      ctx.stroke();
      break;
    }
    case "flower": {
      ctx.fillStyle = color;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.ellipse(
          Math.cos(a) * s * 0.35,
          Math.sin(a) * s * 0.35,
          s * 0.28,
          s * 0.18,
          a,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = "#FFE8A0";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "cloud": {
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(-s * 0.35, 0, s * 0.35, 0, Math.PI * 2);
      ctx.arc(0, -s * 0.15, s * 0.4, 0, Math.PI * 2);
      ctx.arc(s * 0.35, 0, s * 0.32, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "cherry": {
      ctx.fillStyle = "#E03040";
      ctx.beginPath();
      ctx.arc(-s * 0.25, s * 0.15, s * 0.32, 0, Math.PI * 2);
      ctx.arc(s * 0.28, s * 0.2, s * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3A8A3A";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-s * 0.25, -s * 0.1);
      ctx.quadraticCurveTo(0, -s * 0.7, s * 0.28, -s * 0.05);
      ctx.stroke();
      break;
    }
    case "smile": {
      ctx.fillStyle = "#FFD06A";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2A241C";
      ctx.beginPath();
      ctx.arc(-s * 0.22, -s * 0.1, s * 0.08, 0, Math.PI * 2);
      ctx.arc(s * 0.22, -s * 0.1, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2A241C";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, s * 0.05, s * 0.35, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      break;
    }
    case "tape": {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.75;
      ctx.rotate(-0.25);
      ctx.fillRect(-s, -s * 0.22, s * 2, s * 0.44);
      ctx.globalAlpha = 1;
      break;
    }
    case "doodle": {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-s * 0.6, s * 0.2);
      ctx.quadraticCurveTo(0, -s, s * 0.6, s * 0.2);
      ctx.stroke();
      break;
    }
    case "confetti": {
      const colors = ["#FF6B8A", "#FFD93D", "#6BCBFF", "#6BCB77", "#C080FF"];
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = colors[i % colors.length];
        const px = (Math.sin(i * 2.1) * s) / 1.2;
        const py = (Math.cos(i * 1.7) * s) / 1.2;
        ctx.fillRect(px, py, s * 0.18, s * 0.12);
      }
      break;
    }
    case "balloon": {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.15, s * 0.45, s * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.4);
      ctx.quadraticCurveTo(s * 0.15, s * 0.8, 0, s);
      ctx.stroke();
      break;
    }
    case "cake": {
      ctx.fillStyle = "#F5D0C0";
      ctx.fillRect(-s * 0.55, -s * 0.1, s * 1.1, s * 0.7);
      ctx.fillStyle = "#FF8AAB";
      ctx.fillRect(-s * 0.6, -s * 0.25, s * 1.2, s * 0.2);
      ctx.fillStyle = "#FFD06A";
      ctx.fillRect(-s * 0.08, -s * 0.55, s * 0.16, s * 0.3);
      ctx.beginPath();
      ctx.arc(0, -s * 0.6, s * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = "#FF6B3A";
      ctx.fill();
      break;
    }
    case "disco": {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
      g.addColorStop(0, "#FFFFFF");
      g.addColorStop(0.4, "#C0C8D8");
      g.addColorStop(1, "#6A7080");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(0, i * s * 0.2, s * 0.65, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case "sprocket": {
      ctx.fillStyle = "#1A1410";
      const count = 8;
      for (let i = 0; i < count; i++) {
        const yy = ((i - count / 2) * s * 0.55) / 2;
        ctx.fillRect(-s * 0.25, yy, s * 0.5, s * 0.22);
      }
      break;
    }
    case "checker": {
      const cell = s * 0.35;
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? "#1A1410" : "#F4E8C8";
          ctx.fillRect(c * cell - 2 * cell, r * cell - cell, cell, cell);
        }
      }
      break;
    }
    case "wave": {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.quadraticCurveTo(-s * 0.5, -s * 0.5, 0, 0);
      ctx.quadraticCurveTo(s * 0.5, s * 0.5, s, 0);
      ctx.stroke();
      break;
    }
    case "leaf": {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.35, s * 0.7, -0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "snowflake": {
      ctx.strokeStyle = "#A0C4E0";
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.7);
        ctx.lineTo(0, s * 0.7);
        ctx.stroke();
      }
      break;
    }
    case "pumpkin": {
      ctx.fillStyle = "#FF7A1A";
      ctx.beginPath();
      ctx.ellipse(0, s * 0.1, s * 0.65, s * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3A8A3A";
      ctx.fillRect(-s * 0.08, -s * 0.55, s * 0.16, s * 0.25);
      break;
    }
    case "tree": {
      poly(
        ctx,
        [
          [0, -s * 0.8],
          [s * 0.55, s * 0.15],
          [-s * 0.55, s * 0.15],
        ],
        "#2A7A40",
      );
      poly(
        ctx,
        [
          [0, -s * 0.45],
          [s * 0.45, s * 0.45],
          [-s * 0.45, s * 0.45],
        ],
        "#3A9A50",
      );
      ctx.fillStyle = "#8B5A2A";
      ctx.fillRect(-s * 0.12, s * 0.4, s * 0.24, s * 0.35);
      break;
    }
    case "hearts-cluster": {
      const drawMini = (dx: number, dy: number, sc: number) => {
        ctx.save();
        ctx.translate(dx, dy);
        ctx.scale(sc, sc);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.15);
        ctx.bezierCurveTo(-s * 0.4, -s * 0.25, -s * 0.7, s * 0.25, 0, s * 0.7);
        ctx.bezierCurveTo(s * 0.7, s * 0.25, s * 0.4, -s * 0.25, 0, s * 0.15);
        ctx.fill();
        ctx.restore();
      };
      drawMini(0, 0, 1);
      drawMini(-s * 0.55, -s * 0.2, 0.6);
      drawMini(s * 0.5, s * 0.1, 0.55);
      break;
    }
    case "besties": {
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.round(s * 0.7)}px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Besties", 0, 0);
      break;
    }
    case "moon": {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(s * 0.28, -s * 0.1, s * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      break;
    }
    case "butterfly": {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(-s * 0.35, -s * 0.1, s * 0.35, s * 0.5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(s * 0.35, -s * 0.1, s * 0.35, s * 0.5, 0.4, 0, Math.PI * 2);
      ctx.ellipse(-s * 0.3, s * 0.25, s * 0.28, s * 0.35, -0.2, 0, Math.PI * 2);
      ctx.ellipse(s * 0.3, s * 0.25, s * 0.28, s * 0.35, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2A241C";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.4);
      ctx.lineTo(0, s * 0.45);
      ctx.stroke();
      break;
    }
    case "crown": {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-s * 0.7, s * 0.35);
      ctx.lineTo(-s * 0.7, -s * 0.1);
      ctx.lineTo(-s * 0.35, s * 0.15);
      ctx.lineTo(0, -s * 0.45);
      ctx.lineTo(s * 0.35, s * 0.15);
      ctx.lineTo(s * 0.7, -s * 0.1);
      ctx.lineTo(s * 0.7, s * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -s * 0.5, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "music": {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(s * 0.15, s * 0.35, s * 0.28, s * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(s * 0.28, -s * 0.55, s * 0.12, s * 0.9);
      ctx.beginPath();
      ctx.moveTo(s * 0.4, -s * 0.55);
      ctx.quadraticCurveTo(s * 0.85, -s * 0.35, s * 0.7, s * 0.05);
      ctx.lineTo(s * 0.4, -s * 0.05);
      ctx.fill();
      break;
    }
    case "icecream": {
      ctx.fillStyle = "#F5C090";
      ctx.beginPath();
      ctx.moveTo(-s * 0.35, s * 0.05);
      ctx.lineTo(0, s * 0.85);
      ctx.lineTo(s * 0.35, s * 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = color || "#FF9AC8";
      ctx.beginPath();
      ctx.arc(0, -s * 0.15, s * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFD06A";
      ctx.beginPath();
      ctx.arc(-s * 0.15, -s * 0.35, s * 0.28, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "lightning": {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(s * 0.15, -s * 0.85);
      ctx.lineTo(-s * 0.35, s * 0.05);
      ctx.lineTo(s * 0.05, s * 0.05);
      ctx.lineTo(-s * 0.15, s * 0.85);
      ctx.lineTo(s * 0.4, -s * 0.1);
      ctx.lineTo(s * 0.05, -s * 0.1);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "diya": {
      ctx.fillStyle = "#C45C26";
      ctx.beginPath();
      ctx.ellipse(0, s * 0.25, s * 0.7, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#E07030";
      ctx.beginPath();
      ctx.ellipse(0, s * 0.15, s * 0.55, s * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      // Flame
      const flame = ctx.createRadialGradient(0, -s * 0.25, 0, 0, -s * 0.2, s * 0.45);
      flame.addColorStop(0, "#FFF4A0");
      flame.addColorStop(0.45, "#FFB020");
      flame.addColorStop(1, "rgba(255,100,20,0)");
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.7);
      ctx.quadraticCurveTo(s * 0.28, -s * 0.25, 0, s * 0.05);
      ctx.quadraticCurveTo(-s * 0.28, -s * 0.25, 0, -s * 0.7);
      ctx.fill();
      break;
    }
    case "sparkler": {
      ctx.strokeStyle = "#C8A060";
      ctx.lineWidth = Math.max(2, s * 0.1);
      ctx.beginPath();
      ctx.moveTo(0, s * 0.75);
      ctx.lineTo(0, -s * 0.05);
      ctx.stroke();
      const sparks = color || "#FFE8A0";
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const len = s * (0.35 + (i % 3) * 0.12);
        ctx.strokeStyle = i % 2 === 0 ? sparks : "#FFD060";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.1);
        ctx.lineTo(Math.cos(a) * len, -s * 0.1 + Math.sin(a) * len);
        ctx.stroke();
      }
      ctx.fillStyle = "#FFF8C0";
      ctx.beginPath();
      ctx.arc(0, -s * 0.1, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "rangoli": {
      const colors = ["#E04060", "#FF9A20", "#40A0E0", "#50C070", "#C040E0"];
      for (let ring = 3; ring >= 1; ring--) {
        ctx.strokeStyle = colors[ring % colors.length];
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.22 * ring, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.ellipse(
          Math.cos(a) * s * 0.55,
          Math.sin(a) * s * 0.55,
          s * 0.16,
          s * 0.1,
          a,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = "#FFD060";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "lotus": {
      ctx.fillStyle = color || "#F0A0C8";
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.ellipse(
          Math.cos(a) * s * 0.22,
          Math.sin(a) * s * 0.18,
          s * 0.22,
          s * 0.4,
          a,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = "#FFE8A0";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "marigold": {
      ctx.fillStyle = color || "#FF9A20";
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(
          Math.cos(a) * s * 0.28,
          Math.sin(a) * s * 0.28,
          s * 0.22,
          s * 0.14,
          a,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = "#FFE060";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default:
      break;
  }

  ctx.restore();
}

export function drawFilmGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number,
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const amount = Math.floor(intensity * 40);
  for (let i = 0; i < data.length; i += 16) {
    const n = (Math.random() - 0.5) * amount;
    data[i] = Math.min(255, Math.max(0, data[i] + n));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
  }
  ctx.putImageData(imageData, 0, 0);
}

export function cssFilterForPreset(preset: string): string {
  switch (preset) {
    case "bw":
      return "grayscale(1) contrast(1.05)";
    case "sepia":
      return "sepia(0.85) contrast(1.05)";
    case "warm":
      return "sepia(0.25) saturate(1.15) contrast(1.05)";
    case "faded":
      return "contrast(0.9) brightness(1.08) saturate(0.85)";
    default:
      return "none";
  }
}
