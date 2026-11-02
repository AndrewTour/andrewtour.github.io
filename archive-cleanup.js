// AGNT v1.46.34
export const RECOVERY_DAYS=30;
export function archiveCleanupPlan(head,documents,now=Date.now()){
  if(head?.storageVersion!==3)throw new Error('Retention snapshot is not committed');
  const cutoff=now-RECOVERY_DAYS*86400000,keep=new Set(),expired=[];
  function retain(manifest){
    if(!manifest.fields||typeof manifest.fields!=='object')throw new Error('Invalid recovery index. Cleanup stopped.');
    for(const ids of Object.values(manifest.fields)){
      if(!Array.isArray(ids)||!ids.length)throw new Error('Invalid recovery index. Cleanup stopped.');
      for(const id of ids){if(!/^chunk_[a-f0-9]{64}$/.test(id))throw new Error('Invalid archive reference');keep.add(id)}
    }
  }
  retain(head);
  for(const item of documents){
    if(!item.id.startsWith('recovery_'))continue;
    const created=Number(item.createdAt)||0;
    if(created>0&&created<=cutoff)expired.push(item.id);else retain(item);
  }
  const chunks=documents.filter(item=>/^chunk_[a-f0-9]{64}$/.test(item.id)&&Number(item.createdAt)>0&&Number(item.createdAt)<=cutoff&&!keep.has(item.id)).map(item=>item.id);
  return{expiredManifests:expired,chunks,protectedChunks:[...keep]};
}
