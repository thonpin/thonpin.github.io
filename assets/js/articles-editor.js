import {firebaseConfig,firebaseConfigured} from "./articles-config.js?v=github-thonpin-20261106";
import {ARTICLE_CATEGORIES,createNode,createEmbed,extractGoogleSource,sortArticles} from "./articles-core.js";

const $=id=>document.getElementById(id);
const login=$("editor-login"),logout=$("editor-logout"),authStatus=$("editor-auth-status");
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
function showWorkspace(enabled){
  workspace.hidden=!enabled;
  logout.hidden=!currentUser;
  login.hidden=!!currentUser;
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
    const snapshot=await fs.getDocs(fs.collection(db,"articles"));
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
      import("https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js")
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
        if(error?.code!=="auth/popup-closed-by-user"){
          console.error("Google sign-in:",error);
          notice(authStatus,"เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบ Authorized Domains ของ Firebase และลองใหม่","error");
        }
      }
    });
    logout.addEventListener("click",()=>authApi.signOut(auth));
    authApi.onAuthStateChanged(auth,async user=>{
      const token=++authenticationGeneration;
      currentUser=user;authorized=false;editing=null;
      showWorkspace(false);
      if(!user){
        notice(authStatus,"กรุณาเข้าสู่ระบบด้วย Google เพื่อเขียนบทความ");
        return;
      }
      notice(authStatus,"กำลังตรวจสอบสิทธิ์บัญชีผู้เขียน...");
      try{
        const role=await fs.getDoc(fs.doc(db,"article_publishers",user.uid));
        if(token!==authenticationGeneration)return;
        authorized=role.exists()&&role.data().enabled===true;
        showWorkspace(authorized);
        if(!authorized){
          notice(authStatus,"เข้าสู่ระบบแล้ว แต่บัญชีนี้ยังไม่ได้รับสิทธิ์ Publisher โปรดติดต่อผู้ดูแลระบบ","error");
          return;
        }
        notice(authStatus,"เข้าสู่ระบบสำเร็จ · "+(user.displayName||"ผู้เขียน")+" · สามารถเผยแพร่บทความได้","success");
        await loadForEdit();
        await loadHistory();
      }catch(error){
        console.error("Publisher role:",error);
        if(token===authenticationGeneration)notice(authStatus,"ไม่สามารถตรวจสอบสิทธิ์ Publisher ได้ โปรดลองเข้าสู่ระบบใหม่","error");
      }
    });
  }catch(error){
    console.error("Article editor initialization:",error);
    notice(authStatus,"เปิดบริการเขียนบทความไม่ได้ ตรวจสอบการตั้งค่า Firebase และการเชื่อมต่ออินเทอร์เน็ต","error");
  }
}
bootstrap();
