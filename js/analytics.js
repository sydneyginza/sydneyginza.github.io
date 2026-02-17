/* === ANALYTICS & ENGAGEMENT TRACKING === */

/*
 * Lightweight client-side analytics stored in localStorage.
 * Tracks: page views, profile views, filter usage, peak browsing hours, favorites activity.
 * Dashboard visible only to logged-in admins via nav link.
 * Data retained for 90 days, auto-pruned on load.
 *
 * + GitHub Visitor Logs: append-only daily JSON files in data/logs/ on the DATA_REPO.
 *   Captures: anonymous UUID, user-agent, language, timezone, page path, timestamp.
 */

const Analytics=(function(){

const STORAGE_KEY='ginza_analytics';
const RETENTION_DAYS=90;

/* ── Helpers ── */
function aedt(){return new Date(new Date().toLocaleString('en-US',{timeZone:'Australia/Sydney'}))}
function todayStr(){const d=aedt();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function hourStr(){return String(aedt().getHours()).padStart(2,'0')}
function weekAgo(n){const d=aedt();d.setDate(d.getDate()-n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}

/* ── Storage ── */
function load(){
try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):{}}
catch(e){return{}}
}
function save(data){
try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
catch(e){/* quota exceeded — silently ignore */}
}

function getDay(data,date){
if(!data.days)data.days={};
if(!data.days[date])data.days[date]={pageViews:{},profileViews:{},filters:{},hours:{},sessions:0};
return data.days[date];
}

/* ── Pruning ── */
function prune(data){
if(!data.days)return data;
const cutoff=weekAgo(RETENTION_DAYS);
for(const dt in data.days){if(dt<cutoff)delete data.days[dt]}
return data;
}

/* ── Track Events ── */
function trackPageView(pageId){
const data=load();const day=getDay(data,todayStr());
const label=pageId.replace('Page','');
day.pageViews[label]=(day.pageViews[label]||0)+1;
/* Track hourly activity */
const h=hourStr();
day.hours[h]=(day.hours[h]||0)+1;
save(prune(data));
}

function trackProfileView(name){
if(!name)return;
const data=load();const day=getDay(data,todayStr());
if(!day.profileViews)day.profileViews={};
day.profileViews[name]=(day.profileViews[name]||0)+1;
const h=hourStr();
day.hours[h]=(day.hours[h]||0)+1;
save(prune(data));
}

function trackFilter(filterName,value){
const data=load();const day=getDay(data,todayStr());
if(!day.filters)day.filters={};
const key=filterName+(value?':'+value:'');
day.filters[key]=(day.filters[key]||0)+1;
save(prune(data));
}

function trackSession(){
const data=load();const day=getDay(data,todayStr());
day.sessions=(day.sessions||0)+1;
save(prune(data));
}

/* ── Aggregation ── */
function aggregate(days){
const result={totalPageViews:0,pageViews:{},profileViews:{},filters:{},hours:{},sessions:0,dailyVisits:{}};
for(let h=0;h<24;h++)result.hours[String(h).padStart(2,'0')]=0;
for(const dt in days){
const d=days[dt];
result.dailyVisits[dt]=0;
for(const p in d.pageViews){result.pageViews[p]=(result.pageViews[p]||0)+d.pageViews[p];result.totalPageViews+=d.pageViews[p];result.dailyVisits[dt]+=d.pageViews[p]}
for(const n in d.profileViews){result.profileViews[n]=(result.profileViews[n]||0)+d.profileViews[n];result.totalPageViews+=d.profileViews[n];result.dailyVisits[dt]+=d.profileViews[n]}
for(const f in d.filters){result.filters[f]=(result.filters[f]||0)+d.filters[f]}
for(const h in d.hours){result.hours[h]=(result.hours[h]||0)+d.hours[h]}
result.sessions+=(d.sessions||0);
}
return result;
}

function getStats(rangeDays){
const data=load();
if(!data.days)return aggregate({});
const cutoff=weekAgo(rangeDays||7);
const filtered={};
for(const dt in data.days){if(dt>=cutoff)filtered[dt]=data.days[dt]}
return aggregate(filtered);
}

/* ── Data Management ── */
function exportData(){return JSON.stringify(load(),null,2)}
function clearData(){try{localStorage.removeItem(STORAGE_KEY)}catch(e){}}

return{trackPageView,trackProfileView,trackFilter,trackSession,getStats,exportData,clearData,load};
})();

/* ── Track session on load ── */
Analytics.trackSession();


/* ══════════════════════════════════════════════════
   GITHUB VISITOR LOGS (append-only daily JSON files)
   ══════════════════════════════════════════════════ */

const VisitorLog=(function(){

const UUID_KEY='ginza_visitor_uuid';
const LOG_DIR='data/logs';
const THROTTLE_KEY='ginza_log_last';
const THROTTLE_MS=30000; /* min 30s between log writes to avoid spamming */

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

/* Collect visitor fingerprint */
function collectInfo(){
  const ua=navigator.userAgent||'';
  let device='Desktop',browser='Unknown',os='Unknown';

  /* Parse OS */
  if(/Windows/i.test(ua))os='Windows';
  else if(/Macintosh|Mac OS/i.test(ua))os='macOS';
  else if(/Android/i.test(ua)){os='Android';device='Mobile'}
  else if(/iPhone/i.test(ua)){os='iOS';device='Mobile'}
  else if(/iPad/i.test(ua)){os='iOS';device='Tablet'}
  else if(/Linux/i.test(ua))os='Linux';
  else if(/CrOS/i.test(ua))os='ChromeOS';

  /* Parse browser */
  if(/Edg\//i.test(ua))browser='Edge';
  else if(/OPR\//i.test(ua)||/Opera/i.test(ua))browser='Opera';
  else if(/SamsungBrowser/i.test(ua))browser='Samsung';
  else if(/Chrome/i.test(ua))browser='Chrome';
  else if(/Safari/i.test(ua)&&!/Chrome/i.test(ua))browser='Safari';
  else if(/Firefox/i.test(ua))browser='Firefox';

  return{
    uuid:getUUID(),
    timestamp:new Date().toISOString(),
    userAgent:ua,
    browser:browser,
    os:os,
    device:device,
    language:navigator.language||navigator.userLanguage||'unknown',
    timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'unknown',
    tzOffset:new Date().getTimezoneOffset(),
    page:window.location.pathname+window.location.search,
    referrer:document.referrer||'direct',
    screen:window.screen?window.screen.width+'x'+window.screen.height:'unknown',
    viewport:window.innerWidth+'x'+window.innerHeight
  };
}

/* Check throttle — don't spam GitHub API */
function shouldLog(){
  try{
    const last=localStorage.getItem(THROTTLE_KEY);
    if(last&&(Date.now()-parseInt(last))<THROTTLE_MS)return false;
    localStorage.setItem(THROTTLE_KEY,String(Date.now()));
    return true;
  }catch(e){return true}
}

/* Get today's log filename in AEDT */
function logFileName(){
  const d=new Date(new Date().toLocaleString('en-US',{timeZone:'Australia/Sydney'}));
  const ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  return `${LOG_DIR}/${ds}.json`;
}

/* Append a visit entry to today's log file on GitHub */
async function logVisit(){
  if(!shouldLog())return;
  const entry=collectInfo();
  const filePath=logFileName();

  try{
    /* Try to read existing log file */
    let existing=[];
    let sha=null;

    const getR=await fetchWithRetry(`${DATA_API}/${filePath}`,{headers:proxyHeaders()},{retries:1,baseDelay:500});
    if(getR.ok){
      const data=await getR.json();
      sha=data.sha;
      try{existing=JSON.parse(decodeURIComponent(escape(atob(data.content.replace(/\n/g,'')))));}
      catch(e){existing=[];}
    }

    /* Append new entry */
    existing.push(entry);

    /* Write back */
    const body={
      message:'Log visit '+entry.timestamp,
      content:btoa(unescape(encodeURIComponent(JSON.stringify(existing,null,2))))
    };
    if(sha)body.sha=sha;

    await fetchWithRetry(`${DATA_API}/${filePath}`,{
      method:'PUT',
      headers:proxyHeaders(),
      body:JSON.stringify(body)
    },{retries:1,baseDelay:500});

  }catch(e){
    /* Silently fail — visitor logging should never break the site */
    console.warn('Visitor log failed:',e.message);
  }
}

/* Load log files for a date range from GitHub */
async function loadLogs(startDate,endDate){
  const logs=[];
  try{
    /* List all files in the logs directory */
    const r=await fetchWithRetry(`${DATA_API}/${LOG_DIR}`,{headers:proxyHeaders()},{retries:1,baseDelay:500});
    if(!r.ok)return logs;
    const files=await r.json();
    if(!Array.isArray(files))return logs;

    /* Filter to date range and fetch each */
    const filesToFetch=files.filter(f=>{
      const m=f.name.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
      if(!m)return false;
      const dt=m[1];
      return dt>=startDate&&dt<=endDate;
    });

    /* Fetch in parallel (max 10 concurrent) */
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

/* Aggregate visitor log data */
function aggregateLogs(entries){
  const uuids=new Set();
  const browsers={};
  const oses={};
  const devices={};
  const languages={};
  const timezones={};
  const pages={};
  const referrers={};
  const hourly={};
  const daily={};
  const dailyUniques={};
  const screens={};
  let totalHits=0;

  for(let h=0;h<24;h++)hourly[String(h).padStart(2,'0')]=0;

  entries.forEach(e=>{
    totalHits++;
    uuids.add(e.uuid);

    /* Browser */
    const br=e.browser||_parseUABrowser(e.userAgent);
    browsers[br]=(browsers[br]||0)+1;

    /* OS */
    const os=e.os||_parseUAOS(e.userAgent);
    oses[os]=(oses[os]||0)+1;

    /* Device */
    const dev=e.device||'Unknown';
    devices[dev]=(devices[dev]||0)+1;

    /* Language */
    const lang=(e.language||'unknown').split('-')[0];
    languages[lang]=(languages[lang]||0)+1;

    /* Timezone */
    const tz=e.timezone||'unknown';
    timezones[tz]=(timezones[tz]||0)+1;

    /* Page */
    const pg=e.page||'/';
    pages[pg]=(pages[pg]||0)+1;

    /* Referrer */
    let ref='direct';
    if(e.referrer&&e.referrer!=='direct'){
      try{ref=new URL(e.referrer).hostname}catch(_){ref=e.referrer}
    }
    referrers[ref]=(referrers[ref]||0)+1;

    /* Screen size */
    if(e.screen&&e.screen!=='unknown'){
      screens[e.screen]=(screens[e.screen]||0)+1;
    }

    /* Hourly (use AEDT) */
    if(e.timestamp){
      try{
        const dt=new Date(e.timestamp);
        const aedtStr=dt.toLocaleString('en-US',{timeZone:'Australia/Sydney',hour:'2-digit',hour12:false});
        const hr=String(parseInt(aedtStr)).padStart(2,'0');
        hourly[hr]=(hourly[hr]||0)+1;
      }catch(_){}
    }

    /* Daily */
    if(e.timestamp){
      try{
        const dt=new Date(e.timestamp);
        const aedtDate=new Date(dt.toLocaleString('en-US',{timeZone:'Australia/Sydney'}));
        const ds=aedtDate.getFullYear()+'-'+String(aedtDate.getMonth()+1).padStart(2,'0')+'-'+String(aedtDate.getDate()).padStart(2,'0');
        daily[ds]=(daily[ds]||0)+1;
        if(!dailyUniques[ds])dailyUniques[ds]=new Set();
        dailyUniques[ds].add(e.uuid);
      }catch(_){}
    }
  });

  /* Convert dailyUniques sets to counts */
  const dailyUniqueCounts={};
  for(const d in dailyUniques)dailyUniqueCounts[d]=dailyUniques[d].size;

  return{
    totalHits,
    uniqueVisitors:uuids.size,
    browsers,oses,devices,languages,timezones,pages,referrers,screens,
    hourly,daily,dailyUniqueCounts
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

return{logVisit,loadLogs,aggregateLogs,getUUID};
})();

/* Fire visitor log on page load (non-blocking) */
VisitorLog.logVisit();


/* ══════════════════════════════════════
   ANALYTICS DASHBOARD (admin-only)
   ══════════════════════════════════════ */

let analyticsPeriod=7;
let analyticsTab='local'; /* 'local' or 'visitors' */
let cachedVisitorData=null;
let cachedVisitorPeriod=null;

function renderAnalytics(){
const container=document.getElementById('analyticsContent');
if(!container)return;

/* ── Tab selector ── */
let tabHtml='<div class="an-tabs">';
tabHtml+=`<button class="an-tab-btn${analyticsTab==='local'?' active':''}" data-tab="local">Local Analytics</button>`;
tabHtml+=`<button class="an-tab-btn${analyticsTab==='visitors'?' active':''}" data-tab="visitors">Visitor Logs</button>`;
tabHtml+='</div>';

if(analyticsTab==='local'){
  renderLocalAnalytics(container,tabHtml);
}else{
  renderVisitorAnalytics(container,tabHtml);
}
}

function renderLocalAnalytics(container,tabHtml){
const stats=Analytics.getStats(analyticsPeriod);

/* ── Period selector ── */
const periods=[{d:1,l:'Today'},{d:7,l:'7 Days'},{d:14,l:'14 Days'},{d:30,l:'30 Days'},{d:90,l:'90 Days'}];
let periodHtml='<div class="an-period">';
periods.forEach(p=>{periodHtml+=`<button class="an-period-btn${analyticsPeriod===p.d?' active':''}" data-days="${p.d}">${p.l}</button>`});
periodHtml+='</div>';

/* ── Summary cards ── */
const activeDays=Object.keys(stats.dailyVisits).filter(d=>stats.dailyVisits[d]>0).length;
const avgDaily=activeDays>0?Math.round(stats.totalPageViews/activeDays):0;
const topProfile=Object.entries(stats.profileViews).sort((a,b)=>b[1]-a[1])[0];
const summaryHtml=`<div class="an-summary">
<div class="an-card"><div class="an-card-val">${stats.totalPageViews}</div><div class="an-card-label">Total Page Views</div></div>
<div class="an-card"><div class="an-card-val">${stats.sessions}</div><div class="an-card-label">Sessions</div></div>
<div class="an-card"><div class="an-card-val">${avgDaily}</div><div class="an-card-label">Avg Daily Views</div></div>
<div class="an-card"><div class="an-card-val">${topProfile?topProfile[0]:'—'}</div><div class="an-card-label">Most Viewed${topProfile?' ('+topProfile[1]+')':''}</div></div>
</div>`;

/* ── Peak Hours Heatmap ── */
const maxHour=Math.max(...Object.values(stats.hours),1);
let hoursHtml='<div class="an-section"><div class="an-section-title">Peak Browsing Hours <span class="an-hint">(AEDT)</span></div><div class="an-hours">';
for(let h=0;h<24;h++){
const key=String(h).padStart(2,'0');
const val=stats.hours[key]||0;
const pct=val/maxHour;
const h12=h===0?'12a':h<12?h+'a':h===12?'12p':(h-12)+'p';
hoursHtml+=`<div class="an-hour" title="${h12}: ${val} views"><div class="an-hour-bar" style="height:${Math.max(pct*100,2)}%;opacity:${0.25+pct*0.75}"></div><div class="an-hour-label">${h%3===0?h12:''}</div></div>`;
}
hoursHtml+='</div></div>';

/* ── Page Views Breakdown ── */
const sortedPages=Object.entries(stats.pageViews).sort((a,b)=>b[1]-a[1]);
const maxPage=sortedPages.length?sortedPages[0][1]:1;
let pagesHtml='<div class="an-section"><div class="an-section-title">Page Views</div><div class="an-bars">';
sortedPages.forEach(([name,count])=>{
const pct=count/maxPage*100;
pagesHtml+=`<div class="an-bar-row"><div class="an-bar-label">${name}</div><div class="an-bar-track"><div class="an-bar-fill" style="width:${pct}%"></div></div><div class="an-bar-val">${count}</div></div>`;
});
if(!sortedPages.length)pagesHtml+='<div class="an-empty">No page views recorded yet</div>';
pagesHtml+='</div></div>';

/* ── Top Profiles ── */
const sortedProfiles=Object.entries(stats.profileViews).sort((a,b)=>b[1]-a[1]).slice(0,15);
const maxProf=sortedProfiles.length?sortedProfiles[0][1]:1;
let profilesHtml='<div class="an-section"><div class="an-section-title">Most Viewed Profiles</div><div class="an-bars">';
sortedProfiles.forEach(([name,count],i)=>{
const pct=count/maxProf*100;
const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
profilesHtml+=`<div class="an-bar-row"><div class="an-bar-label">${medal} ${name}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-profile" style="width:${pct}%"></div></div><div class="an-bar-val">${count}</div></div>`;
});
if(!sortedProfiles.length)profilesHtml+='<div class="an-empty">No profile views recorded yet</div>';
profilesHtml+='</div></div>';

/* ── Filter Usage ── */
const sortedFilters=Object.entries(stats.filters).sort((a,b)=>b[1]-a[1]).slice(0,15);
const maxFilter=sortedFilters.length?sortedFilters[0][1]:1;
let filtersHtml='<div class="an-section"><div class="an-section-title">Most Used Filters</div><div class="an-bars">';
sortedFilters.forEach(([name,count])=>{
const pct=count/maxFilter*100;
filtersHtml+=`<div class="an-bar-row"><div class="an-bar-label">${name}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-filter" style="width:${pct}%"></div></div><div class="an-bar-val">${count}</div></div>`;
});
if(!sortedFilters.length)filtersHtml+='<div class="an-empty">No filter usage recorded yet</div>';
filtersHtml+='</div></div>';

/* ── Daily Trend ── */
const sortedDays=Object.entries(stats.dailyVisits).sort((a,b)=>a[0].localeCompare(b[0]));
const maxDay=Math.max(...sortedDays.map(d=>d[1]),1);
let trendHtml='<div class="an-section"><div class="an-section-title">Daily Activity</div><div class="an-trend">';
sortedDays.forEach(([date,count])=>{
const pct=count/maxDay*100;
const dd=date.slice(5);/* MM-DD */
trendHtml+=`<div class="an-trend-bar" title="${date}: ${count} views"><div class="an-trend-fill" style="height:${Math.max(pct,2)}%"></div><div class="an-trend-label">${dd}</div></div>`;
});
if(!sortedDays.length)trendHtml+='<div class="an-empty">No activity recorded yet</div>';
trendHtml+='</div></div>';

/* ── Actions ── */
const actionsHtml=`<div class="an-actions">
<button class="an-action-btn" id="anExport">Export JSON</button>
<button class="an-action-btn an-danger" id="anClear">Clear All Data</button>
</div>`;

container.innerHTML=tabHtml+periodHtml+summaryHtml+hoursHtml+trendHtml+'<div class="an-two-col">'+pagesHtml+profilesHtml+'</div>'+filtersHtml+actionsHtml;

/* Bind tab buttons */
_bindTabButtons(container);

/* Bind period buttons */
container.querySelectorAll('.an-period-btn').forEach(btn=>{
btn.onclick=()=>{analyticsPeriod=parseInt(btn.dataset.days);renderAnalytics()}
});

/* Bind action buttons */
document.getElementById('anExport').onclick=()=>{
const blob=new Blob([Analytics.exportData()],{type:'application/json'});
const url=URL.createObjectURL(blob);
const a=document.createElement('a');a.href=url;a.download='ginza-analytics-'+_todayStr()+'.json';a.click();URL.revokeObjectURL(url);
showToast('Analytics exported');
};
document.getElementById('anClear').onclick=()=>{
if(confirm('Clear all analytics data? This cannot be undone.')){Analytics.clearData();renderAnalytics();showToast('Analytics data cleared')}
};
}

function _todayStr(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}


/* ══════════════════════════════════════
   VISITOR LOGS TAB
   ══════════════════════════════════════ */

async function renderVisitorAnalytics(container,tabHtml){
/* ── Period selector ── */
const periods=[{d:1,l:'Today'},{d:7,l:'7 Days'},{d:14,l:'14 Days'},{d:30,l:'30 Days'},{d:90,l:'90 Days'}];
let periodHtml='<div class="an-period">';
periods.forEach(p=>{periodHtml+=`<button class="an-period-btn${analyticsPeriod===p.d?' active':''}" data-days="${p.d}">${p.l}</button>`});
periodHtml+='</div>';

/* Show loading state first */
container.innerHTML=tabHtml+periodHtml+'<div class="an-loading"><div class="an-loading-spinner"></div><div class="an-loading-text">Loading visitor logs from GitHub...</div></div>';
_bindTabButtons(container);
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

const vStats=VisitorLog.aggregateLogs(entries);

/* ── Summary cards ── */
const activeDays=Object.keys(vStats.daily).length;
const avgDaily=activeDays>0?Math.round(vStats.totalHits/activeDays):0;
const avgUniqueDaily=activeDays>0?Math.round(vStats.uniqueVisitors/activeDays):0;
const summaryHtml=`<div class="an-summary">
<div class="an-card"><div class="an-card-val">${vStats.uniqueVisitors}</div><div class="an-card-label">Unique Visitors</div></div>
<div class="an-card"><div class="an-card-val">${vStats.totalHits}</div><div class="an-card-label">Total Hits</div></div>
<div class="an-card"><div class="an-card-val">${avgDaily}</div><div class="an-card-label">Avg Daily Hits</div></div>
<div class="an-card"><div class="an-card-val">${avgUniqueDaily}</div><div class="an-card-label">Avg Daily Uniques</div></div>
</div>`;

/* ── Daily Visitors Trend (hits + uniques) ── */
const sortedDays=Object.entries(vStats.daily).sort((a,b)=>a[0].localeCompare(b[0]));
const maxDayVal=Math.max(...sortedDays.map(d=>d[1]),1);
let trendHtml='<div class="an-section"><div class="an-section-title">Daily Visitors <span class="an-hint">(hits vs uniques)</span></div><div class="an-trend an-trend-dual">';
sortedDays.forEach(([date,count])=>{
  const uniques=vStats.dailyUniqueCounts[date]||0;
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
const maxH=Math.max(...Object.values(vStats.hourly),1);
let hoursHtml='<div class="an-section"><div class="an-section-title">Peak Visit Hours <span class="an-hint">(AEDT)</span></div><div class="an-hours">';
for(let h=0;h<24;h++){
  const key=String(h).padStart(2,'0');
  const val=vStats.hourly[key]||0;
  const pct=val/maxH;
  const h12=h===0?'12a':h<12?h+'a':h===12?'12p':(h-12)+'p';
  hoursHtml+=`<div class="an-hour" title="${h12}: ${val} visits"><div class="an-hour-bar an-hour-visitor" style="height:${Math.max(pct*100,2)}%;opacity:${0.25+pct*0.75}"></div><div class="an-hour-label">${h%3===0?h12:''}</div></div>`;
}
hoursHtml+='</div></div>';

/* ── Browsers ── */
const sortedBrowsers=Object.entries(vStats.browsers).sort((a,b)=>b[1]-a[1]);
const maxBr=sortedBrowsers.length?sortedBrowsers[0][1]:1;
let browsersHtml='<div class="an-section"><div class="an-section-title">Browsers</div><div class="an-bars">';
sortedBrowsers.forEach(([name,count])=>{
  const pct=count/maxBr*100;
  browsersHtml+=`<div class="an-bar-row"><div class="an-bar-label">${name}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-visitor" style="width:${pct}%"></div></div><div class="an-bar-val">${count}</div></div>`;
});
if(!sortedBrowsers.length)browsersHtml+='<div class="an-empty">No data</div>';
browsersHtml+='</div></div>';

/* ── Operating Systems ── */
const sortedOS=Object.entries(vStats.oses).sort((a,b)=>b[1]-a[1]);
const maxOS=sortedOS.length?sortedOS[0][1]:1;
let osHtml='<div class="an-section"><div class="an-section-title">Operating Systems</div><div class="an-bars">';
sortedOS.forEach(([name,count])=>{
  const pct=count/maxOS*100;
  osHtml+=`<div class="an-bar-row"><div class="an-bar-label">${name}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-os" style="width:${pct}%"></div></div><div class="an-bar-val">${count}</div></div>`;
});
if(!sortedOS.length)osHtml+='<div class="an-empty">No data</div>';
osHtml+='</div></div>';

/* ── Devices ── */
const sortedDev=Object.entries(vStats.devices).sort((a,b)=>b[1]-a[1]);
const maxDev=sortedDev.length?sortedDev[0][1]:1;
let devHtml='<div class="an-section"><div class="an-section-title">Devices</div><div class="an-bars">';
sortedDev.forEach(([name,count])=>{
  const pct=count/maxDev*100;
  devHtml+=`<div class="an-bar-row"><div class="an-bar-label">${name}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-device" style="width:${pct}%"></div></div><div class="an-bar-val">${count}</div></div>`;
});
if(!sortedDev.length)devHtml+='<div class="an-empty">No data</div>';
devHtml+='</div></div>';

/* ── Languages ── */
const sortedLangs=Object.entries(vStats.languages).sort((a,b)=>b[1]-a[1]).slice(0,10);
const maxLang=sortedLangs.length?sortedLangs[0][1]:1;
let langHtml='<div class="an-section"><div class="an-section-title">Languages</div><div class="an-bars">';
sortedLangs.forEach(([name,count])=>{
  const pct=count/maxLang*100;
  langHtml+=`<div class="an-bar-row"><div class="an-bar-label">${name}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-lang" style="width:${pct}%"></div></div><div class="an-bar-val">${count}</div></div>`;
});
if(!sortedLangs.length)langHtml+='<div class="an-empty">No data</div>';
langHtml+='</div></div>';

/* ── Timezones ── */
const sortedTZ=Object.entries(vStats.timezones).sort((a,b)=>b[1]-a[1]).slice(0,10);
const maxTZ=sortedTZ.length?sortedTZ[0][1]:1;
let tzHtml='<div class="an-section"><div class="an-section-title">Timezones</div><div class="an-bars">';
sortedTZ.forEach(([name,count])=>{
  const pct=count/maxTZ*100;
  const shortName=name.replace('Australia/','AU/').replace('America/','US/').replace('Europe/','EU/').replace('Asia/','AS/');
  tzHtml+=`<div class="an-bar-row"><div class="an-bar-label" title="${name}">${shortName}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-tz" style="width:${pct}%"></div></div><div class="an-bar-val">${count}</div></div>`;
});
if(!sortedTZ.length)tzHtml+='<div class="an-empty">No data</div>';
tzHtml+='</div></div>';

/* ── Top Pages ── */
const sortedPages=Object.entries(vStats.pages).sort((a,b)=>b[1]-a[1]).slice(0,15);
const maxPg=sortedPages.length?sortedPages[0][1]:1;
let pagesHtml='<div class="an-section"><div class="an-section-title">Top Pages</div><div class="an-bars">';
sortedPages.forEach(([name,count])=>{
  const pct=count/maxPg*100;
  const shortName=name.length>30?name.slice(0,30)+'…':name;
  pagesHtml+=`<div class="an-bar-row"><div class="an-bar-label" title="${name}">${shortName}</div><div class="an-bar-track"><div class="an-bar-fill" style="width:${pct}%"></div></div><div class="an-bar-val">${count}</div></div>`;
});
if(!sortedPages.length)pagesHtml+='<div class="an-empty">No data</div>';
pagesHtml+='</div></div>';

/* ── Referrers ── */
const sortedRefs=Object.entries(vStats.referrers).sort((a,b)=>b[1]-a[1]).slice(0,10);
const maxRef=sortedRefs.length?sortedRefs[0][1]:1;
let refsHtml='<div class="an-section"><div class="an-section-title">Referrers</div><div class="an-bars">';
sortedRefs.forEach(([name,count])=>{
  const pct=count/maxRef*100;
  refsHtml+=`<div class="an-bar-row"><div class="an-bar-label">${name}</div><div class="an-bar-track"><div class="an-bar-fill an-bar-ref" style="width:${pct}%"></div></div><div class="an-bar-val">${count}</div></div>`;
});
if(!sortedRefs.length)refsHtml+='<div class="an-empty">No data</div>';
refsHtml+='</div></div>';

/* ── Recent Visitors Table ── */
const recent=entries.slice(-20).reverse();
let tableHtml='<div class="an-section"><div class="an-section-title">Recent Visitors <span class="an-hint">(last 20)</span></div>';
if(recent.length){
  tableHtml+='<div class="an-table-wrap"><table class="an-table"><thead><tr><th>Time</th><th>UUID</th><th>Page</th><th>Browser</th><th>OS</th><th>Device</th><th>Lang</th><th>Timezone</th></tr></thead><tbody>';
  recent.forEach(e=>{
    const t=e.timestamp?new Date(e.timestamp).toLocaleString('en-AU',{timeZone:'Australia/Sydney',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:true}):'—';
    const uuid=(e.uuid||'—').slice(0,12);
    const pg=(e.page||'/').length>20?(e.page||'/').slice(0,20)+'…':(e.page||'/');
    const br=e.browser||'—';
    const os=e.os||'—';
    const dev=e.device||'—';
    const lang=(e.language||'—').split('-')[0];
    const tz=(e.timezone||'—').replace('Australia/','AU/').replace('America/','US/');
    tableHtml+=`<tr><td>${t}</td><td class="an-mono">${uuid}</td><td title="${e.page||'/'}">${pg}</td><td>${br}</td><td>${os}</td><td>${dev}</td><td>${lang}</td><td title="${e.timezone||''}">${tz}</td></tr>`;
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

container.innerHTML=tabHtml+periodHtml+summaryHtml+trendHtml+hoursHtml
  +'<div class="an-two-col">'+browsersHtml+osHtml+'</div>'
  +'<div class="an-two-col">'+devHtml+langHtml+'</div>'
  +'<div class="an-two-col">'+tzHtml+refsHtml+'</div>'
  +pagesHtml+tableHtml+actionsHtml;

/* Bind tabs */
_bindTabButtons(container);

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

function _bindTabButtons(container){
  container.querySelectorAll('.an-tab-btn').forEach(btn=>{
    btn.onclick=()=>{analyticsTab=btn.dataset.tab;renderAnalytics()}
  });
}


/* ══════════════════════════════════════
   HOOK INTO EXISTING CODE
   ══════════════════════════════════════ */

/* Patch showPage to track page views */
(function(){
const _origShowPage=showPage;
window.showPage=function(id){
_origShowPage(id);
Analytics.trackPageView(id);
/* Track analytics page render */
if(id==='analyticsPage')renderAnalytics();
};
})();

/* Patch showProfile to track profile views */
(function(){
const _origShowProfile=showProfile;
window.showProfile=function(idx){
_origShowProfile(idx);
const g=girls[idx];
if(g&&g.name)Analytics.trackProfileView(g.name);
};
})();

/* Patch onFiltersChanged to track filter usage */
(function(){
const _origOnFiltersChanged=onFiltersChanged;
window.onFiltersChanged=function(){
_origOnFiltersChanged();
/* Log which filters are active */
if(sharedFilters.country.length)sharedFilters.country.forEach(c=>Analytics.trackFilter('country',c));
if(sharedFilters.cupSize)Analytics.trackFilter('cupSize',sharedFilters.cupSize);
if(sharedFilters.experience)Analytics.trackFilter('experience',sharedFilters.experience);
if(sharedFilters.labels.length)sharedFilters.labels.forEach(l=>Analytics.trackFilter('label',l));
if(sharedFilters.availableNow)Analytics.trackFilter('availableNow');
if(sharedFilters.nameSearch)Analytics.trackFilter('nameSearch');
if(sharedFilters.ageMin!=null||sharedFilters.ageMax!=null)Analytics.trackFilter('ageRange');
if(sharedFilters.heightMin!=null||sharedFilters.heightMax!=null)Analytics.trackFilter('heightRange');
if(sharedFilters.bodyMin!=null||sharedFilters.bodyMax!=null)Analytics.trackFilter('bodyRange');
if(sharedFilters.val1Min!=null||sharedFilters.val1Max!=null)Analytics.trackFilter('rate30Range');
if(sharedFilters.val2Min!=null||sharedFilters.val2Max!=null)Analytics.trackFilter('rate45Range');
if(sharedFilters.val3Min!=null||sharedFilters.val3Max!=null)Analytics.trackFilter('rate60Range');
};
})();

/* Track initial page view */
Analytics.trackPageView('homePage');

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
