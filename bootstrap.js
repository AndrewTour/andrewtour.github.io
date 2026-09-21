/* Runs before Firebase imports so startup failures remain visible and diagnosable. */
(()=>{
  'use strict';
  const version='1.41.40',key='agnt:runtime-diagnostics',boot=Date.now().toString(36);
  let entries=[],ready=false,flushTimer=null;
  try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))entries=saved.slice(-39)}catch{}
  function flush(){clearTimeout(flushTimer);flushTimer=null;try{localStorage.setItem(key,JSON.stringify(entries))}catch{}}
  function record(event,code=''){
    // No messages, URLs, names, IDs, contact details or form content are captured.
    const allowedCodes=new Set(['Error','TypeError','RangeError','ReferenceError','SyntaxError','SecurityError','QuotaExceededError','AbortError','navigate','reload','back_forward','prerender']);
    const view=document.querySelector('.view.active')?.id||'';
    entries.push({at:Date.now(),boot,version,event:String(event).slice(0,40),code:allowedCodes.has(code)?code:'',view:/^[a-zA-Z]+View$/.test(view)?view:'',hidden:document.hidden,online:navigator.onLine});
    entries=entries.slice(-40);clearTimeout(flushTimer);flushTimer=setTimeout(flush,250);
  }
  const timeout=setTimeout(()=>{
    if(ready)return;record('startup-timeout');
    const gate=document.getElementById('bootGate');
    if(gate&&!gate.classList.contains('hidden')){const label=gate.querySelector('small');if(label)label.textContent='Loading is taking longer than expected. Check your connection.'}
  },12000);
  window.agntRuntime={record,ready(){if(ready)return;ready=true;clearTimeout(timeout);record('ready')},export(){return JSON.stringify(entries,null,2)}};
  record('boot',performance.getEntriesByType('navigation')[0]?.type);flush();
  window.addEventListener('error',event=>{record('runtime-error',event.error?.name);console.error('Unhandled app error',event.error||event.message);flush()});
  window.addEventListener('unhandledrejection',event=>{record('promise-rejection',event.reason?.name);console.error('Unhandled promise rejection',event.reason);flush()});
  document.addEventListener('visibilitychange',()=>{record(document.hidden?'hidden':'visible');if(document.hidden)flush()});
  window.addEventListener('pagehide',()=>{record('pagehide');flush()});
  window.addEventListener('pageshow',event=>record(event.persisted?'pageshow-restored':'pageshow'));
  window.addEventListener('online',()=>record('online'));window.addEventListener('offline',()=>record('offline'));
  if('serviceWorker'in navigator){
    navigator.serviceWorker.addEventListener('controllerchange',()=>record('worker-controller-change'));
    const register=async()=>{try{const reg=await navigator.serviceWorker.register('./service-worker.js');await reg.update();record(reg.waiting?'worker-waiting':'worker-checked')}catch(error){record('worker-error',error?.name);console.warn('Offline cache registration failed',error)}};
    if(document.readyState==='complete')register();else window.addEventListener('load',register,{once:true});
  }
  import('./app.js?v=1.41.40-runtime-stability').catch(error=>{
    clearTimeout(timeout);record('module-load-failed',error?.name);flush();console.error('AGNT module could not load',error);
    const gate=document.getElementById('bootGate'),label=gate?.querySelector('small');
    if(gate&&!gate.classList.contains('hidden')&&label)label.textContent='AGNT could not load. Check your connection, then close and reopen the app.';
  });
})();
