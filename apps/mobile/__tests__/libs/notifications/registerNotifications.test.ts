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
  easConfig: { projectId: "mock-project-id" }, // Mockando também o easConfig por garantia
};

// Mock das bibliotecas do Expo
// Usamos virtual: true pois em ambiente de teste node (jest) essas libs nativas podem não existir
jest.mock("expo-notifications", () => mockNotifications, { virtual: true });
jest.mock("expo-device", () => mockDevice, { virtual: true });
jest.mock("expo-constants", () => ({ default: mockConstants }), {
  virtual: true,
});

// Função auxiliar para recarregar o módulo a cada teste
// Isso é CRUCIAL porque seu arquivo faz verificações de Platform.OS fora das funções (top-level)
function loadModule() {
  let module: typeof import("@/libs/notifications/registerNotifications");
  jest.isolateModules(() => {
    // Ajuste o caminho relativo conforme a estrutura de pastas
    module = require("../../../libs/notifications/registerNotifications");
  });
  return module!;
}

describe("Lib: registerForPushNotificationsAsync", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // --- CONFIGURAÇÃO DE SUCESSO PADRÃO ---
    (Platform as any).OS = "ios";
    mockDevice.isDevice = true;
    mockConstants.appOwnership = "standalone";

    // Respostas padrão das promises
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
    (Platform as any).OS = "web";
    const { registerForPushNotificationsAsync } = loadModule();

    const token = await registerForPushNotificationsAsync();

    expect(token).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Web"));
  });

  it("deve retornar null e logar se estiver rodando no Expo Go", async () => {
    (Platform as any).OS = "ios";
    mockConstants.appOwnership = "expo";
    const { registerForPushNotificationsAsync } = loadModule();

    const token = await registerForPushNotificationsAsync();

    expect(token).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Expo Go"),
    );
    expect(mockNotifications.getPermissionsAsync).not.toHaveBeenCalled();
  });

  it("deve retornar null e logar se nao for um dispositivo fisico (simulador)", async () => {
    (Platform as any).OS = "ios";
    mockDevice.isDevice = false;
    const { registerForPushNotificationsAsync } = loadModule();

    const token = await registerForPushNotificationsAsync();

    expect(token).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("dispositivo físico"),
    );
    expect(mockNotifications.getPermissionsAsync).not.toHaveBeenCalled();
  });

  // --- Testes de Sucesso ---

  it("deve retornar o token se as permissoes ja estiverem concedidas", async () => {
    const { registerForPushNotificationsAsync } = loadModule();
    const token = await registerForPushNotificationsAsync();

    expect(token).toBe("mock-push-token");
    expect(mockNotifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    // Verifica se usou o projectId correto
    expect(mockNotifications.getExpoPushTokenAsync).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: "mock-project-id" }),
    );
  });

  it('deve solicitar permissoes e retornar o token se o status for "undetermined"', async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValueOnce({
      status: "undetermined",
    });
    // requestPermissionsAsync configurado para sucesso no beforeEach

    const { registerForPushNotificationsAsync } = loadModule();
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

    const { registerForPushNotificationsAsync } = loadModule();
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

    const { registerForPushNotificationsAsync } = loadModule();
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
    (Platform as any).OS = "ios";
    mockNotifications.setNotificationHandler.mockClear();
  });

  it("deve chamar setNotificationHandler com a configuração correta", async () => {
    const { setupNotificationHandler } = loadModule();

    setupNotificationHandler();

    expect(mockNotifications.setNotificationHandler).toHaveBeenCalledTimes(1);

    // Acessa a função handleNotification passada como argumento
    const handlerConfig = (
      mockNotifications.setNotificationHandler as jest.Mock
    ).mock.calls[0][0];
    const handlerFunction = handlerConfig.handleNotification;

    // Executa a função handler para verificar o retorno (configuração visual da notificação)
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
    (Platform as any).OS = "web";
    const { setupNotificationHandler } = loadModule();

    setupNotificationHandler();

    expect(mockNotifications.setNotificationHandler).not.toHaveBeenCalled();
  });
});
