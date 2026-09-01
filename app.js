import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, setDoc, getDoc, getDocs, query, where, writeBatch, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const DEFAULT_WORK_DAYS=[1,2,4,5];
let workDays=[...DEFAULT_WORK_DAYS];
let offDayReviewDismissedThisSession=false;
const CALL_PLAN=[[9,'Active Buyer Calls','Hot buyers, offers, contracts and second inspections'],[10,'Past OFI Calls','Recent attendees, missed callbacks and buyer feedback'],[11,'Pipeline Calls','Current sellers, warm leads and next-step conversations'],[12,'Past Appraisals','Owners with a likely 3–12 month move'],[13,'Database Reconnects','Long-term owners and dormant contacts'],[14,'Just Listed & Coming Soon','Buyers, neighbours and local owner awareness'],[15,'Just Sold Calls','Result calls and nearby owner follow-up'],[16,'Priority Follow-Up','Offers, appointments and tomorrow’s pipeline']];
const DEFAULTS={calls:50,connects:25,data:10,weeklyKnock:240};
const MORNING_LIVE_UPDATE_MS=4000;
const MORNING_LIVE_UPDATE_CUTOFF_HOUR=11;
const SELLING_TIMEFRAMES=['Now','1–3 months','6–12 months','12 months+'];
const BUYER_STAGES=['Looking','Inspecting','Negotiating','Purchased'];
const BUYER_PROPERTY_TYPES=['House','Duplex','Townhouse','Unit','Land'];
const BUYER_FEATURES=['Granny Flat','Pool','Ensuite','Study','Single Level','Renovated','Development','Large Yard'];
const BUYER_POSITION_TAGS=['Buyer Seller','Upsizing','Downsizing','Builder','Investor','First Home Buyer'];
const BUYER_BUDGET_MAX=5000000;
const BUYER_MATCH_STATUSES=new Set(['active','attempted','engaged','follow-up','inspection','reviewed','contacted','dismissed','superseded']);
const BUYER_MATCH_OUTCOMES=new Set(['interested','details-sent','inspection','maybe','not-suitable','no-answer']);
const BUYER_MATCH_REASONS=new Set(['price','property-type','location','configuration','condition','other']);
const CONTACT_DRAFT_SCHEMA_VERSION=1;
const SYDNEY_SUBURBS=["Abbotsbury","Abbotsford","Acacia Gardens","Agnes Banks","Airds","Alexandria","Alfords Point","Allambie Heights","Allawah","Ambarvale","Angus","Annandale","Annangrove","Arcadia","Arncliffe","Arndell Park","Artarmon","Ashbury","Ashcroft","Ashfield","Asquith","Auburn","Austral","Avalon Beach","Badgerys Creek","Balgowlah","Balgowlah Heights","Balmain","Balmain East","Bangor","Banksia","Banksmeadow","Bankstown","Bankstown Aerodrome","Barangaroo","Barden Ridge","Bardia","Bardwell Park","Bardwell Valley","Bass Hill","Baulkham Hills","Bayview","Beacon Hill","Beaconsfield","Beaumont Hills","Beecroft","Belfield","Bella Vista","Bellevue Hill","Belmore","Belrose","Berala","Berkshire Park","Berowra","Berowra Heights","Berowra Waters","Berrilee","Beverley Park","Beverly Hills","Bexley","Bexley North","Bidwill","Bilgola Beach","Bilgola Plateau","Birchgrove","Birrong","Blackett","Blacktown","Blair Athol","Blairmount","Blakehurst","Bligh Park","Bondi","Bondi Beach","Bondi Junction","Bonnet Bay","Bonnyrigg","Bonnyrigg Heights","Bossley Park","Botany","Bow Bowing","Box Hill","Bradbury","Bradfield","Breakfast Point","Brighton-Le-Sands","Bringelly","Bronte","Brooklyn","Brookvale","Bundeena","Bungarribee","Burraneer","Burwood","Burwood Heights","Busby","Cabarita","Cabramatta","Cabramatta West","Caddens","Cambridge Gardens","Cambridge Park","Camellia","Cammeray","Campbelltown","Camperdown","Campsie","Canada Bay","Canley Heights","Canley Vale","Canoelands","Canterbury","Caringbah","Caringbah South","Carlingford","Carlton","Carnes Hill","Carramar","Carss Park","Cartwright","Castle Cove","Castle Hill","Castlecrag","Castlereagh","Casula","Catherine Field","Cattai","Cecil Hills","Cecil Park","Centennial Park","Chatswood","Chatswood West","Cheltenham","Cherrybrook","Chester Hill","Chifley","Chippendale","Chipping Norton","Chiswick","Chullora","Church Point","Claremont Meadows","Clarendon","Clareville","Claymore","Clemton Park","Clontarf","Clovelly","Clyde","Coasters Retreat","Cobbitty","Colebee","Collaroy","Collaroy Plateau","Colyton","Como","Concord","Concord West","Condell Park","Connells Point","Constitution Hill","Coogee","Cottage Point","Cowan","Cranebrook","Cremorne","Cremorne Point","Cromer","Cronulla","Crows Nest","Croydon","Croydon Park","Curl Curl","Currans Hill","Currawong Beach","Daceyville","Dangar Island","Darling Point","Darlinghurst","Darlington","Davidson","Dawes Point","Dean Park","Dee Why","Denham Court","Denistone","Denistone East","Denistone West","Dharruk","Dolans Bay","Dolls Point","Doonside","Double Bay","Dover Heights","Drummoyne","Duffys Forest","Dulwich Hill","Dundas","Dundas Valley","Dural","Eagle Vale","Earlwood","East Hills","East Killara","East Lindfield","East Ryde","Eastern Creek","Eastgardens","Eastlakes","Eastwood","Edensor Park","Edgecliff","Edmondson Park","Elanora Heights","Elderslie","Elizabeth Bay","Elizabeth Hills","Elvina Bay","Emerton","Enfield","Engadine","Englorie Park","Enmore","Epping","Ermington","Erskine Park","Erskineville","Eschol Park","Eveleigh","Fairfield","Fairfield East","Fairfield Heights","Fairfield West","Fairlight","Fiddletown","Five Dock","Forest Glen","Forest Lodge","Forestville","Frenchs Forest","Freshwater","Gables","Galston","Georges Hall","Gilead","Girraween","Gladesville","Glebe","Gledswood Hills","Glen Alpine","Glendenning","Glenfield","Glenhaven","Glenmore Park","Glenorie","Glenwood","Gordon","Grantham Farm","Granville","Grays Point","Great Mackerel Beach","Green Valley","Greenacre","Greendale","Greenfield Park","Greenhills Beach","Greenwich","Gregory Hills","Greystanes","Guildford","Guildford West","Gymea","Gymea Bay","Haberfield","Hammondville","Harrington Park","Harris Park","Hassall Grove","Haymarket","Heathcote","Hebersham","Heckenberg","Henley","Hillsdale","Hinchinbrook","Hobartville","Holroyd","Holsworthy","Homebush","Homebush West","Horningsea Park","Hornsby","Hornsby Heights","Horsley Park","Hoxton Park","Hunters Hill","Huntingwood","Huntleys Cove","Huntleys Point","Hurlstone Park","Hurstville","Hurstville Grove","Illawong","Ingleburn","Ingleside","Jamisontown","Jannali","Jordan Springs","Kangaroo Point","Kareela","Kearns","Kellyville","Kellyville Ridge","Kemps Creek","Kensington","Kenthurst","Kentlyn","Killara","Killarney Heights","Kings Langley","Kings Park","Kingsford","Kingsgrove","Kingswood","Kirkham","Kirrawee","Kirribilli","Kogarah","Kogarah Bay","Ku-ring-gai Chase","Kurnell","Kurraba Point","Kyeemagh","Kyle Bay","La Perouse","Lakemba","Lalor Park","Lane Cove","Lane Cove North","Lane Cove West","Lansdowne","Lansvale","Laughtondale","Lavender Bay","Leets Vale","Leichhardt","Len Waters Estate","Leppington","Lethbridge Park","Leumeah","Lewisham","Liberty Grove","Lidcombe","Lilli Pilli","Lilyfield","Lindfield","Linley Point","Little Bay","Liverpool","Llandilo","Loftus","Londonderry","Long Point","Longueville","Lovett Bay","Lower Portland","Lucas Heights","Luddenham","Lugarno","Lurnea","Macquarie Fields","Macquarie Links","Macquarie Park","Maianbar","Malabar","Manly","Manly Vale","Maraylya","Marayong","Maroota","Maroubra","Marrickville","Marsden Park","Marsfield","Mascot","Matraville","Mays Hill","McCarrs Creek","McGraths Hill","McMahons Point","Meadowbank","Melonba","Melrose Park","Menai","Menangle Park","Merrylands","Merrylands West","Middle Cove","Middle Dural","Middleton Grange","Miller","Millers Point","Milperra","Milsons Passage","Milsons Point","Minchinbury","Minto","Minto Heights","Miranda","Mona Vale","Monterey","Moore Park","Moorebank","Morning Bay","Mortdale","Mortlake","Mosman","Mount Annan","Mount Colah","Mount Druitt","Mount Kuring-Gai","Mount Lewis","Mount Pritchard","Mount Vernon","Mulgoa","Mulgrave","Narellan","Narellan Vale","Naremburn","Narrabeen","Narraweena","Narwee","Nelson","Neutral Bay","Newington","Newport","Newtown","Nirimba Fields","Normanhurst","North Balgowlah","North Bondi","North Curl Curl","North Epping","North Kellyville","North Manly","North Narrabeen","North Parramatta","North Rocks","North Ryde","North St Marys","North Strathfield","North Sydney","North Turramurra","North Wahroonga","North Willoughby","Northbridge","Northmead","Northwood","Norwest","Oakhurst","Oakville","Oatlands","Oatley","Old Guildford","Old Toongabbie","Oran Park","Orchard Hills","Oxford Falls","Oxley Park","Oyster Bay","Paddington","Padstow","Padstow Heights","Pagewood","Palm Beach","Panania","Parklea","Parramatta","Peakhurst","Peakhurst Heights","Pemulwuy","Pendle Hill","Pennant Hills","Penrith","Penshurst","Petersham","Phillip Bay","Picnic Point","Pitt Town","Pleasure Point","Plumpton","Point Piper","Port Botany","Port Hacking","Potts Hill","Potts Point","Prairiewood","Prestons","Prospect","Punchbowl","Putney","Pymble","Pyrmont","Quakers Hill","Queens Park","Queenscliff","Raby","Ramsgate","Ramsgate Beach","Randwick","Redfern","Regents Park","Regentville","Revesby","Revesby Heights","Rhodes","Richards","Richmond","Riverstone","Riverview","Riverwood","Rockdale","Rodd Point","Rookwood","Rooty Hill","Ropes Crossing","Rose Bay","Rosebery","Rosehill","Roselands","Rosemeadow","Roseville","Roseville Chase","Rossmore","Rouse Hill","Rozelle","Ruse","Rushcutters Bay","Russell Lea","Rydalmere","Ryde","Sackville North","Sadleir","Sandringham","Sandy Point","Sans Souci","Schofields","Scotland Island","Seaforth","Sefton","Seven Hills","Shalvey","Shanes Park","Silverwater","Singletons Mill","Smeaton Grange","Smithfield","South Coogee","South Granville","South Hurstville","South Maroota","South Penrith","South Turramurra","South Wentworthville","South Windsor","Spring Farm","St Andrews","St Clair","St Helens Park","St Ives","St Ives Chase","St Johns Park","St Leonards","St Marys","St Peters","Stanhope Gardens","Stanmore","Strathfield","Strathfield South","Summer Hill","Surry Hills","Sutherland","Sydenham","Sydney","Sydney Olympic Park","Sylvania","Sylvania Waters","Tallawong","Tamarama","Taren Point","Telopea","Tempe","Tennyson Point","Terrey Hills","The Ponds","The Rocks","Thornleigh","Toongabbie","Tregear","Turramurra","Turrella","Ultimo","Varroville","Vaucluse","Villawood","Vineyard","Voyager Point","Wahroonga","Waitara","Wakeley","Wareemba","Warrawee","Warriewood","Warwick Farm","Waterfall","Waterloo","Watsons Bay","Wattle Grove","Waverley","Waverton","Wedderburn","Wentworth Point","Wentworthville","Werrington","Werrington County","Werrington Downs","West Hoxton","West Pennant Hills","West Pymble","West Ryde","Westleigh","Westmead","Wetherill Park","Whalan","Whale Beach","Wheeler Heights","Wiley Park","Willmot","Willoughby","Willoughby East","Windsor","Windsor Downs","Winston Hills","Wisemans Ferry","Wolli Creek","Wollstonecraft","Woodbine","Woodcroft","Woodpark","Woollahra","Woolloomooloo","Woolooware","Woolwich","Woronora","Woronora Heights","Yagoona","Yarrawarrah","Yennora","Yowie Bay","Zetland"];
const AGNT_BULK_SMS_SHORTCUT='AGNT Bulk SMS';
let targets={...DEFAULTS}, days={}, prospects=[], prospectInteractions=[], marketPulseEvents=[], marketPulseHistory=[], prospectFilter='priority', prospectSection='today', prospectContactsMode='active', pipelineTemperature='All', pipelineSort='followup', prospectBulkMode=false, selectedProspectIds=new Set(), activeProspectId=null, prospectSessionIds=[], prospectSessionIndex=0, prospectSessionActive=false, prospectSessionStats={calls:0,connects:0,temperate:0,appointments:0,sms:0}, prospectSessionContext=null, selectedDate=dateKey(new Date()), appointmentDate=selectedDate, appointmentHistoryMode=null, agentName='', calendarPreference='outlook', appearancePreference='system', leaderboardEntries=[], leaderboardMode='day', leaderboardDayOffset=0, leaderboardWeekOffset=0, scorecardWeekOffset=0, prospectInsightPeriod='week', campaignHistory=[], bulkSmsTestLaunches=[], selectedBroadcastType='', selectedBroadcastSuburb='', selectedBroadcastStreet='', selectedBroadcastRecipientIds=new Set(), selectedBroadcastContext=null, broadcastStep=1, broadcastReviewMode='live', broadcastLastLaunch=null;
let knockingSessionActive=false,knockingSessionVisible=false,knockingSessionEnding=false,knockingSessionStats={knocks:0,clients:0,data:0,MAP:0,LAP:0},knockingSessionLog=[],knockingSessionStartSeconds=0,knockingCaptureType='',knockingEditingLogId='',selectedKnockingStreetKey='';
let year=new Date().getFullYear(), monthCursor=new Date(), uid='local', currentUser=null, cloud=false, db=null, auth=null;
let unsubDays=null, unsubProfile=null, unsubLeaderboard=null, unsubProspecting=null, unsubMarketPulseInbox=null, unsubTeamMembership=null, unsubTeamMembers=null, unsubAppointmentAssignees=null, unsubAssignedTeamAppointments=null, timerTick=null, syncTimer=null, leaderboardPublishTimer=null, prospectingSaveTimer=null, returningSnapshotTimer=null, returningSnapshotCountdownTimer=null, returningSnapshotEndsAt=0;
let dailyBriefingDaysReady=false,dailyBriefingMarketReady=false,dailyBriefingFallback=false;
let morningLiveLaunchEvaluated=false;
let accountMode='unconfigured',teamId=null,teamRole=null,teamName='',teamJoinCode='',teamLayerStatus='idle',teamLayerError='',creatingAccount=false,newAccountUidPending='',teamOnboardingActive=false;
let teamSetupBusy=false,teamSetupReturnFocus=null,pendingTeamJoin=null;
let teamMembers=[],teamMembersStatus='idle',teamMembersError='',teamMembersDataSignature='',subscribedMembershipTeamId='',subscribedMembersTeamId='',teamManagerOpen=false,teamManagerReturnFocus=null,pendingTeamMemberRemoval=null,teamMemberActionBusy=false;
let appointmentAssignees=[],assignedTeamAppointments=[],pendingTeamAppointmentNotice=null,teamAppointmentNoticeOpen=false,teamAppointmentNoticeReturnState=null,dismissedTeamAppointmentNotices=new Set(),subscribedAppointmentTeamId='',pendingAppointmentAssignment=null;
let teamLeaveBusy=false,teamLeaveReturnFocus=null;
let teamInviteRefreshBusy=false,teamInviteRefreshReturnFocus=null;
let teamDeleteBusy=false,teamDeleteReturnFocus=null;
let pendingSyncOperations=0, syncHasError=false, lastLeaderboardSignature='', lastTeamLeaderboardSignature='', lastProspectingSignature='';
let subscribedTeamId='',teamLeaderboardDataSignature='',teamInitialisationToken=0;
let leaderboardListRenderMarkup='';
let pendingProspectingPayload=null, pendingProspectingSignature='', prospectingWriteInFlight=false, prospectingSaveWaiters=[];
let editingAppointment=null;
let todayPage='overview';
let prospectTodayMode='dashboard';
let marketReviewFilter='all';
let marketPageMode='hotspotting';
let marketPulseReturnTarget='hotspotting';
let appointmentEditReturnState=null;
let appointmentLinkedProspectId='';
let pendingProspectAppointmentFlow=null;
let manualDiallerNumber='',manualCallOutcome='',manualCallLaunchGuardUntil=0;
let buyerSession={contacts:[],index:0,active:false,fileName:'',importedAt:0};
let buyerQuickFilter='All',buyerBrowseMode='active',buyerFilterState={budgetMin:0,budgetMax:BUYER_BUDGET_MAX,suburb:'',bedrooms:0,bathrooms:0,cars:0,propertyType:'',stage:'',temperature:'',position:'',followUp:'',features:new Set()},pendingBuyerEditorContext=null;
let buyerMatchOutcomeReturnFocus=null,buyerMatchSmsReturnGuardUntil=0;
const daySaveChains=new Map();
let dirtyDayKeys=new Set();
const appointmentSubmitLocks=new Set();
const MARKET_PULSE_INBOX_ADDRESS='agnt.marketpulse@gmail.com';
const MARKET_PULSE_SOURCE_ADDRESS='marketpulse@mcgrath.com.au';
const MARKET_PULSE_SUBJECT='Your Real Estate Update for Today';
let marketPulseAutomation={state:'unavailable',email:'',lastImportedAt:0,lastImportedDate:'',lastImportedCount:0,lastImportedNewCount:0,error:''};
let marketPulseInboxQueue=Promise.resolve(),marketPulseInboxQueuedIds=new Set(),marketPulseIdentityRegistrationPending=false;
let appResumeTimer=null,maintenanceDayKey=todayKey();

function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseKey(k){const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)}
function todayKey(){return dateKey(new Date())}
function mondayOf(d){const x=new Date(d),n=x.getDay();x.setDate(x.getDate()-(n===0?6:n-1));x.setHours(0,0,0,0);return x}
function weekKeys(d=parseKey(selectedDate)){const m=mondayOf(d);return workDays.map(n=>{const x=new Date(m);x.setDate(m.getDate()+n-1);return dateKey(x)})}
function isWorkDayKey(k){return workDays.includes(parseKey(k).getDay())}
function workDayName(n){return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][n]}
function normaliseWorkDays(values){const order=[1,2,3,4,5,6,0],set=new Set((values||[]).map(Number).filter(n=>n>=0&&n<=6));return order.filter(n=>set.has(n))}
function blankDay(){return{calls:0,connects:0,data:0,knockSeconds:0,timerStartedAt:null,appointments:[],events:[],review:{},clientUpdatedAt:0}}
function validDateKey(value){return /^\d{4}-\d{2}-\d{2}$/.test(String(value||''))&&!Number.isNaN(parseKey(String(value)).getTime())}
function normaliseAppointmentRecord(raw={},sourceDate=''){
  const a=raw&&typeof raw==='object'?{...raw}:{};
  const createdDate=validDateKey(a.createdDate)?a.createdDate:validDateKey(a.logDate)?a.logDate:sourceDate;
  const scheduledDate=validDateKey(a.scheduledDate)?a.scheduledDate:validDateKey(a.date)?a.date:sourceDate;
  const time=/^([01]\d|2[0-3]):[0-5]\d$/.test(String(a.time||''))?String(a.time):'12:00';
  const scheduledAt=Number.isFinite(Number(a.scheduledAt))?Number(a.scheduledAt):new Date(`${scheduledDate}T${time}`).getTime();
  const at=Number.isFinite(Number(a.at))?Number(a.at):Date.now();
  const type=normaliseAppointmentType(a.type||(Array.isArray(a.types)?a.types[0]:''));
  return{...a,auction:type==='OFI'&&Boolean(a.auction),durationMinutes:type==='OFI'?(Boolean(a.auction)?15:30):60,id:String(a.id||uuid()),contactName:String(a.contactName||a.name||'').trim(),contactNumber:String(a.contactNumber||a.phone||'').trim(),address:String(a.address||'').trim(),date:scheduledDate,time,type,types:Array.isArray(a.types)&&a.types.length?a.types:[type],createdDate,logDate:createdDate,scheduledDate,scheduledAt:Number.isFinite(scheduledAt)?scheduledAt:0,at};
}
function normaliseAppointments(list,sourceDate=''){
  const seen=new Set(),out=[];
  for(const raw of Array.isArray(list)?list:[]){
    const a=normaliseAppointmentRecord(raw,sourceDate);
    const key=a.id||`${a.createdDate}|${a.scheduledDate}|${a.time}|${a.type}|${a.address}|${a.contactName}`;
    if(seen.has(key))continue;
    seen.add(key);out.push(a);
  }
  return out;
}
function normaliseDayRecord(raw={},sourceDate=''){
  const value=raw&&typeof raw==='object'?raw:{};
  return{...blankDay(),...value,calls:Math.max(0,Number(value.calls)||0),connects:Math.max(0,Number(value.connects)||0),data:Math.max(0,Number(value.data)||0),knockSeconds:Math.max(0,Number(value.knockSeconds)||0),timerStartedAt:Number.isFinite(Number(value.timerStartedAt))?Number(value.timerStartedAt):null,appointments:normaliseAppointments(value.appointments,sourceDate),events:Array.isArray(value.events)?value.events.filter(Boolean).slice(-500):[],review:value.review&&typeof value.review==='object'?value.review:{},clientUpdatedAt:Number(value.clientUpdatedAt)||0};
}
function normaliseDaysMap(raw){const out={};if(!raw||typeof raw!=='object')return out;for(const [k,v] of Object.entries(raw)){if(validDateKey(k))out[k]=normaliseDayRecord(v,k)}return out}
function dayData(k){return normaliseDayRecord(days[k],k)}
function liveKnockSeconds(d){return (d.knockSeconds||0)+(d.timerStartedAt?Math.max(0,Math.floor((Date.now()-d.timerStartedAt)/1000)):0)}
function pct(n,t){return Math.min(100,Math.round((Number(n)||0)/Math.max(1,Number(t)||1)*100))}
function haptic(v=10){navigator.vibrate?.(v)}
function fmtDate(k){return parseKey(k).toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})}
function fmtTimer(sec){const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=Math.floor(sec%60);return h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
function uuid(){return crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`}
function configured(){return firebaseConfig?.apiKey&&!firebaseConfig.apiKey.startsWith('PASTE_')}
function isPastDate(k){return k<todayKey()}
function canEditDate(k){return !isPastDate(k)&&isWorkDayKey(k)}
function lockedToast(){haptic(20);toast(isPastDate(selectedDate)?'This day is complete and locked':'This day is not in your accountability schedule')}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),1800)}
function syncVisualState(state,label){
  if(state)return state;
  if(label==='Saving')return 'saving';
  if(label==='Connecting'||label==='Connected')return 'connecting';
  if(label==='Offline'||label==='This device')return 'offline';
  if(label==='Sync error')return 'error';
  return 'connecting';
}
function setSync(state,label){
  const b=$('#syncBadge'),visual=syncVisualState(state,label);
  b.className=`sync-badge ${visual}`;
  b.dataset.label=label;
  b.setAttribute('aria-label',`Sync status: ${label}`);
  b.title=`Sync status: ${label}`;
  const current=$('#syncCurrentText');if(current)current.textContent=label;
}
function refreshSyncStatus(){
  if(!cloud)return setSync('offline','This device');
  if(!navigator.onLine)return setSync('offline','Offline');
  if(syncHasError)return setSync('error','Sync error');
  if(pendingSyncOperations>0)return setSync('','Saving');
  setSync('live','Live');
}
function beginSyncOperation(){pendingSyncOperations++;refreshSyncStatus()}
function endSyncOperation({error=false}={}){pendingSyncOperations=Math.max(0,pendingSyncOperations-1);if(error)syncHasError=true;refreshSyncStatus()}
function clearSyncError(){syncHasError=false;refreshSyncStatus()}
function leaderboardConnectionState(){
  if(!cloud)return{label:'DEVICE ONLY',visual:'offline'};
  if(teamLayerStatus==='error')return{label:'TEAM ERROR',visual:'error'};
  if(accountMode==='team'){
    if(!navigator.onLine)return{label:'TEAM OFFLINE',visual:'offline'};
    if(teamLayerStatus==='live')return{label:'TEAM LIVE',visual:'live'};
    return{label:'TEAM SYNCING',visual:'connecting'};
  }
  if(accountMode==='solo')return{label:'SOLO',visual:'live'};
  if(teamLayerStatus==='connecting')return{label:'TEAM SYNCING',visual:'connecting'};
  return{label:'PRIVATE',visual:'offline'};
}
function renderLeaderboardStatus(){
  const node=$('#leaderboardStatus');if(!node)return;
  const status=leaderboardConnectionState();
  if(node.textContent!==status.label)node.textContent=status.label;
  node.className=`leaderboard-live ${status.visual}`;
}

const appearanceMedia=window.matchMedia?.('(prefers-color-scheme: dark)');
let authScreenActive=true;
function normaliseAppearance(value){return value==='light'||value==='dark'?value:'system'}
function effectiveTheme(pref=appearancePreference){
  if(authScreenActive)return 'light';
  return pref==='dark'||(pref==='system'&&appearanceMedia?.matches)?'dark':'light';
}
function applyAppearance(pref=appearancePreference,{persist=true}={}){
  appearancePreference=normaliseAppearance(pref);
  const theme=effectiveTheme(appearancePreference);
  document.documentElement.dataset.appearance=appearancePreference;
  document.documentElement.dataset.theme=theme;
  document.documentElement.dataset.auth=authScreenActive?'true':'false';
  document.documentElement.style.colorScheme=theme;
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',theme==='dark'?'#0b0d11':'#ffffff');
  if(persist){try{localStorage.setItem('agnt:appearance',appearancePreference)}catch{}}
}
function setAuthScreenActive(active){authScreenActive=Boolean(active);applyAppearance(appearancePreference,{persist:false})}
appearanceMedia?.addEventListener?.('change',()=>{if(appearancePreference==='system'&&!authScreenActive)applyAppearance('system',{persist:false})});
applyAppearance(localStorage.getItem('agnt:appearance')||'system',{persist:false});
function storagePrefix(userId=uid){return `da:${userId||'local'}:`}
function teamStateCacheKey(userId=uid){return `${storagePrefix(userId)}verified-team-v2`}
function readCachedTeamState(userId=uid){
  if(!userId||userId==='local')return null;
  try{
    const value=safeJsonParse(localStorage.getItem(teamStateCacheKey(userId))||'null',null);
    if(!value||value.schemaVersion!==2)return null;
    if(value.accountMode==='solo')return{mode:'solo',id:null,role:null,name:'',joinCode:''};
    const id=String(value.teamId||'');if(value.accountMode!=='team'||!id)return null;
    return{mode:'team',id,role:String(value.teamRole||'member'),name:String(value.teamName||'Team'),joinCode:String(value.teamJoinCode||'')};
  }catch{return null}
}
function cacheVerifiedTeamState(){
  if(!uid||uid==='local'||!['solo','team'].includes(accountMode))return;
  const value={schemaVersion:2,accountMode,teamId:accountMode==='team'?teamId:null,teamRole:accountMode==='team'?teamRole:null,teamName:accountMode==='team'?teamName:'',teamJoinCode:accountMode==='team'&&teamRole==='owner'?teamJoinCode:'',verifiedAt:Date.now()};
  try{localStorage.setItem(teamStateCacheKey(uid),JSON.stringify(value))}catch(err){console.warn('Verified team state could not be cached',err)}
}
function forgetCachedTeamState(userId=uid){try{localStorage.removeItem(teamStateCacheKey(userId))}catch{}}
function resetMarketPulseAutomationState(){marketPulseAutomation={state:'unavailable',email:'',lastImportedAt:0,lastImportedDate:'',lastImportedCount:0,lastImportedNewCount:0,error:''};marketPulseInboxQueue=Promise.resolve();marketPulseInboxQueuedIds=new Set();marketPulseIdentityRegistrationPending=false}
function resetDailyBriefingSyncState(){dailyBriefingDaysReady=false;dailyBriefingMarketReady=false;dailyBriefingFallback=false;clearTimeout(returningSnapshotTimer);clearInterval(returningSnapshotCountdownTimer);returningSnapshotTimer=returningSnapshotCountdownTimer=null;returningSnapshotEndsAt=0;document.body?.classList.remove('daily-briefing-open');$('#app')?.removeAttribute('inert');const screen=$('#returningSnapshotScreen');screen?.classList.add('hidden');screen?.classList.remove('is-leaving','is-running');screen?.setAttribute('aria-hidden','true')}
function resetState(){resetDailyBriefingSyncState();resetMarketPulseAutomationState();days={};targets={...DEFAULTS};workDays=[...DEFAULT_WORK_DAYS];agentName='';calendarPreference='outlook';appearancePreference=normaliseAppearance(localStorage.getItem('agnt:appearance')||'system');applyAppearance(appearancePreference,{persist:false});leaderboardEntries=[];marketPulseEvents=[];marketPulseHistory=[];selectedBroadcastContext=null;selectedKnockingStreetKey='';accountMode='unconfigured';teamId=null;teamRole=null;teamName='';teamJoinCode='';teamLayerStatus='idle';teamLayerError='';teamOnboardingActive=false;teamSetupBusy=false;teamSetupReturnFocus=null;pendingTeamJoin=null;teamMembers=[];teamMembersStatus='idle';teamMembersError='';teamMembersDataSignature='';subscribedMembershipTeamId='';subscribedMembersTeamId='';appointmentAssignees=[];assignedTeamAppointments=[];pendingTeamAppointmentNotice=null;teamAppointmentNoticeOpen=false;teamAppointmentNoticeReturnState=null;dismissedTeamAppointmentNotices=new Set();subscribedAppointmentTeamId='';pendingAppointmentAssignment=null;teamManagerOpen=false;teamManagerReturnFocus=null;pendingTeamMemberRemoval=null;teamMemberActionBusy=false;teamLeaveBusy=false;teamLeaveReturnFocus=null;teamInviteRefreshBusy=false;teamInviteRefreshReturnFocus=null;teamDeleteBusy=false;teamDeleteReturnFocus=null;subscribedTeamId='';teamLeaderboardDataSignature='';leaderboardListRenderMarkup='';buyerQuickFilter='All';buyerBrowseMode='active';buyerFilterState=defaultBuyerFilters();pendingBuyerEditorContext=null;prospectTodayMode='dashboard';marketReviewFilter='all';marketPageMode='hotspotting';marketPulseReturnTarget='hotspotting';selectedDate=todayKey();appointmentDate=selectedDate;maintenanceDayKey=todayKey()}
function safeJsonParse(value,fallback){try{return JSON.parse(value)}catch{return fallback}}
const CONTACT_DRAFT_FIELDS=['name','phone','email','address','source','stage','temperature','motivation','sellingTimeframe','tags','nextFollowUp','notes'];
function contactDraftStorageKey(userId=uid){return`${storagePrefix(userId)}contact-draft-v1`}
function normaliseContactDraftValues(values={}){
  const stageOptions=['New Lead','Nurture','Appraisal Opportunity','Appointment Booked','Pipeline','Listed','Past Client'],stage=stageOptions.includes(values.stage)?values.stage:'New Lead',temperature=['Cold','Warm','Hot'].includes(values.temperature)?values.temperature:'Cold',motivation=Math.max(1,Math.min(5,Number(values.motivation)||1)),sellingTimeframe=SELLING_TIMEFRAMES.includes(values.sellingTimeframe)?values.sellingTimeframe:'';
  return{name:cleanText(values.name,120),phone:cleanText(values.phone,50),email:cleanText(values.email,180),address:cleanText(values.address,240),source:cleanText(values.source,100),stage,temperature,motivation,sellingTimeframe,tags:cleanText(values.tags,300),nextFollowUp:validDateKey(values.nextFollowUp)?values.nextFollowUp:'',notes:cleanText(values.notes,3000),addBuyerBrief:Boolean(values.addBuyerBrief)}
}
function contactDraftMeaningful(draft={}){
  if(!draft||typeof draft!=='object')return false;
  const values=normaliseContactDraftValues(draft.values||draft),textFields=['name','phone','email','address','source','sellingTimeframe','tags','nextFollowUp','notes'];
  return textFields.some(field=>Boolean(values[field]))||values.addBuyerBrief||values.stage!=='New Lead'||values.temperature!=='Cold'||values.motivation!==1
}
function readContactDraft(userId=uid){
  try{
    const raw=safeJsonParse(localStorage.getItem(contactDraftStorageKey(userId))||'null',null);
    if(!raw||Number(raw.schemaVersion)!==CONTACT_DRAFT_SCHEMA_VERSION||!contactDraftMeaningful(raw))return null;
    return{schemaVersion:CONTACT_DRAFT_SCHEMA_VERSION,draftId:cleanText(raw.draftId,80)||prospectId(),values:normaliseContactDraftValues(raw.values),temperatureManual:Boolean(raw.temperatureManual),motivationManual:Boolean(raw.motivationManual),openedAt:Number(raw.openedAt)||Date.now(),savedAt:Number(raw.savedAt)||Date.now()}
  }catch(err){console.warn('Contact draft could not be restored',err);return null}
}
function contactDraftFromForm(form){
  if(!form?.matches?.('#prospectEditor[data-contact-draft="1"]'))return null;
  const values={};CONTACT_DRAFT_FIELDS.forEach(field=>{values[field]=form.elements.namedItem(field)?.value||''});values.addBuyerBrief=Boolean(form.elements.namedItem('addBuyerBrief')?.checked);
  return{schemaVersion:CONTACT_DRAFT_SCHEMA_VERSION,draftId:cleanText(form.dataset.contactDraftId,80)||prospectId(),values:normaliseContactDraftValues(values),temperatureManual:form.dataset.temperatureManual==='1',motivationManual:form.dataset.motivationManual==='1',openedAt:Number(form.dataset.contactDraftOpenedAt)||Date.now(),savedAt:Date.now()}
}
function saveContactDraftFromForm(form){
  const draft=contactDraftFromForm(form);if(!draft)return false;
  form.dataset.contactDraftId=draft.draftId;form.dataset.contactDraftOpenedAt=String(draft.openedAt);
  try{if(contactDraftMeaningful(draft))localStorage.setItem(contactDraftStorageKey(),JSON.stringify(draft));else localStorage.removeItem(contactDraftStorageKey());return true}catch(err){console.warn('Contact draft could not be saved',err);return false}
}
function clearContactDraft(userId=uid){try{localStorage.removeItem(contactDraftStorageKey(userId))}catch(err){console.warn('Contact draft could not be cleared',err)}}
function persistOpenContactDraft(){const form=$('#prospectEditor[data-contact-draft="1"]');if(form)saveContactDraftFromForm(form)}
function prospectingFormContextIsCurrent(form){return Boolean(form?.isConnected&&activeViewId()==='prospectingView'&&!$('#prospectDetail')?.classList.contains('hidden')&&$('#prospectDetail')?.contains(form))}
function discardSavedContactEditor(form){if(!form?.isConnected)return;const detail=$('#prospectDetail');form.remove();detail?.classList.add('hidden');if(detail)detail.innerHTML='';activeProspectId=null;$('#prospectingSession')?.classList.add('hidden');$('#prospectingDashboard')?.classList.remove('hidden')}
function cancelContactEditor(){
  const form=$('#prospectEditor');if(form?.dataset.contactDraft==='1'){
    const draft=contactDraftFromForm(form);if(contactDraftMeaningful(draft)&&!confirm('Discard this unfinished contact?'))return;
    clearContactDraft()
  }
  closeProspectDetail()
}
function restoreContactDraftWorkflow({silent=false}={}){
  const draft=readContactDraft();if(!draft||$('#app')?.classList.contains('hidden'))return false;
  const existing=$('#prospectEditor[data-contact-draft="1"]');if(existing){saveContactDraftFromForm(existing);switchView('prospectingView');setProspectorSection('contacts',{resetSubview:false});$('#prospectingDashboard')?.classList.add('hidden');$('#prospectingSession')?.classList.add('hidden');$('#prospectDetail')?.classList.remove('hidden');return true}
  switchView('prospectingView');prospectTodayMode='dashboard';setProspectorSection('contacts');openProspectEditor('',{draft});if(!silent)toast('Contact draft restored');return true
}
function loadLocal(userId=uid){resetState();const prefix=storagePrefix(userId);try{days=normaliseDaysMap(safeJsonParse(localStorage.getItem(prefix+'days')||localStorage.getItem(prefix+'days-backup')||'{}',{}));targets={...DEFAULTS,...safeJsonParse(localStorage.getItem(prefix+'targets')||'{}',{})};agentName=localStorage.getItem(prefix+'agent-name')||'';const savedWorkDays=safeJsonParse(localStorage.getItem(prefix+'work-days')||'null',null);if(Array.isArray(savedWorkDays)&&savedWorkDays.length)workDays=normaliseWorkDays(savedWorkDays);const savedCalendarPreference=localStorage.getItem(prefix+'calendar-preference');calendarPreference=savedCalendarPreference==='apple'?'apple':'outlook';prospects=normaliseProspects(safeJsonParse(localStorage.getItem(prefix+'prospects')||'[]',[]));prospectInteractions=normaliseProspectInteractions(safeJsonParse(localStorage.getItem(prefix+'prospect-interactions')||'[]',[]));marketPulseEvents=normaliseMarketPulseEvents(safeJsonParse(localStorage.getItem(prefix+'market-pulse-events')||'[]',[]));const savedMarketHistory=safeJsonParse(localStorage.getItem(prefix+'market-pulse-history')||'[]',[]);marketPulseHistory=normaliseMarketPulseHistory([...(Array.isArray(savedMarketHistory)?savedMarketHistory:[]),...marketPulseEvents]);campaignHistory=safeJsonParse(localStorage.getItem(prefix+'campaign-history')||'[]',[]);bulkSmsTestLaunches=safeJsonParse(localStorage.getItem(prefix+'bulk-sms-test-launches')||'[]',[]);dirtyDayKeys=new Set(safeJsonParse(localStorage.getItem(prefix+'dirty-days')||'[]',[]).filter(validDateKey));if(refreshBuyerPropertyMatches(marketPulseEvents))localStorage.setItem(prefix+'prospects',JSON.stringify(prospects))}catch(err){console.error('Local data recovery failed',err);resetState();dirtyDayKeys=new Set()}}
function saveDirtyDays(){try{localStorage.setItem(storagePrefix(uid)+'dirty-days',JSON.stringify([...dirtyDayKeys]))}catch(err){console.error('Dirty-day queue save failed',err)}}
function markDayDirty(k){dirtyDayKeys.add(k);saveDirtyDays()}
function clearDayDirty(k,clientUpdatedAt){if(Number(days[k]?.clientUpdatedAt)===Number(clientUpdatedAt)){dirtyDayKeys.delete(k);saveDirtyDays()}}
function saveLocal(){const prefix=storagePrefix(uid);try{const serialised=JSON.stringify(normaliseDaysMap(days));const previous=localStorage.getItem(prefix+'days');if(previous)localStorage.setItem(prefix+'days-backup',previous);localStorage.setItem(prefix+'days',serialised);localStorage.setItem(prefix+'targets',JSON.stringify(targets));localStorage.setItem(prefix+'agent-name',agentName);localStorage.setItem(prefix+'work-days',JSON.stringify(workDays));localStorage.setItem(prefix+'calendar-preference',calendarPreference);localStorage.setItem(prefix+'prospects',JSON.stringify(prospects));localStorage.setItem(prefix+'prospect-interactions',JSON.stringify(prospectInteractions));localStorage.setItem(prefix+'market-pulse-events',JSON.stringify(marketPulseEvents));localStorage.setItem(prefix+'market-pulse-history',JSON.stringify(normaliseMarketPulseHistory(marketPulseHistory)));localStorage.setItem(prefix+'campaign-history',JSON.stringify(campaignHistory.slice(0,20)));localStorage.setItem(prefix+'bulk-sms-test-launches',JSON.stringify(bulkSmsTestLaunches.slice(0,10)));return true}catch(err){console.error('Local save failed',err);return false}}
function clearActiveSession(){teamInitialisationToken++;unsubDays?.();unsubProfile?.();unsubLeaderboard?.();unsubProspecting?.();unsubMarketPulseInbox?.();unsubTeamMembership?.();unsubTeamMembers?.();unsubAppointmentAssignees?.();unsubAssignedTeamAppointments?.();unsubDays=unsubProfile=unsubLeaderboard=unsubProspecting=unsubMarketPulseInbox=unsubTeamMembership=unsubTeamMembers=unsubAppointmentAssignees=unsubAssignedTeamAppointments=null;hideTeamAppointmentNotice({acknowledge:false});hideTeamManager({restoreFocus:false});closeTeamMemberRemoval({force:true});hideTeamLeaveConfirmation({force:true,restoreFocus:false});hideTeamCodeRefreshConfirmation({force:true,restoreFocus:false});clearInterval(timerTick);clearInterval(returningSnapshotCountdownTimer);clearTimeout(syncTimer);clearTimeout(leaderboardPublishTimer);clearTimeout(prospectingSaveTimer);clearTimeout(returningSnapshotTimer);clearTimeout(appResumeTimer);appResumeTimer=null;returningSnapshotTimer=returningSnapshotCountdownTimer=null;returningSnapshotEndsAt=0;prospectingSaveTimer=null;pendingProspectingPayload=null;pendingProspectingSignature='';prospectingWriteInFlight=false;prospectingSaveWaiters.splice(0).forEach(({resolve})=>resolve());currentUser=null;uid='local';cloud=false;pendingSyncOperations=0;syncHasError=false;lastLeaderboardSignature='';lastTeamLeaderboardSignature='';lastProspectingSignature='';dirtyDayKeys=new Set();resetState()}
function displayAgentName(){return (agentName||currentUser?.displayName||currentUser?.email?.split('@')[0]||'Agent').trim()}
function returningSnapshotReadyKey(){return `${storagePrefix(uid)}returning-snapshot-ready`}
function returningSnapshotHasHistory(){
  try{
    if(localStorage.getItem(returningSnapshotReadyKey())==='1')return true;
    const prefix=storagePrefix(uid),keys=Object.keys(localStorage);
    return Boolean(localStorage.getItem(prefix+'days')||localStorage.getItem(prefix+'prospects')||localStorage.getItem(prefix+'agent-name')||keys.some(key=>key.startsWith(prefix+'welcome:')));
  }catch{return false}
}
function markReturningSnapshotReady(){try{localStorage.setItem(returningSnapshotReadyKey(),'1')}catch{}}
function morningLiveUpdateLaunchKey(){return `${storagePrefix(uid)}morning-live-opens:${todayKey()}`}
function morningLiveUpdateLaunchDecision(now=new Date()){
  if(now.getHours()>=MORNING_LIVE_UPDATE_CUTOFF_HOUR)return{show:false,count:0,reason:'after-cutoff'};
  try{
    const key=morningLiveUpdateLaunchKey(),count=Math.max(0,Number(localStorage.getItem(key))||0)+1;
    localStorage.setItem(key,String(count));
    return{show:count%2===0,count,reason:count%2===0?'second-open':'alternate-open'};
  }catch{return{show:false,count:0,reason:'storage-unavailable'}}
}
function dailyBriefingDataReady(){return !cloud||dailyBriefingFallback||(dailyBriefingDaysReady&&dailyBriefingMarketReady)}
function returningSnapshotPipelineCount(){
  const standardSession=prospectSessionActive&&!cleanText(prospectSessionContext?.eventId,160);
  if(standardSession)return Math.max(0,prospectSessionIds.length-prospectSessionIndex);
  try{
    const raw=safeJsonParse(localStorage.getItem(dailyProspectPipelineKey())||'[]',[]);
    if(Array.isArray(raw)&&raw.length)return raw.filter(id=>{const p=prospectById(id);return p&&!p.archived&&!prospectContactedToday(id)}).length;
  }catch{}
  return sortedEligibleProspectPipeline().filter(p=>!prospectContactedToday(p.id)).slice(0,50).length;
}
function returningSnapshotUpcomingAppointment(now=new Date()){
  const current=now.getHours()*60+now.getMinutes();
  return appointmentEntriesForDate(todayKey()).map(entry=>({entry,minutes:timelineMinutes(entry.appointment.time)})).filter(item=>Number.isFinite(item.minutes)&&item.minutes>=current).sort((a,b)=>a.minutes-b.minutes)[0]||null;
}
function dailyBriefingMarketEventMeta(event){const value=event.price||event.guide,auction=marketAuctionLabel(event);if(value)return[`${value}${event.guide?' guide':normalisePlace(event.eventType)==='sold'?' sold':''}`,auction].filter(Boolean).join(' · ');return auction||event.daysOnMarket||event.agency||'Market update'}
function dailyBriefingDateLabel(value){if(!validDateKey(value))return'';return parseKey(value).toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'})}
function dailyBriefingEventBucket(eventType=''){const type=normalisePlace(eventType);if(type==='listed'||type==='just listed'||type==='new listing')return'listed';if(type==='sold'||type==='auction result')return'sold';if(type==='price update'||type==='price changed'||type==='price change')return'price';return'other'}
function dailyBriefingMarketModel(){
  const allEvents=normaliseMarketPulseEvents(marketPulseEvents),activeDate=latestMarketPulseEventDate(allEvents),events=activeDate?allEvents.filter(event=>event.receivedDate===activeDate):[],activeSessionEventId=cleanText(prospectSessionContext?.eventId,160);
  const rows=events.map(event=>{const matches=marketMatches(event),progress=marketSessionProgress(event,matches),remaining=progress.complete?[]:matches.filter(person=>!progress.workedIds.has(person.id)&&!prospectContactedToday(person.id)),requestedFollowUps=remaining.filter(person=>marketTriggeredFollowUp(event,person.id)).length,typeKey=normalisePlace(event.eventType),bucket=dailyBriefingEventBucket(event.eventType),preferred=bucket==='listed'||bucket==='sold',priority=hotSpottingPriority(event,remaining.length);return{event,matches,progress,remaining,requestedFollowUps,typeKey,bucket,preferred,priority,active:event.id===activeSessionEventId}}).sort((a,b)=>Number(b.active)-Number(a.active)||Number(Boolean(b.requestedFollowUps))-Number(Boolean(a.requestedFollowUps))||Number(b.preferred)-Number(a.preferred)||Number(Boolean(b.remaining.length))-Number(Boolean(a.remaining.length))||b.priority.score-a.priority.score||b.remaining.length-a.remaining.length||b.event.createdAt-a.event.createdAt);
  const influencedIds=new Set(rows.flatMap(row=>row.matches.map(person=>person.id))),priorityInfluencedIds=new Set(rows.filter(row=>row.preferred).flatMap(row=>row.matches.map(person=>person.id))),totalIds=new Set(rows.flatMap(row=>row.remaining.map(person=>person.id))),priorityIds=new Set(rows.filter(row=>row.preferred).flatMap(row=>row.remaining.map(person=>person.id))),assigned=new Set(),focusRows=[];
  rows.filter(row=>row.remaining.length).forEach(row=>{const uniqueClients=row.remaining.filter(person=>!assigned.has(person.id));uniqueClients.forEach(person=>assigned.add(person.id));if(uniqueClients.length&&focusRows.length<3)focusRows.push({...row,uniqueClients,clientCount:uniqueClients.length})});
  const listed=rows.filter(row=>row.bucket==='listed').length,sold=rows.filter(row=>row.bucket==='sold').length,price=rows.filter(row=>row.bucket==='price').length,other=Math.max(0,rows.length-listed-sold-price),fresh=activeDate===todayKey(),hasError=marketPulseAutomation.state==='error',suburbCount=new Set(events.map(event=>normalisePlace(event.suburb)).filter(Boolean)).size;
  let debrief='Today’s MarketPulse has not arrived yet. AGNT will refresh the opportunity list when it does.';
  if(hasError)debrief=events.length?'The latest forward needs attention. Your previous Hot Spotting opportunities remain available while the connection retries.':'MarketPulse needs attention. AGNT is keeping your appointments, follow-ups and pipeline available while the connection retries.';
  else if(fresh&&events.length&&priorityIds.size)debrief=`${events.length} market update${events.length===1?'':'s'} across ${suburbCount} suburb${suburbCount===1?'':'s'}. ${priorityIds.size} unworked client${priorityIds.size===1?' is':'s are'} tied directly to Listed and Sold activity.`;
  else if(fresh&&events.length)debrief=`${events.length} market update${events.length===1?'':'s'} received. No unworked clients are currently matched to Listed or Sold activity.`;
  else if(events.length)debrief=`Today’s update is still pending. Opportunities from ${dailyBriefingDateLabel(activeDate)} remain available but are not being treated as today’s priority.`;
  return{events,rows,focusRows,activeDate,fresh,hasError,listed,sold,price,other,influencedClientCount:influencedIds.size,priorityInfluencedClientCount:priorityInfluencedIds.size,totalClientCount:totalIds.size,priorityClientCount:priorityIds.size,suburbCount,statusState:hasError?'error':fresh?'fresh':'waiting',statusLabel:hasError?'Needs attention':fresh?'Updated today':'Awaiting today',debrief};
}
function marketBriefingRows(model=dailyBriefingMarketModel()){
  const order={listed:0,sold:1,price:2,other:3};
  return[...(model.rows||[])].sort((a,b)=>(order[a.bucket]??3)-(order[b.bucket]??3)||Number(Boolean(b.requestedFollowUps))-Number(Boolean(a.requestedFollowUps))||Number(Boolean(b.remaining?.length))-Number(Boolean(a.remaining?.length))||b.priority.score-a.priority.score||marketPulseEventSortNewest(a.event,b.event))
}
function marketBriefingRowData(row={}){
  const event=row.event||{},kind=marketPulseEventKind(event),category=marketPulseEventPropertyCategory(event),configuration=marketPulseEventConfigurationLabel(event,category),movement=marketMovementLabel(event),auction=marketAuctionLabel(event),price=event.guide?`Guide ${event.guide}`:event.price?(kind==='sold'?`Sold ${event.price}`:`Price ${event.price}`):'',prior=event.priorPrice?`Prior ${event.guide?'guide':'price'} ${event.priorPrice}`:'',propertyDetails=event.propertyDetails&&normalisePlace(event.propertyDetails)!==normalisePlace(configuration)?event.propertyDetails:'',agency=event.agency?`Agency ${event.agency}`:'',agents=Array.isArray(event.agents)&&event.agents.length?`Agents ${event.agents.join(', ')}`:'',timing=relativeEventRecency(event).label,opportunity=row.remaining?.length?`${row.remaining.length} client${row.remaining.length===1?'':'s'} to speak to`:row.matches?.length?`${row.matches.length} matched · worked`:'No matched contacts';
  return{event,kind,label:kind==='listed'?'LISTED':kind==='sold'?'SOLD':kind==='price'?'PRICE UPDATE':String(event.eventType||'MARKETPULSE').toUpperCase(),address:event.address||'Address not recorded',suburb:event.suburb||'',configuration,details:[price,movement,prior,auction,propertyDetails,event.daysOnMarket,agency,agents].filter(Boolean),timing,opportunity,requestedFollowUps:Number(row.requestedFollowUps)||0}
}
function marketBriefingRowMarkup(row,{compact=false}={}){
  const data=marketBriefingRowData(row),followUp=data.requestedFollowUps?`${data.requestedFollowUps} requested follow-up${data.requestedFollowUps===1?'':'s'}`:'';
  return`<article class="market-briefing-row market-briefing-${escapeHtml(data.kind)}${compact?' compact':''}" data-briefing-event-id="${escapeHtml(data.event.id||'')}"><span class="market-briefing-event">${escapeHtml(data.label)}</span><div class="market-briefing-property"><strong>${escapeHtml(data.address)}</strong><small>${escapeHtml([data.suburb,data.configuration].filter(Boolean).join(' · '))}</small>${data.details.length?`<em>${data.details.map(escapeHtml).join(' · ')}</em>`:''}</div><div class="market-briefing-opportunity"><strong>${escapeHtml(data.opportunity)}</strong>${followUp?`<small>${escapeHtml(followUp)}</small>`:''}<span>${escapeHtml(data.timing)}</span></div></article>`
}
function dailyBriefingOverdueCount(followUps=[]){const today=todayKey();return followUps.filter(item=>{const date=item?.dueDate||item?.nextFollowUp||item?.prospect?.nextFollowUp||item?.appointment?.followUpDate||'';return validDateKey(date)&&date<today}).length}
function dailyBriefingPlan(now,data){
  const shared=typeof dailyCommandPriority==='function'&&typeof timelineItemsForDate==='function'?dailyCommandPriority(todayKey(),timelineItemsForDate(todayKey()),now):null;
  if(shared?.title)return{title:shared.title,meta:shared.meta,action:shared.action||'view-today',label:shared.label||'View Today',eventId:shared.eventId||''};
  const current=now.getHours()*60+now.getMinutes(),next=data.nextAppointment,untilNext=next?next.minutes-current:9999,activeEventId=cleanText(prospectSessionContext?.eventId,160),activeEvent=activeEventId?marketPulseEvents.find(event=>event.id===activeEventId):null,standardSession=prospectSessionActive&&!activeEventId,top=data.market.focusRows[0];
  if(next&&untilNext>=0&&untilNext<=30){const appointment=next.entry.appointment,name=appointment.contactName||appointment.name||appointmentType(appointment);return{title:'Next appointment',meta:`${appointmentTimeLabel(appointment,next.entry.sourceDate)} · ${name}. AGNT has cleared the final 30 minutes from the working plan.`,action:'view-appointments',label:'View Appointment',eventId:''}}
  if(prospectSessionActive&&activeEvent){const matches=marketMatches(activeEvent),progress=marketSessionProgress(activeEvent,matches),remaining=Math.max(0,progress.total-progress.workedIds.size);return{title:`Resume ${activeEvent.address}`,meta:`${remaining} client${remaining===1?'':'s'} remain in this ${activeEvent.eventType} session · ${formatEstimatedTime(estimatedMinutes(remaining))}.`,action:'resume-session',label:'Resume Priority Session',eventId:activeEvent.id}}
  if(standardSession){const remaining=Math.max(0,prospectSessionIds.length-prospectSessionIndex);return{title:'Resume the current pipeline',meta:`${remaining} client${remaining===1?'':'s'} remain · ${formatEstimatedTime(estimatedMinutes(remaining))}. Finish the active queue before opening another session.`,action:'resume-session',label:'Resume Current Session',eventId:''}}
  if(data.market.fresh&&top){const minutes=estimatedMinutes(top.clientCount);let meta=`${top.event.eventType} · ${top.clientCount} client${top.clientCount===1?'':'s'} · ${formatEstimatedTime(minutes)}.`;if(next&&untilNext>30){const available=Math.max(0,untilNext-30);if(minutes<=available)meta+=` This fits before AGNT switches focus to the ${appointmentTimeLabel(next.entry.appointment,next.entry.sourceDate)} appointment.`;else if(available>=10){const workable=Math.max(1,Math.min(top.clientCount,Math.floor(available*60/150))),stopAt=timelineTimeLabel(next.minutes-30);meta+=` Work the first ${workable}; AGNT will switch focus at ${stopAt}.`}}return{title:`Start with ${top.event.address}`,meta,action:'start-market',label:'Start Priority Session',eventId:top.event.id}}
  if(data.overdueFollowUps>0)return{title:'Clear the overdue follow-ups',meta:`${data.overdueFollowUps} overdue follow-up${data.overdueFollowUps===1?' needs':'s need'} a clear next step before new pipeline work.`,action:'view-followups',label:'Open Follow-Ups',eventId:''};
  if(data.followUps.length)return{title:'Work today’s follow-ups',meta:`${data.followUps.length} conversation${data.followUps.length===1?' is':'s are'} due today. Start with the hottest relationship and record the next step.`,action:'view-followups',label:'Open Follow-Ups',eventId:''};
  if(data.market.fresh&&data.market.events.length&&data.pipeline>0)return{title:'MarketPulse is covered',meta:'No unworked matching clients remain. Use the clear space to strengthen the standard pipeline.',action:'view-pipeline',label:'Open Pipeline',eventId:''};
  if(data.appointments.length)return{title:'Review the day’s appointments',meta:`${data.appointments.length} appointment${data.appointments.length===1?' is':'s are'} scheduled. Confirm the outcome you need from each conversation.`,action:'view-appointments',label:'View Appointments',eventId:''};
  if(data.pipeline>0)return{title:'Build from the existing pipeline',meta:`${data.pipeline} eligible client${data.pipeline===1?' is':'s are'} ready · ${formatEstimatedTime(estimatedMinutes(data.pipeline))}.`,action:'view-pipeline',label:'Open Pipeline',eventId:''};
  if(data.market.fresh&&data.market.events.length)return{title:'MarketPulse is covered',meta:'No unworked matching clients remain. Your current MarketPulse opportunities are complete.',action:'view-market',label:'Review Hot Spotting',eventId:''};
  if(data.market.focusRows.length)return{title:'Previous Hot Spotting remains available',meta:'Today’s MarketPulse is still pending. Review the previous opportunities without treating them as today’s priority.',action:'view-market',label:'View Hot Spotting',eventId:''};
  return{title:'Create the first conversation',meta:'The calendar is clear and no MarketPulse clients are ready yet. Open AGNT and begin with one purposeful pipeline call.',action:'open',label:'Open AGNT',eventId:''};
}
function dailyBriefingModel(now=new Date()){
  const market=dailyBriefingMarketModel(),appointments=appointmentEntriesForDate(todayKey()),nextAppointment=returningSnapshotUpcomingAppointment(now),followUps=todayFollowUpQueueModel(todayKey()),overdueFollowUps=dailyBriefingOverdueCount(followUps),pipeline=returningSnapshotPipelineCount(),data={market,appointments,nextAppointment,followUps,overdueFollowUps,pipeline};
  return{...data,plan:dailyBriefingPlan(now,data)};
}
function morningLiveUpdateModel(now=new Date()){
  const data=dailyBriefingModel(now),d=dayData(todayKey()),market=data.market,knockTarget=rollingKnockTarget(todayKey()),knockDone=Math.floor(liveKnockSeconds(d)/60),knockRemaining=Math.max(0,knockTarget-knockDone),freshEvents=market.fresh?market.events:[],influenced=market.fresh?market.influencedClientCount:0,priorityInfluenced=market.fresh?market.priorityInfluencedClientCount:0;
  let title='Your day is live. MarketPulse is next.',summary='Appointments and activity are current while AGNT waits for today’s market update.',marketCopy='Today’s MarketPulse has not arrived yet.';
  if(market.hasError){title='Your day is live. MarketPulse is reconnecting.';summary='Your existing appointments, activity and pipeline remain current.';marketCopy='AGNT is retaining the latest market context while the connection retries.'}
  else if(market.fresh&&freshEvents.length){title='The market moved this morning.';summary=`${freshEvents.length} property update${freshEvents.length===1?'':'s'} across ${market.suburbCount} suburb${market.suburbCount===1?'':'s'} influenced ${influenced} saved client${influenced===1?'':'s'}.`;marketCopy=influenced?`${influenced} unique saved client${influenced===1?' is':'s are'} connected to today’s activity${priorityInfluenced?` · ${priorityInfluenced} through Listed and Sold`:''}.`:'No saved clients are currently connected to today’s updated properties.'}
  else if(market.fresh){title='The market is quiet this morning.';summary='MarketPulse is current and no new property activity was reported.';marketCopy='No new MarketPulse changes are influencing saved clients today.'}
  const standardSession=prospectSessionActive&&!cleanText(prospectSessionContext?.eventId,160),next=data.nextAppointment;
  return{
    ...data,
    score:completion(todayKey()),
    title,summary,marketCopy,freshEvents,influenced,
    activity:[Math.max(0,targets.calls-d.calls),Math.max(0,targets.connects-d.connects),Math.max(0,targets.data-d.data)],
    appointmentValue:data.appointments.length?`${data.appointments.length} today`:'Clear',
    appointmentMeta:next?`Next ${appointmentTimeLabel(next.entry.appointment,next.entry.sourceDate)} · ${appointmentType(next.entry.appointment)}`:data.appointments.length?'No appointments remaining':'No appointments today',
    pipelineValue:standardSession?`${data.pipeline} left`:`${data.pipeline} ready`,
    pipelineMeta:standardSession?'Current session':'Eligible pipeline',
    knockingValue:knockRemaining?`${knockRemaining} min`:'Complete',
    knockingMeta:knockRemaining?(now.getHours()<14?'Starts at 2:00pm':'Remaining today'):`${knockDone} min completed`,
  };
}
function renderReturningSnapshot(){
  const screen=$('#returningSnapshotScreen');if(!screen)return;
  const now=new Date(),data=morningLiveUpdateModel(now),market=data.market;
  $('#returningSnapshotDate').textContent=now.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'short'});
  $('#returningSnapshotKicker').textContent='GOOD MORNING';$('#returningSnapshotScore').textContent=`${data.score}%`;$('#returningSnapshotTitle').textContent=data.title;$('#returningSnapshotPriority').textContent=data.summary;
  const marketStatus=$('#returningSnapshotMarketStatus');marketStatus.textContent=market.hasError?'Reconnecting':market.fresh?'Updated today':'Awaiting today';marketStatus.dataset.state=market.hasError?'error':market.fresh?'fresh':'waiting';
  $('#returningSnapshotClientCount').textContent=data.influenced;$('#returningSnapshotClientLabel').textContent=data.influenced===1?'client influenced':'clients influenced';$('#returningSnapshotMarketDebrief').textContent=data.marketCopy;
  const counts=[['Listed',market.fresh?market.listed:0,'listed'],['Sold',market.fresh?market.sold:0,'sold'],['Price',market.fresh?market.price:0,'price'],['Other',market.fresh?market.other:0,'other']];$('#returningSnapshotMarketCounts').innerHTML=counts.map(([label,value,state])=>`<span data-state="${state}"><strong>${value}</strong>${label}</span>`).join('');
  const eventRows=market.fresh?marketBriefingRows(market).slice(0,3):[],eventList=$('#returningSnapshotMarketEvents'),reviewButton=$('#returningSnapshotReviewMarket');if(eventList)eventList.innerHTML=eventRows.length?eventRows.map(row=>marketBriefingRowMarkup(row,{compact:true})).join(''):'';if(reviewButton){reviewButton.hidden=!market.events.length;reviewButton.textContent=market.events.length>3?`Review all ${market.events.length} properties`:'Review Market'}
  $('#returningSnapshotActivity').textContent=data.activity.join(' · ');$('#returningSnapshotAppointments').textContent=data.appointmentValue;$('#returningSnapshotAppointmentMeta').textContent=data.appointmentMeta;$('#returningSnapshotPipeline').textContent=data.pipelineValue;$('#returningSnapshotPipelineMeta').textContent=data.pipelineMeta;$('#returningSnapshotKnocking').textContent=data.knockingValue;$('#returningSnapshotKnockingMeta').textContent=data.knockingMeta;
}
function refreshReturningSnapshotIfVisible(){const screen=$('#returningSnapshotScreen');if(!screen||screen.classList.contains('hidden'))return;renderReturningSnapshot()}
function updateReturningSnapshotCountdown(){const label=$('#returningSnapshotCountdown');if(!label||!returningSnapshotEndsAt)return;const seconds=Math.max(0,Math.ceil((returningSnapshotEndsAt-Date.now())/1000));label.textContent=seconds?`Opening AGNT in ${seconds}s`:'Opening AGNT…'}
function dismissReturningSnapshot(){
  clearTimeout(returningSnapshotTimer);clearInterval(returningSnapshotCountdownTimer);returningSnapshotTimer=returningSnapshotCountdownTimer=null;returningSnapshotEndsAt=0;const screen=$('#returningSnapshotScreen');if(!screen)return;document.body.classList.remove('daily-briefing-open');$('#app')?.removeAttribute('inert');screen.classList.remove('is-running');screen.classList.add('is-leaving');screen.setAttribute('aria-hidden','true');setTimeout(()=>{screen.classList.add('hidden');requestAnimationFrame(()=>maybeShowTeamAppointmentNotice())},260);
}
function showReturningSnapshot(){
  const screen=$('#returningSnapshotScreen'),decision=morningLiveUpdateLaunchDecision();if(!screen||!decision.show)return false;renderReturningSnapshot();markReturningSnapshotReady();document.body.classList.add('daily-briefing-open');$('#app')?.setAttribute('inert','');screen.classList.remove('hidden','is-leaving','is-running');screen.setAttribute('aria-hidden','false');void screen.offsetWidth;screen.classList.add('is-running');returningSnapshotEndsAt=Date.now()+MORNING_LIVE_UPDATE_MS;updateReturningSnapshotCountdown();clearTimeout(returningSnapshotTimer);clearInterval(returningSnapshotCountdownTimer);returningSnapshotCountdownTimer=setInterval(updateReturningSnapshotCountdown,200);returningSnapshotTimer=setTimeout(dismissReturningSnapshot,MORNING_LIVE_UPDATE_MS);requestAnimationFrame(()=>screen.querySelector('.morning-live-shell')?.focus({preventScroll:true}));return true;
}
function navigateDailyPlanAction(action='open',eventId=''){
  if(action==='open')return;
  if(action==='edit-appointment'&&eventId){openAppointmentEditorFromToday(eventId);return}
  if(action==='market-insights'&&eventId){showAppointmentMarketInsights(eventId);return}
  if(action==='view-appointments'){switchView('appointmentsView');return}
  if(action==='view-today'){switchView('scheduleView');return}
  if(action==='view-log'){switchView('scheduleView');setTodayPage('log');return}
  if(action==='view-market'){marketPulseReturnTarget=activeViewId()==='todayView'?'home':'hotspotting';marketReviewFilter='all';marketPageMode='marketpulse';switchView('prospectingView');setProspectorSection('market');syncMarketPulseBackButton();renderProspecting();return}
  if(action==='view-buyer-matches'){switchView('prospectingView');buyerBrowseMode='active';buyerQuickFilter='All';setProspectorSection('buyers');renderProspecting();requestAnimationFrame(()=>document.querySelector('.buyer-card.has-buyer-matches')?.scrollIntoView({behavior:'smooth',block:'center'}));return}
  if(action==='view-followups'){openTodayFollowUpQueue();return}
  if(action==='view-pipeline'){switchView('prospectingView');prospectTodayMode='dashboard';setProspectorSection('today');renderProspecting();return}
  if(action==='resume-session'){switchView('prospectingView');if(cleanText(prospectSessionContext?.eventId,160))marketPageMode='hotspotting';setProspectorSection(cleanText(prospectSessionContext?.eventId,160)?'market':'today');showProspectingSession();return}
  if(action==='start-market'&&eventId){marketPageMode='hotspotting';switchView('prospectingView');setProspectorSection('market');renderProspecting();requestAnimationFrame(()=>startMarketPulseSession(eventId));return}
  if(action==='start-knocking'){if(eventId)selectedKnockingStreetKey=eventId;startKnockingSession()}
}
function openDailyBriefingDestination(action='open',eventId=''){
  dismissReturningSnapshot();navigateDailyPlanAction(action,eventId);
}
function welcomeProfileName(){return (agentName||currentUser?.displayName||'Agent').trim()||'Agent'}
function welcomeStorageKey(){return `${storagePrefix(uid)}welcome:${todayKey()}`}
function dayPlanStorageKey(k=todayKey()){return `${storagePrefix(uid)}day-plan:${k}`}
function dayReviewSeenKey(k=todayKey()){return `${storagePrefix(uid)}day-review-seen:${k}`}
function readDayPlan(k=todayKey()){try{return safeJsonParse(localStorage.getItem(dayPlanStorageKey(k))||'null',null)}catch{return null}}
function captureDayPlan(k=todayKey()){
  if(readDayPlan(k))return;
  const appointments=appointmentEntriesForDate(k).filter(({appointment:a})=>!isOfiAppointment(a)).map(({appointment:a,sourceDate})=>({id:a.id||calendarExportId(a,sourceDate),sourceDate,name:a.contactName||a.name||'Appointment',type:appointmentType(a),address:a.address||''}));
  const followUps=allFollowUpsForDate(k).map(item=>({id:item.id||item.prospect?.id||item.appointment?.id||'',name:item.name||item.prospect?.name||item.appointment?.contactName||item.appointment?.name||'Follow-up'}));
  const plan={date:k,capturedAt:Date.now(),targets:{calls:targets.calls,connects:targets.connects,data:targets.data,knock:rollingKnockTarget(k)},appointments,followUps};
  try{localStorage.setItem(dayPlanStorageKey(k),JSON.stringify(plan))}catch{}
}
function dayReviewSeen(k=todayKey()){try{return localStorage.getItem(dayReviewSeenKey(k))==='1'}catch{return false}}
function markDayReviewSeen(k=todayKey()){try{localStorage.setItem(dayReviewSeenKey(k),'1')}catch{}}
function welcomeSeenToday(){try{return localStorage.getItem(welcomeStorageKey())==='1'}catch{return false}}
function firstWelcomeName(){return welcomeProfileName().split(/\s+/).filter(Boolean)[0]||'Agent'}
function welcomeGreetingFor(date=new Date()){const hour=date.getHours();return hour<12?'Good morning':hour<17?'Good afternoon':'Good evening'}
function welcomeAppointmentDetail(a){
  const type=appointmentType(a),address=a.address||'Address not recorded',time=appointmentTimeLabel(a,todayKey());
  if(isOfiAppointment(a)){const start=timelineMinutes(a.time),end=timelineTimeLabel(start+appointmentDurationMinutes(a));return appointmentHasAuction(a)?`${type} · ${address} · ${time}–${end} · Auction ${timelineTimeLabel(start+15)}`:`${type} · ${address} · ${time}–${end}`;}
  return `${type} · ${address} · ${time}`;
}
function welcomeMomentumCopy(appointments,followUps){
  if(appointments.length){return{title:'Convert today, then build tomorrow.',text:'You have meaningful face-to-face opportunity today. Prepare well, leave each meeting with a next step, then create the next appointment.'}}
  if(followUps.length){return{title:'Turn warm conversations into clear next steps.',text:'Work the strongest follow-ups first, record the outcome and keep building tomorrow’s pipeline.'}}
  return{title:'Create the conversations that shape tomorrow.',text:'Your calendar is open. Use the space for focused prospecting and finish the day with a stronger pipeline than you started with.'};
}
function renderWelcomeScreen(){
  const screen=$('#welcomeScreen');if(!screen)return;
  const now=new Date(),k=todayKey(),appointments=appointmentEntriesForDate(k),followUps=allFollowUpsForDate(k),momentum=welcomeMomentumCopy(appointments,followUps);
  $('#welcomeName').textContent=firstWelcomeName();
  $('#welcomeGreetingText').textContent=welcomeGreetingFor(now);
  $('#welcomeDate').textContent=now.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'});
  const appointmentSummary=$('#welcomeAppointmentSummary'),appointmentList=$('#welcomeAppointmentList');
  appointmentSummary.textContent=appointments.length?`You’ve got ${appointments.length} appointment${appointments.length===1?'':'s'} today.`:'You’ve got no appointments today.';
  appointmentList.innerHTML=appointments.map(({appointment:a,sourceDate})=>`<article class="welcome-appointment"><time>${escapeHtml(appointmentTimeLabel(a,sourceDate))}</time><span class="welcome-appointment-dot" aria-hidden="true"></span><div><strong>${escapeHtml(isOfiAppointment(a)?'OFI':a.contactName||a.name||'Appointment')}</strong><small>${escapeHtml(welcomeAppointmentDetail(a))}</small></div></article>`).join('');
  appointmentList.classList.toggle('hidden',!appointments.length);
  $('#welcomePipelineText').textContent=followUps.length?`You’ve got ${followUps.length} pipeline follow-up${followUps.length===1?'':'s'} today.`:'You’ve got no pipeline follow-ups today.';
  $('#welcomeMomentumTitle').textContent=momentum.title;$('#welcomeMomentumText').textContent=momentum.text;
}
function showDailyWelcome(){
  const screen=$('#welcomeScreen');if(!screen||welcomeSeenToday())return;
  renderWelcomeScreen();screen.classList.remove('hidden','is-leaving');screen.setAttribute('aria-hidden','false');
}
function dismissDailyWelcome(){
  const screen=$('#welcomeScreen');if(!screen)return;
  captureDayPlan();markReturningSnapshotReady();
  try{localStorage.setItem(welcomeStorageKey(),'1')}catch{}
  screen.classList.add('is-leaving');screen.setAttribute('aria-hidden','true');setTimeout(()=>screen.classList.add('hidden'),320);
}
function offDayWeekDates(base=new Date()){
  const start=mondayOf(base);return Array.from({length:7},(_,index)=>{const d=new Date(start);d.setDate(start.getDate()+index);return d});
}
function offDayMetricSummary(base=new Date()){
  const today=todayKey(),dates=offDayWeekDates(base),elapsed=dates.filter(d=>workDays.includes(d.getDay())&&dateKey(d)<=today),keys=elapsed.map(dateKey);
  let calls=0,connects=0,data=0,knockMinutes=0,knockTarget=0,totalCompletion=0;
  keys.forEach(k=>{const d=dayData(k);calls+=d.calls;connects+=d.connects;data+=d.data;knockMinutes+=Math.floor(liveKnockSeconds(d)/60);knockTarget+=rollingKnockTarget(k);totalCompletion+=completion(k)});
  const count=keys.length,callsTarget=targets.calls*count,connectsTarget=targets.connects*count,dataTarget=targets.data*count;
  const score=count?Math.round((pct(calls,callsTarget)+pct(connects,connectsTarget)+pct(data,dataTarget)+pct(knockMinutes,Math.max(1,knockTarget)))/4):0;
  return{dates,keys,count,calls,connects,data,knockMinutes,callsTarget,connectsTarget,dataTarget,knockTarget,score,average:count?Math.round(totalCompletion/count):0};
}
function offDayReviewSummaryText(summary){
  if(!summary.count)return 'Your first scheduled day is still ahead. Use this page to review appointments already booked for the week.';
  const metrics=[['Calls',summary.calls,summary.callsTarget],['Connects',summary.connects,summary.connectsTarget],['Data',summary.data,summary.dataTarget],['Knocking',summary.knockMinutes,summary.knockTarget]],strongest=metrics.slice().sort((a,b)=>pct(b[1],b[2])-pct(a[1],a[2]))[0],weakest=metrics.slice().sort((a,b)=>pct(a[1],a[2])-pct(b[1],b[2]))[0];
  if(summary.score>=100)return `All week-to-date activity targets are complete. ${strongest[0]} is leading your performance.`;
  if(summary.score>=80)return `A strong week so far. ${strongest[0]} is leading, with ${weakest[0].toLowerCase()} the clearest opportunity.`;
  if(summary.score>=50)return `The week is moving. ${strongest[0]} is your strongest metric and ${weakest[0].toLowerCase()} needs the most attention.`;
  return `There is room to lift the week. Start with ${weakest[0].toLowerCase()} when the next scheduled day begins.`;
}
function offDayAppointmentMeta(item){
  const date=validDateKey(item.scheduledDate)?parseKey(item.scheduledDate):null,dateText=date?date.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'short'}):'Date not recorded',timeText=item.time?timelineTimeLabel(timelineMinutes(item.time)):'Time not recorded';
  return `${dateText} · ${timeText}`;
}
function renderOffDayReview(){
  const screen=$('#offDayReviewScreen');if(!screen)return;const now=new Date(),summary=offDayMetricSummary(now),weekStart=summary.dates[0],weekEnd=summary.dates[6],details=leaderboardAppointmentDetailsForWeek(now),counts=appointmentCountsForWeek(now);
  $('#offDayReviewRange').textContent=`${weekStart.toLocaleDateString('en-AU',{day:'numeric',month:'short'})} — ${weekEnd.toLocaleDateString('en-AU',{day:'numeric',month:'short'})}`;
  $('#offDayReviewScore').textContent=`${summary.score}%`;$('#offDayReviewSummary').textContent=offDayReviewSummaryText(summary);
  const metrics=[['Calls',summary.calls,summary.callsTarget,''],['Connects',summary.connects,summary.connectsTarget,''],['Data',summary.data,summary.dataTarget,''],['Knocking',summary.knockMinutes,summary.knockTarget,' min']];
  $('#offDayMetricGrid').innerHTML=metrics.map(([label,value,target,suffix])=>`<article><span>${escapeHtml(label)}</span><strong>${value}${suffix}</strong><small>of ${target}${suffix}</small><i><b style="width:${pct(value,Math.max(1,target))}%"></b></i></article>`).join('');
  const today=todayKey();$('#offDayDayList').innerHTML=summary.dates.map(date=>{const k=dateKey(date),scheduled=workDays.includes(date.getDay()),future=k>today,p=scheduled&&!future?completion(k):0,status=!scheduled?'Rest':future?'Next':p>=100?'Done':p?`${p}%`:'—';return `<article class="${!scheduled?'rest':future?'upcoming':p>=100?'complete':''}" title="${escapeHtml(date.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'}))}"><span>${date.toLocaleDateString('en-AU',{weekday:'short'}).replace('.','')}</span><strong>${escapeHtml(status)}</strong></article>`}).join('');
  $('#offDayAppointmentCounts').innerHTML=['MAP','LAP','BAP'].map(type=>`<span><strong>${counts[type]||0}</strong>${type}</span>`).join('');
  $('#offDayAppointmentList').innerHTML=details.length?details.map(item=>`<article><span class="offday-appointment-type">${escapeHtml(item.type)}</span><div><strong>${escapeHtml(item.contactName||item.address||'Appointment')}</strong><small>${escapeHtml(item.address||'Address not recorded')}</small><em>${escapeHtml(offDayAppointmentMeta(item))}</em></div></article>`).join(''):`<div class="offday-empty"><strong>No appointments booked</strong><span>MAP, LAP and BAP appointments booked during this week will appear here.</span></div>`;
}
function showOffDayReview(){
  const screen=$('#offDayReviewScreen');if(!screen||offDayReviewDismissedThisSession||isWorkDayKey(todayKey()))return false;renderOffDayReview();screen.classList.remove('hidden','is-leaving');screen.setAttribute('aria-hidden','false');return true;
}
function dismissOffDayReview(){
  const screen=$('#offDayReviewScreen');if(!screen)return;offDayReviewDismissedThisSession=true;screen.classList.add('is-leaving');screen.setAttribute('aria-hidden','true');setTimeout(()=>screen.classList.add('hidden'),320);
}
function showLaunchExperience(){
  if(morningLiveLaunchEvaluated)return;
  morningLiveLaunchEvaluated=true;
  if(showReturningSnapshot())return;
  showOffDayReview();
}
function currentDayPlan(k=todayKey()){
  const saved=readDayPlan(k);if(saved)return saved;
  const appointments=appointmentEntriesForDate(k).map(({appointment:a,sourceDate})=>({id:a.id||calendarExportId(a,sourceDate),sourceDate,name:a.contactName||a.name||'Appointment',type:appointmentType(a),address:a.address||''}));
  const followUps=allFollowUpsForDate(k).map(item=>({id:item.id||item.prospect?.id||item.appointment?.id||'',name:item.name||item.prospect?.name||item.appointment?.contactName||item.appointment?.name||'Follow-up'}));
  return{date:k,targets:{calls:targets.calls,connects:targets.connects,data:targets.data,knock:rollingKnockTarget(k)},appointments,followUps};
}
function dayReviewSummary(k=todayKey()){
  const plan=currentDayPlan(k),d=dayData(k),target=plan.targets||{},knock=Math.floor(liveKnockSeconds(d)/60);
  const currentDueIds=new Set(allFollowUpsForDate(k).map(item=>String(item.id||item.prospect?.id||item.appointment?.id||'')));
  const followUpTotal=plan.followUps?.length||0,followUpsCleared=(plan.followUps||[]).filter(item=>item.id&&!currentDueIds.has(String(item.id))).length;
  const appointmentTotal=plan.appointments?.length||0;
  const appointmentsCompleted=(plan.appointments||[]).filter(item=>{const entry=appointmentEntriesForDate(k).find(({appointment:a,sourceDate})=>String(a.id||calendarExportId(a,sourceDate))===String(item.id));return entry&&appointmentLifecycle(entry.appointment,entry.sourceDate)==='completed'}).length;
  const metrics=[['Calls',d.calls,target.calls||targets.calls],['Connects',d.connects,target.connects||targets.connects],['Data',d.data,target.data||targets.data],['Knocking',knock,target.knock||rollingKnockTarget(k)]];
  const goalsHit=metrics.filter(([,value,goal])=>value>=goal).length,score=completion(k);
  let title='Day reviewed. Tomorrow is clearer.';
  let coach='Carry the unfinished priorities forward and protect the first prospecting block.';
  if(goalsHit===4){title='You closed the loop.';coach='All four activity goals were achieved. Start tomorrow by building on the strongest conversations from today.'}
  else if(goalsHit>=2){title='Good progress. Finish with intent.';coach='You moved the day forward. Note the missed targets and make them tomorrow’s first controllable wins.'}
  else if(score<35){title='Reset, don’t drift.';coach='Today fell short of the plan. Keep tomorrow simple: start on time, clear the follow-ups and build momentum early.'}
  return{plan,metrics,goalsHit,score,followUpTotal,followUpsCleared,appointmentTotal,appointmentsCompleted,title,coach};
}
function renderDayReview(){
  const overlay=$('#dayReviewOverlay');if(!overlay)return;const summary=dayReviewSummary();
  $('#dayReviewScore').textContent=`${summary.score}%`;$('#dayReviewTitle').textContent=summary.title;$('#dayReviewCoach').textContent=summary.coach;
  $('#dayReviewMetrics').innerHTML=summary.metrics.map(([label,value,goal])=>`<article class="day-review-metric ${value>=goal?'complete':''}"><span>${escapeHtml(label)}</span><strong>${label==='Knocking'?`${value}m`:value}</strong><small>of ${label==='Knocking'?`${goal}m`:goal}</small></article>`).join('');
  $('#dayReviewPlan').innerHTML=`<div><strong>${summary.appointmentsCompleted}/${summary.appointmentTotal}</strong><span>Morning appointments completed</span></div><div><strong>${summary.followUpsCleared}/${summary.followUpTotal}</strong><span>Morning follow-ups cleared</span></div><div><strong>${summary.goalsHit}/4</strong><span>Daily activity goals achieved</span></div>`;
}
function showDayReview({automatic=false}={}){
  if(!isWorkDayKey(todayKey()))return;const overlay=$('#dayReviewOverlay');if(!overlay)return;if(automatic&&dayReviewSeen())return;
  renderDayReview();overlay.classList.remove('hidden');overlay.setAttribute('aria-hidden','false');document.body.classList.add('day-review-open');
}
function closeDayReview(){const overlay=$('#dayReviewOverlay');if(!overlay)return;markDayReviewSeen();overlay.classList.add('hidden');overlay.setAttribute('aria-hidden','true');document.body.classList.remove('day-review-open')}
function maybeShowDayReview(){const now=new Date();if(now.getHours()<18||!welcomeSeenToday()||dayReviewSeen())return;showDayReview({automatic:true})}
function leaderboardPayload(){
  const k=todayKey(),d=dayData(k),knockMinutes=Math.floor(liveKnockSeconds(d)/60),knockTarget=rollingKnockTarget(k);
  return{uid,name:displayAgentName(),email:currentUser?.email||'',date:k,activeToday:isWorkDayKey(k),workDays:[...workDays],calls:d.calls,connects:d.connects,data:d.data,knockMinutes,score:completion(k),targets:{calls:targets.calls,connects:targets.connects,data:targets.data,knock:knockTarget},appointments:appointmentCountsForDate(k),appointmentDetails:leaderboardAppointmentDetailsForDate(k),dailyHistory:recentDailyHistory(),weekHistory:recentWeekHistory(),weeklyKnockTarget:targets.weeklyKnock,clientUpdatedAt:Date.now(),updatedAt:serverTimestamp()}
}
function leaderboardSignature(payload){const clean={...payload};delete clean.clientUpdatedAt;delete clean.updatedAt;return JSON.stringify(clean)}
function scheduleLeaderboardPublish(){
  if(!cloud||!db||!uid)return;
  if(accountMode==='solo'){
    leaderboardEntries=[leaderboardPayload()];
    renderLeaderboard();
  }
  clearTimeout(leaderboardPublishTimer);
  leaderboardPublishTimer=setTimeout(()=>{
    if(accountMode==='team')publishTeamLeaderboard();
    else if(accountMode==='solo')publishLeaderboard();
  },180);
}
async function publishLeaderboard(){if(!cloud||!db||!uid||accountMode!=='solo')return;const payload=leaderboardPayload(),signature=leaderboardSignature(payload);if(signature===lastLeaderboardSignature){renderLeaderboardStatus();return}beginSyncOperation();try{await setDoc(doc(db,'leaderboard',uid),payload,{merge:true});lastLeaderboardSignature=signature;endSyncOperation();renderLeaderboardStatus()}catch(err){console.error('Leaderboard publish failed',err);endSyncOperation({error:true});renderLeaderboardStatus()}}
async function persistDayToCloud(k,clean,{quiet=false}={}){
  if(!cloud||!db||!uid)return;
  beginSyncOperation();
  try{await setDoc(doc(db,'users',uid,'days',k),{...clean,updatedAt:serverTimestamp()},{merge:true});clearDayDirty(k,clean.clientUpdatedAt);if(k===todayKey())scheduleLeaderboardPublish();endSyncOperation()}
  catch(err){console.error('Day sync failed',err);endSyncOperation({error:true});if(!quiet)toast('Saved on this device. Cloud sync failed.');throw err}
}
async function saveDay(k,{quiet=false,awaitCloud=true,render=true}={}){
  if(!validDateKey(k))return;
  const clean={...dayData(k),clientUpdatedAt:Date.now()};days[k]=clean;markDayDirty(k);
  saveLocal();if(render)renderDayViews();
  if(!cloud)return;
  const previous=daySaveChains.get(k)||Promise.resolve();
  const next=previous.catch(()=>{}).then(()=>persistDayToCloud(k,{...days[k]},{quiet}));
  daySaveChains.set(k,next);
  const release=()=>{if(daySaveChains.get(k)===next)daySaveChains.delete(k)};
  if(!awaitCloud){next.catch(err=>console.error('Deferred day sync failed',err)).finally(release);return}
  try{await next}finally{release()}
}
async function saveTargets(){saveLocal();if(!cloud)return;beginSyncOperation();try{await setDoc(doc(db,'users',uid),{targets,workDays:[...workDays],name:displayAgentName(),email:currentUser?.email||'',marketPulseForwardEmail:normaliseMarketPulseEmail(currentUser?.email),marketPulseAutomationVersion:1,updatedAt:serverTimestamp()},{merge:true});scheduleLeaderboardPublish();endSyncOperation()}catch(err){console.error(err);endSyncOperation({error:true});toast('Targets saved locally. Cloud sync failed.')}}
function addEvent(d,type,label,delta=0){d.events.push({id:uuid(),type,label,delta,at:Date.now()});d.events=d.events.slice(-500)}

function emptyLeaderboardAppointmentCounts(value=0){return{MAP:value,LAP:value,BAP:value}}
function appointmentCountsBetween(startKey,endKey){
  const counts=emptyLeaderboardAppointmentCounts();
  Object.entries(days).forEach(([sourceDate,raw])=>(raw?.appointments||[]).forEach(appointment=>{
    const bookedDate=appointmentCreatedDate(appointment,sourceDate),type=appointmentType(appointment);
    if(bookedDate>=startKey&&bookedDate<=endKey&&Object.prototype.hasOwnProperty.call(counts,type))counts[type]++;
  }));
  return counts;
}
function appointmentCountsForDate(k){return appointmentCountsBetween(k,k)}
function appointmentCountsForWeek(baseDate){const start=mondayOf(baseDate),end=new Date(start);end.setDate(start.getDate()+6);return appointmentCountsBetween(dateKey(start),dateKey(end))}
function leaderboardAppointmentDetailsBetween(startKey,endKey){
  const details=[];
  Object.entries(days).forEach(([sourceDate,raw])=>(raw?.appointments||[]).forEach(appointment=>{
    const bookedDate=appointmentCreatedDate(appointment,sourceDate),type=appointmentType(appointment);
    if(bookedDate<startKey||bookedDate>endKey||!['MAP','LAP','BAP'].includes(type))return;
    details.push({type,bookedDate,scheduledDate:appointmentScheduledDate(appointment,sourceDate),time:appointment.time||'',contactName:appointment.contactName||appointment.name||'',address:appointment.address||'',assignedToUid:String(appointment.assignedToUid||''),assignedToName:String(appointment.assignedToName||'')});
  }));
  prospects.forEach(prospect=>{const at=Number(prospect.dataCreditedAt)||0;if(!at)return;const bookedDate=dateKey(new Date(at));if(bookedDate<startKey||bookedDate>endKey)return;const isBuyer=prospect.recordType==='buyer',buyerConfig=isBuyer?buyerConfigText(prospect):'',buyerBudget=isBuyer?buyerBudgetText(prospect.buyerBudgetMin,prospect.buyerBudgetMax):'',buyerSummary=isBuyer?[buyerConfig!=='Configuration not set'?buyerConfig:'',buyerBudget!=='—'?buyerBudget:''].filter(Boolean).join(' · '):'';details.push({type:isBuyer?'Buyer':'Data',bookedDate,scheduledDate:'',time:'',contactName:prospect.name||'',address:isBuyer?(buyerSummary||'Buyer criteria not set'):(formatProspectAddress(prospect.address||prospect.company,prospect.suburb)||prospect.address||'')})});
  return details.sort((a,b)=>String(a.bookedDate||'').localeCompare(String(b.bookedDate||''))||String(a.scheduledDate||'').localeCompare(String(b.scheduledDate||''))||String(a.time||'').localeCompare(String(b.time||''))||String(a.contactName||'').localeCompare(String(b.contactName||'')));
}
function leaderboardAppointmentDetailsForDate(k){return leaderboardAppointmentDetailsBetween(k,k)}
function leaderboardAppointmentDetailsForWeek(baseDate){const start=mondayOf(baseDate),end=new Date(start);end.setDate(start.getDate()+6);return leaderboardAppointmentDetailsBetween(dateKey(start),dateKey(end))}
function normaliseLeaderboardAppointmentDetails(value){
  if(!Array.isArray(value))return null;
  return value.map(item=>({type:normaliseAppointmentType(item?.type),bookedDate:validDateKey(item?.bookedDate)?item.bookedDate:'',scheduledDate:validDateKey(item?.scheduledDate)?item.scheduledDate:'',time:String(item?.time||''),contactName:String(item?.contactName||''),address:String(item?.address||''),assignedToUid:String(item?.assignedToUid||''),assignedToName:String(item?.assignedToName||'')})).filter(item=>['MAP','LAP','BAP','DATA','BUYER'].includes(item.type)).map(item=>({...item,type:item.type==='DATA'?'Data':item.type==='BUYER'?'Buyer':item.type}));
}
function normaliseLeaderboardAppointmentCounts(value){
  if(!value||typeof value!=='object')return emptyLeaderboardAppointmentCounts(null);
  const count=raw=>raw==null?null:Number.isFinite(Number(raw))?Math.max(0,Math.round(Number(raw))):null;
  return{MAP:count(value.MAP),LAP:count(value.LAP),BAP:count(value.BAP)};
}
function dailyLeaderboardRecord(k){
  const d=dayData(k),knockMinutes=Math.floor(liveKnockSeconds(d)/60),knockTarget=rollingKnockTarget(k);
  return{calls:d.calls,connects:d.connects,data:d.data,knockMinutes,score:completion(k),targets:{calls:targets.calls,connects:targets.connects,data:targets.data,knock:knockTarget},appointments:appointmentCountsForDate(k),appointmentDetails:leaderboardAppointmentDetailsForDate(k)};
}
function recentDailyHistory(count=21){
  const history={},d=new Date();
  for(let i=0;i<60&&Object.keys(history).length<count;i++){
    const k=dateKey(d);
    if(workDays.includes(d.getDay()))history[k]=dailyLeaderboardRecord(k);
    d.setDate(d.getDate()-1);
  }
  return history;
}
function previousScheduledKey(k,daysList=workDays){
  const d=parseKey(k);
  for(let i=0;i<14;i++){
    d.setDate(d.getDate()-1);
    if((daysList||workDays).includes(d.getDay()))return dateKey(d);
  }
  return null;
}
function workdayStart(now=new Date()){
  const start=new Date(now);start.setHours(9,0,0,0);return start;
}
function workdayEnd(now=new Date()){
  const end=new Date(now);end.setHours(17,0,0,0);return end;
}
function accountabilityDayProgress(now=new Date()){
  const start=workdayStart(now),end=workdayEnd(now);
  if(now<=start)return 0;
  if(now>=end)return 1;
  return Math.max(0,Math.min(1,(now-start)/(end-start)));
}
function nextPaceCheckpoint(now=new Date()){
  const start=workdayStart(now),closing=workdayEnd(now);
  if(now<start){const checkpoint=new Date(start);checkpoint.setMinutes(30,0,0);return checkpoint}
  const mins=now.getMinutes(),checkpoint=new Date(now);
  if(mins<30)checkpoint.setMinutes(30,0,0);else checkpoint.setHours(now.getHours()+1,0,0,0);
  if(checkpoint>closing)checkpoint.setTime(closing.getTime());
  return checkpoint;
}
function shortTime(d){return d.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit',hour12:true}).replace(' ','').toLowerCase()}
function expectedAt(metric,target,when=new Date()){
  return Math.min(target,Math.round(target*accountabilityDayProgress(when)));
}
function welcomeMessage(){
  const hour=new Date().getHours(),raw=(displayAgentName().split(/\s+/)[0]||'Agent');
  const name=raw.charAt(0).toUpperCase()+raw.slice(1).toLowerCase();
  const greeting=hour<12?'Good Morning':hour<17?'Good Afternoon':'Good Evening';
  return `${greeting}, ${name}`;
}
function metricRemainingText(value,target){
  const remaining=Math.max(0,target-value);
  return remaining===0?'Target complete':`${remaining} remaining`;
}
function metricPaceText(value,target,metric){
  if(selectedDate!==todayKey())return value>=target?'Daily goal achieved':'Final result';
  const now=new Date(),start=workdayStart(now),end=workdayEnd(now);
  if(value>=target)return 'Daily goal achieved';
  if(now<start)return value>0?`${value} ahead of target`:'Ready to start';
  if(now>=end)return `${Math.max(0,target-value)} remaining today`;
  const expected=expectedAt(metric,target,now),diff=value-expected,checkpoint=nextPaceCheckpoint(now);
  const checkpointExpected=expectedAt(metric,target,checkpoint);
  const action=Math.max(0,Math.min(target-value,checkpointExpected-value));
  if(diff>0)return `${diff} ahead of target`;
  if(action>0){
    const labels={calls:'calls',connects:'connects',data:'data records'};
    const unit=action===1?{calls:'call',connects:'connect',data:'data record'}[metric]:labels[metric];
    return `${action} ${unit} needed by ${shortTime(checkpoint)}`;
  }
  return 'On track';
}
function knockRemainingText(minutes,target){
  const remaining=Math.max(0,target-minutes);
  if(selectedDate===todayKey()){
    const end=new Date();end.setHours(17,0,0,0);
    if(new Date()>=end&&remaining>0)return `${remaining} mins added tomorrow`;
  }
  return remaining===0?'Target complete':`${remaining} min remaining today`;
}
function knockPaceText(minutes,target){
  if(selectedDate!==todayKey())return minutes>=target?'Daily goal achieved':'Final result';
  const now=new Date(),start=new Date(now),end=new Date(now);
  start.setHours(14,0,0,0);
  end.setHours(17,0,0,0);
  if(minutes>=target)return 'Daily goal achieved';
  if(now>=end)return 'Fell short';
  if(now<start)return minutes>0?`${minutes} min ahead of target`:'Start at 2:00pm';
  const expected=expectedKnockAt(target,now);
  return minutes>=expected?'On track':'Off track';
}

function expectedKnockAt(target,when=new Date()){
  const start=new Date(when),end=new Date(when);
  start.setHours(14,0,0,0);
  end.setHours(17,0,0,0);
  if(when<start)return 0;
  if(when>=end)return target;
  return Math.min(target,Math.round(target*((when-start)/(end-start))));
}
function minutesUntil(hour,minute=0,now=new Date()){
  const end=new Date(now);end.setHours(hour,minute,0,0);
  return Math.max(0,(end-now)/60000);
}
function feasibilityState(requiredMinutes,availableMinutes){
  if(requiredMinutes<=0)return 'on';
  if(availableMinutes<=0)return 'off';
  const load=requiredMinutes/availableMinutes;
  if(load<=0.75)return 'on';
  if(load<=1)return 'risk';
  return 'off';
}
function dayTrackState(k=selectedDate){
  if(!isWorkDayKey(k))return 'on';
  const d=dayData(k),knockTarget=rollingKnockTarget(k),knockMinutes=Math.floor(liveKnockSeconds(d)/60);
  if(k!==todayKey())return d.calls>=targets.calls&&d.connects>=targets.connects&&d.data>=targets.data&&knockMinutes>=knockTarget?'on':'off';

  const now=new Date(),coreAvailable=minutesUntil(17,0,now);
  const states=[];
  const capacityPerHour={calls:10,connects:5,data:2};
  for(const metric of ['calls','connects','data']){
    const remaining=Math.max(0,targets[metric]-d[metric]);
    const requiredMinutes=(remaining/capacityPerHour[metric])*60;
    states.push(feasibilityState(requiredMinutes,coreAvailable));
  }

  const knockStart=new Date(now);knockStart.setHours(14,0,0,0);
  if(now>=knockStart){
    const knockAvailable=minutesUntil(17,0,now);
    const knockRemaining=Math.max(0,knockTarget-knockMinutes);
    states.push(feasibilityState(knockRemaining,knockAvailable));
  }

  if(states.includes('off'))return 'off';
  if(states.includes('risk'))return 'risk';
  return 'on';
}
function isDayOnTrack(k=selectedDate){return dayTrackState(k)==='on'}
function momentumWhisper(){
  if(selectedDate!==todayKey()){
    const previous=previousScheduledKey(selectedDate),change=previous?completion(selectedDate)-completion(previous):0;
    if(!previous)return `${completion(selectedDate)}% recorded`;
    if(change===0)return 'Level with the previous workday';
    return `${change>0?'▲':'▼'} ${Math.abs(change)}% vs previous workday`;
  }
  if(!isWorkDayKey(selectedDate))return 'Recovery day · next scheduled day is ready';
  const run=streak(),previous=previousScheduledKey(todayKey()),change=previous?completion(todayKey())-completion(previous):0;
  if(run>=2)return `${run}-day run · protect the momentum`;
  if(change>0)return `▲ ${change}% ahead of your last workday`;
  if(change<0)return `▼ ${Math.abs(change)}% below your last workday · time to respond`;
  return completion(todayKey())>0?'Momentum building today':'First action starts the momentum';
}
function todayGuidance(){
  if(selectedDate!==todayKey())return `${fmtDate(selectedDate)} · ${completion(selectedDate)}% complete`;
  if(!isWorkDayKey(selectedDate))return 'No accountability targets scheduled today';
  const d=dayData(selectedDate),kt=rollingKnockTarget(selectedDate),remaining={
    calls:Math.max(0,targets.calls-d.calls),
    connects:Math.max(0,targets.connects-d.connects),
    data:Math.max(0,targets.data-d.data),
    knocking:Math.max(0,kt-Math.floor(liveKnockSeconds(d)/60))
  };
  const labels={calls:'calls',connects:'connects',data:'data',knocking:'knocking minutes'};
  const pcts={calls:pct(d.calls,targets.calls),connects:pct(d.connects,targets.connects),data:pct(d.data,targets.data),knocking:pct(liveKnockSeconds(d)/60,kt)};
  const weakest=Object.entries(pcts).sort((a,b)=>a[1]-b[1])[0]?.[0]||'calls';
  const total=Object.values(remaining).reduce((a,b)=>a+b,0);
  const now=new Date(),planningStart=new Date(now);planningStart.setHours(18,30,0,0);
  if(now>=planningStart)return 'Calendar Management / Plan Tomorrow';
  if(total===0)return 'All daily targets complete. Keep building tomorrow’s pipeline.';
  return `Focus Now: ${metricLabel(weakest)} · ${remaining[weakest]} ${labels[weakest]} remaining`;
}
function rollingKnockTarget(k){const weekStart=mondayOf(parseKey(k));const ordered=weekKeys(weekStart);let prior=0,seen=0;for(const key of ordered){if(key===k)break;prior+=Math.floor(liveKnockSeconds(dayData(key))/60);seen++}return Math.ceil(Math.max(0,targets.weeklyKnock-prior)/Math.max(1,ordered.length-seen))}
function completion(k){if(!isWorkDayKey(k))return 0;const d=dayData(k),kt=rollingKnockTarget(k);return Math.round((pct(d.calls,targets.calls)+pct(d.connects,targets.connects)+pct(d.data,targets.data)+pct(liveKnockSeconds(d)/60,kt))/4)}
function weekSummary(base=parseKey(selectedDate)){const ks=weekKeys(base);let calls=0,connects=0,data=0,knock=0,complete=0,total=0;ks.forEach(k=>{const d=dayData(k);calls+=d.calls;connects+=d.connects;data+=d.data;knock+=liveKnockSeconds(d);const c=completion(k);total+=c;if(c>=100)complete++});const count=Math.max(1,ks.length);return{calls,connects,data,knock,complete,avg:Math.round(total/count),score:Math.round((pct(calls,targets.calls*count)+pct(connects,targets.connects*count)+pct(data,targets.data*count)+pct(knock/60,targets.weeklyKnock))/4),count}}
function weekKeyFromDate(base=new Date()){return dateKey(mondayOf(base))}
function weekDateFromOffset(offset=0){const d=mondayOf(new Date());d.setDate(d.getDate()+offset*7);return d}
function weekSummaryFor(baseDate){
  const summary=weekSummary(baseDate), count=Math.max(1,summary.count);
  const metricPcts={
    calls:pct(summary.calls,targets.calls*count),
    connects:pct(summary.connects,targets.connects*count),
    data:pct(summary.data,targets.data*count),
    knocking:pct(summary.knock/60,targets.weeklyKnock)
  };
  const weakest=Object.entries(metricPcts).sort((a,b)=>a[1]-b[1])[0];
  return{weekKey:weekKeyFromDate(baseDate),weekStart:dateKey(mondayOf(baseDate)),workDays:[...workDays],calls:summary.calls,connects:summary.connects,data:summary.data,knockMinutes:Math.floor(summary.knock/60),score:summary.score,targets:{calls:targets.calls*count,connects:targets.connects*count,data:targets.data*count,knock:targets.weeklyKnock},appointments:appointmentCountsForWeek(baseDate),appointmentDetails:leaderboardAppointmentDetailsForWeek(baseDate),metricPcts,weakestMetric:weakest?.[0]||'calls',weakestPct:weakest?.[1]||0};
}
function recentWeekHistory(){
  const history={};
  for(let offset=0;offset>=-11;offset--){const d=weekDateFromOffset(offset),w=weekSummaryFor(d);history[w.weekKey]=w}
  return history;
}
function streak(){let n=0,d=new Date();for(let i=0;i<730;i++){if(workDays.includes(d.getDay())){const k=dateKey(d);if(k===todayKey()&&completion(k)<100){d.setDate(d.getDate()-1);continue}if(completion(k)>=100)n++;else break}d.setDate(d.getDate()-1)}return n}

async function changeMetric(metric,delta){if(!canEditDate(selectedDate))return lockedToast();const d=dayData(selectedDate);d[metric]=Math.max(0,d[metric]+delta);addEvent(d,metric,`${metric} ${delta>0?'+1':'−1'}`,delta);days[selectedDate]=d;haptic();await saveDay(selectedDate)}
async function toggleTimer(){if(!canEditDate(selectedDate))return lockedToast();const d=dayData(selectedDate);if(d.timerStartedAt){d.knockSeconds=liveKnockSeconds(d);d.timerStartedAt=null;addEvent(d,'knock','Knocking paused')}else{d.timerStartedAt=Date.now();d.alarmPlayed=false;addEvent(d,'knock','Knocking started')}days[selectedDate]=d;haptic(18);await saveDay(selectedDate,{awaitCloud:false});ensureTick()}
async function resetKnock(){if(!canEditDate(selectedDate))return lockedToast();if(!confirm('Reset knocking time for this date?'))return;const d=dayData(selectedDate);d.knockSeconds=0;d.timerStartedAt=null;d.alarmPlayed=false;addEvent(d,'knock','Knocking reset');days[selectedDate]=d;await saveDay(selectedDate);ensureTick()}
async function finaliseExpiredTimers(){const today=todayKey();for(const [k,raw] of Object.entries(days)){if(k<today&&raw?.timerStartedAt){const d=dayData(k);d.knockSeconds=liveKnockSeconds(d);d.timerStartedAt=null;d.alarmPlayed=true;addEvent(d,'knock','Knocking stopped automatically at day close');days[k]=d;await saveDay(k,{quiet:true})}}}
function renderKnockTimerOnly(){
  const d=dayData(selectedDate),kt=rollingKnockTarget(selectedDate),secs=liveKnockSeconds(d);
  const past=isPastDate(selectedDate),scheduled=isWorkDayKey(selectedDate);
  $('#knockValue').textContent=fmtTimer(secs);
  $('#knockTargetText').textContent=past?'Final result':(!scheduled?'No target today':knockRemainingText(Math.floor(secs/60),kt));
  $('#knockRemaining').textContent=past?'Day locked':(!scheduled?'Not scheduled':knockPaceText(Math.floor(secs/60),kt));
  const knockMinutes=Math.floor(secs/60),knockActual=pct(knockMinutes,kt);
  const knockPaceNow=new Date(),knockPaceEnd=new Date(knockPaceNow);knockPaceEnd.setHours(17,0,0,0);const knockExpected=(selectedDate===todayKey()&&scheduled)?(knockPaceNow>=knockPaceEnd?100:Math.min(100,Math.round(expectedKnockAt(kt,knockPaceNow)/Math.max(1,kt)*100))):0;
  const knockRing=$('#knockPercent');
  if(knockRing){
    knockRing.textContent=`${knockActual}%`;
    knockRing.style.setProperty('--actual',knockActual);
    knockRing.style.setProperty('--pace',knockExpected);
    knockRing.classList.toggle('complete',knockActual>=100);
    knockRing.setAttribute('aria-label',`Knocking: ${knockActual}% complete, expected pace ${knockExpected}%, target ${kt} minutes`);
  }
}
function ensureTick(){clearInterval(timerTick);if(dayData(selectedDate).timerStartedAt)timerTick=setInterval(()=>{renderKnockTimerOnly();renderKnockingSessionTimerOnly();const d=dayData(selectedDate),target=rollingKnockTarget(selectedDate)*60;if(liveKnockSeconds(d)>=target&&!d.alarmPlayed){d.alarmPlayed=true;days[selectedDate]=d;saveDay(selectedDate,{quiet:true,awaitCloud:false,render:false});alarm()}},1000)}
function alarm(){haptic([180,100,180]);toast('Today’s knocking target reached');try{const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.value=.17;o.start();o.stop(c.currentTime+.7)}catch{}}

function formatHour(h){return `${h%12||12}:00 ${h>=12?'PM':'AM'}`}
function renderCallPlan(){const now=new Date(),h=now.getHours();let current=CALL_PLAN.find(x=>x[0]===h);if(h<9)current=[8,'Prepare your priority list','Before 9:00 AM'];if(h>=17)current=[17,'Review follow-up and plan tomorrow','9:00 AM–5:00 PM call day complete'];$('#currentCall').textContent=current[1];$('#currentSlot').textContent=h>=9&&h<17?`${formatHour(h)}–${formatHour(h+1)} · 10 call target`:current[2];$('#callPlan').innerHTML=CALL_PLAN.map(([hour,title,note])=>`<div class="call-row ${hour===h?'active':''}"><b>${formatHour(hour)}</b><span><strong>${title}</strong><small>${note}</small></span><em>10</em></div>`).join('')}
function callsPaceText(value){if(selectedDate!==todayKey())return `${Math.max(0,targets.calls-value)} remaining`;const expected=expectedAt('calls',targets.calls,new Date()),diff=value-expected;return value>=targets.calls?'Target complete':diff===0?'On track':diff>0?`${diff} ahead of target`:`${Math.abs(diff)} behind target`}
function activeViewId(){return document.querySelector('.view.active')?.id||'todayView'}
function pageHeaderState(id=activeViewId()){
  if(id==='todayView')return{title:welcomeMessage(),subtitle:''};
  if(id==='scheduleView'){
    const count=timelineItemsForDate(selectedDate).filter(item=>item.kind==='appointment').length;
    if(selectedDate<todayKey())return{title:'Your Schedule',subtitle:'Review how the day unfolded.'};
    if(selectedDate>todayKey())return{title:'Your Schedule',subtitle:count?`${count} appointment${count===1?'':'s'} shape this day.`:'Plan ahead before the day fills.'};
    if(!isWorkDayKey(selectedDate))return{title:'Your Schedule',subtitle:'No workday schedule is set.'};
    return{title:'Your Schedule',subtitle:count?`${count} appointment${count===1?'':'s'} shape today.`:'Your day is clear — protect the prospecting blocks.'};
  }
  if(id==='appointmentsView'){
    if(appointmentHistoryMode==='past')return{title:'Appointments',subtitle:'Review appointments and follow-ups.'};
    if(appointmentHistoryMode==='upcoming')return{title:'Appointments',subtitle:'Prepare before the meeting arrives.'};
    const entries=allAppointmentEntries().filter(({appointment:a,sourceDate})=>appointmentCreatedDate(a,sourceDate)===appointmentDate);
    if(appointmentDate<todayKey())return{title:'Appointments',subtitle:'Review appointments and follow-ups.'};
    if(appointmentDate>todayKey())return{title:'Appointments',subtitle:entries.length?`${entries.length} appointment${entries.length===1?'':'s'} logged for this day.`:'No appointments booked for this day.'};
    return{title:'Appointments',subtitle:entries.length?`${entries.length} appointment${entries.length===1?'':'s'} logged today.`:'No appointments booked for today.'};
  }
  if(id==='insightsView'){
    const rows=leaderboardMode==='week'?weeklyLeaderboardRows():dailyLeaderboardRows();
    const meIndex=rows.findIndex(row=>row.uid===uid);
    if(!rows.length)return{title:'Leaderboard',subtitle:'Scores appear as the team begins logging.'};
    if(meIndex===0)return{title:'Leaderboard',subtitle:leaderboardMode==='week'?'You’re setting this week’s pace.':'You’re setting today’s pace.'};
    if(meIndex>0){const gap=Math.max(0,(rows[0]?.score||0)-(rows[meIndex]?.score||0));return{title:'Leaderboard',subtitle:gap?`${gap}% from the lead.`:'Consistency decides the week.'};}
    return{title:'Leaderboard',subtitle:'Log activity to enter the board.'};
  }
  const label=document.querySelector(`.tabbar button[data-view="${id}"] span`)?.textContent||'AGNT';
  if(id==='prospectingView'){
    const overdue=activeProspects().filter(p=>p.nextFollowUp&&p.nextFollowUp<todayKey()).length,due=activeProspects().filter(p=>p.nextFollowUp===todayKey()).length,sellers=sellerPipelineProspects().length;
    if(prospectSection==='contacts'){const count=prospectContactsMode==='archived'?archivedProspects().length:activeProspects().length;return{title:prospectContactsMode==='archived'?'Archived':label,subtitle:count?`${count} contact${count===1?'':'s'} ${prospectContactsMode==='archived'?'archived.':'ready to work.'}`:prospectContactsMode==='archived'?'No archived contacts.':'Build the database one conversation at a time.'}};
    if(prospectSection==='buyers'){const count=filteredBuyers().length,total=activeBuyerProspects().length;return{title:'Buyers',subtitle:count!==total?`${count} of ${total} buyers match the current search.`:total?`${total} active buyer${total===1?'':'s'} ready to work.`:'Capture buyer requirements from the next conversation.'}};
    if(prospectSection==='pipeline')return{title:label,subtitle:sellers?`${sellers} active seller${sellers===1?'':'s'} across your pipeline.`:'Qualify the next seller opportunity.'};
    if(prospectSection==='market')return marketPageMode==='marketpulse'?{title:'MarketPulse',subtitle:'Review today’s property activity.'}:{title:'Hot Spotting',subtitle:'Turn today’s market changes into calls.'};if(prospectSection==='broadcast')return{title:'Broadcast',subtitle:'Build and review an SMS campaign.'};if(prospectSection==='insights')return{title:label,subtitle:'See what creates conversations and appointments.'};
    if(overdue)return{title:label,subtitle:`${overdue} overdue follow-up${overdue===1?'':'s'} need attention.`};
    if(due)return{title:label,subtitle:`${due} follow-up${due===1?'':'s'} due today.`};
    return{title:label,subtitle:'Follow-ups clear — create the next opportunity.'};
  }
  const subtitle=id==='settingsView'?'Make AGNT work your way.':id==='insightsView'?'Set the pace. Raise the standard.':'';
  return{title:label,subtitle};
}
function getEmptyState(type,context={}){
  if(type==='appointments-daily'){
    if(context.date<todayKey())return{title:'No appointments recorded',message:'No appointments were logged for this day.'};
    if(context.date>todayKey())return{title:'Nothing booked yet',message:'Appointments booked for this date will appear here.'};
    return{title:'No appointments yet',message:'Add an appointment when the next opportunity is confirmed.'};
  }
  if(type==='appointments-history'){
    if(context.mode==='past')return{title:'No appointment history yet',message:'Completed appointments will appear here as your record grows.'};
    return{title:'Schedule clear',message:'New appointments will appear here once they are booked.'};
  }
  if(type==='leaderboard'){
    if(context.future)return{title:'This period hasn’t started',message:'Team results will appear once activity begins.'};
    if(context.past)return{title:'No scores recorded',message:'No team activity was logged for this period.'};
    return{title:'Waiting for today’s activity',message:'Rankings will appear as the team logs progress.'};
  }
  return{title:'Nothing here yet',message:'New activity will appear here when it is available.'};
}
function emptyStateMarkup(state){return `<div class="empty-state" role="status"><strong>${escapeHtml(state.title||'')}</strong>${state.message?`<p>${escapeHtml(state.message)}</p>`:''}</div>`}
function updateTopbar(id=activeViewId()){
  const isToday=id==='todayView';
  const app=$('#app'),progress=$('.broadcast-step-progress'),builder=$('#broadcastBuilderFlow'),topActions=$('.top-actions');
  const inBroadcast=id==='prospectingView'&&prospectSection==='broadcast';
  const building=inBroadcast&&Boolean(selectedBroadcastType&&BROADCAST_TYPES[selectedBroadcastType]);
  app?.classList.toggle('broadcast-fullscreen',inBroadcast);
  app?.classList.toggle('broadcast-building',building);
  if(progress&&builder&&topActions){
    if(building&&progress.parentElement!==topActions)topActions.insertBefore(progress,topActions.firstChild);
    if(!building&&progress.parentElement!==builder)builder.insertBefore(progress,builder.firstChild);
  }
  const label=document.querySelector(`.tabbar button[data-view="${id}"] span`)?.textContent||'AGNT';
  const dateLine=document.querySelector('.date-line');
  const todaySlot=$('#todaySyncSlot');
  const syncBadge=$('#syncBadge');
  const syncPopover=$('#syncPopover');
  const headerState=broadcastHeaderState()||pageHeaderState(id);
  $('#viewTitle').textContent=headerState.title;
  const subtitle=$('#viewSubtitle');
  const subtitleText=headerState.subtitle||'';
  if(subtitle){subtitle.textContent=subtitleText;subtitle.classList.toggle('hidden',!subtitleText)}
  $('#dateLabel').textContent=fmtDate(selectedDate);
  const hideCompactDate=id==='prospectingView'||id==='scheduleView'||id==='appointmentsView'||id==='insightsView'||id==='settingsView';
  $('#dateLabel').classList.toggle('hidden',hideCompactDate);
  dateLine?.classList.toggle('today-sync-only',hideCompactDate);
  const syncInTopActions=isToday||id==='prospectingView'||id==='scheduleView'||id==='appointmentsView'||id==='insightsView'||id==='settingsView';
  if(syncInTopActions&&todaySlot){
    if(syncBadge&&syncBadge.parentElement!==todaySlot)todaySlot.append(syncBadge);
  }else if(dateLine){
    if(syncBadge&&syncBadge.parentElement!==dateLine)dateLine.append(syncBadge);
  }
  if(syncPopover&&syncPopover.parentElement!==document.body)document.body.append(syncPopover);
  const showDateNav=id==='todayView'||id==='scheduleView'||id==='appointmentsView';
  $('#dateNavActions')?.classList.toggle('hidden',!showDateNav);
  $('#leaderboardModeShortcut')?.classList.toggle('hidden',id!=='insightsView');
  $('#homeShortcut')?.classList.toggle('hidden',id!=='settingsView');
}
function dayLogTime(at){
  const date=new Date(Number(at)||0);if(!Number.isFinite(date.getTime()))return'';
  return date.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit',hour12:true}).replace(' ','');
}
function dayLogRange(startAt,endAt){
  const start=dayLogTime(startAt),end=dayLogTime(endAt);return end&&end!==start?`${start}–${end}`:start;
}
function dayLogTargetMilestones(k,d){
  const milestones=[],metricTargets={calls:Number(targets.calls)||0,connects:Number(targets.connects)||0,data:Number(targets.data)||0};
  Object.entries(metricTargets).forEach(([metric,target])=>{
    if(!target)return;let total=0,hitAt=0;
    (d.events||[]).filter(event=>event.type===metric&&Number(event.delta)>0).sort((a,b)=>(Number(a.at)||0)-(Number(b.at)||0)).some(event=>{
      total+=Number(event.delta)||0;if(total>=target){hitAt=Number(event.at)||0;return true}return false
    });
    if(hitAt)milestones.push({id:`target-${metric}-${k}`,at:hitAt,kind:'target',title:`${metric.charAt(0).toUpperCase()+metric.slice(1)} target completed`,detail:`${target} ${metric} reached`});
  });
  const knockTarget=Number(rollingKnockTarget(k))||0;if(knockTarget){let seconds=0,hitAt=0;
    (Array.isArray(d.knockingSessions)?d.knockingSessions:[]).slice().sort((a,b)=>(Number(a.endedAt)||0)-(Number(b.endedAt)||0)).some(session=>{
      seconds+=Number(session.durationSeconds)||0;if(Math.floor(seconds/60)>=knockTarget){hitAt=Number(session.endedAt)||0;return true}return false
    });
    if(hitAt)milestones.push({id:`target-knock-${k}`,at:hitAt,kind:'target',title:'Knocking target completed',detail:`${knockTarget} active minutes reached`});
  }
  return milestones;
}
function meaningfulKnockingSession(session){
  const stats=session?.stats||{},durationSeconds=Number(session?.durationSeconds)||Math.max(0,((Number(session?.endedAt)||0)-(Number(session?.startedAt)||0))/1000),loggedMetrics=['knocks','clients','data','MAP','LAP'].some(metric=>(Number(stats[metric])||0)>0);
  return durationSeconds>=60||loggedMetrics;
}
function dayLogItems(k=selectedDate){
  const d=dayData(k),items=[],completed=(Array.isArray(d.knockingSessions)?d.knockingSessions:[]).filter(meaningfulKnockingSession);
  completed.forEach(session=>{
    const stats=session.stats||{},startedAt=Number(session.startedAt)||0,endedAt=Number(session.endedAt)||0,durationSeconds=Number(session.durationSeconds)||Math.max(0,(endedAt-startedAt)/1000),appointments=(Number(stats.MAP)||0)+(Number(stats.LAP)||0);
    if(!startedAt&&!endedAt)return;
    items.push({id:`knock-session-${session.id||endedAt||startedAt}`,at:startedAt||endedAt,kind:'knocking',timeLabel:dayLogRange(startedAt||endedAt,endedAt||startedAt),title:'Door Knock Session',detail:`${fmtTimer(durationSeconds)} active`,stats:[`${Number(stats.knocks)||0} knocks`,`${Number(stats.clients)||0} connects`,`${Number(stats.data)||0} data`,...(appointments?[`${appointments} appointment${appointments===1?'':'s'}`]:[])]});
  });
  const appointmentEntries=allAppointmentEntries().filter(({appointment:a,sourceDate})=>appointmentCreatedDate(a,sourceDate)===k&&['MAP','LAP','BAP'].includes(appointmentType(a)));
  appointmentEntries.forEach(({appointment:a,sourceDate})=>items.push({id:`appointment-${a.id}`,at:Number(a.at)||new Date(`${k}T${a.time||'12:00'}`).getTime(),kind:'appointment',title:`${appointmentType(a)} Booked`,detail:[a.contactName||a.name,a.address].filter(Boolean).join(' · ')||`Scheduled ${fmtDate(appointmentScheduledDate(a,sourceDate))}`}));
  const interactions=prospectInteractions.filter(interaction=>interaction.date===k&&interaction.type==='Call').sort((a,b)=>(Number(a.at)||0)-(Number(b.at)||0));
  if(interactions.length){
    const first=Number(interactions[0].at)||parseKey(k).setHours(9),last=Number(interactions[interactions.length-1].at)||first,connected=interactions.filter(interaction=>prospectOutcomeMetricDelta(interaction.outcome).connects).length,dataAdded=interactions.reduce((sum,interaction)=>sum+(Number(prospectOutcomeMetricDelta(interaction.outcome).data)||0),0);
    items.push({id:`prospecting-${k}`,at:first,kind:'prospecting',timeLabel:dayLogRange(first,last),title:'Prospecting',detail:last-first>60000?'Focused call block':'Calls logged',stats:[`${interactions.length} call${interactions.length===1?'':'s'}`,`${connected} connect${connected===1?'':'s'}`,...(dataAdded?[`${dataAdded} data`]:[])]});
  }
  const createdContacts=prospects.filter(prospect=>dateKey(new Date(Number(prospect.createdAt)||0))===k);
  createdContacts.forEach(prospect=>items.push({id:`contact-${prospect.id}`,at:Number(prospect.createdAt)||parseKey(k).setHours(9),kind:'contact',title:'Contact Added',detail:prospect.name||formatProspectAddress(prospect.address||prospect.company,prospect.suburb)||'New contact'}));
  items.push(...dayLogTargetMilestones(k,d));
  if(k===todayKey()&&knockingSessionActive){
    const dToday=dayData(k),elapsed=Math.max(0,liveKnockSeconds(dToday)-knockingSessionStartSeconds),started=(Number(dToday.timerStartedAt)||Date.now())-elapsed*1000;
    items.push({id:'active-knocking-session',at:started,kind:'live',timeLabel:`${dayLogTime(started)}–Now`,title:dToday.timerStartedAt?'Door Knock Session':'Door Knock Session Paused',detail:`${fmtTimer(elapsed)} active`,stats:[`${Number(knockingSessionStats.knocks)||0} knocks`,`${Number(knockingSessionStats.clients)||0} connects`,`${Number(knockingSessionStats.data)||0} data`]});
  }
  const seen=new Set();return items.filter(item=>{const key=item.id||`${item.kind}|${item.title}|${item.detail}|${Math.round(item.at/60000)}`;if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>a.at-b.at);
}
function setTodayPage(page='overview'){
  todayPage=['overview','insights','log'].includes(page)?page:'overview';
  document.querySelectorAll('[data-today-page]').forEach(button=>{const active=button.dataset.todayPage===todayPage;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});
  $('#todayOverviewPanel')?.classList.toggle('active',todayPage==='overview');
  $('#todayInsightsPanel')?.classList.toggle('active',todayPage==='insights');
  $('#todayLogPanel')?.classList.toggle('active',todayPage==='log');
  $('#todayOverviewPanel')?.setAttribute('aria-hidden',String(todayPage!=='overview'));
  $('#todayInsightsPanel')?.setAttribute('aria-hidden',String(todayPage!=='insights'));
  $('#todayLogPanel')?.setAttribute('aria-hidden',String(todayPage!=='log'));
  if(todayPage==='insights')renderScorecard();
  if(todayPage==='log')renderDayLog();
}
function renderDayLog(){
  const timeline=$('#dayLogTimeline');if(!timeline)return;const k=selectedDate,d=dayData(k),items=dayLogItems(k);
  const sessions=(Array.isArray(d.knockingSessions)?d.knockingSessions.filter(meaningfulKnockingSession).length:0)+(k===todayKey()&&knockingSessionActive?1:0)+(prospectInteractions.some(interaction=>interaction.date===k&&interaction.type==='Call')?1:0);
  const contacts=prospects.filter(prospect=>dateKey(new Date(Number(prospect.createdAt)||0))===k).length;
  const appointments=allAppointmentEntries().filter(({appointment:a,sourceDate})=>appointmentCreatedDate(a,sourceDate)===k&&['MAP','LAP','BAP'].includes(appointmentType(a))).length;
  $('#dayLogSessionTotal').textContent=sessions;$('#dayLogContactTotal').textContent=contacts;$('#dayLogAppointmentTotal').textContent=appointments;
  $('#dayLogTitle').textContent=k===todayKey()?'Today’s story':fmtDate(k);
  $('#dayLogMeta').textContent=items.length?`${items.length} meaningful moment${items.length===1?'':'s'}`:'Meaningful activity only';
  const wins=[];if(d.calls>=targets.calls)wins.push(`${d.calls} calls completed`);if(d.connects>=targets.connects)wins.push(`${d.connects} connects achieved`);if(d.data>=targets.data)wins.push(`${d.data} data captured`);if(Math.floor(liveKnockSeconds(d)/60)>=rollingKnockTarget(k))wins.push(`${Math.floor(liveKnockSeconds(d)/60)} minutes knocked`);if(appointments)wins.push(`${appointments} appointment${appointments===1?'':'s'} created`);const hotMoves=prospectInteractions.filter(x=>x.date===k&&(x.outcome==='Appointment booked'||validDateKey(x.nextFollowUp))).length;if(hotMoves)wins.push(`${hotMoves} next action${hotMoves===1?'':'s'} secured`);const winsPanel=$('#todayWins'),winsGrid=$('#todayWinsGrid');if(winsPanel&&winsGrid){winsPanel.classList.toggle('hidden',!wins.length);$('#todayWinsMeta').textContent=wins.length?`${wins.length} meaningful win${wins.length===1?'':'s'}`:'';winsGrid.innerHTML=wins.slice(0,4).map(win=>`<div><span>✓</span><strong>${escapeHtml(win)}</strong></div>`).join('')}
  if(!items.length){timeline.innerHTML='<div class="day-log-empty"><span aria-hidden="true">◎</span><strong>Your day is ready to be written</strong><small>Completed sessions, booked appointments and achieved targets will appear here.</small></div>';return}
  const icons={knocking:'🚪',appointment:'◆',prospecting:'☎',contact:'+',target:'✓',live:'●'};
  timeline.innerHTML=items.map(item=>`<article class="smart-log-card ${item.kind}"><header><time>${escapeHtml(item.timeLabel||dayLogTime(item.at))}</time><span class="smart-log-icon" aria-hidden="true">${icons[item.kind]||'•'}</span><div><strong>${escapeHtml(item.title)}</strong>${item.detail?`<small>${escapeHtml(item.detail)}</small>`:''}</div></header>${Array.isArray(item.stats)&&item.stats.length?`<div class="smart-log-stats">${item.stats.map(stat=>`<span>${escapeHtml(stat)}</span>`).join('')}</div>`:''}</article>`).join('');
}
function renderToday(){
  const d=dayData(selectedDate),score=completion(selectedDate),kt=rollingKnockTarget(selectedDate),secs=liveKnockSeconds(d),wk=weekSummary();
  const past=isPastDate(selectedDate),scheduled=isWorkDayKey(selectedDate),locked=past||!scheduled;
  updateTopbar();
  $('#backToday').classList.toggle('hidden',selectedDate===todayKey());
  $('#lockBadge').classList.toggle('hidden',!locked);$('#lockBadge').textContent=past?'LOCKED':'NOT SCHEDULED';
  $('#todayView').classList.toggle('date-locked',locked);
  if($('#welcomeMessage')){
    const trackState=dayTrackState(selectedDate);
    const labels={on:'ON TRACK',risk:'AT RISK',off:'OFF TRACK'};
    $('#welcomeMessage').textContent=labels[trackState];
    $('#welcomeMessage').classList.toggle('track-on',trackState==='on');
    $('#welcomeMessage').classList.toggle('track-risk',trackState==='risk');
    $('#welcomeMessage').classList.toggle('track-off',trackState==='off');
  }
  $('#dailyScore').textContent=`${score}%`;
  $('#scoreBar').style.width=`${score}%`;
  $('#scoreBar').classList.toggle('complete',score>=100);
  for(const m of ['calls','connects','data']){
    const val=d[m],target=targets[m],p=pct(val,target),rem=Math.max(0,target-val);
    $(`#${m}Value`).textContent=val;
    $(`#${m}TargetLabel`).textContent=`/${target}`;
    $(`#${m}TargetText`).textContent=past?'Final result':(!scheduled?'No target today':metricRemainingText(val,target));
    const ring=$(`#${m}Percent`);
    const paceNow=new Date(),pacePct=(selectedDate===todayKey()&&scheduled)?(paceNow>=workdayEnd(paceNow)?100:Math.min(100,Math.round(expectedAt(m,target,paceNow)/Math.max(1,target)*100))):0;
    ring.textContent=`${p}%`;
    ring.classList.add('metric-ring');
    ring.style.setProperty('--actual',p);
    ring.style.setProperty('--pace',pacePct);
    ring.setAttribute('role','img');
    ring.setAttribute('aria-label',`${m.charAt(0).toUpperCase()+m.slice(1)}: ${p}% complete, expected pace ${pacePct}%, target ${target}`);
    $(`#${m}Pace`).textContent=past?'Day locked':(!scheduled?'Not scheduled':metricPaceText(val,target,m));
    document.querySelector(`[data-metric="${m}"]`).classList.toggle('complete',rem===0);
  }
  $('#knockValue').textContent=fmtTimer(secs);
  $('#knockTargetText').textContent=past?'Final result':(!scheduled?'No target today':knockRemainingText(Math.floor(secs/60),kt));
  $('#knockRemaining').textContent=past?'Day locked':(!scheduled?'Not scheduled':knockPaceText(Math.floor(secs/60),kt));
  const knockMinutes=Math.floor(secs/60),knockActual=pct(knockMinutes,kt);
  const knockPaceNow=new Date(),knockPaceEnd=new Date(knockPaceNow);knockPaceEnd.setHours(17,0,0,0);const knockExpected=(selectedDate===todayKey()&&scheduled)?(knockPaceNow>=knockPaceEnd?100:Math.min(100,Math.round(expectedKnockAt(kt,knockPaceNow)/Math.max(1,kt)*100))):0;
  const knockRing=$('#knockPercent');
  if(knockRing){
    knockRing.textContent=`${knockActual}%`;
    knockRing.style.setProperty('--actual',knockActual);
    knockRing.style.setProperty('--pace',knockExpected);
    knockRing.classList.toggle('complete',knockActual>=100);
    knockRing.setAttribute('aria-label',`Knocking: ${knockActual}% complete, expected pace ${knockExpected}%, target ${kt} minutes`);
  }
  const timerButton=$('#timerButton');
  const timerRunning=!!d.timerStartedAt&&!locked;
  timerButton.innerHTML=timerRunning
    ? '<svg class="timer-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="7.5" y="6" width="3.25" height="12" rx="1"/><rect x="13.25" y="6" width="3.25" height="12" rx="1"/></svg>'
    : '<svg class="timer-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 6.5 17 12l-8.5 5.5Z"/></svg>';
  timerButton.setAttribute('aria-label',past?'Knocking timer locked':(!scheduled?'Knocking timer unavailable today':(timerRunning?'Pause knocking timer':'Start knocking timer')));
  timerButton.title=past?'Locked':(!scheduled?'Off day':(timerRunning?'Pause':(knockingSessionActive?'Resume Session':'Start')));
  if(!timerRunning&&knockingSessionActive)timerButton.setAttribute('aria-label','Resume knocking session');
  timerButton.classList.toggle('running',timerRunning);
  $$('[data-action], #timerButton, #resetKnock').forEach(el=>{el.disabled=locked;el.setAttribute('aria-disabled',String(locked))});
  renderDayTrend();
  renderLeaderboardPosition();
  if($('#momentumWhisper'))$('#momentumWhisper').textContent=momentumWhisper();
  renderNowCard();
}
function recentWorkKeys(endKey=selectedDate,count=8){
  const out=[],d=parseKey(endKey);
  for(let i=0;i<40&&out.length<count;i++){
    if(workDays.includes(d.getDay()))out.unshift(dateKey(d));
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
function renderWeekDays(){if(!$('#weekDays'))return;$('#weekDays').innerHTML=weekKeys().map(k=>{const p=completion(k),d=parseKey(k);return `<button class="week-day ${k===selectedDate?'selected':''} ${p>=100?'complete':''}" data-date="${k}"><b>${workDayName(d.getDay()).slice(0,3).toUpperCase()}</b><small>${d.getDate()} · ${p}%</small></button>`}).join('')}

function normaliseAppointmentType(value){const raw=String(value||'').trim().toLowerCase();if(raw==='bap'||raw==='buyer appointment')return'BAP';if(raw==='map'||raw==='appraisal'||raw==='market appraisal')return'MAP';if(raw==='lap'||raw==='listing appointment')return'LAP';if(raw==='ofi'||raw==='open for inspection'||raw==='pu'||raw==='price update')return'OFI';return String(value||'').trim().toUpperCase()}
function appointmentType(a){return normaliseAppointmentType(a.type||(Array.isArray(a.types)?a.types[0]:''))||'—'}
function appointmentMarketAddressParts(value=''){
  const raw=cleanMarketLine(value);if(!raw)return{address:'',suburb:''};
  const split=splitMarketAddress(raw);if(split.suburb)return{address:split.address||raw,suburb:split.suburb};
  const normalised=normalisePlace(raw),suburbs=SYDNEY_SUBURBS.map(name=>({name,key:normalisePlace(name)})).filter(item=>item.key&&(normalised===item.key||normalised.endsWith(` ${item.key}`))).sort((a,b)=>b.key.length-a.key.length),match=suburbs[0];
  if(!match)return{address:raw,suburb:''};
  const suburbIndex=raw.toLowerCase().lastIndexOf(match.name.toLowerCase()),address=suburbIndex>0?raw.slice(0,suburbIndex).replace(/[\s,;-]+$/,'').trim():raw;
  return{address:address||raw,suburb:match.name};
}
function marketPropertyCategoryFromType(value=''){
  const type=normalisePlace(value);if(type==='house'||type==='duplex'||type==='semi detached')return'House';if(['unit','apartment','flat','villa','townhouse'].includes(type))return'Strata';return''
}
function inferMarketPropertyCategoryFromAddress(value=''){
  const raw=cleanMarketLine(value),lower=normalisePlace(raw);if(!raw)return'';
  if(/\b(?:unit|apartment|apt|flat|villa|townhouse)\b/.test(lower))return'Strata';
  const street=raw.split(',')[0].trim();
  if(/^\s*(?:unit\s*)?[a-z]?\d+(?:\s*-\s*\d+)?\s*\/\s*\d+[a-z]?\b/i.test(street))return'Strata';
  if(/^\s*\d+\s*-\s*\d+\b/.test(street))return'';
  if(/^\s*\d+(?:\s*[ab])?\b/i.test(street))return'House';
  return'';
}
function marketPulseEventPropertyCategory(event={}){
  const explicit=marketPropertyCategoryFromType(buyerMarketPropertyConfiguration(event).propertyType),inferred=inferMarketPropertyCategoryFromAddress(event.address);if(explicit&&inferred&&explicit!==inferred)return'';return explicit||inferred
}
function marketMedianValue(values=[]){const sorted=values.map(Number).filter(value=>Number.isFinite(value)&&value>0).sort((a,b)=>a-b);if(!sorted.length)return 0;const mid=Math.floor(sorted.length/2);return sorted.length%2?sorted[mid]:Math.round((sorted[mid-1]+sorted[mid])/2)}
function marketPulseActivityPriceLabel(events=[],kind=''){
  const values=events.map(event=>parseMarketMoney(event.price||event.guide)).filter(Boolean),median=marketMedianValue(values);if(!median)return'';
  if(values.length===1)return`${kind==='sold'?'Recent sale':'Recent guide'} ${formatMarketMoney(median)}`;
  return`${kind==='sold'?'Sold median':'Guide median'} ${formatMarketMoney(median)}`
}
function marketPulseEventKind(event={}){
  const type=normalisePlace(event.eventType);
  if(['just listed','listed','new listing'].includes(type))return'listed';
  if(['sold','auction result'].includes(type))return'sold';
  if(['price update','price changed','price change'].includes(type))return'price';
  return'other'
}
function marketPulseEventSortNewest(a={},b={}){
  const dateCompare=String(b.receivedDate||'').localeCompare(String(a.receivedDate||''));
  return dateCompare||Number(b.createdAt||0)-Number(a.createdAt||0)
}
function marketPulseEventConfigurationLabel(event={},fallbackCategory=''){
  const config=buyerMarketPropertyConfiguration(event),parts=[];
  if(config.bedrooms)parts.push(`${config.bedrooms} bed`);
  if(config.bathrooms)parts.push(`${config.bathrooms} bath`);
  if(config.cars)parts.push(`${config.cars} car`);
  const propertyType=config.propertyType||(fallbackCategory==='Strata'?'Strata':fallbackCategory==='House'?'House':'');
  if(propertyType)parts.push(propertyType);
  return parts.join(' · ')
}
function marketPulseTalkingPoint(event={},fallbackCategory=''){
  const kind=marketPulseEventKind(event),configuration=marketPulseEventConfigurationLabel(event,fallbackCategory),address=[event.address,event.suburb].filter(Boolean).join(', '),movement=marketMovementLabel(event),recency=relativeEventRecency(event).label;
  let price='';
  if(event.guide)price=`Guide ${event.guide}`;
  else if(event.price)price=kind==='sold'?`Sold ${event.price}`:`Price ${event.price}`;
  const prior=event.priorPrice?`Prior ${event.guide?'guide':'price'} ${event.priorPrice}`:'';
  return{event,kind,label:kind==='sold'?'SOLD':kind==='listed'?'LISTED':kind==='price'?'PRICE UPDATE':String(event.eventType||'MARKETPULSE').toUpperCase(),address,configuration,price,movement,prior,recency}
}
function marketPulseTalkingPointsForIntel(intel={},limit=2){
  const preferred=[intel.sold?.[0],intel.listed?.[0],intel.updates?.[0]].filter(Boolean),pool=[...(intel.sold||[]),...(intel.listed||[]),...(intel.updates||[])].sort(marketPulseEventSortNewest),picked=[],seen=new Set();
  for(const event of [...preferred,...pool]){if(!event?.id||seen.has(event.id))continue;seen.add(event.id);picked.push(marketPulseTalkingPoint(event,intel.category));if(picked.length>=limit)break}
  return picked
}
function appointmentMarketPulseIntelligence(a={}){
  const parts=appointmentMarketAddressParts(a.address),suburbKey=normalisePlace(parts.suburb),category=inferMarketPropertyCategoryFromAddress(parts.address||a.address);if(!suburbKey||!category)return null;
  const events=normaliseMarketPulseEvents(marketPulseEvents).filter(event=>normalisePlace(event.suburb)===suburbKey&&marketPulseEventPropertyCategory(event)===category);if(!events.length)return null;
  const listed=events.filter(event=>marketPulseEventKind(event)==='listed').sort(marketPulseEventSortNewest),sold=events.filter(event=>marketPulseEventKind(event)==='sold').sort(marketPulseEventSortNewest),updates=events.filter(event=>marketPulseEventKind(event)==='price').sort(marketPulseEventSortNewest),actionable=[...listed,...sold,...updates];if(!actionable.length)return null;
  const canonicalSuburb=events.find(event=>cleanText(event.suburb,100))?.suburb||parts.suburb,priceLabels=[marketPulseActivityPriceLabel(sold,'sold'),marketPulseActivityPriceLabel(listed,'listed')].filter(Boolean),reduced=updates.filter(event=>event.priceMovementDirection==='below').length,activity=[listed.length?`${listed.length} Listed`:'',sold.length?`${sold.length} Sold`:'',updates.length?`${updates.length} Price Update${updates.length===1?'':'s'}`:''].filter(Boolean),movement=reduced?`${reduced} reduction${reduced===1?'':'s'}`:'';
  const dates=actionable.map(event=>event.receivedDate).filter(validDateKey).sort(),latestDate=dates.at(-1)||'',recency=latestDate?relativeEventRecency({receivedDate:latestDate}).label:'Current MarketPulse';
  return{suburb:canonicalSuburb,category,activity,priceLabels,movement,recency,eventCount:actionable.length,events:actionable.sort(marketPulseEventSortNewest),listed,sold,updates}
}
function appointmentMarketPulsePointMarkup(point={}){
  const meta=[point.configuration,point.price].filter(Boolean).join(' · '),movement=[point.prior,point.movement].filter(Boolean).join(' · ');
  return`<div class="appointment-market-point"><span class="appointment-market-point-tag ${escapeHtml(point.kind)}">${escapeHtml(point.label)}</span><div><strong>${escapeHtml(point.address)}</strong>${meta?`<small>${escapeHtml(meta)}</small>`:''}${movement?`<em>${escapeHtml(movement)}</em>`:''}</div></div>`
}
function appointmentMarketPulseMarkup(a={},sourceDate=''){
  if(isOfiAppointment(a)||appointmentLifecycle(a,sourceDate)!=='upcoming')return'';const intel=appointmentMarketPulseIntelligence(a);if(!intel)return'';
  const activity=intel.activity.join(' · '),prices=intel.priceLabels.join(' · '),detail=[prices,intel.movement].filter(Boolean).join(' · '),exportId=calendarExportId(a,sourceDate);
  return`<button class="appointment-market-intel" type="button" data-open-market-insights="${escapeHtml(exportId)}" aria-label="Open Market Insights for ${escapeHtml(a.address||'this appointment')}"><span class="appointment-market-intel-head"><span>MARKETPULSE</span><b>${escapeHtml(intel.suburb)} · ${escapeHtml(intel.category)}</b><em>${escapeHtml(intel.recency)}</em></span><span class="appointment-market-intel-copy"><strong>${escapeHtml(activity)}</strong>${detail?`<small>${escapeHtml(detail)}</small>`:''}</span><span class="appointment-market-intel-chevron" aria-hidden="true">›</span></button>`
}
function marketInsightsSectionMarkup(title='',events=[],category=''){
  const rows=(events||[]).slice(0,3).map(event=>marketPulseTalkingPoint(event,category));if(!rows.length)return'';
  return`<section class="appointment-market-insights-section"><div class="appointment-market-insights-section-head"><span>${escapeHtml(title)}</span><small>${rows.length}${events.length>rows.length?` of ${events.length}`:''}</small></div><div class="appointment-market-insights-list">${rows.map(point=>{const meta=[point.configuration,point.price].filter(Boolean).join(' · '),movement=[point.prior,point.movement].filter(Boolean).join(' · ');return`<article><div><strong>${escapeHtml(point.address)}</strong>${meta?`<small>${escapeHtml(meta)}</small>`:''}${movement?`<em>${escapeHtml(movement)}</em>`:''}</div><span>${escapeHtml(point.recency)}</span></article>`}).join('')}</div></section>`
}
function appointmentEntryForMarketInsights(exportId=''){
  const todayEntry=appointmentEntriesForDate(todayKey()).find(({appointment,sourceDate})=>calendarExportId(appointment,sourceDate)===exportId);if(todayEntry)return todayEntry;
  const own=allAppointmentEntries().find(({appointment,sourceDate})=>calendarExportId(appointment,sourceDate)===exportId);if(own)return{...own,isTeamAssigned:false};
  for(const appointment of assignedTeamAppointments){const sourceDate=appointmentCreatedDate(appointment,appointment.createdDate||todayKey())||appointment.createdDate||todayKey();if(calendarExportId(appointment,sourceDate)===exportId)return{appointment,sourceDate,scheduled:appointmentScheduledDate(appointment,sourceDate),isTeamAssigned:true}}
  return null
}
function closeAppointmentMarketInsights(){
  const overlay=document.querySelector('.appointment-market-insights-overlay');if(!overlay)return;overlay.remove();document.body.classList.remove('appointment-market-insights-open')
}
function openAppointmentFromMarketInsights(exportId=''){
  const entry=appointmentEntryForMarketInsights(exportId);closeAppointmentMarketInsights();if(!entry){toast('Appointment could not be found');return}if(entry.isTeamAssigned){switchView('appointmentsView');return}openAppointmentEditorFromToday(exportId)
}
function showAppointmentMarketInsights(exportId=''){
  const entry=appointmentEntryForMarketInsights(exportId);if(!entry){toast('Appointment could not be found');return}const {appointment:a,sourceDate}=entry,intel=appointmentMarketPulseIntelligence(a);if(!intel){toast('No matching MarketPulse insights available');return}
  closeAppointmentMarketInsights();const overlay=document.createElement('div');overlay.className='appointment-market-insights-overlay';const activity=intel.activity.join(' · '),summaryDetail=[intel.priceLabels.join(' · '),intel.movement].filter(Boolean).join(' · '),sold=marketInsightsSectionMarkup('RECENT SOLD',intel.sold,intel.category),listed=marketInsightsSectionMarkup('RECENT LISTED',intel.listed,intel.category),updates=marketInsightsSectionMarkup('MARKET MOVEMENT',intel.updates,intel.category);
  overlay.innerHTML=`<section class="appointment-market-insights-sheet" role="dialog" aria-modal="true" aria-labelledby="appointmentMarketInsightsTitle"><div class="appointment-market-insights-handle"></div><header><div><span>MARKET INSIGHTS</span><h2 id="appointmentMarketInsightsTitle">${escapeHtml(a.address||'Appointment')}</h2><p>${escapeHtml(intel.suburb)} · ${escapeHtml(intel.category)} · ${escapeHtml(intel.recency)}</p></div><button type="button" data-close-market-insights aria-label="Close Market Insights">×</button></header>${activity||summaryDetail?`<div class="appointment-market-insights-summary">${activity?`<strong>${escapeHtml(activity)}</strong>`:''}${summaryDetail?`<small>${escapeHtml(summaryDetail)}</small>`:''}</div>`:''}<div class="appointment-market-insights-body">${sold}${listed}${updates}</div><div class="appointment-market-insights-actions"><button class="secondary" type="button" data-market-insights-view-appointment="${escapeHtml(exportId)}">View appointment</button><button class="primary" type="button" data-close-market-insights>Done</button></div></section>`;
  document.body.append(overlay);document.body.classList.add('appointment-market-insights-open');overlay.addEventListener('click',event=>{const view=event.target.closest('[data-market-insights-view-appointment]');if(view){openAppointmentFromMarketInsights(view.dataset.marketInsightsViewAppointment);return}if(event.target===overlay||event.target.closest('[data-close-market-insights]'))closeAppointmentMarketInsights()});requestAnimationFrame(()=>overlay.querySelector('[data-close-market-insights]')?.focus({preventScroll:true}))
}
function isOfiAppointment(a){return appointmentType(a)==='OFI'}
function appointmentHasAuction(a){return isOfiAppointment(a)&&Boolean(a.auction)}
function appointmentDurationMinutes(a){return isOfiAppointment(a)?(appointmentHasAuction(a)?15:30):60}
function appointmentEndMinutes(a){return timelineMinutes(a.time)+appointmentDurationMinutes(a)}
function appointmentAuctionMinutes(a){return appointmentHasAuction(a)?timelineMinutes(a.time)+15:null}
function appointmentScheduledDate(a,sourceDate=''){return a.scheduledDate||a.date||sourceDate}
function appointmentCreatedDate(a,sourceDate=''){
  const raw=Number(a.at||a.createdAt||0);
  if(raw){const d=new Date(raw);if(!Number.isNaN(d.getTime()))return dateKey(d);}
  return a.createdDate||a.logDate||sourceDate;
}
function appointmentTimestamp(a,sourceDate=''){if(Number.isFinite(Number(a.scheduledAt)))return Number(a.scheduledAt);const scheduledDate=appointmentScheduledDate(a,sourceDate);if(scheduledDate&&a.time){const t=new Date(`${scheduledDate}T${a.time}`);if(!Number.isNaN(t.getTime()))return t.getTime()}return Number(a.at)||0}
function appointmentTimeLabel(a,sourceDate=''){const ts=appointmentTimestamp(a,sourceDate);if(!ts)return a.time||'Time not set';return new Date(ts).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit',hour12:true}).replace(/\s/g,'').toLowerCase()}
function shortAppointmentDate(k){return k?parseKey(k).toLocaleDateString('en-AU',{day:'numeric',month:'long'}):'Date not set'}
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function calendarExportStorageKey(){return `${storagePrefix(uid)}calendar-exports`}
function calendarExportIds(){try{return new Set(JSON.parse(localStorage.getItem(calendarExportStorageKey())||'[]'))}catch{return new Set()}}
function calendarExportId(a,sourceDate=''){return String(a.id||`${sourceDate}|${appointmentType(a)}|${appointmentScheduledDate(a,sourceDate)}|${a.time||''}|${a.address||''}|${a.contactName||a.name||''}`)}
function appointmentAddedToCalendar(a,sourceDate=''){return calendarExportIds().has(calendarExportId(a,sourceDate))}
function markAppointmentAddedToCalendar(a,sourceDate=''){const ids=calendarExportIds();ids.add(calendarExportId(a,sourceDate));localStorage.setItem(calendarExportStorageKey(),JSON.stringify([...ids]));renderAppointments()}
function escapeIcs(value){return String(value??'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')}
function icsLocalDateTime(date,time){return `${String(date||'').replace(/-/g,'')}T${String(time||'00:00').replace(':','')}00`}
function appointmentCalendarFile(a,sourceDate=''){
  const scheduledDate=appointmentScheduledDate(a,sourceDate),time=a.time||'';
  const start=new Date(`${scheduledDate}T${time}`);
  if(!scheduledDate||!time||Number.isNaN(start.getTime()))return null;
  const end=new Date(start.getTime()+appointmentDurationMinutes(a)*60*1000);
  const endDate=dateKey(end),endTime=`${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`;
  const type=appointmentType(a),address=a.address||'Address not recorded',contact=a.contactName||a.name||'Contact not recorded',phone=a.contactNumber||a.phone||'';
  const title=`${type} · ${address} · ${contact}`;
  const description=[`Appointment type: ${type}`,isOfiAppointment(a)?`OFI duration: ${appointmentDurationMinutes(a)} minutes`:'',appointmentHasAuction(a)?`Auction commences: ${timelineTimeLabel(appointmentAuctionMinutes(a))}`:'',`Client: ${contact}`,phone?`Phone: ${phone}`:'',`Property: ${address}`].filter(Boolean).join('\n');
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const uidValue=`${calendarExportId(a,sourceDate)}@agnt`;
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//AGNT//Daily Accountability//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',`UID:${escapeIcs(uidValue)}`,`DTSTAMP:${stamp}`,`DTSTART:${icsLocalDateTime(scheduledDate,time)}`,`DTEND:${icsLocalDateTime(endDate,endTime)}`,`SUMMARY:${escapeIcs(title)}`,`LOCATION:${escapeIcs(address)}`,`DESCRIPTION:${escapeIcs(description)}`,'END:VEVENT','END:VCALENDAR'];
  const filename=`${type}-${scheduledDate}-${String(address).replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,50)||'appointment'}.ics`;
  return{content:lines.join('\r\n')+'\r\n',filename};
}
function exportAppointmentToAppleCalendar(a,sourceDate=''){
  const file=appointmentCalendarFile(a,sourceDate);
  if(!file)return toast('Appointment date or time is missing');
  const blob=new Blob([file.content],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=file.filename;link.rel='noopener';document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  markAppointmentAddedToCalendar(a,sourceDate);toast('Calendar event ready to add');
}
function outlookAppointmentUrl(a,sourceDate=''){
  const scheduledDate=appointmentScheduledDate(a,sourceDate),time=a.time||'';
  const start=new Date(`${scheduledDate}T${time}`);
  if(!scheduledDate||!time||Number.isNaN(start.getTime()))return null;
  const end=new Date(start.getTime()+60*60*1000),type=appointmentType(a),address=a.address||'Address not recorded',contact=a.contactName||a.name||'Contact not recorded',phone=a.contactNumber||a.phone||'';
  const title=`[${type}] ${address} – ${contact}`;
  const description=[`Client name: ${contact}`,phone?`Client phone number: ${phone}`:'',`Appointment type: ${type}`,isOfiAppointment(a)?`OFI duration: ${appointmentDurationMinutes(a)} minutes`:'',appointmentHasAuction(a)?`Auction commences: ${timelineTimeLabel(appointmentAuctionMinutes(a))}`:''].filter(Boolean).join('\n');
  const params=new URLSearchParams({path:'/calendar/action/compose',rru:'addevent',allday:'false',subject:title,startdt:start.toISOString(),enddt:end.toISOString(),location:address,body:description});
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}
function exportAppointmentToOutlook(a,sourceDate=''){
  const outlookUrl=outlookAppointmentUrl(a,sourceDate);
  if(!outlookUrl)return toast('Appointment date or time is missing');
  const opened=window.open(outlookUrl,'_blank','noopener,noreferrer');
  if(!opened)return exportAppointmentToAppleCalendar(a,sourceDate);
  markAppointmentAddedToCalendar(a,sourceDate);toast('Opening Outlook Calendar');
}
function exportAppointmentToCalendar(a,sourceDate=''){
  if(calendarPreference==='apple')return exportAppointmentToAppleCalendar(a,sourceDate);
  exportAppointmentToOutlook(a,sourceDate);
}
function appointmentCalendarButton(a,sourceDate=''){
  const added=appointmentAddedToCalendar(a,sourceDate),id=escapeHtml(calendarExportId(a,sourceDate)),source=escapeHtml(sourceDate);
  const icon=added?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M4.5 8.5h15M5.5 5h13a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5Z"/><path d="m9 14 2 2 4-4"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M4.5 8.5h15M5.5 5h13a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5Z"/><path d="M12 11v6M9 14h6"/></svg>';
  return `<button class="appointment-calendar ${added?'is-added':''}" data-calendar-appointment="${id}" data-source-date="${source}" aria-label="${added?'Added to calendar':'Add appointment to calendar'}" title="${added?'Added to calendar':'Add to calendar'}">${icon}</button>`;
}
function appointmentEntriesForDate(viewDate){
  const entries=dayData(viewDate).appointments.map(a=>({appointment:a,sourceDate:viewDate,isReminder:false,isTeamAssigned:false}));
  Object.entries(days).forEach(([sourceDate,day])=>{if(sourceDate===viewDate)return;(day?.appointments||[]).forEach(a=>{if(appointmentScheduledDate(a,sourceDate)===viewDate)entries.push({appointment:a,sourceDate,isReminder:true,isTeamAssigned:false});});});
  assignedTeamAppointments.forEach(a=>{const sourceDate=appointmentCreatedDate(a,a.createdDate||viewDate)||a.createdDate||viewDate;if(appointmentScheduledDate(a,sourceDate)===viewDate)entries.push({appointment:a,sourceDate,isReminder:true,isTeamAssigned:true});});
  return entries.sort((x,y)=>appointmentTimestamp(x.appointment,x.sourceDate)-appointmentTimestamp(y.appointment,y.sourceDate));
}
function timelineMinutes(value){
  const parts=String(value||'').split(':').map(Number);
  return Number.isFinite(parts[0])&&Number.isFinite(parts[1])?parts[0]*60+parts[1]:0;
}
function timelineTimeLabel(minutes){
  const total=((minutes%1440)+1440)%1440,h=Math.floor(total/60),m=total%60;
  return new Date(2000,0,1,h,m).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit',hour12:true}).replace(/\s/g,'').toLowerCase();
}
function scheduledFollowUpsForDate(viewDate){
  return allAppointmentEntries().filter(({appointment:a,sourceDate})=>!isOfiAppointment(a)&&appointmentLifecycle(a,sourceDate)==='follow-up'&&(viewDate===todayKey()?(!a.followUpDate||a.followUpDate<=viewDate):a.followUpDate===viewDate));
}
function prospectFollowUpsForDate(viewDate){
  const contacts=[...new Map([...activeProspects(),...activeBuyerProspects()].map(p=>[p.id,p])).values()];
  return contacts.filter(p=>{
    if(!p.nextFollowUp)return false;
    return viewDate===todayKey()?p.nextFollowUp<=viewDate:p.nextFollowUp===viewDate;
  }).sort((a,b)=>{
    const dateCompare=String(a.nextFollowUp).localeCompare(String(b.nextFollowUp));
    if(dateCompare)return dateCompare;
    const temperatureOrder={Hot:0,Warm:1,Cold:2};
    return (temperatureOrder[a.temperature]??9)-(temperatureOrder[b.temperature]??9)||String(a.name||'').localeCompare(String(b.name||''));
  });
}
function allFollowUpsForDate(viewDate){
  return [...scheduledFollowUpsForDate(viewDate),...prospectFollowUpsForDate(viewDate)];
}
function legacyTimelineItemsForDate(viewDate){
  const isSaturday=parseKey(viewDate).getDay()===6;
  const items=isSaturday?[]:[
    {id:'prospecting',minutes:9*60,title:'Prospecting',meta:'Calls, connects and data',kind:'focus',duration:5*60},
    {id:'knocking',minutes:14*60,title:'Door Knock Focus',meta:`${rollingKnockTarget(viewDate)} minute target`,kind:'knock',duration:120},
    {id:'progress',minutes:16*60,title:'Daily Progress Check',meta:'Review remaining targets',kind:'check',duration:30},
    {id:'wrap',minutes:18*60,title:'Wrap Up',meta:'Review today and prepare tomorrow',kind:'wrap',duration:60}
  ];
  if(!isSaturday)scheduledFollowUpsForDate(viewDate).forEach(({appointment:a,sourceDate},index)=>{
    const rawPhone=String(a.contactNumber||a.phone||'').trim(),dial=rawPhone.replace(/[^+\d]/g,'');
    items.push({
      id:`followup-${calendarExportId(a,sourceDate)}`,
      minutes:8*60+(index*5),
      title:`Follow-Up · ${appointmentType(a)} · ${a.address||'Address not recorded'}`,
      meta:`${a.contactName||a.name||'Contact not recorded'}${rawPhone?` · ${rawPhone}`:''}`,
      kind:'followup',duration:30,dial,appointment:a,sourceDate,followUpType:'appointment'
    });
  });
  const appointmentFollowUpCount=scheduledFollowUpsForDate(viewDate).length;
  if(!isSaturday)prospectFollowUpsForDate(viewDate).forEach((p,index)=>{
    const rawPhone=String(primaryProspectPhone(p)||'').trim(),dial=rawPhone.replace(/[^+\d]/g,''),isBuyer=prospectHasActiveBuyerRole(p);
    const overdue=viewDate===todayKey()&&p.nextFollowUp<viewDate;
    const scheduledNote=interactionsFor(p.id).find(x=>x.type==='Follow-up'&&x.nextFollowUp===p.nextFollowUp&&x.note)?.note||'';
    const fallbackMeta=isBuyer?(buyerConfigText(p)!=='Configuration not set'?buyerConfigText(p):'Buyer follow-up'):(formatProspectAddress(p.address||p.company,p.suburb)||p.stage||'Contact follow-up');
    items.push({
      id:`contact-followup-${p.id}`,
      minutes:8*60+((appointmentFollowUpCount+index)*5),
      title:`${isBuyer?'Buyer Follow-Up':'Follow-Up'} · ${p.name||'Contact not recorded'}`,
      meta:`${overdue?'Overdue · ':''}${scheduledNote||fallbackMeta}${rawPhone?` · ${rawPhone}`:''}`,
      kind:'followup',duration:30,dial,prospectId:p.id,followUpType:isBuyer?'buyer':'prospect',completed:isBuyer?prospectInteractions.some(x=>x.prospectId===p.id&&x.type==='Follow-up'&&x.outcome==='Follow-up completed'&&x.date===viewDate):prospectInteractions.some(x=>x.prospectId===p.id&&x.type==='Call'&&x.date===viewDate)
    });
  });
  appointmentEntriesForDate(viewDate).forEach(({appointment:a,sourceDate})=>{
    const scheduled=appointmentScheduledDate(a,sourceDate);
    if(scheduled!==viewDate)return;
    const rawPhone=String(a.contactNumber||a.phone||'').trim(),dial=rawPhone.replace(/[^+\d]/g,'');
    items.push({
      id:`appointment-${calendarExportId(a,sourceDate)}`,
      minutes:timelineMinutes(a.time),
      title:isOfiAppointment(a)?`OFI · ${a.address||'Address not recorded'}`:`${appointmentType(a)} · ${a.address||'Address not recorded'}`,
      meta:isOfiAppointment(a)?(appointmentHasAuction(a)?`${timelineTimeLabel(timelineMinutes(a.time))}–${timelineTimeLabel(appointmentEndMinutes(a))} Open · ${timelineTimeLabel(appointmentAuctionMinutes(a))} Auction`:`${timelineTimeLabel(timelineMinutes(a.time))}–${timelineTimeLabel(appointmentEndMinutes(a))} Open`):`${a.contactName||a.name||'Contact not recorded'}${rawPhone?` · ${rawPhone}`:''}`,
      kind:isOfiAppointment(a)?'ofi':'appointment',duration:appointmentDurationMinutes(a),dial,appointment:a
    });
  });
  const order={followup:0,appointment:1,ofi:1,focus:2,knock:3,check:4,wrap:5};
  return items.sort((a,b)=>a.minutes-b.minutes||(order[a.kind]??9)-(order[b.kind]??9)||a.title.localeCompare(b.title));
}
function dailyPlanRoundMinutes(value,min=15,max=60){
  const rounded=Math.ceil(Math.max(0,Number(value)||0)/5)*5;
  return Math.max(min,Math.min(max,rounded||min));
}
function dailyPlanMergeIntervals(intervals=[]){
  const sorted=intervals.filter(item=>Number.isFinite(item.start)&&Number.isFinite(item.end)&&item.end>item.start).sort((a,b)=>a.start-b.start||a.end-b.end),merged=[];
  for(const interval of sorted){const last=merged[merged.length-1];if(last&&interval.start<=last.end)last.end=Math.max(last.end,interval.end);else merged.push({start:interval.start,end:interval.end})}
  return merged;
}
function dailyPlanFreeSlots(start,end,busy=[]){
  const slots=[],merged=dailyPlanMergeIntervals(busy.map(interval=>({start:Math.max(start,interval.start),end:Math.min(end,interval.end)}))),cursor={value:start};
  merged.forEach(interval=>{if(interval.start>cursor.value)slots.push({start:cursor.value,end:interval.start});cursor.value=Math.max(cursor.value,interval.end)});
  if(cursor.value<end)slots.push({start:cursor.value,end});
  return slots.filter(slot=>slot.end-slot.start>=10);
}
function dailyPlanNextFreeStart(start,end,duration,busy=[]){
  const slot=dailyPlanFreeSlots(start,end,busy).find(item=>item.end-item.start>=duration);return slot?slot.start:null;
}
function dailyPlanAppointmentModel(viewDate){
  const items=[],busy=[];
  appointmentEntriesForDate(viewDate).forEach(({appointment:a,sourceDate,isTeamAssigned})=>{
    if(appointmentScheduledDate(a,sourceDate)!==viewDate)return;
    const start=timelineMinutes(a.time),duration=appointmentDurationMinutes(a),end=start+duration,focusStart=Math.max(0,start-30),rawPhone=String(a.contactNumber||a.phone||'').trim(),dial=rawPhone.replace(/[^+\d]/g,''),type=isOfiAppointment(a)?'OFI':appointmentType(a),address=a.address||'Address not recorded',contact=a.contactName||a.name||'',marketIntel=!isOfiAppointment(a)?appointmentMarketPulseIntelligence(a):null,hasMarketInsights=Boolean(marketIntel),exportId=calendarExportId(a,sourceDate);
    // Keep the 30-minute focus handover clear without rendering a duplicate prep block.
    busy.push({start:focusStart,end});
    items.push({id:`appointment-${exportId}`,minutes:start,duration,title:isOfiAppointment(a)?`OFI · ${address}`:`${type} · ${address}`,meta:isOfiAppointment(a)?`${timelineTimeLabel(start)}–${timelineTimeLabel(end)}${appointmentHasAuction(a)?` · Auction ${timelineTimeLabel(appointmentAuctionMinutes(a))}`:''}`:`${contact||'Contact not recorded'}${rawPhone?` · ${rawPhone}`:''}`,kicker:isOfiAppointment(a)?'OPEN HOME':'APPOINTMENT',kind:isOfiAppointment(a)?'ofi':'appointment',plan:true,clockComplete:true,actionable:true,action:hasMarketInsights?'market-insights':isTeamAssigned?'view-appointments':'edit-appointment',eventId:hasMarketInsights?exportId:isTeamAssigned?'':exportId,label:hasMarketInsights?'Market Insights':'View appointment',commandTitle:isOfiAppointment(a)?`Open home · ${address}`:`Appointment window · ${contact||type}`,commandMeta:hasMarketInsights?`${timelineTimeLabel(start)}–${timelineTimeLabel(end)} · ${marketIntel.suburb} ${marketIntel.category} context is ready.`:`${timelineTimeLabel(start)}–${timelineTimeLabel(end)} · Keep this time protected.`,dial,appointment:a,sourceDate});
  });
  return{items,busy:dailyPlanMergeIntervals(busy)};
}
function dailyPlanMarketWorkloads(viewDate){
  if(viewDate!==todayKey())return[];
  const model=dailyBriefingMarketModel();if(!model.fresh)return[];
  const activeEventId=cleanText(prospectSessionContext?.eventId,160),assigned=new Set(),bucketOrder={listed:0,sold:1,price:3,other:4};
  return [...model.rows].sort((a,b)=>Number(b.event.id===activeEventId)-Number(a.event.id===activeEventId)||(bucketOrder[a.bucket]??4)-(bucketOrder[b.bucket]??4)||b.priority.score-a.priority.score).map(row=>{
    const clients=row.matches.filter(person=>!assigned.has(person.id));clients.forEach(person=>assigned.add(person.id));if(!clients.length)return null;
    const remaining=clients.filter(person=>!row.progress.workedIds.has(person.id)&&!prospectContactedToday(person.id)),complete=!remaining.length||row.progress.complete,address=[row.event.address,row.event.suburb].filter(Boolean).join(', '),plannedClients=complete?clients.length:remaining.length,duration=dailyPlanRoundMinutes(estimatedMinutes(Math.max(1,plannedClients)),15,60),active=row.event.id===activeEventId&&prospectSessionActive;
    const bucketLabel=row.bucket==='listed'?'JUST LISTED':row.bucket==='sold'?'SOLD':row.bucket==='price'?'PRICE UPDATE':'MARKETPULSE';
    return{id:`market-${row.event.id}`,workloadId:`market-${row.event.id}`,kind:'market',eventId:row.event.id,eventType:row.event.eventType,bucket:row.bucket,requestedFollowUps:row.requestedFollowUps||0,title:address||row.event.eventType,meta:complete?`${clients.length} matched client${clients.length===1?'':'s'} worked`:`${remaining.length} client${remaining.length===1?'':'s'} to speak to · ${duration} min protected${row.requestedFollowUps?` · ${row.requestedFollowUps} requested follow-up${row.requestedFollowUps===1?'':'s'}`:''}`,kicker:`${row.requestedFollowUps?'MARKET FOLLOW-UP':bucketLabel} · ${clients.length} CLIENT${clients.length===1?'':'S'}`,duration,clientCount:clients.length,remainingClients:remaining.length,propertyCount:1,completed:complete,actionable:!complete,action:complete?'view-market':active?'resume-session':'start-market',label:complete?'Review':active?'Resume calls':'Start calls',commandTitle:complete?`${address} is covered`:active?`Resume ${address}`:row.requestedFollowUps?`Return to ${row.requestedFollowUps} requested market follow-up${row.requestedFollowUps===1?'':'s'}`:`Call around ${address}`,commandMeta:complete?`${clients.length} matched client${clients.length===1?' has':'s have'} been worked.`:`${row.event.eventType} · ${remaining.length} client${remaining.length===1?'':'s'} · ${duration} protected minutes.`,rank:active?-100:row.requestedFollowUps?-80:(bucketOrder[row.bucket]??4)*10};
  }).filter(Boolean);
}
function dailyPlanProspectFollowUpComplete(prospect,viewDate){
  if(prospectHasActiveBuyerRole(prospect))return buyerContactedOnDate(prospect.id,viewDate)||prospectInteractions.some(item=>item.prospectId===prospect.id&&item.type==='Follow-up'&&item.outcome==='Follow-up completed'&&item.date===viewDate);
  return prospectInteractions.some(item=>item.prospectId===prospect.id&&item.type==='Call'&&item.date===viewDate);
}
function prospectFollowUpReason(prospect={}){
  const history=interactionsFor(prospect.id),scheduled=history.find(item=>item.type==='Follow-up'&&item.nextFollowUp===prospect.nextFollowUp),market=history.find(item=>item.marketFollowUpStatus==='triggered'&&item.nextFollowUp===prospect.nextFollowUp),latest=history.find(item=>['Call','SMS','Follow-up','Appointment'].includes(item.type));
  const why=market?.marketFollowUpTriggeredReason||scheduled?.note||latest?.note||latest?.outcome||pipelineTimeframeForProspect(prospect)||prospect.stage||'Contact follow-up';
  const last=latest?[latest.outcome||latest.type,latest.note].filter(Boolean).join(' · '):prospect.lastContact?'Previous contact recorded':'No earlier interaction recorded';
  return{why:cleanText(why,240),last:cleanText(last,320),lastDate:latest?.date||prospect.lastContact||''}
}
function todayFollowUpQueueModel(viewDate=todayKey()){
  const buyersWithMatches=new Set(activeBuyerProspects().filter(buyer=>buyerOpenPropertyMatches(buyer).length).map(buyer=>buyer.id)),rows=[];
  scheduledFollowUpsForDate(viewDate).forEach(({appointment:a,sourceDate})=>{
    const rawPhone=cleanText(a.contactNumber||a.phone,80),address=cleanText(a.address,240),outcome=appointmentOutcomeLabel(a.outcome),note=cleanText(a.outcomeNote,320),id=calendarExportId(a,sourceDate);
    rows.push({id:`appointment-${id}`,recordId:id,sourceDate,type:'appointment',name:cleanText(a.contactName||a.name,120)||'Contact not recorded',phone:rawPhone,dial:rawPhone.replace(/[^+\d]/g,''),dueDate:a.followUpDate||viewDate,overdue:Boolean(a.followUpDate&&a.followUpDate<viewDate),role:`${appointmentType(a)} appointment`,why:note||outcome||`Outcome follow-up for ${address||'the appointment'}`,last:[outcome,address,appointmentScheduledDate(a,sourceDate)?fmtDate(appointmentScheduledDate(a,sourceDate)):''].filter(Boolean).join(' · '),appointment:a});
  });
  prospectFollowUpsForDate(viewDate).filter(prospect=>!buyersWithMatches.has(prospect.id)&&!dailyPlanProspectFollowUpComplete(prospect,viewDate)).forEach(prospect=>{
    const context=prospectFollowUpReason(prospect),buyer=prospectHasActiveBuyerRole(prospect),phone=primaryProspectPhone(prospect);
    rows.push({id:`prospect-${prospect.id}`,recordId:prospect.id,type:buyer?'buyer':'prospect',name:prospect.name||'Contact not recorded',phone,dial:phone.replace(/[^+\d]/g,''),dueDate:prospect.nextFollowUp,overdue:Boolean(prospect.nextFollowUp&&prospect.nextFollowUp<viewDate),role:buyer?'Buyer follow-up':'Contact follow-up',why:context.why,last:context.last,lastDate:context.lastDate,prospect});
  });
  const temperatureRank={Hot:0,Warm:1,Cold:2};
  return rows.sort((a,b)=>Number(b.overdue)-Number(a.overdue)||String(a.dueDate||'').localeCompare(String(b.dueDate||''))||(temperatureRank[a.prospect?.temperature]??9)-(temperatureRank[b.prospect?.temperature]??9)||a.name.localeCompare(b.name,'en-AU',{sensitivity:'base'}));
}
function followUpContextCardMarkup(row={}){
  const due=row.overdue?`Overdue · ${fmtDate(row.dueDate)}`:row.dueDate===todayKey()?'Due today':row.dueDate?`Due ${fmtDate(row.dueDate)}`:'Action due',lastDate=row.lastDate?` · ${fmtDate(row.lastDate)}`:'',call=row.dial?`<a class="followup-record-action primary" href="tel:${escapeHtml(row.dial)}" ${row.type==='appointment'?`data-appointment-followup-call="${escapeHtml(row.recordId)}" data-source-date="${escapeHtml(row.sourceDate)}"`:`data-prospect-call="${escapeHtml(row.recordId)}" data-call-from-session="0" data-call-return-mode="followups"`}>Call</a>`:'<button class="followup-record-action primary" type="button" disabled>No phone</button>',action=row.type==='appointment'?`<button class="followup-record-action secondary" type="button" data-context-appointment-outcome="${escapeHtml(row.recordId)}" data-source-date="${escapeHtml(row.sourceDate)}">Update outcome</button>`:`<button class="followup-record-action secondary" type="button" data-context-followup-log="${escapeHtml(row.recordId)}">Log outcome</button>`,source=row.sourceDate?` data-source-date="${escapeHtml(row.sourceDate)}"`:'';
  return`<article class="followup-context-card followup-record ${row.overdue?'is-overdue':''}"><button class="followup-record-check" type="button" role="checkbox" aria-checked="false" aria-label="Mark follow-up cleared for ${escapeHtml(row.name)}" data-clear-followup="${escapeHtml(row.recordId)}" data-followup-type="${escapeHtml(row.type)}"${source}><span aria-hidden="true">✓</span></button><div class="followup-record-content"><div class="followup-context-head"><div><span>${escapeHtml(row.role.toUpperCase())}</span><h3>${escapeHtml(row.name)}</h3></div><b>${escapeHtml(due)}</b></div><div class="followup-record-context"><strong>${escapeHtml(row.why)}</strong><small>${escapeHtml(row.last)}${escapeHtml(lastDate)}</small></div><div class="followup-context-actions">${call}${action}</div></div></article>`
}
function renderTodayFollowUpQueue(){
  const list=$('#followUpContextQueue');if(!list)return;const rows=todayFollowUpQueueModel(),overdue=rows.filter(row=>row.overdue).length;
  $('#followUpQueueCount').textContent=String(rows.length);$('#followUpQueueSummary').textContent=rows.length?`${rows.length} exact record${rows.length===1?'':'s'} need a clear next step${overdue?` · ${overdue} overdue`:''}`:'Every scheduled follow-up has been resolved.';
  list.innerHTML=rows.length?rows.map(followUpContextCardMarkup).join(''):'<div class="prospect-empty"><strong>Follow-ups cleared</strong><small>Completed calls and appointment outcomes automatically remove work from this queue.</small></div>';
}
function openTodayFollowUpQueue(){switchView('prospectingView');prospectTodayMode='followups';setProspectorSection('today',{todayMode:'followups'});renderProspecting()}
function dailyPlanBuyerUpdateCopy(buyerCount=0,sellerCount=0,urgentCount=0,duration=15){
  const clientLabel=`${buyerCount} Client${buyerCount===1?'':'s'} To Speak To`,priorityTitle=sellerCount?`${sellerCount} Buyer + Seller${sellerCount===1?'':'s'} To Prioritise`:urgentCount?`${urgentCount} Time-Sensitive Buyer${urgentCount===1?'':'s'} To Prioritise`:'Matched Buyer Opportunities',commandPriority=sellerCount?priorityTitle:urgentCount?priorityTitle:`${buyerCount} Matched Buyer${buyerCount===1?'':'s'} Ready`;
  return{kicker:`BUYER UPDATE · ${buyerCount} CLIENT${buyerCount===1?'':'S'}`,title:priorityTitle,meta:`${clientLabel} · ${duration} Min Protected`,commandTitle:'Buyer Update',commandMeta:`${clientLabel} · ${commandPriority} · ${duration} Protected Minutes.`};
}
function dailyPlanBuyerMatchWorkload(viewDate){
  if(viewDate!==todayKey())return null;const envelopes=buyerMatchContactEnvelopes(viewDate);if(!envelopes.length)return null;const buyerCount=envelopes.length,propertyKeys=new Set(envelopes.flatMap(row=>row.matches.map(match=>match.propertyKey))),propertyCount=propertyKeys.size,duration=dailyPlanRoundMinutes(buyerCount*5,15,45),matches=envelopes.map(row=>({buyerId:row.buyer.id,buyerName:row.buyer.name,matchId:row.primary.id,address:row.primary.address,suburb:row.primary.suburb,eventType:row.primary.eventType,reason:row.primary.reason,phone:row.phone,propertyCount:row.propertyCount,additionalAddresses:row.matches.slice(1).map(match=>[match.address,match.suburb].filter(Boolean).join(', ')),followUpDue:row.followUpDue,followUpLabel:row.followUpLabel,state:buyerMatchStateLabel(row.primary),urgency:row.urgency,sellerOpportunity:buyerSellerOpportunityFor(row.buyer,row.primary)})),sellerCount=matches.filter(match=>match.sellerOpportunity).length,urgentCount=matches.filter(match=>match.urgency).length,criticalCount=matches.filter(match=>match.urgency?.level==='critical').length,copy=dailyPlanBuyerUpdateCopy(buyerCount,sellerCount,urgentCount,duration);
  return{id:'buyer-matches',workloadId:'buyer-matches',kind:'buyer-match',title:copy.title,meta:copy.meta,kicker:copy.kicker,duration,minimumSegment:15,clientCount:buyerCount,propertyCount,sellerCount,urgentCount,criticalCount,remainingClients:buyerCount,matches,completed:false,actionable:true,action:'view-buyer-matches',label:'Open buyers',commandTitle:copy.commandTitle,commandMeta:copy.commandMeta,rank:criticalCount?-85:urgentCount?-70:-60};
}
function dailyPlanFollowUpWorkload(viewDate){
  const rows=todayFollowUpQueueModel(viewDate),count=rows.length;if(!count)return null;
  const overdue=rows.filter(row=>row.overdue).length,duration=dailyPlanRoundMinutes(estimatedMinutes(count),15,45);
  return{id:'followups',workloadId:'followups',kind:'followup-block',title:overdue?'Clear overdue follow-ups':'Today’s follow-ups',meta:`${count} conversation${count===1?'':'s'} · ${duration} min protected${overdue?` · ${overdue} overdue`:''}`,kicker:`FOLLOW-UPS · ${count} DUE`,duration,clientCount:count,remainingClients:count,completed:false,actionable:true,action:'view-followups',label:'Open follow-ups',commandTitle:overdue?`Clear ${overdue} overdue follow-up${overdue===1?'':'s'}`:`Work ${count} follow-up${count===1?'':'s'}`,commandMeta:`${count} conversation${count===1?'':'s'} need a clear next step · ${duration} protected minutes.`,rank:20};
}
function dailyPlanPipelineWorkload(viewDate){
  if(viewDate!==todayKey())return null;const count=returningSnapshotPipelineCount();if(!count)return null;
  const active=prospectSessionActive&&!cleanText(prospectSessionContext?.eventId,160),duration=dailyPlanRoundMinutes(estimatedMinutes(count,180),15,60);
  return{id:'pipeline',workloadId:'pipeline',kind:'pipeline-block',title:active?'Current pipeline session':'Core pipeline calls',meta:`${count} eligible client${count===1?'':'s'} · ${duration} min protected`,kicker:`PIPELINE · ${count} READY`,duration,clientCount:count,remainingClients:count,completed:false,actionable:true,action:active?'resume-session':'view-pipeline',label:active?'Resume session':'Open pipeline',commandTitle:active?'Resume the current pipeline':'Build from the existing pipeline',commandMeta:`${count} eligible client${count===1?' is':'s are'} ready · ${duration} protected minutes.`,rank:active?-90:40};
}
function dailyPlanWorkloads(viewDate){
  const market=dailyPlanMarketWorkloads(viewDate),buyerMatches=dailyPlanBuyerMatchWorkload(viewDate),followUp=dailyPlanFollowUpWorkload(viewDate),pipeline=dailyPlanPipelineWorkload(viewDate),preferred=market.filter(item=>item.bucket==='listed'||item.bucket==='sold'),other=market.filter(item=>item.bucket!=='listed'&&item.bucket!=='sold'),active=market.filter(item=>item.rank<0),ordered=[];
  active.forEach(item=>ordered.push(item));if(pipeline?.rank<0)ordered.push(pipeline);if(buyerMatches)ordered.push(buyerMatches);preferred.filter(item=>!ordered.includes(item)).forEach(item=>ordered.push(item));if(followUp)ordered.push(followUp);other.filter(item=>!ordered.includes(item)).forEach(item=>ordered.push(item));if(pipeline&&!ordered.includes(pipeline))ordered.push(pipeline);
  return ordered;
}
function dailyPlanAllocateWorkloads(workloads=[],slots=[]){
  const available=slots.map(slot=>({...slot,cursor:slot.start})),items=[],backlog=[];
  workloads.forEach(workload=>{
    const minimumSegment=Math.max(10,Number(workload.minimumSegment)||10);let remaining=Math.max(minimumSegment,Number(workload.duration)||15),part=0;
    for(const slot of available){
      if(remaining<=0)break;const capacity=slot.end-slot.cursor;if(capacity<minimumSegment)continue;
      let take=Math.min(remaining,capacity);if(remaining>take&&remaining-take<minimumSegment)take-=minimumSegment-(remaining-take);if(take<minimumSegment)continue;
      part++;items.push({...workload,id:`${workload.id}-part-${part}`,sourceWorkloadId:workload.workloadId||workload.id,minutes:slot.cursor,duration:take,plan:true});slot.cursor+=take+5;remaining-=take;
    }
    if(remaining>0)backlog.push({...workload,remainingDuration:remaining});
  });
  const totals=new Map();items.forEach(item=>totals.set(item.sourceWorkloadId,(totals.get(item.sourceWorkloadId)||0)+1));
  const positions=new Map();items.forEach(item=>{const position=(positions.get(item.sourceWorkloadId)||0)+1;positions.set(item.sourceWorkloadId,position);item.partIndex=position;item.partTotal=totals.get(item.sourceWorkloadId)||1});
  return{items,backlog};
}
function dailyPlanStreetAllocations(streets=[],targetMinutes=60){
  const total=Math.max(5,Math.ceil(Math.max(0,Number(targetMinutes)||0)/5)*5),selected=streets.slice(0,Math.max(1,Math.min(3,Math.floor(total/5))));if(!selected.length)return[];
  const minimum=total>=selected.length*10?10:5,weightTotal=selected.reduce((sum,item)=>sum+Math.max(1,item.score),0);let allocations=selected.map(item=>({...item,minutes:Math.max(minimum,Math.round(total*(Math.max(1,item.score)/weightTotal)/5)*5)})),allocated=allocations.reduce((sum,item)=>sum+item.minutes,0);
  while(allocated>total){const candidate=[...allocations].reverse().find(item=>item.minutes>minimum);if(!candidate)break;candidate.minutes-=5;allocated-=5}
  let index=0;while(allocated<total){allocations[index%allocations.length].minutes+=5;allocated+=5;index++}
  return allocations;
}
function dailyPlanAssignStreetAllocations(items=[],allocations=[]){
  const remaining=allocations.map(item=>({...item,remainingMinutes:item.minutes}));
  items.forEach(item=>{
    let capacity=Math.max(0,Number(item.duration)||0);item.streets=[];
    for(const street of remaining){if(capacity<=0)break;if(street.remainingMinutes<=0)continue;const minutes=Math.min(capacity,street.remainingMinutes);item.streets.push({...street,minutes});street.remainingMinutes-=minutes;capacity-=minutes}
  });
  return items;
}
function dailyPlanAssignBuyerMatches(items=[]){
  if(!items.length)return items;const remaining=[...(items[0].matches||[])];items.forEach((item,index)=>{const capacity=Math.max(1,Math.floor((Number(item.duration)||15)/5)),matches=remaining.splice(0,capacity),buyerCount=matches.length,propertyCount=matches.reduce((sum,match)=>sum+Math.max(1,Number(match.propertyCount)||1),0),sellerCount=matches.filter(match=>match.sellerOpportunity).length,urgentCount=matches.filter(match=>match.urgency).length,overflow=index===items.length-1&&remaining.length?` · ${remaining.length} More In Buyers`:'',copy=dailyPlanBuyerUpdateCopy(buyerCount,sellerCount,urgentCount,item.duration);item.matches=matches;item.clientCount=buyerCount;item.propertyCount=propertyCount;item.sellerCount=sellerCount;item.urgentCount=urgentCount;item.title=copy.title;item.kicker=copy.kicker;item.meta=`${copy.meta}${overflow}`;item.commandTitle=copy.commandTitle;item.commandMeta=copy.commandMeta});return items
}
function timelineItemsForDate(viewDate){
  if(viewDate!==todayKey())return legacyTimelineItemsForDate(viewDate);
  if(!isWorkDayKey(viewDate))return legacyTimelineItemsForDate(viewDate);
  const appointmentModel=dailyPlanAppointmentModel(viewDate),knockTarget=rollingKnockTarget(viewDate),knockDone=Math.floor(liveKnockSeconds(dayData(viewDate))/60),knockRemaining=Math.max(0,knockTarget-knockDone),streets=knockingHotSpottingRecommendations(),knockDuration=knockRemaining||Math.max(15,knockTarget),knockSlots=dailyPlanFreeSlots(14*60,18*60,appointmentModel.busy),knockWorkload={id:'knocking',workloadId:'knocking',kind:'knock',title:'Priority street',meta:`${knockRemaining} min remaining · ${streets.length} qualifying street${streets.length===1?'':'s'}`,kicker:`DOORKNOCKING · ${knockTarget} MIN TARGET`,duration:knockDuration,completed:false,actionable:true,action:'start-knocking',label:knockingSessionActive?'Resume knocking':'Start knocking'};
  let knockAllocation;
  if(!knockRemaining){
    knockAllocation={items:[{...knockWorkload,id:'knocking-complete',sourceWorkloadId:'knocking',minutes:14*60,duration:15,title:'Door knocking complete',meta:`${knockDone} min logged · target complete`,completed:true,actionable:false,action:'',label:'',commandTitle:'Door knocking complete',commandMeta:'Today’s knocking target is complete.',plan:true,partIndex:1,partTotal:1}],backlog:[]}
  }else if(streets.length){
    knockAllocation=dailyPlanAllocateWorkloads([knockWorkload],knockSlots)
  }else{
    knockAllocation={items:[{id:'knocking-waiting',sourceWorkloadId:'knocking',minutes:14*60,duration:15,title:'No qualifying street ready',meta:'AGNT only recommends Just Listed or Sold streets with saved contact data.',kicker:'DOORKNOCKING · MARKETPULSE REQUIRED',kind:'knock-waiting',completed:false,clockComplete:true,actionable:false,action:'',label:'',commandTitle:'No qualifying street to knock yet',commandMeta:'A street will appear when Just Listed or Sold activity matches contact data in AGNT.',plan:true,partIndex:1,partTotal:1}],backlog:[]}
  }
  const scheduledKnockMinutes=knockAllocation.items.filter(item=>item.kind==='knock').reduce((sum,item)=>sum+item.duration,0),streetAllocations=knockRemaining&&scheduledKnockMinutes?dailyPlanStreetAllocations(streets,scheduledKnockMinutes):[];
  dailyPlanAssignStreetAllocations(knockAllocation.items.filter(item=>item.kind==='knock'),streetAllocations);
  knockAllocation.items.forEach(item=>{
    if(item.kind!=='knock')return;
    const primary=item.streets[0],extra=Math.max(0,item.streets.length-1),activity=primary?[...new Set(primary.events.map(event=>cleanText(event.eventType,60)).filter(Boolean))].join(' + '):'';
    item.title=primary?`Knock ${primary.street}`:'Priority street';
    item.commandTitle=item.title;
    item.meta=primary?`${item.duration} min field block · ${primary.neighbourCount} saved contact${primary.neighbourCount===1?'':'s'}${extra?` · ${extra} more street${extra===1?'':'s'}`:''}`:`${item.duration} min field block`;
    item.commandMeta=primary?`${[primary.street,primary.suburb].filter(Boolean).join(', ')} · ${activity} · ${primary.recency}.`:`${item.duration} minutes remain.`;
    item.eventId=primary?.key||''
  });
  const knockIntervals=knockAllocation.items.filter(item=>item.kind==='knock').map(item=>({start:item.minutes,end:item.minutes+item.duration})),lastKnockEnd=knockAllocation.items.filter(item=>item.kind==='knock').reduce((latest,item)=>Math.max(latest,item.minutes+item.duration),14*60),progressBusy=[...appointmentModel.busy,...knockIntervals],progressStart=dailyPlanNextFreeStart(Math.max(16*60,lastKnockEnd+5),18*60,15,progressBusy),progressItem=progressStart===null?null:{id:'progress',minutes:progressStart,duration:15,title:'Daily progress check',meta:'Review calls, connects, data and the remaining queue',kicker:'RESET',kind:'check',plan:true,actionable:false,action:'',label:'',commandTitle:'Reset the final part of the day',commandMeta:'Review what moved, then protect the most valuable unfinished block.'},progressInterval=progressItem?[{start:progressItem.minutes,end:progressItem.minutes+progressItem.duration}]:[],callBusy=[...appointmentModel.busy,...knockIntervals,...progressInterval],callSlots=[...dailyPlanFreeSlots(9*60,14*60,callBusy),...dailyPlanFreeSlots(16*60,18*60,callBusy)],workAllocation=dailyPlanAllocateWorkloads(dailyPlanWorkloads(viewDate),callSlots),callBacklogMinutes=workAllocation.backlog.reduce((sum,item)=>sum+item.remainingDuration,0),knockBacklogMinutes=knockAllocation.backlog.reduce((sum,item)=>sum+item.remainingDuration,0),backlogMinutes=callBacklogMinutes+knockBacklogMinutes,latestAppointmentEnd=appointmentModel.items.filter(item=>item.kind==='appointment'||item.kind==='ofi').reduce((latest,item)=>Math.max(latest,item.minutes+item.duration),0),wrapStart=Math.max(18*60,latestAppointmentEnd+5),wrapItem={id:'wrap',minutes:wrapStart,duration:15,title:'Close the day',meta:backlogMinutes?`${formatEstimatedTime(backlogMinutes)} remains outside today’s protected blocks · set tomorrow’s first priority`:'Review outcomes and prepare tomorrow’s first priority',kicker:'WRAP UP',kind:'wrap',plan:true,actionable:false,action:'view-log',label:'Open day log',commandTitle:'Close the day properly',commandMeta:backlogMinutes?`${formatEstimatedTime(backlogMinutes)} is still unplaced. Decide what carries forward before you finish.`:'Review today’s outcomes and make tomorrow easy to start.'};
  dailyPlanAssignBuyerMatches(workAllocation.items.filter(item=>item.kind==='buyer-match'));
  const items=[...workAllocation.items,...appointmentModel.items,...knockAllocation.items,...(progressItem?[progressItem]:[]),wrapItem],order={appointment:0,ofi:0,'buyer-match':1,market:2,'followup-block':3,'pipeline-block':4,knock:5,'knock-waiting':6,check:7,wrap:8};
  return items.sort((a,b)=>a.minutes-b.minutes||(order[a.kind]??9)-(order[b.kind]??9)||a.title.localeCompare(b.title));
}
function timelineStatus(item,index,items,viewDate,focusItemId=''){
  if(item.plan){
    if(item.completed)return'complete';
    if(viewDate<todayKey())return'complete';
    if(viewDate>todayKey())return'upcoming';
    const now=new Date(),nowMinutes=now.getHours()*60+now.getMinutes(),end=item.minutes+(item.duration||15);
    if(focusItemId&&item.id===focusItemId)return'current';
    if(nowMinutes<item.minutes)return'upcoming';
    if(nowMinutes<end)return'current';
    if(item.clockComplete)return'complete';
    return item.actionable?'attention':'complete';
  }
  if(item.kind==='followup'){
    if(item.completed)return'complete';
    if(focusItemId&&item.id===focusItemId)return'current';
    return'upcoming';
  }
  if(viewDate<todayKey())return'complete';
  if(viewDate>todayKey())return'upcoming';
  const now=new Date(),nowMinutes=now.getHours()*60+now.getMinutes();
  if(nowMinutes<item.minutes)return'upcoming';
  const nextTimedItem=items.find((candidate,candidateIndex)=>candidateIndex>index&&candidate.kind!=='followup'&&candidate.minutes>item.minutes);
  if(nextTimedItem&&nowMinutes>=nextTimedItem.minutes)return'complete';
  return'current';
}
function timelineTimeBlockIndex(items,viewDate){
  if(viewDate!==todayKey()||!items.length)return-1;
  const now=new Date(),nowMinutes=now.getHours()*60+now.getMinutes();
  const timed=items.map((item,index)=>({item,index})).filter(({item})=>item.kind!=='followup');
  let active=-1;
  for(const {item,index} of timed){
    if(nowMinutes>=item.minutes)active=index;else break;
  }
  return active;
}
function timelineFocusId(items,kind){
  return items.find(item=>item.kind===kind)?.id||'';
}
function timelineFollowUpId(items,entry){
  if(!entry)return'';
  if(entry.appointment)return`followup-${calendarExportId(entry.appointment,entry.sourceDate)}`;
  if(entry.id)return`contact-followup-${entry.id}`;
  return items.find(item=>item.kind==='followup')?.id||'';
}
function coachingMetricState(viewDate=selectedDate){
  const d=dayData(viewDate),knockTarget=rollingKnockTarget(viewDate),knockMinutes=Math.floor(liveKnockSeconds(d)/60);
  const metrics=[
    {key:'calls',label:'calls',action:'Stay on the phones',value:d.calls,target:targets.calls,rate:10},
    {key:'connects',label:'connects',action:'Focus on connects',value:d.connects,target:targets.connects,rate:5},
    {key:'data',label:'data records',action:'Switch to data collection',value:d.data,target:targets.data,rate:2}
  ].map(m=>({...m,remaining:Math.max(0,m.target-m.value),progress:pct(m.value,m.target)}));
  return{d,knockTarget,knockMinutes,knockRemaining:Math.max(0,knockTarget-knockMinutes),metrics,incomplete:metrics.filter(m=>m.remaining>0)};
}
function activeProspectingMomentum(viewDate=selectedDate,now=Date.now()){
  if(viewDate!==todayKey())return null;
  const d=dayData(viewDate),windowMs=15*60*1000,events=(d.events||[]).filter(event=>{
    const at=Number(event?.at)||0;
    return ['calls','connects','data'].includes(event?.type)&&Number(event?.delta)>0&&now-at<=windowMs;
  });
  if(events.length<2)return null;
  const counts={calls:0,connects:0,data:0};
  events.forEach(event=>{counts[event.type]+=Math.max(1,Number(event.delta)||1)});
  const active=Object.entries(counts).filter(([,value])=>value>0).map(([key])=>key);
  const labels={calls:'calls',connects:'connects',data:'data'};
  const detail=active.map(key=>labels[key]).join(active.length>1?' and ':', ');
  return{events:events.length,counts,active,detail,lastAt:Math.max(...events.map(event=>Number(event.at)||0))};
}
function balancedCorePriority(state,now){
  const order=['calls','connects','data'];
  const incomplete=order.map(key=>state.metrics.find(metric=>metric.key===key)).filter(metric=>metric&&metric.remaining>0);
  if(!incomplete.length)return null;
  const behind=incomplete.map(metric=>{
    const expected=expectedAt(metric.key,metric.target,now);
    return{metric,gap:Math.max(0,expected-metric.value),ratio:Math.max(0,expected-metric.value)/Math.max(1,metric.target)};
  }).filter(item=>item.gap>=Math.max(1,Math.ceil(item.metric.target*.1)));
  if(behind.length){
    behind.sort((a,b)=>b.ratio-a.ratio||order.indexOf(a.metric.key)-order.indexOf(b.metric.key));
    return behind[0].metric;
  }
  return incomplete[0];
}
function legacyMetricCoachingEngine(viewDate=selectedDate,items=legacyTimelineItemsForDate(viewDate)){
  if(!isWorkDayKey(viewDate))return{title:'No tracking day scheduled',meta:'Your metrics remain available for reference',focusItemId:''};
  if(viewDate<todayKey())return{title:'Day complete',meta:`Final score ${completion(viewDate)}%`,focusItemId:''};
  if(viewDate>todayKey())return{title:'Plan your day',meta:items[0]?`First block starts ${timelineTimeLabel(items[0].minutes)}`:'No scheduled items',focusItemId:items[0]?.id||''};

  const now=new Date(),nowMinutes=now.getHours()*60+now.getMinutes(),state=coachingMetricState(viewDate);
  const currentAppointment=items.find(item=>(item.kind==='appointment'||item.kind==='ofi')&&nowMinutes>=item.minutes&&nowMinutes<item.minutes+(item.duration||60));
  const nextAppointment=items.find(item=>(item.kind==='appointment'||item.kind==='ofi')&&item.minutes>nowMinutes);
  const minutesToAppointment=nextAppointment?nextAppointment.minutes-nowMinutes:Infinity;
  const todayFollowUps=allFollowUpsForDate(viewDate);
  const prospectingId=timelineFocusId(items,'focus'),knockingId=timelineFocusId(items,'knock'),progressId=timelineFocusId(items,'check'),wrapId=timelineFocusId(items,'wrap');

  if(currentAppointment)return{title:'Appointment Window',meta:`${currentAppointment.title} · Resume prospecting afterwards`,focusItemId:currentAppointment.id};
  if(nextAppointment&&minutesToAppointment<=10)return{title:'Appointment Window',meta:`${nextAppointment.title} starts in ${minutesToAppointment} min`,focusItemId:nextAppointment.id};
  if(nextAppointment&&minutesToAppointment<=30)return{title:'Appointment Window',meta:`Complete the current block, then prepare for ${timelineTimeLabel(nextAppointment.minutes)}`,focusItemId:nextAppointment.id};
  if(todayFollowUps.length&&nowMinutes<12*60)return{title:'Follow-Up Priority',meta:`${todayFollowUps.length} follow-up call${todayFollowUps.length===1?' is':'s are'} prioritised this morning`,focusItemId:timelineFollowUpId(items,todayFollowUps[0])};
  const followUps=dueFollowUps();
  if(followUps.length)return{title:'Follow-Up Priority',meta:`${followUps.length} past appointment${followUps.length===1?' needs':'s need'} an outcome`,focusItemId:timelineFollowUpId(items,followUps[0])||prospectingId};

  const allCoreComplete=state.incomplete.length===0;
  if(allCoreComplete&&state.knockRemaining===0){
    if(nowMinutes>=18*60+30)return{title:'Plan Ahead',meta:'Today’s targets are complete · Prepare the next workday',focusItemId:wrapId};
    if(nowMinutes>=17*60)return{title:'Calendar Management',meta:'Today’s targets are complete · Finalise follow-up and your calendar',focusItemId:wrapId};
    return{title:'Day Complete',meta:'All daily targets have been achieved',focusItemId:progressId};
  }

  if(nowMinutes>=14*60&&state.knockRemaining>0){
    const available=Math.max(0,17*60-nowMinutes);
    if(available<=0)return{title:'Finish Strong',meta:`${state.knockRemaining} knocking min will roll into the next scheduled day`,focusItemId:knockingId};
    const finish=new Date(now.getTime()+state.knockRemaining*60000);
    const finishLabel=finish.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'});
    return{title:'Time To Knock',meta:`${state.knockRemaining} min remaining · Finish around ${finishLabel}`,focusItemId:knockingId};
  }

  if(nowMinutes>=13*60+30&&nowMinutes<14*60&&state.knockRemaining>0){
    return{title:'Time To Knock',meta:`Door knocking starts in ${14*60-nowMinutes} min · ${state.knockRemaining} min target`,focusItemId:knockingId};
  }

  if(nowMinutes>=18*60+30)return{title:'Plan Ahead',meta:allCoreComplete?'Today’s core targets are complete':'Review unfinished activity and prepare the next workday',focusItemId:wrapId};

  if(state.incomplete.length){
    const momentum=activeProspectingMomentum(viewDate,now.getTime());
    if(momentum){
      const primary=balancedCorePriority(state,now);
      const remaining=primary?`${primary.remaining} ${primary.label} remaining`:'Core activity is moving';
      const momentumTitle=momentum.active.length===1&&momentum.active[0]==='calls'?'Strong Calling Run':'Prospecting Momentum';
      return{title:momentumTitle,meta:`${momentum.detail.charAt(0).toUpperCase()+momentum.detail.slice(1)} are moving · Keep the streak going · ${remaining}`,focusItemId:prospectingId};
    }
    const priority=balancedCorePriority(state,now)||state.incomplete[0];
    const coreDeadlineMinutes=14*60;
    const available=Math.max(1,coreDeadlineMinutes-nowMinutes);
    const possible=Math.max(1,Math.floor(available/60*priority.rate));
    const blockTarget=Math.min(priority.remaining,possible);
    const expected=expectedAt(priority.key,priority.target,now),behind=Math.max(0,expected-priority.value);
    if(behind>=Math.max(1,Math.ceil(priority.target*.1))){
      const recoveryMinutes=Math.max(10,Math.ceil(behind/priority.rate*60/5)*5);
      const recoveryTitle=nowMinutes>=16*60?'Finish Strong':nowMinutes>=12*60?'Afternoon Push':priority.key==='calls'?'Strong Calling Run':priority.action;
      return{title:recoveryTitle,meta:`${behind} ${priority.label} behind pace · Hold this focus for ${recoveryMinutes} minutes`,focusItemId:prospectingId};
    }
    const steadyTitle=nowMinutes>=16*60?'Finish Strong':nowMinutes>=12*60?'Afternoon Push':priority.key==='calls'?'Strong Calling Run':priority.action;
    return{title:steadyTitle,meta:`Build a steady block · ${blockTarget} ${priority.label} before ${timelineTimeLabel(coreDeadlineMinutes)}`,focusItemId:prospectingId};
  }

  return{title:'You’re ahead',meta:state.knockRemaining?`Core targets complete · Door knocking begins at 2:00pm`:'All targets complete',focusItemId:state.knockRemaining?knockingId:progressId};
}
function dailyPlanTimeRange(item){return `${timelineTimeLabel(item.minutes)}–${timelineTimeLabel(item.minutes+(item.duration||15))}`}
function dailyCommandFromItem(item,mode='current'){
  if(!item)return null;
  let meta=item.commandMeta||item.meta||'';
  if(mode==='next')meta=`Starts ${timelineTimeLabel(item.minutes)} · ${meta}`;
  if(mode==='attention')meta=`Still open · ${meta}`;
  return{title:item.commandTitle||item.title,meta,kicker:mode==='attention'?'NEEDS ATTENTION':item.kicker||'RIGHT NOW',timeLabel:dailyPlanTimeRange(item),focusItemId:item.id,action:item.action||'',label:item.label||'',eventId:item.eventId||''};
}
function dailyCommandPriority(viewDate=selectedDate,items=timelineItemsForDate(viewDate),now=new Date()){
  if(!isWorkDayKey(viewDate))return{title:'No tracking day scheduled',meta:'Your metrics remain available for reference.',kicker:'TODAY',timeLabel:'',focusItemId:'',action:'',label:'',eventId:''};
  if(viewDate<todayKey())return{title:'Day complete',meta:`Final score ${completion(viewDate)}%.`,kicker:'DAY COMPLETE',timeLabel:'',focusItemId:'',action:'view-log',label:'View day log',eventId:''};
  if(viewDate>todayKey()){const first=items[0];return first?dailyCommandFromItem(first,'next'):{title:'Plan your day',meta:'No scheduled blocks yet.',kicker:'UPCOMING',timeLabel:'',focusItemId:'',action:'view-appointments',label:'Add appointment',eventId:''}}
  const nowMinutes=now.getHours()*60+now.getMinutes(),incomplete=item=>!item.completed&&!(item.clockComplete&&nowMinutes>=item.minutes+(item.duration||15)),appointments=items.filter(item=>item.kind==='appointment'||item.kind==='ofi'),knocking=items.filter(item=>item.kind==='knock'),actionable=items.filter(item=>item.actionable&&incomplete(item)),currentAppointment=appointments.find(item=>nowMinutes>=item.minutes&&nowMinutes<item.minutes+(item.duration||60)),nextAppointment=appointments.find(item=>item.minutes>nowMinutes),activeEventId=cleanText(prospectSessionContext?.eventId,160);
  if(currentAppointment)return dailyCommandFromItem(currentAppointment);
  if(nextAppointment&&nextAppointment.minutes-nowMinutes<=30)return dailyCommandFromItem(nextAppointment,'next');
  if(prospectSessionActive&&activeEventId){const sessionItem=items.find(item=>item.eventId===activeEventId&&!item.completed)||items.find(item=>item.kind==='market'&&!item.completed);if(sessionItem){const command=dailyCommandFromItem(sessionItem);command.title=`Resume ${sessionItem.title}`;command.meta=`Active Hot Spotting session · ${Math.max(0,prospectSessionIds.length-prospectSessionIndex)} client${Math.max(0,prospectSessionIds.length-prospectSessionIndex)===1?'':'s'} remain.`;command.action='resume-session';command.label='Resume calls';return command}}
  if(prospectSessionActive&&!activeEventId){const sessionItem=items.find(item=>item.kind==='pipeline-block'&&!item.completed);if(sessionItem){const command=dailyCommandFromItem(sessionItem);command.title='Resume the current pipeline';command.meta=`${Math.max(0,prospectSessionIds.length-prospectSessionIndex)} client${Math.max(0,prospectSessionIds.length-prospectSessionIndex)===1?'':'s'} remain in the active session.`;command.action='resume-session';command.label='Resume session';return command}}
  const activeKnock=knocking.find(item=>nowMinutes>=item.minutes&&nowMinutes<item.minutes+(item.duration||60)&&incomplete(item));
  if(activeKnock)return dailyCommandFromItem(activeKnock);
  const current=actionable.find(item=>nowMinutes>=item.minutes&&nowMinutes<item.minutes+(item.duration||15));if(current)return dailyCommandFromItem(current);
  if(nowMinutes>=13*60+30){const nextKnock=knocking.find(item=>item.minutes>=nowMinutes&&incomplete(item));if(nextKnock&&nextKnock.minutes-nowMinutes<=45)return dailyCommandFromItem(nextKnock,'next')}
  const attention=actionable.filter(item=>nowMinutes>=item.minutes+(item.duration||15)).sort((a,b)=>{const priority={'buyer-match':0,market:1,'followup-block':2,'pipeline-block':3,knock:4,appointment:5,ofi:5};return(priority[a.kind]??9)-(priority[b.kind]??9)||a.minutes-b.minutes})[0];
  if(nowMinutes>=18*60+30){const wrap=items.find(item=>item.kind==='wrap'),openCount=actionable.filter(item=>item.minutes+(item.duration||15)<=nowMinutes).length;if(wrap){const command=dailyCommandFromItem(wrap);command.title='Close the day properly';command.meta=openCount?`${openCount} planned block${openCount===1?' remains':'s remain'} open. Decide what carries forward, then set tomorrow’s first move.`:'Review the outcomes, record the wins and make tomorrow easy to start.';return command}}
  if(attention&&nowMinutes<14*60)return dailyCommandFromItem(attention,'attention');
  const next=actionable.filter(item=>item.minutes>nowMinutes).sort((a,b)=>a.minutes-b.minutes)[0];if(next)return dailyCommandFromItem(next,'next');
  if(attention)return dailyCommandFromItem(attention,'attention');
  const currentSupport=items.find(item=>!item.completed&&nowMinutes>=item.minutes&&nowMinutes<item.minutes+(item.duration||15));if(currentSupport)return dailyCommandFromItem(currentSupport);
  const nextSupport=items.find(item=>!item.completed&&item.minutes>nowMinutes);if(nextSupport)return dailyCommandFromItem(nextSupport,'next');
  const fallback=legacyMetricCoachingEngine(viewDate,legacyTimelineItemsForDate(viewDate));return{...fallback,kicker:'TODAY',timeLabel:'',action:'view-log',label:'View progress',eventId:''};
}
function coachingEngine(viewDate=selectedDate,items=timelineItemsForDate(viewDate)){return dailyCommandPriority(viewDate,items,new Date())}
function coachSentenceCase(value){
  const text=String(value||'').trim();
  return text?text.charAt(0).toUpperCase()+text.slice(1).toLowerCase():'';
}
function timelinePriority(viewDate=selectedDate){
  const items=timelineItemsForDate(viewDate),coach=coachingEngine(viewDate,items);
  return{...coach,items};
}
function renderNowCard(){
  const priority=timelinePriority(selectedDate);
  if($('#nowCardLabel'))$('#nowCardLabel').textContent='RIGHT NOW';
  if($('#nowCardTitle'))$('#nowCardTitle').textContent=priority.title;
  if($('#nowCardMeta'))$('#nowCardMeta').textContent=[priority.timeLabel,priority.meta].filter(Boolean).join(' · ');
}
function timelinePlanStreetsMarkup(streets=[]){
  if(!streets.length)return'';
  return `<div class="timeline-street-list" aria-label="Priority streets">${streets.map((street,index)=>`<div><span><b>${index+1}</b><strong>${escapeHtml(street.street)}</strong><small>${escapeHtml(street.suburb)}</small></span><em>${street.minutes} min</em></div>`).join('')}</div>`;
}
function timelineBuyerSellerOpportunityMarkup(opportunity){
  if(!opportunity)return'';
  return`<span class="timeline-buyer-seller-angle ${escapeHtml(opportunity.state)}"><b>${escapeHtml(opportunity.stateLabel)}</b><small>Current home · ${escapeHtml(opportunity.currentHome)}</small><i>${escapeHtml(opportunity.conversationAngle)}</i></span>`
}
function timelineBuyerMatchesMarkup(matches=[]){
  if(!matches.length)return'';return`<div class="timeline-buyer-match-list" aria-label="Buyer opportunities">${matches.map(match=>{const extra=Math.max(0,Number(match.propertyCount)||1)-1,context=[match.state,match.followUpLabel].filter(Boolean).join(' · ');return`<article class="${match.urgency?'has-time-alert':''}"><span><strong>${escapeHtml(match.buyerName)}</strong><small>${escapeHtml(match.address)}, ${escapeHtml(match.suburb)}${extra?` · +${extra} propert${extra===1?'y':'ies'}`:''}</small><em>${escapeHtml(context||match.reason)}</em></span>${buyerMatchTimeAlertMarkup(match.urgency,'timeline-buyer-time-alert')}<div><button type="button" data-buyer-match-call="${escapeHtml(match.buyerId)}" data-match-id="${escapeHtml(match.matchId)}" ${match.phone?'':'disabled'}>Call</button><button type="button" data-buyer-match-sms="${escapeHtml(match.buyerId)}" data-match-id="${escapeHtml(match.matchId)}" ${match.phone?'':'disabled'}>SMS</button><button type="button" data-open-buyer-match-outcome="${escapeHtml(match.buyerId)}" data-match-id="${escapeHtml(match.matchId)}">Outcome</button></div>${timelineBuyerSellerOpportunityMarkup(match.sellerOpportunity)}</article>`}).join('')}</div>`
}
function bulkSmsMessageIconMarkup(){return'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>'}
function timelinePlanItemMarkup(item,status){
  const marker=status==='complete'?'✓':status==='attention'?'!':status==='current'?'●':'○',part=item.partTotal>1?` · PART ${item.partIndex}/${item.partTotal}`:'',kicker=`${item.kicker||'TODAY'}${part}`,action=item.action?`<button class="timeline-plan-action ${status==='complete'?'is-complete':''}" type="button" data-plan-action="${escapeHtml(item.action)}" data-event-id="${escapeHtml(item.eventId||'')}">${escapeHtml(item.label||'Open')}</button>`:'',bulkSms=item.kind==='market'&&status!=='complete'&&marketPulseBulkSmsHasMobile(item.eventId)?`<button class="timeline-plan-action timeline-bulk-sms-action" type="button" data-market-bulk-sms="${escapeHtml(item.eventId||'')}" aria-label="Open Bulk SMS" title="Bulk SMS">${bulkSmsMessageIconMarkup()}</button>`:'',call=(item.kind==='appointment'||item.kind==='ofi')&&item.dial?`<a class="timeline-call" href="tel:${escapeHtml(item.dial)}">Call</a>`:'',actions=action||bulkSms||call?`<div class="timeline-plan-actions">${action}${bulkSms}${call}</div>`:'',buyerDetails=item.kind==='buyer-match'?'':timelineBuyerMatchesMarkup(item.matches);
  return `<article class="timeline-item ${status} ${escapeHtml(item.kind)} plan-item${status==='current'?' time-active':''}" data-plan-id="${escapeHtml(item.id)}"><time><b>${escapeHtml(timelineTimeLabel(item.minutes))}</b><i>${escapeHtml(timelineTimeLabel(item.minutes+(item.duration||15)))}</i></time><span class="timeline-marker">${marker}</span><div class="timeline-plan-copy"><span class="timeline-item-kicker">${escapeHtml(kicker)}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.meta)}</small>${buyerDetails}${timelinePlanStreetsMarkup(item.streets)}${actions}</div></article>`;
}
function renderTimeline(){
  if(!$('#dailyTimeline'))return;
  const priority=timelinePriority(selectedDate),items=priority.items;
  $('#timelineDateLabel').textContent=fmtDate(selectedDate);
  if($('#timelineCurrentKicker'))$('#timelineCurrentKicker').textContent=priority.kicker||'RIGHT NOW';
  if($('#timelineCurrentTime'))$('#timelineCurrentTime').textContent=priority.timeLabel||'';
  $('#timelineCurrentTitle').textContent=priority.title;
  $('#timelineCurrentMeta').textContent=priority.meta;
  const commandAction=$('#timelineCurrentAction');if(commandAction){const available=Boolean(priority.action&&priority.label);commandAction.hidden=!available;commandAction.textContent=priority.label||'Open AGNT';commandAction.dataset.planAction=priority.action||'';commandAction.dataset.eventId=priority.eventId||''}
  const commandBulkSms=$('#timelineCurrentBulkSms'),priorityMarketEvent=priority.eventId&&marketPulseBulkSmsEvent(priority.eventId);if(commandBulkSms){const available=Boolean(priorityMarketEvent&&marketPulseBulkSmsHasMobile(priority.eventId));commandBulkSms.hidden=!available;commandBulkSms.dataset.eventId=available?priority.eventId:''}
  const commandActions=$('#timelineCurrentActions');if(commandActions)commandActions.hidden=Boolean(commandAction?.hidden&&commandBulkSms?.hidden);
  const appointmentCount=items.filter(item=>item.kind==='appointment'||item.kind==='ofi').length,marketWorkloads=new Map();items.filter(item=>item.kind==='market').forEach(item=>{if(!marketWorkloads.has(item.sourceWorkloadId))marketWorkloads.set(item.sourceWorkloadId,item.remainingClients||0)});const marketClients=[...marketWorkloads.values()].reduce((sum,count)=>sum+count,0),buyerMatches=selectedDate===todayKey()?buyerMatchContactEnvelopes(selectedDate).length:0,summary=[];if(buyerMatches)summary.push(`${buyerMatches} buyer opportunit${buyerMatches===1?'y':'ies'}`);if(marketClients)summary.push(`${marketClients} MarketPulse client${marketClients===1?'':'s'}`);summary.push(`${appointmentCount} appointment${appointmentCount===1?'':'s'}`);summary.push(`${completion(selectedDate)}% complete`);$('#timelineSummary').textContent=summary.join(' · ');
  const activeTimeBlock=timelineTimeBlockIndex(items,selectedDate);
  $('#dailyTimeline').innerHTML=items.length?items.map((item,index)=>{
    const status=timelineStatus(item,index,items,selectedDate,priority.focusItemId);
    if(item.plan)return timelinePlanItemMarkup(item,status);
    const timeActive=index===activeTimeBlock?' time-active':'';
    const marker=item.kind==='followup'?(status==='complete'?'✓':''):(status==='complete'?'✓':status==='current'?'●':'○');
    const followUpAttrs=item.followUpType==='buyer'?`data-followup-buyer="${escapeHtml(item.prospectId)}"`:item.followUpType==='prospect'?`data-followup-prospect="${escapeHtml(item.prospectId)}"`:item.followUpType==='appointment'?`data-followup-appointment="${escapeHtml(calendarExportId(item.appointment,item.sourceDate))}" data-source-date="${escapeHtml(item.sourceDate)}"`:'';
    const markerLabel=item.followUpType==='buyer'?'Complete buyer follow-up':status==='complete'?'Follow-up completed':'Log follow-up outcome';
    const markerHtml=item.kind==='followup'?`<button class="timeline-marker timeline-followup-check" type="button" ${followUpAttrs} aria-label="${markerLabel}">${marker}</button>`:`<span class="timeline-marker">${marker}</span>`;
    const callAttrs=item.kind==='followup'&&item.followUpType==='buyer'?`data-timeline-buyer-call="${escapeHtml(item.prospectId)}"`:item.kind==='followup'&&item.followUpType==='prospect'?`data-prospect-call="${escapeHtml(item.prospectId)}"`:item.kind==='followup'&&item.followUpType==='appointment'?`data-appointment-followup-call="${escapeHtml(calendarExportId(item.appointment,item.sourceDate))}" data-source-date="${escapeHtml(item.sourceDate)}"`:'';
    const call=(item.kind==='followup'||item.kind==='appointment')&&item.dial?`<a class="timeline-call" href="tel:${escapeHtml(item.dial)}" ${callAttrs}>Call</a>`:'';
    if(item.kind==='ofi'){const a=item.appointment;const start=timelineTimeLabel(item.minutes),end=timelineTimeLabel(item.minutes+appointmentDurationMinutes(a));const auction=appointmentHasAuction(a)?`<b class="timeline-ofi-auction-time">Auction ${escapeHtml(timelineTimeLabel(appointmentAuctionMinutes(a)))}</b>`:'';return `<article class="timeline-item ${status} ofi${timeActive}"><time>${escapeHtml(start)}</time>${markerHtml}<div><strong>OFI · ${escapeHtml(a.address||'Address not recorded')}</strong><small>${escapeHtml(start)}–${escapeHtml(end)} · ${appointmentDurationMinutes(a)} minutes</small>${auction}</div></article>`;}
    return `<article class="timeline-item ${status} ${item.kind}${timeActive}"><time>${escapeHtml(timelineTimeLabel(item.minutes))}</time>${markerHtml}<div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.meta)}</small>${call}</div></article>`;
  }).join(''):'<div class="empty"><strong>Schedule clear</strong><small>Appointments and follow-ups for this date will appear here.</small></div>';
}


function allAppointmentEntries(){
  const entries=[];
  Object.entries(days).forEach(([sourceDate,day])=>(day?.appointments||[]).forEach(appointment=>entries.push({appointment,sourceDate,scheduled:appointmentScheduledDate(appointment,sourceDate)})));
  return entries.sort((x,y)=>appointmentTimestamp(x.appointment,x.sourceDate)-appointmentTimestamp(y.appointment,y.sourceDate));
}
function openAppointmentEditorFromToday(exportId=''){
  const entry=allAppointmentEntries().find(({appointment,sourceDate})=>calendarExportId(appointment,sourceDate)===exportId);
  switchView('appointmentsView');
  if(!entry){toast('Appointment could not be found');return}
  requestAnimationFrame(()=>beginEditAppointment(entry.appointment.id,entry.sourceDate));
}
const SELLER_APPOINTMENT_OUTCOMES=Object.freeze([
  {value:'Still Nurturing',label:'Still Nurturing',hint:'Set The Next Conversation',className:'outcome-blue'},
  {value:'Listed',label:'Listed',hint:'Listing Secured',className:'outcome-green'},
  {value:'Not Proceeding',label:'Not Proceeding',hint:'Close This Opportunity',className:'outcome-amber'},
  {value:'Missed',label:'Missed',hint:'Listed With Another Agent',className:'outcome-red'}
]);
const BUYER_APPOINTMENT_OUTCOMES=Object.freeze([
  {value:'Interested',label:'Interested',hint:'Keep Moving',className:'outcome-blue'},
  {value:'Further Inspection',label:'Further Inspection',hint:'Book The Next Step',className:'outcome-blue'},
  {value:'Offer Pending',label:'Offer Pending',hint:'Protect The Negotiation',className:'outcome-amber'},
  {value:'Not Suitable',label:'Not Suitable',hint:'Close This Appointment',className:'outcome-amber'},
  {value:'Purchased',label:'Purchased',hint:'Convert Buyer To Owner',className:'outcome-green'}
]);
const OPEN_APPOINTMENT_OUTCOMES=new Set(['Still Nurturing','Interested','Further Inspection','Offer Pending']);
const CLOSED_APPOINTMENT_OUTCOMES=new Set(['Price Update Booked','Listing Appointment Booked','Signed','Listed','Not Proceeding','Missed','Not Suitable','Purchased']);
function appointmentOutcomeOptionsFor(a={}){return appointmentType(a)==='BAP'?BUYER_APPOINTMENT_OUTCOMES:SELLER_APPOINTMENT_OUTCOMES}
function appointmentOutcomeNeedsFollowUp(outcome=''){return OPEN_APPOINTMENT_OUTCOMES.has(appointmentOutcomeLabel(outcome))}
function appointmentOutcomeIsClosed(outcome=''){return CLOSED_APPOINTMENT_OUTCOMES.has(appointmentOutcomeLabel(outcome))}
function appointmentLifecycle(a,sourceDate=''){
  const ts=appointmentTimestamp(a,sourceDate),now=Date.now();
  if(isOfiAppointment(a))return ts&&ts>Date.now()?'upcoming':'completed';
  if(appointmentOutcomeNeedsFollowUp(a.outcome))return'follow-up';
  if(a.status==='completed'||a.followedUpAt||appointmentOutcomeIsClosed(a.outcome))return'completed';
  if(ts&&ts>now)return'upcoming';
  return'follow-up';
}
function followUpDueLabel(a){
  if(!a.followUpDate)return'Follow-up due';
  const today=todayKey();
  if(a.followUpDate===today)return'Due today';
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
  if(a.followUpDate===dateKey(tomorrow))return'Due tomorrow';
  if(a.followUpDate<today){const diff=Math.max(1,Math.round((parseKey(today)-parseKey(a.followUpDate))/86400000));return`${diff} day${diff===1?'':'s'} overdue`;}
  return`Due ${shortAppointmentDate(a.followUpDate)}`;
}
function dueFollowUps(){return allAppointmentEntries().filter(({appointment:a,sourceDate})=>!isOfiAppointment(a)&&appointmentLifecycle(a,sourceDate)==='follow-up'&&(!a.followUpDate||a.followUpDate<=todayKey()));}
async function updateAppointmentRecord(id,sourceDate,changes){
  const d=dayData(sourceDate),index=d.appointments.findIndex(a=>String(a.id)===String(id));
  if(index<0)return toast('Appointment could not be found');
  d.appointments[index]={...d.appointments[index],...changes,updatedAt:Date.now()};
  days[sourceDate]=d;await saveDay(sourceDate);renderAll();
}
let pendingFollowUpAppointment=null;
let pendingOutcomeAppointment=null;
let selectedAppointmentOutcome='';

function openActionModal(id){
  const modal=$(id);if(!modal)return;
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');
}
function closeActionModal(id){
  const modal=$(id);if(!modal)return;
  modal.classList.remove('open');modal.setAttribute('aria-hidden','true');
}
function defaultFollowUpDate(){const d=new Date();d.setDate(d.getDate()+1);return dateKey(d);}
function setAppointmentFollowUp(id,sourceDate){
  pendingFollowUpAppointment={id,sourceDate};
  const input=$('#followUpDateInput');
  input.min=todayKey();input.value=defaultFollowUpDate();
  openActionModal('#followUpModal');
  setTimeout(()=>{try{input.showPicker?.()}catch{}},180);
}
async function saveAppointmentFollowUp(){
  if(!pendingFollowUpAppointment)return;
  const followUpDate=$('#followUpDateInput').value;
  if(!followUpDate)return toast('Choose a follow-up date');
  const {id,sourceDate}=pendingFollowUpAppointment;
  closeActionModal('#followUpModal');pendingFollowUpAppointment=null;
  await updateAppointmentRecord(id,sourceDate,{status:'follow-up',followUpDate,followedUpAt:null});toast('Follow-up scheduled');
}
async function markAppointmentFollowedUp(id,sourceDate){const entry=appointmentRecordEntry(id,sourceDate);if(!entry)return toast('Appointment could not be found');const now=Date.now(),followUpDate=entry.appointment.followUpDate||'',linked=linkedProspectForAppointment(entry.appointment),clearLinked=Boolean(linked&&(!followUpDate||linked.nextFollowUp===followUpDate));entry.day.appointments[entry.index]={...entry.appointment,status:'completed',followedUpAt:now,updatedAt:now};days[sourceDate]=entry.day;if(clearLinked){prospectInteractions.push({id:prospectId(),prospectId:linked.id,date:todayKey(),at:now,type:'Follow-up',outcome:'Follow-up completed',note:`Cleared from ${appointmentType(entry.appointment)} appointment follow-up.`,nextFollowUp:''});prospects=prospects.map(item=>item.id===linked.id?normaliseProspect({...item,nextFollowUp:'',updatedAt:now}):item)}await saveDay(sourceDate,{render:false,awaitCloud:false});if(clearLinked)await saveProspecting({render:false,awaitCloud:false});renderAll();haptic();toast('Follow-up completed')}
function appointmentRecordEntry(id,sourceDate){
  const d=dayData(sourceDate),index=d.appointments.findIndex(a=>String(a.id)===String(id));
  return index<0?null:{day:d,index,appointment:d.appointments[index],sourceDate};
}
function linkedProspectForAppointment(a={}){
  const type=appointmentType(a),isExpected=p=>type==='BAP'?prospectHasActiveBuyerRole(p):['MAP','LAP'].includes(type)?prospectHasContactProfile(p):false,direct=a.prospectId?prospectById(String(a.prospectId)):null;
  if(direct&&isExpected(direct))return direct;
  return prospects.find(p=>isExpected(p)&&appointmentMatchesProspect(a,p))||null;
}
function appointmentOutcomeOptionsMarkup(a={}){
  return appointmentOutcomeOptionsFor(a).map(option=>`<button type="button" class="outcome-option ${option.className}" data-outcome="${escapeHtml(option.value)}"><span>${escapeHtml(option.label)}</span><i>${escapeHtml(option.hint)}</i></button>`).join('');
}
function appointmentOutcomeContextMarkup(a={},linked=null){
  const type=appointmentType(a),contact=cleanText(a.contactName||a.name,120)||'Contact not recorded',address=cleanText(a.address,240)||'Address not recorded',linkLabel=linked?`${type==='BAP'?'Buyer':'Seller'} linked · ${linked.name}`:'Appointment only · no Prospector record will change';
  return `<strong><span>${escapeHtml(type)}</span>${escapeHtml(address)}</strong><small>${escapeHtml(contact)}</small><em class="${linked?'linked':'unlinked'}">${escapeHtml(linkLabel)}</em>`;
}
function appointmentOutcomeValidation(){
  if(!selectedAppointmentOutcome)return'Choose an outcome';
  if(appointmentOutcomeNeedsFollowUp(selectedAppointmentOutcome)){
    const followUpDate=$('#outcomeFollowUpDate')?.value||'';
    if(!validDateKey(followUpDate)||followUpDate<todayKey())return'Choose a current or future follow-up date';
  }
  if(selectedAppointmentOutcome==='Purchased'){
    if(!cleanText($('#outcomePurchaseAddress')?.value,240))return'Add the purchased property address';
    if(!validDateKey($('#outcomePurchaseDate')?.value||''))return'Choose the purchase date';
  }
  return'';
}
function refreshAppointmentOutcomeForm({announce=false}={}){
  const needsFollowUp=appointmentOutcomeNeedsFollowUp(selectedAppointmentOutcome),isPurchase=selectedAppointmentOutcome==='Purchased',followUpField=$('#outcomeFollowUpField'),purchaseFields=$('#outcomePurchaseFields'),error=$('#outcomeFormError'),save=$('#saveAppointmentOutcome');
  if(followUpField)followUpField.hidden=!needsFollowUp;
  if(purchaseFields)purchaseFields.hidden=!isPurchase;
  const message=appointmentOutcomeValidation();
  if(save)save.disabled=Boolean(message);
  if(error){error.textContent=announce?message:'';error.hidden=!announce||!message;}
}
function selectAppointmentOutcome(outcome='',button=null){
  selectedAppointmentOutcome=outcome;
  $$('#outcomeOptions button').forEach(item=>item.classList.toggle('selected',button?item===button:item.dataset.outcome===outcome));
  refreshAppointmentOutcomeForm();
}
function resetAppointmentOutcomeModal(){
  selectedAppointmentOutcome='';
  if($('#outcomeOptions'))$('#outcomeOptions').innerHTML='';
  if($('#appointmentOutcomeContext'))$('#appointmentOutcomeContext').innerHTML='';
  if($('#outcomeNoteInput'))$('#outcomeNoteInput').value='';
  if($('#outcomeFollowUpDate'))$('#outcomeFollowUpDate').value='';
  if($('#outcomePurchaseAddress'))$('#outcomePurchaseAddress').value='';
  if($('#outcomePurchasePrice'))$('#outcomePurchasePrice').value='';
  if($('#outcomePurchaseDate'))$('#outcomePurchaseDate').value='';
  if($('#outcomeFollowUpField'))$('#outcomeFollowUpField').hidden=true;
  if($('#outcomePurchaseFields'))$('#outcomePurchaseFields').hidden=true;
  if($('#outcomeFormError')){$('#outcomeFormError').textContent='';$('#outcomeFormError').hidden=true;}
  if($('#saveAppointmentOutcome')){$('#saveAppointmentOutcome').disabled=true;$('#saveAppointmentOutcome').textContent='Save Outcome';}
}
function closeAppointmentOutcomeModal(){closeActionModal('#outcomeModal');pendingOutcomeAppointment=null;resetAppointmentOutcomeModal();}
function updateAppointmentOutcome(id,sourceDate){
  const entry=appointmentRecordEntry(id,sourceDate);
  if(!entry)return toast('Appointment could not be found');
  const a=entry.appointment,linked=linkedProspectForAppointment(a),type=appointmentType(a),options=appointmentOutcomeOptionsFor(a),existingOutcome=appointmentOutcomeLabel(a.outcome),canRestore=options.some(option=>option.value===existingOutcome);
  pendingOutcomeAppointment={id,sourceDate};resetAppointmentOutcomeModal();
  $('#outcomeModalTitle').textContent=`${type} Outcome`;
  $('#appointmentOutcomeContext').innerHTML=appointmentOutcomeContextMarkup(a,linked);
  $('#outcomeOptions').innerHTML=appointmentOutcomeOptionsMarkup(a);
  $('#outcomeNoteInput').value=cleanText(a.outcomeNote,3000);
  const followUp=$('#outcomeFollowUpDate');followUp.min=todayKey();followUp.value=validDateKey(a.followUpDate)?a.followUpDate:defaultFollowUpDate();
  const purchaseAddress=$('#outcomePurchaseAddress'),purchasePrice=$('#outcomePurchasePrice'),purchaseDate=$('#outcomePurchaseDate');
  purchaseAddress.value=cleanText(a.buyerPurchaseAddress||linked?.buyerPurchaseAddress||a.address,240);
  purchasePrice.value=Number(a.buyerPurchasePrice||linked?.buyerPurchasePrice)>0?String(a.buyerPurchasePrice||linked.buyerPurchasePrice):'';
  purchaseDate.max=todayKey();purchaseDate.value=validDateKey(a.buyerPurchaseDate)?a.buyerPurchaseDate:validDateKey(linked?.buyerPurchaseDate)?linked.buyerPurchaseDate:todayKey();
  if(canRestore)selectAppointmentOutcome(existingOutcome);
  else refreshAppointmentOutcomeForm();
  openActionModal('#outcomeModal');
}
function appointmentOutcomeInteractionNote(a={},sourceDate='',note='',followUpDate='',purchase={}){
  const type=appointmentType(a),scheduled=appointmentScheduledDate(a,sourceDate),context=[type,cleanText(a.address,240),validDateKey(scheduled)?fmtDate(scheduled):''].filter(Boolean).join(' · '),details=[context];
  if(note)details.push(cleanText(note,2000));
  if(purchase.address)details.push(`Purchased ${purchase.address}${purchase.price?` for ${formatBuyerMoney(purchase.price)}`:''} on ${fmtDate(purchase.date)}`);
  if(validDateKey(followUpDate))details.push(`Follow up ${fmtDate(followUpDate)}`);
  return cleanText(details.join(' · '),2000);
}
function applyLinkedAppointmentOutcome(a={},sourceDate='',outcome='',{note='',followUpDate='',purchase={}}={}){
  const linked=linkedProspectForAppointment(a);
  if(!linked)return{linked:false,kind:'appointment'};
  const now=Date.now(),date=todayKey(),needsFollowUp=appointmentOutcomeNeedsFollowUp(outcome),historyNote=appointmentOutcomeInteractionNote(a,sourceDate,note,followUpDate,purchase);
  if(appointmentType(a)==='BAP'){
    if(outcome==='Purchased'){
      const purchaseAddress=cleanText(purchase.address,240),purchasePrice=Math.max(0,Number(purchase.price)||0),purchaseDate=validDateKey(purchase.date)?purchase.date:date;
      const updated=buyerPurchaseUpdateRecord(linked,{address:purchaseAddress,price:purchasePrice,date:purchaseDate,now,lastContact:date});
      prospects=prospects.map(item=>item.id===linked.id?updated:item);
    }else{
      const buyerStage=outcome==='Offer Pending'?'Negotiating':outcome==='Interested'||outcome==='Further Inspection'?'Inspecting':linked.buyerStage;
      prospects=prospects.map(item=>item.id===linked.id?normaliseProspect({...item,buyerStage,nextFollowUp:needsFollowUp?followUpDate:item.nextFollowUp,lastContact:date,updatedAt:now}):item);
    }
    prospectInteractions.push({id:prospectId(),prospectId:linked.id,date,at:now,type:'Appointment',outcome:`BAP · ${outcome}`,note:historyNote,nextFollowUp:needsFollowUp?followUpDate:''});
    return{linked:true,kind:'buyer',converted:outcome==='Purchased',name:linked.name};
  }
  const stage=outcome==='Listed'?'Listed':'Nurture',sellingTimeframe=needsFollowUp?(linked.sellingTimeframe||'Now'):'';
  prospects=prospects.map(item=>item.id===linked.id?normaliseProspect({...item,stage,sellingTimeframe,nextFollowUp:needsFollowUp?followUpDate:'',lastContact:date,updatedAt:now}):item);
  prospectInteractions.push({id:prospectId(),prospectId:linked.id,date,at:now,type:'Appointment',outcome:`${appointmentType(a)} · ${outcome}`,note:historyNote,nextFollowUp:needsFollowUp?followUpDate:''});
  return{linked:true,kind:'seller',name:linked.name};
}
async function saveSelectedAppointmentOutcome(){
  if(!pendingOutcomeAppointment||!selectedAppointmentOutcome)return;
  const validation=appointmentOutcomeValidation();if(validation){refreshAppointmentOutcomeForm({announce:true});return}
  const {id,sourceDate}=pendingOutcomeAppointment,entry=appointmentRecordEntry(id,sourceDate);if(!entry)return closeAppointmentOutcomeModal(),toast('Appointment could not be found');
  const save=$('#saveAppointmentOutcome'),outcome=selectedAppointmentOutcome,note=cleanText($('#outcomeNoteInput').value,3000),needsFollowUp=appointmentOutcomeNeedsFollowUp(outcome),followUpDate=needsFollowUp?$('#outcomeFollowUpDate').value:'',purchase=outcome==='Purchased'?{address:cleanText($('#outcomePurchaseAddress').value,240),price:Math.max(0,Number($('#outcomePurchasePrice').value)||0),date:$('#outcomePurchaseDate').value}:{};
  save.disabled=true;save.textContent='Saving…';
  try{
    const now=Date.now(),purchaseFields=purchase.address?{buyerPurchaseAddress:purchase.address,buyerPurchasePrice:purchase.price,buyerPurchaseDate:purchase.date}:{};
    entry.day.appointments[entry.index]={...entry.appointment,...purchaseFields,outcome,outcomeNote:note,status:needsFollowUp?'follow-up':'completed',followUpDate:needsFollowUp?followUpDate:null,followedUpAt:needsFollowUp?null:now,updatedAt:now};
    days[sourceDate]=entry.day;
    const linkedResult=applyLinkedAppointmentOutcome(entry.day.appointments[entry.index],sourceDate,outcome,{note,followUpDate,purchase});
    await saveDay(sourceDate,{render:false,awaitCloud:false});
    if(linkedResult.linked)await saveProspecting({render:false,awaitCloud:false});
    renderAll();closeAppointmentOutcomeModal();
    if(!linkedResult.linked)toast('Appointment outcome saved · no linked Prospector record changed');
    else if(linkedResult.converted)toast('Buyer converted to owner and appointment closed');
    else toast(`${linkedResult.kind==='buyer'?'Buyer journey':'Seller pipeline'} and appointment updated`);
  }catch(err){console.error('Appointment outcome save failed',err);save.disabled=false;save.textContent='Save Outcome';toast('Outcome could not be saved. Please try again.')}
}

function appointmentOutcomeLabel(outcome=''){
  if(outcome==='Signed')return'Listed';
  return outcome||'';
}
function appointmentOutcomeClass(outcome=''){
  const label=appointmentOutcomeLabel(outcome);
  if(['Still Nurturing','Interested','Further Inspection'].includes(label))return'outcome-blue';
  if(['Listed','Purchased'].includes(label))return'outcome-green';
  if(['Not Proceeding','Not Suitable','Offer Pending'].includes(label))return'outcome-amber';
  if(label==='Missed')return'outcome-red';
  return'';
}

function appointmentBookedLabel(a,sourceDate=''){
  const raw=Number(a.at||a.createdAt||0);
  if(raw){const d=new Date(raw);if(!Number.isNaN(d.getTime()))return`${shortAppointmentDate(dateKey(d))} at ${d.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit',hour12:true}).replace(/\s/g,'').toLowerCase()}`;}
  const created=a.createdDate||a.logDate||sourceDate;
  return created?shortAppointmentDate(parseKey(created)):'';
}
function appointmentSortPriority(entry){
  const a=entry.appointment,sourceDate=entry.sourceDate,lifecycle=appointmentLifecycle(a,sourceDate),outcome=appointmentOutcomeLabel(a.outcome);
  if(lifecycle==='follow-up'&&!outcome&&!a.followUpDate)return 0; // requires outcome
  if(lifecycle==='follow-up'&&appointmentOutcomeNeedsFollowUp(outcome))return a.followUpDate&&a.followUpDate>todayKey()?2:1;
  if(lifecycle==='follow-up')return 1;
  if(lifecycle==='upcoming')return 3;
  if(lifecycle==='completed')return 4;
  return 5;
}
function sortAppointmentEntries(entries){
  return [...entries].sort((x,y)=>appointmentSortPriority(x)-appointmentSortPriority(y)||appointmentTimestamp(x.appointment,x.sourceDate)-appointmentTimestamp(y.appointment,y.sourceDate));
}
function appointmentHistoryEntries(mode){
  const now=Date.now(),shared=assignedTeamAppointments.map(a=>({appointment:a,sourceDate:appointmentCreatedDate(a,a.createdDate||todayKey())||a.createdDate||todayKey(),scheduled:appointmentScheduledDate(a,a.createdDate||todayKey()),isTeamAssigned:true}));
  const entries=[...allAppointmentEntries().map(entry=>({...entry,isTeamAssigned:false})),...shared].filter(({appointment:a,sourceDate})=>{if(mode==='past'&&isOfiAppointment(a))return false;const scheduledAt=appointmentTimestamp(a,sourceDate);if(!scheduledAt)return mode==='past';return mode==='past'?scheduledAt<=now:scheduledAt>now;});
  return sortAppointmentEntries(entries);
}
function appointmentReminderText(){
  const due=dueFollowUps();
  if(!due.length)return'';
  const overdue=due.filter(({appointment:a})=>a.followUpDate&&a.followUpDate<todayKey()).length;
  if(overdue)return`${overdue} follow-up${overdue===1?' is':'s are'} overdue · ${due.length} due now`;
  return`${due.length} appointment follow-up${due.length===1?' is':'s are'} due`;
}
function setAppointmentHistoryScreen(mode){
  appointmentHistoryMode=mode;
  $('#appointmentMainContent')?.classList.toggle('hidden',Boolean(mode));
  $('#appointmentHistoryScreen')?.classList.toggle('hidden',!mode);
  if(mode){$('#appointmentHistoryTitle').textContent=mode==='past'?'Past Appointments':'Upcoming Appointments';window.scrollTo({top:0,behavior:'auto'});}
  renderAppointments();
}

function appointmentCardMarkup(entry,{dailyLog=false,history=false}={}){
  const {appointment:a,sourceDate,scheduled}=entry,isTeamAssigned=Boolean(entry.isTeamAssigned||a.isTeamAssigned);
  const contact=escapeHtml(a.contactName||a.name||'Contact not recorded'),rawPhone=String(a.contactNumber||a.phone||'').trim(),phone=escapeHtml(rawPhone),dial=rawPhone.replace(/[^+\d]/g,''),address=escapeHtml(a.address||'Address not recorded'),type=escapeHtml(appointmentType(a)),time=escapeHtml(appointmentTimeLabel(a,sourceDate)),lifecycle=appointmentLifecycle(a,sourceDate);
  const statusText=lifecycle==='upcoming'?'Upcoming':lifecycle==='completed'?'Completed':followUpDueLabel(a);
  const note=a.outcomeNote?`<small class="appointment-outcome-note">${escapeHtml(a.outcomeNote)}</small>`:'';
  const callAction=dial?`<a class="appointment-call appointment-action-wide" href="tel:${dial}">Call</a>`:'';
  let actions;
  if(isTeamAssigned){const added=appointmentAddedToCalendar(a,sourceDate),calendarLabel=added?'Added to Calendar':'Add to Calendar';actions=`${callAction}<button class="appointment-secondary-action appointment-calendar-action ${added?'is-added':''}" data-calendar-team-appointment="${escapeHtml(a.teamAppointmentId||a.id)}" data-source-date="${escapeHtml(sourceDate)}">${added?'✓ ':''}${calendarLabel}</button>`;}
  else if(isOfiAppointment(a)){const added=appointmentAddedToCalendar(a,sourceDate),calendarLabel=added?'Added to Calendar':'Add to Calendar';actions=`${callAction}<button class="appointment-secondary-action appointment-calendar-action ${added?'is-added':''}" data-calendar-appointment="${escapeHtml(calendarExportId(a,sourceDate))}" data-source-date="${escapeHtml(sourceDate)}">${added?'✓ ':''}${calendarLabel}</button>`;}
  else if(dailyLog){
    const added=appointmentAddedToCalendar(a,sourceDate),calendarLabel=added?'Added to Calendar':'Add to Calendar';
    actions=`${callAction}<button class="appointment-secondary-action appointment-calendar-action ${added?'is-added':''}" data-calendar-appointment="${escapeHtml(calendarExportId(a,sourceDate))}" data-source-date="${escapeHtml(sourceDate)}">${added?'✓ ':''}${calendarLabel}</button>`;
  }else if(history&&appointmentHistoryMode==='upcoming'){
    const added=appointmentAddedToCalendar(a,sourceDate),calendarLabel=added?'Added to Calendar':'Add to Calendar';
    actions=`${callAction}<button class="appointment-secondary-action appointment-calendar-action ${added?'is-added':''}" data-calendar-appointment="${escapeHtml(calendarExportId(a,sourceDate))}" data-source-date="${escapeHtml(sourceDate)}">${added?'✓ ':''}${calendarLabel}</button>`;
  }else if(history&&appointmentHistoryMode==='past'){
    const followAction=lifecycle==='completed'?'':a.followUpDate?`<button class="appointment-secondary-action" data-mark-followedup="${a.id}" data-source-date="${sourceDate}">Mark Followed Up</button>`:`<button class="appointment-secondary-action" data-set-followup="${a.id}" data-source-date="${sourceDate}">Set Follow-Up</button>`;
    const outcomeLabel=escapeHtml(appointmentOutcomeLabel(a.outcome)||'Update Outcome');
    const outcomeClass=appointmentOutcomeClass(a.outcome);
    actions=`${callAction}${followAction}<button class="appointment-secondary-action appointment-outcome-action ${a.outcome?'has-outcome':''} ${outcomeClass}" data-update-outcome="${a.id}" data-source-date="${sourceDate}">${outcomeLabel}</button>`;
  }else{
    actions=lifecycle==='upcoming'?`${callAction}<button class="appointment-secondary-action" data-set-followup="${a.id}" data-source-date="${sourceDate}">Set Follow-Up</button>`:`${callAction}${lifecycle==='follow-up'?`<button class="appointment-secondary-action" data-mark-followedup="${a.id}" data-source-date="${sourceDate}">Mark Followed Up</button>`:''}<button class="appointment-secondary-action" data-update-outcome="${a.id}" data-source-date="${sourceDate}">${escapeHtml(appointmentOutcomeLabel(a.outcome)||'Update Outcome')}</button>`;
  }
  const booked=appointmentBookedLabel(a,sourceDate);
  const ofiSchedule=isOfiAppointment(a)?`<div class="appointment-ofi-schedule ${appointmentHasAuction(a)?'has-auction':''}"><div><span>OPEN FOR INSPECTION</span><strong>${escapeHtml(time)}–${escapeHtml(timelineTimeLabel(appointmentEndMinutes(a)))}</strong><small>${appointmentDurationMinutes(a)} minute booking</small></div>${appointmentHasAuction(a)?`<div><span>AUCTION</span><strong>${escapeHtml(timelineTimeLabel(appointmentAuctionMinutes(a)))}</strong><small>Commences immediately after</small></div>`:''}</div>`:'';
  const loggedMeta=dailyLog&&a.scheduledDate&&a.scheduledDate!==sourceDate?`<small class="appointment-log-scheduled">Scheduled for ${escapeHtml(shortAppointmentDate(scheduled))} at ${time}</small>`:`<small class="appointment-booked-for">${escapeHtml(shortAppointmentDate(scheduled))} at ${time}</small>`;
  const bookedMeta=history&&booked?`<small class="appointment-created-meta">Booked ${escapeHtml(booked)}</small>`:'';
  const assignmentMeta=isTeamAssigned?`<small class="appointment-team-assigned-meta">Booked for you by ${escapeHtml(teamAppointmentSetterFirstName(a.setterName||'a teammate'))}</small>`:(!isTeamAssigned&&a.assignedToUid&&String(a.assignedToUid)!==String(uid)&&a.assignedToName?`<small class="appointment-booked-for-teammate">Booked for ${escapeHtml(teamAppointmentSetterFirstName(a.assignedToName))}</small>`:'');
  const dueMeta=history&&!isTeamAssigned&&a.followUpDate?`<small class="appointment-followup-timestamp ${a.followUpDate<todayKey()?'overdue':''}">Follow-up due ${escapeHtml(shortAppointmentDate(a.followUpDate))}</small>`:'';
  const marketIntel=appointmentMarketPulseMarkup(a,sourceDate);
  const cardAttrs=isTeamAssigned?'':`data-appointment-card-edit="${escapeHtml(a.id)}" role="button" tabindex="0" aria-label="Edit ${type} appointment at ${address}"`;
  return `<article class="appointment-card appointment-card-premium appointment-followup-card ${lifecycle} ${isTeamAssigned?'team-assigned':''}" ${cardAttrs} data-source-date="${escapeHtml(sourceDate)}">
    ${isTeamAssigned?'':`<button class="appointment-delete" data-delete-appointment="${escapeHtml(a.id)}" data-source-date="${escapeHtml(sourceDate)}" aria-label="Delete appointment" title="Delete appointment">×</button>`}
    <div class="appointment-card-copy"><div class="appointment-card-top"><span class="appointment-type-badge">${type}</span><span class="appointment-status-badge ${lifecycle}">${escapeHtml(statusText)}</span></div><strong>${address}</strong><small>${contact}${phone?` · ${phone}`:''}</small>${ofiSchedule}${loggedMeta}${bookedMeta}${assignmentMeta}${dueMeta}${marketIntel}${note}</div>
    <div class="appointment-followup-actions">${actions}</div>
  </article>`;
}
function updateOfiFormState(){
  const type=$('.appointment-types input:checked')?.value||'';
  const isOfi=type==='OFI',auction=$('#appointmentAuction')?.checked;
  $('#ofiOptions')?.classList.toggle('hidden',!isOfi);
  if($('#ofiDurationText'))$('#ofiDurationText').textContent=auction?'15 minute OFI + auction':'30 minute booking';
  const time=$('#appointmentTime')?.value||'';
  if($('#ofiSchedulePreview')){if(!time)$('#ofiSchedulePreview').textContent='Select a time to preview the booking.';else{const start=timelineMinutes(time);$('#ofiSchedulePreview').textContent=auction?`${timelineTimeLabel(start)}–${timelineTimeLabel(start+15)} OFI · ${timelineTimeLabel(start+15)} auction`:`${timelineTimeLabel(start)}–${timelineTimeLabel(start+30)} OFI`;}}
}
function renderAppointments(){
  renderProspectAppointmentFlowHeader();
  const picker=$('#appointmentDatePicker');
  const editing=Boolean(editingAppointment);
  $('#appointmentsView')?.classList.toggle('appointment-edit-mode',editing);
  document.body.classList.toggle('appointment-editing',editing);
  const editHeader=$('#appointmentEditHeader');if(editHeader)editHeader.hidden=!editing;
  const locked=isPastDate(appointmentDate)&&!editingAppointment;
  $('#appointmentForm').classList.toggle('date-locked',locked);
  $$('#appointmentForm input, #appointmentForm button').forEach(el=>el.disabled=locked);
  $('#appointmentLock').classList.toggle('hidden',!locked);
  const submitButton=$('#appointmentSubmitButton');if(submitButton)submitButton.textContent=editingAppointment?'Save changes':'Book appointment';
  $('#appointmentDateLabel').textContent=fmtDate(appointmentDate);
  if($('#appointmentLogDate'))$('#appointmentLogDate').textContent=fmtDate(appointmentDate);
  if(picker&&!picker.value)picker.value=appointmentDate;
  const timeInput=$('#appointmentTime');if(timeInput&&!timeInput.value)timeInput.value='12:00';
  const all=allAppointmentEntries();
  const past=appointmentHistoryEntries('past'),upcoming=appointmentHistoryEntries('upcoming');
  if($('#pastAppointmentSummary'))$('#pastAppointmentSummary').textContent=`${past.length} past appointment${past.length===1?'':'s'} · follow-ups and outcomes`;
  if($('#upcomingAppointmentSummary'))$('#upcomingAppointmentSummary').textContent=`${upcoming.length} upcoming appointment${upcoming.length===1?'':'s'} · schedule and calls`;
  const reminder=appointmentReminderText();
  const pastReminderMetric=$('#pastAppointmentReminderMetric');
  if(pastReminderMetric){pastReminderMetric.textContent=reminder;pastReminderMetric.classList.toggle('hidden',!reminder);}
  const historyReminder=$('#appointmentHistoryReminder');
  if(historyReminder){historyReminder.textContent=reminder;historyReminder.classList.toggle('hidden',!reminder);}
  if(appointmentHistoryMode&&$('#appointmentHistoryList')){
    const history=appointmentHistoryEntries(appointmentHistoryMode);
    $('#appointmentHistoryList').innerHTML=history.length?history.map(entry=>appointmentCardMarkup(entry,{history:true})).join(''):emptyStateMarkup(getEmptyState('appointments-history',{mode:appointmentHistoryMode}));
  }

  const personalDaily=all.filter(({appointment:a,sourceDate})=>appointmentCreatedDate(a,sourceDate)===appointmentDate).map(entry=>({...entry,isTeamAssigned:false}));
  const assignedDaily=assignedTeamAppointments.filter(a=>appointmentScheduledDate(a,a.createdDate||appointmentDate)===appointmentDate).map(a=>({appointment:a,sourceDate:appointmentCreatedDate(a,a.createdDate||appointmentDate)||a.createdDate||appointmentDate,scheduled:appointmentDate,isTeamAssigned:true}));
  const daily=sortAppointmentEntries([...personalDaily,...assignedDaily]);
  $('#appointmentsList').innerHTML=daily.length?daily.map(entry=>appointmentCardMarkup(entry,{dailyLog:true})).join(''):emptyStateMarkup(getEmptyState('appointments-daily',{date:appointmentDate}));
  if(activeViewId()==='appointmentsView')updateTopbar('appointmentsView');
}

function appointmentContactMatches(query){
  const q=cleanText(query,120).toLowerCase();
  if(!q)return prospects.filter(p=>!p.archived).slice(0,20);
  return prospects.filter(p=>!p.archived&&[p.name,p.address,p.suburb,primaryProspectPhone(p)].some(value=>String(value||'').toLowerCase().includes(q))).slice(0,20);
}
function hideAppointmentContactSuggestions(){const list=$('#appointmentContactSuggestions');if(list){list.classList.add('hidden');list.innerHTML=''}}
function renderAppointmentContactSuggestions(){
  const input=$('#appointmentContactName'),list=$('#appointmentContactSuggestions');if(!input||!list||editingAppointment)return;
  const matches=appointmentContactMatches(input.value);
  if(!matches.length){hideAppointmentContactSuggestions();return}
  list.innerHTML=matches.map(p=>`<button type="button" data-appointment-contact="${escapeHtml(p.id)}"><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(formatProspectAddress(p.address||p.company,p.suburb)||'No property address')}${primaryProspectPhone(p)?` · ${escapeHtml(primaryProspectPhone(p))}`:''}</small></button>`).join('');
  list.classList.remove('hidden');
}
function selectAppointmentContact(id){
  const p=prospectById(id);if(!p)return;
  appointmentLinkedProspectId=p.id;
  $('#appointmentContactName').value=p.name||'';
  $('#appointmentContactNumber').value=primaryProspectPhone(p)||'';
  $('#appointmentAddress').value=formatProspectAddress(p.address||p.company,p.suburb)||p.address||'';
  hideAppointmentContactSuggestions();
}
function resetAppointmentContactLink(){appointmentLinkedProspectId='';hideAppointmentContactSuggestions()}
function renderProspectAppointmentFlowHeader(){
  const header=$('#appointmentProspectFlowHeader');if(!header)return;
  header.classList.toggle('hidden',!pendingProspectAppointmentFlow);
  const flow=pendingProspectAppointmentFlow,isBuyerMatch=Boolean(flow?.buyerMatchId),name=$('#appointmentProspectFlowName'),kicker=$('#appointmentProspectFlowKicker'),meta=$('#appointmentProspectFlowMeta'),back=$('#cancelProspectAppointmentFlow');if(name)name.textContent=flow?.contactName||'';if(kicker)kicker.textContent=isBuyerMatch?'BUYER INSPECTION':'APPOINTMENT BOOKED';if(meta)meta.textContent=isBuyerMatch?'Save the BAP to complete this property-match outcome.':'Complete the booking to save the session outcome.';if(back)back.setAttribute('aria-label',isBuyerMatch?'Return to buyer opportunity':'Return to prospecting session');
}
function openAppointmentBookingFromProspect(flow){
  const p=prospectById(flow.prospectId);if(!p)return toast('Contact could not be found');
  pendingProspectAppointmentFlow={...flow,contactName:p.name,contactNumber:primaryProspectPhone(p)||'',address:cleanText(flow.appointmentAddress,240)||formatProspectAddress(p.address||p.company,p.suburb)||p.address||''};
  editingAppointment=null;appointmentEditReturnState=null;appointmentHistoryMode=null;appointmentDate=todayKey();appointmentLinkedProspectId=p.id;
  const form=$('#appointmentForm');form?.reset();
  $('#appointmentContactName').value=p.name||'';$('#appointmentContactNumber').value=primaryProspectPhone(p)||'';$('#appointmentAddress').value=pendingProspectAppointmentFlow.address;
  $('#appointmentDatePicker').value=appointmentDate;$('#appointmentTime').value='12:00';$('#appointmentAuction').checked=false;const requestedType=normaliseAppointmentType(flow.appointmentType||'');$$('[name=appointmentType]').forEach(input=>input.checked=input.value===requestedType);
  updateOfiFormState();switchView('appointmentsView');renderProspectAppointmentFlowHeader();
  requestAnimationFrame(()=>$('#appointmentDatePicker')?.focus({preventScroll:true}));
}
function cancelProspectAppointmentFlow(){
  const flow=pendingProspectAppointmentFlow;pendingProspectAppointmentFlow=null;appointmentLinkedProspectId='';
  $('#appointmentForm')?.reset();$('#appointmentDatePicker').value=appointmentDate;$('#appointmentTime').value='12:00';hideAppointmentContactSuggestions();renderProspectAppointmentFlowHeader();
  switchView('prospectingView');
  if(flow?.buyerMatchId&&flow?.prospectId){setProspectorSection('buyers');$('#prospectingDashboard')?.classList.add('hidden');$('#prospectDetail')?.classList.remove('hidden');renderBuyerDetail(flow.prospectId)}else if(flow?.fromSession&&prospectSessionActive)showProspectingSession();else if(flow?.prospectId)renderProspectDetail(flow.prospectId);
}
async function completePendingProspectAppointmentFlow(appointment=null){
  const flow=pendingProspectAppointmentFlow;if(!flow)return;
  const p=prospectById(flow.prospectId);if(!p){pendingProspectAppointmentFlow=null;return}
  if(flow.buyerMatchId){
    pendingProspectAppointmentFlow=null;appointmentLinkedProspectId='';renderProspectAppointmentFlowHeader();
    await applyBuyerMatchOutcome(p.id,flow.buyerMatchId,'inspection',{contactMethod:flow.buyerMatchContactMethod||'manual',appointment});
    switchView('prospectingView');setProspectorSection('buyers');$('#prospectingDashboard')?.classList.add('hidden');$('#prospectDetail')?.classList.remove('hidden');renderBuyerDetail(p.id);toast('Buyer inspection booked');return;
  }
  const outcome='Appointment booked',interactionId=flow.interactionId||prospectId(),next=flow.nextFollowUp||'',temperature=flow.temperature||'Cold',sellingTimeframe=flow.sellingTimeframe||p.sellingTimeframe||'',temperatureManual=Boolean(flow.temperatureManual),motivation=Number(flow.motivation)||p.motivation;
  if(flow.marketFollowUp?.marketPropertyKey)retireEarlierMarketFollowUps(p.id,flow.marketFollowUp.marketPropertyKey);
  prospectInteractions.push({id:interactionId,prospectId:p.id,date:todayKey(),at:Date.now(),type:'Call',outcome,note:flow.note||'',nextFollowUp:validDateKey(next)?next:'',marketEventId:cleanText(flow.marketEventId,160),...(flow.marketFollowUp||{}),metricsApplied:false});
  if(p.sellingTimeframe!==sellingTimeframe)prospectInteractions.push({id:prospectId(),prospectId:p.id,date:todayKey(),at:Date.now()+1,type:'Pipeline',outcome:'Selling timeframe updated',note:`Selling timeframe changed from ${p.sellingTimeframe||'Not set'} to ${sellingTimeframe||'Not currently selling'}.`,nextFollowUp:''});
  prospects=prospects.map(x=>x.id===p.id?normaliseProspect({...x,temperature,motivation,temperatureManual,sellingTimeframe,lastContact:todayKey(),nextFollowUp:validDateKey(next)?next:'',stage:'Appointment Booked',updatedAt:Date.now()}):x);
  const delta=prospectOutcomeMetricDelta(outcome);
  try{await applyProspectingOutcomeMetrics(outcome,interactionId,{awaitCloud:!flow.fromSession})}catch(err){console.error('Prospector metric save failed',err);toast('Appointment saved. Metrics are pending sync.')}
  prospectInteractions=prospectInteractions.map(x=>x.id===interactionId?{...x,metricsApplied:true}:x);
  try{await saveProspecting({render:false,awaitCloud:!flow.fromSession})}catch(err){console.error('Prospecting log save failed',err);toast('The appointment is saved locally. Please check sync.')}
  if(flow.fromSession&&prospectSessionActive){prospectSessionStats.calls+=delta.calls;prospectSessionStats.connects+=delta.connects;if(temperature==='Warm'||temperature==='Hot')prospectSessionStats.temperate++;prospectSessionStats.appointments++;prospectSessionIndex++;saveProspectingSessionState()}
  pendingProspectAppointmentFlow=null;appointmentLinkedProspectId='';renderProspectAppointmentFlowHeader();
  switchView('prospectingView');
  if(flow.fromSession&&prospectSessionActive){toast('Appointment booked');showProspectingSession();requestAnimationFrame(()=>showProspectingSession())}else{toast('Appointment booked');renderProspectDetail(p.id)}
}

function teamAppointmentMemberName(member){const profileName=String(member?.name||'').trim(),liveName=String(leaderboardEntries.find(entry=>String(entry.uid||'')===String(member?.uid||''))?.name||'').trim(),name=profileName||liveName||'Team member';return name==='Team member'?name:(name.split(/\s+/).filter(Boolean)[0]||'Team member')}
function teamAppointmentBookingDisplayName(member){const live=leaderboardEntries.find(entry=>String(entry.uid||'')===String(member?.uid||'')),liveName=String(live?.name||'').trim();if(liveName)return liveName.split(/\s+/).filter(Boolean)[0]||'Team member';const profileName=String(member?.name||'').trim();if(!profileName)return'Team member';const first=profileName.split(/\s+/).filter(Boolean)[0]||'Team member';return first.includes('.')?(first.split('.')[0]||'Team member'):first}
function renderAppointmentAssigneePicker(preferredUid=''){const wrap=$('#appointmentAssigneeField'),select=$('#appointmentAssignee');if(!wrap||!select)return;const available=accountMode==='team'&&teamId&&appointmentAssignees.length>1;wrap.classList.toggle('hidden',!available);if(!available){select.innerHTML=`<option value="${escapeHtml(uid)}">Me</option>`;select.value=uid;return}const current=preferredUid||select.value||uid,sorted=[...appointmentAssignees].sort((a,b)=>String(a.uid)===uid?-1:String(b.uid)===uid?1:teamAppointmentMemberName(a).localeCompare(teamAppointmentMemberName(b)));select.innerHTML=sorted.map(member=>`<option value="${escapeHtml(member.uid)}">${escapeHtml(String(member.uid)===uid?'Me':teamAppointmentMemberName(member))}</option>`).join('');select.value=sorted.some(member=>String(member.uid)===String(current))?current:uid}
function renderAppointmentAssignmentPopup(preferredUid=uid){
  const select=$('#appointmentAssignmentSelect');if(!select)return;
  const sorted=[...appointmentAssignees].sort((a,b)=>String(a.uid)===uid?-1:String(b.uid)===uid?1:teamAppointmentBookingDisplayName(a).localeCompare(teamAppointmentBookingDisplayName(b)));
  const members=sorted.length?sorted:[{uid,name:displayAgentName()}];
  select.innerHTML=members.map(member=>`<option value="${escapeHtml(member.uid)}">${escapeHtml(String(member.uid)===uid?'Me':teamAppointmentBookingDisplayName(member))}</option>`).join('');
  select.value=members.some(member=>String(member.uid)===String(preferredUid))?String(preferredUid):uid;
}
function showAppointmentAssignmentPopup(){
  const modal=$('#appointmentAssignmentModal');if(!modal||!pendingAppointmentAssignment)return;
  renderAppointmentAssignmentPopup(uid);modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');document.body.classList.add('appointment-assignment-open');requestAnimationFrame(()=>$('#appointmentAssignmentSelect')?.focus({preventScroll:true}));
}
function hideAppointmentAssignmentPopup({clear=true}={}){
  const modal=$('#appointmentAssignmentModal');modal?.classList.add('hidden');modal?.setAttribute('aria-hidden','true');document.body.classList.remove('appointment-assignment-open');if(clear)pendingAppointmentAssignment=null;
}

function stopTeamAppointmentLayer(){unsubAppointmentAssignees?.();unsubAssignedTeamAppointments?.();unsubAppointmentAssignees=unsubAssignedTeamAppointments=null;subscribedAppointmentTeamId='';appointmentAssignees=[];assignedTeamAppointments=[];pendingTeamAppointmentNotice=null;hideTeamAppointmentNotice({acknowledge:false});renderAppointmentAssigneePicker();renderAppointments()}
function normaliseAssignedTeamAppointment(data={},id=''){const source=validDateKey(data.createdDate)?data.createdDate:todayKey(),a=normaliseAppointmentRecord({...data,id:data.appointmentId||data.id||id},source);return{...a,teamAppointmentId:String(id||data.teamAppointmentId||a.id),setterUid:String(data.setterUid||''),setterName:String(data.setterName||'a teammate'),assignedToUid:String(data.assignedToUid||''),assignedToName:String(data.assignedToName||displayAgentName()),acknowledgedAt:data.acknowledgedAt||null,calendarAddedAt:data.calendarAddedAt||null,isTeamAssigned:true}}
function teamAppointmentConfirmationLabel(type){return{LAP:'Listing Appointment',MAP:'Market Appraisal',BAP:'Buyer Appointment',OFI:'Open for Inspection'}[normaliseAppointmentType(type)]||'Appointment'}
function teamAppointmentSetterFirstName(name=''){const clean=String(name||'A teammate').trim();return clean.split(/\s+/).filter(Boolean)[0]||'A teammate'}
function maybeShowTeamAppointmentNotice(){if(teamAppointmentNoticeOpen||!cloud||accountMode!=='team'||!teamId||$('#app')?.classList.contains('hidden')||!$('#returningSnapshotScreen')?.classList.contains('hidden'))return;const next=assignedTeamAppointments.filter(a=>!a.acknowledgedAt&&a.setterUid!==uid&&!dismissedTeamAppointmentNotices.has(String(a.teamAppointmentId||a.id))).sort((a,b)=>(Number(a.at)||0)-(Number(b.at)||0))[0];if(!next)return;pendingTeamAppointmentNotice=next;teamAppointmentNoticeOpen=true;const modal=$('#teamAppointmentNotice');if(!modal)return;const setter=teamAppointmentSetterFirstName(next.setterName),label=teamAppointmentConfirmationLabel(appointmentType(next));$('#teamAppointmentNoticeTitle').textContent=`${setter} booked this ${label} for you.`;$('#teamAppointmentNoticeType').textContent=appointmentType(next);$('#teamAppointmentNoticeContact').textContent=next.contactName||'Contact not recorded';$('#teamAppointmentNoticeAddress').textContent=next.address||'Address not recorded';$('#teamAppointmentNoticeWhen').textContent=`${fmtDate(appointmentScheduledDate(next,next.createdDate||todayKey()))} · ${appointmentTimeLabel(next,next.createdDate||todayKey())}`;modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');modal.style.display='grid';document.body.classList.add('team-appointment-notice-open');requestAnimationFrame(()=>$('#teamAppointmentAddCalendar')?.focus({preventScroll:true}))}
async function acknowledgeTeamAppointment(a,{calendar=false}={}){if(!a?.teamAppointmentId||!cloud||!db||!teamId)return;try{await setDoc(doc(db,'teams',teamId,'appointments',a.teamAppointmentId),{acknowledgedAt:serverTimestamp(),calendarAddedAt:calendar?serverTimestamp():a.calendarAddedAt||null,updatedAt:serverTimestamp()},{merge:true})}catch(err){console.error('Appointment acknowledgement failed',err)}}
function hideTeamAppointmentNotice({acknowledge=true,calendar=false}={}){const modal=$('#teamAppointmentNotice');if(!modal)return;const current=pendingTeamAppointmentNotice;if(current)dismissedTeamAppointmentNotices.add(String(current.teamAppointmentId||current.id));modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');modal.style.display='none';document.body.classList.remove('team-appointment-notice-open');teamAppointmentNoticeOpen=false;pendingTeamAppointmentNotice=null;teamAppointmentNoticeReturnState=null;if(acknowledge&&current){current.acknowledgedAt=current.acknowledgedAt||Date.now();if(calendar)current.calendarAddedAt=current.calendarAddedAt||Date.now();acknowledgeTeamAppointment(current,{calendar})}}
function subscribeTeamAppointmentLayer(){if(!cloud||accountMode!=='team'||!teamId){stopTeamAppointmentLayer();return}if(subscribedAppointmentTeamId===teamId&&unsubAppointmentAssignees&&unsubAssignedTeamAppointments)return;stopTeamAppointmentLayer();subscribedAppointmentTeamId=teamId;const listeningTeamId=teamId;unsubAppointmentAssignees=onSnapshot(collection(db,'teams',listeningTeamId,'members'),{includeMetadataChanges:true},snap=>{if(teamId!==listeningTeamId)return;appointmentAssignees=snap.docs.map(item=>({...item.data(),uid:item.id}));const preferred=editingAppointment?dayData(editingAppointment.sourceDate).appointments.find(a=>String(a.id)===String(editingAppointment.id))?.assignedToUid||uid:uid;renderAppointmentAssigneePicker(preferred)},err=>console.error('Appointment team list failed',err));const assignedQuery=query(collection(db,'teams',listeningTeamId,'appointments'),where('assignedToUid','==',uid));unsubAssignedTeamAppointments=onSnapshot(assignedQuery,{includeMetadataChanges:true},snap=>{if(teamId!==listeningTeamId)return;assignedTeamAppointments=snap.docs.map(item=>normaliseAssignedTeamAppointment(item.data(),item.id)).sort((a,b)=>appointmentTimestamp(a,a.createdDate||todayKey())-appointmentTimestamp(b,b.createdDate||todayKey()));renderAppointments();renderTimeline();refreshReturningSnapshotIfVisible();maybeShowTeamAppointmentNotice()},err=>console.error('Assigned appointments failed',err))}
function teamAppointmentPayload(appointment,assignedToUid){const member=appointmentAssignees.find(entry=>String(entry.uid||'')===String(assignedToUid||''));return{appointmentId:String(appointment.id),contactName:appointment.contactName||'',contactNumber:appointment.contactNumber||'',address:appointment.address||'',date:appointmentScheduledDate(appointment,appointment.createdDate),time:appointment.time||'12:00',type:appointmentType(appointment),auction:Boolean(appointment.auction),types:[appointmentType(appointment)],createdDate:appointmentCreatedDate(appointment,appointment.createdDate),logDate:appointmentCreatedDate(appointment,appointment.createdDate),scheduledDate:appointmentScheduledDate(appointment,appointment.createdDate),scheduledAt:Number(appointment.scheduledAt)||appointmentTimestamp(appointment,appointment.createdDate),at:Number(appointment.at)||Date.now(),setterUid:uid,setterName:displayAgentName(),assignedToUid:String(assignedToUid),assignedToName:teamAppointmentMemberName(member||{uid:assignedToUid}),updatedAt:serverTimestamp()}}
async function syncTeamAppointmentAssignment(appointment,previousAssignedToUid=''){if(!cloud||!db||accountMode!=='team'||!teamId||!appointment?.id)return;const assignedToUid=String(appointment.assignedToUid||uid),previous=String(previousAssignedToUid||''),ref=doc(db,'teams',teamId,'appointments',String(appointment.id));if(assignedToUid===uid){if(previous&&previous!==uid){const batch=writeBatch(db);batch.delete(ref);await batch.commit()}return}const payload=teamAppointmentPayload(appointment,assignedToUid);if(!previous||previous!==assignedToUid)await setDoc(ref,{...payload,acknowledgedAt:null,calendarAddedAt:null,createdAt:serverTimestamp()});else await setDoc(ref,payload,{merge:true})}
async function removeTeamAppointmentAssignment(appointment){if(!cloud||!db||accountMode!=='team'||!teamId||!appointment?.id||!appointment.assignedToUid||appointment.assignedToUid===uid)return;const batch=writeBatch(db);batch.delete(doc(db,'teams',teamId,'appointments',String(appointment.id)));await batch.commit()}
async function addAppointment({contactName,contactNumber,address,date,time,type,auction=false,prospectId='',assignedToUid=uid}){
  const createdDate=todayKey();
  if(isPastDate(createdDate))return lockedToast();
  const signature=[createdDate,date,time,type,contactName.trim().toLowerCase(),address.trim().toLowerCase()].join('|');
  if(appointmentSubmitLocks.has(signature))return null;
  appointmentSubmitLocks.add(signature);
  const scheduledAt=new Date(`${date}T${time}`).getTime();
  if(!validDateKey(date)||!Number.isFinite(scheduledAt)){appointmentSubmitLocks.delete(signature);toast('Appointment date or time is invalid');return null}
  const d=dayData(createdDate);
  const recentDuplicate=d.appointments.find(a=>[appointmentCreatedDate(a,createdDate),appointmentScheduledDate(a,createdDate),a.time,appointmentType(a),String(a.contactName||'').trim().toLowerCase(),String(a.address||'').trim().toLowerCase()].join('|')===signature&&Date.now()-(Number(a.at)||0)<15000);
  if(recentDuplicate){appointmentSubmitLocks.delete(signature);return recentDuplicate}
  let linkedProspect=null;if(normaliseAppointmentType(type)==='LAP')linkedProspect=await connectListingAppointmentToPipeline({contactName,contactNumber,address});
  const assignedMember=appointmentAssignees.find(entry=>String(entry.uid||'')===String(assignedToUid||''));const appointment=normaliseAppointmentRecord({id:uuid(),contactName,contactNumber,address,date,time,type,auction:type==='OFI'&&auction,types:[type],prospectId:linkedProspect?.id||prospectId||'',assignedToUid:String(assignedToUid||uid),assignedToName:String(assignedToUid||uid)===uid?displayAgentName():teamAppointmentMemberName(assignedMember||{uid:assignedToUid}),setterUid:uid,setterName:displayAgentName(),createdDate,logDate:createdDate,scheduledDate:date,scheduledAt,at:Date.now()},createdDate);
  d.appointments.push(appointment);
  const bookedForMeta=String(assignedToUid||uid)!==String(uid)&&appointment.assignedToName?` · Booked for ${teamAppointmentSetterFirstName(appointment.assignedToName)}`:'';addEvent(d,'appointment',`${type} · ${contactName} · ${address} · booked for ${date} ${time}${bookedForMeta}`);
  days[createdDate]=d;
  try{await saveDay(createdDate);try{await syncTeamAppointmentAssignment(appointment)}catch(err){console.error('Team appointment assignment failed',err);toast('Appointment saved. Team assignment needs sync.')}renderAppointments();toast(date===createdDate?'Appointment logged':'Appointment logged and reminder created');return appointment}
  finally{appointmentSubmitLocks.delete(signature)}
}
function beginEditAppointment(id,sourceDate){
  const d=dayData(sourceDate),appointment=d.appointments.find(a=>String(a.id)===String(id));
  if(!appointment)return toast('Appointment could not be found');
  appointmentEditReturnState={date:appointmentDate,historyMode:appointmentHistoryMode,scrollY:window.scrollY};
  editingAppointment={id:String(id),sourceDate};appointmentLinkedProspectId=appointment.prospectId||'';pendingProspectAppointmentFlow=null;renderProspectAppointmentFlowHeader();appointmentHistoryMode=null;setAppointmentHistoryScreen(null);
  appointmentDate=appointmentCreatedDate(appointment,sourceDate)||todayKey();
  $('#appointmentContactName').value=appointment.contactName||'';$('#appointmentContactNumber').value=appointment.contactNumber||'';$('#appointmentAddress').value=appointment.address||'';$('#appointmentDatePicker').value=appointmentScheduledDate(appointment,sourceDate);$('#appointmentTime').value=appointment.time||'12:00';
  const type=appointmentType(appointment);$$('[name=appointmentType]').forEach(el=>el.checked=el.value===type);$('#appointmentAuction').checked=appointmentHasAuction(appointment);renderAppointmentAssigneePicker(appointment.assignedToUid||uid);updateOfiFormState();
  renderAppointments();$('#appointmentContactName')?.focus({preventScroll:true});
}
function closeAppointmentEditor(){
  if(!editingAppointment)return;
  const returnState=appointmentEditReturnState;
  editingAppointment=null;appointmentEditReturnState=null;appointmentLinkedProspectId='';
  $('#appointmentForm')?.reset();
  $('#appointmentFormError')?.classList.add('hidden');
  if(returnState){appointmentDate=returnState.date;appointmentHistoryMode=returnState.historyMode;}
  $('#appointmentMainContent')?.classList.toggle('hidden',Boolean(appointmentHistoryMode));
  $('#appointmentHistoryScreen')?.classList.toggle('hidden',!appointmentHistoryMode);
  renderAppointments();
  requestAnimationFrame(()=>window.scrollTo({top:returnState?.scrollY||0,behavior:'auto'}));
}
async function editAppointment({contactName,contactNumber,address,date,time,type,auction=false,assignedToUid=uid}){
  if(!editingAppointment)return null;
  const {id,sourceDate}=editingAppointment,d=dayData(sourceDate),index=d.appointments.findIndex(a=>String(a.id)===String(id));
  if(index<0)return toast('Appointment could not be found');
  const existing=d.appointments[index],scheduledAt=new Date(`${date}T${time}`).getTime();if(!validDateKey(date)||!Number.isFinite(scheduledAt))return toast('Appointment date or time is invalid');
  let prospectId=existing.prospectId||'';if(normaliseAppointmentType(type)==='LAP'){const linked=await connectListingAppointmentToPipeline({contactName,contactNumber,address});prospectId=linked?.id||prospectId}
  const previousAssignedToUid=String(existing.assignedToUid||uid),assignedMember=appointmentAssignees.find(entry=>String(entry.uid||'')===String(assignedToUid||''));d.appointments[index]=normaliseAppointmentRecord({...existing,contactName,contactNumber,address,date,scheduledDate:date,time,type,auction:type==='OFI'&&auction,types:[type],scheduledAt,prospectId,assignedToUid:String(assignedToUid||uid),assignedToName:String(assignedToUid||uid)===uid?displayAgentName():teamAppointmentMemberName(assignedMember||{uid:assignedToUid}),setterUid:existing.setterUid||uid,setterName:existing.setterName||displayAgentName(),updatedAt:Date.now()},sourceDate);
  addEvent(d,'appointment',`${type} · ${contactName} · appointment updated for ${date} ${time}`);days[sourceDate]=d;await saveDay(sourceDate);try{await syncTeamAppointmentAssignment(d.appointments[index],previousAssignedToUid)}catch(err){console.error('Team appointment update failed',err);toast('Appointment updated. Team assignment needs sync.')}editingAppointment=null;renderAll();toast('Appointment updated');return d.appointments[index];
}
async function deleteAppointment(id,sourceDate=appointmentDate){
  const d=dayData(sourceDate),index=d.appointments.findIndex(a=>String(a.id)===String(id));
  if(index<0)return toast('Appointment could not be found');
  const appointment=d.appointments[index],exportId=calendarExportId(appointment,sourceDate);
  d.appointments.splice(index,1);days[sourceDate]=d;
  const ids=calendarExportIds();ids.delete(exportId);localStorage.setItem(calendarExportStorageKey(),JSON.stringify([...ids]));
  await saveDay(sourceDate);try{await removeTeamAppointmentAssignment(appointment)}catch(err){console.error('Team appointment delete failed',err)}renderAll();toast('Appointment deleted');
}


function sortedTodayLeaderboard(){
  return leaderboardEntries.filter(x=>x.date===todayKey()&&x.activeToday!==false).sort(sortLeaderboardRows);
}
function sortLeaderboardRows(a,b){return (b.score||0)-(a.score||0)||(b.calls||0)-(a.calls||0)||(b.connects||0)-(a.connects||0)||(b.data||0)-(a.data||0)}
function renderLeaderboardPosition(){
  const position=$('#leaderboardPosition'),meta=$('#leaderboardPositionMeta');
  if(!position||!meta)return;
  if(!cloud){position.textContent='—';meta.textContent='Sign in to view live ranking';return;}
  const rows=sortedTodayLeaderboard(),index=rows.findIndex(r=>r.uid===uid);
  if(index<0){position.textContent='—';meta.textContent=rows.length?`${rows.length} agent${rows.length===1?'':'s'} ranked today`:'Waiting for today’s rankings';return;}
  const me=rows[index];
  position.textContent=`#${index+1}`;
  meta.textContent=`${me.score||0}% complete · ${rows.length} agent${rows.length===1?'':'s'} ranked`;
}
function selectedLeaderboardDayDate(){const d=new Date();d.setDate(d.getDate()+leaderboardDayOffset);return d}
function selectedLeaderboardDayKey(){return dateKey(selectedLeaderboardDayDate())}
function selectedLeaderboardWeekDate(){return weekDateFromOffset(leaderboardWeekOffset)}
function selectedLeaderboardWeekKey(){return weekKeyFromDate(selectedLeaderboardWeekDate())}
function formatWeekRange(base){const start=mondayOf(base),end=new Date(start);end.setDate(start.getDate()+6);return `${start.toLocaleDateString('en-AU',{day:'numeric',month:'short'})}–${end.toLocaleDateString('en-AU',{day:'numeric',month:'short'})}`}
function normaliseDailyLeaderboardEntry(entry,key){
  if(key===todayKey()&&entry.date===key)return{uid:entry.uid,name:entry.name,email:entry.email,calls:entry.calls||0,connects:entry.connects||0,data:entry.data||0,knockMinutes:entry.knockMinutes||0,score:entry.score||0,targets:entry.targets||{},appointments:normaliseLeaderboardAppointmentCounts(entry.appointments),appointmentDetails:normaliseLeaderboardAppointmentDetails(entry.appointmentDetails)};
  const saved=entry.dailyHistory?.[key];
  if(saved==null)return null;
  if(typeof saved==='number')return{uid:entry.uid,name:entry.name,email:entry.email,calls:null,connects:null,data:null,knockMinutes:null,score:saved,targets:{},appointments:emptyLeaderboardAppointmentCounts(null),appointmentDetails:null};
  return{uid:entry.uid,name:entry.name,email:entry.email,calls:saved.calls??null,connects:saved.connects??null,data:saved.data??null,knockMinutes:saved.knockMinutes??null,score:saved.score||0,targets:saved.targets||{},appointments:normaliseLeaderboardAppointmentCounts(saved.appointments),appointmentDetails:normaliseLeaderboardAppointmentDetails(saved.appointmentDetails)};
}
function dailyLeaderboardRows(){const key=selectedLeaderboardDayKey();return leaderboardEntries.map(entry=>normaliseDailyLeaderboardEntry(entry,key)).filter(Boolean).sort(sortLeaderboardRows)}
function leaderboardScheduledWeekKeys(entry,baseDate){
  const scheduled=normaliseWorkDays(entry?.workDays||workDays),start=mondayOf(baseDate),keys=[];
  for(let i=0;i<7;i++){const d=new Date(start);d.setDate(start.getDate()+i);if(scheduled.includes(d.getDay()))keys.push(dateKey(d))}
  return keys;
}
function leaderboardDailySource(entry,key){
  if(entry?.date===key)return{calls:entry.calls??0,connects:entry.connects??0,data:entry.data??0,knockMinutes:entry.knockMinutes??0,score:entry.score??0,targets:entry.targets||{},appointments:entry.appointments,appointmentDetails:entry.appointmentDetails};
  const saved=entry?.dailyHistory?.[key];
  if(saved==null)return null;
  if(typeof saved==='number')return{calls:0,connects:0,data:0,knockMinutes:0,score:saved,targets:{},appointments:null,appointmentDetails:null};
  return saved;
}
function derivedCurrentWeekRecord(entry,baseDate){
  const wk=weekKeyFromDate(baseDate),saved=entry?.weekHistory?.[wk]||null,keys=leaderboardScheduledWeekKeys(entry,baseDate),records=keys.map(key=>leaderboardDailySource(entry,key));
  if(!records.some(Boolean))return saved;
  const count=Math.max(1,keys.length),dailyTarget=entry?.targets||{},savedTargets=saved?.targets||{};
  const perDay=(key)=>Number(dailyTarget[key])||Math.round((Number(savedTargets[key])||0)/count)||0;
  const totals=records.reduce((acc,record)=>{if(!record)return acc;acc.calls+=Number(record.calls)||0;acc.connects+=Number(record.connects)||0;acc.data+=Number(record.data)||0;acc.knockMinutes+=Number(record.knockMinutes)||0;const a=normaliseLeaderboardAppointmentCounts(record.appointments);['MAP','LAP','BAP'].forEach(type=>{if(a[type]!=null)acc.appointments[type]+=Number(a[type])||0});const details=normaliseLeaderboardAppointmentDetails(record.appointmentDetails);if(Array.isArray(details))acc.appointmentDetails.push(...details);return acc},{calls:0,connects:0,data:0,knockMinutes:0,appointments:emptyLeaderboardAppointmentCounts(),appointmentDetails:[]});
  const targetsForWeek={calls:perDay('calls')*count,connects:perDay('connects')*count,data:perDay('data')*count,knock:Number(entry?.weeklyKnockTarget)||Number(savedTargets.knock)||0};
  const scores=[pct(totals.calls,targetsForWeek.calls),pct(totals.connects,targetsForWeek.connects),pct(totals.data,targetsForWeek.data)];
  if(targetsForWeek.knock>0)scores.push(pct(totals.knockMinutes,targetsForWeek.knock));
  const score=Math.round(scores.reduce((sum,value)=>sum+value,0)/Math.max(1,scores.length));
  return{...(saved||{}),weekKey:wk,weekStart:wk,workDays:[...(entry?.workDays||workDays)],calls:totals.calls,connects:totals.connects,data:totals.data,knockMinutes:totals.knockMinutes,score,targets:targetsForWeek,appointments:totals.appointments,appointmentDetails:totals.appointmentDetails};
}
function weeklyLeaderboardEntry(entry,baseDate){
  const wk=weekKeyFromDate(baseDate),currentWk=weekKeyFromDate(new Date()),w=wk===currentWk?derivedCurrentWeekRecord(entry,baseDate):entry.weekHistory?.[wk];
  return w?{uid:entry.uid,name:entry.name,email:entry.email,...w,appointments:normaliseLeaderboardAppointmentCounts(w.appointments),appointmentDetails:normaliseLeaderboardAppointmentDetails(w.appointmentDetails)}:null;
}
function weeklyLeaderboardRows(){const base=selectedLeaderboardWeekDate();return leaderboardEntries.map(entry=>weeklyLeaderboardEntry(entry,base)).filter(Boolean).sort(sortLeaderboardRows)}
function currentWeekLeaderboardRows(){const base=new Date();return leaderboardEntries.map(entry=>weeklyLeaderboardEntry(entry,base)).filter(Boolean).sort(sortLeaderboardRows)}
function metricLabel(key){return({calls:'Calls',connects:'Connects',data:'Data',knocking:'Knocking'})[key]||'Calls'}
function leaderboardMetricItem(value,target,label,suffix=''){
  if(value==null)return `<span class="leaderboard-performance-metric unavailable" role="img" aria-label="${label}: unavailable"><strong>—</strong><i><b style="width:0%"></b></i></span>`;
  const safeValue=Math.max(0,Math.round(Number(value)||0)),safeTarget=Math.max(0,Number(target)||0),metricPct=safeTarget?Math.max(0,Math.min(100,Math.round(safeValue/safeTarget*100))):0;
  const complete=safeTarget>0&&safeValue>=safeTarget;
  return `<span class="leaderboard-performance-metric ${complete?'complete':''}" role="img" aria-label="${label}: ${safeValue}${suffix}, ${metricPct}% complete"><strong>${safeValue}${suffix}</strong><i><b style="width:${metricPct}%"></b></i></span>`;
}
function leaderboardAppointmentItem(value,label='Appointments'){
  if(value==null)return `<span class="leaderboard-performance-metric leaderboard-appointment-metric unavailable" role="img" aria-label="${label}: unavailable"><strong>—</strong></span>`;
  const safeValue=Math.max(0,Math.round(Number(value)||0));
  return `<span class="leaderboard-performance-metric leaderboard-appointment-metric" role="img" aria-label="${label} booked: ${safeValue}"><strong>${safeValue}</strong></span>`;
}
function leaderboardAppointmentTotal(appointments){
  const values=[appointments?.MAP,appointments?.LAP,appointments?.BAP];
  if(values.every(value=>value==null))return null;
  return values.reduce((sum,value)=>sum+(Number.isFinite(Number(value))?Math.max(0,Math.round(Number(value))):0),0);
}
function leaderboardRowHtml(r,i,weekly=false){
  const t=r.targets||{},appointments=normaliseLeaderboardAppointmentCounts(r.appointments),appointmentTotal=leaderboardAppointmentTotal(appointments),score=Math.max(0,Math.min(100,r.score||0)),name=escapeHtml(r.name||r.email?.split('@')[0]||'Agent'),agentUid=escapeHtml(r.uid||'');
  return `<article class="leaderboard-row leaderboard-performance-row leaderboard-viewport-row ${r.uid===uid?'me':''} ${i===0?'leader':''}" data-agent-summary="${agentUid}" role="button" tabindex="0" aria-label="View ${name} appointment summary">
    <b class="rank">${i+1}</b>
    <div class="agent leaderboard-agent-trigger"><strong>${name}</strong>${r.uid===uid?'<small>You</small>':i===0?'<small>Leading</small>':''}</div>
    ${leaderboardMetricItem(r.calls,t.calls,'Calls')}
    ${leaderboardMetricItem(r.connects,t.connects,'Connects')}
    ${leaderboardMetricItem(r.data,t.data,'Data')}
    ${leaderboardMetricItem(r.knockMinutes,t.knock,'Knock','m')}
    ${leaderboardAppointmentItem(appointmentTotal)}
    <em>${score}%<small>${weekly?'W':'D'}</small></em>
  </article>`;
}
function leaderboardAppointmentPeriodLabel(){return leaderboardMode==='week'?`Week ${formatWeekRange(selectedLeaderboardWeekDate())}`:fmtDate(selectedLeaderboardDayKey())}
function leaderboardAppointmentDateTime(item){
  const date=item.scheduledDate?parseKey(item.scheduledDate).toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'}):'Date not set';
  const time=item.time?appointmentTimeLabel({scheduledDate:item.scheduledDate,time:item.time},item.scheduledDate):'Time not set';
  return `${date} · ${time}`;
}
function showLeaderboardAgentSummary(agentUid){
  const rows=leaderboardMode==='week'?weeklyLeaderboardRows():dailyLeaderboardRows(),row=rows.find(item=>String(item.uid)===String(agentUid));
  if(!row)return;
  document.querySelector('.leaderboard-agent-summary-overlay')?.remove();
  const name=escapeHtml(row.name||row.email?.split('@')[0]||'Agent'),details=normaliseLeaderboardAppointmentDetails(row.appointmentDetails),counts=normaliseLeaderboardAppointmentCounts(row.appointments),knownTotal=['MAP','LAP','BAP'].reduce((sum,type)=>sum+(Number(counts[type])||0),0);
  const cards=details?.length?details.map(item=>`<article class="leaderboard-agent-appointment"><span>${escapeHtml(item.type)}</span><div><strong>${escapeHtml(item.contactName||'Client not recorded')}</strong><small>${escapeHtml(item.address||'Address not recorded')}</small>${item.assignedToName?`<em class="leaderboard-booked-for">Booked for ${escapeHtml(teamAppointmentSetterFirstName(item.assignedToName))}</em>`:''}${['Data','Buyer'].includes(item.type)?'':`<time>${escapeHtml(leaderboardAppointmentDateTime(item))}</time>`}</div></article>`).join(''):details===null&&knownTotal?`<div class="leaderboard-agent-summary-empty"><strong>${knownTotal} appointment${knownTotal===1?'':'s'} booked</strong><p>Details will appear after this agent receives the latest app update.</p></div>`:`<div class="leaderboard-agent-summary-empty"><strong>No appointments or data recorded</strong><p>There are no MAP, LAP, BAP or Data entries recorded for this period.</p></div>`;
  const overlay=document.createElement('div');overlay.className='leaderboard-agent-summary-overlay';overlay.innerHTML=`<section class="leaderboard-agent-summary glass" role="dialog" aria-modal="true" aria-label="${name} appointment summary"><header><div><span>AGENT SUMMARY</span><h2>${name}</h2><p>${escapeHtml(leaderboardAppointmentPeriodLabel())}</p></div><button type="button" data-close-agent-summary aria-label="Close agent summary">×</button></header><div class="leaderboard-agent-summary-kpis"><div><strong>${counts.MAP??'—'}</strong><span>MAP</span></div><div><strong>${counts.LAP??'—'}</strong><span>LAP</span></div><div><strong>${counts.BAP??'—'}</strong><span>BAP</span></div></div><div class="leaderboard-agent-appointments">${cards}</div><button class="primary" type="button" data-close-agent-summary>Done</button></section>`;
  document.body.append(overlay);document.body.classList.add('leaderboard-agent-summary-open');
  const close=()=>{overlay.remove();document.body.classList.remove('leaderboard-agent-summary-open')};
  overlay.querySelectorAll('[data-close-agent-summary]').forEach(button=>button.onclick=close);overlay.onclick=e=>{if(e.target===overlay)close()};
}
function renderUnifiedLeaderboard(){
  const isWeek=leaderboardMode==='week',rows=isWeek?weeklyLeaderboardRows():dailyLeaderboardRows();
  $('#leaderboardDayTab').classList.toggle('active',!isWeek);$('#leaderboardWeekTab').classList.toggle('active',isWeek);
  $('#leaderboardDayTab').setAttribute('aria-selected',String(!isWeek));$('#leaderboardWeekTab').setAttribute('aria-selected',String(isWeek));
  if($('#leaderboardModeShortcut')){$('#leaderboardModeShortcut').textContent=isWeek?'WEEK':'DAY';$('#leaderboardModeShortcut').setAttribute('aria-label',isWeek?'Switch leaderboard to daily view':'Switch leaderboard to weekly view');$('#leaderboardModeShortcut').title=isWeek?'Weekly leaderboard':'Daily leaderboard';}
  $('#dayHistoryControls').classList.toggle('hidden',isWeek);$('#weekHistoryControls').classList.toggle('hidden',!isWeek);
  $('#leaderboardPeriodLabel').textContent=isWeek?'WEEKLY LEADERBOARD':'DAILY LEADERBOARD';
  $('#leaderboardDate').textContent=isWeek?`Week ${formatWeekRange(selectedLeaderboardWeekDate())}`:fmtDate(selectedLeaderboardDayKey());
  const periodDate=isWeek?selectedLeaderboardWeekDate():selectedLeaderboardDayDate(),periodKey=isWeek?selectedLeaderboardWeekKey():selectedLeaderboardDayKey();
  const list=$('#leaderboardList'),listMarkup=rows.length?rows.map((r,i)=>leaderboardRowHtml(r,i,isWeek)).join(''):emptyStateMarkup(getEmptyState('leaderboard',{future:periodKey>todayKey(),past:periodKey<todayKey(),date:periodDate}));
  if(listMarkup!==leaderboardListRenderMarkup){list.innerHTML=listMarkup;leaderboardListRenderMarkup=listMarkup}
  $('#leaderboardNote').textContent=isWeek?'Ranked by weekly overall completion. Use the arrows to review prior weeks.':'Ranked by daily overall completion. Use the arrows to review prior days.';
  $('#dayNext').disabled=leaderboardDayOffset>=0;$('#dayToday').disabled=leaderboardDayOffset===0;$('#weekNext').disabled=leaderboardWeekOffset>=0;
}
function renderWeeklyLeaderboard(){renderUnifiedLeaderboard()}
function leaderboardMomentum(entry){
  const prevKey=previousScheduledKey(todayKey(),entry.workDays||workDays);
  if(!prevKey)return{diff:0,label:'—',className:'flat'};
  const raw=entry.dailyHistory?.[prevKey],prev=typeof raw==='number'?raw:Number(raw?.score);
  if(!Number.isFinite(prev))return{diff:0,label:'—',className:'flat'};
  const diff=(entry.score||0)-prev;
  return{diff,label:diff>0?`▲ ${diff}%`:diff<0?`▼ ${Math.abs(diff)}%`:'• 0%',className:diff>0?'up':diff<0?'down':'flat'};
}
function personalBests(){
  let bestDay={value:0,key:null},bestCalls={value:0,key:null},bestConnects={value:0,key:null},bestKnock={value:0,key:null},bestAppointments={value:0,key:null};
  for(const [key,raw] of Object.entries(days)){
    const d=dayData(key),appointmentCount=(d.appointments||[]).filter(a=>['MAP','LAP','BAP'].includes(appointmentType(a))).length;
    if(isWorkDayKey(key)){
      const score=completion(key),knock=Math.floor(liveKnockSeconds(d)/60);
      if(score>bestDay.value){bestDay={value:score,key}};
      if(d.calls>bestCalls.value){bestCalls={value:d.calls,key}};
      if(d.connects>bestConnects.value){bestConnects={value:d.connects,key}};
      if(knock>bestKnock.value){bestKnock={value:knock,key}};
    }
    if(appointmentCount>bestAppointments.value){bestAppointments={value:appointmentCount,key}};
  }
  return{bestDay,bestCalls,bestConnects,bestKnock,bestAppointments};
}
function renderPersonalBests(){
  if(!$('#bestDayScore'))return;
  const b=personalBests();
  $('#bestDayScore').textContent=`${b.bestDay.value}%`;
  $('#bestDayDate').textContent=b.bestDay.key?fmtDate(b.bestDay.key):'No completed days yet';
  $('#bestCallsValue').textContent=b.bestCalls.value;
  $('#bestCallsDate').textContent=b.bestCalls.key?fmtDate(b.bestCalls.key):'No activity recorded yet';
  $('#bestKnockValue').textContent=`${b.bestKnock.value} min`;
  $('#bestKnockDate').textContent=b.bestKnock.key?fmtDate(b.bestKnock.key):'No activity recorded yet';
}
function renderMondayReview(){
  if(!$('#mondayReviewScore'))return;
  const base=weekDateFromOffset(-1),summary=weekSummaryFor(base),metrics=summary.metricPcts||{};
  const strongest=Object.entries(metrics).sort((a,b)=>b[1]-a[1])[0]||['calls',0];
  const weakest=Object.entries(metrics).sort((a,b)=>a[1]-b[1])[0]||['calls',0];
  $('#mondayReviewWeek').textContent=`Week ${formatWeekRange(base)}`;
  $('#mondayReviewScore').textContent=`${summary.score}%`;
  $('#mondayReviewText').textContent=`Strongest: ${metricLabel(strongest[0])} ${strongest[1]}% · Improve: ${metricLabel(weakest[0])} ${weakest[1]}%`;
}
function renderLeaderboard(){
  const date=todayKey(),rows=sortedTodayLeaderboard(),weeklyRows=currentWeekLeaderboardRows();
  renderLeaderboardStatus();
  const meIndex=rows.findIndex(r=>r.uid===uid),me=meIndex>=0?rows[meIndex]:null,myScore=me?.score??completion(date),dailyLeader=rows[0]||null,weeklyLeader=weeklyRows[0]||null,leaderScore=dailyLeader?.score||0,gap=rows.length?Math.max(0,leaderScore-myScore):0;
  const dailyLeaderName=dailyLeader?.name||dailyLeader?.email?.split('@')[0]||'—',weeklyLeaderName=weeklyLeader?.name||weeklyLeader?.email?.split('@')[0]||'—';
  if($('#leaderboardRing'))$('#leaderboardRing').style.setProperty('--score',Math.max(0,Math.min(100,leaderScore)));
  if($('#leaderboardTopScore'))$('#leaderboardTopScore').textContent=`${leaderScore}%`;
  if($('#leaderboardDailyLeaderName'))$('#leaderboardDailyLeaderName').textContent=dailyLeaderName;
  if($('#leaderboardDailyLeaderMeta'))$('#leaderboardDailyLeaderMeta').textContent=dailyLeader?'Setting today’s pace':'Waiting for today’s activity';
  if($('#leaderboardWeeklyLeaderName'))$('#leaderboardWeeklyLeaderName').textContent=weeklyLeaderName;
  if($('#leaderboardWeeklyLeaderScore'))$('#leaderboardWeeklyLeaderScore').textContent=weeklyLeader?`${weeklyLeader.score||0}% this week`:'Waiting for weekly activity';
  if($('#leaderboardHeroRank'))$('#leaderboardHeroRank').textContent=meIndex>=0?`#${meIndex+1}`:'—';
  if($('#leaderboardAgentCount'))$('#leaderboardAgentCount').textContent=rows.length;
  if($('#leaderboardGap'))$('#leaderboardGap').textContent=rows.length?(gap?`${gap}%`:'Leading'):'—';
  renderUnifiedLeaderboard();renderLeaderboardPosition();
  if(activeViewId()==='insightsView')updateTopbar('insightsView');
}

function scorecardWeekDate(){return weekDateFromOffset(scorecardWeekOffset)}
function scorecardGrade(score){return score>=100?'A+':score>=95?'A':score>=90?'A−':score>=80?'B':score>=70?'C':'Needs Attention'}
function scorecardAppointments(base=scorecardWeekDate()){
  const start=mondayOf(base),end=new Date(start);end.setDate(start.getDate()+6);
  const startKey=dateKey(start),endKey=dateKey(end),entries=[];
  Object.entries(days).forEach(([sourceDate,day])=>(day?.appointments||[]).forEach(a=>{
    const scheduled=appointmentScheduledDate(a,sourceDate);
    if(scheduled>=startKey&&scheduled<=endKey)entries.push({appointment:a,sourceDate,scheduled});
  }));
  return entries.sort((x,y)=>appointmentTimestamp(x.appointment,x.sourceDate)-appointmentTimestamp(y.appointment,y.sourceDate));
}
function scorecardWeekRecords(){
  const keys=Object.keys(days).sort();
  if(!keys.length)return[];
  const first=mondayOf(parseKey(keys[0])),last=mondayOf(new Date()),records=[];
  for(let d=new Date(first);d<=last;d.setDate(d.getDate()+7)){const base=new Date(d),w=weekSummaryFor(base);records.push({base,score:w.score,calls:w.calls})}
  return records;
}
function scorecardWeekStreak(records){let count=0;for(let i=records.length-1;i>=0;i--){if(records[i].score>=90)count++;else break}return count}
function renderScorecardAppointments(entries,base){
  const panel=$('#scorecardAppointmentHistory'),list=$('#scorecardAppointmentList');
  if(!panel||!list)return;
  $('#scorecardAppointmentHistoryLabel').textContent=`Week ${formatWeekRange(base)}`;
  list.innerHTML=entries.length?entries.map(({appointment:a,sourceDate,scheduled})=>{
    const phone=String(a.contactNumber||a.phone||'').trim(),contact=a.contactName||a.name||'Contact not recorded',address=a.address||'Address not recorded';
    const when=`${parseKey(scheduled).toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})} at ${appointmentTimeLabel(a,sourceDate)}`;
    const tel=phone?`<a class="scorecard-call" href="tel:${escapeHtml(phone.replace(/[^+\d]/g,''))}">Call ${escapeHtml(contact.split(/\s+/)[0]||'contact')}</a>`:'';
    const lifecycle=appointmentLifecycle(a,sourceDate),status=lifecycle==='completed'?(appointmentOutcomeLabel(a.outcome)||'Completed'):lifecycle==='follow-up'?followUpDueLabel(a):'Upcoming';
    return `<article class="scorecard-appointment-item"><header><span>${escapeHtml(appointmentType(a))}</span><small>${escapeHtml(status)}</small></header><h3>${escapeHtml(address)}</h3><p>${escapeHtml(contact)}${phone?` · ${escapeHtml(phone)}`:''}<br>Booked for ${escapeHtml(when)}</p><div class="scorecard-followup-actions">${tel}${lifecycle!=='upcoming'?`<button data-update-outcome="${a.id}" data-source-date="${sourceDate}">Update Outcome</button>`:''}</div></article>`;
  }).join(''):'<div class="empty"><strong>No appointments this week</strong><small>Booked appointments will appear here.</small></div>';
}
function previousWeekDate(base){const d=new Date(base);d.setDate(d.getDate()-7);return d}
function signedChange(current,previous,unit='%'){
  if(!previous&&current)return `▲ ${current}${unit}`;
  if(!previous&&!current)return `• 0${unit}`;
  const delta=unit==='%'?Math.round((current-previous)/Math.max(1,previous)*100):current-previous;
  return `${delta>0?'▲':delta<0?'▼':'•'} ${Math.abs(delta)}${unit}`;
}
function activityEvents(){return Object.entries(days).flatMap(([key,raw])=>(raw.events||[]).map(e=>({...e,key,date:new Date(e.at||`${key}T09:00:00`)}))).filter(e=>Number.isFinite(e.date.getTime()))}
function productivityInsights(){
  const workEntries=Object.keys(days).filter(isWorkDayKey).map(key=>({key,d:dayData(key),score:completion(key)}));
  const dayGroups={};for(const x of workEntries){const name=workDayName(parseKey(x.key).getDay());(dayGroups[name]??=[]).push(x.score)}
  const bestDay=Object.entries(dayGroups).map(([name,v])=>({name,avg:Math.round(v.reduce((a,b)=>a+b,0)/v.length)})).sort((a,b)=>b.avg-a.avg)[0];
  const totals=workEntries.reduce((a,x)=>({calls:a.calls+x.d.calls,connects:a.connects+x.d.connects}),{calls:0,connects:0});
  const events=activityEvents(),hours={};for(const e of events){if(!['calls','connects','data'].includes(e.type))continue;const h=e.date.getHours();if(h<7||h>19)continue;hours[h]=(hours[h]||0)+Math.max(1,Number(e.delta)||1)}
  const bestHour=Object.entries(hours).sort((a,b)=>b[1]-a[1])[0];
  const knockStarts=events.filter(e=>e.type==='knock'&&String(e.label||'').toLowerCase().includes('started')).map(e=>e.date.getHours()*60+e.date.getMinutes());
  const avgKnock=knockStarts.length?Math.round(knockStarts.reduce((a,b)=>a+b,0)/knockStarts.length):null;
  return{bestDay,bestHour,connectRate:totals.calls?Math.round(totals.connects/totals.calls*100):0,avgKnock};
}
function formatHourRange(hour){hour=Number(hour);const a=new Date(2026,0,1,hour),b=new Date(2026,0,1,hour+1);return `${a.toLocaleTimeString('en-AU',{hour:'numeric',hour12:true}).replace(' ','')}–${b.toLocaleTimeString('en-AU',{hour:'numeric',hour12:true}).replace(' ','')}`}
function formatMinutesTime(minutes){if(minutes==null)return '—';const h=Math.floor(minutes/60),m=minutes%60;return new Date(2026,0,1,h,m).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit',hour12:true}).replace(' ','')}
function insightMomentum(){
  const records=Object.keys(days).filter(key=>isWorkDayKey(key)&&key<=todayKey()).sort().map(key=>({key,score:completion(key)}));
  let best=0,run=0;for(const record of records){if(record.score>=100){run++;best=Math.max(best,run)}else run=0}
  const average=records.length?Math.round(records.reduce((sum,record)=>sum+record.score,0)/records.length):0;
  const consistency=records.length?Math.round(records.filter(record=>record.score>=90).length/records.length*100):0;
  return{current:streak(),best,average,consistency};
}
function insightAchievements(){
  const workKeys=Object.keys(days).filter(isWorkDayKey),totalCalls=workKeys.reduce((sum,key)=>sum+dayData(key).calls,0),totalAppointments=Object.entries(days).reduce((sum,[key,d])=>sum+(d.appointments||[]).filter(a=>['MAP','LAP','BAP'].includes(appointmentType(a))).length,0),momentum=insightMomentum(),records=scorecardWeekRecords(),bestWeek=records.length?Math.max(...records.map(record=>record.score)):0;
  return[
    {label:'1,000 Calls',value:totalCalls,target:1000},
    {label:'10-Day 90% Streak',value:momentum.best,target:10},
    {label:'25 Appointments',value:totalAppointments,target:25},
    {label:'100% Weekly Score',value:bestWeek,target:100}
  ];
}
function renderScorecard(){
  if(!$('#scorecardScore'))return;
  const base=scorecardWeekDate(),w=weekSummaryFor(base),prev=weekSummaryFor(previousWeekDate(base)),m=w.metricPcts||{},pm=prev.metricPcts||{};
  const metrics=Object.entries(m),strongest=[...metrics].sort((a,b)=>b[1]-a[1])[0]||['calls',0],weakest=[...metrics].sort((a,b)=>a[1]-b[1])[0]||['calls',0];
  $('#scorecardWeekLabel').textContent=scorecardWeekOffset===0?`This week · ${formatWeekRange(base)}`:`Week ${formatWeekRange(base)}`;
  $('#scorecardScore').textContent=`${w.score}%`;$('#scorecardGrade').textContent=`Weekly Grade · ${scorecardGrade(w.score)}`;
  $('#scorecardStatus').textContent=w.score>=95?'A strong, balanced week.':w.score>=90?'On track for an A-grade week.':`${metricLabel(weakest[0])} is holding the week back.`;
  $('#scorecardCalls').textContent=`${w.calls} / ${w.targets.calls}`;$('#scorecardCallsPct').textContent=`${m.calls||0}%`;
  $('#scorecardConnects').textContent=`${w.connects} / ${w.targets.connects}`;$('#scorecardConnectsPct').textContent=`${m.connects||0}%`;
  $('#scorecardData').textContent=`${w.data} / ${w.targets.data}`;$('#scorecardDataPct').textContent=`${m.data||0}%`;
  $('#scorecardKnock').textContent=`${w.knockMinutes} / ${w.targets.knock} min`;$('#scorecardKnockPct').textContent=`${m.knocking||0}%`;
  $('#scorecardStrongest').textContent=`Strongest: ${metricLabel(strongest[0])} · ${strongest[1]}%`;
  $('#scorecardWeakest').textContent=`Focus: ${metricLabel(weakest[0])} · ${Math.max(0,100-weakest[1])}% remaining`;
  const remaining=[Math.max(0,w.targets.calls-w.calls),Math.max(0,w.targets.connects-w.connects),Math.max(0,w.targets.data-w.data),Math.max(0,w.targets.knock-w.knockMinutes)];
  $('#scorecardProjection').textContent=w.score>=100?'All weekly targets achieved.':`To close the week: ${remaining[0]} calls, ${remaining[1]} connects, ${remaining[2]} data and ${remaining[3]} knock minutes remaining.`;
  const trendData=[['Calls',w.calls,prev.calls,''],['Connects',w.connects,prev.connects,''],['Data',w.data,prev.data,''],['Knocking',w.knockMinutes,prev.knockMinutes,' min']];
  $('#scorecardTrendGrid').innerHTML=trendData.map(([label,current,previous,unit])=>`<article><span>${label}</span><strong>${signedChange(current,previous,unit)}</strong><small>${current}${unit} vs ${previous}${unit}</small></article>`).join('');
  const changes=trendData.map(([label,current,previous])=>({label,delta:current-previous}));const up=changes.filter(x=>x.delta>0).sort((a,b)=>b.delta-a.delta)[0],down=changes.filter(x=>x.delta<0).sort((a,b)=>a.delta-b.delta)[0];
  $('#scorecardTrendSummary').textContent=up&&down?`${up.label} improved the most, while ${down.label.toLowerCase()} needs attention.`:up?`${up.label} showed the strongest improvement this week.`:down?`${down.label} declined compared with last week.`:'Performance is level with last week.';
  const ins=productivityInsights();
  $('#insightBestHour').textContent=ins.bestHour?formatHourRange(ins.bestHour[0]):'—';$('#insightBestHourMeta').textContent=ins.bestHour?`${ins.bestHour[1]} logged activities`:'More activity needed';
  $('#insightBestDay').textContent=ins.bestDay?.name||'—';$('#insightBestDayMeta').textContent=ins.bestDay?`${ins.bestDay.avg}% average completion`:'More activity needed';
  $('#insightConnectRate').textContent=`${ins.connectRate}%`;$('#insightKnockStart').textContent=formatMinutesTime(ins.avgKnock);
  const rec=[];
  if(ins.bestDay)rec.push(`${ins.bestDay.name} is your strongest day, averaging ${ins.bestDay.avg}% completion.`);
  if(ins.bestHour)rec.push(`Your most productive prospecting hour is ${formatHourRange(ins.bestHour[0])}.`);
  if(ins.avgKnock!=null){const diff=ins.avgKnock-14*60;rec.push(diff>0?`Your average knock start is ${diff} minutes later than the 2:00PM target.`:`Your average knock start is on or ahead of the 2:00PM target.`)}
  if(weakest[1]<100)rec.push(`Improving ${metricLabel(weakest[0]).toLowerCase()} by ${100-weakest[1]}% would create the biggest lift in your weekly grade.`);
  const coaching=rec[rec.length-1]||rec[0]||'Keep logging activity to unlock a focused recommendation.';
  $('#scorecardRecommendations').innerHTML=`<article>${escapeHtml(coaching)}</article>`;
  const momentum=insightMomentum(),bests=personalBests();
  $('#insightCurrentStreak').textContent=`${momentum.current} day${momentum.current===1?'':'s'}`;
  $('#insightBestStreak').textContent=`${momentum.best} day${momentum.best===1?'':'s'}`;
  $('#insightAverageCompletion').textContent=`${momentum.average}%`;$('#insightConsistency').textContent=`${momentum.consistency}%`;
  $('#insightBestCompletion').textContent=`${bests.bestDay.value}%`;$('#insightBestCompletionDate').textContent=bests.bestDay.key?fmtDate(bests.bestDay.key):'No completed days yet';
  $('#insightMostCalls').textContent=bests.bestCalls.value;$('#insightMostCallsDate').textContent=bests.bestCalls.key?fmtDate(bests.bestCalls.key):'No activity recorded yet';
  $('#insightMostConnects').textContent=bests.bestConnects.value;$('#insightMostConnectsDate').textContent=bests.bestConnects.key?fmtDate(bests.bestConnects.key):'No activity recorded yet';
  $('#insightLongestKnock').textContent=`${bests.bestKnock.value} min`;$('#insightLongestKnockDate').textContent=bests.bestKnock.key?fmtDate(bests.bestKnock.key):'No activity recorded yet';
  $('#insightBestAppointmentDay').textContent=`${bests.bestAppointments.value} appointment${bests.bestAppointments.value===1?'':'s'}`;$('#insightBestAppointmentDate').textContent=bests.bestAppointments.key?fmtDate(bests.bestAppointments.key):'No appointments recorded yet';
  $('#scorecardAchievements').innerHTML=insightAchievements().map(item=>{const complete=item.value>=item.target,progress=Math.min(100,Math.round(item.value/item.target*100));return `<article class="${complete?'complete':''}"><span>${escapeHtml(item.label)}</span><strong>${complete?'Achieved':`${progress}%`}</strong><small>${Math.min(item.value,item.target)} / ${item.target}</small></article>`}).join('');
  $('#scorecardNext').disabled=scorecardWeekOffset>=0;
}

function renderInsights(){renderScorecard();renderLeaderboard()}
function renderYearOverview(){const labels=['M','T','W','T','F','S','S'];const months=[];for(let m=0;m<12;m++){const first=new Date(year,m,1),pad=(first.getDay()+6)%7;let cells=`<div class="mini-weekdays">${labels.map(x=>`<b>${x}</b>`).join('')}</div><div class="mini-days">${'<i></i>'.repeat(pad)}`;for(let d=1;d<=new Date(year,m+1,0).getDate();d++){const dt=new Date(year,m,d),k=dateKey(dt),p=completion(k),off=!workDays.includes(dt.getDay());cells+=`<button class="mini-day ${levelClass(p)} ${off?'off':''} ${k===todayKey()?'today':''} ${k===selectedDate?'selected':''}" data-date="${k}" aria-label="${fmtDate(k)}, ${p}% complete">${d}</button>`}cells+='</div>';months.push(`<section class="mini-month"><h3>${new Date(year,m,1).toLocaleDateString('en-AU',{month:'short'})}</h3>${cells}</section>`)}$('#yearHeatmap').innerHTML=months.join('')}
function levelClass(p){return p>=100?'l4':p>=67?'l3':p>=34?'l2':p>0?'l1':''}
function renderMonth(){const y=monthCursor.getFullYear(),m=monthCursor.getMonth();$('#monthLabel').textContent=monthCursor.toLocaleDateString('en-AU',{month:'long',year:'numeric'});const vals=[];for(let d=1;d<=new Date(y,m+1,0).getDate();d++){const dt=new Date(y,m,d);if(workDays.includes(dt.getDay()))vals.push(completion(dateKey(dt)))}const groups=[];for(let i=0;i<vals.length;i+=4){const g=vals.slice(i,i+4);groups.push(Math.round(g.reduce((a,b)=>a+b,0)/Math.max(1,g.length)))}$('#monthBars').innerHTML=groups.map((p,i)=>`<div title="${p}%"><i style="height:${Math.max(3,p)}%"></i><small>W${i+1}</small></div>`).join('')}
function renderCalendar(){const labels=['M','T','W','T','F','S','S'];$('#calendarYear').textContent=year;const months=[];for(let m=0;m<12;m++){const first=new Date(year,m,1),pad=(first.getDay()+6)%7;let cells=`<div class="weekday-row">${labels.map(x=>`<b>${x}</b>`).join('')}</div><div class="days">${'<i></i>'.repeat(pad)}`;for(let d=1;d<=new Date(year,m+1,0).getDate();d++){const dt=new Date(year,m,d),k=dateKey(dt),p=completion(k),off=!workDays.includes(dt.getDay());cells+=`<button class="day-cell ${levelClass(p)} ${off?'off':''} ${k===todayKey()?'today':''} ${k===selectedDate?'selected':''}" data-date="${k}" title="${fmtDate(k)} · ${p}%">${d}</button>`}cells+='</div>';months.push(`<section class="month"><h3>${new Date(year,m,1).toLocaleDateString('en-AU',{month:'long'})}</h3>${cells}</section>`)}$('#calendarGrid').innerHTML=months.join('')}

function buyerSessionStorageKey(){return`agnt-buyer-session-v1-${uid||currentUser?.uid||'device'}`}
function loadBuyerSession(){buyerSession={contacts:[],index:0,active:false,fileName:'',importedAt:0};try{const raw=JSON.parse(localStorage.getItem(buyerSessionStorageKey())||'null');if(raw&&Array.isArray(raw.contacts))buyerSession={contacts:raw.contacts.map((c,i)=>({id:cleanText(c.id,80)||`buyer_${i}`,name:cleanText(c.name,120)||'Unknown buyer',phone:normaliseDialNumber(c.phone),address:cleanText(c.address,240),doNotSms:Boolean(c.doNotSms),status:cleanText(c.status,40)})).filter(c=>c.phone),index:Math.max(0,Number(raw.index)||0),active:Boolean(raw.active),fileName:cleanText(raw.fileName,160),importedAt:Number(raw.importedAt)||0}}catch(err){console.warn('Buyer session could not be restored',err)}}
function saveBuyerSession(){try{localStorage.setItem(buyerSessionStorageKey(),JSON.stringify(buyerSession))}catch(err){console.warn('Buyer session could not be saved',err)}}
function clearBuyerSession(){buyerSession={contacts:[],index:0,active:false,fileName:'',importedAt:0};try{localStorage.removeItem(buyerSessionStorageKey())}catch{}renderBuyerSessionHero()}
function buyerSessionRemaining(){return Math.max(0,buyerSession.contacts.length-buyerSession.index)}
function renderBuyerSessionHero(){const count=$('#buyerListReadyCount'),label=$('#buyerListReadyLabel'),state=$('#buyerListWorkState'),button=$('#openBuyerListSession');if(!count||!button)return;const remaining=buyerSessionRemaining(),hasSession=buyerSession.active||buyerSession.contacts.length,offline=!navigator.onLine&&!hasSession;count.textContent=buyerSession.contacts.length?remaining:'0';label.textContent=buyerSession.contacts.length?`${remaining} buyer${remaining===1?'':'s'} remaining`:offline?'PDF import unavailable':'Import an Agentbox call list';state.textContent=buyerSession.active?'Session ready to continue':buyerSession.contacts.length?'List imported and reviewed':offline?'Connect to the internet to import a PDF':'Name, mobile and address/suburb';button.textContent=buyerSession.active?'Continue Session':buyerSession.contacts.length?'Start Session':offline?'Import Unavailable':'Import PDF';button.disabled=offline}
function buyerPdfMobile(value=''){const text=String(value).replace(/\u00a0/g,' ');const labelled=text.match(/\[\s*M\s*\]\s*:?\s*((?:\+?61\s*4|04)[\d\s()\-]{7,18})/i);const fallback=text.match(/(?:\+?61\s*4|04)[\d\s()\-]{7,18}/);const raw=(labelled?.[1]||fallback?.[0]||'').trim();if(!raw)return'';let number=normaliseDialNumber(raw);if(number.startsWith('614'))number='+'+number;if(/^61?4\d{8}$/.test(number)&&!number.startsWith('+'))number=number.startsWith('61')?`+${number}`:`0${number}`;const digits=number.replace(/\D/g,'');if(number.startsWith('+61'))return digits.length===11&&digits.startsWith('614')?number:'';return /^04\d{8}$/.test(number)?number:''}
async function extractBuyerPdf(file){const pdfjs=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';const pdf=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise,contacts=[];let columnBounds=null;for(let pageNo=1;pageNo<=pdf.numPages;pageNo++){const page=await pdf.getPage(pageNo),content=await page.getTextContent(),viewport=page.getViewport({scale:1});const items=content.items.map(item=>({text:String(item.str||'').replace(/\u00a0/g,' ').trim(),x:Number(item.transform?.[4])||0,y:Number(item.transform?.[5])||0})).filter(item=>item.text);if(!columnBounds){const nameHead=items.find(item=>/^Name$/i.test(item.text)),addressHead=items.find(item=>/^Address$/i.test(item.text)),contactHead=items.find(item=>/^Contact$/i.test(item.text));if(nameHead&&addressHead&&contactHead)columnBounds=[(nameHead.x+addressHead.x)/2,(addressHead.x+contactHead.x)/2];else columnBounds=[viewport.width*.22,viewport.width*.51]}const lines=[];for(const item of items){let line=lines.find(row=>Math.abs(row.y-item.y)<=4);if(!line){line={y:item.y,cells:['','','']};lines.push(line)}const col=item.x<columnBounds[0]?0:item.x<columnBounds[1]?1:2;line.cells[col]+=(line.cells[col]?' ':'')+item.text}lines.sort((a,b)=>b.y-a.y);let current=null;const flush=()=>{if(!current)return;const phone=buyerPdfMobile(current.contact);if(phone)contacts.push({id:`buyer_${Date.now().toString(36)}_${contacts.length}_${pageNo}`,name:current.name.replace(/\s+/g,' ').trim(),phone,address:current.address.replace(/\s+/g,' ').trim(),doNotSms:/do\s*not\s*sms/i.test(current.contact)});current=null};for(const line of lines){let[name,address,contact]=line.cells.map(value=>value.trim());const all=`${name} ${address} ${contact}`.trim();if(!all||/Basic Contact\/Call List|Printed by:|Print Date:|^Name\s+Address\s+Contact$|agentboxcrm\.com\.au|Page\s+\d+\s+of\s+\d+/i.test(all))continue;if(/^(Name|Address|Contact)$/i.test(name)||/^(Name|Address|Contact)$/i.test(address)||/^(Name|Address|Contact)$/i.test(contact))continue;if(name){flush();current={name,address,contact}}else if(current){if(address)current.address+=(current.address?' ':'')+address;if(contact)current.contact+=(current.contact?' ':'')+contact}}flush()}const seen=new Set();return contacts.filter(contact=>{const key=`${contact.name.toLowerCase()}|${contact.phone.replace(/\D/g,'')}`;if(seen.has(key))return false;seen.add(key);return true})}
function showBuyerImportReview(contacts,fileName=''){const host=$('#prospectingSession');if(!host)return;$('#prospectingDashboard').classList.add('hidden');$('#prospectDetail').classList.add('hidden');host.classList.remove('hidden');host.dataset.sessionView='1';host.innerHTML=`<div class="prospect-session-head"><button type="button" data-buyer-import-back aria-label="Back">‹</button><span>${contacts.length} callable buyers</span><button type="button" data-buyer-import-clear>Cancel</button></div><section class="buyer-import-review glass"><div class="buyer-import-review-head"><span>BUYER LIST</span><h2>Review imported contacts</h2><p>${escapeHtml(fileName)} · Check the details before starting.</p></div><div class="buyer-import-rows">${contacts.map((c,i)=>`<article data-buyer-review-row="${i}"><input aria-label="Buyer name" data-buyer-name value="${escapeHtml(c.name)}"><input aria-label="Buyer mobile" inputmode="tel" data-buyer-phone value="${escapeHtml(displayDialNumber(c.phone))}"><input aria-label="Buyer address or suburb" data-buyer-address value="${escapeHtml(c.address)}"><button type="button" data-remove-buyer="${i}" aria-label="Remove ${escapeHtml(c.name)}">×</button>${c.doNotSms?'<small>DO NOT SMS</small>':''}</article>`).join('')}</div><button class="primary" type="button" data-confirm-buyer-import>Start Buyer Session</button></section>`;host._buyerImport={contacts,fileName}}
async function importBuyerPdf(file){if(!file)return;toast('Reading buyer list…');try{const contacts=await extractBuyerPdf(file);if(!contacts.length)return toast('No callable mobile numbers found');showBuyerImportReview(contacts,file.name)}catch(err){console.error('Buyer PDF import failed',err);toast('Buyer list could not be read. Check your connection and PDF format.')}}
function openBuyerListSession(){if(buyerSession.active||buyerSession.contacts.length){buyerSession.active=true;saveBuyerSession();showBuyerSession();return}$('#buyerPdfImport')?.click()}
function launchBuyerSessionCall(){const buyer=buyerSession.contacts[buyerSession.index];if(!buyer)return;const number=normaliseDialNumber(buyer.phone),pending={id:prospectId(),number,launchedAt:Date.now(),outcomeLogged:false,source:'buyer-session',buyerId:buyer.id,buyerName:buyer.name};writePendingManualCall(pending);manualCallLaunchGuardUntil=Date.now()+1600;window.location.href=`tel:${number}`;setTimeout(maybeShowManualCallOutcome,2600)}
function showBuyerSession(){if(!buyerSession.active)return;const host=$('#prospectingSession');$('#prospectingDashboard').classList.add('hidden');$('#prospectDetail').classList.add('hidden');host.classList.remove('hidden');host.dataset.sessionView='1';while(buyerSession.index<buyerSession.contacts.length&&buyerSession.contacts[buyerSession.index].status)buyerSession.index++;saveBuyerSession();const remaining=buyerSessionRemaining();if(!remaining){host.innerHTML=`<div class="prospect-session-head"><button type="button" data-buyer-session-back aria-label="Back">‹</button><span>Buyer List · Complete</span><button type="button" data-end-buyer-session>End Session</button></div><section class="prospect-session-card glass prospect-session-complete"><span class="prospect-avatar session-avatar">✓</span><h2>Queue complete</h2><p>You’ve worked through every buyer in this call list.</p><button class="primary" type="button" data-end-buyer-session>Finish Session</button></section>`;return}const buyer=buyerSession.contacts[buyerSession.index],initials=buyer.name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();host.innerHTML=`<div class="prospect-session-head"><button type="button" data-buyer-session-back aria-label="Back">‹</button><span>Buyer List · ${buyerSession.index+1} of ${buyerSession.contacts.length}</span><button type="button" data-end-buyer-session>End Session</button></div><section class="prospect-session-card glass"><span class="prospect-avatar session-avatar">${escapeHtml(initials)}</span><span>BUYER CALL</span><h2>${escapeHtml(buyer.name)}</h2><p>${escapeHtml(buyer.address||'No address or suburb supplied')}</p><div class="prospect-session-context"><div><span>MOBILE</span><strong>${escapeHtml(displayDialNumber(buyer.phone))}</strong></div><div><span>REMAINING</span><strong>${remaining} buyer${remaining===1?'':'s'}</strong></div></div>${buyer.doNotSms?'<blockquote>Agentbox flag: Do Not SMS</blockquote>':''}<button class="primary" type="button" data-call-buyer-session>Call ${escapeHtml(buyer.name.split(' ')[0])}</button><button class="text-btn" type="button" data-skip-buyer-session>Skip for now</button></section>`}
function completeBuyerSessionCall(outcome,pending){if(pending?.source!=='buyer-session'||outcome==='Cancelled')return;const buyer=buyerSession.contacts.find(c=>c.id===pending.buyerId);if(buyer)buyer.status=outcome;while(buyerSession.index<buyerSession.contacts.length&&buyerSession.contacts[buyerSession.index].status)buyerSession.index++;saveBuyerSession();renderBuyerSessionHero()}
function manualCallStorageKey(){return`agnt-manual-call-v125-${uid||currentUser?.uid||'device'}`}
function readPendingManualCall(){try{const value=JSON.parse(localStorage.getItem(manualCallStorageKey())||'null');return value&&typeof value==='object'?value:null}catch{return null}}
function writePendingManualCall(value){try{if(value)localStorage.setItem(manualCallStorageKey(),JSON.stringify(value));else localStorage.removeItem(manualCallStorageKey())}catch(err){console.warn('Manual call state could not be saved',err)}}
function normaliseDialNumber(value=''){let clean=String(value).replace(/[^+\d]/g,'');if(clean.includes('+'))clean=(clean.startsWith('+')?'+':'')+clean.replace(/\+/g,'');return clean.slice(0,18)}
function displayDialNumber(value=''){const number=normaliseDialNumber(value);if(!number)return'\u00a0';const local=number.startsWith('+61')&&number.length>3?'0'+number.slice(3):number;if(/^04\d*$/.test(local)){const digits=local.slice(0,10);return [digits.slice(0,4),digits.slice(4,7),digits.slice(7,10)].filter(Boolean).join(' ')}return local.replace(/(\d{4})(?=\d)/g,'$1 ').trim()}
function renderManualDialler(){const output=$('#manualDiallerNumber'),call=$('#manualDiallerCall'),display=manualDiallerNumber?displayDialNumber(manualDiallerNumber):'';if(output&&output.value!==display)output.value=display;if(call)call.disabled=normaliseDialNumber(manualDiallerNumber).replace(/\D/g,'').length<6}
function openManualDialler(){manualDiallerNumber='';renderManualDialler();const modal=$('#manualDiallerModal');modal?.classList.add('open');modal?.setAttribute('aria-hidden','false');document.body.classList.add('manual-dialler-open')}
function closeManualDialler(){const modal=$('#manualDiallerModal');modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');document.body.classList.remove('manual-dialler-open')}
function closeManualCallOutcome({clear=true}={}){const modal=$('#manualCallOutcomeModal');modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');document.body.classList.remove('manual-call-outcome-open');manualCallOutcome='';$('#manualCallOutcomeOptions')?.classList.remove('hidden');$('#manualCallPostActions')?.classList.add('hidden');if(clear)writePendingManualCall(null)}
function showManualCallOutcome(){const pending=readPendingManualCall();if(!pending?.number||pending.outcomeLogged)return false;const modal=$('#manualCallOutcomeModal');if(!modal)return false;$('#manualCallOutcomeNumber').textContent=displayDialNumber(pending.number);const buyerButton=$('#manualCallSaveBuyer');if(buyerButton)buyerButton.textContent=pending.buyerProspectId?'Update buyer':'Add as buyer';$('#manualCallOutcomeOptions').classList.remove('hidden');$('#manualCallPostActions').classList.add('hidden');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('manual-call-outcome-open');return true}
function maybeShowManualCallOutcome(){const pending=readPendingManualCall();if(!pending?.number||pending.outcomeLogged||Date.now()<manualCallLaunchGuardUntil)return false;return showManualCallOutcome()}
function launchManualCall(){const number=normaliseDialNumber(manualDiallerNumber);if(number.replace(/\D/g,'').length<6)return;const pending={id:prospectId(),number,launchedAt:Date.now(),outcomeLogged:false};writePendingManualCall(pending);manualCallLaunchGuardUntil=Date.now()+1600;closeManualDialler();window.location.href=`tel:${number}`;setTimeout(maybeShowManualCallOutcome,2600)}
async function applyManualCallOutcome(outcome,pending){if(!pending?.id||outcome==='Cancelled')return;const key=todayKey(),d=dayData(key);if(d.events.some(event=>event?.sourceInteractionId===pending.id))return;const connected=outcome==='Connected',at=Date.now();d.calls=Math.max(0,d.calls+1);d.events.push({id:uuid(),type:'calls',label:`Quick Call · ${outcome}`,delta:1,at,sourceInteractionId:pending.id,phone:pending.number});if(connected){d.connects=Math.max(0,d.connects+1);d.events.push({id:uuid(),type:'connects',label:'Quick Call · Connected',delta:1,at,sourceInteractionId:pending.id,phone:pending.number})}d.events=d.events.slice(-500);days[key]=d;haptic();await saveDay(key)}
async function saveManualCallOutcome(outcome){
  const pending=readPendingManualCall();if(!pending?.number)return closeManualCallOutcome();manualCallOutcome=outcome;const buyerMatchId=cleanText(pending.buyerMatchId,180),buyerId=cleanText(pending.buyerProspectId,80),isBuyerMatch=Boolean(buyerId&&buyerMatchId);
  if(outcome!=='Cancelled'){try{await applyManualCallOutcome(outcome,pending)}catch(err){console.error('Quick call metrics failed to save',err);toast('Call logged locally. Please check sync.')}}
  completeBuyerSessionCall(outcome,pending);await logManualCallToBuyer(outcome,pending);const updated={...pending,outcome,outcomeLogged:true,loggedAt:Date.now()};writePendingManualCall(updated);renderAll();
  if(isBuyerMatch){closeManualCallOutcome();if(outcome==='Connected'){openBuyerMatchOutcome(buyerId,buyerMatchId,{contactMethod:'call'});return}if(outcome==='Cancelled'){toast('Property match left open');return}toast('Contact attempt saved · property stays open');return}
  $('#manualCallOutcomeOptions').classList.add('hidden');$('#manualCallPostActions').classList.remove('hidden');$('#manualCallResultIcon').textContent=outcome==='Cancelled'?'×':'✓';$('#manualCallResultTitle').textContent=outcome==='Cancelled'?'Call cancelled':'Call logged';$('#manualCallResultMeta').textContent=outcome==='Connected'?'+1 call · +1 connect':outcome==='Cancelled'?'No metrics added':'+1 call · No connect';
}
function manualCallPhone(){return readPendingManualCall()?.number||''}
function saveManualCallAsContact(){const phone=manualCallPhone();closeManualCallOutcome();switchView('prospectingView');setProspectorSection('contacts');openProspectEditor('',{prefill:{phone}});requestAnimationFrame(()=>$('#prospectEditor input[name="name"]')?.focus({preventScroll:true}))}
function bookManualCallAppointment(){const phone=manualCallPhone();closeManualCallOutcome();editingAppointment=null;appointmentEditReturnState=null;appointmentHistoryMode=null;appointmentDate=todayKey();appointmentLinkedProspectId='';$('#appointmentForm')?.reset();$('#appointmentContactNumber').value=phone;$('#appointmentDatePicker').value=appointmentDate;$('#appointmentTime').value='12:00';$('#appointmentAuction').checked=false;updateOfiFormState();switchView('appointmentsView');requestAnimationFrame(()=>$('#appointmentContactName')?.focus({preventScroll:true}))}
function prospectId(){return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}
function cleanText(value,max=500){return String(value??'').trim().slice(0,max)}
function pipelineDefaultsForTimeframe(timeframe=''){
  return {
    'Now':{temperature:'Hot',motivation:5},
    '1–3 months':{temperature:'Warm',motivation:4},
    '6–12 months':{temperature:'Warm',motivation:3},
    '12 months+':{temperature:'Cold',motivation:2},
    '':{temperature:'Cold',motivation:1}
  }[SELLING_TIMEFRAMES.includes(timeframe)?timeframe:'']||{temperature:'Cold',motivation:1};
}
function normaliseBuyerPropertyMatches(list=[]){
  const seen=new Set();
  return(Array.isArray(list)?list:[]).filter(item=>item&&typeof item==='object').map(item=>{
    const eventId=cleanText(item.eventId||item.id,160),propertyKey=cleanText(item.propertyKey,320),id=cleanText(item.id,180)||eventId;
    return{id,eventId,propertyKey,eventType:cleanText(item.eventType,60),address:cleanText(item.address,240),suburb:cleanText(item.suburb,100),price:cleanText(item.price,120),guide:cleanText(item.guide,120),priorPrice:cleanText(item.priorPrice,120),priceMovementAmount:cleanText(item.priceMovementAmount,120),priceMovementPercent:cleanText(item.priceMovementPercent,40),priceMovementDirection:['above','below'].includes(item.priceMovementDirection)?item.priceMovementDirection:'',propertyDetails:cleanText(item.propertyDetails,240),daysOnMarket:cleanText(item.daysOnMarket,80),auctionDate:validDateKey(item.auctionDate)?item.auctionDate:'',auctionTime:/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(item.auctionTime)?item.auctionTime:'',auctionText:cleanText(item.auctionText,180),propertyType:BUYER_PROPERTY_TYPES.includes(item.propertyType)?item.propertyType:'',bedrooms:Math.max(0,Number(item.bedrooms)||0),bathrooms:Math.max(0,Number(item.bathrooms)||0),cars:Math.max(0,Number(item.cars)||0),receivedDate:validDateKey(item.receivedDate)?item.receivedDate:todayKey(),matchedAt:Number(item.matchedAt)||Date.now(),status:BUYER_MATCH_STATUSES.has(item.status)?item.status:'active',statusAt:Number(item.statusAt)||0,reason:cleanText(item.reason,320),outcome:BUYER_MATCH_OUTCOMES.has(item.outcome)?item.outcome:'',outcomeAt:Number(item.outcomeAt)||0,outcomeReason:BUYER_MATCH_REASONS.has(item.outcomeReason)?item.outcomeReason:'',nextFollowUp:validDateKey(item.nextFollowUp)?item.nextFollowUp:'',lastAttemptAt:Number(item.lastAttemptAt)||0,lastContactMethod:['call','sms','manual'].includes(item.lastContactMethod)?item.lastContactMethod:'',attemptCount:Math.max(0,Number(item.attemptCount)||0)};
  }).filter(item=>item.id&&item.eventId&&item.propertyKey&&item.address&&item.suburb).filter(item=>{if(seen.has(item.id))return false;seen.add(item.id);return true}).sort((a,b)=>a.receivedDate.localeCompare(b.receivedDate)||a.matchedAt-b.matchedAt).slice(-60)
}
function normaliseProspect(raw={}){
  const p=raw&&typeof raw==='object'?raw:{},isLegacyBuyer=p.recordType==='buyer',hasBuyerRoleFlag=Boolean(p.buyerProfileActive||p.buyerProfileArchived),sellingTimeframe=SELLING_TIMEFRAMES.includes(p.sellingTimeframe)?p.sellingTimeframe:'',temperatureManual=isLegacyBuyer||hasBuyerRoleFlag||Boolean(p.temperatureManual),motivationManual=Boolean(p.motivationManual),defaults=pipelineDefaultsForTimeframe(sellingTimeframe);
  const base={id:cleanText(p.id,80)||prospectId(),name:cleanText(p.name,120)||'Unnamed contact',phone:cleanText(p.phone,50),email:cleanText(p.email,180),address:cleanText(p.address,240),company:cleanText(p.company,240),suburb:cleanText(p.suburb,100),tags:Array.isArray(p.tags)?p.tags.map(x=>cleanText(x,50)).filter(Boolean).slice(0,12):cleanText(p.tags,300).split(/[,;|]/).map(x=>x.trim()).filter(Boolean).slice(0,12),source:cleanText(p.source,100),stage:cleanText(p.stage,60)||'Nurture',temperature:temperatureManual&&['Cold','Warm','Hot'].includes(p.temperature)?p.temperature:defaults.temperature,sellingTimeframe,motivation:motivationManual?Math.max(1,Math.min(5,Number(p.motivation)||defaults.motivation)):defaults.motivation,temperatureManual,motivationManual,lastContact:validDateKey(p.lastContact)?p.lastContact:'',nextFollowUp:validDateKey(p.nextFollowUp)?p.nextFollowUp:'',notes:cleanText(p.notes,3000),archived:Boolean(p.archived),archivedAt:Number(p.archivedAt)||0,sellerProfileActive:Boolean(p.sellerProfileActive),mergedProspectIds:[...new Set((Array.isArray(p.mergedProspectIds)?p.mergedProspectIds:[]).map(id=>cleanText(id,80)).filter(Boolean))].slice(0,50),dataCreditedAt:Number(p.dataCreditedAt)||0,createdAt:Number(p.createdAt)||Date.now(),updatedAt:Number(p.updatedAt)||Date.now()};
  const hasBuyerHistory=isLegacyBuyer||hasBuyerRoleFlag||Boolean(p.buyerConvertedAt||p.buyerPurchaseAddress||p.buyerStage||p.buyerSeller||p.buyerBudgetMax||p.buyerBedrooms||p.buyerBathrooms||p.buyerCars||(Array.isArray(p.buyerSuburbs)&&p.buyerSuburbs.length)||(Array.isArray(p.buyerPositionTags)&&p.buyerPositionTags.length));
  if(isLegacyBuyer)base.recordType='buyer';
  if(hasBuyerHistory){const min=Math.max(0,Number(p.buyerBudgetMin)||0),rawMax=Math.max(0,Number(p.buyerBudgetMax)||0),positionTags=(Array.isArray(p.buyerPositionTags)?p.buyerPositionTags:cleanText(p.buyerPositionTags,500).split(/[,;|]/)).map(x=>cleanText(x,50)).filter(x=>BUYER_POSITION_TAGS.includes(x));if(p.buyerSeller&&!positionTags.includes('Buyer Seller'))positionTags.unshift('Buyer Seller');const buyerStage=BUYER_STAGES.includes(p.buyerStage)?p.buyerStage:(isLegacyBuyer?'Looking':'Purchased'),buyerProfileArchived=Boolean(p.buyerProfileArchived||(isLegacyBuyer&&p.archived)),buyerProfileActive=buyerStage!=='Purchased'&&!buyerProfileArchived&&(p.buyerProfileActive===undefined?isLegacyBuyer:Boolean(p.buyerProfileActive));Object.assign(base,{buyerProfileActive,buyerProfileArchived,buyerStage,buyerBudgetMin:min,buyerBudgetMax:rawMax&&rawMax<min?min:rawMax,buyerBedrooms:Math.max(0,Math.min(5,Number(p.buyerBedrooms)||0)),buyerBathrooms:Math.max(0,Math.min(4,Number(p.buyerBathrooms)||0)),buyerCars:Math.max(0,Math.min(3,Number(p.buyerCars)||0)),buyerSuburbs:(Array.isArray(p.buyerSuburbs)?p.buyerSuburbs:cleanText(p.buyerSuburbs,500).split(/[,;|]/)).map(x=>cleanText(x,100)).filter(Boolean).slice(0,12),buyerPropertyType:BUYER_PROPERTY_TYPES.includes(p.buyerPropertyType)?p.buyerPropertyType:'',buyerFeatures:(Array.isArray(p.buyerFeatures)?p.buyerFeatures:cleanText(p.buyerFeatures,500).split(/[,;|]/)).map(x=>cleanText(x,50)).filter(x=>BUYER_FEATURES.includes(x)).slice(0,12),buyerPositionTags:[...new Set(positionTags)].slice(0,BUYER_POSITION_TAGS.length),buyerSeller:positionTags.includes('Buyer Seller'),buyerPurchaseAddress:cleanText(p.buyerPurchaseAddress,240),buyerPurchasePrice:Math.max(0,Number(p.buyerPurchasePrice)||0),buyerPurchaseDate:validDateKey(p.buyerPurchaseDate)?p.buyerPurchaseDate:'',buyerConvertedAt:Number(p.buyerConvertedAt)||0,buyerPropertyMatches:normaliseBuyerPropertyMatches(p.buyerPropertyMatches)});if(positionTags.includes('Buyer Seller'))base.sellerProfileActive=true;}
  return base
}
function normaliseProspects(list){return(Array.isArray(list)?list:[]).map(normaliseProspect).filter((p,i,a)=>a.findIndex(x=>x.id===p.id)===i).slice(0,10000)}
function normaliseProspectInteractions(list){
  const triggers=new Set(['sold','price','auction','withdrawn','any']),statuses=new Set(['pending','triggered']);
  return(Array.isArray(list)?list:[]).filter(x=>x&&typeof x==='object').map(x=>({
    id:cleanText(x.id,80)||prospectId(),prospectId:cleanText(x.prospectId,80),date:validDateKey(x.date)?x.date:todayKey(),at:Number(x.at)||Date.now(),type:cleanText(x.type,40)||'Note',outcome:cleanText(x.outcome,80),note:cleanText(x.note,2000),nextFollowUp:validDateKey(x.nextFollowUp)?x.nextFollowUp:'',marketEventId:cleanText(x.marketEventId,160),
    marketFollowUpTrigger:triggers.has(x.marketFollowUpTrigger)?x.marketFollowUpTrigger:'',marketFollowUpStatus:statuses.has(x.marketFollowUpStatus)?x.marketFollowUpStatus:'',marketPropertyKey:cleanText(x.marketPropertyKey,320),marketFollowUpSourceEventId:cleanText(x.marketFollowUpSourceEventId,160),marketFollowUpSourceEventType:cleanText(x.marketFollowUpSourceEventType,60),marketFollowUpAddress:cleanText(x.marketFollowUpAddress,240),marketFollowUpSuburb:cleanText(x.marketFollowUpSuburb,100),marketFollowUpOriginalPrice:cleanText(x.marketFollowUpOriginalPrice,120),marketFollowUpOriginalAuctionDate:validDateKey(x.marketFollowUpOriginalAuctionDate)?x.marketFollowUpOriginalAuctionDate:'',marketFollowUpTriggeredEventId:cleanText(x.marketFollowUpTriggeredEventId,160),marketFollowUpTriggeredAt:Number(x.marketFollowUpTriggeredAt)||0,marketFollowUpTriggeredReason:cleanText(x.marketFollowUpTriggeredReason,320)
  })).filter(x=>x.prospectId).slice(-20000)
}
function directProspectById(id){return prospects.find(p=>p.id===id)}
function prospectById(id){return directProspectById(id)||prospects.find(p=>(p.mergedProspectIds||[]).includes(id))}
function prospectHasBuyerProfile(p={}){return Boolean(p&&(p.recordType==='buyer'||p.buyerProfileActive||p.buyerProfileArchived||p.buyerConvertedAt||p.buyerStage==='Purchased'))}
function prospectBuyerArchived(p={}){return Boolean(prospectHasBuyerProfile(p)&&p.buyerStage!=='Purchased'&&(p.buyerProfileArchived||p.archived))}
function prospectHasActiveBuyerRole(p={}){return Boolean(prospectHasBuyerProfile(p)&&!p.archived&&!prospectBuyerArchived(p)&&p.buyerStage!=='Purchased'&&(p.buyerProfileActive||p.recordType==='buyer'))}
function prospectHasContactProfile(p={}){return Boolean(p&&(p.recordType!=='buyer'||p.sellerProfileActive))}
function prospectIsBuyerSeller(p={}){return prospectHasActiveBuyerRole(p)&&prospectHasContactProfile(p)}
function activeProspects(){return prospects.filter(p=>!p.archived&&prospectHasContactProfile(p))}
function archivedProspects(){return prospects.filter(p=>p.archived&&prospectHasContactProfile(p))}
function activeBuyerProspects(){return prospects.filter(prospectHasActiveBuyerRole)}
function archivedBuyerProspects(){return prospects.filter(prospectBuyerArchived)}
function interactionsFor(id){return prospectInteractions.filter(x=>x.prospectId===id).sort((a,b)=>b.at-a.at)}
const PROSPECT_CONNECTED_OUTCOMES=new Set(['Connected','Appraisal opportunity','Appointment booked','Not interested','Do not contact']);
function prospectLastConnectedDate(id){const interaction=interactionsFor(id).find(x=>PROSPECT_CONNECTED_OUTCOMES.has(x.outcome));return interaction?.date||''}
function prospectContactedToday(id){const today=todayKey();return prospectInteractions.some(x=>x.prospectId===id&&x.date===today&&x.type==='Call')}
const PROSPECT_SESSION_COOLDOWN_MS=21*24*60*60*1000;
function prospectLastLoggedAt(id){return interactionsFor(id).reduce((latest,interaction)=>Math.max(latest,Number(interaction.at)||0),0)}
function prospectRecentlyLogged(id){const lastLoggedAt=prospectLastLoggedAt(id);return lastLoggedAt>0&&Date.now()-lastLoggedAt<PROSPECT_SESSION_COOLDOWN_MS}
function prospectPipelineEligible(p){if(!p||!primaryProspectPhone(p))return false;if(interactionsFor(p.id).some(x=>x.outcome==='Do not contact'))return false;if(p.nextFollowUp&&p.nextFollowUp<=todayKey())return false;return !prospectRecentlyLogged(p.id)}
function dailyProspectPipelineKey(){return`${storagePrefix(uid)}prospect-pipeline-v105-${todayKey()}`}
function dailyProspectServedKey(){return`${storagePrefix(uid)}prospect-pipeline-served-v1345-${todayKey()}`}
function getDailyProspectServedIds(){try{const raw=safeJsonParse(localStorage.getItem(dailyProspectServedKey())||'[]',[]);return new Set(Array.isArray(raw)?raw.filter(id=>typeof id==='string'):[])}catch(err){console.warn('Daily served pipeline could not be read',err);return new Set()}}
function addDailyProspectServedIds(ids=[]){const served=getDailyProspectServedIds();ids.forEach(id=>{if(typeof id==='string'&&id)served.add(id)});try{localStorage.setItem(dailyProspectServedKey(),JSON.stringify([...served]))}catch(err){console.warn('Daily served pipeline could not be saved',err)}return served}
function sortedEligibleProspectPipeline(){return activeProspects().filter(prospectPipelineEligible).sort((a,b)=>{const aConnected=prospectLastConnectedDate(a.id)||'',bConnected=prospectLastConnectedDate(b.id)||'';if(!aConnected&&bConnected)return-1;if(aConnected&&!bConnected)return 1;return aConnected.localeCompare(bConnected)||({Hot:0,Warm:1,Cold:2}[a.temperature]-({Hot:0,Warm:1,Cold:2}[b.temperature]))||a.name.localeCompare(b.name)})}
function getDailyProspectPipeline(){let ids=[];try{const raw=safeJsonParse(localStorage.getItem(dailyProspectPipelineKey())||'[]',[]);if(Array.isArray(raw))ids=raw.filter(id=>typeof id==='string'&&prospectById(id)&&!prospectById(id).archived)}catch(err){console.warn('Daily pipeline could not be read',err)}if(!ids.length){ids=sortedEligibleProspectPipeline().slice(0,50).map(p=>p.id);try{localStorage.setItem(dailyProspectPipelineKey(),JSON.stringify(ids))}catch(err){console.warn('Daily pipeline could not be saved',err)}}return ids}
function dueProspectFollowUps(){const today=todayKey();return priorityProspects().filter(p=>p.nextFollowUp&&p.nextFollowUp<=today)}
function prospectDueRank(p){const today=todayKey();if(p.nextFollowUp&&p.nextFollowUp<today)return 0;if(p.nextFollowUp===today)return 1;if(p.temperature==='Hot')return 2;if(!p.lastContact)return 3;return 4}
function priorityProspects(){return activeProspects().sort((a,b)=>prospectDueRank(a)-prospectDueRank(b)||(a.nextFollowUp||'9999').localeCompare(b.nextFollowUp||'9999')||b.motivation-a.motivation||b.updatedAt-a.updatedAt)}
function primaryProspectPhone(p){
  const raw=cleanText(p?.phone||'',120);if(!raw)return'';
  const candidates=raw.split(/\s*(?:\||;|,|\/|·|\n)\s*/).map(x=>x.trim()).filter(Boolean);
  const usable=candidates.map(value=>({value,digits:value.replace(/\D/g,'')})).filter(x=>x.digits.length>=8);
  const mobile=usable.find(x=>/^0?4\d{8}$/.test(x.digits)||/^614\d{8}$/.test(x.digits));
  return(mobile||usable[0])?.value||'';
}
function formatProspectAddress(value='',suburb=''){
  let raw=cleanText(value,300).replace(/\\+/g,' ').replace(/\s+/g,' ').trim();
  let cleanSuburb=cleanText(suburb,100).replace(/\\+/g,' ').replace(/\s+/g,' ').trim();
  if(!raw&&!cleanSuburb)return'';
  raw=raw.replace(/\s*,\s*/g,', ').replace(/,+/g,',').trim();
  const parts=raw.split(',').map(x=>x.trim()).filter(Boolean);
  let street=parts[0]||raw;
  let inferredSuburb=parts.length>1?parts[1]:'';
  const stripRegion=value=>value.replace(/\b(?:NSW|ACT|VIC|QLD|SA|WA|TAS|NT)\b/gi,'').replace(/\b\d{4}\b/g,'').replace(/\s+/g,' ').trim();
  street=stripRegion(street);
  inferredSuburb=stripRegion(inferredSuburb);
  cleanSuburb=stripRegion(cleanSuburb);
  const finalSuburb=cleanSuburb||inferredSuburb;
  if(finalSuburb&&street.toLowerCase().endsWith(finalSuburb.toLowerCase())){
    street=street.slice(0,-finalSuburb.length).replace(/[ ,]+$/,'').trim();
  }
  return[street,finalSuburb].filter(Boolean).join(', ');
}
function prospectTel(p){const phone=primaryProspectPhone(p);return phone?`tel:${phone.replace(/[^+\d]/g,'')}`:'#'}
const PROSPECT_CALL_RETURN_KEY='agnt-prospect-call-return';
function rememberProspectCallReturn(id,fromSession=false,returnMode=''){if(!id)return;try{sessionStorage.setItem(PROSPECT_CALL_RETURN_KEY,JSON.stringify({id,fromSession:Boolean(fromSession),returnMode:cleanText(returnMode,40),at:Date.now()}))}catch(err){console.warn('Call return state could not be saved',err)}}
function resumeProspectCallReturn(){let pending=null;try{pending=JSON.parse(sessionStorage.getItem(PROSPECT_CALL_RETURN_KEY)||'null')}catch(err){console.warn('Call return state could not be read',err)}if(!pending?.id)return false;const age=Date.now()-(Number(pending.at)||0);if(age<350)return false;if(age>10*60*1000){try{sessionStorage.removeItem(PROSPECT_CALL_RETURN_KEY)}catch{}return false}if(!prospectById(pending.id)){try{sessionStorage.removeItem(PROSPECT_CALL_RETURN_KEY)}catch{}return false}try{sessionStorage.removeItem(PROSPECT_CALL_RETURN_KEY)}catch{}switchView('prospectingView');openProspectLog(pending.id,Boolean(pending.fromSession),{returnMode:pending.returnMode});return true}
const APPOINTMENT_FOLLOWUP_CALL_RETURN_KEY='agnt-appointment-followup-call-return';
function rememberAppointmentFollowUpCallReturn(id,sourceDate,returnMode=''){if(!id)return;try{sessionStorage.setItem(APPOINTMENT_FOLLOWUP_CALL_RETURN_KEY,JSON.stringify({id,sourceDate,returnMode:cleanText(returnMode,40),at:Date.now()}))}catch(err){console.warn('Appointment call return state could not be saved',err)}}
function resumeAppointmentFollowUpCallReturn(){let pending=null;try{pending=JSON.parse(sessionStorage.getItem(APPOINTMENT_FOLLOWUP_CALL_RETURN_KEY)||'null')}catch(err){console.warn('Appointment call return state could not be read',err)}if(!pending?.id)return false;const age=Date.now()-(Number(pending.at)||0);if(age<350)return false;if(age>10*60*1000){try{sessionStorage.removeItem(APPOINTMENT_FOLLOWUP_CALL_RETURN_KEY)}catch{}return false}const entry=allAppointmentEntries().find(({appointment:a,sourceDate:s})=>calendarExportId(a,s)===pending.id&&s===pending.sourceDate);if(!entry){try{sessionStorage.removeItem(APPOINTMENT_FOLLOWUP_CALL_RETURN_KEY)}catch{}return false}try{sessionStorage.removeItem(APPOINTMENT_FOLLOWUP_CALL_RETURN_KEY)}catch{}if(pending.returnMode==='followups')openTodayFollowUpQueue();else switchView('scheduleView');updateAppointmentOutcome(pending.id,pending.sourceDate);return true}
function normalisedPhoneDigits(value=''){return String(value||'').replace(/\D/g,'').replace(/^61(?=4\d{8}$)/,'0')}
function appointmentMatchesProspect(a,p){
  if(a.prospectId&&String(a.prospectId)===String(p.id))return true;
  const appointmentPhone=normalisedPhoneDigits(a.contactNumber||a.phone),prospectPhone=normalisedPhoneDigits(primaryProspectPhone(p));
  if(appointmentPhone&&prospectPhone&&appointmentPhone===prospectPhone)return true;
  const name=cleanText(a.contactName||a.name,120).toLowerCase(),prospectName=cleanText(p.name,120).toLowerCase();
  const address=cleanText(a.address,240).toLowerCase(),prospectAddress=cleanText(p.address||p.company,240).toLowerCase();
  return Boolean(name&&prospectName&&name===prospectName&&address&&prospectAddress&&address===prospectAddress);
}
function listingAppointmentsForProspect(p){return allAppointmentEntries().filter(({appointment:a})=>appointmentType(a)==='LAP'&&appointmentMatchesProspect(a,p)).sort((a,b)=>appointmentTimestamp(a.appointment,a.sourceDate)-appointmentTimestamp(b.appointment,b.sourceDate))}
function latestListingAppointmentForProspect(p){const entries=listingAppointmentsForProspect(p);return entries.find(({appointment:a,sourceDate})=>appointmentTimestamp(a,sourceDate)>=Date.now())||entries.at(-1)||null}
function pipelineTimeframeForProspect(p){if(p.sellingTimeframe)return p.sellingTimeframe;return listingAppointmentsForProspect(p).some(({appointment})=>!appointmentOutcomeIsClosed(appointment.outcome))?'Now':''}
function sellerPipelineProspects(){return activeProspects().filter(p=>SELLING_TIMEFRAMES.includes(pipelineTimeframeForProspect(p)))}
function pipelineSortValue(p){if(pipelineSort==='recent')return -(Number(p.updatedAt)||0);if(pipelineSort==='name')return p.name.toLowerCase();return p.nextFollowUp||'9999-12-31'}
function filteredPipelineProspects(timeframe){
  const q=cleanText($('#prospectSearch')?.value||'',120).toLowerCase();
  let list=sellerPipelineProspects().filter(p=>pipelineTimeframeForProspect(p)===timeframe);
  if(pipelineTemperature!=='All')list=list.filter(p=>p.temperature===pipelineTemperature);
  if(q)list=list.filter(p=>[p.name,p.phone,p.email,p.address,p.suburb,p.source,p.stage,p.sellingTimeframe,...p.tags].join(' ').toLowerCase().includes(q));
  return list.sort((a,b)=>{const av=pipelineSortValue(a),bv=pipelineSortValue(b);return typeof av==='number'?av-bv:String(av).localeCompare(String(bv),'en-AU',{sensitivity:'base'})||a.name.localeCompare(b.name)});
}
function pipelineAppointmentLabel(p){const entry=latestListingAppointmentForProspect(p);if(!entry)return'';const a=entry.appointment,scheduled=appointmentScheduledDate(a,entry.sourceDate);return `Listing appointment · ${shortAppointmentDate(scheduled)}`}
function pipelineSellerCard(p){
  const initials=p.name.split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase(),address=formatProspectAddress(p.address||p.company,p.suburb)||'No property address',appointment=pipelineAppointmentLabel(p),role=prospectIsBuyerSeller(p)?'<span class="pipeline-buyer-seller-badge">Buyer + Seller</span>':'';
  return `<button class="pipeline-seller-row ${prospectIsBuyerSeller(p)?'is-buyer-seller':''}" type="button" data-open-prospect="${p.id}"><span class="prospect-avatar">${escapeHtml(initials||'P')}</span><span class="pipeline-seller-copy"><span class="pipeline-seller-name"><strong>${escapeHtml(p.name)}</strong>${role}</span><small>${escapeHtml(address)}</small><em class="${p.nextFollowUp&&p.nextFollowUp<=todayKey()?'due':''}">${escapeHtml(p.nextFollowUp?dueText(p):appointment||'No follow-up set')}</em>${appointment&&p.nextFollowUp?`<i>${escapeHtml(appointment)}</i>`:''}</span><span class="prospect-temp temp-${p.temperature.toLowerCase()}">${p.temperature}</span><b aria-hidden="true">›</b></button>`
}
function renderSellerPipeline(){
  const panel=$('#prospectorPipelinePanel');if(!panel)return;
  const sellers=sellerPipelineProspects();
  SELLING_TIMEFRAMES.forEach((timeframe,index)=>{const list=filteredPipelineProspects(timeframe),count=$(`#pipelineCount${index}`),target=$(`#pipelineList${index}`);if(count)count.textContent=list.length;if(target)target.innerHTML=list.length?list.map(pipelineSellerCard).join(''):`<div class="pipeline-empty"><strong>No sellers in ${escapeHtml(timeframe)}</strong><small>Qualify a contact into this timeframe to build the pipeline.</small></div>`});
  const total=$('#pipelineTotal');if(total)total.textContent=sellers.length;
  const meta=$('#pipelineTotalMeta');if(meta)meta.textContent=`${sellers.length} active seller${sellers.length===1?'':'s'} across your pipeline`;
  $$('.pipeline-summary-card').forEach((card,index)=>card.classList.toggle('active',filteredPipelineProspects(SELLING_TIMEFRAMES[index]).length>0));
}

const MARKET_PULSE_TYPES={
  'JUST LISTED':'Just Listed','NEW LISTING':'Just Listed','LISTED':'Just Listed',
  'WITHDRAWN':'Withdrawn','PRICE UPDATE':'Price Update','PRICE CHANGE':'Price Update','PRICE REDUCTION':'Price Update',
  'SOLD':'Sold','Under offer':'Under Offer','AUCTION RESULT':'Auction Result'
};
const STREET_TYPES={rd:'road',road:'road',st:'street',street:'street',ave:'avenue',av:'avenue',avenue:'avenue',cres:'crescent',cr:'crescent',crescent:'crescent',pde:'parade',parade:'parade',cl:'close',close:'close',pl:'place',place:'place',dr:'drive',drive:'drive',ct:'court',court:'court',ln:'lane',lane:'lane',hwy:'highway',highway:'highway',tce:'terrace',terrace:'terrace',cct:'circuit',circuit:'circuit',way:'way',blvd:'boulevard',boulevard:'boulevard',gr:'grove',grv:'grove',grove:'grove',rde:'road',sq:'square',square:'square',mews:'mews',esp:'esplanade',esplanade:'esplanade',pkway:'parkway',pkwy:'parkway',parkway:'parkway',trl:'trail',trail:'trail',prom:'promenade',promenade:'promenade'};
function cleanMarketLine(value=''){return cleanText(value,400).replace(/\u00a0/g,' ').replace(/[•·]/g,' · ').replace(/\s+/g,' ').trim()}
function normalisePlace(value=''){return cleanMarketLine(value).toLowerCase().replace(/\b(?:nsw|act|vic|qld|sa|wa|tas|nt)\b/g,' ').replace(/\b\d{4}\b/g,' ').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
function splitMarketAddress(value=''){
  const clean=cleanMarketLine(value).replace(/\s*[;,|]\s*/g,', ').replace(/\s*,\s*/g,', '),parts=clean.split(',').map(x=>x.trim()).filter(Boolean);
  if(parts.length<2)return{address:parts[0]||clean,suburb:''};
  const streetPartIndex=parts.findIndex(part=>normalisePlace(part).split(' ').some(word=>Boolean(STREET_TYPES[word])));
  if(streetPartIndex>=0){
    return{address:parts.slice(0,streetPartIndex+1).join(' '),suburb:parts[streetPartIndex+1]||''};
  }
  return{address:parts[0]||clean,suburb:parts[1]||''};
}
function marketStreetName(address=''){
  const words=normalisePlace(address).split(' ').filter(Boolean);if(!words.length)return'';
  let typeIndex=-1;
  for(let i=words.length-1;i>=0;i--){if(STREET_TYPES[words[i]]){typeIndex=i;break}}
  if(typeIndex<0)return'';
  const streetWords=words.slice(0,typeIndex+1);
  while(streetWords.length>1){
    const token=streetWords[0];
    if(/^(?:unit|u|lot|shop|suite|apt|apartment|villa|level|lvl|flat)$/.test(token)||/^(?:[a-z]?\d+[a-z]?)$/.test(token)){streetWords.shift();continue}
    break;
  }
  if(streetWords.length<2)return'';
  streetWords[streetWords.length-1]=STREET_TYPES[streetWords.at(-1)]||streetWords.at(-1);
  return streetWords.join(' ');
}
function marketStreetKey(address='',suburb=''){
  const street=marketStreetName(address),place=normalisePlace(suburb);
  return street&&place?`${street}|${place}`:'';
}
function marketPropertyKey(address='',suburb=''){
  const property=normalisePlace(address).split(' ').map(word=>STREET_TYPES[word]||word).join(' '),place=normalisePlace(suburb);
  return property&&place?`${property}|${place}`:'';
}
function normaliseMarketPulseEvents(list){
  return(Array.isArray(list)?list:[]).filter(x=>x&&typeof x==='object').map(x=>{
    const address=cleanText(x.address,240),suburb=cleanText(x.suburb,100),junk=/^(?:property image|logo)$/i;
    let agency=cleanText(x.agency,160),agents=[...new Set((Array.isArray(x.agents)?x.agents:[]).map(value=>cleanText(value,120)).filter(value=>value&&!junk.test(value)))].slice(0,4);
    if(junk.test(agency)){agency=agents.at(-1)||'';agents=agency?agents.slice(0,-1):agents}
    return{id:cleanText(x.id,160),eventType:cleanText(x.eventType,60),address,suburb,streetKey:marketStreetKey(address,suburb)||cleanText(x.streetKey,180),propertyKey:marketPropertyKey(address,suburb)||cleanText(x.propertyKey,320),receivedDate:validDateKey(x.receivedDate)?x.receivedDate:todayKey(),createdAt:Number(x.createdAt)||Date.now(),daysOnMarket:cleanText(x.daysOnMarket,80),price:cleanText(x.price,120),guide:cleanText(x.guide,120),propertyDetails:cleanText(x.propertyDetails,240),auctionDate:validDateKey(x.auctionDate)?x.auctionDate:'',auctionTime:/^([01]\d|2[0-3]):[0-5]\d$/.test(String(x.auctionTime||''))?String(x.auctionTime):'',auctionText:cleanText(x.auctionText,180),agency,agents,priceMovementAmount:cleanText(x.priceMovementAmount,80),priceMovementPercent:cleanText(x.priceMovementPercent,40),priceMovementDirection:['above','below'].includes(x.priceMovementDirection)?x.priceMovementDirection:'',priorPrice:cleanText(x.priorPrice,120),sessionStartedAt:Number(x.sessionStartedAt)||0,sessionCompletedAt:Number(x.sessionCompletedAt)||0,skippedProspectIds:[...new Set((Array.isArray(x.skippedProspectIds)?x.skippedProspectIds:[]).map(id=>cleanText(id,160)).filter(Boolean))]}
  }).filter(x=>x.id&&x.address&&x.streetKey&&x.propertyKey).filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).slice(-300)
}
function marketPulseKnockingEventEligible(event={}){
  return['just listed','listed','new listing','sold'].includes(normalisePlace(event.eventType))
}
function normaliseMarketPulseHistory(list=[]){
  const byId=new Map();
  for(const raw of Array.isArray(list)?list:[]){
    const event=normaliseMarketPulseEvents([raw])[0];
    if(!event||!marketPulseKnockingEventEligible(event))continue;
    const compact={id:event.id,eventType:event.eventType,address:event.address,suburb:event.suburb,streetKey:event.streetKey,propertyKey:event.propertyKey,receivedDate:event.receivedDate,createdAt:event.createdAt};
    byId.set(event.id,compact)
  }
  return[...byId.values()].sort((a,b)=>a.receivedDate.localeCompare(b.receivedDate)||(Number(a.createdAt)||0)-(Number(b.createdAt)||0)).slice(-180)
}
function prospectMarketKey(p){
  const candidates=[p.address,p.company].map(value=>cleanText(value,300)).filter(Boolean);
  for(const value of candidates){
    const parts=splitMarketAddress(value),key=marketStreetKey(parts.address,parts.suburb||p.suburb);
    if(key)return key;
  }
  return'';
}
function marketTriggeredFollowUp(event,prospectId){return prospectInteractions.find(x=>x.prospectId===prospectId&&x.marketFollowUpStatus==='triggered'&&x.marketFollowUpTriggeredEventId===event.id)||null}
function marketMatches(event){
  const eventKey=marketStreetKey(event.address,event.suburb)||event.streetKey;
  return activeProspects().filter(p=>primaryProspectPhone(p)&&prospectMarketKey(p)===eventKey&&!interactionsFor(p.id).some(x=>x.outcome==='Do not contact')).sort((a,b)=>Number(Boolean(marketTriggeredFollowUp(event,b.id)))-Number(Boolean(marketTriggeredFollowUp(event,a.id)))||prospectDueRank(a)-prospectDueRank(b)||(a.lastContact||'').localeCompare(b.lastContact||'')||a.name.localeCompare(b.name,'en-AU'))
}
function marketEventId(eventType,address,suburb,receivedDate=todayKey()){const eventDate=validDateKey(receivedDate)?receivedDate:todayKey();return`${eventDate}|${normalisePlace(eventType)}|${normalisePlace(address)}|${normalisePlace(suburb)}`}
function parseMarketMoney(value=''){
  const raw=cleanMarketLine(value).replace(/,/g,'').replace(/^\$\s*/,'').trim(),match=raw.match(/(-?\d+(?:\.\d+)?)\s*([kKmM])?/);if(!match)return 0;
  const base=Number(match[1]);if(!Number.isFinite(base))return 0;const multiplier=(match[2]||'').toLowerCase()==='m'?1000000:(match[2]||'').toLowerCase()==='k'?1000:1;return Math.round(base*multiplier);
}
function formatMarketMoney(value){const amount=Math.round(Number(value)||0);if(!amount)return'';return amount>=1000000?`$${(amount/1000000).toFixed(amount%1000000?3:0).replace(/0+$/,'').replace(/\.$/,'')}M`:amount>=1000?`$${Math.round(amount/1000)}k`:`$${amount.toLocaleString('en-AU')}`}
function parseMarketPriceLine(line='',eventType=''){
  const clean=cleanMarketLine(line),main=(clean.match(/(?:Guide\s*:\s*)?(\$\s*[\d,.]+\s*[kKmM]?)/i)||[])[1]||'',movement=clean.match(/\(([+-])\s*\$?\s*([\d,.]+\s*[kKmM]?)\s*\/\s*([+-]?\d+(?:\.\d+)?)%\)/i),price=main?main.replace(/\s+/g,'').replace(/^\$(?=\d)/,'$'):'',isGuide=/\bguide\b/i.test(clean)||String(eventType).toLowerCase()==='price update';
  let priceMovementAmount='',priceMovementPercent='',priceMovementDirection='',priorPrice='';
  if(movement){const sign=movement[1],amountValue=parseMarketMoney(movement[2]),percent=Math.abs(Number(movement[3])||0);priceMovementAmount=formatMarketMoney(amountValue);priceMovementPercent=percent?`${percent}%`:'';priceMovementDirection=sign==='+'?'above':'below';const current=parseMarketMoney(price),prior=sign==='+'?current-amountValue:current+amountValue;priorPrice=formatMarketMoney(prior)}
  return{price:isGuide?'':price,guide:isGuide?price:'',priceMovementAmount,priceMovementPercent,priceMovementDirection,priorPrice};
}
function parseMarketAuctionDetails(lines=[],receivedDate=todayKey()){
  const auctionText=cleanText((Array.isArray(lines)?lines:[]).find(line=>/\bauction\b/i.test(line)&&!/^auction result\b/i.test(line))||'',180);
  if(!auctionText)return{auctionDate:'',auctionTime:'',auctionText:''};
  let auctionDate='',auctionTime='';
  const numeric=auctionText.match(/\b([0-3]?\d)[\/-]([01]?\d)(?:[\/-](\d{2,4}))?\b/),named=auctionText.match(/\b([0-3]?\d)(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s+(\d{4}))?\b/i);
  const base=validDateKey(receivedDate)?parseKey(receivedDate):new Date(),months=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  let day=0,month=-1,year=base.getFullYear();
  if(numeric){day=Number(numeric[1]);month=Number(numeric[2])-1;if(numeric[3])year=Number(numeric[3].length===2?`20${numeric[3]}`:numeric[3])}
  else if(named){day=Number(named[1]);month=months.indexOf(named[2].slice(0,3).toLowerCase());if(named[3])year=Number(named[3])}
  if(day>0&&month>=0&&month<12){let parsed=new Date(year,month,day);if(!numeric?.[3]&&!named?.[3]&&parsed.getTime()<base.getTime()-45*86400000)parsed=new Date(year+1,month,day);if(parsed.getFullYear()>=base.getFullYear()&&parsed.getFullYear()<=base.getFullYear()+2&&parsed.getMonth()===month&&parsed.getDate()===day)auctionDate=dateKey(parsed)}
  const time=auctionText.match(/\b(\d{1,2})(?::([0-5]\d))?\s*(am|pm)\b/i)||auctionText.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if(time){let hours=Number(time[1]),minutes=Number(time[2]||0);if(time[3]){const meridiem=time[3].toLowerCase();if(meridiem==='pm'&&hours<12)hours+=12;if(meridiem==='am'&&hours===12)hours=0}if(hours>=0&&hours<24)auctionTime=`${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`}
  return{auctionDate,auctionTime,auctionText};
}
function marketAuctionLabel(event={}){
  if(!event.auctionDate)return cleanText(event.auctionText,180);
  const date=parseKey(event.auctionDate).toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'}),time=event.auctionTime?new Date(`${event.auctionDate}T${event.auctionTime}`).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'}):'';
  return`Auction ${date}${time?` at ${time}`:''}`
}
function parseMarketPulse(text='',receivedDate=todayKey()){
  const eventDate=validDateKey(receivedDate)?receivedDate:todayKey(),lines=String(text||'').split(/\r?\n/).map(cleanMarketLine).filter(Boolean),events=[];
  const isTypeLine=line=>{const upper=line.toUpperCase();return Object.keys(MARKET_PULSE_TYPES).some(key=>upper===key||upper.startsWith(key+' ')||upper.includes(' '+key+' '))};
  for(let i=0;i<lines.length;i++){
    const upper=lines[i].toUpperCase(),typeKey=Object.keys(MARKET_PULSE_TYPES).find(key=>upper===key||upper.startsWith(key+' ')||upper.includes(' '+key+' '));if(!typeKey)continue;
    const eventType=MARKET_PULSE_TYPES[typeKey],nextTypeIndex=lines.findIndex((line,index)=>index>i&&isTypeLine(line)),blockEnd=nextTypeIndex>i?nextTypeIndex:lines.length,block=lines.slice(i+1,blockEnd);
    const addressIndex=block.findIndex(candidate=>/\d/.test(candidate)&&candidate.includes(',')&&!/\b(?:bed|bath|car|land|days active|guide|price)\b/i.test(candidate));if(addressIndex<0)continue;
    const addressLine=block[addressIndex],{address,suburb}=splitMarketAddress(addressLine),streetKey=marketStreetKey(address,suburb);if(!streetKey||!suburb)continue;
    const afterAddress=block.slice(addressIndex+1),propertyDetails=afterAddress.find(line=>/\bbed\b/i.test(line)&&/\bbath\b/i.test(line))||'';
    const priceIndex=afterAddress.findIndex(line=>/\$\s*[\d,.]+\s*[kKmM]?/i.test(line)||/^contact agent$/i.test(line));const priceLine=priceIndex>=0&&!/^contact agent$/i.test(afterAddress[priceIndex])?afterAddress[priceIndex]:'';const priceData=parseMarketPriceLine(priceLine,eventType);
    const activeMatch=lines[i].match(/(\d+)\s+days?\s+active/i)||afterAddress.join(' ').match(/(\d+)\s+days?\s+active/i);const daysOnMarket=activeMatch?`${activeMatch[1]} days active`:'';const auctionData=parseMarketAuctionDetails(afterAddress,eventDate);
    const peopleAndAgency=(priceIndex>=0?afterAddress.slice(priceIndex+1):[]).filter(line=>!/^(?:property image|logo)$/i.test(line)&&!/^auction\b/i.test(line));const agency=peopleAndAgency.length?peopleAndAgency.at(-1):'';const agents=peopleAndAgency.slice(0,-1);
    events.push({id:marketEventId(eventType,address,suburb,eventDate),eventType,address,suburb,streetKey,propertyKey:marketPropertyKey(address,suburb),receivedDate:eventDate,createdAt:Date.now(),daysOnMarket,propertyDetails,agency,agents,...auctionData,...priceData});
  }
  return normaliseMarketPulseEvents(events);
}
function normaliseForwardedMarketPulseText(value=''){
  const lines=[];
  for(const raw of String(value||'').split(/\r?\n/)){
    const line=cleanMarketLine(raw.replace(/<https?:\/\/[^>]+>/gi,'').replace(/\[https?:\/\/[^\]]+\]/gi,''));
    if(!line)continue;
    if(/^attention\s*:/i.test(line))break;
    if(/^_{3,}$/.test(line)||/^\[(?:property image|logo|guiding you home)\]$/i.test(line))continue;
    lines.push(line);
  }
  return lines.join('\n');
}
function latestMarketPulseEventDate(events=[]){return normaliseMarketPulseEvents(events).reduce((latest,event)=>event.receivedDate>latest?event.receivedDate:latest,'')}
function marketFollowUpTriggerLabel(trigger=''){return{sold:'Sold',price:'Price change',auction:'Auction date',withdrawn:'Withdrawn',any:'All updates'}[trigger]||''}
function marketFollowUpEventReason(event={}){
  const type=normalisePlace(event.eventType),value=event.price||event.guide,movement=marketMovementLabel(event),auction=marketAuctionLabel(event);
  if(type==='price update')return[`Price updated${value?` to ${value}`:''}`,movement,auction].filter(Boolean).join(' · ');
  if(type==='sold'||type==='auction result')return[`${event.eventType}${value?` for ${value}`:''}`,movement,auction].filter(Boolean).join(' · ');
  return[event.eventType,value?`${event.guide?'Guide':'Price'} ${value}`:'',auction].filter(Boolean).join(' · ')
}
function marketFollowUpEventMatches(interaction,event){
  if(interaction.marketFollowUpStatus!=='pending'||!interaction.marketFollowUpTrigger||!interaction.marketPropertyKey||interaction.marketPropertyKey!==(event.propertyKey||marketPropertyKey(event.address,event.suburb))||interaction.marketFollowUpSourceEventId===event.id||event.receivedDate<interaction.date)return false;
  const type=normalisePlace(event.eventType),trigger=interaction.marketFollowUpTrigger;
  if(trigger==='sold')return type==='sold'||type==='auction result';
  if(trigger==='price')return type==='price update';
  const auctionChanged=Boolean(event.auctionDate&&event.auctionDate!==interaction.marketFollowUpOriginalAuctionDate);
  if(trigger==='auction')return auctionChanged;
  if(trigger==='withdrawn')return type==='withdrawn';
  if(trigger==='any')return true; // Every later MarketPulse update, including Withdrawn.
  return false
}
function applyMarketFollowUpTriggers(events=[]){
  const incoming=normaliseMarketPulseEvents(events);let count=0;
  prospectInteractions=prospectInteractions.map(interaction=>{
    if(interaction.marketFollowUpStatus!=='pending')return interaction;
    const p=prospectById(interaction.prospectId);if(!p||p.archived||interactionsFor(p.id).some(x=>x.outcome==='Do not contact'))return interaction;
    const event=incoming.find(item=>marketFollowUpEventMatches(interaction,item));if(!event)return interaction;
    count++;return{...interaction,marketFollowUpStatus:'triggered',marketFollowUpTriggeredEventId:event.id,marketFollowUpTriggeredAt:Date.now(),marketFollowUpTriggeredReason:marketFollowUpEventReason(event)}
  });
  return count
}
function marketFollowUpPrompt(event,prospectId){
  const interaction=marketTriggeredFollowUp(event,prospectId);if(!interaction)return null;
  return{interaction,title:'Market follow-up',reason:interaction.marketFollowUpTriggeredReason||marketFollowUpEventReason(event),context:interaction.note?`Previous note: “${interaction.note}”`:`You spoke with this client when ${interaction.marketFollowUpAddress||event.address} was ${String(interaction.marketFollowUpSourceEventType||'updated').toLowerCase()}.`}
}
function retireEarlierMarketFollowUps(prospectId,propertyKey){
  if(!prospectId||!propertyKey)return;
  prospectInteractions=prospectInteractions.map(item=>item.prospectId===prospectId&&item.marketPropertyKey===propertyKey&&item.marketFollowUpStatus==='pending'?{...item,marketFollowUpTrigger:'',marketFollowUpStatus:''}:item)
}
function closeReplacedMarketPulseSession(){const eventId=cleanText(prospectSessionContext?.eventId,160);if(!eventId||marketPulseEvents.some(event=>event.id===eventId))return false;prospectSessionActive=false;prospectSessionIds=[];prospectSessionIndex=0;prospectSessionStats={calls:0,connects:0,temperate:0,appointments:0,sms:0};prospectSessionContext=null;clearProspectingSessionState();saveHotSpotSmsPending(null);return true}
function mergeParsedMarketPulseEvents(parsed=[]){
  const incoming=normaliseMarketPulseEvents(parsed),existing=normaliseMarketPulseEvents(marketPulseEvents),incomingDate=latestMarketPulseEventDate(incoming),existingDate=latestMarketPulseEventDate(existing);
  if(!incoming.length)return{incomingCount:0,appliedCount:0,newCount:0,refreshedCount:0,replacedCount:0,activeDate:existingDate,ignoredAsStale:false};
  if(existingDate&&incomingDate<existingDate)return{incomingCount:incoming.length,appliedCount:0,newCount:0,refreshedCount:0,replacedCount:0,activeDate:existingDate,ignoredAsStale:true};
  const activeDate=incomingDate||existingDate,activeExisting=existing.filter(event=>event.receivedDate===activeDate),applicable=incoming.filter(event=>event.receivedDate===activeDate),existingById=new Map(activeExisting.map(event=>[event.id,event])),fresh=applicable.filter(event=>!existingById.has(event.id));
  applicable.forEach(event=>{const current=existingById.get(event.id);existingById.set(event.id,current?{...current,...event,sessionStartedAt:current.sessionStartedAt,sessionCompletedAt:current.sessionCompletedAt,skippedProspectIds:current.skippedProspectIds}:event)});
  marketPulseHistory=normaliseMarketPulseHistory([...marketPulseHistory,...existing,...applicable]);
  marketPulseEvents=normaliseMarketPulseEvents([...existingById.values()]);
  const triggeredFollowUps=applyMarketFollowUpTriggers(applicable);
  const buyerMatchesChanged=refreshBuyerPropertyMatches(applicable);
  const closedPreviousSession=closeReplacedMarketPulseSession();
  return{incomingCount:incoming.length,appliedCount:applicable.length,newCount:fresh.length,refreshedCount:applicable.length-fresh.length,replacedCount:Math.max(0,existing.length-activeExisting.length),activeDate,ignoredAsStale:false,closedPreviousSession,triggeredFollowUps,buyerMatchesChanged};
}
function marketTypeClass(type=''){return normalisePlace(type).replace(/\s+/g,'-')}

function relativeEventRecency(event){const raw=validDateKey(event?.receivedDate)?parseKey(event.receivedDate):new Date(Number(event?.createdAt)||Date.now()),days=Math.max(0,Math.floor((parseKey(todayKey())-raw)/86400000));return{days,label:days===0?'Today':days===1?'Yesterday':`${days} days ago`}}
function hotSpottingPriority(event,neighbourCount=0){const weights={'withdrawn':46,'just listed':42,'sold':38,'auction result':36,'price update':30,'price changed':30,'under offer':24},recency=relativeEventRecency(event),score=(weights[normalisePlace(event?.eventType)]||18)+Math.max(0,18-recency.days*3)+Math.min(24,neighbourCount*3);return{score,label:score>=72?'High':score>=50?'Medium':'Standard'}}
function estimatedMinutes(count,secondsEach=150){return Math.max(0,Math.ceil(Math.max(0,count)*secondsEach/60))}
function formatEstimatedTime(minutes){if(minutes<=0)return'< 1 min';if(minutes<60)return`~${minutes} min`;const h=Math.floor(minutes/60),m=minutes%60;return`~${h}h${m?` ${m}m`:''}`}
function currentCallStreakSummary(){const calls=prospectInteractions.filter(x=>x.type==='Call'&&x.date===todayKey()).sort((a,b)=>Number(a.at)-Number(b.at));if(!calls.length)return{count:0,meta:'Make the first call'};let count=1;for(let i=calls.length-1;i>0;i--){if(Number(calls[i].at)-Number(calls[i-1].at)>20*60000)break;count++}return{count,meta:count===1?'Streak started':`${count} calls inside 20-minute rhythm`}}
function prospectLiveInsight({overdue=0,due=0,hot=0,remainingPipeline=0,hotSpottingReady=0}={}){const todayCalls=prospectInteractions.filter(x=>x.type==='Call'&&x.date===todayKey()),connects=todayCalls.filter(x=>PROSPECT_CONNECTED_OUTCOMES.has(x.outcome)).length,rate=todayCalls.length?Math.round(connects/todayCalls.length*100):0;if(overdue)return`${overdue} overdue follow-up${overdue===1?' is':'s are'} the clearest risk. Clear ${Math.min(overdue,3)} before adding new work.`;if(hotSpottingReady)return`${hotSpottingReady} nearby contact${hotSpottingReady===1?' is':'s are'} tied to live market events. Work the highest-priority street first.`;if(remainingPipeline)return`${remainingPipeline} pipeline contact${remainingPipeline===1?' remains':'s remain'}. ${todayCalls.length?`Your live connect rate is ${rate}%.`:'Start with the hottest seller.'}`;if(hot)return`${hot} Hot prospect${hot===1?' is':'s are'} active. Protect the next action while momentum is high.`;if(due)return`${due} follow-up${due===1?' is':'s are'} due today. Complete them before the day closes.`;return todayCalls.length?`${todayCalls.length} calls logged with a ${rate}% connect rate. Keep the rhythm while the database is warm.`:'Start with one purposeful call. AGNT will refine the next move from the result.'}
function streetConversationCount(events=[],prospectIds=[]){const ids=new Set(prospectIds.length?prospectIds:events.flatMap(event=>marketMatches(event).map(p=>p.id)));return prospectInteractions.filter(x=>ids.has(x.prospectId)&&x.type==='Call'&&!events.some(event=>x.marketEventId===event.id)).length}

function marketSessionProgress(event,matches=marketMatches(event)){
  const matchIds=new Set(matches.map(p=>p.id)),calls=prospectInteractions.filter(x=>x.type==='Call'&&x.marketEventId===event.id&&matchIds.has(x.prospectId)),messages=prospectInteractions.filter(x=>x.type==='SMS'&&x.marketEventId===event.id&&matchIds.has(x.prospectId));
  const calledIds=new Set(calls.map(x=>x.prospectId)),smsIds=new Set(messages.map(x=>x.prospectId)),skippedIds=new Set((event.skippedProspectIds||[]).filter(id=>matchIds.has(id))),workedIds=new Set([...calledIds,...smsIds,...skippedIds]),connectedIds=new Set(calls.filter(x=>PROSPECT_CONNECTED_OUTCOMES.has(x.outcome)).map(x=>x.prospectId)),followUpIds=new Set(calls.filter(x=>validDateKey(x.nextFollowUp)).map(x=>x.prospectId));
  const complete=Boolean(event.sessionCompletedAt),active=Boolean(event.sessionStartedAt)&&!complete;
  return{total:matches.length,called:Math.min(calledIds.size,matches.length),sms:Math.min(smsIds.size,matches.length),skipped:Math.min(skippedIds.size,matches.length),connects:connectedIds.size,followUps:followUpIds.size,active,complete,workedIds};
}
function marketMovementLabel(event){if(!event?.priceMovementDirection)return'';const eventType=normalisePlace(event.eventType),amount=event.priceMovementAmount?`${event.priceMovementAmount} `:'',percent=event.priceMovementPercent?` · ${event.priceMovementPercent} ${event.priceMovementDirection}`:'';if(eventType==='price update')return`reduced ${amount}from prior guide${percent}`;return`sold ${amount}${event.priceMovementDirection} asking${percent}`}
function marketEventDetailHtml(event){const primary=event.price||event.guide,movement=marketMovementLabel(event),prior=event.priorPrice?`${event.guide?'Prior guide':'Asking'} ${event.priorPrice}`:'',auction=marketAuctionLabel(event),meta=[prior,auction,event.daysOnMarket,event.agency].filter(Boolean);if(!primary&&!movement&&!event.propertyDetails&&!meta.length)return'';return`<div class="market-pulse-event-data">${primary?`<strong>${escapeHtml(primary)}${event.guide?' guide':' sold'}</strong>`:''}${movement?`<span class="market-price-movement market-price-${escapeHtml(event.priceMovementDirection)}">${escapeHtml(movement)}</span>`:''}${event.propertyDetails?`<small>${escapeHtml(event.propertyDetails)}</small>`:''}${meta.length?`<small>${meta.map(escapeHtml).join(' · ')}</small>`:''}</div>`}
function marketPulseCardHeadingMarkup(event){return`<div class="market-pulse-card-head"><span class="market-event-tag event-${marketTypeClass(event.eventType)}">${escapeHtml(event.eventType)}</span><button type="button" data-remove-market-event="${escapeHtml(event.id)}" aria-label="Remove ${escapeHtml(event.address)}">×</button></div><div class="market-pulse-card-title"><h4>${escapeHtml(event.address)}</h4><p>${escapeHtml(event.suburb)}</p></div>`}
function renderMarketPulseReview(){
  const list=$('#marketReviewList');if(!list)return;const model=dailyBriefingMarketModel(),all=marketBriefingRows(model),filters={listed:row=>row.bucket==='listed',sold:row=>row.bucket==='sold',price:row=>row.bucket==='price',other:row=>row.bucket==='other'},rows=marketReviewFilter==='all'?all:all.filter(filters[marketReviewFilter]||(()=>true)),date=$('#marketReviewDate'),status=$('#marketReviewStatus'),summary=$('#marketReviewOpportunitySummary'),counts=$('#marketReviewCounts');
  if(date)date.textContent=model.events.length?`${model.fresh?'Today':dailyBriefingDateLabel(model.activeDate)} · ${model.suburbCount} suburb${model.suburbCount===1?'':'s'}`:'Daily property intelligence';
  if(status){status.textContent=model.statusLabel;status.dataset.state=model.statusState}
  if(summary)summary.textContent=model.debrief;
  if(counts)counts.innerHTML=[['Listed',model.listed],['Sold',model.sold],['Price',model.price],['Other',model.other]].map(([label,value])=>`<span><strong>${value}</strong>${label}</span>`).join('');
  $$('[data-market-review-filter]').forEach(button=>{const active=button.dataset.marketReviewFilter===marketReviewFilter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
  list.innerHTML=rows.length?rows.map(row=>marketBriefingRowMarkup(row)).join(''):`<div class="prospect-empty"><strong>${all.length?'No events in this filter':'No MarketPulse changes yet'}</strong><small>${all.length?'Choose another event type.':'AGNT will populate this briefing from the existing MarketPulse feed.'}</small></div>`;
}
function renderMarketPulse(){
  renderMarketPulseReview();
  const list=$('#marketPulseList');if(!list)return;
  const events=normaliseMarketPulseEvents(marketPulseEvents).sort((a,b)=>{const ap=hotSpottingPriority(a,marketMatches(a).length),bp=hotSpottingPriority(b,marketMatches(b).length);return bp.score-ap.score||b.createdAt-a.createdAt}),matched=events.reduce((n,event)=>n+marketMatches(event).length,0),remaining=events.reduce((n,event)=>{const matches=marketMatches(event),progress=marketSessionProgress(event,matches);return n+Math.max(0,progress.total-progress.workedIds.size)},0);
  $('#marketPulseEventCount').textContent=events.length;
  $('#marketPulseMatchSummary').textContent=events.length?`${events.length} market event${events.length===1?'':'s'} · ${matched} matching contact${matched===1?'':'s'}`:'Paste an email to find matching contacts.';
  const readyCount=$('#hotSpottingReadyCount'),readyLabel=$('#hotSpottingReadyLabel');if(readyCount)readyCount.textContent=remaining;if(readyLabel)readyLabel.textContent=remaining===1?'client ready':'clients ready';
  list.innerHTML=events.length?events.map(event=>{
    const matches=marketMatches(event),progress=marketSessionProgress(event,matches),eventRemaining=Math.max(0,progress.total-progress.workedIds.size),marketFollowUps=matches.filter(person=>marketTriggeredFollowUp(event,person.id)).length,recency=relativeEventRecency(event),priority=hotSpottingPriority(event,matches.length),buttonLabel=progress.active?'Active Session':'Start Session',buttonClass=progress.active?'primary market-session-active-btn':'primary market-session-start-btn',bulkSmsReady=marketPulseBulkSmsHasMobile(event.id),details=`${marketEventDetailHtml(event)}${marketFollowUps?`<div class="market-followup-ready"><strong>${marketFollowUps}</strong><span>requested market follow-up${marketFollowUps===1?'':'s'} ready first</span></div>`:''}<div class="hotspot-opportunity-summary"><span><strong>${eventRemaining}</strong> remaining</span><span><strong>${formatEstimatedTime(estimatedMinutes(eventRemaining))}</strong> session</span><span class="priority-${priority.label.toLowerCase()}"><strong>${priority.label}</strong> priority</span><span><strong>${recency.label}</strong> event</span></div>`;
    if(progress.complete){const completionMeta=[`${progress.called} call${progress.called===1?'':'s'}`,`${progress.sms} SMS`,progress.skipped?`${progress.skipped} skipped`:''].filter(Boolean).join(' · ');return`<article class="market-pulse-card market-session-complete-card" data-market-event-id="${escapeHtml(event.id)}">${marketPulseCardHeadingMarkup(event)}<details class="market-pulse-completed-disclosure"><summary><span><strong>Completed</strong><small>${completionMeta}</small></span><i aria-hidden="true">›</i></summary><div class="market-pulse-card-content">${details}</div></details></article>`}
    return`<article class="market-pulse-card${progress.active?' market-session-active-card':''}" data-market-event-id="${escapeHtml(event.id)}">${marketPulseCardHeadingMarkup(event)}<div class="market-pulse-card-content">${details}<div class="market-pulse-card-actions"><button class="${buttonClass}" type="button" data-start-market-session="${escapeHtml(event.id)}" ${matches.length?'':'disabled'}>${matches.length?buttonLabel:'No Matching Contacts'}</button><button class="secondary market-bulk-sms-btn" type="button" data-market-bulk-sms="${escapeHtml(event.id)}" aria-label="Open Bulk SMS" title="Bulk SMS" ${bulkSmsReady?'':'disabled'}>${bulkSmsMessageIconMarkup()}</button><button class="secondary market-session-skip-btn" type="button" data-skip-market-session="${escapeHtml(event.id)}" aria-label="Skip and complete Hot Spotting session for ${escapeHtml(event.address)}">Skip</button></div></div></article>`
  }).join(''):'<div class="prospect-empty"><strong>No hot spotting opportunities yet</strong><small>Paste today’s email below, then tap Find Opportunities.</small></div>';
}
async function importMarketPulse(){const input=$('#marketPulseInput'),parsed=parseMarketPulse(input?.value||'');if(!parsed.length){$('#marketPulseImportStatus').textContent='No supported property events were found. Paste the full email text, including event labels and addresses.';return toast('No market events found')}const merged=mergeParsedMarketPulseEvents(parsed);saveLocal();renderMarketPulse();$('#marketPulseImportStatus').textContent=`${merged.newCount} new event${merged.newCount===1?'':'s'} imported${merged.refreshedCount?` · ${merged.refreshedCount} existing event${merged.refreshedCount===1?'':'s'} refreshed`:''}.`;try{await queueProspectingSave()}catch(err){console.error('Hot Spotting sync failed',err)}toast(merged.newCount?'Hot Spotting imported':'Hot Spotting refreshed')}
function normaliseMarketPulseEmail(value=''){const match=String(value||'').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);return(match?.[0]||'').trim().toLowerCase()}
function marketPulseTimestampMillis(value){if(typeof value?.toMillis==='function')return value.toMillis();if(value instanceof Date)return value.getTime();const numeric=Number(value);if(Number.isFinite(numeric)&&numeric>0)return numeric;const parsed=Date.parse(String(value||''));return Number.isFinite(parsed)?parsed:0}
function formatMarketPulseImportTime(value){const at=marketPulseTimestampMillis(value);if(!at)return'';try{return new Intl.DateTimeFormat('en-AU',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}).format(new Date(at))}catch{return''}}
function applyMarketPulseAutomationProfile(profile={}){
  const email=normaliseMarketPulseEmail(currentUser?.email),lastImportedAt=marketPulseTimestampMillis(profile.marketPulseLastImportedAt),error=cleanText(profile.marketPulseLastImportError||'',240),profileState=String(profile.marketPulseLastImportState||'');
  const profileAutomation={state:profileState==='error'?'error':lastImportedAt?'live':cloud?'waiting':'unavailable',email,lastImportedAt,lastImportedDate:validDateKey(profile.marketPulseLastImportedDate)?profile.marketPulseLastImportedDate:'',lastImportedCount:Math.max(0,Number(profile.marketPulseLastImportedCount)||0),lastImportedNewCount:Math.max(0,Number(profile.marketPulseLastImportedNewCount)||0),error};
  marketPulseAutomation=marketPulseAutomation.state==='processing'&&profileAutomation.lastImportedAt<=marketPulseAutomation.lastImportedAt?{...profileAutomation,state:'processing'}:profileAutomation;
  renderMarketPulseAutomationSettings();
}
function renderMarketPulseAutomationSettings(){
  const status=$('#marketPulseAutomationStatus'),email=$('#marketPulseAutomationEmail'),detail=$('#marketPulseAutomationDetail'),destination=$('#marketPulseAutomationDestination');if(!status||!email||!detail||!destination)return;
  const accountEmail=normaliseMarketPulseEmail(currentUser?.email),state=marketPulseAutomation.state,awaitingToday=Boolean(marketPulseAutomation.lastImportedAt&&marketPulseAutomation.lastImportedDate&&marketPulseAutomation.lastImportedDate<todayKey()),visualState=state==='live'&&awaitingToday?'waiting':state;
  email.textContent=accountEmail||'Sign in to connect';destination.textContent=MARKET_PULSE_INBOX_ADDRESS;
  status.dataset.state=visualState;
  if(!cloud){status.textContent='Unavailable in device-only mode';detail.textContent='Sign in to receive automatic Hot Spotting updates.';return}
  if(state==='processing'){status.textContent='Importing MarketPulse';detail.textContent='Matching today’s market activity to your contacts…';return}
  if(state==='error'){status.textContent='Import needs attention';detail.textContent=marketPulseAutomation.error||'The last forwarded email could not be imported.';return}
  if(marketPulseAutomation.lastImportedAt){const when=formatMarketPulseImportTime(marketPulseAutomation.lastImportedAt),count=marketPulseAutomation.lastImportedCount;if(awaitingToday){status.textContent='Awaiting today’s MarketPulse';detail.textContent=`Last successful import ${when||'previously'} · previous Hot Spotting remains available until a valid new email arrives.`;return}status.textContent='Connected';detail.textContent=`Last import ${when||'recently'} · ${count} event${count===1?'':'s'}.`;return}
  status.textContent='Ready';detail.textContent='Waiting for the first forwarded MarketPulse email. Daily check runs around 6:00 am Sydney time.';
}
async function registerMarketPulseForwardingIdentity(profile={}){
  const email=normaliseMarketPulseEmail(currentUser?.email);if(!cloud||!db||!uid||!email||marketPulseIdentityRegistrationPending)return;
  if(normaliseMarketPulseEmail(profile.marketPulseForwardEmail)===email&&Number(profile.marketPulseAutomationVersion)===1)return;
  marketPulseIdentityRegistrationPending=true;
  try{await setDoc(doc(db,'users',uid),{email:currentUser?.email||email,marketPulseForwardEmail:email,marketPulseAutomationVersion:1,marketPulseAutomationRegisteredAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true})}
  catch(err){console.error('MarketPulse forwarding identity registration failed',err);marketPulseAutomation={...marketPulseAutomation,state:'error',email,error:'Forwarding email registration could not sync.'};renderMarketPulseAutomationSettings()}
  finally{marketPulseIdentityRegistrationPending=false}
}
function marketPulseInboxIdentityError(data={}){
  const account=normaliseMarketPulseEmail(currentUser?.email),forwardedFrom=normaliseMarketPulseEmail(data.forwardedFrom),originalTo=normaliseMarketPulseEmail(data.originalTo),originalFrom=normaliseMarketPulseEmail(data.originalFrom),subject=cleanText(data.originalSubject,200).toLowerCase();
  if(!account||forwardedFrom!==account||originalTo!==account)return'The forwarding address did not match this AGNT login.';
  if(originalFrom!==MARKET_PULSE_SOURCE_ADDRESS||subject!==MARKET_PULSE_SUBJECT.toLowerCase())return'The email did not match the approved MarketPulse sender and subject.';
  return'';
}
async function failMarketPulseInboxImport(item,error,{clearBody=false,userUid=uid}={}){
  if(!cloud||!db||uid!==userUid||currentUser?.uid!==userUid)return;
  const message=cleanText(error||'MarketPulse import failed.',240),batch=writeBatch(db);batch.set(item.ref,{status:'failed',error:message,failedAt:serverTimestamp(),...(clearBody?{plainText:''}:{})},{merge:true});batch.set(doc(db,'users',userUid),{marketPulseLastImportState:'error',marketPulseLastImportError:message,updatedAt:serverTimestamp()},{merge:true});await batch.commit();marketPulseAutomation={...marketPulseAutomation,state:'error',email:normaliseMarketPulseEmail(currentUser?.email),error:message};renderMarketPulseAutomationSettings();
}
async function processMarketPulseInboxDocument(item){
  if(!cloud||!db||!uid||uid==='local')return;const processingUid=uid,data=item.data(),identityError=marketPulseInboxIdentityError(data);if(identityError){await failMarketPulseInboxImport(item,identityError,{clearBody:true,userUid:processingUid});return}
  const receivedDate=validDateKey(data.receivedDate)?data.receivedDate:todayKey(),text=normaliseForwardedMarketPulseText(data.plainText||''),parsed=parseMarketPulse(text,receivedDate);if(!parsed.length){await failMarketPulseInboxImport(item,'No supported property events were found in the forwarded email.',{userUid:processingUid});return}
  marketPulseAutomation={...marketPulseAutomation,state:'processing',email:normaliseMarketPulseEmail(currentUser?.email),error:''};renderMarketPulseAutomationSettings();
  const merged=mergeParsedMarketPulseEvents(parsed);
  if(merged.ignoredAsStale){const batch=writeBatch(db);batch.set(item.ref,{status:'processed',plainText:'',error:'',processedAt:serverTimestamp(),eventCount:merged.incomingCount,newEventCount:0,refreshedEventCount:0,replacedEventCount:0,ignoredAsStale:true,activeDate:merged.activeDate},{merge:true});await batch.commit();marketPulseAutomation={...marketPulseAutomation,state:marketPulseAutomation.lastImportedAt?'live':'waiting',error:''};renderMarketPulseAutomationSettings();return}
  saveLocal();renderMarketPulse();renderProspecting();renderAppointments();await saveProspecting({render:false});
  if(!cloud||uid!==processingUid||currentUser?.uid!==processingUid)return;
  const batch=writeBatch(db);batch.set(item.ref,{status:'processed',plainText:'',error:'',processedAt:serverTimestamp(),eventCount:merged.appliedCount,newEventCount:merged.newCount,refreshedEventCount:merged.refreshedCount,replacedEventCount:merged.replacedCount,ignoredAsStale:false,activeDate:merged.activeDate},{merge:true});batch.set(doc(db,'users',processingUid),{marketPulseLastImportState:'success',marketPulseLastImportError:'',marketPulseLastImportedAt:serverTimestamp(),marketPulseLastImportedDate:merged.activeDate,marketPulseLastImportedCount:merged.appliedCount,marketPulseLastImportedNewCount:merged.newCount,marketPulseLastMessageId:cleanText(data.messageId||item.id,180),updatedAt:serverTimestamp()},{merge:true});await batch.commit();
  marketPulseAutomation={state:'live',email:normaliseMarketPulseEmail(currentUser?.email),lastImportedAt:Date.now(),lastImportedDate:merged.activeDate,lastImportedCount:merged.appliedCount,lastImportedNewCount:merged.newCount,error:''};renderMarketPulseAutomationSettings();refreshReturningSnapshotIfVisible();if(merged.newCount)toast(`Hot Spotting updated · ${merged.newCount} new event${merged.newCount===1?'':'s'}`);
}
function enqueueMarketPulseInboxDocuments(items=[]){
  const pending=items.filter(item=>!marketPulseInboxQueuedIds.has(item.id)).sort((a,b)=>marketPulseTimestampMillis(a.data().receivedAt)-marketPulseTimestampMillis(b.data().receivedAt));if(!pending.length)return;
  const processingUid=uid;pending.forEach(item=>marketPulseInboxQueuedIds.add(item.id));marketPulseInboxQueue=marketPulseInboxQueue.catch(()=>{}).then(async()=>{for(const item of pending){if(!cloud||uid!==processingUid||currentUser?.uid!==processingUid)break;try{await processMarketPulseInboxDocument(item)}catch(err){console.error('Automatic MarketPulse import failed',err);if(cloud&&uid===processingUid&&currentUser?.uid===processingUid){marketPulseAutomation={...marketPulseAutomation,state:'error',error:'This import will retry the next time AGNT opens with a stable connection.'};renderMarketPulseAutomationSettings()}}finally{marketPulseInboxQueuedIds.delete(item.id)}}});
}
function subscribeMarketPulseInbox(){
  unsubMarketPulseInbox?.();unsubMarketPulseInbox=null;if(!cloud||!db||!uid)return;
  const pendingQuery=query(collection(db,'users',uid,'marketPulseInbox'),where('status','==','pending'));
  unsubMarketPulseInbox=onSnapshot(pendingQuery,{includeMetadataChanges:true},snap=>{
    if(snap.metadata.fromCache)return;
    if(snap.docs.length){dailyBriefingMarketReady=false;refreshReturningSnapshotIfVisible();enqueueMarketPulseInboxDocuments(snap.docs);return}
    dailyBriefingMarketReady=true;
    if(marketPulseAutomation.state==='processing'){marketPulseAutomation={...marketPulseAutomation,state:marketPulseAutomation.lastImportedAt?'live':'waiting'};renderMarketPulseAutomationSettings()}
    refreshReturningSnapshotIfVisible();
  },err=>{console.error('MarketPulse inbox sync failed',err);dailyBriefingMarketReady=true;marketPulseAutomation={...marketPulseAutomation,state:'error',error:'Automatic MarketPulse intake could not connect.'};renderMarketPulseAutomationSettings();refreshReturningSnapshotIfVisible()});
}
function startMarketPulseSession(eventId){const event=marketPulseEvents.find(x=>x.id===eventId);if(!event)return;if(event.sessionCompletedAt)return;if(prospectSessionActive&&prospectSessionContext?.eventId===eventId){setProspectorSection('today');showProspectingSession();return}const matches=marketMatches(event),progress=marketSessionProgress(event,matches),remainingIds=matches.map(p=>p.id).filter(id=>!progress.workedIds.has(id));if(!matches.length)return toast('No available contacts for this session');prospectSessionIds=remainingIds.length?remainingIds:matches.map(p=>p.id);prospectSessionIndex=remainingIds.length?0:prospectSessionIds.length;prospectSessionActive=true;prospectSessionStats={calls:0,connects:0,temperate:0,appointments:0,sms:0};prospectSessionContext={eventId:event.id,eventType:event.eventType,address:event.address,suburb:event.suburb,propertyKey:event.propertyKey||marketPropertyKey(event.address,event.suburb),receivedDate:event.receivedDate||todayKey(),daysOnMarket:event.daysOnMarket||'',guide:event.guide||'',price:event.price||'',propertyDetails:event.propertyDetails||'',auctionDate:event.auctionDate||'',auctionTime:event.auctionTime||'',auctionText:event.auctionText||'',agency:event.agency||'',agents:event.agents||[],priceMovementAmount:event.priceMovementAmount||'',priceMovementPercent:event.priceMovementPercent||'',priceMovementDirection:event.priceMovementDirection||'',priorPrice:event.priorPrice||''};if(!event.sessionStartedAt){event.sessionStartedAt=Date.now();marketPulseEvents=normaliseMarketPulseEvents(marketPulseEvents);saveLocal();renderMarketPulse();queueProspectingSave().catch(err=>console.error('Hot Spotting session sync failed',err))}saveProspectingSessionState();setProspectorSection('today');showProspectingSession();requestAnimationFrame(()=>requestAnimationFrame(()=>{const view=$('#prospectingView');if(view)view.scrollTop=0;window.scrollTo({top:0,behavior:'auto'})}));toast(`${event.eventType} session ready`)}
async function skipMarketPulseSession(eventId){
  const event=marketPulseEvents.find(item=>item.id===cleanText(eventId,160));if(!event||event.sessionCompletedAt)return;
  const matches=marketMatches(event),progress=marketSessionProgress(event,matches),remainingIds=matches.map(person=>person.id).filter(id=>!progress.workedIds.has(id)),at=Date.now();
  marketPulseEvents=normaliseMarketPulseEvents(marketPulseEvents.map(item=>item.id===event.id?{...item,sessionStartedAt:item.sessionStartedAt||at,sessionCompletedAt:at,skippedProspectIds:[...new Set([...(item.skippedProspectIds||[]),...remainingIds])]}:item));
  if(prospectSessionActive&&cleanText(prospectSessionContext?.eventId,160)===event.id){prospectSessionActive=false;prospectSessionIds=[];prospectSessionIndex=0;prospectSessionStats={calls:0,connects:0,temperate:0,appointments:0,sms:0};prospectSessionContext=null;clearProspectingSessionState();saveHotSpotSmsPending(null)}
  saveLocal();renderProspecting();renderTimeline();renderNowCard();haptic();toast('Hot Spotting session skipped and completed');
  try{await queueProspectingSave()}catch(err){console.error('Hot Spotting skip sync failed',err)}
}

function defaultBuyerFilters(){return{budgetMin:0,budgetMax:BUYER_BUDGET_MAX,suburb:'',bedrooms:0,bathrooms:0,cars:0,propertyType:'',stage:'',temperature:'',position:'',followUp:'',features:new Set()}}
function buyerMaximumBudget(p={}){return Math.max(0,Number(p.buyerBudgetMax)||Number(p.buyerBudgetMin)||0)}
function buyerMatchEventEligible(event={}){return['just listed','listed','new listing','price update','price changed'].includes(normalisePlace(event.eventType))}
function buyerMatchLifecycleEvent(event={}){return['sold','auction result','withdrawn','under offer'].includes(normalisePlace(event.eventType))}
function buyerMarketPropertyConfiguration(event={}){
  const details=cleanText(event.propertyDetails,240),number=label=>{const match=details.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${label}`,'i'));return match?Number(match[1]):0};
  const lower=normalisePlace(details);let propertyType='';
  if(/\b(?:duplex|semi detached|semi-detached)\b/.test(lower))propertyType='Duplex';
  else if(/\btownhouse\b/.test(lower))propertyType='Townhouse';
  else if(/\b(?:unit|apartment|villa|flat)\b/.test(lower))propertyType='Unit';
  else if(/\b(?:vacant land|land)\b/.test(lower))propertyType='Land';
  else if(/\bhouse\b/.test(lower))propertyType='House';
  return{propertyType,bedrooms:number('bed'),bathrooms:number('bath'),cars:number('car')};
}
function buyerMarketEventSnapshot(event={}){const config=buyerMarketPropertyConfiguration(event);return{...event,...config,priceValue:parseMarketMoney(event.guide||event.price)}}
function buyerMarketEventMatch(buyer,event={}){
  if(!prospectHasActiveBuyerRole(buyer)||!buyerMatchEventEligible(event))return null;
  const snapshot=buyerMarketEventSnapshot(event),suburb=normalisePlace(snapshot.suburb),suburbs=(buyer.buyerSuburbs||[]).map(normalisePlace).filter(Boolean),max=buyerMaximumBudget(buyer),min=Math.max(0,Number(buyer.buyerBudgetMin)||0);
  if(!primaryProspectPhone(buyer))return null;
  if(!suburb||!suburbs.includes(suburb))return null;
  if(!buyer.buyerPropertyType||!snapshot.propertyType||buyer.buyerPropertyType!==snapshot.propertyType)return null;
  if(!max||!snapshot.priceValue||snapshot.priceValue>max||(min&&snapshot.priceValue<min))return null;
  if(Number(buyer.buyerBedrooms||0)>snapshot.bedrooms||Number(buyer.buyerBathrooms||0)>snapshot.bathrooms||Number(buyer.buyerCars||0)>snapshot.cars)return null;
  const reasons=[snapshot.suburb,snapshot.propertyType,snapshot.bedrooms?`${snapshot.bedrooms} bed`:'',`Within ${formatBuyerCardMoney(max)}`].filter(Boolean);
  return{snapshot,reason:reasons.join(' · ')};
}
function buyerPropertyMatchRecord(buyer,event,match){
  const snapshot=match.snapshot;return{id:event.id,eventId:event.id,propertyKey:event.propertyKey||marketPropertyKey(event.address,event.suburb),eventType:event.eventType,address:event.address,suburb:event.suburb,price:event.price||'',guide:event.guide||'',priorPrice:event.priorPrice||'',priceMovementAmount:event.priceMovementAmount||'',priceMovementPercent:event.priceMovementPercent||'',priceMovementDirection:event.priceMovementDirection||'',propertyDetails:event.propertyDetails||'',daysOnMarket:event.daysOnMarket||'',auctionDate:event.auctionDate||'',auctionTime:event.auctionTime||'',auctionText:event.auctionText||'',propertyType:snapshot.propertyType,bedrooms:snapshot.bedrooms,bathrooms:snapshot.bathrooms,cars:snapshot.cars,receivedDate:event.receivedDate||todayKey(),matchedAt:Date.now(),status:'active',statusAt:0,reason:match.reason};
}
function buyerMatchAsEvent(match={}){return{id:match.eventId,eventType:match.eventType,address:match.address,suburb:match.suburb,propertyKey:match.propertyKey,price:match.price,guide:match.guide,priorPrice:match.priorPrice,priceMovementAmount:match.priceMovementAmount,priceMovementPercent:match.priceMovementPercent,priceMovementDirection:match.priceMovementDirection,propertyDetails:match.propertyDetails,daysOnMarket:match.daysOnMarket,auctionDate:match.auctionDate,auctionTime:match.auctionTime,auctionText:match.auctionText,receivedDate:match.receivedDate}}
function refreshBuyerPropertyMatches(events=marketPulseEvents){
  const incoming=normaliseMarketPulseEvents(events).sort((a,b)=>a.receivedDate.localeCompare(b.receivedDate)||(Number(a.createdAt)||0)-(Number(b.createdAt)||0));let changed=false;
  prospects=prospects.map(buyer=>{
    if(!prospectHasActiveBuyerRole(buyer))return buyer;
    const before=normaliseBuyerPropertyMatches(buyer.buyerPropertyMatches),next=before.map(item=>({...item}));
    next.forEach(item=>{if(buyerMatchStatusOpen(item.status)&&!buyerMarketEventMatch(buyer,buyerMatchAsEvent(item))){item.status='superseded';item.statusAt=Date.now()}});
    for(const event of incoming){
      const propertyKey=event.propertyKey||marketPropertyKey(event.address,event.suburb);if(!propertyKey)continue;
      const laterOpen=next.filter(item=>buyerMatchStatusOpen(item.status)&&item.propertyKey===propertyKey&&event.receivedDate>=item.receivedDate&&item.eventId!==event.id);
      if(buyerMatchEventEligible(event)||buyerMatchLifecycleEvent(event))laterOpen.forEach(item=>{item.status='superseded';item.statusAt=Date.now()});
      if(!buyerMatchEventEligible(event))continue;
      const existingMatch=next.find(item=>item.eventId===event.id),match=buyerMarketEventMatch(buyer,event);
      if(existingMatch){if(match){const refreshed=buyerPropertyMatchRecord(buyer,event,match);if(existingMatch.status==='superseded')Object.assign(existingMatch,refreshed);else Object.assign(existingMatch,{...refreshed,matchedAt:existingMatch.matchedAt,status:existingMatch.status,statusAt:existingMatch.statusAt,outcome:existingMatch.outcome,outcomeAt:existingMatch.outcomeAt,outcomeReason:existingMatch.outcomeReason,nextFollowUp:existingMatch.nextFollowUp,lastAttemptAt:existingMatch.lastAttemptAt,lastContactMethod:existingMatch.lastContactMethod,attemptCount:existingMatch.attemptCount})}continue}
      if(match)next.push(buyerPropertyMatchRecord(buyer,event,match));
    }
    const normalised=normaliseBuyerPropertyMatches(next);if(JSON.stringify(before)!==JSON.stringify(normalised)){changed=true;return normaliseProspect({...buyer,buyerPropertyMatches:normalised})}return buyer;
  });
  return changed
}
function buyerMatchStatusOpen(status=''){return status==='active'||status==='attempted'}
function buyerOpenPropertyMatches(buyer={}){
  const latest=new Map();
  normaliseBuyerPropertyMatches(buyer.buyerPropertyMatches).filter(item=>buyerMatchStatusOpen(item.status)).sort((a,b)=>b.receivedDate.localeCompare(a.receivedDate)||b.matchedAt-a.matchedAt).forEach(item=>{if(!latest.has(item.propertyKey))latest.set(item.propertyKey,item)});
  return[...latest.values()].sort((a,b)=>(buyerMatchTimeAlert(buyer,b)?.score||0)-(buyerMatchTimeAlert(buyer,a)?.score||0)||b.receivedDate.localeCompare(a.receivedDate)||b.matchedAt-a.matchedAt)
}
function buyerMatchAuctionClock(match={}){
  const value=cleanText(match.auctionTime,10);if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value))return'';const [hours,minutes]=value.split(':').map(Number),display=hours%12||12;return`${display}:${String(minutes).padStart(2,'0')} ${hours>=12?'pm':'am'}`
}
function buyerMatchDayDifference(date,referenceDate=todayKey()){
  if(!validDateKey(date)||!validDateKey(referenceDate))return null;return Math.round((parseKey(date)-parseKey(referenceDate))/86400000)
}
function buyerMatchTimeAlert(buyer={},match={},referenceDate=todayKey()){
  if(!prospectHasActiveBuyerRole(buyer)||!buyerMatchStatusOpen(match.status))return null;
  const candidates=[],add=(score,level,label,detail,kind)=>candidates.push({score,level,label,detail,kind}),auctionDays=buyerMatchDayDifference(match.auctionDate,referenceDate),clock=buyerMatchAuctionClock(match),auctionWhen=validDateKey(match.auctionDate)?`${fmtDate(match.auctionDate)}${clock?` · ${clock}`:''}`:'',eventType=normalisePlace(match.eventType),receivedAge=validDateKey(match.receivedDate)?-buyerMatchDayDifference(match.receivedDate,referenceDate):99;
  if(auctionDays!==null){
    if(auctionDays>=-2&&auctionDays<0)add(118,'critical','Auction date passed',`${auctionWhen} · Verify the property status before contacting the buyer.`,'auction');
    else if(auctionDays===0)add(120,'critical','Auction today',`${clock?`${clock} · `:''}Contact while inspection and registration decisions can still be made.`,'auction');
    else if(auctionDays===1)add(116,'critical','Auction tomorrow',`${auctionWhen} · Confirm interest and inspection plans today.`,'auction');
    else if(auctionDays>=2&&auctionDays<=3)add(110,'high',`Auction in ${auctionDays} days`,`${auctionWhen} · Resolve interest before the final campaign window.`,'auction');
    else if(auctionDays>=4&&auctionDays<=7)add(101,'high',`Auction in ${auctionDays} days`,`${auctionWhen} · Bring the property forward while there is time to inspect.`,'auction');
  }
  if(eventType==='price update'||eventType==='price changed'||eventType==='price change'){
    const current=parseMarketMoney(match.guide||match.price),prior=parseMarketMoney(match.priorPrice),maximum=buyerMaximumBudget(buyer),price=buyerMatchPriceLabel(match);
    if(current&&prior&&maximum&&prior>maximum&&current<=maximum)add(114,'critical','Now within budget',`${price||formatMarketMoney(current)} after the price change · Previously above the ${formatBuyerCardMoney(maximum)} ceiling.`,'price');
    else if(receivedAge===0)add(98,'high','Price changed today',`${price?`${price} · `:''}The latest guide still fits the saved buyer brief.`,'price');
    else if(receivedAge===1)add(84,'fresh','Price changed yesterday',`${price?`${price} · `:''}A recent change makes this worth revisiting promptly.`,'price');
  }
  if(['just listed','listed','new listing'].includes(eventType)){
    if(receivedAge===0)add(88,'fresh','Listed today','Fresh stock that fits the verified buyer brief.','listing');
    else if(receivedAge===1)add(76,'fresh','Listed yesterday','Still early in the campaign and worth a prompt conversation.','listing');
  }
  return candidates.sort((a,b)=>b.score-a.score)[0]||null
}
function buyerMatchTimeAlertMarkup(alert,className=''){
  if(!alert)return'';return`<span class="buyer-match-time-alert ${escapeHtml(alert.level)} ${escapeHtml(className)}"><b>${escapeHtml(alert.label)}</b><small>${escapeHtml(alert.detail)}</small></span>`
}
function buyerSellerNarrativeText(buyer={}){
  const history=interactionsFor(buyer.id).slice(0,8).map(item=>item.note||'').filter(Boolean);return normalisePlace([buyer.notes,...history].join(' '))
}
function buyerSellerNegativeEvidence(buyer={}){
  const text=buyerSellerNarrativeText(buyer);return Boolean(text&&/\b(?:not (?:interested in )?selling|not looking to sell|no (?:home|house|property) to sell|no need to sell|does not need to sell|doesn['’]?t need to sell|do not need to sell|don['’]?t need to sell|not a seller|currently rent(?:ing)?|rent(?:er|ing))\b/.test(text))
}
function buyerSellerIntentEvidence(buyer={}){
  const text=buyerSellerNarrativeText(buyer);if(!text||buyerSellerNegativeEvidence(buyer))return'';
  return /\b(?:buyer[ -–]?seller|need(?:s)? to sell|must sell|sell (?:theirs|ours|mine|his|hers|their|our|my|her|the|current)|selling (?:theirs|ours|mine|his|hers|their|our|my|her|the|current)|subject to (?:the )?sale|currently on the market|already on the market|market appraisal|would sell|thinking (?:of|about) selling|considering selling|planning to sell|looking to sell|then sell|sell first|sell before|buy and sell|change[ -]?over)\b/.test(text)?'Selling intent in buyer notes':'';
}
function buyerLinkedSellerProspect(buyer={}){
  if(prospectHasContactProfile(buyer)&&SELLING_TIMEFRAMES.includes(pipelineTimeframeForProspect(buyer)))return buyer;
  const phone=normalisedPhoneDigits(primaryProspectPhone(buyer)),email=cleanText(buyer.email,180).toLowerCase();
  return prospects.find(prospect=>{
    if(!prospect||prospect.id===buyer.id||!prospectHasContactProfile(prospect)||prospect.archived)return false;
    const samePhone=Boolean(phone&&normalisedPhoneDigits(primaryProspectPhone(prospect))===phone),sameEmail=Boolean(email&&cleanText(prospect.email,180).toLowerCase()===email);if(!samePhone&&!sameEmail)return false;
    const timeframe=pipelineTimeframeForProspect(prospect),tags=(prospect.tags||[]).map(normalisePlace),sellerStage=['appraisal opportunity','appointment booked','pipeline'].includes(normalisePlace(prospect.stage));
    return Boolean(SELLING_TIMEFRAMES.includes(timeframe)||sellerStage||tags.some(tag=>tag==='seller'||tag==='vendor'||tag==='buyer-seller'||tag==='buyer seller'));
  })||null
}
function buyerSellerConversationAngle({buyer={},match={},currentHome='',linkedSeller=null}={}){
  const destination=formatProspectAddress(match.address,match.suburb)||[match.address,match.suburb].filter(Boolean).join(', '),positions=buyerPositionTags(buyer),first=cleanText(buyer.name,120).split(/\s+/)[0]||'the buyer';
  if(positions.includes('Downsizing'))return`Ask whether ${destination} changes the timing for ${currentHome}, then offer a current market value before ${first} commits to the move.`;
  if(positions.includes('Upsizing'))return`Link ${destination} to the next move: ask whether ${currentHome} needs to sell first, then align the purchase and sale timing.`;
  if(linkedSeller){const timeframe=pipelineTimeframeForProspect(linkedSeller);return`Connect ${destination} to the existing seller conversation for ${currentHome}${timeframe?` (${timeframe})`:''}, then agree the next step on both sides of the move.`}
  return`Ask how interest in ${destination} affects the plan for ${currentHome}, then offer a current value and align the timing of both moves.`
}
function buyerSellerOpportunityFor(buyer={},match={}){
  if(!prospectHasActiveBuyerRole(buyer)||!match?.propertyKey)return null;
  const positions=buyerPositionTags(buyer),legacyTags=(buyer.tags||[]).map(normalisePlace),explicit=positions.includes('Buyer Seller')||legacyTags.some(tag=>tag==='buyer seller'||tag==='buyer-seller'||tag==='buyer–seller'),linkedSeller=buyerLinkedSellerProspect(buyer),negativeEvidence=buyerSellerNegativeEvidence(buyer),intentEvidence=explicit||linkedSeller||negativeEvidence?'':buyerSellerIntentEvidence(buyer),movement=positions.find(tag=>tag==='Upsizing'||tag==='Downsizing')||'',currentHome=formatProspectAddress(buyer.address||buyer.company,buyer.suburb)||formatProspectAddress(linkedSeller?.address||linkedSeller?.company,linkedSeller?.suburb);
  if(!currentHome||(!explicit&&!linkedSeller&&(negativeEvidence||(!intentEvidence&&!movement))))return null;
  const state=explicit||linkedSeller?'confirmed':'potential',evidence=explicit?'Marked Buyer Seller':linkedSeller?`Linked seller pipeline${pipelineTimeframeForProspect(linkedSeller)?` · ${pipelineTimeframeForProspect(linkedSeller)}`:''}`:intentEvidence||`${movement} buyer with a current home`,matchedProperty=formatProspectAddress(match.address,match.suburb)||[match.address,match.suburb].filter(Boolean).join(', ');
  return{state,stateLabel:state==='confirmed'?'Confirmed buyer + seller':'Potential buyer + seller',evidence,currentHome,matchedProperty,conversationAngle:buyerSellerConversationAngle({buyer,match,currentHome,linkedSeller}),linkedSellerId:linkedSeller?.id||''}
}
function allOpenBuyerPropertyMatches(){return activeBuyerProspects().flatMap(buyer=>buyerOpenPropertyMatches(buyer).map(match=>({buyer,match}))).sort((a,b)=>b.match.receivedDate.localeCompare(a.match.receivedDate)||a.buyer.name.localeCompare(b.buyer.name,'en-AU',{sensitivity:'base'}))}
function buyerContactedOnDate(buyerId,date=todayKey()){
  return prospectInteractions.some(item=>item.prospectId===buyerId&&item.date===date&&(
    item.type==='Call'||item.type==='SMS'||(item.type==='Buyer match'&&Boolean(item.buyerMatchId))
  ));
}
function buyerMatchContactEnvelopes(viewDate=todayKey(),{includeContacted=false}={}){
  return activeBuyerProspects().map(buyer=>{
    const matches=buyerOpenPropertyMatches(buyer);if(!matches.length)return null;
    if(!includeContacted&&buyerContactedOnDate(buyer.id,viewDate))return null;
    const primary=matches[0],urgency=buyerMatchTimeAlert(buyer,primary,viewDate),followUpDate=validDateKey(buyer.nextFollowUp)?buyer.nextFollowUp:'',followUpDue=Boolean(followUpDate&&followUpDate<=viewDate),followUpLabel=followUpDue?(followUpDate<viewDate?`Follow-up overdue · ${fmtDate(followUpDate)}`:'Follow-up due today'):'',followUpScore=followUpDate<viewDate?112:followUpDue?106:0,priorityScore=Math.max(Number(urgency?.score)||0,followUpScore);
    return{buyer,primary,matches,propertyCount:matches.length,urgency,priorityScore,followUpDate,followUpDue,followUpLabel,phone:primaryProspectPhone(buyer)};
  }).filter(Boolean).sort((a,b)=>b.priorityScore-a.priorityScore||Number(b.followUpDue)-Number(a.followUpDue)||b.primary.receivedDate.localeCompare(a.primary.receivedDate)||a.buyer.name.localeCompare(b.buyer.name,'en-AU',{sensitivity:'base'}));
}
function buyerMatchPriceLabel(match={}){return match.guide||match.price||''}
function buyerMatchSmsMessage(buyer={},match={}){
  const first=buyer.name.split(/\s+/)[0]||'there',config=[match.bedrooms?`${match.bedrooms} bedroom`:'',match.propertyType].filter(Boolean).join(' '),price=buyerMatchPriceLabel(match),eventType=normalisePlace(match.eventType),priceLine=price?(eventType==='price update'||eventType==='price changed'||eventType==='price change'?` The guide has just changed to ${price}.`:` The guide is ${price}.`):'',auctionDays=buyerMatchDayDifference(match.auctionDate),clock=buyerMatchAuctionClock(match);let auctionLine='';
  if(auctionDays===0)auctionLine=` The auction is today${clock?` at ${clock}`:''}.`;
  else if(auctionDays===1)auctionLine=` The auction is tomorrow${clock?` at ${clock}`:''}.`;
  else if(auctionDays!==null&&auctionDays>1)auctionLine=` The auction is ${fmtDate(match.auctionDate)}${clock?` at ${clock}`:''}.`;
  return`Hi ${first}, a property has come up at ${match.address}, ${match.suburb} that matches what you’re looking for.${config?` It’s a ${config.toLowerCase()}.`:''}${priceLine}${auctionLine} Let me know if you’d like me to send through the details or arrange a look. ${displayAgentName().split(/\s+/)[0]||'Andrew'}`
}
function buyerMatchOutcomeLabel(outcome=''){return({interested:'Interested', 'details-sent':'Details sent',inspection:'Inspection arranged',maybe:'Maybe', 'not-suitable':'Not suitable', 'no-answer':'No answer'})[outcome]||'Match updated'}
function buyerMatchReasonLabel(reason=''){return({price:'Price','property-type':'Property type',location:'Location',configuration:'Configuration',condition:'Condition',other:'Other'})[reason]||''}
function buyerMatchStateLabel(match={}){if(match.status==='attempted')return'Contact attempted';return'New match'}
function buyerMatchSelected(buyerId,matchId){const buyer=prospectById(buyerId),match=normaliseBuyerPropertyMatches(buyer?.buyerPropertyMatches).find(item=>item.id===matchId);return prospectHasActiveBuyerRole(buyer)&&match?{buyer,match}:null}
function renderBuyerMatchSurfaces(buyerId=''){
  renderBuyerProfiles();renderTimeline();renderNowCard();
  if(buyerId&&activeProspectId===buyerId&&!$('#prospectDetail')?.classList.contains('hidden'))renderBuyerDetail(buyerId);
}
function commitBuyerMatchChanges(buyerId=''){
  saveLocal();renderBuyerMatchSurfaces(buyerId);
  return saveProspecting({render:false,awaitCloud:false}).catch(err=>console.error('Buyer match sync failed',err));
}
function updateBuyerMatchRecords(buyerId,matchId,change){
  const selected=buyerMatchSelected(buyerId,matchId);if(!selected)return null;const now=Date.now(),matches=normaliseBuyerPropertyMatches(selected.buyer.buyerPropertyMatches).map(item=>{
    if(item.id!==matchId)return item;return{...item,...change,statusAt:Number(change.statusAt)||now};
  });
  prospects=prospects.map(item=>item.id===buyerId?normaliseProspect({...item,buyerPropertyMatches:matches,updatedAt:now}):item);
  return{buyer:selected.buyer,match:selected.match,now};
}
function recordBuyerMatchAttempt(buyerId,matchId,{contactMethod='manual',outcome='',persist=true}={}){
  const selected=buyerMatchSelected(buyerId,matchId);if(!selected||!buyerMatchStatusOpen(selected.match.status))return null;const now=Date.now(),hasOutcome=BUYER_MATCH_OUTCOMES.has(outcome),matches=normaliseBuyerPropertyMatches(selected.buyer.buyerPropertyMatches).map(item=>item.id===matchId?{...item,status:'attempted',statusAt:now,outcome:hasOutcome?outcome:'',outcomeAt:hasOutcome?now:0,lastAttemptAt:now,lastContactMethod:['call','sms','manual'].includes(contactMethod)?contactMethod:'manual',attemptCount:Math.max(0,Number(item.attemptCount)||0)+1}:item);
  prospects=prospects.map(item=>item.id===buyerId?normaliseProspect({...item,buyerPropertyMatches:matches,lastContact:contactMethod==='call'||contactMethod==='sms'?todayKey():item.lastContact,updatedAt:now}):item);
  if(persist)commitBuyerMatchChanges(buyerId);return{buyer:selected.buyer,match:selected.match};
}
async function applyBuyerMatchOutcome(buyerId,matchId,outcome,{followUpDate='',reason='',contactMethod='manual',logInteraction=true,appointment=null}={}){
  const selected=buyerMatchSelected(buyerId,matchId);if(!selected||!buyerMatchStatusOpen(selected.match.status)||!BUYER_MATCH_OUTCOMES.has(outcome))return false;
  const now=Date.now(),status=outcome==='no-answer'?'attempted':outcome==='not-suitable'?'dismissed':outcome==='inspection'?'inspection':outcome==='interested'?'engaged':'follow-up',next=validDateKey(followUpDate)?followUpDate:'',reasonKey=BUYER_MATCH_REASONS.has(reason)?reason:'',resolved=status!=='attempted';
  const matches=normaliseBuyerPropertyMatches(selected.buyer.buyerPropertyMatches).map(item=>{
    const sameProperty=item.propertyKey===selected.match.propertyKey&&item.receivedDate<=selected.match.receivedDate&&(buyerMatchStatusOpen(item.status)||item.id===matchId);if(!sameProperty)return item;
    return{...item,status,statusAt:now,outcome,outcomeAt:now,outcomeReason:reasonKey,nextFollowUp:next,lastAttemptAt:now,lastContactMethod:['call','sms','manual'].includes(contactMethod)?contactMethod:'manual',attemptCount:Math.max(0,Number(item.attemptCount)||0)+(outcome==='no-answer'?1:0)};
  });
  const stage=outcome==='interested'||outcome==='inspection'?(selected.buyer.buyerStage==='Negotiating'||selected.buyer.buyerStage==='Purchased'?selected.buyer.buyerStage:'Inspecting'):selected.buyer.buyerStage;
  const currentFollowUp=validDateKey(selected.buyer.nextFollowUp)?selected.buyer.nextFollowUp:'',buyerFollowUp=next||((resolved&&currentFollowUp<=todayKey())?'':currentFollowUp),lastContact=contactMethod==='call'||contactMethod==='sms'||contactMethod==='manual'?todayKey():selected.buyer.lastContact;
  prospects=prospects.map(item=>item.id===buyerId?normaliseProspect({...item,buyerPropertyMatches:matches,buyerStage:stage,nextFollowUp:buyerFollowUp,lastContact,updatedAt:now}):item);
  if(logInteraction){const price=buyerMatchPriceLabel(selected.match),appointmentWhen=appointment&&validDateKey(appointment.scheduledDate||appointment.date)?`${fmtDate(appointment.scheduledDate||appointment.date)}${appointment.time?` at ${appointment.time}`:''}`:'',detail=[`${selected.match.address}, ${selected.match.suburb}`,price,reasonKey?`Reason: ${buyerMatchReasonLabel(reasonKey)}`:'',next?`Follow up ${fmtDate(next)}`:'',appointmentWhen?`Inspection ${appointmentWhen}`:''].filter(Boolean).join(' · ');prospectInteractions.push({id:prospectId(),prospectId:buyerId,date:todayKey(),at:now,type:'Buyer match',outcome:buyerMatchOutcomeLabel(outcome),note:detail,nextFollowUp:next,buyerMatchId:matchId,buyerMatchOutcome:outcome,marketEventId:selected.match.eventId,marketPropertyKey:selected.match.propertyKey,appointmentId:appointment?.id||''});}
  await commitBuyerMatchChanges(buyerId);return{...selected,status,resolved};
}
function setBuyerPropertyMatchStatusLocal(buyerId,matchId,status='reviewed',{logInteraction=true}={}){
  if(!['reviewed','contacted','dismissed'].includes(status))return null;const selected=buyerMatchSelected(buyerId,matchId);if(!selected)return null;const now=Date.now(),matches=normaliseBuyerPropertyMatches(selected.buyer.buyerPropertyMatches).map(item=>buyerMatchStatusOpen(item.status)&&item.propertyKey===selected.match.propertyKey&&item.receivedDate<=selected.match.receivedDate?{...item,status,statusAt:now}:item),labels={reviewed:'Property match reviewed',contacted:'Property match contacted',dismissed:'Property match dismissed'};prospects=prospects.map(item=>item.id===buyerId?normaliseProspect({...item,buyerPropertyMatches:matches,updatedAt:now}):item);if(logInteraction)prospectInteractions.push({id:prospectId(),prospectId:buyerId,date:todayKey(),at:now,type:'Buyer match',outcome:labels[status],note:`${selected.match.address}, ${selected.match.suburb}${buyerMatchPriceLabel(selected.match)?` · ${buyerMatchPriceLabel(selected.match)}`:''}`,nextFollowUp:'',buyerMatchId:matchId});commitBuyerMatchChanges(buyerId);return selected
}
function launchBuyerMatchCall(buyerId,matchId){launchBuyerProfileCall(buyerId,matchId)}
function buyerMatchFollowUpDate(days=1){const value=new Date();value.setDate(value.getDate()+Math.max(1,Number(days)||1));return dateKey(value)}
function closeBuyerMatchOutcome({restoreFocus=true}={}){const focus=buyerMatchOutcomeReturnFocus;document.querySelectorAll('.buyer-match-outcome-overlay').forEach(node=>node.remove());document.body.classList.remove('buyer-match-outcome-open');buyerMatchOutcomeReturnFocus=null;if(restoreFocus&&focus)requestAnimationFrame(()=>{if(focus.isConnected)focus.focus({preventScroll:true})})}
function buyerMatchFollowUpStepMarkup(buyer,match,outcome){const defaults={interested:1,'details-sent':2,maybe:3};return`<div class="buyer-match-outcome-step"><button type="button" class="buyer-match-outcome-back" data-buyer-match-outcome-back>‹ Back</button><span>NEXT STEP</span><h3>${escapeHtml(buyerMatchOutcomeLabel(outcome))}</h3><p>Choose when ${escapeHtml(buyer.name.split(/\s+/)[0]||buyer.name)} should return to Today.</p><label>Follow-up date<input type="date" data-buyer-match-followup-date value="${buyerMatchFollowUpDate(defaults[outcome]||1)}" min="${todayKey()}" required></label><button type="button" class="primary" data-confirm-buyer-match-followup="${escapeHtml(outcome)}">Save outcome</button></div>`}
function buyerMatchReasonStepMarkup(){return`<div class="buyer-match-outcome-step"><button type="button" class="buyer-match-outcome-back" data-buyer-match-outcome-back>‹ Back</button><span>NOT SUITABLE</span><h3>What ruled it out?</h3><p>This closes only this property match and keeps the buyer brief intact.</p><div class="buyer-match-reason-grid">${['price','property-type','location','configuration','condition','other'].map(reason=>`<button type="button" data-confirm-buyer-match-reason="${reason}">${escapeHtml(buyerMatchReasonLabel(reason))}</button>`).join('')}</div></div>`}
function buyerMatchOutcomeOptionsMarkup(buyer,match){
  const timeAlert=buyerMatchTimeAlert(buyer,match),sellerOpportunity=buyerSellerOpportunityFor(buyer,match),sellerAngle=sellerOpportunity?`<aside class="buyer-match-seller-angle ${escapeHtml(sellerOpportunity.state)}"><span>${escapeHtml(sellerOpportunity.stateLabel)}</span><strong>${escapeHtml(sellerOpportunity.currentHome)}</strong><p>${escapeHtml(sellerOpportunity.conversationAngle)}</p></aside>`:'';
  return`<div class="buyer-match-outcome-context"><span>${escapeHtml(match.eventType)}</span><strong>${escapeHtml(match.address)}</strong><small>${escapeHtml([match.suburb,buyerMatchPriceLabel(match)].filter(Boolean).join(' · '))}</small></div>${buyerMatchTimeAlertMarkup(timeAlert,'buyer-outcome-time-alert')}${sellerAngle}<div class="buyer-match-outcome-options"><button type="button" data-buyer-match-outcome="interested"><span>Interested</span><small>Keep moving</small></button><button type="button" data-buyer-match-outcome="details-sent"><span>Send details</span><small>Set the return</small></button><button type="button" data-buyer-match-outcome="inspection"><span>Arrange inspection</span><small>Open a BAP</small></button><button type="button" data-buyer-match-outcome="maybe"><span>Maybe</span><small>Follow up later</small></button><button type="button" data-buyer-match-outcome="not-suitable"><span>Not suitable</span><small>Close this match</small></button><button type="button" data-buyer-match-outcome="no-answer"><span>No answer</span><small>Keep it open</small></button></div>`
}
function openBuyerMatchInspection(buyerId,matchId,contactMethod='manual'){
  const selected=buyerMatchSelected(buyerId,matchId);if(!selected)return toast('Property match could not be found');
  openAppointmentBookingFromProspect({prospectId:buyerId,buyerMatchId:matchId,buyerMatchContactMethod:contactMethod,appointmentAddress:[selected.match.address,selected.match.suburb].filter(Boolean).join(', '),appointmentType:'BAP'});
}
function openBuyerMatchOutcome(buyerId,matchId,{contactMethod='manual'}={}){
  const selected=buyerMatchSelected(buyerId,matchId);if(!selected)return toast('Property match could not be found');const returnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;closeBuyerMatchOutcome({restoreFocus:false});buyerMatchOutcomeReturnFocus=returnFocus;
  const overlay=document.createElement('div');overlay.className='buyer-match-outcome-overlay';overlay.innerHTML=`<section class="buyer-match-outcome-sheet" role="dialog" aria-modal="true" aria-labelledby="buyerMatchOutcomeTitle"><div class="buyer-match-outcome-head"><div><span>BUYER OPPORTUNITY</span><h2 id="buyerMatchOutcomeTitle">What happened with ${escapeHtml(selected.buyer.name.split(/\s+/)[0]||selected.buyer.name)}?</h2></div><button type="button" data-close-buyer-match-outcome aria-label="Close">×</button></div><div class="buyer-match-outcome-body">${buyerMatchOutcomeOptionsMarkup(selected.buyer,selected.match)}</div></section>`;
  document.body.append(overlay);document.body.classList.add('buyer-match-outcome-open');const body=overlay.querySelector('.buyer-match-outcome-body'),showOptions=()=>{body.innerHTML=buyerMatchOutcomeOptionsMarkup(selected.buyer,selected.match)};
  overlay.addEventListener('click',async event=>{
    if(event.target===overlay||event.target.closest('[data-close-buyer-match-outcome]')){event.preventDefault();closeBuyerMatchOutcome();return}
    if(event.target.closest('[data-buyer-match-outcome-back]')){event.preventDefault();showOptions();return}
    const choice=event.target.closest('[data-buyer-match-outcome]');if(choice){event.preventDefault();const outcome=choice.dataset.buyerMatchOutcome;if(['interested','details-sent','maybe'].includes(outcome)){body.innerHTML=buyerMatchFollowUpStepMarkup(selected.buyer,selected.match,outcome);return}if(outcome==='not-suitable'){body.innerHTML=buyerMatchReasonStepMarkup();return}if(outcome==='inspection'){closeBuyerMatchOutcome({restoreFocus:false});openBuyerMatchInspection(buyerId,matchId,contactMethod);return}await applyBuyerMatchOutcome(buyerId,matchId,'no-answer',{contactMethod});closeBuyerMatchOutcome();toast('Contact attempt saved');return}
    const followUp=event.target.closest('[data-confirm-buyer-match-followup]');if(followUp){event.preventDefault();const date=body.querySelector('[data-buyer-match-followup-date]')?.value;if(!validDateKey(date))return toast('Choose a follow-up date');followUp.disabled=true;await applyBuyerMatchOutcome(buyerId,matchId,followUp.dataset.confirmBuyerMatchFollowup,{followUpDate:date,contactMethod});closeBuyerMatchOutcome();toast('Buyer opportunity updated');return}
    const reason=event.target.closest('[data-confirm-buyer-match-reason]');if(reason){event.preventDefault();reason.disabled=true;await applyBuyerMatchOutcome(buyerId,matchId,'not-suitable',{reason:reason.dataset.confirmBuyerMatchReason,contactMethod});closeBuyerMatchOutcome();toast('Property match closed')}
  });
  overlay.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeBuyerMatchOutcome()}});requestAnimationFrame(()=>overlay.querySelector('[data-close-buyer-match-outcome]')?.focus({preventScroll:true}));
}
function buyerMatchSmsPendingKey(){return`agnt-buyer-match-sms-v13632-${uid||currentUser?.uid||'device'}`}
function saveBuyerMatchSmsPending(value){try{if(value)localStorage.setItem(buyerMatchSmsPendingKey(),JSON.stringify(value));else localStorage.removeItem(buyerMatchSmsPendingKey())}catch(err){console.warn('Buyer match SMS state could not be saved',err)}}
function loadBuyerMatchSmsPending(){try{const value=JSON.parse(localStorage.getItem(buyerMatchSmsPendingKey())||'null');return value&&typeof value==='object'?value:null}catch{return null}}
function closeBuyerMatchSmsConfirmation(){document.querySelectorAll('.buyer-match-sms-overlay').forEach(node=>node.remove());document.body.classList.remove('buyer-match-sms-open')}
function showBuyerMatchSmsConfirmation(pending=loadBuyerMatchSmsPending()){
  if(!pending)return;const selected=buyerMatchSelected(pending.buyerId,pending.matchId);if(!selected){saveBuyerMatchSmsPending(null);return}closeBuyerMatchSmsConfirmation();const overlay=document.createElement('div');overlay.className='buyer-match-sms-overlay';overlay.innerHTML=`<section class="buyer-match-sms-sheet" role="dialog" aria-modal="true" aria-labelledby="buyerMatchSmsTitle"><span>BUYER OPPORTUNITY</span><h2 id="buyerMatchSmsTitle">Was the SMS sent?</h2><p>${escapeHtml(selected.buyer.name)} · ${escapeHtml(selected.match.address)}</p><button class="primary" type="button" data-buyer-match-sms-sent>SMS sent</button><button class="secondary" type="button" data-buyer-match-sms-not-sent>Not sent</button></section>`;document.body.append(overlay);document.body.classList.add('buyer-match-sms-open');overlay.addEventListener('click',event=>{if(event.target.closest('[data-buyer-match-sms-sent]'))confirmBuyerMatchSmsSent();else if(event.target===overlay||event.target.closest('[data-buyer-match-sms-not-sent]')){saveBuyerMatchSmsPending(null);closeBuyerMatchSmsConfirmation();toast('Property match left open')}});requestAnimationFrame(()=>overlay.querySelector('[data-buyer-match-sms-sent]')?.focus({preventScroll:true}));
}
function resumeBuyerMatchSmsReturn(){const pending=loadBuyerMatchSmsPending();if(!pending)return false;const age=Date.now()-(Number(pending.openedAt)||0);if(age<400||Date.now()<buyerMatchSmsReturnGuardUntil)return false;if(age>10*60*1000){saveBuyerMatchSmsPending(null);return false}showBuyerMatchSmsConfirmation(pending);return true}
async function confirmBuyerMatchSmsSent(){
  const pending=loadBuyerMatchSmsPending(),selected=pending?buyerMatchSelected(pending.buyerId,pending.matchId):null;if(!pending||!selected)return;saveBuyerMatchSmsPending(null);const at=Date.now();if(!prospectInteractions.some(item=>item.id===pending.id))prospectInteractions.push({id:pending.id,prospectId:selected.buyer.id,date:todayKey(),at,type:'SMS',outcome:'Sent SMS',note:cleanText(pending.message,2000),nextFollowUp:'',buyerMatchId:selected.match.id,marketEventId:selected.match.eventId,marketPropertyKey:selected.match.propertyKey});recordBuyerMatchAttempt(selected.buyer.id,selected.match.id,{contactMethod:'sms',persist:false});closeBuyerMatchSmsConfirmation();await commitBuyerMatchChanges(selected.buyer.id);toast('SMS logged');openBuyerMatchOutcome(selected.buyer.id,selected.match.id,{contactMethod:'sms'});
}
function launchBuyerMatchSms(buyerId,matchId){const selected=buyerMatchSelected(buyerId,matchId),phone=primaryProspectPhone(selected?.buyer);if(!selected)return;if(!phone)return toast('Add a valid mobile number first');const message=buyerMatchSmsMessage(selected.buyer,selected.match),pending={id:prospectId(),buyerId,matchId,message,openedAt:Date.now()};saveBuyerMatchSmsPending(pending);buyerMatchSmsReturnGuardUntil=Date.now()+1600;window.location.href=smsHref(phone,message);setTimeout(resumeBuyerMatchSmsReturn,2600)}
function buyerBudgetText(min=0,max=0){const value=Math.max(0,Number(max)||Number(min)||0);return value?formatBuyerMoney(value):'—'}
function formatBuyerMoney(value=0){const n=Math.max(0,Math.round(Number(value)||0));return n?`$${n.toLocaleString('en-AU')}`:'Any'}
function formatBuyerCardMoney(value=0){const n=Math.max(0,Math.round(Number(value)||0));if(!n)return'';if(n>=1000000)return`$${(n/1000000).toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1')}m`;if(n>=1000)return`$${Math.round(n/1000)}k`;return formatBuyerMoney(n)}
function buyerRangeLabel(value){const n=Math.max(0,Number(value)||0);return n?formatBuyerMoney(n):'Any'}
function buyerBudgetEditorLabel(value){const n=Math.max(0,Number(value)||0);return n?formatBuyerMoney(n):'Not set'}
function buyerConfigText(p){const parts=[];if(p.buyerBedrooms)parts.push(`${p.buyerBedrooms} Bed`);if(p.buyerBathrooms)parts.push(`${p.buyerBathrooms} Bath`);if(p.buyerCars)parts.push(`${p.buyerCars} Car`);return parts.join(' · ')||'Configuration not set'}
function buyerSuburbText(p){const suburbs=p.buyerSuburbs||[];if(!suburbs.length)return'Suburbs not set';return`${suburbs.slice(0,2).join(' · ')}${suburbs.length>2?` · +${suburbs.length-2}`:''}`}
function buyerPrioritySuburbText(p){const suburbs=(p.buyerSuburbs||[]).filter(Boolean);if(!suburbs.length)return'';const extra=suburbs.length-1;return extra?`${suburbs[0]} + ${extra} suburb${extra===1?'':'s'}`:suburbs[0]}
function buyerCardCriteriaText(p){const parts=[],config=buyerConfigText(p),budget=buyerMaximumBudget(p);if(config!=='Configuration not set')parts.push(config);if(budget)parts.push(`Up to ${formatBuyerCardMoney(budget)}`);return parts.join(' · ')||'Buyer criteria not set'}
function buyerCardLocationText(p){return buyerPrioritySuburbText(p)||'Suburbs not set'}
function buyerTagsForCard(p){return[p.buyerPropertyType,...(p.buyerFeatures||[])].filter(Boolean)}
function buyerFilterCount(){const f=buyerFilterState;return Number(f.budgetMin>0)+Number(Boolean(f.suburb))+Number(f.bedrooms>0)+Number(f.bathrooms>0)+Number(f.cars>0)+Number(Boolean(f.propertyType))+Number(Boolean(f.stage))+Number(Boolean(f.temperature))+Number(Boolean(f.position))+Number(Boolean(f.followUp))+(f.features?.size||0)}
function buyerMatchesFilters(p){const f=buyerFilterState;if(f.budgetMin>0){const buyerMax=buyerMaximumBudget(p);if(!buyerMax||buyerMax<f.budgetMin)return false}const suburb=cleanText(f.suburb,120).toLowerCase();if(suburb){const terms=suburb.split(/[,;|]/).map(x=>x.trim()).filter(Boolean);if(!terms.some(term=>(p.buyerSuburbs||[]).some(value=>value.toLowerCase().includes(term))))return false}if(f.bedrooms&&Number(p.buyerBedrooms||0)<f.bedrooms)return false;if(f.bathrooms&&Number(p.buyerBathrooms||0)<f.bathrooms)return false;if(f.cars&&Number(p.buyerCars||0)<f.cars)return false;if(f.propertyType&&p.buyerPropertyType!==f.propertyType)return false;if(f.stage&&p.buyerStage!==f.stage)return false;if(f.temperature&&p.temperature!==f.temperature)return false;if(f.position&&!buyerPositionTags(p).includes(f.position))return false;if(f.followUp==='overdue'&&!(p.nextFollowUp&&p.nextFollowUp<todayKey()))return false;if(f.followUp==='today'&&p.nextFollowUp!==todayKey())return false;if(f.followUp==='scheduled'&&!(p.nextFollowUp&&p.nextFollowUp>todayKey()))return false;if(f.followUp==='none'&&p.nextFollowUp)return false;if(f.features?.size&&![...f.features].every(feature=>(p.buyerFeatures||[]).includes(feature)))return false;if(buyerQuickFilter==='Hot'&&p.temperature!=='Hot')return false;if(buyerQuickFilter==='Warm'&&p.temperature!=='Warm')return false;return true}
function filteredBuyers(){const q=cleanText($('#prospectSearch')?.value||'',120).toLowerCase(),source=buyerBrowseMode==='archived'?archivedBuyerProspects():activeBuyerProspects();return source.filter(p=>buyerMatchesFilters(p)).filter(p=>!q||[p.name,p.phone,p.email,p.address,p.buyerStage,p.temperature,p.buyerPropertyType,...buyerPositionTags(p),buyerBudgetText(p.buyerBudgetMin,p.buyerBudgetMax),...(p.buyerSuburbs||[]),...(p.buyerFeatures||[])].join(' ').toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name,'en-AU',{sensitivity:'base'})||(Number(b.updatedAt)||0)-(Number(a.updatedAt)||0))}
function buyerPositionTags(p={}){const tags=(Array.isArray(p.buyerPositionTags)?p.buyerPositionTags:[]).filter(tag=>BUYER_POSITION_TAGS.includes(tag));if(p.buyerSeller&&!tags.includes('Buyer Seller'))tags.unshift('Buyer Seller');return[...new Set(tags)]}
function buyerPositionTagsMarkup(p={},compact=false){const tags=buyerPositionTags(p),visible=compact?tags.slice(0,1):tags,extra=compact?Math.max(0,tags.length-visible.length):0;return visible.map(tag=>`<em class="buyer-position-tag">${escapeHtml(tag)}</em>`).join('')+(extra?`<em class="buyer-position-tag buyer-position-more">+${extra}</em>`:'')}
function buyerPositionEditorMarkup(selected=[]){const set=new Set(selected);return BUYER_POSITION_TAGS.map(tag=>`<button type="button" class="${set.has(tag)?'active':''}" data-buyer-position-tag="${escapeHtml(tag)}" aria-pressed="${set.has(tag)}">${escapeHtml(tag)}</button>`).join('')}
function buyerNextAction(p={}){const due=validDateKey(p.nextFollowUp)?p.nextFollowUp:'';if(!due)return{label:'No follow-up set',className:'unset'};if(due<todayKey()){const daysOverdue=Math.max(1,Math.round((parseKey(todayKey())-parseKey(due))/86400000));return{label:`Overdue ${daysOverdue} day${daysOverdue===1?'':'s'}`,className:'overdue'}}if(due===todayKey())return{label:'Follow up today',className:'today'};const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);if(due===dateKey(tomorrow))return{label:'Follow up tomorrow',className:'scheduled'};return{label:`Follow up ${fmtDate(due)}`,className:'scheduled'}}
function buyerCard(p){
  const phone=primaryProspectPhone(p),sms=phone?`sms:${phone.replace(/[^+\d]/g,'')}`:'#',criteria=buyerCardCriteriaText(p),location=buyerCardLocationText(p),next=buyerNextAction(p),archived=prospectBuyerArchived(p),matches=archived?[]:buyerOpenPropertyMatches(p),matchAlert=matches.length?`<span class="buyer-match-alert"><b>${matches.length}</b>${matches.length===1?'property match':'property matches'}</span>`:'',timeAlert=matches.length?buyerMatchTimeAlert(p,matches[0]):null,timeAlertMarkup=buyerMatchTimeAlertMarkup(timeAlert,'buyer-card-time-alert'),sellerOpportunity=matches.length?buyerSellerOpportunityFor(p,matches[0]):null,sellerAlert=sellerOpportunity?`<span class="buyer-seller-opportunity-alert ${escapeHtml(sellerOpportunity.state)}"><b>↗</b><span>Buyer + seller<small>${escapeHtml(sellerOpportunity.state==='confirmed'?'Confirmed move':'Conversation angle')}</small></span></span>`:'';
  return`<article class="buyer-card${archived?' buyer-card-archived':''}${matches.length?' has-buyer-matches':''}${timeAlert?' has-buyer-time-alert':''}${sellerOpportunity?' has-buyer-seller-opportunity':''}"><button type="button" data-open-buyer="${p.id}" class="buyer-row-profile"><span class="buyer-row-head"><span class="buyer-row-identity"><strong>${escapeHtml(p.name)}</strong>${matchAlert}</span>${archived?'<em class="buyer-archived-pill">Archived</em>':`<em class="prospect-temp temp-${p.temperature.toLowerCase()}">${escapeHtml(p.temperature)}</em>`}</span><span class="buyer-row-brief">${escapeHtml(criteria)}</span><span class="buyer-row-location">${escapeHtml(location)}</span>${timeAlertMarkup}${sellerAlert}<span class="buyer-row-next buyer-next-${next.className}"><span>${escapeHtml(next.label)}</span>${buyerPositionTags(p).length?`<span class="buyer-position-summary">${buyerPositionTagsMarkup(p,true)}</span>`:''}</span></button>${archived?`<div class="buyer-card-actions buyer-card-restore"><button type="button" data-restore-buyer="${p.id}">Restore buyer</button></div>`:`<div class="buyer-card-actions"><button type="button" data-call-buyer="${p.id}" ${phone?'':'disabled'} aria-label="Call ${escapeHtml(p.name)}">Call</button><a href="${sms}" class="${phone?'':'disabled'}" aria-label="SMS ${escapeHtml(p.name)}">SMS</a><button type="button" data-buyer-followup="${p.id}" aria-label="Add follow-up for ${escapeHtml(p.name)}">Follow up</button></div>`}</article>`
}
function renderBuyerProfiles(){const host=$('#buyerProfileList');if(!host)return;const list=filteredBuyers(),source=buyerBrowseMode==='archived'?archivedBuyerProspects():activeBuyerProspects(),total=source.length,count=buyerFilterCount(),hasAnyFilter=count>0||buyerQuickFilter!=='All'||Boolean(cleanText($('#prospectSearch')?.value||'',120)),toggle=$('#toggleArchivedBuyers');$('#buyerListMeta').textContent=buyerBrowseMode==='archived'?(hasAnyFilter?`${list.length} of ${total} archived buyer${total===1?'':'s'}`:`${total} archived buyer${total===1?'':'s'} · A–Z`):(hasAnyFilter?`${list.length} of ${total} buyer${total===1?'':'s'}`:`${total} buyer${total===1?'':'s'} · A–Z`);if(toggle){toggle.textContent=buyerBrowseMode==='archived'?'Back to buyers':`Archived${archivedBuyerProspects().length?` · ${archivedBuyerProspects().length}`:''}`;toggle.setAttribute('aria-pressed',String(buyerBrowseMode==='archived'))}$('#buyerFilterCount').textContent=count;$('#buyerFilterCount').classList.toggle('active',count>0);$('#toggleBuyerFilters')?.classList.toggle('active',count>0);$('#clearBuyerFilters').classList.toggle('hidden',!hasAnyFilter);$$('[data-buyer-quick-filter]').forEach(button=>button.classList.toggle('active',button.dataset.buyerQuickFilter===buyerQuickFilter));if(list.length){host.innerHTML=list.map(buyerCard).join('');return}if(buyerBrowseMode==='archived'){host.innerHTML=hasAnyFilter&&total?'<div class="prospect-empty buyer-empty-state"><strong>No matching archived buyers</strong><small>Adjust the search or filters to widen the result.</small></div>':'<div class="prospect-empty buyer-empty-state"><strong>No archived buyers</strong><small>Buyers you archive will remain here with their history intact.</small></div>';return}if(hasAnyFilter){host.innerHTML='<div class="prospect-empty buyer-empty-state"><strong>No matching buyers</strong><small>Adjust the search or filters to widen the result.</small></div>';return}host.innerHTML='<div class="prospect-empty buyer-empty-state"><strong>No buyers yet</strong><small>Add a buyer to start building their brief and next action.</small><button class="secondary" type="button" data-add-buyer-empty>Add buyer</button></div>'}
function ensureBuyerSuburbDatalist(){const host=$('#buyerSydneySuburbs');if(host&&!host.dataset.ready){host.innerHTML=SYDNEY_SUBURBS.map(suburb=>`<option value="${escapeHtml(suburb)}"></option>`).join('');host.dataset.ready='1'}}
function syncBuyerFilterControls(){ensureBuyerSuburbDatalist();const f=buyerFilterState;if($('#buyerFilterSuburb'))$('#buyerFilterSuburb').value=f.suburb;if($('#buyerFilterBudgetMin'))$('#buyerFilterBudgetMin').value=String(f.budgetMin);if($('#buyerFilterBudgetMinLabel'))$('#buyerFilterBudgetMinLabel').textContent=buyerRangeLabel(f.budgetMin);[['buyerFilterBedrooms','bedrooms'],['buyerFilterBathrooms','bathrooms'],['buyerFilterCars','cars'],['buyerFilterPropertyType','propertyType'],['buyerFilterStage','stage'],['buyerFilterTemperature','temperature'],['buyerFilterPosition','position'],['buyerFilterFollowUp','followUp']].forEach(([id,key])=>{if($('#'+id))$('#'+id).value=String(f[key]??'')});$$('[data-buyer-filter-feature]').forEach(button=>{const active=f.features.has(button.dataset.buyerFilterFeature);button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))})}
function clearBuyerFilters(){buyerFilterState=defaultBuyerFilters();buyerQuickFilter='All';const search=$('#prospectSearch');if(search&&prospectSection==='buyers')search.value='';syncBuyerFilterControls();renderBuyerProfiles();updateTopbar()}
function setBuyerFilterFromControls(){const threshold=Math.max(0,Number($('#buyerFilterBudgetMin')?.value)||0);buyerFilterState={...buyerFilterState,budgetMin:threshold,budgetMax:BUYER_BUDGET_MAX,suburb:cleanText($('#buyerFilterSuburb')?.value||'',120),bedrooms:Number($('#buyerFilterBedrooms')?.value)||0,bathrooms:Number($('#buyerFilterBathrooms')?.value)||0,cars:Number($('#buyerFilterCars')?.value)||0,propertyType:cleanText($('#buyerFilterPropertyType')?.value||'',30),stage:cleanText($('#buyerFilterStage')?.value||'',30),temperature:cleanText($('#buyerFilterTemperature')?.value||'',20),position:cleanText($('#buyerFilterPosition')?.value||'',50),followUp:cleanText($('#buyerFilterFollowUp')?.value||'',20)};syncBuyerFilterControls();renderBuyerProfiles();updateTopbar()}
function setBuyerBrowseMode(mode='active'){buyerBrowseMode=mode==='archived'?'archived':'active';buyerFilterState=defaultBuyerFilters();buyerQuickFilter='All';const search=$('#prospectSearch');if(search)search.value='';$('#buyerAdvancedFilters')?.classList.add('hidden');$('#toggleBuyerFilters')?.setAttribute('aria-expanded','false');syncBuyerFilterControls();renderBuyerProfiles();updateTopbar()}
function buyerChoiceMarkup(target,current,values,labels={}){return`<input type="hidden" name="${target}" value="${escapeHtml(String(current||0))}"><div class="buyer-segment" data-buyer-segment="${target}">${values.map(value=>`<button type="button" class="${String(current||0)===String(value)?'active':''}" data-buyer-choice="${target}" data-buyer-choice-value="${value}">${escapeHtml(labels[value]||String(value))}</button>`).join('')}</div>`}
function buyerFeatureMarkup(selected=[]){const set=new Set(selected);return BUYER_FEATURES.map(feature=>`<button type="button" class="${set.has(feature)?'active':''}" data-buyer-feature="${escapeHtml(feature)}" aria-pressed="${set.has(feature)}">${escapeHtml(feature)}</button>`).join('')}
function buyerPropertyTypeMarkup(current=''){return BUYER_PROPERTY_TYPES.map(type=>`<button type="button" class="${current===type?'active':''}" data-buyer-property-type="${escapeHtml(type)}" aria-pressed="${current===type}">${escapeHtml(type)}</button>`).join('')}
function renderBuyerSuburbChips(form){const host=form?.querySelector('[data-buyer-suburb-chips]');if(!host)return;const suburbs=Array.isArray(form._buyerSuburbs)?form._buyerSuburbs:[];host.innerHTML=suburbs.length?suburbs.map((suburb,index)=>`<span>${escapeHtml(suburb)}<button type="button" data-remove-buyer-suburb="${index}" aria-label="Remove ${escapeHtml(suburb)}">×</button></span>`).join(''):'<small>Add one or more suburbs.</small>'}
function buyerSuburbMatches(query='',selected=[]){const q=cleanText(query,100).toLowerCase();if(!q)return[];const selectedSet=new Set((selected||[]).map(value=>value.toLowerCase()));return SYDNEY_SUBURBS.filter(suburb=>!selectedSet.has(suburb.toLowerCase())&&suburb.toLowerCase().includes(q)).sort((a,b)=>{const al=a.toLowerCase(),bl=b.toLowerCase(),as=al.startsWith(q),bs=bl.startsWith(q);return as===bs?a.localeCompare(b,'en-AU',{sensitivity:'base'}):as?-1:1}).slice(0,8)}
function renderBuyerSuburbSuggestions(form){const input=form?.querySelector('[data-buyer-suburb-input]'),host=form?.querySelector('[data-buyer-suburb-suggestions]');if(!input||!host)return;const matches=buyerSuburbMatches(input.value,form._buyerSuburbs||[]);host.innerHTML=matches.map(suburb=>`<button type="button" data-select-buyer-suburb="${escapeHtml(suburb)}">${escapeHtml(suburb)}</button>`).join('');host.classList.toggle('hidden',!matches.length)}
function addBuyerSuburb(form,forcedValue=''){const input=form?.querySelector('[data-buyer-suburb-input]'),raw=cleanText(forcedValue||input?.value||'',100).replace(/^,|,$/g,'').trim();if(!raw)return;const canonical=SYDNEY_SUBURBS.find(suburb=>suburb.toLowerCase()===raw.toLowerCase())||raw;form._buyerSuburbs=Array.from(new Set([...(form._buyerSuburbs||[]),canonical])).slice(0,12);if(input)input.value='';renderBuyerSuburbChips(form);renderBuyerSuburbSuggestions(form);input?.focus({preventScroll:true})}
function prospectsMatchingIdentity({phone='',name='',address=''}={},excludeId=''){
  const digits=normalisedPhoneDigits(phone),nameKey=normalisePlace(name),addressKey=normalisePlace(formatProspectAddress(address));
  return prospects.filter(p=>p.id!==excludeId).filter(p=>{
    if(digits.length>=8)return normalisedPhoneDigits(primaryProspectPhone(p))===digits;
    return Boolean(nameKey&&addressKey&&normalisePlace(p.name)===nameKey&&normalisePlace(formatProspectAddress(p.address||p.company,p.suburb))===addressKey);
  }).sort((a,b)=>Number(prospectHasContactProfile(b))-Number(prospectHasContactProfile(a))||Number(Boolean(pipelineTimeframeForProspect(b)))-Number(Boolean(pipelineTimeframeForProspect(a)))||(Number(b.updatedAt)||0)-(Number(a.updatedAt)||0));
}
function buyerExistingContactCandidates(query=''){
  const q=normalisePlace(query),terms=q.split(' ').filter(Boolean);
  return activeProspects().filter(p=>!prospectHasActiveBuyerRole(p)&&!prospectBuyerArchived(p)).filter(p=>!terms.length||terms.every(term=>normalisePlace([p.name,primaryProspectPhone(p),p.address,p.suburb,p.source,p.stage].join(' ')).includes(term))).sort((a,b)=>Number(Boolean(pipelineTimeframeForProspect(b)))-Number(Boolean(pipelineTimeframeForProspect(a)))||a.name.localeCompare(b.name,'en-AU',{sensitivity:'base'})).slice(0,6);
}
function buyerExistingContactPickerMarkup(){return`<section class="buyer-existing-contact-picker"><div><span>USE AN EXISTING CONTACT</span><small>Seller pipeline and contact records stay linked to one profile.</small></div><input type="search" data-buyer-existing-search placeholder="Search contacts or seller pipeline" autocomplete="off"><div class="buyer-existing-contact-results" data-buyer-existing-results></div></section>`}
function renderBuyerExistingContactResults(form){const input=form?.querySelector('[data-buyer-existing-search]'),host=form?.querySelector('[data-buyer-existing-results]');if(!input||!host)return;const results=buyerExistingContactCandidates(input.value);host.innerHTML=results.length?results.map(p=>{const pipeline=pipelineTimeframeForProspect(p),address=formatProspectAddress(p.address||p.company,p.suburb)||primaryProspectPhone(p)||'Contact details not added';return`<button type="button" data-use-contact-as-buyer="${escapeHtml(p.id)}"><span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(address)}</small></span><em>${escapeHtml(pipeline?`${pipeline} seller`:'Contact')}</em><b aria-hidden="true">›</b></button>`}).join(''):`<small class="buyer-existing-contact-empty">${input.value?'No matching contacts':'No contacts are available to link yet.'}</small>`}
function syncBuyerSellerEditorFields(form){const active=Boolean(form?.querySelector('[data-buyer-position-tag="Buyer Seller"].active')),fields=form?.querySelector('[data-buyer-seller-fields]');fields?.classList.toggle('hidden',!active)}
function buyerProfileSnapshot(p={}){return{buyerStage:BUYER_STAGES.includes(p.buyerStage)?p.buyerStage:'Looking',buyerBudgetMin:Math.max(0,Number(p.buyerBudgetMin)||0),buyerBudgetMax:Math.max(0,Number(p.buyerBudgetMax)||0),buyerBedrooms:Math.max(0,Number(p.buyerBedrooms)||0),buyerBathrooms:Math.max(0,Number(p.buyerBathrooms)||0),buyerCars:Math.max(0,Number(p.buyerCars)||0),buyerSuburbs:[...(p.buyerSuburbs||[])],buyerPropertyType:p.buyerPropertyType||'',buyerFeatures:[...(p.buyerFeatures||[])],buyerPositionTags:[...buyerPositionTags(p)],buyerSeller:Boolean(p.buyerSeller),buyerPurchaseAddress:p.buyerPurchaseAddress||'',buyerPurchasePrice:Math.max(0,Number(p.buyerPurchasePrice)||0),buyerPurchaseDate:p.buyerPurchaseDate||'',buyerConvertedAt:Number(p.buyerConvertedAt)||0,buyerPropertyMatches:normaliseBuyerPropertyMatches(p.buyerPropertyMatches)}}
function mergedProspectNotes(primary='',secondary=''){const first=cleanText(primary,3000),second=cleanText(secondary,3000);if(!second||normalisePlace(first)===normalisePlace(second))return first;if(!first)return second;return cleanText(`${first}\n\nBuyer context\n${second}`,3000)}
function hotterProspectTemperature(a='Cold',b='Cold'){const rank={Cold:0,Warm:1,Hot:2};return(rank[b]??0)>(rank[a]??0)?b:a}
function earliestProspectFollowUp(...dates){return dates.filter(validDateKey).sort()[0]||''}
function mergeBuyerDuplicateIntoContact(contact,buyer){
  if(!contact||!buyer||contact.id===buyer.id)return contact||buyer;
  const now=Date.now(),buyerFields=buyerProfileSnapshot(buyer),buyerArchived=prospectBuyerArchived(buyer),buyerPurchased=buyerFields.buyerStage==='Purchased',tags=Array.from(new Set([...(contact.tags||[]),...(buyer.tags||[])])).slice(0,12),positionTags=Array.from(new Set(['Buyer Seller',...buyerFields.buyerPositionTags])).filter(tag=>BUYER_POSITION_TAGS.includes(tag)),mergedProspectIds=Array.from(new Set([...(contact.mergedProspectIds||[]),...(buyer.mergedProspectIds||[]),buyer.id])).filter(id=>id&&id!==contact.id).slice(0,50);
  const merged=normaliseProspect({...contact,...buyerFields,id:contact.id,name:contact.name||buyer.name,phone:contact.phone||buyer.phone,email:contact.email||buyer.email,address:contact.address||buyer.address,company:contact.company||buyer.company,suburb:contact.suburb||buyer.suburb,tags,notes:mergedProspectNotes(contact.notes,buyer.notes),temperature:hotterProspectTemperature(contact.temperature,buyer.temperature),temperatureManual:true,motivation:Math.max(Number(contact.motivation)||1,Number(buyer.motivation)||1),motivationManual:Boolean(contact.motivationManual||buyer.motivationManual),lastContact:[contact.lastContact,buyer.lastContact].filter(validDateKey).sort().at(-1)||'',nextFollowUp:earliestProspectFollowUp(contact.nextFollowUp,buyer.nextFollowUp),buyerProfileActive:!buyerArchived&&!buyerPurchased,buyerProfileArchived:buyerArchived,buyerStage:buyerFields.buyerStage,buyerPositionTags:positionTags,buyerSeller:true,sellerProfileActive:true,mergedProspectIds,dataCreditedAt:Number(contact.dataCreditedAt)||Number(buyer.dataCreditedAt)||0,createdAt:Math.min(Number(contact.createdAt)||now,Number(buyer.createdAt)||now),updatedAt:now});
  prospects=prospects.filter(item=>item.id!==buyer.id).map(item=>item.id===contact.id?merged:item);
  prospectInteractions=normaliseProspectInteractions(prospectInteractions.map(item=>item.prospectId===buyer.id?{...item,prospectId:contact.id}:item)).filter((item,index,list)=>list.findIndex(other=>other.id===item.id)===index);
  if(!prospectInteractions.some(item=>item.prospectId===contact.id&&item.type==='Profile'&&item.outcome==='Buyer + seller unified'))prospectInteractions.push({id:prospectId(),prospectId:contact.id,date:todayKey(),at:now,type:'Profile',outcome:'Buyer + seller unified',note:'Buyer requirements and seller pipeline were linked to one contact profile.',nextFollowUp:''});
  return merged
}
function resolveBuyerCanonical(data={},requestedId=''){
  const requested=requestedId?prospectById(requestedId):null,matches=prospectsMatchingIdentity(data,requested?.id||''),candidates=[requested,...matches].filter(Boolean).filter((item,index,list)=>list.findIndex(other=>other.id===item.id)===index);let canonical=candidates.find(prospectHasContactProfile)||requested||candidates.find(prospectHasActiveBuyerRole)||candidates[0]||null,unified=false;
  if(canonical&&prospectHasContactProfile(canonical)){for(const candidate of candidates){if(candidate.id===canonical.id||!prospectHasBuyerProfile(candidate))continue;canonical=mergeBuyerDuplicateIntoContact(canonical,candidate);unified=true}}
  return{record:canonical,unified}
}
function buyerEditorForm(p={},prefill={}){
  const current={...p,...prefill},max=buyerMaximumBudget(current),stage=BUYER_STAGES.includes(current.buyerStage)&&current.buyerStage!=='Purchased'?current.buyerStage:'Looking',temperature=['Cold','Warm','Hot'].includes(current.temperature)?current.temperature:'Warm',linkingExisting=Boolean(p.id&&!prospectHasActiveBuyerRole(p)),currentPositionTags=buyerPositionTags(current);if(linkingExisting&&!currentPositionTags.includes('Buyer Seller'))currentPositionTags.unshift('Buyer Seller');const buyerSeller=currentPositionTags.includes('Buyer Seller'),sellerTimeframe=SELLING_TIMEFRAMES.includes(current.sellingTimeframe)?current.sellingTimeframe:'',editorTitle=linkingExisting?'Add buyer brief':p.id?'Edit buyer':'New buyer',introTitle=linkingExisting?'Connect both sides of the move':p.id?'Keep the brief current':'Capture the brief quickly',saveLabel=linkingExisting?'Add buyer profile':p.id?'Save buyer':'Add buyer';
  const linkedContext=linkingExisting?`<section class="buyer-linked-contact-banner"><span>EXISTING CONTACT</span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(pipelineTimeframeForProspect(p)?`${pipelineTimeframeForProspect(p)} seller pipeline · same contact history`:'Contact database · same contact history')}</small></section>`:'';
  return`<form id="buyerEditor" class="buyer-editor glass"><div class="prospect-detail-nav buyer-detail-nav"><button type="button" data-close-buyer>‹ Back</button><strong>${editorTitle}</strong><span></span></div><div class="buyer-editor-intro"><span>BUYER BRIEF</span><h2>${introTitle}</h2><p>${linkingExisting?'Their seller pipeline, contact history and buyer requirements will stay on one profile.':'Keep the essentials simple. Add more detail only where it helps the search.'}</p></div>${p.id?'':buyerExistingContactPickerMarkup()}${linkedContext}<div class="prospect-form-grid"><label>Name<input name="name" value="${escapeHtml(current.name||'')}" autocomplete="name" required></label><label>Mobile<input name="phone" type="tel" inputmode="tel" value="${escapeHtml(current.phone||'')}" autocomplete="tel"></label></div><label>Current address <small>Optional</small><input name="address" value="${escapeHtml(current.address||'')}" autocomplete="street-address"></label><section class="buyer-editor-section buyer-budget-section"><div class="buyer-editor-section-head"><span>MAXIMUM BUDGET</span><strong id="buyerBudgetMaxLabel">${buyerBudgetEditorLabel(max)}</strong></div><input id="buyerBudgetMax" name="buyerBudgetMax" class="buyer-budget-slider" type="range" min="0" max="5000000" step="50000" value="${max}" aria-label="Maximum buyer budget"></section><section class="buyer-editor-section"><span class="buyer-field-label">SUBURBS</span><div class="buyer-suburb-picker"><div class="buyer-suburb-entry"><input type="search" data-buyer-suburb-input placeholder="Add suburb" autocomplete="off"><button type="button" data-add-buyer-suburb>Add</button></div><div class="buyer-suburb-suggestions hidden" data-buyer-suburb-suggestions></div></div><div class="buyer-suburb-chips" data-buyer-suburb-chips></div></section><section class="buyer-editor-section"><span class="buyer-field-label">CONFIGURATION</span><div class="buyer-config-grid"><div><small>Bedrooms</small>${buyerChoiceMarkup('buyerBedrooms',current.buyerBedrooms||0,[0,1,2,3,4,5],{0:'Any'})}</div><div><small>Bathrooms</small>${buyerChoiceMarkup('buyerBathrooms',current.buyerBathrooms||0,[0,1,2,3,4],{0:'Any'})}</div><div><small>Cars</small>${buyerChoiceMarkup('buyerCars',current.buyerCars||0,[0,1,2,3],{0:'Any'})}</div></div></section><section class="buyer-editor-section buyer-position-section"><span class="buyer-field-label">POSITION</span><div class="buyer-option-tags buyer-position-tags">${buyerPositionEditorMarkup(currentPositionTags)}</div><small class="buyer-position-help">Select Buyer Seller to connect their buying and selling workflows.</small></section><section class="buyer-editor-section buyer-seller-fields ${buyerSeller?'':'hidden'}" data-buyer-seller-fields><div class="buyer-editor-section-head"><span>SELLER SIDE</span><strong>Same contact</strong></div><label>Selling timeframe<select name="sellerTimeframe"><option value="">Not qualified yet</option>${SELLING_TIMEFRAMES.map(value=>`<option value="${value}" ${sellerTimeframe===value?'selected':''}>${value}</option>`).join('')}</select></label><small>The current address, seller pipeline and buyer brief all remain attached to this profile.</small></section><section class="buyer-editor-section"><span class="buyer-field-label">PROPERTY TYPE</span><div class="buyer-option-tags buyer-property-types">${buyerPropertyTypeMarkup(current.buyerPropertyType||'')}</div></section><section class="buyer-editor-section"><span class="buyer-field-label">MUST-HAVES</span><div class="buyer-option-tags buyer-feature-tags">${buyerFeatureMarkup(current.buyerFeatures||[])}</div></section><section class="buyer-editor-section"><span class="buyer-field-label">JOURNEY</span><div class="prospect-form-grid"><label>Stage<select name="buyerStage">${['Looking','Inspecting','Negotiating'].map(value=>`<option ${stage===value?'selected':''}>${value}</option>`).join('')}</select></label><label>Temperature<select name="temperature">${['Cold','Warm','Hot'].map(value=>`<option ${temperature===value?'selected':''}>${value}</option>`).join('')}</select></label></div></section><label>Contact notes<textarea name="notes" rows="4" placeholder="Anything else that matters to the move">${escapeHtml(current.notes||'')}</textarea></label><button class="primary buyer-save-button" type="submit">${saveLabel}</button></form>`
}
function openBuyerEditor(id='',prefill={},context=null){const p=id?prospectById(id):{},canonicalId=p?.id||'';activeProspectId=canonicalId||null;pendingBuyerEditorContext=context;setProspectorSection('buyers');$('#prospectingDashboard').classList.add('hidden');$('#prospectingSession').classList.add('hidden');$('#prospectDetail').classList.remove('hidden');$('#prospectDetail').innerHTML=buyerEditorForm(p,prefill);ensureBuyerSuburbDatalist();const form=$('#buyerEditor');form._buyerSuburbs=[...(p?.buyerSuburbs||prefill.buyerSuburbs||[])];renderBuyerSuburbChips(form);renderBuyerExistingContactResults(form);syncBuyerSellerEditorFields(form);if(!canonicalId&&!prefill.name&&!prefill.phone)requestAnimationFrame(()=>form.querySelector('[data-buyer-existing-search]')?.focus({preventScroll:true}))}
function findBuyerByPhone(phone='',excludeId=''){const matches=prospectsMatchingIdentity({phone},excludeId);return matches.find(prospectHasActiveBuyerRole)||matches.find(prospectHasContactProfile)||matches[0]||null}
async function upsertBuyer(data,id='',context=null){
  const resolution=resolveBuyerCanonical(data,id),existing=resolution.record,wasBuyer=prospectHasActiveBuyerRole(existing),existingIsContact=prospectHasContactProfile(existing),createdAt=existing?.createdAt||Date.now(),dataCreditedAt=existing?.dataCreditedAt||(!existing?createdAt:0),requestedTags=(Array.isArray(data.buyerPositionTags)?data.buyerPositionTags:[]).filter(tag=>BUYER_POSITION_TAGS.includes(tag)),buyerSeller=Boolean(data.buyerSeller||existingIsContact||requestedTags.includes('Buyer Seller')),buyerPositionTags=Array.from(new Set([...(buyerSeller?['Buyer Seller']:[]),...requestedTags])).filter(tag=>BUYER_POSITION_TAGS.includes(tag)),requestedTimeframe=SELLING_TIMEFRAMES.includes(data.sellingTimeframe)?data.sellingTimeframe:'',sellingTimeframe=requestedTimeframe||(existingIsContact?existing?.sellingTimeframe||'':''),recordId=existing?.id||prospectId(),record=normaliseProspect({...existing,...data,id:recordId,recordType:existing?.recordType==='buyer'||!existing?'buyer':undefined,source:existing?.source||data.source||'Buyer',stage:existingIsContact?existing.stage||'Nurture':existing?.stage||'Nurture',sellingTimeframe,buyerProfileActive:true,buyerProfileArchived:false,buyerPositionTags,buyerSeller,sellerProfileActive:Boolean(existingIsContact||buyerSeller||existing?.sellerProfileActive),temperatureManual:true,dataCreditedAt,createdAt,updatedAt:Date.now(),lastContact:context?.outcome&&context.outcome!=='Cancelled'?todayKey():(existing?.lastContact||'')});
  if(existing)prospects=prospects.map(item=>item.id===record.id?record:item);else prospects.unshift(record);
  refreshBuyerPropertyMatches(marketPulseEvents);
  if(context?.outcome&&context.outcome!=='Cancelled'&&context.interactionId&&!prospectInteractions.some(item=>item.id===context.interactionId))prospectInteractions.push({id:context.interactionId,prospectId:record.id,date:todayKey(),at:Number(context.at)||Date.now(),type:'Call',outcome:cleanText(context.outcome,80),note:'Added to buyer database from call outcome.',nextFollowUp:''});
  await saveProspecting({render:false,awaitCloud:false});
  if(!existing)try{await creditNewProspectData(record,{awaitCloud:false})}catch(err){console.error('Buyer Data credit is saved locally and pending sync',err)}
  const returnToBuyerSession=Boolean(context?.returnToBuyerSession&&buyerSession.active);if(pendingBuyerEditorContext===context)pendingBuyerEditorContext=null;
  return{record,reusedExisting:Boolean(existing),addedBuyerRole:Boolean(existing&&!wasBuyer),unified:resolution.unified,returnToBuyerSession}
}
function buyerRequirementRows(p){const tags=buyerTagsForCard(p),position=buyerPositionTags(p);return`<section class="buyer-detail-section"><div class="buyer-detail-section-head"><span>BUYER BRIEF</span><h3>Search criteria</h3></div><div class="buyer-detail-requirements"><div><span>BUDGET</span><strong>${escapeHtml(buyerBudgetText(p.buyerBudgetMin,p.buyerBudgetMax))}</strong></div><div><span>CONFIGURATION</span><strong>${escapeHtml(buyerConfigText(p))}</strong></div>${position.length?`<div class="wide buyer-detail-position"><span>POSITION</span><strong class="buyer-detail-position-tags">${buyerPositionTagsMarkup(p)}</strong></div>`:''}<div class="wide"><span>SUBURBS</span><strong>${escapeHtml((p.buyerSuburbs||[]).join(' · ')||'Not set')}</strong></div><div class="wide"><span>PROPERTY</span><strong>${escapeHtml(tags.join(' · ')||'Requirements not set')}</strong></div></div></section>`}
function buyerNextActionMarkup(p){const next=buyerNextAction(p),detail=p.nextFollowUp?`Scheduled for ${fmtDate(p.nextFollowUp)}`:'Set a clear next step for this buyer.';return`<section class="buyer-detail-next-action buyer-next-${next.className}"><div><span>NEXT ACTION</span><strong>${escapeHtml(next.label)}</strong><small>${escapeHtml(detail)}</small></div><button type="button" data-buyer-followup="${p.id}">${p.nextFollowUp?'Update':'Set follow-up'}</button></section>`}
function buyerHistoryMarkup(history=[]){return history.length?history.map(x=>`<article><i></i><div><strong>${escapeHtml(x.outcome||x.type)}</strong><small>${fmtDate(x.date)} · ${new Date(x.at).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})}</small>${x.note?`<p>${escapeHtml(x.note)}</p>`:''}${x.nextFollowUp?`<em>Follow-up: ${fmtDate(x.nextFollowUp)}</em>`:''}${marketFollowUpHistoryMarkup(x)}</div></article>`).join(''):'<div class="prospect-empty"><strong>No buyer activity yet</strong><small>Calls and follow-ups will build the timeline here.</small></div>'}
function buyerDetailContactMarkup(p={},phone=''){const currentAddress=cleanText(p.address,240)?formatProspectAddress(p.address,p.suburb):'',mobile=phone?displayDialNumber(phone):'No mobile added',lines=[mobile,currentAddress].filter(Boolean);return`<div class="buyer-detail-contact">${lines.map(line=>`<small>${escapeHtml(line)}</small>`).join('')}</div>`}
function buyerSellerPipelineMarkup(p={}){if(!prospectHasContactProfile(p))return'';const timeframe=pipelineTimeframeForProspect(p),address=formatProspectAddress(p.address||p.company,p.suburb)||'Current property not added',followUp=p.nextFollowUp?fmtDate(p.nextFollowUp):'Not set';return`<section class="buyer-linked-seller-profile"><div><span>SELLER SIDE</span><h3>Buyer + Seller</h3></div><dl><div><dt>CURRENT HOME</dt><dd>${escapeHtml(address)}</dd></div><div><dt>SELLING TIMEFRAME</dt><dd>${escapeHtml(timeframe||'Not qualified')}</dd></div><div><dt>NEXT FOLLOW-UP</dt><dd>${escapeHtml(followUp)}</dd></div></dl><button type="button" data-open-seller-profile="${escapeHtml(p.id)}">Open seller profile</button></section>`}
function buyerSellerOpportunityMarkup(p={}){
  const match=buyerOpenPropertyMatches(p)[0],opportunity=match?buyerSellerOpportunityFor(p,match):null;if(!opportunity)return'';
  return`<section class="buyer-seller-opportunity ${escapeHtml(opportunity.state)}"><div class="buyer-seller-opportunity-head"><div><span>MOVE OPPORTUNITY</span><h3>Connect both sides of the move</h3></div><b>${escapeHtml(opportunity.state==='confirmed'?'Confirmed':'Potential')}</b></div><div class="buyer-seller-property-pair"><div><span>CURRENT HOME</span><strong>${escapeHtml(opportunity.currentHome)}</strong></div><i>→</i><div><span>MATCHED PROPERTY</span><strong>${escapeHtml(opportunity.matchedProperty)}</strong></div></div><p>${escapeHtml(opportunity.conversationAngle)}</p><small>${escapeHtml(opportunity.evidence)}</small></section>`
}
function buyerPropertyMatchesMarkup(p={}){
  const matches=buyerOpenPropertyMatches(p);if(!matches.length)return'';const phone=primaryProspectPhone(p);
  return`<section class="buyer-property-matches"><div class="buyer-property-matches-head"><div><span>MARKETPULSE MATCHES</span><h3>${matches.length} propert${matches.length===1?'y':'ies'} worth discussing</h3></div><b>${matches.length}</b></div><div class="buyer-property-match-list">${matches.map(match=>{const config=[match.propertyType,match.bedrooms?`${match.bedrooms} bed`:'',match.bathrooms?`${match.bathrooms} bath`:''].filter(Boolean).join(' · '),price=buyerMatchPriceLabel(match),timeAlert=buyerMatchTimeAlert(p,match);return`<article class="buyer-match-${escapeHtml(match.status)}${timeAlert?' has-time-alert':''}"><div class="buyer-match-labels"><span class="buyer-match-event">${escapeHtml(match.eventType)}</span><span class="buyer-match-state">${escapeHtml(buyerMatchStateLabel(match))}</span></div>${buyerMatchTimeAlertMarkup(timeAlert,'buyer-detail-time-alert')}<h4>${escapeHtml(match.address)}</h4><p>${escapeHtml(match.suburb)}${price?` · ${escapeHtml(price)}`:''}</p><small>${escapeHtml(config)}</small><em>${escapeHtml(match.reason)}</em><div class="buyer-match-actions"><button type="button" data-buyer-match-call="${escapeHtml(p.id)}" data-match-id="${escapeHtml(match.id)}" ${phone?'':'disabled'}>Call</button><button type="button" data-buyer-match-sms="${escapeHtml(p.id)}" data-match-id="${escapeHtml(match.id)}" ${phone?'':'disabled'}>SMS</button><button type="button" data-open-buyer-match-outcome="${escapeHtml(p.id)}" data-match-id="${escapeHtml(match.id)}">Outcome</button></div></article>`}).join('')}</div></section>`
}
function renderBuyerDetail(id){
  const p=prospectById(id);if(!prospectHasBuyerProfile(p))return closeProspectDetail();activeProspectId=p.id;
  const history=interactionsFor(p.id),phone=primaryProspectPhone(p),sms=phone?`sms:${phone.replace(/[^+\d]/g,'')}`:'#',archived=prospectBuyerArchived(p),initials=p.name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
  const actions=archived?`<div class="buyer-detail-restore"><button class="primary" type="button" data-restore-buyer="${p.id}">Restore buyer</button></div>`:`<div class="prospect-quick-actions buyer-detail-actions"><button type="button" data-call-buyer="${p.id}" class="${phone?'':'disabled'}">Call</button><a href="${sms}" class="${phone?'':'disabled'}">SMS</a><button type="button" data-buyer-followup="${p.id}">Follow up</button><button type="button" data-edit-buyer="${p.id}">Update</button></div>${buyerNextActionMarkup(p)}`;
  const lifecycle=archived?'':`<div class="buyer-lifecycle-actions"><button class="primary buyer-purchased-button" type="button" data-mark-buyer-purchased="${p.id}">Mark as purchased</button><button class="secondary buyer-archive-button" type="button" data-archive-buyer="${p.id}">Archive buyer</button></div>`;
  const archivedAction=archived?(prospectHasContactProfile(p)?`<button class="prospect-delete" type="button" data-remove-buyer-profile="${p.id}">Remove archived buyer profile</button>`:`<button class="prospect-delete" type="button" data-delete-buyer="${p.id}">Delete buyer permanently</button>`):'';
  $('#prospectDetail').innerHTML=`<div class="prospect-detail-nav buyer-detail-nav"><button type="button" data-close-buyer>‹ Back</button>${archived?'<span></span>':`<button type="button" data-edit-buyer="${p.id}">Edit</button>`}</div><section class="buyer-detail-card glass"><div class="buyer-detail-head"><span class="prospect-avatar large">${escapeHtml(initials)}</span><div><span>${archived?'Archived':escapeHtml(p.buyerStage||'Looking')} · ${escapeHtml(p.temperature)}</span><h2>${escapeHtml(p.name)}</h2>${buyerDetailContactMarkup(p,phone)}</div>${prospectIsBuyerSeller(p)?'<em class="buyer-seller-role-pill">Buyer + Seller</em>':''}</div>${actions}${archived?'':buyerSellerPipelineMarkup(p)}${archived?'':buyerSellerOpportunityMarkup(p)}${archived?'':buyerPropertyMatchesMarkup(p)}${buyerRequirementRows(p)}${p.notes?`<p class="prospect-background">${escapeHtml(p.notes)}</p>`:''}${lifecycle}</section><section class="prospecting-section glass buyer-activity-section"><div class="prospecting-section-head"><div><span>ACTIVITY</span><h3>Every conversation</h3></div></div><div class="prospect-history">${buyerHistoryMarkup(history)}</div></section>${archivedAction}`
}
async function archiveBuyer(id){const p=prospectById(id);if(!prospectHasActiveBuyerRole(p))return;const now=Date.now(),keepContact=prospectHasContactProfile(p),cleared=!keepContact&&p.nextFollowUp?` Follow-up for ${fmtDate(p.nextFollowUp)} was cleared.`:'',updated=normaliseProspect({...p,buyerProfileActive:false,buyerProfileArchived:true,archived:keepContact?p.archived:true,archivedAt:keepContact?p.archivedAt:now,nextFollowUp:keepContact?p.nextFollowUp:'',updatedAt:now});prospects=prospects.map(item=>item.id===p.id?updated:item);prospectInteractions.push({id:prospectId(),prospectId:p.id,date:todayKey(),at:now,type:'Archive',outcome:'Buyer archived',note:`Buyer brief moved to Archived.${keepContact?' The seller/contact profile remains active.':''}${cleared}`,nextFollowUp:''});await saveProspecting({render:false,awaitCloud:false});buyerBrowseMode='active';closeProspectDetail();renderTimeline();renderNowCard();toast(keepContact?'Buyer brief archived · seller profile retained':'Buyer archived')}
async function restoreBuyer(id){const p=prospectById(id);if(!prospectBuyerArchived(p))return;const now=Date.now(),updated=normaliseProspect({...p,buyerProfileActive:true,buyerProfileArchived:false,archived:false,archivedAt:0,updatedAt:now});prospects=prospects.map(item=>item.id===p.id?updated:item);prospectInteractions.push({id:prospectId(),prospectId:p.id,date:todayKey(),at:now,type:'Archive',outcome:'Buyer restored',note:'Returned to active buyers.',nextFollowUp:''});await saveProspecting({render:false,awaitCloud:false});buyerBrowseMode='active';buyerFilterState=defaultBuyerFilters();buyerQuickFilter='All';closeProspectDetail();toast('Buyer restored')}
function contactWithoutBuyerProfile(p={}){const clean={...p};['recordType','buyerProfileActive','buyerProfileArchived','buyerStage','buyerBudgetMin','buyerBudgetMax','buyerBedrooms','buyerBathrooms','buyerCars','buyerSuburbs','buyerPropertyType','buyerFeatures','buyerPositionTags','buyerSeller','buyerPurchaseAddress','buyerPurchasePrice','buyerPurchaseDate','buyerConvertedAt','buyerPropertyMatches'].forEach(key=>delete clean[key]);clean.sellerProfileActive=true;clean.updatedAt=Date.now();return normaliseProspect(clean)}
async function removeArchivedBuyerProfile(id){const p=prospectById(id);if(!p||!prospectBuyerArchived(p)||!prospectHasContactProfile(p))return false;const updated=contactWithoutBuyerProfile(p);prospects=prospects.map(item=>item.id===p.id?updated:item);prospectInteractions.push({id:prospectId(),prospectId:p.id,date:todayKey(),at:Date.now(),type:'Profile',outcome:'Buyer profile removed',note:'Archived buyer criteria were removed. Seller/contact history was retained.',nextFollowUp:''});await saveProspecting({render:false,awaitCloud:false});closeProspectDetail();toast('Buyer profile removed · seller contact retained');return true}
let buyerFollowUpReturnFocus=null;
function closeBuyerFollowUp({restoreFocus=true}={}){const returnFocus=buyerFollowUpReturnFocus;document.querySelectorAll('.buyer-followup-overlay').forEach(node=>node.remove());document.body.classList.remove('buyer-followup-open');buyerFollowUpReturnFocus=null;if(restoreFocus&&returnFocus)requestAnimationFrame(()=>{if(returnFocus.isConnected)returnFocus.focus({preventScroll:true})})}
function buyerFollowUpDefaultDate(p){if(validDateKey(p?.nextFollowUp))return p.nextFollowUp;const next=new Date();next.setDate(next.getDate()+1);return dateKey(next)}
function openBuyerFollowUp(id){
  const p=prospectById(id);if(!prospectHasActiveBuyerRole(p))return;
  const returnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;closeBuyerFollowUp({restoreFocus:false});buyerFollowUpReturnFocus=returnFocus;
  const overlay=document.createElement('div');overlay.className='buyer-followup-overlay';overlay.innerHTML=`<form id="buyerFollowUpForm" class="buyer-followup-sheet" data-buyer-id="${escapeHtml(p.id)}" role="dialog" aria-modal="true" aria-labelledby="buyerFollowUpTitle"><div class="buyer-followup-head"><div><span>FOLLOW UP</span><h2 id="buyerFollowUpTitle">${escapeHtml(p.name)}</h2></div><button type="button" data-close-buyer-followup aria-label="Close">×</button></div><label>Follow-up date<input name="followUpDate" type="date" value="${buyerFollowUpDefaultDate(p)}" required></label><label>Notes<textarea name="followUpNote" rows="4" placeholder="What needs to happen next?"></textarea></label><div class="buyer-followup-actions"><button class="secondary" type="button" data-close-buyer-followup>Cancel</button><button class="primary" type="submit">${p.nextFollowUp?'Update follow-up':'Add follow-up'}</button></div></form>`;
  document.body.append(overlay);document.body.classList.add('buyer-followup-open');
  const form=overlay.querySelector('#buyerFollowUpForm');
  overlay.addEventListener('click',event=>{if(event.target===overlay||event.target.closest('[data-close-buyer-followup]')){event.preventDefault();event.stopPropagation();closeBuyerFollowUp()}});
  overlay.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeBuyerFollowUp();return}if(event.key!=='Tab')return;const focusable=[...overlay.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled])')];if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}});
  form?.addEventListener('submit',async event=>{event.preventDefault();event.stopPropagation();const submit=form.querySelector('button[type=submit]'),f=new FormData(form),buyerId=form.dataset.buyerId;if(submit?.disabled)return;if(submit){submit.disabled=true;submit.textContent='Saving…'}try{await scheduleBuyerFollowUp(buyerId,f.get('followUpDate'),f.get('followUpNote'))}catch(err){console.error('Buyer follow-up save failed',err);toast('Follow-up saved locally. Please check sync.');if(submit){submit.disabled=false;submit.textContent=p.nextFollowUp?'Update follow-up':'Add follow-up'}}});
  requestAnimationFrame(()=>overlay.querySelector('[data-close-buyer-followup]')?.focus({preventScroll:true}))
}
async function scheduleBuyerFollowUp(id,date,note=''){const p=prospectById(id),followUpDate=validDateKey(date)?date:'';if(!prospectHasActiveBuyerRole(p)||!followUpDate)return false;const at=Date.now();prospectInteractions.push({id:prospectId(),prospectId:p.id,date:todayKey(),at,type:'Follow-up',outcome:'Follow-up scheduled',note:cleanText(note,2000),nextFollowUp:followUpDate});prospects=prospects.map(item=>item.id===p.id?normaliseProspect({...item,nextFollowUp:followUpDate,updatedAt:at}):item);await saveProspecting({render:false,awaitCloud:false});closeBuyerFollowUp();renderBuyerProfiles();renderTimeline();renderNowCard();if(activeProspectId===p.id&&!$('#prospectDetail')?.classList.contains('hidden'))renderBuyerDetail(p.id);updateTopbar();toast('Buyer follow-up added');return true}
function buyerPurchaseUpdateRecord(p,{address='',price=0,date=todayKey(),now=Date.now(),lastContact=''}={}){const purchaseAddress=cleanText(address,240),purchasePrice=Math.max(0,Number(price)||0),purchaseDate=validDateKey(date)?date:todayKey(),hadContactProfile=prospectHasContactProfile(p),tags=Array.from(new Set([...(p.tags||[]),'Owner'])).slice(0,12);return normaliseProspect({...p,recordType:'contact',buyerProfileActive:false,buyerProfileArchived:false,buyerStage:'Purchased',buyerPurchaseAddress:purchaseAddress,buyerPurchasePrice:purchasePrice,buyerPurchaseDate:purchaseDate,buyerConvertedAt:now,address:hadContactProfile&&p.address?p.address:purchaseAddress,tags,sellerProfileActive:true,stage:hadContactProfile?p.stage||'Nurture':'Nurture',nextFollowUp:hadContactProfile?p.nextFollowUp:'',lastContact:lastContact||p.lastContact,updatedAt:now})}
function openBuyerPurchaseForm(id){const p=prospectById(id);if(!prospectHasActiveBuyerRole(p))return;activeProspectId=p.id;const unified=prospectHasContactProfile(p);$('#prospectDetail').innerHTML=`<form id="buyerPurchaseForm" class="buyer-editor glass"><div class="prospect-detail-nav buyer-detail-nav"><button type="button" data-cancel-buyer-purchase>‹ Back</button><strong>Buyer → owner</strong><span></span></div><div class="buyer-editor-intro"><span>PURCHASED</span><h2>${unified?`Complete ${escapeHtml(p.name.split(' ')[0])}’s buyer journey`:`Move ${escapeHtml(p.name.split(' ')[0])} into Contacts`}</h2><p>Add the property they purchased. ${unified?'Their seller pipeline and current-home details will remain unchanged.':'Their buyer history stays attached to the same record.'}</p></div><label>Purchased property address<input name="buyerPurchaseAddress" autocomplete="street-address" required placeholder="24 Smith Street, Toongabbie"></label><div class="prospect-form-grid"><label>Purchase price <small>Optional</small><input name="buyerPurchasePrice" type="number" inputmode="numeric" min="0" step="1000" placeholder="950000"></label><label>Purchase date<input name="buyerPurchaseDate" type="date" value="${todayKey()}" required></label></div><button class="primary" type="submit">Complete buyer journey</button></form>`}
async function convertBuyerToOwner(id,{address,price,date}){const p=prospectById(id);if(!prospectHasActiveBuyerRole(p))return;const now=Date.now(),purchaseAddress=cleanText(address,240),purchasePrice=Math.max(0,Number(price)||0),purchaseDate=validDateKey(date)?date:todayKey(),updated=buyerPurchaseUpdateRecord(p,{address:purchaseAddress,price:purchasePrice,date:purchaseDate,now});prospects=prospects.map(item=>item.id===p.id?updated:item);prospectInteractions.push({id:prospectId(),prospectId:p.id,date:todayKey(),at:now,type:'Buyer',outcome:'Purchased · Converted to owner',note:`Purchased ${purchaseAddress}${purchasePrice?` for ${formatBuyerMoney(purchasePrice)}`:''}.`,nextFollowUp:''});await saveProspecting({render:false});activeProspectId=null;prospectContactsMode='active';setProspectorSection('contacts');renderProspecting();toast(prospectHasContactProfile(p)?'Buyer journey completed · seller profile retained':'Buyer moved to Contacts as an owner')}
function launchBuyerProfileCall(id,buyerMatchId=''){const p=prospectById(id),number=normaliseDialNumber(primaryProspectPhone(p));if(!prospectHasActiveBuyerRole(p)||number.replace(/\D/g,'').length<6)return toast('Add a valid mobile number first');const pending={id:prospectId(),number,launchedAt:Date.now(),outcomeLogged:false,source:'buyer-profile',buyerProspectId:p.id,buyerName:p.name,buyerMatchId:cleanText(buyerMatchId,180)};writePendingManualCall(pending);manualCallLaunchGuardUntil=Date.now()+1600;window.location.href=`tel:${number}`;setTimeout(maybeShowManualCallOutcome,2600)}
async function logManualCallToBuyer(outcome,pending){
  if(pending?.source!=='buyer-profile'||!pending.buyerProspectId||outcome==='Cancelled')return;const p=prospectById(pending.buyerProspectId);if(!prospectHasActiveBuyerRole(p)||prospectInteractions.some(item=>item.id===pending.id))return;const selected=pending.buyerMatchId?buyerMatchSelected(p.id,pending.buyerMatchId):null,propertyNote=selected?`${selected.match.address}, ${selected.match.suburb}${buyerMatchPriceLabel(selected.match)?` · ${buyerMatchPriceLabel(selected.match)}`:''}`:'';
  prospectInteractions.push({id:pending.id,prospectId:p.id,date:todayKey(),at:Date.now(),type:'Call',outcome:cleanText(outcome,80),note:propertyNote,nextFollowUp:'',buyerMatchId:selected?.match.id||'',marketEventId:selected?.match.eventId||'',marketPropertyKey:selected?.match.propertyKey||''});
  if(selected&&outcome!=='Connected')recordBuyerMatchAttempt(p.id,selected.match.id,{contactMethod:'call',outcome:'no-answer',persist:false});else prospects=prospects.map(item=>item.id===p.id?normaliseProspect({...item,lastContact:todayKey(),updatedAt:Date.now()}):item);
  try{await commitBuyerMatchChanges(p.id)}catch(err){console.error('Buyer call history save failed',err)}
}
function saveManualCallAsBuyer(){const pending=readPendingManualCall();if(!pending?.number)return;const sessionBuyer=pending.source==='buyer-session'?buyerSession.contacts.find(item=>item.id===pending.buyerId):null,existing=(pending.buyerProspectId?prospectById(pending.buyerProspectId):null)||findBuyerByPhone(pending.number),prefill={name:existing?.name||sessionBuyer?.name||pending.buyerName||'',phone:existing?.phone||pending.number,address:existing?.address||sessionBuyer?.address||''},context={interactionId:pending.id,outcome:pending.outcome||manualCallOutcome,at:pending.loggedAt||Date.now(),returnToBuyerSession:pending.source==='buyer-session'};closeManualCallOutcome();switchView('prospectingView');setProspectorSection('buyers');openBuyerEditor(existing?.id||'',prefill,context);if(existing)toast(prospectBuyerArchived(existing)?'Existing archived buyer found. Update the brief, then restore them.':prospectHasActiveBuyerRole(existing)?'Existing buyer found. Update their brief.':'Existing contact found. Add their buyer brief.')}
function findProspectForAppointment({contactName='',contactNumber='',address=''}){
  const digits=normalisedPhoneDigits(contactNumber);
  const available=prospects.filter(p=>!p.archived);
  if(digits){const byPhone=available.find(p=>normalisedPhoneDigits(primaryProspectPhone(p))===digits);if(byPhone)return byPhone}
  const name=cleanText(contactName,120).toLowerCase(),property=cleanText(address,240).toLowerCase();
  return available.find(p=>cleanText(p.name,120).toLowerCase()===name&&cleanText(p.address||p.company,240).toLowerCase()===property)||null;
}
async function connectListingAppointmentToPipeline(details){
  let p=findProspectForAppointment(details),created=false;
  if(!p){p=normaliseProspect({id:prospectId(),name:details.contactName,phone:details.contactNumber,address:details.address,source:'Listing appointment',stage:'Appointment Booked',temperature:'Hot',motivation:5,sellingTimeframe:'Now',createdAt:Date.now(),updatedAt:Date.now()});prospects.unshift(p);created=true}
  else if(!p.sellingTimeframe||!prospectHasContactProfile(p)){const previous=p.sellingTimeframe,nextTimeframe=p.sellingTimeframe||'Now',positionTags=prospectHasActiveBuyerRole(p)?Array.from(new Set(['Buyer Seller',...buyerPositionTags(p)])):buyerPositionTags(p);prospects=prospects.map(x=>x.id===p.id?normaliseProspect({...x,sellerProfileActive:true,buyerPositionTags:positionTags,buyerSeller:positionTags.includes('Buyer Seller'),sellingTimeframe:nextTimeframe,stage:x.stage==='Nurture'?'Appointment Booked':x.stage,updatedAt:Date.now()}):x);prospectInteractions.push({id:prospectId(),prospectId:p.id,date:todayKey(),at:Date.now(),type:'Pipeline',outcome:'Selling timeframe updated',note:`Selling timeframe changed from ${previous||'Not set'} to ${nextTimeframe}.`,nextFollowUp:''});p=prospectById(p.id)}
  if(created)prospectInteractions.push({id:prospectId(),prospectId:p.id,date:todayKey(),at:Date.now(),type:'Pipeline',outcome:'Added to seller pipeline',note:'Added automatically from a listing appointment.',nextFollowUp:''});
  await saveProspecting({render:false});return p;
}
function filteredProspects(){const q=cleanText($('#prospectSearch')?.value||'',120).toLowerCase();let list=prospectSection==='contacts'?[...(prospectContactsMode==='archived'?archivedProspects():activeProspects())].sort((a,b)=>a.name.localeCompare(b.name,'en-AU',{sensitivity:'base'})):priorityProspects();if(prospectSection!=='contacts'){if(prospectFilter==='overdue')list=list.filter(p=>p.nextFollowUp&&p.nextFollowUp<todayKey());else if(prospectFilter==='today')list=list.filter(p=>p.nextFollowUp===todayKey());else if(prospectFilter==='hot')list=list.filter(p=>p.temperature==='Hot')}if(q)list=list.filter(p=>[p.name,p.phone,p.email,p.address,p.suburb,p.source,p.stage,...p.tags].join(' ').toLowerCase().includes(q));return list}
function dueText(p){if(!p.nextFollowUp)return p.lastContact?`Last contacted ${fmtDate(p.lastContact)}`:'New contact';if(p.nextFollowUp<todayKey())return `Overdue · ${fmtDate(p.nextFollowUp)}`;if(p.nextFollowUp===todayKey())return 'Follow-up due today';return `Follow-up ${fmtDate(p.nextFollowUp)}`}
function prospectActivityClass(p){if(p.nextFollowUp&&p.nextFollowUp<todayKey())return'overdue';if(p.nextFollowUp===todayKey())return'today';if(p.lastContact)return'recent';return'new'}
function prospectCard(p,{contactsView=false}={}){const initials=p.name.split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase(),role=prospectIsBuyerSeller(p)?'<span class="contact-buyer-seller-badge">Buyer + Seller</span>':'';if(contactsView){const selected=selectedProspectIds.has(p.id),phone=primaryProspectPhone(p),address=formatProspectAddress(p.address||p.company,p.suburb)||'No property address';return`<button class="prospect-card contact-card-v156 ${prospectBulkMode?'bulk-mode':''} ${selected?'selected':''} ${prospectIsBuyerSeller(p)?'is-buyer-seller':''}" type="button" ${prospectBulkMode?`data-select-prospect="${p.id}" aria-pressed="${selected}"`:`data-open-prospect="${p.id}"`}>
  ${prospectBulkMode?`<span class="prospect-select-mark" aria-hidden="true">${selected?'✓':''}</span>`:''}<span class="prospect-avatar">${escapeHtml(initials||'P')}</span><span class="prospect-card-copy"><span class="contact-card-name"><strong>${escapeHtml(p.name)}</strong>${role}</span><small>${escapeHtml(address)}</small><em>${escapeHtml(phone||'No mobile number')}</em></span><span class="prospect-temp temp-${p.temperature.toLowerCase()}">${p.temperature}</span>${prospectBulkMode?'':'<b aria-hidden="true">›</b>'}</button>`}const activity=prospectActivityClass(p),property=p.address||[p.suburb,primaryProspectPhone(p),p.email].filter(Boolean).join(' · ')||'Contact details not added';return`<button class="prospect-card contact-card-v156 ${prospectIsBuyerSeller(p)?'is-buyer-seller':''}" type="button" data-open-prospect="${p.id}"><span class="prospect-activity activity-${activity}" aria-hidden="true"></span><span class="prospect-avatar">${escapeHtml(initials||'P')}</span><span class="prospect-card-copy"><span class="contact-card-name"><strong>${escapeHtml(p.name)}</strong>${role}</span><small>${escapeHtml(property)}</small><em class="${p.nextFollowUp&&p.nextFollowUp<=todayKey()?'due':''}">${escapeHtml(dueText(p))}</em></span><span class="prospect-temp temp-${p.temperature.toLowerCase()}">${p.temperature}</span><b aria-hidden="true">›</b></button>`}
function setMarketPageMode(mode='hotspotting',{refreshHeader=true}={}){
  marketPageMode=mode==='marketpulse'?'marketpulse':'hotspotting';
  $('#hotSpottingPanel')?.classList.toggle('hidden',marketPageMode!=='hotspotting');
  $('#marketPulseDataPanel')?.classList.toggle('hidden',marketPageMode!=='marketpulse');
  if(refreshHeader&&document.querySelector('.view.active')?.id==='prospectingView'&&prospectSection==='market')updateTopbar();
}
function syncMarketPulseBackButton(){const back=$('#backFromMarketPulseData');if(back)back.textContent=marketPulseReturnTarget==='home'?'‹ Back to Home':'‹ Back to Hot Spotting'}
function openMarketPulseDataArea(returnTarget='hotspotting'){
  marketPulseReturnTarget=returnTarget==='home'?'home':'hotspotting';marketReviewFilter='all';marketPageMode='marketpulse';switchView('prospectingView');setProspectorSection('market');setMarketPageMode('marketpulse');syncMarketPulseBackButton();renderMarketPulse();requestAnimationFrame(()=>{const view=$('#prospectingView');if(view)view.scrollTop=0;window.scrollTo({top:0,behavior:'auto'})});
}
function openHotSpottingArea(){
  marketPulseReturnTarget='hotspotting';marketPageMode='hotspotting';setProspectorSection('market');setMarketPageMode('hotspotting');renderProspecting();requestAnimationFrame(()=>{const view=$('#prospectingView');if(view)view.scrollTop=0});
}
function closeMarketPulseDataArea(){const returnHome=marketPulseReturnTarget==='home';marketPulseReturnTarget='hotspotting';if(returnHome){marketPageMode='hotspotting';setProspectorSection('today');switchView('todayView');return}openHotSpottingArea()}
function setProspectorSection(section='today',{resetSubview=true,todayMode=null}={}){
  prospectSection=['today','contacts','buyers','pipeline','market','broadcast','insights'].includes(section)?section:'today';
  if(todayMode)prospectTodayMode=todayMode;
  $$('[data-prospector-section]').forEach(button=>{const active=button.dataset.prospectorSection===prospectSection;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')});
  $('#prospectorTodayPanel')?.classList.toggle('hidden',prospectSection!=='today'||prospectTodayMode!=='dashboard');
  $('#prospectorFollowUpPanel')?.classList.toggle('hidden',prospectSection!=='today'||prospectTodayMode!=='followups');
  $('#prospectorContactsPanel')?.classList.toggle('hidden',prospectSection!=='contacts');
  $('#prospectorBuyersPanel')?.classList.toggle('hidden',prospectSection!=='buyers');
  $('#prospectorPipelinePanel')?.classList.toggle('hidden',prospectSection!=='pipeline');
  $('#prospectorMarketPanel')?.classList.toggle('hidden',prospectSection!=='market');
  $('#prospectorInsightsPanel')?.classList.toggle('hidden',prospectSection!=='insights');
  $('#prospectorBroadcastPanel')?.classList.toggle('hidden',prospectSection!=='broadcast');
  if(prospectSection==='market')setMarketPageMode(marketPageMode,{refreshHeader:false});
  if(document.querySelector('.view.active')?.id==='prospectingView')updateTopbar();
  $('.prospecting-toolbar')?.classList.toggle('hidden',prospectSection==='insights'||prospectSection==='market'||prospectSection==='broadcast'||(prospectSection==='today'&&prospectTodayMode==='followups'));
  const input=$('#prospectSearch');if(input)input.placeholder=prospectSection==='contacts'?'Search name, street, suburb, phone etc.':prospectSection==='buyers'?'Search buyers':prospectSection==='pipeline'?'Search seller pipeline':'Search name, address or phone';const addButton=$('#addProspectButton');if(addButton)addButton.setAttribute('aria-label',prospectSection==='buyers'?'Add buyer':'Add prospect');
  if(prospectSection==='market')renderMarketPulse();if(prospectSection==='broadcast')renderBroadcastScreen();if(!resetSubview||prospectSessionActive&&prospectSection==='today')return;
  $('#prospectDetail')?.classList.add('hidden');
  $('#prospectingSession')?.classList.add('hidden');
  $('#prospectingDashboard')?.classList.remove('hidden');
}

const BROADCAST_TYPES={
  'market-pulse':{label:'Hot Spotting Bulk SMS',name:'Hot Spotting update',description:'Select the matching contacts who should receive this market update.',message:''},
  'end-of-month':{label:'End of month',name:'End of month update',description:'Share a local market update with your database.',message:`Hi {{FirstName}},

Andrew Tour from McGrath here with a quick end-of-month market update for {{Suburb}}.

If you have any questions or would like to know what the latest activity means for your property, please don’t hesitate to let me know.

Thanks,
Andrew Tour | McGrath`},
  'just-listed':{label:'Just listed',name:'Just listed',description:'Let nearby contacts know about a new listing.',message:`Hi {{FirstName}},

Andrew Tour from McGrath here. We’ve just listed a property nearby that I thought may interest you.

If you would like the details or would like to know what this means for your property, please let me know.

Thanks,
Andrew Tour | McGrath`},
  'just-sold':{label:'Just sold',name:'Just sold',description:'Share a recent result and start property conversations.',message:`Hi {{FirstName}},

Andrew Tour from McGrath here. We’ve recently sold a property nearby and I wanted to keep you updated on the result.

If you would like to know what this means for your property, please let me know.

Thanks,
Andrew Tour | McGrath`},
  'coming-soon':{label:'Coming soon',name:'Coming soon',description:'Give selected contacts an early property heads-up.',message:`Hi {{FirstName}},

Andrew Tour from McGrath here. We have a property coming to market soon that I thought may interest you.

Please let me know if you would like some early information before it launches.

Thanks,
Andrew Tour | McGrath`},
  'auction-reminder':{label:'Auction reminder',name:'Auction reminder',description:'Remind interested contacts about an upcoming auction.',message:`Hi {{FirstName}},

Andrew Tour from McGrath here with a quick reminder about the upcoming auction.

Please let me know if you need any further information before auction day.

Thanks,
Andrew Tour | McGrath`}
};
function broadcastLocationFor(p){
  const candidates=[p.address,p.company].map(value=>cleanText(value,300)).filter(Boolean);
  for(const value of candidates){
    const parts=splitMarketAddress(value),suburb=cleanText(parts.suburb||p.suburb,100),street=marketStreetName(parts.address);
    if(street&&suburb)return{streetKey:`${street}|${normalisePlace(suburb)}`,street:titleCaseMarketStreet(street),suburb:titleCaseMarketStreet(suburb)};
  }
  const suburb=cleanText(p.suburb,100);return{streetKey:'',street:'',suburb:titleCaseMarketStreet(suburb)};
}
function broadcastSuburbs({streetOnly=false}={}){
  const map=new Map();activeProspects().forEach(p=>{const location=broadcastLocationFor(p);if(!location.suburb||(streetOnly&&!location.streetKey))return;const key=normalisePlace(location.suburb);if(!map.has(key))map.set(key,location.suburb)});
  return[...map.entries()].sort((a,b)=>a[1].localeCompare(b[1],'en-AU'));
}
function broadcastStreets(suburbKey){
  const map=new Map();activeProspects().forEach(p=>{const location=broadcastLocationFor(p);if(!location.streetKey||normalisePlace(location.suburb)!==suburbKey)return;if(!map.has(location.streetKey))map.set(location.streetKey,location.street)});
  return[...map.entries()].sort((a,b)=>a[1].localeCompare(b[1],'en-AU'));
}
function broadcastStreetContacts(streetKey){return activeProspects().filter(p=>broadcastLocationFor(p).streetKey===streetKey).sort((a,b)=>a.address.localeCompare(b.address,'en-AU')||a.name.localeCompare(b.name,'en-AU'))}
function setSelectOptions(select,items,emptyLabel,preferred=''){
  if(!select)return'';const previous=select.value;
  select.innerHTML=items.length?items.map(([value,label])=>`<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join(''):`<option value="">${escapeHtml(emptyLabel)}</option>`;
  const preferredValue=items.some(([value])=>value===preferred)?preferred:'';
  if(preferredValue)select.value=preferredValue;
  else if(items.some(([value])=>value===previous))select.value=previous;
  return select.value||'';
}
function renderBroadcastAudienceControls(){
  const isContext=selectedBroadcastType==='market-pulse'&&selectedBroadcastContext?.eventId,isLarge=selectedBroadcastType==='end-of-month',large=$('#campaignLargeAudience'),street=$('#campaignStreetAudience'),context=$('#campaignContextAudience');
  context?.classList.toggle('hidden',!isContext);large?.classList.toggle('hidden',isContext||!isLarge);street?.classList.toggle('hidden',isContext||isLarge);
  if(isContext){
    const event=marketPulseBulkSmsEvent(selectedBroadcastContext.eventId),contacts=marketPulseBulkSmsContacts(selectedBroadcastContext.eventId),host=$('#campaignContextRecipients');
    if($('#campaignContextTitle'))$('#campaignContextTitle').textContent=event?`${event.eventType} · ${event.address}`:'Hot Spotting matches';
    if($('#campaignContextMeta'))$('#campaignContextMeta').textContent=event?`${contacts.length} unworked matching contact${contacts.length===1?'':'s'} in ${event.suburb}. Select who should receive this update.`:'This MarketPulse activity is no longer available.';
    if(host)host.innerHTML=contacts.length?contacts.map(p=>`<label><input type="checkbox" data-broadcast-recipient="${escapeHtml(p.id)}" ${selectedBroadcastRecipientIds.has(p.id)?'checked':''}><span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(formatProspectAddress(p.address||p.company,p.suburb)||event?.suburb||'Address not recorded')}${primaryProspectPhone(p)?` · ${escapeHtml(primaryProspectPhone(p))}`:''}</small></span></label>`).join(''):'<div class="empty">Every matching contact has already been worked.</div>';
    return;
  }
  if(isLarge){
    const select=$('#campaignSuburbSelect'),items=broadcastSuburbs();selectedBroadcastSuburb=setSelectOptions(select,items,'No suburbs found',selectedBroadcastSuburb||normalisePlace('Toongabbie'));
    return;
  }
  const suburbSelect=$('#campaignStreetSuburb'),suburbs=broadcastSuburbs({streetOnly:true});selectedBroadcastSuburb=setSelectOptions(suburbSelect,suburbs,'No suburbs found',selectedBroadcastSuburb||normalisePlace('Toongabbie'));
  const streetSelect=$('#campaignStreetSelect'),streets=broadcastStreets(selectedBroadcastSuburb),priorStreet=selectedBroadcastStreet;
  selectedBroadcastStreet=setSelectOptions(streetSelect,streets,'No streets found');
  if(priorStreet!==selectedBroadcastStreet)selectedBroadcastRecipientIds=new Set(broadcastStreetContacts(selectedBroadcastStreet).map(p=>p.id));
  const contacts=broadcastStreetContacts(selectedBroadcastStreet),host=$('#campaignStreetRecipients');
  if(host)host.innerHTML=contacts.length?contacts.map(p=>`<label><input type="checkbox" data-broadcast-recipient="${escapeHtml(p.id)}" ${selectedBroadcastRecipientIds.has(p.id)?'checked':''}><span><strong>${escapeHtml(p.address||p.name)}</strong><small>${escapeHtml(p.name)}${primaryProspectPhone(p)?` · ${escapeHtml(primaryProspectPhone(p))}`:''}</small></span></label>`).join(''):'<div class="empty">No contacts found on this street.</div>';
}
function broadcastHeaderState(){
  if(prospectSection!=='broadcast')return null;
  if(!selectedBroadcastType)return{title:'Broadcast',subtitle:'Build and review an SMS campaign.'};
  const states={
    1:{title:'Choose Recipients',subtitle:'Select the people who should receive this update.'},
    2:{title:'Write Your Message',subtitle:'Write once. AGNT personalises each SMS before it reaches the recipient.'},
    3:{title:'Review & Send',subtitle:'Check every detail before opening AGNT Bulk SMS.'},
    4:{title:selectedBroadcastContext?'Bulk SMS Launched':'Campaign Sent',subtitle:selectedBroadcastContext?'The Shortcut launch is recorded below. Carrier delivery is not implied.':'Your broadcast details are saved below.'}
  };
  return states[broadcastStep]||states[1];
}
function syncBroadcastShell(){
  const app=$('#app'),progress=$('.broadcast-step-progress'),builder=$('#broadcastBuilderFlow'),topActions=$('.top-actions');
  const inBroadcast=prospectSection==='broadcast';
  const building=inBroadcast&&Boolean(selectedBroadcastType&&BROADCAST_TYPES[selectedBroadcastType]);
  app?.classList.toggle('broadcast-fullscreen',inBroadcast);
  app?.classList.toggle('broadcast-building',building);
  if(progress&&builder&&topActions){
    if(building&&progress.parentElement!==topActions)topActions.insertBefore(progress,topActions.firstChild);
    if(!building&&progress.parentElement!==builder)builder.insertBefore(progress,builder.firstChild);
  }
  updateTopbar(activeViewId());
}
function setBroadcastStep(step){
  broadcastStep=Math.max(1,Math.min(4,Number(step)||1));
  $$('.broadcast-step-page').forEach(page=>page.classList.toggle('hidden',Number(page.dataset.broadcastStep)!==broadcastStep));
  $$('[data-broadcast-progress]').forEach(dot=>{const n=Number(dot.dataset.broadcastProgress);dot.classList.toggle('active',n===Math.min(broadcastStep,3));dot.classList.toggle('complete',n<Math.min(broadcastStep,4))});
  const back=$('#broadcastBack');if(back)back.textContent=broadcastStep===1?(selectedBroadcastContext?'‹ Back to Hot Spotting':'‹ Back to broadcasts'):'‹ Back';
  syncBroadcastShell();
  window.scrollTo({top:0,behavior:'smooth'});
}
function setBroadcastReviewMode(mode='live'){
  broadcastReviewMode=mode==='test'?'test':'live';
  $('#broadcastReviewLive')?.classList.toggle('active',broadcastReviewMode==='live');
  $('#broadcastReviewTest')?.classList.toggle('active',broadcastReviewMode==='test');
  $('#broadcastLiveReview')?.classList.toggle('hidden',broadcastReviewMode!=='live');
  $('#broadcastTestReview')?.classList.toggle('hidden',broadcastReviewMode!=='test');
}
function renderBroadcastScreen(){
  const menu=$('#broadcastMenu'),builder=$('#broadcastBuilderFlow');
  if(!menu||!builder)return;
  const building=Boolean(selectedBroadcastType&&BROADCAST_TYPES[selectedBroadcastType]);
  menu.classList.toggle('hidden',building);builder.classList.toggle('hidden',!building);
  syncBroadcastShell();
  if(!building)return;
  const type=BROADCAST_TYPES[selectedBroadcastType];
  if($('#broadcastTypeEyebrow'))$('#broadcastTypeEyebrow').textContent=type.label.toUpperCase();
  if($('#broadcastTypeDescription'))$('#broadcastTypeDescription').textContent=type.description;
  renderBroadcastAudienceControls();renderCampaignBroadcast();setBroadcastStep(broadcastStep);setBroadcastReviewMode(broadcastReviewMode);
}
function openBroadcastBuilder(typeKey){
  const type=BROADCAST_TYPES[typeKey];if(!type)return;
  selectedBroadcastContext=null;selectedBroadcastType=typeKey;selectedBroadcastSuburb=normalisePlace('Toongabbie');selectedBroadcastStreet='';selectedBroadcastRecipientIds=new Set();broadcastStep=1;broadcastReviewMode='live';broadcastLastLaunch=null;
  const name=$('#campaignName'),message=$('#campaignMessage');
  if(name)name.value=type.name;if(message)message.value=type.message;
  renderBroadcastScreen();window.scrollTo({top:0,behavior:'smooth'});
}
function closeBroadcastBuilder(){selectedBroadcastType='';selectedBroadcastSuburb='';selectedBroadcastStreet='';selectedBroadcastRecipientIds=new Set();selectedBroadcastContext=null;broadcastStep=1;broadcastReviewMode='live';broadcastLastLaunch=null;renderBroadcastScreen();window.scrollTo({top:0,behavior:'smooth'})}
function campaignFirstName(p){const name=cleanText(p?.name,120);if(!name)return'there';if(/[&/]|\band\b/i.test(name))return name;return name.split(/\s+/)[0]||'there'}
function campaignDaysSince(k){if(!validDateKey(k))return Infinity;return Math.floor((parseKey(todayKey())-parseKey(k))/86400000)}
function marketPulseBulkSmsEvent(eventId=''){return normaliseMarketPulseEvents(marketPulseEvents).find(event=>event.id===cleanText(eventId,160))||null}
function marketPulseBulkSmsContacts(eventId=''){
  const event=marketPulseBulkSmsEvent(eventId);if(!event||event.sessionCompletedAt)return[];
  const matches=marketMatches(event),worked=marketSessionProgress(event,matches).workedIds;
  return matches.filter(person=>!worked.has(person.id)).sort((a,b)=>Number(Boolean(marketTriggeredFollowUp(event,b.id)))-Number(Boolean(marketTriggeredFollowUp(event,a.id)))||a.name.localeCompare(b.name,'en-AU'))
}
function marketPulseBulkSmsHasMobile(eventId=''){return marketPulseBulkSmsContacts(eventId).some(person=>String(primaryProspectPhone(person)||'').replace(/\D/g,'').length>=9)}
function marketPulseBulkSmsTemplate(event={}){const property=[event.address,event.suburb].filter(Boolean).join(', '),name=hotSpotSmsAgentName();return`Hi {{FirstName}},\n\n${name} from McGrath here. Just a quick heads up that ${property} ${hotSpotSmsEventPhrase(event)}${hotSpotSmsPricePhrase(event)}${hotSpotSmsMovementPhrase(event)}${hotSpotSmsAuctionPhrase(event)}.\n\nIf you have any questions or would like to know what this means for your property, please don’t hesitate to let me know.\n\nThanks,\n${name} | McGrath`}
function openMarketPulseBulkSms(eventId=''){
  const event=marketPulseBulkSmsEvent(eventId),contacts=marketPulseBulkSmsContacts(eventId);if(!event)return toast('This MarketPulse activity is no longer available');if(!contacts.length)return toast('Every matching contact has already been worked');if(!marketPulseBulkSmsHasMobile(eventId))return toast('No remaining contact has a valid mobile number');
  selectedBroadcastContext={kind:'market-pulse',eventId:event.id};selectedBroadcastType='market-pulse';selectedBroadcastSuburb='';selectedBroadcastStreet='';selectedBroadcastRecipientIds=new Set(contacts.map(person=>person.id));broadcastStep=1;broadcastReviewMode='live';broadcastLastLaunch=null;
  const name=$('#campaignName'),message=$('#campaignMessage');if(name)name.value=`Hot Spotting · ${event.eventType} · ${event.address}`;if(message)message.value=marketPulseBulkSmsTemplate(event);
  switchView('prospectingView');setProspectorSection('broadcast');renderProspecting();requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'smooth'}));
}
function campaignEligibleContacts(){
  const recency=Number($('#campaignRecency')?.value)||0,excludeDnc=$('#campaignExcludeDnc')?.checked!==false,excludeToday=$('#campaignExcludeRecent')?.checked!==false,seen=new Set(),warnings={invalid:0,duplicates:0,dnc:0,recent:0},isContext=selectedBroadcastType==='market-pulse'&&selectedBroadcastContext?.eventId,isLarge=selectedBroadcastType==='end-of-month';
  const candidates=isContext?marketPulseBulkSmsContacts(selectedBroadcastContext.eventId).filter(p=>selectedBroadcastRecipientIds.has(p.id)):isLarge?activeProspects().filter(p=>normalisePlace(broadcastLocationFor(p).suburb)===selectedBroadcastSuburb):broadcastStreetContacts(selectedBroadcastStreet).filter(p=>selectedBroadcastRecipientIds.has(p.id));
  const list=[];
  candidates.forEach(p=>{const phone=primaryProspectPhone(p),digits=String(phone||'').replace(/\D/g,'');if(digits.length<9){warnings.invalid++;return}if(seen.has(digits)){warnings.duplicates++;return}const interactions=interactionsFor(p.id);if(excludeDnc&&interactions.some(x=>x.outcome==='Do not contact')){warnings.dnc++;return}if(excludeToday&&interactions.some(x=>x.date===todayKey())){warnings.recent++;return}if(recency&&campaignDaysSince(p.lastContact)<recency){warnings.recent++;return}seen.add(digits);list.push(p)});
  return{list,warnings};
}
function campaignMessageFor(p,template){return String(template||'').replace(/{{\s*FirstName\s*}}/gi,campaignFirstName(p)).replace(/{{\s*FullName\s*}}/gi,cleanText(p.name,120)||'there').replace(/{{\s*Suburb\s*}}/gi,cleanText(p.suburb,80)||'your area').replace(/{{\s*AgentName\s*}}/gi,displayAgentName())}
function campaignPayload(){const {list,warnings}=campaignEligibleContacts(),template=$('#campaignMessage')?.value||'',name=cleanText($('#campaignName')?.value,120)||`AGNT Campaign ${todayKey()}`,delay=Math.max(1,Number($('#campaignDelay')?.value)||2);return{name,delay,users:list.map(p=>({identifier:p.id,name:p.name,number:primaryProspectPhone(p),message:campaignMessageFor(p,template)})),warnings,createdAt:Date.now(),source:'AGNT'}}
function renderCampaignBroadcast(){const panel=$('#prospectorBroadcastPanel');if(!panel||!selectedBroadcastType)return;const payload=campaignPayload(),total=payload.users.length,w=payload.warnings,messageReady=Boolean(cleanText($('#campaignMessage')?.value,2000)),nameReady=Boolean(cleanText($('#campaignName')?.value,120)),delay=Math.max(1,Number(payload.delay)||2),seconds=total?total*delay+15:0;$('#campaignEligibleCount').textContent=total;$('#campaignAudienceMeta').textContent=`${total} eligible contact${total===1?'':'s'}`;$('#campaignReviewMeta').textContent=total?`${total} personalised message${total===1?'':'s'} ready · ${formatEstimatedTime(Math.ceil(seconds/60))}`:'No eligible recipients';const checks=[['Audience',total>0,total?`${total} recipients ready`:'Select eligible recipients'],['Message',messageReady,messageReady?'Message complete':'Add a message'],['Campaign',nameReady,nameReady?'Name confirmed':'Add a campaign name'],['Send time',total>0,total?`${formatEstimatedTime(Math.ceil(seconds/60))} at ${delay}s delay`:'Calculated after audience selection']];if($('#campaignReadiness'))$('#campaignReadiness').innerHTML=checks.map(([label,ready,detail])=>`<div class="${ready?'ready':'not-ready'}"><span>${ready?'✓':'!'}</span><p><strong>${escapeHtml(label)}</strong><small>${escapeHtml(detail)}</small></p></div>`).join('');$('#campaignWarnings').innerHTML=[w.invalid?`${w.invalid} invalid/no mobile`:null,w.duplicates?`${w.duplicates} duplicate mobile${w.duplicates===1?'':'s'}`:null,w.dnc?`${w.dnc} do-not-contact`:null,w.recent?`${w.recent} recent contact${w.recent===1?'':'s'}`:null].filter(Boolean).map(x=>`<span>${escapeHtml(x)} excluded</span>`).join('');$('#campaignPreview').innerHTML=total?payload.users.slice(0,5).map((u,i)=>`<article><span>${i+1}</span><div><strong>${escapeHtml(u.name)}</strong><small>${escapeHtml(u.number)}</small><p>${escapeHtml(u.message).replace(/\n/g,'<br>')}</p></div></article>`).join('')+(total>5?`<div class="campaign-more">+${total-5} more recipients</div>`:''):'<div class="empty">No eligible contacts match these filters.</div>';$('#launchCampaignShortcut').disabled=!total||!messageReady||!nameReady;renderCampaignHistory();renderBulkSmsTest()}
function renderCampaignHistory(){const host=$('#campaignHistory');if(!host)return;host.innerHTML=campaignHistory.length?campaignHistory.slice(0,8).map(c=>`<article><div><strong>${escapeHtml(c.name||'Campaign')}</strong><small>${new Date(c.createdAt).toLocaleString('en-AU',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}</small></div><span>${Number(c.count)||0} SMS</span></article>`).join(''):'<div class="empty">No campaigns launched from this device yet.</div>'}
function renderBroadcastSuccess(){const item=broadcastLastLaunch||campaignHistory[0]||bulkSmsTestLaunches[0];if(!item)return;$('#broadcastSuccessName').textContent=item.name||'Campaign';$('#broadcastSuccessCount').textContent=`${Number(item.count)||0} SMS`;$('#broadcastSuccessTime').textContent=new Date(item.createdAt||Date.now()).toLocaleString('en-AU',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});renderCampaignHistory()}
function agntBulkSmsShortcutUrl(payload){const input=encodeURIComponent(JSON.stringify(payload));return`shortcuts://run-shortcut?name=${encodeURIComponent(AGNT_BULK_SMS_SHORTCUT)}&input=text&text=${input}`}
function recordMarketPulseBulkSmsLaunch(payload){
  const eventId=selectedBroadcastContext?.kind==='market-pulse'?selectedBroadcastContext.eventId:'',event=marketPulseBulkSmsEvent(eventId);if(!event)return;
  const at=Date.now();payload.users.forEach(user=>{const p=prospectById(user.identifier);if(!p||prospectInteractions.some(item=>item.prospectId===p.id&&item.type==='SMS'&&item.marketEventId===event.id))return;prospectInteractions.push({id:prospectId(),prospectId:p.id,date:todayKey(),at,type:'SMS',outcome:'Bulk SMS launched',note:user.message,nextFollowUp:'',marketEventId:event.id});prospects=prospects.map(item=>item.id===p.id?normaliseProspect({...item,lastContact:todayKey(),updatedAt:at}):item)});
  const matches=marketMatches(event),worked=marketSessionProgress(event,matches).workedIds,remainingIds=matches.map(person=>person.id).filter(id=>!worked.has(id)),complete=matches.length>0&&remainingIds.length===0;
  marketPulseEvents=normaliseMarketPulseEvents(marketPulseEvents.map(item=>item.id===event.id?{...item,sessionStartedAt:item.sessionStartedAt||at,sessionCompletedAt:complete?at:item.sessionCompletedAt}:item));
  if(prospectSessionActive&&prospectSessionContext?.eventId===event.id){if(remainingIds.length){prospectSessionIds=remainingIds;prospectSessionIndex=0;saveProspectingSessionState()}else{prospectSessionActive=false;prospectSessionIds=[];prospectSessionIndex=0;prospectSessionStats={calls:0,connects:0,temperate:0,appointments:0,sms:0};prospectSessionContext=null;clearProspectingSessionState();saveHotSpotSmsPending(null)}}
  saveProspecting({render:false,awaitCloud:false}).catch(err=>console.error('Hot Spotting Bulk SMS launch sync failed',err));renderMarketPulse();renderTimeline();renderNowCard();
}
function launchCampaignShortcut(){const payload=campaignPayload();if(!payload.users.length)return toast('No eligible recipients');if(!confirm(`Open ${AGNT_BULK_SMS_SHORTCUT} with ${payload.users.length} personalised messages?`))return;broadcastLastLaunch={id:prospectId(),name:payload.name,count:payload.users.length,createdAt:Date.now(),test:false,context:selectedBroadcastContext?.kind||''};campaignHistory.unshift(broadcastLastLaunch);if(selectedBroadcastContext?.kind==='market-pulse')recordMarketPulseBulkSmsLaunch(payload);else saveLocal();renderCampaignHistory();renderBroadcastSuccess();setBroadcastStep(4);setTimeout(()=>{window.location.href=agntBulkSmsShortcutUrl(payload)},120)}
function bulkSmsTestFirstName(name=''){return cleanText(name,100).split(/\s+/)[0]||'there'}
function bulkSmsTestNumber(value=''){const digits=String(value||'').replace(/\D/g,'');if(/^614\d{8}$/.test(digits))return`0${digits.slice(2)}`;if(/^04\d{8}$/.test(digits))return digits;return''}
function bulkSmsTestRecipients(){const raw=$('#bulkSmsTestRecipients')?.value||'',seen=new Set(),valid=[],invalid=[];raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach((line,index)=>{const match=line.match(/(?:\+?61|0)4(?:[\s-]*\d){8}/),number=bulkSmsTestNumber(match?.[0]||line);if(!number){invalid.push(line);return}if(seen.has(number)){invalid.push(`${line} · duplicate`);return}seen.add(number);let name=cleanText(line.replace(match?.[0]||number,'').replace(/^[\s,|;:\-]+|[\s,|;:\-]+$/g,''),100);if(!name)name=`Test ${index+1}`;valid.push({identifier:`test-${index+1}-${number}`,name,number})});return{valid,invalid}}
function bulkSmsTestPayload(){const {valid,invalid}=bulkSmsTestRecipients(),template=$('#bulkSmsTestMessage')?.value||'',delay=Math.max(0,Math.min(10,Number($('#bulkSmsTestDelay')?.value)||0));return{name:`AGNT Bulk SMS Test ${todayKey()}`,delay,users:valid.map(item=>({...item,message:String(template).replace(/{{\s*FirstName\s*}}/gi,bulkSmsTestFirstName(item.name)).replace(/{{\s*FullName\s*}}/gi,item.name)})),invalid,createdAt:Date.now(),source:'AGNT Test Environment',test:true}}
function renderBulkSmsTest(){const host=$('#bulkSmsTestPreview');if(!host)return;const payload=bulkSmsTestPayload(),count=payload.users.length;$('#bulkSmsTestMeta').textContent=count?`${count} test message${count===1?'':'s'} ready`:'Enter test recipients';$('#bulkSmsTestWarnings').innerHTML=payload.invalid.length?`<span>${payload.invalid.length} invalid or duplicate entr${payload.invalid.length===1?'y':'ies'}</span>`:'';host.innerHTML=count?payload.users.map((u,i)=>`<article><span>${i+1}</span><div><strong>${escapeHtml(u.name)}</strong><small>${escapeHtml(u.number)}</small><p>${escapeHtml(u.message).replace(/\n/g,'<br>')}</p></div></article>`).join(''):'<div class="empty">Add one recipient per line, such as Andrew, 0412 345 678.</div>';const json=$('#bulkSmsTestJson');if(json)json.textContent=JSON.stringify({...payload,invalid:undefined},null,2);const launch=$('#launchBulkSmsTest');if(launch)launch.disabled=!count||!cleanText($('#bulkSmsTestMessage')?.value,2000);renderBulkSmsTestHistory()}
function renderBulkSmsTestHistory(){const host=$('#bulkSmsTestHistory');if(!host)return;host.innerHTML=bulkSmsTestLaunches.length?bulkSmsTestLaunches.slice(0,5).map(item=>`<article><div><strong>${escapeHtml(item.name||'Test launch')}</strong><small>${new Date(item.createdAt).toLocaleString('en-AU',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}</small></div><span>${Number(item.count)||0} SMS</span></article>`).join(''):'<div class="empty">No test payloads launched yet.</div>'}
function launchBulkSmsTest(){const payload=bulkSmsTestPayload();if(!payload.users.length)return toast('Add a valid test mobile');if(!cleanText($('#bulkSmsTestMessage')?.value,2000))return toast('Add a test message');if(!confirm(`Open ${AGNT_BULK_SMS_SHORTCUT} with ${payload.users.length} test message${payload.users.length===1?'':'s'}?`))return;broadcastLastLaunch={id:prospectId(),name:payload.name,count:payload.users.length,createdAt:Date.now(),test:true};bulkSmsTestLaunches.unshift(broadcastLastLaunch);saveLocal();renderBulkSmsTestHistory();renderBroadcastSuccess();setBroadcastStep(4);setTimeout(()=>{window.location.href=agntBulkSmsShortcutUrl(payload)},120)}

function followUpChecklistCard(p){const initials=p.name.split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase(),address=formatProspectAddress(p.address||p.company,p.suburb)||primaryProspectPhone(p)||'Contact details not added';return`<article class="prospect-followup-item"><button class="prospect-followup-check" type="button" data-complete-prospect-followup="${p.id}" aria-label="Complete follow-up for ${escapeHtml(p.name)}"><span aria-hidden="true">✓</span></button><button class="prospect-followup-open" type="button" data-open-prospect="${p.id}"><span class="prospect-avatar">${escapeHtml(initials||'P')}</span><span class="prospect-card-copy"><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(address)}</small><em class="due">${escapeHtml(dueText(p))}</em></span><span class="prospect-temp temp-${p.temperature.toLowerCase()}">${p.temperature}</span><b aria-hidden="true">›</b></button></article>`}
async function completeProspectFollowUp(id){const p=prospectById(id);if(!p)return;const interactionId=prospectId(),completedAt=Date.now();prospectInteractions.push({id:interactionId,prospectId:p.id,date:todayKey(),at:completedAt,type:'Follow-up',outcome:'Follow-up completed',note:'',nextFollowUp:''});prospects=prospects.map(x=>x.id===p.id?normaliseProspect({...x,nextFollowUp:'',updatedAt:completedAt}):x);await saveProspecting({render:false,awaitCloud:false});renderAll();refreshReturningSnapshotIfVisible();haptic();toast('Follow-up completed')}
function prospectInsightRange(period=prospectInsightPeriod){
  const now=new Date(),thisMonday=mondayOf(now),start=new Date(thisMonday),end=new Date(now);
  if(period==='last'){start.setDate(start.getDate()-7);end.setTime(start.getTime());end.setDate(end.getDate()+6);end.setHours(23,59,59,999)}
  else if(period==='four'){start.setDate(start.getDate()-21)}
  return{startKey:dateKey(start),endKey:dateKey(end),label:period==='last'?'Last week':period==='four'?'Last 4 weeks':'This week'};
}
function appointmentEntriesInRange(startKey,endKey){return allAppointmentEntries().filter(({appointment:a,sourceDate})=>{if(isOfiAppointment(a))return false;const d=appointmentScheduledDate(a,sourceDate);return d>=startKey&&d<=endKey})}
function prospectInteractionsInRange(startKey,endKey){return prospectInteractions.filter(x=>x.date>=startKey&&x.date<=endKey)}
function insightMetric(label,value,meta=''){return `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong>${meta?`<small>${escapeHtml(meta)}</small>`:''}</article>`}
function renderProspectorInsights(){
  const panel=$('#prospectorInsightsPanel');if(!panel)return;
  const {startKey,endKey,label}=prospectInsightRange(),interactions=prospectInteractionsInRange(startKey,endKey),appointments=appointmentEntriesInRange(startKey,endKey),calls=interactions.filter(x=>x.type==='Call'),connected=calls.filter(x=>['Connected','Appraisal opportunity','Appointment booked'].includes(x.outcome)),followupsCreated=calls.filter(x=>x.nextFollowUp).length,appointmentBooked=calls.filter(x=>x.outcome==='Appointment booked').length,listingAppointments=appointments.filter(({appointment:a})=>appointmentType(a)==='LAP'),appraisalAppointments=appointments.filter(({appointment:a})=>appointmentType(a)==='MAP'||appointmentType(a)==='BAP'),completedAppointments=appointments.filter(({appointment:a,sourceDate})=>appointmentLifecycle(a,sourceDate)==='completed');
  const sellers=sellerPipelineProspects(),nowCount=sellers.filter(p=>pipelineTimeframeForProspect(p)==='Now').length,shortCount=sellers.filter(p=>pipelineTimeframeForProspect(p)==='1–3 months').length,longCount=sellers.filter(p=>['6–12 months','12 months+'].includes(pipelineTimeframeForProspect(p))).length,hotWarm=sellers.filter(p=>p.temperature==='Hot'||p.temperature==='Warm').length;
  const overdue=activeProspects().filter(p=>p.nextFollowUp&&p.nextFollowUp<todayKey()),dueToday=activeProspects().filter(p=>p.nextFollowUp===todayKey()),overduePriority=overdue.filter(p=>p.temperature==='Hot'||p.temperature==='Warm');
  const pipelineMoves=interactions.filter(x=>x.type==='Pipeline'&&x.outcome==='Selling timeframe updated').length,newPipeline=interactions.filter(x=>x.type==='Pipeline'&&x.outcome==='Added to seller pipeline').length;
  const connectRate=calls.length?Math.round(connected.length/calls.length*100):0,appointmentRate=connected.length?Math.round(appointmentBooked/connected.length*100):0,followupRate=connected.length?Math.round(followupsCreated/connected.length*100):0;
  const missingPhone=activeProspects().filter(p=>!primaryProspectPhone(p)).length,missingAddress=sellers.filter(p=>!formatProspectAddress(p.address||p.company,p.suburb)).length,missingFollowup=sellers.filter(p=>!p.nextFollowUp).length,unlinkedLaps=listingAppointments.filter(({appointment:a})=>!activeProspects().some(p=>appointmentMatchesProspect(a,p))).length;
  let health=50;health+=Math.min(18,connected.length*2)+Math.min(12,appointmentBooked*4)+Math.min(10,newPipeline*3);health-=Math.min(25,overduePriority.length*6)-Math.min(8,followupRate/15);health=Math.max(0,Math.min(100,Math.round(health)));
  const healthTitle=health>=80?'Strong':health>=60?'Building':'Needs attention';
  $('#prospectHealthTitle').textContent=healthTitle;$('#prospectHealthScore').textContent=`${health}%`;
  $('#prospectHealthSummary').textContent=!calls.length?`${label}: log conversations to reveal conversion patterns.`:overduePriority.length?`${overduePriority.length} priority follow-up${overduePriority.length===1?' is':'s are'} weakening otherwise useful activity.`:appointmentBooked?`${label}: prospecting is converting into appointments with no urgent priority follow-up gap.`:`${label}: activity is building, but connected conversations need a clearer next step.`;
  $('#prospectConversionGrid').innerHTML=[insightMetric('Calls logged',calls.length,`${connected.length} meaningful connects`),insightMetric('Connect rate',`${connectRate}%`,calls.length?'Connected outcomes':'No calls recorded'),insightMetric('Follow-ups set',followupsCreated,`${followupRate}% of meaningful connects`),insightMetric('Appointments',appointmentBooked,`${appointmentRate}% of meaningful connects`)].join('');
  $('#prospectConversionSummary').textContent=!calls.length?'No conversion pattern is available for this period yet.':connectRate<35?'The largest opportunity is improving the quality of conversations from existing call volume.':appointmentRate<15?'Connections are occurring, but too few are being converted into appointments.':'Your conversion flow is healthy. Protect it by keeping every meaningful conversation attached to a next action.';
  $('#prospectPipelineInsightGrid').innerHTML=[insightMetric('Now',nowCount,'Immediate sellers'),insightMetric('1–3 months',shortCount,'Near-term opportunities'),insightMetric('6+ months',longCount,'Longer-term nurture'),insightMetric('Hot / Warm',hotWarm,`${pipelineMoves} movement${pipelineMoves===1?'':'s'} recorded`)].join('');
  $('#prospectPipelineSummary').textContent=!sellers.length?'Your seller pipeline is empty. Qualify selling timeframe during normal prospecting conversations.':nowCount+shortCount===0?'Your pipeline is weighted to longer-term business. Create near-term opportunity through focused follow-up.':longCount>sellers.length*.65?'Most pipeline volume sits beyond six months. Short-term stock is comparatively light.':`${Math.round((nowCount+shortCount)/sellers.length*100)}% of active sellers sit within the next three months.`;
  $('#prospectFollowupInsightGrid').innerHTML=[insightMetric('Overdue',overdue.length,`${overduePriority.length} Hot / Warm`),insightMetric('Due today',dueToday.length,'Existing next actions'),insightMetric('Set this period',followupsCreated,'From logged conversations'),insightMetric('Coverage',`${followupRate}%`,'Meaningful connects with follow-up')].join('');
  $('#prospectFollowupSummary').textContent=overduePriority.length?`Clear the ${overduePriority.length} overdue Hot and Warm seller${overduePriority.length===1?'':'s'} before adding more low-priority work.`:missingFollowup?`${missingFollowup} pipeline seller${missingFollowup===1?' has':'s have'} no next follow-up date.`:'Priority follow-ups are under control.';
  $('#prospectAppointmentInsightGrid').innerHTML=[insightMetric('Booked',appointments.length,`${completedAppointments.length} completed`),insightMetric('Listing',listingAppointments.length,'Seller appointments'),insightMetric('Appraisal',appraisalAppointments.length,'BAP / MAP'),insightMetric('From calls',appointmentBooked,'Logged outcomes')].join('');
  $('#prospectAppointmentSummary').textContent=!appointments.length?'No appointments fall within this period.':listingAppointments.length?`${listingAppointments.length} listing appointment${listingAppointments.length===1?'':'s'} strengthened the active seller pipeline.`:'Appointments are being created, but none are currently classified as listing appointments.';
  $('#prospectQualityInsightGrid').innerHTML=[insightMetric('Missing phone',missingPhone,'Cannot enter daily pipeline'),insightMetric('Missing address',missingAddress,'Pipeline sellers'),insightMetric('No follow-up',missingFollowup,'Pipeline sellers'),insightMetric('Unlinked LAP',unlinkedLaps,'Appointment records')].join('');
  const issueTotal=missingPhone+missingAddress+missingFollowup+unlinkedLaps;$('#prospectQualitySummary').textContent=issueTotal?`${issueTotal} data gap${issueTotal===1?'':'s'} may weaken future follow-through and reporting.`:'Your core prospecting records are well connected.';
  let focusTitle='Build meaningful activity',focusText='Log connected conversations, selling timeframe and next actions to unlock stronger direction.';
  if(overduePriority.length){focusTitle='Protect your hottest opportunities';focusText=`Complete ${overduePriority.length} overdue Hot or Warm follow-up${overduePriority.length===1?'':'s'} before starting fresh pipeline work.`}
  else if(missingFollowup){focusTitle='Give every seller a next action';focusText=`Set a follow-up date for ${missingFollowup} active pipeline seller${missingFollowup===1?'':'s'}.`}
  else if(connected.length&&appointmentRate<15){focusTitle='Convert conversations into appointments';focusText='The clearest growth lever is asking connected prospects for a specific next step.'}
  else if(nowCount+shortCount<2&&sellers.length){focusTitle='Strengthen near-term pipeline';focusText='Focus on moving qualified sellers into Now or 1–3 months through purposeful conversations.'}
  else if(appointments.length){focusTitle='Follow through on appointments';focusText='Use the appointment outcomes already recorded to advance the best sellers and schedule the next action.'}
  $('#prospectWeeklyFocusTitle').textContent=focusTitle;$('#prospectWeeklyFocusText').textContent=focusText;
  $$('[data-prospect-insight-period]').forEach(b=>b.classList.toggle('active',b.dataset.prospectInsightPeriod===prospectInsightPeriod));
}

function renderProspecting(){renderBuyerSessionHero();
  if(!$('#prospectingView'))return;
  const detail=$('#prospectDetail'),dashboard=$('#prospectingDashboard'),session=$('#prospectingSession'),detailWasOpen=Boolean(detail&&!detail.classList.contains('hidden')),sessionWasOpen=Boolean(session&&!session.classList.contains('hidden')),editorWasOpen=Boolean(detail?.querySelector('#prospectEditor,#buyerEditor,#prospectLogForm'));
  const today=todayKey(),active=activeProspects(),overdue=active.filter(p=>p.nextFollowUp&&p.nextFollowUp<today).length,due=active.filter(p=>p.nextFollowUp===today).length,hot=active.filter(p=>p.temperature==='Hot').length,followUps=dueProspectFollowUps(),pipeline=getDailyProspectPipeline(),remainingPipeline=pipeline.filter(id=>!prospectContactedToday(id));
  $('#prospectingOverdue').textContent=overdue;$('#prospectingToday').textContent=due;$('#prospectingHot').textContent=hot;$('#prospectingDueCount').textContent=remainingPipeline.length;$('#prospectingDueLabel').textContent=remainingPipeline.length===1?'client ready':'clients ready';
  const pipelineSessionActive=prospectSessionActive&&!cleanText(prospectSessionContext?.eventId,160),pipelineSessionComplete=Boolean(pipeline.length)&&remainingPipeline.length===0,pipelineSessionButton=$('#startProspectingSession');if(pipelineSessionButton){pipelineSessionButton.textContent=pipelineSessionComplete?'Session Complete':pipelineSessionActive?'Active Session':'Start Session';pipelineSessionButton.classList.remove('market-session-start-btn','market-session-active-btn','market-session-complete-btn');pipelineSessionButton.classList.add(pipelineSessionComplete?'market-session-complete-btn':pipelineSessionActive?'market-session-active-btn':'market-session-start-btn');pipelineSessionButton.disabled=pipelineSessionComplete}
  const hotSpottingEvents=normaliseMarketPulseEvents(marketPulseEvents).filter(event=>marketMatches(event).length),hotSpottingRemaining=hotSpottingEvents.map(event=>{const matches=marketMatches(event),progress=marketSessionProgress(event,matches);return Math.max(0,progress.total-progress.workedIds.size)}),hotSpottingReady=hotSpottingRemaining.reduce((total,remaining)=>total+remaining,0),hotSpottingComplete=Boolean(hotSpottingEvents.length)&&hotSpottingRemaining.every(remaining=>remaining===0),hotSpottingActive=!hotSpottingComplete&&hotSpottingEvents.some(event=>Boolean(event.sessionStartedAt)&&!event.sessionCompletedAt),hotSpottingButton=$('#openHotSpotting');if($('#hotSpottingReadyCount'))$('#hotSpottingReadyCount').textContent=hotSpottingReady;if($('#hotSpottingReadyLabel'))$('#hotSpottingReadyLabel').textContent=hotSpottingReady===1?'client ready':'clients ready';if(hotSpottingButton){hotSpottingButton.textContent=hotSpottingComplete?'Session Complete':hotSpottingActive?'Active Session':'Start Session';hotSpottingButton.classList.remove('market-session-start-btn','market-session-active-btn','market-session-complete-btn');hotSpottingButton.classList.add(hotSpottingComplete?'market-session-complete-btn':hotSpottingActive?'market-session-active-btn':'market-session-start-btn')}
  const streak=currentCallStreakSummary();if($('#currentCallStreak'))$('#currentCallStreak').textContent=streak.count;if($('#currentCallStreakMeta'))$('#currentCallStreakMeta').textContent=streak.meta;if($('#agntLiveInsight'))$('#agntLiveInsight').textContent=prospectLiveInsight({overdue,due,hot,remainingPipeline:remainingPipeline.length,hotSpottingReady});
  if($('#pipelineWorkState'))$('#pipelineWorkState').textContent=pipelineSessionActive?`${Math.max(0,prospectSessionIds.length-prospectSessionIndex)} remaining · session active`:pipelineSessionComplete?'Daily pipeline cleared':remainingPipeline.length?`${remainingPipeline.length} remaining · ${formatEstimatedTime(estimatedMinutes(remainingPipeline.length,180))}`:'No pipeline queue waiting';
  if($('#hotSpottingWorkState'))$('#hotSpottingWorkState').textContent=hotSpottingActive?'Live street session in progress':hotSpottingComplete?'All current opportunities completed':hotSpottingReady?`${hotSpottingEvents.length} opportunit${hotSpottingEvents.length===1?'y':'ies'} · ${formatEstimatedTime(estimatedMinutes(hotSpottingReady))}`:'No matching neighbours yet';
  const draftCount=selectedBroadcastRecipientIds.size;if($('#broadcastWorkState'))$('#broadcastWorkState').textContent=selectedBroadcastType?`${draftCount||'No'} recipient${draftCount===1?'':'s'} selected`:(campaignHistory.length?`${campaignHistory.length} campaign${campaignHistory.length===1?'':'s'} launched`:'Choose an audience to begin');
  $('#prospectQueue').innerHTML=followUps.length?followUps.map(followUpChecklistCard).join(''):'<div class="prospect-empty"><strong>Follow-ups cleared</strong><small>You’re up to date. New due and overdue follow-ups will appear here.</small></div>';
  const list=filteredProspects();$('#prospectContactList').innerHTML=list.length?list.map(p=>prospectCard(p,{contactsView:true})).join(''):'<div class="prospect-empty"><strong>No matching contacts</strong><small>Try another search, add a contact or import a CSV.</small></div>';
  const count=$('#prospectContactCount');if(count)count.textContent=`${list.length} contact${list.length===1?'':'s'} · Sorted A–Z`;
  renderBuyerProfiles();
  const archivedMode=prospectContactsMode==='archived',heading=$('#prospectContactsHeading'),eyebrow=$('#prospectContactsEyebrow'),archiveToggle=$('#toggleArchivedContacts'),importButton=$('.prospect-import-button'),archivedBack=$('#backFromArchivedContacts');if(heading)heading.textContent=archivedMode?'Archived contacts':'Your database';if(eyebrow)eyebrow.textContent=archivedMode?'ARCHIVED':'CONTACTS';if(archiveToggle)archiveToggle.textContent=archivedMode?'Contacts':`Archived (${archivedProspects().length})`;if(importButton)importButton.classList.toggle('hidden',archivedMode);if(archivedBack)archivedBack.classList.toggle('hidden',!archivedMode);
  const selectedCount=$('#prospectSelectedCount');if(selectedCount)selectedCount.textContent=`${selectedProspectIds.size} selected`;const deleteButton=$('#deleteSelectedProspects'),restoreButton=$('#restoreSelectedProspects');if(deleteButton)deleteButton.disabled=!selectedProspectIds.size;if(restoreButton){restoreButton.disabled=!selectedProspectIds.size;restoreButton.classList.toggle('hidden',!archivedMode)}const selectAll=$('#selectAllProspects');if(selectAll)selectAll.textContent=list.length&&list.every(p=>selectedProspectIds.has(p.id))?'Deselect All':'Select All';const bulkBar=$('.prospect-bulk-bar');if(bulkBar)bulkBar.classList.toggle('hidden',!prospectBulkMode);const bulkToggle=$('#toggleProspectBulk');if(bulkToggle)bulkToggle.textContent=prospectBulkMode?'Done':'Manage Contacts';
  renderSellerPipeline();
  renderProspectorInsights();
  renderTodayFollowUpQueue();
  const sessionLogOpen=prospectSessionActive&&$('#prospectLogForm')?.dataset.fromSession==='1'&&detailWasOpen;
  setProspectorSection(prospectSection,{resetSubview:false});
  if(sessionLogOpen||detailWasOpen&&editorWasOpen){
    dashboard?.classList.add('hidden');session?.classList.add('hidden');detail?.classList.remove('hidden');
  }else if(prospectSessionActive&&prospectSection==='today'&&(sessionWasOpen||session?.dataset.sessionView==='1')){
    showProspectingSession();
  }else if(detailWasOpen&&activeProspectId){
    dashboard?.classList.add('hidden');session?.classList.add('hidden');detail?.classList.remove('hidden');
    if(prospectSection==='buyers'&&prospectHasActiveBuyerRole(prospectById(activeProspectId)))renderBuyerDetail(activeProspectId);else renderProspectDetail(activeProspectId);
  }else{
    session?.classList.add('hidden');detail?.classList.add('hidden');dashboard?.classList.remove('hidden');
  }
}
function prospectForm(p={},draft=null,prefill={}){
  const draftValues=!p.id&&draft?.values?draft.values:{},current={...p,...prefill,...draftValues};Object.entries(prefill||{}).forEach(([key,value])=>{if(!current[key])current[key]=value});current.stage=current.stage||'New Lead';current.temperature=current.temperature||'Cold';current.motivation=Number(current.motivation)||1;
  const buyerLinked=prospectHasActiveBuyerRole(p),buyerRole=buyerLinked?`<section class="contact-buyer-role linked"><div><span>BUYER + SELLER</span><strong>Buyer brief linked</strong><small>This is the same profile shown in Buyers.</small></div><button type="button" data-open-buyer-role="${escapeHtml(p.id)}">Open buyer brief</button></section>`:`<label class="contact-buyer-role"><input type="checkbox" name="addBuyerBrief" value="1" ${current.addBuyerBrief?'checked':''}><span><strong>This contact is also buying</strong><small>Save the contact, then add their buyer requirements to this same profile.</small></span></label>`,draftAttrs=!p.id?` data-contact-draft="1" data-contact-draft-id="${escapeHtml(draft?.draftId||prospectId())}" data-contact-draft-opened-at="${Number(draft?.openedAt)||Date.now()}"`:'';
  return`<form id="prospectEditor" class="prospect-editor glass"${draftAttrs} data-temperature-manual="${draft?.temperatureManual?'1':current.temperatureManual?'1':'0'}" data-motivation-manual="${draft?.motivationManual?'1':current.motivationManual?'1':'0'}"><div class="prospect-detail-nav"><button type="button" data-close-prospect>‹ Back</button><strong>${p.id?'Edit Contact':'New Contact'}</strong><span></span></div><label>Name<input name="name" value="${escapeHtml(current.name||'')}" autocomplete="name" required></label><div class="prospect-form-grid"><label>Phone<input name="phone" type="tel" inputmode="tel" autocomplete="tel" value="${escapeHtml(current.phone||'')}"></label><label>Email<input name="email" type="email" inputmode="email" autocomplete="email" value="${escapeHtml(current.email||'')}"></label></div><label>Address<input name="address" autocomplete="street-address" value="${escapeHtml(current.address||'')}"></label><div class="prospect-form-grid"><label>Source<input name="source" value="${escapeHtml(current.source||'')}" placeholder="Door knock, database…"></label><label>Stage<select name="stage">${['New Lead','Nurture','Appraisal Opportunity','Appointment Booked','Pipeline','Listed','Past Client'].map(x=>`<option ${current.stage===x?'selected':''}>${x}</option>`).join('')}</select></label></div><div class="prospect-form-grid"><label>Temperature<select name="temperature" data-pipeline-temperature-field>${['Cold','Warm','Hot'].map(x=>`<option ${current.temperature===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Motivation<select name="motivation" data-pipeline-motivation-field>${[1,2,3,4,5].map(x=>`<option value="${x}" ${Number(current.motivation)===x?'selected':''}>${x} / 5</option>`).join('')}</select></label></div><label>Selling timeframe<select name="sellingTimeframe" data-pipeline-timeframe-field><option value="">Not currently selling</option>${SELLING_TIMEFRAMES.map(x=>`<option value="${x}" ${current.sellingTimeframe===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Tags<input name="tags" value="${escapeHtml(Array.isArray(current.tags)?current.tags.join(', '):current.tags||'')}" placeholder="Vendor, Toongabbie, Past client"></label><label>Next follow-up<input name="nextFollowUp" type="date" value="${current.nextFollowUp||''}"></label><label>Background notes<textarea name="notes" rows="4" placeholder="Long-term context, plans and personal details">${escapeHtml(current.notes||'')}</textarea></label>${buyerRole}<button class="primary" type="submit">${p.id?'Save Contact':'Add Contact'}</button></form>`
}
function openProspectEditor(id='',options={}){const p=id?prospectById(id):{},draft=!id?(options.draft||readContactDraft()):null;activeProspectId=p?.id||null;$('#prospectingDashboard').classList.add('hidden');$('#prospectingSession').classList.add('hidden');$('#prospectDetail').classList.remove('hidden');$('#prospectDetail').innerHTML=prospectForm(p,draft,options.prefill||{});if(!id&&options.prefill)saveContactDraftFromForm($('#prospectEditor'))}
function prospectBuyerRoleMarkup(p={}){const linked=prospectHasActiveBuyerRole(p);return`<section class="prospect-buyer-role ${linked?'linked':''}"><div><span>${linked?'BUYER + SELLER':'CONTACT ROLE'}</span><strong>${linked?'Buyer brief linked':'Are they also buying?'}</strong><small>${linked?'Buyer requirements, seller pipeline and history share this profile.':'Add a buyer brief without creating another contact.'}</small></div><button type="button" data-open-buyer-role="${escapeHtml(p.id)}">${linked?'Open buyer brief':'Add buyer brief'}</button></section>`}
function renderProspectDetail(id){const p=prospectById(id);if(!p)return closeProspectDetail();activeProspectId=p.id;const history=interactionsFor(p.id),phone=primaryProspectPhone(p),tel=prospectTel(p),sms=phone?`sms:${phone.replace(/[^+\d]/g,'')}`:'#';$('#prospectDetail').innerHTML=`<div class="prospect-detail-nav"><button type="button" data-close-prospect>‹ Back</button><button type="button" data-edit-prospect="${p.id}">Edit</button></div><section class="prospect-profile glass"><div class="prospect-profile-top"><span class="prospect-avatar large">${escapeHtml(p.name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase())}</span><div><span>${escapeHtml(p.stage)}</span><h2>${escapeHtml(p.name)}</h2><small>${escapeHtml(formatProspectAddress(p.address||p.company,p.suburb)||'No address added')}</small></div><span class="prospect-temp temp-${p.temperature.toLowerCase()}">${p.temperature}</span></div>${prospectIsBuyerSeller(p)?'<span class="prospect-buyer-seller-badge">Buyer + Seller</span>':''}<div class="prospect-quick-actions"><a href="${tel}" class="${phone?'':'disabled'}" data-prospect-call="${p.id}" data-call-from-session="0">Call</a><a href="${sms}" class="${phone?'':'disabled'}">Message</a><button type="button" data-log-prospect="${p.id}">Log Contact</button></div>${prospectBuyerRoleMarkup(p)}<div class="prospect-profile-grid"><div><span>NEXT FOLLOW-UP</span><strong>${p.nextFollowUp?fmtDate(p.nextFollowUp):'Not set'}</strong></div><div><span>LAST CONTACT</span><strong>${p.lastContact?fmtDate(p.lastContact):'Never'}</strong></div><div><span>MOTIVATION</span><strong>${p.motivation}/5</strong></div><div><span>CONTACTS</span><strong>${history.length}</strong></div></div>${pipelineTimeframeForProspect(p)?`<div class="prospect-selling-status"><span>SELLING TIMEFRAME</span><strong>${escapeHtml(pipelineTimeframeForProspect(p))}</strong>${pipelineAppointmentLabel(p)?`<small>${escapeHtml(pipelineAppointmentLabel(p))}</small>`:''}</div>`:''}${p.tags.length?`<div class="prospect-tags">${p.tags.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div>`:''}${p.notes?`<p class="prospect-background">${escapeHtml(p.notes)}</p>`:''}</section><section class="prospecting-section glass"><div class="prospecting-section-head"><div><span>CONTACT HISTORY</span><h3>Every conversation</h3></div></div><div class="prospect-history">${history.length?history.map(x=>`<article><i></i><div><strong>${escapeHtml(x.outcome||x.type)}</strong><small>${fmtDate(x.date)} · ${new Date(x.at).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})}</small>${x.note?`<p>${escapeHtml(x.note)}</p>`:''}${x.nextFollowUp?`<em>Follow-up: ${fmtDate(x.nextFollowUp)}</em>`:''}${marketFollowUpHistoryMarkup(x)}</div></article>`).join(''):'<div class="prospect-empty"><strong>No contact history yet</strong><small>Log the first conversation to start building context.</small></div>'}</div></section><button class="prospect-delete" type="button" data-delete-prospect="${p.id}">Delete Contact</button>`}
function closeProspectDetail(){activeProspectId=null;$('#prospectDetail').classList.add('hidden');$('#prospectDetail').innerHTML='';$('#prospectingSession').classList.add('hidden');$('#prospectingDashboard').classList.remove('hidden');renderProspecting()}
function prospectingSignature(prospectList=prospects,interactionList=prospectInteractions,marketEvents=marketPulseEvents,marketHistory=marketPulseHistory){return JSON.stringify({prospects:prospectList,interactions:interactionList,marketPulseEvents:normaliseMarketPulseEvents(marketEvents),marketPulseHistory:normaliseMarketPulseHistory(marketHistory)})}
function saveProspectingLocal(){
  const prefix=storagePrefix(uid);
  try{
    localStorage.setItem(prefix+'prospects',JSON.stringify(prospects));
    localStorage.setItem(prefix+'prospect-interactions',JSON.stringify(prospectInteractions));
    localStorage.setItem(prefix+'market-pulse-events',JSON.stringify(marketPulseEvents));
    localStorage.setItem(prefix+'market-pulse-history',JSON.stringify(normaliseMarketPulseHistory(marketPulseHistory)));
    localStorage.setItem(prefix+'campaign-history',JSON.stringify(campaignHistory.slice(0,20)));
    localStorage.setItem(prefix+'bulk-sms-test-launches',JSON.stringify(bulkSmsTestLaunches.slice(0,10)));
    return true
  }catch(err){console.error('Prospecting local save failed',err);return false}
}
async function flushProspectingSave(){
  clearTimeout(prospectingSaveTimer);prospectingSaveTimer=null;
  if(!cloud||!db||!uid||prospectingWriteInFlight||!pendingProspectingPayload)return;
  const payload=pendingProspectingPayload,signature=pendingProspectingSignature,waiters=prospectingSaveWaiters.splice(0);
  pendingProspectingPayload=null;pendingProspectingSignature='';
  if(signature===lastProspectingSignature){waiters.forEach(({resolve})=>resolve());return}
  prospectingWriteInFlight=true;beginSyncOperation();
  try{await setDoc(doc(db,'users',uid,'prospecting','state'),{...payload,clientUpdatedAt:Date.now(),updatedAt:serverTimestamp()},{merge:false});lastProspectingSignature=signature;endSyncOperation();waiters.forEach(({resolve})=>resolve())}
  catch(err){console.error(err);endSyncOperation({error:true});waiters.forEach(({reject})=>reject(err));toast('Prospecting changes saved on this device. Cloud sync failed.')}
  finally{prospectingWriteInFlight=false;if(pendingProspectingPayload){prospectingSaveTimer=setTimeout(flushProspectingSave,80)}}
}
function queueProspectingSave(){
  if(!cloud||!db||!uid)return Promise.resolve();
  marketPulseHistory=normaliseMarketPulseHistory([...marketPulseHistory,...marketPulseEvents]);
  const snapshot={prospects:normaliseProspects(prospects),interactions:normaliseProspectInteractions(prospectInteractions),marketPulseEvents:normaliseMarketPulseEvents(marketPulseEvents),marketPulseHistory},signature=prospectingSignature(snapshot.prospects,snapshot.interactions,snapshot.marketPulseEvents,snapshot.marketPulseHistory);
  if(signature===lastProspectingSignature&&!pendingProspectingPayload&&!prospectingWriteInFlight)return Promise.resolve();
  pendingProspectingPayload=snapshot;pendingProspectingSignature=signature;
  const promise=new Promise((resolve,reject)=>prospectingSaveWaiters.push({resolve,reject}));
  clearTimeout(prospectingSaveTimer);prospectingSaveTimer=setTimeout(flushProspectingSave,160);
  return promise;
}
async function saveProspecting({render=true,awaitCloud=true}={}){
  saveProspectingLocal();if(render)renderProspecting();
  const sync=queueProspectingSave();
  if(!awaitCloud){sync.catch(err=>console.error('Deferred prospecting sync failed',err));return}
  await sync
}
async function creditNewProspectData(record,{awaitCloud=false}={}){const at=Number(record?.dataCreditedAt)||Number(record?.createdAt)||Date.now(),k=dateKey(new Date(at)),d=dayData(k);if(d.events.some(event=>event?.type==='data'&&String(event?.sourceProspectId||'')===String(record.id)))return;d.data=Math.max(0,(Number(d.data)||0)+1);d.events.push({id:uuid(),type:'data',label:`New Contact · ${record.name||'Contact'}`,delta:1,at,sourceProspectId:record.id});d.events=d.events.slice(-500);days[k]=d;haptic();await saveDay(k,{quiet:true,awaitCloud,render:false})}
async function upsertProspect(data,id=''){const stableId=cleanText(id,80)||prospectId(),resolution=resolveBuyerCanonical(data,stableId),existing=resolution.record,createdAt=existing?.createdAt||Date.now(),dataCreditedAt=existing?.dataCreditedAt||(!existing?createdAt:0),buyerLinked=prospectHasActiveBuyerRole(existing),positionTags=buyerLinked?Array.from(new Set(['Buyer Seller',...buyerPositionTags(existing)])):buyerPositionTags(existing||{}),record=normaliseProspect({...existing,...data,id:existing?.id||stableId,sellerProfileActive:Boolean(existing?.sellerProfileActive||existing?.recordType==='buyer'),buyerPositionTags:positionTags,buyerSeller:buyerLinked||existing?.buyerSeller,dataCreditedAt,createdAt,updatedAt:Date.now()});if(existing)prospects=prospects.map(p=>p.id===record.id?record:p);else prospects.unshift(record);if(existing&&existing.sellingTimeframe!==record.sellingTimeframe)prospectInteractions.push({id:prospectId(),prospectId:record.id,date:todayKey(),at:Date.now(),type:'Pipeline',outcome:'Selling timeframe updated',note:`Selling timeframe changed from ${existing.sellingTimeframe||'Not set'} to ${record.sellingTimeframe||'Not currently selling'}.`,nextFollowUp:''});await saveProspecting({render:false,awaitCloud:false});if(!existing)await creditNewProspectData(record,{awaitCloud:false});return{record,reusedExisting:Boolean(existing),unified:resolution.unified}}
function marketFollowUpDefaultTrigger(event={}){const type=normalisePlace(event.eventType);if(type==='just listed'||type==='price update'||type==='under offer')return'sold';if(type==='withdrawn')return'any';return''}
function marketFollowUpFieldMarkup(event,prospectId){
  const eventType=normalisePlace(event?.eventType);if(!event?.eventId||eventType==='sold'||eventType==='auction result')return'';const propertyKey=event.propertyKey||marketPropertyKey(event.address,event.suburb),existing=prospectInteractions.find(item=>item.prospectId===prospectId&&item.marketPropertyKey===propertyKey&&item.marketFollowUpStatus==='pending'),selected=existing?.marketFollowUpTrigger||marketFollowUpDefaultTrigger(event);
  const options=[['','No follow-up'],['sold','Sold'],['price','Price change'],['auction','Auction date'],['withdrawn','Withdrawn'],['any','All updates']];
  return`<label class="market-followup-field" data-market-followup-field><span>Hot Spotting Follow-Up</span><select name="marketFollowUpTrigger">${options.map(([value,label])=>`<option value="${value}" ${selected===value?'selected':''}>${label}</option>`).join('')}</select></label>`
}
function marketFollowUpOutcomeEligible(outcome=''){return['Connected','Appraisal opportunity','Appointment booked','Not interested'].includes(outcome)}
function syncMarketFollowUpField(form){const field=form?.querySelector('[data-market-followup-field]'),select=field?.querySelector('select');if(!field||!select)return;const eligible=marketFollowUpOutcomeEligible(form.querySelector('[name="outcome"]')?.value||'');field.classList.toggle('hidden',!eligible);select.disabled=!eligible}
function marketFollowUpFieldsFromForm(formData,outcome,fromSession){
  const context=fromSession&&prospectSessionContext?.eventId?prospectSessionContext:null,trigger=marketFollowUpOutcomeEligible(outcome)?cleanText(formData.get('marketFollowUpTrigger'),20):'';if(!context||!['sold','price','auction','withdrawn','any'].includes(trigger))return{};
  const propertyKey=context.propertyKey||marketPropertyKey(context.address,context.suburb);return{marketFollowUpTrigger:trigger,marketFollowUpStatus:'pending',marketPropertyKey:propertyKey,marketFollowUpSourceEventId:cleanText(context.eventId,160),marketFollowUpSourceEventType:cleanText(context.eventType,60),marketFollowUpAddress:cleanText(context.address,240),marketFollowUpSuburb:cleanText(context.suburb,100),marketFollowUpOriginalPrice:cleanText(context.price||context.guide,120),marketFollowUpOriginalAuctionDate:validDateKey(context.auctionDate)?context.auctionDate:''}
}
function marketFollowUpHistoryMarkup(interaction){
  if(interaction.marketFollowUpStatus==='pending')return`<em class="market-followup-history">Hot Spotting follow-up: ${escapeHtml(marketFollowUpTriggerLabel(interaction.marketFollowUpTrigger))} · ${escapeHtml([interaction.marketFollowUpAddress,interaction.marketFollowUpSuburb].filter(Boolean).join(', '))}</em>`;
  if(interaction.marketFollowUpStatus==='triggered')return`<em class="market-followup-history triggered">Follow-up ready: ${escapeHtml(interaction.marketFollowUpTriggeredReason||marketFollowUpTriggerLabel(interaction.marketFollowUpTrigger))}</em>`;return''
}
function marketFollowUpSessionPromptMarkup(event,prospectId){const prompt=marketFollowUpPrompt(event,prospectId);return prompt?`<aside class="market-followup-prompt"><span>HOT SPOTTING FOLLOW-UP</span><strong>${escapeHtml(prompt.reason)}</strong><p>${escapeHtml(prompt.context)}</p></aside>`:''}
function openProspectLog(id,fromSession=false,{returnMode=''}={}){
  const p=prospectById(id);if(!p)return;const marketEvent=fromSession&&prospectSessionContext?.eventId?prospectSessionContext:null;
  $('#prospectDetail').classList.remove('hidden');$('#prospectingDashboard').classList.add('hidden');$('#prospectingSession').classList.add('hidden');activeProspectId=id;
  $('#prospectDetail').innerHTML=`<form id="prospectLogForm" class="prospect-editor glass" data-from-session="${fromSession?'1':'0'}" data-return-mode="${escapeHtml(returnMode)}"><div class="prospect-detail-nav"><button type="button" data-cancel-log aria-label="Back">‹</button><strong>Log Contact</strong><button type="button" data-edit-prospect="${p.id}">Edit</button></div><div class="prospect-log-person"><span>${escapeHtml(p.name)}</span><small>${escapeHtml(primaryProspectPhone(p)||p.address||'')}</small></div><label>Outcome<select name="outcome"><option>Connected</option><option>No answer</option><option>Left voicemail</option><option>Sent SMS</option><option>Appraisal opportunity</option><option>Appointment booked</option><option>Not interested</option><option>Do not contact</option><option>Archive</option></select></label><label>Conversation note<textarea name="note" rows="5" placeholder="What changed? What matters next?"></textarea></label>${marketFollowUpFieldMarkup(marketEvent,p.id)}<div class="prospect-form-grid"><label>Temperature<select name="temperature" data-pipeline-temperature-field>${['Cold','Warm','Hot'].map(x=>`<option ${p.temperature===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Next follow-up<input name="nextFollowUp" type="date" value="${p.nextFollowUp||''}"></label></div><label>Selling timeframe<select name="sellingTimeframe" data-pipeline-timeframe-field><option value="">Leave unchanged</option>${SELLING_TIMEFRAMES.map(x=>`<option value="${x}">${x}</option>`).join('')}<option value="Not currently selling">Not currently selling</option></select></label><button class="primary" type="submit">Save & ${fromSession?'Next':'Finish'}</button></form>`;
  syncMarketFollowUpField($('#prospectLogForm'))
}
function prospectSessionStorageKey(){return`agnt-prospect-session-v105-${uid||currentUser?.uid||'device'}`}
function nextProspectPipelineBatch(){
  const served=getDailyProspectServedIds();
  prospectSessionIds.forEach(id=>served.add(id));
  return sortedEligibleProspectPipeline().filter(p=>!served.has(p.id)&&!prospectContactedToday(p.id)).slice(0,50).map(p=>p.id);
}
function closePipelineRefreshConfirm(){document.querySelectorAll('.pipeline-refresh-overlay').forEach(node=>node.remove());document.body.classList.remove('pipeline-refresh-open')}
function openPipelineRefreshConfirm(){
  if(!prospectSessionActive||cleanText(prospectSessionContext?.eventId,160))return;
  closePipelineRefreshConfirm();
  const next=nextProspectPipelineBatch();
  if(!next.length)return toast('No new eligible clients are available right now');
  const overlay=document.createElement('div');overlay.className='pipeline-refresh-overlay';
  overlay.innerHTML=`<section class="pipeline-refresh-card" role="dialog" aria-modal="true" aria-labelledby="pipelineRefreshTitle"><span class="eyebrow">REFRESH SESSION</span><h2 id="pipelineRefreshTitle">Load a new client queue?</h2><p>This will replace the current queue with ${next.length} new eligible client${next.length===1?'':'s'} using the same pipeline criteria. Anyone already served in today’s session stays excluded, and activity you’ve already logged remains unchanged.</p><div class="pipeline-refresh-actions"><button class="secondary" type="button" data-cancel-pipeline-refresh>Keep Current</button><button class="primary" type="button" data-confirm-pipeline-refresh>Refresh ${next.length}</button></div></section>`;
  overlay.addEventListener('click',event=>{event.stopPropagation();if(event.target===overlay||event.target.closest('[data-cancel-pipeline-refresh]')){closePipelineRefreshConfirm();return}if(event.target.closest('[data-confirm-pipeline-refresh]'))confirmPipelineRefresh()});
  overlay.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closePipelineRefreshConfirm()}});
  document.body.classList.add('pipeline-refresh-open');document.body.append(overlay);requestAnimationFrame(()=>overlay.querySelector('[data-cancel-pipeline-refresh]')?.focus());
}
function confirmPipelineRefresh(){
  const next=nextProspectPipelineBatch();
  if(!next.length){closePipelineRefreshConfirm();return toast('No new eligible clients are available right now')}
  addDailyProspectServedIds(prospectSessionIds);addDailyProspectServedIds(next);
  prospectSessionIds=next;prospectSessionIndex=0;
  try{localStorage.setItem(dailyProspectPipelineKey(),JSON.stringify(next))}catch(err){console.warn('Refreshed pipeline could not be saved',err)}
  saveProspectingSessionState();closePipelineRefreshConfirm();showProspectingSession();renderProspecting();toast(`${next.length} new clients loaded`);
}
function saveProspectingSessionState(){try{localStorage.setItem(prospectSessionStorageKey(),JSON.stringify({active:prospectSessionActive,ids:prospectSessionIds,index:prospectSessionIndex,stats:prospectSessionStats,context:prospectSessionContext,updatedAt:Date.now()}))}catch(err){console.warn('Session state could not be saved',err)}}
function clearProspectingSessionState(){try{localStorage.removeItem(prospectSessionStorageKey())}catch(err){console.warn('Session state could not be cleared',err)}}
function restoreProspectingSessionState(){try{const raw=JSON.parse(localStorage.getItem(prospectSessionStorageKey())||'null');if(!raw?.active||!Array.isArray(raw.ids)||!raw.ids.length)return;prospectSessionIds=raw.ids.filter(id=>typeof id==='string');prospectSessionIndex=Math.max(0,Math.min(Number(raw.index)||0,prospectSessionIds.length));prospectSessionStats={calls:Number(raw.stats?.calls)||0,connects:Number(raw.stats?.connects)||0,temperate:Number(raw.stats?.temperate)||0,appointments:Number(raw.stats?.appointments)||0,sms:Number(raw.stats?.sms)||0};prospectSessionContext=raw.context&&typeof raw.context==='object'?raw.context:null;prospectSessionActive=prospectSessionIds.length>0}catch(err){console.warn('Session state could not be restored',err);clearProspectingSessionState()}}
function startProspectingSession(){if(prospectSessionActive){showProspectingSession();return}prospectSessionIds=getDailyProspectPipeline().filter(id=>!prospectContactedToday(id));prospectSessionIndex=0;prospectSessionActive=true;prospectSessionStats={calls:0,connects:0,temperate:0,appointments:0,sms:0};prospectSessionContext=null;if(!prospectSessionIds.length){prospectSessionActive=false;return toast('Today’s pipeline is complete')}addDailyProspectServedIds(prospectSessionIds);saveProspectingSessionState();showProspectingSession()}
function prospectOutcomeMetricDelta(outcome){
  const connectedOutcomes=new Set(['Connected','Appraisal opportunity','Appointment booked','Not interested','Do not contact']);
  const isSms=outcome==='Sent SMS';
  return{calls:isSms?0:1,connects:!isSms&&connectedOutcomes.has(outcome)?1:0};
}
async function applyProspectingOutcomeMetrics(outcome,interactionId,{awaitCloud=true}={}){
  const key=todayKey(),d=dayData(key);
  if(d.events.some(event=>event?.sourceInteractionId===interactionId))return;
  const delta=prospectOutcomeMetricDelta(outcome),at=Date.now();
  d.calls=Math.max(0,d.calls+delta.calls);
  d.events.push({id:uuid(),type:'calls',label:`Prospector · ${outcome}`,delta:delta.calls,at,sourceInteractionId:interactionId});
  if(delta.connects){
    d.connects=Math.max(0,d.connects+delta.connects);
    d.events.push({id:uuid(),type:'connects',label:`Prospector · ${outcome}`,delta:delta.connects,at,sourceInteractionId:interactionId});
  }
  d.events=d.events.slice(-500);days[key]=d;haptic();await saveDay(key,{quiet:true,awaitCloud});
}

function hotSpotSmsFirstName(p){const name=cleanText(p?.name,120);if(!name)return'there';if(/\s(?:&|and)\s/i.test(name))return name;return name.split(/\s+/)[0]||'there'}
function hotSpotSmsPricePhrase(c){const raw=cleanText(c?.price||c?.guide,120);if(!raw||/^(?:n\/?a|contact agent|undisclosed|price withheld)$/i.test(raw))return'';const value=raw.replace(/^price\s*[:\-]?\s*/i,'').trim();if(!value)return'';const type=cleanText(c?.eventType,60).toLowerCase();if(type==='sold'||type==='auction result')return` for ${value}`;if(type==='price update')return` to ${value}`;if(type==='just listed'||type==='under offer')return` at ${value}`;return''}
function hotSpotSmsEventPhrase(c){const type=cleanText(c?.eventType,60).toLowerCase();if(type==='just listed')return'has just been listed for sale';if(type==='sold')return'has recently sold';if(type==='price update')return'has had its advertised price updated';if(type==='withdrawn')return'has been withdrawn from the market';if(type==='under offer')return'is now under offer';if(type==='auction result')return'has had an auction result recorded';return'has had a recent market update'}
function hotSpotSmsMovementPhrase(c){if(!c?.priceMovementDirection)return'';const type=normalisePlace(c.eventType),amount=c.priceMovementAmount?`${c.priceMovementAmount} `:'',percent=c.priceMovementPercent?` (${c.priceMovementPercent} ${c.priceMovementDirection})`:'';if(type==='sold'||type==='auction result')return`, which was ${amount}${c.priceMovementDirection} the asking price${percent}`;if(type==='price update')return`, a ${amount}reduction${percent}`;return''}
function hotSpotSmsAuctionPhrase(c){const label=marketAuctionLabel(c);return label?`. ${label}`:''}
function hotSpotSmsAgentName(){const activeUid=currentUser?.uid||uid;let savedName='';try{if(activeUid)savedName=localStorage.getItem(storagePrefix(activeUid)+'agent-name')||''}catch(err){console.warn('Agent profile name could not be read for SMS',err)}const profileName=cleanText(savedName||agentName||currentUser?.displayName||'',120);if(profileName)return profileName;const emailName=cleanText(currentUser?.email?.split('@')[0]||'',120).replace(/[._-]+/g,' ').replace(/\b\w/g,char=>char.toUpperCase());return emailName||'Agent'}
function hotSpotSmsMessage(p){const c=prospectSessionContext||{},property=[c.address,c.suburb].filter(Boolean).join(', '),name=hotSpotSmsAgentName();return`Hi ${hotSpotSmsFirstName(p)},\n\n${name} from McGrath here. Just a quick heads up that ${property} ${hotSpotSmsEventPhrase(c)}${hotSpotSmsPricePhrase(c)}${hotSpotSmsMovementPhrase(c)}${hotSpotSmsAuctionPhrase(c)}.\n\nIf you have any questions or would like to know what this means for your property, please don’t hesitate to let me know.\n\nThanks,\n${name} | McGrath`}
function hotSpotSmsPendingKey(){return`agnt-hotspot-sms-pending-${uid||currentUser?.uid||'device'}`}
function saveHotSpotSmsPending(value){try{if(value)localStorage.setItem(hotSpotSmsPendingKey(),JSON.stringify(value));else localStorage.removeItem(hotSpotSmsPendingKey())}catch(err){console.warn('SMS confirmation state could not be saved',err)}}
function loadHotSpotSmsPending(){try{return JSON.parse(localStorage.getItem(hotSpotSmsPendingKey())||'null')}catch{return null}}
function smsHref(number,body){const clean=String(number||'').replace(/[^+\d]/g,'');return`sms:${clean}${/iPhone|iPad|iPod/i.test(navigator.userAgent)?'&':'?'}body=${encodeURIComponent(body)}`}
function openHotSpotSmsComposer(prospectId){const p=prospectById(prospectId),phone=primaryProspectPhone(p);if(!p||!phone)return toast('A mobile number is required');if(!prospectSessionContext?.eventId){window.location.href=smsHref(phone,'');return}const host=$('#prospectingSession');host.innerHTML=`<div class="prospect-session-head"><button type="button" data-cancel-sms>‹ Back</button><span>SMS Preview</span></div>${prospectSessionContextStrip()}<section class="prospect-session-card glass hotspot-sms-preview"><span class="eyebrow">MESSAGE ${escapeHtml(hotSpotSmsFirstName(p).toUpperCase())}</span><h2>Review SMS</h2><textarea data-hotspot-sms-body rows="12">${escapeHtml(hotSpotSmsMessage(p))}</textarea><button class="primary" type="button" data-open-hotspot-messages="${escapeHtml(p.id)}">Open Messages</button><button class="text-btn" type="button" data-cancel-sms>Cancel</button></section>`}
function showHotSpotSmsConfirmation(pending=loadHotSpotSmsPending()){if(!pending||!prospectSessionActive||pending.eventId!==cleanText(prospectSessionContext?.eventId,160))return;const p=prospectById(pending.prospectId);if(!p)return saveHotSpotSmsPending(null);const host=$('#prospectingSession');if(!host)return;$('#prospectingDashboard')?.classList.add('hidden');$('#prospectDetail')?.classList.add('hidden');host.classList.remove('hidden');host.innerHTML=`<div class="prospect-session-head"><button type="button" data-sms-not-sent aria-label="Back">‹</button><span>Confirm SMS</span></div>${prospectSessionContextStrip()}<section class="prospect-session-card glass hotspot-sms-confirm"><span class="prospect-avatar session-avatar">✓</span><h2>Was the SMS sent?</h2><p>Confirm only after sending it in Messages.</p><button class="primary" type="button" data-sms-sent>SMS Sent</button><button class="secondary" type="button" data-sms-not-sent>Not Sent</button></section>`}
function resumeHotSpotSmsReturn(){const pending=loadHotSpotSmsPending();if(!pending||!prospectSessionActive||pending.eventId!==cleanText(prospectSessionContext?.eventId,160))return false;const age=Date.now()-(Number(pending.openedAt)||0);if(age<350||age>10*60*1000){if(age>10*60*1000)saveHotSpotSmsPending(null);return false}switchView('prospectingView');setProspectorSection('today',{todayMode:'dashboard'});showHotSpotSmsConfirmation(pending);return true}
async function confirmHotSpotSmsSent(){const pending=loadHotSpotSmsPending();if(!pending)return;const p=prospectById(pending.prospectId);if(!p)return saveHotSpotSmsPending(null);const interactionId=prospectId(),at=Date.now();prospectInteractions.push({id:interactionId,prospectId:p.id,date:todayKey(),at,type:'SMS',outcome:'Sent SMS',note:cleanText(pending.message,2000),nextFollowUp:'',marketEventId:cleanText(pending.eventId,160)});prospects=prospects.map(x=>x.id===p.id?normaliseProspect({...x,lastContact:todayKey(),updatedAt:at}):x);prospectSessionStats.sms=(Number(prospectSessionStats.sms)||0)+1;prospectSessionIndex++;saveHotSpotSmsPending(null);saveProspectingSessionState();try{await saveProspecting({render:false,awaitCloud:false})}catch(err){console.error('Hot Spotting SMS save failed',err);toast('SMS was saved locally. Please check sync.')}toast('SMS logged');showProspectingSession()}
function prospectSessionContextStrip(){if(!prospectSessionContext)return'';const c=prospectSessionContext,primary=c.price||c.guide,movement=marketMovementLabel(c),prior=c.priorPrice?`${c.guide?'Prior guide':'Asking'} ${c.priorPrice}`:'',auction=marketAuctionLabel(c),details=[c.eventType,primary,prior,auction,c.daysOnMarket,c.agency].filter(Boolean);return`<aside class="market-session-context"><span>WHY YOU’RE CALLING</span><strong>${escapeHtml([c.address,c.suburb].filter(Boolean).join(', '))}</strong><small>${details.map(escapeHtml).join(' · ')}</small>${movement?`<em class="market-price-movement market-price-${escapeHtml(c.priceMovementDirection)}">${escapeHtml(movement)}</em>`:''}${c.propertyDetails?`<small>${escapeHtml(c.propertyDetails)}</small>`:''}</aside>`}
function prospectSessionHeaderStatus(remaining){return `<div class="prospect-session-head-status"><span>${remaining} remaining</span><span>${formatEstimatedTime(estimatedMinutes(remaining))} left</span></div>`}
function latestProspectContactContext(prospect={}){const latest=interactionsFor(prospect.id).find(item=>['Call','SMS','Appointment','Follow-up'].includes(item.type));if(!latest)return{label:'No interaction recorded',note:''};const label=cleanText(latest.outcome||latest.type,80),note=cleanText(latest.note,180);return{label,note:normalisePlace(note)===normalisePlace(label)?'':note}}
function showProspectingSession(){if(!prospectSessionActive)return closeProspectDetail();if(prospectSection!=='today')return;prospectTodayMode='dashboard';const sessionHost=$('#prospectingSession');if(sessionHost)sessionHost.dataset.sessionView='1';$('#prospectingDashboard').classList.add('hidden');$('#prospectDetail').classList.add('hidden');sessionHost?.classList.remove('hidden');while(prospectSessionIndex<prospectSessionIds.length){const current=prospectById(prospectSessionIds[prospectSessionIndex]);if(current&&!current.archived)break;prospectSessionIndex++}saveProspectingSessionState();const remaining=Math.max(0,prospectSessionIds.length-prospectSessionIndex);if(prospectSessionIndex>=prospectSessionIds.length){$('#prospectingSession').innerHTML=`<div class="prospect-session-head"><button type="button" data-session-back aria-label="Back">‹</button>${prospectSessionHeaderStatus(0)}<button type="button" data-end-session>End Session</button></div><section class="prospect-session-card glass prospect-session-complete"><span class="prospect-avatar session-avatar">✓</span><h2>Queue complete</h2><p>You’ve worked through every contact in this session.</p><button class="primary" type="button" data-complete-market-session>Review & End Session</button>${!cleanText(prospectSessionContext?.eventId,160)?'<button class="prospect-session-refresh-bottom" type="button" data-refresh-pipeline-session><span aria-hidden="true">↻</span> Refresh Session</button>':''}</section>`;return}const id=prospectSessionIds[prospectSessionIndex],p=prospectById(id);const phone=primaryProspectPhone(p),tel=prospectTel(p),marketEvent=prospectSessionContext?.eventId?(marketPulseEvents.find(event=>event.id===prospectSessionContext.eventId)||prospectSessionContext):null,lastContext=latestProspectContactContext(p);$('#prospectingSession').innerHTML=`<div class="prospect-session-head"><button type="button" data-session-back aria-label="Back">‹</button>${prospectSessionHeaderStatus(remaining)}<button type="button" data-end-session>End Session</button></div>${prospectSessionContextStrip()}<section class="prospect-session-card glass"><span class="prospect-avatar session-avatar">${escapeHtml(p.name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase())}</span><span>${escapeHtml(p.stage)} · ${p.temperature}</span><h2>${escapeHtml(p.name)}</h2><p>${escapeHtml(formatProspectAddress(p.address||p.company,p.suburb)||p.phone||'No contact detail added')}</p>${marketEvent?marketFollowUpSessionPromptMarkup(marketEvent,p.id):''}<div class="prospect-session-context"><div><span>LAST CONTACT</span><strong>${p.lastContact?fmtDate(p.lastContact):'Never'}</strong><small>${escapeHtml([lastContext.label,lastContext.note].filter(Boolean).join(' · '))}</small></div><div><span>NEXT FOLLOW-UP</span><strong>${p.nextFollowUp?fmtDate(p.nextFollowUp):'Not set'}</strong></div></div>${p.notes?`<blockquote>${escapeHtml(p.notes)}</blockquote>`:''}<div class="prospect-session-actions"><a class="primary ${phone?'':'disabled'}" href="${tel}" data-prospect-call="${p.id}" data-call-from-session="1">Call ${escapeHtml(p.name.split(' ')[0])}</a><button class="primary hotspot-sms-btn ${phone?'':'disabled'}" type="button" data-session-sms="${p.id}" ${phone?'':'disabled'}>SMS ${escapeHtml(hotSpotSmsFirstName(p))}</button></div><button class="secondary" type="button" data-session-log="${p.id}">Log Outcome</button><button class="text-btn" type="button" data-session-skip>Skip for now</button>${!cleanText(prospectSessionContext?.eventId,160)?'<button class="prospect-session-refresh-bottom" type="button" data-refresh-pipeline-session><span aria-hidden="true">↻</span> Refresh Session</button>':''}</section>`}

function endProspectingSession({completeMarketSession=false}={}){
  if(!prospectSessionActive)return closeProspectDetail();
  if(document.querySelector('.prospect-session-review-overlay'))return;
  const stats={...prospectSessionStats},marketEventId=cleanText(prospectSessionContext?.eventId,160),returnToHotSpotting=Boolean(marketEventId),marketEvent=marketPulseEvents.find(event=>event.id===marketEventId),marketProgress=marketEvent?marketSessionProgress(marketEvent,marketMatches(marketEvent)):null;
  if(marketEventId){
    marketPulseEvents=normaliseMarketPulseEvents(marketPulseEvents.map(event=>event.id===marketEventId?{
      ...event,
      sessionStartedAt:completeMarketSession?(event.sessionStartedAt||Date.now()):0,
      sessionCompletedAt:completeMarketSession?Date.now():0
    }:event));
    saveLocal();
    queueProspectingSave().catch(err=>console.error(completeMarketSession?'Hot Spotting completion sync failed':'Hot Spotting session reset sync failed',err));
  }
  prospectSessionActive=false;prospectSessionIds=[];prospectSessionIndex=0;prospectSessionContext=null;clearProspectingSessionState();
  if($('#prospectingSession'))delete $('#prospectingSession').dataset.sessionView;
  $('#prospectingSession').classList.add('hidden');$('#prospectDetail').classList.add('hidden');$('#prospectingDashboard').classList.remove('hidden');
  const overlay=document.createElement('div');overlay.className='prospect-session-review-overlay';overlay.innerHTML=`<section class="prospect-session-review glass" role="dialog" aria-modal="true" aria-label="Session review"><span class="eyebrow">SESSION REVIEW</span><h2>Strong work.</h2><p>Here’s what you completed.</p><div class="prospect-session-review-grid ${returnToHotSpotting?'expanded':''}">${returnToHotSpotting?`<div><strong>${marketProgress?.total||0}</strong><span>Neighbours</span></div>`:''}<div><strong>${stats.calls}</strong><span>Calls</span></div><div><strong>${Number(stats.sms)||0}</strong><span>SMS</span></div><div><strong>${stats.connects}</strong><span>Connects</span></div>${returnToHotSpotting?`<div><strong>${marketEvent?.skippedProspectIds?.length||0}</strong><span>Skips</span></div><div><strong>${marketProgress?.followUps||0}</strong><span>Follow-ups</span></div>`:`<div><strong>${stats.temperate}</strong><span>Warm / Hot</span></div><div><strong>${stats.appointments}</strong><span>Appointments</span></div>`}</div><button class="primary" type="button" data-close-session-review>Done</button></section>`;document.body.append(overlay);
  overlay.querySelector('[data-close-session-review]').onclick=()=>{
    overlay.remove();if(returnToHotSpotting)marketPageMode='hotspotting';setProspectorSection(returnToHotSpotting?'market':'today');renderProspecting();if(returnToHotSpotting)requestAnimationFrame(()=>{const view=$('#prospectingView');if(view)view.scrollTop=0});
  };
}


function knockingSessionStorageKey(){return `agnt-knocking-session-${currentUser?.uid||'device'}`}
function normaliseKnockingLogEntry(entry={}){return{id:String(entry.id||uuid()),type:['data','MAP','LAP'].includes(entry.type)?entry.type:'data',name:cleanText(entry.name,120),phone:cleanText(entry.phone,50),address:cleanText(entry.address,240),date:String(entry.date||''),time:String(entry.time||''),prospectId:String(entry.prospectId||''),appointmentId:String(entry.appointmentId||''),createdDate:String(entry.createdDate||todayKey()),at:Number(entry.at)||Date.now()}}
function saveKnockingSessionState(){try{localStorage.setItem(knockingSessionStorageKey(),JSON.stringify({active:knockingSessionActive,stats:knockingSessionStats,log:knockingSessionLog,startSeconds:knockingSessionStartSeconds,streetKey:selectedKnockingStreetKey,updatedAt:Date.now()}))}catch(err){console.warn('Knocking session state could not be saved',err)}}
function clearKnockingSessionState(){try{localStorage.removeItem(knockingSessionStorageKey())}catch(err){console.warn('Knocking session state could not be cleared',err)}}
function restoreKnockingSessionState(){try{const raw=JSON.parse(localStorage.getItem(knockingSessionStorageKey())||'null');if(!raw?.active)return;knockingSessionStats={knocks:Number(raw.stats?.knocks)||0,clients:Number(raw.stats?.clients)||0,data:Number(raw.stats?.data)||0,MAP:Number(raw.stats?.MAP)||0,LAP:Number(raw.stats?.LAP)||0};knockingSessionLog=Array.isArray(raw.log)?raw.log.map(normaliseKnockingLogEntry):[];knockingSessionStartSeconds=Math.max(0,Number(raw.startSeconds)||0);selectedKnockingStreetKey=cleanText(raw.streetKey,220);knockingSessionActive=true;knockingSessionVisible=Boolean(dayData(todayKey()).timerStartedAt)}catch(err){console.warn('Knocking session state could not be restored',err);clearKnockingSessionState()}}
function knockingRates(stats=knockingSessionStats){const knocks=Math.max(0,Number(stats.knocks)||0),connects=Math.max(0,Number(stats.clients)||0),data=Math.max(0,Number(stats.data)||0),appointments=Math.max(0,(Number(stats.MAP)||0)+(Number(stats.LAP)||0));return{connect:knocks?Math.round(connects/knocks*100):0,data:connects?Math.round(data/connects*100):0,appointment:connects?Math.round(appointments/connects*100):0}}
function knockingRatesMarkup(stats){const r=knockingRates(stats);return `<div><strong>${r.connect}%</strong><span>Connect rate</span></div><div><strong>${r.data}%</strong><span>Data rate</span></div><div><strong>${r.appointment}%</strong><span>Appointment rate</span></div>`}
function completedKnockingSessionsForDay(key=todayKey()){const d=dayData(key);return Array.isArray(d.knockingSessions)?d.knockingSessions:[]}
function dailyKnockingStats(key=todayKey()){const total=completedKnockingSessionsForDay(key).reduce((acc,session)=>{for(const metric of Object.keys(acc))acc[metric]+=Math.max(0,Number(session.stats?.[metric])||0);return acc},{knocks:0,clients:0,data:0,MAP:0,LAP:0});if(key===todayKey()&&knockingSessionActive)for(const metric of Object.keys(total))total[metric]+=Math.max(0,Number(knockingSessionStats[metric])||0);return total}
function dailyKnockingLog(key=todayKey()){const seen=new Set(),entries=[];for(const session of completedKnockingSessionsForDay(key)){for(const raw of Array.isArray(session.log)?session.log:[]){const entry=normaliseKnockingLogEntry(raw);if(seen.has(entry.id))continue;seen.add(entry.id);entries.push(entry)}}if(key===todayKey()&&knockingSessionActive){for(const raw of knockingSessionLog){const entry=normaliseKnockingLogEntry(raw);if(seen.has(entry.id))continue;seen.add(entry.id);entries.push(entry)}}return entries}
function findDailyKnockingLogEntry(id,key=todayKey()){const active=knockingSessionLog.find(entry=>entry.id===id);if(active)return{entry:active,session:null};for(const session of completedKnockingSessionsForDay(key)){const entry=(Array.isArray(session.log)?session.log:[]).find(item=>String(item.id)===String(id));if(entry)return{entry,session}}return null}
function knockingLogMeta(entry){const appointment=entry.type==='MAP'||entry.type==='LAP';return [entry.address,entry.phone,appointment&&entry.date?`${fmtDate(entry.date)}${entry.time?` · ${timelineTimeLabel(timelineMinutes(entry.time))}`:''}`:''].filter(Boolean).join(' · ')}
function renderKnockingSessionLog(){const host=$('#knockingSessionLog');if(!host)return;const log=dailyKnockingLog(todayKey());if(!log.length){host.innerHTML='<div class="knocking-log-empty">No data or appointments captured yet.</div>';return}host.innerHTML=[...log].reverse().map(entry=>`<article class="knocking-log-item"><div><span>${escapeHtml(entry.type)}</span><strong>${escapeHtml(entry.name||'Unnamed contact')}</strong><small>${escapeHtml(knockingLogMeta(entry)||'Details captured')}</small></div><div class="knocking-log-actions"><button type="button" data-edit-knock-log="${escapeHtml(entry.id)}">Edit</button><button type="button" data-delete-knock-log="${escapeHtml(entry.id)}">Delete</button></div></article>`).join('')}
function titleCaseMarketStreet(value=''){return String(value||'').split(/\s+/).filter(Boolean).map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(' ')}
function knockingStreetContacts(event={}){
  const eventKey=marketStreetKey(event.address,event.suburb)||event.streetKey;
  if(!eventKey)return[];
  return activeProspects().filter(p=>prospectMarketKey(p)===eventKey&&!interactionsFor(p.id).some(item=>item.outcome==='Do not contact'))
}
function knockingHotSpottingRecommendations(){
  const eligible=normaliseMarketPulseHistory([...marketPulseHistory,...marketPulseEvents]).map(event=>({event,contacts:knockingStreetContacts(event)})).filter(item=>item.contacts.length),latestDate=eligible.reduce((latest,item)=>item.event.receivedDate>latest?item.event.receivedDate:latest,'');
  if(!latestDate)return[];
  const grouped=new Map();
  for(const {event,contacts} of eligible.filter(item=>item.event.receivedDate===latestDate)){
    const key=marketStreetKey(event.address,event.suburb)||event.streetKey;if(!key)continue;
    const [street,suburb]=key.split('|'),priority=hotSpottingPriority(event,contacts.length),recency=relativeEventRecency(event);
    const existing=grouped.get(key)||{key,street:titleCaseMarketStreet(street),suburb:titleCaseMarketStreet(suburb),score:0,events:[],neighbours:new Set(),newestDays:Infinity,sourceDate:latestDate,fallback:latestDate!==todayKey()};
    existing.score=Math.max(existing.score,priority.score);existing.events.push(event);contacts.forEach(p=>existing.neighbours.add(p.id));existing.newestDays=Math.min(existing.newestDays,recency.days);grouped.set(key,existing);
  }
  return [...grouped.values()].map(item=>({...item,neighbourCount:item.neighbours.size,priority:item.score>=72?'High':item.score>=50?'Medium':'Standard',recency:item.newestDays===0?'Today':item.newestDays===1?'Yesterday':`${item.newestDays} days ago`,conversations:streetConversationCount(item.events,[...item.neighbours])})).sort((a,b)=>b.score-a.score||b.neighbourCount-a.neighbourCount||a.newestDays-b.newestDays).slice(0,3);
}
function renderKnockingHotSpotting(){
  const section=$('#knockingHotSpottingRecommendations'),host=$('#knockingHotSpottingList'),count=$('#knockingHotSpottingCount'),select=$('#knockingStreetSelect'),summary=$('#knockingStreetSummary');if(!section||!host||!select)return;
  const remaining=Math.max(15,rollingKnockTarget(todayKey())-Math.floor(liveKnockSeconds(dayData(todayKey()))/60)),streets=dailyPlanStreetAllocations(knockingHotSpottingRecommendations(),remaining);section.classList.toggle('hidden',!streets.length);if(count)count.textContent=streets.length;
  if(!streets.length){selectedKnockingStreetKey='';select.innerHTML='';host.innerHTML='';if(summary)summary.textContent='';return}
  if(!streets.some(item=>item.key===selectedKnockingStreetKey))selectedKnockingStreetKey=streets[0].key;
  select.innerHTML=streets.map(item=>`<option value="${escapeHtml(item.key)}" ${item.key===selectedKnockingStreetKey?'selected':''}>${escapeHtml([item.street,item.suburb].filter(Boolean).join(', '))}</option>`).join('');
  const selected=streets.find(item=>item.key===selectedKnockingStreetKey)||streets[0],reasons=[...new Set(selected.events.map(event=>cleanText(event.eventType,60)).filter(Boolean))],properties=selected.events.map(event=>event.address).filter(Boolean),context=`${selected.neighbourCount} saved contact${selected.neighbourCount===1?'':'s'} · ${selected.recency} · ${selected.conversations} previous street conversation${selected.conversations===1?'':'s'}`;
  if(summary)summary.textContent=`${reasons.join(' + ')} · ${selected.neighbourCount} saved contact${selected.neighbourCount===1?'':'s'} · ${selected.minutes} min target`;
  host.innerHTML=`<article class="knocking-hotspot-item selected"><div><strong>${escapeHtml(selected.street)}</strong><small>${escapeHtml(selected.suburb)}</small></div><div class="knocking-hotspot-reasons">${reasons.map(reason=>`<span class="market-event-tag event-${marketTypeClass(reason)}">${escapeHtml(reason)}</span>`).join('')}</div><div class="knocking-recommendation-context"><span class="priority-${selected.priority.toLowerCase()}">${selected.priority} priority</span><span>${selected.minutes} min on street</span></div><p><strong>${escapeHtml(context)}</strong><br>${escapeHtml(properties.slice(0,2).join(' · '))}${properties.length>2?` · +${properties.length-2} more`:''}</p></article>`;
}
function renderKnockingSession(){
  const session=$('#knockingSession');if(!session)return;
  session.classList.toggle('hidden',!knockingSessionActive||!knockingSessionVisible);
  if(!knockingSessionActive||!knockingSessionVisible)return;
  renderKnockingHotSpotting();
  const d=dayData(todayKey()),running=Boolean(d.timerStartedAt);
  renderKnockingSessionTimerOnly();
  $('#pauseKnockingSession').textContent=running?'Pause':'Resume';
  $('#pauseKnockingSession').setAttribute('aria-label',running?'Pause knocking timer':'Resume knocking timer');
  const dailyStats=dailyKnockingStats(todayKey());
  $('#knockSessionKnocks').textContent=dailyStats.knocks;
  $('#knockSessionClients').textContent=dailyStats.clients;
  $('#knockSessionData').textContent=dailyStats.data;
  $('#knockSessionMap').textContent=dailyStats.MAP;
  $('#knockSessionLap').textContent=dailyStats.LAP;
  $('#knockingSessionRates').innerHTML=knockingRatesMarkup(dailyStats);
  renderKnockingSessionLog();
}
function knockingSessionElapsedSeconds(){return Math.max(0,liveKnockSeconds(dayData(todayKey()))-knockingSessionStartSeconds)}
function renderKnockingSessionTimerOnly(){const timer=$('#knockingSessionTimer');if(timer&&knockingSessionActive&&knockingSessionVisible)timer.textContent=fmtTimer(knockingSessionElapsedSeconds())}
function openKnockingSession(){if(!knockingSessionActive)knockingSessionStartSeconds=liveKnockSeconds(dayData(todayKey()));knockingSessionActive=true;knockingSessionVisible=true;saveKnockingSessionState();renderKnockingSession();const button=$('#toggleKnockingHotSpotting'),list=$('#knockingHotSpottingList'),section=$('#knockingHotSpottingRecommendations');if(button&&list&&section&&!section.classList.contains('hidden')){button.setAttribute('aria-expanded','true');list.classList.remove('hidden');section.classList.add('expanded')}}
async function startKnockingSession(){
  if(!canEditDate(selectedDate))return lockedToast();
  if(selectedDate!==todayKey())return toast('Doorknocking sessions are available for today only');
  openKnockingSession();
  const d=dayData(selectedDate);if(!d.timerStartedAt)await toggleTimer();
}
function knockingCaptureMarkup(type,entry=null){
  const isAppointment=type==='MAP'||type==='LAP',title=isAppointment?`${entry?'Edit':'Book'} ${type}`:`${entry?'Edit':'Capture'} Data`;
  return `<section class="knocking-capture-card glass" role="dialog" aria-modal="true" aria-label="${title}"><div class="knocking-capture-head"><div><span>DOORKNOCKING</span><h2>${title}</h2></div><button type="button" data-close-knock-capture aria-label="Close">×</button></div><form id="knockingCaptureForm"><label>Client name<input name="name" type="text" autocomplete="name" autocapitalize="words" value="${escapeHtml(entry?.name||'')}" required></label><label>Phone number<input name="phone" type="tel" autocomplete="tel" inputmode="tel" value="${escapeHtml(entry?.phone||'')}" required></label><label>Property address<input name="address" type="text" autocomplete="street-address" value="${escapeHtml(entry?.address||'')}" required></label>${isAppointment?`<div class="knocking-capture-schedule"><label>Booking date<input name="date" type="date" value="${escapeHtml(entry?.date||todayKey())}" required></label><label>Booking time<input name="time" type="time" value="${escapeHtml(entry?.time||'12:00')}" required></label></div>`:''}<div class="form-error hidden" data-knock-capture-error role="alert"></div><button class="primary" type="submit">${entry?'Save Changes':isAppointment?`Book ${type}`:'Add to Contacts'}</button></form></section>`;
}
function openKnockingCapture(type,entry=null){knockingCaptureType=type;knockingEditingLogId=entry?.id||'';const overlay=$('#knockingCaptureOverlay');overlay.innerHTML=knockingCaptureMarkup(type,entry);overlay.classList.remove('hidden');requestAnimationFrame(()=>overlay.querySelector('input')?.focus({preventScroll:true}))}
function closeKnockingCapture(){knockingCaptureType='';knockingEditingLogId='';const overlay=$('#knockingCaptureOverlay');if(overlay){overlay.classList.add('hidden');overlay.innerHTML=''}}
function findKnockingProspect(name,phone,address){return findProspectForAppointment({contactName:name,contactNumber:phone,address})}
async function addKnockingContact({name,phone,address,source}){let p=findKnockingProspect(name,phone,address);if(p)return p;p=normaliseProspect({id:prospectId(),name,phone,address,source,stage:'Nurture',temperature:'Cold',createdAt:Date.now(),updatedAt:Date.now()});prospects.unshift(p);prospects=normaliseProspects(prospects);await saveProspecting({render:false});return p}
async function updateKnockingLogEntry(entry,values){
  const p=prospects.find(x=>String(x.id)===String(entry.prospectId));if(p){p.name=values.name;p.phone=values.phone;p.address=values.address;p.updatedAt=Date.now();await saveProspecting({render:false})}
  if(entry.appointmentId){const d=dayData(entry.createdDate),a=d.appointments.find(x=>String(x.id)===String(entry.appointmentId));if(a){a.contactName=values.name;a.contactNumber=values.phone;a.address=values.address;a.date=values.date;a.scheduledDate=values.date;a.time=values.time;a.scheduledAt=new Date(`${values.date}T${values.time}`).getTime();days[entry.createdDate]=d;await saveDay(entry.createdDate)}}
  Object.assign(entry,values);saveKnockingSessionState();closeKnockingCapture();renderKnockingSession();toast('Session entry updated')
}
async function submitKnockingCapture(form){
  const f=new FormData(form),name=cleanText(f.get('name'),120),phone=cleanText(f.get('phone'),50),address=cleanText(f.get('address'),240),error=form.querySelector('[data-knock-capture-error]');
  if(!name||!phone||!address){error.textContent='Add the client name, phone number and property address.';error.classList.remove('hidden');return}
  const submit=form.querySelector('button[type=submit]');submit.disabled=true;submit.textContent='Saving…';
  try{
    const type=knockingCaptureType,date=String(f.get('date')||''),time=String(f.get('time')||'');
    if(knockingEditingLogId){const found=findDailyKnockingLogEntry(knockingEditingLogId);if(!found)throw new Error('Session entry not found');await updateKnockingLogEntry(found.entry,{name,phone,address,date,time});if(found.session){days[todayKey()]=dayData(todayKey());await saveDay(todayKey())}return}
    const p=await addKnockingContact({name,phone,address,source:type==='data'?'Doorknocking data':`Doorknocking ${type}`});let appointment=null;
    if(type==='data'){await changeMetric('data',1);knockingSessionStats.data++}else{appointment=await addAppointment({contactName:name,contactNumber:phone,address,date,time,type,prospectId:p.id});if(!appointment){submit.disabled=false;submit.textContent=`Book ${type}`;return}knockingSessionStats[type]++}
    knockingSessionLog.push(normaliseKnockingLogEntry({type,name,phone,address,date,time,prospectId:p.id,appointmentId:appointment?.id||'',createdDate:todayKey(),at:Date.now()}));
    saveKnockingSessionState();closeKnockingCapture();renderKnockingSession();haptic();toast(type==='data'?'Contact added and data logged':`${type} booked`);
  }catch(err){console.error('Doorknocking capture failed',err);error.textContent='Could not save this result. Please try again.';error.classList.remove('hidden');submit.disabled=false;submit.textContent=knockingEditingLogId?'Save Changes':knockingCaptureType==='data'?'Add to Contacts':`Book ${knockingCaptureType}`}
}
async function deleteKnockingLogEntry(id){
  const found=findDailyKnockingLogEntry(id);if(!found)return;const {entry,session}=found;if(!confirm(`Delete this ${entry.type} session entry?`))return;
  if(entry.type==='data'){await changeMetric('data',-1);if(session)session.stats.data=Math.max(0,(Number(session.stats?.data)||0)-1);else knockingSessionStats.data=Math.max(0,knockingSessionStats.data-1)}else{const d=dayData(entry.createdDate),before=d.appointments.length;d.appointments=d.appointments.filter(a=>String(a.id)!==String(entry.appointmentId));if(d.appointments.length!==before){days[entry.createdDate]=d;await saveDay(entry.createdDate)}if(session)session.stats[entry.type]=Math.max(0,(Number(session.stats?.[entry.type])||0)-1);else knockingSessionStats[entry.type]=Math.max(0,knockingSessionStats[entry.type]-1)}
  if(session){session.log=(Array.isArray(session.log)?session.log:[]).filter(item=>String(item.id)!==String(id));days[todayKey()]=dayData(todayKey());await saveDay(todayKey())}else{const index=knockingSessionLog.findIndex(item=>item.id===id);if(index>=0)knockingSessionLog.splice(index,1);saveKnockingSessionState()}
  renderKnockingSession();toast('Session entry deleted')
}
function completedKnockingSessions(){return Object.entries(days).flatMap(([date,d])=>(Array.isArray(d.knockingSessions)?d.knockingSessions:[]).map(session=>({...session,date:session.date||date}))).sort((a,b)=>(Number(b.endedAt)||0)-(Number(a.endedAt)||0))}
function renderKnockingHistory(){
  const view=$('#knockingHistoryView');if(!view)return;const sessions=completedKnockingSessions(),totals=sessions.reduce((acc,s)=>{Object.keys(acc).forEach(k=>acc[k]+=Number(s.stats?.[k])||0);return acc},{knocks:0,clients:0,data:0,MAP:0,LAP:0}),duration=sessions.reduce((sum,s)=>sum+(Number(s.durationSeconds)||0),0);
  $('#knockingHistorySummary').innerHTML=`<div><span>ALL-TIME KNOCKING</span><strong>${fmtTimer(duration)}</strong><small>${sessions.length} completed session${sessions.length===1?'':'s'}</small></div><div class="knocking-history-totals"><b>${totals.knocks}<small>Knocks</small></b><b>${totals.clients}<small>Connects</small></b><b>${totals.data}<small>Data</small></b><b>${totals.MAP+totals.LAP}<small>Appts</small></b></div>`;
  const list=$('#knockingHistoryList');if(!sessions.length){list.innerHTML='<div class="knocking-history-empty">Completed sessions will appear here.</div>';return}list.innerHTML=sessions.map((s,i)=>`<details class="knocking-history-item" ${i===0?'open':''}><summary><div><span>${escapeHtml(fmtDate(s.date))}</span><strong>${fmtTimer(Number(s.durationSeconds)||0)}</strong></div><div><b>${Number(s.stats?.knocks)||0} knocks</b><small>${Number(s.stats?.clients)||0} connects · ${Number(s.stats?.data)||0} data · ${(Number(s.stats?.MAP)||0)+(Number(s.stats?.LAP)||0)} appts</small></div></summary><div class="knocking-history-rates">${knockingRatesMarkup(s.stats||{})}</div><div class="knocking-history-log">${(s.log||[]).length?(s.log||[]).map(entry=>`<article><span>${escapeHtml(entry.type)}</span><strong>${escapeHtml(entry.name||'Unnamed contact')}</strong><small>${escapeHtml(knockingLogMeta(entry)||'Details captured')}</small></article>`).join(''):'<small>No client details captured in this session.</small>'}</div></details>`).join('')
}
function openKnockingHistory(){renderKnockingHistory();$('#knockingHistoryView').classList.remove('hidden')}
function closeKnockingHistory(){$('#knockingHistoryView').classList.add('hidden')}
async function endKnockingSession(){
  if(!knockingSessionActive||knockingSessionEnding)return;knockingSessionEnding=true;
  const endButton=$('#endKnockingSession'),key=todayKey(),stats={...knockingSessionStats},log=knockingSessionLog.map(normaliseKnockingLogEntry),endedAt=Date.now();
  if(endButton){endButton.disabled=true;endButton.textContent='Ending…'}
  try{
    const d=dayData(key),finalSeconds=liveKnockSeconds(d),durationSeconds=Math.max(0,finalSeconds-knockingSessionStartSeconds);
    d.knockSeconds=finalSeconds;d.timerStartedAt=null;d.alarmPlayed=Boolean(d.alarmPlayed);
    d.knockingSessions=Array.isArray(d.knockingSessions)?d.knockingSessions:[];d.knockingSessions.push({id:uuid(),date:key,startedAt:endedAt-durationSeconds*1000,endedAt,durationSeconds,stats,log});d.knockingSessions=d.knockingSessions.slice(-100);
    days[key]=d;await saveDay(key,{awaitCloud:false,render:false});ensureTick();
    knockingSessionActive=false;knockingSessionVisible=false;knockingSessionStats={knocks:0,clients:0,data:0,MAP:0,LAP:0};knockingSessionLog=[];knockingSessionStartSeconds=0;selectedKnockingStreetKey='';clearKnockingSessionState();closeKnockingCapture();renderKnockingSession();renderToday();closeKnockingHistory();switchView('todayView');
    document.querySelectorAll('.prospect-session-review-overlay[data-knocking-review]').forEach(node=>node.remove());
    const rates=knockingRates(stats),overlay=document.createElement('div');overlay.className='prospect-session-review-overlay';overlay.dataset.knockingReview='1';overlay.innerHTML=`<section class="prospect-session-review glass" role="dialog" aria-modal="true" aria-label="Knocking session review"><span class="eyebrow">KNOCKING REVIEW</span><h2>Session complete.</h2><p>${fmtTimer(durationSeconds)} on the street. Here’s what you completed.</p><div class="prospect-session-review-grid knocking-review-grid"><div><strong>${stats.knocks}</strong><span>Knocks</span></div><div><strong>${stats.clients}</strong><span>Connects</span></div><div><strong>${stats.data}</strong><span>Data</span></div><div><strong>${stats.MAP}</strong><span>MAP</span></div><div><strong>${stats.LAP}</strong><span>LAP</span></div></div><div class="knocking-review-rates"><div><strong>${rates.connect}%</strong><span>Connect rate</span></div><div><strong>${rates.data}%</strong><span>Data rate</span></div><div><strong>${rates.appointment}%</strong><span>Appointment rate</span></div></div><button class="primary" type="button" data-close-session-review>Done</button></section>`;document.body.append(overlay);overlay.querySelector('[data-close-session-review]').onclick=()=>overlay.remove();
  }catch(err){console.error('Knocking session could not be ended',err);toast('Could not end the session. Please try again.')}
  finally{knockingSessionEnding=false;if(endButton){endButton.disabled=false;endButton.textContent='End Session'}}
}

function parseCsv(text){const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'&&quoted&&n==='"'){cell+='"';i++;continue}if(c==='"'){quoted=!quoted;continue}if(c===','&&!quoted){row.push(cell);cell='';continue}if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';continue}cell+=c}row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows}
async function importProspectCsv(file){const rows=parseCsv(await file.text());if(rows.length<2)throw new Error('No contact rows found');const headers=rows.shift().map(x=>x.trim().toLowerCase());const findExact=(obj,names)=>{for(const n of names){const key=headers.findIndex(h=>h===n);if(key>=0&&obj[key])return obj[key]}return''};const find=(obj,names)=>{const exact=findExact(obj,names);if(exact)return exact;for(const n of names){const key=headers.findIndex(h=>h.includes(n));if(key>=0&&obj[key])return obj[key]}return''};let added=0;for(const r of rows){const name=find(r,['name','contact name','full name'])||[find(r,['first name']),find(r,['last name'])].filter(Boolean).join(' ');const phone=find(r,['mobile','phone','telephone']);const email=find(r,['email']);const organisation=findExact(r,['organisation','organization']);const company=findExact(r,['company']);const suburb=find(r,['suburb']);const rawAddress=organisation||findExact(r,['address'])||find(r,['property address','street address'])||company;const address=formatProspectAddress(rawAddress,suburb);if(!name&&!phone&&!email&&!address&&!company)continue;prospects.push(normaliseProspect({name:name||'Unnamed contact',phone,email,address,company:organisation||company,suburb,source:find(r,['source']),tags:find(r,['tags','category']),stage:find(r,['stage'])||'Nurture',temperature:find(r,['temperature'])||'Cold',nextFollowUp:find(r,['next follow up','follow up date'])}));added++}prospects=normaliseProspects(prospects);await saveProspecting();toast(`${added} contact${added===1?'':'s'} imported`)}

const TEAM_SCHEMA_VERSION=2;
function normaliseTeamCode(value){return String(value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10)}
function makeTeamCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',bytes=new Uint8Array(10);crypto.getRandomValues(bytes);return Array.from(bytes,b=>chars[b%chars.length]).join('')}
function makeTeamId(){return `team_${crypto.randomUUID?.()||uuid()}`.replace(/[^A-Za-z0-9_-]/g,'_')}
function setTeamLayerStatus(status,error=''){teamLayerStatus=status;teamLayerError=error||'';renderTeamSettings();renderLeaderboardStatus()}
function clearVerifiedTeamState({forgetCached=false}={}){unsubLeaderboard?.();unsubLeaderboard=null;subscribedTeamId='';teamLeaderboardDataSignature='';lastTeamLeaderboardSignature='';if(forgetCached)forgetCachedTeamState();accountMode='unconfigured';teamId=null;teamRole=null;teamName='';teamJoinCode='';stopTeamMembershipSubscriptions();leaderboardEntries=[leaderboardPayload()];renderLeaderboard()}
function setVerifiedTeamState({mode='unconfigured',id=null,role=null,name='',joinCode=''}={}, {cache=true}={}){accountMode=mode;teamId=id;teamRole=role;teamName=name;teamJoinCode=joinCode;if(cache)cacheVerifiedTeamState()}
function restoreCachedTeamState(){const cached=readCachedTeamState(uid);if(!cached)return false;setVerifiedTeamState(cached,{cache:false});return true}
function teamLeaderboardEntriesSignature(entries){return JSON.stringify((entries||[]).map(entry=>[String(entry.uid||''),leaderboardSignature(entry)]).sort((a,b)=>a[0].localeCompare(b[0])))}
function isTransientTeamError(error){return['aborted','cancelled','deadline-exceeded','network-request-failed','resource-exhausted','unavailable','unknown'].includes(String(error?.code||'').replace(/^firestore\//,''))}
function teamSetupMessage(message,state='info'){
  const node=$('#teamSetupMessage');if(!node)return;
  node.textContent=message||'';node.dataset.state=message?state:'';
}
function setTeamSetupBusy(busy,{button=null,label=''}={}){
  teamSetupBusy=Boolean(busy);
  const card=$('.team-onboarding-card');card?.setAttribute('aria-busy',String(teamSetupBusy));
  $$('#teamOnboarding button,#teamOnboarding input').forEach(control=>{control.disabled=teamSetupBusy&&control.id!=='closeTeamSetup'});
  if(button){
    const control=$(button);if(control)control.textContent=teamSetupBusy?(label||control.textContent):(control.dataset.idleLabel||control.textContent);
  }
}
function showTeamSetupPanel(panel='choices'){
  if(teamSetupBusy)return;
  const titles={choices:'teamOnboardingTitle',create:'teamCreateTitle',join:'teamJoinTitle','join-confirm':'teamJoinConfirmTitle',created:'teamCreatedTitle'};
  $$('[data-team-panel]').forEach(el=>el.classList.toggle('hidden',el.dataset.teamPanel!==panel));
  $('.team-onboarding-card')?.setAttribute('aria-labelledby',titles[panel]||titles.choices);
  const close=$('#closeTeamSetup');if(close)close.textContent=panel==='created'?'Done':'Later';
  teamSetupMessage('');
  requestAnimationFrame(()=>{
    const focusTarget=panel==='create'?$('#newTeamName'):panel==='join'?$('#teamCodeInput'):panel==='join-confirm'?$('#confirmJoinTeam'):panel==='created'?$('#shareCreatedTeamInvite'):$('#teamChoiceSolo');
    focusTarget?.focus({preventScroll:true});
  });
}
function showTeamOnboarding(){
  if(!cloud||!currentUser)return;
  if(accountMode==='team'&&teamId)return toast(teamRole==='owner'?'Use Team Management for your current team':'Leave your current team before choosing another setup');
  pendingTeamJoin=null;
  teamSetupReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  teamOnboardingActive=true;$('#teamOnboardingEmail').textContent=currentUser.email||'';
  $('#teamOnboarding').classList.remove('hidden');$('#teamOnboarding').setAttribute('aria-hidden','false');document.body.classList.add('team-setup-open');
  showTeamSetupPanel('choices');
}
function hideTeamOnboarding(){
  pendingTeamJoin=null;teamOnboardingActive=false;$('#teamOnboarding').classList.add('hidden');$('#teamOnboarding').setAttribute('aria-hidden','true');document.body.classList.remove('team-setup-open');if($('#closeTeamSetup'))$('#closeTeamSetup').textContent='Later';
  const returnFocus=teamSetupReturnFocus;teamSetupReturnFocus=null;if(returnFocus?.isConnected)requestAnimationFrame(()=>returnFocus.focus({preventScroll:true}));
}
async function verifyMembership(profile={}){
  const id=String(profile.teamId||'');
  if(profile.accountMode!=='team'||!id)return null;
  const [memberSnap,teamSnap]=await Promise.all([getDoc(doc(db,'teams',id,'members',uid)),getDoc(doc(db,'teams',id))]);
  if(!memberSnap.exists())return null;
  const member=memberSnap.data();
  if(!teamSnap.exists())return null;
  const team=teamSnap.data();
  return{id,role:String(member.role||profile.teamRole||'member'),name:String(team.name||profile.teamName||'Team'),joinCode:String(team.joinCode||'')};
}
function clearTeamMembersSubscription(){
  unsubTeamMembers?.();unsubTeamMembers=null;subscribedMembersTeamId='';teamMembers=[];teamMembersStatus='idle';teamMembersError='';teamMembersDataSignature='';renderTeamManager();renderTeamSettings();
}
function stopTeamMembershipSubscriptions(){
  unsubTeamMembership?.();unsubTeamMembership=null;subscribedMembershipTeamId='';stopTeamAppointmentLayer();clearTeamMembersSubscription();hideTeamManager({restoreFocus:false});closeTeamMemberRemoval({force:true});hideTeamCodeRefreshConfirmation({force:true,restoreFocus:false});hideTeamDeleteConfirmation({force:true,restoreFocus:false});
}
function teamMembersSignature(entries){
  return JSON.stringify((entries||[]).map(member=>[String(member.uid||''),String(member.role||''),String(member.name||''),String(member.email||''),Number(member.joinedAt?.seconds)||Number(member.joinedAt)||0]).sort((a,b)=>a[0].localeCompare(b[0])));
}
function teamMemberDisplayName(member){
  const live=leaderboardEntries.find(entry=>String(entry.uid||'')===String(member.uid||''));
  return String(live?.name||member.name||member.email?.split('@')[0]||'Team member').trim()||'Team member';
}
function teamMemberInitials(member){return teamMemberDisplayName(member).split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()||'').join('')||'A'}
function teamMemberActivityLabel(member){
  const live=leaderboardEntries.find(entry=>String(entry.uid||'')===String(member.uid||''));
  if(live){const score=Math.max(0,Math.min(100,Number(live.score)||0));return live.date===todayKey()?`${score}% today`:`${score}% latest score`}
  const raw=member.joinedAt,ms=typeof raw?.toMillis==='function'?raw.toMillis():Number(raw?.seconds)?Number(raw.seconds)*1000:Number(raw)||0;
  return ms?`Joined ${new Intl.DateTimeFormat('en-AU',{day:'numeric',month:'short'}).format(new Date(ms))}`:'Waiting for activity';
}
function teamManagerMessage(message='',state=''){
  const node=$('#teamManagerStatus');if(!node)return;node.textContent=message;node.dataset.state=message?state:'';
}
function renderTeamManager(){
  const list=$('#teamMemberList');if(!list)return;
  $('#teamManagerTitle').textContent=teamName||'Your team';
  $('#teamManagerCode').textContent=teamRole==='owner'?teamJoinCode:'';
  const count=teamMembers.length;$('#teamManagerMemberCount').textContent=`${count} member${count===1?'':'s'}`;
  $('#teamManagerSummary').textContent=count?`${count} verified member${count===1?'':'s'} can access this private leaderboard.`:'Manage access to your private leaderboard.';
  if(teamMembers.length){
    list.innerHTML=teamMembers.map(member=>{
      const memberId=String(member.uid||''),isOwner=member.role==='owner',isCurrent=memberId===uid,name=teamMemberDisplayName(member),email=String(member.email||'');
      const action=isOwner||isCurrent?`<span class="team-member-you">${isCurrent?'You':'Owner'}</span>`:`<button class="team-member-action" type="button" data-remove-team-member="${escapeHtml(memberId)}" aria-label="Remove ${escapeHtml(name)} from ${escapeHtml(teamName||'team')}">Remove</button>`;
      return `<article class="team-member-row" role="listitem"><span class="team-member-avatar" aria-hidden="true">${escapeHtml(teamMemberInitials(member))}</span><div class="team-member-copy"><div class="team-member-name-line"><strong>${escapeHtml(name)}</strong><span class="team-member-role">${isOwner?'Owner':'Member'}</span></div><small>${escapeHtml(email||'No email shown')}</small><em>${escapeHtml(teamMemberActivityLabel(member))}</em></div>${action}</article>`;
    }).join('');
  }else if(teamMembersStatus==='connecting'||teamMembersStatus==='cached')list.innerHTML='<div class="team-member-empty"><strong>Loading members…</strong><small>Confirming the latest team access.</small></div>';
  else list.innerHTML='<div class="team-member-empty"><strong>No members found</strong><small>Share the invite code to add your first team member.</small></div>';
  if(!navigator.onLine)teamManagerMessage('Offline. The last confirmed member list is shown.');
  else if(teamMembersStatus==='error')teamManagerMessage(teamMembersError||'The member list could not be loaded.','error');
  else if(teamMembersStatus==='connecting')teamManagerMessage('Updating the member list…');
  else if($('#teamManagerStatus')?.dataset.state!=='success')teamManagerMessage('');
}
function showTeamManager(){
  if(!cloud||accountMode!=='team'||teamRole!=='owner'||!teamId)return toast('Only the team owner can manage members');
  subscribeTeamMembersForOwner();teamManagerReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;teamManagerOpen=true;teamManagerMessage('');renderTeamManager();
  $('#teamManager').classList.remove('hidden');$('#teamManager').setAttribute('aria-hidden','false');document.body.classList.add('team-manager-open');requestAnimationFrame(()=>$('#closeTeamManager')?.focus({preventScroll:true}));
}
function hideTeamManager({restoreFocus=true}={}){
  teamManagerOpen=false;$('#teamManager')?.classList.add('hidden');$('#teamManager')?.setAttribute('aria-hidden','true');document.body.classList.remove('team-manager-open');closeTeamMemberRemoval();
  const returnFocus=teamManagerReturnFocus;teamManagerReturnFocus=null;if(restoreFocus&&returnFocus)requestAnimationFrame(()=>{if(returnFocus.isConnected)returnFocus.focus({preventScroll:true})});
}
function openTeamMemberRemoval(memberId){
  if(teamMemberActionBusy||accountMode!=='team'||teamRole!=='owner')return;
  const member=teamMembers.find(entry=>String(entry.uid||'')===String(memberId||''));if(!member||member.role==='owner'||member.uid===uid)return;
  pendingTeamMemberRemoval=member;const name=teamMemberDisplayName(member);$('#teamRemoveTitle').textContent=`Remove ${name}?`;$('#teamRemoveDescription').textContent=`${name} will lose access to ${teamName||'this team'} and its leaderboard. Their contacts, notes and personal AGNT data will not be deleted. The invite code will refresh so the old code cannot be reused.`;$('#teamRemoveStatus').textContent='';
  $('#teamRemoveConfirm').classList.remove('hidden');$('#teamRemoveConfirm').setAttribute('aria-hidden','false');requestAnimationFrame(()=>$('#cancelTeamMemberRemoval')?.focus({preventScroll:true}));
}
function closeTeamMemberRemoval({force=false}={}){
  if(teamMemberActionBusy&&!force)return;if(force)teamMemberActionBusy=false;pendingTeamMemberRemoval=null;$('#teamRemoveConfirm')?.classList.add('hidden');$('#teamRemoveConfirm')?.setAttribute('aria-hidden','true');if(teamManagerOpen)requestAnimationFrame(()=>$('#closeTeamManager')?.focus({preventScroll:true}));
}
async function confirmTeamMemberRemoval(){
  if(teamMemberActionBusy||!pendingTeamMemberRemoval||accountMode!=='team'||teamRole!=='owner'||!teamId)return;
  if(!navigator.onLine){$('#teamRemoveStatus').textContent='Connect to the internet to remove this member.';return}
  const member={...pendingTeamMemberRemoval},removalTeamId=teamId,name=teamMemberDisplayName(member),previousCode=String(teamJoinCode||''),nextCode=makeTeamCode();if(member.role==='owner'||member.uid===uid)return;
  teamMemberActionBusy=true;$('#cancelTeamMemberRemoval').disabled=true;$('#confirmTeamMemberRemoval').disabled=true;$('#confirmTeamMemberRemoval').textContent='Removing…';$('#teamRemoveStatus').textContent='Updating team access…';
  try{
    const batch=writeBatch(db),now=serverTimestamp();batch.delete(doc(db,'teams',removalTeamId,'members',member.uid));batch.delete(doc(db,'teams',removalTeamId,'leaderboard',member.uid));batch.set(doc(db,'teams',removalTeamId),{joinCode:nextCode,updatedAt:now},{merge:true});batch.set(doc(db,'teamCodes',nextCode),{code:nextCode,teamId:removalTeamId,teamName:teamName||'Team',ownerUid:uid,createdAt:now});if(previousCode)batch.delete(doc(db,'teamCodes',previousCode));await batch.commit();
    teamJoinCode=nextCode;cacheVerifiedTeamState();teamMembers=teamMembers.filter(entry=>String(entry.uid||'')!==String(member.uid));teamMembersDataSignature=teamMembersSignature(teamMembers);pendingTeamMemberRemoval=null;teamMemberActionBusy=false;$('#teamRemoveConfirm').classList.add('hidden');$('#teamRemoveConfirm').setAttribute('aria-hidden','true');renderTeamManager();renderTeamSettings();teamManagerMessage(`${name} was removed. Their personal AGNT data is unchanged and the invite code was refreshed.`,'success');toast(`${name} removed from ${teamName||'team'}`);
  }catch(err){console.error('Remove team member failed',err);$('#teamRemoveStatus').textContent='This member could not be removed. No personal data was changed.'}
  finally{teamMemberActionBusy=false;$('#cancelTeamMemberRemoval').disabled=false;$('#confirmTeamMemberRemoval').disabled=false;$('#confirmTeamMemberRemoval').textContent='Remove member'}
}
function showTeamCodeRefreshConfirmation(){
  if(!cloud||accountMode!=='team'||teamRole!=='owner'||!teamId||teamInviteRefreshBusy)return;
  teamInviteRefreshReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  $('#teamCodeRefreshDescription').textContent=`The current code${teamJoinCode?` ${teamJoinCode}`:''} will stop working immediately and a new code will be created for ${teamName||'your team'}.`;
  $('#teamCodeRefreshStatus').textContent='';$('#teamCodeRefreshConfirm').classList.remove('hidden');$('#teamCodeRefreshConfirm').setAttribute('aria-hidden','false');document.body.classList.add('team-code-refresh-open');requestAnimationFrame(()=>$('#cancelTeamCodeRefresh')?.focus({preventScroll:true}));
}
function hideTeamCodeRefreshConfirmation({force=false,restoreFocus=true}={}){
  if(teamInviteRefreshBusy&&!force)return;if(force)teamInviteRefreshBusy=false;
  $('#teamCodeRefreshConfirm')?.classList.add('hidden');$('#teamCodeRefreshConfirm')?.setAttribute('aria-hidden','true');document.body.classList.remove('team-code-refresh-open');
  const cancel=$('#cancelTeamCodeRefresh'),confirm=$('#confirmTeamCodeRefresh'),status=$('#teamCodeRefreshStatus');if(cancel)cancel.disabled=false;if(confirm){confirm.disabled=false;confirm.textContent='Refresh code'}if(status)status.textContent='';
  const returnFocus=teamInviteRefreshReturnFocus;teamInviteRefreshReturnFocus=null;if(restoreFocus&&returnFocus)requestAnimationFrame(()=>{if(returnFocus.isConnected)returnFocus.focus({preventScroll:true})});
}
async function confirmTeamCodeRefresh(){
  if(teamInviteRefreshBusy||!cloud||!db||!uid||accountMode!=='team'||teamRole!=='owner'||!teamId)return;
  if(!navigator.onLine){$('#teamCodeRefreshStatus').textContent='Connect to the internet to refresh the invite code.';return}
  const refreshTeamId=String(teamId),refreshTeamName=String(teamName||'Team'),previousCode=String(teamJoinCode||''),nextCode=makeTeamCode();teamInviteRefreshBusy=true;$('#cancelTeamCodeRefresh').disabled=true;$('#confirmTeamCodeRefresh').disabled=true;$('#confirmTeamCodeRefresh').textContent='Refreshing…';$('#teamCodeRefreshStatus').textContent='Creating a secure new invite code…';
  try{
    const batch=writeBatch(db),now=serverTimestamp();batch.set(doc(db,'teams',refreshTeamId),{joinCode:nextCode,updatedAt:now},{merge:true});batch.set(doc(db,'teamCodes',nextCode),{code:nextCode,teamId:refreshTeamId,teamName:refreshTeamName,ownerUid:uid,createdAt:now});if(previousCode)batch.delete(doc(db,'teamCodes',previousCode));await batch.commit();
    teamJoinCode=nextCode;cacheVerifiedTeamState();teamInviteRefreshBusy=false;renderTeamManager();renderTeamSettings();hideTeamCodeRefreshConfirmation({force:true,restoreFocus:false});teamManagerMessage('Invite code refreshed. Existing members stay connected.','success');toast('New team invite code ready');requestAnimationFrame(()=>$('#shareTeamManagerInvite')?.focus({preventScroll:true}));
  }catch(err){console.error('Refresh team invite code failed',err);teamInviteRefreshBusy=false;$('#teamCodeRefreshStatus').textContent='The invite code was not changed. Please try again.';$('#cancelTeamCodeRefresh').disabled=false;$('#confirmTeamCodeRefresh').disabled=false;$('#confirmTeamCodeRefresh').textContent='Refresh code'}
}
function showTeamDeleteConfirmation(){
  if(teamDeleteBusy||!cloud||!db||!uid||accountMode!=='team'||teamRole!=='owner'||!teamId)return;
  teamDeleteReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  $('#teamDeleteTitle').textContent=`Delete ${teamName||'this team'}?`;
  $('#teamDeleteDescription').textContent=`This permanently removes ${teamName||'this team'}, its invite code, memberships and team leaderboard. Everyone’s contacts, notes, appointments, activity history and personal AGNT data stay with their own accounts.`;
  $('#teamDeleteStatus').textContent='';$('#teamDeleteConfirm').classList.remove('hidden');$('#teamDeleteConfirm').setAttribute('aria-hidden','false');document.body.classList.add('team-leave-open');requestAnimationFrame(()=>$('#cancelTeamDelete')?.focus({preventScroll:true}));
}
function hideTeamDeleteConfirmation({force=false,restoreFocus=true}={}){
  if(teamDeleteBusy&&!force)return;if(force)teamDeleteBusy=false;
  $('#teamDeleteConfirm')?.classList.add('hidden');$('#teamDeleteConfirm')?.setAttribute('aria-hidden','true');document.body.classList.remove('team-leave-open');
  const cancel=$('#cancelTeamDelete'),confirm=$('#confirmTeamDelete'),status=$('#teamDeleteStatus');if(cancel)cancel.disabled=false;if(confirm){confirm.disabled=false;confirm.textContent='Delete team'}if(status)status.textContent='';
  const returnFocus=teamDeleteReturnFocus;teamDeleteReturnFocus=null;if(restoreFocus&&returnFocus)requestAnimationFrame(()=>{if(returnFocus.isConnected)returnFocus.focus({preventScroll:true})});
}
async function confirmTeamDelete(){
  if(teamDeleteBusy||!cloud||!db||!uid||accountMode!=='team'||teamRole!=='owner'||!teamId)return;
  if(!navigator.onLine){$('#teamDeleteStatus').textContent='Connect to the internet before deleting this team.';return}
  const deletingTeamId=String(teamId),deletingTeamName=String(teamName||'your team'),deletingJoinCode=String(teamJoinCode||'');teamDeleteBusy=true;$('#cancelTeamDelete').disabled=true;$('#confirmTeamDelete').disabled=true;$('#confirmTeamDelete').textContent='Deleting…';$('#teamDeleteStatus').textContent='Removing team access while keeping personal data safe…';
  try{
    const [membersSnap,leaderboardSnap,appointmentsSnap]=await Promise.all([getDocs(collection(db,'teams',deletingTeamId,'members')),getDocs(collection(db,'teams',deletingTeamId,'leaderboard')),getDocs(collection(db,'teams',deletingTeamId,'appointments'))]);
    const batch=writeBatch(db),now=serverTimestamp();
    membersSnap.docs.forEach(item=>batch.delete(item.ref));leaderboardSnap.docs.forEach(item=>batch.delete(item.ref));appointmentsSnap.docs.forEach(item=>batch.delete(item.ref));
    if(deletingJoinCode)batch.delete(doc(db,'teamCodes',deletingJoinCode));
    batch.delete(doc(db,'teams',deletingTeamId));
    batch.set(doc(db,'users',uid),{accountMode:'unconfigured',teamId:null,teamRole:null,teamName:null,teamSchemaVersion:TEAM_SCHEMA_VERSION,teamOnboardingSuggested:true,updatedAt:now},{merge:true});
    await batch.commit();
    clearVerifiedTeamState({forgetCached:true});setTeamLayerStatus('deleted',`${deletingTeamName} was deleted. Personal AGNT data was not changed.`);hideTeamDeleteConfirmation({force:true,restoreFocus:false});hideTeamManager({restoreFocus:false});renderSettings();showTeamOnboarding();teamSetupReturnFocus=null;requestAnimationFrame(()=>teamSetupMessage(`${deletingTeamName} was deleted. Choose Solo, create a team or join another team. Everyone’s personal data is unchanged.`,'success'));toast(`${deletingTeamName} deleted`);
  }catch(err){console.error('Delete team failed',err);teamDeleteBusy=false;$('#teamDeleteStatus').textContent='The team was not deleted. No personal data was changed.';$('#cancelTeamDelete').disabled=false;$('#confirmTeamDelete').disabled=false;$('#confirmTeamDelete').textContent='Delete team'}
}
function showTeamLeaveConfirmation(){
  if(!cloud||accountMode!=='team'||teamRole==='owner'||!teamId)return;
  teamLeaveReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  $('#teamLeaveTitle').textContent=`Leave ${teamName||'your team'}?`;
  $('#teamLeaveDescription').textContent=`You will leave ${teamName||'this team'} and be removed from its leaderboard. Your contacts, notes, appointments, activity history and account data will stay with you.`;
  $('#teamLeaveStatus').textContent='';
  $('#teamLeaveConfirm').classList.remove('hidden');$('#teamLeaveConfirm').setAttribute('aria-hidden','false');document.body.classList.add('team-leave-open');
  requestAnimationFrame(()=>$('#cancelTeamLeave')?.focus({preventScroll:true}));
}
function hideTeamLeaveConfirmation({force=false,restoreFocus=true}={}){
  if(teamLeaveBusy&&!force)return;
  if(force)teamLeaveBusy=false;
  $('#teamLeaveConfirm')?.classList.add('hidden');$('#teamLeaveConfirm')?.setAttribute('aria-hidden','true');document.body.classList.remove('team-leave-open');
  const cancel=$('#cancelTeamLeave'),confirm=$('#confirmTeamLeave'),status=$('#teamLeaveStatus');if(cancel)cancel.disabled=false;if(confirm){confirm.disabled=false;confirm.textContent='Leave team'}if(status)status.textContent='';
  const returnFocus=teamLeaveReturnFocus;teamLeaveReturnFocus=null;if(restoreFocus&&returnFocus)requestAnimationFrame(()=>{if(returnFocus.isConnected)returnFocus.focus({preventScroll:true})});
}
function completeTeamLeaveTransition(previousTeamName='your previous team'){
  const safeName=String(previousTeamName||'your previous team');teamLeaveBusy=false;clearVerifiedTeamState({forgetCached:true});setTeamLayerStatus('left',`You left ${safeName}. Your personal AGNT data is safe.`);hideTeamLeaveConfirmation({force:true,restoreFocus:false});
  if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
  renderSettings();showTeamOnboarding();teamSetupReturnFocus=null;
  requestAnimationFrame(()=>teamSetupMessage(`You left ${safeName}. Choose Solo, create a team or join another team. Your personal data is unchanged.`,'success'));
}
async function confirmTeamLeave(){
  if(teamLeaveBusy||!cloud||!db||!uid||accountMode!=='team'||teamRole==='owner'||!teamId)return;
  if(!navigator.onLine){$('#teamLeaveStatus').textContent='Connect to the internet before leaving your team.';return}
  const leavingTeamId=String(teamId),leavingTeamName=String(teamName||'your team');teamLeaveBusy=true;$('#cancelTeamLeave').disabled=true;$('#confirmTeamLeave').disabled=true;$('#confirmTeamLeave').textContent='Leaving…';$('#teamLeaveStatus').textContent='Protecting your data and updating team access…';
  try{
    const batch=writeBatch(db),now=serverTimestamp();
    batch.delete(doc(db,'teams',leavingTeamId,'members',uid));
    batch.delete(doc(db,'teams',leavingTeamId,'leaderboard',uid));
    batch.set(doc(db,'users',uid),{accountMode:'unconfigured',teamId:null,teamRole:null,teamName:null,teamSchemaVersion:TEAM_SCHEMA_VERSION,teamOnboardingSuggested:true,updatedAt:now},{merge:true});
    await batch.commit();completeTeamLeaveTransition(leavingTeamName);
  }catch(err){
    console.error('Leave team failed',err);teamLeaveBusy=false;$('#teamLeaveStatus').textContent='You are still in the team. No personal data was changed.';$('#cancelTeamLeave').disabled=false;$('#confirmTeamLeave').disabled=false;$('#confirmTeamLeave').textContent='Leave team';
  }
}
function handleTeamAccessRemoved(removedTeamId,removedTeamName=''){
  if(teamId&&removedTeamId&&teamId!==removedTeamId)return;
  const previousName=String(removedTeamName||teamName||'your previous team');clearVerifiedTeamState({forgetCached:true});setTeamLayerStatus('removed',`You no longer have access to ${previousName}. Your personal AGNT data is safe.`);renderSettings();showTeamOnboarding();requestAnimationFrame(()=>teamSetupMessage(`Your access to ${previousName} was removed. Choose Solo, create a team or join another team. Your personal data is unchanged.`,'info'));
}
function subscribeOwnTeamMembership(){
  if(accountMode!=='team'||!teamId){unsubTeamMembership?.();unsubTeamMembership=null;subscribedMembershipTeamId='';return}
  if(unsubTeamMembership&&subscribedMembershipTeamId===teamId)return;
  unsubTeamMembership?.();unsubTeamMembership=null;subscribedMembershipTeamId=teamId;const listeningTeamId=teamId,listeningTeamName=teamName;
  unsubTeamMembership=onSnapshot(doc(db,'teams',listeningTeamId,'members',uid),{includeMetadataChanges:true},snap=>{
    if(accountMode!=='team'||teamId!==listeningTeamId||subscribedMembershipTeamId!==listeningTeamId)return;
    if(!snap.exists()){if(snap.metadata.fromCache||teamLeaveBusy)return;handleTeamAccessRemoved(listeningTeamId,listeningTeamName);return}
    const nextRole=String(snap.data().role||teamRole||'member');if(nextRole!==teamRole){teamRole=nextRole;cacheVerifiedTeamState();subscribeTeamMembersForOwner();renderSettings()}
  },err=>{if(teamId!==listeningTeamId)return;console.error('Team membership listener failed',err);if(String(err?.code||'').includes('permission-denied'))handleTeamAccessRemoved(listeningTeamId,listeningTeamName)});
}
function subscribeTeamMembersForOwner(){
  if(accountMode!=='team'||teamRole!=='owner'||!teamId){clearTeamMembersSubscription();return}
  if(unsubTeamMembers&&subscribedMembersTeamId===teamId)return;
  unsubTeamMembers?.();unsubTeamMembers=null;subscribedMembersTeamId=teamId;teamMembersStatus='connecting';teamMembersError='';renderTeamManager();renderTeamSettings();const listeningTeamId=teamId;
  unsubTeamMembers=onSnapshot(collection(db,'teams',listeningTeamId,'members'),{includeMetadataChanges:true},snap=>{
    if(accountMode!=='team'||teamRole!=='owner'||teamId!==listeningTeamId||subscribedMembersTeamId!==listeningTeamId)return;
    const next=snap.docs.map(item=>({...item.data(),uid:item.id})).sort((a,b)=>(a.role==='owner'?-1:b.role==='owner'?1:0)||teamMemberDisplayName(a).localeCompare(teamMemberDisplayName(b))),signature=teamMembersSignature(next),changed=signature!==teamMembersDataSignature;
    if(changed){teamMembers=next;teamMembersDataSignature=signature}teamMembersStatus=snap.metadata.fromCache?'cached':'live';teamMembersError='';renderTeamManager();renderTeamSettings();
  },err=>{if(teamId!==listeningTeamId)return;console.error('Team member list failed',err);teamMembersStatus='error';teamMembersError=err.message||'Member list unavailable';renderTeamManager();renderTeamSettings()});
}
function subscribeTeamMembershipLayer(){subscribeOwnTeamMembership();subscribeTeamMembersForOwner();subscribeTeamAppointmentLayer()}
function subscribeSecureLeaderboard(){
  if(accountMode!=='team'||!teamId){stopTeamMembershipSubscriptions();unsubLeaderboard?.();unsubLeaderboard=null;subscribedTeamId='';teamLeaderboardDataSignature='';leaderboardEntries=[leaderboardPayload()];renderLeaderboard();return}
  subscribeTeamMembershipLayer();
  if(unsubLeaderboard&&subscribedTeamId===teamId)return;
  unsubLeaderboard?.();unsubLeaderboard=null;subscribedTeamId=teamId;teamLeaderboardDataSignature='';
  const listeningTeamId=teamId;
  setTeamLayerStatus('connecting');
  unsubLeaderboard=onSnapshot(collection(db,'teams',listeningTeamId,'leaderboard'),{includeMetadataChanges:true},snap=>{
    if(accountMode!=='team'||teamId!==listeningTeamId||subscribedTeamId!==listeningTeamId)return;
    const documents=snap.docs.map(d=>({uid:d.id,...d.data()})),next=documents.length?documents:[leaderboardPayload()],signature=teamLeaderboardEntriesSignature(next),dataChanged=signature!==teamLeaderboardDataSignature;
    if(dataChanged){leaderboardEntries=next;teamLeaderboardDataSignature=signature}
    const own=documents.find(entry=>entry.uid===uid);if(own)lastTeamLeaderboardSignature=leaderboardSignature(own);
    setTeamLayerStatus(snap.metadata.fromCache?'cached':'live');if(dataChanged){renderLeaderboard();renderTeamManager();if(!$('#appointmentAssignmentModal')?.classList.contains('hidden'))renderAppointmentAssignmentPopup($('#appointmentAssignmentSelect')?.value||uid);refreshReturningSnapshotIfVisible()}
  },err=>{if(teamId!==listeningTeamId)return;console.error('Team leaderboard read failed',err);unsubLeaderboard=null;subscribedTeamId='';teamLeaderboardDataSignature='';leaderboardEntries=[leaderboardPayload()];setTeamLayerStatus('error',err.message||'Team leaderboard unavailable');renderLeaderboard()});
}
async function initialiseTeamLayer(profile={}, {promptNew=false}={}){
  const initialisationId=++teamInitialisationToken,initialUid=uid,requestedTeamId=String(profile.teamId||'');
  const stillCurrent=()=>initialisationId===teamInitialisationToken&&initialUid===uid&&currentUser?.uid===initialUid;
  try{
    if(profile.accountMode==='solo'){
      if(!stillCurrent())return;
      setVerifiedTeamState({mode:'solo'});setTeamLayerStatus('solo');subscribeSecureLeaderboard();scheduleLeaderboardPublish();return;
    }
    if(profile.accountMode==='team'&&requestedTeamId){
      if(accountMode==='team'&&teamId&&teamId!==requestedTeamId){clearVerifiedTeamState();setTeamLayerStatus('connecting')}
      const verified=await verifyMembership(profile);
      if(!stillCurrent())return;
      if(!verified){handleTeamAccessRemoved(requestedTeamId,profile.teamName||'your previous team');return}
      setVerifiedTeamState({mode:'team',...verified});subscribeSecureLeaderboard();scheduleLeaderboardPublish();return;
    }
    if(!stillCurrent())return;
    clearVerifiedTeamState({forgetCached:true});setTeamLayerStatus('unconfigured');
    if(promptNew||profile.teamOnboardingSuggested===true)showTeamOnboarding();
  }catch(err){
    if(!stillCurrent())return;
    console.error('Team layer initialisation failed',err);
    if(isTransientTeamError(err)&&accountMode==='team'&&teamId===requestedTeamId){setTeamLayerStatus('cached','Team confirmation is waiting for a stable connection. Core sync is unaffected.');return}
    clearVerifiedTeamState({forgetCached:!isTransientTeamError(err)});setTeamLayerStatus('error',err.message||'Team setup unavailable. Core sync is unaffected.');
  }
}
async function publishTeamLeaderboard(){
  if(!cloud||!db||!uid||accountMode!=='team'||!teamId)return;
  const payload=leaderboardPayload(),signature=leaderboardSignature(payload);if(signature===lastTeamLeaderboardSignature)return;
  beginSyncOperation();
  try{await setDoc(doc(db,'teams',teamId,'leaderboard',uid),payload,{merge:true});lastTeamLeaderboardSignature=signature;if(teamLayerStatus==='error')setTeamLayerStatus('live');endSyncOperation()}
  catch(err){console.error('Team leaderboard publish failed',err);endSyncOperation();setTeamLayerStatus('error',err.message||'Team leaderboard could not update')}
}
async function completeSoloSetup(){
  if(!cloud||!uid||teamSetupBusy)return;if(accountMode==='team'&&teamId)return teamSetupMessage('Leave your current team before continuing Solo.','error');if(!navigator.onLine)return teamSetupMessage('Connect to the internet to save your setup.','error');
  setTeamSetupBusy(true);teamSetupMessage('Saving your private setup…');
  try{
    await setDoc(doc(db,'users',uid),{accountMode:'solo',teamId:null,teamRole:null,teamName:null,teamSchemaVersion:TEAM_SCHEMA_VERSION,teamOnboardingSuggested:false,updatedAt:serverTimestamp()},{merge:true});
    setVerifiedTeamState({mode:'solo'});setTeamLayerStatus('solo');subscribeSecureLeaderboard();scheduleLeaderboardPublish();hideTeamOnboarding();renderSettings();
  }catch(err){console.error('Solo setup failed',err);teamSetupMessage('Could not save your setup. Your AGNT data is safe.','error')}
  finally{setTeamSetupBusy(false)}
}
async function completeCreateTeam(){
  if(teamSetupBusy)return;if(accountMode==='team'&&teamId)return teamSetupMessage('Leave your current team before creating another team.','error');if(!navigator.onLine)return teamSetupMessage('Connect to the internet to create a team.','error');
  const name=$('#newTeamName').value.trim();if(!name){teamSetupMessage('Add a team name to continue.','error');$('#newTeamName').focus();return}
  let created=false;setTeamSetupBusy(true,{button:'#createTeamSubmit',label:'Creating team…'});teamSetupMessage('Creating your private leaderboard…');
  try{
    const id=makeTeamId(),code=makeTeamCode(),batch=writeBatch(db),now=serverTimestamp();
    const teamRef=doc(db,'teams',id),memberRef=doc(db,'teams',id,'members',uid),codeRef=doc(db,'teamCodes',code),userRef=doc(db,'users',uid);
    batch.set(teamRef,{name,ownerUid:uid,joinCode:code,joinEnabled:true,schemaVersion:TEAM_SCHEMA_VERSION,createdAt:now,updatedAt:now});
    batch.set(memberRef,{uid,role:'owner',name:displayAgentName(),email:currentUser?.email||'',teamId:id,joinedAt:now});
    batch.set(codeRef,{code,teamId:id,teamName:name,ownerUid:uid,createdAt:now});
    batch.set(userRef,{accountMode:'team',teamId:id,teamRole:'owner',teamName:name,teamSchemaVersion:TEAM_SCHEMA_VERSION,teamOnboardingSuggested:false,updatedAt:now},{merge:true});
    await batch.commit();const verified=await verifyMembership({accountMode:'team',teamId:id,teamRole:'owner',teamName:name});
    if(!verified)throw new Error('Team records were not confirmed.');
    setVerifiedTeamState({mode:'team',...verified});subscribeSecureLeaderboard();scheduleLeaderboardPublish();renderSettings();created=true;
  }catch(err){console.error('Create team failed',err);teamSetupMessage('Team setup could not be completed. Your AGNT data is safe.','error')}
  finally{setTeamSetupBusy(false,{button:'#createTeamSubmit'})}
  if(created){$('#teamCreatedName').textContent=teamName||name;$('#teamCreatedCode').textContent=teamJoinCode;showTeamSetupPanel('created')}
}
async function completeJoinTeam(){
  if(teamSetupBusy)return;if(accountMode==='team'&&teamId)return teamSetupMessage('Leave your current team before joining another team.','error');if(!navigator.onLine)return teamSetupMessage('Connect to the internet to join your team.','error');
  const code=normaliseTeamCode($('#teamCodeInput').value);if(!code){teamSetupMessage('Enter your team code to continue.','error');$('#teamCodeInput').focus();return}
  let ready=false;$('#teamCodeInput').value=code;pendingTeamJoin=null;setTeamSetupBusy(true,{button:'#joinTeamCode',label:'Checking team…'});teamSetupMessage('Confirming your invite code…');
  try{
    const codeSnap=await getDoc(doc(db,'teamCodes',code));if(!codeSnap.exists())throw new Error('Team code not found.');
    const codeData=codeSnap.data(),id=String(codeData.teamId||'');if(!id)throw new Error('Team code is invalid.');
    pendingTeamJoin={id,name:String(codeData.teamName||'Team'),code};$('#teamJoinConfirmName').textContent=pendingTeamJoin.name;$('#teamJoinConfirmCode').textContent=code;ready=true;
  }catch(err){console.error('Team code confirmation failed',err);teamSetupMessage(err.message||'Could not confirm that team code.','error')}
  finally{setTeamSetupBusy(false,{button:'#joinTeamCode'})}
  if(ready)showTeamSetupPanel('join-confirm');
}
async function confirmJoinTeam(){
  if(teamSetupBusy||!pendingTeamJoin)return;if(accountMode==='team'&&teamId)return teamSetupMessage('Leave your current team before joining another team.','error');if(!navigator.onLine)return teamSetupMessage('Connect to the internet to join your team.','error');
  const requested={...pendingTeamJoin};setTeamSetupBusy(true,{button:'#confirmJoinTeam',label:'Joining team…'});teamSetupMessage('Joining your private team leaderboard…');
  try{
    const codeSnap=await getDoc(doc(db,'teamCodes',requested.code));if(!codeSnap.exists()||String(codeSnap.data().teamId||'')!==requested.id)throw new Error('This invite code is no longer active. Ask the team owner for the new code.');
    const batch=writeBatch(db),now=serverTimestamp();batch.set(doc(db,'teams',requested.id,'members',uid),{uid,role:'member',name:displayAgentName(),email:currentUser?.email||'',teamId:requested.id,joinCodeUsed:requested.code,joinedAt:now},{merge:true});batch.set(doc(db,'users',uid),{accountMode:'team',teamId:requested.id,teamRole:'member',teamName:requested.name,teamSchemaVersion:TEAM_SCHEMA_VERSION,teamOnboardingSuggested:false,updatedAt:now},{merge:true});
    await batch.commit();const verified=await verifyMembership({accountMode:'team',teamId:requested.id,teamRole:'member',teamName:requested.name});if(!verified)throw new Error('Membership could not be confirmed.');
    pendingTeamJoin=null;setVerifiedTeamState({mode:'team',...verified});subscribeSecureLeaderboard();scheduleLeaderboardPublish();renderSettings();hideTeamOnboarding();
  }catch(err){console.error('Join team failed',err);teamSetupMessage(err.message||'Could not join that team. Your AGNT data is safe.','error')}
  finally{setTeamSetupBusy(false,{button:'#confirmJoinTeam'})}
}
function renderTeamSettings(){
  const card=$('#teamAccountCard');if(!card)return;
  const mode=$('#teamAccountMode'),name=$('#teamAccountName'),role=$('#teamAccountRole'),code=$('#teamAccountCode'),codePanel=$('#teamJoinCodePanel'),status=$('#teamAccountStatus'),setup=$('#openTeamSetup'),manage=$('#manageTeamMembers'),leave=$('#leaveCurrentTeam');
  const setStatus=(message,state='offline')=>{status.textContent=message||'';status.dataset.state=state};
  code.textContent='';codePanel?.classList.add('hidden');role.textContent='';setup?.classList.remove('hidden');manage?.classList.add('hidden');leave?.classList.add('hidden');
  if(!cloud){mode.textContent='DEVICE ONLY';name.textContent='No cloud team';setStatus('Accountability is stored on this device.','offline');setup?.classList.add('hidden');return}
  if(accountMode==='team'&&teamId){
    mode.textContent='TEAM ACCOUNT';name.textContent=teamName||'Team';role.textContent=teamRole==='owner'?'Owner':'Member';setup?.classList.add('hidden');
    if(teamRole==='owner'){
      if(teamJoinCode){code.textContent=teamJoinCode;codePanel?.classList.remove('hidden')}
      if(manage){manage.textContent=teamMembers.length?`Manage ${teamMembers.length} member${teamMembers.length===1?'':'s'}`:'Manage members';manage.classList.remove('hidden')}
    }else leave?.classList.remove('hidden');
    if(!navigator.onLine)setStatus('Offline. Saved team results remain available.','offline');
    else if(teamLayerStatus==='error')setStatus(teamLayerError||'The team leaderboard needs attention.','error');
    else if(teamLayerStatus==='live')setStatus('Leaderboard is live across your team.','live');
    else setStatus('Updating the team leaderboard…','connecting');
    return;
  }
  if(accountMode==='solo'){mode.textContent='PRIVATE ACCOUNT';name.textContent='Just me';role.textContent='Solo';setStatus('Your leaderboard is private to this account.','solo');setup.textContent='Change setup';return}
  if(teamLayerStatus==='left'){mode.textContent='TEAM LEFT';name.textContent='Choose what’s next';setStatus(teamLayerError||'Your personal data is safe. Choose Solo or another team.','solo');setup.textContent='Choose setup';return}
  if(teamLayerStatus==='removed'){mode.textContent='TEAM ACCESS UPDATED';name.textContent='Choose a new setup';setStatus(teamLayerError||'Your previous team access was removed. Your personal data is safe.','error');setup.textContent='Choose setup';return}
  if(teamLayerStatus==='connecting'){mode.textContent='ACCOUNT SETUP';name.textContent='Checking your team…';setStatus('Confirming your account and membership.','connecting');setup.textContent='Choose setup';return}
  mode.textContent='ACCOUNT SETUP';name.textContent='Choose Solo or Team';setStatus(teamLayerError||'Choose how you want to use the leaderboard.',teamLayerError?'error':'offline');setup.textContent='Choose setup';
}
function setTeamActionButtonLabel(button,label){
  if(!button)return;if(!button.dataset.idleLabel)button.dataset.idleLabel=button.textContent||'';button.textContent=label;clearTimeout(button._teamActionTimer);button._teamActionTimer=setTimeout(()=>button.textContent=button.dataset.idleLabel||'Copy',1400);
}
async function copyTeamJoinCode(buttonSelector='#copyTeamCode',codeValue=teamJoinCode){
  const value=String(codeValue||'');if(!value)return;
  const button=$(buttonSelector);
  try{
    if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(value);
    else{
      const field=document.createElement('textarea');field.value=value;field.setAttribute('readonly','');field.style.position='fixed';field.style.opacity='0';document.body.appendChild(field);field.select();
      const copied=document.execCommand?.('copy');field.remove();if(!copied)throw new Error('Copy unavailable');
    }
    setTeamActionButtonLabel(button,'Copied');
    toast('Team code copied');
  }catch(err){console.error('Team code copy failed',err);toast('Could not copy the team code')}
}
async function shareTeamInvite(buttonSelector,{name=teamName,code=teamJoinCode}={}){
  const safeName=String(name||'your team'),safeCode=String(code||'');if(!safeCode)return;
  const button=$(buttonSelector),payload={title:`Join ${safeName} on AGNT`,text:`Join ${safeName} on AGNT using invite code ${safeCode}.`,url:new URL('./',window.location.href).href};
  if(typeof navigator.share!=='function')return copyTeamJoinCode(buttonSelector,safeCode);
  try{await navigator.share(payload);setTeamActionButtonLabel(button,'Shared');toast('Team invite shared')}
  catch(err){if(err?.name==='AbortError')return;console.warn('Team invite share unavailable, copying code instead',err);await copyTeamJoinCode(buttonSelector,safeCode)}
}


function renderSettings(){const name=displayAgentName();$('#agentName').value=name;$('#callsTarget').value=targets.calls;$('#connectsTarget').value=targets.connects;$('#dataTarget').value=targets.data;$('#weeklyKnockTarget').value=targets.weeklyKnock;$$('[name=workDay]').forEach(el=>el.checked=workDays.includes(Number(el.value)));$$('[name=calendarPreference]').forEach(el=>el.checked=el.value===calendarPreference);$$('[name=appearancePreference]').forEach(el=>el.checked=el.value===appearancePreference);$('#accountEmail').textContent=currentUser?.email||'Device-only mode';$('#modeNote').textContent=cloud?'Live sync is active. Use the same login on every device.':'Data is stored only on this device.';const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'A';if($('#profileAvatar'))$('#profileAvatar').textContent=initials;if($('#profileSyncState'))$('#profileSyncState').textContent=cloud?'Live sync active':'Device-only profile';if($('#profileTodayScore'))$('#profileTodayScore').textContent=`${completion(todayKey())}%`;if($('#profileWeekScore'))$('#profileWeekScore').textContent=`${weekSummary().score}%`;if($('#profileWorkDays'))$('#profileWorkDays').textContent=workDays.length;renderTeamSettings();renderMarketPulseAutomationSettings()}
function renderDayViews(){renderToday();renderTimeline();renderAppointments();renderInsights();renderSettings()}
function renderAll(){renderDayViews();renderProspecting();const reviewButton=$('#openDayReview');if(reviewButton)reviewButton.classList.toggle('hidden',new Date().getHours()<17||selectedDate!==todayKey()||!isWorkDayKey(todayKey()));maybeShowDayReview()}

async function startCloud(user,{promptTeamSetup=false}={}){
  teamInitialisationToken++;unsubDays?.();unsubProfile?.();unsubLeaderboard?.();unsubProspecting?.();unsubMarketPulseInbox?.();unsubTeamMembership?.();unsubTeamMembers?.();unsubAppointmentAssignees?.();unsubAssignedTeamAppointments?.();unsubDays=unsubProfile=unsubLeaderboard=unsubProspecting=unsubMarketPulseInbox=unsubTeamMembership=unsubTeamMembers=unsubAppointmentAssignees=unsubAssignedTeamAppointments=null;currentUser=user;uid=user.uid;loadBuyerSession();cloud=true;loadLocal(uid);marketPulseAutomation={...marketPulseAutomation,state:'waiting',email:normaliseMarketPulseEmail(user.email)};
  const restoredTeamState=restoreCachedTeamState();
  leaderboardEntries=restoredTeamState&&accountMode==='team'?[]:[leaderboardPayload()];
  if(restoredTeamState&&accountMode==='team'){setTeamLayerStatus('connecting');subscribeSecureLeaderboard()}
  else if(restoredTeamState&&accountMode==='solo')setTeamLayerStatus('solo');
  else setTeamLayerStatus('connecting');
  await finaliseExpiredTimers();
  syncHasError=false;pendingSyncOperations=0;setSync('','Connecting');clearTimeout(syncTimer);syncTimer=setTimeout(()=>{if($('#syncBadge').dataset.label==='Connecting')refreshSyncStatus()},3500);
  renderLeaderboard();
  unsubDays=onSnapshot(collection(db,'users',uid,'days'),{includeMetadataChanges:true},snap=>{
    let dataChanged=false;
    snap.docChanges().forEach(ch=>{
      if(ch.type==='removed'){if(days[ch.doc.id]){delete days[ch.doc.id];dirtyDayKeys.delete(ch.doc.id);dataChanged=true}return}
      const incoming=normaliseDayRecord(ch.doc.data(),ch.doc.id),local=dayData(ch.doc.id);
      const useLocal=local.clientUpdatedAt>incoming.clientUpdatedAt&&snap.metadata.fromCache;
      const next=useLocal?local:incoming;
      if(JSON.stringify(local)!==JSON.stringify(next)){days[ch.doc.id]=next;dataChanged=true}
      if(!useLocal&&incoming.clientUpdatedAt>=local.clientUpdatedAt)dirtyDayKeys.delete(ch.doc.id);
    });
    if(dataChanged){saveLocal();renderDayViews();ensureTick();refreshReturningSnapshotIfVisible()}else saveDirtyDays();
    if(!snap.metadata.fromCache){dailyBriefingDaysReady=true;refreshReturningSnapshotIfVisible()}
    clearTimeout(syncTimer);if(!snap.metadata.hasPendingWrites&&!snap.metadata.fromCache)syncHasError=false;refreshSyncStatus();
  },err=>{console.error(err);syncHasError=true;refreshSyncStatus();toast('Firestore access failed. Check rules and login.');showAuthMessage(err.message)});
  let observedTeamProfileSignature=null,teamProfileBootstrapComplete=false;
  unsubProfile=onSnapshot(doc(db,'users',uid),{includeMetadataChanges:true},snap=>{
    const profile=snap.exists()?snap.data():{};let changed=false;
    applyMarketPulseAutomationProfile(profile);refreshReturningSnapshotIfVisible();registerMarketPulseForwardingIdentity(profile).catch(err=>console.error('MarketPulse identity setup failed',err));
    if(profile.targets&&JSON.stringify({...DEFAULTS,...profile.targets})!==JSON.stringify(targets)){targets={...DEFAULTS,...profile.targets};changed=true}
    if(Array.isArray(profile.workDays)&&profile.workDays.length&&JSON.stringify(normaliseWorkDays(profile.workDays))!==JSON.stringify(workDays)){workDays=normaliseWorkDays(profile.workDays);changed=true}
    if(profile.name&&profile.name!==agentName){agentName=profile.name;changed=true}
    const profileTeamSignature=JSON.stringify({accountMode:String(profile.accountMode||''),teamId:String(profile.teamId||''),teamRole:String(profile.teamRole||''),teamName:String(profile.teamName||''),teamOnboardingSuggested:profile.teamOnboardingSuggested===true});
    const cachedProfileMatchesRestored=snap.exists()&&profile.accountMode===accountMode&&(accountMode!=='team'||String(profile.teamId||'')===String(teamId||''));
    const waitForServerProfile=Boolean(restoredTeamState&&snap.metadata.fromCache&&!cachedProfileMatchesRestored);
    if(!waitForServerProfile&&profileTeamSignature!==observedTeamProfileSignature){
      const firstTeamProfile=!teamProfileBootstrapComplete;teamProfileBootstrapComplete=true;observedTeamProfileSignature=profileTeamSignature;
      initialiseTeamLayer(profile,{promptNew:promptTeamSetup&&firstTeamProfile}).catch(err=>console.error('Team profile update failed',err));
    }
    if(changed){saveLocal();renderAll();scheduleLeaderboardPublish();refreshReturningSnapshotIfVisible()}
  },err=>{console.error('Profile sync failed',err);if(isTransientTeamError(err)&&accountMode==='team'&&teamId)setTeamLayerStatus('cached','Team confirmation is waiting for a stable connection. Core sync is unaffected.');else setTeamLayerStatus('error','Team setup could not load. Core sync is unaffected.')});
  let marketPulseInboxStarted=false;
  unsubProspecting=onSnapshot(doc(db,'users',uid,'prospecting','state'),{includeMetadataChanges:true},snap=>{
    if(snap.exists()){
      const data=snap.data(),nextProspects=normaliseProspects(data.prospects),nextInteractions=normaliseProspectInteractions(data.interactions),hasMarketEvents=Object.prototype.hasOwnProperty.call(data,'marketPulseEvents'),hasMarketHistory=Object.prototype.hasOwnProperty.call(data,'marketPulseHistory'),cloudMarketEvents=hasMarketEvents?normaliseMarketPulseEvents(data.marketPulseEvents):[],cloudMarketHistory=hasMarketHistory?normaliseMarketPulseHistory(data.marketPulseHistory):[],cloudSignature=prospectingSignature(nextProspects,nextInteractions,cloudMarketEvents,cloudMarketHistory);
      if(!snap.metadata.hasPendingWrites)lastProspectingSignature=cloudSignature;
      const nextMarketEvents=hasMarketEvents?cloudMarketEvents:normaliseMarketPulseEvents(marketPulseEvents),nextMarketHistory=hasMarketHistory?cloudMarketHistory:normaliseMarketPulseHistory([...marketPulseHistory,...nextMarketEvents]),nextSignature=prospectingSignature(nextProspects,nextInteractions,nextMarketEvents,nextMarketHistory);
      if(nextSignature!==prospectingSignature()){
        prospects=nextProspects;prospectInteractions=nextInteractions;marketPulseEvents=nextMarketEvents;marketPulseHistory=nextMarketHistory;const buyerMatchesChanged=refreshBuyerPropertyMatches(nextMarketEvents);saveLocal();renderProspecting();renderMarketPulse();renderAppointments();renderTimeline();renderNowCard();refreshReturningSnapshotIfVisible();if(buyerMatchesChanged&&!snap.metadata.hasPendingWrites&&!snap.metadata.fromCache)queueProspectingSave().catch(err=>console.error('Buyer match migration failed',err))
      }
      if((!hasMarketEvents&&nextMarketEvents.length||!hasMarketHistory&&nextMarketHistory.length)&&!snap.metadata.hasPendingWrites&&!snap.metadata.fromCache){queueProspectingSave().catch(err=>console.error('Hot Spotting migration failed',err))}
    }
    if(!marketPulseInboxStarted&&!snap.metadata.fromCache){marketPulseInboxStarted=true;subscribeMarketPulseInbox()}
  },err=>{console.error('Prospecting sync failed',err);dailyBriefingMarketReady=true;marketPulseAutomation={...marketPulseAutomation,state:'error',error:'Automatic MarketPulse intake is waiting for Prospector cloud sync.'};renderMarketPulseAutomationSettings();refreshReturningSnapshotIfVisible();toast('Prospecting data is saved locally. Cloud sync needs attention.')});
  refreshSyncStatus();showApp();scheduleLeaderboardPublish();
}

function showApp(){setAuthScreenActive(false);$('#bootGate')?.classList.add('hidden');$('#authGate').classList.add('hidden');$('#app').classList.remove('hidden');$('#appointmentDatePicker').value=appointmentDate;restoreProspectingSessionState();restoreKnockingSessionState();renderKnockingSession();renderAll();ensureTick();restoreContactDraftWorkflow({silent:true});showLaunchExperience();requestAnimationFrame(()=>maybeShowTeamAppointmentNotice())}
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
}
function resumePendingExternalAction(){if(maybeShowManualCallOutcome())return true;if(resumeHotSpotSmsReturn())return true;if(resumeBuyerMatchSmsReturn())return true;if(resumeAppointmentFollowUpCallReturn())return true;return resumeProspectCallReturn()}
function handleAppSuspend(){persistOpenContactDraft();if(pendingProspectingPayload)flushProspectingSave()}
async function handleAppResume(){updateAppViewport();try{await finaliseExpiredTimers()}catch(err){console.error('Lifecycle maintenance failed',err)}renderAll();if(!resumePendingExternalAction()&&!document.body.classList.contains('daily-briefing-open'))restoreContactDraftWorkflow({silent:true})}
function scheduleAppResume(delay=140){clearTimeout(appResumeTimer);appResumeTimer=setTimeout(()=>{appResumeTimer=null;handleAppResume().catch(err=>console.error('App resume failed',err))},delay)}
function bindAppLifecycle(){document.addEventListener('visibilitychange',()=>{if(document.hidden)handleAppSuspend();else scheduleAppResume(120)});window.addEventListener('pagehide',handleAppSuspend);window.addEventListener('pageshow',()=>scheduleAppResume(140));window.addEventListener('focus',()=>scheduleAppResume(160))}
function consumerAuthError(error,action='sign in'){
  const code=String(error?.code||'');
  if(code==='auth/invalid-credential'||code==='auth/user-not-found'||code==='auth/wrong-password')return 'Email or password is incorrect.';
  if(code==='auth/invalid-email')return 'Enter a valid email address.';
  if(code==='auth/email-already-in-use')return 'An account already exists for this email. Sign in instead.';
  if(code==='auth/weak-password')return 'Choose a password with at least 6 characters.';
  if(code==='auth/too-many-requests')return 'Too many attempts. Please try again shortly.';
  if(code==='auth/network-request-failed')return 'You appear to be offline. Check your connection and try again.';
  return action==='create'?'We couldn’t create your account. Please try again.':'We couldn’t sign you in. Please try again.';
}
async function init(){bindViewport();bindAppLifecycle();loadLocal('local');await finaliseExpiredTimers();if(!configured()){$('#bootGate')?.classList.add('hidden');setAuthScreenActive(true);$('#authGate').classList.remove('hidden');showAuthMessage('AGNT is temporarily unavailable. Please try again shortly.');return}try{const fb=initializeApp(firebaseConfig);auth=getAuth(fb);await setPersistence(auth,browserLocalPersistence);db=initializeFirestore(fb,{experimentalAutoDetectLongPolling:true,localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});onAuthStateChanged(auth,u=>{if(u){if(creatingAccount){currentUser=u;return}startCloud(u).catch(err=>{console.error('Cloud session failed to start',err);showAuthMessage('AGNT could not finish loading. Please check your connection and try again.')})}else{clearActiveSession();$('#bootGate')?.classList.add('hidden');setAuthScreenActive(true);$('#app').classList.add('hidden');$('#authGate').classList.remove('hidden')}})}catch(err){console.error(err);$('#bootGate')?.classList.add('hidden');setAuthScreenActive(true);$('#authGate').classList.remove('hidden');showAuthMessage('AGNT is temporarily unavailable. Please try again shortly.')}}
function showAuthMessage(msg){$('#authMessage').textContent=msg}
function switchView(id){if(id!=='appointmentsView'&&appointmentHistoryMode)setAppointmentHistoryScreen(null);$$('.tabbar button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));updateTopbar(id);if(id==='scheduleView'){renderTimeline();setTodayPage(todayPage);}if(id==='appointmentsView')renderAppointments();if(id==='prospectingView')renderProspecting();if(id==='insightsView')renderInsights()}

function shiftHeaderDate(delta){
  const id=activeViewId();
  if(id==='appointmentsView'){
    const d=parseKey(appointmentDate);d.setDate(d.getDate()+delta);appointmentDate=dateKey(d);
    $('#appointmentDatePicker').value=appointmentDate;renderAppointments();updateTopbar(id);return;
  }
  if(id==='todayView'||id==='scheduleView'){
    const d=parseKey(selectedDate);d.setDate(d.getDate()+delta);selectedDate=dateKey(d);appointmentDate=selectedDate;
    $('#appointmentDatePicker').value=appointmentDate;renderAll();ensureTick();
  }
}

function openCalendar(){$('#calendarModal').classList.add('open');renderCalendar()}

$('#authForm').addEventListener('submit',async e=>{e.preventDefault();showAuthMessage('Signing in…');try{await signInWithEmailAndPassword(auth,$('#email').value,$('#password').value)}catch(err){console.error('Sign in failed',err);showAuthMessage(consumerAuthError(err,'sign in'))}});
$('#createAccount').onclick=async()=>{showAuthMessage('Creating account…');creatingAccount=true;try{const credential=await createUserWithEmailAndPassword(auth,$('#email').value,$('#password').value);newAccountUidPending=credential.user.uid;try{await setDoc(doc(db,'users',credential.user.uid),{teamOnboardingSuggested:true,teamSchemaVersion:TEAM_SCHEMA_VERSION,email:credential.user.email||'',createdAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true})}catch(err){console.error('Team onboarding marker failed',err)}creatingAccount=false;await startCloud(credential.user,{promptTeamSetup:true})}catch(err){creatingAccount=false;showAuthMessage(consumerAuthError(err,'create'))}};

$('#teamChoiceSolo')?.addEventListener('click',()=>completeSoloSetup());
$('#teamChoiceCreate')?.addEventListener('click',()=>showTeamSetupPanel('create'));
$('#teamChoiceJoin')?.addEventListener('click',()=>showTeamSetupPanel('join'));
$$('[data-team-back]').forEach(button=>button.addEventListener('click',()=>showTeamSetupPanel(button.dataset.teamBack||'choices')));
$('#createTeamSubmit')?.addEventListener('click',()=>completeCreateTeam());
$('#joinTeamCode')?.addEventListener('click',()=>completeJoinTeam());
$('#confirmJoinTeam')?.addEventListener('click',()=>confirmJoinTeam());
$('#shareCreatedTeamInvite')?.addEventListener('click',()=>shareTeamInvite('#shareCreatedTeamInvite'));
$('#copyCreatedTeamCode')?.addEventListener('click',()=>copyTeamJoinCode('#copyCreatedTeamCode'));
$('#finishTeamCreation')?.addEventListener('click',()=>hideTeamOnboarding());
$('#openTeamSetup')?.addEventListener('click',()=>showTeamOnboarding());
$('#closeTeamSetup')?.addEventListener('click',()=>hideTeamOnboarding());
$('#copyTeamCode')?.addEventListener('click',()=>copyTeamJoinCode());
$('#manageTeamMembers')?.addEventListener('click',()=>showTeamManager());
$('#leaveCurrentTeam')?.addEventListener('click',()=>showTeamLeaveConfirmation());
$('#closeTeamManager')?.addEventListener('click',()=>hideTeamManager());
$('#copyTeamManagerCode')?.addEventListener('click',()=>copyTeamJoinCode('#copyTeamManagerCode'));
$('#shareTeamManagerInvite')?.addEventListener('click',()=>shareTeamInvite('#shareTeamManagerInvite'));
$('#refreshTeamInviteCode')?.addEventListener('click',()=>showTeamCodeRefreshConfirmation());
$('#deleteTeam')?.addEventListener('click',()=>showTeamDeleteConfirmation());
$('#teamMemberList')?.addEventListener('click',event=>{const button=event.target.closest('[data-remove-team-member]');if(button)openTeamMemberRemoval(button.dataset.removeTeamMember)});
$('#cancelTeamMemberRemoval')?.addEventListener('click',()=>closeTeamMemberRemoval());
$('#confirmTeamMemberRemoval')?.addEventListener('click',()=>confirmTeamMemberRemoval());
$('#cancelTeamLeave')?.addEventListener('click',()=>hideTeamLeaveConfirmation());
$('#confirmTeamLeave')?.addEventListener('click',()=>confirmTeamLeave());
$('#cancelTeamCodeRefresh')?.addEventListener('click',()=>hideTeamCodeRefreshConfirmation());
$('#confirmTeamCodeRefresh')?.addEventListener('click',()=>confirmTeamCodeRefresh());
$('#cancelTeamDelete')?.addEventListener('click',()=>hideTeamDeleteConfirmation());
$('#confirmTeamDelete')?.addEventListener('click',()=>confirmTeamDelete());
$('#teamCodeInput')?.addEventListener('input',event=>{pendingTeamJoin=null;event.target.value=normaliseTeamCode(event.target.value);teamSetupMessage('')});
$('#teamCodeInput')?.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();completeJoinTeam()}});
$('#newTeamName')?.addEventListener('input',()=>teamSetupMessage(''));
$('#newTeamName')?.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();completeCreateTeam()}});
document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(document.querySelector('.appointment-market-insights-overlay')){closeAppointmentMarketInsights();return}if(!$('#returningSnapshotScreen')?.classList.contains('hidden')){dismissReturningSnapshot();return}if(!$('#teamRemoveConfirm')?.classList.contains('hidden')){closeTeamMemberRemoval();return}if(!$('#teamDeleteConfirm')?.classList.contains('hidden')){hideTeamDeleteConfirmation();return}if(!$('#teamLeaveConfirm')?.classList.contains('hidden')){hideTeamLeaveConfirmation();return}if(!$('#teamCodeRefreshConfirm')?.classList.contains('hidden')){hideTeamCodeRefreshConfirmation();return}if(teamManagerOpen){hideTeamManager();return}if(teamOnboardingActive)hideTeamOnboarding()});

$('#startDayButton').onclick=dismissDailyWelcome;
$('#openAgntButton').onclick=dismissOffDayReview;
$('#localMode').onclick=()=>{clearActiveSession();uid='local';loadLocal('local');setSync('offline','This device');showApp()};
$$('[data-action]').forEach(b=>b.onclick=()=>changeMetric(b.dataset.metric,b.dataset.action==='plus'?1:-1));
$('#timerButton').onclick=()=>dayData(selectedDate).timerStartedAt?toggleTimer():startKnockingSession();
$('#endKnockingSession').onclick=endKnockingSession;
$('#pauseKnockingSession').onclick=async()=>{const d=dayData(todayKey());if(d.timerStartedAt)await toggleTimer();knockingSessionVisible=false;closeKnockingCapture();saveKnockingSessionState();renderKnockingSession();switchView('todayView')};
$('#toggleKnockingHotSpotting')?.addEventListener('click',()=>{const button=$('#toggleKnockingHotSpotting'),list=$('#knockingHotSpottingList'),section=$('#knockingHotSpottingRecommendations');if(!button||!list||!section)return;const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));list.classList.toggle('hidden',!expanded);section.classList.toggle('expanded',expanded)});
$('#knockingStreetSelect')?.addEventListener('change',event=>{selectedKnockingStreetKey=cleanText(event.target.value,220);saveKnockingSessionState();renderKnockingHotSpotting()});
$('#knockingSession').addEventListener('click',async e=>{const adjust=e.target.closest('[data-knock-adjust]');if(adjust){const type=adjust.dataset.knockAdjust,delta=Number(adjust.dataset.delta)||0,next=Math.max(0,(Number(knockingSessionStats[type])||0)+delta),actual=next-knockingSessionStats[type];if(!actual)return;knockingSessionStats[type]=next;if(type==='clients')await changeMetric('connects',actual);saveKnockingSessionState();renderKnockingSession();haptic();return}const edit=e.target.closest('[data-edit-knock-log]');if(edit){const found=findDailyKnockingLogEntry(edit.dataset.editKnockLog);if(found)openKnockingCapture(found.entry.type,found.entry);return}const remove=e.target.closest('[data-delete-knock-log]');if(remove){await deleteKnockingLogEntry(remove.dataset.deleteKnockLog);return}const capture=e.target.closest('[data-knock-capture]');if(capture){openKnockingCapture(capture.dataset.knockCapture);return}if(e.target.closest('[data-close-knock-capture]'))closeKnockingCapture()});
$('#knockingSession').addEventListener('submit',async e=>{if(e.target.id!=='knockingCaptureForm')return;e.preventDefault();await submitKnockingCapture(e.target)});
document.querySelector('.today-page-tabs')?.addEventListener('click',e=>{const button=e.target.closest('[data-today-page]');if(button)setTodayPage(button.dataset.todayPage)});
let todaySwipeStartX=0,todaySwipeStartY=0;$('#scheduleView')?.addEventListener('touchstart',e=>{const touch=e.changedTouches?.[0];if(!touch)return;todaySwipeStartX=touch.clientX;todaySwipeStartY=touch.clientY},{passive:true});$('#scheduleView')?.addEventListener('touchend',e=>{const touch=e.changedTouches?.[0];if(!touch)return;const dx=touch.clientX-todaySwipeStartX,dy=touch.clientY-todaySwipeStartY;if(Math.abs(dx)<60||Math.abs(dx)<=Math.abs(dy)*1.25)return;const pages=['overview','insights','log'],index=pages.indexOf(todayPage),next=dx<0?Math.min(pages.length-1,index+1):Math.max(0,index-1);if(next!==index)setTodayPage(pages[next])},{passive:true});
$('#openTodayTimeline').onclick=()=>switchView('scheduleView');
$('#openMarketPulseHome')&&($('#openMarketPulseHome').onclick=()=>openMarketPulseDataArea('home'));
$('#resetKnock').onclick=resetKnock;$('#knockingMetricCard').onclick=e=>{if(e.target.closest('button'))return;openKnockingHistory()};$('#knockingMetricCard').onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button')){e.preventDefault();openKnockingHistory()}};$('#closeKnockingHistory').onclick=closeKnockingHistory;$('#previousDay').onclick=()=>shiftHeaderDate(-1);$('#nextDay').onclick=()=>shiftHeaderDate(1);$('#leaderboardModeShortcut').onclick=()=>{leaderboardMode=leaderboardMode==='week'?'day':'week';renderUnifiedLeaderboard()};$('#homeShortcut').onclick=()=>switchView('todayView');$('#backToday').onclick=()=>{selectedDate=todayKey();appointmentDate=selectedDate;$('#appointmentDatePicker').value=appointmentDate;renderAll();ensureTick()};
$('.tabbar').onclick=e=>{const b=e.target.closest('button[data-view]');if(b)switchView(b.dataset.view)};
$('#timelineCurrentAction')?.addEventListener('click',e=>navigateDailyPlanAction(e.currentTarget.dataset.planAction,e.currentTarget.dataset.eventId));
$('#timelineCurrentBulkSms')?.addEventListener('click',e=>openMarketPulseBulkSms(e.currentTarget.dataset.eventId));
$('#dailyTimeline').onclick=async e=>{
  const buyerMatchCall=e.target.closest('[data-buyer-match-call]');if(buyerMatchCall){e.preventDefault();launchBuyerMatchCall(buyerMatchCall.dataset.buyerMatchCall,buyerMatchCall.dataset.matchId);return}
  const buyerMatchSms=e.target.closest('[data-buyer-match-sms]');if(buyerMatchSms){e.preventDefault();launchBuyerMatchSms(buyerMatchSms.dataset.buyerMatchSms,buyerMatchSms.dataset.matchId);return}
  const buyerMatchOutcome=e.target.closest('[data-open-buyer-match-outcome]');if(buyerMatchOutcome){e.preventDefault();openBuyerMatchOutcome(buyerMatchOutcome.dataset.openBuyerMatchOutcome,buyerMatchOutcome.dataset.matchId);return}
  const marketBulkSms=e.target.closest('[data-market-bulk-sms]');if(marketBulkSms){e.preventDefault();openMarketPulseBulkSms(marketBulkSms.dataset.marketBulkSms);return}
  const planAction=e.target.closest('[data-plan-action]');if(planAction){e.preventDefault();navigateDailyPlanAction(planAction.dataset.planAction,planAction.dataset.eventId);return}
  const buyerCall=e.target.closest('[data-timeline-buyer-call]');if(buyerCall){e.preventDefault();launchBuyerProfileCall(buyerCall.dataset.timelineBuyerCall);return}
  const buyerCheck=e.target.closest('[data-followup-buyer]');if(buyerCheck){await completeProspectFollowUp(buyerCheck.dataset.followupBuyer);renderTimeline();renderNowCard();return}
  const prospectCheck=e.target.closest('[data-followup-prospect]');if(prospectCheck){switchView('prospectingView');openProspectLog(prospectCheck.dataset.followupProspect,false);return}
  const appointmentCheck=e.target.closest('[data-followup-appointment]');if(appointmentCheck){updateAppointmentOutcome(appointmentCheck.dataset.followupAppointment,appointmentCheck.dataset.sourceDate);return}
  const appointmentCall=e.target.closest('[data-appointment-followup-call]');if(appointmentCall){rememberAppointmentFollowUpCallReturn(appointmentCall.dataset.appointmentFollowupCall,appointmentCall.dataset.sourceDate);return}
};
$('#leaderboardList').onclick=e=>{const row=e.target.closest('[data-agent-summary]');if(row)showLeaderboardAgentSummary(row.dataset.agentSummary)};
$('#leaderboardList').onkeydown=e=>{if(e.key!=='Enter'&&e.key!==' ')return;const row=e.target.closest('[data-agent-summary]');if(!row)return;e.preventDefault();showLeaderboardAgentSummary(row.dataset.agentSummary)};
document.querySelector('.leaderboard-mode-tabs').onclick=e=>{const b=e.target.closest('[data-leaderboard-mode]');if(!b)return;leaderboardMode=b.dataset.leaderboardMode==='week'?'week':'day';renderUnifiedLeaderboard()};
$('#dayPrev').onclick=()=>{leaderboardDayOffset--;renderUnifiedLeaderboard()};
$('#dayNext').onclick=()=>{if(leaderboardDayOffset<0)leaderboardDayOffset++;renderUnifiedLeaderboard()};
$('#dayToday').onclick=()=>{leaderboardDayOffset=0;renderUnifiedLeaderboard()};
$('#weekPrev').onclick=()=>{leaderboardWeekOffset--;renderUnifiedLeaderboard()};
$('#weekNext').onclick=()=>{if(leaderboardWeekOffset<0)leaderboardWeekOffset++;renderUnifiedLeaderboard()};
$('#weekLast').onclick=()=>{leaderboardWeekOffset=-1;renderUnifiedLeaderboard()};
$('#scorecardPrev').onclick=()=>{scorecardWeekOffset--;renderScorecard()};$('#scorecardNext').onclick=()=>{if(scorecardWeekOffset<0)scorecardWeekOffset++;renderScorecard()};
$('#appointmentDatePicker').onchange=()=>{};
$('.appointment-types').onchange=updateOfiFormState;$('#appointmentTime').addEventListener('input',updateOfiFormState);$('#appointmentAuction').addEventListener('change',updateOfiFormState);
$('#appointmentContactName').addEventListener('input',e=>{const selected=appointmentLinkedProspectId?prospectById(appointmentLinkedProspectId):null;if(selected&&e.target.value.trim()!==selected.name)appointmentLinkedProspectId='';renderAppointmentContactSuggestions()});$('#appointmentContactName').addEventListener('focus',renderAppointmentContactSuggestions);$('#appointmentContactSuggestions').addEventListener('click',e=>{const b=e.target.closest('[data-appointment-contact]');if(!b)return;selectAppointmentContact(b.dataset.appointmentContact)});$('#cancelProspectAppointmentFlow').onclick=cancelProspectAppointmentFlow;document.addEventListener('pointerdown',e=>{if(!e.target.closest('.appointment-contact-picker'))hideAppointmentContactSuggestions()});
document.querySelector('.appointment-destination-grid').onclick=e=>{const b=e.target.closest('[data-open-appointment-history]');if(!b)return;setAppointmentHistoryScreen(b.dataset.openAppointmentHistory)};
$('#closeAppointmentHistory').onclick=()=>setAppointmentHistoryScreen(null);
async function finishAppointmentFormSubmission(context,assignedToUid=uid){
  const {form,viewedDate,returnState,contactName,contactNumber,address,date,time,type,auction,wasEditing,wasProspectFlow}=context;
  const appointment=wasEditing?await editAppointment({contactName,contactNumber,address,date,time,type,auction,assignedToUid}):await addAppointment({contactName,contactNumber,address,date,time,type,auction,assignedToUid,prospectId:appointmentLinkedProspectId});
  if(!appointment)return;
  if(wasProspectFlow){
    await completePendingProspectAppointmentFlow(appointment);
    form.reset();$('#appointmentDatePicker').value=appointmentDate;$('#appointmentTime').value='12:00';$('#appointmentAuction').checked=false;updateOfiFormState();
    if(confirm(`Add to ${calendarPreference==='apple'?'Apple':'Outlook'} Calendar?`))exportAppointmentToCalendar(appointment,appointment.createdDate);
    return;
  }
  if(!wasEditing&&confirm(`Add to ${calendarPreference==='apple'?'Apple':'Outlook'} Calendar?`))exportAppointmentToCalendar(appointment,appointment.createdDate);
  form.reset();editingAppointment=null;appointmentEditReturnState=null;appointmentLinkedProspectId='';hideAppointmentContactSuggestions();
  if(wasEditing&&returnState){appointmentDate=returnState.date;appointmentHistoryMode=returnState.historyMode;$('#appointmentMainContent')?.classList.toggle('hidden',Boolean(appointmentHistoryMode));$('#appointmentHistoryScreen')?.classList.toggle('hidden',!appointmentHistoryMode);}else{appointmentDate=viewedDate;}
  $('#appointmentDatePicker').value=appointmentDate;$('#appointmentTime').value='12:00';$('#appointmentAuction').checked=false;updateOfiFormState();renderAppointments();updateTopbar('appointmentsView');if(wasEditing)requestAnimationFrame(()=>window.scrollTo({top:returnState?.scrollY||0,behavior:'auto'}));
}
$('#appointmentForm').onsubmit=async e=>{
  e.preventDefault();
  const viewedDate=appointmentDate,returnState=appointmentEditReturnState;
  const contactName=$('#appointmentContactName').value.trim(),contactNumber=$('#appointmentContactNumber').value.trim(),address=$('#appointmentAddress').value.trim(),date=$('#appointmentDatePicker').value,time=$('#appointmentTime').value,type=$('.appointment-types input:checked')?.value||'',auction=type==='OFI'&&$('#appointmentAuction').checked,error=$('#appointmentFormError');
  const missing=[];if(type!=='OFI'&&!contactName)missing.push('contact name');if(type!=='OFI'&&!contactNumber)missing.push('contact number');if(!address)missing.push('property address');if(!date)missing.push('booking date');if(!time)missing.push('booking time');if(!type)missing.push('appointment type');
  if(missing.length){error.textContent=`Add ${missing.join(', ')}`;error.classList.remove('hidden');return}
  error.textContent='';error.classList.add('hidden');
  const wasEditing=Boolean(editingAppointment),wasProspectFlow=Boolean(pendingProspectAppointmentFlow);
  const existingAssignedToUid=wasEditing?String(dayData(editingAppointment.sourceDate).appointments.find(a=>String(a.id)===String(editingAppointment.id))?.assignedToUid||uid):uid;
  const context={form:e.target,viewedDate,returnState,contactName,contactNumber,address,date,time,type,auction,wasEditing,wasProspectFlow};
  if(!wasEditing&&cloud&&accountMode==='team'&&teamId&&appointmentAssignees.length>1){
    pendingAppointmentAssignment=context;showAppointmentAssignmentPopup();return;
  }
  await finishAppointmentFormSubmission(context,existingAssignedToUid);
};
$('#closeAppointmentEditor').onclick=closeAppointmentEditor;
$('#cancelAppointmentAssignment')?.addEventListener('click',()=>hideAppointmentAssignmentPopup());
$('#confirmAppointmentAssignment')?.addEventListener('click',async()=>{if(!pendingAppointmentAssignment)return;const context=pendingAppointmentAssignment,assignedToUid=$('#appointmentAssignmentSelect')?.value||uid;hideAppointmentAssignmentPopup({clear:false});pendingAppointmentAssignment=null;await finishAppointmentFormSubmission(context,assignedToUid)});
$('#appointmentAssignmentModal')?.addEventListener('click',e=>{if(e.target.id==='appointmentAssignmentModal')hideAppointmentAssignmentPopup()});

if($('#teamAppointmentGotIt'))$('#teamAppointmentGotIt').onclick=e=>{e.preventDefault();e.stopPropagation();hideTeamAppointmentNotice({acknowledge:true})};
if($('#teamAppointmentAddCalendar'))$('#teamAppointmentAddCalendar').onclick=e=>{e.preventDefault();e.stopPropagation();const a=pendingTeamAppointmentNotice;if(!a)return;hideTeamAppointmentNotice({acknowledge:true,calendar:true});requestAnimationFrame(()=>exportAppointmentToCalendar(a,a.createdDate||todayKey()))};
if($('#teamAppointmentNotice'))$('#teamAppointmentNotice').onclick=e=>{if(e.target.id==='teamAppointmentNotice')hideTeamAppointmentNotice({acknowledge:true})};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&editingAppointment)closeAppointmentEditor();});
$('#saveFollowUpDate').onclick=saveAppointmentFollowUp;
$$('[data-close-followup]').forEach(button=>button.onclick=()=>{closeActionModal('#followUpModal');pendingFollowUpAppointment=null;});
$('#outcomeOptions').onclick=e=>{const button=e.target.closest('[data-outcome]');if(!button)return;selectAppointmentOutcome(button.dataset.outcome,button);};
['outcomeFollowUpDate','outcomePurchaseAddress','outcomePurchasePrice','outcomePurchaseDate'].forEach(id=>$(`#${id}`)?.addEventListener('input',()=>refreshAppointmentOutcomeForm()));
$('#saveAppointmentOutcome').onclick=saveSelectedAppointmentOutcome;
$$('[data-close-outcome]').forEach(button=>button.onclick=closeAppointmentOutcomeModal);
$('#followUpModal').onclick=e=>{if(e.target.id==='followUpModal'){closeActionModal('#followUpModal');pendingFollowUpAppointment=null;}};
$('#outcomeModal').onclick=e=>{if(e.target.id==='outcomeModal')closeAppointmentOutcomeModal();};

$('#appointmentsView').onclick=e=>{
  const marketInsightsButton=e.target.closest('[data-open-market-insights]');
  if(marketInsightsButton){showAppointmentMarketInsights(marketInsightsButton.dataset.openMarketInsights);return;}
  const teamCalendarButton=e.target.closest('[data-calendar-team-appointment]');
  if(teamCalendarButton){const a=assignedTeamAppointments.find(item=>String(item.teamAppointmentId||item.id)===String(teamCalendarButton.dataset.calendarTeamAppointment));if(!a)return toast('Appointment could not be found');if(appointmentAddedToCalendar(a,a.createdDate||todayKey()))return toast('Already added to calendar');exportAppointmentToCalendar(a,a.createdDate||todayKey());acknowledgeTeamAppointment(a,{calendar:true});return;}
  const calendarButton=e.target.closest('[data-calendar-appointment]');
  if(calendarButton){
    const sourceDate=calendarButton.dataset.sourceDate||appointmentDate;
    const entry=allAppointmentEntries().find(({appointment:a,sourceDate:s})=>calendarExportId(a,s)===calendarButton.dataset.calendarAppointment&&s===sourceDate);
    if(!entry)return toast('Appointment could not be found');
    if(appointmentAddedToCalendar(entry.appointment,entry.sourceDate))return toast('Already added to calendar');
    exportAppointmentToCalendar(entry.appointment,entry.sourceDate);return;
  }
  const follow=e.target.closest('[data-set-followup]');if(follow){setAppointmentFollowUp(follow.dataset.setFollowup,follow.dataset.sourceDate);return;}
  const marked=e.target.closest('[data-mark-followedup]');if(marked){markAppointmentFollowedUp(marked.dataset.markFollowedup,marked.dataset.sourceDate);return;}
  const outcome=e.target.closest('[data-update-outcome]');if(outcome){updateAppointmentOutcome(outcome.dataset.updateOutcome,outcome.dataset.sourceDate);return;}
  const b=e.target.closest('[data-delete-appointment]');if(b){if(confirm('Delete this appointment?\n\nThis will permanently remove the appointment and any associated follow-up.'))deleteAppointment(b.dataset.deleteAppointment,b.dataset.sourceDate||appointmentDate);return;}
  if(e.target.closest('button, a, input, select, textarea, label'))return;
  const card=e.target.closest('[data-appointment-card-edit]');if(card)beginEditAppointment(card.dataset.appointmentCardEdit,card.dataset.sourceDate||appointmentDate);
};
$('#appointmentsView').addEventListener('keydown',e=>{
  if(e.key!=='Enter'&&e.key!==' ')return;
  const card=e.target.closest('[data-appointment-card-edit]');
  if(!card||e.target!==card)return;
  e.preventDefault();beginEditAppointment(card.dataset.appointmentCardEdit,card.dataset.sourceDate||appointmentDate);
});


$('#prospectSearch').oninput=()=>renderProspecting();$('#pipelineSort')&&($('#pipelineSort').onchange=e=>{pipelineSort=e.target.value;renderSellerPipeline()});
$('#addProspectButton').onclick=()=>prospectSection==='buyers'?openBuyerEditor():openProspectEditor();
$('#addBuyerFromTab')&&($('#addBuyerFromTab').onclick=()=>openBuyerEditor());
$('#openManualDialler').onclick=openManualDialler;
$('#closeManualDialler').onclick=closeManualDialler;
$('#manualDiallerModal').onclick=e=>{if(e.target.id==='manualDiallerModal')closeManualDialler()};
$('#manualDiallerKeypad').onclick=e=>{const key=e.target.closest('[data-dial-key]'),del=e.target.closest('[data-dial-delete]');if(key){const value=key.dataset.dialKey;if(value==='+'&&manualDiallerNumber)return;manualDiallerNumber=normaliseDialNumber(manualDiallerNumber+value);renderManualDialler();haptic()}else if(del){manualDiallerNumber=manualDiallerNumber.slice(0,-1);renderManualDialler();haptic()}};
$('#manualDiallerNumber').addEventListener('input',e=>{manualDiallerNumber=normaliseDialNumber(e.target.value);renderManualDialler()});
$('#manualDiallerNumber').addEventListener('paste',e=>{const text=e.clipboardData?.getData('text');if(!text)return;e.preventDefault();const input=e.currentTarget,start=input.selectionStart??input.value.length,end=input.selectionEnd??start;manualDiallerNumber=normaliseDialNumber(`${input.value.slice(0,start)}${text}${input.value.slice(end)}`);renderManualDialler();requestAnimationFrame(()=>{input.focus({preventScroll:true});input.setSelectionRange(input.value.length,input.value.length)})});
$('#manualDiallerCall').onclick=launchManualCall;
$('#manualCallOutcomeOptions').onclick=e=>{const button=e.target.closest('[data-manual-call-outcome]');if(button)saveManualCallOutcome(button.dataset.manualCallOutcome)};
$('#closeManualCallOutcome').onclick=()=>closeManualCallOutcome();
$('#manualCallOutcomeModal').onclick=e=>{if(e.target.id==='manualCallOutcomeModal')closeManualCallOutcome()};
$('#manualCallSaveContact').onclick=saveManualCallAsContact;
$('#manualCallSaveBuyer').onclick=saveManualCallAsBuyer;
$('#manualCallBookAppointment').onclick=bookManualCallAppointment;
$('#manualCallDone').onclick=()=>{const pending=readPendingManualCall();closeManualCallOutcome();if(pending?.source==='buyer-session')showBuyerSession();else if(pending?.source==='buyer-profile'){switchView('prospectingView');setProspectorSection('buyers');renderProspecting()}else openManualDialler()};
$('#startProspectingSession').onclick=startProspectingSession;
$('#openHotSpotting')&&($('#openHotSpotting').onclick=openHotSpottingArea);
$('#openBroadcast')&&($('#openBroadcast').onclick=()=>{selectedBroadcastType='';setProspectorSection('broadcast');renderProspecting()});
$('#backFromMarketPulse')&&($('#backFromMarketPulse').onclick=()=>{setProspectorSection('today');renderProspecting()});
$('#openMarketPulseData')&&($('#openMarketPulseData').onclick=()=>openMarketPulseDataArea('hotspotting'));
$('#backFromMarketPulseData')&&($('#backFromMarketPulseData').onclick=closeMarketPulseDataArea);
$('#returningSnapshotReviewMarket')&&($('#returningSnapshotReviewMarket').onclick=()=>openDailyBriefingDestination('view-market'));
$('#importMarketPulse')&&($('#importMarketPulse').onclick=importMarketPulse);
$('#clearMarketPulseInput')&&($('#clearMarketPulseInput').onclick=()=>{const input=$('#marketPulseInput');if(input)input.value='';$('#marketPulseImportStatus').textContent='Nothing imported yet.'});
$('#clearMarketPulseEvents')&&($('#clearMarketPulseEvents').onclick=async()=>{if(!marketPulseEvents.length&&!marketPulseHistory.length)return;marketPulseEvents=[];marketPulseHistory=[];saveLocal();renderMarketPulse();try{await queueProspectingSave()}catch(err){console.error('Hot Spotting clear sync failed',err)}toast('Hot Spotting cleared')});

$('#clearProspectFilter').onclick=()=>{prospectFilter='priority';renderProspecting()};
$('#prospectCsvImport').onchange=async e=>{try{if(e.target.files[0])await importProspectCsv(e.target.files[0])}catch(err){console.error(err);toast('CSV could not be imported')}finally{e.target.value=''}};
$('#buyerPdfImport')&&($('#buyerPdfImport').onchange=async e=>{const file=e.target.files?.[0];e.target.value='';if(file)await importBuyerPdf(file)});
$('#openBuyerListSession')&&($('#openBuyerListSession').onclick=openBuyerListSession);
$('#prospectingView').onclick=async e=>{
  if(e.target.closest('#backFromFollowUps')){prospectTodayMode='dashboard';setProspectorSection('today',{todayMode:'dashboard'});renderProspecting();return}
  const clearFollowUp=e.target.closest('[data-clear-followup]');if(clearFollowUp){clearFollowUp.disabled=true;clearFollowUp.setAttribute('aria-checked','true');const type=clearFollowUp.dataset.followupType,id=clearFollowUp.dataset.clearFollowup,sourceDate=clearFollowUp.dataset.sourceDate||'';if(type==='appointment')await markAppointmentFollowedUp(id,sourceDate);else await completeProspectFollowUp(id);return}
  const contextFollowUp=e.target.closest('[data-context-followup-log]');if(contextFollowUp){openProspectLog(contextFollowUp.dataset.contextFollowupLog,false,{returnMode:'followups'});return}
  const contextAppointment=e.target.closest('[data-context-appointment-outcome]');if(contextAppointment){updateAppointmentOutcome(contextAppointment.dataset.contextAppointmentOutcome,contextAppointment.dataset.sourceDate);return}
  const appointmentFollowUpCall=e.target.closest('[data-appointment-followup-call]');if(appointmentFollowUpCall){rememberAppointmentFollowUpCallReturn(appointmentFollowUpCall.dataset.appointmentFollowupCall,appointmentFollowUpCall.dataset.sourceDate,'followups');return}
  if(e.target.closest('[data-buyer-import-back],[data-buyer-import-clear]')){$('#prospectingSession').classList.add('hidden');$('#prospectingDashboard').classList.remove('hidden');renderBuyerSessionHero();return}
  const removeBuyer=e.target.closest('[data-remove-buyer]');if(removeBuyer){const host=$('#prospectingSession'),state=host._buyerImport,index=Number(removeBuyer.dataset.removeBuyer);state.contacts.splice(index,1);showBuyerImportReview(state.contacts,state.fileName);return}
  if(e.target.closest('[data-confirm-buyer-import]')){const host=$('#prospectingSession'),state=host._buyerImport,rows=[...host.querySelectorAll('[data-buyer-review-row]')];const contacts=rows.map((row,i)=>({id:state.contacts[i]?.id||`buyer_${Date.now()}_${i}`,name:cleanText(row.querySelector('[data-buyer-name]').value,120)||'Unknown buyer',phone:normaliseDialNumber(row.querySelector('[data-buyer-phone]').value),address:cleanText(row.querySelector('[data-buyer-address]').value,240),doNotSms:Boolean(state.contacts[i]?.doNotSms),status:''})).filter(c=>c.phone.replace(/\D/g,'').length>=9);if(!contacts.length)return toast('Add at least one valid mobile number');buyerSession={contacts,index:0,active:true,fileName:state.fileName,importedAt:Date.now()};saveBuyerSession();renderBuyerSessionHero();showBuyerSession();return}
  if(e.target.closest('[data-call-buyer-session]')){launchBuyerSessionCall();return}
  if(e.target.closest('[data-skip-buyer-session]')){const buyer=buyerSession.contacts[buyerSession.index];if(buyer){buyerSession.contacts.push({...buyer,id:buyer.id});buyerSession.contacts.splice(buyerSession.index,1)}saveBuyerSession();showBuyerSession();return}
  if(e.target.closest('[data-buyer-session-back]')){buyerSession.active=true;saveBuyerSession();$('#prospectingSession').classList.add('hidden');$('#prospectingDashboard').classList.remove('hidden');renderBuyerSessionHero();return}
  if(e.target.closest('[data-end-buyer-session]')){if(confirm('End and clear this buyer list session?')){clearBuyerSession();$('#prospectingSession').classList.add('hidden');$('#prospectingDashboard').classList.remove('hidden')}return}
  const buyerQuick=e.target.closest('[data-buyer-quick-filter]');if(buyerQuick){buyerQuickFilter=buyerQuick.dataset.buyerQuickFilter||'All';renderBuyerProfiles();updateTopbar();return}
  if(e.target.closest('#toggleBuyerFilters')){const panel=$('#buyerAdvancedFilters'),open=panel.classList.contains('hidden');panel.classList.toggle('hidden',!open);$('#toggleBuyerFilters').setAttribute('aria-expanded',String(open));if(open)syncBuyerFilterControls();return}
  if(e.target.closest('#closeBuyerFilters')){$('#buyerAdvancedFilters').classList.add('hidden');$('#toggleBuyerFilters').setAttribute('aria-expanded','false');return}
  if(e.target.closest('#clearBuyerFilters')){clearBuyerFilters();return}
  if(e.target.closest('#toggleArchivedBuyers')){setBuyerBrowseMode(buyerBrowseMode==='archived'?'active':'archived');return}
  if(e.target.closest('[data-add-buyer-empty]')){openBuyerEditor();return}
  const useContactAsBuyer=e.target.closest('[data-use-contact-as-buyer]');if(useContactAsBuyer){const contact=prospectById(useContactAsBuyer.dataset.useContactAsBuyer);if(!contact)return toast('Contact could not be found');openBuyerEditor(contact.id,{},pendingBuyerEditorContext);toast('Existing contact selected. Add their buyer brief.');return}
  const buyerFilterFeature=e.target.closest('[data-buyer-filter-feature]');if(buyerFilterFeature){const feature=buyerFilterFeature.dataset.buyerFilterFeature;buyerFilterState.features.has(feature)?buyerFilterState.features.delete(feature):buyerFilterState.features.add(feature);syncBuyerFilterControls();renderBuyerProfiles();updateTopbar();return}
  const openBuyer=e.target.closest('[data-open-buyer]');if(openBuyer){$('#prospectingDashboard').classList.add('hidden');$('#prospectDetail').classList.remove('hidden');renderBuyerDetail(openBuyer.dataset.openBuyer);return}
  const buyerMatchCall=e.target.closest('[data-buyer-match-call]');if(buyerMatchCall){launchBuyerMatchCall(buyerMatchCall.dataset.buyerMatchCall,buyerMatchCall.dataset.matchId);return}
  const buyerMatchSms=e.target.closest('[data-buyer-match-sms]');if(buyerMatchSms){launchBuyerMatchSms(buyerMatchSms.dataset.buyerMatchSms,buyerMatchSms.dataset.matchId);return}
  const buyerMatchOutcome=e.target.closest('[data-open-buyer-match-outcome]');if(buyerMatchOutcome){openBuyerMatchOutcome(buyerMatchOutcome.dataset.openBuyerMatchOutcome,buyerMatchOutcome.dataset.matchId);return}
  const callBuyer=e.target.closest('[data-call-buyer]');if(callBuyer){launchBuyerProfileCall(callBuyer.dataset.callBuyer);return}
  const editBuyer=e.target.closest('[data-edit-buyer]');if(editBuyer){openBuyerEditor(editBuyer.dataset.editBuyer);return}
  const openBuyerRole=e.target.closest('[data-open-buyer-role]');if(openBuyerRole){openBuyerEditor(openBuyerRole.dataset.openBuyerRole);return}
  const openSellerProfile=e.target.closest('[data-open-seller-profile]');if(openSellerProfile){renderProspectDetail(openSellerProfile.dataset.openSellerProfile);return}
  if(e.target.closest('[data-close-buyer]')){pendingBuyerEditorContext=null;closeProspectDetail();return}
  const markPurchased=e.target.closest('[data-mark-buyer-purchased]');if(markPurchased){openBuyerPurchaseForm(markPurchased.dataset.markBuyerPurchased);return}
  const buyerFollowUp=e.target.closest('[data-buyer-followup]');if(buyerFollowUp){openBuyerFollowUp(buyerFollowUp.dataset.buyerFollowup);return}
  const archiveBuyerButton=e.target.closest('[data-archive-buyer]');if(archiveBuyerButton){const buyer=prospectById(archiveBuyerButton.dataset.archiveBuyer),message=prospectHasContactProfile(buyer)?'Archive this buyer brief?\n\nTheir seller/contact profile and shared follow-up will remain active.':'Archive this buyer and clear their outstanding follow-up?';if(confirm(message))await archiveBuyer(archiveBuyerButton.dataset.archiveBuyer);return}
  const restoreBuyerButton=e.target.closest('[data-restore-buyer]');if(restoreBuyerButton){await restoreBuyer(restoreBuyerButton.dataset.restoreBuyer);return}
  if(e.target.closest('[data-close-buyer-followup]')||e.target.classList.contains('buyer-followup-overlay')){closeBuyerFollowUp();return}
  if(e.target.closest('[data-cancel-buyer-purchase]')){renderBuyerDetail(activeProspectId);return}
  const removeBuyerProfile=e.target.closest('[data-remove-buyer-profile]');if(removeBuyerProfile&&confirm('Remove the archived buyer brief?\n\nThe seller/contact profile and full interaction history will be retained.')){await removeArchivedBuyerProfile(removeBuyerProfile.dataset.removeBuyerProfile);return}
  const deleteBuyer=e.target.closest('[data-delete-buyer]'),buyerToDelete=deleteBuyer?prospectById(deleteBuyer.dataset.deleteBuyer):null;if(deleteBuyer&&prospectBuyerArchived(buyerToDelete)&&!prospectHasContactProfile(buyerToDelete)&&confirm('Permanently delete this archived buyer and their interaction history?')){prospects=prospects.filter(p=>p.id!==buyerToDelete.id);prospectInteractions=prospectInteractions.filter(x=>x.prospectId!==buyerToDelete.id);await saveProspecting({render:false,awaitCloud:false});closeProspectDetail();toast('Buyer permanently deleted');return}
  const buyerChoice=e.target.closest('[data-buyer-choice]');if(buyerChoice){const form=buyerChoice.closest('#buyerEditor'),target=buyerChoice.dataset.buyerChoice,value=buyerChoice.dataset.buyerChoiceValue;const input=form?.querySelector(`input[name="${target}"]`);if(input)input.value=value;form?.querySelectorAll(`[data-buyer-choice="${target}"]`).forEach(button=>button.classList.toggle('active',button===buyerChoice));return}
  const buyerPropertyType=e.target.closest('[data-buyer-property-type]');if(buyerPropertyType){const form=buyerPropertyType.closest('#buyerEditor'),active=buyerPropertyType.classList.contains('active');form?.querySelectorAll('[data-buyer-property-type]').forEach(button=>{button.classList.remove('active');button.setAttribute('aria-pressed','false')});if(!active){buyerPropertyType.classList.add('active');buyerPropertyType.setAttribute('aria-pressed','true')}return}
  const buyerFeature=e.target.closest('[data-buyer-feature]');if(buyerFeature){buyerFeature.classList.toggle('active');buyerFeature.setAttribute('aria-pressed',String(buyerFeature.classList.contains('active')));return}
  const buyerPositionTag=e.target.closest('[data-buyer-position-tag]');if(buyerPositionTag){buyerPositionTag.classList.toggle('active');buyerPositionTag.setAttribute('aria-pressed',String(buyerPositionTag.classList.contains('active')));syncBuyerSellerEditorFields(buyerPositionTag.closest('#buyerEditor'));return}
  if(e.target.closest('[data-add-buyer-suburb]')){addBuyerSuburb(e.target.closest('#buyerEditor'));return}
  const selectBuyerSuburb=e.target.closest('[data-select-buyer-suburb]');if(selectBuyerSuburb){addBuyerSuburb(selectBuyerSuburb.closest('#buyerEditor'),selectBuyerSuburb.dataset.selectBuyerSuburb);return}
  const removeBuyerSuburb=e.target.closest('[data-remove-buyer-suburb]');if(removeBuyerSuburb){const form=removeBuyerSuburb.closest('#buyerEditor'),index=Number(removeBuyerSuburb.dataset.removeBuyerSuburb);form._buyerSuburbs=(form._buyerSuburbs||[]).filter((_,i)=>i!==index);renderBuyerSuburbChips(form);renderBuyerSuburbSuggestions(form);return}
  const marketBulkSms=e.target.closest('[data-market-bulk-sms]');if(marketBulkSms){openMarketPulseBulkSms(marketBulkSms.dataset.marketBulkSms);return}
  const marketSession=e.target.closest('[data-start-market-session]');if(marketSession){startMarketPulseSession(marketSession.dataset.startMarketSession);return}
  const marketSessionSkip=e.target.closest('[data-skip-market-session]');if(marketSessionSkip){await skipMarketPulseSession(marketSessionSkip.dataset.skipMarketSession);return}
  const marketReview=e.target.closest('[data-market-review-filter]');if(marketReview){marketReviewFilter=marketReview.dataset.marketReviewFilter||'all';renderMarketPulseReview();return}
  const removeMarket=e.target.closest('[data-remove-market-event]');if(removeMarket){const eventId=removeMarket.dataset.removeMarketEvent;marketPulseEvents=marketPulseEvents.filter(x=>x.id!==eventId);marketPulseHistory=marketPulseHistory.filter(x=>x.id!==eventId);saveLocal();renderMarketPulse();try{await queueProspectingSave()}catch(err){console.error('Hot Spotting removal sync failed',err)}return}
  const prospectCall=e.target.closest('[data-prospect-call]');if(prospectCall){rememberProspectCallReturn(prospectCall.dataset.prospectCall,prospectCall.dataset.callFromSession==='1',prospectCall.dataset.callReturnMode||'');return}
  const section=e.target.closest('[data-prospector-section]');if(section){e.preventDefault();e.stopPropagation();const target=section.dataset.prospectorSection;if(target==='today')prospectTodayMode='dashboard';setProspectorSection(target,{todayMode:target==='today'?'dashboard':null});renderProspecting();return}
  const broadcastTypeButton=e.target.closest('[data-broadcast-type]');if(broadcastTypeButton){openBroadcastBuilder(broadcastTypeButton.dataset.broadcastType);return}
  if(e.target.closest('#broadcastBack')){if(selectedBroadcastType){if(broadcastStep>1)setBroadcastStep(broadcastStep-1);else{const returnToMarket=Boolean(selectedBroadcastContext);closeBroadcastBuilder();if(returnToMarket){marketPageMode='hotspotting';setProspectorSection('market');renderProspecting()}}}else{setProspectorSection('today');renderProspecting()}return}
  if(e.target.closest('#broadcastNextToMessage')){if(!campaignPayload().users.length){toast('Choose at least one eligible recipient');return}setBroadcastStep(2);return}
  if(e.target.closest('#broadcastNextToReview')){if(!cleanText($('#campaignMessage')?.value,2000)){toast('Add a message body');return}renderCampaignBroadcast();setBroadcastStep(3);return}
  if(e.target.closest('#broadcastReviewLive')){setBroadcastReviewMode('live');return}
  if(e.target.closest('#broadcastReviewTest')){setBroadcastReviewMode('test');renderBulkSmsTest();return}
  if(e.target.closest('#broadcastStartAnother')){closeBroadcastBuilder();return}
  if(e.target.closest('#broadcastReturnProspector')){const returnToMarket=Boolean(selectedBroadcastContext);closeBroadcastBuilder();if(returnToMarket)marketPageMode='hotspotting';setProspectorSection(returnToMarket?'market':'today');renderProspecting();return}
  if(e.target.closest('#refreshCampaignPreview')){renderCampaignBroadcast();return}
  if(e.target.closest('#launchCampaignShortcut')){launchCampaignShortcut();return}
  if(e.target.closest('#launchBulkSmsTest')){launchBulkSmsTest();return}
  const insightPeriod=e.target.closest('[data-prospect-insight-period]');if(insightPeriod){prospectInsightPeriod=insightPeriod.dataset.prospectInsightPeriod;renderProspectorInsights();return}
  const insightOpen=e.target.closest('[data-insight-open]');if(insightOpen){const target=insightOpen.dataset.insightOpen;if(target==='appointments'){switchView('appointmentsView');return}setProspectorSection(target==='contacts'?'contacts':target==='pipeline'?'pipeline':'today');renderProspecting();return}
  const filter=e.target.closest('[data-prospect-filter]');if(filter){prospectFilter=filter.dataset.prospectFilter;renderProspecting();return}
  const pipelineTemp=e.target.closest('[data-pipeline-temperature]');if(pipelineTemp){pipelineTemperature=pipelineTemp.dataset.pipelineTemperature;$$('[data-pipeline-temperature]').forEach(b=>b.classList.toggle('active',b===pipelineTemp));renderSellerPipeline();return}
  if(e.target.closest('#backFromArchivedContacts')){prospectContactsMode='active';prospectBulkMode=false;selectedProspectIds.clear();renderProspecting();return}
  if(e.target.closest('#toggleArchivedContacts')){prospectContactsMode=prospectContactsMode==='archived'?'active':'archived';prospectBulkMode=false;selectedProspectIds.clear();renderProspecting();return}
  if(e.target.closest('#toggleProspectBulk')){prospectBulkMode=!prospectBulkMode;selectedProspectIds.clear();renderProspecting();return}
  if(e.target.closest('#selectAllProspects')){const visible=filteredProspects(),allSelected=visible.length&&visible.every(p=>selectedProspectIds.has(p.id));visible.forEach(p=>allSelected?selectedProspectIds.delete(p.id):selectedProspectIds.add(p.id));renderProspecting();return}
  if(e.target.closest('#restoreSelectedProspects')){const total=selectedProspectIds.size;if(!total)return;prospects=prospects.map(p=>selectedProspectIds.has(p.id)?normaliseProspect({...p,archived:false,archivedAt:0,updatedAt:Date.now()}):p);selectedProspectIds.clear();prospectBulkMode=false;await saveProspecting();toast(`${total} contact${total===1?'':'s'} restored`);return}
  if(e.target.closest('#deleteSelectedProspects')){const total=selectedProspectIds.size;if(!total)return;if(confirm(`Delete ${total} selected contact${total===1?'':'s'} and their interaction history?`)){prospects=prospects.filter(p=>!selectedProspectIds.has(p.id));prospectInteractions=prospectInteractions.filter(x=>!selectedProspectIds.has(x.prospectId));selectedProspectIds.clear();prospectBulkMode=false;await saveProspecting();toast(`${total} contact${total===1?'':'s'} deleted`)}return}
  const select=e.target.closest('[data-select-prospect]');if(select){const id=select.dataset.selectProspect;selectedProspectIds.has(id)?selectedProspectIds.delete(id):selectedProspectIds.add(id);renderProspecting();return}
  const completeFollowUp=e.target.closest('[data-complete-prospect-followup]');if(completeFollowUp){await completeProspectFollowUp(completeFollowUp.dataset.completeProspectFollowup);return}
  const open=e.target.closest('[data-open-prospect]');if(open){$('#prospectingDashboard').classList.add('hidden');$('#prospectDetail').classList.remove('hidden');renderProspectDetail(open.dataset.openProspect);return}
  if(e.target.closest('[data-close-prospect]')){if($('#prospectEditor')?.dataset.contactDraft==='1')cancelContactEditor();else closeProspectDetail();return}
  const edit=e.target.closest('[data-edit-prospect]');if(edit){openProspectEditor(edit.dataset.editProspect);return}
  const log=e.target.closest('[data-log-prospect]');if(log){openProspectLog(log.dataset.logProspect);return}
  if(e.target.closest('[data-cancel-log]')){const form=$('#prospectLogForm');if(prospectSessionActive&&form?.dataset.fromSession==='1')showProspectingSession();else if(form?.dataset.returnMode==='followups'){activeProspectId=null;prospectTodayMode='followups';$('#prospectDetail').classList.add('hidden');$('#prospectDetail').innerHTML='';$('#prospectingDashboard').classList.remove('hidden');renderProspecting()}else renderProspectDetail(activeProspectId);return}
  const del=e.target.closest('[data-delete-prospect]'),prospectToDelete=del?prospectById(del.dataset.deleteProspect):null;if(del&&prospectToDelete&&confirm(prospectHasActiveBuyerRole(prospectToDelete)?'Delete this contact, buyer brief and their interaction history?':'Delete this contact and their interaction history?')){prospects=prospects.filter(p=>p.id!==prospectToDelete.id);prospectInteractions=prospectInteractions.filter(x=>x.prospectId!==prospectToDelete.id);saveProspecting();closeProspectDetail();return}
  if(e.target.closest('[data-complete-market-session]')){endProspectingSession({completeMarketSession:true});return}
  if(e.target.closest('[data-session-back]')){if($('#prospectingSession'))delete $('#prospectingSession').dataset.sessionView;$('#prospectingSession').classList.add('hidden');$('#prospectDetail').classList.add('hidden');$('#prospectingDashboard').classList.remove('hidden');if(cleanText(prospectSessionContext?.eventId,160)){marketPageMode='hotspotting';setProspectorSection('market')}renderProspecting();return}
  if(e.target.closest('[data-end-session]')){endProspectingSession();return}
  const slog=e.target.closest('[data-session-log]');if(slog){openProspectLog(slog.dataset.sessionLog,true);return}
  const sms=e.target.closest('[data-session-sms]');if(sms){openHotSpotSmsComposer(sms.dataset.sessionSms);return}
  if(e.target.closest('[data-cancel-sms]')){showProspectingSession();return}
  const openMessages=e.target.closest('[data-open-hotspot-messages]');if(openMessages){const p=prospectById(openMessages.dataset.openHotspotMessages),body=cleanText($('#prospectingSession [data-hotspot-sms-body]')?.value,2000);if(!p||!body)return toast('Add a message first');const pending={prospectId:p.id,eventId:cleanText(prospectSessionContext?.eventId,160),message:body,openedAt:Date.now()};saveHotSpotSmsPending(pending);showHotSpotSmsConfirmation(pending);window.location.href=smsHref(primaryProspectPhone(p),body);return}
  if(e.target.closest('[data-sms-sent]')){confirmHotSpotSmsSent();return}
  if(e.target.closest('[data-sms-not-sent]')){saveHotSpotSmsPending(null);showProspectingSession();return}
  if(e.target.closest('[data-refresh-pipeline-session]')){openPipelineRefreshConfirm();return}
  if(e.target.closest('[data-cancel-pipeline-refresh]')){closePipelineRefreshConfirm();return}
  if(e.target.closest('[data-confirm-pipeline-refresh]')){confirmPipelineRefresh();return}
  if(e.target.closest('[data-session-skip]')){const skippedId=prospectSessionIds[prospectSessionIndex],marketEventId=cleanText(prospectSessionContext?.eventId,160);if(skippedId&&marketEventId){marketPulseEvents=normaliseMarketPulseEvents(marketPulseEvents.map(event=>event.id===marketEventId?{...event,sessionStartedAt:event.sessionStartedAt||Date.now(),skippedProspectIds:[...(event.skippedProspectIds||[]),skippedId]}:event));saveLocal();queueProspectingSave().catch(err=>console.error('Hot Spotting skip sync failed',err))}else if(skippedId){const pipeline=getDailyProspectPipeline().filter(id=>id!==skippedId);try{localStorage.setItem(dailyProspectPipelineKey(),JSON.stringify(pipeline))}catch(err){console.warn('Skipped pipeline contact could not be removed',err)}}prospectSessionIndex++;saveProspectingSessionState();showProspectingSession();return}
};
$('#prospectingView').addEventListener('input',e=>{const draftForm=e.target.closest('#prospectEditor[data-contact-draft="1"]');if(draftForm)saveContactDraftFromForm(draftForm);if(e.target.closest('#prospectorBroadcastPanel')){renderCampaignBroadcast();return}if(e.target.matches('#buyerFilterSuburb,#buyerFilterBudgetMin')){setBuyerFilterFromControls();return}if(e.target.matches('[data-buyer-existing-search]')){renderBuyerExistingContactResults(e.target.closest('#buyerEditor'));return}if(e.target.matches('[data-buyer-suburb-input]')){renderBuyerSuburbSuggestions(e.target.closest('#buyerEditor'));return}if(e.target.matches('#buyerBudgetMax')){if($('#buyerBudgetMaxLabel'))$('#buyerBudgetMaxLabel').textContent=buyerBudgetEditorLabel(Number(e.target.value)||0)}});
$('#prospectingView').addEventListener('change',e=>{
  if(e.target.matches('#buyerFilterBedrooms,#buyerFilterBathrooms,#buyerFilterCars,#buyerFilterPropertyType,#buyerFilterStage,#buyerFilterTemperature,#buyerFilterPosition,#buyerFilterFollowUp')){setBuyerFilterFromControls();return}
  if(e.target.closest('#prospectorBroadcastPanel')){
    if(e.target.id==='campaignSuburbSelect')selectedBroadcastSuburb=e.target.value;
    if(e.target.id==='campaignStreetSuburb'){selectedBroadcastSuburb=e.target.value;selectedBroadcastStreet='';selectedBroadcastRecipientIds=new Set();renderBroadcastAudienceControls()}
    if(e.target.id==='campaignStreetSelect'){selectedBroadcastStreet=e.target.value;selectedBroadcastRecipientIds=new Set(broadcastStreetContacts(selectedBroadcastStreet).map(p=>p.id));renderBroadcastAudienceControls()}
    if(e.target.matches('[data-broadcast-recipient]')){e.target.checked?selectedBroadcastRecipientIds.add(e.target.dataset.broadcastRecipient):selectedBroadcastRecipientIds.delete(e.target.dataset.broadcastRecipient)}
    renderCampaignBroadcast();return}
  const form=e.target.closest('#prospectEditor,#prospectLogForm');if(!form)return;
  if(form.dataset.contactDraft==='1')saveContactDraftFromForm(form);
  if(e.target.matches('[name="outcome"]'))syncMarketFollowUpField(form);
  if(e.target.matches('[data-pipeline-temperature-field]'))form.dataset.temperatureManual='1';
  if(e.target.matches('[data-pipeline-motivation-field]'))form.dataset.motivationManual='1';
  if(!e.target.matches('[data-pipeline-timeframe-field]'))return;
  const choice=cleanText(e.target.value,40),timeframe=choice==='Not currently selling'?'':SELLING_TIMEFRAMES.includes(choice)?choice:(activeProspectId?prospectById(activeProspectId)?.sellingTimeframe||'':'');
  const defaults=pipelineDefaultsForTimeframe(timeframe),temperature=form.querySelector('[data-pipeline-temperature-field]'),motivation=form.querySelector('[data-pipeline-motivation-field]');
  if(temperature&&form.dataset.temperatureManual!=='1')temperature.value=defaults.temperature;
  if(motivation&&form.dataset.motivationManual!=='1')motivation.value=String(defaults.motivation);
  if(form.dataset.contactDraft==='1')saveContactDraftFromForm(form);
});
$('#prospectingView').addEventListener('keydown',e=>{if(e.key!=='Enter')return;if(e.target.matches('[data-buyer-existing-search]')){e.preventDefault();e.target.closest('#buyerEditor')?.querySelector('[data-use-contact-as-buyer]')?.click();return}if(e.target.matches('[data-buyer-suburb-input]')){e.preventDefault();const form=e.target.closest('#buyerEditor'),first=form?.querySelector('[data-select-buyer-suburb]');addBuyerSuburb(form,first?.dataset.selectBuyerSuburb||'')}});
$('#prospectingView').onsubmit=async e=>{
  if(e.target.id==='buyerEditor'){
    e.preventDefault();const form=e.target,submit=form.querySelector('button[type=submit]'),editingBuyerId=activeProspectId||'',wasExisting=Boolean(editingBuyerId),editorContext=pendingBuyerEditorContext;if(submit?.disabled)return;if(submit){submit.disabled=true;submit.textContent='Saving…'}
    const f=new FormData(form),maxValue=Math.max(0,Number(f.get('buyerBudgetMax'))||0),propertyType=form.querySelector('[data-buyer-property-type].active')?.dataset.buyerPropertyType||'',features=[...form.querySelectorAll('[data-buyer-feature].active')].map(button=>button.dataset.buyerFeature),positionTags=[...form.querySelectorAll('[data-buyer-position-tag].active')].map(button=>button.dataset.buyerPositionTag).filter(tag=>BUYER_POSITION_TAGS.includes(tag));
    try{const result=await upsertBuyer({name:f.get('name'),phone:f.get('phone'),address:f.get('address'),buyerBudgetMin:0,buyerBudgetMax:maxValue,buyerBedrooms:Number(f.get('buyerBedrooms'))||0,buyerBathrooms:Number(f.get('buyerBathrooms'))||0,buyerCars:Number(f.get('buyerCars'))||0,buyerSuburbs:form._buyerSuburbs||[],buyerPropertyType:propertyType,buyerFeatures:features,buyerPositionTags:positionTags,buyerSeller:positionTags.includes('Buyer Seller'),sellingTimeframe:f.get('sellerTimeframe'),buyerStage:f.get('buyerStage'),temperature:f.get('temperature'),notes:f.get('notes'),source:wasExisting?prospectById(editingBuyerId)?.source||'Buyer':'Buyer'},editingBuyerId,editorContext);toast(result.unified?'Buyer and seller records unified':result.addedBuyerRole?'Buyer brief linked to existing contact':result.reusedExisting&&!wasExisting?'Existing contact reused · no duplicate created':wasExisting?'Buyer saved':'Buyer added');if(prospectingFormContextIsCurrent(form)){if(result.returnToBuyerSession){activeProspectId=null;setProspectorSection('today',{todayMode:'dashboard'});renderProspecting();showBuyerSession()}else{activeProspectId=result.record.id;setProspectorSection('buyers',{resetSubview:false});renderBuyerDetail(result.record.id)}}else discardSavedContactEditor(form)}
    catch(err){console.error('Buyer save failed',err);toast('Buyer saved locally. Please check sync.');if(submit){submit.disabled=false;submit.textContent=wasExisting?'Save buyer':'Add buyer'}}
    return
  }
  if(e.target.id==='buyerFollowUpForm'){e.preventDefault();const form=e.target,submit=form.querySelector('button[type=submit]'),f=new FormData(form),id=form.dataset.buyerId;if(submit?.disabled)return;if(submit){submit.disabled=true;submit.textContent='Saving…'}try{await scheduleBuyerFollowUp(id,f.get('followUpDate'),f.get('followUpNote'))}catch(err){console.error('Buyer follow-up save failed',err);toast('Follow-up saved locally. Please check sync.');if(submit){submit.disabled=false;submit.textContent='Add Follow Up'}}return}
  if(e.target.id==='buyerPurchaseForm'){e.preventDefault();const f=new FormData(e.target),submit=e.target.querySelector('button[type=submit]');if(submit){submit.disabled=true;submit.textContent='Converting…'}try{await convertBuyerToOwner(activeProspectId,{address:f.get('buyerPurchaseAddress'),price:f.get('buyerPurchasePrice'),date:f.get('buyerPurchaseDate')})}catch(err){console.error('Buyer conversion failed',err);toast('Could not convert buyer. Please try again.');if(submit){submit.disabled=false;submit.textContent='Convert to Owner'}}return}
  if(e.target.id==='prospectEditor'){
    e.preventDefault();const form=e.target,submit=form.querySelector('button[type=submit]'),editingId=activeProspectId||'',saveId=editingId||cleanText(form.dataset.contactDraftId,80),f=new FormData(form),existing=prospectById(editingId),wasExisting=Boolean(existing),addBuyerBrief=f.get('addBuyerBrief')==='1';if(submit?.disabled)return;if(submit){submit.disabled=true;submit.textContent='Saving…'}
    try{const result=await upsertProspect({name:f.get('name'),phone:f.get('phone'),email:f.get('email'),address:f.get('address'),source:f.get('source'),stage:f.get('stage'),temperature:f.get('temperature'),motivation:f.get('motivation'),temperatureManual:form.dataset.temperatureManual==='1'||Boolean(existing?.temperatureManual),motivationManual:form.dataset.motivationManual==='1'||Boolean(existing?.motivationManual),tags:f.get('tags'),sellingTimeframe:f.get('sellingTimeframe'),nextFollowUp:f.get('nextFollowUp'),notes:f.get('notes'),archived:Boolean(existing?.archived),archivedAt:existing?.archivedAt||0},saveId);clearContactDraft();const message=result.unified?'Buyer and seller records unified':result.reusedExisting&&!wasExisting?'Existing contact reused · no duplicate created':wasExisting?'Contact saved':'Contact added';if(prospectingFormContextIsCurrent(form)){activeProspectId=result.record.id;if(addBuyerBrief){openBuyerEditor(result.record.id);toast('Contact saved. Add their buyer brief.')}else{renderProspectDetail(result.record.id);toast(message)}}else{discardSavedContactEditor(form);toast(message)}}catch(err){console.error('Contact save failed',err);saveContactDraftFromForm(form);toast('Contact could not be saved. Your draft is still here.');if(submit){submit.disabled=false;submit.textContent=wasExisting?'Save Contact':'Add Contact'}}return
  }
  if(e.target.id==='prospectLogForm'){
    e.preventDefault();const form=e.target,submit=form.querySelector('button[type=submit]');if(submit?.disabled)return;if(submit){submit.disabled=true;submit.textContent='Saving…'}
    const f=new FormData(form),p=prospectById(activeProspectId),next=f.get('nextFollowUp'),outcome=cleanText(f.get('outcome'),80),fromSession=form.dataset.fromSession==='1'||(prospectSessionActive&&prospectSessionIds[prospectSessionIndex]===activeProspectId),returnMode=cleanText(form.dataset.returnMode,40),interactionId=prospectId(),temperature=cleanText(f.get('temperature'),20)||'Cold',timeframeChoice=cleanText(f.get('sellingTimeframe'),40),archiveRequested=outcome==='Archive',sellingTimeframe=timeframeChoice==='Not currently selling'?'':SELLING_TIMEFRAMES.includes(timeframeChoice)?timeframeChoice:p?.sellingTimeframe||'',temperatureManual=form.dataset.temperatureManual==='1'||Boolean(p?.temperatureManual),defaults=pipelineDefaultsForTimeframe(sellingTimeframe),motivation=p?.motivationManual?p.motivation:defaults.motivation;if(!p){toast('Contact could not be found');if(submit)submit.disabled=false;return}
    const marketFollowUp=marketFollowUpFieldsFromForm(f,outcome,fromSession);
    if(outcome==='Appointment booked'){openAppointmentBookingFromProspect({prospectId:p.id,fromSession,interactionId,temperature,sellingTimeframe,temperatureManual,motivation,nextFollowUp:validDateKey(next)?next:'',note:cleanText(f.get('note'),2000),marketEventId:fromSession?cleanText(prospectSessionContext?.eventId,160):'',marketFollowUp});return}
    if(marketFollowUp.marketPropertyKey)retireEarlierMarketFollowUps(p.id,marketFollowUp.marketPropertyKey);
    prospectInteractions.push({id:interactionId,prospectId:p.id,date:todayKey(),at:Date.now(),type:'Call',outcome,note:cleanText(f.get('note'),2000),nextFollowUp:validDateKey(next)?next:'',marketEventId:fromSession?cleanText(prospectSessionContext?.eventId,160):'',...marketFollowUp,metricsApplied:false});if(!archiveRequested&&p.sellingTimeframe!==sellingTimeframe)prospectInteractions.push({id:prospectId(),prospectId:p.id,date:todayKey(),at:Date.now()+1,type:'Pipeline',outcome:'Selling timeframe updated',note:`Selling timeframe changed from ${p.sellingTimeframe||'Not set'} to ${sellingTimeframe||'Not currently selling'}.`,nextFollowUp:''});if(archiveRequested)prospectInteractions.push({id:prospectId(),prospectId:p.id,date:todayKey(),at:Date.now()+2,type:'Archive',outcome:'Contact archived',note:'Moved from active contacts to Archived.',nextFollowUp:''});prospects=prospects.map(x=>x.id===p.id?normaliseProspect({...x,temperature:temperatureManual?temperature:defaults.temperature,motivation,temperatureManual,sellingTimeframe,lastContact:todayKey(),nextFollowUp:validDateKey(next)?next:'',archived:archiveRequested||x.archived,archivedAt:archiveRequested?Date.now():x.archivedAt,stage:outcome==='Appointment booked'?'Appointment Booked':outcome==='Appraisal opportunity'?'Appraisal Opportunity':x.stage,updatedAt:Date.now()}):x);
    const delta=prospectOutcomeMetricDelta(outcome);
    try{await applyProspectingOutcomeMetrics(outcome,interactionId,{awaitCloud:!fromSession})}catch(err){console.error('Prospector metric save failed',err);toast('Log saved. Metrics are pending sync.')}
    prospectInteractions=prospectInteractions.map(x=>x.id===interactionId?{...x,metricsApplied:true}:x);
    try{await saveProspecting({render:false,awaitCloud:!fromSession})}catch(err){console.error('Prospecting log save failed',err);toast('The log was saved locally. Please check sync.')}
    if(fromSession&&prospectSessionActive){prospectSessionStats.calls+=delta.calls;prospectSessionStats.connects+=delta.connects;if(temperature==='Warm'||temperature==='Hot')prospectSessionStats.temperate++;if(outcome==='Appointment booked')prospectSessionStats.appointments++;prospectSessionIndex++;saveProspectingSessionState()}if(!prospectingFormContextIsCurrent(form)){toast(archiveRequested?'Contact archived':'Contact logged');return}if(fromSession&&prospectSessionActive){activeProspectId=null;toast(archiveRequested?'Contact archived':'Contact logged');showProspectingSession()}else if(returnMode==='followups'){const followUpDetail=$('#prospectDetail');activeProspectId=null;prospectTodayMode='followups';followUpDetail?.classList.add('hidden');if(followUpDetail)followUpDetail.innerHTML='';$('#prospectingDashboard')?.classList.remove('hidden');renderProspecting();toast(archiveRequested?'Contact archived':'Follow-up resolved')}else if(archiveRequested){prospectContactsMode='active';toast('Contact archived');closeProspectDetail()}else{toast('Contact logged');renderProspectDetail(p.id)}return}
};

$('#openDayReview')&&($('#openDayReview').onclick=()=>showDayReview());
$('#closeDayReview')&&($('#closeDayReview').onclick=closeDayReview);
$('#dayReviewOverlay')&&($('#dayReviewOverlay').onclick=e=>{if(e.target.id==='dayReviewOverlay')closeDayReview()});
$$('[name=appearancePreference]').forEach(el=>el.addEventListener('change',()=>{if(el.checked)applyAppearance(el.value)}));
$('#saveSettings').onclick=async()=>{const selectedWorkDays=normaliseWorkDays($$('[name=workDay]:checked').map(el=>Number(el.value)));if(!selectedWorkDays.length)return toast('Choose at least one tracking day');agentName=$('#agentName').value.trim()||displayAgentName();targets={calls:+$('#callsTarget').value||50,connects:+$('#connectsTarget').value||25,data:+$('#dataTarget').value||10,weeklyKnock:+$('#weeklyKnockTarget').value||240};workDays=selectedWorkDays;calendarPreference=$('[name=calendarPreference]:checked')?.value==='apple'?'apple':'outlook';appearancePreference=normaliseAppearance($('[name=appearancePreference]:checked')?.value);applyAppearance(appearancePreference);saveLocal();await saveTargets();if(cloud&&accountMode==='team'&&teamId&&uid){try{await setDoc(doc(db,'teams',teamId,'members',uid),{name:agentName,updatedAt:serverTimestamp()},{merge:true})}catch(err){console.error('Team profile name sync failed',err)}}renderAll();toast('Settings saved')};
$('#signOut').onclick=async()=>{clearActiveSession();if(auth?.currentUser)await firebaseSignOut(auth);location.reload()};
$('#exportData').onclick=()=>{const blob=new Blob([JSON.stringify({targets,workDays,days},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`daily-accountability-${todayKey()}.json`;a.click();URL.revokeObjectURL(a.href)};
$('#importData').onchange=async e=>{try{const raw=JSON.parse(await e.target.files[0].text());targets={...DEFAULTS,...raw.targets};if(Array.isArray(raw.workDays)&&raw.workDays.length)workDays=normaliseWorkDays(raw.workDays);days={...days,...raw.days};saveLocal();if(cloud){await saveTargets();for(const k of Object.keys(raw.days||{}))await saveDay(k,{quiet:true})}renderAll();toast('Backup imported')}catch{toast('Backup could not be read')}};
$('#openCalendarFromInsights')&&($('#openCalendarFromInsights').onclick=openCalendar);$('#closeCalendar').onclick=()=>$('#calendarModal').classList.remove('open');$('#calendarPrev').onclick=()=>{year--;renderCalendar();renderInsights()};$('#calendarNext').onclick=()=>{year++;renderCalendar();renderInsights()};$('#prevYear')&&($('#prevYear').onclick=()=>{year--;renderCalendar();renderInsights()});$('#nextYear')&&($('#nextYear').onclick=()=>{year++;renderCalendar();renderInsights()});
$('#calendarGrid').onclick=e=>{const b=e.target.closest('[data-date]');if(!b)return;selectedDate=b.dataset.date;appointmentDate=selectedDate;$('#appointmentDatePicker').value=appointmentDate;$('#calendarModal').classList.remove('open');switchView('todayView');renderAll();ensureTick()};
$('#yearHeatmap')&&($('#yearHeatmap').onclick=e=>{const b=e.target.closest('[data-date]');if(!b)return;selectedDate=b.dataset.date;appointmentDate=selectedDate;$('#appointmentDatePicker').value=appointmentDate;switchView('todayView');renderAll();ensureTick()});
$('#prevMonth')&&($('#prevMonth').onclick=()=>{monthCursor.setMonth(monthCursor.getMonth()-1);renderMonth()});$('#nextMonth')&&($('#nextMonth').onclick=()=>{monthCursor.setMonth(monthCursor.getMonth()+1);renderMonth()});
function closeSyncPopover(){const p=$('#syncPopover'),b=$('#syncBadge');p?.classList.add('hidden');b?.setAttribute('aria-expanded','false');document.body.classList.remove('sync-popover-open')}
$('#syncBadge').onclick=e=>{e.stopPropagation();const p=$('#syncPopover'),opening=p.classList.contains('hidden');if(p&&p.parentElement!==document.body)document.body.append(p);p.classList.toggle('hidden',!opening);$('#syncBadge').setAttribute('aria-expanded',String(opening));document.body.classList.toggle('sync-popover-open',opening)};
$('#syncPopover').onclick=e=>e.stopPropagation();
document.addEventListener('click',closeSyncPopover);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSyncPopover()});
window.addEventListener('online',()=>{renderBuyerSessionHero();if(cloud){clearSyncError();setSync('','Connecting');renderLeaderboardStatus();renderTeamSettings();renderTeamManager();scheduleLeaderboardPublish();for(const k of [...dirtyDayKeys]){const clean=dayData(k);if(clean.clientUpdatedAt)persistDayToCloud(k,clean,{quiet:true}).catch(()=>{})}}});window.addEventListener('offline',()=>{refreshSyncStatus();renderLeaderboardStatus();renderTeamSettings();renderTeamManager();renderBuyerSessionHero()});
window.addEventListener('error',event=>console.error('Unhandled app error',event.error||event.message));
window.addEventListener('unhandledrejection',event=>console.error('Unhandled promise rejection',event.reason));
renderProspecting();
if('serviceWorker'in navigator)window.addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('./service-worker.js');await reg.update()}catch(err){console.warn('Offline cache registration failed',err)}});
setInterval(()=>{const currentDay=todayKey();if(currentDay!==maintenanceDayKey){maintenanceDayKey=currentDay;finaliseExpiredTimers().then(()=>renderAll()).catch(err=>console.error('Daily maintenance failed',err))}if(selectedDate===currentDay){renderNowCard();if($('#scheduleView')?.classList.contains('active'))renderTimeline()}maybeShowDayReview();updateAppViewport();if(cloud)scheduleLeaderboardPublish()},30000);
init().catch(err=>{console.error('AGNT initialisation failed',err);$('#bootGate')?.classList.add('hidden');setAuthScreenActive(true);$('#authGate')?.classList.remove('hidden');showAuthMessage('AGNT could not finish loading. Please try again.')});

loadBuyerSession();
