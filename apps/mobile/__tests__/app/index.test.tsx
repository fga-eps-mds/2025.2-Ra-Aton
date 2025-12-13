import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Index from '../../app/index'; 

// --- MOCKS ---

// 1. Mock do Polyfills (para não quebrar imports)
jest.mock('../../polyfills', () => ({}));

// 2. Mock do Tema
jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { background: '#fff', orange: 'orange' },
    dark: { background: '#000', orange: 'orange' },
  },
}));

// 3. Mock do Router (Espião de navegação)
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  Link: 'Link', // Mock simples caso seja usado
}));

// 4. Mock do Contexto de Usuário (DINÂMICO)
// Criamos uma variável mutável para alterar o retorno do hook em cada teste
let mockUserReturn = { user: null, loading: true };

jest.mock('@/libs/storage/UserContext', () => ({
  useUser: () => mockUserReturn,
}));

describe('Screen: app/index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reseta para loading por padrão
    mockUserReturn = { user: null as any, loading: true };
  });

  it('deve renderizar ActivityIndicator enquanto carrega', () => {
    mockUserReturn = { user: null, loading: true };
    const { UNSAFE_getByType } = render(<Index />);
    
    // Procura pelo ActivityIndicator (nativo do RN)
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('deve redirecionar para "login" se não houver usuário', async () => {
    mockUserReturn = { user: null, loading: false };
    render(<Index />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('login');
    });
  });

  it('deve redirecionar JOGADOR para /Partidas', async () => {
    mockUserReturn = { 
      user: { profileType: 'JOGADOR' }, 
      loading: false 
    };
    render(<Index />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(DashBoard)/(tabs)/Partidas');
    });
  });

  it('deve redirecionar TORCEDOR para /Home', async () => {
    mockUserReturn = { 
      user: { profileType: 'TORCEDOR' }, 
      loading: false 
    };
    render(<Index />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(DashBoard)/(tabs)/Home');
    });
  });

  it('deve redirecionar ATLETICA para /Teams', async () => {
    mockUserReturn = { 
      user: { profileType: 'ATLETICA' }, 
      loading: false 
    };
    render(<Index />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(DashBoard)/(tabs)/Teams');
    });
  });

  it('deve redirecionar Default para /Home', async () => {
    mockUserReturn = { 
      user: { profileType: 'OUTRO' }, 
      loading: false 
    };
    render(<Index />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(DashBoard)/(tabs)/Home');
    });
  });
});