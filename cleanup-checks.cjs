// Dependency-free source/unit checks. Not a replacement for browser/device QA.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/app.js','utf8');
function fn(name){const start=source.indexOf('function '+name+'(');assert(start>=0,name);const end=source.indexOf('\nfunction ',start+1);return source.slice(start,end<0?undefined:end)}
const nodes=new Map();function node(id){if(!nodes.has(id)){const classes=new Set(['hidden']);nodes.set(id,{dataset:{},innerHTML:'',classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)}})}return nodes.get(id)}
const memory=new Map(),context={console,Date,JSON,Math,Boolean,Number,String,Array,uid:'test-user',currentUser:null,buyerSession:{},prospects:[],cleanText:(x,n)=>String(x||'').trim().slice(0,n),normaliseDialNumber:x=>x,displayDialNumber:x=>x,escapeHtml:x=>String(x).replaceAll('<','&lt;'),primaryProspectPhone:p=>p.phone||'',localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},$:node,renderBuyerSessionHero:()=>{}};
vm.createContext(context);
for(const name of ['buyerSessionStorageKey','loadBuyerSession','saveBuyerSession','buyerSessionRemaining','showBuyerSession','completeBuyerSessionCall','appointmentContactMatches'])vm.runInContext(fn(name),context);
context.buyerSession={active:true,visible:true,index:0,contacts:[{id:'a',name:'Alice',phone:'0411111111',status:''},{id:'b',name:'Bob',phone:'0422222222',status:''}]};
context.saveBuyerSession();context.buyerSession={};context.loadBuyerSession();assert.equal(context.buyerSession.visible,true);assert.equal(context.buyerSession.contacts.length,2);
context.showBuyerSession();assert.equal(node('#prospectingSession').dataset.sessionKind,'buyer');assert.match(node('#prospectingSession').innerHTML,/Alice/);
context.completeBuyerSessionCall('Cancelled',{source:'buyer-session',buyerId:'a'});assert.equal(context.buyerSession.index,0);
context.completeBuyerSessionCall('Connected',{source:'buyer-session',buyerId:'a'});assert.equal(context.buyerSession.index,1);
context.completeBuyerSessionCall('Connected',{source:'buyer-session',buyerId:'a'});assert.equal(context.buyerSession.index,1);
context.loadBuyerSession();context.showBuyerSession();assert.match(node('#prospectingSession').innerHTML,/Bob/);
context.buyerSession.visible=false;context.saveBuyerSession();context.loadBuyerSession();assert.equal(context.buyerSession.visible,false);
context.prospects=[{id:'1',name:'Alice',phone:'0411',address:'10 Park Road',suburb:'Parramatta'},{id:'2',name:'Archived Alice',archived:true}];
for(const query of ['alice','PARK','0411','parramatta'])assert.equal(context.appointmentContactMatches(query)[0].id,'1');
assert.equal(context.appointmentContactMatches('missing').length,0);assert.equal(context.appointmentContactMatches('').length,1);
const branch=source.slice(source.indexOf('  if(sessionLogOpen||detailWasOpen&&editorWasOpen)'),source.indexOf('\n}\nfunction prospectForm'));
let buyerRenders=0,pipelineRenders=0;
Object.assign(context,{sessionLogOpen:false,detailWasOpen:false,editorWasOpen:false,sessionWasOpen:true,session:node('#prospectingSession'),dashboard:node('#prospectingDashboard'),detail:node('#prospectDetail'),prospectSessionActive:true,prospectSection:'today',activeProspectId:null,showBuyerSession:()=>buyerRenders++,showProspectingSession:()=>pipelineRenders++});
vm.runInContext(branch,context);assert.equal(buyerRenders,1);assert.equal(pipelineRenders,0);
context.detailWasOpen=true;context.editorWasOpen=true;vm.runInContext(branch,context);assert.equal(buyerRenders,1);assert.equal(pipelineRenders,0);
assert.match(fn('upsertProspect'),/saveProspecting\(\{render:false,awaitCloud:false\}\)/);
assert.match(fn('saveManualCallAsContact'),/name:buyer\?\.name/);assert.match(fn('saveManualCallAsContact'),/address:buyer\?\.address/);
const index=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/service-worker.js','utf8');
for(const asset of ['cleanup.css?v=1.37.6-ui-cleanup','app.js?v=1.37.6-ui-cleanup']){assert(index.includes(asset));assert(sw.includes(asset))}
for(const file of ['manifest.json','icons/icon-192.png','icons/icon-512.png','firebase-config.js','firestore.rules'])assert(fs.existsSync(__dirname+'/'+file));
console.log('PASS: buyer persistence, queue advancement/idempotence, cancelled calls, session render priority, editor preservation, shared search, background-save contract, prefill, cache references and PWA assets.');
