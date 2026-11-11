import {collection,doc,getDocsFromServer,getDocFromServer,runTransaction,serverTimestamp,Timestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import {addDays,normaliseConfig,instancesForDate,transitionTask} from './associate-task-data.js';
const error=(code,message)=>Object.assign(new Error(message),{code});
export const normaliseAssociateTask=data=>({...data,completedAt:data.completedAt?.toMillis?.()||Number(data.completedAt)||0,updatedAt:data.updatedAt?.toMillis?.()||Number(data.updatedAt)||0});
export function createAssociateStore({db,uid,teamId,today}){
  const team=doc(db,'teams',teamId),profileRef=memberUid=>doc(team,'associateProfiles',memberUid),memberRef=memberUid=>doc(team,'members',memberUid);
  const taskRef=id=>doc(team,'associateTasks',id),alertRef=(lead,id)=>doc(team,'associateAlerts',lead,'items',id);
  const name=member=>member.data()?.name||'Agent';
  async function saveProfile({memberUid,config:raw,expectedVersion}){
    const config=normaliseConfig(raw),day=today();
    if(!config.leadUid||config.leadUid===memberUid)throw error('invalid-argument','Choose a supervising agent.');
    return runTransaction(db,async tx=>{
      const ref=profileRef(memberUid),[previous,member,lead,teamDoc,leadProfile]=await Promise.all([tx.get(ref),tx.get(memberRef(memberUid)),tx.get(memberRef(config.leadUid)),tx.get(team),tx.get(profileRef(config.leadUid))]);
      if(!member.exists()||!lead.exists())throw error('failed-precondition','Choose active team members.');
      if(teamDoc.data().ownerUid===memberUid)throw error('invalid-argument','The team owner remains a lead agent.');
      if(config.enabled&&leadProfile.exists()&&leadProfile.data().enabled)throw error('invalid-argument','The supervising agent must be a lead agent.');
      const old=previous.data();
      if(Number(old?.version||0)!==Number(expectedVersion||0))throw error('aborted','This profile changed on another device. Reopen it before saving.');
      const effectiveDate=previous.exists()?addDays(day,1):day,version=Number(old?.version||0)+1;
      const oldVersionRef=previous.exists()?doc(ref,'versions',old.effectiveDate):null;
      if(oldVersionRef&&old.effectiveDate!==effectiveDate)await tx.get(oldVersionRef);
      const currentConfig=old?.effectiveDate>day?old.currentConfig:old?{enabled:old.enabled,leadUid:old.leadUid,workingDays:old.workingDays}:null;
      const profile={...config,associateUid:memberUid,associateName:name(member),version,effectiveDate,startDate:old?.startDate||day,generatedThrough:old?.generatedThrough||'',currentConfig,updatedAt:serverTimestamp(),updatedByUid:uid};
      if(old?.generatedAt)profile.generatedAt=old.generatedAt;
      if(oldVersionRef&&old.effectiveDate!==effectiveDate)tx.update(oldVersionRef,{until:effectiveDate});
      tx.set(ref,profile);
      tx.set(doc(ref,'versions',effectiveDate),{...config,version,effectiveDate,until:'9999-12-31'});
      return {effectiveDate,version};
    });
  }
  async function generateDate(profile,versions,date){
    const selected=versions.filter(v=>v.effectiveDate<=date&&date<v.until).sort((a,b)=>a.effectiveDate.localeCompare(b.effectiveDate)||a.version-b.version).at(-1);
    if(!selected)return {tasks:[],generatedThrough:profile.generatedThrough};
    const ref=profileRef(profile.associateUid);
    return runTransaction(db,async tx=>{
      const [live,version,member,lead]=await Promise.all([tx.get(ref),tx.get(doc(ref,'versions',selected.effectiveDate)),tx.get(memberRef(profile.associateUid)),tx.get(memberRef(selected.leadUid))]);
      if(!live.exists()||!member.exists()||!lead.exists())throw error('failed-precondition','An associate or supervising agent is no longer in this team.');
      if(live.data().version!==profile.version||version.data()?.version!==selected.version)throw error('aborted','The recurring checklist changed. Reconnect to refresh it.');
      const tasks=instancesForDate(selected,date,profile.associateUid,name(member),name(lead)).map(task=>{const {originalAtMs,dueAtMs,...saved}=task;return {...saved,originalAt:Timestamp.fromMillis(originalAtMs),dueAt:Timestamp.fromMillis(dueAtMs),createdByUid:uid,createdAt:serverTimestamp(),updatedAt:serverTimestamp()}});
      const existing=await Promise.all(tasks.map(task=>tx.get(taskRef(task.id))));
      tasks.forEach((task,index)=>{if(!existing[index].exists())tx.set(taskRef(task.id),task)});
      const old=live.data(),next=old.generatedThrough?addDays(old.generatedThrough,1):old.startDate;
      if(date===next)tx.update(ref,{generatedThrough:date,generatedAt:serverTimestamp()});
      return {generatedThrough:date===next?date:old.generatedThrough,tasks:tasks.map((task,index)=>existing[index].exists()?normaliseAssociateTask({...existing[index].data(),id:existing[index].id}):normaliseAssociateTask({...task,createdAt:Date.now(),updatedAt:Date.now()}))};
    });
  }
  async function ensureTasks(){
    const [teamDoc,all]=await Promise.all([runTransaction(db,tx=>tx.get(team)),getDocsFromServer(collection(team,'associateProfiles'))]);
    const profiles=all.docs.map(d=>({...d.data(),associateUid:d.id})),versions={},tasks=[];let catchupPending=false;
    for(const profile of profiles.filter(p=>teamDoc.data().ownerUid===uid||p.associateUid===uid||p.leadUid===uid||p.currentConfig?.leadUid===uid)){
      const saved=await getDocsFromServer(collection(profileRef(profile.associateUid),'versions'));
      const history=saved.docs.map(d=>({...d.data(),until:d.data().until||'9999-12-31'}));versions[profile.associateUid]=history;
      // Publish today's checklist first, then fill older missing dates in bounded batches.
      const current=await generateDate(profile,history,today());tasks.push(...current.tasks);profile.generatedThrough=current.generatedThrough;
      let date=profile.generatedThrough?addDays(profile.generatedThrough,1):profile.startDate;
      for(let count=0;date&&date<=today()&&count<31;count++,date=addDays(date,1)){
        const result=await generateDate(profile,history,date);tasks.push(...result.tasks);profile.generatedThrough=result.generatedThrough;
      }
      if(date&&date<=today())catchupPending=true;
    }
    return {profiles,versions,tasks,catchupPending};
  }
  async function setTaskStatus(action){
    return runTransaction(db,async tx=>{
      const ref=taskRef(action.taskId),[snapshot,actor,teamDoc]=await Promise.all([tx.get(ref),tx.get(memberRef(uid)),tx.get(team)]);
      if(!snapshot.exists())throw error('not-found','Task could not be found. Reconnect to load the checklist.');
      if(!actor.exists())throw error('permission-denied','Active team membership is required.');
      const task=snapshot.data();
      if(task.lastActionId===action.actionId)return normaliseAssociateTask(task);
      if(task.version!==action.expectedVersion)throw error('aborted','Task changed on another device. Review its latest status.');
      if(task.date>today())throw error('failed-precondition','This task is scheduled for a future day.');
      const manager=teamDoc.data().ownerUid===uid||task.leadUid===uid;
      if(!manager&&task.assignedToUid!==uid)throw error('permission-denied','This task belongs to another agent.');
      const alert=alertRef(task.leadUid,task.id),notify=action.status==='completed'&&!task.everCompleted&&task.associateUid===uid&&task.leadUid!==uid;
      const existing=notify?await tx.get(alert):null;
      const updated=transitionTask(task,action,{uid,name:name(actor),manager},Date.now());
      updated.everCompleted=Boolean(task.everCompleted||action.status==='completed');updated.lastActionId=action.actionId;updated.updatedAt=serverTimestamp();
      updated.completedAt=action.status==='completed'?serverTimestamp():0;
      tx.update(ref,{status:updated.status,completionNote:updated.completionNote,notRequiredReason:updated.notRequiredReason,completedAt:updated.completedAt,completedByUid:updated.completedByUid,completedByName:updated.completedByName,version:updated.version,everCompleted:updated.everCompleted,lastActionId:updated.lastActionId,updatedAt:updated.updatedAt});
      if(notify&&!existing.exists())tx.set(alert,{taskId:task.id,leadUid:task.leadUid,associateUid:task.associateUid,associateName:task.associateName,title:task.title,date:task.date,createdAt:serverTimestamp(),readAt:0});
      return normaliseAssociateTask({...updated,completedAt:action.status==='completed'?Date.now():0,updatedAt:Date.now()});
    });
  }
  async function dismissAlert(taskId){
    return runTransaction(db,async tx=>{const ref=alertRef(uid,taskId),saved=await tx.get(ref);if(saved.exists()&&saved.data().readAt===0)tx.update(ref,{readAt:serverTimestamp()})});
  }
  return {saveProfile,ensureTasks,setTaskStatus,dismissAlert,readTask:async id=>{const snapshot=await getDocFromServer(taskRef(id));return snapshot.exists()?normaliseAssociateTask({...snapshot.data(),id:snapshot.id}):null}};
}
