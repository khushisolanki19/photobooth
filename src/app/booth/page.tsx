"use client";

import { useRouter } from "next/navigation";
import { BoothShell } from "@/components/ui/BoothShell";
import { LayoutPicker } from "@/components/strip/LayoutPicker";
import { useSessionStore } from "@/lib/store/sessionStore";
import { getLayout } from "@/lib/layouts";

export default function BoothPage() {
  const router = useRouter();
  const layoutId = useSessionStore((s) => s.layoutId);
  const setLayout = useSessionStore((s) => s.setLayout);
  const clearPhotos = useSessionStore((s) => s.clearPhotos);
  const layout = getLayout(layoutId);

  return (
    <BoothShell>
      <div className="paper-card rounded-[1.75rem] p-5 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-booth-curtain uppercase">
          New session
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-booth-ink sm:text-4xl">
          Choose your strip layout
        </h1>
        <p className="cute-tag mt-1 !text-booth-curtain">pick your fave ♡</p>
        <p className="mt-2 text-sm text-booth-muted sm:text-base">
          You&apos;ll take {layout.slotCount} photos for the{" "}
          <span className="font-semibold text-booth-ink">{layout.name}</span>{" "}
          layout.
        </p>

        <div className="mt-6">
          <LayoutPicker selectedId={layoutId} onSelect={setLayout} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="btn-primary w-full sm:w-auto"
            onClick={() => {
              clearPhotos();
              router.push("/booth/camera");
            }}
          >
            Open camera
          </button>
        </div>
      </div>
    </BoothShell>
  );
}
