// AGNT v1.46.30
// Permanent summaries contain only an irreversible event fingerprint and small
// reporting dimensions. Addresses, prices, agents and descriptions expire.
import {digest} from './prospecting-storage.js';
export function retentionCutoff(today){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(today))throw new Error('Invalid retention date');
  const [year,month,day]=today.split('-').map(Number),last=new Date(Date.UTC(year-1,month,0)).getUTCDate();
  return `${year-1}-${String(month).padStart(2,'0')}-${String(Math.min(day,last)).padStart(2,'0')}`;
}
export function eventKind(event){
  const text=String(event.eventType||'').trim().toLowerCase();
  if(['just listed','listed','new listing'].includes(text))return'listed';
  if(text==='sold')return'sold';
  if(['price update','price changed','price change','price reduction'].includes(text))return'price';
  if(text==='withdrawn')return'withdrawn';
  if(text==='under offer')return'under-offer';
  if(text==='auction result')return'auction';return'other';
}
function safeText(value,limit){return String(value||'').trim().slice(0,limit)}
export function normaliseLedger(entries=[]){
  const map=new Map();for(const row of Array.isArray(entries)?entries:[]){
    if(!row||!/^event_[a-f0-9]{64}$/.test(row.id)||!/^\d{4}-(0[1-9]|1[0-2])$/.test(row.month))continue;
    const entry={id:row.id,month:row.month,kind:['listed','sold','price','withdrawn','under-offer','auction','other'].includes(row.kind)?row.kind:'other',suburb:safeText(row.suburb,100).toLowerCase(),propertyType:safeText(row.propertyType,40).toLowerCase()||'unknown'};
    // Deterministic convergence across devices and backup imports.
    if(!map.has(entry.id)||JSON.stringify(entry)<JSON.stringify(map.get(entry.id)))map.set(entry.id,entry);
  }return [...map.values()].sort((a,b)=>a.id.localeCompare(b.id));
}
export function retentionPropertyType(event={}){
  const text=String(event.propertyDetails||'').toLowerCase();
  if(/\bduplex\b|\bsemi.detached\b/.test(text))return'duplex';
  if(/\btownhouse\b/.test(text))return'townhouse';
  if(/\bvilla\b/.test(text))return'villa';
  if(/\b(unit|apartment|flat)\b/.test(text))return'unit';
  if(/\bhouse\b/.test(text))return'house';
  if(/\b(vacant land|land)\b/.test(text))return'land';return'unknown';
}
export async function retainMarketData({history=[],events=[],ledger=[],today,propertyType=retentionPropertyType,isCurrent=()=>true}){
  const cutoff=retentionCutoff(today),known=new Map(normaliseLedger(ledger).map(row=>[row.id,row]));
  const candidates=[...history,...events];
  for(const event of [...candidates])for(const id of Array.isArray(event?.historyEventIds)?event.historyEventIds:[]){
    const parts=String(id).split('|');
    if(parts.length===4&&/^\d{4}-\d{2}-\d{2}$/.test(parts[0]))candidates.push({id,receivedDate:parts[0],eventType:parts[1],suburb:parts[3]});
  }
  for(const event of candidates){
    if(!isCurrent())throw new Error('Account changed during retention');
    if(!event?.id||!/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(event.receivedDate||''))continue;
    const id='event_'+await digest(String(event.id));
    if(!known.has(id))known.set(id,{id,month:event.receivedDate.slice(0,7),kind:eventKind(event),suburb:safeText(event.suburb,100).toLowerCase(),propertyType:safeText(propertyType(event),40).toLowerCase()||'unknown'});
  }
  if(!isCurrent())throw new Error('Account changed during retention');
  return{history:history.filter(row=>String(row.receivedDate||'')>=cutoff),events:events.filter(row=>String(row.receivedDate||'')>=cutoff),ledger:normaliseLedger([...known.values()]),cutoff};
}
export function marketTotals(ledger,{suburb='',propertyType='',month=''}={}){
  const totals={listed:0,sold:0,price:0,withdrawn:0,'under-offer':0,auction:0,other:0};
  for(const row of normaliseLedger(ledger))if((!suburb||row.suburb===suburb.toLowerCase())&&(!propertyType||row.propertyType===propertyType)&&(!month||row.month===month))totals[row.kind]++;
  return totals;
}
