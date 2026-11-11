import {collection,query,where,onSnapshot} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import {createAssociateStore,normaliseAssociateTask} from './associate-firestore.js';
import {instancesForDate} from './associate-task-data.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const id=()=>crypto.randomUUID().replaceAll('-','');
const dateLabel=key=>new Date(key+'T12:00:00Z').toLocaleDateString('en-AU',{day:'numeric',month:'short'});
const addDays=(key,count)=>{const value=new Date(key+'T12:00:00Z');value.setUTCDate(value.getUTCDate()+count);return value.toISOString().slice(0,10)};
let cacheDatabase;
function database(){
  if(!cacheDatabase)cacheDatabase=new Promise((resolve,reject)=>{
    const request=indexedDB.open('agnt-associate-workflow-v1',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('accounts');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(Error('Associate task storage is blocked.'));
  }).catch(error=>{cacheDatabase=null;throw error});
  return cacheDatabase;
}
async function readCache(key){
  const db=await database();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('accounts','readonly'),request=tx.objectStore('accounts').get(key);
    tx.oncomplete=()=>resolve(request.result||null);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
}
const cacheWrites=new Map();
function writeCache(key,state){
  const snapshot=structuredClone(state),previous=cacheWrites.get(key)||Promise.resolve();
  const saving=previous.catch(()=>{}).then(async()=>{
    const db=await database();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('accounts','readwrite');tx.objectStore('accounts').put(snapshot,key);
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
    });
  });
  cacheWrites.set(key,saving);return saving;
}
export function createAssociateProfiles(env){
  let context=null,generation=0,state={profiles:[],tasks:{},outbox:[],versions:{}},unsubscribers=[],rangeUnsubscribers=[],watchedRange='',syncBusy=false,retryTimer=null,retryDelay=2500,ensureDate='',message='',profilesReady=false,editor=null,reviewUnsubscribe=null,ensureBusy=null,maintenanceTimer=null,alerts=[],alertsReady=false,seenAlerts=new Set();
  const current=token=>context&&token===generation&&env.context().uid===context.uid&&env.context().teamId===context.teamId;
  const cacheKey=()=>context.uid+'|'+context.teamId;
  const dataStore=()=>createAssociateStore({db:env.db(),uid:context.uid,teamId:context.teamId,today:env.today});
  const resolved=(text,lead)=>String(text||'').replaceAll('{Lead}',lead||'their supervising agent');
  const store=()=>writeCache(cacheKey(),state);
  const memberName=uid=>env.members().find(member=>member.uid===uid)?.name||env.members().find(member=>member.uid===uid)?.email?.split('@')[0]||'Agent';
  function activeConfig(profile){return profile?.effectiveDate>env.today()?profile.currentConfig:profile}
  function canManage(task){return context?.role==='owner'||task.leadUid===context?.uid}
  function canToggle(task){return task.date<=env.today()&&(canManage(task)||task.assignedToUid===context?.uid)}
  function pendingAction(task){return state.outbox.find(action=>action.taskId===task.id)}
  function visibleTask(task){const action=pendingAction(task);return action?{...task,status:action.status,completionNote:action.note,notRequiredReason:action.reason,awaitingSync:true}:task}
  function mergeTasks(tasks){
    for(const task of tasks){const existing=state.tasks[task.id];if(!existing||task.version>=existing.version)state.tasks[task.id]=task}
  }
  function taskMarkup(raw,{readonly=false}={}){
    const base=visibleTask(raw),task={...base,title:resolved(base.title,base.leadName),instructions:resolved(base.instructions,base.leadName)},completed=task.status==='completed',notRequired=task.status==='not-required',pending=task.awaitingSync,enabled=!readonly&&canToggle(task)&&!pending;
    const status=completed?`${task.title} completed`:notRequired?'Not required':'Not complete';
    const meta=[task.fallback?'Covered by '+task.leadName:'',task.originalDate!==task.date?'Originally '+dateLabel(task.originalDate):'',task.completedByName?'Completed by '+task.completedByName:'',task.completedAt?new Date(task.completedAt).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'}):''].filter(Boolean).join(' · ');
    return `<article class="associate-task ${completed?'is-completed':''} ${notRequired?'is-not-required':''}"><button type="button" role="checkbox" aria-checked="${completed}" aria-label="${escape(completed?'Reopen '+task.title:'Complete '+task.title)}" data-associate-toggle="${escape(task.id)}" ${enabled?'':'disabled'}>${completed?'✓':notRequired?'–':''}</button><div><strong>${escape(task.title)}</strong><span class="associate-task-status">${escape(status)}${pending?' · Waiting to sync':''}</span>${task.instructions?`<p>${escape(task.instructions)}</p>`:''}${meta?`<small>${escape(meta)}</small>`:''}${task.completionNote?`<p>${escape(task.completionNote)}</p>`:''}${notRequired?`<small>Reason · ${escape(task.notRequiredReason)}</small>`:''}${enabled?`<div class="associate-task-actions"><button type="button" data-associate-note="${task.id}">${completed?'Edit completion note':'Complete with note'}</button>${canManage(task)&&!notRequired?`<button type="button" data-associate-skip="${task.id}">Not required</button>`:''}${notRequired?`<button type="button" data-associate-reopen="${task.id}">Reopen</button>`:''}</div>`:''}</div></article>`;
  }
  function summary(tasks){const rows=tasks.map(visibleTask);return `${rows.filter(task=>task.status==='completed').length} completed · ${rows.filter(task=>task.status==='pending').length} outstanding · ${rows.filter(task=>task.status==='not-required').length} not required`}
  function renderControls(){
    const host=document.querySelector('#associateTeamControls');if(!host)return;
    if(!context){host.hidden=true;host.replaceChildren();return}
    const members=context.role==='owner'?env.members().filter(member=>member.role!=='owner'):state.profiles.filter(profile=>profile.leadUid===context.uid).map(profile=>({uid:profile.associateUid,name:profile.associateName}));
    host.hidden=!members.length&&context.role!=='owner';
    const rows=members.map(member=>{const profile=state.profiles.find(item=>item.associateUid===member.uid);return `<button class="device-contact-action" type="button" data-associate-config="${escape(member.uid)}"><span><strong>${escape(member.name||memberName(member.uid))}</strong><small>${profile?.enabled?'Associate · '+memberName(profile.leadUid):'Configure associate profile'}</small></span><b aria-hidden="true">›</b></button>`}).join('');
    host.innerHTML=`<h3>Associate profiles</h3>${rows||'<p>Team members will appear here.</p>'}<p>Completion updates are shown inside AGNT.</p>${message?`<p class="associate-feedback" role="status">${escape(message)}</p>`:''}`;
  }
  function watchRange(start,end){
    const signature=start+'|'+end;if(!context||watchedRange===signature)return;
    watchedRange=signature;rangeUnsubscribers.forEach(unsubscribe=>unsubscribe());rangeUnsubscribers=[];
    const token=generation,ref=collection(env.db(),'teams',context.teamId,'associateTasks');
    const receive=snapshot=>{
      if(!current(token))return;
      mergeTasks(snapshot.docs.map(doc=>normaliseAssociateTask({...doc.data(),id:doc.id})));
      // A removed query row contains its old pending data, not its new completed state.
      if(!snapshot.metadata.fromCache&&!snapshot.metadata.hasPendingWrites)for(const change of snapshot.docChanges?.()||[]){
        if(change.type!=='removed')continue;
        dataStore().readTask(change.doc.id).then(latest=>{
          if(!current(token))return;
          if(latest)mergeTasks([latest]);else if(!pendingAction({id:change.doc.id}))delete state.tasks[change.doc.id];
          store().catch(()=>{});renderSchedule();renderOpenReview();
        }).catch(()=>{if(current(token)){message='A task update is waiting to refresh. Check your connection.';renderSchedule()}});
      }
      store().catch(()=>{message='Task cache could not be saved. Keep AGNT open and check device storage.'});
      renderSchedule();renderOpenReview();
    };
    const failed=error=>{if(current(token)){message='Associate tasks could not sync. '+(error.code==='permission-denied'?'Apply the updated Firestore rules.':error.code==='failed-precondition'?'Add the status/date Firestore index from the setup guide, then reopen AGNT.':'Check your connection.');renderSchedule();renderControls()}};
    rangeUnsubscribers.push(onSnapshot(query(ref,where('date','>=',start),where('date','<=',end)),receive,failed));
    rangeUnsubscribers.push(onSnapshot(query(ref,where('status','==','pending'),where('date','<',start)),receive,failed));
  }
  function renderSchedule(){
    const host=document.querySelector('#associateSchedule');if(!host)return;
    if(!context){host.hidden=true;host.replaceChildren();return}
    const date=env.viewDate(),profile=state.profiles.find(item=>item.associateUid===context.uid),config=activeConfig(profile);
    watchRange(date,date);
    const rows=Object.values(state.tasks).filter(task=>task.assignedToUid===context.uid),today=rows.filter(task=>task.date===date).sort((a,b)=>a.originalDate.localeCompare(b.originalDate)||a.order-b.order||a.id.localeCompare(b.id));
    const outstanding=rows.filter(task=>task.date<date&&visibleTask(task).status==='pending').sort((a,b)=>a.date.localeCompare(b.date));
    host.hidden=!config?.enabled&&!today.length&&!outstanding.length;
    if(host.hidden){host.replaceChildren();return;}
    const off=date>=env.today()&&config?.enabled&&!config.workingDays.includes(new Date(date+'T12:00:00Z').getUTCDay());
    host.innerHTML=`<div class="associate-section-head"><div><h3>${config?.enabled?'Daily tasks':'Assigned associate tasks'}</h3><p>${summary(today)}</p></div></div>${off?'<p>Rostered day off</p>':''}${message?`<p role="status" class="associate-feedback">${escape(message)}</p>`:''}${outstanding.length?`<details class="associate-outstanding" open><summary>Outstanding tasks · ${outstanding.length}</summary>${outstanding.map(task=>`<div><small>Due ${escape(dateLabel(task.date))}</small>${taskMarkup(task)}</div>`).join('')}</details>`:''}${today.map(task=>taskMarkup(task)).join('')}${!today.length&&!off?`<p>${!navigator.onLine&&!Object.keys(state.versions).length?'Connect once to load the recurring checklist.':ensureDate!==env.today()&&navigator.onLine?'Loading recurring tasks…':'No recurring tasks for this date.'}</p>`:''}`;
  }
  let reviewModel=null;
  function renderOpenReview(){
    const host=reviewModel?.host;if(!host?.isConnected)return;
    const {associateUid,start,end}=reviewModel,rows=Object.values(state.tasks).filter(task=>task.associateUid===associateUid&&task.date>=start&&task.date<=end).sort((a,b)=>a.date.localeCompare(b.date)||a.order-b.order||a.id.localeCompare(b.id));
    host.hidden=!reviewModel.force&&!state.profiles.some(profile=>profile.associateUid===associateUid)&&!rows.length;
    host.innerHTML=`<h3>Daily tasks</h3><p>${summary(rows)}</p>${reviewModel.loading?'<p>Checking task history…</p>':''}${reviewModel.error?`<p role="status">${escape(reviewModel.error)}</p>`:''}${rows.map(task=>`<div class="associate-review-day"><small>${escape(dateLabel(task.date))}</small>${taskMarkup(task)}</div>`).join('')}${!rows.length&&!reviewModel.loading&&!reviewModel.error?'<p>No associate tasks recorded for this period.</p>':''}`;
  }
  function attachSummary(host,associateUid,period,force=false){
    if(!context)return;
    reviewUnsubscribe?.();reviewUnsubscribe=null;
    const section=document.createElement('section');section.className='associate-review';section.dataset.associateReviewHost='';host.append(section);
    reviewModel={host:section,associateUid,...period,loading:true,force};renderOpenReview();
    const token=generation,ref=collection(env.db(),'teams',context.teamId,'associateTasks');
    reviewUnsubscribe=onSnapshot(query(ref,where('date','>=',period.start),where('date','<=',period.end)),snapshot=>{
      if(!current(token)||!section.isConnected){reviewUnsubscribe?.();reviewUnsubscribe=null;return}
      mergeTasks(snapshot.docs.map(doc=>normaliseAssociateTask({...doc.data(),id:doc.id})));
      // A removed query row contains its old pending data, not its new completed state.
      if(!snapshot.metadata.fromCache&&!snapshot.metadata.hasPendingWrites)for(const change of snapshot.docChanges?.()||[]){
        if(change.type!=='removed')continue;
        dataStore().readTask(change.doc.id).then(latest=>{
          if(!current(token))return;
          if(latest)mergeTasks([latest]);else if(!pendingAction({id:change.doc.id}))delete state.tasks[change.doc.id];
          store().catch(()=>{});renderSchedule();renderOpenReview();
        }).catch(()=>{if(current(token)){message='A task update is waiting to refresh. Check your connection.';renderSchedule()}});
      }reviewModel.loading=false;renderOpenReview();
    },error=>{if(current(token)&&section.isConnected){reviewModel.loading=false;reviewModel.error='Task history could not load. Check connection and associate rules.';renderOpenReview()}});
  }
  function showReview(associateUid,date){
    document.querySelector('.associate-review-overlay')?.remove();
    const overlay=document.createElement('div');overlay.className='associate-overlay associate-review-overlay';
    overlay.innerHTML=`<section class="associate-sheet" role="dialog" aria-modal="true" aria-labelledby="associateReviewTitle"><header><div><small>ASSOCIATE TASKS</small><h2 id="associateReviewTitle">${escape(memberName(associateUid))}</h2><p>${escape(dateLabel(date))}</p></div><button type="button" data-associate-close aria-label="Close">×</button></header><div data-associate-review-content></div></section>`;
    document.body.append(overlay);attachSummary(overlay.querySelector('[data-associate-review-content]'),associateUid,{start:date,end:date},true);
  }
  async function queueStatus(taskId,status,note='',reason=''){
    if(!context)return;
    const task=state.tasks[taskId];if(!task||!canToggle(task)||pendingAction(task))return;
    const token=generation,action={taskId,status,note,reason,expectedVersion:task.version,actionId:id(),durable:false};
    if(status==='not-required'&&!canManage(task))return;
    state.outbox.push(action);
    try{await store()}catch(error){if(current(token)){state.outbox=state.outbox.filter(item=>item.actionId!==action.actionId);store().catch(()=>{});env.toast('Task could not be saved on this device. Keep AGNT open and check storage.')}return}
    if(!current(token))return;
    action.durable=true;renderSchedule();renderOpenReview();flush();
  }
  async function flush(){
    if(!context||syncBusy||!navigator.onLine||!state.outbox.length)return;
    const token=generation;syncBusy=true;
    try{
      await ensureTasks();
      if(!current(token))return;
      while(current(token)&&state.outbox.length&&navigator.onLine){
        const action=state.outbox[0];
        if(!action.durable)break;
        try{
          const task=await dataStore().setTaskStatus(action);
          if(!current(token))return;
          mergeTasks([task]);state.outbox=state.outbox.filter(item=>item.actionId!==action.actionId);retryDelay=2500;message='';
        }catch(error){
          if(!current(token))return;
          if(['permission-denied','not-found','aborted','invalid-argument','failed-precondition'].includes(error.code)){
            state.outbox=state.outbox.filter(item=>item.actionId!==action.actionId);
            message='Task change was not accepted. '+error.message;
            env.toast(message);
          }else{
            message='Task changes saved on this device. Waiting to sync.';
            clearTimeout(retryTimer);retryTimer=setTimeout(flush,retryDelay);retryDelay=Math.min(retryDelay*2,60000);break;
          }
        }
        await store();renderSchedule();renderOpenReview();renderControls();
      }
    }catch(error){if(current(token))message='Task sync needs attention. Keep AGNT open and retry.'}
    finally{if(current(token)){syncBusy=false;renderSchedule();renderOpenReview()}}
  }
  function taskEditorMarkup(task,index){
    return `<fieldset class="associate-template" data-template-id="${escape(task.id)}"><legend>Task ${index+1}</legend><label>Task name<input name="title" maxlength="160" value="${escape(task.title)}" required></label><label>Instructions <small>Optional · use {Lead} for their supervising agent</small><textarea name="instructions" maxlength="1000" rows="2">${escape(task.instructions)}</textarea></label><label>Repeat<select name="repeat"><option value="working-days" ${task.repeat==='working-days'?'selected':''}>Every working day</option><option value="weekdays" ${task.repeat==='weekdays'?'selected':''}>Selected weekdays</option></select></label><div class="associate-days" role="group" aria-label="Recurring weekdays">${dayNames.map((name,day)=>`<label><input type="checkbox" name="taskDay" value="${day}" ${task.days.includes(day)?'checked':''}>${name}</label>`).join('')}</div><label>On a day off<select name="timing"><option value="next-working" ${task.timing==='next-working'?'selected':''}>Move to next working day</option><option value="fixed" ${task.timing==='fixed'?'selected':''}>Keep deadline · supervising agent covers</option></select></label><label class="associate-check"><input name="active" type="checkbox" ${task.active?'checked':''}>Active</label><div class="associate-template-actions"><button type="button" data-template-move="-1">Move up</button><button type="button" data-template-move="1">Move down</button><button type="button" data-template-remove>Remove task</button></div></fieldset>`;
  }
  function readEditor(){
    const form=document.querySelector('#associateConfigForm');if(!form)return editor;
    const owner=context.role==='owner';
    return {...editor,enabled:owner?form.elements.associateEnabled.checked:editor.enabled,leadUid:owner?form.elements.leadUid.value:editor.leadUid,workingDays:[...form.querySelectorAll('[name=workingDay]:checked')].map(input=>Number(input.value)),tasks:[...form.querySelectorAll('[data-template-id]')].map(row=>({id:row.dataset.templateId,title:row.querySelector('[name=title]').value,instructions:row.querySelector('[name=instructions]').value,repeat:row.querySelector('[name=repeat]').value,days:[...row.querySelectorAll('[name=taskDay]:checked')].map(input=>Number(input.value)),timing:row.querySelector('[name=timing]').value,active:row.querySelector('[name=active]').checked}))};
  }
  function renderEditor(){
    const form=document.querySelector('#associateConfigForm');if(!form||!editor)return;
    const owner=context.role==='owner',leads=env.members().filter(member=>member.uid!==editor.memberUid&&!state.profiles.some(profile=>profile.associateUid===member.uid&&profile.enabled));
    form.innerHTML=`<header><div><small>ASSOCIATE PROFILE</small><h2 id="associateConfigTitle">${escape(memberName(editor.memberUid))}</h2></div><button type="button" data-associate-close aria-label="Close">×</button></header><label class="associate-check"><input type="checkbox" name="associateEnabled" ${editor.enabled?'checked':''} ${owner?'':'disabled'}>Associate agent</label><label>Supervising agent<select name="leadUid" ${owner?'':'disabled'}>${leads.map(member=>`<option value="${escape(member.uid)}" ${member.uid===editor.leadUid?'selected':''}>${escape(member.name||memberName(member.uid))}</option>`).join('')}</select></label><fieldset><legend>Working days</legend><div class="associate-days">${dayNames.map((name,day)=>`<label><input name="workingDay" type="checkbox" value="${day}" ${editor.workingDays.includes(day)?'checked':''}>${name}</label>`).join('')}</div></fieldset><p>Existing daily records keep their original wording and status. Changes to an existing profile start tomorrow.</p><div data-associate-templates>${editor.tasks.map(taskEditorMarkup).join('')}</div><div class="associate-editor-add"><button class="secondary" type="button" data-template-add>Add recurring task</button><button class="text-btn" type="button" data-template-starter>Load starter checklist</button></div><p data-associate-config-status role="status"></p><button class="primary" type="submit">Save associate profile</button>`;
  }
  function showConfig(memberUid){
    if(!context)return;
    const profile=state.profiles.find(item=>item.associateUid===memberUid);
    if(context.role!=='owner'&&profile?.leadUid!==context.uid)return;
    editor={memberUid,expectedVersion:profile?.version||0,enabled:profile?.enabled||false,leadUid:profile?.leadUid||context.uid,workingDays:[...(profile?.workingDays||[1,2,4,5,6])],tasks:structuredClone(profile?.tasks||[])};
    document.querySelector('.associate-config-overlay')?.remove();
    const overlay=document.createElement('div');overlay.className='associate-overlay associate-config-overlay';
    overlay.innerHTML='<form id="associateConfigForm" class="associate-sheet" role="dialog" aria-modal="true" aria-labelledby="associateConfigTitle"></form>';
    document.body.append(overlay);renderEditor();overlay.querySelector('[name=associateEnabled]').focus({preventScroll:true});
  }
  function starterTasks(){
    const task=(title,days,repeat='weekdays',timing='next-working')=>({id:id(),title,instructions:'',days,repeat,timing,active:true});
    return [task('Follow up enquiries',[],'working-days'),task('First-round open-home buyer callbacks',[1]),task('Second-round open-home buyer callbacks',[2]),task('Progress buyer callbacks and inspection feedback',[3,4,5]),task('Provide property and buyer updates to {Lead}',[],'working-days'),task('Send vendor update texts',[1,4]),task('Book upcoming open-home times',[1]),task('Generate vendor reports',[2],'weekdays','fixed'),task('Book second inspections',[2,3,4,5]),task('Confirm Saturday open-home arrangements',[4,5]),task('Prepare Saturday open-home expectations and predicted attendance',[5])];
  }
  async function saveConfig(form){
    const token=generation,button=form.querySelector('[type=submit]'),status=form.querySelector('[data-associate-config-status]');
    if(button.disabled)return;
    if(!navigator.onLine){status.textContent='Connect before changing the recurring checklist.';return}
    editor=readEditor();button.disabled=true;status.textContent='Saving profile…';
    try{
      const result=await dataStore().saveProfile({memberUid:editor.memberUid,expectedVersion:editor.expectedVersion,config:{enabled:editor.enabled,leadUid:editor.leadUid,workingDays:editor.workingDays,tasks:editor.tasks}});
      if(!current(token))return;
      form.closest('.associate-overlay').remove();editor=null;ensureDate='';env.toast('Associate profile saved · effective '+dateLabel(result.effectiveDate));await ensureTasks();
    }catch(error){if(current(token)&&form.isConnected){status.textContent=error.message;button.disabled=false}}
  }
  function projectOfflineTasks(){
    if(!context)return;
    for(const profile of state.profiles.filter(p=>p.associateUid===context.uid||p.leadUid===context.uid||context.role==='owner')){
      const versions=state.versions[profile.associateUid]||[];
      const dates=new Set([env.today()]);let date=profile.generatedThrough?addDays(profile.generatedThrough,1):profile.startDate;
      for(let count=0;date&&date<=env.today()&&count<31;count++,date=addDays(date,1))dates.add(date);
      for(const date of dates){
        const config=versions.filter(v=>v.effectiveDate<=date&&date<v.until).sort((a,b)=>a.effectiveDate.localeCompare(b.effectiveDate)||a.version-b.version).at(-1);
        if(!config)continue;
        for(const task of instancesForDate(config,date,profile.associateUid,profile.associateName,memberName(config.leadUid))){if(!state.tasks[task.id])state.tasks[task.id]={...task,localOnly:true}}
      }
    }
    store().catch(()=>{});renderSchedule();renderOpenReview();
  }
  async function ensureTasks(){
    if(!context||!state.profiles.length)return;
    if(!navigator.onLine){projectOfflineTasks();return}
    if(ensureBusy)return ensureBusy;
    if(ensureDate===env.today())return;
    const token=generation,storeApi=dataStore();
    ensureBusy=Promise.resolve().then(async()=>{
      try{
        const result=await storeApi.ensureTasks();
        if(!current(token))return;
        state.profiles=result.profiles;Object.assign(state.versions,result.versions);mergeTasks(result.tasks);ensureDate=result.catchupPending?'':env.today();
        if(message.startsWith('Associate daily tasks'))message='';
        await store();renderSchedule();renderOpenReview();renderControls();
      }catch(error){if(current(token)){ensureDate='';message='Associate daily tasks could not sync. '+(error.code==='permission-denied'?'Apply the updated Firestore rules.':error.message);projectOfflineTasks();renderSchedule();throw error}}
      finally{if(current(token))ensureBusy=null}
    });
    return ensureBusy;
  }
  function renderAlerts(){
    const host=document.querySelector('#associateAlerts');if(!host)return;
    host.hidden=!context||!alerts.length;
    if(host.hidden){host.replaceChildren();return}
    host.innerHTML=`<h3>Associate updates</h3>${alerts.slice(0,5).map(alert=>`<article class="associate-completion-alert"><button type="button" data-associate-alert-open="${escape(alert.taskId)}"><strong>${escape(alert.associateName)} completed a task</strong><span>${escape(resolved(alert.title,memberName(context.uid)))} · ${escape(dateLabel(alert.date))}</span></button><button type="button" data-associate-alert-dismiss="${escape(alert.taskId)}" aria-label="Dismiss task update">×</button></article>`).join('')}${alerts.length>5?`<p>${alerts.length-5} more updates. Dismiss reviewed updates to see more.</p>`:''}`;
  }
  function watchAlerts(){
    const token=generation,ref=collection(env.db(),'teams',context.teamId,'associateAlerts',context.uid,'items');
    unsubscribers.push(onSnapshot(query(ref,where('readAt','==',0)),snapshot=>{
      if(!current(token))return;
      alerts=snapshot.docs.map(doc=>({...doc.data(),createdAt:doc.data().createdAt?.toMillis?.()||0})).sort((a,b)=>b.createdAt-a.createdAt);
      if(!snapshot.metadata.fromCache&&!snapshot.metadata.hasPendingWrites){
        const fresh=alerts.filter(alert=>!seenAlerts.has(alert.taskId));
        if(alertsReady&&fresh.length&&!document.hidden)env.toast(fresh.length===1?fresh[0].associateName+' completed '+resolved(fresh[0].title,memberName(context.uid)):fresh.length+' associate tasks completed');
        alerts.forEach(alert=>seenAlerts.add(alert.taskId));alertsReady=true;
      }
      renderAlerts();
    },error=>{if(current(token)){message='Associate updates could not load. Apply the updated Firestore rules and check connection.';renderControls()}}));
  }
  function stop(){
    generation++;context=null;syncBusy=false;ensureBusy=null;clearInterval(maintenanceTimer);maintenanceTimer=null;alerts=[];alertsReady=false;seenAlerts=new Set();renderAlerts();clearTimeout(retryTimer);retryTimer=null;ensureDate='';watchedRange='';profilesReady=false;
    unsubscribers.forEach(unsubscribe=>unsubscribe());rangeUnsubscribers.forEach(unsubscribe=>unsubscribe());unsubscribers=[];rangeUnsubscribers=[];reviewUnsubscribe?.();reviewUnsubscribe=null;reviewModel?.host?.remove();reviewModel=null;
    state={profiles:[],tasks:{},outbox:[],versions:{}};message='';editor=null;
    document.querySelectorAll('.associate-overlay').forEach(node=>node.remove());renderSchedule();renderControls();
  }
  async function start(){
    const next=env.context();
    if(!next.uid||!next.teamId||next.mode!=='team'){if(context)stop();return}
    if(context?.uid===next.uid&&context?.teamId===next.teamId){context=next;renderControls();return}
    stop();context=next;const token=generation;
    try{const cached=await readCache(cacheKey());if(!current(token))return;if(cached)state={profiles:cached.profiles||[],tasks:cached.tasks||{},outbox:(cached.outbox||[]).map(action=>({...action,durable:true})),versions:cached.versions||{}}}
    catch(error){if(current(token))message='Associate task storage could not be opened.'}
    if(!current(token))return;
    renderControls();renderSchedule();
    unsubscribers.push(onSnapshot(collection(env.db(),'teams',context.teamId,'associateProfiles'),snapshot=>{
      if(!current(token))return;
      if(snapshot.metadata.fromCache&&!snapshot.docs.length)return;
      state.profiles=snapshot.docs.map(doc=>({...doc.data(),associateUid:doc.id}));profilesReady=true;ensureDate='';
      if(message.startsWith('Associate profiles could not load.'))message='';
      store().catch(()=>{});renderControls();renderSchedule();renderOpenReview();ensureTasks().catch(()=>{});
    },error=>{if(current(token)){message='Associate profiles could not load. Check connection and associate rules.';renderControls();renderSchedule()}}));
    watchAlerts();maintenanceTimer=setInterval(()=>{ensureTasks().catch(()=>{});flush()},60000);
    flush();
    const requested=new URL(location.href).searchParams;
    if(requested.get('associate')){showReview(requested.get('associate'),/^\d{4}-\d{2}-\d{2}$/.test(requested.get('taskDate'))?requested.get('taskDate'):env.today());const url=new URL(location.href);url.searchParams.delete('associate');url.searchParams.delete('taskDate');history.replaceState(null,'',url)}
  }
  document.addEventListener('click',event=>{
    const config=event.target.closest('[data-associate-config]');if(config){showConfig(config.dataset.associateConfig);return}
    const open=event.target.closest('[data-associate-alert-open]');if(open){const alert=alerts.find(a=>a.taskId===open.dataset.associateAlertOpen);if(alert)showReview(alert.associateUid,alert.date);return}
    const dismiss=event.target.closest('[data-associate-alert-dismiss]');if(dismiss){dataStore().dismissAlert(dismiss.dataset.associateAlertDismiss).catch(error=>env.toast('Could not dismiss update. '+error.message));return}
    if(event.target.closest('[data-associate-close]')){event.target.closest('.associate-overlay').remove();editor=null;reviewUnsubscribe?.();reviewUnsubscribe=null;return}
    const toggle=event.target.closest('[data-associate-toggle]');if(toggle){const task=state.tasks[toggle.dataset.associateToggle];if(task)queueStatus(task.id,task.status==='completed'?'pending':'completed');return}
    const note=event.target.closest('[data-associate-note]');if(note){const task=state.tasks[note.dataset.associateNote],text=prompt('Completion note',task?.completionNote||'');if(task&&text!==null)queueStatus(task.id,'completed',text);return}
    const skip=event.target.closest('[data-associate-skip]');if(skip){const reason=prompt('Why is this task not required?');if(reason?.trim())queueStatus(skip.dataset.associateSkip,'not-required','',reason);return}
    const reopen=event.target.closest('[data-associate-reopen]');if(reopen){queueStatus(reopen.dataset.associateReopen,'pending');return}
    if(!editor)return;
    const form=event.target.closest('#associateConfigForm');if(!form)return;
    if(event.target.closest('[data-template-add]')){editor=readEditor();editor.tasks.push({id:id(),title:'',instructions:'',repeat:'working-days',days:[],timing:'next-working',active:true});renderEditor();return}
    if(event.target.closest('[data-template-starter]')){if(editor.tasks.length&&!confirm('Replace the unsaved checklist with the starter tasks?'))return;editor=readEditor();editor.tasks=starterTasks();renderEditor();return}
    const remove=event.target.closest('[data-template-remove]'),move=event.target.closest('[data-template-move]');
    if(remove||move){editor=readEditor();const row=(remove||move).closest('[data-template-id]'),index=editor.tasks.findIndex(task=>task.id===row.dataset.templateId);if(remove)editor.tasks.splice(index,1);else{const target=index+Number(move.dataset.templateMove);if(target>=0&&target<editor.tasks.length)[editor.tasks[index],editor.tasks[target]]=[editor.tasks[target],editor.tasks[index]]}renderEditor()}
  });
  document.addEventListener('submit',event=>{if(event.target.id==='associateConfigForm'){event.preventDefault();saveConfig(event.target)}});
  document.addEventListener('keydown',event=>{
    const overlay=document.querySelector('.associate-overlay');if(!overlay)return;
    if(event.key==='Escape'){overlay.querySelector('[data-associate-close]')?.click();return}
    if(event.key==='Tab'){const nodes=[...overlay.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])')];const first=nodes[0],last=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}
  });
  window.addEventListener('online',()=>{flush();ensureTasks().catch(()=>{})});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){flush();ensureTasks().catch(()=>{})}});
  return {start,stop,renderSchedule,attachSummary,closeSummary:()=>{reviewUnsubscribe?.();reviewUnsubscribe=null;reviewModel=null},memberButton:memberUid=>`<button class="team-member-action" type="button" data-associate-config="${escape(memberUid)}">Associate profile</button>`};
}
