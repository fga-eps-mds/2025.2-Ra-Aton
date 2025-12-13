import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../../../../app/(DashBoard)/(tabs)/Home';
import { View, Text, ActivityIndicator } from 'react-native';

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
    useUser: () => ({ user: { id: '123', name: 'User' } }),
}));

jest.mock('@/libs/hooks/useFeedEvents', () => ({
    useFeedEvents: jest.fn(),
}));

jest.mock('@/libs/hooks/useModalFeed', () => ({
    useFeedModals: jest.fn(),
}));

import { useFeedEvents } from '@/libs/hooks/useFeedEvents';
import { useFeedModals } from '@/libs/hooks/useModalFeed';

// --- MOCKS VISUAIS (CORRIGIDOS COM REQUIRE INTERNO) ---

jest.mock('@/components/BackGroundComp', () => {
    const { View } = require('react-native');
    const React = require('react');
    return (props: any) => <View testID="bg-comp">{props.children}</View>;
});

jest.mock('@/components/PostCardComp', () => {
    const { View } = require('react-native');
    const React = require('react');
    return () => <View testID="mock-post-card" />;
});

jest.mock('@/components/MoreOptionsModalComp', () => {
    const { View } = require('react-native');
    const React = require('react');
    return (props: any) => props.isVisible ? <View testID="modal-options" /> : null;
});

jest.mock('@/components/CommentsModalComp', () => {
    const { View } = require('react-native');
    const React = require('react');
    return (props: any) => props.isVisible ? <View testID="modal-comments" /> : null;
});

jest.mock('@/components/EventInfoModal', () => {
    const { View } = require('react-native');
    const React = require('react');
    return {
        EventInfoModalComp: (props: any) => props.visible ? <View testID="modal-infos" /> : null,
    };
});

jest.mock('@/components/ReportReasonModal', () => {
    const { View } = require('react-native');
    const React = require('react');
    return (props: any) => props.isVisible ? <View testID="modal-report" /> : null;
});

// Estes não precisam de View interna pois retornam string (nome do componente)
jest.mock('@/components/InputComp', () => 'InputComp');
jest.mock('@/components/ProfileThumbnailComp', () => 'ProfileThumbnailComp');
jest.mock('@/components/SpacerComp', () => 'Spacer');

describe('Screen: Home', () => {
    const mockUseFeedEvents = useFeedEvents as jest.Mock;
    const mockUseFeedModals = useFeedModals as jest.Mock;

    const defaultEventsReturn = {
        posts: [],
        isLoading: false,
        isRefreshing: false,
        hasNextPage: false,
        onRefresh: jest.fn(),
        reloadFeed: jest.fn(),
        onEndReached: jest.fn(),
    };

    const defaultModalsReturn = {
        isOptionsVisible: false,
        isCommentsVisible: false,
        isReportModalVisible: false,
        showModal: false,
        selectedPostId: null,
        comments: [],
        isLoadingComments: false,
        handleOpenComments: jest.fn(),
        handleOpenOptions: jest.fn(),
        handleCloseInfoModel: jest.fn(),
        handleStartReportFlow: jest.fn(),
        handleCloseModals: jest.fn(),
        handleSubmitReport: jest.fn(),
        openModalInfos: jest.fn(),
        closeModalInfos: jest.fn(),
        handlePostComment: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseFeedEvents.mockReturnValue(defaultEventsReturn);
        mockUseFeedModals.mockReturnValue(defaultModalsReturn);
    });

    it('deve renderizar a lista vazia corretamente', () => {
        const { getByText } = render(<HomeScreen />);
        expect(getByText('Nenhuma publicação por aqui ainda.')).toBeTruthy();
    });

    it('deve renderizar posts quando houver dados', () => {
        mockUseFeedEvents.mockReturnValue({
            ...defaultEventsReturn,
            posts: [{ id: '1' }, { id: '2' }],
        });

        const { getAllByTestId } = render(<HomeScreen />);

        expect(getAllByTestId('mock-post-card')).toHaveLength(2);
    });

    it('deve renderizar Modais quando os estados do hook estiverem true', () => {
        mockUseFeedModals.mockReturnValue({
            ...defaultModalsReturn,
            isOptionsVisible: true,
            isCommentsVisible: true,
            isReportModalVisible: true,
            showModal: true,
            selectedPostId: '1',
        });

        mockUseFeedEvents.mockReturnValue({
            ...defaultEventsReturn,
            posts: [{ id: '1' }],
        });

        const { getByTestId } = render(<HomeScreen />);

        expect(getByTestId('modal-options')).toBeTruthy();
        expect(getByTestId('modal-comments')).toBeTruthy();
        expect(getByTestId('modal-infos')).toBeTruthy();
        expect(getByTestId('modal-report')).toBeTruthy();
    });
});