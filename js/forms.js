/* === FORMS STUBS, UTILITIES & INIT === */

/* Admin form/delete stubs — real implementations loaded via admin.js */
function openForm(idx){loadAdminModule().then(function(){openForm(idx)}).catch(function(){showToast('Failed to load admin module','error')})}
function openDelete(idx){loadAdminModule().then(function(){openDelete(idx)}).catch(function(){showToast('Failed to load admin module','error')})}

function sanitize(s){return(s||'').replace(/<[^>]+>/g,'').trim()}

/* Init */
function removeSkeletons(){const ids=['homeSkeleton','rosterSkeleton','girlsSkeleton','calSkeleton','rosterFilterSkeleton','girlsFilterSkeleton','favoritesSkeleton','valueTableSkeleton'];ids.forEach(id=>{const el=document.getElementById(id);if(el){el.classList.add('fade-out');setTimeout(()=>el.remove(),400)}})}

/* === Enquiry Form === */
let _eqDuration=45;
let _eqGirlName='';
let _eqLastSubmit=0;
const EQ_THROTTLE=30000;

function openEnquiryForm(girlName,girlIdx){
  _eqGirlName=girlName;
  const overlay=document.getElementById('enquiryOverlay');
  document.getElementById('enquiryGirlName').textContent=girlName;
  const _cf=document.getElementById('eqContactFields');
  if(loggedIn&&loggedInUser){document.getElementById('eqName').value=loggedInUser;document.getElementById('eqEmail').value=loggedInEmail||'';document.getElementById('eqPhone').value=loggedInMobile||'';if(_cf)_cf.style.display='none'}
  else{document.getElementById('eqName').value='';document.getElementById('eqEmail').value='';document.getElementById('eqPhone').value='';if(_cf)_cf.style.display=''}
  const today=fmtDate(getAEDTDate());
  document.getElementById('eqDate').value='';document.getElementById('eqTime').value='';
  document.getElementById('eqMessage').value='';document.getElementById('eqError').textContent='';document.getElementById('eqWebsite').value='';
  _eqDuration=60;document.querySelectorAll('.enquiry-dur-btn').forEach(btn=>{btn.classList.toggle('active',parseInt(btn.dataset.dur)===_eqDuration)});
  document.getElementById('eqDate').min=today;
  overlay.classList.add('open');applyLang()
}

document.getElementById('eqDurationOptions').onclick=e=>{const btn=e.target.closest('.enquiry-dur-btn');if(!btn)return;_eqDuration=parseInt(btn.dataset.dur);document.querySelectorAll('.enquiry-dur-btn').forEach(b=>{b.classList.toggle('active',parseInt(b.dataset.dur)===_eqDuration)})};
document.getElementById('enquiryClose').onclick=()=>document.getElementById('enquiryOverlay').classList.remove('open');
document.getElementById('enquiryCancel').onclick=()=>document.getElementById('enquiryOverlay').classList.remove('open');
document.getElementById('enquiryOverlay').onclick=e=>{if(e.target===document.getElementById('enquiryOverlay'))e.target.classList.remove('open')};

document.getElementById('enquirySubmit').onclick=async()=>{
  const errEl=document.getElementById('eqError');errEl.textContent='';
  if(document.getElementById('eqWebsite').value)return;
  if(Date.now()-_eqLastSubmit<EQ_THROTTLE){errEl.textContent=t('enquiry.throttle');return}
  const name=sanitize(document.getElementById('eqName').value);
  const phone=document.getElementById('eqPhone').value.trim();
  const email=document.getElementById('eqEmail').value.trim();
  const date=document.getElementById('eqDate').value;
  const time=document.getElementById('eqTime').value;
  const message=sanitize(document.getElementById('eqMessage').value);
  if(!loggedIn&&!name){document.getElementById('eqName').focus();errEl.textContent=t('enquiry.nameRequired');return}
  if(!loggedIn&&!phone&&!email){errEl.textContent=t('enquiry.contactRequired');return}
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){errEl.textContent=t('enquiry.emailInvalid');return}
  const submitBtn=document.getElementById('enquirySubmit');submitBtn.textContent=t('enquiry.sending');submitBtn.style.pointerEvents='none';
  try{
    const payload={girlName:_eqGirlName,customerName:name,phone,email,date,time,duration:_eqDuration,message,lang:siteLanguage,ts:new Date().toISOString(),username:loggedInUser||null};
    const r=await fetchWithRetry(PROXY+'/submit-enquiry',{method:'POST',headers:proxyHeaders(),body:JSON.stringify(payload)},{retries:1});
    if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.error||'Server error')}
    _eqLastSubmit=Date.now();document.getElementById('enquiryOverlay').classList.remove('open');showToast(t('enquiry.success'))
  }catch(e){errEl.textContent=t('enquiry.failed')}
  finally{submitBtn.textContent=t('enquiry.submit');submitBtn.style.pointerEvents='auto'}
};

function normalizeCalData(cal){if(!cal)return{};for(const n in cal)for(const dt in cal[n])if(cal[n][dt]===true)cal[n][dt]={start:'',end:''};return cal}

function fullRender(){rosterDateFilter=fmtDate(getAEDTDate());renderFilters();renderGrid();renderRoster();renderHome();updateFavBadge()}

/* === Adaptive Polling Engine === */
function getActivePageId(){const ap=document.querySelector('.page.active');return ap?ap.id:null}

function getPollInterval(){
  if(!_isTabVisible)return POLL_SLOW;
  const page=getActivePageId();
  if(page==='rosterPage'||page==='profilePage')return POLL_FAST;
  return POLL_NORMAL;
}

function renderActivePage(){
  try{
    const id=getActivePageId();if(!id)return;
    if(id==='rosterPage')renderRoster();
    else if(id==='listPage')renderGrid();
    else if(id==='favoritesPage')renderFavoritesGrid();
    else if(id==='homePage')renderHome();
    else if(id==='profilePage'&&currentProfileIdx>=0)showProfile(currentProfileIdx);
  }catch(e){/* silent */}
}

async function pollTick(){
  const changed=await refreshCalendar();
  if(changed){
    renderActivePage();
    const indicator=document.getElementById('rosterLastUpdated');
    if(indicator){indicator.classList.remove('updated-pulse');void indicator.offsetWidth;indicator.classList.add('updated-pulse')}
  }else{
    renderActivePage();
  }
  updateLastUpdatedDisplay();
}

function startAdaptivePolling(){
  if(_pollInterval)clearInterval(_pollInterval);
  const interval=getPollInterval();
  _pollInterval=setInterval(pollTick,interval);
}

function startCountdownTick(){
  if(_countdownTickInterval)clearInterval(_countdownTickInterval);
  _countdownTickInterval=setInterval(()=>{
    const el=document.getElementById('profCountdown');if(el){
      const g=girls[currentProfileIdx];if(g&&g.name){
        const c=getAvailCountdown(g.name);
        if(c){el.textContent=t(c.type==='ends'?'avail.endsIn':'avail.startsIn').replace('{t}',c.str)}
        else{el.textContent=''}
      }
    }
    /* Update available-now widget countdowns on homepage */
    if(document.getElementById('homePage')&&document.getElementById('homePage').classList.contains('active')){
      document.querySelectorAll('.anw-countdown').forEach(cd=>{const card=cd.closest('.avail-now-card');if(!card)return;const idx=parseInt(card.dataset.idx);const g=girls[idx];if(!g)return;const c=getAvailCountdown(g.name);cd.textContent=c&&c.type==='until_end'?c.display:''})
    }
  },POLL_COUNTDOWN);
}

function updateLastUpdatedDisplay(){
  const el=document.getElementById('rosterLastUpdatedTime');
  if(el&&_lastCalFetchDisplay)el.textContent=_lastCalFetchDisplay;
}

startAdaptivePolling();

/* After data loads, resolve the current URL to show the right page */
function fullRenderAndRoute(){
if(typeof queryToFilters==='function')queryToFilters();
fullRender();
/* If URL is not root, resolve it (e.g. /girls/Akemi, /roster, etc.) */
if(window.location.pathname!=='/'){
Router.resolve();
}else{
/* On home — just set the initial history state */
history.replaceState({path:'/'},'Ginza Empire','/');
}
}

async function initApp(){
try{
await loadConfig();
if(typeof initOfflineDetection==='function')initOfflineDetection();

/* Phase 1: Instant render from cache */
const cachedGirls=getCachedGirls();
const cachedCal=getCachedCal();
let renderedFromCache=false;
let _calWasStale=false;

if(cachedGirls&&cachedGirls.length){
girls=cachedGirls;
/* Skip stale cal: show empty availability rather than mislead returning visitors */
const calFresh=!isCalCacheStale();
calData=(calFresh&&cachedCal)?normalizeCalData(cachedCal):{};
_calWasStale=!calFresh;
fullRenderAndRoute();
removeSkeletons();
renderedFromCache=true;
}

/* Phase 2: Fetch fresh data in background */
const[authData,freshData,freshCal]=await Promise.all([loadAuth(),loadData(),loadCalData(),loadRosterHistory()]);

if(authData&&authData.length)CRED=authData;else{CRED=[];showToast('Could not load auth','error')}

/* Compare and update girls if changed */
let girlsChanged=false;
if(freshData!==null){
const cachedSha=getCachedGirlsSha();
if(!renderedFromCache||cachedSha!==dataSha){
girls=freshData;
girlsChanged=true;
updateGirlsCache();
}
}else if(!renderedFromCache){
/* No cache AND network failed — show error state with retry */
const msg=typeof t==='function'?t('ui.loadFailed'):'Unable to load data. Please check your connection and try again.';
showErrorState('rosterGrid',msg,initApp);
showErrorState('girlsGrid',msg,initApp);
showErrorState('homeImages',msg,initApp);
removeSkeletons();
return;
}

/* Compare and update calendar if changed */
let calChanged=false;
if(freshCal){
const cachedCalSha=getCachedCalSha();
const normalizedCal=normalizeCalData(freshCal);
/* Also force update if phase 1 used empty calData due to stale cache */
if(!renderedFromCache||cachedCalSha!==calSha||_calWasStale){
calData=normalizedCal;
calChanged=true;
updateCalCache();
}
}

/* Phase 3: Re-render only if data actually changed */
if(!renderedFromCache){
fullRenderAndRoute();
removeSkeletons();
}else if(girlsChanged||calChanged){
fullRender();
if(document.getElementById('profilePage').classList.contains('active'))showProfile(currentProfileIdx);
}

/* Apply saved language preference */
if(typeof applyLang==='function'){try{applyLang()}catch(e){}}

}catch(e){
console.error('Init error:',e);
removeSkeletons();
const msg=typeof t==='function'?t('ui.loadFailed'):'Unable to load data. Please check your connection and try again.';
showErrorState('rosterGrid',msg,initApp);
showErrorState('girlsGrid',msg,initApp);
showErrorState('homeImages',msg,initApp);
}
}
initApp();