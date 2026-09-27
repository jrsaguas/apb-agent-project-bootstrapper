import test from "node:test";
import assert from "node:assert/strict";
import { parseTerminalState, TERMINAL_STATES } from "../src/markers.js";
import { randomContinuePhrase, CONTINUE_PHRASES } from "../src/phrases.js";
import { createChatState, recordIteration, RUN_STATES } from "../src/state.js";

test("terminal marker must be the final meaningful marker", () => {
  assert.equal(parseTerminalState("Trabajo terminado.\n\n**CONTINÚO**"), TERMINAL_STATES.CONTINUE);
  assert.equal(parseTerminalState("Trabajo.\n**ALERTA**"), TERMINAL_STATES.ALERT);
  assert.equal(parseTerminalState("Trabajo.\nCONTINÚO\nALERTA"), TERMINAL_STATES.ALERT);
  assert.equal(parseTerminalState("CONTINÚO pero falta una decisión"), TERMINAL_STATES.UNKNOWN);
});

test("random phrase selector stays inside the controlled list", () => {
  assert.equal(randomContinuePhrase(() => 0), CONTINUE_PHRASES[0]);
  assert.equal(randomContinuePhrase(() => 0.999999), CONTINUE_PHRASES.at(-1));
});

test("chat state records independent iterations", () => {
  const chat = createChatState({ chatId: "chat-1", tabId: 10, url: "https://chatgpt.com/c/chat-1" });
  const started = { ...chat, startedAt: 1000, lastSentAt: 1500 };
  const next = recordIteration(started, "Continúa.", 2500);
  assert.equal(next.state, RUN_STATES.RUNNING);
  assert.equal(next.iteration, 1);
  assert.equal(next.lastPrompt, "Continúa.");
  assert.equal(next.totalElapsedMs, 1500);
});
