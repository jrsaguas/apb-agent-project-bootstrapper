const CONTINUE_PHRASES=["Continúa.","Sigue trabajando.","Continúa con el siguiente paso.","Sigue adelante.","Continúa con el proyecto.","Sigue trabajando en ello.","Continúa donde te quedaste.","Avanza con la siguiente fase.","Prosigue con el trabajo.","Sigue con la implementación.","Continúa con lo planificado.","Avanza con el siguiente punto.","Sigue desarrollando el proyecto.","Continúa con la tarea pendiente.","Prosigue con la siguiente etapa.","Sigue ejecutando el plan.","Continúa con el trabajo pendiente.","Avanza con lo que sigue.","Sigue con el siguiente paso del plan.","Continúa hasta completar la siguiente parte."];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function composer(){return document.querySelector("textarea[placeholder*='Message'],textarea[placeholder*='mensaje'],textarea")}
function sendButton(){return document.querySelector("button[data-testid='send-button'],button[aria-label*='Send'],button[aria-label*='Enviar']")}
function lastAssistantText(){const n=[...document.querySelectorAll("[data-message-author-role='assistant']")];return n.at(-1)?.innerText||""}
async function sendText(text){const b=composer();if(!b)throw Error("ChatGPT composer not found");b.focus();b.value=text;b.dispatchEvent(new Event("input",{bubbles:true}));await sleep(100);const s=sendButton();if(!s)throw Error("ChatGPT send button not found");s.click()}
async function waitForCompletion(timeout=1800000){const start=Date.now();let stable=0,last="";while(Date.now()-start<timeout){await sleep(1000);const t=lastAssistantText(),s=sendButton();if(t&&t===last&&s&&!s.disabled)stable++;else stable=0;last=t;if(stable>=3)return t}throw Error("Response completion timeout")}
chrome.runtime.onMessage.addListener((m,s,reply)=>{
 if(m.type==="SEND_TEXT"){sendText(m.text).then(()=>reply({ok:true})).catch(e=>reply({ok:false,error:e.message}));return true}
 if(m.type==="WAIT_RESPONSE"){waitForCompletion(m.timeoutMs).then(text=>reply({ok:true,text})).catch(e=>reply({ok:false,error:e.message}));return true}
 if(m.type==="GET_LAST_RESPONSE")reply({text:lastAssistantText()});
});