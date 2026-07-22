import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/auth/session";
import { getUserState, setUserState } from "../../../lib/state/userState";

// Namespaces permitidos: um por funcionalidade que persiste estado por usuário.
const ALLOWED = new Set(["costPlanner", "cropGrid", "fieldConditions"]);

type Context = { params: Promise<{ namespace: string }> };

/** Estado do usuário autenticado para o namespace, ou null se não houver. */
export async function GET(_req: Request, { params }: Context) {
  const { namespace } = await params;
  if (!ALLOWED.has(namespace)) {
    return NextResponse.json({ error: "Namespace inválido." }, { status: 400 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const raw = getUserState(user.id, namespace);
  return NextResponse.json({ state: raw ? JSON.parse(raw) : null });
}

/** Salva o estado do usuário autenticado para o namespace. */
export async function PUT(req: Request, { params }: Context) {
  const { namespace } = await params;
  if (!ALLOWED.has(namespace)) {
    return NextResponse.json({ error: "Namespace inválido." }, { status: 400 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: { state?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  setUserState(user.id, namespace, JSON.stringify(body.state ?? null));
  return NextResponse.json({ ok: true });
}
