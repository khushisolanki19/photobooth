import type { DecorationKind, StripThemeConfig } from "../types";
import { uid } from "../utils";
import { STRIP_THEMES, themeToConfig } from "./catalog";

const PALETTES = [
  { bg: "#FFE4EF", border: "#E87A9A", text: "#8B3A55", accent: "#F2A0B8" },
  { bg: "#E8F0FF", border: "#6BA3D4", text: "#1F2A4A", accent: "#FF6BCB" },
  { bg: "#EFE4D0", border: "#5C4030", text: "#3A3228", accent: "#8B5E3C" },
  { bg: "#1A1030", border: "#D4AF37", text: "#FFE8A0", accent: "#FF70C0" },
  { bg: "#FFF5E8", border: "#FF8A65", text: "#8A3A2A", accent: "#FFD93D" },
  { bg: "#F0FAF0", border: "#8FBF8F", text: "#3A6A4A", accent: "#F0A0C0" },
  { bg: "#14110F", border: "#F5EDE0", text: "#F5EDE0", accent: "#C45C5C" },
];

const DECOR_SETS: DecorationKind[][] = [
  ["bow", "heart", "heart"],
  ["star", "sparkle", "star"],
  ["flower", "cherry", "smile"],
  ["tape", "doodle", "star"],
  ["disco", "star", "sparkle"],
  ["balloon", "confetti", "cake"],
  ["cloud", "flower", "smile"],
  ["butterfly", "sparkle", "moon"],
  ["crown", "sparkle", "star"],
  ["lightning", "star", "music"],
  ["icecream", "cloud", "smile"],
  ["diya", "sparkler", "star"],
  ["sparkler", "sparkle", "heart"],
  ["rangoli", "marigold", "lotus"],
  ["lotus", "diya", "sparkle"],
];

const ANCHORS = [
  "strip-tl",
  "strip-tr",
  "strip-bl",
  "strip-br",
  "strip-top",
  "footer",
] as const;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Random visually coherent strip design */
export function surpriseTheme(): StripThemeConfig {
  const usePreset = Math.random() > 0.35;
  if (usePreset) {
    const preset = pick(STRIP_THEMES.filter((t) => t.id !== "custom"));
    const config = themeToConfig(preset);
    if (Math.random() > 0.5) {
      config.customText = pick([
        "Girls Night",
        "Besties",
        "xoxo",
        "Party!",
        "Film Club",
        "Y2K",
        "",
      ]);
    }
    config.filmGrain = Math.random() > 0.55 ? config.filmGrain : Math.random() > 0.5;
    return config;
  }

  const palette = pick(PALETTES);
  const decorKinds = pick(DECOR_SETS);
  const fonts = ["classic", "handwritten", "display", "typewriter", "modern"] as const;
  const borders = ["thin", "thick", "dashed", "scalloped", "chrome", "ribbon"] as const;
  const filters = ["none", "warm", "faded", "sepia"] as const;

  return {
    themeId: "custom",
    background: {
      color: palette.bg,
      pattern: pick(["none", "dots", "grain", "stars", "paper"]),
      patternOpacity: 0.2 + Math.random() * 0.25,
      secondaryColor: palette.accent,
    },
    borderStyle: pick([...borders]),
    borderColor: palette.border,
    photoFrameStyle: pick(["thin", "rounded", "polaroid", "sticker"]),
    photoCornerRadius: pick([0, 6, 10, 14]),
    decorations: decorKinds.map((kind, i) => ({
      id: uid("dec"),
      kind,
      enabled: true,
      anchor: ANCHORS[i % ANCHORS.length],
      size: 0.75 + Math.random() * 0.35,
      color: palette.accent,
      rotation: (Math.random() - 0.5) * 20,
    })),
    fontStyle: pick([...fonts]),
    textColor: palette.text,
    filterPreset: pick([...filters]),
    filmGrain: Math.random() > 0.6,
    filmGrainIntensity: 0.2 + Math.random() * 0.25,
    dateStamp: Math.random() > 0.3,
    customText: pick(["", "Surprise!", "Besties", "Tonight", "Smile"]),
    showNames: false,
  };
}
