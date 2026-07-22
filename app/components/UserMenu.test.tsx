import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserMenu } from "./UserMenu";

// useAuth controlável por teste.
let mockAuth: {
  user: { id: number; email: string } | null;
  status: "loading" | "ready";
  refresh: jest.Mock;
};
jest.mock("../lib/auth/AuthProvider", () => ({
  useAuth: () => mockAuth,
}));

const mockRouterRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRouterRefresh }),
}));

const mockClearAnonState = jest.fn();
jest.mock("../lib/state/anonState", () => ({
  clearAnonState: () => mockClearAnonState(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth = { user: null, status: "ready", refresh: jest.fn() };
  global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;
});

describe("UserMenu", () => {
  it("ao sair da conta, limpa os baldes anônimos antes de recarregar a sessão", async () => {
    mockAuth = {
      user: { id: 1, email: "a@a" },
      status: "ready",
      refresh: jest.fn(),
    };

    render(<UserMenu />);
    fireEvent.click(screen.getByText("Sair"));

    await waitFor(() => expect(mockClearAnonState).toHaveBeenCalledTimes(1));
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
    });
    expect(mockAuth.refresh).toHaveBeenCalledTimes(1);
  });

  it("mostra 'Entrar' quando anônimo (sem opção de limpar)", () => {
    render(<UserMenu />);
    expect(screen.getByText("Entrar")).toBeInTheDocument();
    expect(screen.queryByText("Sair")).not.toBeInTheDocument();
  });
});
