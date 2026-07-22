/**
 * Chaves de localStorage que guardam o estado de visitantes anônimos, uma por
 * funcionalidade persistida. Fonte única: referenciada pelos hooks de
 * persistência (via `usePersistedState`) e apagada no logout.
 */
export const ANON_STATE_KEYS = {
  costPlanner: "costPlannerState",
  cropGrid: "cropGridState",
  fieldConditions: "simFieldConditions",
} as const;

/**
 * Apaga todos os baldes anônimos do localStorage. Chamado ao sair da conta para
 * que a navegação anônima recomece dos dados padrão, sem herdar sobras de uma
 * sessão anônima anterior no mesmo navegador. Só faz sentido na transição
 * conta → anônimo — nunca é chamado por um visitante que nunca logou.
 */
export function clearAnonState(): void {
  if (typeof window === "undefined") return;
  for (const key of Object.values(ANON_STATE_KEYS)) {
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage indisponível (ex.: modo privado): ignora.
    }
  }
}
