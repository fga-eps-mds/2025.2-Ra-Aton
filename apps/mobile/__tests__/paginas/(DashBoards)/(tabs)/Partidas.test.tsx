import React from "react";
import { render } from "@testing-library/react-native";
import Partidas from "@/app/(DashBoard)/(tabs)/Partidas";

jest.mock("@/constants/Theme", () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock("@/components/BackGroundComp", () => {
  const React = require("react");
  return function BackGroundComp({ children }: any) {
    return <>{children}</>;
  };
});

const mockMatchesCard = jest.fn();
jest.mock("@/components/MatchesCardComp", () => ({
  MatchesCard: (props: any) => {
    mockMatchesCard(props);
    const React = require("react");
    const { View } = require("react-native");
    return <View />;
  },
}));

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

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (cb: any) => cb(),
}));

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

const mockUseModal = jest.fn();
const mockCloseModal = jest.fn();
const mockOpenDetailsHandleMatchModal = jest.fn();
const mockCloseDetailsHandleMatchModal = jest.fn();
const mockOpenModalConfirmCard = jest.fn();
const mockCloseModalConfirmCard = jest.fn();
const mockOpenModalMoreInfosHandleModal = jest.fn();
const mockCloseModalMoreInfosHandleModal = jest.fn();
const mockOpenReportMatchModal = jest.fn();
const mockCloseReportMatchModal = jest.fn();
const mockOpenDetailsFromHandle = jest.fn();
const mockOpenDescriptionMatchModal = jest.fn();
const mockCloseDescriptionMatchModal = jest.fn();

jest.mock("@/libs/hooks/useFeedMatchs", () => ({
  UseModalFeedMatchs: () => ({
    visibleConfirmCard: false,
    visible: false,
    visibleDetailsHandle: false,
    visibleInfosHandleMatch: false,
    visibleReportMatch: false,
    visibleDescriptionMatch: false,
    selectedMatch: null,
    useModal: mockUseModal,
    closeModal: mockCloseModal,
    openDetailsHandleMatchModal: mockOpenDetailsHandleMatchModal,
    closeDetailsHandleMatchModal: mockCloseDetailsHandleMatchModal,
    openModalConfirmCard: mockOpenModalConfirmCard,
    closeModalConfirmCard: mockCloseModalConfirmCard,
    openModalMoreInfosHandleModal: mockOpenModalMoreInfosHandleModal,
    closeModalMoreInfosHandleModal: mockCloseModalMoreInfosHandleModal,
    openReportMatchModal: mockOpenReportMatchModal,
    closeReportMatchModal: mockCloseReportMatchModal,
    openDetailsFromHandle: mockOpenDetailsFromHandle,
    openDescriptionMatchModal: mockOpenDescriptionMatchModal,
    closeDescriptionMatchModal: mockCloseDescriptionMatchModal,
  }),
}));

describe("Tela Partidas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading = false;
    mockMatches = [];
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
    props.onPressJoinMatch();

    expect(mockJoinMatch).toHaveBeenCalledTimes(1);
    const [matchArg, callbackArg] = mockJoinMatch.mock.calls[0];
    expect(matchArg.id).toBe("1");
    expect(callbackArg).toBe(mockOpenModalConfirmCard);
  });

  it("ao acionar onPressInfos do card chama useModal com a partida", () => {
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
});
