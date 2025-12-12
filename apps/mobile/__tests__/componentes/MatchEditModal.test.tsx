import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MatchEditModal } from '../../components/MatchEditModal';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

// --- MOCKS BLINDADOS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { input: '#fff', orange: 'orange', text: 'black' },
    dark: { input: '#000', orange: 'orange', text: 'white' },
  },
}));

jest.mock('@/constants/Fonts', () => ({
  Fonts: { mainFont: { dongleRegular: 'Arial' } },
}));

// Mock do InputComp
jest.mock('../../components/InputComp', () => {
  const { TextInput } = require('react-native');
  const React = require('react');
  return (props: any) => (
    <TextInput
      testID={`input-${props.label}`}
      placeholder={props.placeholder}
      value={props.value}
      onChangeText={props.onChangeText}
    />
  );
});

// Mock da DescricaoInput
jest.mock('../../components/DescricaoInput', () => {
  const { TextInput } = require('react-native');
  const React = require('react');
  return {
    DescricaoInput: (props: any) => (
      <TextInput
        testID="input-description"
        value={props.value}
        onChangeText={props.onChangeText}
      />
    ),
  };
});

// Mock do InputDateComp
jest.mock('../../components/InputDateComp', () => {
  const { TouchableOpacity, Text } = require('react-native');
  const React = require('react');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="input-date">
      <Text>{props.value || 'Selecione Data'}</Text>
    </TouchableOpacity>
  );
});

// Mock dos Botões
jest.mock('../../components/PrimaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  const React = require('react');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="btn-save">
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

jest.mock('@/components/SecondaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  const React = require('react');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="btn-cancel">
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

// CORREÇÃO CRÍTICA AQUI: Adicionado { virtual: true }
jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  const React = require('react');
  return (props: any) => <View testID="datetimepicker" {...props} />;
}, { virtual: true });

// Mock AppText
jest.mock('../../components/AppText', () => {
  const { Text } = require('react-native');
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => <Text {...props}>{props.children}</Text>,
  };
});

// Mock Ionicons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    Ionicons: (props: any) => <View {...props} />,
  };
});

describe('MatchEditModal', () => {
  const mockMatch = {
    id: '1',
    title: 'Jogo Antigo',
    description: 'Desc',
    sport: 'Futebol',
    location: 'Rua 1',
    maxPlayers: 10,
    MatchDate: '2025-12-25T10:00:00.000Z',
  };

  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSave.mockResolvedValue({ success: true });
  });

  it('deve pré-carregar os dados da partida no formulário', () => {
    const { getByTestId } = render(
      <MatchEditModal 
        visible={true} 
        onClose={mockOnClose} 
        match={mockMatch as any} 
        onSave={mockOnSave} 
      />
    );

    expect(getByTestId('input-Título').props.value).toBe('Jogo Antigo');
    expect(getByTestId('input-Esporte').props.value).toBe('Futebol');
    expect(getByTestId('input-Local').props.value).toBe('Rua 1');
  });

  it('deve atualizar o estado ao digitar e chamar onSave', async () => {
    const { getByTestId } = render(
      <MatchEditModal 
        visible={true} 
        onClose={mockOnClose} 
        match={mockMatch as any} 
        onSave={mockOnSave} 
      />
    );

    fireEvent.changeText(getByTestId('input-Título'), 'Jogo Novo Editado');
    fireEvent.press(getByTestId('btn-save'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Jogo Novo Editado',
        id: '1',
      }));
    });
  });

  it('deve fechar o modal após salvar com sucesso', async () => {
    const { getByTestId } = render(
      <MatchEditModal 
        visible={true} 
        onClose={mockOnClose} 
        match={mockMatch as any} 
        onSave={mockOnSave} 
      />
    );

    fireEvent.press(getByTestId('btn-save'));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('não deve salvar se validação falhar (ex: Título vazio)', async () => {
    const { getByTestId } = render(
      <MatchEditModal 
        visible={true} 
        onClose={mockOnClose} 
        match={mockMatch as any} 
        onSave={mockOnSave} 
      />
    );

    fireEvent.changeText(getByTestId('input-Título'), '');
    fireEvent.press(getByTestId('btn-save'));

    expect(mockOnSave).not.toHaveBeenCalled();
  });
});