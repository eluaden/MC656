"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  validateEmail,
  validatePassword,
} from "../lib/auth/validation";
import { useAuth } from "../lib/auth/AuthProvider";

type Mode = "login" | "register";

export function AuthForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Valida no cliente antes de enviar (o servidor revalida).
    const emailError = validateEmail(email);
    if (emailError) return setError(emailError);
    if (mode === "register") {
      const passwordError = validatePassword(password);
      if (passwordError) return setError(passwordError);
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Algo deu errado. Tente novamente.");
        return;
      }
      // O provider vive no root layout e persiste na navegação client-side;
      // refresh() força o rebusca da sessão para os hooks carregarem o bucket
      // do usuário recém-autenticado.
      refresh();
      router.push("/");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  return (
    <div className="relative z-[1] w-full max-w-sm rounded-2xl border border-white/[0.08] bg-black/60 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <h1 className="text-center text-2xl font-bold text-white">AgroGlobe</h1>
      <p className="mt-1 text-center text-sm text-gray-400">
        {mode === "login"
          ? "Entre para acessar seus planejamentos."
          : "Crie sua conta para proteger seus planejamentos."}
      </p>

      <div className="mt-5 flex rounded-xl border border-white/[0.08] p-1">
        {(["login", "register"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => switchMode(option)}
            aria-pressed={mode === option}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              mode === option
                ? "bg-emerald-500/20 text-emerald-300"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {option === "login" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <label className="block">
          <span className="text-xs font-medium text-gray-400">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-white placeholder-gray-600 focus:border-emerald-400/50 focus:outline-none"
            placeholder="voce@exemplo.com"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-400">Senha</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-white placeholder-gray-600 focus:border-emerald-400/50 focus:outline-none"
            placeholder={
              mode === "register" ? "Mín. 8 caracteres, letras e números" : "Sua senha"
            }
          />
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Enviando..."
            : mode === "login"
              ? "Entrar"
              : "Criar conta"}
        </button>
      </form>

      <Link
        href="/"
        className="mt-4 block text-center text-sm text-gray-500 transition hover:text-gray-300"
      >
        ← Voltar para o início
      </Link>
    </div>
  );
}
