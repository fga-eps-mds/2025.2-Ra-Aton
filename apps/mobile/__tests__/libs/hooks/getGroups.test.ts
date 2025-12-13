import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUser } from '@/libs/storage/UserContext';
import { loadGroups } from '@/libs/group/loadGroups';
import { useGroups, Group } from '@/libs/hooks/getGroups';
import { useFocusEffect } from '@react-navigation/native';

// --- MOCKS ---

jest.mock('@/libs/storage/UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('@/libs/group/loadGroups', () => ({
  loadGroups: jest.fn(),
}));

const mockUseFocusEffect = useFocusEffect as jest.Mock;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useFocusEffect: jest.fn(), 
}));

// --- DADOS MOCKADOS ---

const mockUser = { id: 'u1', token: 'mock-token' };

const mockGroupsData: Group[] = [
  { id: 'g1', name: 'Time Membro', groupType: 'AMATEUR', isMember: true, isFollowing: false, acceptingNewMembers: true, description: '' },
  { id: 'g2', name: 'Atlética Aberta', groupType: 'ATHLETIC', isMember: false, isFollowing: false, acceptingNewMembers: true, description: '' },
  { id: 'g3', name: 'Atlética Fechada', groupType: 'ATHLETIC', isMember: false, isFollowing: true, acceptingNewMembers: false, description: '' },
  { id: 'g4', name: 'Time Amador Aberto', groupType: 'AMATEUR', isMember: false, isFollowing: false, acceptingNewMembers: true, description: '' },
  { id: 'g5', name: 'Time Amador Fechado', groupType: 'AMATEUR', isMember: false, isFollowing: false, acceptingNewMembers: false, description: '' },
];


describe('Hook: useGroups', () => {
  const mockLoadGroups = loadGroups as jest.Mock;
  const mockUseUser = useUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({ user: mockUser });
    // Configuração inicial padrão para sucesso
    mockLoadGroups.mockResolvedValue(mockGroupsData);

    // Mock para prevenir loop infinito
    (useFocusEffect as jest.Mock).mockImplementation(() => {});

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  // --- Funcao auxiliar para simular o carregamento inicial ---
  const simulateInitialLoad = async (result: any) => {
    // A primeira chamada de reload deve ter sucesso (configurado no beforeEach)
    await act(async () => {
        await result.current.reload();
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  };

  // --- Teste de Fluxo Principal ---
  it('deve carregar grupos e definir estados iniciais no foco da tela', async () => {
    const { result } = renderHook(() => useGroups());
    expect(result.current.loading).toBe(true);
    await simulateInitialLoad(result);

    expect(mockLoadGroups).toHaveBeenCalledWith(mockUser.token, mockUser.id);
    expect(result.current.groups.length).toBe(5);
    expect(result.current.filtered.length).toBe(2); 
  });

  // --- Teste de Filtro ---
  it('deve filtrar por tipo (ATHLETIC)', async () => {
    const { result } = renderHook(() => useGroups());
    await simulateInitialLoad(result);

    act(() => {
      result.current.setSelectedType('ATHLETIC');
    });

    expect(result.current.filtered.length).toBe(2); 
    expect(result.current.filtered.map(g => g.id)).toEqual(['g2', 'g3']);
  });

  // --- Teste de Filtro + Accepting ---
  it('deve filtrar por "Apenas aceitando" (AMATEUR)', async () => {
    const { result } = renderHook(() => useGroups());
    await simulateInitialLoad(result);

    act(() => {
      result.current.setAcceptingOnly(true);
    });

    expect(result.current.filtered.length).toBe(1); 
    expect(result.current.filtered[0].id).toBe('g4');
  });

  it('deve filtrar por tipo e por "Apenas aceitando" (ATHLETIC + Accepting)', async () => {
    const { result } = renderHook(() => useGroups());
    await simulateInitialLoad(result);

    act(() => {
      result.current.setSelectedType('ATHLETIC');
    });

    act(() => {
      result.current.setAcceptingOnly(true);
    });

    expect(result.current.filtered.length).toBe(1); 
    expect(result.current.filtered[0].id).toBe('g2');
  });

  // --- Teste de Update ---
  it('deve atualizar um grupo na lista (updateGroup)', async () => {
    const { result } = renderHook(() => useGroups());
    await simulateInitialLoad(result);
    
    const updatedGroup: Group = {
        ...mockGroupsData[1], 
        isFollowing: true, 
        name: 'Atlética Renomeada'
    };

    act(() => {
      result.current.updateGroup(updatedGroup);
    });

    const updated = result.current.groups.find(g => g.id === 'g2');
    expect(updated?.isFollowing).toBe(true);
    expect(updated?.name).toBe('Atlética Renomeada');
  });
});
