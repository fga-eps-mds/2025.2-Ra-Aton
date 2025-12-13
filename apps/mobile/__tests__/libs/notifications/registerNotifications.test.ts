import { Platform } from "react-native";

// --- MOCKS GLOBAIS ---
global.fetch = jest.fn();

// --- Variáveis de Mock de Estado ---
const mockNotifications = {
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
};

const mockDevice = {
  isDevice: true,
};

const mockConstants = {
  appOwnership: "standalone",
  expoConfig: {
    extra: { eas: { projectId: "mock-project-id" } },
  },
  easConfig: { projectId: "mock-project-id" },
};

// --- Helper para carregar o módulo em isolamento ---
// Aceita o sistema operacional desejado para configurar o ambiente antes do require
function loadModule(os: "ios" | "android" | "web" = "ios") {
  let module: typeof import("@/libs/notifications/registerNotifications");

  jest.isolateModules(() => {
    // 1. Mockamos as bibliotecas Expo DENTRO do isolamento para garantir que sejam usadas
    jest.doMock("expo-notifications", () => mockNotifications);
    jest.doMock("expo-device", () => mockDevice);
    jest.doMock("expo-constants", () => ({ default: mockConstants }));

    // 2. Configuramos o Platform.OS para esta instância isolada
    const RN = require("react-native");

    // Reseta a propriedade OS para garantir que não haja contaminação
    Object.defineProperty(RN.Platform, "OS", {
      get: () => os,
      configurable: true,
    });

    // 3. Carregamos o módulo sob teste
    // O require vai usar os mocks definidos acima e o Platform configurado
    module = require("../../../libs/notifications/registerNotifications");
  });

  return module!;
}

describe("Lib: registerForPushNotificationsAsync", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Resetamos os valores padrão dos mocks
    mockDevice.isDevice = true;
    mockConstants.appOwnership = "standalone";

    mockNotifications.getPermissionsAsync.mockResolvedValue({
      status: "granted",
    });
    mockNotifications.requestPermissionsAsync.mockResolvedValue({
      status: "granted",
    });
    mockNotifications.getExpoPushTokenAsync.mockResolvedValue({
      data: "mock-push-token",
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  // --- Testes de Ambiente ---

  it("deve retornar null e logar se estiver na Web", async () => {
    // Passamos 'web' para o helper
    const { registerForPushNotificationsAsync } = loadModule("web");

    const token = await registerForPushNotificationsAsync();

    expect(token).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Web"));
  });

  it("deve retornar null e logar se estiver rodando no Expo Go", async () => {
    mockConstants.appOwnership = "expo";
    // Passamos 'ios' (ou android) para entrar no bloco if (Platform.OS !== 'web')
    const { registerForPushNotificationsAsync } = loadModule("ios");

    const token = await registerForPushNotificationsAsync();

    expect(token).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Expo Go"),
    );
    expect(mockNotifications.getPermissionsAsync).not.toHaveBeenCalled();
  });

  it("deve retornar null e logar se nao for um dispositivo fisico (simulador)", async () => {
    mockDevice.isDevice = false;
    const { registerForPushNotificationsAsync } = loadModule("ios");

    const token = await registerForPushNotificationsAsync();

    expect(token).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("dispositivo físico"),
    );
    expect(mockNotifications.getPermissionsAsync).not.toHaveBeenCalled();
  });

  // --- Testes de Sucesso ---

  it("deve retornar o token se as permissoes ja estiverem concedidas", async () => {
    const { registerForPushNotificationsAsync } = loadModule("ios");
    const token = await registerForPushNotificationsAsync();

    expect(token).toBe("mock-push-token");
    expect(mockNotifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockNotifications.getExpoPushTokenAsync).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: "mock-project-id" }),
    );
  });

  it('deve solicitar permissoes e retornar o token se o status for "undetermined"', async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValueOnce({
      status: "undetermined",
    });

    const { registerForPushNotificationsAsync } = loadModule("ios");
    const token = await registerForPushNotificationsAsync();

    expect(token).toBe("mock-push-token");
    expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockNotifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
  });

  // --- Testes de Erro ---

  it("deve retornar null e logar se as permissoes forem negadas", async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValueOnce({
      status: "undetermined",
    });
    mockNotifications.requestPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    });

    const { registerForPushNotificationsAsync } = loadModule("ios");
    const token = await registerForPushNotificationsAsync();

    expect(token).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Sem permissão"),
    );
    expect(mockNotifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it("deve retornar null e logar se getExpoPushTokenAsync falhar (ex: erro de rede)", async () => {
    mockNotifications.getExpoPushTokenAsync.mockRejectedValue(
      new Error("API failed"),
    );

    const { registerForPushNotificationsAsync } = loadModule("ios");
    const token = await registerForPushNotificationsAsync();

    expect(token).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Erro ao pegar token"),
      expect.any(Error),
    );
  });
});

describe("Lib: setupNotificationHandler", () => {
  beforeEach(() => {
    mockNotifications.setNotificationHandler.mockClear();
  });

  it("deve chamar setNotificationHandler com a configuração correta (Nativo)", async () => {
    const { setupNotificationHandler } = loadModule("ios");

    setupNotificationHandler();

    expect(mockNotifications.setNotificationHandler).toHaveBeenCalledTimes(1);

    const handlerConfig = (
      mockNotifications.setNotificationHandler as jest.Mock
    ).mock.calls[0][0];
    const handlerFunction = handlerConfig.handleNotification;

    const result = await handlerFunction();

    expect(result).toEqual({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    });
  });

  it("NAO deve chamar setNotificationHandler na Web", () => {
    const { setupNotificationHandler } = loadModule("web");

    setupNotificationHandler();

    expect(mockNotifications.setNotificationHandler).not.toHaveBeenCalled();
  });
});
