import Link from "next/link";

export default function CostPlannerPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
      <h1 className="mb-6 text-4xl font-bold">Cost Planner</h1>
      <p className="mb-8 text-zinc-400">Coming soon...</p>
      <Link
        href="/"
        className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        Back to Home
      </Link>
    </div>
  );
}
