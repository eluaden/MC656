import { ANON_STATE_KEYS, clearAnonState } from "./anonState";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  jest.restoreAllMocks();
});

describe("clearAnonState", () => {
  it("apaga todos os baldes anônimos do localStorage", () => {
    for (const key of Object.values(ANON_STATE_KEYS)) {
      localStorage.setItem(key, JSON.stringify({ any: "data" }));
    }

    clearAnonState();

    for (const key of Object.values(ANON_STATE_KEYS)) {
      expect(localStorage.getItem(key)).toBeNull();
    }
  });

  it("não afeta chaves de outras funcionalidades", () => {
    localStorage.setItem("outraChave", "manter");

    clearAnonState();

    expect(localStorage.getItem("outraChave")).toBe("manter");
  });

  it("é seguro quando o localStorage lança (ex.: modo privado)", () => {
    jest.spyOn(localStorage, "removeItem").mockImplementation(() => {
      throw new Error("indisponível");
    });

    expect(() => clearAnonState()).not.toThrow();
  });
});
