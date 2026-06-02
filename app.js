/* ============================================
   NEUROFUND — Interactive Features
   ============================================ */
(function(){
  'use strict';

  /* ---- Neural Network Canvas ---- */
  const cvs=document.getElementById('heroCanvas');
  if(cvs){
    const ctx=cvs.getContext('2d');
    let nodes=[],mx=0,my=0;
    function resize(){cvs.width=cvs.offsetWidth;cvs.height=cvs.offsetHeight}
    function makeNodes(){
      nodes=[];
      const n=Math.floor(cvs.width*cvs.height/16000);
      for(let i=0;i<n;i++) nodes.push({x:Math.random()*cvs.width,y:Math.random()*cvs.height,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.4+.7});
    }
    function draw(){
      ctx.clearRect(0,0,cvs.width,cvs.height);
      for(let i=0;i<nodes.length;i++){
        const a=nodes[i];
        const dx=mx-a.x,dy=my-a.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<180){const f=(180-d)/180*.007;a.vx+=dx*f;a.vy+=dy*f}
        a.x+=a.vx;a.y+=a.vy;a.vx*=.99;a.vy*=.99;
        if(a.x<0)a.x=cvs.width;if(a.x>cvs.width)a.x=0;
        if(a.y<0)a.y=cvs.height;if(a.y>cvs.height)a.y=0;
        for(let j=i+1;j<nodes.length;j++){
          const b=nodes[j],ddx=a.x-b.x,ddy=a.y-b.y,dd=Math.sqrt(ddx*ddx+ddy*ddy);
          if(dd<110){
            ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
            ctx.strokeStyle=`rgba(0,212,170,${(1-dd/110)*.12})`;ctx.lineWidth=.5;ctx.stroke();
          }
        }
        ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fillStyle='rgba(0,212,170,.45)';ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    resize();makeNodes();draw();
    window.addEventListener('resize',()=>{resize();makeNodes()});
    document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
    document.addEventListener('touchmove',e=>{mx=e.touches[0].clientX;my=e.touches[0].clientY},{passive:true});
  }

  /* ---- Counter Animation ---- */
  function countUp(el){
    const target=parseFloat(el.dataset.target);
    const prefix=el.dataset.prefix||'';
    const suffix=el.dataset.suffix||'';
    const comma=el.dataset.comma==='true';
    const dec=el.dataset.decimal==='true';
    const dur=1800,t0=performance.now();
    (function tick(now){
      const p=Math.min((now-t0)/dur,1);
      const ease=1-Math.pow(1-p,3);
      let v=target*ease;
      if(comma)v=Math.floor(v).toLocaleString();
      else if(dec)v=v.toFixed(1);
      else v=Math.floor(v).toLocaleString();
      el.textContent=prefix+v+suffix;
      if(p<1)requestAnimationFrame(tick);
    })(t0);
  }

  /* ---- Donut Chart ---- */
  function drawDonut(){
    const c=document.getElementById('tokCanvas');
    if(!c)return;
    const ctx=c.getContext('2d'),cx=150,cy=150,oR=130,iR=85;
    const segs=[{p:50,c:'#00D4AA'},{p:20,c:'#F5A623'},{p:15,c:'#6366f1'},{p:15,c:'#8b5cf6'}];
    const dur=1400,t0=performance.now();
    (function draw(now){
      const p=Math.min((now-t0)/dur,1),ease=1-Math.pow(1-p,3);
      ctx.clearRect(0,0,300,300);
      let ang=-Math.PI/2;const gap=.03;
      segs.forEach(s=>{
        const sw=(s.p/100)*Math.PI*2*ease;
        ctx.beginPath();ctx.arc(cx,cy,oR,ang+gap/2,ang+sw-gap/2);
        ctx.arc(cx,cy,iR,ang+sw-gap/2,ang+gap/2,true);ctx.closePath();
        ctx.fillStyle=s.c;ctx.fill();
        ang+=(s.p/100)*Math.PI*2;
      });
      if(p<1)requestAnimationFrame(draw);
    })(t0);
  }

  /* ---- Performance Chart ---- */
  function drawPerf(){
    const c=document.getElementById('perfCanvas');
    if(!c)return;
    const ctx=c.getContext('2d');
    c.width=c.offsetWidth*2;c.height=360;ctx.scale(2,2);
    const w=c.offsetWidth,h=180,pad={t:16,r:16,b:28,l:52};
    const data=[0,12,28,35,52,48,67,89,95,118,142,155,178,210,245,278,310,342,389,425,468,510,567,612,678,721,780,834,891];
    const labels=['Jan','','','Apr','','','Jul','','','Oct','','','Jan','','','Apr','','','Jul','','','Oct','','','Jan','','','Apr',''];
    const cw=w-pad.l-pad.r,ch=h-pad.t-pad.b,mx=Math.max(...data)*1.1;

    // grid
    ctx.strokeStyle='rgba(26,39,68,.7)';ctx.lineWidth=.5;
    for(let i=0;i<=4;i++){
      const y=pad.t+ch/4*i;
      ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();
      ctx.fillStyle='#4a5d7a';ctx.font='10px "JetBrains Mono"';ctx.textAlign='right';
      ctx.fillText('$'+Math.round((mx-mx/4*i)/1000)+'k',pad.l-6,y+4);
    }
    ctx.textAlign='center';
    data.forEach((_,i)=>{if(labels[i]){ctx.fillText(labels[i],pad.l+cw/(data.length-1)*i,h-4)}});

    const dur=1800,t0=performance.now();
    (function anim(now){
      const p=Math.min((now-t0)/dur,1),ease=1-Math.pow(1-p,3);
      const cnt=Math.floor(data.length*ease);
      ctx.clearRect(pad.l-1,pad.t-1,cw+2,ch+2);
      // re-grid
      ctx.strokeStyle='rgba(26,39,68,.7)';ctx.lineWidth=.5;
      for(let i=0;i<=4;i++){const y=pad.t+ch/4*i;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke()}
      if(cnt<2){if(p<1)requestAnimationFrame(anim);return}
      // area
      ctx.beginPath();
      for(let i=0;i<cnt;i++){const x=pad.l+cw/(data.length-1)*i,y=pad.t+ch-data[i]/mx*ch;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}
      ctx.lineTo(pad.l+cw/(data.length-1)*(cnt-1),pad.t+ch);ctx.lineTo(pad.l,pad.t+ch);ctx.closePath();
      const g=ctx.createLinearGradient(0,pad.t,0,pad.t+ch);
      g.addColorStop(0,'rgba(0,212,170,.13)');g.addColorStop(1,'rgba(0,212,170,0)');
      ctx.fillStyle=g;ctx.fill();
      // line
      ctx.beginPath();
      for(let i=0;i<cnt;i++){const x=pad.l+cw/(data.length-1)*i,y=pad.t+ch-data[i]/mx*ch;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}
      ctx.strokeStyle='#00D4AA';ctx.lineWidth=1.8;ctx.stroke();
      // dot
      const ex=pad.l+cw/(data.length-1)*(cnt-1),ey=pad.t+ch-data[cnt-1]/mx*ch;
      ctx.beginPath();ctx.arc(ex,ey,3,0,Math.PI*2);ctx.fillStyle='#00D4AA';ctx.fill();
      if(p<1)requestAnimationFrame(anim);
    })(t0);
  }

  /* ---- Scroll Reveals ---- */
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      e.target.classList.add('show');
      // counters
      e.target.querySelectorAll('[data-target]').forEach(el=>{if(!el.dataset.done){el.dataset.done='1';countUp(el)}});
      // token segments
      e.target.querySelectorAll('.tok-seg').forEach((s,i)=>setTimeout(()=>s.classList.add('show'),i*120));
      // flywheel steps
      e.target.querySelectorAll('.wheel-step').forEach((s,i)=>setTimeout(()=>s.classList.add('show'),i*180));
      // roadmap
      e.target.querySelectorAll('.tl-item').forEach((s,i)=>setTimeout(()=>s.classList.add('show'),i*160));
      // charts
      if(e.target.querySelector('#tokCanvas'))drawDonut();
      if(e.target.querySelector('#perfCanvas'))drawPerf();
      obs.unobserve(e.target);
    });
  },{threshold:.12});

  document.querySelectorAll('.section[data-reveal]').forEach(s=>obs.observe(s));

  // hero counters
  const hero=document.getElementById('hero');
  if(hero)hero.querySelectorAll('[data-target]').forEach(el=>countUp(el));

  /* ---- Nav shrink ---- */
  window.addEventListener('scroll',()=>{
    const nav=document.getElementById('nav');
    if(nav)nav.style.padding=window.scrollY>50?'8px 0':'14px 0';
  });

  /* ---- Mobile nav ---- */
  const burger=document.getElementById('navBurger');
  const navLinks=document.getElementById('navLinks');
  if(burger&&navLinks){
    burger.addEventListener('click',()=>{
      burger.classList.toggle('open');
      navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded',burger.classList.contains('open'));
    });
    navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      burger.classList.remove('open');navLinks.classList.remove('open');
    }));
  }

  /* ---- Calculator ---- */
  const calcIn=document.getElementById('calcInput');
  const calcOut=document.getElementById('calcVal');
  if(calcIn&&calcOut){
    const cycle=342000;
    function upd(){const pct=parseFloat(calcIn.value)||0;calcOut.textContent='$'+((pct/100)*cycle).toLocaleString(undefined,{maximumFractionDigits:0})}
    calcIn.addEventListener('input',upd);upd();
  }

  /* ---- Smooth anchor ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const t=document.querySelector(a.getAttribute('href'));
      if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'})}
    });
  });

  /* ---- Mark sections for reveal ---- */
  document.querySelectorAll('.section').forEach(s=>{if(!s.hasAttribute('data-reveal'))s.setAttribute('data-reveal','')});

  console.log('NeuroFund loaded. AI trades. You earn.');
})();
