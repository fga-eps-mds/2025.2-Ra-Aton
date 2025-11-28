import cron from 'node-cron';
import { prisma } from '../database/prisma.client';
import { NotificationType } from '@prisma/client';

export const sendMatchReminders = async () => {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // Janela de 1 hora

  try {
    // 1. Buscar partidas elegíveis
    const matches = await prisma.match.findMany({
      where: {
        MatchStatus: 'EM_BREVE', // Apenas partidas não iniciadas
        reminderSent: false,     // Que ainda não foram notificadas
        MatchDate: {
          gt: now,            // Data é no futuro
          lte: oneHourFromNow // Mas é menor que "daqui a 1 hora"
        }
      },
      include: {
        players: true
      }
    });

    if (matches.length === 0) return;

    console.log(`[Scheduler] Processando lembretes para ${matches.length} partidas.`);

    for (const match of matches) {
      // Cria o array de notificações (um para cada jogador)
      const notificationsData = match.players.map((subscription) => ({
        userId: subscription.userId,
        type: NotificationType.MATCH_REMINDER,
        title: 'Sua partida está chegando!',
        content: `A partida ${match.title} começa em menos de 1 hora.`,
        resourceId: match.id,
        resourceType: 'MATCH'
      }));

      await prisma.$transaction(async (tx) => {
        if (notificationsData.length > 0) {
          await tx.notification.createMany({
            data: notificationsData
          });
        }

        await tx.match.update({
          where: { id: match.id },
          data: { reminderSent: true }
        });
      });

      console.log(` -> Lembretes enviados para a partida: ${match.title}`);
    }

  } catch (error) {
    console.error('[Scheduler] Erro ao enviar lembretes:', error);
  }
};

export const startMatchReminderScheduler = () => {
  // Expressão Cron: */5 * * * *
  cron.schedule('*/5 * * * *', sendMatchReminders, {
    timezone: "UTC"
  });
  
  console.log('[Scheduler] Agendador de lembretes de partida iniciado (5 min).');
};