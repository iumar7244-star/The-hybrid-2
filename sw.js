const CACHE='ius-sons-offline-v2';
const FILES=["./", "index.html", "auth.html", "dashboard.html", "report.html", "admin.html", "styles.css", "intro.js", "auth.js", "dashboard.js", "report.js", "admin.js", "config.js", "pwa.js", "logo.png", "ius-portrait.mp4", "ius-landscape.mp4", "manifest.json", "icon-192.png", "icon-512.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>hit||fetch(e.request).catch(()=>caches.match('index.html'))));
});
