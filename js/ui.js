/* === UI: Nav, Auth, Particles, Home, Lightbox, Profile === */
let currentProfileIdx=0;
let rosterDateFilter=null;var calPending={};
let gridSort='name',gridSortDir='asc';
try{const _ss=localStorage.getItem('ginza_sort');if(_ss){const _sp=JSON.parse(_ss);if(_sp.s)gridSort=_sp.s;if(_sp.d)gridSortDir=_sp.d}}catch(e){}
function _persistSort(){try{localStorage.setItem('ginza_sort',JSON.stringify({s:gridSort,d:gridSortDir}))}catch(e){}}
let ngIdx=0,ngList=[];
let _savedScrollY=0;
let _countdownInterval=null;

/* ── Compare Feature State ── */
let compareSelected=[];
const COMPARE_MAX=5;
function isCompareSelected(name){return compareSelected.includes(name)}
function toggleCompare(name){const idx=compareSelected.indexOf(name);if(idx>=0){compareSelected.splice(idx,1)}else{if(compareSelected.length>=COMPARE_MAX){showToast('Maximum '+COMPARE_MAX+' girls for comparison','error');return false}compareSelected.push(name)}updateCompareBar();updateCompareButtons();return true}
function clearCompare(){compareSelected=[];updateCompareBar();updateCompareButtons()}
function updateCompareBar(){const bar=document.getElementById('compareBar');if(!bar)return;const count=compareSelected.length;const prev=parseInt(bar.dataset.prevCount||'0');bar.dataset.prevCount=count;document.getElementById('compareBarCount').textContent=count;bar.classList.toggle('visible',count>0);if(count>prev&&count>0){bar.classList.remove('compare-pulse');void bar.offsetWidth;bar.classList.add('compare-pulse');setTimeout(()=>bar.classList.remove('compare-pulse'),600)}const openBtn=document.getElementById('compareOpen');if(openBtn){openBtn.disabled=count<2;openBtn.style.opacity=count<2?'.4':'1';openBtn.style.pointerEvents=count<2?'none':'auto'}}
function updateCompareButtons(){const cnt=compareSelected.length;document.querySelectorAll('.card-compare').forEach(btn=>{const name=btn.dataset.compareName;const sel=compareSelected.includes(name);btn.classList.toggle('active',sel);btn.title=sel?'Remove from compare':'Add to compare';const badge=btn.querySelector('.compare-badge');if(badge){badge.textContent=cnt+'/'+COMPARE_MAX;badge.style.display=sel&&cnt>0?'':'none'}})}

/* ── Shared Filter State (resets on refresh) ── */
let sharedFilters={nameSearch:'',country:[],ageMin:null,ageMax:null,bodyMin:null,bodyMax:null,heightMin:null,heightMax:null,cupSize:null,val1Min:null,val1Max:null,val2Min:null,val2Max:null,val3Min:null,val3Max:null,experience:null,ratingMin:null,labels:[]};

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
if(sharedFilters.ratingMin!=null)f=f.filter(g=>{const rvs=g.reviews||[];if(!rvs.length)return false;const avg=rvs.reduce((s,r)=>s+r.rating,0)/rvs.length;return avg>=sharedFilters.ratingMin});
return f}

function hasActiveFilters(){return !!(sharedFilters.nameSearch||sharedFilters.country.length||sharedFilters.ageMin!=null||sharedFilters.ageMax!=null||sharedFilters.bodyMin!=null||sharedFilters.bodyMax!=null||sharedFilters.heightMin!=null||sharedFilters.heightMax!=null||sharedFilters.cupSize||sharedFilters.val1Min!=null||sharedFilters.val1Max!=null||sharedFilters.val2Min!=null||sharedFilters.val2Max!=null||sharedFilters.val3Min!=null||sharedFilters.val3Max!=null||sharedFilters.experience||sharedFilters.ratingMin!=null||sharedFilters.labels.length)}
function countActiveFilters(){let n=0;if(sharedFilters.nameSearch)n++;if(sharedFilters.country.length)n++;if(sharedFilters.ageMin!=null||sharedFilters.ageMax!=null)n++;if(sharedFilters.bodyMin!=null||sharedFilters.bodyMax!=null)n++;if(sharedFilters.heightMin!=null||sharedFilters.heightMax!=null)n++;if(sharedFilters.cupSize)n++;if(sharedFilters.val1Min!=null||sharedFilters.val1Max!=null||sharedFilters.val2Min!=null||sharedFilters.val2Max!=null||sharedFilters.val3Min!=null||sharedFilters.val3Max!=null)n++;if(sharedFilters.experience)n++;if(sharedFilters.ratingMin!=null)n++;if(sharedFilters.labels.length)n++;return n}

function clearAllFilters(){sharedFilters={nameSearch:'',country:[],ageMin:null,ageMax:null,bodyMin:null,bodyMax:null,heightMin:null,heightMax:null,cupSize:null,val1Min:null,val1Max:null,val2Min:null,val2Max:null,val3Min:null,val3Max:null,experience:null,ratingMin:null,labels:[]}}

function filtersToQuery(){const p=new URLSearchParams();if(sharedFilters.nameSearch)p.set('search',sharedFilters.nameSearch);if(sharedFilters.country.length)p.set('country',sharedFilters.country.join(','));if(sharedFilters.ageMin!=null)p.set('ageMin',sharedFilters.ageMin);if(sharedFilters.ageMax!=null)p.set('ageMax',sharedFilters.ageMax);if(sharedFilters.bodyMin!=null)p.set('bodyMin',sharedFilters.bodyMin);if(sharedFilters.bodyMax!=null)p.set('bodyMax',sharedFilters.bodyMax);if(sharedFilters.heightMin!=null)p.set('heightMin',sharedFilters.heightMin);if(sharedFilters.heightMax!=null)p.set('heightMax',sharedFilters.heightMax);if(sharedFilters.cupSize)p.set('cup',sharedFilters.cupSize);if(sharedFilters.val1Min!=null)p.set('v1Min',sharedFilters.val1Min);if(sharedFilters.val1Max!=null)p.set('v1Max',sharedFilters.val1Max);if(sharedFilters.val2Min!=null)p.set('v2Min',sharedFilters.val2Min);if(sharedFilters.val2Max!=null)p.set('v2Max',sharedFilters.val2Max);if(sharedFilters.val3Min!=null)p.set('v3Min',sharedFilters.val3Min);if(sharedFilters.val3Max!=null)p.set('v3Max',sharedFilters.val3Max);if(sharedFilters.experience)p.set('exp',sharedFilters.experience);if(sharedFilters.labels.length)p.set('labels',sharedFilters.labels.join(','));if(sharedFilters.ratingMin!=null)p.set('rating',sharedFilters.ratingMin);if(gridSort!=='name')p.set('sort',gridSort);if(gridSortDir!=='asc')p.set('sortDir',gridSortDir);return p}

function queryToFilters(){const p=new URLSearchParams(window.location.search);if(p.has('search'))sharedFilters.nameSearch=p.get('search');if(p.has('country'))sharedFilters.country=p.get('country').split(',').filter(Boolean);if(p.has('ageMin')){const v=parseFloat(p.get('ageMin'));if(!isNaN(v))sharedFilters.ageMin=v}if(p.has('ageMax')){const v=parseFloat(p.get('ageMax'));if(!isNaN(v))sharedFilters.ageMax=v}if(p.has('bodyMin')){const v=parseFloat(p.get('bodyMin'));if(!isNaN(v))sharedFilters.bodyMin=v}if(p.has('bodyMax')){const v=parseFloat(p.get('bodyMax'));if(!isNaN(v))sharedFilters.bodyMax=v}if(p.has('heightMin')){const v=parseFloat(p.get('heightMin'));if(!isNaN(v))sharedFilters.heightMin=v}if(p.has('heightMax')){const v=parseFloat(p.get('heightMax'));if(!isNaN(v))sharedFilters.heightMax=v}if(p.has('cup'))sharedFilters.cupSize=p.get('cup');if(p.has('v1Min')){const v=parseFloat(p.get('v1Min'));if(!isNaN(v))sharedFilters.val1Min=v}if(p.has('v1Max')){const v=parseFloat(p.get('v1Max'));if(!isNaN(v))sharedFilters.val1Max=v}if(p.has('v2Min')){const v=parseFloat(p.get('v2Min'));if(!isNaN(v))sharedFilters.val2Min=v}if(p.has('v2Max')){const v=parseFloat(p.get('v2Max'));if(!isNaN(v))sharedFilters.val2Max=v}if(p.has('v3Min')){const v=parseFloat(p.get('v3Min'));if(!isNaN(v))sharedFilters.val3Min=v}if(p.has('v3Max')){const v=parseFloat(p.get('v3Max'));if(!isNaN(v))sharedFilters.val3Max=v}if(p.has('exp'))sharedFilters.experience=p.get('exp');if(p.has('labels'))sharedFilters.labels=p.get('labels').split(',').filter(Boolean);if(p.has('rating')){const v=parseFloat(p.get('rating'));if(!isNaN(v))sharedFilters.ratingMin=v}if(p.has('sort')){const VALID=['name','newest','age','body','height','cup','lastSeen'];const s=p.get('sort');if(VALID.includes(s))gridSort=s}if(p.has('sortDir')){const d=p.get('sortDir');if(d==='asc'||d==='desc')gridSortDir=d}}

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
sec.innerHTML=`<div class="fp-title">${title}</div><div class="fp-range"><div class="fp-range-row"><input class="fp-range-input" type="number" placeholder="${r.min}" data-fkey="${minKey}" data-default="${r.rawMin!=null?r.rawMin:''}"${minAttr}${maxAttr} value="${minVal}"><span class="fp-range-sep">${t('fp.rangeSep')}</span><input class="fp-range-input" type="number" placeholder="${r.max}" data-fkey="${maxKey}" data-default="${r.rawMax!=null?r.rawMax:''}"${minAttr}${maxAttr} value="${maxVal}"></div></div>`;
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
sec.innerHTML=`<div class="fp-title">${t('fp.search')}</div><input class="fp-range-input" type="text" data-role="name-search" placeholder="${t('ui.search')}" style="text-align:left;padding:6px 10px;width:100%">`;
pane.appendChild(sec);
const searchInp=sec.querySelector('[data-role="name-search"]');
searchInp.value=sharedFilters.nameSearch||'';
let debounce;
searchInp.addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(()=>{sharedFilters.nameSearch=searchInp.value.trim();renderFilters();renderGrid();renderRoster();if(document.getElementById('calendarPage').classList.contains('active'))renderCalendar();document.querySelectorAll('[data-role="name-search"]').forEach(inp=>{if(inp!==searchInp){inp.value=sharedFilters.nameSearch}})},300)});
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}))}

/* Rating */
{pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
const sec=document.createElement('div');sec.className='fp-section';
sec.innerHTML=`<div class="fp-title">${t('fp.rating')}</div><div class="fp-rating-options"></div>`;
pane.appendChild(sec);
const wrap=sec.querySelector('.fp-rating-options');
for(let star=5;star>=1;star--){
const btn=document.createElement('button');btn.className='fp-option fp-rating-opt'+(sharedFilters.ratingMin===star?' active':'');
const cnt=namedGirls.filter(g=>{const rvs=g.reviews||[];if(!rvs.length)return false;const avg=rvs.reduce((s,r)=>s+r.rating,0)/rvs.length;return avg>=star}).length;
btn.innerHTML=`<span class="fp-check">${sharedFilters.ratingMin===star?'✓':''}</span><span class="fp-rating-stars">${renderStarsStatic(star)}</span><span class="fp-rating-label">& up</span><span class="fp-count">${cnt}</span>`;
btn.onclick=()=>{sharedFilters.ratingMin=sharedFilters.ratingMin===star?null:star;onFiltersChanged()};
wrap.appendChild(btn)}}

/* Country */
if(countries.length){
const sec=document.createElement('div');sec.className='fp-section';
sec.innerHTML=`<div class="fp-title">${t('fp.country')}</div><div class="fp-options"></div>`;
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
pane.appendChild(makeRangeSection(t('fp.age'),'ageMin','ageMax','age'));

/* Body Size */
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
pane.appendChild(makeRangeSection(t('fp.bodySize'),'bodyMin','bodyMax','body'));

/* Height */
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
pane.appendChild(makeRangeSection(t('fp.height'),'heightMin','heightMax','height'));

/* Cup Size */
if(cups.length){
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
const sec=document.createElement('div');sec.className='fp-section';
sec.innerHTML=`<div class="fp-title">${t('fp.cupSize')}</div><div class="fp-options"></div>`;
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
pane.appendChild(makeRangeSection(t('fp.rates30'),'val1Min','val1Max','val1','$'));

/* Rates 45 mins */
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
pane.appendChild(makeRangeSection(t('fp.rates45'),'val2Min','val2Max','val2','$'));

/* Rates 60 mins */
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
pane.appendChild(makeRangeSection(t('fp.rates60'),'val3Min','val3Max','val3','$'));

/* Experience */
if(exps.length){
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
const sec=document.createElement('div');sec.className='fp-section';
sec.innerHTML=`<div class="fp-title">${t('fp.experience')}</div><div class="fp-options"></div>`;
pane.appendChild(sec);
const wrap=sec.querySelector('.fp-options');
exps.forEach(e=>{
const btn=document.createElement('button');btn.className='fp-option'+(sharedFilters.experience===e?' active':'');
const cnt=namedGirls.filter(g=>g.exp===e).length;
const eLabel=e==='Experienced'?t('exp.experienced'):e==='Inexperienced'?t('exp.inexperienced'):e;
btn.innerHTML=`<span class="fp-check">${sharedFilters.experience===e?'✓':''}</span>${eLabel}<span class="fp-count">${cnt}</span>`;
btn.onclick=()=>{sharedFilters.experience=sharedFilters.experience===e?null:e;onFiltersChanged()};
wrap.appendChild(btn)})}

/* Labels */
if(labels.length){
pane.appendChild(Object.assign(document.createElement('div'),{className:'fp-divider'}));
const sec=document.createElement('div');sec.className='fp-section';
sec.innerHTML=`<div class="fp-title">${t('fp.labels')}</div><div class="fp-options"></div>`;
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
const clr=document.createElement('button');clr.className='fp-clear';clr.textContent=t('fp.clearAll');
clr.onclick=()=>{clearAllFilters();onFiltersChanged()};
pane.appendChild(clr)}

/* Bind range inputs */
pane.querySelectorAll('.fp-range-input').forEach(inp=>{
let debounce;
function clampAndApply(){const key=inp.dataset.fkey;let val=inp.value.trim();if(val===''){sharedFilters[key]=null}else{let num=parseFloat(val);if(isNaN(num)){sharedFilters[key]=null;return}const lo=inp.hasAttribute('min')?parseFloat(inp.min):null;const hi=inp.hasAttribute('max')?parseFloat(inp.max):null;if(lo!=null&&num<lo){num=lo;inp.value=num}if(hi!=null&&num>hi){num=hi;inp.value=num}const def=inp.dataset.default;sharedFilters[key]=(def!==''&&num===parseFloat(def))?null:num}onFiltersChanged()}
inp.addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(clampAndApply,400)});
inp.addEventListener('blur',clampAndApply)})}
function renderActiveFilterChips(){
const bar=document.getElementById('activeFilterChips');if(!bar)return;
const chips=[];
if(sharedFilters.nameSearch)chips.push({label:'🔍 '+sharedFilters.nameSearch,rm:()=>{sharedFilters.nameSearch='';onFiltersChanged()}});
sharedFilters.country.forEach(c=>chips.push({label:c,rm:()=>{sharedFilters.country=sharedFilters.country.filter(x=>x!==c);onFiltersChanged()}}));
if(sharedFilters.ageMin!=null||sharedFilters.ageMax!=null)chips.push({label:'Age '+(sharedFilters.ageMin??'')+'–'+(sharedFilters.ageMax??''),rm:()=>{sharedFilters.ageMin=null;sharedFilters.ageMax=null;onFiltersChanged()}});
if(sharedFilters.bodyMin!=null||sharedFilters.bodyMax!=null)chips.push({label:'Body '+(sharedFilters.bodyMin??'')+'–'+(sharedFilters.bodyMax??''),rm:()=>{sharedFilters.bodyMin=null;sharedFilters.bodyMax=null;onFiltersChanged()}});
if(sharedFilters.heightMin!=null||sharedFilters.heightMax!=null)chips.push({label:'Height '+(sharedFilters.heightMin??'')+'–'+(sharedFilters.heightMax??''),rm:()=>{sharedFilters.heightMin=null;sharedFilters.heightMax=null;onFiltersChanged()}});
if(sharedFilters.cupSize)chips.push({label:'Cup '+sharedFilters.cupSize,rm:()=>{sharedFilters.cupSize=null;onFiltersChanged()}});
if(sharedFilters.val1Min!=null||sharedFilters.val1Max!=null)chips.push({label:'30min '+(sharedFilters.val1Min??'')+'–'+(sharedFilters.val1Max??''),rm:()=>{sharedFilters.val1Min=null;sharedFilters.val1Max=null;onFiltersChanged()}});
if(sharedFilters.val2Min!=null||sharedFilters.val2Max!=null)chips.push({label:'45min '+(sharedFilters.val2Min??'')+'–'+(sharedFilters.val2Max??''),rm:()=>{sharedFilters.val2Min=null;sharedFilters.val2Max=null;onFiltersChanged()}});
if(sharedFilters.val3Min!=null||sharedFilters.val3Max!=null)chips.push({label:'60min '+(sharedFilters.val3Min??'')+'–'+(sharedFilters.val3Max??''),rm:()=>{sharedFilters.val3Min=null;sharedFilters.val3Max=null;onFiltersChanged()}});
if(sharedFilters.experience)chips.push({label:sharedFilters.experience,rm:()=>{sharedFilters.experience=null;onFiltersChanged()}});
if(sharedFilters.ratingMin!=null)chips.push({label:'★ '+sharedFilters.ratingMin+'+ stars',rm:()=>{sharedFilters.ratingMin=null;onFiltersChanged()}});
sharedFilters.labels.forEach(l=>chips.push({label:l,rm:()=>{sharedFilters.labels=sharedFilters.labels.filter(x=>x!==l);onFiltersChanged()}}));
bar.innerHTML='';
if(!chips.length){bar.style.display='none';return}
bar.style.display='flex';
chips.forEach(c=>{const ch=document.createElement('button');ch.className='active-filter-chip';ch.innerHTML=c.label+' <span class="chip-x">×</span>';ch.onclick=c.rm;bar.appendChild(ch)});
const clr=document.createElement('button');clr.className='active-filter-chip chip-clear-all';clr.textContent=t('fp.clearAll');clr.onclick=()=>{clearAllFilters();onFiltersChanged()};bar.appendChild(clr);
}
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
if(focusPaneId){const restored=document.getElementById(focusPaneId);if(restored){const inp=restored.querySelector('[data-role="name-search"]');if(inp){inp.focus();inp.setSelectionRange(cursorPos,cursorPos)}}};renderActiveFilterChips()}
const allPages=['homePage','rosterPage','listPage','favoritesPage','valuePage','employmentPage','calendarPage','analyticsPage','profileDbPage','profilePage'].map(id=>document.getElementById(id));

function showPage(id){
resetOgMeta();if(document.getElementById('calendarPage').classList.contains('active')&&id!=='calendarPage'){flushCalSave();let s=false;for(const n in calPending)for(const dt in calPending[n])if(calPending[n][dt]&&calData[n]&&calData[n][dt]){delete calData[n][dt];s=true}if(s){saveCalData();renderRoster();renderGrid()}calPending={}}
const prev=document.querySelector('.page.active');const next=document.getElementById(id);const _ec=['page-enter','slide-enter-right','slide-enter-left'];next.classList.remove(..._ec);if(prev&&prev!==next){const fromProfile=prev.id==='profilePage';const exitCls=fromProfile?'slide-exit-right':'page-exit';const enterCls=fromProfile?'slide-enter-left':'page-enter';prev.classList.remove('active',..._ec);prev.classList.add(exitCls);const onDone=()=>{prev.classList.remove(exitCls);prev.removeEventListener('animationend',onDone)};prev.addEventListener('animationend',onDone);setTimeout(()=>{prev.classList.remove(exitCls)},400);void next.offsetWidth;next.classList.add(enterCls)}else{allPages.forEach(p=>p.classList.remove('active',..._ec));next.classList.add('page-enter')}next.classList.add('active');
closeFilterPanel();
_kbFocusedCardIdx=-1;document.querySelectorAll('.girl-card.kb-focused').forEach(c=>c.classList.remove('kb-focused'));
/* URL routing & dynamic title */
const titleMap={homePage:'Ginza Empire',rosterPage:'Ginza Empire – Roster',listPage:'Ginza Empire – Girls',favoritesPage:'Ginza Empire – Favorites',valuePage:'Ginza Empire – Rates',employmentPage:'Ginza Empire – Employment',calendarPage:'Ginza Empire – Calendar',analyticsPage:'Ginza Empire – Analytics',profileDbPage:'Ginza Empire – Profile Database'};
const pageTitle=titleMap[id]||'Ginza Empire';
document.title=pageTitle;
announce(pageTitle.replace('Ginza Empire – ','').replace('Ginza Empire','Home'));
Router.push(Router.pathForPage(id),pageTitle);
/* Determine which filter pane is active for this page */
const paneMap={rosterPage:'rosterFilterPane',listPage:'girlsFilterPane',calendarPage:'calFilterPane',profilePage:'profileFilterPane'};
_activeFilterPaneId=paneMap[id]||null;
document.querySelectorAll('.nav-dropdown a').forEach(a=>a.classList.remove('active'));
const _bnMap={homePage:'bnHome',rosterPage:'bnRoster',listPage:'bnGirls',favoritesPage:'bnFavorites'};
document.querySelectorAll('.bottom-nav-item').forEach(b=>b.classList.remove('active'));
const _bnId=_bnMap[id];if(_bnId){const _bn=document.getElementById(_bnId);if(_bn)_bn.classList.add('active')}
if(id==='homePage'){document.getElementById('navHome').classList.add('active');renderHome()}
if(id==='rosterPage'){document.getElementById('navRoster').classList.add('active');renderFilterPane('rosterFilterPane');renderRoster()}
if(id==='listPage'){document.getElementById('navGirls').classList.add('active');renderFilterPane('girlsFilterPane');renderGrid()}
if(id==='favoritesPage'){document.getElementById('navFavorites').classList.add('active');renderFavoritesGrid()}
if(id==='valuePage'){document.getElementById('navValue').classList.add('active');renderValueTable()}
if(id==='employmentPage'){document.getElementById('navEmployment').classList.add('active')}
if(id==='calendarPage'){document.getElementById('navCalendar').classList.add('active');calPending={};renderFilterPane('calFilterPane');renderCalendar()}
if(id==='analyticsPage'){document.getElementById('navAnalytics').classList.add('active');if(typeof renderAnalytics==='function')renderAnalytics()}
if(id==='profileDbPage'){document.getElementById('navProfileDb').classList.add('active');if(typeof renderProfileDb==='function')renderProfileDb()}
updateFilterToggle();
if(_pagesWithFilters.includes(id))pushFiltersToURL();
window.scrollTo(0,0)}

document.getElementById('navHome').onclick=e=>{e.preventDefault();showPage('homePage')};
document.getElementById('navRoster').onclick=e=>{e.preventDefault();showPage('rosterPage')};
document.getElementById('navGirls').onclick=e=>{e.preventDefault();showPage('listPage')};
document.getElementById('navFavorites').onclick=e=>{e.preventDefault();showPage('favoritesPage')};
/* Bottom nav */
document.getElementById('bnHome').onclick=()=>showPage('homePage');
document.getElementById('bnRoster').onclick=()=>showPage('rosterPage');
document.getElementById('bnGirls').onclick=()=>showPage('listPage');
document.getElementById('bnFavorites').onclick=()=>showPage('favoritesPage');
document.getElementById('navValue').onclick=e=>{e.preventDefault();showPage('valuePage')};
document.getElementById('navEmployment').onclick=e=>{e.preventDefault();showPage('employmentPage')};
document.getElementById('navCalendar').onclick=e=>{e.preventDefault();showPage('calendarPage')};
document.getElementById('navAnalytics').onclick=e=>{e.preventDefault();showPage('analyticsPage')};
document.getElementById('navProfileDb').onclick=e=>{e.preventDefault();showPage('profileDbPage')};

/* Nav Dropdown Menu Toggle */
const navMenuBtn=document.getElementById('navMenuBtn');
const navDropdown=document.getElementById('navDropdown');
navMenuBtn.onclick=()=>{const o=navMenuBtn.classList.toggle('open');navDropdown.classList.toggle('open');navMenuBtn.setAttribute('aria-expanded',String(o))};
function closeNavMenu(){navMenuBtn.classList.remove('open');navDropdown.classList.remove('open');navMenuBtn.setAttribute('aria-expanded','false')}
navDropdown.querySelectorAll('a').forEach(a=>{const orig=a.onclick;a.addEventListener('click',()=>closeNavMenu())});
document.addEventListener('click',e=>{if(!e.target.closest('.nav-menu-wrap'))closeNavMenu()});

/* Admin calendar stubs — real implementations loaded via admin.js */
function findExistingTimes(){return null}
function closeCopyTimeModal(){}
function showCopyTimePrompt(n,d,s,e){return loadAdminModule().then(function(){return showCopyTimePrompt(n,d,s,e)})}
function openCopyDayModal(){loadAdminModule().then(function(){openCopyDayModal()})}
function openBulkTimeModal(name){loadAdminModule().then(function(){openBulkTimeModal(name)})}

/* Home Page */
function getNewGirls(){const now=getAEDTDate();const cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-28);return girls.filter(g=>{if(!isAdmin()&&g.hidden)return false;if(!g.startDate)return false;const sd=new Date(g.startDate+'T00:00:00');return sd>=cutoff&&sd<=now})}

function renderAvailNowWidget(){
const container=document.getElementById('homeAvailNow');if(!container)return;
const avail=girls.filter(g=>!g.hidden&&isAvailableNow(g.name));
if(!avail.length){container.style.display='none';container.innerHTML='';return}
container.style.display='';
const countLabel=avail.length===1?t('home.girlSingular'):t('home.girlPlural').replace('{n}',avail.length);
let html=`<div class="avail-now-header"><span class="avail-now-dot"></span><span class="avail-now-title">${countLabel} Available Now</span></div><div class="avail-now-strip">`;
avail.forEach(g=>{const ri=girls.indexOf(g);const photo=g.photos&&g.photos.length?g.photos[0]:'';const cd=getAvailCountdown(g.name);const cdText=cd&&cd.type==='until_end'?cd.display:'';
html+=`<div class="avail-now-card" data-idx="${ri}"><div class="anw-photo">${photo?`<img src="${photo}" alt="${g.name}">`:'<div class="anw-placeholder"></div>'}</div><div class="anw-name">${g.name}</div>${cdText?`<div class="anw-countdown">${cdText}</div>`:''}</div>`});
html+='</div>';container.innerHTML=html;
container.querySelectorAll('.avail-now-card').forEach(c=>c.onclick=()=>{const idx=parseInt(c.dataset.idx);if(!isNaN(idx)){profileReturnPage='homePage';showProfile(idx)}})}

function renderHome(){safeRender('Home',()=>{
const c=document.getElementById('homeImages');c.innerHTML='';
const baseUrl='https://raw.githubusercontent.com/sydneyginza/sydneyginza.github.io/main/Images/Homepage/Homepage_';
for(let i=1;i<=4;i++){const card=document.createElement('div');card.className='home-img-card';card.style.cursor='default';card.innerHTML=`<img src="${baseUrl}${i}.jpg" alt="Ginza venue photo ${i}">`;c.appendChild(card)}
document.getElementById('homeAnnounce').innerHTML=getSeasonalBanner()+'<p></p>';
ngList=getNewGirls();ngIdx=0;renderNewGirls();renderAvailNowWidget();renderRecentlyViewed();
/* Scroll reveals for below-fold home sections */
const _sr=[document.querySelector('#homePage .home-mid'),document.getElementById('homeWelcomeEn'),document.querySelector('[data-i18n="home.location"]'),document.getElementById('homeLocation'),document.getElementById('homeMap'),document.querySelector('[data-i18n="home.hours"]'),document.getElementById('homeHours')].filter(Boolean);_sr.forEach(el=>{el.classList.add('scroll-reveal');el.classList.remove('revealed')});if(window._homeRevealObs)window._homeRevealObs.disconnect();window._homeRevealObs=new IntersectionObserver((entries,obs)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');obs.unobserve(e.target)}})},{threshold:0.12,rootMargin:'0px 0px -60px 0px'});_sr.forEach(el=>window._homeRevealObs.observe(el))})}

function renderRecentlyViewed(containerId='homeRecentlyViewed',returnPage='homePage'){
const container=document.getElementById(containerId);if(!container)return;
const rv=getRecentlyViewed();
const valid=rv.map(r=>{const gi=girls.findIndex(g=>g.name===r.name);return gi>=0?{g:girls[gi],idx:gi}:null}).filter(v=>v&&(isAdmin()||!v.g.hidden));
if(!valid.length){container.style.display='none';return}
container.style.display='';
const clearId='rvClearBtn_'+containerId;
let html=`<div class="rv-header"><div class="profile-desc-title">${t('rv.title')}</div><button class="rv-clear-btn" id="${clearId}">${t('rv.clear')}</button></div><div class="also-avail-strip">`;
valid.forEach(({g,idx})=>{const liveNow=g.name&&isAvailableNow(g.name);const thumb=g.photos&&g.photos.length?`<img src="${g.photos[0]}" alt="${(g.name||'').replace(/"/g,'&quot;')}">`:'<div class="silhouette"></div>';html+=`<div class="also-avail-card" data-rv-idx="${idx}">${thumb}<div class="also-avail-name">${g.name}</div>${liveNow?'<span class="avail-now-dot"></span>':''}</div>`});
html+='</div>';container.innerHTML=html;
container.querySelectorAll('.also-avail-card').forEach(card=>{card.onclick=()=>{_savedScrollY=window.scrollY;sessionStorage.setItem('ginza_scroll',window.scrollY);profileReturnPage=returnPage;showProfile(parseInt(card.dataset.rvIdx))}});
const clearBtn=document.getElementById(clearId);if(clearBtn)clearBtn.onclick=()=>{clearRecentlyViewed();renderRecentlyViewed(containerId,returnPage)}}

function renderNewGirls(){
const nav=document.getElementById('ngNav'),disp=document.getElementById('ngDisplay');nav.innerHTML='';disp.innerHTML='';
if(!ngList.length){disp.innerHTML='<div class="ng-empty">No new girls this month</div>';return}
if(ngIdx>=ngList.length)ngIdx=0;if(ngIdx<0)ngIdx=ngList.length-1;
const up=document.createElement('button');up.className='ng-arrow';up.innerHTML='<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>';up.onclick=()=>{ngIdx=(ngIdx-1+ngList.length)%ngList.length;renderNewGirls()};nav.appendChild(up);
const dots=document.createElement('div');dots.className='ng-dots';const mx=3;let st=Math.max(0,ngIdx-Math.floor(mx/2)),en=Math.min(ngList.length,st+mx);if(en-st<mx)st=Math.max(0,en-mx);
for(let i=st;i<en;i++){const dot=document.createElement('button');dot.className='ng-dot'+(i===ngIdx?' active':'');const g=ngList[i];dot.innerHTML=g.photos&&g.photos.length?`<img src="${g.photos[0]}" alt="${g.name}">`:`<span>${g.name.charAt(0)}</span>`;dot.onclick=()=>{ngIdx=i;renderNewGirls()};dots.appendChild(dot)}
nav.appendChild(dots);const ctr=document.createElement('div');ctr.className='ng-counter';ctr.innerHTML=`<span>${ngIdx+1}</span> / ${ngList.length}`;nav.appendChild(ctr);
const dn=document.createElement('button');dn.className='ng-arrow';dn.innerHTML='<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>';dn.onclick=()=>{ngIdx=(ngIdx+1)%ngList.length;renderNewGirls()};nav.appendChild(dn);
const g=ngList[ngIdx],ri=girls.indexOf(g);const photo=g.photos&&g.photos.length?`<img src="${g.photos[0]}" alt="${g.name}">`:'<div class="ng-placeholder"></div>';
disp.innerHTML=`<div class="ng-card"><div class="ng-photo" data-idx="${ri}" style="cursor:pointer">${photo}</div><a class="ng-name" data-idx="${ri}">${g.name}</a></div>`;
disp.querySelector('.ng-photo').onclick=()=>{_savedScrollY=window.scrollY;sessionStorage.setItem('ginza_scroll',window.scrollY);profileReturnPage='homePage';showProfile(ri)};
disp.querySelector('.ng-name').onclick=()=>{_savedScrollY=window.scrollY;sessionStorage.setItem('ginza_scroll',window.scrollY);profileReturnPage='homePage';showProfile(ri)}}

/* Home Search Bar */
(function(){const inp=document.getElementById('homeSearchInput'),btn=document.getElementById('homeSearchBtn');if(!inp||!btn)return;function doHomeSearch(){const q=inp.value.trim();if(!q)return;sharedFilters.nameSearch=q;showPage('listPage');inp.value=''}inp.addEventListener('keydown',e=>{if(e.key==='Enter')doHomeSearch()});btn.onclick=doHomeSearch})();

/* Lightbox */
let lbPhotos=[],lbIdx=0,lbName='';
const lightbox=document.getElementById('lightbox'),lbImg=document.getElementById('lbImg'),lbStrip=document.getElementById('lbStrip'),lbCounter=document.getElementById('lbCounter');

function lbUpdateCounter(){lbCounter.innerHTML=`<span>${lbIdx+1}</span> / ${lbPhotos.length}`}

function lbUpdateStrip(){lbStrip.querySelectorAll('.lb-strip-thumb').forEach((t,i)=>{t.classList.toggle('active',i===lbIdx)});
const active=lbStrip.querySelector('.lb-strip-thumb.active');if(active)active.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})}

function lbRenderStrip(){lbStrip.innerHTML='';
lbPhotos.forEach((src,i)=>{const t=document.createElement('div');t.className='lb-strip-thumb'+(i===lbIdx?' active':'');t.innerHTML=`<img src="${src}" alt="${(lbName||'Photo '+(i+1)).replace(/"/g,'&quot;')}">`;t.onclick=()=>lbGoTo(i);lbStrip.appendChild(t)})}

function lbGoTo(i){if(i===lbIdx)return;lbImg.classList.add('lb-fade');setTimeout(()=>{lbIdx=i;lbImg.src=lbPhotos[lbIdx];lbImg.alt=lbName||'';lbImg.onload=()=>{lbImg.classList.remove('lb-fade')};lbUpdateCounter();lbUpdateStrip()},150)}

function closeLightbox(){lightbox.classList.remove('open');document.body.style.overflow=''}

document.getElementById('lbClose').onclick=closeLightbox;
lightbox.onclick=e=>{if(e.target===lightbox||e.target.classList.contains('lightbox-main'))closeLightbox()};
document.getElementById('lbPrev').onclick=e=>{e.stopPropagation();lbGoTo((lbIdx-1+lbPhotos.length)%lbPhotos.length)};
document.getElementById('lbNext').onclick=e=>{e.stopPropagation();lbGoTo((lbIdx+1)%lbPhotos.length)};

function openLightbox(p,i,name){lbPhotos=p;lbIdx=i;lbName=name||'';lbImg.src=p[i];lbImg.alt=lbName||'';lbImg.classList.remove('lb-fade');lbUpdateCounter();lbRenderStrip();lightbox.classList.add('open');document.body.style.overflow='hidden'}

/* Keyboard nav for lightbox */
document.addEventListener('keydown',e=>{if(!lightbox.classList.contains('open'))return;if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft')lbGoTo((lbIdx-1+lbPhotos.length)%lbPhotos.length);if(e.key==='ArrowRight')lbGoTo((lbIdx+1)%lbPhotos.length)});

/* Touch swipe for lightbox */
(function(){let sx=0,sy=0;const el=document.getElementById('lightbox');
el.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
el.addEventListener('touchend',e=>{if(!el.classList.contains('open'))return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){if(dx<0)lbGoTo((lbIdx+1)%lbPhotos.length);else lbGoTo((lbIdx-1+lbPhotos.length)%lbPhotos.length)}},{passive:true})})();

/* ── Compare Modal ── */
function _compareBarHtml(val,min,max,rank){
  if(isNaN(val)||min===null||max===null)return '';
  const pct=max===min?50:((val-min)/(max-min))*100;
  const cls=rank==='lo'?'compare-bar-lo':rank==='hi'?'compare-bar-hi':'compare-bar-mid';
  return `<div class="compare-bar-track"><div class="compare-bar-fill ${cls}" style="width:${pct}%"></div></div>`;
}
function openCompareModal(){
if(compareSelected.length<2)return;
const overlay=document.getElementById('compareOverlay'),grid=document.getElementById('compareGrid');
if(!overlay||!grid)return;
const sel=compareSelected.map(name=>girls.find(g=>g.name===name)).filter(Boolean);
if(sel.length<2)return;
const stats=[
{label:t('fp.country'),fn:g=>Array.isArray(g.country)?g.country.join(', '):(g.country||'\u2014')},
{label:t('field.age'),fn:g=>g.age||'\u2014',raw:g=>parseFloat(g.age)},
{label:t('fp.height'),fn:g=>g.height?(g.height+' cm'):'\u2014',raw:g=>parseFloat(g.height)},
{label:t('field.body'),fn:g=>g.body||'\u2014',raw:g=>parseFloat(g.body)},
{label:t('fp.cupSize'),fn:g=>g.cup||'\u2014',alpha:g=>g.cup?g.cup.trim().charAt(0).toUpperCase():null},
{label:t('field.rates30'),fn:g=>g.val1?('$'+g.val1):'\u2014',raw:g=>parseFloat(g.val1)},
{label:t('field.rates45'),fn:g=>g.val2?('$'+g.val2):'\u2014',raw:g=>parseFloat(g.val2)},
{label:t('field.rates60'),fn:g=>g.val3?('$'+g.val3):'\u2014',raw:g=>parseFloat(g.val3)},
{label:t('field.experience'),fn:g=>g.exp||'\u2014',fixedColor:g=>g.exp==='Experienced'?'#00c864':g.exp==='Inexperienced'?'#ff4d4d':null}
];
/* Desktop table */
let html='<table class="compare-stat-table compare-desktop"><thead><tr><th></th>';
sel.forEach(g=>{const photo=g.photos&&g.photos.length?`<img src="${g.photos[0]}" class="compare-col-photo" alt="${g.name.replace(/"/g,'&quot;')}">`:'<div class="compare-col-photo-placeholder"></div>';html+=`<th style="text-align:center;padding-bottom:16px;vertical-align:bottom">${photo}<div class="compare-col-name">${g.name}</div></th>`});
html+='</tr></thead><tbody>';
stats.forEach(s=>{html+='<tr>';html+=`<td>${s.label}</td>`;if(s.raw){const vals=sel.map(g=>s.raw(g));const valid=vals.filter(v=>!isNaN(v));const hi=valid.length?Math.max(...valid):null;const lo=valid.length?Math.min(...valid):null;sel.forEach((g,i)=>{const v=vals[i];const rank=!isNaN(v)&&hi!==null&&lo!==null&&hi!==lo?(v===lo?'lo':v===hi?'hi':'mid'):null;const clr=rank==='lo'?'color:#00c864;font-weight:600':rank==='hi'?'color:#ff4d4d;font-weight:600':'';html+=`<td><span${clr?` style="${clr}"`:''} >${s.fn(g)}</span>${_compareBarHtml(v,lo,hi,rank)}</td>`})}else if(s.alpha){const vals=sel.map(g=>s.alpha(g));const valid=[...new Set(vals.filter(Boolean))].sort();const hi=valid.length?valid[valid.length-1]:null;const lo=valid.length?valid[0]:null;sel.forEach((g,i)=>{const v=vals[i];let style='';if(v&&hi&&lo&&hi!==lo){if(v===hi)style=' style="color:#ff4d4d;font-weight:600"';else if(v===lo)style=' style="color:#00c864;font-weight:600"'}html+=`<td${style}>${s.fn(g)}</td>`})}else if(s.fixedColor){sel.forEach(g=>{const c=s.fixedColor(g);html+=`<td${c?` style="color:${c};font-weight:600"`:''}>${s.fn(g)}</td>`})}else{sel.forEach(g=>{html+=`<td>${s.fn(g)}</td>`})}html+='</tr>'});
html+='</tbody></table>';
/* Mobile cards */
html+='<div class="compare-mobile-cards">';
sel.forEach(g=>{const photo=g.photos&&g.photos.length?`<img src="${g.photos[0]}" alt="${g.name.replace(/"/g,'&quot;')}">`:'';
html+=`<div class="compare-mobile-card"><div class="cmc-header">${photo}<div class="cmc-name">${g.name}</div></div><div class="cmc-stats">`;
stats.forEach(s=>{html+=`<div class="cmc-row"><span class="cmc-label">${s.label}</span><span class="cmc-value">${s.fn(g)}</span></div>`});
html+=`</div></div>`});
html+='</div>';
/* Labels comparison */
const allLabels=new Set();sel.forEach(g=>{if(g.labels)g.labels.forEach(l=>allLabels.add(l))});
if(allLabels.size){const shared=[...allLabels].filter(l=>sel.every(g=>g.labels&&g.labels.includes(l))).sort();const unique=[...allLabels].filter(l=>!sel.every(g=>g.labels&&g.labels.includes(l))).sort();
html+=`<div class="compare-labels-section">`;
if(shared.length)html+=`<div class="compare-labels-group"><div class="compare-labels-title">${t('compare.sharedLabels')}</div><div class="compare-labels-list">${shared.map(l=>`<span class="compare-label shared">${l}</span>`).join('')}</div></div>`;
if(unique.length)html+=`<div class="compare-labels-group"><div class="compare-labels-title">${t('compare.uniqueLabels')}</div><div class="compare-labels-list">${unique.map(l=>`<span class="compare-label unique">${l}</span>`).join('')}</div></div>`;
html+=`</div>`}
/* Availability timeline */
const today=fmtDate(getAEDTDate());const entries=sel.map(g=>({name:g.name,entry:getCalEntry(g.name,today)}));const hasAnySchedule=entries.some(e=>e.entry&&e.entry.start&&e.entry.end);
if(hasAnySchedule){
const nowDate=getAEDTDate();const nowHr=nowDate.getHours()+nowDate.getMinutes()/60;
const tlStart=10,tlEnd=26;/* 10am to 2am next day (26h) */
html+=`<div class="compare-timeline"><div class="compare-tl-title">${t('compare.todaySchedule')}</div><div class="compare-tl-hours">`;
for(let h=tlStart;h<=tlEnd;h+=2)html+=`<span class="compare-tl-hour">${h>24?(h-24):h>12?h-12:h===0?12:h}${h>=12&&h<24?'p':'a'}</span>`;
html+=`</div>`;
entries.forEach(e=>{const ent=e.entry;html+=`<div class="compare-tl-row"><span class="compare-tl-name">${e.name}</span><div class="compare-tl-track">`;
if(ent&&ent.start&&ent.end){const[sh,sm]=ent.start.split(':').map(Number);const[eh,em]=ent.end.split(':').map(Number);let s=sh+sm/60,en=eh+em/60;if(en<s)en+=24;
const left=Math.max(0,(s-tlStart)/(tlEnd-tlStart)*100);const width=Math.min(100-left,(en-Math.max(s,tlStart))/(tlEnd-tlStart)*100);
html+=`<div class="compare-tl-bar" style="left:${left}%;width:${width}%"></div>`}
/* Now marker */
let nowPos=(nowHr<tlStart?nowHr+24:nowHr);const nowPct=(nowPos-tlStart)/(tlEnd-tlStart)*100;
if(nowPct>=0&&nowPct<=100)html+=`<div class="compare-tl-now" style="left:${nowPct}%"></div>`;
html+=`</div></div>`});
html+=`</div>`}
grid.innerHTML=html;
overlay.classList.add('open');document.body.style.overflow='hidden'}
function closeCompareModal(){const overlay=document.getElementById('compareOverlay');if(overlay)overlay.classList.remove('open');document.body.style.overflow=''}
(function(){const cl=document.getElementById('compareClear'),op=document.getElementById('compareOpen'),cs=document.getElementById('compareClose'),dn=document.getElementById('compareDone'),ov=document.getElementById('compareOverlay');
if(cl)cl.onclick=clearCompare;if(op)op.onclick=openCompareModal;if(cs)cs.onclick=closeCompareModal;if(dn)dn.onclick=closeCompareModal;
if(ov)ov.onclick=e=>{if(e.target===ov)closeCompareModal()};
document.addEventListener('keydown',e=>{if(ov&&ov.classList.contains('open')&&e.key==='Escape')closeCompareModal()})})();

/* Profile Nav Rail */
function getNamedGirlIndices(){const named=girls.map((g,i)=>({g,i})).filter(x=>x.g.name&&String(x.g.name).trim().length>0&&(isAdmin()||!x.g.hidden));const filtered=applySharedFilters(named.map(x=>x.g));const result=named.filter(x=>filtered.includes(x.g));const sorted=applySortOrder(result.map(x=>x.g));return sorted.map(g=>result.find(x=>x.g===g).i)}
/* Navigate via nav rail — replaceState to avoid history bloat */
function showProfileReplace(idx){const origPush=Router.push;Router.push=Router.replace;try{showProfile(idx)}finally{Router.push=origPush}}
function renderProfileNav(idx){const rail=document.getElementById('profileNavRail');rail.innerHTML='';
const namedIndices=getNamedGirlIndices();const total=namedIndices.length;if(total===0)return;
const posInList=namedIndices.indexOf(idx);const safePos=posInList>=0?posInList:0;
const prevIdx=namedIndices[safePos<=0?total-1:safePos-1];
const nextIdx=namedIndices[safePos>=total-1?0:safePos+1];
[prevIdx,nextIdx].forEach(pi=>{const pg=girls[pi];if(!pg||!pg.photos||!pg.photos.length)return;const src=pg.photos[0];if(!src||src.startsWith('data:'))return;const eid='pfetch-'+pi;if(!document.getElementById(eid)){const lk=document.createElement('link');lk.rel='prefetch';lk.as='image';lk.href=src;lk.id=eid;document.head.appendChild(lk)}});
const up=document.createElement('button');up.className='pnav-arrow';up.innerHTML='<svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>';up.onclick=()=>showProfileReplace(prevIdx);rail.appendChild(up);
const dots=document.createElement('div');dots.className='pnav-dots';
for(let di=0;di<total;di++){const realIdx=namedIndices[di];const d=document.createElement('button');d.className='pnav-dot'+(realIdx===idx?' active':'')+(girls[realIdx].hidden?' pnav-dot-hidden':'');const g=girls[realIdx];d.innerHTML=g.photos&&g.photos.length?`<div class="dot-inner"><img src="${g.photos[0]}" alt="${(g.name||'').replace(/"/g,'&quot;')}"></div>`:`<div class="dot-inner"><span class="dot-letter">${(g.name||'?').charAt(0)}</span></div>`;d.onclick=()=>showProfileReplace(realIdx);dots.appendChild(d)}
rail.appendChild(dots);const ctr=document.createElement('div');ctr.className='pnav-counter';ctr.innerHTML=`<span>${safePos+1}</span> / ${total}`;rail.appendChild(ctr);
const dn=document.createElement('button');dn.className='pnav-arrow';dn.innerHTML='<svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>';dn.onclick=()=>showProfileReplace(nextIdx);rail.appendChild(dn);
/* scroll active dot into view */
const activeDot=dots.querySelector('.pnav-dot.active');if(activeDot)setTimeout(()=>activeDot.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'}),50)}

/* OG / Twitter Meta Tag helpers */
function updateOgMeta(g,idx){
const set=(prop,val,attr)=>{attr=attr||'property';let el=document.querySelector('meta['+attr+'="'+prop+'"]');if(!el){el=document.createElement('meta');el.setAttribute(attr,prop);document.head.appendChild(el)}el.setAttribute('content',val)};
const url='https://sydneyginza.github.io'+Router.pathForProfile(idx);
const img=g.photos&&g.photos.length?g.photos[0]:'https://raw.githubusercontent.com/sydneyginza/sydneyginza.github.io/main/Images/Homepage/Homepage_1.jpg';
const country=Array.isArray(g.country)?g.country.join('/'):(g.country||'');
const parts=[country,g.age?'Age '+g.age:'',g.body?'Body '+g.body:'',g.height?g.height+' cm':'',g.cup?g.cup+' cup':'',g.val3?'From '+g.val3+'/hr':'',g.exp||''].filter(Boolean);
const desc=parts.length?parts.join(' \u00b7 ')+' \u2013 Ginza Empire, Sydney':'View profile at Ginza Empire, Sydney.';
const title=(g.name||'Profile')+' \u2013 Ginza Empire';
set('og:title',title);set('og:description',desc);set('og:url',url);set('og:image',img);
set('twitter:title',title,'name');set('twitter:description',desc,'name');set('twitter:image',img,'name');
set('description',desc,'name');
let canon=document.querySelector('link[rel="canonical"]');if(!canon){canon=document.createElement('link');canon.rel='canonical';document.head.appendChild(canon)}canon.href=url}
function updateProfileJsonLd(g,idx){
let el=document.getElementById('profileLd');if(!el){el=document.createElement('script');el.type='application/ld+json';el.id='profileLd';document.head.appendChild(el)}
const url='https://sydneyginza.github.io'+Router.pathForProfile(idx);
const img=g.photos&&g.photos.length?g.photos[0]:'';
const country=Array.isArray(g.country)?g.country[0]:(g.country||'');
const person={"@type":"Person","name":g.name||'','worksFor':{"@id":"https://sydneyginza.github.io/#empire"}};
if(img)person.image=g.photos.length>1?g.photos:img;
if(country)person.nationality=country;
if(g.desc)person.description=g.desc.replace(/<[^>]*>/g,'').substring(0,300);
/* Offers from rates */
const offers=[];
if(g.val1)offers.push({"@type":"Offer","name":"30 min session","price":String(g.val1).replace(/[^0-9.]/g,''),"priceCurrency":"AUD"});
if(g.val2)offers.push({"@type":"Offer","name":"45 min session","price":String(g.val2).replace(/[^0-9.]/g,''),"priceCurrency":"AUD"});
if(g.val3)offers.push({"@type":"Offer","name":"60 min session","price":String(g.val3).replace(/[^0-9.]/g,''),"priceCurrency":"AUD"});
if(offers.length)person.makesOffer=offers;
/* Aggregate reviews */
const rvs=g.reviews||[];
const ld={"@context":"https://schema.org","@type":"ProfilePage","url":url,"mainEntity":person};
if(rvs.length){const avg=rvs.reduce((s,r)=>s+r.rating,0)/rvs.length;ld.mainEntity.aggregateRating={"@type":"AggregateRating","ratingValue":avg.toFixed(1),"bestRating":"5","ratingCount":rvs.length}}
el.textContent=JSON.stringify(ld);
/* Update breadcrumb */
if(typeof updateBreadcrumb==='function')updateBreadcrumb([{name:'Home',url:'https://sydneyginza.github.io/'},{name:'Girls',url:'https://sydneyginza.github.io/girls'},{name:g.name||'Profile',url:url}])}
function resetOgMeta(){
const set=(prop,val,attr)=>{attr=attr||'property';const el=document.querySelector('meta['+attr+'="'+prop+'"]');if(el)el.setAttribute('content',val)};
const t='Ginza Empire \u2013 Sydney\'s Premier Asian Bordello';
const d='Sydney\'s premier Asian bordello in Surry Hills. Browse our roster of stunning girls, check live availability, and view rates. Open daily 10:30am\u20131am at 310 Cleveland St.';
const i='https://raw.githubusercontent.com/sydneyginza/sydneyginza.github.io/main/Images/Homepage/Homepage_1.jpg';
set('og:title',t);set('og:description',d);set('og:url','https://sydneyginza.github.io');set('og:image',i);
set('twitter:title',t,'name');set('twitter:description',d,'name');set('twitter:image',i,'name');
set('description',d,'name');
const canon=document.querySelector('link[rel="canonical"]');if(canon)canon.href='https://sydneyginza.github.io';
const pld=document.getElementById('profileLd');if(pld)pld.remove();
if(typeof updateBreadcrumb==='function')updateBreadcrumb(null)}

/* Profile Page */
function renderAlsoAvailable(idx){
const g=girls[idx];if(!g)return;
const ts=fmtDate(getAEDTDate());
const alsoList=girls.filter(o=>{if(!o.name||o.name===g.name)return false;if(!isAdmin()&&o.hidden)return false;const e=getCalEntry(o.name,ts);return e&&e.start&&e.end}).slice(0,8);
if(!alsoList.length)return;
const sec=document.createElement('div');sec.className='profile-also';
const title=document.createElement('div');title.className='profile-desc-title';title.textContent=t('ui.alsoAvail');sec.appendChild(title);
const strip=document.createElement('div');strip.className='also-avail-strip';
alsoList.forEach(o=>{const ri=girls.indexOf(o);const liveNow=isAvailableNow(o.name);const card=document.createElement('div');card.className='also-avail-card';const thumb=o.photos&&o.photos.length?`<img src="${o.photos[0]}" alt="${o.name.replace(/"/g,'&quot;')}">`:'<div class="silhouette"></div>';card.innerHTML=`${thumb}<div class="also-avail-name">${o.name}</div>${liveNow?'<span class="avail-now-dot"></span>':''}`;card.onclick=()=>showProfile(ri);strip.appendChild(card)});
sec.appendChild(strip);
document.getElementById('profileContent').appendChild(sec)}

/* Similar Girls */
function _avgRate(g){const vals=[parseFloat(g.val1),parseFloat(g.val2),parseFloat(g.val3)].filter(v=>!isNaN(v)&&v>0);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0}
function computeSimilarity(a,b){
let score=0;
const ac=Array.isArray(a.country)?a.country:[a.country];
const bc=Array.isArray(b.country)?b.country:[b.country];
if(ac.some(c=>c&&bc.includes(c)))score+=1;
const aa=parseFloat(a.age),ba=parseFloat(b.age);
if(!isNaN(aa)&&!isNaN(ba)&&Math.abs(aa-ba)<=3)score+=1;
const ab=parseFloat(a.body),bb=parseFloat(b.body);
if(!isNaN(ab)&&!isNaN(bb)&&Math.abs(ab-bb)<=2)score+=1;
if(a.cup&&b.cup&&a.cup.trim().charAt(0).toUpperCase()===b.cup.trim().charAt(0).toUpperCase())score+=1;
const aAvg=_avgRate(a),bAvg=_avgRate(b);
if(aAvg>0&&bAvg>0&&Math.abs(aAvg-bAvg)/Math.max(aAvg,bAvg)<=0.2)score+=1;
return score/5}

function renderSimilarGirls(idx){
const g=girls[idx];if(!g||!g.name)return;
const ts=fmtDate(getAEDTDate());
const alsoNames=new Set();
girls.filter(o=>{if(!o.name||o.name===g.name)return false;if(!isAdmin()&&o.hidden)return false;const e=getCalEntry(o.name,ts);return e&&e.start&&e.end}).slice(0,8).forEach(o=>alsoNames.add(o.name));
const candidates=girls.map((o,i)=>({g:o,idx:i})).filter(x=>x.g.name&&x.g.name!==g.name&&!alsoNames.has(x.g.name)&&(isAdmin()||!x.g.hidden)).map(x=>({...x,score:computeSimilarity(g,x.g)})).filter(x=>x.score>=0.4).sort((a,b)=>b.score-a.score).slice(0,6);
if(!candidates.length)return;
const sec=document.createElement('div');sec.className='profile-also';
const title=document.createElement('div');title.className='profile-desc-title';title.textContent=t('sim.title');sec.appendChild(title);
const strip=document.createElement('div');strip.className='also-avail-strip';
candidates.forEach(c=>{const o=c.g;const liveNow=isAvailableNow(o.name);const card=document.createElement('div');card.className='also-avail-card';const thumb=o.photos&&o.photos.length?`<img src="${o.photos[0]}" alt="${o.name.replace(/"/g,'&quot;')}">`:'<div class="silhouette"></div>';card.innerHTML=`${thumb}<div class="also-avail-name">${o.name}</div>${liveNow?'<span class="avail-now-dot"></span>':''}`;card.onclick=()=>showProfile(c.idx);strip.appendChild(card)});
sec.appendChild(strip);document.getElementById('profileContent').appendChild(sec)}


function updateFavBadge(){const b=document.getElementById('navFavBadge');const bb=document.getElementById('bnFavBadge');const c=getFavCount();if(b)b.textContent=c>0?c:'';if(bb)bb.textContent=c>0?c:''}

function favHeartSvg(filled){return filled?'<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>':'<svg viewBox="0 0 24 24"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>'}

/* ── Reviews ── */
const starSvgFull='<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
const starSvgEmpty='<svg viewBox="0 0 24 24" width="16" height="16"><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>';
const verifiedSvg='<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>';
const helpfulThumbSvg='<svg viewBox="0 0 24 24" width="14" height="14"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>';
let _reviewSort='newest';

function renderStarsStatic(rating){let h='';for(let i=1;i<=5;i++)h+='<span class="review-star'+(i<=rating?' filled':'')+'">'+( i<=rating?starSvgFull:starSvgEmpty)+'</span>';return h}

function renderReviews(idx){
const container=document.getElementById('profileReviews');if(!container)return;
const g=girls[idx];if(!g)return;
const reviews=g.reviews||[];
const avg=reviews.length?reviews.reduce((s,r)=>s+r.rating,0)/reviews.length:0;
const hasReviewed=loggedIn&&reviews.some(r=>r.user===loggedInUser);
let html='<div class="profile-reviews"><div class="profile-desc-title" style="margin-top:32px">'+t('review.title');
if(reviews.length)html+=' <span class="review-count">('+reviews.length+')</span>';
html+='</div>';
/* Write / Sign-in prompt */
if(loggedIn&&!hasReviewed){html+='<button class="review-write-btn" id="rvWriteBtn">'+t('review.write')+'</button>'}
else if(!loggedIn){html+='<div class="review-signin">'+t('review.signin').replace('{link}','<a href="#" id="rvSignInLink">'+t('ui.signIn')+'</a>')+'</div>'}
html+='<div id="rvFormArea"></div>';
/* Sort bar */
if(reviews.length>1){html+='<div class="review-sort-bar"><button class="review-sort-btn'+(_reviewSort==='newest'?' active':'')+'" data-sort="newest">'+t('review.sortNewest')+'</button><button class="review-sort-btn'+(_reviewSort==='helpful'?' active':'')+'" data-sort="helpful">'+t('review.sortHelpful')+'</button></div>'}
/* Review list */
if(!reviews.length){html+='<div class="review-empty">'+t('review.noReviews')+'</div>'}
const sorted=reviews.slice().sort((a,b)=>{
  if(_reviewSort==='helpful'){const ha=(a.helpful||[]).length,hb=(b.helpful||[]).length;if(hb!==ha)return hb-ha;return new Date(b.ts)-new Date(a.ts)}
  return new Date(b.ts)-new Date(a.ts)});
sorted.forEach(r=>{
const isOwn=loggedIn&&r.user===loggedInUser;
const canEdit=isOwn||isAdmin();
const d=new Date(r.ts);const dateStr=d.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'});
html+='<div class="review-card"><div class="review-header"><span class="review-user">'+r.user.toUpperCase()+'</span>';
if(r.verified)html+='<span class="review-verified-badge" title="'+t('review.verifiedTip')+'">'+verifiedSvg+' '+t('review.verified')+'</span>';
html+='<span class="review-stars">'+renderStarsStatic(r.rating)+'</span><span class="review-date">'+dateStr+'</span></div>';
if(r.text)html+='<div class="review-text">'+r.text.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>';
/* Review photos */
if(r.photos&&r.photos.length){html+='<div class="review-photos">';r.photos.forEach(src=>{html+='<div class="review-photo"><img src="'+src+'" loading="lazy" alt="Review photo"></div>'});html+='</div>'}
/* Helpful voting */
const helpfulCount=(r.helpful||[]).length;
const hasVoted=loggedIn&&(r.helpful||[]).includes(loggedInUser);
html+='<div class="review-helpful">';
if(loggedIn&&!isOwn){html+='<button class="review-helpful-btn'+(hasVoted?' voted':'')+'" data-rv-user="'+r.user+'">'+helpfulThumbSvg+(hasVoted?t('review.helpfulVoted'):t('review.helpful'))+'</button>'}
if(helpfulCount>0){html+='<span class="review-helpful-count">'+helpfulCount+' '+(helpfulCount===1?t('review.helpfulOne'):t('review.helpfulMany'))+'</span>'}
html+='</div>';
/* Edit/delete/verify actions */
if(canEdit){html+='<div class="review-actions">';
if(isOwn||isAdmin())html+='<button class="review-action-btn review-edit-btn" data-rv-user="'+r.user+'">'+t('review.edit')+'</button>';
if(isAdmin()&&!r.verified)html+='<button class="review-action-btn review-verify-btn" data-rv-user="'+r.user+'">'+t('review.verify')+'</button>';
html+='<button class="review-action-btn review-delete-btn" data-rv-user="'+r.user+'">'+t('review.delete')+'</button></div>'}
html+='</div>'});
html+='</div>';
container.innerHTML=html;
/* Bind events */
const writeBtn=document.getElementById('rvWriteBtn');
if(writeBtn)writeBtn.onclick=()=>openReviewForm(idx,null);
const signInLink=document.getElementById('rvSignInLink');
if(signInLink)signInLink.onclick=e=>{e.preventDefault();showAuthSignIn()};
container.querySelectorAll('.review-sort-btn').forEach(btn=>{btn.onclick=()=>{_reviewSort=btn.dataset.sort;renderReviews(idx)}});
container.querySelectorAll('.review-edit-btn').forEach(btn=>{btn.onclick=()=>{const rv=(g.reviews||[]).find(r=>r.user===btn.dataset.rvUser);if(rv)openReviewForm(idx,rv)}});
container.querySelectorAll('.review-verify-btn').forEach(btn=>{btn.onclick=async()=>{const rv=(g.reviews||[]).find(r=>r.user===btn.dataset.rvUser);if(rv){rv.verified=true;if(await saveData()){showToast(t('review.verifiedDone'));renderReviews(idx)}}}});
container.querySelectorAll('.review-helpful-btn').forEach(btn=>{btn.onclick=async()=>{const rv=(g.reviews||[]).find(r=>r.user===btn.dataset.rvUser);if(!rv)return;if(!rv.helpful)rv.helpful=[];const hi=rv.helpful.indexOf(loggedInUser);if(hi>=0)rv.helpful.splice(hi,1);else rv.helpful.push(loggedInUser);if(!rv.helpful.length)delete rv.helpful;if(await saveData())renderReviews(idx)}});
container.querySelectorAll('.review-delete-btn').forEach(btn=>{btn.onclick=async()=>{if(!confirm(t('review.confirmDelete')))return;const u=btn.dataset.rvUser;g.reviews=(g.reviews||[]).filter(r=>r.user!==u);if(await saveData()){showToast(t('review.deleted'));renderReviews(idx)}}});
container.querySelectorAll('.review-photo').forEach(ph=>{ph.onclick=()=>{const src=ph.querySelector('img').src;if(src){const lb=document.getElementById('galMain');const lbImg=document.getElementById('lbImg');if(lb&&lbImg){lbImg.src=src}}}})}

function openReviewForm(idx,existing){
const area=document.getElementById('rvFormArea');if(!area)return;
const rating=existing?existing.rating:0;
const text=existing?existing.text:'';
let rvFormPhotos=existing&&existing.photos?[...existing.photos]:[];
let rvNewPhotos=[];
let html='<div class="review-form"><div class="review-stars-input" id="rvStarPicker">';
for(let i=1;i<=5;i++)html+='<span class="review-star-pick'+(i<=rating?' active':'')+'" data-val="'+i+'">'+starSvgFull+'</span>';
html+='</div><textarea class="review-textarea" id="rvText" placeholder="'+t('review.placeholder')+'" rows="3">'+text.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</textarea>';
/* Photo upload area */
html+='<div class="review-photos-area"><div class="review-photos-grid" id="rvPhotoGrid"></div>';
html+='<button type="button" class="review-photo-add-btn" id="rvPhotoAdd">'+t('review.addPhoto')+'</button></div>';
html+='<div class="review-form-actions"><button class="btn btn-primary review-submit-btn" id="rvSubmitBtn">'+(existing?t('review.edit'):t('review.write'))+'</button><button class="btn review-cancel-btn" id="rvCancelBtn">'+t('ui.cancel')+'</button></div>';
html+='<div class="review-form-error" id="rvError"></div></div>';
area.innerHTML=html;
let picked=rating;
function renderRvPhotos(){const grid=document.getElementById('rvPhotoGrid');if(!grid)return;grid.innerHTML='';
rvFormPhotos.forEach((src,i)=>{const wrap=document.createElement('div');wrap.className='rv-photo-thumb';wrap.innerHTML='<img src="'+src+'"><button class="rv-photo-remove">&times;</button>';wrap.querySelector('.rv-photo-remove').onclick=()=>{rvFormPhotos.splice(i,1);rvNewPhotos=rvNewPhotos.filter(p=>p!==src);renderRvPhotos()};grid.appendChild(wrap)});
const addBtn=document.getElementById('rvPhotoAdd');if(addBtn)addBtn.style.display=rvFormPhotos.length>=3?'none':''}
renderRvPhotos();
document.getElementById('rvPhotoAdd').onclick=()=>{
  const remaining=3-rvFormPhotos.length;if(remaining<=0)return;
  const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.multiple=true;
  inp.onchange=e=>{Array.from(e.target.files).slice(0,remaining).forEach(f=>{const reader=new FileReader();reader.onload=ev=>{
    const img=new Image();img.onload=()=>{const canvas=document.createElement('canvas');const maxW=1200;let w=img.width,h=img.height;if(w>maxW){h=h*maxW/w;w=maxW}canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);const resized=canvas.toDataURL('image/jpeg',0.85);rvFormPhotos.push(resized);rvNewPhotos.push(resized);renderRvPhotos()};img.src=ev.target.result};reader.readAsDataURL(f)})};inp.click()};
document.getElementById('rvStarPicker').querySelectorAll('.review-star-pick').forEach(s=>{
s.onmouseenter=()=>{const v=parseInt(s.dataset.val);document.getElementById('rvStarPicker').querySelectorAll('.review-star-pick').forEach((ss,i)=>ss.classList.toggle('hover',i<v))};
s.onmouseleave=()=>{document.getElementById('rvStarPicker').querySelectorAll('.review-star-pick').forEach(ss=>ss.classList.remove('hover'))};
s.onclick=()=>{picked=parseInt(s.dataset.val);document.getElementById('rvStarPicker').querySelectorAll('.review-star-pick').forEach((ss,i)=>ss.classList.toggle('active',i<picked))}});
document.getElementById('rvCancelBtn').onclick=()=>{area.innerHTML='';if(!existing){const wb=document.getElementById('rvWriteBtn');if(wb)wb.style.display=''}};
document.getElementById('rvSubmitBtn').onclick=async()=>{
if(!picked){document.getElementById('rvError').textContent=t('review.ratingRequired');return}
const g=girls[idx];if(!g.reviews)g.reviews=[];
const txt=document.getElementById('rvText').value.trim();
const submitBtn=document.getElementById('rvSubmitBtn');submitBtn.textContent=t('ui.saving');submitBtn.disabled=true;
try{
/* Upload new photos */
const uploadedUrls=[];
for(const b64 of rvNewPhotos){try{const url=await uploadReviewPhoto(b64);uploadedUrls.push(url)}catch(e){console.error('Review photo upload failed:',e)}}
const finalPhotos=rvFormPhotos.filter(p=>!p.startsWith('data:')).concat(uploadedUrls);
if(existing){const rv=g.reviews.find(r=>r.user===existing.user);if(rv){rv.rating=picked;rv.text=txt;rv.ts=new Date().toISOString();rv.photos=finalPhotos.length?finalPhotos:undefined}}
else{const newRv={user:loggedInUser,rating:picked,text:txt,ts:new Date().toISOString()};if(finalPhotos.length)newRv.photos=finalPhotos;g.reviews.push(newRv)}
if(await saveData()){showToast(existing?t('review.updated'):t('review.submitted'));renderReviews(idx)}
}finally{submitBtn.textContent=existing?t('review.edit'):t('review.write');submitBtn.disabled=false}};
const wb=document.getElementById('rvWriteBtn');if(wb)wb.style.display='none'}

function showProfile(idx){safeRender('Profile',()=>{
const g=girls[idx];if(!g)return;if(g.hidden&&!isAdmin()){showPage('homePage');return}currentProfileIdx=idx;if(!g.photos)g.photos=[];if(g.name)addRecentlyViewed(g.name);
if(_countdownInterval){clearInterval(_countdownInterval);_countdownInterval=null}
updateOgMeta(g,idx);updateProfileJsonLd(g,idx);
/* URL routing & dynamic title */
const profTitle=g.name?'Ginza Empire – '+g.name:'Ginza Empire – Profile';
document.title=profTitle;
Router.push(Router.pathForProfile(idx),profTitle);
const admin=isAdmin()?`<div class="profile-actions"><button class="btn btn-primary" id="profEdit">${t('ui.edit')}</button><button class="btn btn-danger" id="profDelete">${t('ui.delete')}</button></div>`:'';
const now=getAEDTDate();const ts=fmtDate(now);const entry=getCalEntry(g.name,ts);
const liveNow=g.name&&isAvailableNow(g.name);
const _todayShiftEnded=entry&&entry.start&&entry.end&&!liveNow&&(()=>{const nm=now.getHours()*60+now.getMinutes();const[eh,em]=entry.end.split(':').map(Number);const[sh,sm]=entry.start.split(':').map(Number);return eh*60+em>sh*60+sm&&nm>=eh*60+em})();
let availHtml='';if(liveNow)availHtml='<span class="dim">|</span><span class="profile-avail-live"><span class="avail-now-dot"></span>'+t('avail.now')+' ('+fmtTime12(entry.start)+' - '+fmtTime12(entry.end)+')</span>';
else if(entry&&entry.start&&entry.end&&!_todayShiftEnded)availHtml='<span class="dim">|</span><span style="color:#ffcc44;font-weight:600">'+t('avail.laterToday')+' ('+fmtTime12(entry.start)+' - '+fmtTime12(entry.end)+')</span>';
else{const wdates=getWeekDates();const upcoming=wdates.find(dt=>dt>ts&&(getCalEntry(g.name,dt)||{}).start);if(upcoming){const dn=dispDate(upcoming).day;const upEnt=getCalEntry(g.name,upcoming);const timeStr=upEnt&&upEnt.start&&upEnt.end?' ('+fmtTime12(upEnt.start)+' - '+fmtTime12(upEnt.end)+')':'';const _fmtD=m=>{const d=Math.floor(m/1440),h=Math.floor((m%1440)/60),mm=m%60;return d>0?`${d}d ${h}h`:h>0?`${h}h ${mm}m`:`${mm}m`};const daysUntil=Math.round((new Date(upcoming+' 00:00')-new Date(ts+' 00:00'))/86400000);const nowMins=now.getHours()*60+now.getMinutes();const[ush,usm]=(upEnt&&upEnt.start||'00:00').split(':').map(Number);const totalMins=daysUntil*1440+ush*60+usm-nowMins;const comingCd=totalMins>0?' · '+t('avail.startsIn').replace('{t}',_fmtD(totalMins)):'';availHtml='<span class="dim">|</span><span class="profile-avail-coming">'+t('avail.coming')+' '+dn+timeStr+comingCd+'</span>'}else{const lr=getLastRostered(g.name);if(lr){const diff=Math.round((new Date(ts+' 00:00')-new Date(lr+' 00:00'))/86400000);const rel=diff===0?'today':diff===1?'yesterday':diff+' days ago';availHtml='<span class="dim">|</span><span class="profile-avail-last">'+t('avail.lastSeen')+' '+rel+'</span>'}}}
const _cd=g.name?getAvailCountdown(g.name):null;
if(_cd){const _cdKey=_cd.type==='ends'?'avail.endsIn':'avail.startsIn';availHtml+='<span class="dim"> · </span><span id="profCountdown">'+t(_cdKey).replace('{t}',_cd.str)+'</span>'}
const rvs=g.reviews||[];const rvAvg=rvs.length?rvs.reduce((s,r)=>s+r.rating,0)/rvs.length:0;
const ratingHtml=rvs.length?'<span class="dim">|</span><span class="profile-rating-summary">'+renderStarsStatic(Math.round(rvAvg))+'<span class="profile-rating-num">'+rvAvg.toFixed(1)+' / 5</span><span class="profile-rating-count">('+rvs.length+')</span></span>':'';
const stats=[{l:t('field.age'),v:g.age},{l:t('field.body'),v:g.body},{l:t('field.height'),v:g.height+' cm'},{l:t('field.cup'),v:g.cup},{l:t('field.rates30'),v:g.val1||'\u2014'},{l:t('field.rates45'),v:g.val2||'\u2014'},{l:t('field.rates60'),v:g.val3||'\u2014'},{l:t('field.experience'),v:g.exp||'\u2014'}];
const mainImg=g.photos.length?`<img src="${g.photos[0]}" alt="${(g.name||'').replace(/"/g,'&quot;')}">`:'<div class="silhouette"></div>';
const hasMultiple=g.photos.length>1;
const arrows=hasMultiple?`<button class="gallery-main-arrow prev" id="galPrev"><svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg></button><button class="gallery-main-arrow next" id="galNext"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg></button>`:'';
const counter=g.photos.length?`<div class="gallery-counter" id="galCounter"><span>1</span> / ${g.photos.length}</div>`:'';
const zoomHint=g.photos.length?`<div class="gallery-zoom-hint">Click to expand</div>`:'';
const isFav=g.name&&isFavorite(g.name);
const favBtn=g.name&&loggedIn?`<button class="profile-fav-btn${isFav?' active':''}" id="profFavBtn">${favHeartSvg(isFav)}${isFav?t('ui.favorited'):t('ui.addFav')}</button>`:'';
const shareBtn=g.name?`<button class="profile-share-btn" id="profShareBtn"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>${t('ui.share')}</button>`:'';
const bookBtn=g.name?`<button class="profile-book-btn" id="profBookBtn"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/></svg>${t('enquiry.bookBtn')}</button>`:'';
const _backLabel={listPage:t('page.girls'),rosterPage:t('page.roster'),homePage:t('nav.home'),favoritesPage:t('page.favorites')}[profileReturnPage]||t('ui.back');
document.getElementById('profileContent').innerHTML=`<button class="back-btn" id="backBtn"><svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>${_backLabel}</button>
<div class="profile-nav-rail" id="profileNavRail"></div>
<div class="profile-layout"><div class="profile-image-area"><div class="gallery-main" id="galMain">${mainImg}${arrows}${counter}${zoomHint}</div><div class="gallery-thumbs" id="galThumbs"></div></div>
<div class="profile-details"><div class="profile-name">${g.name}</div><div class="profile-meta"><span>${Array.isArray(g.country)?g.country.join(', '):g.country}</span>${g.special?'<span class="profile-special">'+g.special+'</span>':''}${availHtml}${ratingHtml}</div><div class="profile-action-row">${favBtn}${shareBtn}${bookBtn}</div><div class="profile-divider" style="margin-top:24px"></div>
<div class="profile-stats">${stats.map(s=>`<div class="profile-stat"><div class="p-label">${s.l}</div><div class="p-val">${s.v}</div></div>`).join('')}</div>
<div class="profile-desc-title">${t('field.special')}</div><div class="profile-desc" id="profSpecialText" style="margin-bottom:24px">${g.special||'\u2014'}</div>
<div class="profile-desc-title">${t('field.language')}</div><div class="profile-desc" id="profLangText" style="margin-bottom:24px">${g.lang||'\u2014'}</div>
<div class="profile-desc-title">${t('field.type')}</div><div class="profile-desc" id="profTypeText" style="margin-bottom:24px">${g.type||'\u2014'}</div>
<div class="profile-desc-title">${t('field.description')}</div><div class="profile-desc" id="profDescText">${g.desc||''}</div>
${(()=>{const lbls=g.labels||[];return lbls.length?`<div class="profile-desc-title" style="margin-top:24px">${t('field.labels')}</div><div class="profile-labels">${lbls.slice().sort().map(l=>`<span class="profile-label">${l}</span>`).join('')}</div>`:''})()}${admin}<div id="profileReviews"></div></div></div>`;
document.getElementById('backBtn').onclick=()=>{const y=_savedScrollY||parseFloat(sessionStorage.getItem('ginza_scroll')||'0');showPage(profileReturnPage);requestAnimationFrame(()=>window.scrollTo(0,y))};
if(_cd){startCountdownTick()}
if(isAdmin()){document.getElementById('profEdit').onclick=()=>openForm(idx);document.getElementById('profDelete').onclick=()=>openDelete(idx)}
const profFav=document.getElementById('profFavBtn');
if(profFav){profFav.onclick=()=>{const nowFav=toggleFavorite(g.name);profFav.classList.toggle('active',nowFav);profFav.innerHTML=favHeartSvg(nowFav)+(nowFav?t('ui.favorited'):t('ui.addFav'));updateFavBadge()}}
const profShare=document.getElementById('profShareBtn');
if(profShare){profShare.onclick=async()=>{const url=window.location.origin+Router.pathForProfile(idx);if(navigator.share){try{await navigator.share({title:g.name+' - Ginza',text:g.name+' at Ginza Sydney',url})}catch(e){}}else{try{await navigator.clipboard.writeText(url);showToast(t('ui.linkCopied'))}catch(e){const tmp=document.createElement('input');tmp.value=url;document.body.appendChild(tmp);tmp.select();document.execCommand('copy');document.body.removeChild(tmp);showToast(t('ui.linkCopied'))}}}}
const profBook=document.getElementById('profBookBtn');
if(profBook){profBook.onclick=()=>openEnquiryForm(g.name,idx)}
renderGallery(idx);renderReviews(idx);renderAlsoAvailable(idx);renderSimilarGirls(idx);renderProfileNav(idx);closeFilterPanel();_activeFilterPaneId='profileFilterPane';renderFilterPane('profileFilterPane');const _prevPg=document.querySelector('.page.active');const _profPg=document.getElementById('profilePage');const _pec=['page-enter','slide-enter-right','slide-enter-left'];_profPg.classList.remove(..._pec);if(_prevPg&&_prevPg!==_profPg){_prevPg.classList.remove('active',..._pec);_prevPg.classList.add('slide-exit-left');const _onEx=()=>{_prevPg.classList.remove('slide-exit-left');_prevPg.removeEventListener('animationend',_onEx)};_prevPg.addEventListener('animationend',_onEx);setTimeout(()=>_prevPg.classList.remove('slide-exit-left'),400);void _profPg.offsetWidth;_profPg.classList.add('active','slide-enter-right')}else{allPages.forEach(p=>p.classList.remove('active',..._pec));void _profPg.offsetWidth;_profPg.classList.add('active','page-enter')}document.querySelectorAll('.nav-dropdown a').forEach(a=>a.classList.remove('active'));updateFilterToggle();window.scrollTo(0,0);requestAnimationFrame(()=>window.scrollTo(0,0));setTimeout(()=>window.scrollTo(0,0),300)})}

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
if(main&&g.photos.length){main.onclick=e=>{if(e.target.closest('.gallery-main-arrow'))return;if(_galSwipe){_galSwipe=false;return}openLightbox(g.photos,galIdx,g.name)}}
/* Prev/next arrows on main image */
const prevBtn=document.getElementById('galPrev'),nextBtn=document.getElementById('galNext');
if(prevBtn)prevBtn.onclick=e=>{e.stopPropagation();galGoTo((galIdx-1+g.photos.length)%g.photos.length,g.photos)};
if(nextBtn)nextBtn.onclick=e=>{e.stopPropagation();galGoTo((galIdx+1)%g.photos.length,g.photos)};
/* Thumbnails */
const c=document.getElementById('galThumbs');if(!c)return;c.innerHTML='';
g.photos.forEach((src,i)=>{const t=document.createElement('div');t.className='gallery-thumb'+(i===0?' active':'');t.innerHTML=`<img src="${src}" alt="${(g.name||'').replace(/"/g,'&quot;')}">`;
t.onclick=()=>galGoTo(i,g.photos);
if(isAdmin()){const rm=document.createElement('button');rm.className='gallery-thumb-remove';rm.innerHTML='&#x2715;';rm.onclick=async e=>{e.stopPropagation();if(src.includes('githubusercontent.com'))await deleteFromGithub(src);g.photos.splice(i,1);await saveData();showProfile(idx);renderGrid();renderRoster();renderHome();showToast('Photo removed')};t.appendChild(rm)}
c.appendChild(t)})}

/* My Profile Modal */
function openMyProfile(){
const overlay=document.getElementById('myProfileOverlay');
const entry=CRED.find(c=>c.user===loggedInUser);if(!entry)return;
const roleBadge=loggedInRole==='owner'?'<span class="mp-role-badge owner">OWNER</span>':loggedInRole==='admin'?'<span class="mp-role-badge admin">ADMIN</span>':'<span class="mp-role-badge member">MEMBER</span>';
document.getElementById('mpUserDisplay').innerHTML=`<div class="mp-username">${loggedInUser.toUpperCase()}</div>${roleBadge}`;
document.getElementById('mpEmail').value=entry.email||'';
document.getElementById('mpMobile').value=entry.mobile||'';
document.getElementById('mpNewPass').value='';
document.getElementById('mpConfirmPass').value='';
document.getElementById('mpError').textContent='';
overlay.classList.add('open')}

document.getElementById('myProfileClose').onclick=()=>document.getElementById('myProfileOverlay').classList.remove('open');
document.getElementById('myProfileCancel').onclick=()=>document.getElementById('myProfileOverlay').classList.remove('open');
document.getElementById('myProfileOverlay').onclick=e=>{if(e.target.id==='myProfileOverlay')e.target.classList.remove('open')};

document.getElementById('myProfileSave').onclick=async()=>{
const entry=CRED.find(c=>c.user===loggedInUser);if(!entry)return;
const newPass=document.getElementById('mpNewPass').value;
const confirmPass=document.getElementById('mpConfirmPass').value;
const errEl=document.getElementById('mpError');
const emailVal=document.getElementById('mpEmail').value.trim();
if(!emailVal){errEl.textContent=t('ui.emailRequired');return}
if(newPass&&newPass!==confirmPass){errEl.textContent=t('ui.passwordMismatch');return}
errEl.textContent='';
const saveBtn=document.getElementById('myProfileSave');saveBtn.textContent='SAVING...';saveBtn.style.pointerEvents='none';
try{
entry.email=document.getElementById('mpEmail').value.trim()||undefined;
entry.mobile=document.getElementById('mpMobile').value.trim()||undefined;
if(newPass)entry.pass=newPass;
loggedInEmail=entry.email||null;
loggedInMobile=entry.mobile||null;
if(await saveAuth()){document.getElementById('myProfileOverlay').classList.remove('open');showToast(t('ui.profileSaved'))}
}catch(e){errEl.textContent='Error: '+e.message}finally{saveBtn.textContent=t('form.save');saveBtn.style.pointerEvents='auto'}};

/* Auth / Login */
const loginIconBtn=document.getElementById('loginIconBtn'),userDropdown=document.getElementById('userDropdown');
const authOverlay=document.getElementById('authOverlay'),authContent=document.getElementById('authContent');
document.getElementById('authClose').onclick=()=>authOverlay.classList.remove('open');
authOverlay.onclick=e=>{if(e.target===authOverlay)authOverlay.classList.remove('open')};

function renderDropdown(){
if(loggedIn){loginIconBtn.classList.add('logged-in');userDropdown.innerHTML=`<div class="dropdown-header"><div class="label">Signed in as</div><div class="user">${(loggedInUser||'ADMIN').toUpperCase()}</div></div><button class="dropdown-item" id="myProfileBtn">${t('ui.myProfile')}</button><button class="dropdown-item danger" id="logoutBtn">Sign Out</button>`;
document.getElementById('myProfileBtn').onclick=()=>{userDropdown.classList.remove('open');openMyProfile()};
document.getElementById('logoutBtn').onclick=()=>{loggedIn=false;loggedInUser=null;loggedInRole=null;loggedInEmail=null;loggedInMobile=null;loginIconBtn.classList.remove('logged-in');userDropdown.classList.remove('open');document.getElementById('navFavorites').style.display='none';document.getElementById('bnFavorites').style.display='none';document.getElementById('navCalendar').style.display='none';document.getElementById('navAnalytics').style.display='none';document.getElementById('navProfileDb').style.display='none';document.querySelectorAll('.page-edit-btn').forEach(b=>b.style.display='none');if(document.getElementById('favoritesPage').classList.contains('active')||document.getElementById('calendarPage').classList.contains('active')||document.getElementById('analyticsPage').classList.contains('active')||document.getElementById('profileDbPage').classList.contains('active'))showPage('homePage');renderDropdown();renderFilters();renderGrid();renderRoster();renderHome()}}
else{loginIconBtn.classList.remove('logged-in');userDropdown.innerHTML=''}}

function showAuthSignIn(){
authContent.innerHTML=`<div class="form-title">${t('ui.signIn')}</div><div class="form-row full"><div class="form-group"><label class="form-label">Username</label><input class="form-input" id="lfUser" placeholder="Username" autocomplete="off"></div></div><div class="form-row full"><div class="form-group"><label class="form-label">Password</label><input class="form-input" id="lfPass" type="password" placeholder="Password"></div></div><div class="form-actions" style="justify-content:center"><button class="btn btn-primary" id="lfBtn" style="width:100%">${t('ui.signIn')}</button></div><div class="lf-error" id="lfError"></div><div class="lf-switch">${t('ui.noAccount')} <a href="#" id="lfSignUpLink">${t('ui.signUp')}</a></div>`;
document.getElementById('lfBtn').onclick=doLogin;
document.getElementById('lfPass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()});
document.getElementById('lfUser').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('lfPass').focus()});
document.getElementById('lfSignUpLink').onclick=e=>{e.preventDefault();showAuthSignUp()};
authOverlay.classList.add('open')}

function showAuthSignUp(){
authContent.innerHTML=`<div class="form-title">${t('ui.signUp')}</div><div class="form-row full"><div class="form-group"><label class="form-label">Username *</label><input class="form-input" id="suUser" placeholder="Username" autocomplete="off"></div></div><div class="form-row full"><div class="form-group"><label class="form-label">${t('field.email')} *</label><input class="form-input" id="suEmail" type="email" placeholder="email@example.com"></div></div><div class="form-row full"><div class="form-group"><label class="form-label">${t('field.mobile')}</label><input class="form-input" id="suMobile" type="tel" placeholder="04XX XXX XXX"></div></div><div class="form-row full"><div class="form-group"><label class="form-label">Password *</label><input class="form-input" id="suPass" type="password" placeholder="Password"></div></div><div class="form-row full"><div class="form-group"><label class="form-label">${t('ui.confirmPassword')} *</label><input class="form-input" id="suConfirm" type="password" placeholder="Confirm"></div></div><div class="form-actions" style="justify-content:center"><button class="btn btn-primary" id="suBtn" style="width:100%">${t('ui.createAccount')}</button></div><div class="lf-error" id="suError"></div><div class="lf-switch">${t('ui.haveAccount')} <a href="#" id="suSignInLink">${t('ui.signIn')}</a></div>`;
document.getElementById('suBtn').onclick=doSignUp;
document.getElementById('suConfirm').addEventListener('keydown',e=>{if(e.key==='Enter')doSignUp()});
document.getElementById('suSignInLink').onclick=e=>{e.preventDefault();showAuthSignIn()};
authOverlay.classList.add('open')}

async function doSignUp(){
const u=document.getElementById('suUser').value.trim();
const email=document.getElementById('suEmail').value.trim();
const mobile=document.getElementById('suMobile').value.trim();
const pass=document.getElementById('suPass').value;
const confirm=document.getElementById('suConfirm').value;
const errEl=document.getElementById('suError');
if(!u){errEl.textContent=t('ui.usernameRequired');return}
if(CRED.some(c=>c.user.toLowerCase()===u.toLowerCase())){errEl.textContent=t('ui.usernameTaken');return}
if(!email){errEl.textContent=t('ui.emailRequired');return}
if(CRED.some(c=>c.email&&c.email.toLowerCase()===email.toLowerCase())){errEl.textContent=t('ui.emailTaken');return}
if(mobile&&CRED.some(c=>c.mobile&&c.mobile===mobile)){errEl.textContent=t('ui.mobileTaken');return}
if(!pass){errEl.textContent=t('ui.passwordRequired');return}
if(pass!==confirm){errEl.textContent=t('ui.passwordMismatch');return}
errEl.textContent='';
const btn=document.getElementById('suBtn');btn.textContent='CREATING...';btn.style.pointerEvents='none';
try{
const entry={user:u,pass,role:'member',email,mobile:mobile||undefined};
CRED.push(entry);
if(await saveAuth()){
loggedIn=true;loggedInUser=entry.user;loggedInRole='member';loggedInEmail=entry.email;loggedInMobile=entry.mobile||null;
document.getElementById('navFavorites').style.display='';document.getElementById('bnFavorites').style.display='';
authOverlay.classList.remove('open');
renderDropdown();renderFilters();renderGrid();renderRoster();renderHome();
showToast(t('ui.accountCreated'));updatePushToggle()}
else{CRED.pop()}
}catch(e){CRED.pop();errEl.textContent='Error: '+e.message}
finally{btn.textContent=t('ui.createAccount');btn.style.pointerEvents='auto'}}

async function checkFavoriteNotifications(username){
try{const r=await fetch(PROXY+'/send-notification',{method:'POST',headers:proxyHeaders(),body:JSON.stringify({username})});
if(r.ok){const d=await r.json();if(d.sent&&d.matchCount>0){showToast(d.matchCount===1?t('ui.favAvailOne'):t('ui.favAvailMany').replace('{count}',d.matchCount))}}}catch(e){}}

function doLogin(){const u=document.getElementById('lfUser').value.trim(),p=document.getElementById('lfPass').value;const match=CRED.find(c=>c.user===u&&c.pass===p);
if(match){loggedIn=true;loggedInUser=match.user;loggedInRole=match.role||'member';loggedInEmail=match.email||null;loggedInMobile=match.mobile||null;document.getElementById('navFavorites').style.display='';document.getElementById('bnFavorites').style.display='';if(isAdmin()){document.getElementById('navCalendar').style.display='';document.getElementById('navAnalytics').style.display='';document.querySelectorAll('.page-edit-btn').forEach(b=>b.style.display='');loadAdminModule()}authOverlay.classList.remove('open');renderDropdown();renderFilters();renderGrid();renderRoster();renderHome();updateFavBadge();if(document.getElementById('profilePage').classList.contains('active'))showProfile(currentProfileIdx);showToast('Signed in as '+match.user.toUpperCase());checkFavoriteNotifications(match.user);updatePushToggle();if(match.themePref)applyTheme(match.themePref);if(match.viewHistory&&Array.isArray(match.viewHistory)){const local=getRecentlyViewed();const merged=new Map();match.viewHistory.forEach(h=>{if(h.name)merged.set(h.name,h)});local.forEach(h=>{if(h.name&&(!merged.has(h.name)||merged.get(h.name).ts<h.ts))merged.set(h.name,h)});const sorted=[...merged.values()].sort((a,b)=>b.ts-a.ts).slice(0,20);try{localStorage.setItem('ginza_recently_viewed',JSON.stringify(sorted))}catch(e){}}}
else{document.getElementById('lfError').textContent='Invalid credentials.';document.getElementById('lfPass').value=''}}
loginIconBtn.onclick=e=>{e.stopPropagation();if(loggedIn){const o=userDropdown.classList.toggle('open');loginIconBtn.setAttribute('aria-expanded',String(o))}else{showAuthSignIn()}};
document.addEventListener('click',e=>{if(!e.target.closest('#userDropdown')&&!e.target.closest('#loginIconBtn')){userDropdown.classList.remove('open');loginIconBtn.setAttribute('aria-expanded','false')}});
renderDropdown();

/* Notification preferences */
const _notifBtn=document.getElementById('notifToggleBtn');
const _notifDropdown=document.getElementById('notifPrefsDropdown');
const _notifPrefPush=document.getElementById('notifPrefPush');
const _notifPrefEmail=document.getElementById('notifPrefEmail');

function getNotifPrefs(){
  if(!loggedIn||!loggedInUser)return{push:true,email:true};
  const entry=CRED.find(c=>c.user===loggedInUser);
  return entry&&entry.notifPrefs?entry.notifPrefs:{push:true,email:true};
}

async function updatePushToggle(){
  if(!_notifBtn||!loggedIn){if(_notifBtn)_notifBtn.style.display='none';return}
  _notifBtn.style.display='';
  const prefs=getNotifPrefs();
  if(_notifPrefPush)_notifPrefPush.checked=prefs.push;
  if(_notifPrefEmail)_notifPrefEmail.checked=prefs.email;
  if(_notifPrefPush&&!('PushManager' in window))_notifPrefPush.disabled=true;
  const active=prefs.push||prefs.email;
  _notifBtn.classList.toggle('active',active);
}

async function saveNotifPrefs(){
  const prefs={push:_notifPrefPush?_notifPrefPush.checked:true,email:_notifPrefEmail?_notifPrefEmail.checked:true};
  if(prefs.push&&!(await getPushSubscription())){
    const sub=await subscribeToPush();
    if(!sub){prefs.push=false;if(_notifPrefPush)_notifPrefPush.checked=false;showToast(t('ui.pushDenied'),'error')}
    else showToast(t('ui.pushOn'))
  }else if(!prefs.push&&(await getPushSubscription())){
    await unsubscribeFromPush();showToast(t('ui.pushOff'))
  }
  try{
    await fetch(PROXY+'/update-notif-prefs',{method:'POST',headers:proxyHeaders(),body:JSON.stringify({username:loggedInUser,prefs})});
    const entry=CRED.find(c=>c.user===loggedInUser);if(entry)entry.notifPrefs=prefs;
    showToast(t('ui.notifSaved'))
  }catch(e){showToast(t('ui.notifSaveError'),'error')}
  updatePushToggle();
}

if(_notifBtn){_notifBtn.onclick=e=>{e.stopPropagation();const o=_notifDropdown.classList.toggle('open');_notifBtn.setAttribute('aria-expanded',String(o))}}
document.addEventListener('click',e=>{if(_notifDropdown&&!e.target.closest('#notifPrefsDropdown')&&!e.target.closest('#notifToggleBtn'))_notifDropdown.classList.remove('open')});
if(_notifPrefPush)_notifPrefPush.onchange=()=>saveNotifPrefs();
if(_notifPrefEmail)_notifPrefEmail.onchange=()=>saveNotifPrefs();

/* ── Theme Toggle (Light/Dark) ── */
const _themeToggleBtn=document.getElementById('themeToggleBtn');
const _themeIcon=document.getElementById('themeIcon');
const _sunPath='M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z';
const _moonPath='M12 3a9 9 0 108.97 10.13.75.75 0 00-.93-.93A7.5 7.5 0 0112.87 3.07.75.75 0 0012 3z';
function getStoredTheme(){
  if(loggedIn){const entry=CRED.find(c=>c.user===loggedInUser);if(entry&&entry.themePref)return entry.themePref}
  try{const v=localStorage.getItem('ginza_theme');if(v==='light'||v==='dark')return v}catch(e){}
  return 'dark';
}
function applyTheme(theme){
  const isLight=theme==='light';
  document.body.classList.toggle('light-mode',isLight);
  if(_themeIcon)_themeIcon.querySelector('path').setAttribute('d',isLight?_moonPath:_sunPath);
  if(_themeToggleBtn)_themeToggleBtn.setAttribute('aria-label',isLight?t('theme.dark'):t('theme.light'));
  try{localStorage.setItem('ginza_theme',theme)}catch(e){}
}
function toggleTheme(){
  const next=document.body.classList.contains('light-mode')?'dark':'light';
  applyTheme(next);
  if(loggedIn&&loggedInUser){
    fetch(PROXY+'/update-theme-pref',{method:'POST',headers:proxyHeaders(),body:JSON.stringify({username:loggedInUser,theme:next})}).catch(()=>{});
  }
}
(function(){document.body.classList.add('no-transition');applyTheme(getStoredTheme());requestAnimationFrame(()=>requestAnimationFrame(()=>document.body.classList.remove('no-transition')))})();
if(_themeToggleBtn)_themeToggleBtn.onclick=toggleTheme;

/* Particles */
const particlesEl=document.getElementById('particles');for(let i=0;i<30;i++){const p=document.createElement('div');p.className='particle';p.style.left=Math.random()*100+'%';p.style.animationDuration=(8+Math.random()*12)+'s';p.style.animationDelay=Math.random()*10+'s';p.style.width=p.style.height=(1+Math.random()*2)+'px';particlesEl.appendChild(p)}

/* ── Seasonal / Event Themes ── */
const SEASONAL_THEMES=[
  {id:'valentine',cls:'theme-valentine',match:(m,d)=>m===1&&d>=1&&d<=14,accent:'#ff4488',accent2:'#ff6fa8',icon:'\u2764\uFE0F',greetingKey:'season.valentine'},
  {id:'sakura',cls:'theme-sakura',match:(m,d)=>(m===2&&d>=15)||(m===3&&d<=15),accent:'#f4a0b5',accent2:'#d4738a',icon:'\uD83C\uDF38',greetingKey:'season.sakura'},
  {id:'christmas',cls:'theme-christmas',match:(m,d)=>m===11&&d>=1&&d<=25,accent:'#cc1111',accent2:'#00aa44',icon:'\uD83C\uDF84',greetingKey:'season.christmas'},
  {id:'newyear',cls:'theme-newyear',match:(m,d)=>(m===11&&d>=26)||(m===0&&d<=7),accent:'#ffd700',accent2:'#ff6f00',icon:'\uD83C\uDF86',greetingKey:'season.newyear'}
];
let _activeSeason=null;
function detectSeasonalTheme(){const d=getAEDTDate();const m=d.getMonth(),day=d.getDate();return SEASONAL_THEMES.find(th=>th.match(m,day))||null}
function applySeasonalTheme(){
  _activeSeason=detectSeasonalTheme();
  SEASONAL_THEMES.forEach(th=>document.body.classList.remove(th.cls));
  if(!_activeSeason)return;
  document.body.classList.add(_activeSeason.cls);
  document.documentElement.style.setProperty('--accent',_activeSeason.accent);
  document.documentElement.style.setProperty('--accent2',_activeSeason.accent2);
  particlesEl.querySelectorAll('.particle').forEach(p=>{p.style.background=Math.random()>0.5?_activeSeason.accent:_activeSeason.accent2});
}
function getSeasonalBanner(){if(!_activeSeason)return '';return `<div class="seasonal-banner"><span class="seasonal-icon">${_activeSeason.icon}</span> ${t(_activeSeason.greetingKey)}</div>`}
applySeasonalTheme();

/* Filter Panel Toggle */
let _activeFilterPaneId=null;
const _filterToggle=document.getElementById('filterToggle');
const _filterBackdrop=document.getElementById('filterBackdrop');
const _pagesWithFilters=['rosterPage','listPage','calendarPage','profilePage'];

function updateFilterToggle(){
const hasPage=_pagesWithFilters.some(id=>{const el=document.getElementById(id);return el&&el.classList.contains('active')});
_filterToggle.classList.toggle('visible',hasPage);
const cnt=countActiveFilters();
_filterToggle.classList.toggle('has-filters',cnt>0);
const ftText=_filterToggle.querySelector('.ft-text');
if(ftText)ftText.textContent=cnt>0?t('ui.filtersActive').replace('{n}',cnt):t('ui.filters');
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
_filterToggle.setAttribute('aria-expanded','true');
}

function closeFilterPanel(){
['rosterFilterPane','girlsFilterPane','calFilterPane','profileFilterPane'].forEach(fp=>{
const el=document.getElementById(fp);if(el)el.classList.remove('open')});
_filterToggle.classList.remove('open');
_filterBackdrop.classList.remove('open');
_filterToggle.setAttribute('aria-expanded','false');
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
btn.onclick=()=>window.scrollTo({top:0,behavior:'smooth'})})();

/* ── FAB (Floating Contact Buttons) ── */
(function(){const toggle=document.getElementById('fabToggle'),menu=document.getElementById('fabMenu');if(!toggle||!menu)return;toggle.onclick=()=>{const o=toggle.classList.toggle('open');menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(o))};document.addEventListener('click',e=>{if(!e.target.closest('.fab-container')){toggle.classList.remove('open');menu.classList.remove('open');toggle.setAttribute('aria-expanded','false')}})})();

/* ── Focus Trap for Modal Overlays ── */
document.addEventListener('keydown',function(e){
if(e.key!=='Tab')return;
var openModal=document.querySelector('.modal-overlay.open,.lightbox-overlay.open');
if(!openModal)return;
var focusable=openModal.querySelectorAll('button:not([disabled]):not([style*="display:none"]):not([style*="display: none"]),[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
if(!focusable.length)return;
var first=focusable[0],last=focusable[focusable.length-1];
if(e.shiftKey){if(document.activeElement===first||!openModal.contains(document.activeElement)){e.preventDefault();last.focus()}}
else{if(document.activeElement===last||!openModal.contains(document.activeElement)){e.preventDefault();first.focus()}}
});

/* ── Keyboard Shortcuts ── */
let _kbFocusedCardIdx=-1;
function _kbIsTyping(){const el=document.activeElement;if(!el)return false;const tag=el.tagName;return tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||el.isContentEditable}
function _kbIsModalOpen(){return!!document.querySelector('.modal-overlay.open,.lightbox-overlay.open,.copy-time-modal.open,.copy-day-modal.open,.bulk-time-modal.open')}
function _kbGetActivePage(){return['homePage','rosterPage','listPage','favoritesPage','valuePage','employmentPage','profilePage'].find(id=>{const el=document.getElementById(id);return el&&el.classList.contains('active')})||null}
function _kbGetVisibleCards(){const page=_kbGetActivePage();const gridMap={listPage:'girlsGrid',rosterPage:'rosterGrid',favoritesPage:'favoritesGrid'};const gridId=gridMap[page];if(!gridId)return[];return Array.from(document.getElementById(gridId)?.querySelectorAll('.girl-card')||[])}
function _kbFocusCard(idx){const cards=_kbGetVisibleCards();if(!cards.length)return;_kbFocusedCardIdx=Math.max(0,Math.min(idx,cards.length-1));cards.forEach((c,i)=>c.classList.toggle('kb-focused',i===_kbFocusedCardIdx));cards[_kbFocusedCardIdx].scrollIntoView({block:'nearest',behavior:'smooth'})}
function _kbOpenHelp(){let ov=document.getElementById('kbHelpOverlay');if(!ov){ov=document.createElement('div');ov.id='kbHelpOverlay';ov.className='modal-overlay kb-help-overlay';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','kbHelpTitle');document.body.appendChild(ov)}
ov.innerHTML=`<div class="form-modal" style="max-width:480px"><button class="modal-close" id="kbHelpClose" aria-label="Close">&times;</button><div class="form-title" id="kbHelpTitle">${t('kb.title')}</div><div class="kb-help-grid"><div class="kb-row"><kbd>j</kbd> <kbd>k</kbd><span>${t('kb.navCards')}</span></div><div class="kb-row"><kbd>Enter</kbd><span>${t('kb.openProfile')}</span></div><div class="kb-row"><kbd>f</kbd><span>${t('kb.favorite')}</span></div><div class="kb-row"><kbd>c</kbd><span>${t('kb.compare')}</span></div><div class="kb-row"><kbd>/</kbd><span>${t('kb.search')}</span></div><div class="kb-row"><kbd>Esc</kbd><span>${t('kb.back')}</span></div><div class="kb-row"><kbd>?</kbd><span>${t('kb.help')}</span></div></div></div>`;
ov.classList.add('open');ov.querySelector('#kbHelpClose').onclick=()=>ov.classList.remove('open');ov.onclick=e=>{if(e.target===ov)ov.classList.remove('open')}}

document.addEventListener('keydown',function(e){
if(_kbIsTyping())return;
const helpOv=document.getElementById('kbHelpOverlay');
if(helpOv&&helpOv.classList.contains('open')){if(e.key==='Escape'||e.key==='?'){helpOv.classList.remove('open');e.preventDefault()}return}
if(_kbIsModalOpen())return;
const page=_kbGetActivePage();
switch(e.key){
case '?':e.preventDefault();_kbOpenHelp();break;
case '/':e.preventDefault();{const inp=document.querySelector('#filterBar .inline-search-input,#rosterFilterBar .inline-search-input,#homeSearchInput');if(inp)inp.focus()}break;
case 'Escape':if(page==='profilePage'){const btn=document.getElementById('backBtn');if(btn)btn.click()}break;
case 'j':if(['listPage','rosterPage','favoritesPage'].includes(page)){e.preventDefault();_kbFocusCard(_kbFocusedCardIdx+1)}break;
case 'k':if(['listPage','rosterPage','favoritesPage'].includes(page)){e.preventDefault();_kbFocusCard(_kbFocusedCardIdx-1)}break;
case 'Enter':if(_kbFocusedCardIdx>=0){const cards=_kbGetVisibleCards();if(cards[_kbFocusedCardIdx])cards[_kbFocusedCardIdx].click()}break;
case 'f':if(page==='profilePage'){const btn=document.getElementById('profFavBtn');if(btn)btn.click()}else if(_kbFocusedCardIdx>=0){const cards=_kbGetVisibleCards();const btn=cards[_kbFocusedCardIdx]?.querySelector('.card-fav');if(btn)btn.click()}break;
case 'c':if(_kbFocusedCardIdx>=0){const cards=_kbGetVisibleCards();const btn=cards[_kbFocusedCardIdx]?.querySelector('.card-compare');if(btn)btn.click()}break;
}});

