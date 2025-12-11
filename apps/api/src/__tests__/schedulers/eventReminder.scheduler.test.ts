import { sendEventReminders } from "../../schedulers/eventReminder.scheduler";
import { NotificationType, PostType } from "@prisma/client";
// Ajuste o caminho conforme a localização do seu arquivo de mocks
import { prismaMock } from "../prisma-mock";

// Data fixa para garantir consistência nos testes (10:00 UTC)
const MOCK_NOW = new Date("2025-11-10T10:00:00.000Z").getTime();

describe("EventReminder Scheduler (Unit)", () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // 1. Congelar o tempo
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW);

    // 2. Espionar consoles
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // 3. Mock da transação (executa o callback imediatamente)
    prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("deve enviar notificações e marcar reminderSent=true para eventos próximos", async () => {
    // 1. ARRANGE
    // Simulamos um evento que começa às 11:00 (daqui a 1h)
    const mockEvent = {
      id: "event-123",
      title: "Churrasco da Atlética",
      attendances: [{ userId: "user-1" }, { userId: "user-2" }],
    };

    // O banco retorna esse evento
    prismaMock.post.findMany.mockResolvedValue([mockEvent] as any);

    // 2. ACT
    await sendEventReminders();

    // 3. ASSERT

    // A) Verificamos a query de busca (filtros de data e tipo)
    const expectedTwoHoursFromNow = new Date(MOCK_NOW + 2 * 60 * 60 * 1000);

    expect(prismaMock.post.findMany).toHaveBeenCalledWith({
      where: {
        type: PostType.EVENT,
        reminderSent: false,
        eventDate: {
          gt: expect.any(Date), // Maior que agora
          lte: expectedTwoHoursFromNow, // Menor/igual a 2h
        },
      },
      include: { attendances: true },
    });

    // B) Verificamos a criação das notificações
    expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: "user-1",
          type: NotificationType.EVENT_REMINDER,
        }),
        expect.objectContaining({
          userId: "user-2",
          type: NotificationType.EVENT_REMINDER,
        }),
      ],
    });

    // C) Verificamos a atualização do post
    expect(prismaMock.post.update).toHaveBeenCalledWith({
      where: { id: "event-123" },
      data: { reminderSent: true },
    });

    // D) Verificamos log
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[Scheduler] Processando lembretes para 1 eventos.",
      ),
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        " -> Lembretes enviados para o evento Churrasco da Atlética (2 usuários).",
      ),
    );
  });

  it("não deve fazer nada se nenhum evento for encontrado", async () => {
    // 1. ARRANGE
    prismaMock.post.findMany.mockResolvedValue([]);

    // 2. ACT
    await sendEventReminders();

    // 3. ASSERT
    expect(prismaMock.notification.createMany).not.toHaveBeenCalled();
    expect(prismaMock.post.update).not.toHaveBeenCalled();
  });

  it("deve marcar reminderSent=true mesmo se não houver participantes (para não processar de novo)", async () => {
    // 1. ARRANGE
    const mockEventVazio = {
      id: "event-empty",
      title: "Evento Impopular",
      attendances: [], // Ninguém vai
    };

    prismaMock.post.findMany.mockResolvedValue([mockEventVazio] as any);

    // 2. ACT
    await sendEventReminders();

    // 3. ASSERT
    // Não cria notificações...
    expect(prismaMock.notification.createMany).not.toHaveBeenCalled();

    // ...MAS atualiza o post
    expect(prismaMock.post.update).toHaveBeenCalledWith({
      where: { id: "event-empty" },
      data: { reminderSent: true },
    });
  });

  it("deve lidar com erros do banco graciosamente", async () => {
    // 1. ARRANGE
    const error = new Error("DB Connection Failed");
    prismaMock.post.findMany.mockRejectedValue(error);

    // 2. ACT
    await sendEventReminders();

    // 3. ASSERT
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Erro ao enviar lembretes"),
      error,
    );
  });
});
