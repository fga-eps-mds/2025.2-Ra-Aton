import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MatchesCard } from '../../components/MatchesCardComp';
import { View, Text } from 'react-native';

// --- MOCKS BLINDADOS ---

jest.mock('@/constants/Colors', () => ({
  Colors: {
    cardGames: { backgroundCard: '#111', header: '#222' },
    input: { iconColor: '#555' },
  },
}));

jest.mock('@/constants/Fonts', () => ({
  Fonts: { mainFont: { dongleRegular: 'Arial' } },
}));

// Mock do SVG
jest.mock('@/assets/img/vs-icon.svg', () => {
  const { View } = require('react-native');
  return (props: any) => <View testID="vs-icon" {...props} />;
});

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

// Mock do Spacer
jest.mock('../../components/SpacerComp', () => 'Spacer');

describe('MatchesCard', () => {
  const mockMatch = {
    id: '1',
    title: 'Grande Final',
    MatchStatus: 'Agendado',
    teamNameA: 'Time A',
    teamNameB: 'Time B',
    teamAScore: '2',
    teamBScore: '1',
  };

  it('deve renderizar informações da partida', () => {
    const { getByText } = render(
      <MatchesCard 
        match={mockMatch as any} 
      />
    );

    expect(getByText('Grande Final')).toBeTruthy();
    expect(getByText('Agendado')).toBeTruthy();
    expect(getByText('Time A')).toBeTruthy();
    expect(getByText('Time B')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
  });

  it('deve mostrar botão "PARTICIPAR" se não inscrito', () => {
    const { getByText } = render(
      <MatchesCard 
        match={mockMatch as any} 
        isUserSubscriped={false}
      />
    );
    expect(getByText('PARTICIPAR')).toBeTruthy();
  });

  it('deve mostrar botão "VISUALIZAR" se já inscrito', () => {
    const { getByText } = render(
      <MatchesCard 
        match={mockMatch as any} 
        isUserSubscriped={true}
      />
    );
    expect(getByText('VISUALIZAR')).toBeTruthy();
  });

  it('deve disparar onPressJoinMatch ao clicar no botão', () => {
    const onJoinMock = jest.fn();
    const { getByText } = render(
      <MatchesCard 
        match={mockMatch as any} 
        onPressJoinMatch={onJoinMock}
        isUserSubscriped={false}
      />
    );

    fireEvent.press(getByText('PARTICIPAR'));
    expect(onJoinMock).toHaveBeenCalled();
  });

  it('deve disparar onPressInfos ao clicar no ícone de info', () => {
    const onInfoMock = jest.fn();
    const { getByTestId } = render(
      <MatchesCard 
        match={mockMatch as any} 
        onPressInfos={onInfoMock}
      />
    );

    // O mock do Ionicons cria testID="icon-information-circle"
    // Precisamos clicar no TouchableOpacity pai.
    // Como o ícone está dentro, o evento bubble up deve funcionar.
    fireEvent.press(getByTestId('icon-information-circle'));
    
    expect(onInfoMock).toHaveBeenCalled();
  });
});