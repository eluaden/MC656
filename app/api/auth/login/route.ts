import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getDb } from "../../../lib/auth/db";
import { createSession } from "../../../lib/auth/session";
import { normalizeEmail } from "../../../lib/auth/validation";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const email = normalizeEmail(String(body.email ?? ""));
  const password = String(body.password ?? "");

  const user = getDb()
    .prepare("SELECT id, email, password_hash FROM users WHERE email = ?")
    .get(email) as
    | { id: number; email: string; password_hash: string }
    | undefined;

  // Mesma resposta para e-mail inexistente e senha errada, para não revelar
  // quais e-mails têm conta.
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return NextResponse.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 },
    );
  }

  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, email: user.email } });
}
