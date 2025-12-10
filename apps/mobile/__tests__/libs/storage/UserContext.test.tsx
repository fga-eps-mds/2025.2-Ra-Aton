import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { UserProvider, useUser } from "@/libs/storage/UserContext";
import { api_route } from "@/libs/auth/api";

// --- MOCKS GLOBAIS ---

// 1. Mock do Router
jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));
const router = require("expo-router").router;

// 2. Mock do SecureStore
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// 3. Mock da API
jest.mock("@/libs/auth/api", () => ({
  api_route: { delete: jest.fn() },
}));

// 4. MOCK DINÂMICO DE REACT NATIVE (A SOLUÇÃO)
let mockOS = "web";
const mockAlert = jest.fn();

jest.mock("react-native", () => {
  return {
    Platform: {
      get OS() {
        return mockOS;
      },
      select: (objs: any) => objs[mockOS] || objs.default,
    },
    Alert: {
      alert: (...args: any[]) => mockAlert(...args),
    },
    // Mocks simplificados para não depender do nativo
    View: "View",
    Text: "Text",
  };
});

describe("UserContext and UserProvider", () => {
  beforeEach(() => {
    // NÃO USAR jest.resetModules() AQUI!
    jest.clearAllMocks();
    mockOS = "web";

    // Mock do LocalStorage
    const store: Record<string, string> = {};
    (global as any).localStorage = {
      getItem: jest.fn((k) => store[k] || null),
      setItem: jest.fn((k, v) => {
        store[k] = v;
      }),
      removeItem: jest.fn((k) => {
        delete store[k];
      }),
    };
  });

  it("useUser throws when used outside provider", () => {
    // Silencia o erro de console esperado do React
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const Component = () => {
      useUser();
      return null;
    };

    expect(() => render(<Component />)).toThrow();
    spy.mockRestore();
  });

  it("setUser persists on web via localStorage", async () => {
    mockOS = "web";

    const Child = () => {
      const { setUser } = useUser();
      React.useEffect(() => {
        setUser({
          id: "u1",
          name: "n",
          userName: "u",
          email: "e",
          token: "t",
          notificationsAllowed: true,
        });
      }, []);
      return null;
    };

    render(
      <UserProvider>
        <Child />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "userData",
        expect.stringContaining('"id":"u1"'),
      );
    });
  });

  it("logout clears storage and calls router.replace (WEB)", async () => {
    mockOS = "web";

    const Child = () => {
      const { setUser, logout } = useUser();
      React.useEffect(() => {
        setUser({
          id: "u2",
          name: "n",
          userName: "u",
          email: "e",
          token: "t",
          notificationsAllowed: true,
        });
        logout();
      }, []);
      return null;
    };

    render(
      <UserProvider>
        <Child />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith("userData");
      expect(router.replace).toHaveBeenCalledWith("/(Auth)/login");
    });
  });

  it("deleteAccount success (204) shows success alert and logs out", async () => {
    mockOS = "web";

    // Configura o Mock do Alert para simular o clique no OK
    mockAlert.mockImplementation((title, msg, buttons) => {
      const btn = buttons?.find((b: any) => b.text === "OK");
      if (btn?.onPress) btn.onPress();
    });

    // Simula usuário no storage
    (localStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify({
        id: "u3",
        name: "nome",
        userName: "u3",
        token: "t",
        notificationsAllowed: true,
      }),
    );

    (api_route.delete as jest.Mock).mockResolvedValue({ status: 204 });

    const Child = () => {
      const { loading, deleteAccount } = useUser();
      React.useEffect(() => {
        if (!loading) deleteAccount();
      }, [loading]);
      return null;
    };

    render(
      <UserProvider>
        <Child />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(api_route.delete).toHaveBeenCalledWith(`/users/u3`);
      expect(mockAlert).toHaveBeenCalledWith(
        "Conta excluída",
        expect.any(String),
        expect.any(Array),
      );
      expect(router.replace).toHaveBeenCalledWith("/(Auth)/login");
    });
  });

  it("deleteAccount failure shows backend message in alert", async () => {
    mockOS = "web";

    (localStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify({
        id: "u4",
        name: "nome",
        userName: "u4",
        token: "t",
        notificationsAllowed: true,
      }),
    );

    (api_route.delete as jest.Mock).mockRejectedValue({
      response: { data: { message: "Não foi possível" } },
    });

    const Child = () => {
      const { loading, deleteAccount } = useUser();
      React.useEffect(() => {
        if (!loading) deleteAccount();
      }, [loading]);
      return null;
    };

    render(
      <UserProvider>
        <Child />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(api_route.delete).toHaveBeenCalledWith(`/users/u4`);
      expect(mockAlert).toHaveBeenCalledWith(
        "Erro ao excluir conta",
        expect.stringContaining("Não foi possível"),
      );
    });
  });
});