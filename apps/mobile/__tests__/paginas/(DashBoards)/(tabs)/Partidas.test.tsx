import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
// Ajuste o caminho conforme a estrutura real do seu projeto, se necessário
import Partidas from "@/app/(DashBoard)/(tabs)/Partidas";

// --- MOCKS GLOBAIS ---

jest.mock("@/constants/Theme", () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock("@/components/BackGroundComp", () => {
  const { View } = require("react-native");
  return function BackGroundComp({ children }: any) {
    return <View>{children}</View>;
  };
});

// Mock para espionar as props passadas para o Card
const mockMatchesCard = jest.fn();
jest.mock("@/components/MatchesCardComp", () => ({
  MatchesCard: (props: any) => {
    mockMatchesCard(props);
    const { View } = require("react-native");
    return <View testID="matches-card" />;
  },
}));

// Mocks de Componentes Visuais (Retornam null para não pesar no teste)
jest.mock("@/components/HandleMatchComp", () => ({
  HandleMatchComp: () => null,
}));
jest.mock("@/components/MatchDetailsModal", () => ({
  MatchDetailsModal: () => null,
}));
jest.mock("@/components/MoreOptionsModalComp", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/components/ReportReasonModal", () => () => null);
jest.mock("@/components/ModalDescription", () => ({
  ModalDescription: () => null,
}));

// Mock do React Navigation (useFocusEffect)
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (cb: any) => cb(),
}));

// --- MOCKS DE LÓGICA E API ---

// 1. Mock do Expo Router (Navegação e Params)
const mockSetParams = jest.fn();
// Mockamos o retorno do hook para podermos alterar em cada teste
let mockSearchParams = { matchId: undefined as string | undefined };

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    setParams: mockSetParams,
  }),
  useLocalSearchParams: () => mockSearchParams,
}));

// 2. Mock da API handleMatch
const mockGetMatchById = jest.fn();
jest.mock("@/libs/auth/handleMatch", () => ({
  getMatchById: (id: string) => mockGetMatchById(id),
}));

// 3. Mock do Hook useMatchesFunctions (Estado do Feed)
let mockMatches: any[] = [];
let mockIsLoading = false;
const mockOnRefresh = jest.fn();
const mockReloadFeed = jest.fn();
const mockOnEndReached = jest.fn();
const mockJoinMatch = jest.fn();
const mockIsUserSubscriped = jest.fn();
const mockSwitchTeam = jest.fn();
const mockLeaveMatch = jest.fn();

jest.mock("@/libs/hooks/useMatchesFunctions", () => ({
  useFeedMatches: () => ({
    matches: mockMatches,
    isLoading: mockIsLoading,
    isRefreshing: false,
    hasNextPage: false,
    onRefresh: mockOnRefresh,
    reloadFeed: mockReloadFeed,
    onEndReached: mockOnEndReached,
    joinMatch: mockJoinMatch,
    isUserSubscriped: mockIsUserSubscriped,
    switchTeam: mockSwitchTeam,
    leaveMatch: mockLeaveMatch,
  }),
}));

// 4. Mock do Hook UseModalFeedMatchs (Gerenciamento de Modais)
const mockUseModal = jest.fn();
const mockCloseModal = jest.fn();
const mockOpenModalConfirmCard = jest.fn();
const mockCloseModalConfirmCard = jest.fn();

// CORREÇÃO DO ERRO 'noop': Definimos a função dentro do factory do mock
jest.mock("@/libs/hooks/useFeedMatchs", () => {
  const noop = () => {}; // Função vazia auxiliar definida DENTRO do escopo

  return {
    UseModalFeedMatchs: () => ({
      visibleConfirmCard: false,
      visible: false,
      visibleDetailsHandle: false,
      visibleInfosHandleMatch: false,
      visibleReportMatch: false,
      visibleDescriptionMatch: false,
      selectedMatch: null,
      // Usamos as variáveis globais 'mock...' onde precisamos espionar
      useModal: mockUseModal,
      closeModal: mockCloseModal,
      openDetailsHandleMatchModal: noop,
      closeDetailsHandleMatchModal: noop,
      openModalConfirmCard: mockOpenModalConfirmCard,
      closeModalConfirmCard: mockCloseModalConfirmCard,
      openModalMoreInfosHandleModal: noop,
      closeModalMoreInfosHandleModal: noop,
      openReportMatchModal: noop,
      closeReportMatchModal: noop,
      openDetailsFromHandle: noop,
      openDescriptionMatchModal: noop,
      closeDescriptionMatchModal: noop,
    }),
  };
});

// --- SUÍTE DE TESTES ---

describe("Tela Partidas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Resetar estados globais dos mocks
    mockIsLoading = false;
    mockMatches = [];
    mockSearchParams = { matchId: undefined }; // Reset params URL
  });

  it("não renderiza cards de partidas quando está carregando e não há dados", () => {
    mockIsLoading = true;
    mockMatches = [];

    render(<Partidas />);

    expect(mockMatchesCard).not.toHaveBeenCalled();
  });

  it("renderiza um card de partida quando há dados", () => {
    mockIsLoading = false;
    mockMatches = [
      {
        id: "1",
        MatchStatus: "ABERTA",
        teamNameA: "Time Azul",
        teamNameB: "Time Vermelho",
      },
    ];

    render(<Partidas />);

    expect(mockMatchesCard).toHaveBeenCalledTimes(1);
    const props = mockMatchesCard.mock.calls[0][0];
    expect(props.match.id).toBe("1");
    expect(typeof props.onPressInfos).toBe("function");
    expect(typeof props.onPressJoinMatch).toBe("function");
  });

  it("ao acionar onPressJoinMatch do card chama joinMatch com a partida e callback", () => {
    mockIsLoading = false;
    mockMatches = [
      {
        id: "1",
        MatchStatus: "ABERTA",
        teamNameA: "Time Azul",
        teamNameB: "Time Vermelho",
      },
    ];

    render(<Partidas />);

    const props = mockMatchesCard.mock.calls[0][0];
    // Simula o clique no botão de entrar
    props.onPressJoinMatch();

    expect(mockJoinMatch).toHaveBeenCalledTimes(1);
    const [matchArg, callbackArg] = mockJoinMatch.mock.calls[0];
    expect(matchArg.id).toBe("1");
    // Verifica se o callback passado é a função de abrir o modal de confirmação
    expect(callbackArg).toBe(mockOpenModalConfirmCard);
  });

  it("ao acionar onPressInfos do card chama useModal com a partida", () => {
    mockIsLoading = false;
    mockMatches = [
      { id: "1", MatchStatus: "ABERTA" },
    ];

    render(<Partidas />);

    const props = mockMatchesCard.mock.calls[0][0];
    props.onPressInfos();

    expect(mockUseModal).toHaveBeenCalledTimes(1);
    const [matchArg] = mockUseModal.mock.calls[0];
    expect(matchArg.id).toBe("1");
  });

  it("chama reloadFeed quando a tela ganha foco", () => {
    mockIsLoading = false;
    mockMatches = [];

    render(<Partidas />);

    expect(mockReloadFeed).toHaveBeenCalled();
  });

  // --- NOVO TESTE DE NOTIFICAÇÃO ---
  it("deve buscar partida e abrir modal se matchId vier na URL (Notificação)", async () => {
    // Arrange
    const notificationMatchId = "123-uuid";
    const mockMatchData = { id: notificationMatchId, title: "Jogo Notificado" };
    
    // Simula que a rota veio com o parâmetro matchId
    mockSearchParams = { matchId: notificationMatchId };
    
    // Simula o retorno da API
    mockGetMatchById.mockResolvedValue(mockMatchData);

    // Act
    render(<Partidas />);

    // Assert (esperamos que as promessas do useEffect resolvam)
    await waitFor(() => {
      // 1. Chamou a API com o ID correto?
      expect(mockGetMatchById).toHaveBeenCalledWith(notificationMatchId);
      
      // 2. Abriu o modal com os dados retornados?
      expect(mockOpenModalConfirmCard).toHaveBeenCalledWith(mockMatchData);
      
      // 3. Limpou o parâmetro da URL?
      expect(mockSetParams).toHaveBeenCalledWith({ matchId: "" });
    });
  });
});