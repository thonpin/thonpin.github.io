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
  const filters=[...document.querySelectorAll('[data-filter]')]; const cards=[...document.querySelectorAll('[data-category]')];
  filters.forEach(button=>button.addEventListener('click',()=>{
    const category=button.dataset.filter;
    filters.forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
    cards.forEach(card=>{card.hidden=(category!=='all'&&card.dataset.category!==category)});
  }));
  const year=document.getElementById('year');if(year)year.textContent=String(new Date().getFullYear());
})();
