import { renderHook, act } from "@testing-library/react-native";
import { UseModalFeedMatchs } from "@/libs/hooks/useFeedMatchs";
import { Imatches } from "@/libs/interfaces/Imatches";

describe("UseModalFeedMatchs Hook", () => {
  const mockMatch = {
    id: "1",
    title: "Test Match",
    description: "Desc",
    sport: "Futebol",
    maxPlayers: 10,
    MatchDate: "2023-01-01",
    location: "Quadra",
    teamAScore: 0,
    teamBScore: 0,
    teamNameA: "A",
    teamNameB: "B",
  } as unknown as Imatches;

  it("deve inicializar com todos os modais fechados e match nulo", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    expect(result.current.visible).toBe(false);
    expect(result.current.visibleConfirmCard).toBe(false);
    expect(result.current.visibleDetailsHandle).toBe(false);
    expect(result.current.visibleInfosHandleMatch).toBe(false);
    expect(result.current.visibleReportMatch).toBe(false);
    expect(result.current.visibleDescriptionMatch).toBe(false);
    expect(result.current.selectedMatch).toBeNull();
  });

  // --- Teste do fluxo principal: CARD ---
  it("useModal: deve abrir o modal principal, definir match e configurar origem como 'card'", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => {
      result.current.useModal(mockMatch);
    });

    expect(result.current.selectedMatch).toEqual(mockMatch);
    expect(result.current.visible).toBe(true);

    // Fechar vindo do CARD não deve abrir confirmação
    act(() => {
      result.current.closeModal();
    });

    expect(result.current.visible).toBe(false);
    expect(result.current.visibleConfirmCard).toBe(false); // Confirma que a origem era 'card' ou null
  });

  // --- Teste do fluxo: HANDLE ---
  it("openDetailsFromHandle: deve abrir modal principal e configurar origem como 'handle'", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    // Primeiro, abrimos o modal de infos para garantir que ele fecha ao chamar openDetailsFromHandle
    act(() => {
      result.current.openModalMoreInfosHandleModal();
      result.current.openModalConfirmCard(mockMatch); // Abre confirmação também para testar reset
    });

    expect(result.current.visibleInfosHandleMatch).toBe(true);
    expect(result.current.visibleConfirmCard).toBe(true);

    // Ação Principal
    act(() => {
      result.current.openDetailsFromHandle();
    });

    // Verificações
    expect(result.current.visibleInfosHandleMatch).toBe(false); // Deve ter fechado
    expect(result.current.visibleConfirmCard).toBe(false); // Deve ter fechado
    expect(result.current.visible).toBe(true); // Modal principal aberto

    // Fechar vindo do HANDLE DEVE abrir confirmação
    act(() => {
      result.current.closeModal();
    });

    expect(result.current.visible).toBe(false);
    expect(result.current.visibleConfirmCard).toBe(true); // Branch 'if (detailsOrigin === "handle")' coberto
  });

  // --- Teste do reset de estado ---
  it("closeModal: deve resetar a origem para null após fechar", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    // 1. Abre como Handle
    act(() => {
      result.current.openDetailsFromHandle();
    });

    // 2. Fecha (Abre confirmação)
    act(() => {
      result.current.closeModal();
    });
    expect(result.current.visibleConfirmCard).toBe(true);

    // 3. Fecha confirmação manualmente
    act(() => {
      result.current.closeModalConfirmCard();
    });

    // 4. Se chamarmos closeModal novamente agora, NÃO deve abrir confirmação
    // pois o estado 'detailsOrigin' deve ter sido resetado para null na primeira chamada de closeModal
    act(() => {
      result.current.closeModal();
    });

    expect(result.current.visibleConfirmCard).toBe(false); // Prova que setDetailsOrigin(null) funcionou
  });

  // --- Testes de Modais Individuais (Coverage Functions) ---

  it("DetailsHandleMatchModal: deve abrir e fechar", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => result.current.openDetailsHandleMatchModal());
    expect(result.current.visibleDetailsHandle).toBe(true);

    act(() => result.current.closeDetailsHandleMatchModal());
    expect(result.current.visibleDetailsHandle).toBe(false);
  });

  it("ConfirmCard: deve abrir (com match) e fechar", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => result.current.openModalConfirmCard(mockMatch));
    expect(result.current.visibleConfirmCard).toBe(true);
    expect(result.current.selectedMatch).toEqual(mockMatch);

    act(() => result.current.closeModalConfirmCard());
    expect(result.current.visibleConfirmCard).toBe(false);
  });

  it("MoreInfosHandleModal: deve abrir e fechar", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => result.current.openModalMoreInfosHandleModal());
    expect(result.current.visibleInfosHandleMatch).toBe(true);

    act(() => result.current.closeModalMoreInfosHandleModal());
    expect(result.current.visibleInfosHandleMatch).toBe(false);
  });

  it("ReportMatchModal: deve abrir e fechar", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => result.current.openReportMatchModal());
    expect(result.current.visibleReportMatch).toBe(true);

    act(() => result.current.closeReportMatchModal());
    expect(result.current.visibleReportMatch).toBe(false);
  });

  it("DescriptionMatchModal: deve abrir e fechar", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => result.current.openDescriptionMatchModal());
    expect(result.current.visibleDescriptionMatch).toBe(true);

    act(() => result.current.closeDescriptionMatchModal());
    expect(result.current.visibleDescriptionMatch).toBe(false);
  });
});
