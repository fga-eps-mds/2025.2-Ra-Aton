import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotificationsScreen from '../../../../app/(DashBoard)/(tabs)/Notifications';
// Importamos o ActivityIndicator real para usar na busca por tipo
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

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

jest.mock('@/constants/Fonts', () => ({
    Fonts: { mainFont: { dongleRegular: 'Arial' } },
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush }),
    useFocusEffect: (cb: any) => cb(),
}));

// Mock do Contexto
const mockLoadUnread = jest.fn();
jest.mock('@/libs/storage/NotificationContext', () => ({
    useNotifications: () => ({ loadUnread: mockLoadUnread }),
}));

// Mock da API
jest.mock('@/libs/auth/handleNotifications', () => ({
    getUserNotifications: jest.fn(),
    markNotificationAsRead: jest.fn(),
    markAllNotificationsAsRead: jest.fn(),
}));

import { getUserNotifications, markNotificationAsRead } from '@/libs/auth/handleNotifications';

// Mocks Visuais
jest.mock('@/components/BackGroundComp', () => {
    const { View } = require('react-native');
    const React = require('react');
    return (props: any) => <View testID="bg-comp">{props.children}</View>;
});

jest.mock('@/components/CardNotificationComp', () => {
    const { View, Text, TouchableOpacity } = require('react-native');
    const React = require('react');
    return (props: any) => (
        <View testID="card-notif">
            <Text>{props.title}</Text>
            <TouchableOpacity onPress={props.onMarkAsRead} testID="btn-mark-read">
                <Text>Lida</Text>
            </TouchableOpacity>
            {/* Renderiza o botão de ver apenas se a prop onView existir */}
            {props.onView && (
                <TouchableOpacity onPress={props.onView} testID="btn-view">
                    <Text>Ver</Text>
                </TouchableOpacity>
            )}
        </View>
    );
});

describe('Screen: Notifications', () => {
    const mockNotifications = [
        {
            id: '1',
            title: 'Notif 1',
            content: 'Msg 1',
            type: 'MATCH',
            resourceType: 'MATCH', // <--- CORREÇÃO CRÍTICA: Necessário para o switch do componente
            resourceId: 'm1',
            readAt: null
        },
        {
            id: '2',
            title: 'Notif 2',
            content: 'Msg 2',
            type: 'INFO',
            resourceType: 'INFO',
            resourceId: null,
            readAt: '2023-01-01'
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (getUserNotifications as jest.Mock).mockResolvedValue(mockNotifications);
        (markNotificationAsRead as jest.Mock).mockResolvedValue({});
    });

    it('deve renderizar loading inicialmente', async () => {
        // Simula delay na resposta
        (getUserNotifications as jest.Mock).mockReturnValue(new Promise(() => { }));

        // CORREÇÃO: Usamos UNSAFE_getByType para encontrar o componente original
        const { UNSAFE_getByType } = render(<NotificationsScreen />);

        expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('deve renderizar lista de notificações (Filtro Não Lidas por padrão)', async () => {
        const { findAllByTestId, getByText, queryByText } = render(<NotificationsScreen />);

        const cards = await findAllByTestId('card-notif');

        expect(cards).toHaveLength(1);
        expect(getByText('Notif 1')).toBeTruthy();
        expect(queryByText('Notif 2')).toBeNull();
    });

    it('deve alternar para "Todas" e mostrar tudo', async () => {
        const { getByText, findAllByTestId } = render(<NotificationsScreen />);

        await findAllByTestId('card-notif');

        fireEvent.press(getByText('Todas'));

        const cards = await findAllByTestId('card-notif');
        expect(cards).toHaveLength(2);
    });

    it('deve marcar como lida ao clicar na ação do card', async () => {
        const { findAllByTestId, getAllByTestId } = render(<NotificationsScreen />);

        await findAllByTestId('card-notif');

        const btnMark = getAllByTestId('btn-mark-read')[0];
        fireEvent.press(btnMark);

        await waitFor(() => {
            expect(markNotificationAsRead).toHaveBeenCalledWith('1');
            expect(mockLoadUnread).toHaveBeenCalled();
        });
    });

    it('deve navegar ao clicar em visualizar (se tiver redirecionamento)', async () => {
        const { findAllByTestId, getAllByTestId } = render(<NotificationsScreen />);

        await findAllByTestId('card-notif');

        const btnView = getAllByTestId('btn-view')[0];
        fireEvent.press(btnView);

        await waitFor(() => {
            // Agora com resourceType='MATCH', o switch vai funcionar
            expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/(DashBoard)/(tabs)/Partidas' }));
        });
    });
});