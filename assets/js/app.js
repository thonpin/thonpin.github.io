(()=>{
  'use strict';

  const root=document.documentElement;
  const themeBtn=document.getElementById('theme-toggle');
  const themeMeta=document.querySelector('meta[name="theme-color"]');
  const menuBtn=document.getElementById('menu-toggle');
  const nav=document.getElementById('primary-nav');
  const navLinks=[...(nav?.querySelectorAll('a[href^="#"]')||[])];

  const applyTheme=(theme)=>{
    root.dataset.theme=theme;
    themeBtn?.setAttribute('aria-label',theme==='dark'?'เปลี่ยนเป็นโหมดสว่าง':'เปลี่ยนเป็นโหมดมืด');
    themeBtn?.setAttribute('aria-pressed',String(theme==='light'));
    themeMeta?.setAttribute('content',theme==='light'?'#f5f8f6':'#080d10');
  };

  let initialTheme=root.dataset.theme==='light'?'light':'dark';
  try {
    const saved=localStorage.getItem('thnp-theme');
    if(saved==='light'||saved==='dark')initialTheme=saved;
  }catch(_error){}
  applyTheme(initialTheme);

  themeBtn?.addEventListener('click',()=>{
    const next=root.dataset.theme==='dark'?'light':'dark';
    applyTheme(next);
    try{localStorage.setItem('thnp-theme',next)}catch(_error){}
  });

  const setMenu=(open,restoreFocus=false)=>{
    if(!nav||!menuBtn)return;
    const wasOpen=nav.classList.contains('is-open');
    nav.classList.toggle('is-open',open);
    menuBtn.setAttribute('aria-expanded',String(open));
    menuBtn.setAttribute('aria-label',open?'ปิดเมนู':'เปิดเมนู');
    if(!open&&wasOpen&&restoreFocus&&nav.contains(document.activeElement))menuBtn.focus();
  };
  menuBtn?.addEventListener('click',()=>{
    const open=!nav?.classList.contains('is-open');
    setMenu(open);
    if(open)navLinks[0]?.focus();
  });
  navLinks.forEach(link=>link.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false,true)});
  document.addEventListener('pointerdown',event=>{
    if(nav&&menuBtn&&!nav.contains(event.target)&&!menuBtn.contains(event.target))setMenu(false);
  });
  window.addEventListener?.('resize',()=>{
    if(window.innerWidth>980)setMenu(false);
  });

  // Highlight the section currently being read, without changing URL or history.
  if(window.IntersectionObserver&&navLinks.length){
    const targets=navLinks.map(link=>{
      const id=link.getAttribute('href')?.slice(1);
      return id?document.getElementById(id):null;
    }).filter(Boolean);
    const observer=new window.IntersectionObserver(entries=>{
      const inView=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      if(!inView.length)return;
      const active='#'+inView[0].target.id;
      navLinks.forEach(link=>{
        if(link.getAttribute('href')===active)link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    },{rootMargin:'-12% 0px -68% 0px',threshold:0});
    targets.forEach(section=>observer.observe(section));
  }

  // Filter the nine public work samples, with six displayed per page.
  const filters=[...document.querySelectorAll('[data-filter]')];
  const cards=[...document.querySelectorAll('.projects-grid .project-card')];
  const grid=document.getElementById('projects-grid');
  const pagination=document.getElementById('project-pagination');
  const prev=document.getElementById('project-prev');
  const next=document.getElementById('project-next');
  const pageStatus=document.getElementById('project-page-status');
  const pageCount=document.getElementById('project-page-count');
  const liveStatus=document.getElementById('projects-status');
  const pageSize=6;
  let category='all',page=1;

  const matchingCards=()=>cards.filter(card=>category==='all'||card.dataset.category===category);
  const renderProjects=()=>{
    const found=matchingCards();
    const totalPages=Math.max(1,Math.ceil(found.length/pageSize));
    page=Math.max(1,Math.min(page,totalPages));
    cards.forEach(card=>{card.hidden=true});
    found.slice((page-1)*pageSize,page*pageSize).forEach(card=>{card.hidden=false});
    if(pagination)pagination.hidden=totalPages<=1;
    if(prev)prev.disabled=page<=1;
    if(next)next.disabled=page>=totalPages;

    const from=found.length?(page-1)*pageSize+1:0;
    const to=Math.min(page*pageSize,found.length);
    const text=found.length?'แสดง '+from+'–'+to+' จาก '+found.length+' ผลงาน':'ไม่พบผลงานในหมวดนี้';
    if(pageStatus)pageStatus.textContent=text;
    if(pageCount)pageCount.textContent='หน้า '+page+' จาก '+totalPages;
    if(liveStatus)liveStatus.textContent=text+' · หน้า '+page+' จาก '+totalPages;

    filters.forEach(button=>{
      const key=button.dataset.filter;
      const selected=key===category;
      button.classList.toggle('active',selected);
      button.setAttribute('aria-pressed',String(selected));
      const badge=button.querySelector('span');
      if(badge)badge.textContent=String(cards.filter(card=>key==='all'||card.dataset.category===key).length).padStart(2,'0');
    });
  };

  filters.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.filter;page=1;renderProjects();
  }));
  const flipPage=direction=>{
    const max=Math.max(1,Math.ceil(matchingCards().length/pageSize));
    if(page+direction<1||page+direction>max)return;
    page+=direction;renderProjects();
    // Announce the new page and put keyboard focus before its cards.
    grid?.focus?.({preventScroll:true});
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    grid?.scrollIntoView?.({behavior:reduced?'auto':'smooth',block:'start'});
  };
  prev?.addEventListener('click',()=>flipPage(-1));
  next?.addEventListener('click',()=>flipPage(1));
  renderProjects();

  const year=document.getElementById('year');
  if(year)year.textContent=String(new Date().getFullYear());
})();
