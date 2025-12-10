jest.mock("@/libs/storage/getUserData", () => ({ getUserData: jest.fn() }));

let getUserData: any;

describe("api_route interceptors", () => {
  let api: any;
  const originalLog = console.log;
  const originalWarn = console.warn;

  beforeEach(() => {
    jest.resetModules();
    getUserData = require("@/libs/storage/getUserData").getUserData;
    console.log = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
  });

  it("attaches Authorization header when token present", async () => {
    getUserData.mockResolvedValueOnce({ token: "tok-abc-123" });
    api = require("@/libs/auth/api");

    const handler = api.api_route.interceptors.request.handlers[0].fulfilled;
    const cfg: any = { headers: {} };
    const out = await handler(cfg);

    expect(out.headers.Authorization).toBe("Bearer tok-abc-123");
    expect(console.log).toHaveBeenCalled();
    expect((console.log as jest.Mock).mock.calls[0][0]).toContain("attaching token");
  });

  it("warns when no token in storage", async () => {
    getUserData.mockResolvedValueOnce(null);
    api = require("@/libs/auth/api");

    const handler = api.api_route.interceptors.request.handlers[0].fulfilled;
    const cfg: any = { headers: {} };
    const out = await handler(cfg);

    expect(out.headers.Authorization).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("sem token"));
  });

  it("response interceptor warns on 401", async () => {
    api = require("@/libs/auth/api");
    const rej = api.api_route.interceptors.response.handlers[0].rejected;
    const err = { response: { status: 401 } };
    await expect(rej(err)).rejects.toBe(err);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("401 Unauthorized"));
  });
});
