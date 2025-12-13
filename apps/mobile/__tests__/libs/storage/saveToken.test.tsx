import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { saveToken } from "@/libs/storage/saveToken";

jest.mock("expo-secure-store", () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

describe("saveToken", () => {
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
            // O jest-expo já define Platform.OS como 'ios' por padrão
            jest.replaceProperty(Platform, "OS", "ios");
        });

        it("deve salvar o token no SecureStore em plataforma nativa", async () => {
            const token = "meu-token-123";
            (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);

            await saveToken(token);

            expect(SecureStore.setItemAsync).toHaveBeenCalledWith("userToken", token);
            expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
            expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        });

        it("deve salvar um token vazio no SecureStore", async () => {
            const token = "";
            (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);

            await saveToken(token);

            expect(SecureStore.setItemAsync).toHaveBeenCalledWith("userToken", token);
        });

        it("deve salvar um token longo no SecureStore", async () => {
            const longToken = "a".repeat(1000);
            (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);

            await saveToken(longToken);

            expect(SecureStore.setItemAsync).toHaveBeenCalledWith("userToken", longToken);
        });

        it("deve propagar erro quando SecureStore falhar", async () => {
            const token = "token-falha";
            const error = new Error("Secure storage error");
            (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(error);

            await expect(saveToken(token)).rejects.toThrow("Secure storage error");
        });
    });

    describe("Plataforma Web", () => {
        beforeEach(() => {
            jest.replaceProperty(Platform, "OS", "web");
        });

        it("deve salvar o token no localStorage em plataforma web", async () => {
            const token = "web-token-456";

            await saveToken(token);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith("userToken", token);
            expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
            expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
        });

        it("deve salvar um token vazio no localStorage", async () => {
            const token = "";

            await saveToken(token);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith("userToken", token);
        });

        it("deve salvar um token com caracteres especiais no localStorage", async () => {
            const token = "token-with-special-chars-!@#$%^&*()";

            await saveToken(token);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith("userToken", token);
        });
    });
});
