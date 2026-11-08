import {firebaseConfig,firebaseConfigured} from "./articles-config.js?v=github-thonpin-20261106";
import {ARTICLE_CATEGORIES,categoryName,createNode,createArticleCard,createEmbed,formatArticleDate,sortArticles,parseGoogleSource} from "./articles-core.js";

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
