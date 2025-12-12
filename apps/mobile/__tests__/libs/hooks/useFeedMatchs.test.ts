import { renderHook, act } from "@testing-library/react-native";
import { UseModalFeedMatchs } from "@/libs/hooks/useFeedMatchs";
import { Imatches } from "@/libs/interfaces/Imatches";

describe("UseModalFeedMatchs", () => {
  const mockMatch = { id: "1", title: "Test Match" } as unknown as Imatches;

  it("deve inicializar com os estados padrao", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    expect(result.current.visible).toBe(false);
    expect(result.current.visibleConfirmCard).toBe(false);
    expect(result.current.visibleDetailsHandle).toBe(false);
    expect(result.current.visibleInfosHandleMatch).toBe(false);
    expect(result.current.visibleReportMatch).toBe(false);
    expect(result.current.visibleDescriptionMatch).toBe(false);
    expect(result.current.selectedMatch).toBeNull();
  });

  it("deve abrir o modal principal e definir a origem como card ao chamar useModal", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => {
      result.current.useModal(mockMatch);
    });

    expect(result.current.selectedMatch).toEqual(mockMatch);
    expect(result.current.visible).toBe(true);
  });

  it("deve fechar o modal principal sem abrir confirmação se a origem nao for handle", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => {
      result.current.useModal(mockMatch);
    });

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.visible).toBe(false);
    expect(result.current.visibleConfirmCard).toBe(false);
    expect(result.current.selectedMatch).toEqual(mockMatch); 
  });

  it("deve configurar estados corretamente ao chamar openDetailsFromHandle", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => {
      result.current.openModalMoreInfosHandleModal();
      result.current.openModalConfirmCard(mockMatch);
    });

    act(() => {
      result.current.openDetailsFromHandle();
    });

    expect(result.current.visibleInfosHandleMatch).toBe(false);
    expect(result.current.visibleConfirmCard).toBe(false);
    expect(result.current.visible).toBe(true);
  });

  it("deve abrir modal de confirmação ao fechar modal principal se a origem for handle", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => {
      result.current.openDetailsFromHandle();
    });

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.visible).toBe(false);
    expect(result.current.visibleConfirmCard).toBe(true);
  });

  it("deve controlar o modal de detalhes do handle", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => {
      result.current.openDetailsHandleMatchModal();
    });
    expect(result.current.visibleDetailsHandle).toBe(true);

    act(() => {
      result.current.closeDetailsHandleMatchModal();
    });
    expect(result.current.visibleDetailsHandle).toBe(false);
  });

  it("deve controlar o modal de confirmação do card", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => {
      result.current.openModalConfirmCard(mockMatch);
    });
    expect(result.current.visibleConfirmCard).toBe(true);
    expect(result.current.selectedMatch).toEqual(mockMatch);

    act(() => {
      result.current.closeModalConfirmCard();
    });
    expect(result.current.visibleConfirmCard).toBe(false);
  });

  it("deve controlar o modal de mais informacoes", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => {
      result.current.openModalMoreInfosHandleModal();
    });
    expect(result.current.visibleInfosHandleMatch).toBe(true);

    act(() => {
      result.current.closeModalMoreInfosHandleModal();
    });
    expect(result.current.visibleInfosHandleMatch).toBe(false);
  });

  it("deve controlar o modal de report", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => {
      result.current.openReportMatchModal();
    });
    expect(result.current.visibleReportMatch).toBe(true);

    act(() => {
      result.current.closeReportMatchModal();
    });
    expect(result.current.visibleReportMatch).toBe(false);
  });

  it("deve controlar o modal de descricao", () => {
    const { result } = renderHook(() => UseModalFeedMatchs());

    act(() => {
      result.current.openDescriptionMatchModal();
    });
    expect(result.current.visibleDescriptionMatch).toBe(true);

    act(() => {
      result.current.closeDescriptionMatchModal();
    });
    expect(result.current.visibleDescriptionMatch).toBe(false);
  });
});