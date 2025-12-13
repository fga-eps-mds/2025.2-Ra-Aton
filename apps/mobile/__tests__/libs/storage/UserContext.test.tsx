import React from "react";
import { render, waitFor, act } from "@testing-library/react-native";
import { Alert, Platform } from "react-native";
import { UserProvider, useUser } from "@/libs/storage/UserContext";
import { api_route } from "@/libs/auth/api";
import * as SecureStore from "expo-secure-store";

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));
const router = require("expo-router").router;

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("@/libs/auth/api", () => ({
  api_route: { delete: jest.fn() }
}));

jest.mock("@/libs/notifications/syncPushToken", () => ({
  removePushToken: jest.fn().mockResolvedValue(undefined),
}));

jest.spyOn(Alert, "alert").mockImplementation(() => { });

describe("UserContext and UserProvider", () => {
  const originalLocalStorage = global.localStorage;
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    key: jest.fn(),
    length: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).localStorage = mockLocalStorage;
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    jest.spyOn(console, "log").mockImplementation(() => { });
    jest.spyOn(console, "warn").mockImplementation(() => { });
  });

  afterAll(() => {
    (global as any).localStorage = originalLocalStorage;
  });

  it("useUser throws when used outside provider", () => {
    const Component = () => { useUser(); return null; };
    const spy = jest.spyOn(console, 'error').mockImplementation(() => { });
    expect(() => render(<Component />)).toThrow("useUser must be used within a UserProvider");
    spy.mockRestore();
  });

  it("deve carregar usuário do SecureStore ao montar (Native)", async () => {
    const userData = { id: "u1", name: "João", userName: "joao", email: "joao@email.com", token: "token123", notificationsAllowed: true };
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(JSON.stringify(userData));

    let capturedUser: any = null;
    const Child = () => {
      const { user, loading } = useUser();
      capturedUser = user;
      return null;
    };

    render(<UserProvider><Child /></UserProvider>);

    await waitFor(() => {
      expect(capturedUser).toEqual(userData);
    });
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("userData");
  });

  it("deve definir loading como false após carregar usuário", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

    let capturedLoading: boolean = true;
    const Child = () => {
      const { loading } = useUser();
      capturedLoading = loading;
      return null;
    };

    render(<UserProvider><Child /></UserProvider>);

    await waitFor(() => {
      expect(capturedLoading).toBe(false);
    });
  });

  it("setUser persists data (Native flow)", async () => {
    const Child = () => {
      const { setUser } = useUser();
      React.useEffect(() => {
        setUser({ id: "u1", name: "n", userName: "u", email: "e", token: "t", notificationsAllowed: true });
      }, []);
      return null;
    };

    render(<UserProvider><Child /></UserProvider>);

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith("userData", expect.stringContaining('"id":"u1"'));
    });
  });

  it("setUser com null deve remover dados do storage (Native)", async () => {
    const Child = () => {
      const { setUser } = useUser();
      React.useEffect(() => {
        setUser({ id: "u1", name: "n", userName: "u", email: "e", token: "t", notificationsAllowed: true });
        setUser(null);
      }, []);
      return null;
    };

    render(<UserProvider><Child /></UserProvider>);

    await waitFor(() => {
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("userData");
    });
  });

  it("logout clears storage and redirects", async () => {
    const { removePushToken } = require("@/libs/notifications/syncPushToken");

    const Child = () => {
      const { setUser, logout, user } = useUser();
      const [isSet, setIsSet] = React.useState(false);

      React.useEffect(() => {
        setUser({ id: "u2", name: "n", userName: "u", email: "e", token: "t", notificationsAllowed: true });
        setIsSet(true);
      }, []);

      React.useEffect(() => {
        if (isSet && user?.token) {
          logout();
        }
      }, [isSet, user]);

      return null;
    };

    render(<UserProvider><Child /></UserProvider>);

    await waitFor(() => {
      expect(removePushToken).toHaveBeenCalledWith("t");
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("userData");
      expect(router.replace).toHaveBeenCalledWith("/(Auth)/login");
    });
  });

  it("deleteAccount deve exibir alerta de erro quando usuário não existe", async () => {
    const Child = () => {
      const { deleteAccount } = useUser();
      React.useEffect(() => {
        deleteAccount();
      }, []);
      return null;
    };

    render(<UserProvider><Child /></UserProvider>);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Erro", "Usuário não encontrado");
    });
  });

  it("deleteAccount deve excluir conta com sucesso", async () => {
    (api_route.delete as jest.Mock).mockResolvedValueOnce({ status: 204 });

    const Child = () => {
      const { setUser, deleteAccount } = useUser();
      React.useEffect(() => {
        setUser({ id: "u1", name: "Test", userName: "testuser", email: "test@email.com", token: "token", notificationsAllowed: true });
      }, []);
      return null;
    };

    const { rerender } = render(<UserProvider><Child /></UserProvider>);

    // Aguarda o setUser ser processado
    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalled();
    });

    // Agora chama deleteAccount
    const ChildDelete = () => {
      const { deleteAccount, user } = useUser();
      React.useEffect(() => {
        if (user) {
          deleteAccount();
        }
      }, [user]);
      return null;
    };

    rerender(<UserProvider><ChildDelete /></UserProvider>);

    await waitFor(() => {
      expect(api_route.delete).toHaveBeenCalledWith("/users/testuser");
      expect(Alert.alert).toHaveBeenCalledWith(
        "Conta excluída",
        "Sua conta foi excluída com sucesso",
        expect.any(Array)
      );
    });
  });

  it("deleteAccount deve tratar erro da API", async () => {
    (api_route.delete as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const Child = () => {
      const { setUser, deleteAccount } = useUser();
      React.useEffect(() => {
        setUser({ id: "u1", name: "Test", userName: "testuser", email: "test@email.com", token: "token", notificationsAllowed: true });
        setTimeout(() => deleteAccount(), 100);
      }, []);
      return null;
    };

    render(<UserProvider><Child /></UserProvider>);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Erro ao excluir conta", expect.any(String));
    }, { timeout: 3000 });
  });

  it("deleteAccount deve tratar resposta inesperada do servidor", async () => {
    (api_route.delete as jest.Mock).mockResolvedValueOnce({ status: 500 });

    const Child = () => {
      const { setUser, deleteAccount } = useUser();
      React.useEffect(() => {
        setUser({ id: "u1", name: "Test", userName: "testuser", email: "test@email.com", token: "token", notificationsAllowed: true });
        setTimeout(() => deleteAccount(), 100);
      }, []);
      return null;
    };

    render(<UserProvider><Child /></UserProvider>);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Erro ao excluir conta", expect.any(String));
    }, { timeout: 3000 });
  });

  it("confirmDelete deve exibir alerta de confirmação", async () => {
    const Child = () => {
      const { confirmDelete } = useUser();
      React.useEffect(() => {
        confirmDelete();
      }, []);
      return null;
    };

    render(<UserProvider><Child /></UserProvider>);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Confirmar exclusão",
        "Tem certeza que deseja excluir sua conta? Esta ação é irreversível.",
        expect.arrayContaining([
          expect.objectContaining({ text: "Cancelar", style: "cancel" }),
          expect.objectContaining({ text: "Excluir", style: "destructive" }),
        ])
      );
    });
  });

  describe("Plataforma Web", () => {
    beforeEach(() => {
      jest.replaceProperty(Platform, "OS", "web");
    });

    it("deve carregar usuário do localStorage ao montar (Web)", async () => {
      const userData = { id: "web1", name: "Maria", userName: "maria", email: "maria@email.com", token: "webtoken", notificationsAllowed: true };
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(userData));

      let capturedUser: any = null;
      const Child = () => {
        const { user } = useUser();
        capturedUser = user;
        return null;
      };

      render(<UserProvider><Child /></UserProvider>);

      await waitFor(() => {
        expect(capturedUser).toEqual(userData);
      });
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("userData");
    });

    it("setUser deve salvar no localStorage (Web)", async () => {
      const Child = () => {
        const { setUser } = useUser();
        React.useEffect(() => {
          setUser({ id: "web2", name: "Ana", userName: "ana", email: "ana@email.com", token: "t", notificationsAllowed: false });
        }, []);
        return null;
      };

      render(<UserProvider><Child /></UserProvider>);

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith("userData", expect.stringContaining('"id":"web2"'));
      });
    });

    it("setUser com null deve remover do localStorage (Web)", async () => {
      const Child = () => {
        const { setUser } = useUser();
        React.useEffect(() => {
          setUser({ id: "web3", name: "n", userName: "u", email: "e", token: "t", notificationsAllowed: true });
          setUser(null);
        }, []);
        return null;
      };

      render(<UserProvider><Child /></UserProvider>);

      await waitFor(() => {
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("userData");
      });
    });

    it("logout deve remover do localStorage e redirecionar (Web)", async () => {
      const Child = () => {
        const { setUser, logout } = useUser();
        React.useEffect(() => {
          setUser({ id: "web4", name: "n", userName: "u", email: "e", token: "t", notificationsAllowed: true });
          logout();
        }, []);
        return null;
      };

      render(<UserProvider><Child /></UserProvider>);

      await waitFor(() => {
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("userData");
        expect(router.replace).toHaveBeenCalledWith("/(Auth)/login");
      });
    });
  });
});