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
const links=[...document.querySelectorAll('nav a[href^="#"]')];const sections=links.map(a=>document.querySelector(a.getAttribute('href')));
let scheduled=false;function updateNav(){scheduled=false;if(!sections.length)return;let active=sections[0];for(const section of sections)if(section.getBoundingClientRect().top<220)active=section;links.forEach(a=>{const on=a.getAttribute('href')==='#'+active.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateNav);}},{passive:true});updateNav();

// Fine reference guides follow the actual text and image bounds at every size.
const referenceLayout=document.querySelector('.principles-layout');
const referenceGuides=document.querySelector('.reference-links');
const referenceConnections=[
 {from:0,anchor:'title',y:.5,to:'invitation.jpg',x:.43,ty:.34},
 {from:1,anchor:'copy',y:.76,to:'photozone.jpg',x:.12,ty:.83},
 {from:2,anchor:'title',y:.5,to:'folds.jpg',x:.18,ty:.23},
 {from:3,anchor:'copy',y:.26,to:'folds.jpg',x:.29,ty:.84},
 {from:4,anchor:'copy',y:.38,to:'decor-reference-complete.jpg',x:.13,ty:.23},
 {from:4,anchor:'copy',y:.68,to:'identity.jpg',x:.2,ty:.64},
 {from:4,anchor:'copy',y:.92,to:'palette-horizontal-v2.svg',x:.025,ty:.35},
 {from:6,anchor:'copy',y:.66,to:'light-line.jpg',x:.09,ty:.08}
];
function drawReferenceGuides(){
 if(!referenceLayout||!referenceGuides)return;
 const bounds=referenceLayout.getBoundingClientRect();
 referenceGuides.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
 const lines=referenceConnections.map(c=>{
  const source=document.querySelector(`#principle-${c.from} ${c.anchor==='title'?'.component-title':'p'}`);
  const target=referenceLayout.querySelector(`figure[data-ref="${c.to}"] img`);
  if(!source||!target)return '';
  const a=source.getBoundingClientRect(),b=target.getBoundingClientRect();
  const x1=a.right-bounds.left+14,y1=a.top-bounds.top+a.height*c.y;
  const x2=b.left-bounds.left+b.width*c.x,y2=b.top-bounds.top+b.height*c.ty;
  return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`;
 }).join('');
 referenceGuides.innerHTML=lines;
}
let referenceFrame=0;
function scheduleReferenceGuides(){cancelAnimationFrame(referenceFrame);referenceFrame=requestAnimationFrame(drawReferenceGuides);}
if(referenceLayout)new ResizeObserver(scheduleReferenceGuides).observe(referenceLayout);
referenceLayout?.querySelectorAll('img').forEach(img=>img.addEventListener('load',scheduleReferenceGuides));
document.fonts?.ready.then(scheduleReferenceGuides);
window.addEventListener('resize',scheduleReferenceGuides,{passive:true});
scheduleReferenceGuides();
