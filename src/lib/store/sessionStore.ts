"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEmptySlots, getLayout } from "../layouts";
import { themeToConfig, getTheme } from "../themes/catalog";
import { createDefaultThemeConfig } from "../themes/defaults";
import type {
  CountdownSeconds,
  Photo,
  PhotoStrip,
  StripSlot,
  StripThemeConfig,
} from "../types";
import { uid } from "../utils";

interface SessionState {
  layoutId: string;
  photos: Photo[];
  slots: StripSlot[];
  theme: StripThemeConfig;
  countdown: CountdownSeconds;
  roomCode: string | null;
  participantId: string | null;
  participantName: string | null;
  isHost: boolean;

  setLayout: (layoutId: string) => void;
  setCountdown: (seconds: CountdownSeconds) => void;
  addPhoto: (src: string, meta?: Partial<Photo>) => Photo;
  removePhoto: (id: string) => void;
  togglePhotoSelected: (id: string) => void;
  clearPhotos: () => void;
  assignPhotoToSlot: (slotIndex: number, photoId: string | null) => void;
  swapSlots: (a: number, b: number) => void;
  autoFillSlots: () => void;
  setTheme: (theme: StripThemeConfig) => void;
  applyThemePreset: (themeId: string) => void;
  patchTheme: (patch: Partial<StripThemeConfig>) => void;
  setRoomContext: (ctx: {
    roomCode: string | null;
    participantId: string | null;
    participantName: string | null;
    isHost: boolean;
  }) => void;
  resetSession: () => void;
  getStrip: () => PhotoStrip;
  getSelectedPhotos: () => Photo[];
}

function revokeIfBlob(src: string) {
  if (src.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(src);
    } catch {
      /* ignore */
    }
  }
}

const initialTheme = themeToConfig(getTheme("classic-white"));

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      layoutId: "classic-vertical-4",
      photos: [],
      slots: createEmptySlots("classic-vertical-4"),
      theme: initialTheme,
      countdown: 3,
      roomCode: null,
      participantId: null,
      participantName: null,
      isHost: false,

      setLayout: (layoutId) => {
        const layout = getLayout(layoutId);
        const prev = get().slots;
        const next = createEmptySlots(layoutId);
        for (let i = 0; i < Math.min(prev.length, next.length); i++) {
          next[i] = { ...next[i], ...prev[i], index: i };
        }
        set({ layoutId: layout.id, slots: next });
      },

      setCountdown: (seconds) => set({ countdown: seconds }),

      addPhoto: (src, meta = {}) => {
        const photo: Photo = {
          id: uid("photo"),
          src,
          timestamp: Date.now(),
          selected: true,
          roomId: meta.roomId ?? get().roomCode,
          participantId: meta.participantId ?? get().participantId,
          participantName: meta.participantName ?? get().participantName ?? undefined,
          ...meta,
        };
        set((s) => ({ photos: [...s.photos, photo] }));
        return photo;
      },

      removePhoto: (id) => {
        const photo = get().photos.find((p) => p.id === id);
        if (photo) revokeIfBlob(photo.src);
        set((s) => ({
          photos: s.photos.filter((p) => p.id !== id),
          slots: s.slots.map((slot) =>
            slot.photoId === id ? { ...slot, photoId: null, participantId: null } : slot,
          ),
        }));
      },

      togglePhotoSelected: (id) =>
        set((s) => ({
          photos: s.photos.map((p) =>
            p.id === id ? { ...p, selected: !p.selected } : p,
          ),
        })),

      clearPhotos: () => {
        get().photos.forEach((p) => revokeIfBlob(p.src));
        set({
          photos: [],
          slots: createEmptySlots(get().layoutId),
        });
      },

      assignPhotoToSlot: (slotIndex, photoId) => {
        const photo = get().photos.find((p) => p.id === photoId);
        set((s) => ({
          slots: s.slots.map((slot) =>
            slot.index === slotIndex
              ? {
                  ...slot,
                  photoId,
                  participantId: photo?.participantId ?? null,
                }
              : slot,
          ),
        }));
      },

      swapSlots: (a, b) => {
        set((s) => {
          const slots = s.slots.map((slot) => ({ ...slot }));
          const sa = slots.find((x) => x.index === a);
          const sb = slots.find((x) => x.index === b);
          if (!sa || !sb) return s;
          const tmp = { photoId: sa.photoId, participantId: sa.participantId };
          sa.photoId = sb.photoId;
          sa.participantId = sb.participantId;
          sb.photoId = tmp.photoId;
          sb.participantId = tmp.participantId;
          return { slots };
        });
      },

      autoFillSlots: () => {
        const selected = get()
          .photos.filter((p) => p.selected)
          .slice(0, getLayout(get().layoutId).slotCount);
        set((s) => ({
          slots: s.slots.map((slot, i) => ({
            ...slot,
            photoId: selected[i]?.id ?? null,
            participantId: selected[i]?.participantId ?? null,
          })),
        }));
      },

      setTheme: (theme) => set({ theme }),

      applyThemePreset: (themeId) => {
        set({ theme: themeToConfig(getTheme(themeId)) });
      },

      patchTheme: (patch) =>
        set((s) => ({ theme: { ...s.theme, ...patch } })),

      setRoomContext: (ctx) => set(ctx),

      resetSession: () => {
        get().photos.forEach((p) => revokeIfBlob(p.src));
        set({
          layoutId: "classic-vertical-4",
          photos: [],
          slots: createEmptySlots("classic-vertical-4"),
          theme: createDefaultThemeConfig(),
          countdown: 3,
          roomCode: null,
          participantId: null,
          participantName: null,
          isHost: false,
        });
      },

      getStrip: () => ({
        layoutId: get().layoutId,
        slots: get().slots,
        theme: get().theme,
      }),

      getSelectedPhotos: () => get().photos.filter((p) => p.selected),
    }),
    {
      name: "photobooth-session",
      partialize: (s) => ({
        layoutId: s.layoutId,
        theme: s.theme,
        countdown: s.countdown,
        // Don't persist blob URLs — they become invalid
        roomCode: s.roomCode,
        participantId: s.participantId,
        participantName: s.participantName,
        isHost: s.isHost,
      }),
    },
  ),
);
