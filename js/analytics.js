/* === ANALYTICS — GITHUB VISITOR LOGS === */

/*
 * GitHub Visitor Logs: append-only daily JSON files in data/logs/ on the DATA_REPO.
 * Each visitor session logs: initial visit info + every page view + every profile view.
 * Captures: anonymous UUID, user-agent, language, timezone, page path, timestamp.
 */

/* ══════════════════════════════════════════════════
   GITHUB VISITOR LOGS (append-only daily JSON files)
   ══════════════════════════════════════════════════ */

const VisitorLog=(function(){

const UUID_KEY='ginza_visitor_uuid';
const OPTOUT_KEY='ginza_analytics_optout';
const LOG_DIR='data/logs';

/* ── In-memory queue of entries to flush to GitHub ── */
let _queue=[];
let _flushTimer=null;
let _flushing=false;
let _flushPromise=null;
const DEBOUNCE_MS=2000; /* flush 2s after last enqueue — batches rapid navigations */

/* Generate or retrieve persistent anonymous UUID */
function getUUID(){
  try{
    let id=localStorage.getItem(UUID_KEY);
    if(!id){
      id='v_'+Date.now().toString(36)+'_'+Math.random().toString(36).substr(2,8);
      localStorage.setItem(UUID_KEY,id);
    }
    return id;
  }catch(e){
    return 'v_anon_'+Math.random().toString(36).substr(2,8);
  }
}

/* Opt-out: user can stop all tracking and clear stored identifiers */
function isOptedOut(){try{return localStorage.getItem(OPTOUT_KEY)==='1'}catch(e){return false}}
function optOut(){try{localStorage.setItem(OPTOUT_KEY,'1');localStorage.removeItem(UUID_KEY);localStorage.removeItem('ginza_log_pending');_queue=[]}catch(e){}}
function optIn(){try{localStorage.removeItem(OPTOUT_KEY)}catch(e){}}

/* Parse UA once for the session */
function _parseUA(){
  const ua=navigator.userAgent||'';
  let device='Desktop',browser='Unknown',os='Unknown';
  if(/Windows/i.test(ua))os='Windows';
  else if(/Macintosh|Mac OS/i.test(ua))os='macOS';
  else if(/Android/i.test(ua)){os='Android';device='Mobile'}
  else if(/iPhone/i.test(ua)){os='iOS';device='Mobile'}
  else if(/iPad/i.test(ua)){os='iOS';device='Tablet'}
  else if(/Linux/i.test(ua))os='Linux';
  else if(/CrOS/i.test(ua))os='ChromeOS';
  if(/Edg\//i.test(ua))browser='Edge';
  else if(/OPR\//i.test(ua)||/Opera/i.test(ua))browser='Opera';
  else if(/SamsungBrowser/i.test(ua))browser='Samsung';
  else if(/Chrome/i.test(ua))browser='Chrome';
  else if(/Safari/i.test(ua)&&!/Chrome/i.test(ua))browser='Safari';
  else if(/Firefox/i.test(ua))browser='Firefox';
  return{ua,browser,os,device};
}

const _uaInfo=_parseUA();
const _sessionUUID=getUUID();

/* ── Create log entries ── */

/* Session entry — logged once on page load */
function _makeSessionEntry(){
  return{
    type:'session',
    uuid:_sessionUUID,
    timestamp:new Date().toISOString(),
    userAgent:_uaInfo.ua,
    browser:_uaInfo.browser,
    os:_uaInfo.os,
    device:_uaInfo.device,
    language:navigator.language||navigator.userLanguage||'unknown',
    timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'unknown',
    tzOffset:new Date().getTimezoneOffset(),
    page:window.location.pathname+window.location.search,
    referrer:document.referrer||'direct',
    screen:window.screen?window.screen.width+'x'+window.screen.height:'unknown',
    viewport:window.innerWidth+'x'+window.innerHeight
  };
}

/* Page view entry — logged on every page navigation */
function _makePageViewEntry(pageId){
  return{
    type:'pageView',
    uuid:_sessionUUID,
    timestamp:new Date().toISOString(),
    page:pageId
  };
}

/* Profile view entry — logged on every profile open */
function _makeProfileViewEntry(profileName){
  return{
    type:'profileView',
    uuid:_sessionUUID,
    timestamp:new Date().toISOString(),
    profile:profileName
  };
}

/* ── Queue management ── */

function enqueue(entry){
  _queue.push(entry);
  /* Debounce: reset timer on each enqueue, flush after DEBOUNCE_MS of quiet */
  clearTimeout(_flushTimer);
  _flushTimer=setTimeout(()=>flush(),DEBOUNCE_MS);
}

/* Track a page view (called from hooks) */
function trackPageView(pageId){
  if(!pageId||isOptedOut())return;
  enqueue(_makePageViewEntry(pageId));
}

/* Track a profile view (called from hooks) */
function trackProfileView(profileName){
  if(!profileName||isOptedOut())return;
  enqueue(_makeProfileViewEntry(profileName));
}

/* Get today's log filename in AEDT */
function _logFileName(){
  const d=new Date(new Date().toLocaleString('en-US',{timeZone:'Australia/Sydney'}));
  const ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  return `${LOG_DIR}/${ds}.json`;
}

/* Flush queued entries to GitHub */
async function flush(){
  if(_queue.length===0)return;
  /* If already flushing, wait for it then retry */
  if(_flushing){
    if(_flushPromise)await _flushPromise;
    if(_queue.length>0)return flush();
    return;
  }
  _flushing=true;

  /* Grab current queue and reset */
  const entries=[..._queue];
  _queue=[];

  const filePath=_logFileName();

  _flushPromise=(async()=>{
  try{
    /* Read existing log file */
    let existing=[];
    let sha=null;

    const getR=await fetchWithRetry(`${DATA_API}/${filePath}`,{headers:proxyHeaders()},{retries:1,baseDelay:500});
    if(getR.ok){
      const data=await getR.json();
      sha=data.sha;
      try{existing=JSON.parse(decodeURIComponent(escape(atob(data.content.replace(/\n/g,'')))));}
      catch(e){existing=[];}
    }

    /* Append all queued entries */
    existing.push(...entries);

    /* Write back */
    const body={
      message:'Log '+entries.length+' entries',
      content:btoa(unescape(encodeURIComponent(JSON.stringify(existing,null,2))))
    };
    if(sha)body.sha=sha;

    const putR=await fetchWithRetry(`${DATA_API}/${filePath}`,{
      method:'PUT',
      headers:proxyHeaders(),
      body:JSON.stringify(body)
    },{retries:1,baseDelay:500});

    if(!putR.ok){
      /* Put entries back in queue for next attempt */
      _queue.unshift(...entries);
      console.warn('Visitor log write failed:',putR.status);
    }

  }catch(e){
    /* Put entries back in queue for next attempt */
    _queue.unshift(...entries);
    console.warn('Visitor log flush failed:',e.message);
  }finally{
    _flushing=false;
    _flushPromise=null;
  }
  })();
  return _flushPromise;
}

/* Flush on page unload (best-effort) */
function _flushOnUnload(){
  if(_queue.length===0)return;
  const entries=[..._queue];
  _queue=[];
  /* Use sendBeacon for reliable delivery on unload */
  try{
    const filePath=_logFileName();
    /* sendBeacon can't do read-then-write, so we store pending entries
       in localStorage and flush them on next visit */
    const PENDING_KEY='ginza_log_pending';
    let pending=[];
    try{const raw=localStorage.getItem(PENDING_KEY);if(raw)pending=JSON.parse(raw);}catch(e){}
    pending.push(...entries);
    localStorage.setItem(PENDING_KEY,JSON.stringify(pending));
  }catch(e){/* silent */}
}

/* Flush any pending entries from a previous session that didn't complete */
async function _flushPending(){
  const PENDING_KEY='ginza_log_pending';
  try{
    const raw=localStorage.getItem(PENDING_KEY);
    if(!raw)return;
    const pending=JSON.parse(raw);
    if(!pending.length)return;
    localStorage.removeItem(PENDING_KEY);
    _queue.unshift(...pending);
    await flush();
  }catch(e){/* silent */}
}

/* Load log files for a date range from GitHub */
async function loadLogs(startDate,endDate){
  const logs=[];
  try{
    const r=await fetchWithRetry(`${DATA_API}/${LOG_DIR}`,{headers:proxyHeaders()},{retries:1,baseDelay:500});
    if(!r.ok)return logs;
    const files=await r.json();
    if(!Array.isArray(files))return logs;

    const filesToFetch=files.filter(f=>{
      const m=f.name.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
      if(!m)return false;
      const dt=m[1];
      return dt>=startDate&&dt<=endDate;
    });

    const batches=[];
    for(let i=0;i<filesToFetch.length;i+=10){
      batches.push(filesToFetch.slice(i,i+10));
    }

    for(const batch of batches){
      const results=await Promise.all(batch.map(async f=>{
        try{
          const fr=await fetchWithRetry(`${DATA_API}/${LOG_DIR}/${f.name}`,{headers:proxyHeaders()},{retries:1,baseDelay:300});
          if(!fr.ok)return[];
          const data=await fr.json();
          return JSON.parse(decodeURIComponent(escape(atob(data.content.replace(/\n/g,'')))));
        }catch(e){return[]}
      }));
      results.forEach(entries=>logs.push(...entries));
    }
  }catch(e){
    console.warn('Failed to load visitor logs:',e.message);
  }
  return logs;
}

/* ══════════════════════════════════════
   AGGREGATION
   ══════════════════════════════════════ */

function aggregateLogs(entries){
  const uuids=new Set();
  const browsers={};
  const browsersUniques={}; /* browser -> Set of uuids */
  const oses={};
  const osesUniques={};
  const devices={};
  const devicesUniques={};
  const languages={};
  const languagesUniques={};
  const timezones={};
  const timezonesUniques={};
  const referrers={};
  const referrersUniques={};
  const screens={};
  const hourly={};
  const daily={};
  const dailyUniques={};

  /* Page views: total count + unique UUIDs per page */
  const pageViewsTotal={};
  const pageViewsUniques={}; /* page -> Set of uuids */

  /* Profile views: total count + unique UUIDs per profile */
  const profileViewsTotal={};
  const profileViewsUniques={}; /* profile -> Set of uuids */

  let totalHits=0;
  let totalPageViews=0;
  let totalProfileViews=0;

  for(let h=0;h<24;h++)hourly[String(h).padStart(2,'0')]=0;

  entries.forEach(e=>{
    const uuid=e.uuid||'unknown';

    /* ── Session entries (initial visit) ── */
    if(e.type==='session'||!e.type){
      totalHits++;
      uuids.add(uuid);

      const br=e.browser||_parseUABrowser(e.userAgent);
      browsers[br]=(browsers[br]||0)+1;
      if(!browsersUniques[br])browsersUniques[br]=new Set();
      browsersUniques[br].add(uuid);

      const os=e.os||_parseUAOS(e.userAgent);
      oses[os]=(oses[os]||0)+1;
      if(!osesUniques[os])osesUniques[os]=new Set();
      osesUniques[os].add(uuid);

      const dev=e.device||'Unknown';
      devices[dev]=(devices[dev]||0)+1;
      if(!devicesUniques[dev])devicesUniques[dev]=new Set();
      devicesUniques[dev].add(uuid);

      const lang=(e.language||'unknown').split('-')[0];
      languages[lang]=(languages[lang]||0)+1;
      if(!languagesUniques[lang])languagesUniques[lang]=new Set();
      languagesUniques[lang].add(uuid);

      const tz=e.timezone||'unknown';
      timezones[tz]=(timezones[tz]||0)+1;
      if(!timezonesUniques[tz])timezonesUniques[tz]=new Set();
      timezonesUniques[tz].add(uuid);

      let ref='direct';
      if(e.referrer&&e.referrer!=='direct'){
        try{ref=new URL(e.referrer).hostname}catch(_){ref=e.referrer}
      }
      referrers[ref]=(referrers[ref]||0)+1;
      if(!referrersUniques[ref])referrersUniques[ref]=new Set();
      referrersUniques[ref].add(uuid);

      if(e.screen&&e.screen!=='unknown'){
        screens[e.screen]=(screens[e.screen]||0)+1;
      }

      /* Also count the initial page as a page view */
      if(e.page){
        const pg=e.page;
        pageViewsTotal[pg]=(pageViewsTotal[pg]||0)+1;
        if(!pageViewsUniques[pg])pageViewsUniques[pg]=new Set();
        pageViewsUniques[pg].add(uuid);
        totalPageViews++;
      }
    }

    /* ── Page view entries ── */
    if(e.type==='pageView'){
      const pg=e.page||'unknown';
      pageViewsTotal[pg]=(pageViewsTotal[pg]||0)+1;
      if(!pageViewsUniques[pg])pageViewsUniques[pg]=new Set();
      pageViewsUniques[pg].add(uuid);
      totalPageViews++;
      /* Also count this UUID as a visitor if not already seen */
      uuids.add(uuid);
    }

    /* ── Profile view entries ── */
    if(e.type==='profileView'){
      const pf=e.profile||'unknown';
      profileViewsTotal[pf]=(profileViewsTotal[pf]||0)+1;
      if(!profileViewsUniques[pf])profileViewsUniques[pf]=new Set();
      profileViewsUniques[pf].add(uuid);
      totalProfileViews++;
      uuids.add(uuid);
    }

    /* Hourly (use AEDT) — for all entry types */
    if(e.timestamp){
      try{
        const dt=new Date(e.timestamp);
        const aedtStr=dt.toLocaleString('en-US',{timeZone:'Australia/Sydney',hour:'2-digit',hour12:false});
        const hr=String(parseInt(aedtStr)).padStart(2,'0');
        hourly[hr]=(hourly[hr]||0)+1;
      }catch(_){}
    }

    /* Daily — for all entry types */
    if(e.timestamp){
      try{
        const dt=new Date(e.timestamp);
        const aedtDate=new Date(dt.toLocaleString('en-US',{timeZone:'Australia/Sydney'}));
        const ds=aedtDate.getFullYear()+'-'+String(aedtDate.getMonth()+1).padStart(2,'0')+'-'+String(aedtDate.getDate()).padStart(2,'0');
        daily[ds]=(daily[ds]||0)+1;
        if(!dailyUniques[ds])dailyUniques[ds]=new Set();
        dailyUniques[ds].add(uuid);
      }catch(_){}
    }
  });

  /* Convert Sets to counts */
  const dailyUniqueCounts={};
  for(const d in dailyUniques)dailyUniqueCounts[d]=dailyUniques[d].size;

  const pageViewsUniqueCounts={};
  for(const p in pageViewsUniques)pageViewsUniqueCounts[p]=pageViewsUniques[p].size;

  const profileViewsUniqueCounts={};
  for(const p in profileViewsUniques)profileViewsUniqueCounts[p]=profileViewsUniques[p].size;

  const browsersUniqueCounts={};
  for(const k in browsersUniques)browsersUniqueCounts[k]=browsersUniques[k].size;
  const osesUniqueCounts={};
  for(const k in osesUniques)osesUniqueCounts[k]=osesUniques[k].size;
  const devicesUniqueCounts={};
  for(const k in devicesUniques)devicesUniqueCounts[k]=devicesUniques[k].size;
  const languagesUniqueCounts={};
  for(const k in languagesUniques)languagesUniqueCounts[k]=languagesUniques[k].size;
  const timezonesUniqueCounts={};
  for(const k in timezonesUniques)timezonesUniqueCounts[k]=timezonesUniques[k].size;
  const referrersUniqueCounts={};
  for(const k in referrersUniques)referrersUniqueCounts[k]=referrersUniques[k].size;

  return{
    totalHits,
    totalPageViews,
    totalProfileViews,
    uniqueVisitors:uuids.size,
    browsers,oses,devices,languages,timezones,referrers,screens,
    browsersUniqueCounts,osesUniqueCounts,devicesUniqueCounts,
    languagesUniqueCounts,timezonesUniqueCounts,referrersUniqueCounts,
    hourly,daily,dailyUniqueCounts,
    pageViewsTotal,pageViewsUniqueCounts,
    profileViewsTotal,profileViewsUniqueCounts
  };
}

/* Fallback UA parsers for older log entries without parsed fields */
function _parseUABrowser(ua){
  if(!ua)return 'Unknown';
  if(/Edg\//i.test(ua))return 'Edge';
  if(/OPR\//i.test(ua))return 'Opera';
  if(/SamsungBrowser/i.test(ua))return 'Samsung';
  if(/Chrome/i.test(ua))return 'Chrome';
  if(/Safari/i.test(ua)&&!/Chrome/i.test(ua))return 'Safari';
  if(/Firefox/i.test(ua))return 'Firefox';
  return 'Other';
}
function _parseUAOS(ua){
  if(!ua)return 'Unknown';
  if(/Windows/i.test(ua))return 'Windows';
  if(/Macintosh/i.test(ua))return 'macOS';
  if(/Android/i.test(ua))return 'Android';
  if(/iPhone|iPad/i.test(ua))return 'iOS';
  if(/Linux/i.test(ua))return 'Linux';
  return 'Other';
}

/* ── Init: queue session entry on load (skip if opted out) ── */
if(!isOptedOut()){
enqueue(_makeSessionEntry());
/* Flush pending entries from previous session, then flush current queue */
_flushPending().then(()=>flush());
}

/* On page unload, stash remaining queue to localStorage for next visit */
window.addEventListener('beforeunload',()=>{
  if(_queue.length===0)return;
  _flushOnUnload();
});

/* Also try a synchronous flush attempt on visibilitychange (mobile browsers) */
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'&&_queue.length>0){
    _flushOnUnload();
  }
});

return{trackPageView,trackProfileView,flush,loadLogs,aggregateLogs,getUUID,isOptedOut,optOut,optIn};
})();


/* ══════════════════════════════════════
   ANALYTICS DASHBOARD (admin-only)
   ══════════════════════════════════════ */

let analyticsPeriod=7;
let cachedVisitorData=null;
let cachedVisitorPeriod=null;

function renderAnalytics(){
const container=document.getElementById('analyticsContent');
if(!container)return;
renderVisitorAnalytics(container);
}

function _todayStr(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}


/* ══════════════════════════════════════
   VISITOR LOGS
   ══════════════════════════════════════ */

async function renderVisitorAnalytics(container){
/* ── Period selector ── */
const periods=[{d:1,l:'Today'},{d:7,l:'7 Days'},{d:14,l:'14 Days'},{d:30,l:'30 Days'},{d:90,l:'90 Days'}];
let periodHtml='<div class="an-period">';
periods.forEach(p=>{periodHtml+=`<button class="an-period-btn${analyticsPeriod===p.d?' active':''}" data-days="${p.d}">${p.l}</button>`});
periodHtml+='</div>';

/* Show loading state first */
container.innerHTML=periodHtml+'<div class="an-loading"><div class="an-loading-spinner"></div><div class="an-loading-text">Loading visitor logs from GitHub...</div></div>';
container.querySelectorAll('.an-period-btn').forEach(btn=>{
btn.onclick=()=>{analyticsPeriod=parseInt(btn.dataset.days);cachedVisitorData=null;renderAnalytics()}
});

/* Fetch logs */
const endDate=_todayStr();
const startD=new Date(new Date().toLocaleString('en-US',{timeZone:'Australia/Sydney'}));
startD.setDate(startD.getDate()-analyticsPeriod);
const startDate=startD.getFullYear()+'-'+String(startD.getMonth()+1).padStart(2,'0')+'-'+String(startD.getDate()).padStart(2,'0');

let entries;
if(cachedVisitorData&&cachedVisitorPeriod===analyticsPeriod){
  entries=cachedVisitorData;
}else{
  entries=await VisitorLog.loadLogs(startDate,endDate);
  cachedVisitorData=entries;
  cachedVisitorPeriod=analyticsPeriod;
}

const v=VisitorLog.aggregateLogs(entries);

/* ── Summary cards ── */
const activeDays=Object.keys(v.daily).length;
const avgDaily=activeDays>0?Math.round(v.totalHits/activeDays):0;
const avgUniqueDaily=activeDays>0?Math.round(v.uniqueVisitors/activeDays):0;
const summaryHtml=`<div class="an-summary">
<div class="an-card"><div class="an-card-val">${v.uniqueVisitors}</div><div class="an-card-label">Unique Visitors</div></div>
<div class="an-card"><div class="an-card-val">${v.totalHits}</div><div class="an-card-label">Sessions</div></div>
<div class="an-card"><div class="an-card-val">${v.totalPageViews}</div><div class="an-card-label">Total Page Views</div></div>
<div class="an-card"><div class="an-card-val">${v.totalProfileViews}</div><div class="an-card-label">Total Profile Views</div></div>
</div>`;

/* ── Daily Visitors Trend (hits + uniques) ── */
const sortedDays=Object.entries(v.daily).sort((a,b)=>a[0].localeCompare(b[0]));
const maxDayVal=Math.max(...sortedDays.map(d=>d[1]),1);
let trendHtml='<div class="an-section"><div class="an-section-title">Daily Visitors <span class="an-hint">(hits vs uniques)</span></div><div class="an-trend an-trend-dual">';
sortedDays.forEach(([date,count])=>{
  const uniques=v.dailyUniqueCounts[date]||0;
  const pctH=count/maxDayVal*100;
  const pctU=uniques/maxDayVal*100;
  const dd=date.slice(5);
  trendHtml+=`<div class="an-trend-bar" title="${date}: ${count} hits, ${uniques} uniques">
    <div class="an-trend-fill" style="height:${Math.max(pctH,2)}%"></div>
    <div class="an-trend-fill an-trend-unique" style="height:${Math.max(pctU,2)}%"></div>
    <div class="an-trend-label">${dd}</div>
  </div>`;
});
if(!sortedDays.length)trendHtml+='<div class="an-empty">No visitor logs found for this period</div>';
trendHtml+='</div>';
if(sortedDays.length)trendHtml+='<div class="an-legend"><span class="an-legend-dot an-legend-hits"></span> Hits <span class="an-legend-dot an-legend-uniques"></span> Uniques</div>';
trendHtml+='</div>';

/* ── Peak Hours ── */
const maxH=Math.max(...Object.values(v.hourly),1);
let hoursHtml='<div class="an-section"><div class="an-section-title">Peak Visit Hours <span class="an-hint">(AEDT)</span></div><div class="an-hours">';
for(let h=0;h<24;h++){
  const key=String(h).padStart(2,'0');
  const val=v.hourly[key]||0;
  const pct=val/maxH;
  const h12=h===0?'12a':h<12?h+'a':h===12?'12p':(h-12)+'p';
  hoursHtml+=`<div class="an-hour" title="${h12}: ${val} visits"><div class="an-hour-bar an-hour-visitor" style="height:${Math.max(pct*100,2)}%;opacity:${0.25+pct*0.75}"></div><div class="an-hour-label">${h%3===0?h12:''}</div></div>`;
}
hoursHtml+='</div></div>';

/* ── Page Views (unique + total) ── */
const sortedPV=Object.entries(v.pageViewsTotal).sort((a,b)=>b[1]-a[1]).slice(0,15);
const maxPV=sortedPV.length?sortedPV[0][1]:1;
let pvHtml='<div class="an-section"><div class="an-section-title">Page Views <span class="an-hint">(total / unique visitors)</span></div><div class="an-bars">';
sortedPV.forEach(([page,total])=>{
  const unique=v.pageViewsUniqueCounts[page]||0;
  const pct=total/maxPV*100;
  const label=page==='/'?'Home':page.replace(/^\//,'').replace(/\//g,' › ');
  pvHtml+=`<div class="an-bar-row"><div class="an-bar-label" title="${page}">${label}</div><div class="an-bar-track"><div class="an-bar-fill" style="width:${pct}%"></div></div><div class="an-bar-val">${total} <span class="an-bar-unique">/ ${unique}</span></div></div>`;
});
if(!sortedPV.length)pvHtml+='<div class="an-empty">No page views recorded yet</div>';
pvHtml+='</div></div>';

/* ── Most Viewed Profiles (unique + total + thumbnail + availability) ── */
const sortedPF=Object.entries(v.profileViewsTotal).sort((a,b)=>b[1]-a[1]).slice(0,15);
const maxPF=sortedPF.length?sortedPF[0][1]:1;
let pfHtml='<div class="an-section"><div class="an-section-title">Most Viewed Profiles <span class="an-hint">(total / unique)</span></div><div class="an-bars">';
sortedPF.forEach(([name,total],i)=>{
  const unique=v.profileViewsUniqueCounts[name]||0;
  const pct=total/maxPF*100;
  const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
  const girl=typeof girls!=='undefined'?girls.find(g=>g&&g.name===name):null;
  const thumb=girl&&girl.photos&&girl.photos.length?`<img class="an-profile-thumb" src="${girl.photos[0]}" alt="${name.replace(/"/g,'&quot;')}">`:'<div class="an-profile-thumb an-profile-thumb-empty"></div>';
  const liveNow=girl&&typeof isAvailableNow==='function'&&isAvailableNow(girl.name);
  const availDot=liveNow?'<span class="avail-now-dot" title="Available now"></span>':'';
  pfHtml+=`<div class="an-bar-row"><div class="an-bar-label an-bar-label-profile">${thumb}<span>${medal} ${name}</span>${availDot}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-profile" style="width:${pct}%"></div></div><div class="an-bar-val">${total} <span class="an-bar-unique">/ ${unique}</span></div></div>`;
});
if(!sortedPF.length)pfHtml+='<div class="an-empty">No profile views recorded yet</div>';
pfHtml+='</div></div>';

/* ── Browsers ── */
const sortedBrowsers=Object.entries(v.browsers).sort((a,b)=>b[1]-a[1]);
const maxBr=sortedBrowsers.length?sortedBrowsers[0][1]:1;
let browsersHtml='<div class="an-section"><div class="an-section-title">Browsers <span class="an-hint">(total / unique visitors)</span></div><div class="an-bars">';
sortedBrowsers.forEach(([name,count])=>{
  const unique=v.browsersUniqueCounts[name]||0;
  const pct=count/maxBr*100;
  browsersHtml+=`<div class="an-bar-row"><div class="an-bar-label">${name}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-visitor" style="width:${pct}%"></div></div><div class="an-bar-val">${count} <span class="an-bar-unique">/ ${unique}</span></div></div>`;
});
if(!sortedBrowsers.length)browsersHtml+='<div class="an-empty">No data</div>';
browsersHtml+='</div></div>';

/* ── Operating Systems ── */
const sortedOS=Object.entries(v.oses).sort((a,b)=>b[1]-a[1]);
const maxOS=sortedOS.length?sortedOS[0][1]:1;
let osHtml='<div class="an-section"><div class="an-section-title">Operating Systems <span class="an-hint">(total / unique visitors)</span></div><div class="an-bars">';
sortedOS.forEach(([name,count])=>{
  const unique=v.osesUniqueCounts[name]||0;
  const pct=count/maxOS*100;
  osHtml+=`<div class="an-bar-row"><div class="an-bar-label">${name}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-os" style="width:${pct}%"></div></div><div class="an-bar-val">${count} <span class="an-bar-unique">/ ${unique}</span></div></div>`;
});
if(!sortedOS.length)osHtml+='<div class="an-empty">No data</div>';
osHtml+='</div></div>';

/* ── Devices ── */
const sortedDev=Object.entries(v.devices).sort((a,b)=>b[1]-a[1]);
const maxDev=sortedDev.length?sortedDev[0][1]:1;
let devHtml='<div class="an-section"><div class="an-section-title">Devices <span class="an-hint">(total / unique visitors)</span></div><div class="an-bars">';
sortedDev.forEach(([name,count])=>{
  const unique=v.devicesUniqueCounts[name]||0;
  const pct=count/maxDev*100;
  devHtml+=`<div class="an-bar-row"><div class="an-bar-label">${name}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-device" style="width:${pct}%"></div></div><div class="an-bar-val">${count} <span class="an-bar-unique">/ ${unique}</span></div></div>`;
});
if(!sortedDev.length)devHtml+='<div class="an-empty">No data</div>';
devHtml+='</div></div>';

/* ── Languages ── */
const sortedLangs=Object.entries(v.languages).sort((a,b)=>b[1]-a[1]).slice(0,10);
const maxLang=sortedLangs.length?sortedLangs[0][1]:1;
let langHtml='<div class="an-section"><div class="an-section-title">Languages <span class="an-hint">(total / unique visitors)</span></div><div class="an-bars">';
sortedLangs.forEach(([name,count])=>{
  const unique=v.languagesUniqueCounts[name]||0;
  const pct=count/maxLang*100;
  langHtml+=`<div class="an-bar-row"><div class="an-bar-label">${name}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-lang" style="width:${pct}%"></div></div><div class="an-bar-val">${count} <span class="an-bar-unique">/ ${unique}</span></div></div>`;
});
if(!sortedLangs.length)langHtml+='<div class="an-empty">No data</div>';
langHtml+='</div></div>';

/* ── Timezones ── */
const sortedTZ=Object.entries(v.timezones).sort((a,b)=>b[1]-a[1]).slice(0,10);
const maxTZ=sortedTZ.length?sortedTZ[0][1]:1;
let tzHtml='<div class="an-section"><div class="an-section-title">Timezones <span class="an-hint">(total / unique visitors)</span></div><div class="an-bars">';
sortedTZ.forEach(([name,count])=>{
  const unique=v.timezonesUniqueCounts[name]||0;
  const pct=count/maxTZ*100;
  const shortName=name.replace('Australia/','AU/').replace('America/','US/').replace('Europe/','EU/').replace('Asia/','AS/');
  tzHtml+=`<div class="an-bar-row"><div class="an-bar-label" title="${name}">${shortName}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-tz" style="width:${pct}%"></div></div><div class="an-bar-val">${count} <span class="an-bar-unique">/ ${unique}</span></div></div>`;
});
if(!sortedTZ.length)tzHtml+='<div class="an-empty">No data</div>';
tzHtml+='</div></div>';

/* ── Referrers ── */
const sortedRefs=Object.entries(v.referrers).sort((a,b)=>b[1]-a[1]).slice(0,10);
const maxRef=sortedRefs.length?sortedRefs[0][1]:1;
let refsHtml='<div class="an-section"><div class="an-section-title">Referrers <span class="an-hint">(total / unique visitors)</span></div><div class="an-bars">';
sortedRefs.forEach(([name,count])=>{
  const unique=v.referrersUniqueCounts[name]||0;
  const pct=count/maxRef*100;
  refsHtml+=`<div class="an-bar-row"><div class="an-bar-label">${name}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-ref" style="width:${pct}%"></div></div><div class="an-bar-val">${count} <span class="an-bar-unique">/ ${unique}</span></div></div>`;
});
if(!sortedRefs.length)refsHtml+='<div class="an-empty">No data</div>';
refsHtml+='</div></div>';

/* ── Recent Unique Visitors Table (one row per UUID per day) ── */
const allSessions=entries.filter(e=>e.type==='session'||!e.type);
const seenUUIDDay=new Set();
const uniqueDayVisitors=[];
/* Walk from newest to oldest so we keep the most recent appearance */
for(let i=allSessions.length-1;i>=0;i--){
  const e=allSessions[i];
  let dayKey='';
  try{
    const dt=new Date(e.timestamp);
    const aedtDate=new Date(dt.toLocaleString('en-US',{timeZone:'Australia/Sydney'}));
    dayKey=aedtDate.getFullYear()+'-'+String(aedtDate.getMonth()+1).padStart(2,'0')+'-'+String(aedtDate.getDate()).padStart(2,'0');
  }catch(_){dayKey='unknown'}
  const key=(e.uuid||'anon')+'|'+dayKey;
  if(!seenUUIDDay.has(key)){
    seenUUIDDay.add(key);
    uniqueDayVisitors.push({...e,_day:dayKey});
  }
  if(uniqueDayVisitors.length>=20)break;
}
let tableHtml='<div class="an-section"><div class="an-section-title">Recent Unique Visitors <span class="an-hint">(last 20, per day)</span></div>';
if(uniqueDayVisitors.length){
  tableHtml+='<div class="an-table-wrap"><table class="an-table"><thead><tr><th>Date</th><th>UUID</th><th>Browser</th><th>OS</th><th>Device</th><th>Lang</th><th>Timezone</th></tr></thead><tbody>';
  uniqueDayVisitors.forEach(e=>{
    const dateStr=e._day!=='unknown'?(function(d){const dt=new Date(d+'T00:00:00');return dt.getDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()]})(e._day):'—';
    const uuid=(e.uuid||'—').slice(0,12);
    const br=e.browser||'—';
    const os=e.os||'—';
    const dev=e.device||'—';
    const lang=(e.language||'—').split('-')[0];
    const tz=(e.timezone||'—').replace('Australia/','AU/').replace('America/','US/');
    tableHtml+=`<tr><td>${dateStr}</td><td class="an-mono">${uuid}</td><td>${br}</td><td>${os}</td><td>${dev}</td><td>${lang}</td><td title="${e.timezone||''}">${tz}</td></tr>`;
  });
  tableHtml+='</tbody></table></div>';
}else{
  tableHtml+='<div class="an-empty">No visitor logs found for this period</div>';
}
tableHtml+='</div>';

/* ── Actions ── */
const actionsHtml=`<div class="an-actions">
<button class="an-action-btn" id="anExportVisitors">Export Visitor Logs</button>
<button class="an-action-btn" id="anRefreshVisitors">Refresh</button>
</div>`;

container.innerHTML=periodHtml+summaryHtml+trendHtml+hoursHtml
  +'<div class="an-two-col">'+pvHtml+pfHtml+'</div>'
  +'<div class="an-two-col">'+browsersHtml+osHtml+'</div>'
  +'<div class="an-two-col">'+devHtml+langHtml+'</div>'
  +'<div class="an-two-col">'+tzHtml+refsHtml+'</div>'
  +tableHtml+actionsHtml;

/* Bind period buttons */
container.querySelectorAll('.an-period-btn').forEach(btn=>{
  btn.onclick=()=>{analyticsPeriod=parseInt(btn.dataset.days);cachedVisitorData=null;renderAnalytics()}
});

/* Bind action buttons */
document.getElementById('anExportVisitors').onclick=()=>{
  const blob=new Blob([JSON.stringify(entries,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='ginza-visitors-'+_todayStr()+'.json';a.click();URL.revokeObjectURL(url);
  showToast('Visitor logs exported');
};
document.getElementById('anRefreshVisitors').onclick=()=>{
  cachedVisitorData=null;renderAnalytics();
};
}



/* ══════════════════════════════════════
   HOOK INTO EXISTING CODE
   ══════════════════════════════════════ */

/* Patch showPage to track page views via visitor log */
(function(){
const _origShowPage=showPage;
window.showPage=function(id){
_origShowPage(id);
const label=id.replace('Page','');
VisitorLog.trackPageView(label);
if(id==='analyticsPage')renderAnalytics();
};
})();

/* Patch showProfile to track profile views via visitor log */
(function(){
const _origShowProfile=showProfile;
window.showProfile=function(idx){
_origShowProfile(idx);
const g=girls[idx];
if(g&&g.name){
  VisitorLog.trackProfileView(g.name);
}
};
})();

/* ── Privacy opt-out button in footer ── */
(function(){
function _initOptBtn(){
  const btn=document.getElementById('analyticsOptBtn');
  if(!btn)return;
  function update(){const out=VisitorLog.isOptedOut();btn.textContent=out?'Opted out (click to re-enable)':'Opt out of analytics';btn.style.opacity=out?'0.55':'1'}
  update();
  btn.onclick=function(){if(VisitorLog.isOptedOut()){VisitorLog.optIn()}else{VisitorLog.optOut()}update()};
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',_initOptBtn)}else{_initOptBtn()}
})();

/* ── Nav link (injected after login/logout) ── */
(function(){
const _origRenderDropdown=renderDropdown;
window.renderDropdown=function(){
_origRenderDropdown();
const navLink=document.getElementById('navAnalytics');
if(loggedIn){
if(navLink)navLink.style.display='';
}else{
if(navLink)navLink.style.display='none';
if(document.getElementById('analyticsPage').classList.contains('active')){
/* Redirect away from analytics if logged out */
showPage('homePage');
}
}
};
})();
