"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth/AuthProvider";
import { clearAnonState } from "../lib/state/anonState";

/** Indicador de sessão exibido na home: "Entrar" ou e-mail + "Sair". */
export function UserMenu() {
  const router = useRouter();
  const { user, status, refresh } = useAuth();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    // Reinicia a navegação anônima: descarta baldes de uma sessão anônima
    // anterior para que, ao sair da conta, tudo recomece dos dados padrão.
    clearAnonState();
    refresh();
    router.refresh();
  };

  if (status === "loading") return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex h-10 items-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/25"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
        </svg>
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex h-10 items-center gap-3 rounded-xl bg-white/15 px-4 text-sm text-white ring-1 ring-white/20 backdrop-blur-sm">
      <span className="max-w-[180px] truncate font-medium">{user.email}</span>
      <button
        type="button"
        onClick={handleLogout}
        className="text-white/70 transition hover:text-white"
      >
        Sair
      </button>
    </div>
  );
}
