// Tests for libs/storage/getUserData.tsx
describe("getUserData", () => {
  beforeEach(() => {
    jest.resetModules();
    // simple in-memory localStorage shim
    (global as any).localStorage = (function () {
      const store: Record<string, string> = {};
      return {
        getItem: jest.fn((k: string) => (k in store ? store[k] : null)),
        setItem: jest.fn((k: string, v: string) => { store[k] = v; }),
        removeItem: jest.fn((k: string) => { delete store[k]; }),
      };
    })();
  });

  it("returns parsed data from localStorage on web", async () => {
    const rn = require("react-native");
    rn.Platform = { OS: "web" };
    localStorage.setItem("userData", JSON.stringify({ id: "u1" }));

    const getUserData = require("@/libs/storage/getUserData").getUserData;
    const res = await getUserData();
    expect(res).toEqual({ id: "u1" });
    localStorage.removeItem("userData");
  });

  it("returns parsed data from SecureStore on native", async () => {
    const rn = require("react-native");
    rn.Platform = { OS: "android" };
    const SecureStore = require("expo-secure-store");
    SecureStore.getItemAsync = jest.fn().mockResolvedValueOnce(JSON.stringify({ id: "u2" }));

    const getUserData = require("@/libs/storage/getUserData").getUserData;
    const res = await getUserData();
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("userData");
    expect(res).toEqual({ id: "u2" });
  });

  it("returns null when no data", async () => {
    const rn = require("react-native");
    rn.Platform = { OS: "android" };
    const SecureStore = require("expo-secure-store");
    SecureStore.getItemAsync = jest.fn().mockResolvedValueOnce(null);

    const getUserData = require("@/libs/storage/getUserData").getUserData;
    const res = await getUserData();
    expect(res).toBeNull();
  });
});
