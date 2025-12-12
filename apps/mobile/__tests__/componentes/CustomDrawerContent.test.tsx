import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomDrawerContent from '../../components/CustomDrawerContent';
import { TouchableOpacity, Text, View } from 'react-native';

// --- MOCKS BLINDADOS ---

jest.mock('../../constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('../../constants/Colors', () => ({
  Colors: {
    light: { background: '#fff', text: '#000', orange: 'orange' },
    dark: { background: '#000', text: '#fff', orange: 'orange' },
  },
}));

// Mock do Contexto de Usuário (para testar Logout)
const mockLogout = jest.fn();
jest.mock('@/libs/storage/UserContext', () => ({
  useUser: () => ({
    user: { name: 'Teste' },
    logout: mockLogout,
  }),
}));

// Mock do Contexto de Notificações (para testar Badge)
jest.mock('../../libs/storage/NotificationContext', () => ({
  useNotifications: () => ({
    unreadCount: 5, // Vamos testar se aparece o número 5
  }),
}));

// Mock do React Navigation Drawer
// Transformamos o DrawerItem em um botão simples para ser fácil de clicar no teste
jest.mock('@react-navigation/drawer', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return {
    DrawerContentScrollView: (props: any) => <>{props.children}</>,
    DrawerItem: (props: any) => (
      <TouchableOpacity onPress={props.onPress} testID={`drawer-item-${props.label}`}>
        {typeof props.label === 'function' ? props.label() : <Text>{props.label}</Text>}
      </TouchableOpacity>
    ),
  };
});

// Mock do Ionicons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: (props: any) => <View {...props} />,
  };
});

describe('CustomDrawerContent', () => {
  // Mock da prop navigation
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const props = {
    navigation: mockNavigation,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve navegar para a tela correta ao clicar nos itens', () => {
    const { getByText } = render(<CustomDrawerContent {...props} />);

    // Teste: Clicar em "Início"
    fireEvent.press(getByText('Início'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('(tabs)', { screen: 'Home' });

    // Teste: Clicar em "Amigos"
    fireEvent.press(getByText('Amigos'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('(tabs)', { screen: 'Friends' });
  });

  it('deve chamar a função de logout ao clicar em Sair', () => {
    const { getByText } = render(<CustomDrawerContent {...props} />);

    fireEvent.press(getByText('Sair'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('deve exibir o contador de notificações (Badge) se houver não lidas', () => {
    const { getByText } = render(<CustomDrawerContent {...props} />);

    // Procura pelo texto "Notificações" (o label)
    expect(getByText('Notificações')).toBeTruthy();
    
    // Procura pelo número "5" (definido no mock)
    // Usamos getAllByText porque o número 5 pode aparecer em outros lugares, pegamos o primeiro ou usamos regex
    // Nesse caso, o badge é bem específico.
    expect(getByText('5')).toBeTruthy();
  });
});