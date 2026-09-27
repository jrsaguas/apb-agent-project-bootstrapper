import { createChatState, transition, RUN_STATES } from "./src/state.js";

const KEY = "apbState";
const DEFAULT_STATE = { version: "0.2.0", chats: {}, settings: { maxIterations: 100, responseTimeoutMs: 1800000 } };

async function getState() {
  const data = await chrome.storage.local.get(KEY);
  return data[KEY] ?? structuredClone(DEFAULT_STATE);
}

async function saveState(state) {
  await chrome.storage.local.set({ [KEY]: state });
  return state;
}

async function registerChat(tab) {
  const state = await getState();
  const chatId = tab.url?.match(/\/c\/([^/?#]+)/)?.[1] ?? `tab-${tab.id}`;
  const current = state.chats[chatId];
  state.chats[chatId] = current
    ? { ...current, tabId: tab.id, url: tab.url ?? current.url, updatedAt: Date.now() }
    : createChatState({ chatId, tabId: tab.id, url: tab.url ?? "" });
  await saveState(state);
  return state.chats[chatId];
}

chrome.runtime.onInstalled.addListener(async () => {
  const state = await getState();
  await saveState(state);
});
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  (async () => {
    if (message.type === "GET_STATE") return reply(await getState());
    if (message.type === "REGISTER_ACTIVE_CHAT") {
      const tab = message.tab ?? { id: sender.tab?.id, url: sender.tab?.url };
      return reply({ ok: true, chat: await registerChat(tab) });
    }
    if (message.type === "SET_CHAT_STATE") {
      const state = await getState();
      const chat = state.chats[message.chatId];
      if (!chat) return reply({ ok: false, error: "CHAT_NOT_REGISTERED" });
      state.chats[message.chatId] = transition(chat, message.state, message.patch ?? {});
      await saveState(state);
      return reply({ ok: true, chat: state.chats[message.chatId] });
    }
    if (message.type === "CLEAR_CHAT") {
      const state = await getState();
      delete state.chats[message.chatId];
      await saveState(state);
      return reply({ ok: true });
    }
    return reply({ ok: false, error: "UNKNOWN_MESSAGE" });
  })().catch(error => reply({ ok: false, error: error.message }));
  return true;
});
