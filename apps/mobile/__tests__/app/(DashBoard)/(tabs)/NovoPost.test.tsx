import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
// AJUSTE O CAMINHO ABAIXO CONFORME A PASTA REAL DO ARQUIVO
import NovoPost from '../../../../app/(DashBoard)/(tabs)/NovoPost'; 
import { View, Text, TouchableOpacity } from 'react-native';

// --- MOCKS BLINDADOS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { background: '#fff', text: '#000' },
    dark: { background: '#000', text: '#fff' },
  },
}));

jest.mock('@/constants/Fonts', () => ({
  Fonts: { otherFonts: { dongleBold: 'Arial' } },
}));

// Mock do Router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mocks Visuais
jest.mock('@/components/BackGroundComp', () => {
  const { View } = require('react-native');
  return (props: any) => <View testID="bg-comp">{props.children}</View>;
});

jest.mock('@/components/SpacerComp', () => 'Spacer');
jest.mock('@/components/AppText', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text {...props}>{props.children}</Text>;
});

// Mock do PrimaryButton
// Renderiza o children (texto) dentro de um TouchableOpacity para podermos clicar
jest.mock('@/components/PrimaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress}>
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

describe('Screen: NovoPost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o título da tela', () => {
    const { getByText } = render(<NovoPost />);
    expect(getByText('Criar')).toBeTruthy();
  });

  it('deve renderizar o título Gerenciar', () => {
    const { getByText } = render(<NovoPost />);
    expect(getByText('Gerenciar')).toBeTruthy();
  });

  it('deve navegar para /criarEvento ao clicar no botão correspondente', () => {
    const { getByText } = render(<NovoPost />);
    fireEvent.press(getByText('Criar Evento'));
    expect(mockPush).toHaveBeenCalledWith('/criarEvento');
  });

  it('deve navegar para /criarPartida ao clicar no botão correspondente', () => {
    const { getByText } = render(<NovoPost />);
    fireEvent.press(getByText('Criar Partida'));
    expect(mockPush).toHaveBeenCalledWith('/criarPartida');
  });

  // it('deve navegar para /criarGrupo ao clicar no botão correspondente', () => {
  //   const { getByText } = render(<NovoPost />);
  //   fireEvent.press(getByText('Criar Grupo'));
  //   expect(mockPush).toHaveBeenCalledWith('/criarGrupo');
  // });

  it('deve navegar para /criarPost ao clicar no botão correspondente', () => {
    const { getByText } = render(<NovoPost />);
    fireEvent.press(getByText('Criar Post'));
    expect(mockPush).toHaveBeenCalledWith('/criarPost');
  });

  it('deve navegar para gerenciamento de posts e partidas', () => {
    const { getByText } = render(<NovoPost />);
    
    fireEvent.press(getByText('Gerenciar Posts'));
    expect(mockPush).toHaveBeenCalledWith('/gerenciarPost');

    fireEvent.press(getByText('Gerenciar Partidas'));
    expect(mockPush).toHaveBeenCalledWith('/gerenciarPartidas');
  });
});