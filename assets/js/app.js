(()=>{
  'use strict';
  const root=document.documentElement;
  const themeBtn=document.getElementById('theme-toggle');
  try {const previous=localStorage.getItem('thnp-theme');if(previous==='light'||previous==='dark')root.dataset.theme=previous;}catch(_e){}
  themeBtn?.addEventListener('click',()=>{const theme=root.dataset.theme==='dark'?'light':'dark';root.dataset.theme=theme;try{localStorage.setItem('thnp-theme',theme);}catch(_e){};themeBtn.setAttribute('aria-label',theme==='dark'?'เปลี่ยนเป็นโหมดสว่าง':'เปลี่ยนเป็นโหมดมืด');});
  const menuBtn=document.getElementById('menu-toggle'); const nav=document.getElementById('primary-nav');
  const setMenu=(open)=>{nav?.classList.toggle('is-open',open);menuBtn?.setAttribute('aria-expanded',String(open));menuBtn?.setAttribute('aria-label',open?'ปิดเมนู':'เปิดเมนู');};
  menuBtn?.addEventListener('click',()=>setMenu(!nav.classList.contains('is-open')));
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
  // Project gallery: 6 recent cards per page, with category-aware pagination.
  const filters=[...document.querySelectorAll('[data-filter]')];
  const cards=[...document.querySelectorAll('.projects-grid .project-card')];
  const grid=document.getElementById('projects-grid');
  const pagination=document.getElementById('project-pagination');
  const prev=document.getElementById('project-prev');
  const next=document.getElementById('project-next');
  const pageStatus=document.getElementById('project-page-status');
  const pageCount=document.getElementById('project-page-count');
  const pageSize=6;
  let category='all', page=1;
  const filteredCards=()=>cards.filter(card=>category==='all'||card.dataset.category===category);
  const renderProjects=()=>{
    const matches=filteredCards(), pages=Math.max(1,Math.ceil(matches.length/pageSize));
    page=Math.min(Math.max(page,1),pages);
    cards.forEach(card=>{card.hidden=true});
    matches.slice((page-1)*pageSize,page*pageSize).forEach(card=>{card.hidden=false});
    if(pagination)pagination.hidden=pages<=1;
    if(prev)prev.disabled=page<=1;
    if(next)next.disabled=page>=pages;
    if(pageStatus)pageStatus.textContent=matches.length?'แสดง '+((page-1)*pageSize+1)+'–'+Math.min(page*pageSize,matches.length)+' จาก '+matches.length+' ผลงาน':'ไม่พบผลงานในหมวดนี้';
    if(pageCount)pageCount.textContent='หน้า '+page+' จาก '+pages;
    filters.forEach(button=>{
      const selected=button.dataset.filter===category;
      button.classList.toggle('active',selected);
      button.setAttribute('aria-pressed',String(selected));
      const count=button.querySelector('span');
      if(count)count.textContent=String(cards.filter(card=>button.dataset.filter==='all'||card.dataset.category===button.dataset.filter).length).padStart(2,'0');
    });
  };
  filters.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.filter;page=1;renderProjects();
  }));
  const switchPage=delta=>{
    const pages=Math.max(1,Math.ceil(filteredCards().length/pageSize));
    const target=page+delta;
    if(target<1||target>pages)return;
    page=target;renderProjects();
    const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    grid?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
  };
  prev?.addEventListener('click',()=>switchPage(-1));
  next?.addEventListener('click',()=>switchPage(1));
  renderProjects();
  const year=document.getElementById('year');if(year)year.textContent=String(new Date().getFullYear());
})();
