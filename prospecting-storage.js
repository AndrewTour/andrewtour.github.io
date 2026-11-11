// AGNT v1.46.43
// Versioned, immutable, UID-local snapshots. Publish the head only after every
// chunk and the pre-migration recovery manifest have been acknowledged.
export const STORAGE_VERSION=3;
const FIELDS=['prospects','interactions','marketPulseEvents','marketPulseHistory','marketPulseLedger'];
const CHUNK_BYTES=180000;
const encoder=new TextEncoder();
export async function digest(text){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(text)))].map(n=>n.toString(16).padStart(2,'0')).join('')}
export function splitText(text){
  const result=[];let part='',size=0;
  for(const char of text){const point=char.codePointAt(0),bytes=point<=0x7f?1:point<=0x7ff?2:point<=0xffff?3:4;if(size+bytes>CHUNK_BYTES){result.push(part);part='';size=0}part+=char;size+=bytes}
  if(part)result.push(part);return result;
}
export async function encodeSnapshot(data){
  const chunks=[],fields={};
  for(const field of FIELDS){
    if(field==='marketPulseLedger'&&data[field]===undefined)data={...data,marketPulseLedger:[]};
    if(!Array.isArray(data[field]))throw new Error('Invalid prospecting array: '+field);
    fields[field]=[];
    for(const text of splitText(JSON.stringify(data[field]))){const id='chunk_'+await digest(text);fields[field].push(id);chunks.push({id,text})}
  }
  const manifest={storageVersion:STORAGE_VERSION,fields};
  if(encoder.encode(JSON.stringify(manifest)).length>500000)throw new Error('Snapshot index is too large. Existing cloud data has been retained.');
  return{manifest,chunks};
}
export async function decodeSnapshot(data,read,isCurrent=()=>true,fields=FIELDS){
  if(data.storageVersion===undefined)return data;
  if(![2,STORAGE_VERSION].includes(data.storageVersion))throw new Error('This data needs a newer AGNT version.');
  const result={...data};
  for(const field of fields){
    if(field==='marketPulseLedger'&&data.storageVersion===2){result[field]=[];continue}
    const ids=data.fields?.[field];if(!Array.isArray(ids)||!ids.length)throw new Error('Incomplete snapshot index');
    const parts=[];
    for(const id of ids){
      if(!isCurrent())throw new Error('Account changed during sync');
      if(typeof id!=='string'||!/^chunk_[a-f0-9]{64}$/.test(id))throw new Error('Invalid snapshot reference');
      const chunk=await read(id);if(!chunk||typeof chunk.text!=='string'||'chunk_'+await digest(chunk.text)!==id)throw new Error('Snapshot integrity check failed. Existing local data has been retained.');
      parts.push(chunk.text);
    }
    const rows=JSON.parse(parts.join(''));if(!Array.isArray(rows))throw new Error('Invalid snapshot content');result[field]=rows;
  }
  return result;
}
export async function publishSnapshot(data,previous,io,isCurrent=()=>true){
  const check=()=>{if(!isCurrent())throw new Error('Account changed during sync')};
  const encoded=await encodeSnapshot(data);check();
  // Retain a complete, independently readable recovery snapshot before migration.
  if(previous&&previous.storageVersion===undefined){
    const legacy={};for(const field of FIELDS)legacy[field]=previous[field]||[];
    const backup=await encodeSnapshot(legacy);
    for(const chunk of backup.chunks){check();await io.writeChunk(chunk)}
    check();await io.writeRecovery(backup.manifest);
  }
  if(previous?.storageVersion){check();await io.writeRecovery(previous)}
  for(const chunk of encoded.chunks){check();await io.writeChunk(chunk)}
  check();await io.commitHead({...encoded.manifest,clientUpdatedAt:data.clientUpdatedAt},previous);return encoded.manifest;
}

// Durable device checkpoints avoid the small localStorage quota as history grows.
// Keys are exact Firebase UIDs; an account switch never changes a queued key.
let deviceDatabase;
const deviceWrites=new Map();
function openDeviceDatabase(){
  if(!deviceDatabase)deviceDatabase=new Promise((resolve,reject)=>{
    const request=indexedDB.open('agnt-prospecting-snapshots-v2',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('snapshots');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(new Error('Device archive is blocked'));
  }).catch(error=>{deviceDatabase=null;throw error});
  return deviceDatabase;
}
export function saveDeviceSnapshot(userId,data){
  const snapshot=structuredClone(data);
  const previous=deviceWrites.get(userId)||Promise.resolve();
  const saving=previous.catch(()=>{}).then(async()=>{
    const db=await openDeviceDatabase();
    await new Promise((resolve,reject)=>{const transaction=db.transaction('snapshots','readwrite');transaction.objectStore('snapshots').put(snapshot,userId);transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error||new Error('Device archive write interrupted'))});
  });
  deviceWrites.set(userId,saving);return saving;
}
export async function loadDeviceSnapshot(userId){
  await (deviceWrites.get(userId)||Promise.resolve());
  const db=await openDeviceDatabase();
  return new Promise((resolve,reject)=>{const transaction=db.transaction('snapshots','readonly'),request=transaction.objectStore('snapshots').get(userId);transaction.oncomplete=()=>resolve(request.result||null);transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error||new Error('Device archive read interrupted'))});
}
