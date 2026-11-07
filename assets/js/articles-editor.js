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
  let match,type,embed;
  if(host==="docs.google.com"){
    match=new RegExp("^/(document|presentation)/d/("+idPattern+")/(?:edit|view|preview|pub|embed)?/?$").exec(path);
    if(match){
      type=match[1]==="document"?"docs":"slides";
      embed="https://docs.google.com/"+match[1]+"/d/"+match[2]+(type==="docs"?"/preview":(path.includes("/embed")||path.includes("/pub")?"/embed?start=false&loop=false&delayms=3000":"/preview"));
    }else{
      match=new RegExp("^/(document|presentation)/d/e/("+idPattern+")/(?:pub|pubhtml|embed)/?$").exec(path);
      if(!match)return null;
      type=match[1]==="document"?"docs":"slides";
      embed="https://docs.google.com/"+match[1]+"/d/e/"+match[2]+(type==="docs"?"/pub?embedded=true":"/embed?start=false&loop=false&delayms=3000");
    }
  }else if(host==="drive.google.com"){
    match=new RegExp("^/file/d/("+idPattern+")/(?:view|preview|edit)?/?$").exec(path);
    const id=match?.[1]||(path==="/open"||path==="/uc"?url.searchParams.get("id"):null);
    if(!id||!new RegExp("^"+idPattern+"$").test(id))return null;
    type="pdf";
    embed="https://drive.google.com/file/d/"+id+"/preview";
  }else{return null;}
  return {type,embedUrl:embed,sourceUrl:url.href};
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



const $=id=>document.getElementById(id);
const login=$("editor-login"),logout=$("editor-logout"),retry=$("editor-retry"),authStatus=$("editor-auth-status"),authHelp=$("editor-auth-help");
const workspace=$("editor-workspace"),form=$("article-form"),save=$("editor-save");
const saveStatus=$("editor-save-status"),previewArea=$("editor-preview-area"),historyArea=$("editor-history");
const title=$("post-title"),summary=$("post-summary"),category=$("post-category");
const source=$("post-source"),status=$("post-status");
const allowCategories=new Set(ARTICLE_CATEGORIES.map(x=>x.id));
let auth=null,db=null,authApi=null,fs=null,currentUser=null,editing=null,authorized=false;
let authenticationGeneration=0;

function notice(element,text,level=""){
  if(!element)return;
  element.textContent=text;
  element.dataset.level=level;
}
// Show only a controlled diagnostic label, never OAuth URLs, codes or tokens.
function authDiagnostic(error){
  const raw=typeof error?.message==="string"?error.message:"";
  const checks=[
    [/CONFIGURATION_NOT_FOUND/i,"Firebase Authentication ยังไม่พร้อมใช้งานหรือโปรเจกต์ตั้งค่าไม่ครบ"],
    [/OPERATION_NOT_ALLOWED/i,"Google Sign-in ยังไม่ได้เปิดใช้งาน"],
    [/INVALID_IDP_RESPONSE|INVALID_CREDENTIAL_OR_PROVIDER_ID/i,"Firebase ปฏิเสธข้อมูลตอบกลับจาก Google: ตรวจการตั้งค่า OAuth Client และ Redirect URI"],
    [/redirect_uri_mismatch/i,"OAuth Redirect URI ไม่ตรงกับที่อนุญาตใน Google Cloud"],
    [/API_KEY_SERVICE_BLOCKED|API_KEY_INVALID/i,"Firebase API Key ถูกจำกัดหรือไม่ถูกต้อง"],
    [/blocked by Content Security Policy|Content Security Policy/i,"เบราว์เซอร์อาจบล็อกคำขอตามนโยบาย CSP"],
    [/network|Failed to fetch/i,"การเชื่อมต่อบริการ Firebase หรือ Google อาจถูกบล็อก"]
  ];
  return checks.find(([pattern])=>pattern.test(raw))?.[1]||"ไม่พบรายละเอียดสาเหตุเพิ่มเติมใน Error Message ของ Firebase";
}

function showWorkspace(enabled){
  workspace.hidden=!enabled;
  logout.hidden=!currentUser;
  login.hidden=!!currentUser;
}

function explainAuthError(code){
  const messages={
    "auth/unauthorized-domain":"โดเมน thonpin.github.io ยังไม่ได้รับอนุญาต: ไป Firebase Authentication → Settings → Authorized domains → Add domain",
    "auth/operation-not-allowed":"ยังไม่ได้เปิด Google Sign-in: ไป Firebase Authentication → Sign-in method → Google → Enable → Save",
    "auth/popup-blocked":"เบราว์เซอร์บล็อกหน้าต่างเข้าสู่ระบบ กรุณาอนุญาต Pop-ups สำหรับเว็บไซต์นี้ แล้วลองใหม่",
    "auth/popup-closed-by-user":"หน้าต่าง Google Sign-in ถูกปิดก่อนเข้าสู่ระบบเสร็จ กรุณาลองใหม่",
    "auth/cancelled-popup-request":"มีการเรียกเปิดหน้าต่างเข้าสู่ระบบซ้ำ กรุณากดเข้าสู่ระบบใหม่อีกครั้ง",
    "auth/network-request-failed":"เชื่อมต่อบริการ Google/Firebase ไม่สำเร็จ ตรวจเครือข่าย ส่วนขยายที่บล็อกการเชื่อมต่อ หรือทดลองเบราว์เซอร์อื่น",
    "auth/invalid-api-key":"Firebase API Key ไม่ถูกต้องหรือถูกจำกัดไม่ให้ใช้บริการ Authentication ตรวจค่า Web Config และข้อจำกัด API Key",
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.":"Firebase API Key ไม่ถูกต้อง ตรวจค่า Web Config จาก Project settings",
    "auth/invalid-credential":"ข้อมูลยืนยันตัวตนจาก Google ไม่ถูกต้องหรือหมดอายุ กรุณาลองเข้าสู่ระบบใหม่",
    "auth/account-exists-with-different-credential":"อีเมลนี้เคยลงทะเบียนด้วยวิธีเข้าสู่ระบบอื่น กรุณาตรวจสอบวิธีที่เคยใช้",
    "auth/web-storage-unsupported":"เบราว์เซอร์ไม่รองรับหรือปิดการจัดเก็บข้อมูลที่ Firebase Authentication ต้องใช้",
    "auth/too-many-requests":"มีการพยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่แล้วลองอีกครั้ง",
    "auth/internal-error":"Firebase ตอบกลับด้วยข้อผิดพลาดภายใน: ตรวจ Google Sign-in = Enabled, Authorized domains (thonpin.github.io และ github-thonpin.firebaseapp.com), OAuth redirect URI และดู Network Response ของ identitytoolkit.googleapis.com"
  };
  return messages[code]||"เกิดข้อผิดพลาดจาก Firebase Authentication กรุณาตรวจรหัสด้านหน้าและ Console ของเบราว์เซอร์";
}
function renderPreview(){
  const parsed=extractGoogleSource(source.value);
  if(!parsed){
    notice(saveStatus,"กรุณาวางลิงก์ Google Docs, Slides หรือ PDF ใน Drive หรือโค้ด iframe จาก Google","error");
    return;
  }
  const figure=createEmbed(parsed.sourceUrl,title.value.trim()||"ตัวอย่างเอกสาร");
  previewArea.replaceChildren(figure);
  notice(saveStatus,"แสดงตัวอย่าง Embed แล้ว โปรดตรวจว่าเอกสารเปิดดูได้โดยผู้เข้าชมทั่วไป");
}
$("editor-preview")?.addEventListener("click",renderPreview);

async function loadHistory(){
  if(!authorized||!db||!fs)return;
  historyArea.replaceChildren(createNode("p","article-message","กำลังโหลดบทความ..."));
  try{
    const snapshot=await fs.getDocs(fs.query(fs.collection(db,"articles"),fs.where("authorUid","==",currentUser.uid)));
    const posts=sortArticles(snapshot.docs.map(doc=>({id:doc.id,...doc.data()})));
    historyArea.replaceChildren();
    if(!posts.length){
      historyArea.append(createNode("p","article-message","ยังไม่มีบทความที่บันทึกไว้"));
      return;
    }
    posts.forEach(post=>{
      const row=createNode("div","article-history-entry");
      const titleNode=createNode("strong",null,post.title);
      const badges=createNode("small","article-message",post.status==="published"?"เผยแพร่แล้ว":"ฉบับร่าง");
      const details=createNode("div");
      details.append(titleNode,badges);
      const editLink=createNode("a",null,"แก้ไข ↗");
      editLink.href="./editor.html?id="+encodeURIComponent(post.id);
      row.append(details,editLink);
      historyArea.append(row);
    });
  }catch(error){
    console.error("Load articles:",error);
    notice(historyArea,"ไม่สามารถโหลดรายการได้ โปรดตรวจสอบสิทธิ์ Firestore","error");
  }
}
async function loadForEdit(){
  const id=new URLSearchParams(location.search).get("id");
  if(!id)return;
  if(!/^[A-Za-z0-9_-]{6,120}$/.test(id)){
    notice(saveStatus,"รหัสบทความไม่ถูกต้อง","error");return;
  }
  try{
    const snapshot=await fs.getDoc(fs.doc(db,"articles",id));
    if(!snapshot.exists()){notice(saveStatus,"ไม่พบบทความที่เลือก","error");return;}
    if(snapshot.data().authorUid!==currentUser?.uid){
      notice(saveStatus,"คุณไม่มีสิทธิ์แก้ไขบทความของผู้เขียนรายอื่น","error");return;
    }
    editing={id:snapshot.id,...snapshot.data()};
    title.value=editing.title||"";
    summary.value=editing.summary||"";
    category.value=allowCategories.has(editing.category)?editing.category:"other";
    source.value=editing.sourceUrl||"";
    status.value=editing.status==="published"?"published":"draft";
    $("editor-heading").textContent="แก้ไขบทความ";
    notice(saveStatus,"เปิดบทความสำหรับแก้ไขแล้ว");
  }catch(error){
    console.error("Load editor:",error);
    notice(saveStatus,"ไม่สามารถโหลดบทความเพื่อนำมาแก้ไขได้","error");
  }
}
async function saveArticle(event){
  event.preventDefault();
  if(!authorized||!currentUser||!db||!fs){
    notice(saveStatus,"คุณไม่มีสิทธิ์เผยแพร่บทความ กรุณาเข้าสู่ระบบผู้เขียนที่ได้รับอนุญาต","error");
    return;
  }
  if(!form.reportValidity())return;
  const parsed=extractGoogleSource(source.value);
  if(!parsed){
    notice(saveStatus,"ลิงก์ไม่ถูกต้อง รองรับ Google Docs, Slides และ PDF จาก Google Drive เท่านั้น","error");
    source.focus();return;
  }
  const titleValue=title.value.trim(),summaryValue=summary.value.trim();
  if(!titleValue||titleValue.length>160||!summaryValue||summaryValue.length>360||!allowCategories.has(category.value)){
    notice(saveStatus,"โปรดตรวจสอบชื่อเรื่อง คำอธิบาย และหมวดหมู่บทความ","error");return;
  }
  const published=status.value==="published";
  const payload={
    title:titleValue,
    summary:summaryValue,
    category:category.value,
    sourceUrl:parsed.sourceUrl,
    sourceType:parsed.type,
    status:published?"published":"draft",
    updatedAt:fs.serverTimestamp(),
    publishedAt:published?(editing?.status==="published"&&editing?.publishedAt?editing.publishedAt:fs.serverTimestamp()):null
  };
  save.disabled=true;
  notice(saveStatus,"กำลังบันทึก...");
  try{
    let id;
    if(editing){
      id=editing.id;
      await fs.updateDoc(fs.doc(db,"articles",id),payload);
    }else{
      const ref=await fs.addDoc(fs.collection(db,"articles"),{
        ...payload,authorUid:currentUser.uid,
        authorName:(currentUser.displayName||"ผู้เขียน").slice(0,100),
        createdAt:fs.serverTimestamp()
      });
      id=ref.id;
    }
    const snapshot=await fs.getDoc(fs.doc(db,"articles",id));
    editing={id,...snapshot.data()};
    history.replaceState(null,"","./editor.html?id="+encodeURIComponent(id));
    $("editor-heading").textContent="แก้ไขบทความ";
    saveStatus.replaceChildren();
    saveStatus.dataset.level="success";
    saveStatus.append("บันทึกบทความเรียบร้อยแล้ว ");
    if(published){
      const articleLink=createNode("a",null,"เปิดบทความ ↗");
      articleLink.href="./post.html?id="+encodeURIComponent(id);
      saveStatus.append(articleLink);
    }else{saveStatus.append(" (ฉบับร่างยังไม่แสดงต่อสาธารณะ)");}
    await loadHistory();
  }catch(error){
    console.error("Save article:",error);
    notice(saveStatus,"บันทึกไม่สำเร็จ: "+(error?.code==="permission-denied"?"บัญชีไม่มีสิทธิ์เขียนหรือข้อมูลไม่ผ่านกฎ Firestore":"ตรวจการเชื่อมต่อฐานข้อมูลแล้วลองใหม่"),"error");
  }finally{save.disabled=false;}
}
form?.addEventListener("submit",saveArticle);

async function checkPublisher(user,token){
  if(!user||!db||!fs)return;
  if(retry){retry.hidden=true;retry.disabled=true;}
  notice(authStatus,"กำลังตรวจสอบสิทธิ์ Publisher จาก Cloud Firestore...");
  try{
    const role=await fs.getDoc(fs.doc(db,"article_publishers",user.uid));
    if(token!==authenticationGeneration)return;
    authorized=role.exists()&&role.data().enabled===true;
    showWorkspace(authorized);
    if(!authorized){
      notice(authStatus,"เข้าสู่ระบบ Google สำเร็จแล้ว แต่ยังไม่มีสิทธิ์ Publisher: ให้ผู้ดูแลสร้าง article_publishers/{UID} พร้อมฟิลด์ enabled = true ใน Cloud Firestore","error");
      if(retry)retry.hidden=false;
      return;
    }
    notice(authStatus,"เข้าสู่ระบบสำเร็จ · "+(user.displayName||"ผู้เขียน")+" · สามารถเผยแพร่บทความได้","success");
    await loadForEdit();
    await loadHistory();
  }catch(error){
    console.error("Publisher role:",error);
    if(token!==authenticationGeneration)return;
    const code=error?.code||"unknown";
    const isOffline=code==="unavailable"||/client is offline|failed to get document because the client is offline/i.test(error?.message||"");
    let guidance;
    if(isOffline){
      guidance="Google Login สำเร็จ แต่ยังติดต่อ Cloud Firestore ไม่ได้ โปรดตรวจว่า Firebase Project github-thonpin สร้างฐานข้อมูล (default) แล้ว, Firestore API พร้อมใช้งาน และไม่มี Firewall/Extension บล็อก firestore.googleapis.com";
      if(typeof navigator!=="undefined"&&navigator.onLine===false)guidance+=" · เบราว์เซอร์รายงานว่าออฟไลน์";
    }else if(code==="permission-denied"){
      guidance="Firestore ปฏิเสธการอ่านสิทธิ์ Publisher ตรวจว่าติดตั้ง firestore.rules ลงฐานข้อมูล (default) จริง และบัญชีนี้ได้รับสิทธิ์อ่านเอกสาร article_publishers/{UID}";
    }else if(code==="failed-precondition"){
      guidance="Firestore ยังตั้งค่าไม่ครบ โปรดตรวจฐานข้อมูล (default) และ Indexes";
    }else{
      guidance="ตรวจสอบ Firestore Database, Security Rules และ Network → firestore.googleapis.com";
    }
    notice(authStatus,guidance+" ["+code+"]","error");
    if(retry)retry.hidden=false;
  }finally{
    if(retry&&token===authenticationGeneration)retry.disabled=false;
  }
}

async function bootstrap(){
  if(!firebaseConfigured){
    notice(authStatus,"ยังไม่ได้เชื่อม Firebase: ต้องตั้งค่า articles-config.js, เปิด Google Login, ติดตั้งกฎ Firestore และอนุมัติบัญชี Publisher ก่อน");
    login.disabled=true;
    return;
  }
  try{
    const [{initializeApp},authModule,firestoreModule]=await Promise.all([
      import("https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore-lite.js")
    ]);
    authApi=authModule;
    fs=firestoreModule;
    const app=initializeApp(firebaseConfig);
    auth=authApi.getAuth(app);
    db=fs.getFirestore(app);
    login.disabled=false;
    notice(authStatus,"เข้าสู่ระบบด้วยบัญชี Google ที่ได้รับสิทธิ์ Publisher");
    login.addEventListener("click",async()=>{
      try{
        await authApi.signInWithPopup(auth,new authApi.GoogleAuthProvider());
      }catch(error){
        const code=typeof error?.code==="string"?error.code:"auth/unknown";
        console.error("Google sign-in:",code);
        const clue=code==="auth/internal-error"?" · ผลตรวจเพิ่มเติม: "+authDiagnostic(error):"";
        if(authHelp)authHelp.hidden=false;
        notice(authStatus,"เข้าสู่ระบบไม่สำเร็จ ["+code+"]: "+explainAuthError(code)+clue,"error");
      }
    });
    logout.addEventListener("click",()=>authApi.signOut(auth));
    retry?.addEventListener("click",()=>checkPublisher(currentUser,authenticationGeneration));
    authApi.onAuthStateChanged(auth,user=>{
      const token=++authenticationGeneration;
      currentUser=user;authorized=false;editing=null;
      showWorkspace(false);
      if(retry)retry.hidden=true;
      if(user&&authHelp)authHelp.hidden=true;
      if(!user){
        notice(authStatus,"กรุณาเข้าสู่ระบบด้วย Google เพื่อเขียนบทความ");
        return;
      }
      void checkPublisher(user,token);
    });
  }catch(error){
    console.error("Article editor initialization:",error);
    notice(authStatus,"เปิดบริการเขียนบทความไม่ได้ ตรวจสอบการตั้งค่า Firebase และการเชื่อมต่ออินเทอร์เน็ต","error");
  }
}
bootstrap();
