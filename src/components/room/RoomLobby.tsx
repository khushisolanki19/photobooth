"use client";

import { useState } from "react";
import type { Participant, Room } from "@/lib/types";
import { RoomParticipant } from "./RoomParticipant";
import { backendMode } from "@/lib/room/roomService";

export function RoomLobby({
  room,
  participants,
  photoCount,
  isHost,
  onDelete,
}: {
  room: Room;
  participants: Participant[];
  photoCount: number;
  isHost: boolean;
  onDelete?: () => void;
}) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/room/join?code=${encodeURIComponent(room.code)}`
      : "";

  async function copy(text: string, kind: "code" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-[#2a1520] to-booth-ink px-4 py-3 text-booth-ivory shadow-[0_0_24px_rgba(212,33,58,0.15)]">
        <p className="text-xs tracking-[0.16em] text-booth-blush uppercase">Room code</p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide">
          {room.code}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold"
            onClick={() => void copy(room.code, "code")}
          >
            {copied === "code" ? "Copied!" : "Copy code"}
          </button>
          <button
            type="button"
            className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold"
            onClick={() => void copy(inviteUrl, "link")}
          >
            {copied === "link" ? "Copied!" : "Copy invite link"}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-booth-muted">
          Participants · {photoCount} photos submitted
        </p>
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <RoomParticipant key={p.id} participant={p} />
          ))}
        </div>
      </div>

      <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
        Photos uploaded to this room are temporary and meant for the session only.
        They expire when the room ends
        {backendMode() === "local"
          ? " (local demo mode — configure Supabase for multi-device parties)."
          : ", or when the host deletes the room."}
      </p>

      {isHost && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="text-xs font-semibold text-booth-curtain underline"
        >
          Delete room & purge photos
        </button>
      )}
    </div>
  );
}
