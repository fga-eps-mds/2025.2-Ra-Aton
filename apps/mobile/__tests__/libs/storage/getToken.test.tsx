import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getToken } from "@/libs/storage/getToken";

jest.mock("expo-secure-store", () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

describe("getToken", () => {
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

        it("deve retornar o token do SecureStore", async () => {
            const expectedToken = "meu-token-123";
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(expectedToken);

            const result = await getToken();

            expect(SecureStore.getItemAsync).toHaveBeenCalledWith("userToken");
            expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(1);
            expect(result).toBe(expectedToken);
            expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
        });

        it("deve retornar null quando não houver token no SecureStore", async () => {
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

            const result = await getToken();

            expect(SecureStore.getItemAsync).toHaveBeenCalledWith("userToken");
            expect(result).toBeNull();
        });

        it("deve propagar erro quando SecureStore falhar", async () => {
            const error = new Error("Secure storage error");
            (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(error);

            await expect(getToken()).rejects.toThrow("Secure storage error");
        });
    });

    describe("Plataforma Web", () => {
        beforeEach(() => {
            jest.replaceProperty(Platform, "OS", "web");
        });

        it("deve retornar o token do localStorage", async () => {
            const expectedToken = "web-token-456";
            mockLocalStorage.getItem.mockReturnValueOnce(expectedToken);

            const result = await getToken();

            expect(mockLocalStorage.getItem).toHaveBeenCalledWith("userToken");
            expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1);
            expect(result).toBe(expectedToken);
            expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
        });

        it("deve retornar null quando não houver token no localStorage", async () => {
            mockLocalStorage.getItem.mockReturnValueOnce(null);

            const result = await getToken();

            expect(mockLocalStorage.getItem).toHaveBeenCalledWith("userToken");
            expect(result).toBeNull();
        });
    });
});
