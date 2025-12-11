import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { UserProvider, useUser } from "@/libs/storage/UserContext";
import { api_route } from "@/libs/auth/api";

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

// REMOVIDO: jest.mock("react-native", ...) <- O vilão estava aqui

describe("UserContext and UserProvider", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Limpa storage mockado do setup
    require("expo-secure-store").getItemAsync.mockResolvedValue(null);
  });

  it("useUser throws when used outside provider", () => {
    const Component = () => { useUser(); return null; };
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Component />)).toThrow();
    spy.mockRestore();
  });

  it("setUser persists data (Native flow)", async () => {
    const { getItemAsync, setItemAsync } = require("expo-secure-store");
    
    const Child = () => {
      const { setUser } = useUser();
      React.useEffect(() => {
        setUser({ id: "u1", name: "n", userName: "u", email: "e", token: "t", notificationsAllowed: true });
      }, []);
      return null;
    };

    render(<UserProvider><Child /></UserProvider>);
    
    await waitFor(() => {
        expect(setItemAsync).toHaveBeenCalledWith("userData", expect.stringContaining('"id":"u1"'));
    });
  });

  it("logout clears storage and redirects", async () => {
    const { deleteItemAsync } = require("expo-secure-store");

    const Child = () => {
      const { setUser, logout } = useUser();
      React.useEffect(() => {
        setUser({ id: "u2", name: "n", userName: "u", email: "e", token: "t", notificationsAllowed: true });
        logout();
      }, []);
      return null;
    };

    render(<UserProvider><Child /></UserProvider>);

    await waitFor(() => {
      expect(deleteItemAsync).toHaveBeenCalledWith("userData");
      expect(router.replace).toHaveBeenCalledWith("/(Auth)/login");
    });
  });
});