import { initials } from "@/lib/utils";
import type { Participant } from "@/lib/types";

export function RoomParticipant({ participant }: { participant: Participant }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/70 px-2 py-1.5 pr-3">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ background: participant.color }}
        aria-hidden
      >
        {initials(participant.name)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-booth-ink">
          {participant.name}
          {participant.isHost ? " · Host" : ""}
        </p>
        <p className="text-[10px] text-booth-muted">
          <span
            className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${
              participant.connected ? "bg-emerald-500" : "bg-stone-400"
            }`}
          />
          {participant.connected ? "Connected" : "Away"}
        </p>
      </div>
    </div>
  );
}
