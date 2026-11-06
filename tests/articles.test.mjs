import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseGoogleSource,extractGoogleSource,ARTICLE_CATEGORIES,sortArticles} from "../assets/js/articles-core.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const id="1vsPad6qriLIvmullwkpaUC-oEf-gsaUP_q6aCh1F-d8";

test("read-only Google Docs, Slides and Drive PDF links convert to approved embeds",()=>{
  const cases=[
    ["https://docs.google.com/document/d/"+id+"/edit?usp=sharing","docs","/preview"],
    ["https://docs.google.com/presentation/d/"+id+"/edit?usp=sharing","slides","/preview"],
    ["https://drive.google.com/file/d/"+id+"/view?usp=sharing","pdf","/preview"],
    ["https://drive.google.com/open?id="+id,"pdf","/preview"]
  ];
  for(const [url,type,part] of cases){
    const parsed=parseGoogleSource(url);
    assert.equal(parsed?.type,type,url);
    assert.ok(parsed.embedUrl.includes(part));
    assert.match(parsed.embedUrl,/^https:\/\/(docs\.google\.com|drive\.google\.com)\//);
  }
});

test("pasted Google iframe extracts a URL but never returns pasted HTML",()=>{
  const pasted='<iframe width="640" onload="alert(1)" src="https://docs.google.com/presentation/d/'+id+'/embed?start=false&amp;loop=false"></iframe>';
  const value=extractGoogleSource(pasted);
  assert.equal(value?.type,"slides");
  assert.ok(!value.embedUrl.includes("<iframe"));
  assert.ok(!value.embedUrl.includes("onload"));
});

test("untrusted protocols, hostnames and arbitrary iframe sources are rejected",()=>{
  for(const input of [
    "javascript:alert(1)",
    "https://docs.google.com.evil.example/document/d/"+id+"/edit",
    "https://evil.example/file/d/"+id+"/view",
    '<iframe src="https://evil.example/script"></iframe>',
    "http://docs.google.com/document/d/"+id+"/edit",
    "https://drive.google.com/folders/"+id,
    "https://user:password@docs.google.com/document/d/"+id+"/edit"
  ]) assert.equal(extractGoogleSource(input),null,input);
});

test("article categories, date sorting and home latest design are defined",()=>{
  assert.equal(ARTICLE_CATEGORIES.length,5);
  const sorted=sortArticles([
    {title:"old",publishedAt:{seconds:100}},
    {title:"latest",publishedAt:{seconds:200}}
  ]);
  assert.equal(sorted[0].title,"latest");
  const home=read("index.html");
  assert.match(home,/id="article-latest" data-articles-root/);
  assert.match(home,/articles\/catalog\.html/);
  assert.match(home,/assets\/js\/articles-public\.js/);
  assert.match(read("assets/js/articles-public.js"),/fs\.orderBy\("publishedAt","desc"\),fs\.limit\(1\)/);
});

test("all catalog, list, reader and editor pages expose the intended accessible controls",()=>{
  for(const page of ["catalog","list","post","editor"]){
    const html=read("articles/"+page+".html");
    assert.match(html,/<main id="main">/);
    assert.match(html,/<html lang="th"/);
    assert.match(html,/articles\.css/);
    assert.ok(!html.includes('style="'),'inline style would be blocked by CSP');
  }
  assert.match(read("articles/list.html"),/id="article-search"/);
  assert.match(read("articles/list.html"),/id="article-category"/);
  assert.match(read("articles/post.html"),/id="article-reader"/);
  assert.match(read("articles/editor.html"),/id="editor-login"/);
  assert.match(read("articles/editor.html"),/id="editor-workspace" hidden/);
  assert.match(read("articles/editor.html"),/id="post-source"/);
});

test("publishing remains locked behind Firebase Auth and immutable publisher roles",()=>{
  const rules=read("firestore.rules");
  const editor=read("assets/js/articles-editor.js");
  const config=read("assets/js/articles-config.js");
  assert.match(rules,/function isPublisher\(\)/);
  assert.match(rules,/article_publishers/);
  assert.match(rules,/allow list, create, update, delete: if false/);
  assert.match(rules,/allow create: if isPublisher\(\)/);
  assert.match(rules,/allow update: if isPublisher\(\)/);
  assert.match(rules,/resource\.data\.status == 'published' \|\| isPublisher\(\)/);
  assert.match(editor,/signInWithPopup/);
  assert.match(editor,/role\.exists\(\)&&role\.data\(\)\.enabled===true/);
  assert.ok(!editor.includes("innerHTML"),"raw iframe HTML must not be inserted into DOM");
  assert.match(config,/projectId:"github-thonpin"/);
  assert.match(config,/authDomain:"github-thonpin\.firebaseapp\.com"/);
  assert.match(config,/apiKey:"AIza[^"]+"/);
  const index=JSON.parse(read("firestore.indexes.json"));
  assert.equal(index.indexes[0].fields[1].fieldPath,"publishedAt");
});

test("Firebase scripts, embedding frames and Google assets are declared in CSP",()=>{
  const pages=["index.html","articles/catalog.html","articles/list.html","articles/post.html","articles/editor.html"];
  for(const file of pages){
    const html=read(file);
    assert.match(html,/Content-Security-Policy/);
    assert.match(html,/https:\/\/www\.gstatic\.com/);
    assert.match(html,/frame-src https:\/\/docs\.google\.com https:\/\/drive\.google\.com/);
    assert.ok(!html.includes("'unsafe-inline'"));
  }
});

test("Google sign-in shows actionable Firebase error codes rather than one generic message",()=>{
  const editor=read("assets/js/articles-editor.js");
  const page=read("articles/editor.html");
  for(const code of [
    "auth/unauthorized-domain",
    "auth/operation-not-allowed",
    "auth/popup-blocked",
    "auth/network-request-failed"
  ])assert.ok(editor.includes(code),"missing diagnostic: "+code);
  assert.match(editor,/explainAuthError\(code\)/);
  assert.match(editor,/Firebase Authentication/);
  assert.match(editor,/const guidance=error\?\.code==="permission-denied"/);
  assert.match(page,/articles-editor\.js\?v=auth-internal-20261106/);
  assert.match(page,/id="editor-auth-help"/);
  assert.match(editor,/function authDiagnostic\(error\)/);
  assert.ok(!editor.includes("notice(authStatus,error.message"),"do not expose raw OAuth credentials");
});
