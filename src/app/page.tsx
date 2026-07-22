import Link from "next/link";
import { BoothHero } from "@/components/landing/BoothHero";
import { CuteSparks } from "@/components/landing/CuteSparks";
import { SampleStrip } from "@/components/landing/SampleStrip";

export default function HomePage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <CuteSparks />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 0%, rgba(255,138,173,0.4) 0%, rgba(242,85,122,0.18) 40%, transparent 72%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{
          background:
            "linear-gradient(to top, rgba(255,208,220,0.12), transparent)",
        }}
      />

      <header className="relative z-10 px-5 pt-[max(1rem,var(--safe-top))] sm:px-8">
        <p className="brand-mark font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.22em]">
          PHOTO BOOTH
        </p>
        <p className="cute-tag mt-1">smile for the camera ♡</p>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-5 pb-[max(2rem,var(--safe-bottom))] pt-4 sm:px-8 lg:flex-row lg:items-center lg:gap-12 lg:pt-0">
        <div className="relative w-full max-w-md shrink-0 lg:max-w-lg">
          <div className="pointer-events-none absolute -left-2 top-16 hidden sm:block md:-left-8">
            <SampleStrip variant={0} delay={0} />
          </div>
          <div className="pointer-events-none absolute -right-1 top-28 hidden sm:block md:-right-6">
            <SampleStrip variant={1} delay={0.8} className="scale-90" />
          </div>
          <div className="pointer-events-none absolute bottom-8 left-4 hidden sm:block md:left-0">
            <SampleStrip variant={2} delay={1.4} className="scale-75 opacity-90" />
          </div>
          <BoothHero />
        </div>

        <div className="mt-6 w-full max-w-xl text-center lg:mt-0 lg:text-left">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] tracking-tight text-booth-ivory sm:text-5xl lg:text-6xl">
            Step Into the Photo Booth
          </h1>
          <p className="mt-4 text-base leading-relaxed text-booth-blush sm:text-lg">
            Take the cutest photos alone — or make a strip with friends, wherever they are.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
            <Link href="/booth" className="btn-primary w-full sm:w-auto">
              Start a Photo Booth
            </Link>
            <Link href="/room/create" className="btn-secondary w-full sm:w-auto">
              Create a Room
            </Link>
            <Link href="/room/join" className="btn-secondary w-full sm:w-auto">
              Join a Room
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
