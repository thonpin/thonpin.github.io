import {firebaseConfig,firebaseConfigured} from "./articles-config.js";
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
  const cards=[{id:"all",label:"บทความทั้งหมด",description:"สำรวจบทความทุกหมวดหมู่"},...ARTICLE_CATEGORIES.map(c=>({...c,description:"บทความในหมวด "+c.label}))];
  for(const category of cards){
    const count=category.id==="all"?posts.length:posts.filter(p=>p.category===category.id).length;
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
function renderSearchableList(posts){
  const search=document.getElementById("article-search");
  const category=document.getElementById("article-category");
  const count=document.getElementById("article-count");
  if(!root||!search||!category)return;
  const queryCategory=new URLSearchParams(location.search).get("category");
  const allowed=new Set(["all",...ARTICLE_CATEGORIES.map(x=>x.id)]);
  category.value=allowed.has(queryCategory)?queryCategory:"all";
  const refresh=()=>{
    const keyword=search.value.trim().toLocaleLowerCase("th-TH");
    const chosen=category.value;
    const results=posts.filter(post=>(chosen==="all"||post.category===chosen)&&
      (!keyword||(post.title+" "+post.summary+" "+categoryName(post.category)).toLocaleLowerCase("th-TH").includes(keyword)));
    renderList(root,results);
    if(count)count.textContent="พบ "+results.length+" บทความ";
    announce("พบ "+results.length+" บทความ");
  };
  category.addEventListener("change",()=>{
    const url=new URL(location.href);
    if(category.value==="all")url.searchParams.delete("category");
    else url.searchParams.set("category",category.value);
    history.replaceState(null,"",url);
    refresh();
  });
  search.addEventListener("input",refresh);
  refresh();
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
    let results;
    if(view==="home"){
      const q=fs.query(fs.collection(db,"articles"),fs.where("status","==","published"),
        fs.orderBy("publishedAt","desc"),fs.limit(1));
      const snapshot=await fs.getDocs(q);
      results=snapshot.docs.map(d=>({id:d.id,...d.data()}));
    }else{
      const q=fs.query(fs.collection(db,"articles"),fs.where("status","==","published"));
      const snapshot=await fs.getDocs(q);
      results=sortArticles(snapshot.docs.map(d=>({id:d.id,...d.data()})));
    }
    if(view==="home")renderLatest(results);
    if(view==="catalog")renderCatalog(results);
    if(view==="list")renderSearchableList(results);
  }catch(error){
    console.error("Article catalog load:",error);
    const path=view==="home"?"articles/list.html":"./list.html";
    showMessage(root,"โหลดบทความไม่สำเร็จ","โปรดลองโหลดหน้าใหม่ หรือตรวจสอบการตั้งค่า Firestore และสิทธิ์การอ่านบทความ",path,"รายการบทความ");
    announce("ไม่สามารถโหลดบทความได้");
  }
}
boot();
