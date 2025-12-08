import { renderHook, act } from "@testing-library/react-native";
import { UseModalEditMatchs } from "@/libs/hooks/useEditMatchs";
import { Imatches } from "@/libs/interfaces/Imatches";

describe("UseModalEditMatchs", () => {
  it("deve abrir e fechar modal corretamente", () => {
    const { result } = renderHook(() => UseModalEditMatchs());

    // Mock completo de Imatches
    const match: Imatches = {
      id: "1",
      title: "Partida 1",
      description: "Partida amistosa",
      authorId: "user123",
      matchDate: new Date().toISOString(),
      MatchStatus: "pending",
      location: "Campo A",
      sport: "Futebol",
      maxPlayers: 10,
      teamNameA: "Time A",
      teamNameB: "Time B",
      teamAScore: 0,
      teamBScore: 0,
      createdAt: new Date().toISOString(),
      isSubscriptionOpen: true,
      spots: {
        totalMax: 10,
        totalFilled: 2,
      },
      teamA: {
        name: "Time A",
        max: 5,
        filled: 2,
        isOpen: 1,
        players: [
          { id: "p1", name: "Jogador 1", userName: "player1" },
        ],
      },
      teamB: {
        name: "Time B",
        max: 5,
        filled: 2,
        isOpen: 1,
        players: [
          { id: "p2", name: "Jogador 2", userName: "player2" },
        ],
      },
    };

    act(() => {
      result.current.useModal(match);
    });

    expect(result.current.visible).toBe(true);
    expect(result.current.selectedMatch).toEqual(match);

    act(() => {
      result.current.closeModal();
    });
    expect(result.current.visible).toBe(false);
  });

  it("deve abrir modal de detalhes de handle", () => {
    const { result } = renderHook(() => UseModalEditMatchs());

    act(() => {
      result.current.openDetailsFromHandle();
    });

    expect(result.current.visible).toBe(true);
    expect(result.current.selectedMatch).toBeNull();
  });

  it("deve controlar todos os modais auxiliares corretamente", () => {
    const { result } = renderHook(() => UseModalEditMatchs());

    const match: Imatches = { id: "2", title: "M2" } as any;

    // open confirm card
    act(() => {
      result.current.openModalConfirmCard(match);
    });
    expect(result.current.visibleConfirmCard).toBe(true);
    expect(result.current.selectedMatch).toEqual(match);

    act(() => {
      result.current.closeModalConfirmCard();
    });
    expect(result.current.visibleConfirmCard).toBe(false);

    // details handle modal
    act(() => {
      result.current.openDetailsHandleMatchModal();
    });
    expect(result.current.visibleDetailsHandle).toBe(true);
    act(() => {
      result.current.closeDetailsHandleMatchModal();
    });
    expect(result.current.visibleDetailsHandle).toBe(false);

    // infos handle modal
    act(() => {
      result.current.openModalMoreInfosHandleModal();
    });
    expect(result.current.visibleInfosHandleMatch).toBe(true);
    act(() => {
      result.current.closeModalMoreInfosHandleModal();
    });
    expect(result.current.visibleInfosHandleMatch).toBe(false);

    // report modal
    act(() => {
      result.current.openReportMatchModal();
    });
    expect(result.current.visibleReportMatch).toBe(true);
    act(() => {
      result.current.closeReportMatchModal();
    });
    expect(result.current.visibleReportMatch).toBe(false);

    // description modal
    act(() => {
      result.current.openDescriptionMatchModal();
    });
    expect(result.current.visibleDescriptionMatch).toBe(true);
    act(() => {
      result.current.closeDescriptionMatchModal();
    });
    expect(result.current.visibleDescriptionMatch).toBe(false);

    act(() => {
      result.current.openDetailsFromHandle();
    });
    expect(result.current.visible).toBe(true);
    act(() => {
      result.current.closeModal();
    });
    expect(result.current.visibleConfirmCard).toBe(true);
  });
});
