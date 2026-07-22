"use client";

import Link from "next/link";
import { BoothShell } from "@/components/ui/BoothShell";
import { ExportPanel } from "@/components/strip/ExportPanel";
import { PhotoStrip } from "@/components/strip/PhotoStrip";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function ExportPage() {
  const photos = useSessionStore((s) => s.photos);
  const slots = useSessionStore((s) => s.slots);
  const layoutId = useSessionStore((s) => s.layoutId);
  const theme = useSessionStore((s) => s.theme);
  const resetSession = useSessionStore((s) => s.resetSession);
  const strip = { layoutId, slots, theme };

  return (
    <BoothShell>
      <div className="paper-card rounded-3xl p-5 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-booth-curtain uppercase">
          Export
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
          Your strip is ready
        </h1>
        <p className="mt-2 text-sm text-booth-muted">
          Downloads match this preview — themes, borders, filters, and stickers included.
        </p>

        <div className="mt-6 flex justify-center">
          <div className="strip-slide-in">
            <PhotoStrip strip={strip} photos={photos} maxHeight={480} />
          </div>
        </div>

        <div className="mt-8">
          <ExportPanel strip={strip} photos={photos} />
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link href="/booth/editor" className="btn-secondary w-full sm:w-auto">
            Edit design
          </Link>
          <Link
            href="/"
            className="btn-ghost w-full sm:w-auto"
            onClick={() => resetSession()}
          >
            Done
          </Link>
        </div>
      </div>
    </BoothShell>
  );
}
