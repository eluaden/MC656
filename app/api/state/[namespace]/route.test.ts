/**
 * @jest-environment node
 */
import { GET, PUT } from "./route";
import { getSessionUser } from "../../../lib/auth/session";
import { getUserState, setUserState } from "../../../lib/state/userState";

jest.mock("../../../lib/auth/session", () => ({
  getSessionUser: jest.fn(),
}));
jest.mock("../../../lib/state/userState", () => ({
  getUserState: jest.fn(),
  setUserState: jest.fn(),
}));

const mockGetSessionUser = getSessionUser as jest.Mock;
const mockGetUserState = getUserState as jest.Mock;
const mockSetUserState = setUserState as jest.Mock;

const ctx = (namespace: string) => ({ params: Promise.resolve({ namespace }) });
const jsonReq = (body: unknown) =>
  ({ json: async () => body }) as unknown as Request;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/state/[namespace]", () => {
  it("400 para namespace inválido", async () => {
    mockGetSessionUser.mockResolvedValue({ id: 1, email: "a@a" });
    const res = await GET({} as Request, ctx("hackerNamespace"));
    expect(res.status).toBe(400);
  });

  it("401 sem sessão", async () => {
    mockGetSessionUser.mockResolvedValue(null);
    const res = await GET({} as Request, ctx("costPlanner"));
    expect(res.status).toBe(401);
  });

  it("devolve o estado salvo (parseado)", async () => {
    mockGetSessionUser.mockResolvedValue({ id: 1, email: "a@a" });
    mockGetUserState.mockReturnValue(JSON.stringify({ value: 7 }));

    const res = await GET({} as Request, ctx("costPlanner"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ state: { value: 7 } });
    expect(mockGetUserState).toHaveBeenCalledWith(1, "costPlanner");
  });

  it("devolve null quando não há registro", async () => {
    mockGetSessionUser.mockResolvedValue({ id: 1, email: "a@a" });
    mockGetUserState.mockReturnValue(null);

    const res = await GET({} as Request, ctx("cropGrid"));
    expect(await res.json()).toEqual({ state: null });
  });
});

describe("PUT /api/state/[namespace]", () => {
  it("400 para namespace inválido", async () => {
    mockGetSessionUser.mockResolvedValue({ id: 1, email: "a@a" });
    const res = await PUT(jsonReq({ state: {} }), ctx("nope"));
    expect(res.status).toBe(400);
    expect(mockSetUserState).not.toHaveBeenCalled();
  });

  it("401 sem sessão", async () => {
    mockGetSessionUser.mockResolvedValue(null);
    const res = await PUT(jsonReq({ state: {} }), ctx("costPlanner"));
    expect(res.status).toBe(401);
    expect(mockSetUserState).not.toHaveBeenCalled();
  });

  it("salva o estado serializado e responde ok", async () => {
    mockGetSessionUser.mockResolvedValue({ id: 42, email: "a@a" });
    const res = await PUT(jsonReq({ state: { value: 3 } }), ctx("fieldConditions"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mockSetUserState).toHaveBeenCalledWith(
      42,
      "fieldConditions",
      JSON.stringify({ value: 3 }),
    );
  });

  it("round-trip GET/PUT: lê de volta o que foi salvo", async () => {
    mockGetSessionUser.mockResolvedValue({ id: 1, email: "a@a" });
    const store: Record<string, string> = {};
    mockSetUserState.mockImplementation((id, ns, state) => {
      store[`${id}:${ns}`] = state;
    });
    mockGetUserState.mockImplementation((id, ns) => store[`${id}:${ns}`] ?? null);

    await PUT(jsonReq({ state: { value: 5 } }), ctx("costPlanner"));
    const res = await GET({} as Request, ctx("costPlanner"));

    expect(await res.json()).toEqual({ state: { value: 5 } });
  });
});
