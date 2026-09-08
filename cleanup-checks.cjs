// Dependency-free source/unit checks. Not a replacement for browser/device QA.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/app.js','utf8');
function fn(name){const start=source.indexOf('function '+name+'(');assert(start>=0,name);const end=source.indexOf('\nfunction ',start+1);return source.slice(start,end<0?undefined:end)}
const nodes=new Map();function node(id){if(!nodes.has(id)){const classes=new Set(['hidden']);nodes.set(id,{dataset:{},innerHTML:'',classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)}})}return nodes.get(id)}
const memory=new Map(),context={console,Date,JSON,Math,Boolean,Number,String,Array,uid:'test-user',currentUser:null,buyerSession:{},prospects:[],cleanText:(x,n)=>String(x||'').trim().slice(0,n),normaliseDialNumber:x=>x,displayDialNumber:x=>x,escapeHtml:x=>String(x).replaceAll('<','&lt;'),primaryProspectPhone:p=>p.phone||'',validDateKey:x=>/^\d{4}-\d{2}-\d{2}$/.test(String(x||'')),uuid:()=> 'task-id',displayAgentName:()=> 'Andrew',localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},$:node,renderBuyerSessionHero:()=>{}};
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
for(const asset of ['cleanup.css?v=1.38.0-workflow-polish','app.js?v=1.38.0-workflow-polish']){assert(index.includes(asset));assert(sw.includes(asset))}
for(const file of ['manifest.json','icons/icon-192.png','icons/icon-512.png','firebase-config.js','firestore.rules'])assert(fs.existsSync(__dirname+'/'+file));
for(const name of ['taskTimestampMillis','normaliseTaskRecord'])vm.runInContext(fn(name),context);
const task=context.normaliseTaskRecord({title:'  Call solicitor  ',note:' Confirm exchange ',date:'2026-09-08',time:'14:30'},'2026-09-08');assert.equal(task.id,'task-id');assert.equal(task.title,'Call solicitor');assert.equal(task.note,'Confirm exchange');assert.equal(task.scheduledDate,'2026-09-08');assert.equal(task.assignedToUid,'test-user');
Object.assign(context,{days:{'2026-09-08':{tasks:[task]}},assignedTeamTasks:[],timelineMinutes:value=>{const[h,m]=value.split(':').map(Number);return h*60+m},teamAppointmentSetterFirstName:value=>String(value).split(' ')[0]});for(const name of ['taskEntriesForDate','timelineTaskItemsForDate'])vm.runInContext(fn(name),context);let taskItems=context.timelineTaskItemsForDate('2026-09-08');assert.equal(taskItems.length,1);assert.equal(taskItems[0].minutes,870);assert.equal(taskItems[0].plan,true);assert.equal(taskItems[0].completed,false);
context.assignedTeamTasks=[{...task,completedAt:123,isTeamAssigned:true}];taskItems=context.timelineTaskItemsForDate('2026-09-08');assert.equal(taskItems.length,1);assert.equal(taskItems[0].completed,true);
let sessionSaves=0,sessionRenders=0;Object.assign(context,{hotSpotSmsAfterOutcome:true,prospectSessionIndex:3,saveProspectingSessionState:()=>sessionSaves++,showProspectingSession:()=>sessionRenders++});vm.runInContext(fn('finishHotSpotSmsAfterOutcome'),context);assert.equal(context.finishHotSpotSmsAfterOutcome(),true);assert.equal(context.finishHotSpotSmsAfterOutcome(),false);assert.equal(context.prospectSessionIndex,4);assert.equal(sessionSaves,1);assert.equal(sessionRenders,1);
assert.match(fn('blankDay'),/tasks:\[\]/);assert.match(fn('normaliseDayRecord'),/tasks:normaliseTasks/);assert.match(fn('timelineItemsForDate'),/fixedBusy=dailyPlanMergeIntervals/);assert.match(fn('timelineItemsForDate'),/\.\.\.taskItems/);
assert(index.includes('id="taskComposerModal"'));assert(index.includes('id="openTaskComposer"'));assert(index.includes('name="assignedToUid"'));
assert(index.includes('id="openTodayLogShortcut"'));assert(index.includes('id="sendTodayStats"'));assert(index.includes('id="taskComposerTitle">Add a task'));
assert.match(fn('dayStatsLines'),/dailyKnockingStats\(k\)/);assert.match(fn('dayStatsLines'),/appointments\.LAP/);assert.match(fn('dayStatsLines'),/appointments\.MAP/);assert.match(fn('dayStatsLines'),/appointments\.BAP/);
Object.assign(context,{dayData:()=>({calls:50,connects:30,data:7}),dailyKnockingStats:()=>({knocks:23}),appointmentCountsForDate:()=>({LAP:1,MAP:1,BAP:0})});vm.runInContext(fn('dayStatsLines'),context);assert.deepEqual(Array.from(context.dayStatsLines('2026-09-08')),['50 Calls','23 Knocks','30 Connects','7 Data','1 LAP','1 MAP']);
Object.assign(context,{dayData:()=>({calls:0,connects:0,data:0}),dailyKnockingStats:()=>({knocks:0}),appointmentCountsForDate:()=>({LAP:0,MAP:0,BAP:0})});assert.deepEqual(Array.from(context.dayStatsLines('2026-09-08')),[]);
assert.match(fn('sendDayStatsToWhatsApp'),/https:\/\/wa\.me\/\?text=/);assert.match(fn('openContactVCard'),/target='_blank'/);assert.doesNotMatch(fn('openContactVCard'),/\.download/);assert.doesNotMatch(fn('exportProspectToDeviceContacts'),/navigator\.share/);
assert.match(fn('renderToday'),/knockingMetricCard.*classList\.toggle\('complete'/s);
const submitBranch=source.slice(source.indexOf("if(e.target.id==='prospectLogForm')"),source.indexOf("};\n\n$('#openDayReview')"));assert.match(submitBranch,/applyProspectingOutcomeMetrics\(outcome,interactionId,\{awaitCloud:false\}\)/);assert.match(submitBranch,/saveProspecting\(\{render:false,awaitCloud:false\}\)/);assert.match(submitBranch,/sendHotSpotSmsAfterOutcome/);assert.match(source,/afterOutcome:hotSpotSmsAfterOutcome/);
assert.match(source,/searchVisible=\['contacts','buyers','pipeline'\]/);assert.match(fn('updateBackTodayVisibility'),/\['todayView','scheduleView'\]/);
const rules=fs.readFileSync(__dirname+'/firestore.rules','utf8');assert.match(rules,/match \/tasks\/\{taskId\}/);assert.match(rules,/hasOnly\(\['completedAt','updatedAt'\]\)/);
console.log('PASS: baseline regression checks plus task normalisation/persistence, timeline reservation, task UI/allocation, background contact-log saves, contextual no-answer SMS, scoped search, Today-button visibility, team-task rules, cache references and PWA assets.');
