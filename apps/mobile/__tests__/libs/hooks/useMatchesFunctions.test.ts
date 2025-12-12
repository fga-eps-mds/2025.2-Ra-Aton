import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import axios from 'axios';
import {
  getMatchesFeed,
  subscribeToMatch,
  getMatchById,
  switchTeam as switchTeamRequest,
  unsubscribeFromMatch,
} from '@/libs/auth/handleMatch';
import { useUser } from '@/libs/storage/UserContext';
import { useFeedMatches } from '@/libs/hooks/useMatchesFunctions';

// --- MOCKS GLOBAIS / CONTEXTO ---

// Mock do Contexto de Usuário
jest.mock('@/libs/storage/UserContext', () => ({
  useUser: jest.fn(() => ({ user: { id: 'user-123' } })),
}));

// Mock da API de Partidas
jest.mock('@/libs/auth/handleMatch', () => ({
  getMatchesFeed: jest.fn(),
  subscribeToMatch: jest.fn(),
  unsubscribeFromMatch: jest.fn(),
  getMatchById: jest.fn(),
  switchTeam: jest.fn(),
}));

// Mock do Alert do React Native
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: { alert: jest.fn() },
  Platform: { OS: 'ios' }, // Padrão para iOS/Mobile
}));

// Mock do Axios para simular erros
jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  isAxiosError: jest.fn((error) => !!error.response),
}));

// --- DADOS MOCKADOS ---
const mockMatchA = { id: 'match-A', teamA: { players: [{ id: 'other-user' }] }, teamB: { players: [] } } as any;
const mockMatchB = { id: 'match-B', teamA: { players: [{ id: 'user-123' }] }, teamB: { players: [] } } as any;
const mockFeedResponse = { data: [mockMatchA], meta: { page: 1, limit: 10, hasNextPage: true } };

describe('Hook: useFeedMatches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getMatchesFeed as jest.Mock).mockResolvedValue(mockFeedResponse);
    (getMatchById as jest.Mock).mockResolvedValue(mockMatchB);
    (subscribeToMatch as jest.Mock).mockResolvedValue(true);
    (unsubscribeFromMatch as jest.Mock).mockResolvedValue(true);
    (switchTeamRequest as jest.Mock).mockResolvedValue(true);
    // Assegura que o Platform é 'ios' para disparar Alerts
    (Platform as any).OS = 'ios'; 
  });

  // --- 1. TESTES DE CARREGAMENTO E SINCRONIZAÇÃO (loadPage e useEffect) ---

  it('deve carregar a primeira página no primeiro render (useEffect)', async () => {
    const { result } = renderHook(() => useFeedMatches());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false); 
    });

    expect(getMatchesFeed).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 10 }));
    expect(result.current.matches.length).toBe(1);
  });

  it('deve carregar a próxima página em onEndReached', async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    (getMatchesFeed as jest.Mock).mockResolvedValue({
      data: [{ id: 'match-C' }],
      meta: { page: 2, limit: 10, hasNextPage: false }
    });

    act(() => {
      result.current.onEndReached();
    });
    
    await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
    });

    expect(getMatchesFeed).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    expect(result.current.matches.length).toBe(2); 
    expect(result.current.hasNextPage).toBe(false);
  });
  
  it('deve sincronizar IDs subscritos após o carregamento', async () => {
    (getMatchesFeed as jest.Mock).mockResolvedValue({
        data: [mockMatchB], 
        meta: { page: 1, limit: 10, hasNextPage: false }
    });
    
    (getMatchById as jest.Mock).mockImplementation((id) => Promise.resolve(
        id === 'match-B' ? mockMatchB : { id: id, teamA: { players: [] } }
    ));

    const { result } = renderHook(() => useFeedMatches());
    
    await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
    }); 

    expect(result.current.isUserSubscriped(mockMatchB)).toBe(true);
  });
  
  // --- 2. TESTES DE INSCRIÇÃO (joinMatch) ---

  it('deve inscrever o usuário e chamar o modal (Partida Nao Inscrita - Mobile)', async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const mockOpenModal = jest.fn();
    jest.spyOn(result.current, 'isUserSubscriped').mockReturnValue(false);
    
    act(() => {
      result.current.joinMatch(mockMatchA, mockOpenModal);
    });
    
    // 1. Alert é chamado (Índice 0)
    expect(Alert.alert).toHaveBeenCalledWith(
      'Participar da partida',
      expect.any(String),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Confirmar' }),
      ])
    );
    
    // 2. Acessa a chamada MAIS RECENTE do Alert.alert para simular o clique
    const lastAlertCallIndex = (Alert.alert as jest.Mock).mock.calls.length - 1;
    const confirmButton = (Alert.alert as jest.Mock).mock.calls[lastAlertCallIndex][2].find((b: any) => b.text === 'Confirmar');
    
    await act(async () => {
      confirmButton.onPress(); 
    });

    // 3. Espera a resolução das promises de subscribe e getMatchById
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(subscribeToMatch).toHaveBeenCalledWith('match-A');
    expect(getMatchById).toHaveBeenCalledWith('match-A'); 
    expect(mockOpenModal).toHaveBeenCalled();
  });
  
  it('deve apenas abrir o modal se o usuario JA estiver inscrito', async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    const mockOpenModal = jest.fn();
    jest.spyOn(result.current, 'isUserSubscriped').mockReturnValue(true);

    act(() => {
      result.current.joinMatch(mockMatchB, mockOpenModal);
    });
    
    await waitFor(() => {
      expect(mockOpenModal).toHaveBeenCalled();
    });
    
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(getMatchById).toHaveBeenCalledWith('match-B');
  });
  
  // --- 3. TESTES DE SAÍDA (leaveMatch) ---

  it('deve desinscrever o usuario e recarregar o feed', async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    const mockAfterLeave = jest.fn();

    // Dispara leaveMatch
    act(() => {
      result.current.leaveMatch(mockMatchA, mockAfterLeave);
    });
    
    // Acessa a chamada MAIS RECENTE do Alert.alert
    const lastAlertCallIndex = (Alert.alert as jest.Mock).mock.calls.length - 1;
    const confirmButton = (Alert.alert as jest.Mock).mock.calls[lastAlertCallIndex][2].find((b: any) => b.text === 'Confirmar');
    
    await act(async () => {
      confirmButton.onPress();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(unsubscribeFromMatch).toHaveBeenCalledWith('match-A');
    expect(getMatchesFeed).toHaveBeenCalledTimes(2); // Primeira carga + Recarga
    expect(mockAfterLeave).toHaveBeenCalled();
  });

  // --- 4. TESTES DE TROCA DE TIME (switchTeam) ---

it('deve trocar o time e atualizar a partida no modal', async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    const mockUpdateModal = jest.fn();

    // Dispara switchTeam
    act(() => {
      result.current.switchTeam(mockMatchA, mockUpdateModal);
    });
    
    // Acessa a chamada MAIS RECENTE do Alert.alert
    const lastAlertCallIndex = (Alert.alert as jest.Mock).mock.calls.length - 1;
    const confirmButton = (Alert.alert as jest.Mock).mock.calls[lastAlertCallIndex][2].find((b: any) => b.text === 'Confirmar');
    
    await act(async () => {
      confirmButton.onPress();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(switchTeamRequest).toHaveBeenCalledWith('match-A');
    // CORREÇÃO: Esperamos 3 chamadas (1 Carga Inicial + 1 Join Anterior + 1 Switch Team)
    expect(getMatchById).toHaveBeenCalledTimes(3); 
    expect(mockUpdateModal).toHaveBeenCalled();
    expect(getMatchesFeed).toHaveBeenCalledTimes(2); // Recarga do feed
  });
});
