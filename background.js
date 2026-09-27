const KEY="apbState";
chrome.runtime.onInstalled.addListener(async()=>{const x=await chrome.storage.local.get(KEY);if(!x[KEY])await chrome.storage.local.set({[KEY]:{version:"0.1.0",chats:{}}});});
chrome.runtime.onMessage.addListener((m,s,reply)=>{
 if(m.type==="GET_STATE"){chrome.storage.local.get(KEY).then(x=>reply(x[KEY]||{chats:{}}));return true;}
 if(m.type==="SAVE_CHAT"){chrome.storage.local.get(KEY).then(async x=>{const st=x[KEY]||{chats:{}};st.chats[m.chat.chatId]=m.chat;await chrome.storage.local.set({[KEY]:st});reply({ok:true});});return true;}
});