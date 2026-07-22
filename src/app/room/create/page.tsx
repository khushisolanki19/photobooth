"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BoothShell } from "@/components/ui/BoothShell";
import { LayoutPicker } from "@/components/strip/LayoutPicker";
import { createRoom, backendMode } from "@/lib/room/roomService";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function CreateRoomPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [layoutId, setLayoutId] = useState("classic-vertical-4");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const setRoomContext = useSessionStore((s) => s.setRoomContext);
  const setLayout = useSessionStore((s) => s.setLayout);

  async function onCreate() {
    setBusy(true);
    setError(null);
    try {
      const { room, participant } = await createRoom({
        hostName: name || "Host",
        layoutId,
      });
      setLayout(layoutId);
      setRoomContext({
        roomCode: room.code,
        participantId: participant.id,
        participantName: participant.name,
        isHost: true,
      });
      sessionStorage.setItem(
        "photobooth-room-self",
        JSON.stringify({
          roomCode: room.code,
          participantId: participant.id,
          participantName: participant.name,
          isHost: true,
        }),
      );
      router.push(`/room/${encodeURIComponent(room.code)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create room.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <BoothShell>
      <div className="paper-card rounded-3xl p-5 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-booth-curtain uppercase">
          Friends
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
          Create a Room
        </h1>
        <p className="mt-2 text-sm text-booth-muted">
          Share a short code so friends can join from their phones. Mode:{" "}
          <strong>{backendMode() === "supabase" ? "Supabase realtime" : "local demo"}</strong>
        </p>

        <label className="mt-6 block">
          <span className="text-xs font-medium text-booth-muted">Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Host name"
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-3"
            aria-label="Your name"
          />
        </label>

        <div className="mt-6">
          <p className="mb-2 text-xs font-medium text-booth-muted">Strip layout</p>
          <LayoutPicker selectedId={layoutId} onSelect={setLayoutId} />
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="btn-primary"
            disabled={busy}
            onClick={() => void onCreate()}
          >
            {busy ? "Creating…" : "Create Room"}
          </button>
          <Link href="/" className="btn-ghost">
            Cancel
          </Link>
        </div>
      </div>
    </BoothShell>
  );
}
