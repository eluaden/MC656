// Regras de cadastro (issue #13): e-mail válido e senha forte.
// Funções puras para facilitar os testes.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;

/** Retorna a mensagem de erro, ou null se o e-mail é válido. */
export function validateEmail(email: string): string | null {
  if (!email || email.trim() === "") return "Informe um e-mail.";
  if (!EMAIL_PATTERN.test(email.trim())) return "E-mail inválido.";
  return null;
}

/**
 * Senha forte: pelo menos 8 caracteres, com ao menos uma letra e um número.
 * Retorna a mensagem de erro, ou null se a senha é válida.
 */
export function validatePassword(password: string): string | null {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (!/[a-zA-Z]/.test(password)) {
    return "A senha precisa conter pelo menos uma letra.";
  }
  if (!/[0-9]/.test(password)) {
    return "A senha precisa conter pelo menos um número.";
  }
  return null;
}

/** Normaliza o e-mail para armazenamento/consulta (minúsculas, sem espaços). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
