"use client";

import { THEME_CATEGORIES, STRIP_THEMES } from "@/lib/themes/catalog";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export function ThemePicker({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (themeId: string) => void;
}) {
  const [category, setCategory] = useState<string>("Classic Photo Booth");
  const themes = useMemo(
    () => STRIP_THEMES.filter((t) => t.category === category),
    [category],
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {THEME_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
              category === cat
                ? "bg-booth-curtain text-booth-ivory"
                : "bg-booth-soft text-booth-ink",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {themes.map((theme) => {
          const selected = theme.id === selectedId;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelect(theme.id)}
              aria-pressed={selected}
              aria-label={`Apply ${theme.name} theme`}
              className={cn(
                "overflow-hidden rounded-lg border text-left transition",
                selected
                  ? "border-booth-curtain ring-2 ring-booth-curtain/40"
                  : "border-black/10 hover:border-booth-curtain/40",
              )}
            >
              <div
                className="relative h-16 w-full"
                style={{
                  background: `linear-gradient(145deg, ${theme.preview.swatch}, ${theme.preview.accent}88)`,
                }}
              >
                <div className="absolute inset-x-3 top-2 bottom-5 flex flex-col gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-[1px]"
                      style={{ background: theme.preview.accent, opacity: 0.35 + i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-white/80 px-2 py-1.5">
                <p className="truncate text-[11px] font-semibold text-booth-ink">
                  {theme.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
