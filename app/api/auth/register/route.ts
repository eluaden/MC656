import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getDb } from "../../../lib/auth/db";
import { createSession } from "../../../lib/auth/session";
import {
  normalizeEmail,
  validateEmail,
  validatePassword,
} from "../../../lib/auth/validation";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const email = String(body.email ?? "");
  const password = String(body.password ?? "");

  const emailError = validateEmail(email);
  if (emailError) {
    return NextResponse.json({ error: emailError }, { status: 400 });
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const normalized = normalizeEmail(email);
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(normalized);
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com esse e-mail." },
      { status: 409 },
    );
  }

  // A senha nunca é armazenada em texto puro: só o hash bcrypt (com salt).
  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
    .run(normalized, passwordHash);

  const userId = Number(result.lastInsertRowid);
  await createSession(userId);

  return NextResponse.json(
    { user: { id: userId, email: normalized } },
    { status: 201 },
  );
}
