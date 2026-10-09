/* IUS AND SONS — start-up video.
   Plays ONCE when the app/site is started (not on every page), choosing the video by screen orientation:
   portrait (phones) -> ius-portrait.mp4, landscape (desktop/tablet) -> ius-landscape.mp4.
   On every other page/tab the video is never requested. */
(function(){
  const splash=document.getElementById('iusSplash');
  const video=document.getElementById('iusIntroVideo');
  const page=document.getElementById('iusPageAfterIntro')||document.getElementById('iusReportPage');
  window.playIUSIntro=function(){};            // kept for compatibility: no replays
  if(!page) return;
  const SK='ius_intro_played_v2',AK='ius_alive_v2';
  const L={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  const S={get(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}};
  // "Another page of the app is already open" = heartbeat fresher than 6 s.
  const alreadyStarted=S.get(SK)==='1'||(Date.now()-(+L.get(AK)||0))<6000;
  const beat=()=>L.set(AK,String(Date.now()));
  beat();setInterval(beat,2000);addEventListener('pagehide',beat);
  function reveal(){page.classList.add('show')}
  if(!splash||!video||alreadyStarted){if(splash)splash.remove();reveal();return}
  S.set(SK,'1');
  let done=false;
  function finish(){
    if(done)return;done=true;
    splash.classList.add('hide');reveal();setTimeout(()=>splash.remove(),700);
  }
  const portrait=(window.matchMedia&&matchMedia('(orientation: portrait)').matches)||window.innerHeight>window.innerWidth;
  video.muted=true;video.setAttribute('playsinline','');
  video.addEventListener('ended',finish,{once:true});
  video.addEventListener('error',()=>setTimeout(finish,1200),{once:true});
  splash.addEventListener('click',finish);          // tap to skip
  video.src=portrait?'ius-portrait.mp4':'ius-landscape.mp4';
  const pr=video.play();if(pr&&pr.catch)pr.catch(()=>setTimeout(finish,1200));
  setTimeout(finish,9000);                          // safety net
})();
