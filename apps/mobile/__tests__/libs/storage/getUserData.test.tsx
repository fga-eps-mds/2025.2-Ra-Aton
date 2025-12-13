import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getUserData } from "@/libs/storage/getUserData";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe("getUserData", () => {
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
  });

  afterAll(() => {
    (global as any).localStorage = originalLocalStorage;
  });

  describe("Plataforma Nativa (iOS/Android)", () => {
    beforeEach(() => {
      jest.replaceProperty(Platform, "OS", "ios");
    });

    it("deve retornar dados parseados do SecureStore", async () => {
      const userData = { id: "u1", name: "João", email: "joao@email.com" };
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(JSON.stringify(userData));

      const result = await getUserData();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith("userData");
      expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(1);
      expect(result).toEqual(userData);
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
    });

    it("deve retornar null quando não houver dados no SecureStore", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      const result = await getUserData();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith("userData");
      expect(result).toBeNull();
    });

    it("deve retornar dados complexos aninhados do SecureStore", async () => {
      const complexData = {
        id: "user-123",
        profile: {
          name: "Maria",
          settings: { theme: "dark", notifications: true },
        },
        tags: ["admin", "verified"],
      };
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(JSON.stringify(complexData));

      const result = await getUserData();

      expect(result).toEqual(complexData);
    });

    it("deve propagar erro quando SecureStore falhar", async () => {
      const error = new Error("Secure storage error");
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(error);

      await expect(getUserData()).rejects.toThrow("Secure storage error");
    });
  });

  describe("Plataforma Web", () => {
    beforeEach(() => {
      jest.replaceProperty(Platform, "OS", "web");
    });

    it("deve retornar dados parseados do localStorage", async () => {
      const userData = { id: "web1", name: "Ana", email: "ana@email.com" };
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(userData));

      const result = await getUserData();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("userData");
      expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1);
      expect(result).toEqual(userData);
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    });

    it("deve retornar null quando não houver dados no localStorage", async () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);

      const result = await getUserData();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("userData");
      expect(result).toBeNull();
    });

    it("deve retornar dados com caracteres especiais do localStorage", async () => {
      const userData = {
        id: "special-user",
        bio: "Olá! 🎉 Bem-vindo!",
        symbols: "!@#$%^&*()",
      };
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(userData));

      const result = await getUserData();

      expect(result).toEqual(userData);
    });
  });
});
