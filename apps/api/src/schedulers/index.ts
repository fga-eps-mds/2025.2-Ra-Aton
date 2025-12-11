import { startMatchStatusScheduler } from "./matchStatus.scheduler";
import { startMatchReminderScheduler } from "./matchReminder.scheduler";
import { startEventReminderScheduler } from "./eventReminder.scheduler";

export const startAllSchedulers = () => {
  console.log("[Scheduler] Iniciando todos os agendadores...");

  startMatchStatusScheduler();
  startMatchReminderScheduler();
  startEventReminderScheduler();
};
