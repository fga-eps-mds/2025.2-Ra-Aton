// Tests for libs/storage/UserContext.tsx
jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));
const router = require("expo-router").router;
const React = require("react");
const { render, waitFor } = require("@testing-library/react-native");

describe("UserContext and UserProvider", () => {
  beforeEach(() => {
    // do not reset modules here to avoid multiple React instances
    // ensure Alert exists
    const rn = require("react-native");
    rn.Alert = rn.Alert || { alert: jest.fn() };
    // provide a simple localStorage shim for Node test environment
    (global as any).localStorage = (global as any).localStorage || {
      getItem: jest.fn(() => null),
      setItem: jest.fn(() => {}),
      removeItem: jest.fn(() => {}),
    };
  });

  it("useUser throws when used outside provider (rendering component)", () => {
    const { useUser } = require("@/libs/storage/UserContext");
    const Component = () => {
      useUser();
      return null;
    };
    expect(() => render(React.createElement(Component))).toThrow();
  });

  it("setUser persists on web via localStorage", async () => {
    const rn = require("react-native");
    rn.Platform = { OS: "web" };
    const { UserProvider, useUser } = require("@/libs/storage/UserContext");

    const Child = () => {
      const { setUser } = useUser();
      React.useEffect(() => {
        setUser({ id: "u1", name: "n", userName: "u", email: "e", token: "t", notificationsAllowed: true });
      }, []);
      return null;
    };

    const { unmount } = render(React.createElement(UserProvider, null, React.createElement(Child)));
    // ensure setItem was called with userData
    expect(localStorage.setItem).toHaveBeenCalledWith("userData", expect.stringContaining('"id":"u1"'));
    unmount();
  });

  it("logout clears storage and calls router.replace", async () => {
    const rn = require("react-native");
    rn.Platform = { OS: "web" };
    const { UserProvider, useUser } = require("@/libs/storage/UserContext");

    const Child = () => {
      const { setUser, logout } = useUser();
      React.useEffect(() => {
        setUser({ id: "u2", name: "n", userName: "u2", email: "e", token: "t", notificationsAllowed: true });
        logout();
      }, []);
      return null;
    };

    render(React.createElement(UserProvider, null, React.createElement(Child)));
    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith("userData");
      expect(router.replace).toHaveBeenCalledWith("/(Auth)/login");
    });
  });

  it("deleteAccount success (204) shows success alert and logs out", async () => {
    const rn = require("react-native");
    rn.Platform = { OS: "web" };
    // ensure the provider loads a user from storage on mount
    localStorage.getItem = jest.fn(() => JSON.stringify({ id: "u3", name: "nome", userName: "u3", email: "e", token: "t", notificationsAllowed: true }));
    const { UserProvider, useUser } = require("@/libs/storage/UserContext");

    // mock api_route.delete to return 204
    const api = require("@/libs/auth/api");
    api.api_route.delete = jest.fn().mockResolvedValue({ status: 204 });

    // mock Alert.alert so OK button triggers its onPress immediately
    const rnMod = require("react-native");
    rnMod.Alert = {
      alert: jest.fn((title: string, msg: string, buttons: any[]) => {
        const ok = buttons && buttons.find((b: any) => b.text === "OK");
        if (ok && ok.onPress) ok.onPress();
      }),
    };

    const Child = () => {
      const { loading, deleteAccount } = useUser();
      React.useEffect(() => {
        if (!loading) deleteAccount();
      }, [loading]);
      return null;
    };

    render(React.createElement(UserProvider, null, React.createElement(Child)));

    await waitFor(() => {
      expect(api.api_route.delete).toHaveBeenCalledWith(`/users/u3`);
      expect(localStorage.removeItem).toHaveBeenCalledWith("userData");
      expect(router.replace).toHaveBeenCalledWith("/(Auth)/login");
      expect((require("react-native").Alert.alert as jest.Mock)).toHaveBeenCalledWith(
        "Conta excluída",
        expect.any(String),
        expect.any(Array),
      );
    });
  });

  it("deleteAccount failure shows backend message in alert", async () => {
    const rn = require("react-native");
    rn.Platform = { OS: "web" };
    // ensure the provider loads a user from storage on mount
    localStorage.getItem = jest.fn(() => JSON.stringify({ id: "u4", name: "nome", userName: "u4", email: "e", token: "t", notificationsAllowed: true }));
    const { UserProvider, useUser } = require("@/libs/storage/UserContext");

    // mock api_route.delete to reject with response.data.message
    const api = require("@/libs/auth/api");
    api.api_route.delete = jest.fn().mockRejectedValue({ response: { data: { message: "Não foi possível" } } });

    // capture Alert calls
    const rnMod = require("react-native");
    rnMod.Alert = { alert: jest.fn() };

    const Child = () => {
      const { loading, deleteAccount } = useUser();
      React.useEffect(() => {
        if (!loading) deleteAccount();
      }, [loading]);
      return null;
    };

    render(React.createElement(UserProvider, null, React.createElement(Child)));

    await waitFor(() => {
      expect(api.api_route.delete).toHaveBeenCalledWith(`/users/u4`);
      expect((require("react-native").Alert.alert as jest.Mock)).toHaveBeenCalledWith(
        "Erro ao excluir conta",
        expect.stringContaining("Não foi possível"),
      );
    });
  });
});
