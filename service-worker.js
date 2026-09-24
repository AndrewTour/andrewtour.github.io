const RELEASE='1.44.6-property-link';
const CACHE=`agnt-v${RELEASE}`;
const SDK_CACHE='agnt-sdk-11.10.0';
const SDK_BASE='https://www.gstatic.com/firebasejs/11.10.0/';
const SDK=['firebase-app.js','firebase-auth.js','firebase-firestore.js'].map(name=>SDK_BASE+name);
const ASSETS=['./index.html',`./styles.css?v=${RELEASE}`,`./cleanup.css?v=${RELEASE}`,`./app.js?v=${RELEASE}`,`./runtime.js?v=${RELEASE}`,'./firebase-config.js','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];
async function boundedFetch(request,options={}){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  try{const response=await fetch(request,{...options,signal:controller.signal});if(!response.ok)throw new Error('Asset request failed');return response}finally{clearTimeout(timeout)}
}
// Complete the release before activation. A running document keeps its old worker.
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await Promise.all(ASSETS.map(async path=>{
    const response=await boundedFetch(new URL(path,self.location.href).href,{cache:'reload'});
    if(path==='./index.html'&&!(await response.clone().text()).includes(`app.js?v=${RELEASE}`))throw new Error('Release HTML mismatch');
    if(path.startsWith('./app.js?')&&!(await response.clone().text()).includes("appVersion:'1.44.6'"))throw new Error('Release script mismatch');
    if(path.startsWith('./runtime.js?')&&!(await response.clone().text()).includes("version='1.44.6'"))throw new Error('Runtime script mismatch');
    await cache.put(path,response);
  }));
  const sdkCache=await caches.open(SDK_CACHE);
  await Promise.all(SDK.map(async url=>{if(!await sdkCache.match(url))await sdkCache.put(url,await boundedFetch(url,{mode:'cors'}))}));
})()));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>/^agnt-v\d/.test(key)&&key!==CACHE).map(key=>caches.delete(key))))));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(SDK.includes(url.href)){
    event.respondWith((async()=>{const cache=await caches.open(SDK_CACHE),cached=await cache.match(url.href);if(cached)return cached;const response=await boundedFetch(event.request);event.waitUntil(cache.put(url.href,response.clone()).catch(error=>console.warn('SDK cache write failed',error)));return response})());return;
  }
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    // Serve one complete installed release, even with a slow or failing connection.
    event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match('./index.html');if(cached)return cached;
      try{return await boundedFetch(event.request)}catch{return new Response('AGNT is unavailable offline. Reconnect and reopen the app.',{status:503,headers:{'Content-Type':'text/plain'}})}
    })());return;
  }
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request))||fetch(event.request)));
});
