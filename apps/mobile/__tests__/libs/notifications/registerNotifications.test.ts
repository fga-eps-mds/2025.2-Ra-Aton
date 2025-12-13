import { Platform } from 'react-native';

// --- MOCKS GLOBAIS ---

// Mock do fetch (apenas para garantir que ele não interfira)
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
    appOwnership: 'standalone',
    expoConfig: {
        extra: { eas: { projectId: 'mock-project-id' } },
    },
};

// Mock do require condicional para as libs
jest.mock('expo-notifications', () => mockNotifications, { virtual: true });
jest.mock('expo-device', () => mockDevice, { virtual: true });
jest.mock('expo-constants', () => ({ default: mockConstants }), { virtual: true });


// Função que carrega o módulo de interesse
function loadModule() {
  let module: typeof import('@/libs/notifications/registerNotifications');
  jest.isolateModules(() => {
    module = require('../../../libs/notifications/registerNotifications');
  });
  return module!;
}

describe('Lib: registerForPushNotificationsAsync', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // --- CONFIGURAÇÃO DE SUCESSO PADRÃO (RESOLVE PROMISE) ---
    (Platform as any).OS = 'ios';
    (mockDevice.isDevice as boolean) = true;
    mockConstants.appOwnership = 'standalone' as any;
    
    // Garantimos que TODAS as funções retornam Promise resolvida
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockNotifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'mock-push-token' });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  // --- Testes de Ambiente ---

  it('deve retornar null e logar se estiver na Web', async () => {
    (Platform as any).OS = 'web';
    const { registerForPushNotificationsAsync } = loadModule();

    const token = await registerForPushNotificationsAsync();

    expect(token).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith('ℹ️ Notificações push não são suportadas na Web');
  });
  
  it('deve retornar null e logar se estiver rodando no Expo Go', async () => {
    (Platform as any).OS = 'ios';
    mockConstants.appOwnership = 'expo' as any;
    const { registerForPushNotificationsAsync } = loadModule();
    
    const token = await registerForPushNotificationsAsync();

    expect(token).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Rodando no Expo Go'));
    expect(mockNotifications.getPermissionsAsync).not.toHaveBeenCalled();
  });

  it('deve retornar null e logar se nao for um dispositivo fisico', async () => {
    (Platform as any).OS = 'ios';
    (mockDevice.isDevice as boolean) = false;
    const { registerForPushNotificationsAsync } = loadModule();
    
    const token = await registerForPushNotificationsAsync();

    expect(token).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith('📱 Use um dispositivo físico para testar notificações.');
    expect(mockNotifications.getPermissionsAsync).not.toHaveBeenCalled();
  });

  // --- Testes de Sucesso ---

  it('deve retornar o token se as permissoes ja estiverem concedidas', async () => {
    const { registerForPushNotificationsAsync } = loadModule();
    const token = await registerForPushNotificationsAsync();

    expect(token).toBe('mock-push-token'); 
    expect(mockNotifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockNotifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
        projectId: 'mock-project-id', 
    });
  });

  it('deve solicitar permissoes e retornar o token se o status for "undetermined"', async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined' });
    // requestPermissionsAsync já está mockado para sucesso no beforeEach
    const { registerForPushNotificationsAsync } = loadModule();

    const token = await registerForPushNotificationsAsync();

    expect(token).toBe('mock-push-token');
    expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockNotifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
  });

  // --- Testes de Erro ---

  it('deve retornar null e logar se as permissoes forem negadas', async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined' });
    mockNotifications.requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    const { registerForPushNotificationsAsync } = loadModule();

    const token = await registerForPushNotificationsAsync();

    expect(token).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith('❌ Sem permissão para notificações!');
    expect(mockNotifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('deve retornar null e logar se getExpoPushTokenAsync falhar', async () => {
    mockNotifications.getExpoPushTokenAsync.mockRejectedValue(new Error('API failed'));
    const { registerForPushNotificationsAsync } = loadModule();

    const token = await registerForPushNotificationsAsync();

    expect(token).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao pegar token'),
        expect.any(Error)
    );
  });
});

describe('Lib: setupNotificationHandler', () => {
    beforeEach(() => {
        // Resetamos o OS para Nativo
        (Platform as any).OS = 'ios';
        mockNotifications.setNotificationHandler.mockClear();
    });

    it('deve chamar setNotificationHandler com a configuração correta', async () => { // <--- Adicionado async
        const { setupNotificationHandler } = loadModule();
        
        setupNotificationHandler();

        expect(mockNotifications.setNotificationHandler).toHaveBeenCalledTimes(1);
        
        // Acessamos a função handleNotification assíncrona
        const handler = (mockNotifications.setNotificationHandler as jest.Mock).mock.calls[0][0].handleNotification;

        // CORREÇÃO 2: Usamos await para resolver a Promise retornada pela função async
        const handlerResult = await handler(); 

        expect(handlerResult).toEqual({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        });
    });

    it('nao deve chamar setNotificationHandler na Web', () => {
        (Platform as any).OS = 'web';
        const { setupNotificationHandler } = loadModule();

        setupNotificationHandler();

        expect(mockNotifications.setNotificationHandler).not.toHaveBeenCalled();
    });
});