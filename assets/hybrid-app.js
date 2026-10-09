(() => {
 const tabs=[...document.querySelectorAll('[role=tab]')];
 const panels=[...document.querySelectorAll('[role=tabpanel]')];
 const aliases={'pf-home':'home','pf-erp':'erp','pf-ai':'ai','pf-exp':'exp','pf-about':'about','erp-policy':'erp-input'};
 const positions=new Map(), pagePositions=new Map();
 let current='';
 if('scrollRestoration' in history)history.scrollRestoration='manual';
 function resolve(raw){const id=aliases[raw]||raw||'home';const el=document.getElementById(id);return el&&el.closest('[role=tabpanel]')?id:'home';}
 function show(raw,{push=false,restore=false,tabRestore=false,focus=true}={}){
  const id=resolve(raw),target=document.getElementById(id),page=target.closest('[role=tabpanel]');
  if(current){positions.set(current,window.scrollY);pagePositions.set(document.body.dataset.page,window.scrollY);}
  if(push&&location.hash!=='#'+id)history.pushState({id},'', '#'+id);
  panels.forEach(p=>p.hidden=p!==page);
  tabs.forEach(t=>{const on=t.getAttribute('aria-controls')===page.id;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;});
  document.body.dataset.page=page.id;
  current=id;
  requestAnimationFrame(()=>{
   const active=tabs.find(t=>t.getAttribute('aria-controls')===page.id);
   if(active){const nav=active.parentElement;if(nav.scrollWidth>nav.clientWidth)nav.scrollTo({left:Math.max(0,active.offsetLeft-nav.offsetLeft-(nav.clientWidth-active.offsetWidth)/2)});}
   if(tabRestore&&pagePositions.has(page.id))window.scrollTo(0,pagePositions.get(page.id));
   else if(restore&&positions.has(id))window.scrollTo(0,positions.get(id));
   else if(id!==page.id)target.scrollIntoView({block:'start'});else window.scrollTo(0,0);
   if(push&&focus){const focusTarget=id===page.id?page.querySelector('h1'):target;if(focusTarget){focusTarget.tabIndex=-1;focusTarget.focus({preventScroll:true});}}
  });
 }
 tabs.forEach((t,i)=>{t.onclick=()=>show(t.getAttribute('aria-controls'),{push:true,tabRestore:true});t.onkeydown=e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();show(tabs[n].getAttribute('aria-controls'),{push:true,focus:false,tabRestore:true});tabs[n].focus();}};});
 document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();show(b.dataset.go,{push:true});}));
 show(location.hash.slice(1));
 addEventListener('popstate',()=>show(location.hash.slice(1),{restore:true}));
 addEventListener('hashchange',()=>{if(location.hash==='#main')return;if(resolve(location.hash.slice(1))!==current)show(location.hash.slice(1));});
 const d=document.getElementById('dlg'),img=document.getElementById('dlg-img'),pan=d.querySelector('.dlg-pan'),size=document.getElementById('dlg-size');let opener;
 const zoomCheck=()=>{size.hidden=img.naturalWidth<=pan.clientWidth;};
 img.addEventListener('load',zoomCheck);addEventListener('resize',zoomCheck);
 document.querySelectorAll('[data-full]').forEach(b=>b.addEventListener('click',()=>{opener=b;const src=document.getElementById(b.dataset.full).content.querySelector('img');img.src=src.src;img.alt=src.alt;pan.dataset.large='false';size.textContent='원본 크기';size.setAttribute('aria-pressed','false');d.showModal();document.body.style.overflow='hidden';requestAnimationFrame(zoomCheck);}));
 document.getElementById('dlg-close').onclick=()=>d.close();
 d.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus();});
 d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
 size.onclick=()=>{const on=pan.dataset.large!=='true';pan.dataset.large=String(on);size.textContent=on?'화면에 맞추기':'원본 크기';size.setAttribute('aria-pressed',String(on));};
})();

(() => {
 const nav=document.querySelector('.exp-subnav');
 const expTab=document.getElementById('t-exp');
 // Keep the project links outside the ARIA tablist while placing them below its public-experience tab.
 function place(){const mobile=innerWidth<=760;nav.style.top=mobile?'':(expTab.getBoundingClientRect().bottom+8)+'px';}
 function mark(){const links=[...nav.querySelectorAll('a')];let active='';if(document.body.dataset.page==='exp'){for(const a of links){if(document.getElementById(a.dataset.go).getBoundingClientRect().top<=180)active=a.dataset.go;}if(!active)active=links[0].dataset.go;}links.forEach(a=>{if(a.dataset.go===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
 let pending=false;function update(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;place();mark();});}
 addEventListener('scroll',update,{passive:true});addEventListener('resize',update);new MutationObserver(update).observe(document.body,{attributes:true,attributeFilter:['data-page']});update();
})();