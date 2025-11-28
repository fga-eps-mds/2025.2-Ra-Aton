import React from 'react';
import { render } from '@testing-library/react-native';
import { CreateGroupComp } from '@/components/CreateGroupComp';

// MOCKS
jest.mock('@/components/AppText', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text {...props}>{props.children}</Text>;
});

jest.mock('@/components/SecondaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => (
    <TouchableOpacity testID="create-button" style={props.style}>
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: {
      input: '#E5E5E5',
      background: '#F9F8F8',
      text: '#121212',
    },
    dark: {
      input: '#1C1C1C',
      background: '#121212',
      text: '#F9F8F8',
    },
  },
}));

describe('CreateGroupComp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o título "Novo Grupo" e o botão "Criar +"', () => {
    const { getByText } = render(<CreateGroupComp />);
    expect(getByText('Novo Grupo')).toBeTruthy();
    expect(getByText('Criar +')).toBeTruthy();
  });

  it('deve aplicar a cor de texto correta baseada no tema (Light Mode)', () => {
    const { getByText } = render(<CreateGroupComp />);
    const titleText = getByText('Novo Grupo');
    
    expect(titleText.props.style).toEqual(expect.objectContaining({
      color: '#121212',
    }));
  });
});