// AGNT v1.46.37 — diagnostic state only; no record data or Firebase access.
const CHANNELS=new Set(['days','profile','prospecting','leaderboard','team-leaderboard','other']);
const CODES=new Set(['Error','TypeError','ReferenceError','RangeError','SyntaxError','SecurityError','QuotaExceededError','AbortError','permission-denied','unavailable','failed-precondition','resource-exhausted','aborted','deadline-exceeded','unauthenticated','invalid-argument','cancelled','not-found','already-exists','internal','data-loss','unimplemented','unknown']);
const PHASES=new Set(['queued','retention','chunks','recovery','commit','decode','listener','server-check']);
export function safeSyncError(error){
 const candidate=String(error?.code||error?.name||'Error').replace(/^firestore\//,'');
 const message=String(error?.message||'');
 const reason=/Invalid prospecting array/.test(message)?'missing-required-list':/integrity|Incomplete snapshot|snapshot reference|snapshot content/i.test(message)?'archive-integrity':/maintenance/i.test(message)?'archive-maintenance':/Cloud data changed/.test(message)?'concurrent-cloud-change':/Account changed/.test(message)?'account-changed':/newer AGNT/.test(message)?'newer-app-required':/too large/i.test(message)?'snapshot-size':/timed out/i.test(message)?'check-timeout':'unspecified';
 return{code:CODES.has(candidate)?candidate:'unknown',reason};
}
export function createSyncHealth({now=()=>Date.now(),limit=160}={}){
 let events=[],channels={},operations=new Map(),sequence=0,lastCheck=null;
 const channelName=value=>CHANNELS.has(value)?value:'other';
 function channel(value){const key=channelName(value);return channels[key]||(channels[key]={lastReadAt:0,lastWriteAt:0,readError:null,writeError:null})}
 function log(event,scope,details={}){events.push({at:now(),event,channel:channelName(scope),...details});events=events.slice(-limit)}
 return{
  reset(){events=[];channels={};operations.clear();lastCheck=null;sequence=0},
  start(scope){scope=channelName(scope);const id=++sequence;operations.set(id,{channel:scope,startedAt:now(),phase:'queued'});log('write-start',scope);return id},
  phase(id,value){const operation=operations.get(id);if(operation&&PHASES.has(value)&&operation.phase!==value){operation.phase=value;log('write-phase',operation.channel,{phase:value})}},
  finish(id,error=null){const operation=operations.get(id);if(!operation)return;operations.delete(id);const entry=channel(operation.channel),durationMs=Math.max(0,now()-operation.startedAt);if(error){entry.writeError={...safeSyncError(error),at:now(),phase:operation.phase};log('write-failed',operation.channel,{...entry.writeError,durationMs})}else{entry.lastWriteAt=now();entry.writeError=null;log('write-confirmed',operation.channel,{durationMs})}},
  read(scope,{fromCache=false,hasPendingWrites=false,probe=false}={}){if(fromCache||hasPendingWrites)return;const entry=channel(scope);entry.lastReadAt=now();if(!probe)entry.readError=null;log(probe?'check-server-read':'server-read',scope)},
  readFailed(scope,error){const entry=channel(scope);entry.readError={...safeSyncError(error),at:now()};log('read-failed',scope,entry.readError)},
  headConflict(fields){const allowed=new Set(['storageVersion','fields','clientUpdatedAt','updatedAt','maintenance','lastArchiveCleanupAt','prospects','interactions','marketPulseEvents','marketPulseHistory','marketPulseLedger','existence','other']);log('head-conflict','prospecting',{changedFields:[...new Set(fields.filter(key=>allowed.has(key)))]})},
  headOrderNormalised(){log('head-key-order-normalised','prospecting')},
  retry(scope,delayMs){log('retry-scheduled',scope,{delayMs:Math.max(0,Number(delayMs)||0)})},
  checked(result){lastCheck={at:now(),result:['verified','pending','failed','mismatch'].includes(result)?result:'failed'};log('check-'+lastCheck.result,'other')},
  snapshot(context={}){
   const active=[...operations.values()].map(row=>({...row,ageMs:Math.max(0,now()-row.startedAt)}));
   const errors=Object.values(channels).some(row=>row.readError||row.writeError);
   const pending=Boolean(context.pendingOperations||context.pendingDays||context.prospectingDirty||context.prospectingQueued||active.length);
   const verified=['days','profile','prospecting'].every(key=>channels[key]?.lastReadAt>0);
   const lastServerAt=Math.min(...['days','profile','prospecting'].map(key=>channels[key]?.lastReadAt||0));
   const status=!context.signedIn?'device-only':!context.online?'offline':errors||context.syncError||context.deviceSaveIssue?'error':lastCheck?.result==='mismatch'?'mismatch':pending?'pending':!verified||!context.archiveReady?'unverified':now()-lastServerAt>120000?'last-verified':'verified';
   return{status,context:{signedIn:Boolean(context.signedIn),online:Boolean(context.online),pendingOperations:Number(context.pendingOperations)||0,pendingDays:Number(context.pendingDays)||0,prospectingDirty:Boolean(context.prospectingDirty),prospectingQueued:Boolean(context.prospectingQueued),archiveReady:Boolean(context.archiveReady),deviceSaveIssue:Boolean(context.deviceSaveIssue),syncError:Boolean(context.syncError)},channels:structuredClone(channels),activeOperations:active,lastCheck:lastCheck?{...lastCheck}:null,events:events.map(row=>({...row}))};
  }
 };
}
