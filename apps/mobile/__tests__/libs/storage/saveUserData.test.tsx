import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { saveUserData } from "@/libs/storage/saveUserData";

jest.mock("expo-secure-store", () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

describe("saveUserData", () => {
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

        it("deve salvar os dados do usuário no SecureStore como JSON", async () => {
            const userData = { id: "123", name: "João", email: "joao@email.com" };
            (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);

            await saveUserData(userData);

            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "userData",
                JSON.stringify(userData)
            );
            expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
            expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        });

        it("deve salvar um objeto vazio no SecureStore", async () => {
            const userData = {};
            (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);

            await saveUserData(userData);

            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "userData",
                JSON.stringify(userData)
            );
        });

        it("deve salvar dados complexos aninhados no SecureStore", async () => {
            const userData = {
                id: "user-1",
                profile: {
                    name: "Maria",
                    settings: {
                        theme: "dark",
                        notifications: true,
                    },
                },
                tags: ["admin", "verified"],
            };
            (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);

            await saveUserData(userData);

            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "userData",
                JSON.stringify(userData)
            );
        });

        it("deve propagar erro quando SecureStore falhar", async () => {
            const userData = { id: "123" };
            const error = new Error("Secure storage error");
            (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(error);

            await expect(saveUserData(userData)).rejects.toThrow("Secure storage error");
        });
    });

    describe("Plataforma Web", () => {
        beforeEach(() => {
            jest.replaceProperty(Platform, "OS", "web");
        });

        it("deve salvar os dados do usuário no localStorage como JSON", async () => {
            const userData = { id: "456", name: "Ana", email: "ana@email.com" };

            await saveUserData(userData);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                "userData",
                JSON.stringify(userData)
            );
            expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
            expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
        });

        it("deve salvar um objeto vazio no localStorage", async () => {
            const userData = {};

            await saveUserData(userData);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                "userData",
                JSON.stringify(userData)
            );
        });

        it("deve salvar dados com caracteres especiais no localStorage", async () => {
            const userData = {
                id: "user-special",
                bio: "Olá! 🎉 Bem-vindo ao app!",
                symbols: "!@#$%^&*()",
            };

            await saveUserData(userData);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                "userData",
                JSON.stringify(userData)
            );
        });
    });
});
