import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FormsCadastro from '../../../app/(Auth)/formsCadastro';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

// --- MOCKS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { background: '#fff', text: '#000', orange: 'orange' },
    dark: { background: '#000', text: '#fff', orange: 'orange' },
  },
}));

jest.mock('@/constants/Fonts', () => ({
  Fonts: { otherFonts: { dongleBold: 'Arial' } },
}));

jest.mock('@/assets/img/Logo_1_Atom.png', () => 1);

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// MOCK DO HOOK (CORRIGIDO)
// Criamos uma função Jest vazia aqui. Vamos definir o retorno dela nos testes.
jest.mock('@/libs/hooks/useFormsCadastro', () => ({
  useFormsCadastro: jest.fn(),
}));

// Importamos o hook mockado para controlá-lo
import { useFormsCadastro } from '@/libs/hooks/useFormsCadastro';

// Mocks Visuais
jest.mock('@/components/BackGroundComp', () => {
  const { View } = require('react-native');
  const React = require('react');
  return (props: any) => <View testID="bg-comp">{props.children}</View>;
});

jest.mock('@/components/PrimaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  const React = require('react');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID={`btn-${props.children}`}>
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

jest.mock('@/components/SecondaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  const React = require('react');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="btn-pular">
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

jest.mock('@/components/AppText', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: any) => <Text {...props}>{props.children}</Text>,
  };
});

describe('Screen: FormsCadastro', () => {
  const mockSendType = jest.fn();
  const mockComebackPage = jest.fn();

  // Helper para tipar o mock
  const mockUseFormsCadastro = useFormsCadastro as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // DEFINE O COMPORTAMENTO PADRÃO DO HOOK
    mockUseFormsCadastro.mockReturnValue({
      loading: false,
      sendType: mockSendType,
      comebackPage: mockComebackPage
    });
  });

  it('deve renderizar os botões de opção quando não está carregando', () => {
    const { getByText } = render(<FormsCadastro />);
    
    expect(getByText('Atlética')).toBeTruthy();
    expect(getByText('Jogador')).toBeTruthy();
    expect(getByText('Torcedor')).toBeTruthy();
  });

  it('deve chamar sendType com o tipo correto ao clicar nos botões', () => {
    const { getByText } = render(<FormsCadastro />);

    fireEvent.press(getByText('Atlética'));
    expect(mockSendType).toHaveBeenCalledWith('ATLETICA');

    fireEvent.press(getByText('Jogador'));
    expect(mockSendType).toHaveBeenCalledWith('JOGADOR');

    fireEvent.press(getByText('Torcedor'));
    expect(mockSendType).toHaveBeenCalledWith('TORCEDOR');
  });

  it('deve navegar para Home ao clicar em "Pular esta etapa"', () => {
    const { getByTestId } = render(<FormsCadastro />);
    
    fireEvent.press(getByTestId('btn-pular'));
    expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('(DashBoard)/Home'));
  });

  it('deve mostrar ActivityIndicator quando loading for true', () => {
    // AQUI O MOCK DINÂMICO BRILHA: Mudamos o retorno só para esse teste
    mockUseFormsCadastro.mockReturnValue({
      loading: true, // <--- Loading ativado
      sendType: mockSendType,
      comebackPage: mockComebackPage
    });
    
    const { UNSAFE_getAllByType } = render(<FormsCadastro />);
    
    const spinners = UNSAFE_getAllByType(ActivityIndicator);
    expect(spinners.length).toBeGreaterThan(0);
  });
});