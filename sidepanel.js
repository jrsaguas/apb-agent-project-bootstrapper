const $=id=>document.getElementById(id);
let running=false;
function setState(s){$("state").textContent=s}
$("init").onclick=()=>setState("INITIALIZATION")
$("work").onclick=()=>setState("WORK")
$("continue").onclick=()=>{running=true;setState("RUNNING")}
$("stop").onclick=()=>{running=false;setState("STOPPED")};

const getTab=()=>chrome.tabs.query({active:true,currentWindow:true});
const send=(type,data={})=>getTab().then(t=>chrome.tabs.sendMessage(t[0].id,{type,...data}));
const initPrompt="INICIALIZA EL PROYECTO. Usa Desktop Commander para crear una carpeta única en Documents, inicializar Git y vincularla al repositorio GitHub. No entregues documentos ni descargables. Genera Project ID PRJ-YYYYMMDD-HHMM-XXXX. Responde REPOSITORIO, LINK y ESPERANDO DESCRIPCIÓN DEL PROYECTO.";
const phrases=["CONTINÚA","TRABAJA EN ELLO","SIGUE TRABAJANDO","AVANZA CON EL SIGUIENTE PASO","CONTINÚA CON LO PLANIFICADO","PROSIGUE CON EL TRABAJO","SIGUE CON LA IMPLEMENTACIÓN","AVANZA CON LA SIGUIENTE FASE","CONTINÚA DONDE TE QUEDASTE","SIGUE DESARROLLANDO EL PROYECTO"];

let iterations=0,started=0;
async function oneCycle(){if(!running)return;const phrase=phrases[Math.floor(Math.random()*phrases.length)];setState("WAITING RESPONSE");const r=await send("SEND_TEXT",{text:phrase});if(!r?.ok)return stop("SEND ERROR");const w=await send("WAIT_RESPONSE",{timeoutMs:1800000});if(!w?.ok)return stop(w?.error||"TIMEOUT");iterations++;render();const tail=(w.text||"").trim().split("\n").slice(-5).join("\n");if(/ALERTA/i.test(tail))return stop("ALERTA");if(!/CONTINÚO/i.test(tail))return stop("UNKNOWN FINAL STATE");if(running)setTimeout(oneCycle,1000)}
function stop(reason){running=false;setState(reason||"STOPPED");render()}
function render(){$("chats").innerHTML='<div class="card '+(running?"running":"")+'"><b>Active chat</b><div class="meta">Iterations: '+iterations+' · Elapsed: '+(started?Math.floor((Date.now()-started)/1000):0)+'s</div></div>'}
$("init").onclick=()=>send("SEND_TEXT",{text:initPrompt}).then(()=>setState("INITIALIZATION SENT"));
$("work").onclick=()=>send("SEND_TEXT",{text:$('prompt').value}).then(()=>setState("WORK SENT"));
$("continue").onclick=()=>{if(!running){running=true;started=Date.now();iterations=0;setState("RUNNING");oneCycle()}};
$("stop").onclick=()=>stop("STOPPED BY USER");render();
