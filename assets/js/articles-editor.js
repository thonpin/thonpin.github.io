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



const $=id=>document.getElementById(id);
const login=$("editor-login"),logout=$("editor-logout"),retry=$("editor-retry"),authStatus=$("editor-auth-status"),authHelp=$("editor-auth-help");
const workspace=$("editor-workspace"),form=$("article-form"),save=$("editor-save");
const saveStatus=$("editor-save-status"),previewArea=$("editor-preview-area"),historyArea=$("editor-history");
const title=$("post-title"),summary=$("post-summary"),category=$("post-category");
const source=$("post-source"),status=$("post-status");
const historyFilter=$("editor-history-filter"),historySearch=$("editor-history-search"),historyMore=$("editor-history-more");
const readinessButton=$("editor-check-readiness"),readinessStatus=$("editor-readiness-status");
const historyCount=$("editor-history-count"),dirtyStatus=$("editor-dirty-status");
const titleCount=$("post-title-count"),summaryCount=$("post-summary-count");
const sourceCheck=$("post-source-check"),statusHint=$("post-status-hint");
const allowCategories=new Set(ARTICLE_CATEGORIES.map(x=>x.id));
// Advisory client check only; Firestore Security Rules enforce the same restriction.
const ARTICLE_ADMIN_EMAIL="tpssrru@gmail.com";
let auth=null,db=null,authApi=null,fs=null,currentUser=null,editing=null,authorized=false;
let authenticationGeneration=0,historyPosts=[],cleanFormSnapshot=null,lastPreviewSource=null,saveRequiresReload=false;
// A stable document reference prevents duplicate creates after ambiguous network errors.
let pendingCreateRef=null,pendingSubmissionSnapshot=null;
const historyPageSize=12;
let historyShown=historyPageSize;
// Bounded admin-only history pages; explicit search loads all authorized
// documents once to preserve complete-library search semantics.
let historyMode="local",historyCursor=null,historyHasMore=false,historyBusy=false;
let historyGeneration=0,historyCountRevision=0,historyTotals=null,historyFullCache=null,historyFullPromise=null;
let historySearchTimer=null;
// Audit is strictly read-only, on demand, and scoped to the current session.
let readinessGeneration=0,historyForceFull=false;

// Ephemeral per-page correlation only; never persisted or shared with Firestore.
const diagnosticCorrelationId=typeof crypto!=="undefined"&&typeof crypto.randomUUID==="function"?
  crypto.randomUUID():null;

/**
 * Emit a locally visible, sanitized JSON diagnostic. This is NOT an
 * authoritative SIEM record or a server-side audit log; trusted enforcement
 * must remain in Firestore Rules and Google Cloud Audit Logs.
 *
 * @param {string} eventType Fixed event identifier (no user-provided values).
 * @param {"error"|"warning"} severity Severity of the client-side failure.
 * @param {unknown} code Untrusted Firebase error code; never log full errors.
 */
function logClientDiagnostic(eventType,severity,code){
  const safeCode=typeof code==="string"&&/^[A-Za-z0-9/_-]{1,64}$/.test(code)?code:"unknown";
  const record=JSON.stringify({
    timestamp:new Date().toISOString(),
    event_type:eventType,
    severity,
    component:"article-editor",
    correlation_id:diagnosticCorrelationId,
    outcome:"error",
    error_code:safeCode
  });
  if(severity==="warning")console.warn(record);
  else console.error(record);
}

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

// Keep drafts in memory only. Do not persist private content to localStorage.
function formSnapshot(){
  return JSON.stringify([title?.value||"",summary?.value||"",category?.value||"",
    source?.value||"",status?.value||""]);
}
function hasUnsavedChanges(){
  return authorized && cleanFormSnapshot!==null
    && formSnapshot()!==cleanFormSnapshot;
}
function confirmDiscardChanges(){
  return !hasUnsavedChanges() || typeof window==="undefined"
    || window.confirm("มีการแก้ไขบทความที่ยังไม่ได้บันทึก ยืนยันออกจากระบบและทิ้งการแก้ไข?");
}
function handleFormInput(event){
  if(event?.target===source && lastPreviewSource!==null
      && source.value!==lastPreviewSource){
    lastPreviewSource=null;
    previewArea?.replaceChildren(createNode("p","article-message",
      "ลิงก์เอกสารถูกเปลี่ยนแล้ว กรุณากดดูตัวอย่างอีกครั้ง"));
  }
  refreshEditorHints();
}
function refreshEditorHints(){
  if(titleCount)titleCount.textContent=(title?.value.length||0)+"/160 อักขระ";
  if(summaryCount)summaryCount.textContent=(summary?.value.length||0)+"/360 อักขระ";
  if(sourceCheck){
    const parsed=source?.value.trim()?extractGoogleSource(source.value):null;
    const names={docs:"Google Docs",slides:"Google Slides",pdf:"Google Drive PDF"};
    sourceCheck.textContent=!source?.value.trim()?"ยังไม่ได้ระบุลิงก์เอกสาร":
      parsed?"ลิงก์ที่รองรับ: "+names[parsed.type]+" · ตรวจสิทธิ์การแชร์ก่อนเผยแพร่":
        "รูปแบบลิงก์ไม่รองรับ โปรดใช้ Google Docs, Slides หรือ PDF จาก Drive";
    sourceCheck.dataset.level=source?.value.trim()&&!parsed?"error":"";
  }
  if(statusHint)statusHint.textContent=status?.value==="published"?
    "เผยแพร่สาธารณะ: ผู้ชมทุกคนจะเปิดบทความได้หลังบันทึกสำเร็จ":
    editing?.status==="published"?
      "เปลี่ยนเป็นฉบับร่าง: บทความจะหยุดแสดงต่อสาธารณะเมื่อบันทึกสำเร็จ":
      "ฉบับร่างจะไม่แสดงต่อสาธารณะ";
  if(dirtyStatus){
    dirtyStatus.textContent=hasUnsavedChanges()?"มีการแก้ไขที่ยังไม่ได้บันทึก":
      "บันทึกข้อมูลล่าสุดแล้ว หรือยังไม่มีการแก้ไข";
    dirtyStatus.dataset.level=hasUnsavedChanges()?"warning":"";
  }
  if(save&&!save.disabled){
    save.textContent=status?.value==="published"?
      editing?.status==="published"?"บันทึกการแก้ไข":"เผยแพร่บทความ":
      editing?.status==="published"?"ยกเลิกเผยแพร่และเก็บฉบับร่าง":"บันทึกฉบับร่าง";
  }
}
function markFormClean(){
  cleanFormSnapshot=formSnapshot();
  refreshEditorHints();
}
form?.addEventListener("input",handleFormInput);
form?.addEventListener("change",handleFormInput);
// Native browser warning; only triggers after a genuine unsaved edit.
if(typeof window!=="undefined"){
  window.addEventListener("beforeunload",event=>{
    if(!hasUnsavedChanges())return;
    event.preventDefault();
    event.returnValue="";
  });
}
historyFilter?.addEventListener("change",()=>{
  if(historySearchTimer!==null){clearTimeout(historySearchTimer);historySearchTimer=null;}
  historyShown=historyPageSize;
  if(historyMode==="local")renderHistory();
  else void refreshHistoryControls();
});
historySearch?.addEventListener("input",()=>{
  if(historySearchTimer!==null)clearTimeout(historySearchTimer);
  if(historyMode==="local"){historyShown=historyPageSize;renderHistory();return;}
  historySearchTimer=setTimeout(()=>{
    historySearchTimer=null;historyShown=historyPageSize;
    void refreshHistoryControls();
  },140);
});
readinessButton?.addEventListener("click",()=>{void checkArticleReadiness();});
historyMore?.addEventListener("click",()=>{
  if(!authorized)return;
  if(historyMode==="paged"){void fetchHistoryPage();return;}
  historyShown+=historyPageSize;
  renderHistory();
});

function showWorkspace(enabled){
  workspace.hidden=!enabled;
  logout.hidden=!currentUser;
  login.hidden=!!currentUser;
}

// Discard sensitive draft data from the DOM whenever the identity changes.
// Hiding the workspace alone is not enough on shared computers.
function clearEditorSession(){
  editing=null;
  historyPosts=[];
  historyShown=historyPageSize;
  historyGeneration++;
  historyCountRevision++;
  historyMode="local";
  historyCursor=null;
  historyHasMore=false;
  historyBusy=false;
  historyTotals=null;
  historyFullCache=null;
  historyFullPromise=null;
  historyForceFull=false;
  readinessGeneration++;
  if(readinessButton)readinessButton.disabled=false;
  notice(readinessStatus,"ยังไม่ได้ตรวจสอบความพร้อมของ Firestore Production");
  if(historySearchTimer!==null){clearTimeout(historySearchTimer);historySearchTimer=null;}
  if(historyMore)historyMore.hidden=true;
  lastPreviewSource=null;
  saveRequiresReload=false;
  pendingCreateRef=null;
  pendingSubmissionSnapshot=null;
  if(save)save.disabled=false;
  if(historyFilter)historyFilter.value="all";
  if(historySearch)historySearch.value="";
  form?.reset();
  const heading=$("editor-heading");
  if(heading)heading.textContent="สร้างบทความใหม่";
  previewArea?.replaceChildren(createNode("p","article-message","วางลิงก์และกดดูตัวอย่างเอกสาร"));
  historyArea?.replaceChildren();
  notice(saveStatus,"");
  const counts=["editor-total-count","editor-draft-count","editor-published-count"];
  counts.forEach(id=>{const node=$(id);if(node)node.textContent="0";});
  notice(historyCount,"");
  markFormClean();
}

function sameEditorSession(uid,generation){
  return authorized===true && currentUser?.uid===uid
    && authenticationGeneration===generation;
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
    lastPreviewSource=null;
    previewArea.replaceChildren(createNode("p","article-message","ลิงก์เอกสารไม่ถูกต้อง กรุณาตรวจสอบแล้วกดดูตัวอย่างใหม่"));
    notice(saveStatus,"กรุณาวางลิงก์ Google Docs, Slides หรือ PDF ใน Drive หรือโค้ด iframe จาก Google","error");
    return;
  }
  const figure=createEmbed(parsed.sourceUrl,title.value.trim()||"ตัวอย่างเอกสาร");
  lastPreviewSource=source.value;
  previewArea.replaceChildren(figure);
  notice(saveStatus,"แสดงตัวอย่าง Embed แล้ว โปรดตรวจว่าเอกสารเปิดดูได้โดยผู้เข้าชมทั่วไป");
}
$("editor-preview")?.addEventListener("click",renderPreview);

/**
 * Filter the already loaded admin-only articles, then create only a bounded
 * number of DOM rows. The current Firestore read is still unpaged and must
 * be treated separately from this rendering optimization.
 */
/**
 * Render only authorized history. Paged mode draws already requested pages,
 * while full-search/local modes retain the existing bounded DOM behavior.
 */
function renderHistory(){
  if(!authorized||!historyArea)return;
  const keyword=historySearch?.value.trim().toLocaleLowerCase("th-TH")||"";
  const selected=historyFilter?.value||"all";
  const visible=historyPosts.filter(post=>
    (selected==="all"||post.status===selected)
    && (!keyword||String(post.title||"").toLocaleLowerCase("th-TH").includes(keyword)
       ||String(post.summary||"").toLocaleLowerCase("th-TH").includes(keyword))
  );
  const counts=historyTotals||(
    historyMode==="local"||historyMode==="full"?
      {total:historyPosts.length,
        draft:historyPosts.filter(post=>post.status==="draft").length,
        published:historyPosts.filter(post=>post.status==="published").length}:null
  );
  for(const [id,value] of [["editor-total-count",counts?.total],
      ["editor-draft-count",counts?.draft],["editor-published-count",counts?.published]]){
    const element=$(id);
    if(element)element.textContent=value===undefined?"—":String(value);
  }
  const displayed=historyMode==="paged"?visible:visible.slice(0,historyShown);
  if(historyMode==="paged"){
    notice(historyCount,"แสดง "+displayed.length+
      (historyTotals?" จากทั้งหมด "+historyTotals.total:" บทความที่โหลดแล้ว")+
      " · เรียงตามวันที่ปรับปรุงล่าสุด");
  }else{
    notice(historyCount,"แสดง "+displayed.length+" จาก "+visible.length+
      " ที่ตรงเงื่อนไข (ทั้งหมด "+(counts?.total??historyPosts.length)+" บทความ)");
  }
  historyArea.replaceChildren();
  if(historyMore){
    historyMore.hidden=historyMode==="paged"?!historyHasMore:displayed.length>=visible.length;
    historyMore.disabled=historyBusy;
    historyMore.textContent="แสดงบทความเพิ่มเติม";
  }
  if(!visible.length){
    historyArea.append(createNode("p","article-message",
      historyPosts.length?"ไม่มีบทความที่ตรงกับตัวกรอง":"ยังไม่มีบทความที่บันทึกไว้"));
    return;
  }
  const fragment=document.createDocumentFragment();
  displayed.forEach(post=>{
    const row=createNode("div","article-history-entry");
    const details=createNode("div","article-history-entry__details");
    details.append(
      createNode("strong",null,post.title||"ไม่มีชื่อบทความ"),
      createNode("small","article-history-status "+(post.status==="published"?"article-history-status--published":""),
        post.status==="published"?"เผยแพร่แล้ว":"ฉบับร่าง")
    );
    const actions=createNode("div","article-history-entry__actions");
    const editLink=createNode("a",null,"แก้ไข ↗");
    editLink.href="./editor.html?id="+encodeURIComponent(post.id);
    actions.append(editLink);
    if(post.status==="published"){
      const viewLink=createNode("a",null,"ดูบทความ ↗");
      viewLink.href="./post.html?id="+encodeURIComponent(post.id);
      actions.append(viewLink);
    }
    row.append(details,actions);
    fragment.append(row);
  });
  historyArea.append(fragment);
}

/**
 * Fetch up to 13 authorized documents using the last displayed snapshot as
 * cursor (12 visible + one lookahead). updatedAt is mandatory for all new
 * articles; legacy records missing it need a pre-release data audit because
 * an orderBy excludes documents without the ordered field.
 */
async function fetchAdminHistoryBatch(firestore,database,lastDocument=null){
  const constraints=[firestore.orderBy("updatedAt","desc")];
  if(lastDocument)constraints.push(firestore.startAfter(lastDocument));
  constraints.push(firestore.limit(historyPageSize+1));
  const query=firestore.query(firestore.collection(database,"articles"),...constraints);
  const snapshot=await firestore.getDocs(query);
  const docs=snapshot.docs.slice(0,historyPageSize);
  return {
    posts:docs.map(doc=>({id:doc.id,...doc.data()})),
    cursor:docs.at(-1)||null,
    hasMore:snapshot.docs.length>historyPageSize
  };
}

/**
 * Three independent index count aggregations supply the Admin summary tiles
 * without fetching full draft bodies. They are billed by index entries.
 * Unknown counts are shown as "—", never as an invented zero.
 */
async function updateHistoryTotals(uid,sessionGeneration){
  if(typeof fs?.getCount!=="function")return;
  const revision=++historyCountRevision;
  try{
    const articles=fs.collection(db,"articles");
    const [total,draft,published]=await Promise.all([
      fs.getCount(articles),
      fs.getCount(fs.query(articles,fs.where("status","==","draft"))),
      fs.getCount(fs.query(articles,fs.where("status","==","published")))
    ]);
    if(!sameEditorSession(uid,sessionGeneration)||revision!==historyCountRevision)return;
    historyTotals={
      total:total.data().count,
      draft:draft.data().count,
      published:published.data().count
    };
    if(historyBusy){
      for(const [id,value] of [["editor-total-count",historyTotals.total],
          ["editor-draft-count",historyTotals.draft],
          ["editor-published-count",historyTotals.published]]){
        const node=$(id);if(node)node.textContent=String(value);
      }
    }else renderHistory();
  }catch(error){
    if(!sameEditorSession(uid,sessionGeneration)||revision!==historyCountRevision)return;
    logClientDiagnostic("article.history.count","warning",error?.code);
    historyTotals=null;
  }
}

/** Load one authorized Firestore page; never reuse a previous identity's data. */
async function fetchHistoryPage(){
  const sessionGeneration=authenticationGeneration,uid=currentUser?.uid;
  const token=historyGeneration;
  if(!sameEditorSession(uid,sessionGeneration)||historyMode!=="paged"||
      historyBusy||!historyHasMore||!db||!fs)return;
  historyBusy=true;
  if(historyMore)historyMore.disabled=true;
  notice(historyCount,"กำลังโหลดรายการบทความ...");
  try{
    const batch=await fetchAdminHistoryBatch(fs,db,historyCursor);
    if(!sameEditorSession(uid,sessionGeneration)||historyGeneration!==token||
        historyMode!=="paged")return;
    historyPosts.push(...batch.posts);
    historyCursor=batch.cursor;
    historyHasMore=batch.hasMore;
    renderHistory();
  }catch(error){
    if(!sameEditorSession(uid,sessionGeneration)||historyGeneration!==token)return;
    logClientDiagnostic("article.history.page","error",error?.code);
    notice(historyCount,"โหลดรายการเพิ่มเติมไม่สำเร็จ โปรดลองอีกครั้ง","error");
    if(historyMore){historyMore.hidden=false;historyMore.textContent="ลองโหลดอีกครั้ง";}
  }finally{
    if(sameEditorSession(uid,sessionGeneration)&&historyGeneration===token){
      historyBusy=false;
      if(historyMore)historyMore.disabled=false;
    }
  }
}

/**
 * Free-text search and status filters must cover all authorized articles,
 * not only previously fetched cursor pages. One full read is cached per
 * session; subsequent filters reuse the same data.
 */
async function refreshHistoryControls(){
  const sessionGeneration=authenticationGeneration,uid=currentUser?.uid;
  if(!sameEditorSession(uid,sessionGeneration)||!db||!fs)return;
  const needsFull=historyForceFull||!!historySearch?.value.trim()||historyFilter?.value!=="all";
  if(!needsFull){
    if(historyFullCache){
      historyGeneration++;
      historyBusy=false;
      historyMode="full";historyPosts=historyFullCache;
      historyShown=historyPageSize;
      renderHistory();
      return;
    }
    historyGeneration++;
    historyMode="paged";
    historyPosts=[];
    historyCursor=null;historyHasMore=true;
    historyShown=historyPageSize;historyBusy=false;
    historyArea?.replaceChildren(createNode("p","article-message","กำลังโหลดรายการ..."));
    await fetchHistoryPage();
    return;
  }
  const token=++historyGeneration;
  historyBusy=false;historyMode="full";historyShown=historyPageSize;
  if(historyFullCache){
    historyPosts=historyFullCache;
    renderHistory();
    return;
  }
  historyPosts=[];
  if(historyMore)historyMore.hidden=true;
  historyArea?.replaceChildren(createNode("p","article-message","กำลังค้นหาจากบทความทั้งหมด..."));
  notice(historyCount,"กำลังค้นหาบทความที่มีสิทธิ์ทั้งหมด...");
  try{
    // One in-flight full read is shared across rapid filter changes.
    if(!historyFullPromise){
      historyFullPromise=fs.getDocs(fs.collection(db,"articles"))
        .then(snapshot=>sortArticles(snapshot.docs.map(doc=>({id:doc.id,...doc.data()}))))
        .catch(error=>{historyFullPromise=null;throw error;});
    }
    const posts=await historyFullPromise;
    if(!sameEditorSession(uid,sessionGeneration)||historyGeneration!==token||
        historyMode!=="full")return;
    historyFullCache=posts;
    historyPosts=historyFullCache;
    renderHistory();
  }catch(error){
    if(!sameEditorSession(uid,sessionGeneration)||historyGeneration!==token)return;
    logClientDiagnostic("article.history.search","error",error?.code);
    notice(historyCount,"ไม่สามารถค้นหาบทความได้ โปรดตรวจสอบสิทธิ์ Firestore","error");
    historyArea?.replaceChildren(createNode("p","article-message","ไม่สามารถค้นหาบทความได้"));
  }
}

/**
 * Check two missing-field hazards using Firestore aggregation queries instead
 * of downloading private article bodies. Query counts with orderBy() omit
 * documents missing that field. The compound publishedAt query also checks
 * index readiness. Results are advisory, not Firebase Ruleset attestation.
 * No create/update/delete APIs are called by this function.
 * @returns {Promise<void>}
 */
async function checkArticleReadiness(){
  const session=authenticationGeneration,uid=currentUser?.uid;
  if(!sameEditorSession(uid,session)||!fs||!db)return;
  if(typeof fs.getCount!=="function"){
    notice(readinessStatus,"ไม่สามารถตรวจได้: Firebase SDK ไม่รองรับ Count Aggregation","warning");
    return;
  }
  const audit=++readinessGeneration;
  if(readinessButton)readinessButton.disabled=true;
  notice(readinessStatus,"กำลังตรวจสอบจำนวนเอกสารและ Index โดยไม่แก้ไขข้อมูล...");
  try{
    const articles=fs.collection(db,"articles");
    const queries=[
      articles,
      fs.query(articles,fs.where("status","==","published")),
      fs.query(articles,fs.orderBy("updatedAt","desc")),
      fs.query(articles,fs.where("status","==","published"),fs.orderBy("publishedAt","desc"))
    ];
    const results=await Promise.allSettled(queries.map(query=>fs.getCount(query)));
    if(!sameEditorSession(uid,session)||readinessGeneration!==audit)return;
    const count=index=>{
      const result=results[index];
      if(result.status!=="fulfilled")return null;
      const value=result.value.data().count;
      return Number.isSafeInteger(value)&&value>=0?value:null;
    };
    const [total,published,updatedCount,publishedIndexedCount]=[0,1,2,3].map(count);
    const notes=[];
    let statusLevel="";
    let shouldFallback=false;
    if(total===null||updatedCount===null){
      notes.push("ยังยืนยันความครบถ้วนของ updatedAt ไม่ได้");
      statusLevel="warning";
    }else if(updatedCount<total){
      const missing=total-updatedCount;
      notes.push("พบ "+missing+" บทความที่อาจไม่มี updatedAt; จะใช้รายการแบบอ่านทั้งหมดเพื่อไม่ให้บทความเก่าตกหล่น");
      statusLevel="warning";
      shouldFallback=true;
    }else if(updatedCount>total){
      notes.push("จำนวนเอกสารเปลี่ยนระหว่างตรวจสอบ กรุณาลองตรวจอีกครั้ง");
      statusLevel="warning";
    }else{
      notes.push("การเรียง updatedAt ครอบคลุม "+total+" บทความ");
    }
    if(published===null||publishedIndexedCount===null){
      const error=results[3].status==="rejected"?results[3].reason:null;
      notes.push(error?.code==="failed-precondition"?
        "Composite Index articles(status ASC, publishedAt DESC) ยังไม่พร้อม: ตรวจสถานะ Enabled ใน Firebase Console":
        "ยังยืนยัน Index/ฟิลด์ publishedAt ของบทความเผยแพร่ไม่ได้");
      statusLevel="warning";
    }else if(publishedIndexedCount<published){
      notes.push("พบ "+(published-publishedIndexedCount)+
        " บทความเผยแพร่ที่อาจไม่มี publishedAt; หน้า Public ที่เรียงวันที่อาจไม่แสดงบทความเหล่านั้น");
      statusLevel="warning";
    }else if(publishedIndexedCount>published){
      notes.push("จำนวนบทความเผยแพร่เปลี่ยนระหว่างตรวจสอบ กรุณาลองตรวจอีกครั้ง");
      statusLevel="warning";
    }else{
      notes.push("Query Index ของบทความเผยแพร่ตอบกลับสำเร็จ ("+published+" เรื่อง)");
    }
    for(const result of results){
      if(result.status==="rejected"){
        logClientDiagnostic("article.readiness.check","warning",result.reason?.code);
      }
    }
    // Count aggregations are independent snapshots, not a transaction.
    notes.push("ผลตรวจเป็นข้อมูล ณ ช่วงเวลาที่อ่าน ไม่ใช่การรับรอง Firestore Ruleset");
    notice(readinessStatus,notes.join(" · "),statusLevel);
    if(shouldFallback&&!historyForceFull){
      historyForceFull=true;
      await refreshHistoryControls();
    }else if(!shouldFallback&&historyForceFull&&updatedCount!==null&&total!==null
        &&updatedCount===total){
      historyForceFull=false;
      historyFullCache=null;
      historyFullPromise=null;
      if(!historySearch?.value.trim()&&historyFilter?.value==="all"){
        await refreshHistoryControls();
      }
    }
  }catch(error){
    if(sameEditorSession(uid,session)&&readinessGeneration===audit){
      logClientDiagnostic("article.readiness.check","warning",error?.code);
      notice(readinessStatus,"ตรวจความพร้อมไม่สำเร็จ: ยังไม่สามารถยืนยัน Index และข้อมูลวันที่ได้","warning");
    }
  }finally{
    if(sameEditorSession(uid,session)&&readinessGeneration===audit&&readinessButton){
      readinessButton.disabled=false;
    }
  }
}

/** Refresh counts and currently selected history after login or a save. */
async function loadHistory(){
  const sessionGeneration=authenticationGeneration,uid=currentUser?.uid;
  if(!sameEditorSession(uid,sessionGeneration)||!db||!fs)return;
  historyFullCache=null;
  historyFullPromise=null;
  historyTotals=null;
  ["editor-total-count","editor-draft-count","editor-published-count"].forEach(id=>{
    const element=$(id);if(element)element.textContent="—";
  });
  void updateHistoryTotals(uid,sessionGeneration);
  await refreshHistoryControls();
}

async function loadForEdit(){
  const generation=authenticationGeneration,uid=currentUser?.uid;
  if(!sameEditorSession(uid,generation))return;
  const id=new URLSearchParams(location.search).get("id");
  if(!id)return;
  if(!/^[A-Za-z0-9_-]{6,120}$/.test(id)){
    notice(saveStatus,"รหัสบทความไม่ถูกต้อง","error");return;
  }
  try{
    const snapshot=await fs.getDoc(fs.doc(db,"articles",id));
    if(!sameEditorSession(uid,generation))return;
    if(!snapshot.exists()){notice(saveStatus,"ไม่พบบทความที่เลือก","error");return;}
    editing={id:snapshot.id,...snapshot.data()};
    title.value=editing.title||"";
    summary.value=editing.summary||"";
    category.value=allowCategories.has(editing.category)?editing.category:"other";
    source.value=editing.sourceUrl||"";
    status.value=editing.status==="published"?"published":"draft";
    $("editor-heading").textContent="แก้ไขบทความ";
    markFormClean();
    notice(saveStatus,"เปิดบทความสำหรับแก้ไขแล้ว");
  }catch(error){
    if(!sameEditorSession(uid,generation))return;
    logClientDiagnostic("article.editor.read","error",error?.code);
    notice(saveStatus,"ไม่สามารถโหลดบทความเพื่อนำมาแก้ไขได้","error");
  }
}
/**
 * Verify an ambiguous Firestore create using its preallocated document ID.
 * No new write is issued until this read resolves; retry reuses the same ID.
 * This is an advisory recovery mechanism: Firestore rules still control access.
 * @returns {Promise<void>}
 */
async function verifyPendingCreate(){
  if(!authorized||!currentUser||!db||!fs||!pendingCreateRef)return;
  const generation=authenticationGeneration,uid=currentUser.uid;
  const ref=pendingCreateRef;
  notice(saveStatus,"กำลังตรวจสอบว่าบทความถูกบันทึกแล้วหรือไม่...");
  try{
    const snapshot=await fs.getDoc(ref);
    if(!sameEditorSession(uid,generation)||pendingCreateRef!==ref)return;
    if(snapshot.exists()){
      editing={id:ref.id,...snapshot.data()};
      pendingCreateRef=null;
      saveRequiresReload=false;
      history.replaceState(null,"","./editor.html?id="+encodeURIComponent(ref.id));
      $("editor-heading").textContent="แก้ไขบทความ";
      if(pendingSubmissionSnapshot)cleanFormSnapshot=pendingSubmissionSnapshot;
      pendingSubmissionSnapshot=null;
      save.disabled=false;
      notice(saveStatus,"ตรวจพบว่าบันทึกบทความลง Firestore แล้ว ไม่จำเป็นต้องสร้างซ้ำ","success");
      if(hasUnsavedChanges())saveStatus.append(" · มีการแก้ไขเพิ่มเติมที่ยังไม่ได้บันทึก");
      await loadHistory();
    }else{
      // A retry of setDoc() on this *same* reference cannot create a second ID.
      saveRequiresReload=false;
      pendingSubmissionSnapshot=null;
      save.disabled=false;
      notice(saveStatus,"ยังไม่พบบทความที่รหัสเดิม คุณสามารถตรวจข้อมูลแล้วกดบันทึกอีกครั้ง ระบบจะใช้รหัสบทความเดิม","warning");
    }
  }catch(error){
    if(!sameEditorSession(uid,generation)||pendingCreateRef!==ref)return;
    saveRequiresReload=true;
    save.disabled=true;
    logClientDiagnostic("article.save.verify","warning",error?.code);
    showPendingCreateRecovery("ยังตรวจสอบสถานะการบันทึกไม่ได้ โปรดตรวจสอบการเชื่อมต่อแล้วลองใหม่");
  }finally{
    if(sameEditorSession(uid,generation))refreshEditorHints();
  }
}
/**
 * Render recovery actions without copying Firebase error payloads or tokens.
 * @param {string} message A non-sensitive user-facing explanation.
 */
function showPendingCreateRecovery(message){
  saveStatus.replaceChildren();
  saveStatus.dataset.level="warning";
  saveStatus.append(message+" ");
  const verify=createNode("button","article-button article-button--outline","ตรวจสอบสถานะการบันทึก");
  verify.type="button";
  verify.addEventListener("click",()=>{void verifyPendingCreate();});
  saveStatus.append(verify);
  if(pendingCreateRef){
    const link=createNode("a",null,"เปิดลิงก์บทความเดิม ↗");
    link.href="./editor.html?id="+encodeURIComponent(pendingCreateRef.id);
    saveStatus.append(link);
  }
  saveStatus.append(" · หากมีข้อความที่ยังไม่ได้บันทึก โปรดคัดลอกเก็บไว้ก่อนออกจากหน้า");
}

async function saveArticle(event){
  event.preventDefault();
  // Ignore double clicks and submissions until a successful write has been
  // verified with a follow-up read. Never create a duplicate on read failure.
  if(save?.disabled||saveRequiresReload)return;
  if(!authorized||!currentUser||!db||!fs){
    notice(saveStatus,"คุณไม่มีสิทธิ์เผยแพร่บทความ กรุณาเข้าสู่ระบบผู้เขียนที่ได้รับอนุญาต","error");
    return;
  }
  const generation=authenticationGeneration,uid=currentUser.uid;
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
  const needsVisibilityConfirmation=published?editing?.status!=="published":
    editing?.status==="published";
  if(needsVisibilityConfirmation&&typeof window!=="undefined"){
    const confirmed=window.confirm(published?
      "ยืนยันเผยแพร่บทความนี้สู่สาธารณะ? โปรดตรวจสิทธิ์การแชร์เอกสารก่อนเผยแพร่":
      "ยืนยันยกเลิกเผยแพร่? บทความจะกลับเป็นฉบับร่างและผู้อ่านทั่วไปจะเปิดไม่ได้");
    if(!confirmed){notice(saveStatus,"ยกเลิกการเปลี่ยนสถานะแล้ว");return;}
  }
  // Remember exactly what was submitted. Edits made while Firestore is slow
  // must remain marked unsaved after this request completes.
  const submittedSnapshot=formSnapshot();
  const original=editing;
  const payload={
    title:titleValue,
    summary:summaryValue,
    category:category.value,
    sourceUrl:parsed.sourceUrl,
    sourceType:parsed.type,
    status:published?"published":"draft",
    updatedAt:fs.serverTimestamp(),
    publishedAt:published?(original?.status==="published"&&original?.publishedAt?
      original.publishedAt:fs.serverTimestamp()):null
  };
  save.disabled=true;
  notice(saveStatus,"กำลังบันทึก...");
  let id=null,writeCommitted=false;
  try{
    if(original){
      id=original.id;
      await fs.updateDoc(fs.doc(db,"articles",id),payload);
    }else{
      // Allocate the ID BEFORE writing. A failed network acknowledgement must
      // never cause another randomly generated article ID on retry.
      const ref=pendingCreateRef||fs.doc(fs.collection(db,"articles"));
      pendingCreateRef=ref;
      id=ref.id;
      await fs.setDoc(ref,{
        ...payload,authorUid:currentUser.uid,
        authorName:(currentUser.displayName||"ผู้เขียน").slice(0,100),
        createdAt:fs.serverTimestamp()
      });
    }
    writeCommitted=true;
    if(!sameEditorSession(uid,generation))return;
    // A successful Firestore write is the commit point. Follow-up reads may
    // still fail independently; don't ever misreport the write as unsuccessful.
    history.replaceState(null,"","./editor.html?id="+encodeURIComponent(id));
    const snapshot=await fs.getDoc(fs.doc(db,"articles",id));
    if(!sameEditorSession(uid,generation))return;
    if(!snapshot.exists())throw new Error("post-save-readback-missing");
    editing={id,...snapshot.data()};
    pendingCreateRef=null;
    pendingSubmissionSnapshot=null;
    $("editor-heading").textContent="แก้ไขบทความ";
    cleanFormSnapshot=submittedSnapshot;
    saveStatus.replaceChildren();
    saveStatus.dataset.level="success";
    saveStatus.append("บันทึกบทความเรียบร้อยแล้ว ");
    if(published){
      const articleLink=createNode("a",null,"เปิดบทความ ↗");
      articleLink.href="./post.html?id="+encodeURIComponent(id);
      saveStatus.append(articleLink);
    }else{
      saveStatus.append(" (ฉบับร่างยังไม่แสดงต่อสาธารณะ)");
    }
    if(hasUnsavedChanges())saveStatus.append(" · มีการแก้ไขเพิ่มเติมที่ยังไม่บันทึก");
    await loadHistory();
  }catch(error){
    if(!sameEditorSession(uid,generation))return;
    if(writeCommitted){
      // Write acknowledged, but readback failed: never report a false failure.
      saveRequiresReload=true;
      pendingSubmissionSnapshot=submittedSnapshot;
      cleanFormSnapshot=submittedSnapshot;
      $("editor-heading").textContent="บันทึกแล้ว · รอตรวจสอบ";
      if(pendingCreateRef){
        showPendingCreateRecovery("บันทึกลง Firestore สำเร็จแล้ว แต่ยังอ่านข้อมูลยืนยันกลับมาไม่ได้");
      }else{
        saveStatus.replaceChildren();
        saveStatus.dataset.level="warning";
        saveStatus.append("บันทึกลง Firestore สำเร็จแล้ว แต่โหลดข้อมูลยืนยันกลับมาไม่ได้ กรุณาเปิดหน้านี้ใหม่ก่อนบันทึกเพิ่มเติม ");
        const reloadLink=createNode("a",null,"เปิดบทความใน Editor อีกครั้ง ↗");
        reloadLink.href="./editor.html?id="+encodeURIComponent(id);
        saveStatus.append(reloadLink);
        if(hasUnsavedChanges())saveStatus.append(" · มีการแก้ไขเพิ่มเติมที่ยังไม่บันทึก โปรดคัดลอกไว้ก่อนออกจากหน้า");
      }
    }else if(!original&&pendingCreateRef&&
      ["unavailable","deadline-exceeded","cancelled","unknown","internal"].includes(error?.code)){
      // Failed network acknowledgement is NOT proof of a failed write.
      saveRequiresReload=true;
      pendingSubmissionSnapshot=submittedSnapshot;
      logClientDiagnostic("article.save.uncertain","warning",error?.code);
      showPendingCreateRecovery("เครือข่ายขัดข้องขณะสร้างบทความ ยังไม่สามารถยืนยันได้ว่า Firestore บันทึกสำเร็จหรือไม่");
    }else{
      logClientDiagnostic("article.save.rejected","error",error?.code);
      notice(saveStatus,"บันทึกไม่สำเร็จ: "+(error?.code==="permission-denied"?
        "Firestore ปฏิเสธสิทธิ์หรือข้อมูลไม่ผ่านกฎ กรุณาตรวจลิงก์เอกสารและสถานะบัญชี":
        "ตรวจการเชื่อมต่อฐานข้อมูลแล้วลองใหม่"),"error");
    }
  }finally{
    if(sameEditorSession(uid,generation)){
      save.disabled=saveRequiresReload;
      refreshEditorHints();
    }
  }
}
form?.addEventListener("submit",saveArticle);

async function checkPublisher(user,token){
  if(!user||!db||!fs)return;
  if(retry){retry.hidden=true;retry.disabled=true;}
  authorized=false;
  showWorkspace(false);
  notice(authStatus,"กำลังตรวจสอบบัญชีผู้ดูแลและสิทธิ์ Firestore...");
  try{
    // Refresh the signed Firebase ID token before checking the account identity.
    const identity=await user.getIdTokenResult(true);
    if(token!==authenticationGeneration)return;
    const claims=identity.claims||{};
    const isAllowed=claims.email===ARTICLE_ADMIN_EMAIL
      && claims.email_verified===true
      && claims.firebase?.sign_in_provider==="google.com";
    if(!isAllowed){
      clearEditorSession();
      notice(authStatus,"บัญชีนี้ไม่มีสิทธิ์เพิ่มหรือแก้ไขบทความ เฉพาะ "+ARTICLE_ADMIN_EMAIL+" (Google ที่ยืนยันแล้ว) เท่านั้น","error");
      return;
    }
    const role=await fs.getDoc(fs.doc(db,"article_publishers",user.uid));
    if(token!==authenticationGeneration)return;
    authorized=role.exists()&&role.data().enabled===true;
    showWorkspace(authorized);
    if(!authorized){
      clearEditorSession();
      notice(authStatus,"บัญชีผู้ดูแลถูกต้อง แต่ยังไม่ได้เปิดสิทธิ์ใน Firestore: ตรวจ article_publishers/{UID} และ enabled = true","error");
      if(retry)retry.hidden=false;
      return;
    }
    notice(authStatus,"เข้าสู่ระบบผู้ดูแลบทความสำเร็จ · "+ARTICLE_ADMIN_EMAIL,"success");
    await loadForEdit();
    await loadHistory();
  }catch(error){
    logClientDiagnostic("article.publisher.check","error",error?.code);
    if(token!==authenticationGeneration)return;
    clearEditorSession();
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
    notice(authStatus,"บัญชีสำหรับจัดการบทความ: "+ARTICLE_ADMIN_EMAIL);
    login.addEventListener("click",async()=>{
      try{
        await authApi.signInWithPopup(auth,new authApi.GoogleAuthProvider());
      }catch(error){
        const code=typeof error?.code==="string"?error.code:"auth/unknown";
        logClientDiagnostic("article.google.signin","error",code);
        const clue=code==="auth/internal-error"?" · ผลตรวจเพิ่มเติม: "+authDiagnostic(error):"";
        if(authHelp)authHelp.hidden=false;
        notice(authStatus,"เข้าสู่ระบบไม่สำเร็จ ["+code+"]: "+explainAuthError(code)+clue,"error");
      }
    });
    logout.addEventListener("click",async()=>{
      if(!confirmDiscardChanges())return;
      // Immediately remove draft content before Firebase finishes signing out.
      authenticationGeneration++;
      authorized=false;
      clearEditorSession();
      showWorkspace(false);
      notice(authStatus,"กำลังออกจากระบบ...");
      try{
        await authApi.signOut(auth);
      }catch(error){
        logClientDiagnostic("article.google.signout","error",error?.code);
        notice(authStatus,"ออกจากระบบไม่สำเร็จ โปรดลองอีกครั้งหรือโหลดหน้าใหม่","error");
        if(retry)retry.hidden=false;
      }
    });
    retry?.addEventListener("click",()=>checkPublisher(currentUser,authenticationGeneration));
    authApi.onAuthStateChanged(auth,user=>{
      const token=++authenticationGeneration;
      currentUser=user;authorized=false;
      clearEditorSession();
      showWorkspace(false);
      if(retry)retry.hidden=true;
      if(user&&authHelp)authHelp.hidden=true;
      if(!user){
        notice(authStatus,"เข้าสู่ระบบด้วย "+ARTICLE_ADMIN_EMAIL+" เพื่อจัดการบทความ");
        return;
      }
      void checkPublisher(user,token);
    });
  }catch(error){
    logClientDiagnostic("article.editor.bootstrap","error",error?.code);
    notice(authStatus,"เปิดบริการเขียนบทความไม่ได้ ตรวจสอบการตั้งค่า Firebase และการเชื่อมต่ออินเทอร์เน็ต","error");
  }
}
bootstrap();
