import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../assets/css/styles.css',import.meta.url),'utf8');
const noscriptCss=readFileSync(new URL('../assets/css/noscript.css',import.meta.url),'utf8');
const script=readFileSync(new URL('../assets/js/app.js',import.meta.url),'utf8');

function all(pattern,source=html){
  return [...source.matchAll(pattern)];
}

test('HTML anchors, labels and external links remain valid',()=>{
  const ids=all(/\bid="([^"]+)"/g).map(x=>x[1]);
  assert.equal(ids.length,new Set(ids).size,'duplicate IDs are not allowed');
  for(const match of all(/\bhref="#([^"]+)"/g)){
    assert.ok(ids.includes(match[1]),'missing target #'+match[1]);
  }
  for(const match of all(/\baria-labelledby="([^"]+)"/g)){
    for(const name of match[1].split(/\s+/))assert.ok(ids.includes(name),'missing ARIA target '+name);
  }
  const external=all(/<a\b[^>]*target="_blank"[^>]*>/g).map(x=>x[0]);
  assert.ok(external.length>0);
  for(const anchor of external)assert.match(anchor,/rel="[^"]*noopener/);
  assert.equal(all(/<h1\b/g).length,1);
  assert.match(html,/<main id="main">/);
  assert.match(html,/rel="canonical"/);
});

test('approved portfolio content and accessibility fallbacks remain present',()=>{
  assert.equal(all(/<article\b[^>]*class="project-card\b/g).length,9);
  assert.equal(all(/<article\b[^>]*class="education-card\b/g).length,2);
  const roles=all(/<span class="time-when">([^<]+)</g).map(x=>x[1]);
  assert.deepEqual(roles,['2023 — PRESENT','2022 — 2023']);
  assert.match(html,/Master of Education \(M\.Ed\.\)/);
  assert.match(html,/Doctor of Philosophy \(Ph\.D\.\)/);
  assert.match(html,/กำลังศึกษา · In Progress/);
  assert.ok(!html.includes('Curriculum overview'),'removed external course links must not reappear');
  for(const tech of ['Python','Java','React','PHP','MariaDB'])assert.ok(html.includes("'"+tech+"'"),tech+' is missing from code editor');
  assert.match(html,/<div class="projects-grid"[^>]*tabindex="-1"/);
  assert.match(html,/id="projects-status"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html,/<noscript><link rel="stylesheet" href="assets\/css\/noscript\.css\?v=[^"]+"><\/noscript>/);
  assert.match(noscriptCss,/\.projects-grid \.project-card\[hidden\]\s*\{\s*display:\s*block\s*!important/);
  assert.ok(!html.includes("'unsafe-inline'"),'inline CSS should not weaken CSP');
});

test('CSS supports light contrast, scrolled code and the requested footer size',()=>{
  assert.match(css,/--subtle:#506466/);
  assert.match(css,/\.code-content\{[^}]*overflow-x:auto/);
  assert.match(css,/\.code-line\{[^}]*width:max-content/);
  assert.match(css,/\.site-footer \.footer-note,\s*\.site-footer \.footer-note a\{font-size:10px/);
  assert.match(css,/#projects-grid:focus-visible/);
  assert.ok(!css.includes('.experience-compact{max-width:880px}'));
  // CSS structure smoke check, including nested media query braces.
  let depth=0,comment=false,quote=null;
  for(let i=0;i<css.length;i++){
    const ch=css[i],next=css[i+1];
    if(comment){if(ch==='*'&&next==='/'){comment=false;i++}continue;}
    if(quote){if(ch==='\\'){i++;continue}if(ch===quote)quote=null;continue;}
    if(ch==='/'&&next==='*'){comment=true;i++;continue;}
    if(ch==='"'||ch==="'"){quote=ch;continue;}
    if(ch==='{')depth++;
    if(ch==='}')depth--;
    assert.ok(depth>=0,'unexpected closing CSS brace');
  }
  assert.equal(depth,0,'unclosed CSS blocks');
  assert.equal(comment,false);
  assert.equal(quote,null);
});

function createHarness(){
  let activeElement=null, observerCallback=null, scrolled=0,focused=0;
  const events={};
  const makeElement=(id='')=>{
    const state=new Set();
    const element={
      id,attrs:{},listeners:{},dataset:{},hidden:false,disabled:false,textContent:'',
      classList:{
        toggle(key,force){const on=force===undefined?!state.has(key):force;if(on)state.add(key);else state.delete(key);return on},
        contains(key){return state.has(key)}
      },
      getAttribute(key){return this.attrs[key]},
      setAttribute(key,value){this.attrs[key]=value},
      removeAttribute(key){delete this.attrs[key]},
      addEventListener(type,callback){this.listeners[type]=callback},
      click(){this.listeners.click?.()},
      focus(){activeElement=this;focused++},
      scrollIntoView(){scrolled++},
      contains(value){return value===this}
    };
    return element;
  };
  const ids={};
  const navIds=all(/<nav\b[^>]*id="primary-nav"[^>]*>([\s\S]*?)<\/nav>/g)[0]?.[1]||'';
  const navLinks=[...navIds.matchAll(/href="(#[^"]+)"/g)].map(x=>{
    const node=makeElement();node.attrs.href=x[1];return node;
  });
  for(const name of ['theme-toggle','menu-toggle','primary-nav','projects-grid','project-pagination','project-prev','project-next','project-page-status','project-page-count','projects-status','year',...navLinks.map(x=>x.attrs.href.slice(1))])ids[name]=makeElement(name);
  ids['primary-nav'].querySelectorAll=()=>navLinks;
  ids['primary-nav'].contains=node=>navLinks.includes(node);
  const categories=all(/<article\b[^>]*class="project-card[^"]*"[^>]*data-category="([^"]+)"/g).map(x=>x[1]);
  const cards=categories.map(category=>{
    const node=makeElement();
    node.dataset.category=category;
    return node;
  });
  const filters=['all','enterprise','education','security'].map(category=>{
    const node=makeElement();
    node.dataset.filter=category;
    node.querySelector=()=>({textContent:''});
    return node;
  });
  const meta=makeElement(),data={};
  const document={
    documentElement:{dataset:{theme:'dark'}},
    get activeElement(){return activeElement},
    getElementById:id=>ids[id]??null,
    querySelector:selector=>selector==='meta[name="theme-color"]'?meta:null,
    querySelectorAll:selector=>selector==='[data-filter]'?filters:selector==='.projects-grid .project-card'?cards:[],
    addEventListener(type,callback){events[type]=callback}
  };
  const window={
    innerWidth:390,
    addEventListener(type,callback){events['window:'+type]=callback},
    matchMedia:()=>({matches:true}),
    IntersectionObserver:class{
      constructor(callback){observerCallback=callback}
      observe(){}
    }
  };
  const localStorage={
    getItem:key=>data[key]??null,
    setItem(key,value){data[key]=value}
  };
  runInNewContext(script,{document,window,localStorage});
  const visible=()=>cards.map((card,index)=>card.hidden?null:index+1).filter(Boolean);
  return {ids,cards,filters,events,navLinks,meta,visible,
    get focus(){return activeElement},
    get focusCount(){return focused},
    get scrollCount(){return scrolled},
    triggerSection(id){observerCallback?.([{target:ids[id],isIntersecting:true,boundingClientRect:{top:100}}])}
  };
}

test('gallery filters and pagination operate on all nine cards',()=>{
  const app=createHarness();
  assert.deepEqual(app.visible(),[1,2,3,4,5,6]);
  app.ids['project-next'].click();
  assert.deepEqual(app.visible(),[7,8,9]);
  assert.equal(app.focus,app.ids['projects-grid'],'focus should move to updated project list');
  assert.ok(app.scrollCount>=1);
  app.ids['project-prev'].click();
  assert.deepEqual(app.visible(),[1,2,3,4,5,6]);
  app.filters[1].click();
  assert.deepEqual(app.visible(),[1,3,4,5,7]);
  app.filters[2].click();
  assert.deepEqual(app.visible(),[2,6,8]);
  app.filters[3].click();
  assert.deepEqual(app.visible(),[9]);
  app.filters[0].click();
  assert.deepEqual(app.visible(),[1,2,3,4,5,6]);
  assert.match(app.ids['projects-status'].textContent,/9 ผลงาน/);
});

test('theme, keyboard navigation and active section respond correctly',()=>{
  const app=createHarness();
  app.ids['theme-toggle'].click();
  assert.equal(app.meta.attrs.content,'#f5f8f6');
  app.ids['menu-toggle'].click();
  assert.equal(app.ids['menu-toggle'].attrs['aria-expanded'],'true');
  assert.equal(app.focus,app.navLinks[0],'open mobile menu should focus first link');
  app.events.keydown({key:'Escape'});
  assert.equal(app.ids['menu-toggle'].attrs['aria-expanded'],'false');
  assert.equal(app.focus,app.ids['menu-toggle'],'Escape returns focus to menu button');
  app.triggerSection('work');
  assert.deepEqual(app.navLinks.filter(x=>x.attrs['aria-current']==='location').map(x=>x.attrs.href),['#work']);
});
