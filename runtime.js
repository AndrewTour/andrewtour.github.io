/* AGNT 1.44.14: independent startup protection; no authentication or data access. */
(()=>{
  'use strict';
  const version='1.44.14',key='agnt:runtime-events-v1',boot=Date.now().toString(36);
  const codes=new Set(['Error','TypeError','ReferenceError','RangeError','SyntaxError','SecurityError','QuotaExceededError','AbortError']);
  const events=new Set(['boot','ready','hidden','visible','pagehide','pageshow','pageshow-restored','online','offline','runtime-error','promise-error','module-error','startup-timeout','storage-error','render-error','worker-change']);
  let rows=[],timer=null,ready=false,navigation='';
  try{const type=performance.getEntriesByType('navigation')[0]?.type;if(['navigate','reload','back_forward','prerender'].includes(type))navigation=type}catch{}
  try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))rows=saved.slice(-47)}catch{}
  function flush(){clearTimeout(timer);timer=null;try{localStorage.setItem(key,JSON.stringify(rows))}catch{}}
  function record(event,code){
    if(!events.has(event))return;
    const view=document.querySelector('.view.active')?.id;
    rows.push({at:Date.now(),boot,version,event,code:codes.has(code)?code:'',view:/^[A-Za-z]+View$/.test(view||'')?view:'',hidden:document.hidden,online:navigator.onLine,navigation:event==='boot'?navigation:''});
    rows=rows.slice(-48);if(timer===null)timer=setTimeout(flush,300);
  }
  function startupMessage(message){const gate=document.getElementById('bootGate');if(ready||!gate||gate.classList.contains('hidden'))return;const label=gate.querySelector('small');if(label)label.textContent=message}
  const watchdog=setTimeout(()=>{if(!ready){record('startup-timeout');startupMessage('Loading is taking longer than expected. Check your connection.')}},12000);
  window.agntRuntime={record,ready(){if(ready)return;ready=true;clearTimeout(watchdog);record('ready')},export(){return JSON.stringify(rows,null,2)}};
  record('boot');flush();
  window.addEventListener('error',event=>{
    if(event.target?.tagName==='SCRIPT'){clearTimeout(watchdog);record('module-error');startupMessage('AGNT could not load. Check your connection, then close and reopen the app.')}
    else{record('runtime-error',event.error?.name);console.error('Unhandled app error',event.error||event.message);if(!ready){clearTimeout(watchdog);startupMessage('AGNT encountered a startup error. Close and reopen the app.')}}flush();
  },true);
  window.addEventListener('unhandledrejection',event=>{record('promise-error',event.reason?.name);console.error('Unhandled promise rejection',event.reason);flush()});
  document.addEventListener('visibilitychange',()=>{record(document.hidden?'hidden':'visible');if(document.hidden)flush()});
  window.addEventListener('pagehide',()=>{record('pagehide');flush()});window.addEventListener('pageshow',event=>record(event.persisted?'pageshow-restored':'pageshow'));
  window.addEventListener('online',()=>record('online'));window.addEventListener('offline',()=>record('offline'));
  navigator.serviceWorker?.addEventListener('controllerchange',()=>record('worker-change'));
})();
