"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BoothShell } from "@/components/ui/BoothShell";
import { joinRoom } from "@/lib/room/roomService";
import { useSessionStore } from "@/lib/store/sessionStore";

function JoinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [code, setCode] = useState(() =>
    (params.get("code") ?? "").toUpperCase(),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const setRoomContext = useSessionStore((s) => s.setRoomContext);
  const setLayout = useSessionStore((s) => s.setLayout);

  async function onJoin() {
    setBusy(true);
    setError(null);
    try {
      const { room, participant } = await joinRoom({
        code,
        name: name || "Guest",
      });
      setLayout(room.layoutId);
      setRoomContext({
        roomCode: room.code,
        participantId: participant.id,
        participantName: participant.name,
        isHost: false,
      });
      sessionStorage.setItem(
        "photobooth-room-self",
        JSON.stringify({
          roomCode: room.code,
          participantId: participant.id,
          participantName: participant.name,
          isHost: false,
        }),
      );
      router.push(`/room/${encodeURIComponent(room.code)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "JOIN_FAILED";
      if (msg === "ROOM_NOT_FOUND") {
        setError("We couldn’t find that room code. Double-check and try again.");
      } else if (msg === "ROOM_EXPIRED") {
        setError("This room has expired. Ask the host to create a new one.");
      } else {
        setError("Could not join the room. Check your connection and try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="paper-card rounded-3xl p-5 sm:p-8">
      <p className="text-xs font-semibold tracking-[0.18em] text-booth-curtain uppercase">
        Friends
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
        Join a Room
      </h1>
      <p className="mt-2 text-sm text-booth-muted">
        No account needed — just your name and the room code.
      </p>

      <label className="mt-6 block">
        <span className="text-xs font-medium text-booth-muted">Your name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-3"
          aria-label="Your name"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-medium text-booth-muted">Room code</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="PHOTO-7K2X"
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-3 font-mono tracking-wider"
          aria-label="Room code"
        />
      </label>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="btn-primary"
          disabled={busy || !code.trim()}
          onClick={() => void onJoin()}
        >
          {busy ? "Joining…" : "Join Room"}
        </button>
        <Link href="/" className="btn-ghost">
          Cancel
        </Link>
      </div>
    </div>
  );
}

export default function JoinRoomPage() {
  return (
    <BoothShell>
      <Suspense fallback={<div className="paper-card rounded-3xl p-8">Loading…</div>}>
        <JoinForm />
      </Suspense>
    </BoothShell>
  );
}
