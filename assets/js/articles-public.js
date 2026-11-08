(()=>{
  'use strict';

  const root=document.documentElement;
  root.classList.remove('no-js');
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

  toggle?.addEventListener('click',event=>{
    const fromKeyboard=event?.detail===0;
    const toReveal=expanded?null:matchingCards()[previewSize];
    expanded=!expanded;
    renderProjects(true);
    if(fromKeyboard){
      // Keyboard activation moves to new content; pointer activation avoids scroll jumps.
      if(expanded)toReveal?.querySelector('a[href]')?.focus?.();
      else toggle.focus?.();
    }
  });
  renderProjects();

  // Opt-in measurement hook: emits anonymous UI actions, never sends data over network.
  document.addEventListener('click',event=>{
    const source=event.target?.closest?.('a[data-conversion]');
    if(!source||typeof window.CustomEvent!=='function')return;
    window.dispatchEvent?.(new window.CustomEvent('portfolio:conversion',{
      detail:{action:source.dataset.conversion}
    }));
  });

  const year=document.getElementById('year');
  if(year)year.textContent=String(new Date().getFullYear());
})();


/* Public runtime bundle, generated from private modular sources. */

// Public Firebase web-app configuration. Fill these values from Firebase Console.
// These values identify the Firebase client app; they are NOT service-account secrets.
// Firestore Security Rules, not JavaScript, enforce publishing authorization.
const firebaseConfig={
  apiKey:"AIzaSyCXcoXt0LEtRstTHRUjbGhgGKRoSbqJ-kk",
  authDomain:"github-thonpin.firebaseapp.com",
  projectId:"github-thonpin",
  appId:"1:730735677986:web:7272b2e779ba2b79adf07b"
};
const firebaseConfigured=Boolean(
  firebaseConfig.apiKey&&firebaseConfig.authDomain&&
  firebaseConfig.projectId&&firebaseConfig.appId
);


// Pure article helpers shared by public pages and the editor.
// Never trust a pasted iframe: accept a Google read-only URL and build the embed ourselves.
const ARTICLE_CATEGORIES=Object.freeze([
  {id:"software",label:"Software Engineering",icon:"code"},
  {id:"security",label:"Cybersecurity",icon:"shield"},
  {id:"ai-education",label:"AI & Digital Education",icon:"sparkles"},
  {id:"research",label:"Research & Innovation",icon:"book"},
  {id:"other",label:"บทความทั่วไป",icon:"file"}
]);
const categoryName=id=>ARTICLE_CATEGORIES.find(x=>x.id===id)?.label||"บทความ";

function parseGoogleSource(value){
  if(typeof value!=="string"||value.length>2048)return null;
  let url;
  try{url=new URL(value.trim());}catch{return null;}
  if(url.protocol!=="https:"||url.username||url.password||url.port)return null;
  const host=url.hostname.toLowerCase();
  const path=url.pathname;
  const idPattern="[A-Za-z0-9_-]{10,}";
  let match,type,embed,canonical;
  if(host==="docs.google.com"){
    match=new RegExp("^/(document|presentation)/d/("+idPattern+")/(?:edit|view|preview|pub|embed)?/?$").exec(path);
    if(match){
      type=match[1]==="document"?"docs":"slides";
      const base="https://docs.google.com/"+match[1]+"/d/"+match[2];
      // Do not copy OAuth, tracking, or untrusted query/fragment values
      // into public article records or outbound links.
      canonical=base+"/edit";
      embed=base+(type==="docs"?"/preview":
        (path.includes("/embed")||path.includes("/pub")?
          "/embed?start=false&loop=false&delayms=3000":"/preview"));
    }else{
      match=new RegExp("^/(document|presentation)/d/e/("+idPattern+")/(?:pub|pubhtml|embed)/?$").exec(path);
      if(!match)return null;
      type=match[1]==="document"?"docs":"slides";
      const base="https://docs.google.com/"+match[1]+"/d/e/"+match[2];
      canonical=base+(type==="docs"?"/pub?embedded=true":"/embed?start=false&loop=false&delayms=3000");
      embed=canonical;
    }
  }else if(host==="drive.google.com"){
    match=new RegExp("^/file/d/("+idPattern+")/(?:view|preview|edit)?/?$").exec(path);
    const id=match?.[1]||(path==="/open"||path==="/uc"?url.searchParams.get("id"):null);
    if(!id||!new RegExp("^"+idPattern+"$").test(id))return null;
    type="pdf";
    const key=url.searchParams.get("resourcekey");
    if(key!==null&&!/^[A-Za-z0-9_-]{8,200}$/.test(key))return null;
    const suffix=key?"?resourcekey="+key:"";
    canonical="https://drive.google.com/file/d/"+id+"/view"+suffix;
    embed="https://drive.google.com/file/d/"+id+"/preview"+suffix;
  }else{return null;}
  return {type,embedUrl:embed,sourceUrl:canonical};
}

// Accept Google's pasted iframe snippet only as input; never store or render raw HTML.
function extractGoogleSource(input){
  if(typeof input!=="string")return null;
  let candidate=input.trim();
  if(/^<iframe\b/i.test(candidate)){
    const match=/\bsrc\s*=\s*(["'])(https:\/\/[^"'<>]+)\1/i.exec(candidate);
    if(!match)return null;
    candidate=match[2].replaceAll("&amp;","&");
  }
  return parseGoogleSource(candidate);
}

function formatArticleDate(value){
  const date=typeof value?.toDate==="function"?value.toDate():value instanceof Date?value:null;
  if(!date||!Number.isFinite(date.getTime()))return "";
  return new Intl.DateTimeFormat("th-TH",{year:"numeric",month:"short",day:"numeric"}).format(date);
}
function sortArticles(items){
  return [...items].sort((a,b)=>{
    const sec=x=>x?.publishedAt?.seconds??x?.createdAt?.seconds??0;
    return sec(b)-sec(a);
  });
}
function articleLink(id){return "./post.html?id="+encodeURIComponent(id);}
function createNode(tag,className,text){
  const element=document.createElement(tag);
  if(className)element.className=className;
  if(text!==undefined)element.textContent=text;
  return element;
}
function createArticleCard(article,{featured=false,hrefPrefix=""}={}){
  const card=createNode("article","article-card"+(featured?" article-card--featured":""));
  const top=createNode("div","article-card__meta");
  top.append(createNode("span","article-card__type",categoryName(article.category)));
  const date=formatArticleDate(article.publishedAt);
  if(date)top.append(createNode("time","article-card__date",date));
  const title=createNode("h3","article-card__title",article.title||"ไม่มีชื่อบทความ");
  const summary=createNode("p","article-card__summary",article.summary||"อ่านเนื้อหาและเอกสารฉบับเต็มในบทความ");
  const link=createNode("a","article-card__link","อ่านบทความ");
  link.href=hrefPrefix+articleLink(article.id);
  link.setAttribute("aria-label","อ่านบทความ "+(article.title||"ไม่มีชื่อบทความ"));
  const icon=createNode("span",""," ↗");
  icon.setAttribute("aria-hidden","true");
  link.append(icon);
  card.append(top,title,summary,link);
  return card;
}

function createEmbed(sourceUrl,title){
  const parsed=parseGoogleSource(sourceUrl);
  if(!parsed)return null;
  const figure=createNode("figure","article-embed"+(parsed.type==="slides"?" article-embed--slides":""));
  const frame=createNode("iframe","article-embed__frame");
  frame.src=parsed.embedUrl;
  frame.title="เอกสารประกอบบทความ: "+(title||"เอกสาร");
  frame.loading="lazy";
  frame.referrerPolicy="strict-origin-when-cross-origin";
  frame.setAttribute("allowfullscreen","");
  frame.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms allow-popups");
  figure.append(frame);
  const caption=createNode("figcaption","article-embed__caption");
  const link=createNode("a",null,"เปิดต้นฉบับใน Google "+({docs:"Docs",slides:"Slides",pdf:"Drive"}[parsed.type]));
  link.href=parsed.sourceUrl;
  link.target="_blank";
  link.rel="noopener noreferrer";
  caption.append("หากเอกสารไม่แสดง โปรดตรวจสิทธิ์การแชร์และ ",link);
  figure.append(caption);
  return figure;
}



const view=document.body.dataset.articlesView;
const root=document.querySelector("[data-articles-root]");
const status=document.getElementById("articles-status");

function announce(message){if(status)status.textContent=message;}
function showMessage(container,heading,message,href,linkText){
  if(!container)return;
  const panel=createNode("div","article-notice");
  panel.append(createNode("h3",null,heading),createNode("p",null,message));
  if(href){
    const a=createNode("a","article-button article-button--outline",linkText||"ดูบทความ");
    a.href=href;panel.append(a);
  }
  container.replaceChildren(panel);
}
function renderList(container,posts,hrefPrefix=""){
  container.replaceChildren();
  if(!posts.length){
    showMessage(container,"ยังไม่มีบทความในหมวดนี้","ลองเปลี่ยนหมวดหมู่หรือคำค้นหา","./list.html","ดูทั้งหมด");
    return;
  }
  const fragment=document.createDocumentFragment();
  posts.forEach(post=>fragment.append(createArticleCard(post,{hrefPrefix})));
  container.append(fragment);
}
function renderCatalog(posts){
  if(!root)return;
  root.replaceChildren();
  // Count categories in one pass rather than scanning every article per card.
  const counts=new Map();
  posts.forEach(post=>counts.set(post.category,(counts.get(post.category)||0)+1));
  const cards=[{id:"all",label:"บทความทั้งหมด",description:"สำรวจบทความทุกหมวดหมู่"},...ARTICLE_CATEGORIES.map(c=>({...c,description:"บทความในหมวด "+c.label}))];
  for(const category of cards){
    const count=category.id==="all"?posts.length:(counts.get(category.id)||0);
    const link=createNode("a","article-category-card");
    link.href="./list.html"+(category.id==="all"?"":"?category="+encodeURIComponent(category.id));
    link.append(createNode("span","article-category-card__count",String(count).padStart(2,"0")));
    link.append(createNode("h2",null,category.label));
    link.append(createNode("p",null,category.description));
    link.append(createNode("span","article-category-card__action","ดูรายการบทความ ↗"));
    root.append(link);
  }
  announce("มีบทความเผยแพร่ "+posts.length+" เรื่อง");
}
/**
 * Render at most PAGE_SIZE public cards until the reader requests more.
 * Search still covers all *already fetched* published posts; this improves
 * browser DOM work, NOT Firestore reads (server-side pagination is separate).
 * @param {Array<object>} posts Already authorized, published-only articles.
 */
/**
 * Display published articles in bounded batches. Without data-access
 * callbacks, retain the original in-memory presenter used by existing tests.
 * With callbacks, the default unfiltered view pages on Firestore; searching
 * or filtering explicitly switches to a complete published-only read so that
 * matches outside the first Firestore page are never silently omitted.
 *
 * @param {Array<object>} posts Already fetched published articles (legacy mode).
 * @param {{fetchPage?:Function,loadAll?:Function}} options Read-only callbacks.
 */
function renderSearchableList(posts,{fetchPage=null,loadAll=null}={}){
  const search=document.getElementById("article-search");
  const category=document.getElementById("article-category");
  const count=document.getElementById("article-count");
  const more=document.getElementById("article-more");
  if(!root||!search||!category)return;
  const pageSize=12;
  const remote=typeof fetchPage==="function"&&typeof loadAll==="function";
  const queryCategory=new URLSearchParams(location.search).get("category");
  const allowed=new Set(["all",...ARTICLE_CATEGORIES.map(x=>x.id)]);
  category.value=allowed.has(queryCategory)?queryCategory:"all";
  let allPosts=posts,fullScan=null;
  let visible=[],shown=pageSize,searchTimer=null;
  let mode=remote?"paged":"local",pagePosts=[],cursor=null,hasMore=true;
  let loading=false,generation=0;

  function paintLocal(){
    const displayed=visible.slice(0,shown);
    renderList(root,displayed);
    if(more)more.hidden=shown>=visible.length;
    if(count)count.textContent="พบ "+visible.length+" บทความ · แสดง "+displayed.length+" รายการ";
    announce("แสดง "+displayed.length+" จาก "+visible.length+" บทความ");
  }
  function refreshLocal(){
    const keyword=search.value.trim().toLocaleLowerCase("th-TH");
    const chosen=category.value;
    visible=allPosts.filter(post=>(chosen==="all"||post.category===chosen)&&
      (!keyword||(String(post.title||"")+" "+String(post.summary||"")+" "+
        categoryName(post.category)).toLocaleLowerCase("th-TH").includes(keyword)));
    shown=pageSize;
    paintLocal();
  }
  function paintPage(){
    renderList(root,pagePosts);
    if(more)more.hidden=!hasMore;
    if(count)count.textContent="แสดง "+pagePosts.length+" บทความล่าสุด"+(hasMore?" · ยังมีรายการเพิ่มเติม":"");
    announce("แสดง "+pagePosts.length+" บทความเผยแพร่");
  }
  function showReadError(error){
    console.warn("Article listing:",error?.code||"unknown");
    showMessage(root,"โหลดบทความไม่สำเร็จ",articleLoadErrorMessage(error),"./list.html","ลองโหลดใหม่");
    if(count)count.textContent="ไม่สามารถโหลดบทความได้ กรุณาลองใหม่";
    announce("ไม่สามารถโหลดบทความได้");
  }
  async function loadEntirePublished(fallback=false){
    const token=++generation;
    mode="local";
    loading=false;
    if(more){more.hidden=true;more.disabled=true;}
    if(count)count.textContent="กำลังค้นหาจากบทความเผยแพร่ทั้งหมด...";
    try{
      if(!fullScan)fullScan=loadAll().catch(error=>{fullScan=null;throw error;});
      allPosts=await fullScan;
      if(token!==generation||mode!=="local")return;
      refreshLocal();
      if(fallback&&count)count.textContent+=" · โหมดสำรองเมื่อ Index ยังไม่พร้อม";
    }catch(error){
      if(token===generation&&mode==="local")showReadError(error);
    }finally{
      if(token===generation&&more)more.disabled=false;
    }
  }
  async function loadNextPage(){
    if(loading||!hasMore||mode!=="paged")return;
    const token=generation;
    loading=true;
    if(more)more.disabled=true;
    if(count)count.textContent="กำลังโหลดบทความเพิ่มเติม...";
    try{
      const page=await fetchPage(cursor);
      if(token!==generation||mode!=="paged")return;
      pagePosts.push(...page.posts);
      cursor=page.cursor;
      hasMore=page.hasMore;
      paintPage();
    }catch(error){
      if(token!==generation||mode!=="paged")return;
      if(error?.code==="failed-precondition"){
        // No unrestricted read: the fallback remains status==published.
        await loadEntirePublished(true);
      }else{
        showReadError(error);
        if(more){more.hidden=false;more.textContent="ลองโหลดบทความอีกครั้ง";}
      }
    }finally{
      if(token===generation){
        loading=false;
        if(more)more.disabled=false;
      }
    }
  }
  function applyFilters(){
    if(!remote){refreshLocal();return;}
    if(fullScan){
      // Reuse the one complete published-only read rather than charging again.
      void loadEntirePublished();
      return;
    }
    if(search.value.trim()||category.value!=="all"){
      void loadEntirePublished();
      return;
    }
    if(mode!=="paged"){
      ++generation;
      mode="paged";pagePosts=[];cursor=null;hasMore=true;
      if(more){more.hidden=true;more.textContent="แสดงบทความเพิ่มเติม";}
      void loadNextPage();
    }
  }
  category.addEventListener("change",()=>{
    if(searchTimer!==null){clearTimeout(searchTimer);searchTimer=null;}
    const url=new URL(location.href);
    if(category.value==="all")url.searchParams.delete("category");
    else url.searchParams.set("category",category.value);
    history.replaceState(null,"",url);
    applyFilters();
  });
  search.addEventListener("input",()=>{
    if(searchTimer!==null)clearTimeout(searchTimer);
    searchTimer=setTimeout(()=>{searchTimer=null;applyFilters();},140);
  });
  more?.addEventListener("click",()=>{
    if(mode==="paged")return loadNextPage();
    shown+=pageSize;
    paintLocal();
  });
  if(remote){
    if(search.value.trim()||category.value!=="all")void loadEntirePublished();
    else void loadNextPage();
  }else refreshLocal();
}

/**
 * Firestore-backed 12-article batch with snapshot cursors. The 13th document
 * is a lookahead used only to determine whether the Load More action remains.
 * The last DISPLAYED snapshot is the next page cursor, avoiding skipped items.
 *
 * @param {object} fs Firestore modular SDK.
 * @param {object} db Firestore database instance.
 * @param {object|null} cursor The last displayed QueryDocumentSnapshot.
 */
async function fetchPublishedPage(fs,db,cursor=null){
  const constraints=[
    fs.where("status","==","published"),
    fs.orderBy("publishedAt","desc")
  ];
  if(cursor)constraints.push(fs.startAfter(cursor));
  constraints.push(fs.limit(13));
  const query=fs.query(fs.collection(db,"articles"),...constraints);
  const snapshot=await fs.getDocs(query);
  const batch=snapshot.docs.slice(0,12);
  return {
    posts:batch.map(d=>({id:d.id,...d.data()})),
    cursor:batch.at(-1)||null,
    hasMore:snapshot.docs.length>12
  };
}

function renderLatest(posts){
  if(!root)return;
  const latest=posts[0];
  if(!latest){
    showMessage(root,"ยังไม่มีบทความเผยแพร่","เมื่อมีบทความใหม่ล่าสุด บทความจะปรากฏที่นี่โดยอัตโนมัติ","articles/catalog.html","ดูแคตตาล็อก");
    return;
  }
  const card=createArticleCard(latest,{featured:true,hrefPrefix:"articles/"});
  root.replaceChildren(card);
  announce("บทความล่าสุด: "+latest.title);
}
function renderPost(post){
  if(!root)return;
  const source=parseGoogleSource(post.sourceUrl);
  if(!source){
    showMessage(root,"ไม่สามารถแสดงเอกสารได้","ลิงก์เอกสารไม่อยู่ในรูปแบบที่รองรับ");
    return;
  }
  root.replaceChildren();
  root.append(createNode("p","article-kicker",categoryName(post.category)));
  root.append(createNode("h1","article-reader__title",post.title));
  const meta=createNode("p","article-reader__meta");
  const date=formatArticleDate(post.publishedAt);
  meta.textContent=[post.authorName||"ผู้เขียน",date].filter(Boolean).join(" · ");
  root.append(meta);
  if(post.summary)root.append(createNode("p","article-reader__summary",post.summary));
  const embedded=createEmbed(post.sourceUrl,post.title);
  if(embedded)root.append(embedded);
  document.title=post.title+" | บทความ · thonpin";
  announce("เปิดบทความ "+post.title);
}

// The fast latest-article query needs the (status, publishedAt DESC)
// composite index. Some newly connected Firebase projects have not deployed
// firestore.indexes.json yet. The fallback still enforces published-only
// reads server-side and sorts the public results locally.
async function fetchLatestPublished(fs,db){
  const articles=fs.collection(db,"articles");
  try{
    const indexed=fs.query(articles,fs.where("status","==","published"),
      fs.orderBy("publishedAt","desc"),fs.limit(1));
    const snapshot=await fs.getDocs(indexed);
    return snapshot.docs.map(d=>({id:d.id,...d.data()}));
  }catch(error){
    if(error?.code!=="failed-precondition")throw error;
    console.warn("Latest article composite index not available; using published-only fallback");
    const publishedOnly=fs.query(articles,fs.where("status","==","published"));
    const snapshot=await fs.getDocs(publishedOnly);
    return sortArticles(snapshot.docs.map(d=>({id:d.id,...d.data()}))).slice(0,1);
  }
}
function articleLoadErrorMessage(error){
  if(error?.code==="permission-denied")
    return "Firestore ปฏิเสธการอ่านบทความเผยแพร่ กรุณาตรวจ Firestore Rules ของ collection articles";
  if(error?.code==="failed-precondition")
    return "Firestore ยังไม่พร้อมสำหรับคำสั่งค้นหาบทความ โปรดตรวจ Composite Index ของ status และ publishedAt";
  if(error?.code==="unavailable"||error?.code==="deadline-exceeded")
    return "ไม่สามารถเชื่อมต่อ Firestore ได้ในขณะนี้ กรุณาตรวจเครือข่ายแล้วลองโหลดใหม่";
  return "โปรดลองโหลดหน้าใหม่ หรือตรวจสอบการตั้งค่า Firestore และสิทธิ์การอ่านบทความ";
}

async function boot(){
  if(!root||!view)return;
  if(!firebaseConfigured){
    showMessage(root,"ระบบบทความยังไม่เปิดใช้งาน","ต้องตั้งค่า Firebase Authentication และ Firestore ก่อน จึงจะเผยแพร่บทความจากหน้าเขียนบทความได้",
      view==="home"?"articles/catalog.html":"./catalog.html","ดูแคตตาล็อกบทความ");
    announce("รอเชื่อมต่อฐานข้อมูลบทความ");
    return;
  }
  try{
    // Load Firebase only after a real Firebase project is configured.
    const [{initializeApp},fs]=await Promise.all([
      import("https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore-lite.js")
    ]);
    const db=fs.getFirestore(initializeApp(firebaseConfig));
    if(view==="post"){
      const id=new URLSearchParams(location.search).get("id");
      if(!id||!/^[A-Za-z0-9_-]{6,120}$/.test(id)){
        showMessage(root,"ไม่พบบทความ","ลิงก์บทความไม่ถูกต้อง","./list.html","กลับไปหน้าบทความ");
        return;
      }
      const snapshot=await fs.getDoc(fs.doc(db,"articles",id));
      if(!snapshot.exists()||snapshot.data().status!=="published"){
        showMessage(root,"ไม่พบบทความ","บทความอาจยังไม่เผยแพร่หรือถูกนำออก","./list.html","บทความทั้งหมด");
        return;
      }
      renderPost({id:snapshot.id,...snapshot.data()});
      return;
    }
    if(view==="list"){
      // Read at most 13 published docs in the default library view.
      // Full-category and substring searches intentionally scan ALL published
      // articles once, because Firestore is not a full-text search engine.
      const readAllPublished=async()=>{
        const q=fs.query(fs.collection(db,"articles"),fs.where("status","==","published"));
        const snapshot=await fs.getDocs(q);
        return sortArticles(snapshot.docs.map(d=>({id:d.id,...d.data()})));
      };
      renderSearchableList([],{
        fetchPage:cursor=>fetchPublishedPage(fs,db,cursor),
        loadAll:readAllPublished
      });
      return;
    }
    if(view==="home"){
      renderLatest(await fetchLatestPublished(fs,db));
    }else if(view==="catalog"){
      const q=fs.query(fs.collection(db,"articles"),fs.where("status","==","published"));
      const snapshot=await fs.getDocs(q);
      renderCatalog(sortArticles(snapshot.docs.map(d=>({id:d.id,...d.data()}))));
    }
  }catch(error){
    // Never expose raw Firestore diagnostic URLs or backend details in UI.
    console.error("Article catalog load:",error?.code||"unknown");
    const path=view==="home"?"articles/list.html":"./list.html";
    showMessage(root,"โหลดบทความไม่สำเร็จ",articleLoadErrorMessage(error),path,"รายการบทความ");
    announce("ไม่สามารถโหลดบทความได้");
  }
}
boot();
