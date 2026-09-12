(function(){

/* ---------- CURSOR (igual que el sitio principal) ---------- */
const CURSOR_SPEED = 0.31;
const cursor = document.getElementById('cursor');
let mx=window.innerWidth/2, my=window.innerHeight/2, cx=mx, cy=my;
window.addEventListener('mousemove', e=>{mx=e.clientX; my=e.clientY;});
function loopCursor(){
  cx += (mx-cx)*CURSOR_SPEED; cy += (my-cy)*CURSOR_SPEED;
  if(cursor) cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
  requestAnimationFrame(loopCursor);
}
loopCursor();
document.querySelectorAll('.pillar-card, .feature-card, .contrast-card, .stat-tile').forEach(el=>{
  el.addEventListener('mouseenter', ()=> cursor && cursor.classList.add('big'));
  el.addEventListener('mouseleave', ()=> cursor && cursor.classList.remove('big'));
});

/* ---------- GRAIN (igual que el sitio principal) ---------- */
const grainCanvas = document.getElementById('grain');
if(grainCanvas){
  const gctx = grainCanvas.getContext('2d');
  function sizeGrain(){ grainCanvas.width = window.innerWidth; grainCanvas.height = window.innerHeight; }
  sizeGrain();
  function drawGrain(){
    const w = grainCanvas.width, h = grainCanvas.height;
    const imgData = gctx.createImageData(w,h);
    const buffer = new Uint32Array(imgData.data.buffer);
    for(let i=0;i<buffer.length;i++){
      if(Math.random() < 0.5) buffer[i] = 0xff000000 | (Math.random()*255)<<16 | (Math.random()*255)<<8 | (Math.random()*255);
    }
    gctx.putImageData(imgData,0,0);
  }
  let grainFrame=0;
  function grainLoop(){ grainFrame++; if(grainFrame % 3 === 0) drawGrain(); requestAnimationFrame(grainLoop); }
  grainLoop();
  window.addEventListener('resize', sizeGrain);
}

/* ---------- IMÁGENES OPCIONALES (fallback si no existe el archivo) ---------- */
function tryImage(imgEl){
  if(!imgEl) return;
  const src = imgEl.getAttribute('data-src');
  if(!src) return;
  const probe = new Image();
  probe.onload = ()=>{ imgEl.src = src; imgEl.style.display='block'; };
  probe.onerror = ()=>{ imgEl.style.display='none'; };
  probe.src = src;
}
document.querySelectorAll('img[data-src]').forEach(tryImage);

/* ---------- PATRÓN GENERATIVO DE RESPALDO PARA IMÁGENES (mismo lenguaje que Campaigns) ---------- */
function paintPattern(canvas, type){
  function draw(){
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    const palettes = [ ['#111310','#1c2a20','#088F44'], ['#111310','#2a1c22','#A85A74'] ];
    const pal = palettes[type % palettes.length];
    const grd = ctx.createLinearGradient(0,0,w,h);
    grd.addColorStop(0, pal[0]); grd.addColorStop(1, pal[1]);
    ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = pal[2]; ctx.globalAlpha=0.45;
    for(let i=0;i<14;i++){
      ctx.beginPath();
      ctx.arc(w*0.5, h*0.42, (i+1)*(w/16), 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
  draw();
  window.addEventListener('resize', draw);
}
document.querySelectorAll('.ph-pattern[data-pattern]').forEach(c=>{
  paintPattern(c, parseInt(c.getAttribute('data-pattern')));
});

/* ---------- LETTER REVEAL: divide el texto en letras para animarlas una por una ---------- */
document.querySelectorAll('.letter-reveal').forEach(el=>{
  const text = el.textContent;
  el.innerHTML = text.split('').map(ch=>{
    const cls = ch === '.' ? 'lr-letter is-dot' : 'lr-letter';
    return `<span class="${cls}">${ch === ' ' ? '&nbsp;' : ch}</span>`;
  }).join('');
});

/* ---------- REVEAL ENGINE (GSAP + ScrollTrigger, igual motor que el sitio) ---------- */
function start(){
  if(typeof gsap === 'undefined'){
    // Si el CDN no carga, mostramos todo directo (degradación segura)
    document.querySelectorAll('.reveal, .tline, .bar-fill, .budget-fill, .price-step-bar').forEach(el=>{
      el.classList.add('in'); el.classList.add('on');
    });
    document.querySelectorAll('.letter-reveal .lr-letter').forEach(el=> el.style.opacity=1);
    document.querySelectorAll('.letter-reveal').forEach(el=> el.classList.add('dot-live'));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.reveal').forEach(el=>{
    ScrollTrigger.create({ trigger: el, start:'top 85%', onEnter: ()=> el.classList.add('in') });
  });

  document.querySelectorAll('.tline').forEach((el,i)=>{
    ScrollTrigger.create({
      trigger: el, start:'top 88%',
      onEnter: ()=> setTimeout(()=> el.classList.add('in'), i*140)
    });
  });

  /* Letter reveal: si es .on-load anima de inmediato (hero), si no, al entrar en foco */
  document.querySelectorAll('.letter-reveal').forEach(el=>{
    const letters = el.querySelectorAll('.lr-letter');
    const anim = ()=>{
      gsap.to(letters, {
        opacity:1, y:0, duration:.7, stagger:0.045, ease:'power3.out',
        onComplete: ()=> el.classList.add('dot-live')
      });
    };
    if(el.classList.contains('on-load')){
      gsap.set(letters, {y:'0.5em'});
      setTimeout(anim, 200);
    } else {
      ScrollTrigger.create({ trigger: el, start:'top 82%', onEnter: anim });
    }
  });

  /* Barras (benchmark + presupuesto): animan su ancho real al entrar en foco */
  document.querySelectorAll('.bar-fill, .budget-fill').forEach(el=>{
    const pct = el.getAttribute('data-pct') || '0';
    ScrollTrigger.create({
      trigger: el, start:'top 90%',
      onEnter: ()=>{ el.style.width = pct + '%'; }
    });
  });

  /* Escalera de precio: animan su altura */
  document.querySelectorAll('.price-step-bar').forEach(el=>{
    const pct = el.getAttribute('data-pct') || '0';
    ScrollTrigger.create({
      trigger: el, start:'top 92%',
      onEnter: ()=>{ el.style.height = pct + '%'; }
    });
  });

  /* Stagger en grids (stats, features, contraste, funnel, canales, pilares, timeline) */
  document.querySelectorAll('[data-stagger]').forEach(group=>{
    const items = group.children;
    ScrollTrigger.create({
      trigger: group, start:'top 85%',
      onEnter: ()=> gsap.fromTo(items, {opacity:0, y:18}, {opacity:1, y:0, duration:.6, stagger:0.08, ease:'power3.out'})
    });
  });
}

if(document.readyState === 'complete' || document.readyState === 'interactive'){
  setTimeout(start, 50);
} else {
  document.addEventListener('DOMContentLoaded', start);
}

})();
