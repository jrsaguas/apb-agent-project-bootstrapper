export const RUN_STATES = Object.freeze({
  IDLE: "IDLE", RUNNING: "RUNNING", PAUSED: "PAUSED", WAITING: "WAITING",
  ALERT: "ALERTA", ERROR: "ERROR", TIMEOUT: "TIMEOUT", UNKNOWN: "UNKNOWN", STOPPED: "STOPPED"
});

export function createChatState({ chatId, tabId, url = "" }) {
  return {
    chatId, tabId, url, state: RUN_STATES.IDLE, iteration: 0,
    startedAt: null, lastSentAt: null, lastCompletedAt: null,
    totalElapsedMs: 0, lastPrompt: "", lastDirective: "", lastError: "",
    updatedAt: Date.now()
  };
}

export function transition(chat, nextState, patch = {}) {
  if (!chat) throw new Error("chat state is required");
  const now = Date.now();
  const next = { ...chat, ...patch, state: nextState, updatedAt: now };
  if (nextState === RUN_STATES.RUNNING && !next.startedAt) next.startedAt = now;
  if (next.lastCompletedAt && next.startedAt) next.totalElapsedMs = next.lastCompletedAt - next.startedAt;
  return next;
}

export function recordIteration(chat, prompt, completedAt = Date.now()) {
  return transition(chat, RUN_STATES.RUNNING, {
    iteration: chat.iteration + 1,
    lastPrompt: prompt,
    lastSentAt: chat.lastSentAt ?? completedAt,
    lastCompletedAt: completedAt,
    totalElapsedMs: chat.startedAt ? completedAt - chat.startedAt : 0
  });
}
