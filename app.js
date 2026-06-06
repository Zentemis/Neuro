/* ============================================
   NEUROFUND — Interactive Features
   ============================================ */
(function(){
  'use strict';

  /* ---- Safety: reveal all sections after 2s no matter what ---- */
  setTimeout(function(){
    document.querySelectorAll('.section').forEach(function(s){
      s.classList.add('show');
    });
    document.querySelectorAll('.tok-seg, .wheel-step, .tl-item').forEach(function(el){
      el.classList.add('show');
    });
  }, 2000);

  try {


  /* ---- Counter Animation ---- */
  function countUp(el){
    var target=parseFloat(el.dataset.target);
    var prefix=el.dataset.prefix||'';
    var suffix=el.dataset.suffix||'';
    var comma=el.dataset.comma==='true';
    var dec=el.dataset.decimal==='true';
    var dur=1800,t0=performance.now();
    function tick(now){
      var p=Math.min((now-t0)/dur,1);
      var ease=1-Math.pow(1-p,3);
      var v=target*ease;
      if(comma)v=Math.floor(v).toLocaleString();
      else if(dec)v=v.toFixed(1);
      else v=Math.floor(v).toLocaleString();
      el.textContent=prefix+v+suffix;
      if(p<1)requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---- Donut Chart ---- */
  var donutSegs=[
    {p:50,c1:'#00D4AA',c2:'#00eabb'},
    {p:35,c1:'#F5A623',c2:'#f7c96b'},
    {p:10,c1:'#6366f1',c2:'#818cf8'},
    {p:5, c1:'#8b5cf6',c2:'#a78bfa'}
  ];
  var donutHighlight=-1;
  function drawDonut(highlight){
    if(highlight!==undefined)donutHighlight=highlight;
    var c=document.getElementById('tokCanvas');
    if(!c)return;
    var wrap=c.parentElement;
    var size=Math.min(wrap.offsetWidth,300);
    var dpr=window.devicePixelRatio||1;
    c.width=size*dpr;c.height=size*dpr;
    c.style.width=size+'px';c.style.height=size+'px';
    var ctx=c.getContext('2d');
    ctx.scale(dpr,dpr);
    var cx=size/2,cy=size/2,oR=size*0.44,iR=size*0.30;
    var dur=1600,t0=performance.now();
    var gap=0.035;
    function drawIt(now){
      var p=Math.min((now-t0)/dur,1),ease=1-Math.pow(1-p,3);
      ctx.clearRect(0,0,size,size);

      ctx.save();
      ctx.shadowColor='rgba(0,212,170,0.15)';
      ctx.shadowBlur=size*0.08;
      ctx.beginPath();ctx.arc(cx,cy,oR+2,0,Math.PI*2);ctx.strokeStyle='rgba(0,212,170,0.06)';ctx.lineWidth=4;ctx.stroke();
      ctx.restore();

      var ang=-Math.PI/2;
      for(var s=0;s<donutSegs.length;s++){
        var sw=(donutSegs[s].p/100)*Math.PI*2*ease;
        if(sw-gap<0.01){ang+=(donutSegs[s].p/100)*Math.PI*2;continue;}
        var isHL=donutHighlight===s;
        var gAng=ang+sw/2;
        var gx1=cx+Math.cos(gAng)*iR, gy1=cy+Math.sin(gAng)*iR;
        var gx2=cx+Math.cos(gAng)*oR, gy2=cy+Math.sin(gAng)*oR;
        var grad=ctx.createLinearGradient(gx1,gy1,gx2,gy2);
        grad.addColorStop(0,donutSegs[s].c1);grad.addColorStop(1,donutSegs[s].c2);

        ctx.beginPath();
        ctx.arc(cx,cy,oR+(isHL?5:0),ang+gap/2,ang+sw-gap/2);
        ctx.arc(cx,cy,iR-(isHL?2:0),ang+sw-gap/2,ang+gap/2,true);
        ctx.closePath();
        if(isHL){ctx.save();ctx.shadowColor=donutSegs[s].c1;ctx.shadowBlur=16;ctx.fillStyle=grad;ctx.fill();ctx.restore();}
        else{ctx.fillStyle=grad;ctx.fill();}

        ctx.beginPath();
        ctx.arc(cx,cy,iR+1,ang+gap/2,ang+sw-gap/2);
        ctx.strokeStyle='rgba(255,255,255,'+(isHL?.15:.08)+')';ctx.lineWidth=1;ctx.stroke();

        ang+=(donutSegs[s].p/100)*Math.PI*2;
      }

      ctx.beginPath();ctx.arc(cx,cy,iR-1,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,0.04)';ctx.lineWidth=1.5;ctx.stroke();

      if(p<1)requestAnimationFrame(drawIt);
    }
    requestAnimationFrame(drawIt);
  }

  // Hover: highlight donut segment when hovering card
  document.querySelectorAll('.tok-seg').forEach(function(el,i){
    el.addEventListener('mouseenter',function(){drawDonut(i)});
    el.addEventListener('mouseleave',function(){drawDonut(-1)});
  });

  /* ---- Performance Chart ---- */
  var perfDrawn=false;
  function drawPerf(){
    var c=document.getElementById('perfCanvas');
    if(!c||perfDrawn)return;
    perfDrawn=true;
    var wrap=c.parentElement;
    var w=wrap.offsetWidth-40;
    if(w<200)return;
    var dpr=window.devicePixelRatio||1;
    var h=Math.min(200,w*0.4);
    c.width=w*dpr;c.height=h*dpr;
    c.style.width=w+'px';c.style.height=h+'px';
    var ctx=c.getContext('2d');ctx.scale(dpr,dpr);
    var pad={t:12,r:12,b:24,l:w<400?36:48};
    var data=[0,28,52,89,118,178,245,342,468,612,780,891];
    var labels=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var cw=w-pad.l-pad.r,ch=h-pad.t-pad.b,mx=0;
    for(var i=0;i<data.length;i++)if(data[i]>mx)mx=data[i];
    mx*=1.1;
    var fs=Math.max(9,Math.min(11,w/60));
    ctx.font=fs+'px monospace';

    // Grid
    ctx.strokeStyle='rgba(26,39,68,.6)';ctx.lineWidth=.5;
    for(var g=0;g<=4;g++){
      var gy=pad.t+ch/4*g;
      ctx.beginPath();ctx.moveTo(pad.l,gy);ctx.lineTo(w-pad.r,gy);ctx.stroke();
      ctx.fillStyle='#4a5d7a';ctx.textAlign='right';
      ctx.fillText('$'+Math.round((mx-mx/4*g)/1000)+'k',pad.l-6,gy+fs/3);
    }
    ctx.textAlign='center';
    for(var li=0;li<data.length;li++){
      var lx=pad.l+cw/(data.length-1)*li;
      ctx.fillStyle='#4a5d7a';ctx.fillText(labels[li],lx,h-4);
    }

    // Animate
    var dur=1600,t0=performance.now();
    function anim(now){
      var p=Math.min((now-t0)/dur,1),ease=1-Math.pow(1-p,3);
      var cnt=Math.max(2,Math.floor(data.length*ease));
      ctx.clearRect(pad.l-1,pad.t-1,cw+2,ch+2);

      // Redraw grid
      ctx.strokeStyle='rgba(26,39,68,.6)';ctx.lineWidth=.5;
      for(var rg=0;rg<=4;rg++){
        var rgy=pad.t+ch/4*rg;
        ctx.beginPath();ctx.moveTo(pad.l,rgy);ctx.lineTo(w-pad.r,rgy);ctx.stroke();
      }

      // Area fill
      ctx.beginPath();
      for(var ai=0;ai<cnt;ai++){var ax=pad.l+cw/(data.length-1)*ai,ay=pad.t+ch-data[ai]/mx*ch;ai===0?ctx.moveTo(ax,ay):ctx.lineTo(ax,ay)}
      ctx.lineTo(pad.l+cw/(data.length-1)*(cnt-1),pad.t+ch);ctx.lineTo(pad.l,pad.t+ch);ctx.closePath();
      var gr=ctx.createLinearGradient(0,pad.t,0,pad.t+ch);
      gr.addColorStop(0,'rgba(0,212,170,.12)');gr.addColorStop(1,'rgba(0,212,170,0)');
      ctx.fillStyle=gr;ctx.fill();

      // Line
      ctx.beginPath();
      for(var li2=0;li2<cnt;li2++){var lx2=pad.l+cw/(data.length-1)*li2,ly2=pad.t+ch-data[li2]/mx*ch;li2===0?ctx.moveTo(lx2,ly2):ctx.lineTo(lx2,ly2)}
      ctx.strokeStyle='#00D4AA';ctx.lineWidth=2;ctx.stroke();

      // End dot
      var ex=pad.l+cw/(data.length-1)*(cnt-1),ey=pad.t+ch-data[cnt-1]/mx*ch;
      ctx.beginPath();ctx.arc(ex,ey,4,0,Math.PI*2);ctx.fillStyle='#00D4AA';ctx.fill();
      ctx.beginPath();ctx.arc(ex,ey,7,0,Math.PI*2);ctx.strokeStyle='rgba(0,212,170,.3)';ctx.lineWidth=1.5;ctx.stroke();

      if(p<1)requestAnimationFrame(anim);
    }
    requestAnimationFrame(anim);
  }

  // Redraw chart on resize
  if('ResizeObserver' in window){
    var chartBox=document.querySelector('.chart-box');
    if(chartBox){
      new ResizeObserver(function(){perfDrawn=false;drawPerf()}).observe(chartBox);
    }
  }

  /* ---- Scroll Reveals ---- */
  if('IntersectionObserver' in window){
    var reducedMotion=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting)return;
        e.target.classList.add('show');
        try{e.target.querySelectorAll('[data-target]').forEach(function(el){if(!el.dataset.done){el.dataset.done='1';countUp(el)}})}catch(x){}
        try{e.target.querySelectorAll('.tok-seg').forEach(function(s,i){setTimeout(function(){s.classList.add('show')},reducedMotion?0:i*120)})}catch(x){}
        try{e.target.querySelectorAll('.wheel-step').forEach(function(s,i){setTimeout(function(){s.classList.add('show')},reducedMotion?0:i*180)})}catch(x){}
        try{e.target.querySelectorAll('.tl-item').forEach(function(s,i){setTimeout(function(){s.classList.add('show')},reducedMotion?0:i*160)})}catch(x){}
        try{if(e.target.querySelector('#tokCanvas'))drawDonut()}catch(x){}
        try{if(e.target.querySelector('#perfCanvas'))drawPerf()}catch(x){}
        obs.unobserve(e.target);
      });
    },{threshold:0.05});
    document.querySelectorAll('.section').forEach(function(s){obs.observe(s)});
  } else {
    document.querySelectorAll('.section').forEach(function(s){s.classList.add('show')});
  }

  // hero counters
  var hero=document.getElementById('hero');
  if(hero)hero.querySelectorAll('[data-target]').forEach(function(el){countUp(el)});

  /* ---- Nav shrink ---- */
  var navEl=document.getElementById('nav');
  if(navEl){
    window.addEventListener('scroll',function(){
      navEl.style.padding=window.scrollY>50?'8px 0':'14px 0';
    });
  }

  /* ---- Mobile nav ---- */
  var burger=document.getElementById('navBurger');
  var navLinks=document.getElementById('navLinks');
  if(burger&&navLinks){
    burger.addEventListener('click',function(){
      var isOpen=burger.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow=isOpen?'hidden':'';
      burger.setAttribute('aria-expanded',isOpen);
    });
    navLinks.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){
      burger.classList.remove('open');navLinks.classList.remove('open');
      document.body.style.overflow='';
      burger.setAttribute('aria-expanded','false');
    })});
  }

  /* ---- Calculator ---- */
  var calcIn=document.getElementById('calcInput');
  var calcOut=document.getElementById('calcVal');
  if(calcIn&&calcOut){
    var cycle=342000;
    function upd(){var pct=parseFloat(calcIn.value)||0;calcOut.textContent='$'+((pct/100)*cycle).toLocaleString(undefined,{maximumFractionDigits:0})}
    calcIn.addEventListener('input',upd);upd();
  }

  /* ---- Smooth anchor ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var t=document.querySelector(a.getAttribute('href'));
      if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'})}
    });
  });

  /* ---- Nav active section highlight ---- */
  var navAnchors=document.querySelectorAll('.nav-links a[href^="#"]');
  var sectionIds=[];
  navAnchors.forEach(function(a){var id=a.getAttribute('href').slice(1);if(document.getElementById(id))sectionIds.push(id)});
  var activeObs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        navAnchors.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id)});
      }
    });
  },{threshold:0.3,rootMargin:'-80px 0px -60% 0px'});
  sectionIds.forEach(function(id){var el=document.getElementById(id);if(el)activeObs.observe(el)});

  /* ---- Mark sections for reveal ---- */
  document.querySelectorAll('.section').forEach(function(s){if(!s.hasAttribute('data-reveal'))s.setAttribute('data-reveal','')});

  } catch(err) {
    console.error('NeuroFund JS error:', err);
    document.querySelectorAll('.section').forEach(function(s){s.classList.add('show')});
    document.querySelectorAll('.tok-seg, .wheel-step, .tl-item').forEach(function(el){el.classList.add('show')});
  }

  console.log('NeuroFund loaded.');
})();
