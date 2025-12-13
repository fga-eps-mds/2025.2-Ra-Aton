/**
 * Testes do componente findGroupCard (GroupCard)
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GroupCard } from '../../components/findGroupCard';
import { router } from 'expo-router';

// Mock do Expo Router
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useFocusEffect: (cb: any) => cb(),
  Link: ({ children }: any) => children,
}));

// Mock do Theme
jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false, toggleDarkMode: jest.fn() }),
}));

// Mock das cores
jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { input: '#fff', background: '#f0f0f0', text: '#000', orange: '#ff6600' },
    dark: { input: '#333', background: '#111', text: '#fff', orange: '#ff8800' },
  },
}));

// Mock do ProfileThumbnailComp
jest.mock('@/components/ProfileThumbnailComp', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="profile-thumbnail" />,
  };
});

// Mock do AppText
jest.mock('@/components/AppText', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <Text {...props}>{props.children}</Text>,
  };
});

// Mock do PrimaryButton
jest.mock('@/components/PrimaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => (
      <TouchableOpacity onPress={props.onPress} testID="btn-solicitar" disabled={props.disabled}>
        <Text>{props.children}</Text>
      </TouchableOpacity>
    ),
  };
});

// Mock do SecondaryButton
jest.mock('../../components/SecondaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => (
      <TouchableOpacity onPress={props.onPress} testID="btn-seguir" disabled={props.disabled}>
        <Text>{props.children}</Text>
      </TouchableOpacity>
    ),
  };
});

// Mock group factory
const createMockGroup = (overrides = {}) => ({
  id: 'g1',
  name: 'Grupo Teste',
  description: 'Descrição do grupo',
  isFollowing: false,
  acceptingNewMembers: true,
  logoUrl: null,
  type: 'PUBLIC',
  ...overrides,
});

// Mock user
const mockUser = { id: 'u1', token: 'token123' };

// Mock functions factory
const createMockFunctions = () => ({
  requestJoinGroup: jest.fn().mockResolvedValue({ ok: true }),
  followGroup: jest.fn().mockResolvedValue({ ok: true }),
  unfollowGroup: jest.fn().mockResolvedValue({ ok: true }),
  setGroupMessage: jest.fn(),
  setGlobalError: jest.fn(),
  onReload: jest.fn().mockResolvedValue(undefined),
  updateGroup: jest.fn(),
});

describe('GroupCard', () => {
  let mockFunctions: ReturnType<typeof createMockFunctions>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFunctions = createMockFunctions();
  });

  describe('Renderização básica', () => {
    it('deve renderizar sem erros', () => {
      expect(() => render(
        <GroupCard
          group={createMockGroup()}
          user={mockUser}
          {...mockFunctions}
        />
      )).not.toThrow();
    });

    it('deve renderizar o nome do grupo', () => {
      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ name: 'Meu Grupo' })}
          user={mockUser}
          {...mockFunctions}
        />
      );
      expect(getByText('Meu Grupo')).toBeTruthy();
    });

    it('deve renderizar botão Solicitar quando aceita novos membros', () => {
      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ acceptingNewMembers: true })}
          user={mockUser}
          {...mockFunctions}
        />
      );
      expect(getByText('Solicitar')).toBeTruthy();
    });

    it('não deve renderizar botão Solicitar quando não aceita novos membros', () => {
      const { queryByText } = render(
        <GroupCard
          group={createMockGroup({ acceptingNewMembers: false })}
          user={mockUser}
          {...mockFunctions}
        />
      );
      expect(queryByText('Solicitar')).toBeNull();
    });
  });

  describe('Estado de seguir', () => {
    it('deve mostrar "Seguir" quando não está seguindo', () => {
      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ isFollowing: false })}
          user={mockUser}
          {...mockFunctions}
        />
      );
      expect(getByText('Seguir')).toBeTruthy();
    });

    it('deve mostrar "Seguindo" quando está seguindo', () => {
      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ isFollowing: true })}
          user={mockUser}
          {...mockFunctions}
        />
      );
      expect(getByText('Seguindo')).toBeTruthy();
    });
  });

  describe('Navegação', () => {
    it('deve navegar para a página do grupo ao clicar no card', () => {
      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ id: 'g123', name: 'Grupo Click' })}
          user={mockUser}
          {...mockFunctions}
        />
      );

      fireEvent.press(getByText('Grupo Click'));
      expect(router.push).toHaveBeenCalledWith('/group/g123');
    });
  });

  describe('Ação de seguir/deixar de seguir', () => {
    it('deve chamar followGroup ao clicar em Seguir', async () => {
      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ isFollowing: false, name: 'Grupo Follow' })}
          user={mockUser}
          {...mockFunctions}
        />
      );

      fireEvent.press(getByText('Seguir'));

      await waitFor(() => {
        expect(mockFunctions.followGroup).toHaveBeenCalledWith('token123', 'Grupo Follow');
      });
    });

    it('deve chamar unfollowGroup ao clicar em Seguindo', async () => {
      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ isFollowing: true, name: 'Grupo Unfollow' })}
          user={mockUser}
          {...mockFunctions}
        />
      );

      fireEvent.press(getByText('Seguindo'));

      await waitFor(() => {
        expect(mockFunctions.unfollowGroup).toHaveBeenCalledWith('token123', 'Grupo Unfollow');
      });
    });

    it('deve chamar updateGroup após follow com sucesso', async () => {
      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ isFollowing: false })}
          user={mockUser}
          {...mockFunctions}
        />
      );

      fireEvent.press(getByText('Seguir'));

      await waitFor(() => {
        expect(mockFunctions.updateGroup).toHaveBeenCalledWith(
          expect.objectContaining({ isFollowing: true })
        );
      });
    });

    it('deve tratar erro no follow silenciosamente', async () => {
      mockFunctions.followGroup.mockRejectedValue(new Error('Network error'));

      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ isFollowing: false })}
          user={mockUser}
          {...mockFunctions}
        />
      );

      fireEvent.press(getByText('Seguir'));

      await waitFor(() => {
        expect(mockFunctions.followGroup).toHaveBeenCalled();
      });
    });
  });

  describe('Ação de solicitar entrada', () => {
    it('deve chamar requestJoinGroup ao clicar em Solicitar', async () => {
      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ id: 'g-req', acceptingNewMembers: true })}
          user={mockUser}
          {...mockFunctions}
        />
      );

      fireEvent.press(getByText('Solicitar'));

      await waitFor(() => {
        expect(mockFunctions.requestJoinGroup).toHaveBeenCalledWith('u1', 'token123', 'g-req');
      });
    });

    it('deve chamar onReload após solicitação bem-sucedida', async () => {
      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ acceptingNewMembers: true })}
          user={mockUser}
          {...mockFunctions}
        />
      );

      fireEvent.press(getByText('Solicitar'));

      await waitFor(() => {
        expect(mockFunctions.onReload).toHaveBeenCalled();
      });
    });

    it('deve exibir mensagem de sucesso após solicitação', async () => {
      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ id: 'g-msg', acceptingNewMembers: true })}
          user={mockUser}
          {...mockFunctions}
        />
      );

      fireEvent.press(getByText('Solicitar'));

      await waitFor(() => {
        expect(mockFunctions.setGroupMessage).toHaveBeenCalledWith(
          'g-msg',
          'Solicitação enviada com sucesso!'
        );
      });
    });

    it('deve exibir erro quando result.ok é false', async () => {
      mockFunctions.requestJoinGroup.mockResolvedValue({
        ok: false,
        message: 'Você já solicitou entrada',
      });

      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ id: 'g-fail', acceptingNewMembers: true })}
          user={mockUser}
          {...mockFunctions}
        />
      );

      fireEvent.press(getByText('Solicitar'));

      await waitFor(() => {
        expect(mockFunctions.setGlobalError).toHaveBeenCalledWith('Você já solicitou entrada');
      });
    });

    it('deve tratar exceção na solicitação', async () => {
      mockFunctions.requestJoinGroup.mockRejectedValue({
        response: { data: { message: 'Erro do servidor' } },
      });

      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ id: 'g-error', acceptingNewMembers: true })}
          user={mockUser}
          {...mockFunctions}
        />
      );

      fireEvent.press(getByText('Solicitar'));

      await waitFor(() => {
        expect(mockFunctions.setGlobalError).toHaveBeenCalledWith('Erro do servidor');
      });
    });

    it('deve usar mensagem padrão quando não há mensagem no erro', async () => {
      mockFunctions.requestJoinGroup.mockRejectedValue({});

      const { getByText } = render(
        <GroupCard
          group={createMockGroup({ id: 'g-default', acceptingNewMembers: true })}
          user={mockUser}
          {...mockFunctions}
        />
      );

      fireEvent.press(getByText('Solicitar'));

      await waitFor(() => {
        expect(mockFunctions.setGlobalError).toHaveBeenCalledWith(
          'Não foi possível enviar a solicitação.'
        );
      });
    });
  });
});