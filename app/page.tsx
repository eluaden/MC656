import Link from "next/link";
import { UserMenu } from "./components/UserMenu";

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="4" />
      <ellipse cx="50" cy="50" rx="20" ry="46" stroke="currentColor" strokeWidth="3" />
      <path d="M8 35h84" stroke="currentColor" strokeWidth="3" />
      <path d="M8 65h84" stroke="currentColor" strokeWidth="3" />
      <path d="M50 4v92" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/vineyard-bg.jpg')" }}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Session indicator */}
      <div className="absolute right-5 top-5 z-20">
        <UserMenu />
      </div>

      {/* Content */}
      <main className="relative z-10 flex flex-col items-center gap-12 px-6 text-center">
        {/* Title */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="flex items-baseline text-6xl font-bold tracking-tight text-white drop-shadow-lg sm:text-7xl md:text-8xl">
            <span>AgroGl</span>
            <GlobeIcon className="mx-[-0.05em] inline-block h-[0.65em] w-[0.65em] text-white drop-shadow-lg" />
            <span>be</span>
          </h1>
          <p className="max-w-md text-lg font-medium text-white/80 drop-shadow sm:text-xl">
            Explore the world of agriculture
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
          <Link
            href="/globe"
            className="group flex h-14 min-w-[200px] items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-8 text-lg font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-900/40 hover:scale-105 active:scale-100"
          >
            <svg
              className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Globe
          </Link>

          <Link
            href="/cost-planner"
            className="group flex h-14 min-w-[200px] items-center justify-center gap-3 rounded-2xl bg-white/15 px-8 text-lg font-semibold text-white shadow-lg shadow-black/20 ring-1 ring-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/25 hover:shadow-xl hover:ring-white/40 hover:scale-105 active:scale-100"
          >
            <svg
              className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Cost Planner
          </Link>

          <Link
            href="/simulator"
            className="group flex h-14 min-w-[200px] items-center justify-center gap-3 rounded-2xl bg-white/15 px-8 text-lg font-semibold text-white shadow-lg shadow-black/20 ring-1 ring-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/25 hover:shadow-xl hover:ring-white/40 hover:scale-105 active:scale-100"
          >
            <svg
              className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
            </svg>
            Mapa de Plantio
          </Link>
        </div>
      </main>
    </div>
  );
}
