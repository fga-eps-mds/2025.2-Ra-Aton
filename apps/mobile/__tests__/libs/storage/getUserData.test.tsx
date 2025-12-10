import * as SecureStore from "expo-secure-store";
import { getUserData } from "@/libs/storage/getUserData";

// --- CONFIGURAÇÃO DO MOCK DINÂMICO ---
let mockOS = "web";

jest.mock("react-native", () => ({
  Platform: {
    get OS() {
      return mockOS;
    },
    select: (objs: any) => objs[mockOS] || objs.default,
  },
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe("getUserData", () => {
  // Salva o localStorage original para restaurar depois
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOS = "web"; // Reset para web por padrão

    // Mock simples do LocalStorage
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

  afterAll(() => {
    (global as any).localStorage = originalLocalStorage;
  });

  it("returns parsed data from localStorage on web", async () => {
    mockOS = "web";
    localStorage.setItem("userData", JSON.stringify({ id: "u1" }));

    const res = await getUserData();
    expect(res).toEqual({ id: "u1" });
  });

  it("returns parsed data from SecureStore on native", async () => {
    mockOS = "android";
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ id: "u2" }),
    );

    const res = await getUserData();

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("userData");
    expect(res).toEqual({ id: "u2" });
  });

  it("returns null when no data", async () => {
    mockOS = "android";
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

    const res = await getUserData();
    expect(res).toBeNull();
  });
});