import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SolicitacoesScreen from '../../../../app/(DashBoard)/(tabs)/Solicitacoes';
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

jest.mock('@/libs/storage/UserContext', () => ({
    useUser: () => ({ user: { id: 'u1' } }),
}));

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

// Mocks de Lógica
jest.mock('@/libs/hooks/getSolicitacoes', () => ({
    useSolicitacoes: jest.fn(),
}));

jest.mock('@/libs/solicitacoes/cancelarSolicitacao', () => ({ cancelarSolicitacao: jest.fn() }));
jest.mock('@/libs/solicitacoes/aceitarSolicitacao', () => ({ aceitarSolicitacao: jest.fn() }));
jest.mock('@/libs/solicitacoes/rejeitarSolicitacao', () => ({ rejeitarSolicitacao: jest.fn() }));

import { useSolicitacoes } from '@/libs/hooks/getSolicitacoes';
import { cancelarSolicitacao } from '@/libs/solicitacoes/cancelarSolicitacao';
import { aceitarSolicitacao } from '@/libs/solicitacoes/aceitarSolicitacao';
import { rejeitarSolicitacao } from '@/libs/solicitacoes/rejeitarSolicitacao';

// --- MOCKS VISUAIS SIMPLIFICADOS (Garantia de que funcionam) ---

// Ao invés de complexidade, retornamos funções simples que o React entende
jest.mock('@/components/BackGroundComp', () => {
    const { View } = require('react-native');
    return (props: any) => <View testID="bg-comp">{props.children}</View>;
});

jest.mock('@/components/SpacerComp', () => 'Spacer');

jest.mock('@/components/AppText', () => {
    const { Text } = require('react-native');
    return (props: any) => <Text {...props}>{props.children}</Text>;
});

jest.mock('@/components/TwoOptionButton', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return ({ optionLeft, optionRight, onChange }: any) => (
        <View>
            <TouchableOpacity onPress={() => onChange('LEFT')}><Text>{optionLeft}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => onChange('RIGHT')}><Text>{optionRight}</Text></TouchableOpacity>
        </View>
    );
});

// Importante: Exportação nomeada para SolicitacoesComp se for o caso
jest.mock('@/components/SolicitacoesComp', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    const MockComp = ({ name, onPrimaryPress, onSecondaryPress }: any) => (
        <View testID="card-solicitacao">
            <Text>{name}</Text>
            {onPrimaryPress && (
                <TouchableOpacity onPress={onPrimaryPress} testID="btn-primary-action">
                    <Text>Primary</Text>
                </TouchableOpacity>
            )}
            {onSecondaryPress && (
                <TouchableOpacity onPress={onSecondaryPress} testID="btn-secondary-action">
                    <Text>Secondary</Text>
                </TouchableOpacity>
            )}
        </View>
    );
    return { SolicitacoesComp: MockComp };
});

jest.mock('react-native-safe-area-context', () => {
    const { View } = require('react-native');
    return { SafeAreaView: ({ children }: any) => <View>{children}</View> };
});

describe('Screen: Solicitacoes', () => {
    const mockRefetch = jest.fn();
    const mockUseSolicitacoes = useSolicitacoes as jest.Mock;

    const mockData = [
        { id: '1', group: { name: 'Grupo Enviado' }, status: 'PENDING', madeBy: 'USER' },
        { id: '2', group: { name: 'Grupo Aceito' }, status: 'APPROVED', madeBy: 'USER' },
        { id: '3', group: { name: 'Grupo Recebido' }, status: 'PENDING', madeBy: 'GROUP' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseSolicitacoes.mockReturnValue({
            solicitacoes: mockData,
            loading: false,
            refetch: mockRefetch,
        });
    });

    it('deve renderizar loading se hook estiver carregando', () => {
        mockUseSolicitacoes.mockReturnValue({ solicitacoes: [], loading: true, refetch: mockRefetch });

        // Usamos UNSAFE_getByType para encontrar o ActivityIndicator original
        // Isso evita problemas com mocks que não aplicam testID
        const { UNSAFE_getByType } = render(<SolicitacoesScreen />);
        expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('deve mostrar solicitações ENVIADAS por padrão (Aba Left)', () => {
        const { getByText, queryByText } = render(<SolicitacoesScreen />);

        expect(getByText('Solicitações enviadas')).toBeTruthy();
        expect(getByText('Grupo Enviado')).toBeTruthy();
        expect(queryByText('Grupo Recebido')).toBeNull();
    });

    it('deve trocar para RECEBIDAS ao clicar na aba direita', () => {
        const { getByText, queryByText } = render(<SolicitacoesScreen />);

        fireEvent.press(getByText('Recebidas'));

        expect(getByText('Convites recebidos')).toBeTruthy();
        expect(getByText('Grupo Recebido')).toBeTruthy();
        expect(queryByText('Grupo Enviado')).toBeNull();
    });

    it('deve chamar cancelarSolicitacao na aba Enviadas', async () => {
        const { getAllByTestId } = render(<SolicitacoesScreen />);

        const btnAction = getAllByTestId('btn-primary-action')[0];
        fireEvent.press(btnAction);

        await waitFor(() => {
            expect(cancelarSolicitacao).toHaveBeenCalledWith('1');
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('deve chamar aceitar/rejeitar na aba Recebidas', async () => {
        const { getByText, getAllByTestId } = render(<SolicitacoesScreen />);

        fireEvent.press(getByText('Recebidas'));

        const btnAccept = getAllByTestId('btn-primary-action')[0];
        const btnReject = getAllByTestId('btn-secondary-action')[0];

        fireEvent.press(btnAccept);
        await waitFor(() => {
            expect(aceitarSolicitacao).toHaveBeenCalledWith('3');
            expect(mockRefetch).toHaveBeenCalled();
        });

        fireEvent.press(btnReject);
        await waitFor(() => {
            expect(rejeitarSolicitacao).toHaveBeenCalledWith('3');
        });
    });

    it('deve mostrar mensagem quando não houver solicitações enviadas pendentes', () => {
  mockUseSolicitacoes.mockReturnValue({
    solicitacoes: [
      { id: '1', group: { name: 'Grupo' }, status: 'APPROVED', madeBy: 'USER' },
    ],
    loading: false,
    refetch: mockRefetch,
  });

  const { getByText } = render(<SolicitacoesScreen />);

  expect(getByText('Nenhuma solicitação pendente.')).toBeTruthy();
});

it('deve mostrar mensagem quando não houver solicitações enviadas respondidas', () => {
  mockUseSolicitacoes.mockReturnValue({
    solicitacoes: [
      { id: '1', group: { name: 'Grupo' }, status: 'PENDING', madeBy: 'USER' },
    ],
    loading: false,
    refetch: mockRefetch,
  });

  const { getByText } = render(<SolicitacoesScreen />);

  expect(getByText('Nenhuma solicitação respondida.')).toBeTruthy();
});

it('deve mostrar mensagem quando não houver convites recebidos pendentes', () => {
  mockUseSolicitacoes.mockReturnValue({
    solicitacoes: [],
    loading: false,
    refetch: mockRefetch,
  });

  const { getByText } = render(<SolicitacoesScreen />);

  fireEvent.press(getByText('Recebidas'));

  expect(getByText('Nenhum convite recebido.')).toBeTruthy();
});

it('deve listar solicitações recebidas respondidas', () => {
  mockUseSolicitacoes.mockReturnValue({
    solicitacoes: [
      {
        id: '9',
        group: { name: 'Grupo Respondido' },
        status: 'APPROVED',
        madeBy: 'GROUP',
      },
    ],
    loading: false,
    refetch: mockRefetch,
  });

  const { getByText } = render(<SolicitacoesScreen />);

  fireEvent.press(getByText('Recebidas'));

  expect(getByText('Grupo Respondido')).toBeTruthy();
});

jest.mock('@/constants/Theme', () => ({
    useTheme: () => ({ isDarkMode: true }),
}));

it('deve renderizar corretamente no modo escuro', () => {
    const { getByText } = render(<SolicitacoesScreen />);
    expect(getByText('Solicitações enviadas')).toBeTruthy();
});

});