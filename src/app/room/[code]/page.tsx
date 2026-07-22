"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BoothShell } from "@/components/ui/BoothShell";
import { RoomLobby } from "@/components/room/RoomLobby";
import { SharedPhotoTray } from "@/components/room/SharedPhotoTray";
import { SlotBuilder } from "@/components/room/SlotBuilder";
import { PhotoStrip } from "@/components/strip/PhotoStrip";
import { ExportPanel } from "@/components/strip/ExportPanel";
import { ThemePicker } from "@/components/themes/ThemePicker";
import { EditDesignPanel } from "@/components/themes/EditDesignPanel";
import { CameraView } from "@/components/camera/CameraView";
import { CountdownTimer } from "@/components/camera/CountdownTimer";
import { useCamera } from "@/lib/camera/useCamera";
import {
  deleteRoom,
  getRoomByCode,
  listParticipants,
  listPhotos,
  setParticipantConnected,
  subscribeRoom,
  updateRoomStrip,
  uploadRoomPhoto,
} from "@/lib/room/roomService";
import { surpriseTheme } from "@/lib/themes/surprise";
import { getTheme, themeToConfig } from "@/lib/themes/catalog";
import type { Participant, Photo, Room, StripSlot } from "@/lib/types";
import { getLayout } from "@/lib/layouts";

type Self = {
  roomCode: string;
  participantId: string;
  participantName: string;
  isHost: boolean;
};

export default function SharedRoomPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = decodeURIComponent(params.code ?? "");

  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [self] = useState<Self | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("photobooth-room-self");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Self;
      if (
        parsed.roomCode === code.toUpperCase() ||
        parsed.roomCode === code
      ) {
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [tab, setTab] = useState<"lobby" | "camera" | "build" | "export">("lobby");
  const [designMode, setDesignMode] = useState<"themes" | "edit">("themes");
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { videoRef, ready, error: camError, facingMode, canFlip, flip, capture, start, stop } =
    useCamera();

  const refresh = useCallback(async () => {
    try {
      const r = await getRoomByCode(code);
      if (!r) {
        setError("Room not found or it was deleted.");
        setRoom(null);
        return;
      }
      if (r.status === "ended" || r.expiresAt < Date.now()) {
        setError("This room has expired.");
        setRoom(r);
        return;
      }
      setRoom(r);
      const [parts, ph] = await Promise.all([
        listParticipants(r.id),
        listPhotos(r.id),
      ]);
      setParticipants(parts);
      setPhotos(
        ph.map((p) => ({
          ...p,
          participantName: parts.find((x) => x.id === p.participantId)?.name,
        })),
      );
    } catch {
      setError("Lost connection while syncing the room.");
    }
  }, [code]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(id);
  }, [refresh]);

  useEffect(() => {
    if (!room) return;
    return subscribeRoom(room.id, () => {
      void refresh();
    });
  }, [room, refresh]);

  useEffect(() => {
    if (!self) return;
    void setParticipantConnected(self.participantId, true);
    const onLeave = () => {
      void setParticipantConnected(self.participantId, false);
    };
    window.addEventListener("beforeunload", onLeave);
    return () => {
      onLeave();
      window.removeEventListener("beforeunload", onLeave);
      stop();
    };
  }, [self, stop]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (tab !== "camera") stop();
      else void start();
    }, 0);
    return () => window.clearTimeout(id);
  }, [tab, start, stop]);

  const me = useMemo(
    () => participants.find((p) => p.id === self?.participantId),
    [participants, self],
  );
  const isHost = Boolean(self?.isHost || me?.isHost);

  const strip = useMemo(() => {
    if (!room) return null;
    return {
      layoutId: room.layoutId,
      slots: room.stripSlots,
      theme: room.theme,
    };
  }, [room]);

  async function persistSlots(slots: StripSlot[]) {
    if (!room || !isHost) return;
    const next = await updateRoomStrip({ room, slots });
    setRoom(next);
  }

  async function persistTheme(theme: Room["theme"]) {
    if (!room || !isHost) return;
    const next = await updateRoomStrip({ room, slots: room.stripSlots, theme });
    setRoom(next);
  }

  const takeAndUpload = useCallback(async () => {
    if (!room || !self) return;
    const dataUrl = capture();
    if (!dataUrl) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 350);
    setUploading(true);
    try {
      const participant =
        participants.find((p) => p.id === self.participantId) ??
        ({
          id: self.participantId,
          roomId: room.id,
          name: self.participantName,
          isHost: self.isHost,
          connected: true,
          joinedAt: Date.now(),
          color: "#C45C5C",
        } satisfies Participant);
      await uploadRoomPhoto({ room, participant, dataUrl });
      await refresh();
      setTab("lobby");
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }, [room, self, capture, participants, refresh]);

  function beginCapture() {
    if (!ready || capturing || uploading) return;
    setCapturing(true);
    let n = 3;
    setCount(n);
    const timer = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        window.clearInterval(timer);
        setCount(null);
        setCapturing(false);
        void takeAndUpload();
      } else {
        setCount(n);
      }
    }, 1000);
  }

  if (error && !room) {
    return (
      <BoothShell>
        <div className="paper-card rounded-3xl p-8 text-center">
          <p className="font-semibold text-booth-ink">{error}</p>
          <Link href="/room/join" className="btn-primary mt-4 inline-flex">
            Join another room
          </Link>
        </div>
      </BoothShell>
    );
  }

  if (!room || !strip) {
    return (
      <BoothShell>
        <div className="paper-card rounded-3xl p-8 text-center text-booth-muted">
          Loading room…
        </div>
      </BoothShell>
    );
  }

  if (!self) {
    return (
      <BoothShell>
        <div className="paper-card rounded-3xl p-8 text-center">
          <p className="font-semibold">Join this room to participate</p>
          <p className="mt-2 text-sm text-booth-muted">Code: {room.code}</p>
          <Link
            href={`/room/join?code=${encodeURIComponent(room.code)}`}
            className="btn-primary mt-4 inline-flex"
          >
            Enter your name & join
          </Link>
        </div>
      </BoothShell>
    );
  }

  const layout = getLayout(room.layoutId);

  return (
    <BoothShell wide>
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["lobby", "Room"],
            ["camera", "Camera"],
            ["build", "Strip"],
            ["export", "Export"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              tab === id ? "bg-booth-curtain text-booth-ivory" : "bg-booth-ivory text-booth-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {tab === "lobby" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="paper-card rounded-3xl p-5">
            <RoomLobby
              room={room}
              participants={participants}
              photoCount={photos.length}
              isHost={isHost}
              onDelete={
                isHost
                  ? async () => {
                      await deleteRoom(room);
                      sessionStorage.removeItem("photobooth-room-self");
                      router.push("/");
                    }
                  : undefined
              }
            />
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold text-booth-muted">
                Shared photo tray
              </p>
              <SharedPhotoTray
                photos={photos}
                participants={participants}
                selectedId={selectedPhotoId}
                onSelect={setSelectedPhotoId}
              />
            </div>
          </div>
          <div className="paper-card rounded-3xl p-4">
            <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-booth-muted uppercase">
              Preview · {layout.name}
            </p>
            <PhotoStrip strip={strip} photos={photos} maxHeight={420} />
          </div>
        </div>
      )}

      {tab === "camera" && (
        <div className="mx-auto max-w-lg">
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-black">
            <CameraView
              ref={videoRef}
              mirrored={facingMode === "user"}
              flash={flash}
              className="absolute inset-0 h-full w-full rounded-none"
            />
            <CountdownTimer value={count} />
          </div>
          {camError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {camError.message}
            </p>
          )}
          <p className="mt-3 text-center text-xs text-booth-blush">
            Photos you take here are uploaded to the shared room tray for everyone.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              className="btn-ghost-light"
              onClick={flip}
              disabled={!canFlip}
            >
              Flip
            </button>
            <button
              type="button"
              className="relative flex h-20 w-20 items-center justify-center rounded-full bg-booth-ivory shadow-[0_0_28px_rgba(255,77,106,0.25)]"
              aria-label="Take and upload photo"
              disabled={!ready || capturing || uploading}
              onClick={beginCapture}
            >
              <span className="absolute h-14 w-14 rounded-full border-[3px] border-booth-curtain" />
            </button>
          </div>
        </div>
      )}

      {tab === "build" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="paper-card rounded-3xl p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              Arrange the strip
            </h2>
            <p className="mt-1 text-sm text-booth-muted">
              {isHost
                ? "Drag tray photos into slots, or tap photo then slot. Contributor names stay in the editor unless you enable them on the strip."
                : "Only the host can arrange slots — you can still submit photos from Camera."}
            </p>
            <div className="mt-4">
              <SharedPhotoTray
                photos={photos}
                participants={participants}
                selectedId={selectedPhotoId}
                onSelect={setSelectedPhotoId}
              />
            </div>
            <div className="mt-4">
              <SlotBuilder
                slots={room.stripSlots}
                photos={photos}
                participants={participants}
                selectedPhotoId={selectedPhotoId}
                readOnly={!isHost}
                onAssign={(slotIndex, photoId) => {
                  const next = room.stripSlots.map((s) =>
                    s.index === slotIndex
                      ? {
                          ...s,
                          photoId,
                          participantId:
                            photos.find((p) => p.id === photoId)?.participantId ??
                            null,
                        }
                      : s,
                  );
                  void persistSlots(next);
                  setSelectedPhotoId(null);
                }}
                onSwap={(a, b) => {
                  const next = room.stripSlots.map((s) => ({ ...s }));
                  const sa = next.find((x) => x.index === a);
                  const sb = next.find((x) => x.index === b);
                  if (!sa || !sb) return;
                  const tmp = { photoId: sa.photoId, participantId: sa.participantId };
                  sa.photoId = sb.photoId;
                  sa.participantId = sb.participantId;
                  sb.photoId = tmp.photoId;
                  sb.participantId = tmp.participantId;
                  void persistSlots(next);
                }}
              />
            </div>

            {isHost && (
              <div className="mt-6 border-t border-black/8 pt-4">
                <div className="mb-3 flex gap-2">
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      designMode === "themes"
                        ? "bg-booth-curtain text-white"
                        : "bg-booth-soft"
                    }`}
                    onClick={() => setDesignMode("themes")}
                  >
                    Themes
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      designMode === "edit"
                        ? "bg-booth-curtain text-white"
                        : "bg-booth-soft"
                    }`}
                    onClick={() => setDesignMode("edit")}
                  >
                    Edit Design
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-booth-soft px-3 py-1 text-xs font-semibold"
                    onClick={() => void persistTheme(surpriseTheme())}
                  >
                    Surprise Me
                  </button>
                </div>
                {designMode === "themes" ? (
                  <ThemePicker
                    selectedId={room.theme.themeId}
                    onSelect={(id) => {
                      void persistTheme(themeToConfig(getTheme(id)));
                    }}
                  />
                ) : (
                  <EditDesignPanel
                    theme={room.theme}
                    onChange={(patch) =>
                      void persistTheme({ ...room.theme, ...patch })
                    }
                  />
                )}
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <PhotoStrip strip={strip} photos={photos} maxHeight={560} showDeveloping />
          </div>
        </div>
      )}

      {tab === "export" && (
        <div className="paper-card mx-auto max-w-xl rounded-3xl p-5 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            Download the group strip
          </h2>
          <div className="mt-6 flex justify-center">
            <PhotoStrip strip={strip} photos={photos} maxHeight={460} />
          </div>
          <div className="mt-6">
            <ExportPanel strip={strip} photos={photos} />
          </div>
        </div>
      )}
    </BoothShell>
  );
}
