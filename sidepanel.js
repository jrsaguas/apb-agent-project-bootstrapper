import { randomContinuePhrase } from "./src/phrases.js";
import { parseTerminalState, TERMINAL_STATES } from "./src/markers.js";
import { RUN_STATES } from "./src/state.js";

const $ = id => document.getElementById(id);
let running = false;
let chat = null;
let iterations = 0;
let startedAt = 0;

function setState(value) { $("state").textContent = value; }
function activeTab() { return chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => tabs[0]); }
function send(type, data = {}) { return activeTab().then(tab => chrome.tabs.sendMessage(tab.id, { type, ...data })); }
async function registerActiveChat() {
  const tab = await activeTab();
  const result = await chrome.runtime.sendMessage({ type: "REGISTER_ACTIVE_CHAT", tab: { id: tab.id, url: tab.url } });
  if (!result?.ok) throw new Error(result?.error || "CHAT_REGISTRATION_FAILED");
  chat = result.chat;
  iterations = chat.iteration;
  return chat;
}
async function persist(state, patch = {}) {
  if (!chat) return;
  const result = await chrome.runtime.sendMessage({ type: "SET_CHAT_STATE", chatId: chat.chatId, state, patch });
  if (result?.ok) chat = result.chat;
}

async function stop(reason = "STOPPED") {
  running = false;
  const terminal = reason === "ALERTA" ? RUN_STATES.ALERT : reason === "TIMEOUT" ? RUN_STATES.TIMEOUT : RUN_STATES.STOPPED;
  await persist(terminal, { lastError: reason });
  setState(reason);
  render();
}

async function cycle() {
  if (!running) return;
  const phrase = randomContinuePhrase();
  setState("WAITING");
  await persist(RUN_STATES.WAITING, { lastDirective: phrase, lastSentAt: Date.now() });
  const sent = await send("SEND_TEXT", { text: phrase });
  if (!sent?.ok) return stop("SEND ERROR");
  const result = await send("WAIT_RESPONSE", { timeoutMs: 1800000 });
  if (!result?.ok) return stop(result?.error || "TIMEOUT");
  const terminal = parseTerminalState(result.text);
  iterations += 1;
  await persist(RUN_STATES.RUNNING, { iteration: iterations, lastPrompt: phrase, lastCompletedAt: Date.now() });
  render();
  if (terminal === TERMINAL_STATES.ALERT) return stop("ALERTA");
  if (terminal !== TERMINAL_STATES.CONTINUE) return stop("UNKNOWN FINAL STATE");
  if (running) setTimeout(cycle, 1000);
}

function render() {
  const elapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
  const empty = '<div class="meta">No active chat registered.</div>';
  $("chats").innerHTML = chat ? `<div class="card ${running ? "running" : ""}"><b>${chat.chatId}</b><div class="meta">State: ${chat.state} · Iterations: ${iterations} · Elapsed: ${elapsed}s</div></div>` : empty;
}

const initPrompt = "INICIALIZA EL PROYECTO. Usa Desktop Commander para crear una carpeta única en Documents, inicializar Git y vincularla al repositorio GitHub. No entregues documentos ni descargables. Genera Project ID PRJ-YYYYMMDD-HHMMSS-XXXXXX. Verifica que la carpeta local y el repositorio remoto no existan antes de crearlos; si hay colisión, genera otro identificador. Responde REPOSITORIO, LINK y ESPERANDO DESCRIPCIÓN DEL PROYECTO.";

$("init").onclick = async () => {
  try { await registerActiveChat(); await send("SEND_TEXT", { text: initPrompt }); await persist(RUN_STATES.RUNNING, { lastPrompt: initPrompt }); setState("INITIALIZATION SENT"); render(); }
  catch (error) { setState(error.message); }
};

$("work").onclick = async () => {
  try { await registerActiveChat(); const text = $("prompt").value.trim(); if (!text) throw new Error("PROJECT DESCRIPTION REQUIRED"); await send("SEND_TEXT", { text }); await persist(RUN_STATES.RUNNING, { lastPrompt: text }); setState("WORK SENT"); render(); }
  catch (error) { setState(error.message); }
};

$("continue").onclick = async () => {
  try { await registerActiveChat(); if (running) return; running = true; startedAt = Date.now(); iterations = chat.iteration; await persist(RUN_STATES.RUNNING); setState("RUNNING"); render(); await cycle(); }
  catch (error) { await stop(error.message); }
};

$("stop").onclick = () => stop("STOPPED BY USER");
$("stopAll").onclick = async () => { running = false; const state = await chrome.runtime.sendMessage({ type: "GET_STATE" }); await Promise.all(Object.keys(state.chats || {}).map(chatId => chrome.runtime.sendMessage({ type: "SET_CHAT_STATE", chatId, state: RUN_STATES.STOPPED, patch: { lastError: "STOP ALL" } }))); setState("ALL STOPPED"); render(); };

registerActiveChat().catch(() => {}).finally(render);
