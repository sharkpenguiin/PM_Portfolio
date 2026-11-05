function revealEvidence(){
 const id=decodeURIComponent(location.hash.slice(1));
 if(!id)return;
 const target=document.getElementById(id);
 if(!target)return;
 let parent=target.parentElement;
 while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}
 requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
}
window.addEventListener('hashchange',revealEvidence);
window.addEventListener('DOMContentLoaded',revealEvidence);
