import { startMatchStatusScheduler } from "./matchStatus.scheduler";
import { startMatchReminderScheduler } from "./matchReminder.scheduler";

export const startAllSchedulers = () => {
  console.log("[Scheduler] Iniciando todos os agendadores...");

  startMatchStatusScheduler();
  startMatchReminderScheduler();
};
