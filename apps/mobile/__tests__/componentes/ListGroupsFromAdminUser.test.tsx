import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import ListGroupsFromAdminUser from '../../components/ListGroupsFromAdminUser';

// --- MOCKS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { orange: 'orange', groupcards: '#eee', primary: 'red', error: 'red' },
    dark: { orange: 'orange', groupcards: '#333', primary: 'red', error: 'red' },
  },
}));

jest.mock('@/constants/Fonts', () => ({
  Fonts: { 
    mainFont: { dongleRegular: 'Arial' },
    otherFonts: { dongleBold: 'Arial', dongleLight: 'Arial' }
  },
}));

// Mock do Contexto de Usuário
jest.mock('@/libs/storage/UserContext', () => ({
  useUser: () => ({
    user: { id: 'user-123', token: 'fake-token' },
  }),
}));

// Mock da API (Axios)
const mockGet = jest.fn();
jest.mock('@/libs/auth/api', () => ({
  api_route: {
    get: (...args: any) => mockGet(...args),
  },
}));

describe('ListGroupsFromAdminUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockGroupsResponse = {
    data: [
      {
        group: { id: 'g1', name: 'Grupo A', groupType: 'AMATEUR' },
        role: 'ADMIN'
      },
      {
        group: { id: 'g2', name: 'Grupo B', groupType: 'ATHLETIC' },
        role: 'ADMIN'
      }
    ]
  };

  it('deve exibir loading inicialmente', () => {
    // Retorna uma promise que nunca resolve imediatamente para testar o loading
    mockGet.mockReturnValue(new Promise(() => {}));
    
    const { getByText } = render(<ListGroupsFromAdminUser onSelect={() => {}} />);
    expect(getByText('Carregando grupos...')).toBeTruthy();
  });

  it('deve renderizar lista de grupos após API responder', async () => {
    // Simula resposta de sucesso
    mockGet.mockResolvedValue(mockGroupsResponse);

    const { getByText } = render(<ListGroupsFromAdminUser onSelect={() => {}} />);

    // Aguarda o texto "Grupo A" aparecer na tela
    await waitFor(() => {
      expect(getByText('Grupo A')).toBeTruthy();
      expect(getByText('Grupo B')).toBeTruthy();
    });
  });

  it('deve chamar onSelect ao clicar em um grupo', async () => {
    mockGet.mockResolvedValue(mockGroupsResponse);
    const onSelectMock = jest.fn();

    const { getByText } = render(
      <ListGroupsFromAdminUser onSelect={onSelectMock} />
    );

    await waitFor(() => expect(getByText('Grupo B')).toBeTruthy());

    fireEvent.press(getByText('Grupo B'));
    expect(onSelectMock).toHaveBeenCalledWith('g2'); // ID do Grupo B
  });

  it('deve exibir mensagem de erro se API falhar', async () => {
    mockGet.mockRejectedValue({ response: { data: { message: 'Erro na API' } } });

    const { getByText } = render(<ListGroupsFromAdminUser onSelect={() => {}} />);

    await waitFor(() => {
      expect(getByText('Erro na API')).toBeTruthy();
    });
  });

  it('deve exibir mensagem de vazio se não tiver grupos', async () => {
    mockGet.mockResolvedValue({ data: [] });

    const { getByText } = render(<ListGroupsFromAdminUser onSelect={() => {}} />);

    await waitFor(() => {
      expect(getByText('Você não é administrador de nenhum grupo ainda.')).toBeTruthy();
    });
  });
});