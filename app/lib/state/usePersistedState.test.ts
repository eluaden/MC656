import { renderHook, act, waitFor } from "@testing-library/react";
import { usePersistedState } from "./usePersistedState";

// useAuth controlável: cada teste ajusta `mockAuth` antes de renderizar.
// (o nome precisa começar com "mock" para ser usado na fábrica do jest.mock)
let mockAuth: {
  user: { id: number; email: string } | null;
  status: "loading" | "ready";
  refresh: () => void;
};
jest.mock("../auth/AuthProvider", () => ({
  useAuth: () => mockAuth,
}));

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

type Counter = { value: number };
const DEFAULT: Counter = { value: 0 };
const normalize = (raw: unknown): Counter => {
  if (raw && typeof raw === "object" && "value" in raw) {
    const v = Number((raw as { value: unknown }).value);
    return { value: Number.isFinite(v) ? v : 0 };
  }
  return DEFAULT;
};

const options = {
  namespace: "costPlanner",
  anonKey: "anon:counter",
  defaultState: DEFAULT,
  normalize,
};

beforeEach(() => {
  localStorageMock.clear();
  mockAuth = { user: null, status: "ready", refresh: () => {} };
  jest.restoreAllMocks();
});

describe("usePersistedState — anônimo (localStorage)", () => {
  it("carrega o estado do localStorage e normaliza", async () => {
    localStorageMock.setItem("anon:counter", JSON.stringify({ value: 7 }));

    const { result } = renderHook(() => usePersistedState(options));

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.state.value).toBe(7);
  });

  it("salva no localStorage ao mudar o estado", async () => {
    const { result } = renderHook(() => usePersistedState(options));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.setState({ value: 42 }));

    await waitFor(() =>
      expect(localStorageMock.getItem("anon:counter")).toBe(
        JSON.stringify({ value: 42 }),
      ),
    );
  });
});

describe("usePersistedState — autenticado (servidor)", () => {
  it("carrega o estado via GET /api/state/<namespace>", async () => {
    mockAuth = { user: { id: 1, email: "a@a" }, status: "ready", refresh: () => {} };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ state: { value: 9 } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => usePersistedState(options));

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.state.value).toBe(9);
    expect(fetchMock).toHaveBeenCalledWith("/api/state/costPlanner");
  });

  it("faz PUT (debounced) ao mudar o estado", async () => {
    mockAuth = { user: { id: 1, email: "a@a" }, status: "ready", refresh: () => {} };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ state: null }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => usePersistedState(options));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.setState({ value: 5 }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/state/costPlanner",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ state: { value: 5 } }),
        }),
      ),
    );
  });

  it("não salva antes de a carga terminar (status loading)", async () => {
    mockAuth = { user: { id: 1, email: "a@a" }, status: "loading", refresh: () => {} };
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => usePersistedState(options));

    // Enquanto a sessão carrega, nada é buscado nem salvo.
    expect(result.current.isLoaded).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("usePersistedState — troca de identidade", () => {
  it("recarrega o bucket ao passar de anônimo para autenticado", async () => {
    localStorageMock.setItem("anon:counter", JSON.stringify({ value: 1 }));
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ state: { value: 99 } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result, rerender } = renderHook(() => usePersistedState(options));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.state.value).toBe(1); // bucket anônimo

    // Login: a identidade muda → recarrega do servidor.
    mockAuth = { user: { id: 7, email: "b@b" }, status: "ready", refresh: () => {} };
    rerender();

    await waitFor(() => expect(result.current.state.value).toBe(99));
    expect(fetchMock).toHaveBeenCalledWith("/api/state/costPlanner");
  });
});
