// Testes por Partição de Equivalência das regras de cadastro (issue #13):
// e-mail válido/ inválido e senha forte (tamanho, letra, número).

import {
  normalizeEmail,
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validatePassword,
} from "./validation";

describe("validateEmail", () => {
  it("aceita e-mails válidos", () => {
    expect(validateEmail("ana@exemplo.com")).toBeNull();
    expect(validateEmail("a.b+tag@sub.dominio.org")).toBeNull();
  });

  it("rejeita e-mail vazio ou só espaços", () => {
    expect(validateEmail("")).not.toBeNull();
    expect(validateEmail("   ")).not.toBeNull();
  });

  it("rejeita formatos inválidos", () => {
    expect(validateEmail("sem-arroba.com")).not.toBeNull();
    expect(validateEmail("sem@dominio")).not.toBeNull();
    expect(validateEmail("com espaco@exemplo.com")).not.toBeNull();
    expect(validateEmail("@exemplo.com")).not.toBeNull();
  });
});

describe("validatePassword", () => {
  it("aceita senha forte (8+ caracteres com letra e número)", () => {
    expect(validatePassword("abc12345")).toBeNull();
    expect(validatePassword("Senha123!")).toBeNull();
  });

  it("aceita exatamente o mínimo e rejeita um caractere a menos", () => {
    const minValid = "a".repeat(PASSWORD_MIN_LENGTH - 1) + "1"; // 8 chars
    expect(validatePassword(minValid)).toBeNull();
    expect(validatePassword(minValid.slice(1))).not.toBeNull(); // 7 chars
  });

  it("rejeita senha vazia", () => {
    expect(validatePassword("")).not.toBeNull();
  });

  it("rejeita senha sem letras", () => {
    expect(validatePassword("12345678")).not.toBeNull();
  });

  it("rejeita senha sem números", () => {
    expect(validatePassword("abcdefgh")).not.toBeNull();
  });
});

describe("normalizeEmail", () => {
  it("remove espaços e converte para minúsculas", () => {
    expect(normalizeEmail("  Ana@Exemplo.COM ")).toBe("ana@exemplo.com");
  });
});
