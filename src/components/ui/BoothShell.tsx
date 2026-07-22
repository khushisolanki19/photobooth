import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BoothShell({
  children,
  className,
  wide,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <header className="relative z-10 flex items-center justify-between px-4 pb-2 pt-[max(0.75rem,var(--safe-top))] sm:px-6">
        <Link
          href="/"
          className="brand-mark font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight sm:text-xl"
        >
          Photo Booth
        </Link>
      </header>
      <main
        className={cn(
          "relative z-10 mx-auto w-full flex-1 px-4 pb-[max(1.5rem,var(--safe-bottom))] pt-2 sm:px-6",
          wide ? "max-w-6xl" : "max-w-3xl",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
