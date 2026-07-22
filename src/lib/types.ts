export type FilterPreset =
  | "none"
  | "bw"
  | "sepia"
  | "warm"
  | "faded";

export type FontStyle =
  | "classic"
  | "modern"
  | "handwritten"
  | "typewriter"
  | "display";

export type BorderStyle =
  | "none"
  | "thin"
  | "thick"
  | "dashed"
  | "double"
  | "scalloped"
  | "film"
  | "torn"
  | "chrome"
  | "ribbon";

export type PhotoFrameStyle =
  | "none"
  | "thin"
  | "polaroid"
  | "rounded"
  | "vintage"
  | "sticker";

export type DecorationKind =
  | "heart"
  | "star"
  | "bow"
  | "sparkle"
  | "flower"
  | "cloud"
  | "cherry"
  | "smile"
  | "tape"
  | "doodle"
  | "confetti"
  | "balloon"
  | "cake"
  | "disco"
  | "sprocket"
  | "checker"
  | "wave"
  | "leaf"
  | "snowflake"
  | "pumpkin"
  | "tree"
  | "hearts-cluster"
  | "besties"
  | "moon"
  | "butterfly"
  | "crown"
  | "music"
  | "icecream"
  | "lightning";

export type DecorationAnchor =
  | "strip-tl"
  | "strip-tr"
  | "strip-bl"
  | "strip-br"
  | "strip-top"
  | "strip-bottom"
  | "between-photos"
  | "footer"
  | "margin-left"
  | "margin-right";

export interface LayoutRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface StripLayout {
  id: string;
  name: string;
  description: string;
  slotCount: number;
  /** Aspect ratio of the full strip (width / height) */
  aspectRatio: number;
  /** Photo frames in 0–1 normalized coordinates relative to strip */
  frames: LayoutRect[];
  /** Footer band height as fraction of strip height */
  footerHeight: number;
  /** Side margin for decorations that avoid photo faces */
  safeMargin: number;
  previewColumns?: number;
}

export interface StripSlot {
  index: number;
  photoId: string | null;
  participantId?: string | null;
}

export interface Photo {
  id: string;
  roomId?: string | null;
  participantId?: string | null;
  /** Local object URL or remote storage URL */
  src: string;
  timestamp: number;
  selected: boolean;
  participantName?: string;
}

export interface DecorationItem {
  id: string;
  kind: DecorationKind;
  enabled: boolean;
  anchor: DecorationAnchor;
  size: number;
  offsetX?: number;
  offsetY?: number;
  rotation?: number;
  color?: string;
}

export interface ThemeBackground {
  color: string;
  pattern?:
    | "none"
    | "grain"
    | "dots"
    | "checker"
    | "waves"
    | "stars"
    | "paper"
    | "glitter";
  patternOpacity?: number;
  secondaryColor?: string;
}

export interface StripThemeConfig {
  themeId: string;
  background: ThemeBackground;
  borderStyle: BorderStyle;
  borderColor: string;
  photoFrameStyle: PhotoFrameStyle;
  photoCornerRadius: number;
  decorations: DecorationItem[];
  fontStyle: FontStyle;
  textColor: string;
  filterPreset: FilterPreset;
  filmGrain: boolean;
  filmGrainIntensity: number;
  dateStamp: boolean;
  customText: string;
  showNames: boolean;
}

export interface PhotoStrip {
  layoutId: string;
  slots: StripSlot[];
  theme: StripThemeConfig;
}

export type ThemeCategory =
  | "Classic Photo Booth"
  | "Vintage Film"
  | "Y2K"
  | "Coquette"
  | "Cute"
  | "Scrapbook"
  | "Retro"
  | "Disco"
  | "Birthday"
  | "Party"
  | "Love/Friends"
  | "Minimal"
  | "Seasonal"
  | "Holiday"
  | "Custom";

export interface StripTheme {
  id: string;
  name: string;
  category: ThemeCategory;
  background: ThemeBackground;
  borderStyle: BorderStyle;
  borderColor: string;
  photoFrameStyle: PhotoFrameStyle;
  photoCornerRadius: number;
  decorations: Omit<DecorationItem, "id" | "enabled">[];
  fontStyle: FontStyle;
  textColor: string;
  filterPreset: FilterPreset;
  filmGrain: boolean;
  customTextDefault?: string;
  preview: {
    swatch: string;
    accent: string;
  };
}

export interface Participant {
  id: string;
  roomId: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  joinedAt: number;
  color: string;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  layoutId: string;
  createdAt: number;
  expiresAt: number;
  status: "active" | "ended";
  stripSlots: StripSlot[];
  theme: StripThemeConfig;
}

export interface RoomPhoto extends Photo {
  roomId: string;
  participantId: string;
}

export type CountdownSeconds = 3 | 5;

export type CameraErrorKind =
  | "permission-denied"
  | "not-found"
  | "unavailable"
  | "unsupported"
  | "unknown";
