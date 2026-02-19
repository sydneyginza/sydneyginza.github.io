/* === UI: Nav, Auth, Particles, Home, Lightbox, Profile === */
let activeLocation="All",deleteTarget=-1,currentProfileIdx=0;
let rosterDateFilter=null,rosterLocFilter=null,calLocFilter=null,calPending={};
let gridSort='name';
let ngIdx=0,ngList=[];
let copyTimeResolve=null;

/* ── Shared Filter State (resets on refresh) ── */
let sharedFilters={nameSearch:'',country:[],ageMin:null,ageMax:null,bodyMin:null,bodyMax:null,heightMin:null,heightMax:null,cupSize:null,val1Min:null,val1Max:null,val2Min:null,val2Max:null,val3Min:null,val3Max:null,experience:null,labels:[],availableNow:false};

function applySharedFilters(list){
let f=list;
if(sharedFilters.nameSearch){const q=sharedFilters.nameSearch.toLowerCase();f=f.filter(g=>g.name&&g.name.toLowerCase().includes(q))}
if(sharedFilters.country.length)f=f.filter(g=>{const gc=g.country;if(Array.isArray(gc))return sharedFilters.country.every(c=>gc.includes(c));return sharedFilters.country.length===1&&sharedFilters.country.includes(gc)});
if(sharedFilters.ageMin!=null)f=f.filter(g=>{const v=parseFloat(g.age);return !isNaN(v)&&v>=sharedFilters.ageMin});
if(sharedFilters.ageMax!=null)f=f.filter(g=>{const v=parseFloat(g.age);return !isNaN(v)&&v<=sharedFilters.ageMax});
if(sharedFilters.bodyMin!=null)f=f.filter(g=>{const v=parseFloat(g.body);return !isNaN(v)&&v>=sharedFilters.bodyMin});
if(sharedFilters.bodyMax!=null)f=f.filter(g=>{const v=parseFloat(g.body);return !isNaN(v)&&v<=sharedFilters.bodyMax});
if(sharedFilters.heightMin!=null)f=f.filter(g=>{const v=parseFloat(g.height);return !isNaN(v)&&v>=sharedFilters.heightMin});
if(sharedFilters.heightMax!=null)f=f.filter(g=>{const v=parseFloat(g.height);return !isNaN(v)&&v<=sharedFilters.heightMax});
if(sharedFilters.cupSize)f=f.filter(g=>g.cup&&g.cup.toUpperCase().includes(sharedFilters.cupSize.toUpperCase()));
if(sharedFilters.val1Min!=null)f=f.filter(g=>{const v=parseFloat(g.val1);return !isNaN(v)&&v>=sharedFilters.val1Min});
if(sharedFilters.val1Max!=null)f=f.filter(g=>{const v=parseFloat(g.val1);return !isNaN(v)&&v<=sharedFilters.val1Max});
if(sharedFilters.val2Min!=null)f=f.filter(g=>{const v=parseFloat(g.val2);return !isNaN(v)&&v>=sharedFilters.val2Min});
if(sharedFilters.val2Max!=null)f=f.filter(g=>{const v=parseFloat(g.val2);return !isNaN(v)&&v<=sharedFilters.val2Max});
if(sharedFilters.val3Min!=null)f=f.filter(g=>{const v=parseFloat(g.val3);return !isNaN(v)&&v>=sharedFilters.val3Min});
if(sharedFilters.val3Max!=null)f=f.filter(g=>{const v=parseFloat(g.val3);return !isNaN(v)&&v<=sharedFilters.val3Max});
if(sharedFilters.labels.length)f=f.filter(g=>g.labels&&sharedFilters.labels.every(l=>g.labels.includes(l)));
if(sharedFilters.experience)f=f.filter(g=>g.exp===sharedFilters.experience);
if(sharedFilters.availableNow)f=f.filter(g=>g.name&&isAvailableNow(g.name));
return f}

function hasActiveFilters(){return !!(sharedFilters.nameSearch||sharedFilters.country.length||sharedFilters.ageMin!=null||sharedFilters.ageMax!=null||sharedFilters.bodyMin!=null||sharedFilters.bodyMax!=null||sharedFilters.heightMin!=null||sharedFilters.heightMax!=null||sharedFilters.cupSize||sharedFilters.val1Min!=null||sharedFilters.val1Max!=null||sharedFilters.val2Min!=null||sharedFilters.val2Max!=null||sharedFilters.val3Min!=null||sharedFilters.val3Max!=null||sharedFilters.experience||sharedFilters.labels.length||sharedFilters.availableNow)}

function clearAllFilters(){sharedFilters={nameSearch:'',country:[],ageMin:null,ageMax:null,bodyMin:null,bodyMax:null,heightMin:null,heightMax:null,cupSize:null,val1Min:null,val1Max:null,val2Min:null,val2Max:null,val3Min:null,val3Max:null,experience:null,labels:[],availableNow:false}}

function filtersToQuery(){const p=new URLSearchParams();if(sharedFilters.nameSearch)p.set('search',sharedFilters.nameSearch);if(sharedFilters.country.length)p.set('country',sharedFilters.country.join(','));if(sharedFilters.ageMin!=null)p.set('ageMin',sharedFilters.ageMin);if(sharedFilters.ageMax!=null)p.set('ageMax',sharedFilters.ageMax);if(sharedFilters.bodyMin!=null)p.set('bodyMin',sharedFilters.bodyMin);if(sharedFilters.bodyMax!=null)p.set('bodyMax',sharedFilters.bodyMax);if(sharedFilters.heightMin!=null)p.set('heightMin',sharedFilters.heightMin);if(sharedFilters.heightMax!=null)p.set('heightMax',sharedFilters.heightMax);if(sharedFilters.cupSize)p.set('cup',sharedFilters.cupSize);if(sharedFilters.val1Min!=null)p.set('v1Min',sharedFilters.val1Min);if(sharedFilters.val1Max!=null)p.set('v1Max',sharedFilters.val1Max);if(sharedFilters.val2Min!=null)p.set('v2Min',sharedFilters.val2Min);if(sharedFilters.val2Max!=null)p.set('v2Max',sharedFilters.val2Max);if(sharedFilters.val3Min!=null)p.set('v3Min',sharedFilters.val3Min);if(sharedFilters.val3Max!=null)p.set('v3Max',sharedFilters.val3Max);if(sharedFilters.experience)p.set('exp',sharedFilters.experience);if(sharedFilters.labels.length)p.set('labels',sharedFilters.labels.join(','));if(sharedFilters.availableNow)p.set('now','1');return p}

function queryToFilters(){const p=new URLSearchParams(window.location.search);if(p.has('search'))sharedFilters.nameSearch=p.get('search');if(p.has('country'))sharedFilters.country=p.get('country').split(',').filter(Boolean);if(p.has('ageMin')){const v=parseFloat(p.get('ageMin'));if(!isNaN(v))sharedFilters.ageMin=v}if(p.has('ageMax')){const v=parseFloat(p.get('ageMax'));if(!isNaN(v))sharedFilters.ageMax=v}if(p.has('bodyMin')){const v=parseFloat(p.get('bodyMin'));if(!isNaN(v))sharedFilters.bodyMin=v}if(p.has('bodyMax')){const v=parseFloat(p.get('bodyMax'));if(!isNaN(v))sharedFilters.bodyMax=v}if(p.has('heightMin')){const v=parseFloat(p.get('heightMin'));if(!isNaN(v))sharedFilters.heightMin=v}if(p.has('heightMax')){const v=parseFloat(p.get('heightMax'));if(!isNaN(v))sharedFilters.heightMax=v}if(p.has('cup'))sharedFilters.cupSize=p.get('cup');if(p.has('v1Min')){const v=parseFloat(p.get('v1Min'));if(!isNaN(v))sharedFilters.val1Min=v}if(p.has('v1Max')){const v=parseFloat(p.get('v1Max'));if(!isNaN(v))sharedFilters.val1Max=v}if(p.has('v2Min')){const v=parseFloat(p.get('v2Min'));if(!isNaN(v))sharedFilters.val2Min=v}if(p.has('v2Max')){const v=parseFloat(p.get('v2Max'));if(!isNaN(v))sharedFilters.val2Max=v}if(p.has('v3Min')){const v=parseFloat(p.get('v3Min'));if(!isNaN(v))sharedFilters.val3Min=v}if(p.has('v3Max')){const v=parseFloat(p.get('v3Max'));if(!isNaN(v))sharedFilters.val3Max=v}if(p.has('exp'))sharedFilters.experience=p.get('exp');if(p.has('labels'))sharedFilters.labels=p.get('labels').split(',').filter(Boolean);if(p.has('now'))sharedFilters.availableNow=p.get('now')==='1'}

function pushFiltersToURL(){const q=filtersToQuery();const qs=q.toString();const newUrl=window.location.pathname+(qs?'?'+qs:'');history.replaceState({path:window.location.pathname},document.title,newUrl)}

function getDataRange(field,prefix){
const namedOnly=girls.filter(g=>g.name&&String(g.name).trim().length>0);
const nums=namedOnly.map(g=>parseFloat(g[field])).filter(n=>!isNaN(n)&&n>0);
if(!nums.length)return{min:'Min',max:'Max',rawMin:null,rawMax:null};
const p=prefix||'';
return{min:p+Math.min(...nums),max:p+Math.max(...nums),rawMin:Math.min(...nums),rawMax:Math.max(...nums)}}

function makeRangeSection(title,minKey,maxKey,dataField,prefix){
const sec=document.createElement('div');sec.className='fp-section';
const r=getDataRange(dataField,prefix);
const minVal=sharedFilters[minKey]!=null?sharedFilters[minKey]:(r.rawMin!=null?r.rawMin:'');
const maxVal=sharedFilters[maxKey]!=null?sharedFilters[maxKey]:(r.rawMax!=null?r.rawMax:'');
const minAttr=r.rawMin!=null?` min="${r.rawMin}"`:'';
const maxAttr=r.rawMax!=null?` max="${r.rawMax}"`:'';
sec.innerHTML=`<div class="fp-title">${title}</div><div class="fp-range"><div class="fp-range-row"><input class="fp-range-input" type="number" placeholder="${r.min}" data-fkey="${minKey}" data-default="${r.rawMin!=null?r.rawMin:''}"${minAttr}${maxAttr} value="${minVal}"><span class="fp-range-sep">to</span><input class="fp-range-input" type="number" placeholder="${r.max}" data-fkey="${maxKey}" data-default="${r.rawMax!=null?r.rawMax:''}"${minAttr}${maxAttr} value="${maxVal}"></div></div>`;
return sec}

function renderFilterPane(containerId){
const pane=document.getElementById(containerId);if(!pane)return;
pane.innerHTML='';
const namedGirls=girls.filter(g=>g.name&&String(g.name).trim().length>0);
const countries=[...new Set(namedGirls.flatMap(g=>Array.isArray(g.country)?g.country:[g.country]).filter(Boolean))].sort();
const cups=[...new Set(namedGirls.map(g=>g.cup).filter(Boolean))].sort();
const exps=[...new Set(namedGirls.map(g=>g.exp).filter(Boolean))].sort();
const labels=[...new Set(namedGirls.flatMap(g=>g.labels||[]).filter(Boolean))].sort();

/* Profiles search */
if(namedGirls.length){
const sec=document.createElement('div');sec.className='fp-section';
sec.innerHTML=`<div class="fp-title">Search</div><input class="fp-range-input" type="text" data-role="name-search" placeholder="Search by name..." style="text-align:left;padding:6px 10px;width:100%">`;
pane.appendChild(sec);
const searchInp=sec.querySelector('[data-role="name-search"]');
searchInp.value=sharedFilters.nameSearch||'';
let debounce;
searchInp.addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(()=>{sharedFilters.nameSearch=searchInp.value.trim();renderFilters();renderGrid();renderRoster();if(document.getElementById('calendarPage').classList.contains('active'))renderCalendar();document.querySelectorAll('[data-role="name-search"]').forEach(inp=>{if(inp!==searchInp){inp.value=sharedFilters.nameSearch}})},300)});
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}))}

/* Available Now toggle */
{const nowCount=getAvailableNowCount();
const sec=document.createElement('div');sec.className='fp-section';
sec.innerHTML=`<div class="fp-title">Availability</div><div class="fp-options"></div>`;
pane.appendChild(sec);
const wrap=sec.querySelector('.fp-options');
const btn=document.createElement('button');btn.className='fp-option fp-avail-now'+(sharedFilters.availableNow?' active':'');
btn.innerHTML=`<span class="fp-check">${sharedFilters.availableNow?'✓':''}</span><span class="avail-now-dot"></span>Available Now<span class="fp-count">${nowCount}</span>`;
btn.onclick=()=>{sharedFilters.availableNow=!sharedFilters.availableNow;onFiltersChanged()};
wrap.appendChild(btn);
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}))}

/* Country */
if(countries.length){
const sec=document.createElement('div');sec.className='fp-section';
sec.innerHTML=`<div class="fp-title">Country</div><div class="fp-options"></div>`;
pane.appendChild(sec);
const wrap=sec.querySelector('.fp-options');
countries.forEach(c=>{
const btn=document.createElement('button');btn.className='fp-option'+(sharedFilters.country.includes(c)?' active':'');
const cnt=namedGirls.filter(g=>{const gc=g.country;return Array.isArray(gc)?gc.includes(c):gc===c}).length;
btn.innerHTML=`<span class="fp-check">${sharedFilters.country.includes(c)?'✓':''}</span>${c}<span class="fp-count">${cnt}</span>`;
btn.onclick=()=>{if(sharedFilters.country.includes(c))sharedFilters.country=sharedFilters.country.filter(x=>x!==c);else sharedFilters.country.push(c);onFiltersChanged()};
wrap.appendChild(btn)})}

/* Age */
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
pane.appendChild(makeRangeSection('Age','ageMin','ageMax','age'));

/* Body Size */
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
pane.appendChild(makeRangeSection('Body Size','bodyMin','bodyMax','body'));

/* Height */
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
pane.appendChild(makeRangeSection('Height (cm)','heightMin','heightMax','height'));

/* Cup Size */
if(cups.length){
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
const sec=document.createElement('div');sec.className='fp-section';
sec.innerHTML=`<div class="fp-title">Cup Size</div><div class="fp-options"></div>`;
pane.appendChild(sec);
const wrap=sec.querySelector('.fp-options');
cups.forEach(c=>{
const btn=document.createElement('button');btn.className='fp-option'+(sharedFilters.cupSize===c?' active':'');
const cnt=namedGirls.filter(g=>g.cup===c).length;
btn.innerHTML=`<span class="fp-check">${sharedFilters.cupSize===c?'✓':''}</span>${c}<span class="fp-count">${cnt}</span>`;
btn.onclick=()=>{sharedFilters.cupSize=sharedFilters.cupSize===c?null:c;onFiltersChanged()};
wrap.appendChild(btn)})}

/* Rates 30 mins */
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
pane.appendChild(makeRangeSection('Rates 30 mins','val1Min','val1Max','val1','$'));

/* Rates 45 mins */
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
pane.appendChild(makeRangeSection('Rates 45 mins','val2Min','val2Max','val2','$'));

/* Rates 60 mins */
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
pane.appendChild(makeRangeSection('Rates 60 mins','val3Min','val3Max','val3','$'));

/* Experience */
if(exps.length){
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
const sec=document.createElement('div');sec.className='fp-section';
sec.innerHTML=`<div class="fp-title">Experience</div><div class="fp-options"></div>`;
pane.appendChild(sec);
const wrap=sec.querySelector('.fp-options');
exps.forEach(e=>{
const btn=document.createElement('button');btn.className='fp-option'+(sharedFilters.experience===e?' active':'');
const cnt=namedGirls.filter(g=>g.exp===e).length;
btn.innerHTML=`<span class="fp-check">${sharedFilters.experience===e?'✓':''}</span>${e}<span class="fp-count">${cnt}</span>`;
btn.onclick=()=>{sharedFilters.experience=sharedFilters.experience===e?null:e;onFiltersChanged()};
wrap.appendChild(btn)})}

/* Labels */
if(labels.length){
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
const sec=document.createElement('div');sec.className='fp-section';
sec.innerHTML=`<div class="fp-title">Labels</div><div class="fp-options"></div>`;
pane.appendChild(sec);
const wrap=sec.querySelector('.fp-options');
labels.forEach(l=>{
const isActive=sharedFilters.labels.includes(l);
const btn=document.createElement('button');btn.className='fp-option'+(isActive?' active':'');
const cnt=namedGirls.filter(g=>g.labels&&g.labels.includes(l)).length;
btn.innerHTML=`<span class="fp-check">${isActive?'✓':''}</span>${l}<span class="fp-count">${cnt}</span>`;
btn.onclick=()=>{if(isActive)sharedFilters.labels=sharedFilters.labels.filter(x=>x!==l);else sharedFilters.labels.push(l);onFiltersChanged()};
wrap.appendChild(btn)})}

/* Clear */
if(hasActiveFilters()){
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
const clr=document.createElement('button');clr.className='fp-clear';clr.textContent='Clear All Filters';
clr.onclick=()=>{clearAllFilters();onFiltersChanged()};
pane.appendChild(clr)}

/* Bind range inputs */
pane.querySelectorAll('.fp-range-input').forEach(inp=>{
let debounce;
function clampAndApply(){const key=inp.dataset.fkey;let val=inp.value.trim();if(val===''){sharedFilters[key]=null}else{let num=parseFloat(val);if(isNaN(num)){sharedFilters[key]=null;return}const lo=inp.hasAttribute('min')?parseFloat(inp.min):null;const hi=inp.hasAttribute('max')?parseFloat(inp.max):null;if(lo!=null&&num<lo){num=lo;inp.value=num}if(hi!=null&&num>hi){num=hi;inp.value=num}const def=inp.dataset.default;sharedFilters[key]=(def!==''&&num===parseFloat(def))?null:num}onFiltersChanged()}
inp.addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(clampAndApply,400)});
inp.addEventListener('blur',clampAndApply)})}
function onFiltersChanged(){
const hadFocus=document.activeElement&&document.activeElement.dataset&&document.activeElement.dataset.role==='name-search';
const cursorPos=hadFocus?document.activeElement.selectionStart:0;
const focusPane=hadFocus?document.activeElement.closest('.filter-pane'):null;
const focusPaneId=focusPane?focusPane.id:null;
renderFilterPane('girlsFilterPane');
renderFilterPane('rosterFilterPane');
renderFilterPane('calFilterPane');
renderFilterPane('profileFilterPane');
renderFilters();renderGrid();renderRoster();
updateFilterToggle();pushFiltersToURL();
if(document.getElementById('calendarPage').classList.contains('active'))renderCalendar();
if(document.getElementById('profilePage').classList.contains('active')){const fi=getNamedGirlIndices();if(fi.length){if(!fi.includes(currentProfileIdx))showProfile(fi[0]);else{renderProfileNav(currentProfileIdx)}}else{document.getElementById('profileContent').innerHTML='<button class="back-btn" id="backBtn"><svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>Back</button><div class="empty-msg">No profiles match the current filters</div>';document.getElementById('backBtn').onclick=()=>{if(window.history.length>1){window.history.back()}else{showPage(profileReturnPage)}}}}
if(focusPaneId){const restored=document.getElementById(focusPaneId);if(restored){const inp=restored.querySelector('[data-role="name-search"]');if(inp){inp.focus();inp.setSelectionRange(cursorPos,cursorPos)}}}}
const allPages=['homePage','rosterPage','listPage','favoritesPage','valuePage','employmentPage','calendarPage','analyticsPage','profilePage'].map(id=>document.getElementById(id));

function showPage(id){
if(document.getElementById('calendarPage').classList.contains('active')&&id!=='calendarPage'){flushCalSave();let s=false;for(const n in calPending)for(const dt in calPending[n])if(calPending[n][dt]&&calData[n]&&calData[n][dt]){delete calData[n][dt];s=true}if(s){saveCalData();renderRoster();renderGrid()}calPending={}}
allPages.forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');
closeFilterPanel();
/* URL routing & dynamic title */
const titleMap={homePage:'Ginza',rosterPage:'Ginza – Roster',listPage:'Ginza – Girls',favoritesPage:'Ginza – Favorites',valuePage:'Ginza – Rates',employmentPage:'Ginza – Employment',calendarPage:'Ginza – Calendar',analyticsPage:'Ginza – Analytics'};
const pageTitle=titleMap[id]||'Ginza';
document.title=pageTitle;
Router.push(Router.pathForPage(id),pageTitle);
/* Determine which filter pane is active for this page */
const paneMap={rosterPage:'rosterFilterPane',listPage:'girlsFilterPane',calendarPage:'calFilterPane',profilePage:'profileFilterPane'};
_activeFilterPaneId=paneMap[id]||null;
document.querySelectorAll('.nav-dropdown a').forEach(a=>a.classList.remove('active'));
if(id==='homePage'){document.getElementById('navHome').classList.add('active');renderHome()}
if(id==='rosterPage'){document.getElementById('navRoster').classList.add('active');renderFilterPane('rosterFilterPane');renderRoster()}
if(id==='listPage'){document.getElementById('navGirls').classList.add('active');renderFilterPane('girlsFilterPane');renderGrid()}
if(id==='favoritesPage'){document.getElementById('navFavorites').classList.add('active');renderFavoritesGrid()}
if(id==='valuePage'){document.getElementById('navValue').classList.add('active');renderValueTable()}
if(id==='employmentPage'){document.getElementById('navEmployment').classList.add('active')}
if(id==='calendarPage'){document.getElementById('navCalendar').classList.add('active');calPending={};renderFilterPane('calFilterPane');renderCalendar()}
if(id==='analyticsPage'){document.getElementById('navAnalytics').classList.add('active');if(typeof renderAnalytics==='function')renderAnalytics()}
updateFilterToggle();
if(_pagesWithFilters.includes(id))pushFiltersToURL();
window.scrollTo(0,0)}

document.getElementById('navHome').onclick=e=>{e.preventDefault();showPage('homePage')};
document.getElementById('navRoster').onclick=e=>{e.preventDefault();showPage('rosterPage')};
document.getElementById('navGirls').onclick=e=>{e.preventDefault();showPage('listPage')};
document.getElementById('navFavorites').onclick=e=>{e.preventDefault();showPage('favoritesPage')};
document.getElementById('navValue').onclick=e=>{e.preventDefault();showPage('valuePage')};
document.getElementById('navEmployment').onclick=e=>{e.preventDefault();showPage('employmentPage')};
document.getElementById('navCalendar').onclick=e=>{e.preventDefault();showPage('calendarPage')};
document.getElementById('navAnalytics').onclick=e=>{e.preventDefault();showPage('analyticsPage')};

/* Nav Dropdown Menu Toggle */
const navMenuBtn=document.getElementById('navMenuBtn');
const navDropdown=document.getElementById('navDropdown');
navMenuBtn.onclick=()=>{navMenuBtn.classList.toggle('open');navDropdown.classList.toggle('open')};
function closeNavMenu(){navMenuBtn.classList.remove('open');navDropdown.classList.remove('open')}
navDropdown.querySelectorAll('a').forEach(a=>{const orig=a.onclick;a.addEventListener('click',()=>closeNavMenu())});
document.addEventListener('click',e=>{if(!e.target.closest('.nav-menu-wrap'))closeNavMenu()});

/* Copy Time Modal */
function findExistingTimes(name,excludeDate){const dates=getWeekDates();for(const dt of dates){if(dt===excludeDate)continue;const entry=getCalEntry(name,dt);if(entry&&entry.start&&entry.end)return{date:dt,start:entry.start,end:entry.end}}return null}
function closeCopyTimeModal(result){const modal=document.getElementById('copyTimeModal');modal.classList.remove('open');if(copyTimeResolve){copyTimeResolve(result);copyTimeResolve=null}}
function showCopyTimePrompt(name,sourceDate,start,end){return new Promise(resolve=>{const modal=document.getElementById('copyTimeModal');const f=dispDate(sourceDate);document.getElementById('copyTimeMsg').innerHTML=`<strong style="color:#fff">${name}</strong> has existing times from <strong style="color:#fff">${f.day} ${f.date}</strong>`;document.getElementById('copyTimeDetail').textContent=fmtTime12(start)+' \u2014 '+fmtTime12(end);copyTimeResolve=resolve;modal.classList.add('open')})}
document.getElementById('copyTimeCopy').onclick=()=>closeCopyTimeModal('copy');
document.getElementById('copyTimeNew').onclick=()=>closeCopyTimeModal('new');
document.getElementById('copyTimeCancel').onclick=()=>closeCopyTimeModal('cancel');
document.getElementById('copyTimeModal').onclick=e=>{if(e.target===document.getElementById('copyTimeModal'))closeCopyTimeModal('cancel')};
window.addEventListener('beforeunload',()=>closeCopyTimeModal('cancel'));

/* Copy Day Modal */
let copyDaySource=null,copyDayTargets=[];

function openCopyDayModal(){
const dates=getWeekDates();
copyDaySource=null;copyDayTargets=[];
/* Pick first day that has entries as default source */
for(const ds of dates){const count=getScheduledForDay(ds).length;if(count>0){copyDaySource=ds;break}}
if(!copyDaySource)copyDaySource=dates[0];
renderCopyDayModal();
document.getElementById('copyDayModal').classList.add('open');
}

function getScheduledForDay(ds){return girls.filter(g=>{if(!g.name)return false;const e=getCalEntry(g.name,ds);return e&&e.start&&e.end})}

function renderCopyDayModal(){
const dates=getWeekDates();const ts=dates[0];
/* Source buttons */
const sc=document.getElementById('copyDaySources');sc.innerHTML='';
dates.forEach(ds=>{const f=dispDate(ds);const count=getScheduledForDay(ds).length;
const b=document.createElement('button');b.className='copy-day-btn'+(ds===copyDaySource?' active':'')+(count===0?' disabled':'');
b.innerHTML=(ds===ts?'Today':f.day)+' <span style="opacity:.5;font-size:11px">('+count+')</span>';
b.onclick=()=>{copyDaySource=ds;copyDayTargets=copyDayTargets.filter(t=>t!==ds);renderCopyDayModal()};sc.appendChild(b)});
/* Preview */
const prev=document.getElementById('copyDayPreview');
const scheduled=getScheduledForDay(copyDaySource);
if(scheduled.length){
const f=dispDate(copyDaySource);
prev.innerHTML='<div class="copy-day-preview-title">'+f.day+' '+f.date+' — '+scheduled.length+' girl'+(scheduled.length>1?'s':'')+'</div><div class="copy-day-preview-list">'+
scheduled.map(g=>{const e=getCalEntry(g.name,copyDaySource);return '<div class="copy-day-preview-item"><span class="cdp-name">'+g.name+'</span><span class="cdp-time">'+fmtTime12(e.start)+' — '+fmtTime12(e.end)+'</span></div>'}).join('')+'</div>';
}else{prev.innerHTML='<div class="copy-day-preview-empty">No girls scheduled on this day</div>'}
/* Target buttons */
const tc=document.getElementById('copyDayTargets');tc.innerHTML='';
dates.forEach(ds=>{if(ds===copyDaySource)return;
const f=dispDate(ds);const existing=getScheduledForDay(ds).length;
const b=document.createElement('button');b.className='copy-day-btn'+(copyDayTargets.includes(ds)?' target-active':'');
b.innerHTML=(ds===ts?'Today':f.day)+(existing>0?' <span style="opacity:.5;font-size:11px">('+existing+')</span>':'');
b.onclick=()=>{const idx=copyDayTargets.indexOf(ds);if(idx>=0)copyDayTargets.splice(idx,1);else copyDayTargets.push(ds);renderCopyDayModal()};tc.appendChild(b)});
/* Select all targets shortcut */
const allTargets=dates.filter(ds=>ds!==copyDaySource);
if(allTargets.length>1){const ab=document.createElement('button');ab.className='copy-day-btn'+(copyDayTargets.length===allTargets.length?' target-active':'');
ab.style.fontStyle='italic';ab.textContent='All';ab.onclick=()=>{if(copyDayTargets.length===allTargets.length)copyDayTargets=[];else copyDayTargets=[...allTargets];renderCopyDayModal()};tc.appendChild(ab)}
/* Apply button state */
const applyBtn=document.getElementById('copyDayApply');
applyBtn.disabled=scheduled.length===0||copyDayTargets.length===0;
applyBtn.style.opacity=applyBtn.disabled?'.4':'1';
applyBtn.style.pointerEvents=applyBtn.disabled?'none':'auto';
}

function closeCopyDayModal(){document.getElementById('copyDayModal').classList.remove('open')}

document.getElementById('copyDayCancel').onclick=closeCopyDayModal;
document.getElementById('copyDayModal').onclick=e=>{if(e.target===document.getElementById('copyDayModal'))closeCopyDayModal()};

document.getElementById('copyDayApply').onclick=async function(){
const scheduled=getScheduledForDay(copyDaySource);
if(!scheduled.length||!copyDayTargets.length)return;
const overwrite=document.getElementById('copyDayOverwrite').checked;
let copied=0;
copyDayTargets.forEach(targetDate=>{
scheduled.forEach(g=>{
const entry=getCalEntry(g.name,copyDaySource);
if(!entry||!entry.start||!entry.end)return;
const existing=getCalEntry(g.name,targetDate);
if(existing&&existing.start&&existing.end&&!overwrite)return;
if(!calData[g.name])calData[g.name]={};
calData[g.name][targetDate]={start:entry.start,end:entry.end};
copied++;
})});
if(copied>0){
this.textContent='Saving...';this.style.pointerEvents='none';
await saveCalData();
this.textContent='Copy Schedule';this.style.pointerEvents='auto';
renderCalendar();renderRoster();renderGrid();renderHome();
showToast('Copied '+scheduled.length+' schedule'+(scheduled.length>1?'s':'')+' to '+copyDayTargets.length+' day'+(copyDayTargets.length>1?'s':''));
}else{showToast('Nothing to copy (all targets already have entries)','error')}
closeCopyDayModal();};

/* Bulk Time Modal (mark available all week) */
let bulkTimeName='',bulkTimeDays=[];

function openBulkTimeModal(name){
bulkTimeName=name;
const dates=getWeekDates();
/* Pre-select days that don't have entries yet */
bulkTimeDays=dates.filter(ds=>{const e=getCalEntry(name,ds);return !e||!e.start||!e.end});
if(!bulkTimeDays.length)bulkTimeDays=[...dates];
/* Find existing time to pre-fill */
let preStart='',preEnd='';
for(const ds of dates){const e=getCalEntry(name,ds);if(e&&e.start&&e.end){preStart=e.start;preEnd=e.end;break}}
document.getElementById('bulkTimeName').textContent=name;
/* Populate time selects */
const tOpts=generateTimeOptions();
document.getElementById('bulkTimeStart').innerHTML=tOpts;
document.getElementById('bulkTimeEnd').innerHTML=tOpts;
if(preStart)document.getElementById('bulkTimeStart').value=preStart;
if(preEnd)document.getElementById('bulkTimeEnd').value=preEnd;
renderBulkTimeDays();
document.getElementById('bulkTimeModal').classList.add('open');
}

function renderBulkTimeDays(){
const dates=getWeekDates();const ts=dates[0];
const tc=document.getElementById('bulkTimeDays');tc.innerHTML='';
dates.forEach(ds=>{const f=dispDate(ds);const has=getCalEntry(bulkTimeName,ds);
const b=document.createElement('button');b.className='copy-day-btn'+(bulkTimeDays.includes(ds)?' target-active':'');
b.innerHTML=(ds===ts?'Today':f.day)+(has&&has.start?' <span style="opacity:.4;font-size:10px">\u2713</span>':'');
b.onclick=()=>{const idx=bulkTimeDays.indexOf(ds);if(idx>=0)bulkTimeDays.splice(idx,1);else bulkTimeDays.push(ds);renderBulkTimeDays()};tc.appendChild(b)});
/* All button */
const ab=document.createElement('button');ab.className='copy-day-btn'+(bulkTimeDays.length===dates.length?' target-active':'');
ab.style.fontStyle='italic';ab.textContent='All';
ab.onclick=()=>{if(bulkTimeDays.length===dates.length)bulkTimeDays=[];else bulkTimeDays=[...dates];renderBulkTimeDays()};tc.appendChild(ab);
/* Update apply state */
const applyBtn=document.getElementById('bulkTimeApply');
applyBtn.disabled=bulkTimeDays.length===0;
applyBtn.style.opacity=applyBtn.disabled?'.4':'1';
applyBtn.style.pointerEvents=applyBtn.disabled?'none':'auto';
}

function closeBulkTimeModal(){document.getElementById('bulkTimeModal').classList.remove('open')}
document.getElementById('bulkTimeCancel').onclick=closeBulkTimeModal;
document.getElementById('bulkTimeModal').onclick=e=>{if(e.target===document.getElementById('bulkTimeModal'))closeBulkTimeModal()};

document.getElementById('bulkTimeApply').onclick=async function(){
const start=document.getElementById('bulkTimeStart').value;
const end=document.getElementById('bulkTimeEnd').value;
if(!start||!end){showToast('Please set both start and end times','error');return}
const name=bulkTimeName;
if(!calData[name])calData[name]={};
bulkTimeDays.forEach(ds=>{calData[name][ds]={start,end};if(calPending[name])delete calPending[name][ds]});
this.textContent='Saving...';this.style.pointerEvents='none';
await saveCalData();
this.textContent='Apply';this.style.pointerEvents='auto';
renderCalendar();renderRoster();renderGrid();renderHome();
showToast(name+' marked available for '+bulkTimeDays.length+' day'+(bulkTimeDays.length>1?'s':''));
closeBulkTimeModal();
};

/* Home Page */
function getNewGirls(){const now=getAEDTDate();const cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-28);return girls.filter(g=>{if(!g.startDate)return false;const sd=new Date(g.startDate+'T00:00:00');return sd>=cutoff&&sd<=now})}

function renderHome(){safeRender('Home',()=>{
const c=document.getElementById('homeImages');c.innerHTML='';
const baseUrl='https://raw.githubusercontent.com/sydneyginza/sydneyginza.github.io/main/Images/Homepage/Homepage_';
for(let i=1;i<=4;i++){const card=document.createElement('div');card.className='home-img-card';card.style.cursor='default';card.innerHTML=`<img src="${baseUrl}${i}.jpg">`;c.appendChild(card)}
document.getElementById('homeAnnounce').innerHTML='<p></p>';
ngList=getNewGirls();ngIdx=0;renderNewGirls()})}

function renderNewGirls(){
const nav=document.getElementById('ngNav'),disp=document.getElementById('ngDisplay');nav.innerHTML='';disp.innerHTML='';
if(!ngList.length){disp.innerHTML='<div class="ng-empty">No new girls this month</div>';return}
if(ngIdx>=ngList.length)ngIdx=0;if(ngIdx<0)ngIdx=ngList.length-1;
const up=document.createElement('button');up.className='ng-arrow';up.innerHTML='<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>';up.onclick=()=>{ngIdx=(ngIdx-1+ngList.length)%ngList.length;renderNewGirls()};nav.appendChild(up);
const dots=document.createElement('div');dots.className='ng-dots';const mx=3;let st=Math.max(0,ngIdx-Math.floor(mx/2)),en=Math.min(ngList.length,st+mx);if(en-st<mx)st=Math.max(0,en-mx);
for(let i=st;i<en;i++){const dot=document.createElement('button');dot.className='ng-dot'+(i===ngIdx?' active':'');const g=ngList[i];dot.innerHTML=g.photos&&g.photos.length?`<img src="${g.photos[0]}">`:`<span>${g.name.charAt(0)}</span>`;dot.onclick=()=>{ngIdx=i;renderNewGirls()};dots.appendChild(dot)}
nav.appendChild(dots);const ctr=document.createElement('div');ctr.className='ng-counter';ctr.innerHTML=`<span>${ngIdx+1}</span> / ${ngList.length}`;nav.appendChild(ctr);
const dn=document.createElement('button');dn.className='ng-arrow';dn.innerHTML='<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>';dn.onclick=()=>{ngIdx=(ngIdx+1)%ngList.length;renderNewGirls()};nav.appendChild(dn);
const g=ngList[ngIdx],ri=girls.indexOf(g);const photo=g.photos&&g.photos.length?`<img src="${g.photos[0]}">`:'<div class="ng-placeholder"></div>';
disp.innerHTML=`<div class="ng-card"><div class="ng-photo" data-idx="${ri}" style="cursor:pointer">${photo}</div><a class="ng-name" data-idx="${ri}">${g.name}</a></div>`;
disp.querySelector('.ng-photo').onclick=()=>{profileReturnPage='homePage';showProfile(ri)};
disp.querySelector('.ng-name').onclick=()=>{profileReturnPage='homePage';showProfile(ri)}}

/* Lightbox */
let lbPhotos=[],lbIdx=0;
const lightbox=document.getElementById('lightbox'),lbImg=document.getElementById('lbImg'),lbStrip=document.getElementById('lbStrip'),lbCounter=document.getElementById('lbCounter');

function lbUpdateCounter(){lbCounter.innerHTML=`<span>${lbIdx+1}</span> / ${lbPhotos.length}`}

function lbUpdateStrip(){lbStrip.querySelectorAll('.lb-strip-thumb').forEach((t,i)=>{t.classList.toggle('active',i===lbIdx)});
const active=lbStrip.querySelector('.lb-strip-thumb.active');if(active)active.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})}

function lbRenderStrip(){lbStrip.innerHTML='';
lbPhotos.forEach((src,i)=>{const t=document.createElement('div');t.className='lb-strip-thumb'+(i===lbIdx?' active':'');t.innerHTML=`<img src="${src}">`;t.onclick=()=>lbGoTo(i);lbStrip.appendChild(t)})}

function lbGoTo(i){if(i===lbIdx)return;lbImg.classList.add('lb-fade');setTimeout(()=>{lbIdx=i;lbImg.src=lbPhotos[lbIdx];lbImg.onload=()=>{lbImg.classList.remove('lb-fade')};lbUpdateCounter();lbUpdateStrip()},150)}

function closeLightbox(){lightbox.classList.remove('open');document.body.style.overflow=''}

document.getElementById('lbClose').onclick=closeLightbox;
lightbox.onclick=e=>{if(e.target===lightbox||e.target.classList.contains('lightbox-main'))closeLightbox()};
document.getElementById('lbPrev').onclick=e=>{e.stopPropagation();lbGoTo((lbIdx-1+lbPhotos.length)%lbPhotos.length)};
document.getElementById('lbNext').onclick=e=>{e.stopPropagation();lbGoTo((lbIdx+1)%lbPhotos.length)};

function openLightbox(p,i){lbPhotos=p;lbIdx=i;lbImg.src=p[i];lbImg.classList.remove('lb-fade');lbUpdateCounter();lbRenderStrip();lightbox.classList.add('open');document.body.style.overflow='hidden'}

/* Keyboard nav for lightbox */
document.addEventListener('keydown',e=>{if(!lightbox.classList.contains('open'))return;if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft')lbGoTo((lbIdx-1+lbPhotos.length)%lbPhotos.length);if(e.key==='ArrowRight')lbGoTo((lbIdx+1)%lbPhotos.length)});

/* Touch swipe for lightbox */
(function(){let sx=0,sy=0;const el=document.getElementById('lightbox');
el.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
el.addEventListener('touchend',e=>{if(!el.classList.contains('open'))return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){if(dx<0)lbGoTo((lbIdx+1)%lbPhotos.length);else lbGoTo((lbIdx-1+lbPhotos.length)%lbPhotos.length)}},{passive:true})})();

/* Profile Nav Rail */
function getNamedGirlIndices(){const named=girls.map((g,i)=>({g,i})).filter(x=>x.g.name&&String(x.g.name).trim().length>0);const filtered=applySharedFilters(named.map(x=>x.g));return named.filter(x=>filtered.includes(x.g)).sort((a,b)=>a.g.name.trim().toLowerCase().localeCompare(b.g.name.trim().toLowerCase())).map(x=>x.i)}
/* Navigate via nav rail — replaceState to avoid history bloat */
function showProfileReplace(idx){const origPush=Router.push;Router.push=Router.replace;try{showProfile(idx)}finally{Router.push=origPush}}
function renderProfileNav(idx){const rail=document.getElementById('profileNavRail');rail.innerHTML='';
const namedIndices=getNamedGirlIndices();const total=namedIndices.length;if(total===0)return;
const posInList=namedIndices.indexOf(idx);const safePos=posInList>=0?posInList:0;
const prevIdx=namedIndices[safePos<=0?total-1:safePos-1];
const nextIdx=namedIndices[safePos>=total-1?0:safePos+1];
const up=document.createElement('button');up.className='pnav-arrow';up.innerHTML='<svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>';up.onclick=()=>showProfileReplace(prevIdx);rail.appendChild(up);
const dots=document.createElement('div');dots.className='pnav-dots';
for(let di=0;di<total;di++){const realIdx=namedIndices[di];const d=document.createElement('button');d.className='pnav-dot'+(realIdx===idx?' active':'');const g=girls[realIdx];d.innerHTML=g.photos&&g.photos.length?`<div class="dot-inner"><img src="${g.photos[0]}"></div>`:`<div class="dot-inner"><span class="dot-letter">${(g.name||'?').charAt(0)}</span></div>`;d.onclick=()=>showProfileReplace(realIdx);dots.appendChild(d)}
rail.appendChild(dots);const ctr=document.createElement('div');ctr.className='pnav-counter';ctr.innerHTML=`<span>${safePos+1}</span> / ${total}`;rail.appendChild(ctr);
const dn=document.createElement('button');dn.className='pnav-arrow';dn.innerHTML='<svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>';dn.onclick=()=>showProfileReplace(nextIdx);rail.appendChild(dn);
/* scroll active dot into view */
const activeDot=dots.querySelector('.pnav-dot.active');if(activeDot)setTimeout(()=>activeDot.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'}),50)}

/* Profile Page */
function renderAlsoAvailable(idx){
const g=girls[idx];if(!g)return;
const ts=fmtDate(getAEDTDate());
const alsoList=girls.filter(o=>{if(!o.name||o.name===g.name)return false;const e=getCalEntry(o.name,ts);return e&&e.start&&e.end}).slice(0,8);
if(!alsoList.length)return;
const sec=document.createElement('div');sec.className='profile-also';
const title=document.createElement('div');title.className='profile-desc-title';title.textContent='Also Available Today';sec.appendChild(title);
const strip=document.createElement('div');strip.className='also-avail-strip';
alsoList.forEach(o=>{const ri=girls.indexOf(o);const liveNow=isAvailableNow(o.name);const card=document.createElement('div');card.className='also-avail-card';const thumb=o.photos&&o.photos.length?`<img src="${o.photos[0]}">`:'<div class="silhouette"></div>';card.innerHTML=`${thumb}<div class="also-avail-name">${o.name}</div>${liveNow?'<span class="avail-now-dot"></span>':''}`;card.onclick=()=>showProfile(ri);strip.appendChild(card)});
sec.appendChild(strip);
document.getElementById('profileContent').appendChild(sec)}

function updateFavBadge(){const b=document.getElementById('navFavBadge');if(!b)return;const c=getFavCount();b.textContent=c>0?c:''}

function favHeartSvg(filled){return filled?'<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>':'<svg viewBox="0 0 24 24"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>'}

function showProfile(idx){safeRender('Profile',()=>{
const g=girls[idx];if(!g)return;currentProfileIdx=idx;if(!g.photos)g.photos=[];
/* URL routing & dynamic title */
const profTitle=g.name?'Ginza – '+g.name:'Ginza – Profile';
document.title=profTitle;
Router.push(Router.pathForProfile(idx),profTitle);
const admin=loggedIn?`<div class="profile-actions"><button class="btn btn-primary" id="profEdit">Edit Profile</button><button class="btn btn-danger" id="profDelete">Delete</button></div>`:'';
const ts=fmtDate(getAEDTDate());const entry=getCalEntry(g.name,ts);
const liveNow=g.name&&isAvailableNow(g.name);
let availHtml='';if(liveNow)availHtml='<span class="dim">|</span><span class="profile-avail-live"><span class="avail-now-dot"></span>Available Now ('+fmtTime12(entry.start)+' - '+fmtTime12(entry.end)+')</span>';
else if(entry&&entry.start&&entry.end)availHtml='<span class="dim">|</span><span style="color:#00c864;font-weight:600">Available Today ('+fmtTime12(entry.start)+' - '+fmtTime12(entry.end)+')</span>';
const stats=[{l:'Age',v:g.age},{l:'Body Size',v:g.body},{l:'Height',v:g.height+' cm'},{l:'Cup Size',v:g.cup},{l:'Rates 30 mins',v:g.val1||'\u2014'},{l:'Rates 45 mins',v:g.val2||'\u2014'},{l:'Rates 60 mins',v:g.val3||'\u2014'},{l:'Experience',v:g.exp||'\u2014'}];
const mainImg=g.photos.length?`<img src="${g.photos[0]}">`:'<div class="silhouette"></div>';
const hasMultiple=g.photos.length>1;
const arrows=hasMultiple?`<button class="gallery-main-arrow prev" id="galPrev"><svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg></button><button class="gallery-main-arrow next" id="galNext"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg></button>`:'';
const counter=g.photos.length?`<div class="gallery-counter" id="galCounter"><span>1</span> / ${g.photos.length}</div>`:'';
const zoomHint=g.photos.length?`<div class="gallery-zoom-hint">Click to expand</div>`:'';
const isFav=g.name&&isFavorite(g.name);
const favBtn=g.name?`<button class="profile-fav-btn${isFav?' active':''}" id="profFavBtn">${favHeartSvg(isFav)}${isFav?'Favorited':'Add to Favorites'}</button>`:'';
document.getElementById('profileContent').innerHTML=`<button class="back-btn" id="backBtn"><svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>Back</button>
<div class="profile-nav-rail" id="profileNavRail"></div>
<div class="profile-layout"><div class="profile-image-area"><div class="gallery-main" id="galMain">${mainImg}${arrows}${counter}${zoomHint}</div><div class="gallery-thumbs" id="galThumbs"></div></div>
<div class="profile-details"><div class="profile-name">${g.name}</div><div class="profile-meta"><span>${g.location}</span><span class="dim">|</span><span>${Array.isArray(g.country)?g.country.join(', '):g.country}</span>${availHtml}</div>${favBtn}<div class="profile-divider" style="margin-top:24px"></div>
<div class="profile-stats">${stats.map(s=>`<div class="profile-stat"><div class="p-label">${s.l}</div><div class="p-val">${s.v}</div></div>`).join('')}</div>
<div class="profile-desc-title">Special Requests</div><div class="profile-desc" style="margin-bottom:24px">${g.special||'\u2014'}</div>
<div class="profile-desc-title">Language</div><div class="profile-desc" style="margin-bottom:24px">${g.lang||'\u2014'}</div>
<div class="profile-desc-title">Type</div><div class="profile-desc" style="margin-bottom:24px">${g.type||'\u2014'}</div>
<div class="profile-desc-title">Description</div><div class="profile-desc">${g.desc}</div>
${g.labels&&g.labels.length?`<div class="profile-desc-title" style="margin-top:24px">Labels</div><div class="profile-labels">${g.labels.map(l=>`<span class="profile-label">${l}</span>`).join('')}</div>`:''}${admin}</div></div>`;
document.getElementById('backBtn').onclick=()=>{if(window.history.length>1){window.history.back()}else{showPage(profileReturnPage)}};
if(loggedIn){document.getElementById('profEdit').onclick=()=>openForm(idx);document.getElementById('profDelete').onclick=()=>openDelete(idx)}
const profFav=document.getElementById('profFavBtn');
if(profFav){profFav.onclick=()=>{const nowFav=toggleFavorite(g.name);profFav.classList.toggle('active',nowFav);profFav.innerHTML=favHeartSvg(nowFav)+(nowFav?'Favorited':'Add to Favorites');updateFavBadge()}}
renderGallery(idx);renderAlsoAvailable(idx);renderProfileNav(idx);closeFilterPanel();_activeFilterPaneId='profileFilterPane';renderFilterPane('profileFilterPane');allPages.forEach(p=>p.classList.remove('active'));document.getElementById('profilePage').classList.add('active');document.querySelectorAll('.nav-dropdown a').forEach(a=>a.classList.remove('active'));updateFilterToggle();window.scrollTo(0,0)})}

/* Profile Gallery */
let galIdx=0;
function galGoTo(idx,photos){
const main=document.getElementById('galMain');if(!main)return;
const img=main.querySelector('img');if(!img)return;
img.classList.add('gallery-fade-out');
setTimeout(()=>{galIdx=idx;img.src=photos[idx];img.onload=()=>img.classList.remove('gallery-fade-out');
const counter=document.getElementById('galCounter');if(counter)counter.innerHTML=`<span>${idx+1}</span> / ${photos.length}`;
const thumbs=document.getElementById('galThumbs');if(thumbs){thumbs.querySelectorAll('.gallery-thumb').forEach((t,i)=>t.classList.toggle('active',i===idx));const active=thumbs.querySelector('.gallery-thumb.active');if(active)active.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})}},180)}

function renderGallery(idx){
const g=girls[idx];if(!g||!g.photos)return;
galIdx=0;
const main=document.getElementById('galMain');
let _galSwipe=false;
/* Touch swipe for photo gallery on mobile */
if(main&&g.photos.length>1){
let sx=0,sy=0;
main.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;_galSwipe=false},{passive:true});
main.addEventListener('touchmove',e=>{if(Math.abs(e.touches[0].clientX-sx)>8)_galSwipe=true},{passive:true});
main.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){if(dx<0)galGoTo((galIdx+1)%g.photos.length,g.photos);else galGoTo((galIdx-1+g.photos.length)%g.photos.length,g.photos)}},{passive:true})}
/* Main image click opens lightbox */
if(main&&g.photos.length){main.onclick=e=>{if(e.target.closest('.gallery-main-arrow'))return;if(_galSwipe){_galSwipe=false;return}openLightbox(g.photos,galIdx)}}
/* Prev/next arrows on main image */
const prevBtn=document.getElementById('galPrev'),nextBtn=document.getElementById('galNext');
if(prevBtn)prevBtn.onclick=e=>{e.stopPropagation();galGoTo((galIdx-1+g.photos.length)%g.photos.length,g.photos)};
if(nextBtn)nextBtn.onclick=e=>{e.stopPropagation();galGoTo((galIdx+1)%g.photos.length,g.photos)};
/* Thumbnails */
const c=document.getElementById('galThumbs');if(!c)return;c.innerHTML='';
g.photos.forEach((src,i)=>{const t=document.createElement('div');t.className='gallery-thumb'+(i===0?' active':'');t.innerHTML=`<img src="${src}">`;
t.onclick=()=>galGoTo(i,g.photos);
if(loggedIn){const rm=document.createElement('button');rm.className='gallery-thumb-remove';rm.innerHTML='&#x2715;';rm.onclick=async e=>{e.stopPropagation();if(src.includes('githubusercontent.com'))await deleteFromGithub(src);g.photos.splice(i,1);await saveData();showProfile(idx);renderGrid();renderRoster();renderHome();showToast('Photo removed')};t.appendChild(rm)}
c.appendChild(t)})}

/* Auth / Login */
const loginIconBtn=document.getElementById('loginIconBtn'),userDropdown=document.getElementById('userDropdown');
function renderDropdown(){
if(loggedIn){loginIconBtn.classList.add('logged-in');userDropdown.innerHTML=`<div class="dropdown-header"><div class="label">Signed in as</div><div class="user">${(loggedInUser||'ADMIN').toUpperCase()}</div></div><button class="dropdown-item danger" id="logoutBtn">Sign Out</button>`;
document.getElementById('logoutBtn').onclick=()=>{loggedIn=false;loggedInUser=null;loginIconBtn.classList.remove('logged-in');userDropdown.classList.remove('open');document.getElementById('navCalendar').style.display='none';document.getElementById('navAnalytics').style.display='none';if(document.getElementById('calendarPage').classList.contains('active')||document.getElementById('analyticsPage').classList.contains('active'))showPage('homePage');renderDropdown();renderFilters();renderGrid();renderRoster();renderHome()}}
else{loginIconBtn.classList.remove('logged-in');userDropdown.innerHTML=`<div class="login-form-inline"><div class="lf-title">Sign In</div><div class="lf-group"><label class="lf-label">Username</label><input class="lf-input" id="lfUser" placeholder="Username" autocomplete="off"></div><div class="lf-group"><label class="lf-label">Password</label><input class="lf-input" id="lfPass" type="password" placeholder="Password"></div><button class="lf-btn" id="lfBtn">Access</button><div class="lf-error" id="lfError"></div></div>`;
document.getElementById('lfBtn').onclick=doLogin;document.getElementById('lfPass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()});document.getElementById('lfUser').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('lfPass').focus()})}}
function doLogin(){const u=document.getElementById('lfUser').value.trim(),p=document.getElementById('lfPass').value;const match=CRED.find(c=>c.user===u&&c.pass===p);
if(match){loggedIn=true;loggedInUser=match.user;document.getElementById('navCalendar').style.display='';document.getElementById('navAnalytics').style.display='';renderDropdown();renderFilters();renderGrid();renderRoster();renderHome();if(document.getElementById('profilePage').classList.contains('active'))showProfile(currentProfileIdx);setTimeout(()=>userDropdown.classList.remove('open'),600);showToast('Signed in as '+match.user.toUpperCase())}
else{document.getElementById('lfError').textContent='Invalid credentials.';document.getElementById('lfPass').value=''}}
loginIconBtn.onclick=e=>{e.stopPropagation();userDropdown.classList.toggle('open')};
document.addEventListener('click',e=>{if(!e.target.closest('#userDropdown')&&!e.target.closest('#loginIconBtn'))userDropdown.classList.remove('open')});
renderDropdown();

/* Particles */
const particlesEl=document.getElementById('particles');for(let i=0;i<30;i++){const p=document.createElement('div');p.className='particle';p.style.left=Math.random()*100+'%';p.style.animationDuration=(8+Math.random()*12)+'s';p.style.animationDelay=Math.random()*10+'s';p.style.width=p.style.height=(1+Math.random()*2)+'px';particlesEl.appendChild(p)}

/* Filter Panel Toggle */
let _activeFilterPaneId=null;
const _filterToggle=document.getElementById('filterToggle');
const _filterBackdrop=document.getElementById('filterBackdrop');
const _pagesWithFilters=['rosterPage','listPage','calendarPage','profilePage'];

function updateFilterToggle(){
const hasPage=_pagesWithFilters.some(id=>{const el=document.getElementById(id);return el&&el.classList.contains('active')});
_filterToggle.classList.toggle('visible',hasPage);
_filterToggle.classList.toggle('has-filters',hasActiveFilters());
}

function openFilterPanel(){
if(!_activeFilterPaneId)return;
const pane=document.getElementById(_activeFilterPaneId);if(!pane)return;
/* Hide all panes first */
['rosterFilterPane','girlsFilterPane','calFilterPane','profileFilterPane'].forEach(fp=>{
const el=document.getElementById(fp);if(el)el.classList.remove('open')});
/* Ensure content is rendered */
renderFilterPane(_activeFilterPaneId);
pane.classList.add('open');
_filterToggle.classList.add('open');
_filterBackdrop.classList.add('open');
}

function closeFilterPanel(){
['rosterFilterPane','girlsFilterPane','calFilterPane','profileFilterPane'].forEach(fp=>{
const el=document.getElementById(fp);if(el)el.classList.remove('open')});
_filterToggle.classList.remove('open');
_filterBackdrop.classList.remove('open');
}

function toggleFilterPanel(){
const isOpen=_filterToggle.classList.contains('open');
if(isOpen)closeFilterPanel();else openFilterPanel();
}

_filterToggle.onclick=toggleFilterPanel;
_filterBackdrop.onclick=closeFilterPanel;

/* Back to Top */
(function(){const btn=document.getElementById('backToTop');if(!btn)return;const targetPages=['rosterPage','listPage','favoritesPage','calendarPage'];
window.addEventListener('scroll',()=>{const active=targetPages.some(id=>{const el=document.getElementById(id);return el&&el.classList.contains('active')});if(active&&window.scrollY>300)btn.classList.add('visible');else btn.classList.remove('visible')});
btn.onclick=()=>window.scrollTo({top:0,behavior:'smooth'})})()