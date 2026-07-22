"use client";

import { resolveDecorationPosition } from "@/lib/canvas/decorations";
import type { DecorationItem, StripLayout } from "@/lib/types";

export function DecorationsLayer({
  decorations,
  layout,
  width,
  height,
}: {
  decorations: DecorationItem[];
  layout: StripLayout;
  width: number;
  height: number;
}) {
  const base = Math.min(width, height) * 0.06;
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
    >
      {decorations
        .filter((d) => d.enabled)
        .map((d) => {
          const pos = resolveDecorationPosition(d, layout, width, height);
          return (
            <g
              key={d.id}
              transform={`translate(${pos.x} ${pos.y}) rotate(${d.rotation ?? 0})`}
            >
              <DecorationGlyph kind={d.kind} size={base * d.size} color={d.color} />
            </g>
          );
        })}
    </svg>
  );
}

function DecorationGlyph({
  kind,
  size,
  color = "#E85A7A",
}: {
  kind: DecorationItem["kind"];
  size: number;
  color?: string;
}) {
  const s = size;
  switch (kind) {
    case "heart":
      return (
        <path
          d={`M0 ${s * 0.3} C ${-s * 0.5} ${-s * 0.3}, ${-s * 0.9} ${s * 0.35}, 0 ${s * 0.95} C ${s * 0.9} ${s * 0.35}, ${s * 0.5} ${-s * 0.3}, 0 ${s * 0.3}Z`}
          fill={color}
        />
      );
    case "star":
      return (
        <polygon
          fill={color}
          points={Array.from({ length: 10 }, (_, i) => {
            const a = (i * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? s : s * 0.4;
            return `${Math.cos(a) * r},${Math.sin(a) * r}`;
          }).join(" ")}
        />
      );
    case "bow":
      return (
        <g fill={color}>
          <ellipse cx={-s * 0.45} cy={0} rx={s * 0.4} ry={s * 0.28} />
          <ellipse cx={s * 0.45} cy={0} rx={s * 0.4} ry={s * 0.28} />
          <rect x={-s * 0.15} y={-s * 0.2} width={s * 0.3} height={s * 0.4} />
        </g>
      );
    case "sparkle":
      return (
        <g stroke={color} strokeWidth={Math.max(1.5, s * 0.12)}>
          <line x1={0} y1={-s} x2={0} y2={s} />
          <line x1={-s} y1={0} x2={s} y2={0} />
          <line x1={-s * 0.65} y1={-s * 0.65} x2={s * 0.65} y2={s * 0.65} />
          <line x1={s * 0.65} y1={-s * 0.65} x2={-s * 0.65} y2={s * 0.65} />
        </g>
      );
    case "flower":
      return (
        <g>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i * Math.PI) / 3;
            return (
              <ellipse
                key={i}
                cx={Math.cos(a) * s * 0.35}
                cy={Math.sin(a) * s * 0.35}
                rx={s * 0.28}
                ry={s * 0.18}
                transform={`rotate(${(a * 180) / Math.PI})`}
                fill={color}
              />
            );
          })}
          <circle r={s * 0.2} fill="#FFE8A0" />
        </g>
      );
    case "cloud":
      return (
        <g fill="#fff">
          <circle cx={-s * 0.35} cy={0} r={s * 0.35} />
          <circle cx={0} cy={-s * 0.15} r={s * 0.4} />
          <circle cx={s * 0.35} cy={0} r={s * 0.32} />
        </g>
      );
    case "cherry":
      return (
        <g>
          <circle cx={-s * 0.25} cy={s * 0.15} r={s * 0.32} fill="#E03040" />
          <circle cx={s * 0.28} cy={s * 0.2} r={s * 0.3} fill="#E03040" />
          <path
            d={`M${-s * 0.25} ${-s * 0.1} Q 0 ${-s * 0.7} ${s * 0.28} ${-s * 0.05}`}
            stroke="#3A8A3A"
            strokeWidth={2}
            fill="none"
          />
        </g>
      );
    case "smile":
      return (
        <g>
          <circle r={s * 0.7} fill="#FFD06A" />
          <circle cx={-s * 0.22} cy={-s * 0.1} r={s * 0.08} fill="#2A241C" />
          <circle cx={s * 0.22} cy={-s * 0.1} r={s * 0.08} fill="#2A241C" />
          <path
            d={`M${-s * 0.3} ${s * 0.15} Q 0 ${s * 0.45} ${s * 0.3} ${s * 0.15}`}
            stroke="#2A241C"
            strokeWidth={2}
            fill="none"
          />
        </g>
      );
    case "tape":
      return (
        <rect
          x={-s}
          y={-s * 0.22}
          width={s * 2}
          height={s * 0.44}
          fill={color}
          opacity={0.75}
          transform="rotate(-14)"
        />
      );
    case "balloon":
      return (
        <g>
          <ellipse cx={0} cy={-s * 0.15} rx={s * 0.45} ry={s * 0.55} fill={color} />
          <path
            d={`M0 ${s * 0.4} Q ${s * 0.15} ${s * 0.8} 0 ${s}`}
            stroke="#666"
            fill="none"
          />
        </g>
      );
    case "cake":
      return (
        <g>
          <rect x={-s * 0.55} y={-s * 0.1} width={s * 1.1} height={s * 0.7} fill="#F5D0C0" />
          <rect x={-s * 0.6} y={-s * 0.25} width={s * 1.2} height={s * 0.2} fill="#FF8AAB" />
          <rect x={-s * 0.08} y={-s * 0.55} width={s * 0.16} height={s * 0.3} fill="#FFD06A" />
          <circle cy={-s * 0.6} r={s * 0.1} fill="#FF6B3A" />
        </g>
      );
    case "disco":
      return (
        <circle r={s * 0.75} fill="url(#discoGrad)">
          <title>disco</title>
        </circle>
      );
    case "confetti":
      return (
        <g>
          {["#FF6B8A", "#FFD93D", "#6BCBFF", "#6BCB77"].map((c, i) => (
            <rect
              key={i}
              x={Math.sin(i * 2) * s * 0.5}
              y={Math.cos(i * 1.5) * s * 0.5}
              width={s * 0.18}
              height={s * 0.12}
              fill={c}
              transform={`rotate(${i * 20})`}
            />
          ))}
        </g>
      );
    case "besties":
      return (
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={s * 0.7}
          fontFamily="Georgia, serif"
          fontWeight="700"
        >
          Besties
        </text>
      );
    case "snowflake":
      return (
        <g stroke="#A0C4E0" strokeWidth={2}>
          <line x1={0} y1={-s * 0.7} x2={0} y2={s * 0.7} />
          <line x1={-s * 0.6} y1={-s * 0.35} x2={s * 0.6} y2={s * 0.35} />
          <line x1={s * 0.6} y1={-s * 0.35} x2={-s * 0.6} y2={s * 0.35} />
        </g>
      );
    case "leaf":
      return (
        <ellipse
          rx={s * 0.35}
          ry={s * 0.7}
          fill={color}
          transform="rotate(-20)"
        />
      );
    case "pumpkin":
      return (
        <g>
          <ellipse cy={s * 0.1} rx={s * 0.65} ry={s * 0.55} fill="#FF7A1A" />
          <rect x={-s * 0.08} y={-s * 0.55} width={s * 0.16} height={s * 0.25} fill="#3A8A3A" />
        </g>
      );
    case "tree":
      return (
        <g>
          <polygon points={`0,${-s * 0.8} ${s * 0.55},${s * 0.15} ${-s * 0.55},${s * 0.15}`} fill="#2A7A40" />
          <rect x={-s * 0.12} y={s * 0.4} width={s * 0.24} height={s * 0.35} fill="#8B5A2A" />
        </g>
      );
    case "hearts-cluster":
      return (
        <g fill={color}>
          <path d={`M0 ${s * 0.15} C ${-s * 0.4} ${-s * 0.25}, ${-s * 0.7} ${s * 0.25}, 0 ${s * 0.7} C ${s * 0.7} ${s * 0.25}, ${s * 0.4} ${-s * 0.25}, 0 ${s * 0.15}Z`} />
        </g>
      );
    case "sprocket":
      return (
        <g fill="#1A1410">
          {Array.from({ length: 6 }, (_, i) => (
            <rect
              key={i}
              x={-s * 0.2}
              y={((i - 2.5) * s * 0.35)}
              width={s * 0.4}
              height={s * 0.18}
            />
          ))}
        </g>
      );
    case "wave":
      return (
        <path
          d={`M${-s} 0 Q ${-s * 0.5} ${-s * 0.5} 0 0 Q ${s * 0.5} ${s * 0.5} ${s} 0`}
          stroke={color}
          strokeWidth={3}
          fill="none"
        />
      );
    case "checker":
      return (
        <g>
          {[0, 1].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={c * s * 0.35 - s * 0.7}
                y={r * s * 0.35 - s * 0.35}
                width={s * 0.35}
                height={s * 0.35}
                fill={(r + c) % 2 === 0 ? "#1A1410" : "#F4E8C8"}
              />
            )),
          )}
        </g>
      );
    case "doodle":
      return (
        <path
          d={`M${-s * 0.6} ${s * 0.2} Q 0 ${-s} ${s * 0.6} ${s * 0.2}`}
          stroke={color}
          strokeWidth={2}
          fill="none"
        />
      );
    case "moon":
      return (
        <g>
          <circle r={s * 0.7} fill={color} />
          <circle cx={s * 0.28} cy={-s * 0.1} r={s * 0.55} fill="#1a1420" opacity={0.85} />
        </g>
      );
    case "butterfly":
      return (
        <g>
          <ellipse cx={-s * 0.35} cy={-s * 0.1} rx={s * 0.35} ry={s * 0.5} transform="rotate(-20)" fill={color} />
          <ellipse cx={s * 0.35} cy={-s * 0.1} rx={s * 0.35} ry={s * 0.5} transform="rotate(20)" fill={color} />
          <ellipse cx={-s * 0.3} cy={s * 0.25} rx={s * 0.28} ry={s * 0.35} fill={color} opacity={0.9} />
          <ellipse cx={s * 0.3} cy={s * 0.25} rx={s * 0.28} ry={s * 0.35} fill={color} opacity={0.9} />
          <line x1={0} y1={-s * 0.4} x2={0} y2={s * 0.45} stroke="#2A241C" strokeWidth={1.5} />
        </g>
      );
    case "crown":
      return (
        <g fill={color}>
          <polygon
            points={`${-s * 0.7},${s * 0.35} ${-s * 0.7},${-s * 0.1} ${-s * 0.35},${s * 0.15} 0,${-s * 0.45} ${s * 0.35},${s * 0.15} ${s * 0.7},${-s * 0.1} ${s * 0.7},${s * 0.35}`}
          />
          <circle cy={-s * 0.5} r={s * 0.12} />
        </g>
      );
    case "music":
      return (
        <g fill={color}>
          <ellipse cx={s * 0.15} cy={s * 0.35} rx={s * 0.28} ry={s * 0.2} transform="rotate(-15)" />
          <rect x={s * 0.28} y={-s * 0.55} width={s * 0.12} height={s * 0.9} />
          <path d={`M${s * 0.4} ${-s * 0.55} Q ${s * 0.85} ${-s * 0.35} ${s * 0.7} ${s * 0.05} L ${s * 0.4} ${-s * 0.05} Z`} />
        </g>
      );
    case "icecream":
      return (
        <g>
          <polygon
            points={`${-s * 0.35},${s * 0.05} 0,${s * 0.85} ${s * 0.35},${s * 0.05}`}
            fill="#F5C090"
          />
          <circle cy={-s * 0.15} r={s * 0.42} fill={color} />
          <circle cx={-s * 0.15} cy={-s * 0.35} r={s * 0.28} fill="#FFD06A" />
        </g>
      );
    case "lightning":
      return (
        <polygon
          fill={color}
          points={`${s * 0.15},${-s * 0.85} ${-s * 0.35},${s * 0.05} ${s * 0.05},${s * 0.05} ${-s * 0.15},${s * 0.85} ${s * 0.4},${-s * 0.1} ${s * 0.05},${-s * 0.1}`}
        />
      );
    case "diya":
      return (
        <g>
          <ellipse cx={0} cy={s * 0.25} rx={s * 0.7} ry={s * 0.35} fill="#C45C26" />
          <ellipse cx={0} cy={s * 0.15} rx={s * 0.55} ry={s * 0.22} fill="#E07030" />
          <path
            d={`M0 ${-s * 0.7} Q ${s * 0.28} ${-s * 0.25} 0 ${s * 0.05} Q ${-s * 0.28} ${-s * 0.25} 0 ${-s * 0.7}Z`}
            fill="#FFB020"
          />
          <ellipse cx={0} cy={-s * 0.35} rx={s * 0.1} ry={s * 0.18} fill="#FFF4A0" />
        </g>
      );
    case "sparkler":
      return (
        <g>
          <line
            x1={0}
            y1={s * 0.75}
            x2={0}
            y2={-s * 0.05}
            stroke="#C8A060"
            strokeWidth={Math.max(2, s * 0.1)}
          />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const len = s * (0.35 + (i % 3) * 0.12);
            return (
              <line
                key={i}
                x1={0}
                y1={-s * 0.1}
                x2={Math.cos(a) * len}
                y2={-s * 0.1 + Math.sin(a) * len}
                stroke={i % 2 === 0 ? color : "#FFD060"}
                strokeWidth={1.6}
              />
            );
          })}
          <circle cx={0} cy={-s * 0.1} r={s * 0.12} fill="#FFF8C0" />
        </g>
      );
    case "rangoli":
      return (
        <g>
          {[3, 2, 1].map((ring) => (
            <circle
              key={ring}
              r={s * 0.22 * ring}
              fill="none"
              stroke={["#E04060", "#FF9A20", "#40A0E0"][ring % 3]}
              strokeWidth={2.5}
            />
          ))}
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const cols = ["#E04060", "#FF9A20", "#40A0E0", "#50C070"];
            return (
              <ellipse
                key={i}
                cx={Math.cos(a) * s * 0.55}
                cy={Math.sin(a) * s * 0.55}
                rx={s * 0.16}
                ry={s * 0.1}
                transform={`rotate(${(a * 180) / Math.PI})`}
                fill={cols[i % cols.length]}
              />
            );
          })}
          <circle r={s * 0.14} fill="#FFD060" />
        </g>
      );
    case "lotus":
      return (
        <g>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
            return (
              <ellipse
                key={i}
                cx={Math.cos(a) * s * 0.22}
                cy={Math.sin(a) * s * 0.18}
                rx={s * 0.22}
                ry={s * 0.4}
                transform={`rotate(${(a * 180) / Math.PI})`}
                fill={color}
              />
            );
          })}
          <circle r={s * 0.18} fill="#FFE8A0" />
        </g>
      );
    case "marigold":
      return (
        <g>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return (
              <ellipse
                key={i}
                cx={Math.cos(a) * s * 0.28}
                cy={Math.sin(a) * s * 0.28}
                rx={s * 0.22}
                ry={s * 0.14}
                transform={`rotate(${(a * 180) / Math.PI})`}
                fill={color}
              />
            );
          })}
          <circle r={s * 0.22} fill="#FFE060" />
        </g>
      );
    default:
      return <circle r={s * 0.3} fill={color} />;
  }
}
