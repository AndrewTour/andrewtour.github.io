const CACHE='agnt-v1.41.40-runtime-stability';
const SDK_CACHE='agnt-firebase-11.10.0';
const SDK_BASE='https://www.gstatic.com/firebasejs/11.10.0/';
const SDK_ASSETS=['firebase-app.js','firebase-auth.js','firebase-firestore.js'].map(name=>SDK_BASE+name);
const ASSETS=['./','./index.html','./styles.css?v=1.41.40-runtime-stability','./app.js?v=1.41.40-runtime-stability','./bootstrap.js?v=1.41.40-runtime-stability','./cleanup.css?v=1.41.40-runtime-stability','./firebase-config.js','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];
// Do not take over a running app. Activate the complete release after old clients close.
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);await cache.addAll(ASSETS);
  const sdk=await caches.open(SDK_CACHE);
  await Promise.all(SDK_ASSETS.map(async url=>{if(!await sdk.match(url)){const response=await fetch(url,{mode:'cors'});if(!response.ok)throw new Error('Firebase offline cache unavailable');await sdk.put(url,response)}}));
})()));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('agnt-')&&key!==CACHE&&key!==SDK_CACHE).map(key=>caches.delete(key))))));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(SDK_ASSETS.includes(url.href)){
    event.respondWith(caches.open(SDK_CACHE).then(async cache=>{
      const cached=await cache.match(url.href);if(cached)return cached;
      const response=await fetch(event.request);if(response.ok)event.waitUntil(cache.put(url.href,response.clone()).catch(error=>console.warn('SDK cache write failed',error)));return response;
    }));return;
  }
  if(url.origin!==self.location.origin)return;
  // Cached HTML and assets belong to the same installed release. No network race.
  if(event.request.mode==='navigate'){
    event.respondWith(caches.open(CACHE).then(async cache=>{
      const cached=await cache.match('./index.html');return cached||fetch(event.request);
    }));return;
  }
  // Do not put arbitrary requests or assets from other releases into this cache.
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request))||fetch(event.request)));
});
