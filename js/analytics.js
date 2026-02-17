/* === ANALYTICS & ENGAGEMENT TRACKING === */

/*
 * Lightweight client-side analytics stored in localStorage.
 * Tracks: page views, profile views, filter usage, peak browsing hours, favorites activity.
 * Dashboard visible only to logged-in admins via nav link.
 * Data retained for 90 days, auto-pruned on load.
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

/* ══════════════════════════════════════
   ANALYTICS DASHBOARD (admin-only)
   ══════════════════════════════════════ */

let analyticsPeriod=7;

function renderAnalytics(){
const container=document.getElementById('analyticsContent');
if(!container)return;
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

container.innerHTML=periodHtml+summaryHtml+hoursHtml+trendHtml+'<div class="an-two-col">'+pagesHtml+profilesHtml+'</div>'+filtersHtml+actionsHtml;

/* Bind period buttons */
container.querySelectorAll('.an-period-btn').forEach(btn=>{
btn.onclick=()=>{analyticsPeriod=parseInt(btn.dataset.days);renderAnalytics()}
});

/* Bind action buttons */
document.getElementById('anExport').onclick=()=>{
const blob=new Blob([Analytics.exportData()],{type:'application/json'});
const url=URL.createObjectURL(blob);
const a=document.createElement('a');a.href=url;a.download='ginza-analytics-'+todayStr()+'.json';a.click();URL.revokeObjectURL(url);
showToast('Analytics exported');
function todayStr(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
};
document.getElementById('anClear').onclick=()=>{
if(confirm('Clear all analytics data? This cannot be undone.')){Analytics.clearData();renderAnalytics();showToast('Analytics data cleared')}
};
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
