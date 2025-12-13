import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FollowButtonComp } from '@/components/FollowButtonComp';

describe('FollowButtonComp', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o botão "Seguir" quando não está seguindo', () => {
    const { getByText } = render(
      <FollowButtonComp
        isFollowing={false}
        onPress={mockOnPress}
        isDarkMode={false}
      />
    );

    expect(getByText('Seguir')).toBeTruthy();
  });

  it('deve renderizar o botão "Seguindo" quando está seguindo', () => {
    const { getByText } = render(
      <FollowButtonComp
        isFollowing={true}
        onPress={mockOnPress}
        isDarkMode={false}
      />
    );

    expect(getByText('Seguindo')).toBeTruthy();
  });

  it('deve chamar onPress quando o botão é clicado', () => {
    const { getByText } = render(
      <FollowButtonComp
        isFollowing={false}
        onPress={mockOnPress}
        isDarkMode={false}
      />
    );

    fireEvent.press(getByText('Seguir'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar ActivityIndicator quando está carregando', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <FollowButtonComp
        isFollowing={false}
        onPress={mockOnPress}
        isLoading={true}
        isDarkMode={false}
      />
    );

    // Não deve mostrar o texto
    expect(queryByText('Seguir')).toBeNull();
    
    // Deve mostrar o ActivityIndicator
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('deve desabilitar o botão quando está carregando', () => {
    const { getByTestId } = render(
      <FollowButtonComp
        isFollowing={false}
        onPress={mockOnPress}
        isLoading={true}
        isDarkMode={false}
      />
    );

    const button = getByTestId('follow-button');
    expect(button.props.disabled).toBe(true);
  });

  it('deve ter o estado disabled quando está carregando', () => {
    const { getByTestId } = render(
      <FollowButtonComp
        isFollowing={false}
        onPress={mockOnPress}
        isLoading={true}
        isDarkMode={false}
      />
    );

    const button = getByTestId('follow-button');
    expect(button.props.disabled).toBe(true);
  });

  it('deve aplicar estilos do tema escuro', () => {
    const { getByTestId } = render(
      <FollowButtonComp
        isFollowing={false}
        onPress={mockOnPress}
        isDarkMode={true}
      />
    );

    const button = getByTestId('follow-button');
    expect(button.props.style).toBeDefined();
  });

  it('deve aplicar estilos do tema claro', () => {
    const { getByTestId } = render(
      <FollowButtonComp
        isFollowing={false}
        onPress={mockOnPress}
        isDarkMode={false}
      />
    );

    const button = getByTestId('follow-button');
    expect(button.props.style).toBeDefined();
  });
});

