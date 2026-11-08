(()=>{
const dialog=document.querySelector('#media-viewer'),image=document.querySelector('#media-image'),caption=document.querySelector('#media-caption');
const buttons=[...document.querySelectorAll('.zoom[data-image]')];let current=0,origin=null;
function show(index){current=(index+buttons.length)%buttons.length;const b=buttons[current];image.src=b.dataset.image;image.alt=b.dataset.caption||b.querySelector('img')?.alt||'';caption.textContent=image.alt;}
function close(){dialog.close();document.body.classList.remove('viewer-open');origin?.focus();}
buttons.forEach((b,i)=>b.addEventListener('click',()=>{origin=b;show(i);dialog.showModal();document.body.classList.add('viewer-open');document.querySelector('#viewer-close').focus();}));
document.querySelector('#viewer-close').addEventListener('click',close);
document.querySelector('#viewer-prev').addEventListener('click',()=>show(current-1));document.querySelector('#viewer-next').addEventListener('click',()=>show(current+1));
dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
document.addEventListener('keydown',e=>{if(!dialog.open)return;if(e.key==='ArrowLeft'){e.preventDefault();show(current-1);}if(e.key==='ArrowRight'){e.preventDefault();show(current+1);}});
const plan=document.querySelector('#scenario-plan');
document.querySelectorAll('[data-mode]').forEach(b=>{if(b.tagName!=='BUTTON')return;b.addEventListener('click',()=>{plan.dataset.mode=b.dataset.mode;document.querySelectorAll('.view-switch button').forEach(x=>{const on=x===b;x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on));});});});
document.querySelector('#chapter-select')?.addEventListener('change',e=>{if(e.target.value){const target=document.getElementById(e.target.value);history.replaceState(null,'','#'+e.target.value);target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}});
// Play autoplay reference clips on entry and pause clips outside the viewport.
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
 const video=e.target;
 if(!e.isIntersecting){video.pause();return;}
 if(video.autoplay){video.muted=true;video.play().catch(()=>{});}
}),{threshold:0});
document.querySelectorAll('video').forEach(v=>observer.observe(v));
})();
