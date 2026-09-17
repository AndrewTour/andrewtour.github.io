// Dependency-free runtime checks; no claim of browser or device testing.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/app.js','utf8');
function extract(text,name){const re=new RegExp('^(?:async )?function '+name+'\\(','m'),start=text.search(re);assert(start>=0,name);const rest=text.slice(start),end=rest.slice(1).search(/^(?:async )?function /m);return end<0?rest:rest.slice(0,end+1)}
(async()=>{
  // Hidden screens must not build DOM or scan the database.
  const hidden=vm.createContext({$:()=>({classList:{contains:()=>false}})});
  for(const name of ['renderProspecting','renderTimeline','renderMarketPulse']){vm.runInContext(extract(source,name),hidden);hidden[name]()}
  // A selected screen still renders. Market matches are reused only for this render.
  let calls=0;const nodes=new Map(),events=Array.from({length:8},(_,i)=>({id:String(i),createdAt:i,address:'Road'}));
  const visible=vm.createContext({$:id=>{if(!nodes.has(id))nodes.set(id,{classList:{contains:()=>true}});return nodes.get(id)},prospectSection:'market',renderMarketPulseReview(){},marketPulseEvents:events,normaliseMarketPulseEvents:x=>x,marketMatches:()=>{calls++;return[]},hotSpottingPriority:()=>({score:1,label:'Low'}),marketSessionProgress:()=>({total:0,workedIds:new Set(),complete:true,called:0,sms:0}),relativeEventRecency:()=>({label:'Today'}),marketPulseBulkSmsHasMobile:()=>false,marketEventDetailHtml:()=>'',formatEstimatedTime:()=>'',estimatedMinutes:()=>0,marketPulseCardHeadingMarkup:()=>'',escapeHtml:x=>x});
  vm.runInContext(extract(source,'renderMarketPulse'),visible);visible.renderMarketPulse();assert.equal(calls,events.length);assert(nodes.get('#marketPulseList').innerHTML.includes('Completed'));
  visible.renderMarketPulse();assert.equal(calls,events.length*2);
  // Coalesce concurrent same-account startup, and permit retry after failure.
  let starts=0;const completions=[];
  const startup=vm.createContext({startCloudSession:()=>{starts++;return new Promise((resolve,reject)=>completions.push({resolve,reject}))}});
  vm.runInContext('let cloudStartPending=null;\n'+extract(source,'startCloud'),startup);
  const a=startup.startCloud({uid:'a'}),same=startup.startCloud({uid:'a'});assert.equal(a,same);assert.equal(starts,1);
  const b=startup.startCloud({uid:'b'});assert.equal(starts,2);completions[0].resolve();await a;assert.equal(startup.startCloud({uid:'b'}),b);
  completions[1].reject(Error('network'));await assert.rejects(b);const retry=startup.startCloud({uid:'b'});assert.equal(starts,3);completions[2].resolve();await retry;
  // Match membership and ordering against the supplied baseline on a large fixture.
  if(process.argv[2]){
    const baseline=fs.readFileSync(process.argv[2],'utf8');let scans=0;
    const contacts=Array.from({length:1500},(_,i)=>({id:String(i),name:'Contact '+i,phone:i%9?'0400000000':'',street:i%3?'street':'elsewhere',rank:i%7,lastContact:''}));
    const interactions=Array.from({length:5000},(_,i)=>({prospectId:String(i%1500),outcome:i%19===0?'Do not contact':'Connected',at:i}));
    const environment={prospectInteractions:interactions,marketStreetKey:()=> 'street',activeProspects:()=>contacts,primaryProspectPhone:p=>p.phone,prospectMarketKey:p=>p.street,interactionsFor:id=>interactions.filter(x=>{scans++;return x.prospectId===id}).sort((a,b)=>b.at-a.at),sellerMarketSimilarity:p=>({ratio:p.rank}),marketTriggeredFollowUp:()=>false,prospectDueRank:p=>p.rank};
    const old=vm.createContext({...environment}),updated=vm.createContext({...environment});
    vm.runInContext(extract(baseline,'marketMatches'),old);vm.runInContext(extract(source,'marketMatches'),updated);
    const expected=Array.from(old.marketMatches({}),p=>p.id),oldScans=scans;scans=0;
    assert.deepEqual(Array.from(updated.marketMatches({}),p=>p.id),expected);assert.equal(scans,0);
    console.log('PASS: identical match ordering; baseline interaction comparisons:',oldScans,'; new single-pass interaction records:',interactions.length);
  }
  console.log('PASS: hidden-screen rendering guards, visible MarketPulse rendering, render-local match reuse, startup coalescing and failure retry.');
})().catch(error=>{console.error(error);process.exitCode=1});
