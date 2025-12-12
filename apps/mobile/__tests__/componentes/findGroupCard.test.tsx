import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GroupCard } from '../../components/findGroupCard'; // Ajuste o nome do arquivo se for diferente
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

// --- MOCKS BLINDADOS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { input: '#fff', background: '#000', text: '#000' },
    dark: { input: '#333', background: '#fff', text: '#fff' },
  },
}));

// Mock do Expo Router
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

// Mock dos Botões (Simplificados para teste de clique)
jest.mock('../../components/PrimaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="btn-solicitar">
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

jest.mock('../../components/SecondaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="btn-seguir">
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

jest.mock('../../components/AppText', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <Text {...props}>{props.children}</Text>,
  };
});

describe('GroupCard', () => {
  const mockGroup = {
    id: 'g1',
    name: 'Grupo dos Amigos',
    isFollowing: false,
    description: 'Desc',
    acceptingNewMembers: 'true',
    // ...outras props de Group se necessário
  };

  const mockUser = { id: 'u1', token: 'token123' };
  
  // Mocks das funções
  const requestJoinGroup = jest.fn();
  const followGroup = jest.fn();
  const unfollowGroup = jest.fn();
  const setGroupMessage = jest.fn();
  const setGlobalError = jest.fn();
  const onReload = jest.fn();
  const updateGroup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o nome do grupo', () => {
    const { getByText } = render(
      <GroupCard 
        group={mockGroup as any}
        user={mockUser}
        requestJoinGroup={requestJoinGroup}
        followGroup={followGroup}
        unfollowGroup={unfollowGroup}
        setGroupMessage={setGroupMessage}
        setGlobalError={setGlobalError}
        onReload={onReload}
        updateGroup={updateGroup}
      />
    );

    expect(getByText('Grupo dos Amigos')).toBeTruthy();
  });

  it('deve navegar para a página do grupo ao clicar no card', () => {
    const { getByText } = render(
      <GroupCard group={mockGroup as any} user={mockUser} requestJoinGroup={requestJoinGroup} followGroup={followGroup} unfollowGroup={unfollowGroup} setGroupMessage={setGroupMessage} setGlobalError={setGlobalError} onReload={onReload} updateGroup={updateGroup} />
    );

    fireEvent.press(getByText('Grupo dos Amigos'));
    expect(router.push).toHaveBeenCalledWith('/group/g1');
  });

  it('deve solicitar entrada no grupo', async () => {
    requestJoinGroup.mockResolvedValue({ ok: true });

    const { getByTestId } = render(
      <GroupCard group={mockGroup as any} user={mockUser} requestJoinGroup={requestJoinGroup} followGroup={followGroup} unfollowGroup={unfollowGroup} setGroupMessage={setGroupMessage} setGlobalError={setGlobalError} onReload={onReload} updateGroup={updateGroup} />
    );

    fireEvent.press(getByTestId('btn-solicitar'));

    await waitFor(() => {
      expect(requestJoinGroup).toHaveBeenCalledWith('u1', 'token123', 'g1');
      expect(setGroupMessage).toHaveBeenCalledWith('g1', 'Solicitação enviada com sucesso!');
    });
  });

  it('deve seguir o grupo (Follow)', async () => {
    // Grupo inicialmente NÃO seguindo
    const { getByTestId, getByText } = render(
      <GroupCard group={{ ...mockGroup, isFollowing: false } as any} user={mockUser} requestJoinGroup={requestJoinGroup} followGroup={followGroup} unfollowGroup={unfollowGroup} setGroupMessage={setGroupMessage} setGlobalError={setGlobalError} onReload={onReload} updateGroup={updateGroup} />
    );

    expect(getByText('Seguir')).toBeTruthy();
    
    fireEvent.press(getByTestId('btn-seguir'));

    await waitFor(() => {
      expect(followGroup).toHaveBeenCalledWith('token123', 'Grupo dos Amigos');
      expect(updateGroup).toHaveBeenCalledWith(expect.objectContaining({ isFollowing: true }));
    });
  });

  it('deve deixar de seguir o grupo (Unfollow)', async () => {
    // Grupo inicialmente SEGUINDO
    const { getByTestId, getByText } = render(
      <GroupCard group={{ ...mockGroup, isFollowing: true } as any} user={mockUser} requestJoinGroup={requestJoinGroup} followGroup={followGroup} unfollowGroup={unfollowGroup} setGroupMessage={setGroupMessage} setGlobalError={setGlobalError} onReload={onReload} updateGroup={updateGroup} />
    );

    expect(getByText('Seguindo')).toBeTruthy();
    
    fireEvent.press(getByTestId('btn-seguir'));

    await waitFor(() => {
      expect(unfollowGroup).toHaveBeenCalledWith('token123', 'Grupo dos Amigos');
      expect(updateGroup).toHaveBeenCalledWith(expect.objectContaining({ isFollowing: false }));
    });
  });
});