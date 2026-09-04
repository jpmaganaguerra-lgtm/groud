(function(){

/* ---------- PRELOADER ---------- */
let progress = 0;
const preEl = document.getElementById('preloader');
const preCount = document.getElementById('pre-count');
const preBar = document.getElementById('pre-bar-fill');
document.documentElement.classList.add('no-scroll');
const preInt = setInterval(()=>{
  progress += Math.random()*14;
  if(progress>=100){
    progress = 100;
    clearInterval(preInt);
    preCount.textContent = '100%';
    preBar.style.width = '100%';
    setTimeout(()=>{
      preEl.classList.add('hide');
      document.documentElement.classList.remove('no-scroll');
      startEntrance();
    }, 350);
  } else {
    preCount.textContent = Math.floor(progress)+'%';
    preBar.style.width = progress+'%';
  }
}, 110);

/* ---------- CURSOR ----------
   Velocidad de seguimiento (lerp). Antes: 0.18. Acelerado 70%: 0.18 * 1.7 ≈ 0.31.
   Sube este número para que el cursor "alcance" al mouse más rápido. */
const CURSOR_SPEED = 0.31;
const cursor = document.getElementById('cursor');
const cursorText = document.getElementById('cursor-text');
let mx=window.innerWidth/2, my=window.innerHeight/2, cx=mx, cy=my;
window.addEventListener('mousemove', e=>{mx=e.clientX; my=e.clientY;});
function loopCursor(){
  cx += (mx-cx)*CURSOR_SPEED; cy += (my-cy)*CURSOR_SPEED;
  cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
  requestAnimationFrame(loopCursor);
}
loopCursor();
document.querySelectorAll('a, button, .camp-card, input, textarea, .exp-card').forEach(el=>{
  el.addEventListener('mouseenter', ()=>{
    cursor.classList.add('big');
    cursorText.textContent = el.getAttribute('data-cursor') || (el.classList.contains('camp-card') ? 'Ver' : '');
  });
  el.addEventListener('mouseleave', ()=>{
    cursor.classList.remove('big');
    cursorText.textContent='';
  });
});

/* ---------- GRAIN ---------- */
const grainCanvas = document.getElementById('grain');
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
function grainLoop(){
  grainFrame++;
  if(grainFrame % 3 === 0) drawGrain();
  requestAnimationFrame(grainLoop);
}
grainLoop();
window.addEventListener('resize', sizeGrain);

/* ---------- MENU ---------- */
const menuToggle = document.getElementById('menu-toggle');
menuToggle.addEventListener('click', ()=>{
  document.body.classList.toggle('menu-open');
});
document.querySelectorAll('.menu-link').forEach(a=>{
  a.addEventListener('click', ()=>{ document.body.classList.remove('menu-open'); });
});

/* ---------- ASSET FALLBACKS ----------
   Si existe una imagen en /assets/images/... la mostramos por encima del
   visual generativo. Si no existe (404), la dejamos oculta y no rompe nada. */
function tryImage(imgEl){
  if(!imgEl) return;
  const src = imgEl.getAttribute('data-src');
  const probe = new Image();
  probe.onload = ()=>{ imgEl.src = src; imgEl.style.display='block'; };
  probe.onerror = ()=>{ imgEl.style.display='none'; };
  probe.src = src;
}
tryImage(document.getElementById('hero-bg-img'));

/* ---------- HERO CANVAS: constelación ---------- */
const heroCanvas = document.getElementById('hero-canvas');
const hctx = heroCanvas.getContext('2d');
let hw, hh, pts=[];
function sizeHero(){
  hw = heroCanvas.width = heroCanvas.offsetWidth;
  hh = heroCanvas.height = heroCanvas.offsetHeight;
  const count = Math.max(30, Math.floor((hw*hh)/26000));
  pts = Array.from({length:count}, ()=>({
    x:Math.random()*hw, y:Math.random()*hh,
    vx:(Math.random()-0.5)*0.25, vy:(Math.random()-0.5)*0.25
  }));
}
sizeHero();
window.addEventListener('resize', sizeHero);
function drawHero(){
  hctx.clearRect(0,0,hw,hh);
  for(const p of pts){
    p.x += p.vx; p.y += p.vy;
    if(p.x<0||p.x>hw) p.vx*=-1;
    if(p.y<0||p.y>hh) p.vy*=-1;
  }
  for(let i=0;i<pts.length;i++){
    for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<120){
        hctx.strokeStyle = `rgba(168,90,116,${0.16*(1-d/120)})`;
        hctx.lineWidth=1;
        hctx.beginPath(); hctx.moveTo(pts[i].x,pts[i].y); hctx.lineTo(pts[j].x,pts[j].y); hctx.stroke();
      }
    }
  }
  hctx.fillStyle='rgba(250,249,244,0.6)';
  for(const p of pts){ hctx.beginPath(); hctx.arc(p.x,p.y,1.4,0,Math.PI*2); hctx.fill(); }
  requestAnimationFrame(drawHero);
}
drawHero();

/* ---------- CAMPAIGN CANVAS PATTERNS (generativo) ---------- */
function paintPattern(canvas, type){
  function draw(){
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    const palettes = [
      ['#111310','#1c2a20','#04CE03'],
      ['#111310','#2a1c22','#A85A74'],
      ['#111310','#1c2420','#04CE03'],
      ['#111310','#241c22','#A85A74']
    ];
    const pal = palettes[type % palettes.length];
    const grd = ctx.createLinearGradient(0,0,w,h);
    grd.addColorStop(0, pal[0]); grd.addColorStop(1, pal[1]);
    ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = pal[2]; ctx.globalAlpha=0.4;
    const n = 14;
    if(type % 4 === 0){
      for(let i=0;i<n;i++){
        ctx.beginPath();
        ctx.arc(w*0.5, h*0.5, (i+1)*(w/n/1.6), 0, Math.PI*2);
        ctx.stroke();
      }
    } else if(type % 4 === 1){
      for(let i=0;i<n;i++){
        ctx.beginPath();
        ctx.moveTo(0, (i/n)*h + (Math.sin(i)*20));
        ctx.lineTo(w, (i/n)*h - (Math.sin(i)*20));
        ctx.stroke();
      }
    } else if(type % 4 === 2){
      for(let i=0;i<24;i++){
        ctx.beginPath();
        const x = Math.random()*w, y=Math.random()*h, r=Math.random()*60+10;
        ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();
      }
    } else {
      const step = w/12;
      for(let i=0;i<12;i++){
        ctx.beginPath();
        ctx.moveTo(i*step, 0); ctx.lineTo(i*step + h*0.4, h);
        ctx.stroke();
      }
    }
    ctx.globalAlpha=1;
  }
  draw();
  window.addEventListener('resize', draw);
}
document.querySelectorAll('.cvis[data-pattern]').forEach(c=>{
  paintPattern(c, parseInt(c.getAttribute('data-pattern')));
});
/* imágenes opcionales de campañas: si existen en /assets/images/campaigns/, se muestran encima del canvas */
document.querySelectorAll('.camp-card').forEach(card=>{
  const img = card.querySelector('.cvis-img');
  tryImage(img);
});

/* ---------- CAMPAIGN DATA + OVERLAY ---------- */
const campaigns = [
  {
    num:'Campaign 01', title:'El algoritmo no te ama',
    insight:'Las marcas optimizan cada palabra para robots de búsqueda y olvidan que, al final, quien decide comprar es una persona.',
    idea:'Una campaña que expone, con humor, cuánto contenido está escrito para máquinas — y le devuelve la voz humana a la marca sin perder visibilidad.',
    visual:'Tipografía robótica que se "rompe" y se vuelve manuscrita conforme avanza el scroll. Paleta fría de terminal que se calienta hacia tonos humanos.',
    channels:['SEO','GEO','Contenido','Paid Search','Social']
  },
  {
    num:'Campaign 02', title:'Cuarto lento',
    insight:'El turismo de Instagram llenó los hoteles boutique de huéspedes que van por la foto, no por la experiencia — y eso erosiona la marca.',
    idea:'Una campaña anti-algoritmo para hospitalidad: habitaciones que no se pueden reservar hasta apagar las notificaciones por 24 horas.',
    visual:'Fotografía en cámara lenta, texturas de madera y lino, tipografía manuscrita cálida. Todo se mueve más despacio de lo esperado.',
    channels:['Brand campaign','PR','Partnerships','Email','Experiencial']
  },
  {
    num:'Campaign 03', title:'Impuesto al ruido',
    insight:'Cada marca compite por gritar más fuerte. La atención se volvió el recurso más caro y más desperdiciado del marketing.',
    idea:'Una marca "cobra" simbólicamente a sus propios anuncios por cada segundo de atención que piden — y muestra el recibo en tiempo real.',
    visual:'Estética de recibo fiscal / terminal de punto de venta. Números corriendo, tipografía monoespaciada, acentos de marca.',
    channels:['Paid Social','OOH','Sitio interactivo','PR']
  },
  {
    num:'Campaign 04', title:'Crecer en voz alta',
    insight:'El marketing discreto no existe — solo el que nadie recuerda. Las marcas tímidas se quedan sin presupuesto para el próximo trimestre.',
    idea:'El manifiesto de Groud llevado a formato campaña: afirmaciones directas sobre crecimiento, sin eufemismos corporativos, en formato billboard digital.',
    visual:'Tipografía enorme, alto contraste, verde y rosa de marca. Cada frase ocupa toda la pantalla, sin distracción.',
    channels:['Brand film','Social','OOH digital','Sitio']
  }
];

const overlay = document.getElementById('camp-overlay');
const coCanvas = document.getElementById('co-canvas');
const coImg = document.getElementById('co-canvas-img');
document.querySelectorAll('.camp-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    const i = parseInt(card.getAttribute('data-campaign'));
    const c = campaigns[i];
    document.getElementById('co-num').textContent = c.num;
    document.getElementById('co-title').textContent = c.title;
    document.getElementById('co-insight').textContent = c.insight;
    document.getElementById('co-idea').textContent = c.idea;
    document.getElementById('co-visual').textContent = c.visual;
    const chipsEl = document.getElementById('co-channels');
    chipsEl.innerHTML='';
    c.channels.forEach(ch=>{
      const s = document.createElement('span');
      s.className='chip'; s.textContent=ch;
      chipsEl.appendChild(s);
    });
    paintPattern(coCanvas, i);
    if(coImg){
      coImg.setAttribute('data-src', `assets/images/campaigns/campaign-0${i+1}.jpg`);
      tryImage(coImg);
    }
    overlay.classList.add('open');
    document.body.classList.add('no-scroll');
  });
});
document.getElementById('co-close').addEventListener('click', ()=>{
  overlay.classList.remove('open');
  document.body.classList.remove('no-scroll');
});

/* ---------- ORBIT NODE POSITIONS ---------- */
function placeOrbit(){
  const orbit = document.getElementById('orbit');
  if(!orbit) return;
  const r = orbit.offsetWidth/2;
  const nodes = orbit.querySelectorAll('.orbit-node');
  const angles = [-90, -18, 54, 126, 198];
  nodes.forEach((n,i)=>{
    const a = angles[i] * Math.PI/180;
    const x = r + Math.cos(a)*(r*0.86);
    const y = r + Math.sin(a)*(r*0.86);
    n.style.left = x+'px'; n.style.top = y+'px';
  });
}
placeOrbit();
window.addEventListener('resize', placeOrbit);

/* ---------- FORM FLOATING LABELS ---------- */
document.querySelectorAll('.field input, .field textarea').forEach(el=>{
  el.addEventListener('input', ()=>{
    el.closest('.field').classList.toggle('filled', el.value.length>0);
  });
});

/* ---------- CONTACT DISTORT ---------- */
document.querySelectorAll('.contact-title .distort').forEach(el=>{
  el.addEventListener('mousemove', e=>{
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left)/r.width - 0.5;
    el.style.transform = `translateX(${px*14}px) skewX(${px*-6}deg)`;
    el.style.color = 'var(--pink)';
  });
  el.addEventListener('mouseleave', ()=>{
    el.style.transform=''; el.style.color='';
  });
});

/* ---------- ENTRANCE + SCROLL ANIMATIONS ---------- */
function startEntrance(){
  gsap.registerPlugin(ScrollTrigger);

  gsap.fromTo('.hero-title', {yPercent:14, opacity:0}, {yPercent:0, opacity:1, duration:1.3, ease:'power3.out'});
  gsap.fromTo('.hero-sub', {opacity:0}, {opacity:1, duration:1, delay:.4, ease:'power2.out'});
  gsap.fromTo('.hero-bottom', {opacity:0, y:20}, {opacity:1, y:0, duration:1, delay:.6, ease:'power2.out'});

  document.querySelectorAll('.reveal').forEach(el=>{
    ScrollTrigger.create({
      trigger: el, start:'top 85%',
      onEnter: ()=> el.classList.add('in'),
    });
  });

  document.querySelectorAll('.tline').forEach((el,i)=>{
    ScrollTrigger.create({
      trigger: el, start:'top 88%',
      onEnter: ()=> setTimeout(()=> el.classList.add('in'), i*140),
    });
  });

  /* SYSTEM pinned stages */
  const stagePanels = gsap.utils.toArray('.stage-panel');
  const dots = gsap.utils.toArray('.stage-index i');

  ScrollTrigger.matchMedia({
    "(min-width: 761px)": function(){
      ScrollTrigger.create({
        trigger: '#s-system',
        start: 'top top',
        end: '+=280%',
        pin: '#system-pin',
        scrub: 0.6,
        snap: 1/(stagePanels.length-1),
        onUpdate: self=>{
          const idx = Math.min(stagePanels.length-1, Math.floor(self.progress * stagePanels.length));
          stagePanels.forEach((p,i)=> p.classList.toggle('on', i===idx));
          dots.forEach((d,i)=> d.classList.toggle('on', i===idx));
        }
      });

      /* CAMPAIGNS horizontal scroll */
      const track = document.getElementById('camp-track');
      ScrollTrigger.create({
        trigger: '#s-camp',
        start: 'top top',
        end: () => '+=' + (track.scrollWidth - window.innerWidth + 200),
        pin: '#camp-pin',
        scrub: 0.6,
        onUpdate: self=>{
          const x = -(track.scrollWidth - window.innerWidth + 200) * self.progress;
          track.style.transform = `translateX(${x}px)`;
        }
      });
    },
    "(max-width: 760px)": function(){
      stagePanels.forEach(p=>p.classList.add('on'));
      dots.forEach(d=>d.classList.add('on'));
    }
  });
}

})();
