import { getDb } from "../auth/db";

// Persistência de estado por usuário: uma linha por (usuário, funcionalidade).
// `state` guarda o JSON serializado do bucket daquele namespace.

/** Estado salvo do usuário para o namespace, ou null se ainda não houver. */
export function getUserState(userId: number, namespace: string): string | null {
  const row = getDb()
    .prepare(
      "SELECT state FROM user_state WHERE user_id = ? AND namespace = ?",
    )
    .get(userId, namespace) as { state: string } | undefined;

  return row?.state ?? null;
}

/** Grava (ou substitui) o estado do usuário para o namespace. */
export function setUserState(
  userId: number,
  namespace: string,
  state: string,
): void {
  getDb()
    .prepare(
      `INSERT INTO user_state (user_id, namespace, state)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, namespace)
       DO UPDATE SET state = excluded.state, updated_at = datetime('now')`,
    )
    .run(userId, namespace, state);
}
