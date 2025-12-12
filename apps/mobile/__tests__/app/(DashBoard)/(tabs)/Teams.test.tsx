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

jest.mock('@/components/BackGroundComp', () => {
    const { View } = require('react-native');
    const React = require('react');
    return (props: any) => <View testID="bg-comp">{props.children}</View>;
});

jest.mock('@/components/AppText', () => {
    const { Text } = require('react-native');
    const React = require('react');
    return (props: any) => <Text {...props}>{props.children}</Text>;
});

jest.mock('@/components/SpacerComp', () => 'Spacer');

jest.mock('@/components/CreateGroupComp', () => {
    const { TouchableOpacity, Text } = require('react-native');
    const React = require('react');
    return (props: any) => (
        <TouchableOpacity onPress={props.onPrimaryPress} testID="btn-create-group">
            <Text>Criar Grupo</Text>
        </TouchableOpacity>
    );
});

jest.mock('@/components/JoinedGroupsComp', () => {
    const { View, Text } = require('react-native');
    const React = require('react');
    return (props: any) => (
        <View testID="joined-group-card">
            <Text>{props.name}</Text>
        </View>
    );
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
    return ({ optionLeft, optionRight, onChange }: any) => (
        <View>
            <TouchableOpacity onPress={() => onChange('LEFT')}><Text>{optionLeft}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => onChange('RIGHT')}><Text>{optionRight}</Text></TouchableOpacity>
        </View>
    );
});

jest.mock('@/components/SecondaryButton', () => {
    const { TouchableOpacity, Text } = require('react-native');
    const React = require('react');
    return (props: any) => (
        <TouchableOpacity onPress={props.onPress} testID="btn-filter-accepting">
            <Text>{props.children}</Text>
        </TouchableOpacity>
    );
});

describe('Screen: Teams', () => {
    const mockUseGroups = useGroups as jest.Mock;
    const mockSetSelectedType = jest.fn();
    const mockSetAcceptingOnly = jest.fn();
    const mockReload = jest.fn();

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
        updateGroup: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseGroups.mockReturnValue(defaultGroupsData);
    });

    it('deve listar outros grupos (GroupCard)', () => {
        mockUseGroups.mockReturnValue({
            ...defaultGroupsData,
            filtered: [{ id: 'g2', name: 'Time Rival' }],
        });

        const { getByText } = render(<TeamsScreen />);
        expect(getByText('Time Rival')).toBeTruthy();
    });
});