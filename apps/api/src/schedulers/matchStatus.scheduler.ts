import cron from "node-cron";
import { prisma } from "../database/prisma.client";

/**
 * Lógica da tarefa:
 * Encontra todas as partidas que deveriam estar "EM_ANDAMENTO"
 * mas ainda estão marcadas como "EM_BREVE" e as atualiza.
 */
export const updateMatchesToOngoing = async () => {
  const now = new Date();

  console.log(
    `[Scheduler] Rodando verificação de status de partidas... (${now.toISOString()})`,
  );

  try {
    const { count } = await prisma.match.updateMany({
      where: {
        // 1. O status atual DEVE ser 'EM_BREVE'
        MatchStatus: "EM_BREVE",
        // 2. A data da partida (em UTC) já deve ter passado
        MatchDate: {
          lte: now, // lte = Less Than or Equal (menor ou igual a)
        },
      },
      data: {
        // 3. Atualiza o status
        MatchStatus: "EM_ANDAMENTO",
      },
    });

    if (count > 0) {
      console.log(
        `[Scheduler] ${count} partidas foram atualizadas para EM_ANDAMENTO.`,
      );
    }
  } catch (error) {
    console.error("[Scheduler] Erro ao atualizar status das partidas:", error);
  }
};

/**
 * Inicia o agendador.
 * A string '* * * * *' significa "executar a cada minuto".
 */
export const startMatchStatusScheduler = () => {
  console.log("[Scheduler] Agendador de status de partidas iniciado.");

  // Roda a tarefa a cada minuto
  cron.schedule("* * * * *", updateMatchesToOngoing, {
    timezone: "UTC", // Garante que o cron rode em UTC, assim como nosso 'new Date()'
  });

  // (Opcional) Roda uma vez na inicialização para pegar
  // qualquer partida que mudou enquanto o servidor estava offline
  updateMatchesToOngoing();
};
