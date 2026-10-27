const viewer=document.querySelector('#viewer'),viewerImage=document.querySelector('#viewer-image'),caption=document.querySelector('#viewer-caption');
const figures=[...document.querySelectorAll('figure[data-ref]')];let current=0,origin=null;
function showRef(index){current=(index+figures.length)%figures.length;const figure=figures[current],img=figure.querySelector('img');viewerImage.src=img.src;viewerImage.alt=img.alt;caption.textContent=figure.querySelector('figcaption').textContent;}
figures.forEach((figure,index)=>figure.querySelector('button').addEventListener('click',()=>{origin=document.activeElement;showRef(index);viewer.showModal();document.body.style.overflow='hidden';document.querySelector('#close-viewer').focus();}));
function closeRef(){viewer.close();document.body.style.overflow='';origin?.focus();}
document.querySelector('#close-viewer').addEventListener('click',closeRef);
viewer.addEventListener('cancel',e=>{e.preventDefault();closeRef();});
viewer.addEventListener('click',e=>{if(e.target===viewer)closeRef();});
document.querySelector('.viewer-prev').addEventListener('click',()=>showRef(current-1));document.querySelector('.viewer-next').addEventListener('click',()=>showRef(current+1));
document.addEventListener('keydown',e=>{if(!viewer.open)return;if(e.key==='ArrowRight'){e.preventDefault();showRef(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();showRef(current-1);}});
const links=[...document.querySelectorAll('nav a')];const sections=links.map(a=>document.querySelector(a.getAttribute('href')));
let scheduled=false;function updateNav(){scheduled=false;let active=sections[0];for(const section of sections)if(section.getBoundingClientRect().top<220)active=section;links.forEach(a=>{const on=a.getAttribute('href')==='#'+active.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateNav);}},{passive:true});updateNav();
