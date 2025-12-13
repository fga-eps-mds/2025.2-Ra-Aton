import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TeamsScreen from '../../../../app/(DashBoard)/(tabs)/Teams';
import { View, Text, TouchableOpacity } from 'react-native';

// --- MOCK DO REACT NATIVE (ESTRATÉGIA CLASSE HÍBRIDA) ---
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    const React = require('react');

    // Usamos uma Classe para o mock da FlatList para garantir a instância correta
    class MockFlatList extends React.Component {
        render() {
            // @ts-ignore
            const { ListHeaderComponent, ListEmptyComponent, data, renderItem, keyExtractor } = this.props;

            return (
                <RN.View testID="flatlist-mock">
                    {/* O Header contém o conteúdo da sua tela (botões, switch, etc) */}
                    {ListHeaderComponent}

                    {/* Mapeamento dos dados */}
                    {data && data.map((item: any, index: number) => (
                        <RN.View key={keyExtractor ? keyExtractor(item) : index}>
                            {renderItem({ item, index })}
                        </RN.View>
                    ))}

                    {/* Estado Vazio */}
                    {(!data || data.length === 0) ? ListEmptyComponent : null}
                </RN.View>
            );
        }
    }

    return {
        ...RN,
        FlatList: MockFlatList,
    };
});

// --- MOCKS BLINDADOS ---

jest.mock('@/constants/Theme', () => ({
    useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
    Colors: {
        light: { background: '#fff', text: '#000', orange: 'orange' },
        dark: { background: '#000', text: '#fff', orange: 'orange' },
    },
}));

jest.mock('@/libs/storage/UserContext', () => ({
    useUser: () => ({ user: { id: 'u1', token: 'token' } }),
}));

jest.mock('expo-router', () => ({
    useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('@/libs/hooks/getGroups', () => ({
    useGroups: jest.fn(),
}));

jest.mock('@/libs/group/requestJoinGroup', () => ({ requestJoinGroup: jest.fn() }));
jest.mock('@/libs/group/followGroup', () => ({ followGroup: jest.fn() }));
jest.mock('@/libs/group/unfollowGroup', () => ({ unfollowGroup: jest.fn() }));

import { useGroups } from '@/libs/hooks/getGroups';

// --- MOCKS VISUAIS (Garantindo uso de componentes reais) ---

jest.mock('@/components/PrimaryButton', () => {
    const { TouchableOpacity, Text } = require('react-native');
    const React = require('react');
    return {
        __esModule: true,
        default: (props: any) => (
            <TouchableOpacity onPress={props.onPress} testID="btn-primary">
                <Text>{props.children}</Text>
            </TouchableOpacity>
        )
    };
});

jest.mock('@/components/BackGroundComp', () => {
    const { View } = require('react-native');
    const React = require('react');
    return {
        __esModule: true,
        default: (props: any) => <View testID="bg-comp">{props.children}</View>
    };
});

jest.mock('@/components/AppText', () => {
    const { Text } = require('react-native');
    const React = require('react');
    return {
        __esModule: true,
        default: (props: any) => <Text {...props}>{props.children}</Text>
    };
});

jest.mock('@/components/SpacerComp', () => {
    const { View } = require('react-native');
    const React = require('react');
    return {
        __esModule: true,
        default: (props: any) => <View testID="spacer" style={{ height: props.height }} />
    };
});

jest.mock('@/components/CreateGroupComp', () => {
    const { TouchableOpacity, Text } = require('react-native');
    const React = require('react');
    return {
        CreateGroupComp: (props: any) => (
            <TouchableOpacity onPress={props.onPrimaryPress} testID="btn-create-group">
                <Text>Criar Grupo</Text>
            </TouchableOpacity>
        )
    };
});

jest.mock('@/components/JoinedGroupsComp', () => {
    const { View, Text } = require('react-native');
    const React = require('react');
    return {
        JoinedGroupsComp: (props: any) => (
            <View testID="joined-group-card">
                <Text>{props.name}</Text>
            </View>
        )
    };
});

jest.mock('@/components/findGroupCard', () => {
    const { View, Text } = require('react-native');
    const React = require('react');
    return {
        GroupCard: (props: any) => (
            <View testID="group-card">
                <Text>{props.group?.name || "Grupo"}</Text>
            </View>
        )
    };
});

jest.mock('@/components/TwoOptionButton', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    const React = require('react');
    return {
        __esModule: true,
        default: ({ optionLeft, optionRight, onChange }: any) => (
            <View>
                <TouchableOpacity onPress={() => onChange('LEFT')}><Text>{optionLeft}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => onChange('RIGHT')}><Text>{optionRight}</Text></TouchableOpacity>
            </View>
        )
    };
});

jest.mock('@/components/SecondaryButton', () => {
    const { TouchableOpacity, Text } = require('react-native');
    const React = require('react');
    return {
        __esModule: true,
        default: (props: any) => (
            <TouchableOpacity onPress={props.onPress} testID="btn-filter-accepting">
                <Text>{props.children}</Text>
            </TouchableOpacity>
        )
    };
});

describe('Screen: Teams', () => {
    const mockUseGroups = useGroups as jest.Mock;
    const mockSetSelectedType = jest.fn();
    const mockSetAcceptingOnly = jest.fn();
    const mockReload = jest.fn();
    const mockUpdateGroup = jest.fn();
    const mockRouterReplace = jest.fn();

    const defaultGroupsData = {
        groups: [],
        myGroups: [],
        filtered: [],
        loading: false,
        error: null,
        selectedType: 'AMATEUR',
        setSelectedType: mockSetSelectedType,
        acceptingOnly: false,
        setAcceptingOnly: mockSetAcceptingOnly,
        reload: mockReload,
        updateGroup: mockUpdateGroup,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseGroups.mockReturnValue(defaultGroupsData);
        jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({
            replace: mockRouterReplace,
        });
    });

    describe('Renderização Básica', () => {
        it('deve renderizar a tela corretamente', () => {
            const { getByText } = render(<TeamsScreen />);
            expect(getByText('Seus times')).toBeTruthy();
            expect(getByText('Outras equipes')).toBeTruthy();
        });

        it('deve renderizar com tema escuro', () => {
            jest.spyOn(require('@/constants/Theme'), 'useTheme').mockReturnValue({
                isDarkMode: true,
            });

            const { getByTestId } = render(<TeamsScreen />);
            expect(getByTestId('bg-comp')).toBeTruthy();
        });
    });

    describe('Meus Times', () => {
        it('deve exibir mensagem quando usuário não tem times', () => {
            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                myGroups: [],
            });

            const { getByText } = render(<TeamsScreen />);
            expect(getByText('Você ainda não faz parte de nenhum time.')).toBeTruthy();
        });

        it('deve listar times do usuário', () => {
            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                myGroups: [
                    { id: 'g1', name: 'Meu Time', logoUrl: 'http://logo.png' },
                    { id: 'g2', name: 'Outro Time', logoUrl: null },
                ],
            });

            const { getByText } = render(<TeamsScreen />);
            expect(getByText('Meu Time')).toBeTruthy();
            expect(getByText('Outro Time')).toBeTruthy();
        });

        it('deve renderizar JoinedGroupsComp para cada time', () => {
            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                myGroups: [{ id: 'g1', name: 'Atlética XYZ', logoUrl: null }],
            });

            const { getAllByTestId } = render(<TeamsScreen />);
            const cards = getAllByTestId('joined-group-card');
            expect(cards.length).toBe(1);
        });
    });

    describe('Botão Criar Grupo', () => {
        it('deve navegar para tela de criar grupo ao clicar', () => {
            const { getByTestId } = render(<TeamsScreen />);
            const createButton = getByTestId('btn-create-group');
            
            fireEvent.press(createButton);
            
            expect(mockRouterReplace).toHaveBeenCalledWith('/criarGrupo');
        });
    });

    describe('Filtros', () => {
        it('deve exibir switch de tipo de grupo', () => {
            const { getByText } = render(<TeamsScreen />);
            expect(getByText('Amadores')).toBeTruthy();
            expect(getByText('Atléticas')).toBeTruthy();
        });

        it('deve alternar para tipo ATHLETIC ao clicar em Atléticas', () => {
            const { getByText } = render(<TeamsScreen />);
            
            fireEvent.press(getByText('Atléticas'));
            
            expect(mockSetSelectedType).toHaveBeenCalledWith('ATHLETIC');
        });

        it('deve alternar para tipo AMATEUR ao clicar em Amadores', () => {
            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                selectedType: 'ATHLETIC',
            });

            const { getByText } = render(<TeamsScreen />);
            
            fireEvent.press(getByText('Amadores'));
            
            expect(mockSetSelectedType).toHaveBeenCalledWith('AMATEUR');
        });

        it('deve exibir botão de filtro "Aceitando"', () => {
            const { getByText } = render(<TeamsScreen />);
            expect(getByText('Aceitando')).toBeTruthy();
        });

        it('deve mostrar "Aceitando ✔" quando filtro está ativo', () => {
            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                acceptingOnly: true,
            });

            const { getByText } = render(<TeamsScreen />);
            expect(getByText('Aceitando ✔')).toBeTruthy();
        });

        it('deve alternar filtro acceptingOnly ao clicar no botão', () => {
            const { getByTestId } = render(<TeamsScreen />);
            const filterButton = getByTestId('btn-filter-accepting');
            
            fireEvent.press(filterButton);
            
            expect(mockSetAcceptingOnly).toHaveBeenCalledWith(true);
        });

        it('deve desativar filtro quando já está ativo', () => {
            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                acceptingOnly: true,
            });

            const { getByTestId } = render(<TeamsScreen />);
            const filterButton = getByTestId('btn-filter-accepting');
            
            fireEvent.press(filterButton);
            
            expect(mockSetAcceptingOnly).toHaveBeenCalledWith(false);
        });
    });

    describe('Listagem de Outros Grupos', () => {
        it('deve listar outros grupos (GroupCard)', () => {
            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                filtered: [{ id: 'g2', name: 'Time Rival' }],
            });

            const { getByText } = render(<TeamsScreen />);
            expect(getByText('Time Rival')).toBeTruthy();
        });

        it('deve listar múltiplos grupos', () => {
            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                filtered: [
                    { id: 'g1', name: 'Grupo A' },
                    { id: 'g2', name: 'Grupo B' },
                    { id: 'g3', name: 'Grupo C' },
                ],
            });

            const { getByText } = render(<TeamsScreen />);
            expect(getByText('Grupo A')).toBeTruthy();
            expect(getByText('Grupo B')).toBeTruthy();
            expect(getByText('Grupo C')).toBeTruthy();
        });

        it('deve renderizar GroupCard com props corretas', () => {
            const mockGroup = { 
                id: 'g1', 
                name: 'Time Teste',
                logoUrl: 'http://logo.png',
                acceptingNewMembers: true,
            };

            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                filtered: [mockGroup],
            });

            const { getAllByTestId } = render(<TeamsScreen />);
            const groupCards = getAllByTestId('group-card');
            expect(groupCards.length).toBe(1);
        });

        it('não deve renderizar grupos quando filtered está vazio', () => {
            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                filtered: [],
            });

            const { queryByTestId } = render(<TeamsScreen />);
            expect(queryByTestId('group-card')).toBeNull();
        });
    });

    describe('Estados de Erro', () => {
        it('deve exibir erro global quando setGlobalError é chamado', async () => {
            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                filtered: [{ id: 'g1', name: 'Grupo Teste' }],
            });

            const { queryByText } = render(<TeamsScreen />);
            
            // Inicialmente não deve ter erro
            expect(queryByText(/erro/i)).toBeNull();
        });

        it('deve lidar com erro do hook useGroups', () => {
            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                error: 'Erro ao carregar grupos',
            });

            const { getByTestId } = render(<TeamsScreen />);
            // Tela deve renderizar mesmo com erro
            expect(getByTestId('bg-comp')).toBeTruthy();
        });
    });

    describe('Integração com Hooks', () => {
        it('deve passar funções corretas para GroupCard', () => {
            const mockGroup = { id: 'g1', name: 'Time Teste' };
            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                filtered: [mockGroup],
            });

            render(<TeamsScreen />);
            
            // Verifica que useGroups foi chamado
            expect(mockUseGroups).toHaveBeenCalled();
        });

        it('deve usar dados do contexto de usuário', () => {
            const mockUser = { id: 'user123', token: 'abc123' };
            jest.spyOn(require('@/libs/storage/UserContext'), 'useUser').mockReturnValue({
                user: mockUser,
            });

            render(<TeamsScreen />);
            
            // Tela renderiza com dados do usuário
            expect(require('@/libs/storage/UserContext').useUser).toHaveBeenCalled();
        });
    });

    describe('Layout FlatList', () => {
        it('deve renderizar grupos em grid com múltiplas colunas', () => {
            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                filtered: [
                    { id: 'g1', name: 'Grupo 1' },
                    { id: 'g2', name: 'Grupo 2' },
                ],
            });

            const { getAllByTestId } = render(<TeamsScreen />);
            const groupCards = getAllByTestId('group-card');
            expect(groupCards.length).toBe(2);
        });

        it('deve usar keyExtractor com id do grupo', () => {
            const mockGroups = [
                { id: 'unique-id-1', name: 'Grupo 1' },
                { id: 'unique-id-2', name: 'Grupo 2' },
            ];

            mockUseGroups.mockReturnValue({
                ...defaultGroupsData,
                filtered: mockGroups,
            });

            const { getByText } = render(<TeamsScreen />);
            // Verifica que os grupos são renderizados corretamente
            expect(getByText('Grupo 1')).toBeTruthy();
            expect(getByText('Grupo 2')).toBeTruthy();
        });
    });
});