"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type AuthUser = { id: number; email: string };

type AuthContextValue = {
  user: AuthUser | null;
  status: "loading" | "ready";
  /** Refaz o fetch de /api/auth/me (chamar após login/logout). */
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provider de sessão reativo: busca /api/auth/me uma vez e expõe o usuário
 * atual via contexto. Vive no root layout, então persiste entre navegações
 * client-side — por isso `refresh()` é necessário após login/logout para que
 * os hooks de persistência recarreguem o bucket certo.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => {
    setStatus("loading");
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (cancelled) return;
        if (!response.ok) {
          setUser(null);
        } else {
          const data = await response.json();
          setUser(data.user ?? null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setStatus("ready");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return (
    <AuthContext.Provider value={{ user, status, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  }
  return ctx;
}
