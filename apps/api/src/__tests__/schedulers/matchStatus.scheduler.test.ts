import { updateMatchesToOngoing } from '../../schedulers/matchStatus.scheduler';
import { prismaMock } from '../prisma-mock'; // Seu arquivo de configuração de mocks
import { MatchStatus } from '@prisma/client';

// Data fixa para garantir consistência nos testes
const MOCK_NOW = new Date('2025-11-29T12:00:00.000Z');

describe('MatchStatus Scheduler (Unit)', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 1. Congelar o tempo
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW);

    // 2. Espionar consoles para evitar poluição e verificar logs
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('deve atualizar partidas "EM_BREVE" cuja data já passou para "EM_ANDAMENTO"', async () => {
    // ARRANGE
    // Simula que o banco atualizou 5 partidas
    prismaMock.match.updateMany.mockResolvedValue({ count: 5 });

    // ACT
    await updateMatchesToOngoing();

    // ASSERT
    // 1. Verifica se chamou o updateMany com os filtros corretos
    expect(prismaMock.match.updateMany).toHaveBeenCalledWith({
      where: {
        MatchStatus: 'EM_BREVE',
        MatchDate: {
          lte: MOCK_NOW, // Deve ser menor ou igual a "agora"
        },
      },
      data: {
        MatchStatus: MatchStatus.EM_ANDAMENTO,
      },
    });

    // 2. Verifica se logou a quantidade correta
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('5 partidas foram atualizadas')
    );
  });

  it('não deve fazer nada (nem logar sucesso) se nenhuma partida precisar de atualização', async () => {
    // ARRANGE
    // Simula que o banco não encontrou nada para atualizar
    prismaMock.match.updateMany.mockResolvedValue({ count: 0 });

    // ACT
    await updateMatchesToOngoing();

    // ASSERT
    expect(prismaMock.match.updateMany).toHaveBeenCalled();
    
    // Verifica que NÃO logou a mensagem de sucesso específica
    expect(consoleLogSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('partidas foram atualizadas')
    );
  });

  it('deve lidar com erros do banco de dados graciosamente', async () => {
    // ARRANGE
    const dbError = new Error('Falha na conexão');
    prismaMock.match.updateMany.mockRejectedValue(dbError);

    // ACT
    await updateMatchesToOngoing();

    // ASSERT
    // Verifica se o erro foi capturado e logado no console.error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Erro ao atualizar status'),
      dbError
    );
    
    // O teste não deve falhar (crashar), pois a função tem try/catch
  });
});