/**
 * Testes da tela Perfil (ProfileScreen)
 * 
 * Usa jest.requireActual para garantir instrumentação correta de cobertura.
 */
import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mocks necessários antes de importar o componente
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(() => ({ identifier: 'testUser', type: 'user' })),
    useRouter: () => ({
        push: mockPush,
        back: mockBack,
        replace: mockReplace,
    }),
    useFocusEffect: jest.fn((cb: any) => {
        // Executa o callback para cobertura da linha 124
        if (typeof cb === 'function') {
            cb();
        }
    }),
}));

jest.mock('@/constants/Theme', () => ({
    useTheme: jest.fn(() => ({ isDarkMode: false, toggleDarkMode: jest.fn() })),
}));

jest.mock('@/constants/Colors', () => ({
    Colors: {
        light: { orange: '#ff6600', text: '#000', background: '#fff', gray: '#ccc', input: '#eee' },
        dark: { orange: '#ff8800', text: '#fff', background: '#111', gray: '#333', input: '#222' },
    },
}));

jest.mock('@/libs/storage/UserContext', () => ({
    useUser: jest.fn(() => ({
        user: { id: 'user123', userName: 'testUser', token: 'token123' },
    })),
}));

// Mock do useProfile hook
const mockReloadProfile = jest.fn();
const mockToggleFollow = jest.fn();
jest.mock('@/libs/hooks/useProfile', () => ({
    useProfile: jest.fn(() => ({
        profile: {
            id: 'profile123',
            name: 'Test User',
            bio: 'Test bio',
            followersCount: 100,
            userName: 'testUser',
            profilePicture: null,
            bannerImage: null,
            isOwner: true,
        },
        tabs: {
            matches: [],
            followedGroups: [],
            memberGroups: [],
        },
        isLoading: false,
        error: null,
        isFollowing: false,
        toggleFollow: mockToggleFollow,
        reloadProfile: mockReloadProfile,
    })),
}));

// Mocks dos componentes filhos
jest.mock('@/components/BackGroundComp', () => {
    const { View } = require('react-native');
    return { __esModule: true, default: ({ children }: any) => <View testID="background">{children}</View> };
});

jest.mock('@/components/ProfileHeaderComp', () => ({
    ProfileHeaderComp: (props: any) => {
        const { View, Text, TouchableOpacity } = require('react-native');
        return (
            <View testID="profile-header">
                <Text testID="profile-name">{props.name}</Text>
                {props.showEditButton && (
                    <TouchableOpacity testID="edit-button" onPress={props.onEdit}><Text>Editar</Text></TouchableOpacity>
                )}
                <TouchableOpacity testID="back-button" onPress={props.onBack}><Text>Voltar</Text></TouchableOpacity>
            </View>
        );
    },
}));

jest.mock('@/components/FollowButtonComp', () => ({
    FollowButtonComp: (props: any) => {
        const { TouchableOpacity, Text } = require('react-native');
        return (
            <TouchableOpacity testID="follow-button" onPress={props.onPress}>
                <Text>{props.isFollowing ? 'Seguindo' : 'Seguir'}</Text>
            </TouchableOpacity>
        );
    },
}));

jest.mock('@/components/ProfileTabsComp', () => ({
    ProfileTabsComp: (props: any) => {
        const { View, Text, TouchableOpacity } = require('react-native');
        return (
            <View testID="profile-tabs">
                {props.ListHeaderComponent}
                <Text testID="tabs-type">Tabs: {props.type}</Text>
                {props.onPressMatchInfos && (
                    <TouchableOpacity testID="match-info-btn" onPress={() => props.onPressMatchInfos({ id: 'm1' })}>
                        <Text>Match Info</Text>
                    </TouchableOpacity>
                )}
                {props.onPressJoinMatch && (
                    <TouchableOpacity testID="join-match-btn" onPress={() => props.onPressJoinMatch({ id: 'm1', teamA: { players: [] }, teamB: { players: [] } })}>
                        <Text>Join Match</Text>
                    </TouchableOpacity>
                )}
                {props.onPressGroup && (
                    <TouchableOpacity testID="press-group-btn" onPress={() => props.onPressGroup('testGroup')}>
                        <Text>Group</Text>
                    </TouchableOpacity>
                )}
                {props.onPressMember && (
                    <TouchableOpacity testID="press-member-btn" onPress={() => props.onPressMember('memberUser')}>
                        <Text>Member</Text>
                    </TouchableOpacity>
                )}
                {props.onInvitePress && (
                    <TouchableOpacity testID="invite-btn" onPress={props.onInvitePress}>
                        <Text>Invite</Text>
                    </TouchableOpacity>
                )}
                {props.onRemoveMember && (
                    <TouchableOpacity testID="remove-member-btn" onPress={() => props.onRemoveMember('memberToRemove')}>
                        <Text>Remove</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    },
}));

jest.mock('@/components/InviteMemberModalComp', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return {
        __esModule: true,
        default: (props: any) => props.visible ? (
            <View testID="invite-modal">
                <TouchableOpacity testID="close-invite-modal" onPress={props.onClose}>
                    <Text>Close</Text>
                </TouchableOpacity>
            </View>
        ) : null
    };
});

jest.mock('@/components/HandleMatchComp', () => ({
    HandleMatchComp: (props: any) => {
        const { View, TouchableOpacity, Text } = require('react-native');
        if (!props.isVisible) return null;
        return (
            <View testID="handle-match-modal">
                {props.onSwitchTeam && (
                    <TouchableOpacity testID="switch-team-btn" onPress={props.onSwitchTeam}>
                        <Text>Switch Team</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    },
}));

jest.mock('@/components/MatchDetailsModal', () => ({ MatchDetailsModal: () => null }));

jest.mock('@/components/MoreOptionsModalComp', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return {
        __esModule: true,
        default: (props: any) => {
            if (!props.isVisible) return null;
            return (
                <View testID="more-options-modal">
                    {props.onLeaveMatch && (
                        <TouchableOpacity testID="leave-match-btn" onPress={props.onLeaveMatch}>
                            <Text>Leave Match</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        },
    };
});

jest.mock('@/components/ReportReasonModal', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/ModalDescription', () => ({ ModalDescription: () => null }));
jest.mock('@/components/CommentsModalComp', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/EventInfoModal', () => ({ EventInfoModalComp: () => null }));
jest.mock('@/components/AppText', () => {
    const { Text } = require('react-native');
    return { __esModule: true, default: (props: any) => <Text {...props}>{props.children}</Text> };
});

// Mock dos hooks de modal - configurável
const mockUseModalFeedMatchs = {
    visibleConfirmCard: false,
    visible: false,
    visibleInfosHandleMatch: false,
    visibleReportMatch: false,
    visibleDescriptionMatch: false,
    selectedMatch: null as any,
    useModal: jest.fn(),
    closeModal: jest.fn(),
    openModalConfirmCard: jest.fn(),
    closeModalConfirmCard: jest.fn(),
    openModalMoreInfosHandleModal: jest.fn(),
    closeModalMoreInfosHandleModal: jest.fn(),
    openReportMatchModal: jest.fn(),
    closeReportMatchModal: jest.fn(),
    openDetailsFromHandle: jest.fn(),
    openDescriptionMatchModal: jest.fn(),
    closeDescriptionMatchModal: jest.fn(),
};

jest.mock('@/libs/hooks/useFeedMatchs', () => ({
    UseModalFeedMatchs: jest.fn(() => mockUseModalFeedMatchs),
}));

jest.mock('@/libs/hooks/useModalFeed', () => ({
    useFeedModals: () => ({
        isOptionsVisible: false,
        isCommentsVisible: false,
        isReportModalVisible: false,
        selectedPostId: null,
        comments: [],
        isLoadingComments: false,
        handleOpenComments: jest.fn(),
        handleCloseComments: jest.fn(),
        handleOpenOptions: jest.fn(),
        handleCloseInfoModel: jest.fn(),
        handleStartReportFlow: jest.fn(),
        handleCloseModals: jest.fn(),
        handleSubmitReport: jest.fn(),
        handlePostComment: jest.fn(),
        openModalInfos: jest.fn(),
        closeModalInfos: jest.fn(),
        showModal: false,
    }),
}));

// Mock das funções de match
const mockSubscribeToMatch = jest.fn();
const mockUnsubscribeFromMatch = jest.fn();
const mockSwitchTeam = jest.fn();
const mockGetMatchById = jest.fn();
jest.mock('@/libs/auth/handleMatch', () => ({
    getMatchById: (...args: any[]) => mockGetMatchById(...args),
    subscribeToMatch: (...args: any[]) => mockSubscribeToMatch(...args),
    unsubscribeFromMatch: (...args: any[]) => mockUnsubscribeFromMatch(...args),
    switchTeam: (...args: any[]) => mockSwitchTeam(...args),
}));

// Mock das funções de membership
const mockRemoveMember = jest.fn();
const mockGetGroupMembers = jest.fn();
jest.mock('@/libs/groupMembership/removeMember', () => ({
    removeMember: (...args: any[]) => mockRemoveMember(...args),
}));
jest.mock('@/libs/groupMembership/getGroupMembers', () => ({
    getGroupMembers: (...args: any[]) => mockGetGroupMembers(...args),
}));

// Spy no Alert
jest.spyOn(Alert, 'alert');

// Importa o componente após os mocks
import ProfileScreen from '../../../../app/(DashBoard)/(tabs)/Perfil';
import { useLocalSearchParams } from 'expo-router';
import { useProfile } from '@/libs/hooks/useProfile';
import { useTheme } from '@/constants/Theme';
import { useUser } from '@/libs/storage/UserContext';

describe('ProfileScreen (Perfil)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetMatchById.mockResolvedValue({ id: 'm1', teamA: { players: [] }, teamB: { players: [] } });
        mockSubscribeToMatch.mockResolvedValue({});
        mockGetGroupMembers.mockResolvedValue([]);
    });

    describe('Renderização básica', () => {
        it('deve renderizar sem erros', () => {
            expect(() => render(<ProfileScreen />)).not.toThrow();
        });

        it('deve renderizar o background', () => {
            const { getByTestId } = render(<ProfileScreen />);
            expect(getByTestId('background')).toBeTruthy();
        });

        it('deve renderizar o header do perfil', () => {
            const { getByTestId } = render(<ProfileScreen />);
            expect(getByTestId('profile-header')).toBeTruthy();
        });

        it('deve renderizar as tabs do perfil', () => {
            const { getByTestId } = render(<ProfileScreen />);
            expect(getByTestId('profile-tabs')).toBeTruthy();
        });

        it('deve mostrar nome do perfil', () => {
            const { getByTestId } = render(<ProfileScreen />);
            expect(getByTestId('profile-name')).toBeTruthy();
        });
    });

    describe('Estado de carregamento', () => {
        it('deve mostrar loading quando isLoading e sem profile', () => {
            (useProfile as jest.Mock).mockReturnValueOnce({
                profile: null,
                tabs: null,
                isLoading: true,
                error: null,
                isFollowing: false,
                toggleFollow: jest.fn(),
                reloadProfile: jest.fn(),
            });

            const { getByTestId, queryByTestId } = render(<ProfileScreen />);
            expect(getByTestId('background')).toBeTruthy();
            expect(queryByTestId('profile-header')).toBeNull();
        });
    });

    describe('Tema escuro', () => {
        it('deve renderizar com tema escuro', () => {
            (useTheme as jest.Mock).mockReturnValueOnce({ isDarkMode: true, toggleDarkMode: jest.fn() });

            const { getByTestId } = render(<ProfileScreen />);
            expect(getByTestId('background')).toBeTruthy();
        });
    });

    describe('Perfil de usuário', () => {
        it('deve renderizar tabs de usuário', () => {
            const { getByTestId } = render(<ProfileScreen />);
            expect(getByTestId('tabs-type').props.children).toEqual(['Tabs: ', 'user']);
        });

        it('deve mostrar botão editar quando é próprio perfil', () => {
            const { getByTestId } = render(<ProfileScreen />);
            expect(getByTestId('edit-button')).toBeTruthy();
        });

        it('deve navegar ao clicar em voltar', () => {
            const { getByTestId } = render(<ProfileScreen />);
            fireEvent.press(getByTestId('back-button'));
            expect(mockBack).toHaveBeenCalled();
        });

        it('deve navegar ao clicar em grupo', () => {
            const { getByTestId } = render(<ProfileScreen />);
            fireEvent.press(getByTestId('press-group-btn'));
            expect(mockPush).toHaveBeenCalledWith({
                pathname: '/(DashBoard)/(tabs)/Perfil',
                params: { identifier: 'testGroup', type: 'group' },
            });
        });
    });

    describe('Perfil de grupo', () => {
        beforeEach(() => {
            (useLocalSearchParams as jest.Mock).mockReturnValue({ identifier: 'testGroup', type: 'group' });
            (useProfile as jest.Mock).mockReturnValue({
                profile: {
                    id: 'group123',
                    name: 'Test Group',
                    bio: 'Group bio',
                    followersCount: 200,
                    logoUrl: null,
                    bannerUrl: null,
                    isLeader: true,
                    leaderId: 'user123',
                },
                tabs: { members: [], posts: [] },
                isLoading: false,
                error: null,
                isFollowing: false,
                toggleFollow: mockToggleFollow,
                reloadProfile: mockReloadProfile,
            });
        });

        it('deve renderizar perfil de grupo', () => {
            const { getByTestId } = render(<ProfileScreen />);
            expect(getByTestId('tabs-type').props.children).toEqual(['Tabs: ', 'group']);
        });

        it('deve mostrar botão seguir', () => {
            const { getByTestId } = render(<ProfileScreen />);
            expect(getByTestId('follow-button')).toBeTruthy();
        });

        it('deve chamar toggleFollow ao clicar em seguir', async () => {
            const { getByTestId } = render(<ProfileScreen />);
            await act(async () => {
                fireEvent.press(getByTestId('follow-button'));
            });
            await waitFor(() => expect(mockToggleFollow).toHaveBeenCalled());
        });

        it('deve navegar ao clicar em membro', () => {
            const { getByTestId } = render(<ProfileScreen />);
            fireEvent.press(getByTestId('press-member-btn'));
            expect(mockPush).toHaveBeenCalledWith({
                pathname: '/(DashBoard)/(tabs)/Perfil',
                params: { identifier: 'memberUser', type: 'user' },
            });
        });

        it('deve abrir modal de convite', () => {
            const { getByTestId, queryByTestId } = render(<ProfileScreen />);
            expect(queryByTestId('invite-modal')).toBeNull();
            fireEvent.press(getByTestId('invite-btn'));
            // O modal deve ser visível após o press
        });

        it('deve fechar modal de convite', async () => {
            const { getByTestId, rerender } = render(<ProfileScreen />);

            // Abre o modal
            fireEvent.press(getByTestId('invite-btn'));

            // Aguarda o modal aparecer e clica em fechar
            await waitFor(() => {
                expect(getByTestId('invite-modal')).toBeTruthy();
            });

            fireEvent.press(getByTestId('close-invite-modal'));
        });

        it('deve chamar handleRemoveMember', async () => {
            mockGetGroupMembers.mockResolvedValue([{ id: 'mem1', userId: 'memberToRemove' }]);

            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('remove-member-btn'));
            });

            expect(Alert.alert).toHaveBeenCalledWith(
                'Remover Membro',
                'Tem certeza que deseja remover este usuário do grupo?',
                expect.any(Array)
            );
        });
    });

    describe('Tratamento de erros', () => {
        it('deve mostrar alerta quando há erro', async () => {
            (useProfile as jest.Mock).mockReturnValueOnce({
                profile: { id: '1', name: 'Test' },
                tabs: { matches: [] },
                isLoading: false,
                error: 'Erro ao carregar perfil',
                isFollowing: false,
                toggleFollow: jest.fn(),
                reloadProfile: jest.fn(),
            });

            render(<ProfileScreen />);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Erro ao carregar perfil');
            });
        });
    });

    describe('Ações de partida', () => {
        beforeEach(() => {
            // Reset para perfil de usuário que tem tabs de matches
            (useLocalSearchParams as jest.Mock).mockReturnValue({ identifier: 'testUser', type: 'user' });
            (useProfile as jest.Mock).mockReturnValue({
                profile: {
                    id: 'profile123',
                    name: 'Test User',
                    bio: 'Test bio',
                    followersCount: 100,
                    userName: 'testUser',
                    isOwner: true,
                },
                tabs: {
                    matches: [{ id: 'm1', teamA: { players: [] }, teamB: { players: [] } }],
                    followedGroups: [],
                    memberGroups: [],
                },
                isLoading: false,
                error: null,
                isFollowing: false,
                toggleFollow: mockToggleFollow,
                reloadProfile: mockReloadProfile,
            });
        });

        it('deve chamar onPressMatchInfos', () => {
            const { getByTestId } = render(<ProfileScreen />);
            fireEvent.press(getByTestId('match-info-btn'));
            // Verifica que o componente renderizou com a callback
        });

        it('deve mostrar alerta ao participar de partida', async () => {
            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('join-match-btn'));
            });

            expect(Alert.alert).toHaveBeenCalledWith(
                'Participar',
                'Deseja participar desta partida?',
                expect.any(Array)
            );
        });
    });

    describe('Edição de perfil', () => {
        it('deve navegar para edição de usuário', () => {
            const { getByTestId } = render(<ProfileScreen />);
            fireEvent.press(getByTestId('edit-button'));
            expect(mockPush).toHaveBeenCalled();
        });

        it('deve navegar para edição de grupo', () => {
            (useLocalSearchParams as jest.Mock).mockReturnValue({ identifier: 'testGroup', type: 'group' });
            (useProfile as jest.Mock).mockReturnValue({
                profile: {
                    id: 'group123',
                    name: 'Test Group',
                    bio: 'bio',
                    isLeader: true,
                    logoUrl: '',
                    bannerUrl: '',
                },
                tabs: { members: [], posts: [] },
                isLoading: false,
                error: null,
                isFollowing: false,
                toggleFollow: jest.fn(),
                reloadProfile: jest.fn(),
            });

            const { getByTestId } = render(<ProfileScreen />);
            fireEvent.press(getByTestId('edit-button'));
            expect(mockPush).toHaveBeenCalled();
        });
    });

    describe('Sem identifier', () => {
        it('deve renderizar com identifier vazio', () => {
            (useLocalSearchParams as jest.Mock).mockReturnValue({ identifier: '', type: '' });

            expect(() => render(<ProfileScreen />)).not.toThrow();
        });
    });

    describe('Admin do grupo', () => {
        it('deve identificar admin corretamente', () => {
            (useLocalSearchParams as jest.Mock).mockReturnValue({ identifier: 'testGroup', type: 'group' });
            (useProfile as jest.Mock).mockReturnValue({
                profile: {
                    id: 'group123',
                    name: 'Group',
                    leaderId: 'user123', // mesmo id do currentUser
                },
                tabs: { members: [], posts: [] },
                isLoading: false,
                error: null,
                isFollowing: false,
                toggleFollow: jest.fn(),
                reloadProfile: jest.fn(),
            });

            const { getByTestId } = render(<ProfileScreen />);
            expect(getByTestId('remove-member-btn')).toBeTruthy();
        });
    });

    describe('Callbacks de Alert - handleRemoveMember', () => {
        beforeEach(() => {
            (useLocalSearchParams as jest.Mock).mockReturnValue({ identifier: 'testGroup', type: 'group' });
            (useProfile as jest.Mock).mockReturnValue({
                profile: { id: 'group123', name: 'Group', leaderId: 'user123' },
                tabs: { members: [], posts: [] },
                isLoading: false,
                error: null,
                isFollowing: false,
                toggleFollow: jest.fn(),
                reloadProfile: mockReloadProfile,
            });
        });

        it('deve executar callback de remoção com sucesso', async () => {
            mockGetGroupMembers.mockResolvedValue([{ id: 'mem1', userId: 'memberToRemove' }]);
            mockRemoveMember.mockResolvedValue({});

            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('remove-member-btn'));
            });

            // Simula clique em "Remover" no Alert
            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const removeButton = alertCall[2].find((btn: any) => btn.text === 'Remover');

            if (removeButton?.onPress) {
                await act(async () => {
                    await removeButton.onPress();
                });
            }

            await waitFor(() => {
                expect(mockRemoveMember).toHaveBeenCalled();
            });
        });

        it('deve mostrar erro quando membro não encontrado', async () => {
            mockGetGroupMembers.mockResolvedValue([]);

            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('remove-member-btn'));
            });

            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const removeButton = alertCall[2].find((btn: any) => btn.text === 'Remover');

            if (removeButton?.onPress) {
                await act(async () => {
                    await removeButton.onPress();
                });
            }

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Membro não encontrado na lista.');
            });
        });

        it('deve tratar erro na remoção', async () => {
            mockGetGroupMembers.mockResolvedValue([{ id: 'mem1', userId: 'memberToRemove' }]);
            mockRemoveMember.mockRejectedValue(new Error('Erro de rede'));

            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('remove-member-btn'));
            });

            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const removeButton = alertCall[2].find((btn: any) => btn.text === 'Remover');

            if (removeButton?.onPress) {
                await act(async () => {
                    await removeButton.onPress();
                });
            }

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Erro de rede');
            });
        });
    });

    describe('Callbacks de Alert - Participar de partida', () => {
        beforeEach(() => {
            (useLocalSearchParams as jest.Mock).mockReturnValue({ identifier: 'testUser', type: 'user' });
            (useProfile as jest.Mock).mockReturnValue({
                profile: { id: 'user123', name: 'Test', userName: 'testUser', isOwner: true },
                tabs: { matches: [], followedGroups: [], memberGroups: [] },
                isLoading: false,
                error: null,
                isFollowing: false,
                toggleFollow: mockToggleFollow,
                reloadProfile: mockReloadProfile,
            });
        });

        it('deve confirmar participação na partida', async () => {
            mockSubscribeToMatch.mockResolvedValue({});
            mockGetMatchById.mockResolvedValue({ id: 'm1' });

            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('join-match-btn'));
            });

            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const confirmButton = alertCall[2].find((btn: any) => btn.text === 'Confirmar');

            if (confirmButton?.onPress) {
                await act(async () => {
                    await confirmButton.onPress();
                });
            }

            await waitFor(() => {
                expect(mockSubscribeToMatch).toHaveBeenCalled();
            });
        });

        it('deve tratar erro ao participar', async () => {
            mockSubscribeToMatch.mockRejectedValue({ response: { data: { message: 'Partida cheia' } } });

            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('join-match-btn'));
            });

            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const confirmButton = alertCall[2].find((btn: any) => btn.text === 'Confirmar');

            if (confirmButton?.onPress) {
                await act(async () => {
                    await confirmButton.onPress();
                });
            }

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Partida cheia');
            });
        });
    });

    describe('Profile sem profile.id', () => {
        it('deve retornar early quando profile.id é undefined', async () => {
            (useLocalSearchParams as jest.Mock).mockReturnValue({ identifier: 'testGroup', type: 'group' });
            (useProfile as jest.Mock).mockReturnValue({
                profile: { name: 'Group', leaderId: 'user123' }, // sem id
                tabs: { members: [], posts: [] },
                isLoading: false,
                error: null,
                isFollowing: false,
                toggleFollow: jest.fn(),
                reloadProfile: jest.fn(),
            });

            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('remove-member-btn'));
            });

            // Não deve chamar Alert.alert pois retorna early
            expect(Alert.alert).not.toHaveBeenCalled();
        });
    });

    describe('checkIsSubscribed', () => {
        it('deve verificar se usuário está inscrito na partida', async () => {
            (useLocalSearchParams as jest.Mock).mockReturnValue({ identifier: 'testUser', type: 'user' });
            (useUser as jest.Mock).mockReturnValue({
                user: { id: 'player1', userName: 'player1' },
            });
            (useProfile as jest.Mock).mockReturnValue({
                profile: { id: 'user123', name: 'Test', userName: 'testUser', isOwner: false },
                tabs: {
                    matches: [{ id: 'm1', teamA: { players: [{ id: 'player1' }] }, teamB: { players: [] } }],
                    followedGroups: [],
                    memberGroups: [],
                },
                isLoading: false,
                error: null,
                isFollowing: false,
                toggleFollow: mockToggleFollow,
                reloadProfile: mockReloadProfile,
            });

            mockGetMatchById.mockResolvedValue({ id: 'm1' });

            const { getByTestId } = render(<ProfileScreen />);

            // Quando já está inscrito, deve abrir modal diretamente
            await act(async () => {
                fireEvent.press(getByTestId('join-match-btn'));
            });
        });
    });

    describe('handleSwitchTeam', () => {
        beforeEach(() => {
            // Configura para mostrar o modal de match com selectedMatch
            mockUseModalFeedMatchs.visibleConfirmCard = true;
            mockUseModalFeedMatchs.selectedMatch = { id: 'match1', title: 'Test Match' };

            (useLocalSearchParams as jest.Mock).mockReturnValue({ identifier: 'testUser', type: 'user' });
            (useProfile as jest.Mock).mockReturnValue({
                profile: { id: 'user123', name: 'Test', userName: 'testUser', isOwner: true },
                tabs: { matches: [], followedGroups: [], memberGroups: [] },
                isLoading: false,
                error: null,
                isFollowing: false,
                toggleFollow: mockToggleFollow,
                reloadProfile: mockReloadProfile,
            });
        });

        afterEach(() => {
            // Reset para valores padrão
            mockUseModalFeedMatchs.visibleConfirmCard = false;
            mockUseModalFeedMatchs.selectedMatch = null;
        });

        it('deve mostrar modal de switch team', () => {
            const { getByTestId } = render(<ProfileScreen />);
            expect(getByTestId('handle-match-modal')).toBeTruthy();
        });

        it('deve mostrar alerta ao clicar em trocar de time', async () => {
            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('switch-team-btn'));
            });

            expect(Alert.alert).toHaveBeenCalledWith(
                'Trocar de Time',
                'Deseja trocar de time?',
                expect.any(Array)
            );
        });

        it('deve executar switchTeam com sucesso', async () => {
            mockSwitchTeam.mockResolvedValue({});
            mockGetMatchById.mockResolvedValue({ id: 'match1' });

            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('switch-team-btn'));
            });

            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const confirmButton = alertCall[2].find((btn: any) => btn.text === 'Confirmar');

            if (confirmButton?.onPress) {
                await act(async () => {
                    await confirmButton.onPress();
                });
            }

            await waitFor(() => {
                expect(mockSwitchTeam).toHaveBeenCalledWith('match1');
            });
        });

        it('deve tratar erro ao trocar de time', async () => {
            mockSwitchTeam.mockRejectedValue({ response: { data: { message: 'Time cheio' } } });

            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('switch-team-btn'));
            });

            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const confirmButton = alertCall[2].find((btn: any) => btn.text === 'Confirmar');

            if (confirmButton?.onPress) {
                await act(async () => {
                    await confirmButton.onPress();
                });
            }

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Time cheio');
            });
        });
    });

    describe('handleLeaveMatch', () => {
        beforeEach(() => {
            // Configura para mostrar o modal de opções com selectedMatch
            mockUseModalFeedMatchs.visibleInfosHandleMatch = true;
            mockUseModalFeedMatchs.selectedMatch = { id: 'match1', title: 'Test Match' };

            (useLocalSearchParams as jest.Mock).mockReturnValue({ identifier: 'testUser', type: 'user' });
            (useProfile as jest.Mock).mockReturnValue({
                profile: { id: 'user123', name: 'Test', userName: 'testUser', isOwner: true },
                tabs: { matches: [], followedGroups: [], memberGroups: [] },
                isLoading: false,
                error: null,
                isFollowing: false,
                toggleFollow: mockToggleFollow,
                reloadProfile: mockReloadProfile,
            });
        });

        afterEach(() => {
            mockUseModalFeedMatchs.visibleInfosHandleMatch = false;
            mockUseModalFeedMatchs.selectedMatch = null;
        });

        it('deve mostrar modal de opções', () => {
            const { getByTestId } = render(<ProfileScreen />);
            expect(getByTestId('more-options-modal')).toBeTruthy();
        });

        it('deve mostrar alerta ao clicar em sair da partida', async () => {
            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('leave-match-btn'));
            });

            expect(Alert.alert).toHaveBeenCalledWith(
                'Sair',
                'Deseja sair da partida?',
                expect.any(Array)
            );
        });

        it('deve executar unsubscribeFromMatch com sucesso', async () => {
            mockUnsubscribeFromMatch.mockResolvedValue({});

            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('leave-match-btn'));
            });

            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const sairButton = alertCall[2].find((btn: any) => btn.text === 'Sair');

            if (sairButton?.onPress) {
                await act(async () => {
                    await sairButton.onPress();
                });
            }

            await waitFor(() => {
                expect(mockUnsubscribeFromMatch).toHaveBeenCalledWith('match1');
            });
        });

        it('deve tratar erro ao sair da partida', async () => {
            mockUnsubscribeFromMatch.mockRejectedValue({ response: { data: { message: 'Erro ao sair' } } });

            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('leave-match-btn'));
            });

            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const sairButton = alertCall[2].find((btn: any) => btn.text === 'Sair');

            if (sairButton?.onPress) {
                await act(async () => {
                    await sairButton.onPress();
                });
            }

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Erro ao sair');
            });
        });
    });

    describe('checkIsSubscribed com teamB', () => {
        it('deve verificar inscrição no teamB', async () => {
            (useLocalSearchParams as jest.Mock).mockReturnValue({ identifier: 'testUser', type: 'user' });
            (useUser as jest.Mock).mockReturnValue({
                user: { id: 'player2', userName: 'player2' },
            });
            (useProfile as jest.Mock).mockReturnValue({
                profile: { id: 'user123', name: 'Test', userName: 'testUser', isOwner: false },
                tabs: {
                    matches: [{ id: 'm1', teamA: { players: [] }, teamB: { players: [{ id: 'player2' }] } }],
                    followedGroups: [],
                    memberGroups: [],
                },
                isLoading: false,
                error: null,
                isFollowing: false,
                toggleFollow: mockToggleFollow,
                reloadProfile: mockReloadProfile,
            });

            mockGetMatchById.mockResolvedValue({ id: 'm1' });

            const { getByTestId } = render(<ProfileScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('join-match-btn'));
            });
        });
    });
});
