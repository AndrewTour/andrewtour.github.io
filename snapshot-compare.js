// AGNT v1.46.32 — order-independent comparisons; no stored data is modified.
export function stableSnapshotString(value){
 function canonical(item){
  if(item===null||typeof item!=='object')return item;
  // Respect the SDK's JSON representation of timestamps before sorting maps.
  if(typeof item.toJSON==='function')return canonical(item.toJSON());
  if(Array.isArray(item))return item.map(canonical);
  const result=Object.create(null);
  for(const key of Object.keys(item).sort())result[key]=canonical(item[key]);
  return result;
 }
 return JSON.stringify(canonical(value));
}
const HEAD_FIELDS=new Set(['storageVersion','fields','clientUpdatedAt','updatedAt','maintenance','lastArchiveCleanupAt','prospects','interactions','marketPulseEvents','marketPulseHistory','marketPulseLedger']);
export function compareSnapshotHeads(previous,current){
 const equal=stableSnapshotString(previous)===stableSnapshotString(current);
 const keys=new Set([...Object.keys(previous||{}),...Object.keys(current||{})]);
 const changedFields=[...keys].filter(key=>stableSnapshotString(previous?.[key])!==stableSnapshotString(current?.[key])).map(key=>HEAD_FIELDS.has(key)?key:'other');
 if((previous===null)!==(current===null))changedFields.push('existence');
 return{equal,rawEqual:JSON.stringify(previous)===JSON.stringify(current),changedFields:[...new Set(changedFields)].sort()};
}
