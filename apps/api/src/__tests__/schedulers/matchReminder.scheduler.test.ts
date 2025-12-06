import { sendMatchReminders } from '../../schedulers/matchReminder.scheduler';
import { MatchStatus, NotificationType } from '@prisma/client';
import { prismaMock } from '../prisma-mock';

const MOCK_NOW = new Date('2025-11-10T10:00:00.000Z').getTime();

describe('MatchReminder Scheduler (Unit)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Congela o tempo para "Agora"
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve processar partidas encontradas: criar notificações e atualizar status', async () => {
    // 1. ARRANGE (Preparação)
    // Simulamos que o banco retornou UMA partida elegível
    const mockMatch = {
      id: 'match-123',
      title: 'Partida Teste',
      players: [
        { userId: 'user-1', team: 'A' },
        { userId: 'user-2', team: 'B' }
      ]
    };

    // Quando o scheduler chamar findMany, retorne isso:
    prismaMock.match.findMany.mockResolvedValue([mockMatch] as any);
    
    // Simula a transação (executa o callback imediatamente)
    prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));

    // 2. ACT (Ação)
    await sendMatchReminders();

    // 3. ASSERT (Verificação)
    
    // A) Verificamos se ele buscou no banco com os filtros de data corretos
    const expectedOneHourFromNow = new Date(MOCK_NOW + 60 * 60 * 1000);
    
    expect(prismaMock.match.findMany).toHaveBeenCalledWith({
      where: {
        MatchStatus: 'EM_BREVE',
        reminderSent: false,
        MatchDate: {
          gt: expect.any(Date),           // Deve ser maior que agora
          lte: expectedOneHourFromNow     // Deve ser menor/igual a 1h
        }
      },
      include: { players: true }
    });

    // B) Verificamos se criou as notificações
    expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ userId: 'user-1', type: NotificationType.MATCH_REMINDER }),
        expect.objectContaining({ userId: 'user-2', type: NotificationType.MATCH_REMINDER })
      ]
    });

    // C) Verificamos se marcou a partida como enviada
    expect(prismaMock.match.update).toHaveBeenCalledWith({
      where: { id: 'match-123' },
      data: { reminderSent: true }
    });
  });

  it('não deve fazer nada se nenhuma partida for encontrada', async () => {
    // 1. ARRANGE
    // Banco retorna array vazio (nenhuma partida no horário)
    prismaMock.match.findMany.mockResolvedValue([]);

    // 2. ACT
    await sendMatchReminders();

    // 3. ASSERT
    // Não deve tentar criar notificações nem atualizar partidas
    expect(prismaMock.notification.createMany).not.toHaveBeenCalled();
    expect(prismaMock.match.update).not.toHaveBeenCalled();
  });

  it('deve marcar reminderSent=true mesmo se não houver jogadores (para não processar de novo)', async () => {
    // 1. ARRANGE
    const mockMatchVazia = {
      id: 'match-empty',
      title: 'Partida Vazia',
      players: [] // Sem jogadores
    };

    prismaMock.match.findMany.mockResolvedValue([mockMatchVazia] as any);
    prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));

    // 2. ACT
    await sendMatchReminders();

    // 3. ASSERT
    // Não cria notificações...
    expect(prismaMock.notification.createMany).not.toHaveBeenCalled();
    
    // ...MAS atualiza a partida para não cair no loop eterno
    expect(prismaMock.match.update).toHaveBeenCalledWith({
      where: { id: 'match-empty' },
      data: { reminderSent: true }
    });
  });

  it('deve lidar com erros silenciosamente (logar erro e não quebrar)', async () => {
    // 1. ARRANGE
    // Simula um erro no banco de dados
    prismaMock.match.findMany.mockRejectedValue(new Error('Erro de conexão DB'));
    
    // Espiona o console.error para garantir que o erro foi logado
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // 2. ACT
    await sendMatchReminders();

    // 3. ASSERT
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Erro ao enviar lembretes'), 
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });
});