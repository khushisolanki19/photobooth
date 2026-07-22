"use client";

import type {
  BorderStyle,
  DecorationKind,
  FontStyle,
  PhotoFrameStyle,
  StripThemeConfig,
} from "@/lib/types";
import { uid } from "@/lib/utils";

const DECOR_OPTIONS: { kind: DecorationKind; label: string }[] = [
  { kind: "heart", label: "Heart" },
  { kind: "star", label: "Star" },
  { kind: "bow", label: "Bow" },
  { kind: "sparkle", label: "Sparkle" },
  { kind: "flower", label: "Flower" },
  { kind: "cloud", label: "Cloud" },
  { kind: "cherry", label: "Cherry" },
  { kind: "smile", label: "Smile" },
  { kind: "tape", label: "Tape" },
  { kind: "confetti", label: "Confetti" },
  { kind: "balloon", label: "Balloon" },
  { kind: "disco", label: "Disco" },
  { kind: "sprocket", label: "Film holes" },
  { kind: "moon", label: "Moon" },
  { kind: "butterfly", label: "Butterfly" },
  { kind: "crown", label: "Crown" },
  { kind: "music", label: "Music" },
  { kind: "icecream", label: "Ice cream" },
  { kind: "lightning", label: "Lightning" },
];

const ANCHORS = [
  "strip-tl",
  "strip-tr",
  "strip-bl",
  "strip-br",
  "strip-top",
  "footer",
  "margin-left",
  "margin-right",
] as const;

const BG_PRESETS = [
  "#FFFAF2",
  "#14110F",
  "#EFE4D0",
  "#FFE4EF",
  "#E8F0FF",
  "#C45C5C",
  "#4A6FA5",
  "#FFF5E8",
];

export function EditDesignPanel({
  theme,
  onChange,
}: {
  theme: StripThemeConfig;
  onChange: (patch: Partial<StripThemeConfig>) => void;
}) {
  return (
    <div className="space-y-5 text-sm">
      <section>
        <h3 className="mb-2 font-semibold text-booth-ink">Strip color</h3>
        <div className="flex flex-wrap gap-2">
          {BG_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Background ${c}`}
              onClick={() =>
                onChange({ background: { ...theme.background, color: c } })
              }
              className="h-8 w-8 rounded-full border border-black/15"
              style={{ background: c }}
            />
          ))}
          <label className="flex h-8 items-center gap-2 rounded-full border border-black/10 bg-white px-2">
            <span className="text-xs text-booth-muted">Custom</span>
            <input
              type="color"
              value={theme.background.color}
              onChange={(e) =>
                onChange({
                  background: { ...theme.background, color: e.target.value },
                })
              }
              aria-label="Custom strip color"
            />
          </label>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-booth-muted">
            Border color
          </span>
          <input
            type="color"
            value={theme.borderColor}
            onChange={(e) => onChange({ borderColor: e.target.value })}
            className="h-9 w-full"
            aria-label="Border color"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-booth-muted">
            Text color
          </span>
          <input
            type="color"
            value={theme.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="h-9 w-full"
            aria-label="Text color"
          />
        </label>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-booth-muted">
            Border style
          </span>
          <select
            className="w-full rounded-lg border border-black/10 bg-white px-2 py-2"
            value={theme.borderStyle}
            onChange={(e) =>
              onChange({ borderStyle: e.target.value as BorderStyle })
            }
          >
            {[
              "none",
              "thin",
              "thick",
              "dashed",
              "double",
              "scalloped",
              "film",
              "chrome",
              "ribbon",
              "torn",
            ].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-booth-muted">
            Photo frame
          </span>
          <select
            className="w-full rounded-lg border border-black/10 bg-white px-2 py-2"
            value={theme.photoFrameStyle}
            onChange={(e) =>
              onChange({ photoFrameStyle: e.target.value as PhotoFrameStyle })
            }
          >
            {["none", "thin", "polaroid", "rounded", "vintage", "sticker"].map(
              (v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ),
            )}
          </select>
        </label>
      </section>

      <section>
        <label className="mb-1 block text-xs font-medium text-booth-muted">
          Corner radius: {theme.photoCornerRadius}px
        </label>
        <input
          type="range"
          min={0}
          max={20}
          value={theme.photoCornerRadius}
          onChange={(e) =>
            onChange({ photoCornerRadius: Number(e.target.value) })
          }
          className="w-full"
          aria-label="Photo corner radius"
        />
      </section>

      <section>
        <label className="mb-1 block text-xs font-medium text-booth-muted">
          Font style
        </label>
        <select
          className="w-full rounded-lg border border-black/10 bg-white px-2 py-2"
          value={theme.fontStyle}
          onChange={(e) => onChange({ fontStyle: e.target.value as FontStyle })}
        >
          {["classic", "modern", "handwritten", "typewriter", "display"].map(
            (v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ),
          )}
        </select>
      </section>

      <section>
        <label className="mb-1 block text-xs font-medium text-booth-muted">
          Custom text
        </label>
        <input
          type="text"
          value={theme.customText}
          onChange={(e) => onChange({ customText: e.target.value })}
          placeholder='e.g. "Girls Night"'
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2"
          aria-label="Custom footer text"
        />
      </section>

      <section className="flex flex-wrap gap-3">
        <Toggle
          label="Date stamp"
          checked={theme.dateStamp}
          onChange={(dateStamp) => onChange({ dateStamp })}
        />
        <Toggle
          label="Film grain"
          checked={theme.filmGrain}
          onChange={(filmGrain) => onChange({ filmGrain })}
        />
        <Toggle
          label="Show names"
          checked={theme.showNames}
          onChange={(showNames) => onChange({ showNames })}
        />
      </section>

      <section>
        <label className="mb-1 block text-xs font-medium text-booth-muted">
          Filter
        </label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["none", "None"],
              ["bw", "B&W"],
              ["sepia", "Sepia"],
              ["warm", "Warm"],
              ["faded", "Faded"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange({ filterPreset: id })}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                theme.filterPreset === id
                  ? "bg-booth-curtain text-white"
                  : "bg-booth-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-booth-ink">Decorations</h3>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {DECOR_OPTIONS.map((opt) => (
            <button
              key={opt.kind}
              type="button"
              className="rounded-full bg-booth-soft px-2.5 py-1 text-xs font-medium"
              onClick={() => {
                const item = {
                  id: uid("dec"),
                  kind: opt.kind,
                  enabled: true,
                  anchor: "strip-tl" as const,
                  size: 1,
                  color: theme.borderColor,
                };
                onChange({ decorations: [...theme.decorations, item] });
              }}
            >
              + {opt.label}
            </button>
          ))}
        </div>

        <ul className="space-y-2">
          {theme.decorations.map((d) => (
            <li
              key={d.id}
              className="rounded-lg border border-black/8 bg-white/70 p-2"
            >
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={d.enabled}
                    onChange={(e) =>
                      onChange({
                        decorations: theme.decorations.map((x) =>
                          x.id === d.id
                            ? { ...x, enabled: e.target.checked }
                            : x,
                        ),
                      })
                    }
                  />
                  {d.kind}
                </label>
                <button
                  type="button"
                  className="text-xs text-booth-curtain"
                  onClick={() =>
                    onChange({
                      decorations: theme.decorations.filter((x) => x.id !== d.id),
                    })
                  }
                >
                  Remove
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="text-[11px] text-booth-muted">
                  Position
                  <select
                    className="mt-0.5 w-full rounded border border-black/10 px-1 py-1"
                    value={d.anchor}
                    onChange={(e) =>
                      onChange({
                        decorations: theme.decorations.map((x) =>
                          x.id === d.id
                            ? {
                                ...x,
                                anchor: e.target.value as (typeof ANCHORS)[number],
                              }
                            : x,
                        ),
                      })
                    }
                  >
                    {ANCHORS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-[11px] text-booth-muted">
                  Size {d.size.toFixed(1)}
                  <input
                    type="range"
                    min={0.5}
                    max={1.6}
                    step={0.1}
                    value={d.size}
                    className="mt-0.5 w-full"
                    onChange={(e) =>
                      onChange({
                        decorations: theme.decorations.map((x) =>
                          x.id === d.id
                            ? { ...x, size: Number(e.target.value) }
                            : x,
                        ),
                      })
                    }
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
