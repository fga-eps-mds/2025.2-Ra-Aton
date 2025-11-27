import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DescricaoInput } from '@/components/DescricaoInput';
import { useTheme } from '@/constants/Theme';

// 1. Mock do Hook de Tema
jest.mock('@/constants/Theme', () => ({
  useTheme: jest.fn(),
}));

// 2. Mock das Cores e Fontes (opcional, mas evita erros de importação)
jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { text: '#000', input: '#eee', orange: 'orange' },
    dark: { text: '#fff', input: '#333', orange: 'darkorange' },
  },
}));

// 3. Mock do AppText (caso ele tenha lógica complexa, simplificamos aqui)
jest.mock('@/components/AppText', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text {...props}>{props.children}</Text>;
});

describe('DescricaoInput', () => {
  // Helper para configurar o tema antes de cada teste
  const mockedUseTheme = useTheme as jest.Mock;

  beforeEach(() => {
    // Por padrão, simulamos o tema Light
    mockedUseTheme.mockReturnValue({ isDarkMode: false });
    jest.clearAllMocks();
  });

  it('deve renderizar corretamente com as props padrão', () => {
    const { getByPlaceholderText, getByText } = render(
      <DescricaoInput value="" onChangeText={() => {}} />
    );

    // Verifica se o label padrão aparece
    expect(getByText('Descrição')).toBeTruthy();
    // Verifica se o placeholder padrão aparece
    expect(getByPlaceholderText('Digite aqui...')).toBeTruthy();
  });

  it('deve exibir o valor passado na prop "value"', () => {
    const valorTeste = "Minha descrição inicial";
    
    const { getByDisplayValue } = render(
      <DescricaoInput value={valorTeste} onChangeText={() => {}} />
    );

    // Verifica se o input está exibindo o texto correto
    expect(getByDisplayValue(valorTeste)).toBeTruthy();
  });

  it('deve chamar a função onChangeText quando o usuário digita', () => {
    const mockOnChangeText = jest.fn();
    
    const { getByPlaceholderText } = render(
      <DescricaoInput value="" onChangeText={mockOnChangeText} />
    );

    const input = getByPlaceholderText('Digite aqui...');

    // Simula a digitação do usuário
    fireEvent.changeText(input, 'Novo texto digitado');

    // Verifica se a função foi chamada com o texto novo
    expect(mockOnChangeText).toHaveBeenCalledWith('Novo texto digitado');
    expect(mockOnChangeText).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar com Label customizado', () => {
    const labelCustom = "Sobre o Evento";
    
    const { getByText } = render(
      <DescricaoInput 
        value="" 
        onChangeText={() => {}} 
        label={labelCustom} 
      />
    );

    expect(getByText(labelCustom)).toBeTruthy();
  });

  it('não deve renderizar o label se ele for null ou string vazia (se a lógica permitir)', () => {
    
    const { queryByText } = render(
        // @ts-ignore (caso o type exija string, forçamos vazio para teste)
      <DescricaoInput value="" onChangeText={() => {}} label="" />
    );

    // queryByText retorna null se não achar (ao contrário do getByText que dá erro)
    expect(queryByText('Descrição')).toBeNull();
  });

  it('deve aplicar estilos baseados no tema Dark Mode', () => {
    // Mudamos o mock para retornar tema escuro
    mockedUseTheme.mockReturnValue({ isDarkMode: true });

    const { getByPlaceholderText } = render(
      <DescricaoInput value="" onChangeText={() => {}} />
    );

    const input = getByPlaceholderText('Digite aqui...');
    
    // Aqui verificamos se a cor de fundo corresponde ao mock dark definido lá em cima (#333)
    // O style geralmente vem achatado (flattened), podemos checar propriedades específicas
    expect(input.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#333', 
      })
    );
  });
});