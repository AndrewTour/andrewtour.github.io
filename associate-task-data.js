// AGNT v1.46.48 — shared, dependency-free associate recurrence rules.
const clean=(value,max)=>String(value??'').trim().slice(0,max);
function validDate(value){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;
  const date=new Date(value+'T12:00:00Z');
  return Number.isFinite(+date)&&date.toISOString().slice(0,10)===value;
}
function addDays(key,count){const date=new Date(key+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+count);return date.toISOString().slice(0,10)}
function weekday(key){return new Date(key+'T12:00:00Z').getUTCDay()}
function sydneyToday(now=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const get=type=>parts.find(p=>p.type===type).value;return `${get('year')}-${get('month')}-${get('day')}`}
function dayList(values){return [...new Set((Array.isArray(values)?values:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<=6))].sort()}
function normaliseConfig(raw){
  if(!raw||typeof raw.enabled!=='boolean')throw Error('Choose associate status.');
  const workingDays=dayList(raw.workingDays);
  if(raw.enabled&&!workingDays.length)throw Error('Choose at least one working day.');
  if(!Array.isArray(raw.tasks)||raw.tasks.length>50)throw Error('Use up to 50 recurring tasks.');
  const seen=new Set();
  const tasks=raw.tasks.map((task,index)=>{
    const id=clean(task.id,80),title=clean(task.title,160),days=dayList(task.days);
    if(!/^[A-Za-z0-9_-]{1,80}$/.test(id)||seen.has(id)||!title)throw Error('Each task needs a unique ID and a name.');
    seen.add(id);
    if(task.repeat!=='working-days'&&task.repeat!=='weekdays')throw Error('Choose repeat days.');
    if(task.repeat==='weekdays'&&!days.length)throw Error('Choose days for '+title+'.');
    if(!['next-working','fixed'].includes(task.timing))throw Error('Choose a timing rule.');
    return {id,order:index,title,instructions:clean(task.instructions,1000),active:task.active!==false,repeat:task.repeat,days,timing:task.timing};
  });
  return {enabled:raw.enabled,leadUid:clean(raw.leadUid,128),workingDays,tasks};
}
function taskId(associateUid,date,templateId){return associateUid+'~'+date+'~'+templateId}
function instancesForDate(config,date,associateUid,associateName,leadName){
  if(!config.enabled)return [];
  const work=config.workingDays,works=work.includes(weekday(date));
  return config.tasks.filter(task=>task.active&&(task.repeat==='working-days'?works:task.days.includes(weekday(date)))).map(task=>{
    let due=date;
    if(!works&&task.timing==='next-working'){
      do{due=addDays(due,1)}while(!work.includes(weekday(due)));
    }
    const fallback=!works&&task.timing==='fixed';
    return {id:taskId(associateUid,date,task.id),associateUid,associateName,leadUid:config.leadUid,leadName,assignedToUid:fallback?config.leadUid:associateUid,templateId:task.id,order:task.order,title:task.title,instructions:task.instructions,originalDate:date,date:due,fallback,configDate:config.effectiveDate,originalAtMs:Date.parse(date+'T12:00:00Z'),dueAtMs:Date.parse(due+'T12:00:00Z'),everCompleted:false,lastActionId:'',status:'pending',completedAt:0,completedByUid:'',completedByName:'',completionNote:'',notRequiredReason:'',version:0};
  });
}
function transitionTask(task,action,actor,now){
  if(!['pending','completed','not-required'].includes(action.status))throw Error('Choose a valid status.');
  if(action.status==='not-required'&&!actor.manager)throw Error('Only the supervising agent or team leader can mark work not required.');
  const reason=clean(action.reason,500);
  if(action.status==='not-required'&&!reason)throw Error('Add a reason.');
  return {...task,status:action.status,completedAt:action.status==='completed'?now:0,completedByUid:action.status==='completed'?actor.uid:'',completedByName:action.status==='completed'?actor.name:'',completionNote:clean(action.note,1000),notRequiredReason:action.status==='not-required'?reason:'',version:task.version+1,updatedAt:now};
}
export {clean,validDate,addDays,weekday,sydneyToday,normaliseConfig,taskId,instancesForDate,transitionTask};
