import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import { NotificationProvider, useNotifications } from "@/libs/storage/NotificationContext";
import {
    getUnreadNotificationsCount,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "@/libs/auth/handleNotifications";

// Mock das funções da API
jest.mock("@/libs/auth/handleNotifications", () => ({
    getUnreadNotificationsCount: jest.fn(),
    getUserNotifications: jest.fn(),
    markNotificationAsRead: jest.fn(),
    markAllNotificationsAsRead: jest.fn(),
}));

describe("NotificationContext", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        jest.spyOn(console, "log").mockImplementation(() => { });
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // Wrapper para prover o contexto nos testes
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NotificationProvider>{children}</NotificationProvider>
    );

    it("deve carregar a contagem de não lidas ao montar", async () => {
        (getUnreadNotificationsCount as jest.Mock).mockResolvedValue(5);

        const { result } = renderHook(() => useNotifications(), { wrapper });

        await waitFor(() => {
            expect(result.current.unreadCount).toBe(5);
        });

        expect(getUnreadNotificationsCount).toHaveBeenCalledTimes(1);
    });

    it("deve carregar notificações e atualizar o estado", async () => {
        const mockNotifications = [
            { id: "1", title: "Teste", readAt: null },
            { id: "2", title: "Teste 2", readAt: "2023-01-01" },
        ];
        (getUserNotifications as jest.Mock).mockResolvedValue(mockNotifications);

        const { result } = renderHook(() => useNotifications(), { wrapper });

        await act(async () => {
            await result.current.loadNotifications();
        });

        expect(result.current.notifications).toEqual(mockNotifications);
        expect(result.current.unreadCount).toBe(1); // Filtra baseado no readAt para garantir sincronia
        expect(result.current.loading).toBe(false);
    });

    it("deve lidar com erro ao carregar notificações", async () => {
        (getUserNotifications as jest.Mock).mockRejectedValue(new Error("Erro API"));

        const { result } = renderHook(() => useNotifications(), { wrapper });

        await act(async () => {
            await result.current.loadNotifications();
        });

        expect(result.current.notifications).toEqual([]);
        expect(console.error).toHaveBeenCalled();
    });

    it("deve tratar retorno inválido da API (não array)", async () => {
        (getUserNotifications as jest.Mock).mockResolvedValue({ error: "Invalid format" });

        const { result } = renderHook(() => useNotifications(), { wrapper });

        await act(async () => {
            await result.current.loadNotifications();
        });

        expect(result.current.notifications).toEqual([]);
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining("não retornou um array"), expect.anything());
    });

    it("deve marcar uma notificação como lida (otimista)", async () => {
        const initialNotifs = [{ id: "1", readAt: null }];
        (getUserNotifications as jest.Mock).mockResolvedValue(initialNotifs);
        (markNotificationAsRead as jest.Mock).mockResolvedValue({});

        const { result } = renderHook(() => useNotifications(), { wrapper });

        // Carrega inicial
        await act(async () => {
            await result.current.loadNotifications();
        });

        expect(result.current.unreadCount).toBe(1);

        // Marca como lida
        await act(async () => {
            await result.current.markAsRead("1");
        });

        expect(result.current.unreadCount).toBe(0);
        expect(result.current.notifications[0].readAt).toBeTruthy();
        expect(markNotificationAsRead).toHaveBeenCalledWith("1");
    });

    it("deve reverter marcação como lida se a API falhar", async () => {
        const initialNotifs = [{ id: "1", readAt: null }];
        (getUserNotifications as jest.Mock).mockResolvedValue(initialNotifs);
        (markNotificationAsRead as jest.Mock).mockRejectedValue(new Error("Falha"));

        const { result } = renderHook(() => useNotifications(), { wrapper });

        await act(async () => {
            await result.current.loadNotifications();
        });

        await act(async () => {
            await result.current.markAsRead("1");
        });

        // Deve chamar loadNotifications novamente para reverter/atualizar o estado real
        expect(getUserNotifications).toHaveBeenCalledTimes(2);
    });

    it("deve marcar todas como lidas (otimista)", async () => {
        const initialNotifs = [
            { id: "1", readAt: null },
            { id: "2", readAt: null },
        ];
        (getUserNotifications as jest.Mock).mockResolvedValue(initialNotifs);
        (markAllNotificationsAsRead as jest.Mock).mockResolvedValue({});

        const { result } = renderHook(() => useNotifications(), { wrapper });

        await act(async () => {
            await result.current.loadNotifications();
        });

        expect(result.current.unreadCount).toBe(2);

        await act(async () => {
            await result.current.markAllAsRead();
        });

        expect(result.current.unreadCount).toBe(0);
        expect(result.current.notifications.every((n) => n.readAt)).toBe(true);
        expect(markAllNotificationsAsRead).toHaveBeenCalled();
    });

    it("deve fazer polling do contador a cada 15 segundos", async () => {
        (getUnreadNotificationsCount as jest.Mock).mockResolvedValue(10);

        renderHook(() => useNotifications(), { wrapper });

        expect(getUnreadNotificationsCount).toHaveBeenCalledTimes(1);

        act(() => {
            jest.advanceTimersByTime(15000);
        });

        expect(getUnreadNotificationsCount).toHaveBeenCalledTimes(2);
    });

    it("deve lidar silenciosamente com erro ao carregar contador de não lidas", async () => {
        (getUnreadNotificationsCount as jest.Mock).mockRejectedValue(new Error("Erro de rede"));

        const { result } = renderHook(() => useNotifications(), { wrapper });

        await waitFor(() => {
            // Deve manter o valor padrão (0) quando há erro
            expect(result.current.unreadCount).toBe(0);
        });

        // Verifica que a função foi chamada mesmo com erro
        expect(getUnreadNotificationsCount).toHaveBeenCalled();
    });

    it("deve reverter marcação de todas como lidas se a API falhar", async () => {
        const initialNotifs = [
            { id: "1", readAt: null },
            { id: "2", readAt: null },
        ];
        (getUserNotifications as jest.Mock).mockResolvedValue(initialNotifs);
        (markAllNotificationsAsRead as jest.Mock).mockRejectedValue(new Error("Falha na API"));

        const { result } = renderHook(() => useNotifications(), { wrapper });

        await act(async () => {
            await result.current.loadNotifications();
        });

        expect(result.current.unreadCount).toBe(2);

        await act(async () => {
            await result.current.markAllAsRead();
        });

        // Deve chamar loadNotifications novamente para reverter/atualizar o estado real
        expect(getUserNotifications).toHaveBeenCalledTimes(2);
        expect(console.error).toHaveBeenCalled();
    });

    it("deve limpar o intervalo de polling ao desmontar", async () => {
        (getUnreadNotificationsCount as jest.Mock).mockResolvedValue(3);

        const { unmount } = renderHook(() => useNotifications(), { wrapper });

        expect(getUnreadNotificationsCount).toHaveBeenCalledTimes(1);

        // Desmonta o componente
        unmount();

        // Avança o tempo - o polling não deve mais ocorrer
        act(() => {
            jest.advanceTimersByTime(30000);
        });

        // O contador não deve ter sido chamado novamente após o unmount
        expect(getUnreadNotificationsCount).toHaveBeenCalledTimes(1);
    });

    it("deve manter notificações já lidas ao chamar markAllAsRead", async () => {
        const initialNotifs = [
            { id: "1", readAt: null },
            { id: "2", readAt: "2023-01-01T00:00:00Z" }, // Já lida
        ];
        (getUserNotifications as jest.Mock).mockResolvedValue(initialNotifs);
        (markAllNotificationsAsRead as jest.Mock).mockResolvedValue({});

        const { result } = renderHook(() => useNotifications(), { wrapper });

        await act(async () => {
            await result.current.loadNotifications();
        });

        const originalReadAt = result.current.notifications[1].readAt;

        await act(async () => {
            await result.current.markAllAsRead();
        });

        // A notificação já lida deve manter seu readAt original
        expect(result.current.notifications[1].readAt).toBe(originalReadAt);
        // A notificação não lida deve ter um novo readAt
        expect(result.current.notifications[0].readAt).toBeTruthy();
    });

    it("deve definir loading como true durante o carregamento de notificações", async () => {
        let resolvePromise: (value: any) => void;
        const pendingPromise = new Promise((resolve) => {
            resolvePromise = resolve;
        });
        (getUserNotifications as jest.Mock).mockReturnValue(pendingPromise);

        const { result } = renderHook(() => useNotifications(), { wrapper });

        // Inicia o carregamento
        act(() => {
            result.current.loadNotifications();
        });

        // Durante o carregamento, loading deve ser true
        expect(result.current.loading).toBe(true);

        // Resolve a promise
        await act(async () => {
            resolvePromise!([]);
        });

        // Após o carregamento, loading deve ser false
        expect(result.current.loading).toBe(false);
    });

    it("deve atualizar unreadCount corretamente com múltiplas notificações não lidas", async () => {
        const mockNotifications = [
            { id: "1", title: "Notif 1", readAt: null },
            { id: "2", title: "Notif 2", readAt: null },
            { id: "3", title: "Notif 3", readAt: null },
            { id: "4", title: "Notif 4", readAt: "2023-01-01" },
            { id: "5", title: "Notif 5", readAt: "2023-01-02" },
        ];
        (getUserNotifications as jest.Mock).mockResolvedValue(mockNotifications);

        const { result } = renderHook(() => useNotifications(), { wrapper });

        await act(async () => {
            await result.current.loadNotifications();
        });

        // Deve contar apenas as notificações com readAt null
        expect(result.current.unreadCount).toBe(3);
        expect(result.current.notifications).toHaveLength(5);
    });

    it("não deve decrementar unreadCount abaixo de zero", async () => {
        const initialNotifs = [{ id: "1", readAt: "2023-01-01" }]; // Já lida
        (getUserNotifications as jest.Mock).mockResolvedValue(initialNotifs);
        (markNotificationAsRead as jest.Mock).mockResolvedValue({});

        const { result } = renderHook(() => useNotifications(), { wrapper });

        await act(async () => {
            await result.current.loadNotifications();
        });

        expect(result.current.unreadCount).toBe(0);

        // Tenta marcar como lida mesmo já estando lida
        await act(async () => {
            await result.current.markAsRead("1");
        });

        // Deve permanecer 0, não ir para -1
        expect(result.current.unreadCount).toBe(0);
    });
});