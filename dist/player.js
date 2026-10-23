const videoFiles=new Map();
const videoLoads=new Map();
function pruneVideoFiles(protectedUrl){
  for(const [key,url] of videoFiles){
    if(videoFiles.size<=3)break;
    if(url!==protectedUrl&&!Array.from(document.querySelectorAll('video')).some(v=>v.src===url)){
      URL.revokeObjectURL(url);videoFiles.delete(key);
    }
  }
}
async function prepareVideoFile(src){
  const key=new URL(src,location.href).href;
  if(videoFiles.has(key)){
    const url=videoFiles.get(key);videoFiles.delete(key);videoFiles.set(key,url);return url;
  }
  if(!videoLoads.has(key)){
    const task=(async()=>{
      const response=await fetch(key);
      if(!response.ok)throw new Error('Video unavailable');
      // Sites currently ignores byte-range requests. A complete local Blob gives
      // native media controls a seekable source, independent of server ranges.
      const blob=await response.blob();
      const url=URL.createObjectURL(blob);
      videoFiles.set(key,url);pruneVideoFiles(url);return url;
    })().finally(()=>videoLoads.delete(key));
    videoLoads.set(key,task);
  }
  return videoLoads.get(key);
}
function playerIcon(name){const shapes={play:'<path d="m8 5 11 7-11 7Z"/>',pause:'<path d="M8 5v14M16 5v14"/>',sound:'<path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',mute:'<path d="m11 4-6 5H2v6h3l6 5Zm5 5 6 6m0-6-6 6"/>',full:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>'};return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name]}</svg>`}
function timeLabel(t){t=Number.isFinite(t)?Math.floor(t):0;return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')}
function attachVideoControls(frame,video){
  const bar=document.createElement('div');bar.className='videoControls';
  bar.innerHTML=`<button class="videoToggle" aria-label="Пауза">${playerIcon('pause')}</button><span class="videoTime">0:00 / ${timeLabel(video.duration)}</span><button class="videoMute" aria-label="Выключить звук">${playerIcon('sound')}</button><button class="videoFull" aria-label="На весь экран">${playerIcon('full')}</button><input class="videoSeek" type="range" min="0" max="${video.duration}" step="0.01" value="0" aria-label="Позиция видео">`;
  frame.append(bar);
  const toggle=bar.querySelector('.videoToggle'),seek=bar.querySelector('.videoSeek'),clock=bar.querySelector('.videoTime'),mute=bar.querySelector('.videoMute');
  const refresh=()=>{const t=video.currentTime;seek.value=t;seek.style.setProperty('--progress',(t/video.duration*100)+'%');seek.setAttribute('aria-valuetext',timeLabel(t)+' из '+timeLabel(video.duration));clock.textContent=timeLabel(t)+' / '+timeLabel(video.duration);toggle.innerHTML=playerIcon(video.paused?'play':'pause');toggle.setAttribute('aria-label',video.paused?'Воспроизвести':'Пауза')};
  const togglePlayback=()=>video.paused?video.play().catch(()=>{}):video.pause();
  toggle.onclick=togglePlayback;video.onclick=togglePlayback;
  seek.addEventListener('input',()=>{video.currentTime=Number(seek.value);refresh()});
  mute.onclick=()=>{video.muted=!video.muted;mute.innerHTML=playerIcon(video.muted?'mute':'sound');mute.setAttribute('aria-label',video.muted?'Включить звук':'Выключить звук')};
  bar.querySelector('.videoFull').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(frame.requestFullscreen)await frame.requestFullscreen();else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen()}catch(error){if(video.webkitEnterFullscreen)video.webkitEnterFullscreen()}};
  ['timeupdate','seeked','play','pause','ended'].forEach(event=>video.addEventListener(event,refresh));refresh();
}
function bindVideoPlayers(){
  pruneVideoFiles();
  document.querySelectorAll('[data-video-start]').forEach(button=>{
    button.onclick=async()=>{
      if(button.disabled)return;
      const frame=button.closest('.videoPlayer'),video=frame.querySelector('video'),status=frame.querySelector('.videoStatus');
      button.disabled=true;button.setAttribute('aria-busy','true');
      button.innerHTML=icon('play');status.textContent='Подготовка видео…';
      try{
        const url=await prepareVideoFile(video.dataset.mediaSrc);
        if(!video.isConnected)return;
        await new Promise((resolve,reject)=>{
          video.addEventListener('loadedmetadata',resolve,{once:true});
          video.addEventListener('error',reject,{once:true});
          video.src=url;video.load();
        });
        video.controls=false;button.remove();status.remove();attachVideoControls(frame,video);
        await video.play().catch(()=>{});
      }catch(error){
        if(!button.isConnected)return;
        button.disabled=false;button.removeAttribute('aria-busy');
        button.innerHTML=icon('play');button.setAttribute('aria-label','Повторить загрузку видео');
        status.textContent='Не удалось открыть видео. Нажмите ещё раз.';
      }
    };
  });
}
