import { startMatchStatusScheduler } from "./matchStatus.scheduler";

export const startAllSchedulers = () => {
  console.log("[Scheduler] Iniciando todos os agendadores...");

  startMatchStatusScheduler();
  // insira os outros schedulers abaixo
};
