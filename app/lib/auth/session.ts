import crypto from "crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";

// Sessão opaca: um token aleatório guardado no banco e enviado ao navegador
// num cookie httpOnly (inacessível a scripts), validado a cada requisição.
export const SESSION_COOKIE = "agroglobe_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: number;
  email: string;
};

/** Cria uma sessão para o usuário e grava o cookie httpOnly no navegador. */
export async function createSession(userId: number): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  getDb()
    .prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
    .run(token, userId, expiresAt.toISOString());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

/** Usuário autenticado da requisição atual, ou null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const row = getDb()
    .prepare(
      `SELECT u.id, u.email
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
    )
    .get(token, new Date().toISOString()) as SessionUser | undefined;

  return row ?? null;
}

/** Encerra a sessão atual: remove do banco e apaga o cookie. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
  cookieStore.delete(SESSION_COOKIE);
}
