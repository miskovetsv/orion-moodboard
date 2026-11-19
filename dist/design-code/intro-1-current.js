(()=>{
  const dialog=document.querySelector('#media-viewer'),image=document.querySelector('#media-image'),caption=document.querySelector('#media-caption');
  const buttons=[...document.querySelectorAll('.keyframe-open[data-image]')];let current=0,origin=null;
  function show(index){current=(index+buttons.length)%buttons.length;const b=buttons[current];image.src=b.dataset.image;image.alt=b.dataset.caption||'';caption.textContent=image.alt;}
  function close(){dialog.close();document.body.classList.remove('viewer-open');origin?.focus();}
  buttons.forEach((b,i)=>b.addEventListener('click',()=>{origin=b;show(i);dialog.showModal();document.body.classList.add('viewer-open');document.querySelector('#viewer-close').focus();}));
  document.querySelector('#viewer-close').addEventListener('click',close);
  document.querySelector('#viewer-prev').addEventListener('click',()=>show(current-1));
  document.querySelector('#viewer-next').addEventListener('click',()=>show(current+1));
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  document.addEventListener('keydown',e=>{if(!dialog.open)return;if(e.key==='ArrowLeft'){e.preventDefault();show(current-1);}if(e.key==='ArrowRight'){e.preventDefault();show(current+1);}});
  document.querySelectorAll('[data-texture]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.texture,items=JSON.parse(document.getElementById('texture-data-'+id).textContent),item=items[+b.dataset.index];
    const img=document.getElementById('texture-'+id);img.src=item.src;img.alt=item.label;
    const zoom=img.closest('button');zoom.dataset.image=item.src;zoom.dataset.caption=item.label;
    document.getElementById('texture-caption-'+id).textContent=item.label;
    b.parentElement.querySelectorAll('button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});
  }));
  document.getElementById('chapter-select').addEventListener('change',e=>{if(e.target.value){document.getElementById(e.target.value).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});history.replaceState(null,'','#'+e.target.value);}});
  const videos=[...document.querySelectorAll('video')];
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
    const v=e.target;
    if(!e.isIntersecting){v.pause();return;}
    if(v.dataset.src){v.querySelector('source').src=v.dataset.src;delete v.dataset.src;v.load();}
    if(v.autoplay&&!matchMedia('(prefers-reduced-motion: reduce)').matches)v.play().catch(()=>{});
  }),{threshold:.1});videos.forEach(v=>observer.observe(v));
})();
