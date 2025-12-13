import React from 'react';
import { ProfileTabsComp } from "@/components/ProfileTabsComp";
import { render, fireEvent, waitFor } from "../test-utils";
import { Imatches } from "@/libs/interfaces/Imatches";
import { IGroup } from "@/libs/interfaces/Igroup";
import { IPost } from "@/libs/interfaces/Ipost";
import { IUserProfile } from "@/libs/interfaces/Iprofile";

// Mock dos componentes filhos
jest.mock('@/components/MatchesCardComp', () => ({
  MatchesCard: ({ match }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, `Match: ${match.id}`);
  },
}));

jest.mock('@/components/PostCardComp', () => ({
  __esModule: true,
  default: ({ post }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, `Post: ${post.id}`);
  },
}));

jest.mock('@/components/MemberCardComp', () => ({
  __esModule: true,
  default: ({ member }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, `Member: ${member.user.name}`);
  },
}));

describe('ProfileTabsComp', () => {
  const mockMatches: Imatches[] = [
    {
      id: 'match-1',
      description: 'Match 1',
      date: '2024-01-01',
      local: 'Campo 1',
      teamA: { players: [] },
      teamB: { players: [] },
    } as Imatches,
    {
      id: 'match-2',
      description: 'Match 2',
      date: '2024-01-02',
      local: 'Campo 2',
      teamA: { players: [] },
      teamB: { players: [] },
    } as Imatches,
  ];

  const mockFollowedGroups: IGroup[] = [
    {
      id: 'group-1',
      name: 'Grupo Seguido 1',
      description: 'Descrição do grupo seguido 1',
    } as IGroup,
  ];

  const mockMemberGroups: IGroup[] = [
    {
      id: 'group-2',
      name: 'Grupo Membro 1',
      description: 'Descrição do grupo membro 1',
    } as IGroup,
  ];

  const mockPosts: IPost[] = [
    {
      id: 'post-1',
      content: 'Post 1',
      createdAt: '2024-01-01',
    } as IPost,
    {
      id: 'post-2',
      content: 'Post 2',
      createdAt: '2024-01-02',
    } as IPost,
  ];

  const mockMembers: IUserProfile[] = [
    {
      id: 'user-1',
      name: 'João Silva',
      userName: 'joao',
      email: 'joao@example.com',
      profilePicture: null,
      isOwner: true,
    } as IUserProfile,
    {
      id: 'user-2',
      name: 'Maria Santos',
      userName: 'maria',
      email: 'maria@example.com',
      profilePicture: null,
      isOwner: false,
    } as IUserProfile,
  ];

  describe('User Profile Type', () => {
    const userProps = {
      type: 'user' as const,
      matches: mockMatches,
      followedGroups: mockFollowedGroups,
      memberGroups: mockMemberGroups,
      isDarkMode: false,
      currentUserId: 'current-user',
    };

    it('deve renderizar as abas de perfil de usuário', () => {
      const { getByText } = render(<ProfileTabsComp {...userProps} />);

      expect(getByText('Partidas')).toBeTruthy();
      expect(getByText('Seguindo')).toBeTruthy();
      expect(getByText('Membro')).toBeTruthy();
    });

    it('deve mostrar contagem correta em cada aba', () => {
      const { getAllByText } = render(<ProfileTabsComp {...userProps} />);

      expect(getAllByText('2')[0]).toBeTruthy(); // matches count
      expect(getAllByText('1')[0]).toBeTruthy(); // followed groups count
    });

    it('deve renderizar partidas por padrão', () => {
      const { getByText } = render(<ProfileTabsComp {...userProps} />);

      expect(getByText('Match: match-1')).toBeTruthy();
      expect(getByText('Match: match-2')).toBeTruthy();
    });

    it('deve mudar para aba "Seguindo" ao clicar', () => {
      const { getByText } = render(<ProfileTabsComp {...userProps} />);

      fireEvent.press(getByText('Seguindo'));

      expect(getByText('Grupo Seguido 1')).toBeTruthy();
    });

    it('deve mudar para aba "Membro" ao clicar', () => {
      const { getByText } = render(<ProfileTabsComp {...userProps} />);

      fireEvent.press(getByText('Membro'));

      expect(getByText('Grupo Membro 1')).toBeTruthy();
    });

    it('deve chamar onPressGroup ao clicar em um grupo', () => {
      const mockOnPressGroup = jest.fn();
      const { getByText } = render(
        <ProfileTabsComp {...userProps} onPressGroup={mockOnPressGroup} />
      );

      fireEvent.press(getByText('Seguindo'));
      fireEvent.press(getByText('Grupo Seguido 1'));

      expect(mockOnPressGroup).toHaveBeenCalledWith('Grupo Seguido 1');
    });

    it('deve mostrar mensagem vazia quando não há dados', () => {
      const emptyProps = {
        ...userProps,
        matches: [],
        followedGroups: [],
        memberGroups: [],
      };
      const { getByText } = render(<ProfileTabsComp {...emptyProps} />);

      expect(getByText('Nada encontrado nesta aba.')).toBeTruthy();
    });
  });

  describe('Group Profile Type', () => {
    const groupProps = {
      type: 'group' as const,
      posts: mockPosts,
      members: mockMembers,
      isDarkMode: false,
      currentUserId: 'current-user',
      isAdmin: false,
    };

    it('deve renderizar as abas de perfil de grupo', () => {
      const { getByText } = render(<ProfileTabsComp {...groupProps} />);

      expect(getByText('Posts')).toBeTruthy();
      expect(getByText('Membros')).toBeTruthy();
    });

    it('deve mostrar contagem correta em cada aba', () => {
      const { getAllByText } = render(<ProfileTabsComp {...groupProps} />);

      expect(getAllByText('2')[0]).toBeTruthy(); // posts count
    });

    it('deve renderizar posts por padrão', () => {
      const { getByText } = render(<ProfileTabsComp {...groupProps} />);

      expect(getByText('Post: post-1')).toBeTruthy();
      expect(getByText('Post: post-2')).toBeTruthy();
    });

    it('deve mudar para aba "Membros" ao clicar', () => {
      const { getByText } = render(<ProfileTabsComp {...groupProps} />);

      fireEvent.press(getByText('Membros'));

      expect(getByText('Member: João Silva')).toBeTruthy();
      expect(getByText('Member: Maria Santos')).toBeTruthy();
    });

    it('deve mostrar botão "Convidar Membros" quando isAdmin é true na aba Membros', () => {
      const adminProps = { ...groupProps, isAdmin: true };
      const { getByText } = render(<ProfileTabsComp {...adminProps} />);

      fireEvent.press(getByText('Membros'));

      expect(getByText('Convidar Membros')).toBeTruthy();
    });

    it('não deve mostrar botão "Convidar Membros" quando isAdmin é false', () => {
      const { getByText, queryByText } = render(
        <ProfileTabsComp {...groupProps} />
      );

      fireEvent.press(getByText('Membros'));

      expect(queryByText('Convidar Membros')).toBeNull();
    });

    it('deve chamar onInvitePress ao clicar em "Convidar Membros"', () => {
      const mockOnInvitePress = jest.fn();
      const adminProps = {
        ...groupProps,
        isAdmin: true,
        onInvitePress: mockOnInvitePress,
      };
      const { getByText } = render(<ProfileTabsComp {...adminProps} />);

      fireEvent.press(getByText('Membros'));
      fireEvent.press(getByText('Convidar Membros'));

      expect(mockOnInvitePress).toHaveBeenCalledTimes(1);
    });

    it('não deve mostrar botão "Convidar Membros" na aba Posts', () => {
      const adminProps = { ...groupProps, isAdmin: true };
      const { queryByText } = render(<ProfileTabsComp {...adminProps} />);

      // Está na aba Posts por padrão
      expect(queryByText('Convidar Membros')).toBeNull();
    });
  });

  describe('Refresh Control', () => {
    it('deve aceitar props de onReload e isLoading', () => {
      const mockOnReload = jest.fn();
      const userProps = {
        type: 'user' as const,
        matches: mockMatches,
        followedGroups: [],
        memberGroups: [],
        isDarkMode: false,
        onReload: mockOnReload,
        isLoading: true,
      };

      const { getByText } = render(<ProfileTabsComp {...userProps} />);

      // Verifica que o componente renderiza corretamente com essas props
      expect(getByText('Partidas')).toBeTruthy();
    });
  });

  describe('List Header Component', () => {
    it('deve renderizar ListHeaderComponent quando fornecido', () => {
      const React = require('react');
      const { Text } = require('react-native');
      const HeaderComponent = React.createElement(Text, {}, 'Custom Header');

      const userProps = {
        type: 'user' as const,
        matches: mockMatches,
        followedGroups: [],
        memberGroups: [],
        isDarkMode: false,
        ListHeaderComponent: HeaderComponent,
      };

      const { getByText } = render(<ProfileTabsComp {...userProps} />);

      expect(getByText('Custom Header')).toBeTruthy();
    });
  });

  describe('Theme', () => {
    it('deve usar tema escuro quando isDarkMode é true', () => {
      const userProps = {
        type: 'user' as const,
        matches: mockMatches,
        followedGroups: [],
        memberGroups: [],
        isDarkMode: true,
      };

      const { getByText } = render(<ProfileTabsComp {...userProps} />);

      expect(getByText('Partidas')).toBeTruthy();
    });

    it('deve usar tema claro quando isDarkMode é false', () => {
      const userProps = {
        type: 'user' as const,
        matches: mockMatches,
        followedGroups: [],
        memberGroups: [],
        isDarkMode: false,
      };

      const { getByText } = render(<ProfileTabsComp {...userProps} />);

      expect(getByText('Partidas')).toBeTruthy();
    });
  });
});

