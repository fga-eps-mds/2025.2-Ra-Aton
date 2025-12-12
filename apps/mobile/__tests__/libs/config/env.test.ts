import { config, logConfig } from '@/libs/config/env';

// --- MOCKS GLOBAIS ---

// Mock do Expo Constants (Constants é usado para pegar info do app)
const mockConstants = {
  expoConfig: {
    version: '1.0.0',
    name: 'AtonApp',
    extra: {} 
  },
};
jest.mock('expo-constants', () => mockConstants);

// Criamos uma função de re-importação para rodar a lógica do arquivo env.ts isoladamente
function loadConfigModule(envVars: Record<string, string | undefined>) {
    // 1. Mockamos process.env dinamicamente
    process.env = { ...process.env, ...envVars };
    
    let loadedConfig: typeof config;
    let loadedLogConfig: typeof logConfig;

    // 2. Isolamos a importação para que o arquivo seja executado do zero
    jest.isolateModules(() => {
        const module = require('../../../libs/config/env'); // Ajuste o caminho se necessário
        loadedConfig = module.config;
        loadedLogConfig = module.logConfig;
    });

    return { config: loadedConfig!, logConfig: loadedLogConfig! };
}

describe('Lib: Config/Environment (env.ts)', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spies para capturar o output do console
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  // --- Teste do Ambiente Padrão ---
  it('deve usar valores padrao quando EXPO_PUBLIC variaveis nao estao definidas', () => {
    const { config } = loadConfigModule({
      EXPO_PUBLIC_API_URL: undefined,
      EXPO_PUBLIC_ENV: undefined,
    });
    
    // Valores padrões definidos no arquivo (se process.env for undefined)
    expect(config.apiUrl).toBe('http://localhost:4000');
    expect(config.env).toBe('development');
    expect(config.isDevelopment).toBe(true);
    expect(config.isProduction).toBe(false);
    expect(config.expo.version).toBe('1.0.0');
    expect(config.expo.name).toBe('AtonApp');
  });

  // --- Teste do Ambiente de Produção ---
  it('deve carregar configuracoes de PRODUCAO corretamente', () => {
    const { config } = loadConfigModule({
      EXPO_PUBLIC_API_URL: 'http://api.production.com',
      EXPO_PUBLIC_ENV: 'production',
    });

    expect(config.apiUrl).toBe('http://api.production.com');
    expect(config.env).toBe('production');
    expect(config.isDevelopment).toBe(false);
    expect(config.isProduction).toBe(true);
  });

  // --- Teste da Função logConfig ---
  describe('logConfig', () => {
    
    it('deve logar as informacoes basicas e dar warning em localhost', () => {
      const { config, logConfig } = loadConfigModule({
        EXPO_PUBLIC_API_URL: 'http://localhost:4000',
        EXPO_PUBLIC_ENV: 'development',
      });

      logConfig();

      // Verifica se o log basico foi chamado
      expect(console.log).toHaveBeenCalledWith('📝 Configurações do App:');
      expect(console.log).toHaveBeenCalledWith('  - API URL:', 'http://localhost:4000');
      expect(console.log).toHaveBeenCalledWith('  - Ambiente:', 'development');
      
      // Verifica se o console.warn foi chamado (porque a URL contém 'localhost')
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Usando localhost'));
      expect(console.warn).toHaveBeenCalledTimes(2); // Deve ter dois warnings
    });

    it('NÃO deve dar warning se a URL for um IP (ex: celular fisico)', () => {
      const { config, logConfig } = loadConfigModule({
        EXPO_PUBLIC_API_URL: 'http://192.168.0.1:4000',
        EXPO_PUBLIC_ENV: 'development',
      });

      logConfig();

      expect(console.log).toHaveBeenCalledWith('  - API URL:', 'http://192.168.0.1:4000');
      // Verifica se o console.warn NÂO foi chamado
      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});