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

  // Intent-first Project Explorer: three featured items, expandable on demand.
  // Static cards remain available without network calls or user-tracking scripts.
  const filters=[...document.querySelectorAll('[data-filter]')];
  const cards=[...document.querySelectorAll('.projects-grid .project-card')];
  const grid=document.getElementById('projects-grid');
  const toggle=document.getElementById('projects-toggle');
  const toggleLabel=document.getElementById('projects-toggle-label');
  const pageStatus=document.getElementById('project-page-status');
  const liveStatus=document.getElementById('projects-status');
  const emptyState=document.getElementById('project-empty');
  const previewSize=3;
  let category='all',expanded=false;

  const matchingCards=()=>cards.filter(card=>category==='all'||card.dataset.category===category);
  const renderProjects=(announce=false)=>{
    const found=matchingCards();
    const shown=expanded?found:found.slice(0,previewSize);
    const shownSet=new Set(shown);

    cards.forEach(card=>{card.hidden=!shownSet.has(card)});
    if(emptyState)emptyState.hidden=found.length!==0;
    if(grid)grid.dataset.view=expanded?'all':'featured';

    if(toggle){
      toggle.hidden=found.length<=previewSize;
      toggle.setAttribute('aria-expanded',String(expanded));
    }
    if(toggleLabel)toggleLabel.textContent=expanded
      ? 'แสดงผลงานให้น้อยลง'
      : 'ดูผลงานทั้งหมด '+found.length+' ระบบ';

    const summary=found.length
      ? 'แสดง '+shown.length+' จาก '+found.length+' ผลงาน'
      : 'ไม่พบผลงานในหมวดนี้';
    if(pageStatus)pageStatus.textContent=summary;
    if(announce&&liveStatus)liveStatus.textContent=summary;

    filters.forEach(button=>{
      const key=button.dataset.filter;
      const selected=key===category;
      button.classList.toggle('active',selected);
      button.setAttribute('aria-pressed',String(selected));
      const count=button.querySelector('span');
      if(count)count.textContent=String(cards.filter(card=>key==='all'||card.dataset.category===key).length).padStart(2,'0');
    });
  };

  filters.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.filter;
    expanded=false;
    renderProjects(true);
  }));

  toggle?.addEventListener('click',()=>{
    const toReveal=expanded?null:matchingCards()[previewSize];
    expanded=!expanded;
    renderProjects(true);
    if(expanded){
      // Focus the first newly revealed destination for keyboard users.
      toReveal?.querySelector('a[href]')?.focus?.({preventScroll:true});
    }else{
      // After collapsing, focus stays on the visible toggle control.
      toggle.focus?.({preventScroll:true});
    }
  });
  renderProjects();

  const year=document.getElementById('year');
  if(year)year.textContent=String(new Date().getFullYear());
})();
