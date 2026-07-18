import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, setDoc, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const DEFAULT_WORK_DAYS=[1,2,4,5];
let workDays=[...DEFAULT_WORK_DAYS];
const CALL_PLAN=[[9,'Active Buyer Calls','Hot buyers, offers, contracts and second inspections'],[10,'Past OFI Calls','Recent attendees, missed callbacks and buyer feedback'],[11,'Pipeline Calls','Current sellers, warm leads and next-step conversations'],[12,'Past Appraisals','Owners with a likely 3–12 month move'],[13,'Database Reconnects','Long-term owners and dormant contacts'],[14,'Just Listed & Coming Soon','Buyers, neighbours and local owner awareness'],[15,'Just Sold Calls','Result calls and nearby owner follow-up'],[16,'Priority Follow-Up','Offers, appointments and tomorrow’s pipeline']];
const DEFAULTS={calls:50,connects:25,data:10,weeklyKnock:240};
let targets={...DEFAULTS}, days={}, selectedDate=dateKey(new Date()), appointmentDate=selectedDate, agentName='', leaderboardEntries=[], leaderboardWeekOffset=0;
let year=new Date().getFullYear(), monthCursor=new Date(), uid='local', currentUser=null, cloud=false, db=null, auth=null;
let unsubDays=null, unsubProfile=null, unsubLeaderboard=null, timerTick=null, syncTimer=null, leaderboardPublishTimer=null;

function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseKey(k){const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)}
function todayKey(){return dateKey(new Date())}
function mondayOf(d){const x=new Date(d),n=x.getDay();x.setDate(x.getDate()-(n===0?6:n-1));x.setHours(0,0,0,0);return x}
function weekKeys(d=parseKey(selectedDate)){const m=mondayOf(d);return workDays.map(n=>{const x=new Date(m);x.setDate(m.getDate()+n-1);return dateKey(x)})}
function isWorkDayKey(k){return workDays.includes(parseKey(k).getDay())}
function workDayName(n){return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][n]}
function normaliseWorkDays(values){const order=[1,2,3,4,5,6,0],set=new Set((values||[]).map(Number).filter(n=>n>=0&&n<=6));return order.filter(n=>set.has(n))}
function blankDay(){return{calls:0,connects:0,data:0,knockSeconds:0,timerStartedAt:null,appointments:[],events:[],review:{},clientUpdatedAt:0}}
function dayData(k){return {...blankDay(),...(days[k]||{}),appointments:[...(days[k]?.appointments||[])],events:[...(days[k]?.events||[])]}}
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
function resetState(){days={};targets={...DEFAULTS};workDays=[...DEFAULT_WORK_DAYS];agentName='';leaderboardEntries=[];selectedDate=todayKey();appointmentDate=selectedDate}
function loadLocal(userId=uid){resetState();const prefix=storagePrefix(userId);try{days=JSON.parse(localStorage.getItem(prefix+'days')||'{}');targets={...DEFAULTS,...JSON.parse(localStorage.getItem(prefix+'targets')||'{}')};agentName=localStorage.getItem(prefix+'agent-name')||'';const savedWorkDays=JSON.parse(localStorage.getItem(prefix+'work-days')||'null');if(Array.isArray(savedWorkDays)&&savedWorkDays.length)workDays=normaliseWorkDays(savedWorkDays)}catch{resetState()}}
function saveLocal(){const prefix=storagePrefix(uid);localStorage.setItem(prefix+'days',JSON.stringify(days));localStorage.setItem(prefix+'targets',JSON.stringify(targets));localStorage.setItem(prefix+'agent-name',agentName);localStorage.setItem(prefix+'work-days',JSON.stringify(workDays))}
function clearActiveSession(){unsubDays?.();unsubProfile?.();unsubLeaderboard?.();unsubDays=unsubProfile=unsubLeaderboard=null;clearInterval(timerTick);clearTimeout(syncTimer);clearTimeout(leaderboardPublishTimer);currentUser=null;uid='local';cloud=false;resetState()}
function displayAgentName(){return (agentName||currentUser?.displayName||currentUser?.email?.split('@')[0]||'Agent').trim()}
function leaderboardPayload(){
  const k=todayKey(),d=dayData(k),knockMinutes=Math.floor(liveKnockSeconds(d)/60),knockTarget=rollingKnockTarget(k);
  return{uid,name:displayAgentName(),email:currentUser?.email||'',date:k,activeToday:isWorkDayKey(k),workDays:[...workDays],calls:d.calls,connects:d.connects,data:d.data,knockMinutes,score:completion(k),targets:{calls:targets.calls,connects:targets.connects,data:targets.data,knock:knockTarget},dailyHistory:recentDailyHistory(),weekHistory:recentWeekHistory(),clientUpdatedAt:Date.now(),updatedAt:serverTimestamp()}
}
function scheduleLeaderboardPublish(){if(!cloud||!db||!uid)return;clearTimeout(leaderboardPublishTimer);leaderboardPublishTimer=setTimeout(publishLeaderboard,180)}
async function publishLeaderboard(){if(!cloud||!db||!uid)return;try{await setDoc(doc(db,'leaderboard',uid),leaderboardPayload(),{merge:true});if($('#leaderboardStatus'))$('#leaderboardStatus').textContent='LIVE'}catch(err){console.error('Leaderboard publish failed',err);setSync('error','Sync error');if($('#leaderboardStatus'))$('#leaderboardStatus').textContent='SYNC ERROR'}}
async function saveDay(k,{quiet=false}={}){const clean={...dayData(k),clientUpdatedAt:Date.now()};days[k]=clean;saveLocal();renderAll();if(!cloud)return;setSync('','Saving');try{await setDoc(doc(db,'users',uid,'days',k),{...clean,updatedAt:serverTimestamp()},{merge:true});if(k===todayKey())scheduleLeaderboardPublish();setSync('live','Live')}catch(err){console.error(err);setSync('error','Sync error');if(!quiet)toast('Saved on this device. Cloud sync failed.')}}
async function saveTargets(){saveLocal();if(!cloud)return;setSync('','Saving');try{await setDoc(doc(db,'users',uid),{targets,workDays:[...workDays],name:displayAgentName(),email:currentUser?.email||'',updatedAt:serverTimestamp()},{merge:true});scheduleLeaderboardPublish();setSync('live','Live')}catch(err){console.error(err);setSync('error','Sync error');toast('Targets saved locally. Cloud sync failed.')}}
function addEvent(d,type,label,delta=0){d.events.push({id:uuid(),type,label,delta,at:Date.now()});d.events=d.events.slice(-500)}

function recentDailyHistory(count=21){
  const history={},d=new Date();
  for(let i=0;i<60&&Object.keys(history).length<count;i++){
    const k=dateKey(d);
    if(workDays.includes(d.getDay()))history[k]=completion(k);
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
  $('#viewTitle').textContent=isToday?welcomeMessage():label;
  $('#dateLabel').textContent=fmtDate(selectedDate);
  $('#dateLabel').classList.remove('hidden');
  dateLine?.classList.remove('today-sync-only');
  if(isToday&&todaySlot){
    if(syncBadge&&syncBadge.parentElement!==todaySlot)todaySlot.append(syncBadge);
  }else if(dateLine){
    if(syncBadge&&syncBadge.parentElement!==dateLine)dateLine.append(syncBadge);
  }
  if(syncPopover&&syncPopover.parentElement!==document.body)document.body.append(syncPopover);
  const showDateNav=id==='todayView'||id==='appointmentsView';
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
  if($('#todayAtGlance')){
    const guidance=todayGuidance().replace(/^Focus Now:\s*/i,'');
    $('#todayAtGlance').innerHTML=`<span class="focus-primary">Focus Now: ${escapeHtml(guidance)}</span>`;
  }
  if($('#momentumWhisper'))$('#momentumWhisper').textContent=momentumWhisper();
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
function appointmentCreatedDate(a,sourceDate=''){return a.createdDate||a.logDate||sourceDate}
function appointmentTimestamp(a,sourceDate=''){if(Number.isFinite(Number(a.scheduledAt)))return Number(a.scheduledAt);const scheduledDate=appointmentScheduledDate(a,sourceDate);if(scheduledDate&&a.time){const t=new Date(`${scheduledDate}T${a.time}`);if(!Number.isNaN(t.getTime()))return t.getTime()}return Number(a.at)||0}
function appointmentTimeLabel(a,sourceDate=''){const ts=appointmentTimestamp(a,sourceDate);return ts?new Date(ts).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'}):(a.time||'Time not set')}
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
function exportAppointmentToCalendar(a,sourceDate=''){
  const file=appointmentCalendarFile(a,sourceDate);
  if(!file)return toast('Appointment date or time is missing');
  const blob=new Blob([file.content],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=file.filename;link.rel='noopener';document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  markAppointmentAddedToCalendar(a,sourceDate);toast('Calendar event ready to add');
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
function renderAppointments(){
  const picker=$('#appointmentDatePicker');
  const locked=isPastDate(appointmentDate);
  $('#appointmentForm').classList.toggle('date-locked',locked);
  $$('#appointmentForm input, #appointmentForm button').forEach(el=>el.disabled=locked);
  $('#appointmentLock').classList.toggle('hidden',!locked);
  $('#appointmentDateLabel').textContent=fmtDate(appointmentDate);
  if(picker&&!picker.value)picker.value=appointmentDate;
  const list=appointmentEntriesForDate(appointmentDate);
  $('#appointmentsList').innerHTML=list.length?list.map(({appointment:a,sourceDate,isReminder})=>{
    const contact=escapeHtml(a.contactName||a.name||'Contact not recorded');
    const rawPhone=String(a.contactNumber||a.phone||'').trim();
    const phone=escapeHtml(rawPhone);
    const dial=rawPhone.replace(/[^+\d]/g,'');
    const address=escapeHtml(a.address||'Address not recorded');
    const type=escapeHtml(appointmentType(a));
    const time=escapeHtml(appointmentTimeLabel(a,sourceDate));
    const scheduledDate=appointmentScheduledDate(a,sourceDate);
    const createdDate=appointmentCreatedDate(a,sourceDate);
    const canDelete=canEditDate(sourceDate);
    if(isReminder){
      return `<article class="appointment-card appointment-card-premium appointment-reminder">
        <div class="appointment-card-copy">
          <div class="appointment-card-top"><span class="appointment-reminder-badge">BOOKED APPOINTMENT · ${type}</span></div>
          <strong>${contact}</strong>
          <small>${address}${phone?` · ${phone}`:''}</small>
          <small class="appointment-booked-on">Booked on ${escapeHtml(shortAppointmentDate(createdDate))}</small>
          <div class="appointment-reminder-footer">
            <small class="appointment-booked-for">Booked for ${escapeHtml(shortAppointmentDate(scheduledDate))} at ${time}</small>
            <small class="appointment-confirm-note">Call 2 hours prior to confirm</small>
          </div>
        </div>
        <div class="appointment-card-actions">
          ${appointmentCalendarButton(a,sourceDate)}
          ${dial?`<a class="appointment-call" href="tel:${dial}" aria-label="Call ${contact}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3.5 4.8 5.9c-.7.7-.8 1.8-.3 2.7 2.5 4.7 6.3 8.5 11 11 .9.5 2 .4 2.7-.3l2.3-2.3-4.1-3-2.1 2.1c-2.6-1.4-4.7-3.5-6.1-6.1l2.1-2.1-3.1-4.4Z"/></svg></a>`:''}
          <button class="appointment-delete" data-delete-appointment="${a.id}" data-source-date="${sourceDate}" aria-label="Delete appointment" ${canDelete?'':'disabled'}>×</button>
        </div>
      </article>`;
    }
    const futureBooking=scheduledDate&&scheduledDate!==sourceDate;
    const bookedTodayForToday=createdDate===todayKey()&&scheduledDate===todayKey();
    return `<article class="appointment-card appointment-card-premium">
      <div class="appointment-card-copy">
        <div class="appointment-card-top"><span class="appointment-type-badge">${type}</span></div>
        <strong>${address}</strong>
        <small>${contact}${phone?` · ${phone}`:''}</small>
        ${bookedTodayForToday?`<small class="appointment-booked-for">Booked Today at ${time}</small>`:(futureBooking?`<small class="appointment-booked-for">Booked for ${escapeHtml(shortAppointmentDate(scheduledDate))} at ${time}</small>`:'')}
      </div>
      <div class="appointment-card-actions">
        ${appointmentCalendarButton(a,sourceDate)}
        ${dial?`<a class="appointment-call" href="tel:${dial}" aria-label="Call ${contact}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3.5 4.8 5.9c-.7.7-.8 1.8-.3 2.7 2.5 4.7 6.3 8.5 11 11 .9.5 2 .4 2.7-.3l2.3-2.3-4.1-3-2.1 2.1c-2.6-1.4-4.7-3.5-6.1-6.1l2.1-2.1-3.1-4.4Z"/></svg></a>`:''}
        <button class="appointment-delete" data-delete-appointment="${a.id}" data-source-date="${sourceDate}" aria-label="Delete appointment" ${canDelete?'':'disabled'}>×</button>
      </div>
    </article>`
  }).join(''):`<div class="empty">No appointments logged or scheduled for this date.</div>`
}

async function addAppointment({contactName,contactNumber,address,date,time,type}){
  const createdDate=todayKey();
  if(!canEditDate(createdDate))return lockedToast();
  const scheduledAt=new Date(`${date}T${time}`).getTime();
  const d=dayData(createdDate);
  const appointment={id:uuid(),contactName,contactNumber,address,date,time,type,types:[type],createdDate,logDate:createdDate,scheduledDate:date,scheduledAt,at:Date.now()};
  d.appointments.push(appointment);
  addEvent(d,'appointment',`${type} · ${contactName} · ${address} · booked for ${date} ${time}`);
  days[createdDate]=d;
  await saveDay(createdDate);
  renderAppointments();
  toast(date===createdDate?'Appointment logged':'Appointment logged and reminder created');
  return appointment;
}
async function deleteAppointment(id,sourceDate=appointmentDate){if(!canEditDate(sourceDate))return lockedToast();const d=dayData(sourceDate);d.appointments=d.appointments.filter(a=>a.id!==id);days[sourceDate]=d;await saveDay(sourceDate);renderAppointments()}


function sortedTodayLeaderboard(){
  return leaderboardEntries.filter(x=>x.date===todayKey()&&x.activeToday!==false).sort((a,b)=>(b.score||0)-(a.score||0)||(b.calls||0)-(a.calls||0)||(b.connects||0)-(a.connects||0)||(b.data||0)-(a.data||0));
}
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
function selectedLeaderboardWeekDate(){return weekDateFromOffset(leaderboardWeekOffset)}
function selectedLeaderboardWeekKey(){return weekKeyFromDate(selectedLeaderboardWeekDate())}
function formatWeekRange(base){const start=mondayOf(base),end=new Date(start);end.setDate(start.getDate()+6);return `${start.toLocaleDateString('en-AU',{day:'numeric',month:'short'})}–${end.toLocaleDateString('en-AU',{day:'numeric',month:'short'})}`}
function weeklyLeaderboardRows(){
  const wk=selectedLeaderboardWeekKey();
  return leaderboardEntries.map(entry=>{const w=entry.weekHistory?.[wk];return w?{uid:entry.uid,name:entry.name,email:entry.email,...w}:null}).filter(Boolean).sort((a,b)=>(b.score||0)-(a.score||0)||(b.calls||0)-(a.calls||0)||(b.connects||0)-(a.connects||0)||(b.data||0)-(a.data||0));
}
function metricLabel(key){return({calls:'Calls',connects:'Connects',data:'Data',knocking:'Knocking'})[key]||'Calls'}
function renderWeeklyLeaderboard(){
  const rows=weeklyLeaderboardRows(),base=selectedLeaderboardWeekDate();
  $('#weeklyLeaderboardDate').textContent=`Week ${formatWeekRange(base)}`;
  $('#weeklyLeaderboardList').innerHTML=rows.length?rows.map((r,i)=>{const t=r.targets||{};return `<article class="leaderboard-row ${r.uid===uid?'me':''}"><b class="rank">${i+1}</b><div class="agent"><strong>${escapeHtml(r.name||r.email?.split('@')[0]||'Agent')}</strong>${r.uid===uid?'<small>You</small>':''}</div><span>${r.calls||0}<small>/${t.calls||0}</small></span><span>${r.connects||0}<small>/${t.connects||0}</small></span><span>${r.data||0}<small>/${t.data||0}</small></span><span>${r.knockMinutes||0}<small>m</small></span><em>${r.score||0}%</em></article>`}).join(''):`<div class="empty">No team data is available for this week yet.</div>`;
  $('#improvementList').innerHTML=rows.length?rows.map(r=>{const metric=metricLabel(r.weakestMetric),value=r.weakestPct||0,gap=Math.max(0,100-value);return `<article class="improvement-row ${r.uid===uid?'me':''}"><div><strong>${escapeHtml(r.name||r.email?.split('@')[0]||'Agent')}</strong><small>${metric} is the lowest-performing metric</small></div><span>${value}%</span><em>${gap?`${gap}% gap`:'On target'}</em></article>`}).join(''):`<div class="empty">Improvement areas will appear once weekly activity is logged.</div>`;
  $('#weekNext').disabled=leaderboardWeekOffset>=0;
}
function leaderboardMomentum(entry){
  const prevKey=previousScheduledKey(todayKey(),entry.workDays||workDays);
  if(!prevKey)return{diff:0,label:'—',className:'flat'};
  const prev=Number(entry.dailyHistory?.[prevKey]);
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
  const date=todayKey();
  $('#leaderboardDate').textContent=fmtDate(date);
  const rows=sortedTodayLeaderboard();
  $('#leaderboardStatus').textContent=cloud?'LIVE':'DEVICE ONLY';
  const meIndex=rows.findIndex(r=>r.uid===uid);
  const me=meIndex>=0?rows[meIndex]:null;
  const myScore=me?.score??completion(date);
  const leaderScore=rows[0]?.score||0;
  const gap=rows.length?Math.max(0,leaderScore-myScore):0;
  if($('#leaderboardRing'))$('#leaderboardRing').style.setProperty('--score',Math.max(0,Math.min(100,myScore)));
  if($('#leaderboardHeroScore'))$('#leaderboardHeroScore').textContent=`${myScore}%`;
  if($('#leaderboardHeroRank'))$('#leaderboardHeroRank').textContent=meIndex>=0?`#${meIndex+1}`:'—';
  if($('#leaderboardHeroMessage'))$('#leaderboardHeroMessage').textContent=meIndex===0?'You are leading today':meIndex>0?`${gap}% to the lead`:'Waiting for your first update';
  if($('#leaderboardAgentCount'))$('#leaderboardAgentCount').textContent=rows.length;
  if($('#leaderboardTopScore'))$('#leaderboardTopScore').textContent=`${leaderScore}%`;
  if($('#leaderboardGap'))$('#leaderboardGap').textContent=rows.length?(gap?`${gap}%`:'Leading'):'—';
  $('#leaderboardList').innerHTML=rows.length?rows.map((r,i)=>{
    const t=r.targets||{};
    const momentum=leaderboardMomentum(r);
    const score=Math.max(0,Math.min(100,r.score||0));
    return `<article class="leaderboard-row leaderboard-row-dashboard ${r.uid===uid?'me':''}">
      <b class="rank">${i+1}</b>
      <div class="agent"><strong>${escapeHtml(r.name||r.email?.split('@')[0]||'Agent')}</strong>${r.uid===uid?'<small>You</small>':''}<i class="leaderboard-mini-progress"><span style="width:${score}%"></span></i></div>
      <span>${r.calls||0}<small>/${t.calls||50}</small></span><span>${r.connects||0}<small>/${t.connects||25}</small></span><span>${r.data||0}<small>/${t.data||10}</small></span><span>${r.knockMinutes||0}<small>m</small></span><em>${r.score||0}%<small class="momentum ${momentum.className}">${momentum.label}</small></em>
    </article>`
  }).join(''):`<div class="empty">No agents have logged activity today.</div>`;
  renderLeaderboardPosition();
  renderWeeklyLeaderboard();
}

function switchInsightsPage(id){$$('.insights-switch button').forEach(b=>b.classList.toggle('active',b.dataset.insightsPage===id));$$('.insights-page').forEach(p=>p.classList.toggle('active',p.id===id));if(id==='leaderboardInsights')renderLeaderboard()}
function renderInsights(){const w=weekSummary(),m=mondayOf(parseKey(selectedDate));$('#insightWeekScore').textContent=`${w.score}%`;$('#insightWeekLabel').textContent=`Week of ${m.toLocaleDateString('en-AU',{day:'numeric',month:'short'})}`;$('#insightCalls').textContent=w.calls;$('#insightCallsAvg').textContent=`${Math.round(w.calls/Math.max(1,w.count))}/day`;$('#insightConnects').textContent=w.connects;$('#insightConnectRate').textContent=`${w.calls?Math.round(w.connects/w.calls*100):0}% connect rate`;$('#insightData').textContent=w.data;$('#insightDataAvg').textContent=`${Math.round(w.data/Math.max(1,w.count))}/day`;$('#insightKnock').textContent=`${Math.floor(w.knock/60)} min`;$('#knockBar').style.width=`${pct(w.knock/60,targets.weeklyKnock)}%`;renderPersonalBests();renderMondayReview();renderMonth();$('#yearLabel').textContent=year;renderYearOverview();renderLeaderboard()}
function renderYearOverview(){const labels=['M','T','W','T','F','S','S'];const months=[];for(let m=0;m<12;m++){const first=new Date(year,m,1),pad=(first.getDay()+6)%7;let cells=`<div class="mini-weekdays">${labels.map(x=>`<b>${x}</b>`).join('')}</div><div class="mini-days">${'<i></i>'.repeat(pad)}`;for(let d=1;d<=new Date(year,m+1,0).getDate();d++){const dt=new Date(year,m,d),k=dateKey(dt),p=completion(k),off=!workDays.includes(dt.getDay());cells+=`<button class="mini-day ${levelClass(p)} ${off?'off':''} ${k===todayKey()?'today':''} ${k===selectedDate?'selected':''}" data-date="${k}" aria-label="${fmtDate(k)}, ${p}% complete">${d}</button>`}cells+='</div>';months.push(`<section class="mini-month"><h3>${new Date(year,m,1).toLocaleDateString('en-AU',{month:'short'})}</h3>${cells}</section>`)}$('#yearHeatmap').innerHTML=months.join('')}
function levelClass(p){return p>=100?'l4':p>=67?'l3':p>=34?'l2':p>0?'l1':''}
function renderMonth(){const y=monthCursor.getFullYear(),m=monthCursor.getMonth();$('#monthLabel').textContent=monthCursor.toLocaleDateString('en-AU',{month:'long',year:'numeric'});const vals=[];for(let d=1;d<=new Date(y,m+1,0).getDate();d++){const dt=new Date(y,m,d);if(workDays.includes(dt.getDay()))vals.push(completion(dateKey(dt)))}const groups=[];for(let i=0;i<vals.length;i+=4){const g=vals.slice(i,i+4);groups.push(Math.round(g.reduce((a,b)=>a+b,0)/Math.max(1,g.length)))}$('#monthBars').innerHTML=groups.map((p,i)=>`<div title="${p}%"><i style="height:${Math.max(3,p)}%"></i><small>W${i+1}</small></div>`).join('')}
function renderCalendar(){const labels=['M','T','W','T','F','S','S'];$('#calendarYear').textContent=year;const months=[];for(let m=0;m<12;m++){const first=new Date(year,m,1),pad=(first.getDay()+6)%7;let cells=`<div class="weekday-row">${labels.map(x=>`<b>${x}</b>`).join('')}</div><div class="days">${'<i></i>'.repeat(pad)}`;for(let d=1;d<=new Date(year,m+1,0).getDate();d++){const dt=new Date(year,m,d),k=dateKey(dt),p=completion(k),off=!workDays.includes(dt.getDay());cells+=`<button class="day-cell ${levelClass(p)} ${off?'off':''} ${k===todayKey()?'today':''} ${k===selectedDate?'selected':''}" data-date="${k}" title="${fmtDate(k)} · ${p}%">${d}</button>`}cells+='</div>';months.push(`<section class="month"><h3>${new Date(year,m,1).toLocaleDateString('en-AU',{month:'long'})}</h3>${cells}</section>`)}$('#calendarGrid').innerHTML=months.join('')}
function renderSettings(){const name=displayAgentName();$('#agentName').value=name;$('#callsTarget').value=targets.calls;$('#connectsTarget').value=targets.connects;$('#dataTarget').value=targets.data;$('#weeklyKnockTarget').value=targets.weeklyKnock;$$('[name=workDay]').forEach(el=>el.checked=workDays.includes(Number(el.value)));$('#accountEmail').textContent=currentUser?.email||'Device-only mode';$('#modeNote').textContent=cloud?'Live sync is active. Use the same login on every device.':'Data is stored only on this device.';const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'A';if($('#profileAvatar'))$('#profileAvatar').textContent=initials;if($('#profileSyncState'))$('#profileSyncState').textContent=cloud?'Live sync active':'Device-only profile';if($('#profileTodayScore'))$('#profileTodayScore').textContent=`${completion(todayKey())}%`;if($('#profileWeekScore'))$('#profileWeekScore').textContent=`${weekSummary().score}%`;if($('#profileWorkDays'))$('#profileWorkDays').textContent=workDays.length}
function renderAll(){renderToday();renderAppointments();renderInsights();renderSettings()}

async function startCloud(user){unsubDays?.();unsubProfile?.();unsubLeaderboard?.();currentUser=user;uid=user.uid;cloud=true;loadLocal(uid);await finaliseExpiredTimers();setSync('','Connecting');clearTimeout(syncTimer);syncTimer=setTimeout(()=>{if($('#syncBadge').dataset.label==='Connecting')setSync(navigator.onLine?'':'offline',navigator.onLine?'Connected':'Offline')},3500);unsubDays=onSnapshot(collection(db,'users',uid,'days'),{includeMetadataChanges:true},snap=>{snap.docChanges().forEach(ch=>{if(ch.type==='removed')delete days[ch.doc.id];else{const incoming=ch.doc.data();days[ch.doc.id]={...blankDay(),...incoming,appointments:incoming.appointments||[],events:incoming.events||[]}}});saveLocal();renderAll();ensureTick();clearTimeout(syncTimer);setSync(snap.metadata.fromCache&&!navigator.onLine?'offline':'live',snap.metadata.hasPendingWrites?'Saving':'Live')},err=>{console.error(err);setSync('error','Sync error');toast('Firestore access failed. Check rules and login.');showAuthMessage(err.message)});unsubProfile=onSnapshot(doc(db,'users',uid),snap=>{if(snap.exists()){const profile=snap.data();if(profile.targets)targets={...DEFAULTS,...profile.targets};if(Array.isArray(profile.workDays)&&profile.workDays.length)workDays=normaliseWorkDays(profile.workDays);if(profile.name)agentName=profile.name;saveLocal();renderAll();scheduleLeaderboardPublish()}},err=>console.error(err));unsubLeaderboard=onSnapshot(collection(db,'leaderboard'),{includeMetadataChanges:true},snap=>{leaderboardEntries=snap.docs.map(d=>({uid:d.id,...d.data()}));renderLeaderboard()},err=>{console.error('Leaderboard read failed',err);$('#leaderboardStatus').textContent='SYNC ERROR'});setSync(navigator.onLine?'live':'offline',navigator.onLine?'Live':'Offline');showApp();scheduleLeaderboardPublish()}
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
function switchView(id){$$('.tabbar button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));updateTopbar(id);if(id==='appointmentsView')renderAppointments();if(id==='insightsView')renderInsights()}

function shiftHeaderDate(delta){
  const id=activeViewId();
  if(id==='appointmentsView'){
    const d=parseKey(appointmentDate);d.setDate(d.getDate()+delta);appointmentDate=dateKey(d);
    $('#appointmentDatePicker').value=appointmentDate;renderAppointments();updateTopbar(id);return;
  }
  if(id==='todayView'){
    const d=parseKey(selectedDate);d.setDate(d.getDate()+delta);selectedDate=dateKey(d);appointmentDate=selectedDate;
    $('#appointmentDatePicker').value=appointmentDate;renderAll();ensureTick();
  }
}

function openCalendar(){$('#calendarModal').classList.add('open');renderCalendar()}

$('#authForm').addEventListener('submit',async e=>{e.preventDefault();showAuthMessage('');try{await signInWithEmailAndPassword(auth,$('#email').value,$('#password').value)}catch(err){showAuthMessage(err.message)}});
$('#createAccount').onclick=async()=>{try{await createUserWithEmailAndPassword(auth,$('#email').value,$('#password').value)}catch(err){showAuthMessage(err.message)}};
$('#localMode').onclick=()=>{clearActiveSession();uid='local';loadLocal('local');setSync('offline','This device');showApp()};
$$('[data-action]').forEach(b=>b.onclick=()=>changeMetric(b.dataset.metric,b.dataset.action==='plus'?1:-1));
$('#timerButton').onclick=toggleTimer;$('#resetKnock').onclick=resetKnock;$('#previousDay').onclick=()=>shiftHeaderDate(-1);$('#nextDay').onclick=()=>shiftHeaderDate(1);$('#settingsShortcut').onclick=()=>switchView('settingsView');$('#homeShortcut').onclick=()=>switchView('todayView');$('#backToday').onclick=()=>{selectedDate=todayKey();appointmentDate=selectedDate;$('#appointmentDatePicker').value=appointmentDate;renderAll();ensureTick()};
$('.tabbar').onclick=e=>{const b=e.target.closest('button[data-view]');if(b)switchView(b.dataset.view)};
$('.insights-switch').onclick=e=>{const b=e.target.closest('button[data-insights-page]');if(b)switchInsightsPage(b.dataset.insightsPage)};
$('#weekPrev').onclick=()=>{leaderboardWeekOffset--;renderWeeklyLeaderboard()};
$('#weekNext').onclick=()=>{if(leaderboardWeekOffset<0)leaderboardWeekOffset++;renderWeeklyLeaderboard()};
$('#weekLast').onclick=()=>{leaderboardWeekOffset=-1;renderWeeklyLeaderboard()};
$('#appointmentDatePicker').onchange=()=>{};
$('#appointmentForm').onsubmit=async e=>{e.preventDefault();const viewedDate=appointmentDate;const contactName=$('#appointmentContactName').value.trim(),contactNumber=$('#appointmentContactNumber').value.trim(),address=$('#appointmentAddress').value.trim(),date=$('#appointmentDatePicker').value,time=$('#appointmentTime').value,type=$('.appointment-types input:checked')?.value||'',error=$('#appointmentFormError');const missing=[];if(!contactName)missing.push('contact name');if(!contactNumber)missing.push('contact number');if(!address)missing.push('property address');if(!date)missing.push('booking date');if(!time)missing.push('booking time');if(!type)missing.push('appointment type');if(missing.length){error.textContent=`Add ${missing.join(', ')}`;error.classList.remove('hidden');return}error.textContent='';error.classList.add('hidden');const appointment=await addAppointment({contactName,contactNumber,address,date,time,type});if(appointment&&confirm('Add this appointment to your calendar?'))exportAppointmentToCalendar(appointment,appointment.createdDate);e.target.reset();appointmentDate=viewedDate;$('#appointmentDatePicker').value=viewedDate;renderAppointments();updateTopbar('appointmentsView')};
$('#appointmentsList').onclick=e=>{
  const calendarButton=e.target.closest('[data-calendar-appointment]');
  if(calendarButton){
    const sourceDate=calendarButton.dataset.sourceDate||appointmentDate;
    const entry=appointmentEntriesForDate(appointmentDate).find(({appointment:a,sourceDate:s})=>calendarExportId(a,s)===calendarButton.dataset.calendarAppointment&&s===sourceDate);
    if(!entry)return toast('Appointment could not be found');
    if(appointmentAddedToCalendar(entry.appointment,entry.sourceDate))return toast('Already added to calendar');
    exportAppointmentToCalendar(entry.appointment,entry.sourceDate);return;
  }
  const b=e.target.closest('[data-delete-appointment]');if(b&&confirm('Delete this appointment?'))deleteAppointment(b.dataset.deleteAppointment,b.dataset.sourceDate||appointmentDate)
};
$('#saveSettings').onclick=async()=>{const selectedWorkDays=normaliseWorkDays($$('[name=workDay]:checked').map(el=>Number(el.value)));if(!selectedWorkDays.length)return toast('Choose at least one tracking day');agentName=$('#agentName').value.trim()||displayAgentName();targets={calls:+$('#callsTarget').value||50,connects:+$('#connectsTarget').value||25,data:+$('#dataTarget').value||10,weeklyKnock:+$('#weeklyKnockTarget').value||240};workDays=selectedWorkDays;saveLocal();await saveTargets();renderAll();toast('Settings saved')};
$('#signOut').onclick=async()=>{clearActiveSession();if(auth?.currentUser)await firebaseSignOut(auth);location.reload()};
$('#exportData').onclick=()=>{const blob=new Blob([JSON.stringify({targets,workDays,days},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`daily-accountability-${todayKey()}.json`;a.click();URL.revokeObjectURL(a.href)};
$('#importData').onchange=async e=>{try{const raw=JSON.parse(await e.target.files[0].text());targets={...DEFAULTS,...raw.targets};if(Array.isArray(raw.workDays)&&raw.workDays.length)workDays=normaliseWorkDays(raw.workDays);days={...days,...raw.days};saveLocal();if(cloud){await saveTargets();for(const k of Object.keys(raw.days||{}))await saveDay(k,{quiet:true})}renderAll();toast('Backup imported')}catch{toast('Backup could not be read')}};
$('#openCalendarFromInsights').onclick=openCalendar;$('#closeCalendar').onclick=()=>$('#calendarModal').classList.remove('open');$('#calendarPrev').onclick=$('#prevYear').onclick=()=>{year--;renderCalendar();renderInsights()};$('#calendarNext').onclick=$('#nextYear').onclick=()=>{year++;renderCalendar();renderInsights()};
$('#calendarGrid').onclick=e=>{const b=e.target.closest('[data-date]');if(!b)return;selectedDate=b.dataset.date;appointmentDate=selectedDate;$('#appointmentDatePicker').value=appointmentDate;$('#calendarModal').classList.remove('open');switchView('todayView');renderAll();ensureTick()};
$('#yearHeatmap').onclick=e=>{const b=e.target.closest('[data-date]');if(!b)return;selectedDate=b.dataset.date;appointmentDate=selectedDate;$('#appointmentDatePicker').value=appointmentDate;switchView('todayView');renderAll();ensureTick()};
$('#prevMonth').onclick=()=>{monthCursor.setMonth(monthCursor.getMonth()-1);renderMonth()};$('#nextMonth').onclick=()=>{monthCursor.setMonth(monthCursor.getMonth()+1);renderMonth()};
function closeSyncPopover(){const p=$('#syncPopover'),b=$('#syncBadge');p?.classList.add('hidden');b?.setAttribute('aria-expanded','false');document.body.classList.remove('sync-popover-open')}
$('#syncBadge').onclick=e=>{e.stopPropagation();const p=$('#syncPopover'),opening=p.classList.contains('hidden');if(p&&p.parentElement!==document.body)document.body.append(p);p.classList.toggle('hidden',!opening);$('#syncBadge').setAttribute('aria-expanded',String(opening));document.body.classList.toggle('sync-popover-open',opening)};
$('#syncPopover').onclick=e=>e.stopPropagation();
document.addEventListener('click',closeSyncPopover);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSyncPopover()});
window.addEventListener('online',()=>{if(cloud){setSync('live','Live');scheduleLeaderboardPublish()}});window.addEventListener('offline',()=>setSync('offline','Offline'));
if('serviceWorker'in navigator)window.addEventListener('load',async()=>{const reg=await navigator.serviceWorker.register('./service-worker.js');reg.update()});
setInterval(()=>{finaliseExpiredTimers().then(()=>{if(selectedDate<todayKey())renderAll()});updateAppViewport();if(cloud)scheduleLeaderboardPublish()},30000);
init();
