// Pure article helpers shared by public pages and the editor.
// Never trust a pasted iframe: accept a Google read-only URL and build the embed ourselves.
export const ARTICLE_CATEGORIES=Object.freeze([
  {id:"software",label:"Software Engineering",icon:"code"},
  {id:"security",label:"Cybersecurity",icon:"shield"},
  {id:"ai-education",label:"AI & Digital Education",icon:"sparkles"},
  {id:"research",label:"Research & Innovation",icon:"book"},
  {id:"other",label:"บทความทั่วไป",icon:"file"}
]);
export const categoryName=id=>ARTICLE_CATEGORIES.find(x=>x.id===id)?.label||"บทความ";

export function parseGoogleSource(value){
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
      embed="https://docs.google.com/"+match[1]+"/d/"+match[2]+(type==="docs"?"/preview":"/embed?start=false&loop=false&delayms=3000");
    }else{
      match=new RegExp("^/(document|presentation)/d/e/("+idPattern+")/(?:pub|embed)/?$").exec(path);
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
export function extractGoogleSource(input){
  if(typeof input!=="string")return null;
  let candidate=input.trim();
  if(/^<iframe\b/i.test(candidate)){
    const match=/\bsrc\s*=\s*(["'])(https:\/\/[^"'<>]+)\1/i.exec(candidate);
    if(!match)return null;
    candidate=match[2].replaceAll("&amp;","&");
  }
  return parseGoogleSource(candidate);
}

export function formatArticleDate(value){
  const date=typeof value?.toDate==="function"?value.toDate():value instanceof Date?value:null;
  if(!date||!Number.isFinite(date.getTime()))return "";
  return new Intl.DateTimeFormat("th-TH",{year:"numeric",month:"short",day:"numeric"}).format(date);
}
export function sortArticles(items){
  return [...items].sort((a,b)=>{
    const sec=x=>x?.publishedAt?.seconds??x?.createdAt?.seconds??0;
    return sec(b)-sec(a);
  });
}
export function articleLink(id){return "./post.html?id="+encodeURIComponent(id);}
export function createNode(tag,className,text){
  const element=document.createElement(tag);
  if(className)element.className=className;
  if(text!==undefined)element.textContent=text;
  return element;
}
export function createArticleCard(article,{featured=false,hrefPrefix=""}={}){
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

export function createEmbed(sourceUrl,title){
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
