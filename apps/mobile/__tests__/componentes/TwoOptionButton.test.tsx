import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TwoOptionSwitch from '@/components/TwoOptionButton';

// 1. MOCKS

// Mock do AppText
jest.mock('@/components/AppText', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text {...props}>{props.children}</Text>;
});

// Mock do Hook useTheme
jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }), // Testando modo Light
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: {
      input: '#E5E5E5',
      gray: '#A2A2A2',
      text: '#121212',
    },
    dark: {
      input: '#1C1C1C',
      gray: '#2C2C2C',
      text: '#F9F8F8',
    },
  },
}));

describe('TwoOptionSwitch Component', () => {
  const mockOnChange = jest.fn();
  
  const defaultProps = {
    optionLeft: 'Opção Esquerda',
    optionRight: 'Opção Direita',
    selected: 'LEFT' as const,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('deve renderizar os textos das duas opções corretamente', () => {
    const { getByText } = render(<TwoOptionSwitch {...defaultProps} />);

    expect(getByText('Opção Esquerda')).toBeTruthy();
    expect(getByText('Opção Direita')).toBeTruthy();
  });

  it('deve chamar onChange("RIGHT") ao clicar na opção da direita', () => {
    const { getByText } = render(<TwoOptionSwitch {...defaultProps} />);
    const rightOption = getByText('Opção Direita');
    fireEvent.press(rightOption);
    expect(mockOnChange).toHaveBeenCalledWith('RIGHT');
  });

  it('deve chamar onChange("LEFT") ao clicar na opção da esquerda', () => {
    const { getByText } = render(<TwoOptionSwitch {...defaultProps} selected="RIGHT" />);
    
    const leftOption = getByText('Opção Esquerda');
    
    // Dispara o evento de clique
    fireEvent.press(leftOption);
    
    // Verifica se a função foi chamada com o argumento correto
    expect(mockOnChange).toHaveBeenCalledWith('LEFT');
  });

  it('deve aplicar as cores corretas quando a opção ESQUERDA está selecionada', () => {
    const { getByText } = render(<TwoOptionSwitch {...defaultProps} selected="LEFT" />);

    const textLeft = getByText('Opção Esquerda');
    const textRight = getByText('Opção Direita');

    expect(textLeft.props.style).toEqual(expect.objectContaining({
      color: '#121212', 
    }));

    expect(textRight.props.style).toEqual(expect.objectContaining({
      color: '#E5E5E5',
    }));
  });

  it('deve aplicar as cores corretas quando a opção DIREITA está selecionada', () => {
    const { getByText } = render(<TwoOptionSwitch {...defaultProps} selected="RIGHT" />);

    const textLeft = getByText('Opção Esquerda');
    const textRight = getByText('Opção Direita');

    expect(textLeft.props.style).toEqual(expect.objectContaining({
      color: '#E5E5E5',
    }));

    expect(textRight.props.style).toEqual(expect.objectContaining({
      color: '#121212',
    }));
  });
});