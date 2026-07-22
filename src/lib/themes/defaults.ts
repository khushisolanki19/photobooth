import type { StripThemeConfig } from "../types";
import { uid } from "../utils";

export function createDefaultThemeConfig(
  themeId = "classic-white",
): StripThemeConfig {
  return {
    themeId,
    background: { color: "#FFFAF2", pattern: "none", patternOpacity: 0.15 },
    borderStyle: "thin",
    borderColor: "#1A1410",
    photoFrameStyle: "thin",
    photoCornerRadius: 0,
    decorations: [],
    fontStyle: "classic",
    textColor: "#1A1410",
    filterPreset: "none",
    filmGrain: false,
    filmGrainIntensity: 0.25,
    dateStamp: true,
    customText: "",
    showNames: false,
  };
}

export function decorationsFromPreset(
  items: Omit<
    StripThemeConfig["decorations"][number],
    "id" | "enabled"
  >[],
): StripThemeConfig["decorations"] {
  return items.map((d) => ({
    ...d,
    id: uid("dec"),
    enabled: true,
  }));
}
