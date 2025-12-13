import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { JoinedGroupsComp } from '@/components/JoinedGroupsComp';

// MOCKS
jest.mock('@/components/AppText', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text {...props}>{props.children}</Text>;
});

const MockButton = (props: any) => {
  const { TouchableOpacity, Text } = require('react-native');
  return (
    <TouchableOpacity testID={props.testID} onPress={props.onPress} style={props.style}>
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
};

jest.mock('@/components/PrimaryButton', () => (props: any) => <MockButton {...props} testID="primary-button" />);

jest.mock('@/components/ProfileThumbnailComp', () => {
  const { View } = require('react-native');
  return (props: any) => <View testID="profile-thumbnail" />;
});

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

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

describe('JoinedGroupsComp', () => {
  const defaultProps = {
    name: 'Grupo de Futebol',
    logoUrl: 'https://example.com/logo.png',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o nome do grupo corretamente', () => {
    const { getByText } = render(<JoinedGroupsComp {...defaultProps} />);
    expect(getByText('Grupo de Futebol')).toBeTruthy();
  });

  it('deve renderizar o ProfileThumbnailComp', () => {
    const { getByTestId } = render(<JoinedGroupsComp {...defaultProps} />);
    expect(getByTestId('profile-thumbnail')).toBeTruthy();
  });

  it('deve renderizar o botão "Perfil"', () => {
    const { getByText } = render(<JoinedGroupsComp {...defaultProps} />);
    expect(getByText('Perfil')).toBeTruthy();
  });

  it('deve navegar para o perfil do grupo ao clicar no botão', () => {
    const { getByTestId } = render(<JoinedGroupsComp {...defaultProps} />);
    fireEvent.press(getByTestId('primary-button'));
    
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(DashBoard)/(tabs)/Perfil",
      params: { identifier: 'Grupo de Futebol', type: "group" }
    });
  });

  it('deve aplicar as cores do tema corretamente (Light Mode)', () => {
    const { getByText } = render(<JoinedGroupsComp {...defaultProps} />);
    const nameText = getByText('Grupo de Futebol');
    
    expect(nameText.props.style).toEqual(expect.objectContaining({
      color: '#121212',
    }));
  });
});