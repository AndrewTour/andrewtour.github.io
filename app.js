import { firebaseConfig } from './firebase-config.js';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const WORK_DAYS=[1,2,4,5];
const CALL_PLAN=[[9,'Active Buyer Calls','Hot buyers, offers, contracts and second inspections'],[10,'Past OFI Calls','Recent attendees, missed callbacks and buyer feedback'],[11,'Pipeline Calls','Current sellers, warm leads and next-step conversations'],[12,'Past Appraisals','Owners with a likely 3–12 month move'],[13,'Database Reconnects','Long-term owners and dormant contacts'],[14,'Just Listed & Coming Soon','Buyers, neighbours and local owner awareness'],[15,'Just Sold Calls','Result calls and nearby owner follow-up'],[16,'Priority Follow-Up','Offers, appointments and tomorrow’s pipeline']];
const DEFAULTS={calls:50,connects:25,data:10,weeklyKnock:240};
let targets={...DEFAULTS}, days={}, selectedDate=dateKey(new Date()), appointmentDate=selectedDate, agentName='', leaderboardEntries=[];
let year=new Date().getFullYear(), monthCursor=new Date(), uid='local', currentUser=null, cloud=false, db=null, auth=null;
let unsubDays=null, unsubProfile=null, unsubLeaderboard=null, timerTick=null, syncTimer=null, leaderboardPublishTimer=null;

function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseKey(k){const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)}
function todayKey(){return dateKey(new Date())}
function mondayOf(d){const x=new Date(d),n=x.getDay();x.setDate(x.getDate()-(n===0?6:n-1));x.setHours(0,0,0,0);return x}
function weekKeys(d=parseKey(selectedDate)){const m=mondayOf(d);return WORK_DAYS.map(n=>{const x=new Date(m);x.setDate(m.getDate()+n-1);return dateKey(x)})}
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
function canEditDate(k){return !isPastDate(k)}
function lockedToast(){haptic(20);toast('This day is complete and locked')}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),1800)}
function setSync(state,label){const b=$('#syncBadge');b.className=`sync-badge ${state}`;b.textContent=label}

function storagePrefix(userId=uid){return `da-v2:${userId||'local'}:`}
function resetState(){days={};targets={...DEFAULTS};agentName='';leaderboardEntries=[];selectedDate=todayKey();appointmentDate=selectedDate}
function loadLocal(userId=uid){resetState();const prefix=storagePrefix(userId);try{days=JSON.parse(localStorage.getItem(prefix+'days')||'{}');targets={...DEFAULTS,...JSON.parse(localStorage.getItem(prefix+'targets')||'{}')};agentName=localStorage.getItem(prefix+'agent-name')||''}catch{resetState()}}
function saveLocal(){const prefix=storagePrefix(uid);localStorage.setItem(prefix+'days',JSON.stringify(days));localStorage.setItem(prefix+'targets',JSON.stringify(targets));localStorage.setItem(prefix+'agent-name',agentName)}
function clearActiveSession(){
  unsubDays?.();unsubProfile?.();unsubLeaderboard?.();
  unsubDays=unsubProfile=unsubLeaderboard=null;
  clearInterval(timerTick);clearTimeout(syncTimer);clearTimeout(leaderboardPublishTimer);
  currentUser=null;uid='local';cloud=false;resetState();
  hideWorkspaceLoader();
}
function showWorkspaceLoader(user){
  const name=(user?.email||'your account').split('@')[0];
  $('#workspaceLoaderTitle').textContent=`Loading ${name}'s workspace…`;
  $('#workspaceLoaderDetail').textContent='Loading private stats, settings and appointments';
  $('#workspaceLoader').classList.remove('hidden');
}
function hideWorkspaceLoader(){ $('#workspaceLoader')?.classList.add('hidden') }
function resetVisibleWorkspace(){
  resetState();
  selectedDate=todayKey();appointmentDate=selectedDate;
  $('#appointmentDatePicker').value=appointmentDate;
  renderAll();
  ensureTick();
}

function displayAgentName(){return (agentName||currentUser?.displayName||currentUser?.email?.split('@')[0]||'Agent').trim()}
function leaderboardPayload(){
  const k=todayKey(),d=dayData(k),knockMinutes=Math.floor(liveKnockSeconds(d)/60),knockTarget=rollingKnockTarget(k);
  return{uid,name:displayAgentName(),email:currentUser?.email||'',date:k,calls:d.calls,connects:d.connects,data:d.data,knockMinutes,score:completion(k),targets:{calls:targets.calls,connects:targets.connects,data:targets.data,knock:knockTarget},clientUpdatedAt:Date.now(),updatedAt:serverTimestamp()}
}
function scheduleLeaderboardPublish(){if(!cloud||!db||!uid)return;clearTimeout(leaderboardPublishTimer);leaderboardPublishTimer=setTimeout(publishLeaderboard,180)}
async function publishLeaderboard(){if(!cloud||!db||!uid)return;try{await setDoc(doc(db,'leaderboard',uid),leaderboardPayload(),{merge:true});if($('#leaderboardStatus'))$('#leaderboardStatus').textContent='LIVE'}catch(err){console.error('Leaderboard publish failed',err);setSync('error','Sync error');if($('#leaderboardStatus'))$('#leaderboardStatus').textContent='SYNC ERROR'}}
async function saveDay(k,{quiet=false}={}){const clean={...dayData(k),clientUpdatedAt:Date.now()};days[k]=clean;saveLocal();renderAll();if(!cloud)return;setSync('','Saving');try{await setDoc(doc(db,'users',uid,'days',k),{...clean,updatedAt:serverTimestamp()},{merge:true});if(k===todayKey())scheduleLeaderboardPublish();setSync('live','Live')}catch(err){console.error(err);setSync('error','Sync error');if(!quiet)toast('Saved on this device. Cloud sync failed.')}}
async function saveTargets(){saveLocal();if(!cloud)return;setSync('','Saving');try{await setDoc(doc(db,'users',uid),{targets,name:displayAgentName(),email:currentUser?.email||'',updatedAt:serverTimestamp()},{merge:true});scheduleLeaderboardPublish();setSync('live','Live')}catch(err){console.error(err);setSync('error','Sync error');toast('Targets saved locally. Cloud sync failed.')}}
function addEvent(d,type,label,delta=0){d.events.push({id:uuid(),type,label,delta,at:Date.now()});d.events=d.events.slice(-500)}

function rollingKnockTarget(k){const date=parseKey(k),m=mondayOf(date);let prior=0,seen=0;for(const n of WORK_DAYS){const x=new Date(m);x.setDate(m.getDate()+n-1);const key=dateKey(x);if(key===k)break;prior+=Math.floor(liveKnockSeconds(dayData(key))/60);seen++}return Math.ceil(Math.max(0,targets.weeklyKnock-prior)/Math.max(1,WORK_DAYS.length-seen))}
function completion(k){const d=dayData(k),kt=rollingKnockTarget(k);return Math.round((pct(d.calls,targets.calls)+pct(d.connects,targets.connects)+pct(d.data,targets.data)+pct(liveKnockSeconds(d)/60,kt))/4)}
function weekSummary(base=parseKey(selectedDate)){const ks=weekKeys(base);let calls=0,connects=0,data=0,knock=0,complete=0,total=0;ks.forEach(k=>{const d=dayData(k);calls+=d.calls;connects+=d.connects;data+=d.data;knock+=liveKnockSeconds(d);const c=completion(k);total+=c;if(c>=100)complete++});return{calls,connects,data,knock,complete,avg:Math.round(total/4),score:Math.round((pct(calls,targets.calls*4)+pct(connects,targets.connects*4)+pct(data,targets.data*4)+pct(knock/60,targets.weeklyKnock))/4)}}
function streak(){let n=0,d=new Date();for(let i=0;i<730;i++){if(WORK_DAYS.includes(d.getDay())){const k=dateKey(d);if(k===todayKey()&&completion(k)<100){d.setDate(d.getDate()-1);continue}if(completion(k)>=100)n++;else break}d.setDate(d.getDate()-1)}return n}

async function changeMetric(metric,delta){if(!canEditDate(selectedDate))return lockedToast();const d=dayData(selectedDate);d[metric]=Math.max(0,d[metric]+delta);addEvent(d,metric,`${metric} ${delta>0?'+1':'−1'}`,delta);days[selectedDate]=d;haptic();await saveDay(selectedDate)}
async function toggleTimer(){if(!canEditDate(selectedDate))return lockedToast();const d=dayData(selectedDate);if(d.timerStartedAt){d.knockSeconds=liveKnockSeconds(d);d.timerStartedAt=null;addEvent(d,'knock','Knocking paused')}else{d.timerStartedAt=Date.now();d.alarmPlayed=false;addEvent(d,'knock','Knocking started')}days[selectedDate]=d;haptic(18);await saveDay(selectedDate);ensureTick()}
async function resetKnock(){if(!canEditDate(selectedDate))return lockedToast();if(!confirm('Reset knocking time for this date?'))return;const d=dayData(selectedDate);d.knockSeconds=0;d.timerStartedAt=null;d.alarmPlayed=false;addEvent(d,'knock','Knocking reset');days[selectedDate]=d;await saveDay(selectedDate);ensureTick()}
async function finaliseExpiredTimers(){const today=todayKey();for(const [k,raw] of Object.entries(days)){if(k<today&&raw?.timerStartedAt){const d=dayData(k);d.knockSeconds=liveKnockSeconds(d);d.timerStartedAt=null;d.alarmPlayed=true;addEvent(d,'knock','Knocking stopped automatically at day close');days[k]=d;await saveDay(k,{quiet:true})}}}
function ensureTick(){clearInterval(timerTick);if(dayData(selectedDate).timerStartedAt)timerTick=setInterval(()=>{renderToday();const d=dayData(selectedDate),target=rollingKnockTarget(selectedDate)*60;if(liveKnockSeconds(d)>=target&&!d.alarmPlayed){d.alarmPlayed=true;days[selectedDate]=d;saveDay(selectedDate,{quiet:true});alarm()}},1000)}
function alarm(){haptic([180,100,180]);toast('Today’s knocking target reached');try{const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.value=.17;o.start();o.stop(c.currentTime+.7)}catch{}}

function formatHour(h){return `${h%12||12}:00 ${h>=12?'PM':'AM'}`}
function renderCallPlan(){const now=new Date(),h=now.getHours();let current=CALL_PLAN.find(x=>x[0]===h);if(h<9)current=[8,'Prepare your priority list','Before 9:00 AM'];if(h>=17)current=[17,'Review follow-up and plan tomorrow','9:00 AM–5:00 PM call day complete'];$('#currentCall').textContent=current[1];$('#currentSlot').textContent=h>=9&&h<17?`${formatHour(h)}–${formatHour(h+1)} · 10 call target`:current[2];$('#callPlan').innerHTML=CALL_PLAN.map(([hour,title,note])=>`<div class="call-row ${hour===h?'active':''}"><b>${formatHour(hour)}</b><span><strong>${title}</strong><small>${note}</small></span><em>10</em></div>`).join('')}
function callsPaceText(value){if(selectedDate!==todayKey())return `${Math.max(0,targets.calls-value)} remaining`;const now=new Date(),h=now.getHours()+now.getMinutes()/60;if(h<9)return `${targets.calls-value} remaining`;if(h>=17)return value>=targets.calls?'Target complete':`${targets.calls-value} short today`;const expected=Math.min(targets.calls,Math.round((h-9)*10)),diff=value-expected;return diff===0?'On pace':diff>0?`${diff} ahead of pace`:`${Math.abs(diff)} behind pace`}
function renderToday(){
  const d=dayData(selectedDate),score=completion(selectedDate),kt=rollingKnockTarget(selectedDate),secs=liveKnockSeconds(d);
  const locked=isPastDate(selectedDate);
  $('#dateLabel').textContent=fmtDate(selectedDate);
  $('#backToday').classList.toggle('hidden',selectedDate===todayKey());
  $('#lockBadge').classList.toggle('hidden',!locked);
  $('#todayView').classList.toggle('date-locked',locked);
  $('#dailyScore').textContent=`${score}%`;
  $('#scoreBar').style.width=`${score}%`;
  for(const m of ['calls','connects','data']){
    const val=d[m],target=targets[m],p=pct(val,target),rem=Math.max(0,target-val);
    $(`#${m}Value`).textContent=val;
    $(`#${m}TargetLabel`).textContent=`/${target}`;
    $(`#${m}TargetText`).textContent=`Daily target ${target}`;
    $(`#${m}Percent`).textContent=`${p}%`;
    $(`#${m}Pace`).textContent=locked?'Day locked':(m==='calls'?callsPaceText(val):(rem?`${rem} remaining`:'Target complete'));
    document.querySelector(`[data-metric="${m}"]`).classList.toggle('complete',rem===0);
  }
  $('#knockValue').textContent=fmtTimer(secs);
  $('#knockTargetText').textContent=`Rolling target ${kt} min · Weekly minimum ${targets.weeklyKnock} min`;
  $('#knockRemaining').textContent=locked?'Day locked':(Math.max(0,kt-Math.floor(secs/60))?`${Math.max(0,kt-Math.floor(secs/60))} minutes remaining`:'Target complete');
  $('#timerButton').textContent=locked?'Locked':(d.timerStartedAt?'Pause':'Start');
  $('#timerButton').classList.toggle('running',!!d.timerStartedAt&&!locked);
  $$('[data-action], #timerButton, #resetKnock').forEach(el=>{el.disabled=locked;el.setAttribute('aria-disabled',String(locked))});
  renderDayTrend();
  renderLeaderboardPosition();
}
function recentWorkKeys(endKey=selectedDate,count=8){
  const out=[],d=parseKey(endKey);
  for(let i=0;i<40&&out.length<count;i++){
    if(WORK_DAYS.includes(d.getDay()))out.unshift(dateKey(d));
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
function renderWeekDays(){const names=['MON','TUE','THU','FRI'];$('#weekDays').innerHTML=weekKeys().map((k,i)=>{const p=completion(k);return `<button class="week-day ${k===selectedDate?'selected':''} ${p>=100?'complete':''}" data-date="${k}"><b>${names[i]}</b><small>${parseKey(k).getDate()} · ${p}%</small></button>`}).join('')}

function renderAppointments(){appointmentDate=$('#appointmentDatePicker').value||appointmentDate;const locked=isPastDate(appointmentDate);$('#appointmentForm').classList.toggle('date-locked',locked);$$('#appointmentForm input, #appointmentForm button').forEach(el=>el.disabled=locked);$('#appointmentLock').classList.toggle('hidden',!locked);$('#appointmentDateLabel').textContent=fmtDate(appointmentDate);const list=dayData(appointmentDate).appointments;$('#appointmentsList').innerHTML=list.length?list.slice().sort((a,b)=>b.at-a.at).map(a=>`<article class="appointment-card"><div><strong>${escapeHtml(a.address)}</strong><small>${a.types.join(' · ')} · ${new Date(a.at).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})}</small></div><button data-delete-appointment="${a.id}" aria-label="Delete" ${locked?'disabled':''}>×</button></article>`).join(''):`<div class="empty">No appointments logged for this date.</div>`}
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
async function addAppointment(address,types){if(!canEditDate(appointmentDate))return lockedToast();const d=dayData(appointmentDate);d.appointments.push({id:uuid(),address,types,at:Date.now()});addEvent(d,'appointment',`${types.join(', ')} · ${address}`);days[appointmentDate]=d;await saveDay(appointmentDate);renderAppointments();toast('Appointment added')}
async function deleteAppointment(id){if(!canEditDate(appointmentDate))return lockedToast();const d=dayData(appointmentDate);d.appointments=d.appointments.filter(a=>a.id!==id);days[appointmentDate]=d;await saveDay(appointmentDate);renderAppointments()}

function renderLeaderboardPosition(){
  const date=todayKey();
  const rows=leaderboardEntries.filter(x=>x.date===date).sort((a,b)=>(b.score||0)-(a.score||0)||(b.calls||0)-(a.calls||0)||(b.connects||0)-(a.connects||0)||(b.data||0)-(a.data||0));
  const index=rows.findIndex(r=>r.uid===uid);
  const pos=$('#leaderboardPosition'),summary=$('#leaderboardPositionSummary');
  if(!pos||!summary)return;
  if(!cloud){pos.textContent='—';summary.textContent='Available when live sync is active';return}
  if(index<0){pos.textContent='—';summary.textContent=rows.length?`Not ranked yet · ${rows.length} agent${rows.length===1?'':'s'} active`:'Waiting for live team data';return}
  const me=rows[index];
  pos.textContent=`#${index+1}`;
  summary.textContent=`${me.score||0}% today · ${rows.length} agent${rows.length===1?'':'s'} ranked`;
}

function renderLeaderboard(){
  const date=todayKey();
  $('#leaderboardDate').textContent=fmtDate(date);
  const rows=leaderboardEntries.filter(x=>x.date===date).sort((a,b)=>(b.score||0)-(a.score||0)||(b.calls||0)-(a.calls||0)||(b.connects||0)-(a.connects||0)||(b.data||0)-(a.data||0));
  $('#leaderboardStatus').textContent=cloud?'LIVE':'DEVICE ONLY';
  $('#leaderboardList').innerHTML=rows.length?rows.map((r,i)=>{
    const t=r.targets||{};
    return `<article class="leaderboard-row ${r.uid===uid?'me':''}"><b class="rank">${i+1}</b><div class="agent"><strong>${escapeHtml(r.name||r.email?.split('@')[0]||'Agent')}</strong>${r.uid===uid?'<small>You</small>':''}</div><span>${r.calls||0}<small>/${t.calls||50}</small></span><span>${r.connects||0}<small>/${t.connects||25}</small></span><span>${r.data||0}<small>/${t.data||10}</small></span><span>${r.knockMinutes||0}<small>m</small></span><em>${r.score||0}%</em></article>`
  }).join(''):`<div class="empty">No agents have logged activity today.</div>`
}
function switchInsightsPage(id){$$('.insights-switch button').forEach(b=>b.classList.toggle('active',b.dataset.insightsPage===id));$$('.insights-page').forEach(p=>p.classList.toggle('active',p.id===id));if(id==='leaderboardInsights')renderLeaderboard()}
function renderInsights(){const w=weekSummary(),m=mondayOf(parseKey(selectedDate));$('#insightWeekScore').textContent=`${w.score}%`;$('#insightWeekLabel').textContent=`Week of ${m.toLocaleDateString('en-AU',{day:'numeric',month:'short'})}`;$('#insightCalls').textContent=w.calls;$('#insightCallsAvg').textContent=`${Math.round(w.calls/4)}/day`;$('#insightConnects').textContent=w.connects;$('#insightConnectRate').textContent=`${w.calls?Math.round(w.connects/w.calls*100):0}% connect rate`;$('#insightData').textContent=w.data;$('#insightDataAvg').textContent=`${Math.round(w.data/4)}/day`;$('#insightKnock').textContent=`${Math.floor(w.knock/60)} min`;$('#knockBar').style.width=`${pct(w.knock/60,targets.weeklyKnock)}%`;renderMonth();$('#yearLabel').textContent=year;renderYearOverview();renderLeaderboard()}
function renderYearOverview(){const labels=['M','T','W','T','F','S','S'];const months=[];for(let m=0;m<12;m++){const first=new Date(year,m,1),pad=(first.getDay()+6)%7;let cells=`<div class="mini-weekdays">${labels.map(x=>`<b>${x}</b>`).join('')}</div><div class="mini-days">${'<i></i>'.repeat(pad)}`;for(let d=1;d<=new Date(year,m+1,0).getDate();d++){const dt=new Date(year,m,d),k=dateKey(dt),p=completion(k),off=!WORK_DAYS.includes(dt.getDay());cells+=`<button class="mini-day ${levelClass(p)} ${off?'off':''} ${k===todayKey()?'today':''} ${k===selectedDate?'selected':''}" data-date="${k}" aria-label="${fmtDate(k)}, ${p}% complete">${d}</button>`}cells+='</div>';months.push(`<section class="mini-month"><h3>${new Date(year,m,1).toLocaleDateString('en-AU',{month:'short'})}</h3>${cells}</section>`)}$('#yearHeatmap').innerHTML=months.join('')}
function levelClass(p){return p>=100?'l4':p>=67?'l3':p>=34?'l2':p>0?'l1':''}
function renderMonth(){const y=monthCursor.getFullYear(),m=monthCursor.getMonth();$('#monthLabel').textContent=monthCursor.toLocaleDateString('en-AU',{month:'long',year:'numeric'});const vals=[];for(let d=1;d<=new Date(y,m+1,0).getDate();d++){const dt=new Date(y,m,d);if(WORK_DAYS.includes(dt.getDay()))vals.push(completion(dateKey(dt)))}const groups=[];for(let i=0;i<vals.length;i+=4){const g=vals.slice(i,i+4);groups.push(Math.round(g.reduce((a,b)=>a+b,0)/Math.max(1,g.length)))}$('#monthBars').innerHTML=groups.map((p,i)=>`<div title="${p}%"><i style="height:${Math.max(3,p)}%"></i><small>W${i+1}</small></div>`).join('')}
function renderCalendar(){const labels=['M','T','W','T','F','S','S'];$('#calendarYear').textContent=year;const months=[];for(let m=0;m<12;m++){const first=new Date(year,m,1),pad=(first.getDay()+6)%7;let cells=`<div class="weekday-row">${labels.map(x=>`<b>${x}</b>`).join('')}</div><div class="days">${'<i></i>'.repeat(pad)}`;for(let d=1;d<=new Date(year,m+1,0).getDate();d++){const dt=new Date(year,m,d),k=dateKey(dt),p=completion(k),off=!WORK_DAYS.includes(dt.getDay());cells+=`<button class="day-cell ${levelClass(p)} ${off?'off':''} ${k===todayKey()?'today':''} ${k===selectedDate?'selected':''}" data-date="${k}" title="${fmtDate(k)} · ${p}%">${d}</button>`}cells+='</div>';months.push(`<section class="month"><h3>${new Date(year,m,1).toLocaleDateString('en-AU',{month:'long'})}</h3>${cells}</section>`)}$('#calendarGrid').innerHTML=months.join('')}
function renderSettings(){$('#agentName').value=displayAgentName();$('#callsTarget').value=targets.calls;$('#connectsTarget').value=targets.connects;$('#dataTarget').value=targets.data;$('#weeklyKnockTarget').value=targets.weeklyKnock;$('#accountEmail').textContent=currentUser?.email||'Device-only mode';$('#modeNote').textContent=cloud?'Live sync is active. Use the same login on every device.':'Data is stored only on this device.'}
function renderAll(){renderToday();renderAppointments();renderInsights();renderSettings()}

async function startCloud(user){
  // Tear down every listener and timer from the previous identity before touching UI state.
  unsubDays?.();unsubProfile?.();unsubLeaderboard?.();
  unsubDays=unsubProfile=unsubLeaderboard=null;
  clearInterval(timerTick);clearTimeout(syncTimer);clearTimeout(leaderboardPublishTimer);

  currentUser=user;uid=user.uid;cloud=true;
  resetVisibleWorkspace();
  showApp();
  showWorkspaceLoader(user);
  setSync('','Connecting');

  let daysReady=false, profileReady=false, firstLoadFinished=false;
  const finishWorkspaceLoad=()=>{
    if(firstLoadFinished||!daysReady||!profileReady)return;
    firstLoadFinished=true;
    saveLocal();
    renderAll();ensureTick();
    hideWorkspaceLoader();
    setSync(navigator.onLine?'live':'offline',navigator.onLine?'Live':'Offline');
    scheduleLeaderboardPublish();
  };

  clearTimeout(syncTimer);
  syncTimer=setTimeout(()=>{
    if(!firstLoadFinished){
      $('#workspaceLoaderDetail').textContent=navigator.onLine?'Still connecting to your private workspace…':'Offline — loading saved data when available';
      setSync(navigator.onLine?'':'offline',navigator.onLine?'Connecting':'Offline');
    }
  },4000);

  unsubDays=onSnapshot(collection(db,'users',uid,'days'),{includeMetadataChanges:true},snap=>{
    // Replace the entire active dataset. Never merge with the previous signed-in user's memory.
    const nextDays={};
    snap.docs.forEach(d=>{
      const incoming=d.data();
      nextDays[d.id]={...blankDay(),...incoming,appointments:incoming.appointments||[],events:incoming.events||[]};
    });
    days=nextDays;
    daysReady=true;
    saveLocal();renderAll();ensureTick();
    clearTimeout(syncTimer);
    if(firstLoadFinished)setSync(snap.metadata.fromCache&&!navigator.onLine?'offline':'live',snap.metadata.hasPendingWrites?'Saving':'Live');
    finishWorkspaceLoad();
  },err=>{
    console.error(err);days={};daysReady=true;renderAll();
    setSync('error','Sync error');
    $('#workspaceLoaderDetail').textContent='Could not load stats. Check Firestore rules and connection.';
    toast('Firestore access failed. Check rules and login.');
    finishWorkspaceLoad();
  });

  unsubProfile=onSnapshot(doc(db,'users',uid),snap=>{
    targets={...DEFAULTS};
    agentName='';
    if(snap.exists()){
      const profile=snap.data();
      if(profile.targets)targets={...DEFAULTS,...profile.targets};
      if(profile.name)agentName=profile.name;
    }
    profileReady=true;
    saveLocal();renderAll();
    finishWorkspaceLoad();
  },err=>{
    console.error(err);targets={...DEFAULTS};agentName='';profileReady=true;renderAll();finishWorkspaceLoad();
  });

  unsubLeaderboard=onSnapshot(collection(db,'leaderboard'),{includeMetadataChanges:true},snap=>{
    leaderboardEntries=snap.docs.map(d=>({uid:d.id,...d.data()}));
    renderLeaderboard();
    renderLeaderboardPosition();
  },err=>{
    console.error('Leaderboard read failed',err);
    $('#leaderboardStatus').textContent='SYNC ERROR';
  });
}
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
async function init(){
  bindViewport();
  loadLocal('local');
  await finaliseExpiredTimers();
  const signInButton=$('#authForm button[type="submit"]');
  if(signInButton)signInButton.disabled=true;
  if(!configured()){
    showAuthMessage('Firebase is not configured. You can still use device-only mode.');
    return;
  }
  try{
    const fb=getApps().length?getApp():initializeApp(firebaseConfig);
    auth=getAuth(fb);
    db=getFirestore(fb);

    // Register auth handling before optional browser persistence. Some iOS beta
    // builds reject persistence APIs; that must never block login or Firestore.
    onAuthStateChanged(auth,u=>{
      if(u){
        startCloud(u);
      }else{
        clearActiveSession();
        $('#app').classList.add('hidden');
        $('#authGate').classList.remove('hidden');
      }
    });

    try{
      await setPersistence(auth,browserLocalPersistence);
    }catch(persistenceError){
      console.warn('Firebase auth persistence unavailable; continuing with session auth.',persistenceError);
    }

    if(signInButton)signInButton.disabled=false;
    showAuthMessage('');
  }catch(err){
    console.error('Firebase startup failed',err);
    auth=null;
    db=null;
    if(signInButton)signInButton.disabled=true;
    showAuthMessage('Firebase could not start. Refresh the app and try again.');
  }
}
function showAuthMessage(msg){$('#authMessage').textContent=msg}
function switchView(id){$$('.tabbar button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));const label=document.querySelector(`.tabbar button[data-view="${id}"] span`)?.textContent||'Daily Accountability';$('#viewTitle').textContent=id==='todayView'?'Daily Accountability':label;if(id==='appointmentsView')renderAppointments();if(id==='insightsView')renderInsights()}
function openCalendar(){$('#calendarModal').classList.add('open');renderCalendar()}

$('#authForm').addEventListener('submit',async e=>{
  e.preventDefault();
  showAuthMessage('');
  const button=$('#authForm button[type="submit"]');
  if(!auth){
    showAuthMessage('Firebase is still starting. Close and reopen the app, then try again.');
    return;
  }
  try{
    if(button)button.disabled=true;
    await signInWithEmailAndPassword(auth,$('#email').value.trim(),$('#password').value);
  }catch(err){
    console.error('Sign in failed',err);
    showAuthMessage(err?.message||'Sign in failed. Please try again.');
  }finally{
    if(button)button.disabled=false;
  }
});
$('#createAccount').onclick=async()=>{try{await createUserWithEmailAndPassword(auth,$('#email').value,$('#password').value)}catch(err){showAuthMessage(err.message)}};
$('#localMode').onclick=()=>{clearActiveSession();uid='local';loadLocal('local');setSync('offline','This device');showApp()};
$$('[data-action]').forEach(b=>b.onclick=()=>changeMetric(b.dataset.metric,b.dataset.action==='plus'?1:-1));
$('#timerButton').onclick=toggleTimer;$('#resetKnock').onclick=resetKnock;$('#settingsShortcut').onclick=()=>switchView('settingsView');$('#backToday').onclick=()=>{selectedDate=todayKey();appointmentDate=selectedDate;$('#appointmentDatePicker').value=appointmentDate;renderAll();ensureTick()};
$('.tabbar').onclick=e=>{const b=e.target.closest('button[data-view]');if(b)switchView(b.dataset.view)};
$('.insights-switch').onclick=e=>{const b=e.target.closest('button[data-insights-page]');if(b)switchInsightsPage(b.dataset.insightsPage)};
$('#weekDays').onclick=e=>{const b=e.target.closest('[data-date]');if(!b)return;selectedDate=b.dataset.date;appointmentDate=selectedDate;$('#appointmentDatePicker').value=appointmentDate;renderAll();ensureTick();haptic()};
$('#appointmentDatePicker').onchange=e=>{appointmentDate=e.target.value;renderAppointments()};
$('#appointmentForm').onsubmit=async e=>{e.preventDefault();const address=$('#appointmentAddress').value.trim(),types=$$('.appointment-types input:checked').map(x=>x.value);if(!address)return toast('Add a property address');if(!types.length)return toast('Choose an appointment type');await addAppointment(address,types);e.target.reset()};
$('#appointmentsList').onclick=e=>{const b=e.target.closest('[data-delete-appointment]');if(b&&confirm('Delete this appointment?'))deleteAppointment(b.dataset.deleteAppointment)};
$('#saveSettings').onclick=async()=>{agentName=$('#agentName').value.trim()||displayAgentName();targets={calls:+$('#callsTarget').value||50,connects:+$('#connectsTarget').value||25,data:+$('#dataTarget').value||10,weeklyKnock:+$('#weeklyKnockTarget').value||240};saveLocal();await saveTargets();renderAll();toast('Settings saved')};
$('#signOut').onclick=async()=>{showWorkspaceLoader({email:'Signing out'});clearActiveSession();if(auth?.currentUser)await firebaseSignOut(auth);$('#app').classList.add('hidden');$('#authGate').classList.remove('hidden')};
$('#exportData').onclick=()=>{const blob=new Blob([JSON.stringify({targets,days},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`daily-accountability-${todayKey()}.json`;a.click();URL.revokeObjectURL(a.href)};
$('#importData').onchange=async e=>{try{const raw=JSON.parse(await e.target.files[0].text());targets={...DEFAULTS,...raw.targets};days={...days,...raw.days};saveLocal();if(cloud){await saveTargets();for(const k of Object.keys(raw.days||{}))await saveDay(k,{quiet:true})}renderAll();toast('Backup imported')}catch{toast('Backup could not be read')}};
$('#openCalendarFromInsights').onclick=openCalendar;$('#closeCalendar').onclick=()=>$('#calendarModal').classList.remove('open');$('#calendarPrev').onclick=$('#prevYear').onclick=()=>{year--;renderCalendar();renderInsights()};$('#calendarNext').onclick=$('#nextYear').onclick=()=>{year++;renderCalendar();renderInsights()};
$('#calendarGrid').onclick=e=>{const b=e.target.closest('[data-date]');if(!b)return;selectedDate=b.dataset.date;appointmentDate=selectedDate;$('#appointmentDatePicker').value=appointmentDate;$('#calendarModal').classList.remove('open');switchView('todayView');renderAll();ensureTick()};
$('#yearHeatmap').onclick=e=>{const b=e.target.closest('[data-date]');if(!b)return;selectedDate=b.dataset.date;appointmentDate=selectedDate;$('#appointmentDatePicker').value=appointmentDate;switchView('todayView');renderAll();ensureTick()};
$('#prevMonth').onclick=()=>{monthCursor.setMonth(monthCursor.getMonth()-1);renderMonth()};$('#nextMonth').onclick=()=>{monthCursor.setMonth(monthCursor.getMonth()+1);renderMonth()};
window.addEventListener('online',()=>{if(cloud){setSync('live','Live');scheduleLeaderboardPublish()}});window.addEventListener('offline',()=>setSync('offline','Offline'));
if('serviceWorker'in navigator)window.addEventListener('load',async()=>{const reg=await navigator.serviceWorker.register('./service-worker.js');reg.update()});
setInterval(()=>{finaliseExpiredTimers().then(()=>{if(selectedDate<todayKey())renderAll()});updateAppViewport();if(cloud)scheduleLeaderboardPublish()},30000);
init();
