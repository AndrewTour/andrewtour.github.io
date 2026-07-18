import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, setDoc, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const DEFAULT_WORK_DAYS=[1,2,4,5];
let workDays=[...DEFAULT_WORK_DAYS];
const CALL_PLAN=[[9,'Active Buyer Calls','Hot buyers, offers, contracts and second inspections'],[10,'Past OFI Calls','Recent attendees, missed callbacks and buyer feedback'],[11,'Pipeline Calls','Current sellers, warm leads and next-step conversations'],[12,'Past Appraisals','Owners with a likely 3–12 month move'],[13,'Database Reconnects','Long-term owners and dormant contacts'],[14,'Just Listed & Coming Soon','Buyers, neighbours and local owner awareness'],[15,'Just Sold Calls','Result calls and nearby owner follow-up'],[16,'Priority Follow-Up','Offers, appointments and tomorrow’s pipeline']];
const DEFAULTS={calls:50,connects:25,data:10,weeklyKnock:240};
let targets={...DEFAULTS}, days={}, selectedDate=dateKey(new Date()), appointmentDate=selectedDate, appointmentHistoryMode=null, agentName='', calendarPreference='outlook', leaderboardEntries=[], leaderboardMode='day', leaderboardDayOffset=0, leaderboardWeekOffset=0, scorecardWeekOffset=0;
let year=new Date().getFullYear(), monthCursor=new Date(), uid='local', currentUser=null, cloud=false, db=null, auth=null;
let unsubDays=null, unsubProfile=null, unsubLeaderboard=null, timerTick=null, syncTimer=null, leaderboardPublishTimer=null;
const daySaveChains=new Map();
const appointmentSubmitLocks=new Set();

function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseKey(k){const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)}
function todayKey(){return dateKey(new Date())}
function mondayOf(d){const x=new Date(d),n=x.getDay();x.setDate(x.getDate()-(n===0?6:n-1));x.setHours(0,0,0,0);return x}
function weekKeys(d=parseKey(selectedDate)){const m=mondayOf(d);return workDays.map(n=>{const x=new Date(m);x.setDate(m.getDate()+n-1);return dateKey(x)})}
function isWorkDayKey(k){return workDays.includes(parseKey(k).getDay())}
function workDayName(n){return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][n]}
function normaliseWorkDays(values){const order=[1,2,3,4,5,6,0],set=new Set((values||[]).map(Number).filter(n=>n>=0&&n<=6));return order.filter(n=>set.has(n))}
function blankDay(){return{calls:0,connects:0,data:0,knockSeconds:0,timerStartedAt:null,appointments:[],events:[],review:{},clientUpdatedAt:0}}
function validDateKey(value){return /^\d{4}-\d{2}-\d{2}$/.test(String(value||''))&&!Number.isNaN(parseKey(String(value)).getTime())}
function normaliseAppointmentRecord(raw={},sourceDate=''){
  const a=raw&&typeof raw==='object'?{...raw}:{};
  const createdDate=validDateKey(a.createdDate)?a.createdDate:validDateKey(a.logDate)?a.logDate:sourceDate;
  const scheduledDate=validDateKey(a.scheduledDate)?a.scheduledDate:validDateKey(a.date)?a.date:sourceDate;
  const time=/^([01]\d|2[0-3]):[0-5]\d$/.test(String(a.time||''))?String(a.time):'12:00';
  const scheduledAt=Number.isFinite(Number(a.scheduledAt))?Number(a.scheduledAt):new Date(`${scheduledDate}T${time}`).getTime();
  const at=Number.isFinite(Number(a.at))?Number(a.at):Date.now();
  const type=normaliseAppointmentType(a.type||(Array.isArray(a.types)?a.types[0]:''));
  return{...a,id:String(a.id||uuid()),contactName:String(a.contactName||a.name||'').trim(),contactNumber:String(a.contactNumber||a.phone||'').trim(),address:String(a.address||'').trim(),date:scheduledDate,time,type,types:Array.isArray(a.types)&&a.types.length?a.types:[type],createdDate,logDate:createdDate,scheduledDate,scheduledAt:Number.isFinite(scheduledAt)?scheduledAt:0,at};
}
function normaliseAppointments(list,sourceDate=''){
  const seen=new Set(),out=[];
  for(const raw of Array.isArray(list)?list:[]){
    const a=normaliseAppointmentRecord(raw,sourceDate);
    const key=a.id||`${a.createdDate}|${a.scheduledDate}|${a.time}|${a.type}|${a.address}|${a.contactName}`;
    if(seen.has(key))continue;
    seen.add(key);out.push(a);
  }
  return out;
}
function normaliseDayRecord(raw={},sourceDate=''){
  const value=raw&&typeof raw==='object'?raw:{};
  return{...blankDay(),...value,calls:Math.max(0,Number(value.calls)||0),connects:Math.max(0,Number(value.connects)||0),data:Math.max(0,Number(value.data)||0),knockSeconds:Math.max(0,Number(value.knockSeconds)||0),timerStartedAt:Number.isFinite(Number(value.timerStartedAt))?Number(value.timerStartedAt):null,appointments:normaliseAppointments(value.appointments,sourceDate),events:Array.isArray(value.events)?value.events.filter(Boolean).slice(-500):[],review:value.review&&typeof value.review==='object'?value.review:{},clientUpdatedAt:Number(value.clientUpdatedAt)||0};
}
function normaliseDaysMap(raw){const out={};if(!raw||typeof raw!=='object')return out;for(const [k,v] of Object.entries(raw)){if(validDateKey(k))out[k]=normaliseDayRecord(v,k)}return out}
function dayData(k){return normaliseDayRecord(days[k],k)}
function liveKnockSeconds(d){return (d.knockSeconds||0)+(d.timerStartedAt?Math.max(0,Math.floor((Date.now()-d.timerStartedAt)/1000)):0)}
function pct(n,t){return Math.min(100,Math.round((Number(n)||0)/Math.max(1,Number(t)||1)*100))}
function haptic(v=10){navigator.vibrate?.(v)}
function fmtDate(k){return parseKey(k).toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})}
function fmtTimer(sec){const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=Math.floor(sec%60);return h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
function uuid(){return crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`}
function configured(){return firebaseConfig?.apiKey&&!firebaseConfig.apiKey.startsWith('PASTE_')}
function isPastDate(k){return k<todayKey()}
function canEditDate(k){return !isPastDate(k)&&isWorkDayKey(k)}
function lockedToast(){haptic(20);toast(isPastDate(selectedDate)?'This day is complete and locked':'This day is not in your accountability schedule')}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),1800)}
function syncVisualState(state,label){
  if(state)return state;
  if(label==='Saving')return 'saving';
  if(label==='Connecting'||label==='Connected')return 'connecting';
  if(label==='Offline'||label==='This device')return 'offline';
  if(label==='Sync error')return 'error';
  return 'connecting';
}
function setSync(state,label){
  const b=$('#syncBadge'),visual=syncVisualState(state,label);
  b.className=`sync-badge ${visual}`;
  b.dataset.label=label;
  b.setAttribute('aria-label',`Sync status: ${label}`);
  b.title=`Sync status: ${label}`;
  const current=$('#syncCurrentText');if(current)current.textContent=label;
}

function storagePrefix(userId=uid){return `da:${userId||'local'}:`}
function resetState(){days={};targets={...DEFAULTS};workDays=[...DEFAULT_WORK_DAYS];agentName='';calendarPreference='outlook';leaderboardEntries=[];selectedDate=todayKey();appointmentDate=selectedDate}
function safeJsonParse(value,fallback){try{return JSON.parse(value)}catch{return fallback}}
function loadLocal(userId=uid){resetState();const prefix=storagePrefix(userId);try{days=normaliseDaysMap(safeJsonParse(localStorage.getItem(prefix+'days')||localStorage.getItem(prefix+'days-backup')||'{}',{}));targets={...DEFAULTS,...safeJsonParse(localStorage.getItem(prefix+'targets')||'{}',{})};agentName=localStorage.getItem(prefix+'agent-name')||'';const savedWorkDays=safeJsonParse(localStorage.getItem(prefix+'work-days')||'null',null);if(Array.isArray(savedWorkDays)&&savedWorkDays.length)workDays=normaliseWorkDays(savedWorkDays);const savedCalendarPreference=localStorage.getItem(prefix+'calendar-preference');calendarPreference=savedCalendarPreference==='apple'?'apple':'outlook'}catch(err){console.error('Local data recovery failed',err);resetState()}}
function saveLocal(){const prefix=storagePrefix(uid);try{const serialised=JSON.stringify(normaliseDaysMap(days));const previous=localStorage.getItem(prefix+'days');if(previous)localStorage.setItem(prefix+'days-backup',previous);localStorage.setItem(prefix+'days',serialised);localStorage.setItem(prefix+'targets',JSON.stringify(targets));localStorage.setItem(prefix+'agent-name',agentName);localStorage.setItem(prefix+'work-days',JSON.stringify(workDays));localStorage.setItem(prefix+'calendar-preference',calendarPreference);return true}catch(err){console.error('Local save failed',err);return false}}
function clearActiveSession(){unsubDays?.();unsubProfile?.();unsubLeaderboard?.();unsubDays=unsubProfile=unsubLeaderboard=null;clearInterval(timerTick);clearTimeout(syncTimer);clearTimeout(leaderboardPublishTimer);currentUser=null;uid='local';cloud=false;resetState()}
function displayAgentName(){return (agentName||currentUser?.displayName||currentUser?.email?.split('@')[0]||'Agent').trim()}
function leaderboardPayload(){
  const k=todayKey(),d=dayData(k),knockMinutes=Math.floor(liveKnockSeconds(d)/60),knockTarget=rollingKnockTarget(k);
  return{uid,name:displayAgentName(),email:currentUser?.email||'',date:k,activeToday:isWorkDayKey(k),workDays:[...workDays],calls:d.calls,connects:d.connects,data:d.data,knockMinutes,score:completion(k),targets:{calls:targets.calls,connects:targets.connects,data:targets.data,knock:knockTarget},dailyHistory:recentDailyHistory(),weekHistory:recentWeekHistory(),clientUpdatedAt:Date.now(),updatedAt:serverTimestamp()}
}
function scheduleLeaderboardPublish(){if(!cloud||!db||!uid)return;clearTimeout(leaderboardPublishTimer);leaderboardPublishTimer=setTimeout(publishLeaderboard,180)}
async function publishLeaderboard(){if(!cloud||!db||!uid)return;try{await setDoc(doc(db,'leaderboard',uid),leaderboardPayload(),{merge:true});if($('#leaderboardStatus'))$('#leaderboardStatus').textContent='LIVE'}catch(err){console.error('Leaderboard publish failed',err);setSync('error','Sync error');if($('#leaderboardStatus'))$('#leaderboardStatus').textContent='SYNC ERROR'}}
async function persistDayToCloud(k,clean,{quiet=false}={}){
  if(!cloud||!db||!uid)return;
  setSync('','Saving');
  try{await setDoc(doc(db,'users',uid,'days',k),{...clean,updatedAt:serverTimestamp()},{merge:true});if(k===todayKey())scheduleLeaderboardPublish();setSync('live','Live')}
  catch(err){console.error('Day sync failed',err);setSync('error','Sync error');if(!quiet)toast('Saved on this device. Cloud sync failed.');throw err}
}
async function saveDay(k,{quiet=false}={}){
  if(!validDateKey(k))return;
  const clean={...dayData(k),clientUpdatedAt:Date.now()};days[k]=clean;
  saveLocal();renderAll();
  if(!cloud)return;
  const previous=daySaveChains.get(k)||Promise.resolve();
  const next=previous.catch(()=>{}).then(()=>persistDayToCloud(k,{...days[k]},{quiet}));
  daySaveChains.set(k,next);
  try{await next}finally{if(daySaveChains.get(k)===next)daySaveChains.delete(k)}
}
async function saveTargets(){saveLocal();if(!cloud)return;setSync('','Saving');try{await setDoc(doc(db,'users',uid),{targets,workDays:[...workDays],name:displayAgentName(),email:currentUser?.email||'',updatedAt:serverTimestamp()},{merge:true});scheduleLeaderboardPublish();setSync('live','Live')}catch(err){console.error(err);setSync('error','Sync error');toast('Targets saved locally. Cloud sync failed.')}}
function addEvent(d,type,label,delta=0){d.events.push({id:uuid(),type,label,delta,at:Date.now()});d.events=d.events.slice(-500)}

function dailyLeaderboardRecord(k){
  const d=dayData(k),knockMinutes=Math.floor(liveKnockSeconds(d)/60),knockTarget=rollingKnockTarget(k);
  return{calls:d.calls,connects:d.connects,data:d.data,knockMinutes,score:completion(k),targets:{calls:targets.calls,connects:targets.connects,data:targets.data,knock:knockTarget}};
}
function recentDailyHistory(count=21){
  const history={},d=new Date();
  for(let i=0;i<60&&Object.keys(history).length<count;i++){
    const k=dateKey(d);
    if(workDays.includes(d.getDay()))history[k]=dailyLeaderboardRecord(k);
    d.setDate(d.getDate()-1);
  }
  return history;
}
function previousScheduledKey(k,daysList=workDays){
  const d=parseKey(k);
  for(let i=0;i<14;i++){
    d.setDate(d.getDate()-1);
    if((daysList||workDays).includes(d.getDay()))return dateKey(d);
  }
  return null;
}
function workdayStart(now=new Date()){
  const start=new Date(now);start.setHours(9,0,0,0);return start;
}
function workdayEnd(now=new Date()){
  const end=new Date(now);end.setHours(17,0,0,0);return end;
}
function accountabilityDayProgress(now=new Date()){
  const start=workdayStart(now),end=workdayEnd(now);
  if(now<=start)return 0;
  if(now>=end)return 1;
  return Math.max(0,Math.min(1,(now-start)/(end-start)));
}
function nextPaceCheckpoint(now=new Date()){
  const start=workdayStart(now),closing=workdayEnd(now);
  if(now<start){const checkpoint=new Date(start);checkpoint.setMinutes(30,0,0);return checkpoint}
  const mins=now.getMinutes(),checkpoint=new Date(now);
  if(mins<30)checkpoint.setMinutes(30,0,0);else checkpoint.setHours(now.getHours()+1,0,0,0);
  if(checkpoint>closing)checkpoint.setTime(closing.getTime());
  return checkpoint;
}
function shortTime(d){return d.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit',hour12:true}).replace(' ','').toLowerCase()}
function expectedAt(metric,target,when=new Date()){
  return Math.min(target,Math.round(target*accountabilityDayProgress(when)));
}
function welcomeMessage(){
  const hour=new Date().getHours(),raw=(displayAgentName().split(/\s+/)[0]||'Agent');
  const name=raw.charAt(0).toUpperCase()+raw.slice(1).toLowerCase();
  const greeting=hour<12?'Good Morning':hour<17?'Good Afternoon':'Good Evening';
  return `${greeting}, ${name}`;
}
function metricRemainingText(value,target){
  const remaining=Math.max(0,target-value);
  return remaining===0?'Target complete':`${remaining} remaining`;
}
function metricPaceText(value,target,metric){
  if(selectedDate!==todayKey())return value>=target?'Daily goal achieved':'Final result';
  const now=new Date(),start=workdayStart(now),end=workdayEnd(now);
  if(value>=target)return 'Daily goal achieved';
  if(now<start)return value>0?`${value} ahead of target`:'Ready to start';
  if(now>=end)return `${Math.max(0,target-value)} remaining today`;
  const expected=expectedAt(metric,target,now),diff=value-expected,checkpoint=nextPaceCheckpoint(now);
  const checkpointExpected=expectedAt(metric,target,checkpoint);
  const action=Math.max(0,Math.min(target-value,checkpointExpected-value));
  if(diff>0)return `${diff} ahead of target`;
  if(action>0){
    const labels={calls:'calls',connects:'connects',data:'data records'};
    const unit=action===1?{calls:'call',connects:'connect',data:'data record'}[metric]:labels[metric];
    return `${action} ${unit} needed by ${shortTime(checkpoint)}`;
  }
  return 'On track';
}
function knockRemainingText(minutes,target){
  const remaining=Math.max(0,target-minutes);
  if(selectedDate===todayKey()){
    const end=new Date();end.setHours(17,0,0,0);
    if(new Date()>=end&&remaining>0)return `${remaining} mins added tomorrow`;
  }
  return remaining===0?'Target complete':`${remaining} min remaining today`;
}
function knockPaceText(minutes,target){
  if(selectedDate!==todayKey())return minutes>=target?'Daily goal achieved':'Final result';
  const now=new Date(),start=new Date(now),end=new Date(now);
  start.setHours(14,0,0,0);
  end.setHours(17,0,0,0);
  if(minutes>=target)return 'Daily goal achieved';
  if(now>=end)return 'Fell short';
  if(now<start)return minutes>0?`${minutes} min ahead of target`:'Start at 2:00pm';
  const expected=expectedKnockAt(target,now);
  return minutes>=expected?'On track':'Off track';
}

function expectedKnockAt(target,when=new Date()){
  const start=new Date(when),end=new Date(when);
  start.setHours(14,0,0,0);
  end.setHours(17,0,0,0);
  if(when<start)return 0;
  if(when>=end)return target;
  return Math.min(target,Math.round(target*((when-start)/(end-start))));
}
function minutesUntil(hour,minute=0,now=new Date()){
  const end=new Date(now);end.setHours(hour,minute,0,0);
  return Math.max(0,(end-now)/60000);
}
function feasibilityState(requiredMinutes,availableMinutes){
  if(requiredMinutes<=0)return 'on';
  if(availableMinutes<=0)return 'off';
  const load=requiredMinutes/availableMinutes;
  if(load<=0.75)return 'on';
  if(load<=1)return 'risk';
  return 'off';
}
function dayTrackState(k=selectedDate){
  if(!isWorkDayKey(k))return 'on';
  const d=dayData(k),knockTarget=rollingKnockTarget(k),knockMinutes=Math.floor(liveKnockSeconds(d)/60);
  if(k!==todayKey())return d.calls>=targets.calls&&d.connects>=targets.connects&&d.data>=targets.data&&knockMinutes>=knockTarget?'on':'off';

  const now=new Date(),coreAvailable=minutesUntil(17,0,now);
  const states=[];
  const capacityPerHour={calls:10,connects:5,data:2};
  for(const metric of ['calls','connects','data']){
    const remaining=Math.max(0,targets[metric]-d[metric]);
    const requiredMinutes=(remaining/capacityPerHour[metric])*60;
    states.push(feasibilityState(requiredMinutes,coreAvailable));
  }

  const knockStart=new Date(now);knockStart.setHours(14,0,0,0);
  if(now>=knockStart){
    const knockAvailable=minutesUntil(17,0,now);
    const knockRemaining=Math.max(0,knockTarget-knockMinutes);
    states.push(feasibilityState(knockRemaining,knockAvailable));
  }

  if(states.includes('off'))return 'off';
  if(states.includes('risk'))return 'risk';
  return 'on';
}
function isDayOnTrack(k=selectedDate){return dayTrackState(k)==='on'}
function momentumWhisper(){
  if(selectedDate!==todayKey()){
    const previous=previousScheduledKey(selectedDate),change=previous?completion(selectedDate)-completion(previous):0;
    if(!previous)return `${completion(selectedDate)}% recorded`;
    if(change===0)return 'Level with the previous workday';
    return `${change>0?'▲':'▼'} ${Math.abs(change)}% vs previous workday`;
  }
  if(!isWorkDayKey(selectedDate))return 'Recovery day · next scheduled day is ready';
  const run=streak(),previous=previousScheduledKey(todayKey()),change=previous?completion(todayKey())-completion(previous):0;
  if(run>=2)return `${run}-day run · protect the momentum`;
  if(change>0)return `▲ ${change}% ahead of your last workday`;
  if(change<0)return `▼ ${Math.abs(change)}% below your last workday · time to respond`;
  return completion(todayKey())>0?'Momentum building today':'First action starts the momentum';
}
function todayGuidance(){
  if(selectedDate!==todayKey())return `${fmtDate(selectedDate)} · ${completion(selectedDate)}% complete`;
  if(!isWorkDayKey(selectedDate))return 'No accountability targets scheduled today';
  const d=dayData(selectedDate),kt=rollingKnockTarget(selectedDate),remaining={
    calls:Math.max(0,targets.calls-d.calls),
    connects:Math.max(0,targets.connects-d.connects),
    data:Math.max(0,targets.data-d.data),
    knocking:Math.max(0,kt-Math.floor(liveKnockSeconds(d)/60))
  };
  const labels={calls:'calls',connects:'connects',data:'data',knocking:'knocking minutes'};
  const pcts={calls:pct(d.calls,targets.calls),connects:pct(d.connects,targets.connects),data:pct(d.data,targets.data),knocking:pct(liveKnockSeconds(d)/60,kt)};
  const weakest=Object.entries(pcts).sort((a,b)=>a[1]-b[1])[0]?.[0]||'calls';
  const total=Object.values(remaining).reduce((a,b)=>a+b,0);
  const now=new Date(),planningStart=new Date(now);planningStart.setHours(18,30,0,0);
  if(now>=planningStart)return 'Calendar Management / Plan Tomorrow';
  if(total===0)return 'All daily targets complete. Keep building tomorrow’s pipeline.';
  return `Focus Now: ${metricLabel(weakest)} · ${remaining[weakest]} ${labels[weakest]} remaining`;
}
function rollingKnockTarget(k){const date=parseKey(k),m=mondayOf(date);let prior=0,seen=0;for(const n of workDays){const x=new Date(m);x.setDate(m.getDate()+n-1);const key=dateKey(x);if(key===k)break;prior+=Math.floor(liveKnockSeconds(dayData(key))/60);seen++}return Math.ceil(Math.max(0,targets.weeklyKnock-prior)/Math.max(1,workDays.length-seen))}
function completion(k){if(!isWorkDayKey(k))return 0;const d=dayData(k),kt=rollingKnockTarget(k);return Math.round((pct(d.calls,targets.calls)+pct(d.connects,targets.connects)+pct(d.data,targets.data)+pct(liveKnockSeconds(d)/60,kt))/4)}
function weekSummary(base=parseKey(selectedDate)){const ks=weekKeys(base);let calls=0,connects=0,data=0,knock=0,complete=0,total=0;ks.forEach(k=>{const d=dayData(k);calls+=d.calls;connects+=d.connects;data+=d.data;knock+=liveKnockSeconds(d);const c=completion(k);total+=c;if(c>=100)complete++});const count=Math.max(1,ks.length);return{calls,connects,data,knock,complete,avg:Math.round(total/count),score:Math.round((pct(calls,targets.calls*count)+pct(connects,targets.connects*count)+pct(data,targets.data*count)+pct(knock/60,targets.weeklyKnock))/4),count}}
function weekKeyFromDate(base=new Date()){return dateKey(mondayOf(base))}
function weekDateFromOffset(offset=0){const d=mondayOf(new Date());d.setDate(d.getDate()+offset*7);return d}
function weekSummaryFor(baseDate){
  const summary=weekSummary(baseDate), count=Math.max(1,summary.count);
  const metricPcts={
    calls:pct(summary.calls,targets.calls*count),
    connects:pct(summary.connects,targets.connects*count),
    data:pct(summary.data,targets.data*count),
    knocking:pct(summary.knock/60,targets.weeklyKnock)
  };
  const weakest=Object.entries(metricPcts).sort((a,b)=>a[1]-b[1])[0];
  return{weekKey:weekKeyFromDate(baseDate),weekStart:dateKey(mondayOf(baseDate)),workDays:[...workDays],calls:summary.calls,connects:summary.connects,data:summary.data,knockMinutes:Math.floor(summary.knock/60),score:summary.score,targets:{calls:targets.calls*count,connects:targets.connects*count,data:targets.data*count,knock:targets.weeklyKnock},metricPcts,weakestMetric:weakest?.[0]||'calls',weakestPct:weakest?.[1]||0};
}
function recentWeekHistory(){
  const history={};
  for(let offset=0;offset>=-11;offset--){const d=weekDateFromOffset(offset),w=weekSummaryFor(d);history[w.weekKey]=w}
  return history;
}
function streak(){let n=0,d=new Date();for(let i=0;i<730;i++){if(workDays.includes(d.getDay())){const k=dateKey(d);if(k===todayKey()&&completion(k)<100){d.setDate(d.getDate()-1);continue}if(completion(k)>=100)n++;else break}d.setDate(d.getDate()-1)}return n}

async function changeMetric(metric,delta){if(!canEditDate(selectedDate))return lockedToast();const d=dayData(selectedDate);d[metric]=Math.max(0,d[metric]+delta);addEvent(d,metric,`${metric} ${delta>0?'+1':'−1'}`,delta);days[selectedDate]=d;haptic();await saveDay(selectedDate)}
async function toggleTimer(){if(!canEditDate(selectedDate))return lockedToast();const d=dayData(selectedDate);if(d.timerStartedAt){d.knockSeconds=liveKnockSeconds(d);d.timerStartedAt=null;addEvent(d,'knock','Knocking paused')}else{d.timerStartedAt=Date.now();d.alarmPlayed=false;addEvent(d,'knock','Knocking started')}days[selectedDate]=d;haptic(18);await saveDay(selectedDate);ensureTick()}
async function resetKnock(){if(!canEditDate(selectedDate))return lockedToast();if(!confirm('Reset knocking time for this date?'))return;const d=dayData(selectedDate);d.knockSeconds=0;d.timerStartedAt=null;d.alarmPlayed=false;addEvent(d,'knock','Knocking reset');days[selectedDate]=d;await saveDay(selectedDate);ensureTick()}
async function finaliseExpiredTimers(){const today=todayKey();for(const [k,raw] of Object.entries(days)){if(k<today&&raw?.timerStartedAt){const d=dayData(k);d.knockSeconds=liveKnockSeconds(d);d.timerStartedAt=null;d.alarmPlayed=true;addEvent(d,'knock','Knocking stopped automatically at day close');days[k]=d;await saveDay(k,{quiet:true})}}}
function ensureTick(){clearInterval(timerTick);if(dayData(selectedDate).timerStartedAt)timerTick=setInterval(()=>{renderToday();const d=dayData(selectedDate),target=rollingKnockTarget(selectedDate)*60;if(liveKnockSeconds(d)>=target&&!d.alarmPlayed){d.alarmPlayed=true;days[selectedDate]=d;saveDay(selectedDate,{quiet:true});alarm()}},1000)}
function alarm(){haptic([180,100,180]);toast('Today’s knocking target reached');try{const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.value=.17;o.start();o.stop(c.currentTime+.7)}catch{}}

function formatHour(h){return `${h%12||12}:00 ${h>=12?'PM':'AM'}`}
function renderCallPlan(){const now=new Date(),h=now.getHours();let current=CALL_PLAN.find(x=>x[0]===h);if(h<9)current=[8,'Prepare your priority list','Before 9:00 AM'];if(h>=17)current=[17,'Review follow-up and plan tomorrow','9:00 AM–5:00 PM call day complete'];$('#currentCall').textContent=current[1];$('#currentSlot').textContent=h>=9&&h<17?`${formatHour(h)}–${formatHour(h+1)} · 10 call target`:current[2];$('#callPlan').innerHTML=CALL_PLAN.map(([hour,title,note])=>`<div class="call-row ${hour===h?'active':''}"><b>${formatHour(hour)}</b><span><strong>${title}</strong><small>${note}</small></span><em>10</em></div>`).join('')}
function callsPaceText(value){if(selectedDate!==todayKey())return `${Math.max(0,targets.calls-value)} remaining`;const expected=expectedAt('calls',targets.calls,new Date()),diff=value-expected;return value>=targets.calls?'Target complete':diff===0?'On track':diff>0?`${diff} ahead of target`:`${Math.abs(diff)} behind target`}
function activeViewId(){return document.querySelector('.view.active')?.id||'todayView'}
function updateTopbar(id=activeViewId()){
  const isToday=id==='todayView';
  const label=document.querySelector(`.tabbar button[data-view="${id}"] span`)?.textContent||'AGNT';
  const dateLine=document.querySelector('.date-line');
  const todaySlot=$('#todaySyncSlot');
  const syncBadge=$('#syncBadge');
  const syncPopover=$('#syncPopover');
  $('#viewTitle').textContent=isToday?welcomeMessage():(id==='scheduleView'?'Your Schedule':label);
  const subtitle=$('#viewSubtitle');
  const subtitleText=id==='scheduleView'?'Plan ahead. Win the day.':id==='appointmentsView'?'Stay prepared. Follow through.':id==='insightsView'?'Set the pace. Raise the standard.':id==='settingsView'?'Make AGNT work your way.':'';
  if(subtitle){subtitle.textContent=subtitleText;subtitle.classList.toggle('hidden',!subtitleText)}
  $('#dateLabel').textContent=fmtDate(selectedDate);
  const hideCompactDate=id==='scheduleView'||id==='appointmentsView'||id==='insightsView'||id==='settingsView';
  $('#dateLabel').classList.toggle('hidden',hideCompactDate);
  dateLine?.classList.toggle('today-sync-only',hideCompactDate);
  const syncInTopActions=isToday||id==='scheduleView'||id==='appointmentsView'||id==='insightsView'||id==='settingsView';
  if(syncInTopActions&&todaySlot){
    if(syncBadge&&syncBadge.parentElement!==todaySlot)todaySlot.append(syncBadge);
  }else if(dateLine){
    if(syncBadge&&syncBadge.parentElement!==dateLine)dateLine.append(syncBadge);
  }
  if(syncPopover&&syncPopover.parentElement!==document.body)document.body.append(syncPopover);
  const showDateNav=id==='todayView'||id==='scheduleView'||id==='appointmentsView';
  $('#dateNavActions')?.classList.toggle('hidden',!showDateNav);
  $('#settingsShortcut')?.classList.toggle('hidden',id!=='insightsView');
  $('#homeShortcut')?.classList.toggle('hidden',id!=='settingsView');
}
function renderToday(){
  const d=dayData(selectedDate),score=completion(selectedDate),kt=rollingKnockTarget(selectedDate),secs=liveKnockSeconds(d),wk=weekSummary();
  const past=isPastDate(selectedDate),scheduled=isWorkDayKey(selectedDate),locked=past||!scheduled;
  updateTopbar();
  $('#backToday').classList.toggle('hidden',selectedDate===todayKey());
  $('#lockBadge').classList.toggle('hidden',!locked);$('#lockBadge').textContent=past?'LOCKED':'NOT SCHEDULED';
  $('#todayView').classList.toggle('date-locked',locked);
  if($('#welcomeMessage')){
    const trackState=dayTrackState(selectedDate);
    const labels={on:'ON TRACK',risk:'AT RISK',off:'OFF TRACK'};
    $('#welcomeMessage').textContent=labels[trackState];
    $('#welcomeMessage').classList.toggle('track-on',trackState==='on');
    $('#welcomeMessage').classList.toggle('track-risk',trackState==='risk');
    $('#welcomeMessage').classList.toggle('track-off',trackState==='off');
  }
  $('#dailyScore').textContent=`${score}%`;
  $('#scoreBar').style.width=`${score}%`;
  for(const m of ['calls','connects','data']){
    const val=d[m],target=targets[m],p=pct(val,target),rem=Math.max(0,target-val);
    $(`#${m}Value`).textContent=val;
    $(`#${m}TargetLabel`).textContent=`/${target}`;
    $(`#${m}TargetText`).textContent=past?'Final result':(!scheduled?'No target today':metricRemainingText(val,target));
    const ring=$(`#${m}Percent`);
    const pacePct=(selectedDate===todayKey()&&scheduled)?Math.min(100,Math.round(expectedAt(m,target,new Date())/Math.max(1,target)*100)):0;
    ring.textContent=`${p}%`;
    ring.classList.add('metric-ring');
    ring.style.setProperty('--actual',p);
    ring.style.setProperty('--pace',pacePct);
    ring.setAttribute('role','img');
    ring.setAttribute('aria-label',`${m.charAt(0).toUpperCase()+m.slice(1)}: ${p}% complete, expected pace ${pacePct}%, target ${target}`);
    $(`#${m}Pace`).textContent=past?'Day locked':(!scheduled?'Not scheduled':metricPaceText(val,target,m));
    document.querySelector(`[data-metric="${m}"]`).classList.toggle('complete',rem===0);
  }
  $('#knockValue').textContent=fmtTimer(secs);
  $('#knockTargetText').textContent=past?'Final result':(!scheduled?'No target today':knockRemainingText(Math.floor(secs/60),kt));
  $('#knockRemaining').textContent=past?'Day locked':(!scheduled?'Not scheduled':knockPaceText(Math.floor(secs/60),kt));
  const knockMinutes=Math.floor(secs/60),knockActual=pct(knockMinutes,kt);
  const knockExpected=(selectedDate===todayKey()&&scheduled)?Math.min(100,Math.round(expectedKnockAt(kt,new Date())/Math.max(1,kt)*100)):0;
  const knockRing=$('#knockPercent');
  if(knockRing){
    knockRing.textContent=`${knockActual}%`;
    knockRing.style.setProperty('--actual',knockActual);
    knockRing.style.setProperty('--pace',knockExpected);
    knockRing.classList.toggle('complete',knockActual>=100);
    knockRing.setAttribute('aria-label',`Knocking: ${knockActual}% complete, expected pace ${knockExpected}%, target ${kt} minutes`);
  }
  const timerButton=$('#timerButton');
  const timerRunning=!!d.timerStartedAt&&!locked;
  timerButton.innerHTML=timerRunning
    ? '<svg class="timer-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="7.5" y="6" width="3.25" height="12" rx="1"/><rect x="13.25" y="6" width="3.25" height="12" rx="1"/></svg>'
    : '<svg class="timer-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 6.5 17 12l-8.5 5.5Z"/></svg>';
  timerButton.setAttribute('aria-label',past?'Knocking timer locked':(!scheduled?'Knocking timer unavailable today':(timerRunning?'Pause knocking timer':'Start knocking timer')));
  timerButton.title=past?'Locked':(!scheduled?'Off day':(timerRunning?'Pause':'Start'));
  timerButton.classList.toggle('running',timerRunning);
  $$('[data-action], #timerButton, #resetKnock').forEach(el=>{el.disabled=locked;el.setAttribute('aria-disabled',String(locked))});
  renderDayTrend();
  renderLeaderboardPosition();
  if($('#momentumWhisper'))$('#momentumWhisper').textContent=momentumWhisper();
  renderNowCard();
}
function recentWorkKeys(endKey=selectedDate,count=8){
  const out=[],d=parseKey(endKey);
  for(let i=0;i<40&&out.length<count;i++){
    if(workDays.includes(d.getDay()))out.unshift(dateKey(d));
    d.setDate(d.getDate()-1);
  }
  return out
}
function renderDayTrend(){
  const svg=$('#dayTrend');if(!svg)return;
  const keys=recentWorkKeys(selectedDate,8),w=180,h=62,pad={l:7,r:7,t:8,b:15};
  const usableW=w-pad.l-pad.r,usableH=h-pad.t-pad.b;
  const values=keys.map(k=>Math.max(0,Math.min(100,completion(k))));
  const pts=values.map((v,i)=>({x:pad.l+(keys.length===1?usableW/2:i*usableW/(keys.length-1)),y:pad.t+(100-v)*usableH/100,v,k:keys[i]}));
  const path=pts.map((p,i)=>`${i?'L':'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area=pts.length?`${path} L ${pts[pts.length-1].x.toFixed(1)} ${(pad.t+usableH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(pad.t+usableH).toFixed(1)} Z`:'';
  const grid=[0,50,100].map(v=>{const y=pad.t+(100-v)*usableH/100;return `<line x1="${pad.l}" y1="${y}" x2="${w-pad.r}" y2="${y}" class="trend-grid"/>`}).join('');
  const circles=pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="${p.k===selectedDate?3.8:2.5}" class="trend-point ${p.k===selectedDate?'selected':''}"><title>${fmtDate(p.k)} · ${p.v}%</title></circle>`).join('');
  const labels=pts.map((p,i)=>{if(i%2&&i!==pts.length-1)return'';const d=parseKey(p.k);return `<text x="${p.x}" y="${h-2}" text-anchor="middle" class="trend-label">${d.getDate()}</text>`}).join('');
  svg.innerHTML=`<defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#69dbf2" stop-opacity=".28"/><stop offset="100%" stop-color="#5e8fff" stop-opacity="0"/></linearGradient></defs>${grid}${area?`<path d="${area}" fill="url(#trendFill)"/>`:''}${path?`<path d="${path}" class="trend-line"/>`:''}${circles}${labels}`;
}
function renderWeekDays(){if(!$('#weekDays'))return;$('#weekDays').innerHTML=weekKeys().map(k=>{const p=completion(k),d=parseKey(k);return `<button class="week-day ${k===selectedDate?'selected':''} ${p>=100?'complete':''}" data-date="${k}"><b>${workDayName(d.getDay()).slice(0,3).toUpperCase()}</b><small>${d.getDate()} · ${p}%</small></button>`}).join('')}

function normaliseAppointmentType(value){const raw=String(value||'').trim().toLowerCase();if(raw==='bap'||raw==='buyer appointment')return'BAP';if(raw==='map'||raw==='appraisal'||raw==='market appraisal')return'MAP';if(raw==='lap'||raw==='listing appointment')return'LAP';if(raw==='pu'||raw==='price update')return'PU';return String(value||'').trim().toUpperCase()}
function appointmentType(a){return normaliseAppointmentType(a.type||(Array.isArray(a.types)?a.types[0]:''))||'—'}
function appointmentScheduledDate(a,sourceDate=''){return a.scheduledDate||a.date||sourceDate}
function appointmentCreatedDate(a,sourceDate=''){
  const raw=Number(a.at||a.createdAt||0);
  if(raw){const d=new Date(raw);if(!Number.isNaN(d.getTime()))return dateKey(d);}
  return a.createdDate||a.logDate||sourceDate;
}
function appointmentTimestamp(a,sourceDate=''){if(Number.isFinite(Number(a.scheduledAt)))return Number(a.scheduledAt);const scheduledDate=appointmentScheduledDate(a,sourceDate);if(scheduledDate&&a.time){const t=new Date(`${scheduledDate}T${a.time}`);if(!Number.isNaN(t.getTime()))return t.getTime()}return Number(a.at)||0}
function appointmentTimeLabel(a,sourceDate=''){const ts=appointmentTimestamp(a,sourceDate);if(!ts)return a.time||'Time not set';return new Date(ts).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit',hour12:true}).replace(/\s/g,'').toUpperCase()}
function shortAppointmentDate(k){return k?parseKey(k).toLocaleDateString('en-AU',{day:'numeric',month:'long'}):'Date not set'}
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function calendarExportStorageKey(){return `${storagePrefix(uid)}calendar-exports`}
function calendarExportIds(){try{return new Set(JSON.parse(localStorage.getItem(calendarExportStorageKey())||'[]'))}catch{return new Set()}}
function calendarExportId(a,sourceDate=''){return String(a.id||`${sourceDate}|${appointmentType(a)}|${appointmentScheduledDate(a,sourceDate)}|${a.time||''}|${a.address||''}|${a.contactName||a.name||''}`)}
function appointmentAddedToCalendar(a,sourceDate=''){return calendarExportIds().has(calendarExportId(a,sourceDate))}
function markAppointmentAddedToCalendar(a,sourceDate=''){const ids=calendarExportIds();ids.add(calendarExportId(a,sourceDate));localStorage.setItem(calendarExportStorageKey(),JSON.stringify([...ids]));renderAppointments()}
function escapeIcs(value){return String(value??'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')}
function icsLocalDateTime(date,time){return `${String(date||'').replace(/-/g,'')}T${String(time||'00:00').replace(':','')}00`}
function appointmentCalendarFile(a,sourceDate=''){
  const scheduledDate=appointmentScheduledDate(a,sourceDate),time=a.time||'';
  const start=new Date(`${scheduledDate}T${time}`);
  if(!scheduledDate||!time||Number.isNaN(start.getTime()))return null;
  const end=new Date(start.getTime()+60*60*1000);
  const endDate=dateKey(end),endTime=`${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`;
  const type=appointmentType(a),address=a.address||'Address not recorded',contact=a.contactName||a.name||'Contact not recorded',phone=a.contactNumber||a.phone||'';
  const title=`${type} · ${address} · ${contact}`;
  const description=[`Appointment type: ${type}`,`Client: ${contact}`,phone?`Phone: ${phone}`:'',`Property: ${address}`].filter(Boolean).join('\n');
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const uidValue=`${calendarExportId(a,sourceDate)}@agnt`;
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//AGNT//Daily Accountability//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',`UID:${escapeIcs(uidValue)}`,`DTSTAMP:${stamp}`,`DTSTART:${icsLocalDateTime(scheduledDate,time)}`,`DTEND:${icsLocalDateTime(endDate,endTime)}`,`SUMMARY:${escapeIcs(title)}`,`LOCATION:${escapeIcs(address)}`,`DESCRIPTION:${escapeIcs(description)}`,'END:VEVENT','END:VCALENDAR'];
  const filename=`${type}-${scheduledDate}-${String(address).replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,50)||'appointment'}.ics`;
  return{content:lines.join('\r\n')+'\r\n',filename};
}
function exportAppointmentToAppleCalendar(a,sourceDate=''){
  const file=appointmentCalendarFile(a,sourceDate);
  if(!file)return toast('Appointment date or time is missing');
  const blob=new Blob([file.content],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=file.filename;link.rel='noopener';document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  markAppointmentAddedToCalendar(a,sourceDate);toast('Calendar event ready to add');
}
function outlookAppointmentUrl(a,sourceDate=''){
  const scheduledDate=appointmentScheduledDate(a,sourceDate),time=a.time||'';
  const start=new Date(`${scheduledDate}T${time}`);
  if(!scheduledDate||!time||Number.isNaN(start.getTime()))return null;
  const end=new Date(start.getTime()+60*60*1000),type=appointmentType(a),address=a.address||'Address not recorded',contact=a.contactName||a.name||'Contact not recorded',phone=a.contactNumber||a.phone||'';
  const title=`[${type}] ${address} – ${contact}`;
  const description=[`Client name: ${contact}`,phone?`Client phone number: ${phone}`:'',`Appointment type: ${type}`].filter(Boolean).join('\n');
  const params=new URLSearchParams({path:'/calendar/action/compose',rru:'addevent',allday:'false',subject:title,startdt:start.toISOString(),enddt:end.toISOString(),location:address,body:description});
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}
function exportAppointmentToOutlook(a,sourceDate=''){
  const outlookUrl=outlookAppointmentUrl(a,sourceDate);
  if(!outlookUrl)return toast('Appointment date or time is missing');
  const opened=window.open(outlookUrl,'_blank','noopener,noreferrer');
  if(!opened)return exportAppointmentToAppleCalendar(a,sourceDate);
  markAppointmentAddedToCalendar(a,sourceDate);toast('Opening Outlook Calendar');
}
function exportAppointmentToCalendar(a,sourceDate=''){
  if(calendarPreference==='apple')return exportAppointmentToAppleCalendar(a,sourceDate);
  exportAppointmentToOutlook(a,sourceDate);
}
function appointmentCalendarButton(a,sourceDate=''){
  const added=appointmentAddedToCalendar(a,sourceDate),id=escapeHtml(calendarExportId(a,sourceDate)),source=escapeHtml(sourceDate);
  const icon=added?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M4.5 8.5h15M5.5 5h13a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5Z"/><path d="m9 14 2 2 4-4"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M4.5 8.5h15M5.5 5h13a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5Z"/><path d="M12 11v6M9 14h6"/></svg>';
  return `<button class="appointment-calendar ${added?'is-added':''}" data-calendar-appointment="${id}" data-source-date="${source}" aria-label="${added?'Added to calendar':'Add appointment to calendar'}" title="${added?'Added to calendar':'Add to calendar'}">${icon}</button>`;
}
function appointmentEntriesForDate(viewDate){
  const entries=dayData(viewDate).appointments.map(a=>({appointment:a,sourceDate:viewDate,isReminder:false}));
  Object.entries(days).forEach(([sourceDate,day])=>{
    if(sourceDate===viewDate)return;
    (day?.appointments||[]).forEach(a=>{
      if(appointmentScheduledDate(a,sourceDate)===viewDate)entries.push({appointment:a,sourceDate,isReminder:true});
    });
  });
  return entries.sort((x,y)=>appointmentTimestamp(x.appointment,x.sourceDate)-appointmentTimestamp(y.appointment,y.sourceDate));
}
function timelineMinutes(value){
  const parts=String(value||'').split(':').map(Number);
  return Number.isFinite(parts[0])&&Number.isFinite(parts[1])?parts[0]*60+parts[1]:0;
}
function timelineTimeLabel(minutes){
  const total=((minutes%1440)+1440)%1440,h=Math.floor(total/60),m=total%60;
  return new Date(2000,0,1,h,m).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'});
}
function scheduledFollowUpsForDate(viewDate){
  return allAppointmentEntries().filter(({appointment:a,sourceDate})=>a.followUpDate===viewDate&&appointmentLifecycle(a,sourceDate)==='follow-up');
}
function timelineItemsForDate(viewDate){
  const items=[
    {id:'prospecting',minutes:9*60,title:'Prospecting',meta:'Calls, connects and data',kind:'focus',duration:5*60},
    {id:'knocking',minutes:14*60,title:'Door Knock Focus',meta:`${rollingKnockTarget(viewDate)} minute target`,kind:'knock',duration:120},
    {id:'progress',minutes:16*60,title:'Daily Progress Check',meta:'Review remaining targets',kind:'check',duration:30},
    {id:'wrap',minutes:18*60,title:'Wrap Up',meta:'Review today and prepare tomorrow',kind:'wrap',duration:60}
  ];
  scheduledFollowUpsForDate(viewDate).forEach(({appointment:a,sourceDate},index)=>{
    const rawPhone=String(a.contactNumber||a.phone||'').trim(),dial=rawPhone.replace(/[^+\d]/g,'');
    items.push({
      id:`followup-${calendarExportId(a,sourceDate)}`,
      minutes:8*60+(index*5),
      title:`Follow-Up · ${appointmentType(a)} · ${a.address||'Address not recorded'}`,
      meta:`${a.contactName||a.name||'Contact not recorded'}${rawPhone?` · ${rawPhone}`:''}`,
      kind:'followup',duration:30,dial
    });
  });
  appointmentEntriesForDate(viewDate).forEach(({appointment:a,sourceDate})=>{
    const scheduled=appointmentScheduledDate(a,sourceDate);
    if(scheduled!==viewDate)return;
    const rawPhone=String(a.contactNumber||a.phone||'').trim(),dial=rawPhone.replace(/[^+\d]/g,'');
    items.push({
      id:`appointment-${calendarExportId(a,sourceDate)}`,
      minutes:timelineMinutes(a.time),
      title:`${appointmentType(a)} · ${a.address||'Address not recorded'}`,
      meta:`${a.contactName||a.name||'Contact not recorded'}${rawPhone?` · ${rawPhone}`:''}`,
      kind:'appointment',duration:60,dial
    });
  });
  const order={followup:0,appointment:1,focus:2,knock:3,check:4,wrap:5};
  return items.sort((a,b)=>a.minutes-b.minutes||(order[a.kind]??9)-(order[b.kind]??9)||a.title.localeCompare(b.title));
}
function timelineStatus(item,index,items,viewDate,focusItemId=''){
  if(viewDate<todayKey())return'complete';
  if(viewDate>todayKey())return'upcoming';
  const now=new Date(),nowMinutes=now.getHours()*60+now.getMinutes();
  if(focusItemId&&item.id===focusItemId)return'current';
  const next=items[index+1]?.minutes??1440;
  const end=Math.min(item.minutes+(item.duration||60),next);
  return nowMinutes>=end?'complete':'upcoming';
}
function timelineFocusId(items,kind){
  return items.find(item=>item.kind===kind)?.id||'';
}
function timelineFollowUpId(items,entry){
  return entry?`followup-${calendarExportId(entry.appointment,entry.sourceDate)}`:'';
}
function coachingMetricState(viewDate=selectedDate){
  const d=dayData(viewDate),knockTarget=rollingKnockTarget(viewDate),knockMinutes=Math.floor(liveKnockSeconds(d)/60);
  const metrics=[
    {key:'calls',label:'calls',action:'Stay on the phones',value:d.calls,target:targets.calls,rate:10},
    {key:'connects',label:'connects',action:'Focus on connects',value:d.connects,target:targets.connects,rate:5},
    {key:'data',label:'data records',action:'Switch to data collection',value:d.data,target:targets.data,rate:2}
  ].map(m=>({...m,remaining:Math.max(0,m.target-m.value),progress:pct(m.value,m.target)}));
  return{d,knockTarget,knockMinutes,knockRemaining:Math.max(0,knockTarget-knockMinutes),metrics,incomplete:metrics.filter(m=>m.remaining>0)};
}
function activeProspectingMomentum(viewDate=selectedDate,now=Date.now()){
  if(viewDate!==todayKey())return null;
  const d=dayData(viewDate),windowMs=15*60*1000,events=(d.events||[]).filter(event=>{
    const at=Number(event?.at)||0;
    return ['calls','connects','data'].includes(event?.type)&&Number(event?.delta)>0&&now-at<=windowMs;
  });
  if(events.length<2)return null;
  const counts={calls:0,connects:0,data:0};
  events.forEach(event=>{counts[event.type]+=Math.max(1,Number(event.delta)||1)});
  const active=Object.entries(counts).filter(([,value])=>value>0).map(([key])=>key);
  const labels={calls:'calls',connects:'connects',data:'data'};
  const detail=active.map(key=>labels[key]).join(active.length>1?' and ':', ');
  return{events:events.length,counts,active,detail,lastAt:Math.max(...events.map(event=>Number(event.at)||0))};
}
function balancedCorePriority(state,now){
  const order=['calls','connects','data'];
  const incomplete=order.map(key=>state.metrics.find(metric=>metric.key===key)).filter(metric=>metric&&metric.remaining>0);
  if(!incomplete.length)return null;
  const behind=incomplete.map(metric=>{
    const expected=expectedAt(metric.key,metric.target,now);
    return{metric,gap:Math.max(0,expected-metric.value),ratio:Math.max(0,expected-metric.value)/Math.max(1,metric.target)};
  }).filter(item=>item.gap>=Math.max(1,Math.ceil(item.metric.target*.1)));
  if(behind.length){
    behind.sort((a,b)=>b.ratio-a.ratio||order.indexOf(a.metric.key)-order.indexOf(b.metric.key));
    return behind[0].metric;
  }
  return incomplete[0];
}
function coachingEngine(viewDate=selectedDate,items=timelineItemsForDate(viewDate)){
  if(!isWorkDayKey(viewDate))return{title:'No tracking day scheduled',meta:'Your metrics remain available for reference',focusItemId:''};
  if(viewDate<todayKey())return{title:'Day complete',meta:`Final score ${completion(viewDate)}%`,focusItemId:''};
  if(viewDate>todayKey())return{title:'Plan your day',meta:items[0]?`First block starts ${timelineTimeLabel(items[0].minutes)}`:'No scheduled items',focusItemId:items[0]?.id||''};

  const now=new Date(),nowMinutes=now.getHours()*60+now.getMinutes(),state=coachingMetricState(viewDate);
  const currentAppointment=items.find(item=>item.kind==='appointment'&&nowMinutes>=item.minutes&&nowMinutes<item.minutes+(item.duration||60));
  const nextAppointment=items.find(item=>item.kind==='appointment'&&item.minutes>nowMinutes);
  const minutesToAppointment=nextAppointment?nextAppointment.minutes-nowMinutes:Infinity;
  const todayFollowUps=scheduledFollowUpsForDate(viewDate);
  const prospectingId=timelineFocusId(items,'focus'),knockingId=timelineFocusId(items,'knock'),progressId=timelineFocusId(items,'check'),wrapId=timelineFocusId(items,'wrap');

  if(currentAppointment)return{title:'Appointment Window',meta:`${currentAppointment.title} · Resume prospecting afterwards`,focusItemId:currentAppointment.id};
  if(nextAppointment&&minutesToAppointment<=10)return{title:'Appointment Window',meta:`${nextAppointment.title} starts in ${minutesToAppointment} min`,focusItemId:nextAppointment.id};
  if(nextAppointment&&minutesToAppointment<=30)return{title:'Appointment Window',meta:`Complete the current block, then prepare for ${timelineTimeLabel(nextAppointment.minutes)}`,focusItemId:nextAppointment.id};
  if(todayFollowUps.length&&nowMinutes<12*60)return{title:'Follow-Up Priority',meta:`${todayFollowUps.length} follow-up call${todayFollowUps.length===1?' is':'s are'} prioritised this morning`,focusItemId:timelineFollowUpId(items,todayFollowUps[0])};
  const followUps=dueFollowUps();
  if(followUps.length)return{title:'Follow-Up Priority',meta:`${followUps.length} past appointment${followUps.length===1?' needs':'s need'} an outcome`,focusItemId:timelineFollowUpId(items,followUps[0])||prospectingId};

  const allCoreComplete=state.incomplete.length===0;
  if(allCoreComplete&&state.knockRemaining===0){
    if(nowMinutes>=18*60+30)return{title:'Plan Ahead',meta:'Today’s targets are complete · Prepare the next workday',focusItemId:wrapId};
    if(nowMinutes>=17*60)return{title:'Calendar Management',meta:'Today’s targets are complete · Finalise follow-up and your calendar',focusItemId:wrapId};
    return{title:'Day Complete',meta:'All daily targets have been achieved',focusItemId:progressId};
  }

  if(nowMinutes>=14*60&&state.knockRemaining>0){
    const available=Math.max(0,17*60-nowMinutes);
    if(available<=0)return{title:'Finish Strong',meta:`${state.knockRemaining} knocking min will roll into the next scheduled day`,focusItemId:knockingId};
    const finish=new Date(now.getTime()+state.knockRemaining*60000);
    const finishLabel=finish.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'});
    return{title:'Time To Knock',meta:`${state.knockRemaining} min remaining · Finish around ${finishLabel}`,focusItemId:knockingId};
  }

  if(nowMinutes>=13*60+30&&nowMinutes<14*60&&state.knockRemaining>0){
    return{title:'Time To Knock',meta:`Door knocking starts in ${14*60-nowMinutes} min · ${state.knockRemaining} min target`,focusItemId:knockingId};
  }

  if(nowMinutes>=18*60+30)return{title:'Plan Ahead',meta:allCoreComplete?'Today’s core targets are complete':'Review unfinished activity and prepare the next workday',focusItemId:wrapId};

  if(state.incomplete.length){
    const momentum=activeProspectingMomentum(viewDate,now.getTime());
    if(momentum){
      const primary=balancedCorePriority(state,now);
      const remaining=primary?`${primary.remaining} ${primary.label} remaining`:'Core activity is moving';
      const momentumTitle=momentum.active.length===1&&momentum.active[0]==='calls'?'Strong Calling Run':'Prospecting Momentum';
      return{title:momentumTitle,meta:`${momentum.detail.charAt(0).toUpperCase()+momentum.detail.slice(1)} are moving · Keep the streak going · ${remaining}`,focusItemId:prospectingId};
    }
    const priority=balancedCorePriority(state,now)||state.incomplete[0];
    const coreDeadlineMinutes=14*60;
    const available=Math.max(1,coreDeadlineMinutes-nowMinutes);
    const possible=Math.max(1,Math.floor(available/60*priority.rate));
    const blockTarget=Math.min(priority.remaining,possible);
    const expected=expectedAt(priority.key,priority.target,now),behind=Math.max(0,expected-priority.value);
    if(behind>=Math.max(1,Math.ceil(priority.target*.1))){
      const recoveryMinutes=Math.max(10,Math.ceil(behind/priority.rate*60/5)*5);
      const recoveryTitle=nowMinutes>=16*60?'Finish Strong':nowMinutes>=12*60?'Afternoon Push':priority.key==='calls'?'Strong Calling Run':priority.action;
      return{title:recoveryTitle,meta:`${behind} ${priority.label} behind pace · Hold this focus for ${recoveryMinutes} minutes`,focusItemId:prospectingId};
    }
    const steadyTitle=nowMinutes>=16*60?'Finish Strong':nowMinutes>=12*60?'Afternoon Push':priority.key==='calls'?'Strong Calling Run':priority.action;
    return{title:steadyTitle,meta:`Build a steady block · ${blockTarget} ${priority.label} before ${timelineTimeLabel(coreDeadlineMinutes)}`,focusItemId:prospectingId};
  }

  return{title:'You’re ahead',meta:state.knockRemaining?`Core targets complete · Door knocking begins at 2:00pm`:'All targets complete',focusItemId:state.knockRemaining?knockingId:progressId};
}
function coachSentenceCase(value){
  const text=String(value||'').trim();
  return text?text.charAt(0).toUpperCase()+text.slice(1).toLowerCase():'';
}
function timelinePriority(viewDate=selectedDate){
  const items=timelineItemsForDate(viewDate),coach=coachingEngine(viewDate,items);
  return{...coach,items};
}
function renderNowCard(){
  const priority=timelinePriority(selectedDate);
  if($('#nowCardTitle'))$('#nowCardTitle').textContent=priority.title;
  if($('#nowCardMeta'))$('#nowCardMeta').textContent=coachSentenceCase(priority.meta);
}
function renderTimeline(){
  if(!$('#dailyTimeline'))return;
  const priority=timelinePriority(selectedDate),items=priority.items;
  $('#timelineDateLabel').textContent=fmtDate(selectedDate);
  $('#timelineCurrentTitle').textContent=priority.title;
  $('#timelineCurrentMeta').textContent=coachSentenceCase(priority.meta);
  $('#timelineSummary').textContent=`${items.filter(i=>i.kind==='appointment').length} appointment${items.filter(i=>i.kind==='appointment').length===1?'':'s'} · ${completion(selectedDate)}% complete`;
  $('#dailyTimeline').innerHTML=items.length?items.map((item,index)=>{
    const status=timelineStatus(item,index,items,selectedDate,priority.focusItemId);
    const marker=status==='complete'?'✓':status==='current'?'●':'○';
    const call=(item.kind==='followup'||item.kind==='appointment')&&item.dial?`<a class="timeline-call" href="tel:${escapeHtml(item.dial)}">Call</a>`:'';
    return `<article class="timeline-item ${status} ${item.kind}"><time>${escapeHtml(timelineTimeLabel(item.minutes))}</time><span class="timeline-marker">${marker}</span><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.meta)}</small>${call}</div></article>`;
  }).join(''):'<div class="empty">Nothing scheduled for this date.</div>';
}


function allAppointmentEntries(){
  const entries=[];
  Object.entries(days).forEach(([sourceDate,day])=>(day?.appointments||[]).forEach(appointment=>entries.push({appointment,sourceDate,scheduled:appointmentScheduledDate(appointment,sourceDate)})));
  return entries.sort((x,y)=>appointmentTimestamp(x.appointment,x.sourceDate)-appointmentTimestamp(y.appointment,y.sourceDate));
}
function appointmentLifecycle(a,sourceDate=''){
  const ts=appointmentTimestamp(a,sourceDate),now=Date.now();
  if(a.status==='completed'||a.followedUpAt||['Price Update Booked','Listing Appointment Booked','Signed','Listed','Not Proceeding','Missed'].includes(a.outcome))return'completed';
  if(ts&&ts>now)return'upcoming';
  return'follow-up';
}
function followUpDueLabel(a){
  if(!a.followUpDate)return'Follow-up due';
  const today=todayKey();
  if(a.followUpDate===today)return'Due today';
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
  if(a.followUpDate===dateKey(tomorrow))return'Due tomorrow';
  if(a.followUpDate<today){const diff=Math.max(1,Math.round((parseKey(today)-parseKey(a.followUpDate))/86400000));return`${diff} day${diff===1?'':'s'} overdue`;}
  return`Due ${shortAppointmentDate(a.followUpDate)}`;
}
function dueFollowUps(){return allAppointmentEntries().filter(({appointment:a,sourceDate})=>appointmentLifecycle(a,sourceDate)==='follow-up'&&(!a.followUpDate||a.followUpDate<=todayKey()));}
async function updateAppointmentRecord(id,sourceDate,changes){
  const d=dayData(sourceDate),index=d.appointments.findIndex(a=>String(a.id)===String(id));
  if(index<0)return toast('Appointment could not be found');
  d.appointments[index]={...d.appointments[index],...changes,updatedAt:Date.now()};
  days[sourceDate]=d;await saveDay(sourceDate);renderAll();
}
let pendingFollowUpAppointment=null;
let pendingOutcomeAppointment=null;
let selectedAppointmentOutcome='';

function openActionModal(id){
  const modal=$(id);if(!modal)return;
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');
}
function closeActionModal(id){
  const modal=$(id);if(!modal)return;
  modal.classList.remove('open');modal.setAttribute('aria-hidden','true');
}
function defaultFollowUpDate(){const d=new Date();d.setDate(d.getDate()+1);return dateKey(d);}
function setAppointmentFollowUp(id,sourceDate){
  pendingFollowUpAppointment={id,sourceDate};
  const input=$('#followUpDateInput');
  input.min=todayKey();input.value=defaultFollowUpDate();
  openActionModal('#followUpModal');
  setTimeout(()=>{try{input.showPicker?.()}catch{}},180);
}
async function saveAppointmentFollowUp(){
  if(!pendingFollowUpAppointment)return;
  const followUpDate=$('#followUpDateInput').value;
  if(!followUpDate)return toast('Choose a follow-up date');
  const {id,sourceDate}=pendingFollowUpAppointment;
  closeActionModal('#followUpModal');pendingFollowUpAppointment=null;
  await updateAppointmentRecord(id,sourceDate,{status:'follow-up',followUpDate,followedUpAt:null});toast('Follow-up scheduled');
}
async function markAppointmentFollowedUp(id,sourceDate){await updateAppointmentRecord(id,sourceDate,{status:'completed',followedUpAt:Date.now()});toast('Appointment marked followed up');}
function updateAppointmentOutcome(id,sourceDate){
  pendingOutcomeAppointment={id,sourceDate};selectedAppointmentOutcome='';
  $$('#outcomeOptions button').forEach(button=>button.classList.remove('selected'));
  $('#outcomeNoteInput').value='';$('#saveAppointmentOutcome').disabled=true;
  openActionModal('#outcomeModal');
}
async function saveSelectedAppointmentOutcome(){
  if(!pendingOutcomeAppointment||!selectedAppointmentOutcome)return;
  const {id,sourceDate}=pendingOutcomeAppointment,outcome=selectedAppointmentOutcome,note=$('#outcomeNoteInput').value.trim();
  closeActionModal('#outcomeModal');pendingOutcomeAppointment=null;
  if(outcome==='Still Nurturing'){
    await updateAppointmentRecord(id,sourceDate,{outcome,outcomeNote:note,status:'follow-up',followedUpAt:Date.now()});
    setAppointmentFollowUp(id,sourceDate);
  }else{
    await updateAppointmentRecord(id,sourceDate,{outcome,outcomeNote:note,status:'completed',followedUpAt:Date.now(),followUpDate:null});toast('Appointment outcome saved');
  }
}

function appointmentOutcomeLabel(outcome=''){
  if(outcome==='Signed')return'Listed';
  return outcome||'';
}
function appointmentOutcomeClass(outcome=''){
  const label=appointmentOutcomeLabel(outcome);
  if(label==='Still Nurturing')return'outcome-blue';
  if(label==='Listed')return'outcome-green';
  if(label==='Not Proceeding')return'outcome-amber';
  if(label==='Missed')return'outcome-red';
  return'';
}

function appointmentBookedLabel(a,sourceDate=''){
  const raw=Number(a.at||a.createdAt||0);
  if(raw){const d=new Date(raw);if(!Number.isNaN(d.getTime()))return`${shortAppointmentDate(dateKey(d))} at ${d.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit',hour12:true}).replace(/\s/g,'').toUpperCase()}`;}
  const created=a.createdDate||a.logDate||sourceDate;
  return created?shortAppointmentDate(parseKey(created)):'';
}
function appointmentHistoryEntries(mode){
  const now=Date.now();
  return allAppointmentEntries().filter(({appointment:a,sourceDate})=>{
    const scheduledAt=appointmentTimestamp(a,sourceDate);
    if(!scheduledAt)return mode==='past';
    return mode==='past'?scheduledAt<=now:scheduledAt>now;
  });
}
function appointmentReminderText(){
  const due=dueFollowUps();
  if(!due.length)return'';
  const overdue=due.filter(({appointment:a})=>a.followUpDate&&a.followUpDate<todayKey()).length;
  if(overdue)return`${overdue} follow-up${overdue===1?' is':'s are'} overdue · ${due.length} due now`;
  return`${due.length} appointment follow-up${due.length===1?' is':'s are'} due`;
}
function setAppointmentHistoryScreen(mode){
  appointmentHistoryMode=mode;
  $('#appointmentMainContent')?.classList.toggle('hidden',Boolean(mode));
  $('#appointmentHistoryScreen')?.classList.toggle('hidden',!mode);
  if(mode){$('#appointmentHistoryTitle').textContent=mode==='past'?'Past Appointments':'Upcoming Appointments';window.scrollTo({top:0,behavior:'instant'});}
  renderAppointments();
}

function appointmentCardMarkup(entry,{dailyLog=false,history=false}={}){
  const {appointment:a,sourceDate,scheduled}=entry;
  const contact=escapeHtml(a.contactName||a.name||'Contact not recorded'),rawPhone=String(a.contactNumber||a.phone||'').trim(),phone=escapeHtml(rawPhone),dial=rawPhone.replace(/[^+\d]/g,''),address=escapeHtml(a.address||'Address not recorded'),type=escapeHtml(appointmentType(a)),time=escapeHtml(appointmentTimeLabel(a,sourceDate)),lifecycle=appointmentLifecycle(a,sourceDate);
  const statusText=lifecycle==='upcoming'?'Upcoming':lifecycle==='completed'?'Completed':followUpDueLabel(a);
  const note=a.outcomeNote?`<small class="appointment-outcome-note">${escapeHtml(a.outcomeNote)}</small>`:'';
  const callAction=dial?`<a class="appointment-call appointment-action-wide" href="tel:${dial}">Call</a>`:'';
  let actions;
  if(dailyLog){
    const added=appointmentAddedToCalendar(a,sourceDate),calendarLabel=added?'Added to Calendar':'Add to Calendar';
    actions=`${callAction}<button class="appointment-secondary-action appointment-calendar-action ${added?'is-added':''}" data-calendar-appointment="${escapeHtml(calendarExportId(a,sourceDate))}" data-source-date="${escapeHtml(sourceDate)}">${added?'✓ ':''}${calendarLabel}</button>`;
  }else if(history&&appointmentHistoryMode==='upcoming'){
    const added=appointmentAddedToCalendar(a,sourceDate),calendarLabel=added?'Added to Calendar':'Add to Calendar';
    actions=`${callAction}<button class="appointment-secondary-action appointment-calendar-action ${added?'is-added':''}" data-calendar-appointment="${escapeHtml(calendarExportId(a,sourceDate))}" data-source-date="${escapeHtml(sourceDate)}">${added?'✓ ':''}${calendarLabel}</button>`;
  }else if(history&&appointmentHistoryMode==='past'){
    const followAction=lifecycle==='completed'?'':a.followUpDate?`<button class="appointment-secondary-action" data-mark-followedup="${a.id}" data-source-date="${sourceDate}">Mark Followed Up</button>`:`<button class="appointment-secondary-action" data-set-followup="${a.id}" data-source-date="${sourceDate}">Set Follow-Up</button>`;
    const outcomeLabel=escapeHtml(appointmentOutcomeLabel(a.outcome)||'Update Outcome');
    const outcomeClass=appointmentOutcomeClass(a.outcome);
    actions=`${callAction}${followAction}<button class="appointment-secondary-action appointment-outcome-action ${a.outcome?'has-outcome':''} ${outcomeClass}" data-update-outcome="${a.id}" data-source-date="${sourceDate}">${outcomeLabel}</button>`;
  }else{
    actions=lifecycle==='upcoming'?`${callAction}<button class="appointment-secondary-action" data-set-followup="${a.id}" data-source-date="${sourceDate}">Set Follow-Up</button>`:`${callAction}${lifecycle==='follow-up'?`<button class="appointment-secondary-action" data-mark-followedup="${a.id}" data-source-date="${sourceDate}">Mark Followed Up</button>`:''}<button class="appointment-secondary-action" data-update-outcome="${a.id}" data-source-date="${sourceDate}">${escapeHtml(appointmentOutcomeLabel(a.outcome)||'Update Outcome')}</button>`;
  }
  const booked=appointmentBookedLabel(a,sourceDate);
  const loggedMeta=dailyLog&&a.scheduledDate&&a.scheduledDate!==sourceDate?`<small class="appointment-log-scheduled">Scheduled for ${escapeHtml(shortAppointmentDate(scheduled))} at ${time}</small>`:`<small class="appointment-booked-for">${escapeHtml(shortAppointmentDate(scheduled))} at ${time}</small>`;
  const bookedMeta=history&&booked?`<small class="appointment-created-meta">Booked ${escapeHtml(booked)}</small>`:'';
  const dueMeta=history&&a.followUpDate?`<small class="appointment-followup-timestamp ${a.followUpDate<todayKey()?'overdue':''}">Follow-up due ${escapeHtml(shortAppointmentDate(a.followUpDate))}</small>`:'';
  return `<article class="appointment-card appointment-card-premium appointment-followup-card ${lifecycle}">
    <button class="appointment-delete" data-delete-appointment="${escapeHtml(a.id)}" data-source-date="${escapeHtml(sourceDate)}" aria-label="Delete appointment" title="Delete appointment">×</button>
    <div class="appointment-card-copy"><div class="appointment-card-top"><span class="appointment-type-badge">${type}</span><span class="appointment-status-badge ${lifecycle}">${escapeHtml(statusText)}</span></div><strong>${address}</strong><small>${contact}${phone?` · ${phone}`:''}</small>${loggedMeta}${bookedMeta}${dueMeta}${note}</div>
    <div class="appointment-followup-actions">${actions}</div>
  </article>`;
}
function renderAppointments(){
  const picker=$('#appointmentDatePicker');
  const locked=isPastDate(appointmentDate);
  $('#appointmentForm').classList.toggle('date-locked',locked);
  $$('#appointmentForm input, #appointmentForm button').forEach(el=>el.disabled=locked);
  $('#appointmentLock').classList.toggle('hidden',!locked);
  $('#appointmentDateLabel').textContent=fmtDate(appointmentDate);
  if($('#appointmentLogDate'))$('#appointmentLogDate').textContent=fmtDate(appointmentDate);
  if(picker&&!picker.value)picker.value=appointmentDate;
  const timeInput=$('#appointmentTime');if(timeInput&&!timeInput.value)timeInput.value='12:00';
  const all=allAppointmentEntries();
  const past=appointmentHistoryEntries('past'),upcoming=appointmentHistoryEntries('upcoming');
  if($('#pastAppointmentSummary'))$('#pastAppointmentSummary').textContent=`${past.length} past appointment${past.length===1?'':'s'} · follow-ups and outcomes`;
  if($('#upcomingAppointmentSummary'))$('#upcomingAppointmentSummary').textContent=`${upcoming.length} upcoming appointment${upcoming.length===1?'':'s'} · schedule and calls`;
  const reminder=appointmentReminderText();
  for(const id of ['#appointmentReminder','#appointmentHistoryReminder']){const el=$(id);if(el){el.textContent=reminder;el.classList.toggle('hidden',!reminder);}}
  if(appointmentHistoryMode&&$('#appointmentHistoryList')){
    const history=appointmentHistoryEntries(appointmentHistoryMode);
    $('#appointmentHistoryList').innerHTML=history.length?history.map(entry=>appointmentCardMarkup(entry,{history:true})).join(''):`<div class="empty">No ${appointmentHistoryMode} appointments.</div>`;
  }

  const daily=all.filter(({appointment:a,sourceDate})=>appointmentCreatedDate(a,sourceDate)===appointmentDate);
  $('#appointmentsList').innerHTML=daily.length?daily.map(entry=>appointmentCardMarkup(entry,{dailyLog:true})).join(''):'<div class="empty">No appointments logged for this day.</div>';
}

async function addAppointment({contactName,contactNumber,address,date,time,type}){
  const createdDate=todayKey();
  if(!canEditDate(createdDate))return lockedToast();
  const signature=[createdDate,date,time,type,contactName.trim().toLowerCase(),address.trim().toLowerCase()].join('|');
  if(appointmentSubmitLocks.has(signature))return null;
  appointmentSubmitLocks.add(signature);
  const scheduledAt=new Date(`${date}T${time}`).getTime();
  if(!validDateKey(date)||!Number.isFinite(scheduledAt)){appointmentSubmitLocks.delete(signature);toast('Appointment date or time is invalid');return null}
  const d=dayData(createdDate);
  const recentDuplicate=d.appointments.find(a=>[appointmentCreatedDate(a,createdDate),appointmentScheduledDate(a,createdDate),a.time,appointmentType(a),String(a.contactName||'').trim().toLowerCase(),String(a.address||'').trim().toLowerCase()].join('|')===signature&&Date.now()-(Number(a.at)||0)<15000);
  if(recentDuplicate){appointmentSubmitLocks.delete(signature);return recentDuplicate}
  const appointment=normaliseAppointmentRecord({id:uuid(),contactName,contactNumber,address,date,time,type,types:[type],createdDate,logDate:createdDate,scheduledDate:date,scheduledAt,at:Date.now()},createdDate);
  d.appointments.push(appointment);
  addEvent(d,'appointment',`${type} · ${contactName} · ${address} · booked for ${date} ${time}`);
  days[createdDate]=d;
  try{await saveDay(createdDate);renderAppointments();toast(date===createdDate?'Appointment logged':'Appointment logged and reminder created');return appointment}
  finally{appointmentSubmitLocks.delete(signature)}
}
async function deleteAppointment(id,sourceDate=appointmentDate){
  const d=dayData(sourceDate),index=d.appointments.findIndex(a=>String(a.id)===String(id));
  if(index<0)return toast('Appointment could not be found');
  const appointment=d.appointments[index],exportId=calendarExportId(appointment,sourceDate);
  d.appointments.splice(index,1);days[sourceDate]=d;
  const ids=calendarExportIds();ids.delete(exportId);localStorage.setItem(calendarExportStorageKey(),JSON.stringify([...ids]));
  await saveDay(sourceDate);renderAll();toast('Appointment deleted');
}


function sortedTodayLeaderboard(){
  return leaderboardEntries.filter(x=>x.date===todayKey()&&x.activeToday!==false).sort(sortLeaderboardRows);
}
function sortLeaderboardRows(a,b){return (b.score||0)-(a.score||0)||(b.calls||0)-(a.calls||0)||(b.connects||0)-(a.connects||0)||(b.data||0)-(a.data||0)}
function renderLeaderboardPosition(){
  const position=$('#leaderboardPosition'),meta=$('#leaderboardPositionMeta');
  if(!position||!meta)return;
  if(!cloud){position.textContent='—';meta.textContent='Sign in to view live ranking';return;}
  const rows=sortedTodayLeaderboard(),index=rows.findIndex(r=>r.uid===uid);
  if(index<0){position.textContent='—';meta.textContent=rows.length?`${rows.length} agent${rows.length===1?'':'s'} ranked today`:'Waiting for today’s rankings';return;}
  const me=rows[index];
  position.textContent=`#${index+1}`;
  meta.textContent=`${me.score||0}% complete · ${rows.length} agent${rows.length===1?'':'s'} ranked`;
}
function selectedLeaderboardDayDate(){const d=new Date();d.setDate(d.getDate()+leaderboardDayOffset);return d}
function selectedLeaderboardDayKey(){return dateKey(selectedLeaderboardDayDate())}
function selectedLeaderboardWeekDate(){return weekDateFromOffset(leaderboardWeekOffset)}
function selectedLeaderboardWeekKey(){return weekKeyFromDate(selectedLeaderboardWeekDate())}
function formatWeekRange(base){const start=mondayOf(base),end=new Date(start);end.setDate(start.getDate()+6);return `${start.toLocaleDateString('en-AU',{day:'numeric',month:'short'})}–${end.toLocaleDateString('en-AU',{day:'numeric',month:'short'})}`}
function normaliseDailyLeaderboardEntry(entry,key){
  if(key===todayKey()&&entry.date===key)return{uid:entry.uid,name:entry.name,email:entry.email,calls:entry.calls||0,connects:entry.connects||0,data:entry.data||0,knockMinutes:entry.knockMinutes||0,score:entry.score||0,targets:entry.targets||{}};
  const saved=entry.dailyHistory?.[key];
  if(saved==null)return null;
  if(typeof saved==='number')return{uid:entry.uid,name:entry.name,email:entry.email,calls:null,connects:null,data:null,knockMinutes:null,score:saved,targets:{}};
  return{uid:entry.uid,name:entry.name,email:entry.email,calls:saved.calls??null,connects:saved.connects??null,data:saved.data??null,knockMinutes:saved.knockMinutes??null,score:saved.score||0,targets:saved.targets||{}};
}
function dailyLeaderboardRows(){const key=selectedLeaderboardDayKey();return leaderboardEntries.map(entry=>normaliseDailyLeaderboardEntry(entry,key)).filter(Boolean).sort(sortLeaderboardRows)}
function weeklyLeaderboardRows(){
  const wk=selectedLeaderboardWeekKey();
  return leaderboardEntries.map(entry=>{const w=entry.weekHistory?.[wk];return w?{uid:entry.uid,name:entry.name,email:entry.email,...w}:null}).filter(Boolean).sort(sortLeaderboardRows);
}
function metricLabel(key){return({calls:'Calls',connects:'Connects',data:'Data',knocking:'Knocking'})[key]||'Calls'}
function metricRing(value,target,label){
  if(value==null)return `<span class="leaderboard-metric-ring unavailable" style="--metric-score:0"><i><strong>—</strong></i></span>`;
  const safeValue=Math.max(0,Math.round(Number(value)||0)),safeTarget=Number(target)||0,p=safeTarget?Math.max(0,Math.min(100,Math.round(safeValue/safeTarget*100))):0;
  return `<span class="leaderboard-metric-ring" style="--metric-score:${p}" role="img" aria-label="${label}: ${safeValue}, ${p}% complete"><i><strong>${safeValue}</strong></i></span>`;
}
function leaderboardRowHtml(r,i,weekly=false){
  const t=r.targets||{},score=Math.max(0,Math.min(100,r.score||0));
  return `<article class="leaderboard-row leaderboard-row-expanded ${r.uid===uid?'me':''}">
    <div class="leaderboard-row-summary">
      <b class="rank">${i+1}</b>
      <div class="agent"><strong>${escapeHtml(r.name||r.email?.split('@')[0]||'Agent')}</strong>${r.uid===uid?'<small>You</small>':''}</div>
      <em>${score}%<small>${weekly?'Week':'Day'}</small></em>
    </div>
    <div class="leaderboard-ring-metrics">
      ${metricRing(r.calls,t.calls,'Calls')}${metricRing(r.connects,t.connects,'Connects')}${metricRing(r.data,t.data,'Data')}${metricRing(r.knockMinutes,t.knock,'Knocks')}
    </div>
  </article>`;
}
function renderUnifiedLeaderboard(){
  const isWeek=leaderboardMode==='week',rows=isWeek?weeklyLeaderboardRows():dailyLeaderboardRows();
  $('#leaderboardDayTab').classList.toggle('active',!isWeek);$('#leaderboardWeekTab').classList.toggle('active',isWeek);
  $('#leaderboardDayTab').setAttribute('aria-selected',String(!isWeek));$('#leaderboardWeekTab').setAttribute('aria-selected',String(isWeek));
  $('#dayHistoryControls').classList.toggle('hidden',isWeek);$('#weekHistoryControls').classList.toggle('hidden',!isWeek);
  $('#leaderboardPeriodLabel').textContent=isWeek?'WEEKLY LEADERBOARD':'DAILY LEADERBOARD';
  $('#leaderboardDate').textContent=isWeek?`Week ${formatWeekRange(selectedLeaderboardWeekDate())}`:fmtDate(selectedLeaderboardDayKey());
  $('#leaderboardList').innerHTML=rows.length?rows.map((r,i)=>leaderboardRowHtml(r,i,isWeek)).join(''):`<div class="empty">No team data is available for this ${isWeek?'week':'day'} yet.</div>`;
  $('#leaderboardNote').textContent=isWeek?'Ranked by weekly overall completion. Use the arrows to review prior weeks.':'Ranked by daily overall completion. Use the arrows to review prior days.';
  $('#dayNext').disabled=leaderboardDayOffset>=0;$('#dayToday').disabled=leaderboardDayOffset===0;$('#weekNext').disabled=leaderboardWeekOffset>=0;
}
function renderWeeklyLeaderboard(){renderUnifiedLeaderboard()}
function leaderboardMomentum(entry){
  const prevKey=previousScheduledKey(todayKey(),entry.workDays||workDays);
  if(!prevKey)return{diff:0,label:'—',className:'flat'};
  const raw=entry.dailyHistory?.[prevKey],prev=typeof raw==='number'?raw:Number(raw?.score);
  if(!Number.isFinite(prev))return{diff:0,label:'—',className:'flat'};
  const diff=(entry.score||0)-prev;
  return{diff,label:diff>0?`▲ ${diff}%`:diff<0?`▼ ${Math.abs(diff)}%`:'• 0%',className:diff>0?'up':diff<0?'down':'flat'};
}
function personalBests(){
  let bestDay={value:0,key:null},bestCalls={value:0,key:null},bestKnock={value:0,key:null};
  for(const [key,raw] of Object.entries(days)){
    if(!isWorkDayKey(key))continue;
    const d=dayData(key),score=completion(key),knock=Math.floor(liveKnockSeconds(d)/60);
    if(score>bestDay.value){bestDay={value:score,key}};
    if(d.calls>bestCalls.value){bestCalls={value:d.calls,key}};
    if(knock>bestKnock.value){bestKnock={value:knock,key}};
  }
  return{bestDay,bestCalls,bestKnock};
}
function renderPersonalBests(){
  if(!$('#bestDayScore'))return;
  const b=personalBests();
  $('#bestDayScore').textContent=`${b.bestDay.value}%`;
  $('#bestDayDate').textContent=b.bestDay.key?fmtDate(b.bestDay.key):'No completed days yet';
  $('#bestCallsValue').textContent=b.bestCalls.value;
  $('#bestCallsDate').textContent=b.bestCalls.key?fmtDate(b.bestCalls.key):'No activity yet';
  $('#bestKnockValue').textContent=`${b.bestKnock.value} min`;
  $('#bestKnockDate').textContent=b.bestKnock.key?fmtDate(b.bestKnock.key):'No activity yet';
}
function renderMondayReview(){
  if(!$('#mondayReviewScore'))return;
  const base=weekDateFromOffset(-1),summary=weekSummaryFor(base),metrics=summary.metricPcts||{};
  const strongest=Object.entries(metrics).sort((a,b)=>b[1]-a[1])[0]||['calls',0];
  const weakest=Object.entries(metrics).sort((a,b)=>a[1]-b[1])[0]||['calls',0];
  $('#mondayReviewWeek').textContent=`Week ${formatWeekRange(base)}`;
  $('#mondayReviewScore').textContent=`${summary.score}%`;
  $('#mondayReviewText').textContent=`Strongest: ${metricLabel(strongest[0])} ${strongest[1]}% · Improve: ${metricLabel(weakest[0])} ${weakest[1]}%`;
}
function renderLeaderboard(){
  const date=todayKey(),rows=sortedTodayLeaderboard();
  $('#leaderboardStatus').textContent=cloud?'LIVE':'DEVICE ONLY';
  const meIndex=rows.findIndex(r=>r.uid===uid),me=meIndex>=0?rows[meIndex]:null,myScore=me?.score??completion(date),leaderScore=rows[0]?.score||0,gap=rows.length?Math.max(0,leaderScore-myScore):0;
  if($('#leaderboardRing'))$('#leaderboardRing').style.setProperty('--score',Math.max(0,Math.min(100,myScore)));
  if($('#leaderboardHeroScore'))$('#leaderboardHeroScore').textContent=`${myScore}%`;
  if($('#leaderboardHeroRank'))$('#leaderboardHeroRank').textContent=meIndex>=0?`#${meIndex+1}`:'—';
  if($('#leaderboardHeroMessage'))$('#leaderboardHeroMessage').textContent=meIndex===0?'You are leading today':meIndex>0?`${gap}% to the lead`:'Waiting for your first update';
  if($('#leaderboardAgentCount'))$('#leaderboardAgentCount').textContent=rows.length;
  if($('#leaderboardTopScore'))$('#leaderboardTopScore').textContent=`${leaderScore}%`;
  if($('#leaderboardGap'))$('#leaderboardGap').textContent=rows.length?(gap?`${gap}%`:'Leading'):'—';
  renderUnifiedLeaderboard();renderLeaderboardPosition();
}

function scorecardWeekDate(){return weekDateFromOffset(scorecardWeekOffset)}
function scorecardGrade(score){return score>=100?'A+':score>=95?'A':score>=90?'A−':score>=80?'B':score>=70?'C':'Needs Attention'}
function scorecardAppointments(base=scorecardWeekDate()){
  const start=mondayOf(base),end=new Date(start);end.setDate(start.getDate()+6);
  const startKey=dateKey(start),endKey=dateKey(end),entries=[];
  Object.entries(days).forEach(([sourceDate,day])=>(day?.appointments||[]).forEach(a=>{
    const scheduled=appointmentScheduledDate(a,sourceDate);
    if(scheduled>=startKey&&scheduled<=endKey)entries.push({appointment:a,sourceDate,scheduled});
  }));
  return entries.sort((x,y)=>appointmentTimestamp(x.appointment,x.sourceDate)-appointmentTimestamp(y.appointment,y.sourceDate));
}
function scorecardWeekRecords(){
  const keys=Object.keys(days).sort();
  if(!keys.length)return[];
  const first=mondayOf(parseKey(keys[0])),last=mondayOf(new Date()),records=[];
  for(let d=new Date(first);d<=last;d.setDate(d.getDate()+7)){const base=new Date(d),w=weekSummaryFor(base);records.push({base,score:w.score,calls:w.calls})}
  return records;
}
function scorecardWeekStreak(records){let count=0;for(let i=records.length-1;i>=0;i--){if(records[i].score>=90)count++;else break}return count}
function renderScorecardAppointments(entries,base){
  const panel=$('#scorecardAppointmentHistory'),list=$('#scorecardAppointmentList');
  if(!panel||!list)return;
  $('#scorecardAppointmentHistoryLabel').textContent=`Week ${formatWeekRange(base)}`;
  list.innerHTML=entries.length?entries.map(({appointment:a,sourceDate,scheduled})=>{
    const phone=String(a.contactNumber||a.phone||'').trim(),contact=a.contactName||a.name||'Contact not recorded',address=a.address||'Address not recorded';
    const when=`${parseKey(scheduled).toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})} at ${appointmentTimeLabel(a,sourceDate)}`;
    const tel=phone?`<a class="scorecard-call" href="tel:${escapeHtml(phone.replace(/[^+\d]/g,''))}">Call ${escapeHtml(contact.split(/\s+/)[0]||'contact')}</a>`:'';
    const lifecycle=appointmentLifecycle(a,sourceDate),status=lifecycle==='completed'?(appointmentOutcomeLabel(a.outcome)||'Completed'):lifecycle==='follow-up'?followUpDueLabel(a):'Upcoming';
    return `<article class="scorecard-appointment-item"><header><span>${escapeHtml(appointmentType(a))}</span><small>${escapeHtml(status)}</small></header><h3>${escapeHtml(address)}</h3><p>${escapeHtml(contact)}${phone?` · ${escapeHtml(phone)}`:''}<br>Booked for ${escapeHtml(when)}</p><div class="scorecard-followup-actions">${tel}${lifecycle!=='upcoming'?`<button data-update-outcome="${a.id}" data-source-date="${sourceDate}">Update Outcome</button>`:''}</div></article>`;
  }).join(''):'<div class="empty">No appointments booked for this week.</div>';
}
function previousWeekDate(base){const d=new Date(base);d.setDate(d.getDate()-7);return d}
function signedChange(current,previous,unit='%'){
  if(!previous&&current)return `▲ ${current}${unit}`;
  if(!previous&&!current)return `• 0${unit}`;
  const delta=unit==='%'?Math.round((current-previous)/Math.max(1,previous)*100):current-previous;
  return `${delta>0?'▲':delta<0?'▼':'•'} ${Math.abs(delta)}${unit}`;
}
function activityEvents(){return Object.entries(days).flatMap(([key,raw])=>(raw.events||[]).map(e=>({...e,key,date:new Date(e.at||`${key}T09:00:00`)}))).filter(e=>Number.isFinite(e.date.getTime()))}
function productivityInsights(){
  const workEntries=Object.keys(days).filter(isWorkDayKey).map(key=>({key,d:dayData(key),score:completion(key)}));
  const dayGroups={};for(const x of workEntries){const name=workDayName(parseKey(x.key).getDay());(dayGroups[name]??=[]).push(x.score)}
  const bestDay=Object.entries(dayGroups).map(([name,v])=>({name,avg:Math.round(v.reduce((a,b)=>a+b,0)/v.length)})).sort((a,b)=>b.avg-a.avg)[0];
  const totals=workEntries.reduce((a,x)=>({calls:a.calls+x.d.calls,connects:a.connects+x.d.connects}),{calls:0,connects:0});
  const events=activityEvents(),hours={};for(const e of events){if(!['calls','connects','data'].includes(e.type))continue;const h=e.date.getHours();if(h<7||h>19)continue;hours[h]=(hours[h]||0)+Math.max(1,Number(e.delta)||1)}
  const bestHour=Object.entries(hours).sort((a,b)=>b[1]-a[1])[0];
  const knockStarts=events.filter(e=>e.type==='knock'&&String(e.label||'').toLowerCase().includes('started')).map(e=>e.date.getHours()*60+e.date.getMinutes());
  const avgKnock=knockStarts.length?Math.round(knockStarts.reduce((a,b)=>a+b,0)/knockStarts.length):null;
  return{bestDay,bestHour,connectRate:totals.calls?Math.round(totals.connects/totals.calls*100):0,avgKnock};
}
function formatHourRange(hour){hour=Number(hour);const a=new Date(2026,0,1,hour),b=new Date(2026,0,1,hour+1);return `${a.toLocaleTimeString('en-AU',{hour:'numeric',hour12:true}).replace(' ','')}–${b.toLocaleTimeString('en-AU',{hour:'numeric',hour12:true}).replace(' ','')}`}
function formatMinutesTime(minutes){if(minutes==null)return '—';const h=Math.floor(minutes/60),m=minutes%60;return new Date(2026,0,1,h,m).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit',hour12:true}).replace(' ','')}
function renderScorecard(){
  if(!$('#scorecardScore'))return;
  const base=scorecardWeekDate(),w=weekSummaryFor(base),prev=weekSummaryFor(previousWeekDate(base)),m=w.metricPcts||{},pm=prev.metricPcts||{};
  const metrics=Object.entries(m),strongest=[...metrics].sort((a,b)=>b[1]-a[1])[0]||['calls',0],weakest=[...metrics].sort((a,b)=>a[1]-b[1])[0]||['calls',0];
  $('#scorecardWeekLabel').textContent=scorecardWeekOffset===0?`This week · ${formatWeekRange(base)}`:`Week ${formatWeekRange(base)}`;
  $('#scorecardScore').textContent=`${w.score}%`;$('#scorecardGrade').textContent=`Weekly Grade · ${scorecardGrade(w.score)}`;
  $('#scorecardStatus').textContent=w.score>=95?'A strong, balanced week.':w.score>=90?'On track for an A-grade week.':`${metricLabel(weakest[0])} is holding the week back.`;
  $('#scorecardCalls').textContent=`${w.calls} / ${w.targets.calls}`;$('#scorecardCallsPct').textContent=`${m.calls||0}%`;
  $('#scorecardConnects').textContent=`${w.connects} / ${w.targets.connects}`;$('#scorecardConnectsPct').textContent=`${m.connects||0}%`;
  $('#scorecardData').textContent=`${w.data} / ${w.targets.data}`;$('#scorecardDataPct').textContent=`${m.data||0}%`;
  $('#scorecardKnock').textContent=`${w.knockMinutes} / ${w.targets.knock} min`;$('#scorecardKnockPct').textContent=`${m.knocking||0}%`;
  $('#scorecardStrongest').textContent=`Strongest: ${metricLabel(strongest[0])} · ${strongest[1]}%`;
  $('#scorecardWeakest').textContent=`Focus: ${metricLabel(weakest[0])} · ${Math.max(0,100-weakest[1])}% remaining`;
  const remaining=[Math.max(0,w.targets.calls-w.calls),Math.max(0,w.targets.connects-w.connects),Math.max(0,w.targets.data-w.data),Math.max(0,w.targets.knock-w.knockMinutes)];
  $('#scorecardProjection').textContent=w.score>=100?'All weekly targets achieved.':`To close the week: ${remaining[0]} calls, ${remaining[1]} connects, ${remaining[2]} data and ${remaining[3]} knock minutes remaining.`;
  const trendData=[['Calls',w.calls,prev.calls,''],['Connects',w.connects,prev.connects,''],['Data',w.data,prev.data,''],['Knocking',w.knockMinutes,prev.knockMinutes,' min']];
  $('#scorecardTrendGrid').innerHTML=trendData.map(([label,current,previous,unit])=>`<article><span>${label}</span><strong>${signedChange(current,previous,unit)}</strong><small>${current}${unit} vs ${previous}${unit}</small></article>`).join('');
  const changes=trendData.map(([label,current,previous])=>({label,delta:current-previous}));const up=changes.filter(x=>x.delta>0).sort((a,b)=>b.delta-a.delta)[0],down=changes.filter(x=>x.delta<0).sort((a,b)=>a.delta-b.delta)[0];
  $('#scorecardTrendSummary').textContent=up&&down?`${up.label} improved the most, while ${down.label.toLowerCase()} needs attention.`:up?`${up.label} showed the strongest improvement this week.`:down?`${down.label} declined compared with last week.`:'Performance is level with last week.';
  const ins=productivityInsights();
  $('#insightBestHour').textContent=ins.bestHour?formatHourRange(ins.bestHour[0]):'—';$('#insightBestHourMeta').textContent=ins.bestHour?`${ins.bestHour[1]} logged activities`:'Not enough activity yet';
  $('#insightBestDay').textContent=ins.bestDay?.name||'—';$('#insightBestDayMeta').textContent=ins.bestDay?`${ins.bestDay.avg}% average completion`:'Not enough activity yet';
  $('#insightConnectRate').textContent=`${ins.connectRate}%`;$('#insightKnockStart').textContent=formatMinutesTime(ins.avgKnock);
  const rec=[];
  if(ins.bestDay)rec.push(`${ins.bestDay.name} is your strongest day, averaging ${ins.bestDay.avg}% completion.`);
  if(ins.bestHour)rec.push(`Your most productive prospecting hour is ${formatHourRange(ins.bestHour[0])}.`);
  if(ins.avgKnock!=null){const diff=ins.avgKnock-14*60;rec.push(diff>0?`Your average knock start is ${diff} minutes later than the 2:00PM target.`:`Your average knock start is on or ahead of the 2:00PM target.`)}
  if(weakest[1]<100)rec.push(`Improving ${metricLabel(weakest[0]).toLowerCase()} by ${100-weakest[1]}% would create the biggest lift in your weekly grade.`);
  $('#scorecardRecommendations').innerHTML=(rec.slice(0,4).map(x=>`<article>${escapeHtml(x)}</article>`).join('')||'<div class="empty">Recommendations will appear once more activity is logged.</div>');
  $('#scorecardNext').disabled=scorecardWeekOffset>=0;
}

function switchInsightsPage(id){$$('.insights-switch button').forEach(b=>b.classList.toggle('active',b.dataset.insightsPage===id));$$('.insights-page').forEach(p=>p.classList.toggle('active',p.id===id));if(id==='leaderboardInsights')renderLeaderboard();else renderScorecard()}
function renderInsights(){renderScorecard();renderLeaderboard()}
function renderYearOverview(){const labels=['M','T','W','T','F','S','S'];const months=[];for(let m=0;m<12;m++){const first=new Date(year,m,1),pad=(first.getDay()+6)%7;let cells=`<div class="mini-weekdays">${labels.map(x=>`<b>${x}</b>`).join('')}</div><div class="mini-days">${'<i></i>'.repeat(pad)}`;for(let d=1;d<=new Date(year,m+1,0).getDate();d++){const dt=new Date(year,m,d),k=dateKey(dt),p=completion(k),off=!workDays.includes(dt.getDay());cells+=`<button class="mini-day ${levelClass(p)} ${off?'off':''} ${k===todayKey()?'today':''} ${k===selectedDate?'selected':''}" data-date="${k}" aria-label="${fmtDate(k)}, ${p}% complete">${d}</button>`}cells+='</div>';months.push(`<section class="mini-month"><h3>${new Date(year,m,1).toLocaleDateString('en-AU',{month:'short'})}</h3>${cells}</section>`)}$('#yearHeatmap').innerHTML=months.join('')}
function levelClass(p){return p>=100?'l4':p>=67?'l3':p>=34?'l2':p>0?'l1':''}
function renderMonth(){const y=monthCursor.getFullYear(),m=monthCursor.getMonth();$('#monthLabel').textContent=monthCursor.toLocaleDateString('en-AU',{month:'long',year:'numeric'});const vals=[];for(let d=1;d<=new Date(y,m+1,0).getDate();d++){const dt=new Date(y,m,d);if(workDays.includes(dt.getDay()))vals.push(completion(dateKey(dt)))}const groups=[];for(let i=0;i<vals.length;i+=4){const g=vals.slice(i,i+4);groups.push(Math.round(g.reduce((a,b)=>a+b,0)/Math.max(1,g.length)))}$('#monthBars').innerHTML=groups.map((p,i)=>`<div title="${p}%"><i style="height:${Math.max(3,p)}%"></i><small>W${i+1}</small></div>`).join('')}
function renderCalendar(){const labels=['M','T','W','T','F','S','S'];$('#calendarYear').textContent=year;const months=[];for(let m=0;m<12;m++){const first=new Date(year,m,1),pad=(first.getDay()+6)%7;let cells=`<div class="weekday-row">${labels.map(x=>`<b>${x}</b>`).join('')}</div><div class="days">${'<i></i>'.repeat(pad)}`;for(let d=1;d<=new Date(year,m+1,0).getDate();d++){const dt=new Date(year,m,d),k=dateKey(dt),p=completion(k),off=!workDays.includes(dt.getDay());cells+=`<button class="day-cell ${levelClass(p)} ${off?'off':''} ${k===todayKey()?'today':''} ${k===selectedDate?'selected':''}" data-date="${k}" title="${fmtDate(k)} · ${p}%">${d}</button>`}cells+='</div>';months.push(`<section class="month"><h3>${new Date(year,m,1).toLocaleDateString('en-AU',{month:'long'})}</h3>${cells}</section>`)}$('#calendarGrid').innerHTML=months.join('')}
function renderSettings(){const name=displayAgentName();$('#agentName').value=name;$('#callsTarget').value=targets.calls;$('#connectsTarget').value=targets.connects;$('#dataTarget').value=targets.data;$('#weeklyKnockTarget').value=targets.weeklyKnock;$$('[name=workDay]').forEach(el=>el.checked=workDays.includes(Number(el.value)));$$('[name=calendarPreference]').forEach(el=>el.checked=el.value===calendarPreference);$('#accountEmail').textContent=currentUser?.email||'Device-only mode';$('#modeNote').textContent=cloud?'Live sync is active. Use the same login on every device.':'Data is stored only on this device.';const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'A';if($('#profileAvatar'))$('#profileAvatar').textContent=initials;if($('#profileSyncState'))$('#profileSyncState').textContent=cloud?'Live sync active':'Device-only profile';if($('#profileTodayScore'))$('#profileTodayScore').textContent=`${completion(todayKey())}%`;if($('#profileWeekScore'))$('#profileWeekScore').textContent=`${weekSummary().score}%`;if($('#profileWorkDays'))$('#profileWorkDays').textContent=workDays.length}
function renderAll(){renderToday();renderTimeline();renderAppointments();renderInsights();renderSettings()}

async function startCloud(user){unsubDays?.();unsubProfile?.();unsubLeaderboard?.();currentUser=user;uid=user.uid;cloud=true;loadLocal(uid);await finaliseExpiredTimers();setSync('','Connecting');clearTimeout(syncTimer);syncTimer=setTimeout(()=>{if($('#syncBadge').dataset.label==='Connecting')setSync(navigator.onLine?'':'offline',navigator.onLine?'Connected':'Offline')},3500);unsubDays=onSnapshot(collection(db,'users',uid,'days'),{includeMetadataChanges:true},snap=>{snap.docChanges().forEach(ch=>{if(ch.type==='removed'){delete days[ch.doc.id];return}const incoming=normaliseDayRecord(ch.doc.data(),ch.doc.id),local=dayData(ch.doc.id);days[ch.doc.id]=local.clientUpdatedAt>incoming.clientUpdatedAt&&snap.metadata.fromCache?local:incoming});saveLocal();renderAll();ensureTick();clearTimeout(syncTimer);setSync(snap.metadata.fromCache&&!navigator.onLine?'offline':'live',snap.metadata.hasPendingWrites?'Saving':'Live')},err=>{console.error(err);setSync('error','Sync error');toast('Firestore access failed. Check rules and login.');showAuthMessage(err.message)});unsubProfile=onSnapshot(doc(db,'users',uid),snap=>{if(snap.exists()){const profile=snap.data();if(profile.targets)targets={...DEFAULTS,...profile.targets};if(Array.isArray(profile.workDays)&&profile.workDays.length)workDays=normaliseWorkDays(profile.workDays);if(profile.name)agentName=profile.name;saveLocal();renderAll();scheduleLeaderboardPublish()}},err=>console.error(err));unsubLeaderboard=onSnapshot(collection(db,'leaderboard'),{includeMetadataChanges:true},snap=>{leaderboardEntries=snap.docs.map(d=>({uid:d.id,...d.data()}));renderLeaderboard()},err=>{console.error('Leaderboard read failed',err);$('#leaderboardStatus').textContent='SYNC ERROR'});setSync(navigator.onLine?'live':'offline',navigator.onLine?'Live':'Offline');showApp();scheduleLeaderboardPublish()}
function showApp(){$('#authGate').classList.add('hidden');$('#app').classList.remove('hidden');$('#appointmentDatePicker').value=appointmentDate;renderAll();ensureTick()}
let viewportFrame=0;
function updateAppViewport(){
  cancelAnimationFrame(viewportFrame);
  viewportFrame=requestAnimationFrame(()=>{
    const standalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
    const vv=window.visualViewport;
    const candidates=[window.innerHeight,document.documentElement.clientHeight];
    if(vv)candidates.push(vv.height+vv.offsetTop);
    if(standalone)candidates.push(window.screen?.height||0,window.screen?.availHeight||0);
    const height=Math.round(Math.max(...candidates.filter(Number.isFinite)));
    document.documentElement.style.setProperty('--app-height',`${height}px`);
    document.documentElement.style.setProperty('--visual-height',`${Math.round(vv?.height||window.innerHeight)}px`);
  });
}
function bindViewport(){
  updateAppViewport();
  window.addEventListener('resize',updateAppViewport,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(updateAppViewport,180),{passive:true});
  window.visualViewport?.addEventListener('resize',updateAppViewport,{passive:true});
  window.visualViewport?.addEventListener('scroll',updateAppViewport,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){updateAppViewport();finaliseExpiredTimers().then(()=>renderAll())}});
}
async function init(){bindViewport();loadLocal('local');await finaliseExpiredTimers();if(!configured()){showAuthMessage('Firebase is not configured. You can still use device-only mode.');return}try{const fb=initializeApp(firebaseConfig);auth=getAuth(fb);await setPersistence(auth,browserLocalPersistence);db=initializeFirestore(fb,{experimentalAutoDetectLongPolling:true,localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});onAuthStateChanged(auth,u=>{if(u){startCloud(u)}else{clearActiveSession();$('#app').classList.add('hidden');$('#authGate').classList.remove('hidden')}})}catch(err){console.error(err);showAuthMessage(err.message)}}
function showAuthMessage(msg){$('#authMessage').textContent=msg}
function switchView(id){if(id!=='appointmentsView'&&appointmentHistoryMode)setAppointmentHistoryScreen(null);$$('.tabbar button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));updateTopbar(id);if(id==='scheduleView')renderTimeline();if(id==='appointmentsView')renderAppointments();if(id==='insightsView')renderInsights()}

function shiftHeaderDate(delta){
  const id=activeViewId();
  if(id==='appointmentsView'){
    const d=parseKey(appointmentDate);d.setDate(d.getDate()+delta);appointmentDate=dateKey(d);
    $('#appointmentDatePicker').value=appointmentDate;renderAppointments();updateTopbar(id);return;
  }
  if(id==='todayView'||id==='scheduleView'){
    const d=parseKey(selectedDate);d.setDate(d.getDate()+delta);selectedDate=dateKey(d);appointmentDate=selectedDate;
    $('#appointmentDatePicker').value=appointmentDate;renderAll();ensureTick();
  }
}

function openCalendar(){$('#calendarModal').classList.add('open');renderCalendar()}

$('#authForm').addEventListener('submit',async e=>{e.preventDefault();showAuthMessage('');try{await signInWithEmailAndPassword(auth,$('#email').value,$('#password').value)}catch(err){showAuthMessage(err.message)}});
$('#createAccount').onclick=async()=>{try{await createUserWithEmailAndPassword(auth,$('#email').value,$('#password').value)}catch(err){showAuthMessage(err.message)}};
$('#localMode').onclick=()=>{clearActiveSession();uid='local';loadLocal('local');setSync('offline','This device');showApp()};
$$('[data-action]').forEach(b=>b.onclick=()=>changeMetric(b.dataset.metric,b.dataset.action==='plus'?1:-1));
$('#timerButton').onclick=toggleTimer;$('#openTodayTimeline').onclick=()=>switchView('scheduleView');$('#resetKnock').onclick=resetKnock;$('#previousDay').onclick=()=>shiftHeaderDate(-1);$('#nextDay').onclick=()=>shiftHeaderDate(1);$('#settingsShortcut').onclick=()=>switchView('settingsView');$('#homeShortcut').onclick=()=>switchView('todayView');$('#backToday').onclick=()=>{selectedDate=todayKey();appointmentDate=selectedDate;$('#appointmentDatePicker').value=appointmentDate;renderAll();ensureTick()};
$('.tabbar').onclick=e=>{const b=e.target.closest('button[data-view]');if(b)switchView(b.dataset.view)};
$('.insights-switch').onclick=e=>{const b=e.target.closest('button[data-insights-page]');if(b)switchInsightsPage(b.dataset.insightsPage)};
document.querySelector('.leaderboard-mode-tabs').onclick=e=>{const b=e.target.closest('[data-leaderboard-mode]');if(!b)return;leaderboardMode=b.dataset.leaderboardMode==='week'?'week':'day';renderUnifiedLeaderboard()};
$('#dayPrev').onclick=()=>{leaderboardDayOffset--;renderUnifiedLeaderboard()};
$('#dayNext').onclick=()=>{if(leaderboardDayOffset<0)leaderboardDayOffset++;renderUnifiedLeaderboard()};
$('#dayToday').onclick=()=>{leaderboardDayOffset=0;renderUnifiedLeaderboard()};
$('#weekPrev').onclick=()=>{leaderboardWeekOffset--;renderUnifiedLeaderboard()};
$('#weekNext').onclick=()=>{if(leaderboardWeekOffset<0)leaderboardWeekOffset++;renderUnifiedLeaderboard()};
$('#weekLast').onclick=()=>{leaderboardWeekOffset=-1;renderUnifiedLeaderboard()};
$('#scorecardPrev').onclick=()=>{scorecardWeekOffset--;renderScorecard()};$('#scorecardNext').onclick=()=>{if(scorecardWeekOffset<0)scorecardWeekOffset++;renderScorecard()};
$('#appointmentDatePicker').onchange=()=>{};
document.querySelector('.appointment-destination-grid').onclick=e=>{const b=e.target.closest('[data-open-appointment-history]');if(!b)return;setAppointmentHistoryScreen(b.dataset.openAppointmentHistory)};
$('#closeAppointmentHistory').onclick=()=>setAppointmentHistoryScreen(null);
$('#appointmentForm').onsubmit=async e=>{e.preventDefault();const viewedDate=appointmentDate;const contactName=$('#appointmentContactName').value.trim(),contactNumber=$('#appointmentContactNumber').value.trim(),address=$('#appointmentAddress').value.trim(),date=$('#appointmentDatePicker').value,time=$('#appointmentTime').value,type=$('.appointment-types input:checked')?.value||'',error=$('#appointmentFormError');const missing=[];if(!contactName)missing.push('contact name');if(!contactNumber)missing.push('contact number');if(!address)missing.push('property address');if(!date)missing.push('booking date');if(!time)missing.push('booking time');if(!type)missing.push('appointment type');if(missing.length){error.textContent=`Add ${missing.join(', ')}`;error.classList.remove('hidden');return}error.textContent='';error.classList.add('hidden');const appointment=await addAppointment({contactName,contactNumber,address,date,time,type});if(appointment&&confirm(`Add to ${calendarPreference==='apple'?'Apple':'Outlook'} Calendar?`))exportAppointmentToCalendar(appointment,appointment.createdDate);e.target.reset();appointmentDate=viewedDate;$('#appointmentDatePicker').value=viewedDate;$('#appointmentTime').value='12:00';renderAppointments();updateTopbar('appointmentsView')};
$('#saveFollowUpDate').onclick=saveAppointmentFollowUp;
$$('[data-close-followup]').forEach(button=>button.onclick=()=>{closeActionModal('#followUpModal');pendingFollowUpAppointment=null;});
$('#outcomeOptions').onclick=e=>{const button=e.target.closest('[data-outcome]');if(!button)return;selectedAppointmentOutcome=button.dataset.outcome;$$('#outcomeOptions button').forEach(item=>item.classList.toggle('selected',item===button));$('#saveAppointmentOutcome').disabled=false;};
$('#saveAppointmentOutcome').onclick=saveSelectedAppointmentOutcome;
$$('[data-close-outcome]').forEach(button=>button.onclick=()=>{closeActionModal('#outcomeModal');pendingOutcomeAppointment=null;selectedAppointmentOutcome='';});
$('#followUpModal').onclick=e=>{if(e.target.id==='followUpModal'){closeActionModal('#followUpModal');pendingFollowUpAppointment=null;}};
$('#outcomeModal').onclick=e=>{if(e.target.id==='outcomeModal'){closeActionModal('#outcomeModal');pendingOutcomeAppointment=null;selectedAppointmentOutcome='';}};

$('#appointmentsView').onclick=e=>{
  const calendarButton=e.target.closest('[data-calendar-appointment]');
  if(calendarButton){
    const sourceDate=calendarButton.dataset.sourceDate||appointmentDate;
    const entry=allAppointmentEntries().find(({appointment:a,sourceDate:s})=>calendarExportId(a,s)===calendarButton.dataset.calendarAppointment&&s===sourceDate);
    if(!entry)return toast('Appointment could not be found');
    if(appointmentAddedToCalendar(entry.appointment,entry.sourceDate))return toast('Already added to calendar');
    exportAppointmentToCalendar(entry.appointment,entry.sourceDate);return;
  }
  const follow=e.target.closest('[data-set-followup]');if(follow){setAppointmentFollowUp(follow.dataset.setFollowup,follow.dataset.sourceDate);return;}
  const marked=e.target.closest('[data-mark-followedup]');if(marked){markAppointmentFollowedUp(marked.dataset.markFollowedup,marked.dataset.sourceDate);return;}
  const outcome=e.target.closest('[data-update-outcome]');if(outcome){updateAppointmentOutcome(outcome.dataset.updateOutcome,outcome.dataset.sourceDate);return;}
  const b=e.target.closest('[data-delete-appointment]');if(b&&confirm('Delete this appointment?\n\nThis will permanently remove the appointment and any associated follow-up.'))deleteAppointment(b.dataset.deleteAppointment,b.dataset.sourceDate||appointmentDate)
};

$('#saveSettings').onclick=async()=>{const selectedWorkDays=normaliseWorkDays($$('[name=workDay]:checked').map(el=>Number(el.value)));if(!selectedWorkDays.length)return toast('Choose at least one tracking day');agentName=$('#agentName').value.trim()||displayAgentName();targets={calls:+$('#callsTarget').value||50,connects:+$('#connectsTarget').value||25,data:+$('#dataTarget').value||10,weeklyKnock:+$('#weeklyKnockTarget').value||240};workDays=selectedWorkDays;calendarPreference=$('[name=calendarPreference]:checked')?.value==='apple'?'apple':'outlook';saveLocal();await saveTargets();renderAll();toast('Settings saved')};
$('#signOut').onclick=async()=>{clearActiveSession();if(auth?.currentUser)await firebaseSignOut(auth);location.reload()};
$('#exportData').onclick=()=>{const blob=new Blob([JSON.stringify({targets,workDays,days},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`daily-accountability-${todayKey()}.json`;a.click();URL.revokeObjectURL(a.href)};
$('#importData').onchange=async e=>{try{const raw=JSON.parse(await e.target.files[0].text());targets={...DEFAULTS,...raw.targets};if(Array.isArray(raw.workDays)&&raw.workDays.length)workDays=normaliseWorkDays(raw.workDays);days={...days,...raw.days};saveLocal();if(cloud){await saveTargets();for(const k of Object.keys(raw.days||{}))await saveDay(k,{quiet:true})}renderAll();toast('Backup imported')}catch{toast('Backup could not be read')}};
$('#openCalendarFromInsights')&&($('#openCalendarFromInsights').onclick=openCalendar);$('#closeCalendar').onclick=()=>$('#calendarModal').classList.remove('open');$('#calendarPrev').onclick=()=>{year--;renderCalendar();renderInsights()};$('#calendarNext').onclick=()=>{year++;renderCalendar();renderInsights()};$('#prevYear')&&($('#prevYear').onclick=()=>{year--;renderCalendar();renderInsights()});$('#nextYear')&&($('#nextYear').onclick=()=>{year++;renderCalendar();renderInsights()});
$('#calendarGrid').onclick=e=>{const b=e.target.closest('[data-date]');if(!b)return;selectedDate=b.dataset.date;appointmentDate=selectedDate;$('#appointmentDatePicker').value=appointmentDate;$('#calendarModal').classList.remove('open');switchView('todayView');renderAll();ensureTick()};
$('#yearHeatmap')&&($('#yearHeatmap').onclick=e=>{const b=e.target.closest('[data-date]');if(!b)return;selectedDate=b.dataset.date;appointmentDate=selectedDate;$('#appointmentDatePicker').value=appointmentDate;switchView('todayView');renderAll();ensureTick()});
$('#prevMonth')&&($('#prevMonth').onclick=()=>{monthCursor.setMonth(monthCursor.getMonth()-1);renderMonth()});$('#nextMonth')&&($('#nextMonth').onclick=()=>{monthCursor.setMonth(monthCursor.getMonth()+1);renderMonth()});
function closeSyncPopover(){const p=$('#syncPopover'),b=$('#syncBadge');p?.classList.add('hidden');b?.setAttribute('aria-expanded','false');document.body.classList.remove('sync-popover-open')}
$('#syncBadge').onclick=e=>{e.stopPropagation();const p=$('#syncPopover'),opening=p.classList.contains('hidden');if(p&&p.parentElement!==document.body)document.body.append(p);p.classList.toggle('hidden',!opening);$('#syncBadge').setAttribute('aria-expanded',String(opening));document.body.classList.toggle('sync-popover-open',opening)};
$('#syncPopover').onclick=e=>e.stopPropagation();
document.addEventListener('click',closeSyncPopover);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSyncPopover()});
window.addEventListener('online',()=>{if(cloud){setSync('','Connecting');scheduleLeaderboardPublish();for(const [k,day] of Object.entries(days))if(day?.clientUpdatedAt)saveDay(k,{quiet:true}).catch(()=>{})}});window.addEventListener('offline',()=>setSync('offline','Offline'));
window.addEventListener('error',event=>console.error('Unhandled app error',event.error||event.message));
window.addEventListener('unhandledrejection',event=>console.error('Unhandled promise rejection',event.reason));
if('serviceWorker'in navigator)window.addEventListener('load',async()=>{const reg=await navigator.serviceWorker.register('./service-worker.js');reg.update()});
setInterval(()=>{finaliseExpiredTimers().then(()=>{if(selectedDate<todayKey())renderAll()});updateAppViewport();if(cloud)scheduleLeaderboardPublish()},30000);
init();
