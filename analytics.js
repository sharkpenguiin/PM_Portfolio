// 방문 통계(Google Analytics 4). 어느 사례를 읽고 어디서 나가는지 확인하려는 용도다.
// 로컬 미리보기와 '추적 안 함'을 켠 브라우저에서는 기록하지 않는다.
(function(){
 var ID='G-0969LT2PM4';
 var host=location.hostname;
 if(host==='localhost'||host==='127.0.0.1'||host===''||navigator.doNotTrack==='1')return;

 var s=document.createElement('script');
 s.async=true;
 s.src='https://www.googletagmanager.com/gtag/js?id='+ID;
 document.head.appendChild(s);
 window.dataLayer=window.dataLayer||[];
 function gtag(){window.dataLayer.push(arguments);}
 gtag('js',new Date());
 gtag('config',ID);

 var page=(location.pathname.split('/').pop()||'index.html').replace('.html','');

 // 링크가 화면의 어느 영역에 있는지: 상단 메뉴, 첫 화면, 사례 목록, 이전/다음 이동, 하단, 본문
 function area(el){
  if(el.closest('nav[aria-label="주 메뉴"]'))return 'menu';
  if(el.closest('footer'))return 'footer';
  if(el.closest('.hero'))return 'hero';
  if(el.closest('.project-list')||el.classList.contains('project-row'))return 'project_list';
  if(el.closest('.case-nav')||/이전 사례|다음 사례|전체 사례|전체 프로젝트/.test(el.textContent))return 'case_nav';
  return 'body';
 }

 document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href]');
  if(!a)return;
  var href=a.getAttribute('href');
  if(href.indexOf('mailto:')===0){gtag('event','email_click',{from_page:page,link_area:area(a)});return;}
  if(href.indexOf('resume.pdf')===0){gtag('event','resume_open',{from_page:page,link_area:area(a)});return;}
  if(/^https?:/.test(href)&&href.indexOf(location.origin)!==0)return; // 외부 링크는 GA 기본 측정에 맡긴다
  var target=href.split('/').pop().split('#')[0].split('?')[0].replace('.html','')||page;
  gtag('event','case_link_click',{from_page:page,to_page:target,link_area:area(a)});
 });

 // 펼침 영역(결정로그·용어 등)을 여는지
 document.addEventListener('toggle',function(e){
  var d=e.target;
  if(d.tagName!=='DETAILS'||!d.open)return;
  var sum=d.querySelector('summary');
  gtag('event','details_open',{from_page:page,details_label:sum?sum.textContent.trim().slice(0,60):''});
 },true);
})();
