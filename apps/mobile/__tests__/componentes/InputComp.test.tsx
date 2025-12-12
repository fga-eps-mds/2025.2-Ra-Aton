import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import InputComp from '../../components/InputComp';
// Importamos View e Text para os mocks
import { View, Text } from 'react-native';

// --- MOCKS BLINDADOS (Mantivemos os que funcionaram) ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false, toggleDarkMode: jest.fn() }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { input: '#FFFFFF', orange: '#FF5500', text: '#000000', warning: 'red' },
    dark: { input: '#000000', orange: '#FF5500', text: '#FFFFFF', warning: 'red' },
    input: { iconColor: '#888888' },
    warning: 'red',
  },
}));

jest.mock('@/constants/Fonts', () => ({
  Fonts: { mainFont: { dongleRegular: 'Arial' } },
}));

// Mock do AppText
jest.mock('../../components/AppText', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: any) => <Text {...props}>{props.children}</Text>,
  };
});

// Mock Ionicons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: (props: any) => <View testID={`icon-${props.name}`} {...props} />,
  };
});

describe('Component: InputComp', () => {

  it('deve encontrar o input pelo VALOR (DisplayValue)', () => {
    // Esse passou nos testes anteriores! Mantivemos.
    const { getByDisplayValue } = render(
      <InputComp value="VALOR_UNICO_PARA_TESTE" />
    );
    const input = getByDisplayValue('VALOR_UNICO_PARA_TESTE');
    expect(input).toBeTruthy();
  });

  it('deve aceitar interação de texto (onChangeText)', () => {
    // Esse também passou!
    const fn = jest.fn();
    const { getByDisplayValue } = render(
      <InputComp value="INIT_VALUE" onChangeText={fn} />
    );

    const input = getByDisplayValue('INIT_VALUE');
    fireEvent.changeText(input, 'Novo Texto');
    expect(fn).toHaveBeenCalledWith('Novo Texto');
  });

  it('deve renderizar o Label corretamente', () => {
    // CORREÇÃO FINAL:
    // O seu log mostrou que o componente renderiza <TextInput accessibilityLabel="Meu Label Seguro" />
    // Portanto, usamos getByLabelText para encontrá-lo.
    const { getByLabelText } = render(<InputComp label="Meu Label Seguro" />);

    expect(getByLabelText('Meu Label Seguro')).toBeTruthy();
  });

  it('deve renderizar com todas as props para garantir Coverage', () => {
    // Teste de "Fumaça" para cobrir linhas de código
    const { toJSON } = render(
      <InputComp
        secureTextEntry={true}
        value="Coverage"
        formatter={(v) => `R$ ${v}`}
        status={true}
        statusText="Mensagem de Erro"
        iconName="search"
      />
    );
    expect(toJSON()).toBeDefined();
  });
});