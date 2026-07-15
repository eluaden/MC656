"use client";

export const SPEED_OPTIONS = [1, 2, 4] as const;
export type Speed = (typeof SPEED_OPTIONS)[number];

type TimeControlsProps = {
  day: number;
  isPlaying: boolean;
  speed: Speed;
  onTogglePlay: () => void;
  onSpeedChange: (speed: Speed) => void;
  onStepDays: (days: number) => void;
  onReset: () => void;
};

/** Barra de controle do tempo da simulação (play/pause, passos, velocidade). */
export function TimeControls({
  day,
  isPlaying,
  speed,
  onTogglePlay,
  onSpeedChange,
  onStepDays,
  onReset,
}: TimeControlsProps) {
  const wholeDay = Math.floor(day);
  const week = Math.floor(wholeDay / 7) + 1;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-black/60 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <button
        type="button"
        onClick={onReset}
        disabled={day === 0}
        title="Voltar ao dia zero"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-gray-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onTogglePlay}
        aria-pressed={isPlaying}
        title={isPlaying ? "Pausar" : "Avançar o tempo"}
        className={`flex h-11 w-11 items-center justify-center rounded-xl border text-white transition ${
          isPlaying
            ? "border-amber-400/40 bg-amber-500/80 hover:bg-amber-400"
            : "border-emerald-400/40 bg-emerald-600/90 hover:bg-emerald-500"
        }`}
      >
        {isPlaying ? (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5.5a1 1 0 011-1h1a1 1 0 011 1v13a1 1 0 01-1 1H9a1 1 0 01-1-1v-13zm5 0a1 1 0 011-1h1a1 1 0 011 1v13a1 1 0 01-1 1h-1a1 1 0 01-1-1v-13z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5.14v13.72a1 1 0 001.52.85l11-6.86a1 1 0 000-1.7l-11-6.86a1 1 0 00-1.52.85z" />
          </svg>
        )}
      </button>

      <button
        type="button"
        onClick={() => onStepDays(1)}
        className="h-9 rounded-xl border border-white/[0.08] px-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
      >
        +1 dia
      </button>
      <button
        type="button"
        onClick={() => onStepDays(7)}
        className="h-9 rounded-xl border border-white/[0.08] px-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
      >
        +7 dias
      </button>

      <div className="mx-1 flex items-center gap-1 rounded-xl border border-white/[0.08] p-1">
        {SPEED_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSpeedChange(option)}
            aria-pressed={speed === option}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              speed === option
                ? "bg-emerald-500/25 text-emerald-300"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {option}x
          </button>
        ))}
      </div>

      <p className="ml-1 min-w-[9rem] text-center text-sm font-medium text-white">
        Dia {wholeDay}
        <span className="ml-1.5 text-xs font-normal text-gray-400">
          · Semana {week}
        </span>
      </p>
    </div>
  );
}
