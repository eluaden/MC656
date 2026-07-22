"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

const SAVE_DEBOUNCE_MS = 500;

/** Identidade "dona" de uma carga/save. `null` = anônimo. */
type Owner = number | null;

type Options<T> = {
  /** Bucket no servidor (ex.: "costPlanner"). */
  namespace: string;
  /** Chave de localStorage usada quando o visitante é anônimo. */
  anonKey: string;
  defaultState: T;
  /** Recebe o objeto já parseado (ou null) e devolve um estado válido. */
  normalize: (raw: unknown) => T;
};

/**
 * Estado persistido por usuário. Autenticado → servidor (/api/state/*);
 * anônimo → localStorage (chave própria). Recarrega ao trocar a identidade
 * (login/logout) e nunca salva antes de a carga da identidade atual terminar,
 * nem deixa um save em voo escrever no bucket errado.
 */
export function usePersistedState<T>({
  namespace,
  anonKey,
  defaultState,
  normalize,
}: Options<T>): {
  state: T;
  setState: React.Dispatch<React.SetStateAction<T>>;
  isLoaded: boolean;
} {
  const { user, status } = useAuth();
  const [state, setState] = useState<T>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Dono da carga concluída atualmente refletida em `state`. Enquanto difere da
  // identidade atual, os saves ficam suspensos (evita gravar no bucket errado).
  const loadedOwnerRef = useRef<Owner | undefined>(undefined);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentOwner: Owner = user ? user.id : null;

  // ==================== Carga (ao montar / trocar identidade) ====================
  useEffect(() => {
    if (status === "loading") return;

    let cancelled = false;
    // Cancela qualquer save pendente da identidade anterior.
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    // Reinicia o gate de carga ao trocar de identidade (login/logout).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(false);

    const applyRaw = (raw: unknown) => {
      if (cancelled) return;
      setState(normalize(raw));
      loadedOwnerRef.current = currentOwner;
      setIsLoaded(true);
    };

    if (currentOwner === null) {
      // Anônimo: localStorage.
      let raw: unknown = null;
      try {
        const saved = localStorage.getItem(anonKey);
        raw = saved ? JSON.parse(saved) : null;
      } catch {
        raw = null;
      }
      applyRaw(raw);
    } else {
      // Autenticado: servidor.
      (async () => {
        try {
          const res = await fetch(`/api/state/${namespace}`);
          if (cancelled) return;
          const data = res.ok ? await res.json() : { state: null };
          applyRaw(data.state ?? null);
        } catch {
          applyRaw(null);
        }
      })();
    }

    return () => {
      cancelled = true;
    };
    // currentOwner cobre login/logout; namespace/anonKey/normalize são estáveis.
  }, [status, currentOwner, namespace, anonKey, normalize]);

  // ==================== Save (ao mudar o estado) ====================
  useEffect(() => {
    // Só salva depois que a carga da identidade ATUAL terminou.
    if (!isLoaded || loadedOwnerRef.current !== currentOwner) return;

    if (currentOwner === null) {
      try {
        localStorage.setItem(anonKey, JSON.stringify(state));
      } catch {
        // localStorage indisponível (ex.: modo privado): ignora.
      }
      return;
    }

    // Autenticado: PUT debounced. Fixa o dono deste save.
    const owner = currentOwner;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      // A identidade pode ter mudado durante o debounce.
      if (loadedOwnerRef.current !== owner) return;
      fetch(`/api/state/${namespace}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      }).catch(() => {
        // Falha de rede: o próximo save tenta de novo.
      });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [state, isLoaded, currentOwner, namespace, anonKey]);

  // Garante limpeza do timer ao desmontar.
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // `setState` é o dispatcher do useState — estável entre renders.
  return { state, setState, isLoaded };
}
