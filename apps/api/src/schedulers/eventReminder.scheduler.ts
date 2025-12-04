import cron from "node-cron";
import { prisma } from "../database/prisma.client";
import { NotificationType, PostType } from "@prisma/client";

export const sendEventReminders = async () => {
  const now = new Date();
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  try {
    const events = await prisma.post.findMany({
      where: {
        type: PostType.EVENT,
        reminderSent: false,
        eventDate: {
          gt: now,
          lte: twoHoursFromNow,
        },
      },
      include: {
        attendances: true,
      },
    });

    if (events.length === 0) return;

    console.log(
      `[Scheduler] Processando lembretes para ${events.length} eventos.`,
    );

    for (const event of events) {
      const notificationsData = event.attendances.map((attendance) => ({
        userId: attendance.userId,
        type: NotificationType.EVENT_REMINDER,
        title: "Evento chegando!",
        content: `Lembrete: O evento ${event.title} começará em breve!`,
        resourceId: event.id,
        resourceType: "POST",
      }));

      await prisma.$transaction(async (tx) => {
        if (notificationsData.length > 0) {
          await tx.notification.createMany({
            data: notificationsData,
          });
        }

        await tx.post.update({
          where: { id: event.id },
          data: { reminderSent: true },
        });
      });

      console.log(
        ` -> Lembretes enviados para o evento "${event.title}" (${notificationsData.length} usuários).`,
      );
    }
  } catch (error) {
    console.error("[Scheduler] Erro ao enviar lembretes de eventos:", error);
  }
};

export const startEventReminderScheduler = () => {
  console.log("[Scheduler] Agendador de lembretes de eventos iniciado.");
  cron.schedule("*/15 * * * *", sendEventReminders, {
    timezone: "UTC",
  });
};
