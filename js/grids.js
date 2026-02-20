/* === GIRLS GRID, ROSTER, CALENDAR & VALUE === */

/* Girls Grid */
function renderFilters(){const fb=document.getElementById('filterBar');fb.innerHTML='';
/* Sort buttons */
const sep=document.createElement('div');sep.className='filter-sep';fb.appendChild(sep);
const sorts=[{key:'name',label:'Name'},{key:'newest',label:'Date Added'},{key:'age',label:'Age'},{key:'body',label:'Size'},{key:'height',label:'Height'},{key:'cup',label:'Cup'}];
sorts.forEach(s=>{const b=document.createElement('button');b.className='sort-btn'+(gridSort===s.key?' active':'');b.textContent=s.label;b.onclick=()=>{if(gridSort===s.key){gridSortDir=gridSortDir==='asc'?'desc':'asc'}else{gridSort=s.key;gridSortDir=s.key==='newest'?'desc':'asc'}renderFilters();renderGrid();renderRoster();renderFavoritesGrid()};fb.appendChild(b)});
const dirBtn=document.createElement('button');dirBtn.className='sort-dir-btn';dirBtn.title=gridSortDir==='asc'?'Ascending':'Descending';dirBtn.innerHTML=gridSortDir==='asc'?'<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg>':'<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>';dirBtn.onclick=()=>{gridSortDir=gridSortDir==='asc'?'desc':'asc';renderFilters();renderGrid();renderRoster();renderFavoritesGrid()};fb.appendChild(dirBtn);
if(hasActiveFilters()){const sep3=document.createElement('div');sep3.className='filter-sep';fb.appendChild(sep3);const clr=document.createElement('button');clr.className='filter-btn clear-filters-btn';clr.innerHTML='&#10005; Clear';clr.onclick=()=>{clearAllFilters();onFiltersChanged()};fb.appendChild(clr)}
if(loggedIn){const ab=document.createElement('button');ab.className='add-btn';ab.innerHTML='+ Add Girl';ab.onclick=()=>openForm();fb.appendChild(ab)}}

function renderAvailNowBar(){
['availNowBar','rosterAvailBar'].forEach(id=>{
const bar=document.getElementById(id);
if(!bar)return;
_renderAvailBar(bar)});
}
function _renderAvailBar(bar){
const nowCount=getAvailableNowCount();
const todayCount=getAvailableTodayCount();
const weekDates=getWeekDates();
const ts=weekDates[0];
const futureDates=weekDates.slice(1).filter(ds=>girls.some(g=>{const e=getCalEntry(g.name,ds);return e&&e.start&&e.end}));
const anyVisible=nowCount||sharedFilters.availableNow||todayCount||sharedFilters.availableToday||futureDates.length||sharedFilters.availableDate;
bar.innerHTML='';
if(!anyVisible){bar.style.display='none';return}
bar.style.display='';
if(nowCount>0||sharedFilters.availableNow){const btn=document.createElement('button');btn.className='avail-now-pill'+(sharedFilters.availableNow?' active':'');const countLabel=nowCount===1?'1 girl available now':nowCount+' girls available now';btn.innerHTML=`<span class="avail-now-dot"></span>${countLabel}`;btn.onclick=()=>{sharedFilters.availableNow=!sharedFilters.availableNow;if(sharedFilters.availableNow){sharedFilters.availableToday=false;sharedFilters.availableDate=null}onFiltersChanged()};bar.appendChild(btn)}
if(todayCount>0||sharedFilters.availableToday){const btn2=document.createElement('button');btn2.className='avail-today-pill'+(sharedFilters.availableToday?' active':'');const countLabel2=todayCount===1?'1 girl available today':todayCount+' girls available today';btn2.innerHTML=`<span class="avail-today-dot"></span>${countLabel2}`;btn2.onclick=()=>{sharedFilters.availableToday=!sharedFilters.availableToday;if(sharedFilters.availableToday){sharedFilters.availableNow=false;sharedFilters.availableDate=null}onFiltersChanged()};bar.appendChild(btn2)}
futureDates.forEach(ds=>{const f=dispDate(ds);const label=f.day+' '+f.date;const isActive=sharedFilters.availableDate===ds;const btn3=document.createElement('button');btn3.className='avail-date-pill'+(isActive?' active':'');btn3.textContent=label;btn3.onclick=()=>{sharedFilters.availableDate=isActive?null:ds;if(sharedFilters.availableDate){sharedFilters.availableNow=false;sharedFilters.availableToday=false}onFiltersChanged()};bar.appendChild(btn3)})}

function applySortOrder(list){
const dir=gridSortDir==='desc'?-1:1;
const emptyLast=(a,b,cmp)=>{const an=(a.name||'').trim(),bn=(b.name||'').trim();if(!an&&!bn)return 0;if(!an)return 1;if(!bn)return -1;return cmp(a,b)*dir};
if(gridSort==='age')return list.sort((a,b)=>emptyLast(a,b,()=>{const aa=parseFloat(a.age)||999,ba=parseFloat(b.age)||999;return aa-ba}));
if(gridSort==='newest')return list.sort((a,b)=>emptyLast(a,b,()=>{const ad=a.startDate||'',bd=b.startDate||'';if(!ad&&!bd)return 0;if(!ad)return 1;if(!bd)return -1;return bd.localeCompare(ad)}));
if(gridSort==='body')return list.sort((a,b)=>emptyLast(a,b,()=>{const av=parseFloat(a.body)||999,bv=parseFloat(b.body)||999;return av-bv}));
if(gridSort==='height')return list.sort((a,b)=>emptyLast(a,b,()=>{const av=parseFloat(a.height)||999,bv=parseFloat(b.height)||999;return av-bv}));
if(gridSort==='cup')return list.sort((a,b)=>emptyLast(a,b,()=>(a.cup||'').toLowerCase().localeCompare((b.cup||'').toLowerCase())));
return list.sort((a,b)=>emptyLast(a,b,()=>(a.name||'').trim().toLowerCase().localeCompare((b.name||'').trim().toLowerCase())))}

function daysAgo(iso){const d=Math.floor((Date.now()-new Date(iso))/(864e5));return d===0?'Today':d===1?'Yesterday':d+' days ago'}
const grid=document.getElementById('girlsGrid');
function cardFavBtn(name){const fav=name&&isFavorite(name);return `<button class="card-fav${fav?' active':''}" data-fav-name="${name||''}" title="${fav?'Remove from favorites':'Add to favorites'}">${favHeartSvg(fav)}</button>`}
function bindCardFavs(container){container.querySelectorAll('.card-fav').forEach(btn=>{btn.onclick=e=>{e.stopPropagation();const name=btn.dataset.favName;if(!name)return;const nowFav=toggleFavorite(name);btn.classList.toggle('active',nowFav);btn.innerHTML=favHeartSvg(nowFav);btn.title=nowFav?'Remove from favorites':'Add to favorites';btn.classList.remove('fav-pop');void btn.offsetWidth;btn.classList.add('fav-pop');updateFavBadge()}})}
function cardCompareBtn(name){if(!name)return '';const sel=isCompareSelected(name);return `<button class="card-compare${sel?' active':''}" data-compare-name="${name}" title="${sel?'Remove from compare':'Add to compare'}"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 3H3.5A1.5 1.5 0 002 4.5V9a1.5 1.5 0 001.5 1.5H9A1.5 1.5 0 0010.5 9V4.5A1.5 1.5 0 009 3zm11 0h-5.5A1.5 1.5 0 0013 4.5V9a1.5 1.5 0 001.5 1.5H20A1.5 1.5 0 0021.5 9V4.5A1.5 1.5 0 0020 3zM9 13.5H3.5A1.5 1.5 0 002 15v4.5A1.5 1.5 0 003.5 21H9a1.5 1.5 0 001.5-1.5V15A1.5 1.5 0 009 13.5zm11 0h-5.5A1.5 1.5 0 0013 15v4.5a1.5 1.5 0 001.5 1.5H20a1.5 1.5 0 001.5-1.5V15a1.5 1.5 0 00-1.5-1.5z"/></svg></button>`}
function bindCardCompare(container){container.querySelectorAll('.card-compare').forEach(btn=>{btn.onclick=e=>{e.stopPropagation();const name=btn.dataset.compareName;if(!name)return;toggleCompare(name)}})}
function renderGrid(){safeRender('Girls Grid',()=>{
let filtered=[...girls];
filtered=applySharedFilters(filtered);
if(!loggedIn)filtered=filtered.filter(g=>g.name&&String(g.name).trim().length>0);
applySortOrder(filtered);
grid.innerHTML='';const ts=fmtDate(getAEDTDate());
filtered.forEach((g,fi)=>{const card=safeCardRender(g,fi,()=>{const ri=girls.indexOf(g);const el=document.createElement('div');el.className='girl-card';
const act=loggedIn?`<div class="card-actions"><button class="card-action-btn edit" title="Edit" data-idx="${ri}">&#x270E;</button><button class="card-action-btn delete" title="Delete" data-idx="${ri}">&#x2715;</button></div>`:'';
const img=g.photos&&g.photos.length?lazyThumb(g.photos[0],'card-thumb',g.name):'<div class="silhouette"></div>';const entry=getCalEntry(g.name,ts);
const liveNow=g.name&&isAvailableNow(g.name);
const avail=liveNow?`<div class="card-avail card-avail-live"><span class="avail-now-dot"></span>Available Now (${fmtTime12(entry.start)} - ${fmtTime12(entry.end)})</div>`:(entry&&entry.start&&entry.end?`<div class="card-avail">Available Today (${fmtTime12(entry.start)} - ${fmtTime12(entry.end)})</div>`:'');
const fav=g.name?cardFavBtn(g.name):'';const cmp=g.name?cardCompareBtn(g.name):'';
el.innerHTML=`<div class="card-img" style="background:linear-gradient(135deg,rgba(180,74,255,0.06),rgba(255,111,0,0.03))">${img}${fav}${cmp}${act}</div><div class="card-info"><div class="card-name">${g.name||''}</div><div class="card-country">${Array.isArray(g.country)?g.country.join(', '):(g.country||'')}</div>${avail}${loggedIn&&g.lastModified?`<div style="font-size:10px;color:rgba(255,255,255,0.28);letter-spacing:1px;margin-top:2px">${daysAgo(g.lastModified)}</div>`:''}<div class="card-hover-line"></div></div>`;
el.onclick=e=>{if(e.target.closest('.card-action-btn')||e.target.closest('.card-fav')||e.target.closest('.card-compare'))return;profileReturnPage='listPage';showProfile(ri)};
if(loggedIn){el.querySelector('.edit').onclick=e=>{e.stopPropagation();openForm(ri)};el.querySelector('.delete').onclick=e=>{e.stopPropagation();openDelete(ri)}}
return el});if(card)grid.appendChild(card)});bindCardFavs(grid);bindCardCompare(grid);observeLazy(grid);observeEntrance(grid);renderAvailNowBar()})}

/* Roster */
function hasGirlsOnDate(ds){return girls.some(g=>{const e=getCalEntry(g.name,ds);return e&&e.start&&e.end})}

function renderRosterFilters(){const fb=document.getElementById('rosterFilterBar');fb.innerHTML='';const dates=getWeekDates();const ts=dates[0];if(!rosterDateFilter)rosterDateFilter=ts;
const availDates=dates.filter(ds=>hasGirlsOnDate(ds));
if(availDates.length&&!availDates.includes(rosterDateFilter))rosterDateFilter=availDates[0];
if(!availDates.length)rosterDateFilter=null;
availDates.forEach(ds=>{const f=dispDate(ds);const b=document.createElement('button');b.className='filter-btn'+(ds===rosterDateFilter?' date-active':'');b.textContent=ds===ts?'Today':f.day+' '+f.date;b.onclick=()=>{rosterDateFilter=ds;renderRosterFilters();renderRosterGrid()};fb.appendChild(b)});

/* Available Now / Today quick-filters */
renderAvailNowBar()}
function renderRosterGrid(){safeRender('Roster Grid',()=>{const rg=document.getElementById('rosterGrid');rg.innerHTML='';
if(!rosterDateFilter){rg.innerHTML='<div class="empty-msg">No girls available this week</div>';return}
const ts=fmtDate(getAEDTDate());const ds=rosterDateFilter;
let filtered=[...girls].filter(g=>{const e=getCalEntry(g.name,ds);return e&&e.start&&e.end});
filtered=applySharedFilters(filtered);
if(!loggedIn)filtered=filtered.filter(g=>g.name&&String(g.name).trim().length>0);

applySortOrder(filtered);
if(!filtered.length){rg.innerHTML='<div class="empty-msg">No girls available for this date</div>';return}
filtered.forEach((g,fi)=>{const card=safeCardRender(g,fi,()=>{const ri=girls.indexOf(g);const el=document.createElement('div');el.className='girl-card';const img=g.photos&&g.photos.length?lazyThumb(g.photos[0],'card-thumb',g.name):'<div class="silhouette"></div>';const isToday=ds===ts;const entry=getCalEntry(g.name,ds);
const liveNow=isToday&&g.name&&isAvailableNow(g.name);
const timeStr=entry&&entry.start&&entry.end?' ('+fmtTime12(entry.start)+' - '+fmtTime12(entry.end)+')':'';
const avail=liveNow?`<div class="card-avail card-avail-live"><span class="avail-now-dot"></span>Available Now${timeStr}</div>`:(isToday?`<div class="card-avail">Available Today${timeStr}</div>`:`<div class="card-avail" style="color:var(--accent)">${timeStr.trim()}</div>`);
const fav=g.name?cardFavBtn(g.name):'';const cmp=g.name?cardCompareBtn(g.name):'';
el.innerHTML=`<div class="card-img" style="background:linear-gradient(135deg,rgba(180,74,255,0.06),rgba(255,111,0,0.03))">${img}${fav}${cmp}</div><div class="card-info"><div class="card-name">${g.name||''}</div><div class="card-country">${Array.isArray(g.country)?g.country.join(', '):(g.country||'')}</div>${avail}<div class="card-hover-line"></div></div>`;
el.onclick=e=>{if(e.target.closest('.card-fav')||e.target.closest('.card-compare'))return;profileReturnPage='rosterPage';showProfile(ri)};return el});if(card)rg.appendChild(card)});bindCardFavs(rg);bindCardCompare(rg);observeLazy(rg);observeEntrance(rg);renderAvailNowBar()})}
function renderRoster(){renderRosterFilters();renderRosterGrid()}

/* Favorites Grid */
function renderFavoritesGrid(){safeRender('Favorites Grid',()=>{const fg=document.getElementById('favoritesGrid');fg.innerHTML='';
const favs=getFavorites();const ts=fmtDate(getAEDTDate());
let filtered=girls.filter(g=>g.name&&favs.includes(g.name));
applySortOrder(filtered);
if(!filtered.length){fg.innerHTML='<div class="fav-empty"><div class="fav-empty-icon">&hearts;</div><div class="fav-empty-text">No favorites yet</div><div class="fav-empty-hint">Tap the heart on any profile to save it here</div></div>';return}
filtered.forEach((g,fi)=>{const card=safeCardRender(g,fi,()=>{const ri=girls.indexOf(g);const el=document.createElement('div');el.className='girl-card';
const img=g.photos&&g.photos.length?lazyThumb(g.photos[0],'card-thumb',g.name):'<div class="silhouette"></div>';
const entry=getCalEntry(g.name,ts);
const liveNow=g.name&&isAvailableNow(g.name);
const avail=liveNow?`<div class="card-avail card-avail-live"><span class="avail-now-dot"></span>Available Now (${fmtTime12(entry.start)} - ${fmtTime12(entry.end)})</div>`:(entry&&entry.start&&entry.end?`<div class="card-avail">Available Today (${fmtTime12(entry.start)} - ${fmtTime12(entry.end)})</div>`:'');
const fav=cardFavBtn(g.name);const cmp=cardCompareBtn(g.name);
el.innerHTML=`<div class="card-img" style="background:linear-gradient(135deg,rgba(180,74,255,0.06),rgba(255,111,0,0.03))">${img}${fav}${cmp}</div><div class="card-info"><div class="card-name">${g.name||''}</div><div class="card-country">${Array.isArray(g.country)?g.country.join(', '):(g.country||'')}</div>${avail}<div class="card-hover-line"></div></div>`;
el.onclick=e=>{if(e.target.closest('.card-fav')||e.target.closest('.card-compare'))return;profileReturnPage='favoritesPage';showProfile(ri)};return el});if(card)fg.appendChild(card)});
fg.querySelectorAll('.card-fav').forEach(btn=>{btn.onclick=e=>{e.stopPropagation();const name=btn.dataset.favName;if(!name)return;toggleFavorite(name);updateFavBadge();renderFavoritesGrid()}});
bindCardCompare(fg);observeLazy(fg);observeEntrance(fg)})}

/* Value Table */
function renderValueTable(){safeRender('Value Table',()=>{
const table=document.getElementById('valueTable');
const vals=[
{label:'30 mins',key:'val1'},
{label:'45 mins',key:'val2'},
{label:'60 mins',key:'val3'}
];
let html='<thead><tr><th style="text-align:left">Rates</th><th style="text-align:left">Price Range</th></tr></thead><tbody>';
vals.forEach(v=>{
const nums=[];
girls.forEach(g=>{
const raw=g[v.key];if(!raw)return;
const cleaned=String(raw).replace(/[\$,\s]/g,'');
/* Handle ranges like "350-400" */
const parts=cleaned.split(/[-–—~]+/);
parts.forEach(p=>{const n=parseFloat(p);if(!isNaN(n)&&n>0)nums.push(n)});
});
let range='\u2014';
if(nums.length){
const min=Math.min(...nums);
const max=Math.max(...nums);
range=min===max?'$'+min:'$'+min+' – $'+max;
}
html+=`<tr><td style="text-align:left;font-family:'Orbitron',sans-serif;font-size:13px;letter-spacing:2px;color:#fff;text-transform:uppercase">${v.label}</td><td style="text-align:left;font-family:'Orbitron',sans-serif;font-size:16px;letter-spacing:2px;color:var(--accent)">${range}</td></tr>`;
});
html+='</tbody>';
table.innerHTML=html;
})}

/* Calendar */
function generateTimeOptions(){const o=['<option value="">--:--</option>'];for(let h=0;h<24;h++)for(let m=0;m<60;m+=30){const v=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');const h12=h===0?12:h>12?h-12:h;o.push(`<option value="${v}">${h12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}</option>`)}return o.join('')}

function renderCalendar(){safeRender('Calendar',()=>{const fb=document.getElementById('calFilterBar');fb.innerHTML='';
if(loggedIn){const cpb=document.createElement('button');cpb.className='add-btn';cpb.innerHTML='&#x2398; Copy Day';cpb.onclick=()=>openCopyDayModal();fb.appendChild(cpb)}
const fg=applySharedFilters([...girls].filter(g=>g.name&&String(g.name).trim().length>0)).sort((a,b)=>(a.name||'').trim().toLowerCase().localeCompare((b.name||'').trim().toLowerCase()));const table=document.getElementById('calTable');const dates=getWeekDates();const ts=dates[0];const tOpts=generateTimeOptions();
let html='<thead><tr><th>Profile</th>';dates.forEach((ds,i)=>{const f=dispDate(ds);html+=`<th class="${i===0?'cal-today':''}">${f.date}<span class="cal-day-name">${f.day}${i===0?' (Today)':''}</span></th>`});html+='</tr></thead><tbody>';
fg.forEach(g=>{const gi=girls.indexOf(g);const av=g.photos&&g.photos.length?lazyCalAvatar(g.photos[0],g.name):`<span class="cal-letter">${g.name.charAt(0)}</span>`;
const bulkActions=loggedIn?`<div class="cal-bulk-actions"><button class="cal-bulk-btn cal-bulk-all" data-bulk-name="${g.name}" title="Mark available all week">All Week</button><button class="cal-bulk-btn cal-bulk-clear" data-bulk-name="${g.name}" title="Clear entire week">Clear</button></div>`:'';
html+=`<tr><td><div class="cal-profile" data-idx="${gi}"><div class="cal-avatar">${av}</div><div><div class="cal-name">${g.name}</div><div class="cal-loc">${g.location}</div>${bulkActions}</div></div></td>`;
dates.forEach((ds,di)=>{const entry=getCalEntry(g.name,ds);const ck=entry?'checked':'';const sh=!!entry;
html+=`<td class="${di===0?'cal-today':''}"><div class="cal-cell-inner"><input type="checkbox" class="cal-check" data-name="${g.name}" data-date="${ds}" ${ck}><div class="cal-time-wrap" style="display:${sh?'flex':'none'}" data-time-name="${g.name}" data-time-date="${ds}"><div class="cal-time-row"><label>Start</label><select class="cal-time-input" data-field="start" data-tname="${g.name}" data-tdate="${ds}">${tOpts}</select></div><div class="cal-time-row"><label>End</label><select class="cal-time-input" data-field="end" data-tname="${g.name}" data-tdate="${ds}">${tOpts}</select></div><div class="cal-time-warn" data-warn-name="${g.name}" data-warn-date="${ds}"></div></div></div></td>`});html+='</tr>'});html+='</tbody>';table.innerHTML=html;observeLazy(table);observeCalEntrance(table);

fg.forEach(g=>{getWeekDates().forEach(ds=>{const entry=getCalEntry(g.name,ds);if(entry){const ss=table.querySelector(`select[data-field="start"][data-tname="${g.name}"][data-tdate="${ds}"]`),es=table.querySelector(`select[data-field="end"][data-tname="${g.name}"][data-tdate="${ds}"]`);if(ss&&entry.start)ss.value=entry.start;if(es&&entry.end)es.value=entry.end;
if(!entry.start||!entry.end){if(!calPending[g.name])calPending[g.name]={};calPending[g.name][ds]=true;const w=table.querySelector(`[data-warn-name="${g.name}"][data-warn-date="${ds}"]`);if(w)w.textContent='Times required'}}})});

table.querySelectorAll('.cal-profile').forEach(el=>{el.onclick=e=>{if(e.target.closest('.cal-bulk-btn'))return;profileReturnPage='calendarPage';showProfile(parseInt(el.dataset.idx))}});

/* Bulk calendar actions */
if(loggedIn){
table.querySelectorAll('.cal-bulk-all').forEach(btn=>{btn.onclick=e=>{e.stopPropagation();const name=btn.dataset.bulkName;openBulkTimeModal(name)}});
table.querySelectorAll('.cal-bulk-clear').forEach(btn=>{btn.onclick=e=>{e.stopPropagation();const name=btn.dataset.bulkName;
const dates=getWeekDates();let cleared=0;
dates.forEach(ds=>{if(calData[name]&&calData[name][ds]){delete calData[name][ds];cleared++}if(calPending[name])delete calPending[name][ds]});
if(cleared>0){queueCalSave(null,100);renderCalendar();renderRoster();renderGrid();renderHome();showToast(name+' cleared for the week')}
}})}

table.querySelectorAll('.cal-check').forEach(cb=>{cb.onchange=async function(){const n=this.dataset.name,d=this.dataset.date;const tw=table.querySelector(`[data-time-name="${n}"][data-time-date="${d}"]`);
if(this.checked){
if(!calData[n])calData[n]={};
const existing=findExistingTimes(n,d);
if(existing){
const choice=await showCopyTimePrompt(n,existing.date,existing.start,existing.end);
if(choice==='cancel'){this.checked=false;if(calData[n])delete calData[n][d];if(calPending[n])delete calPending[n][d];if(tw)tw.style.display='none';return}
if(choice==='copy'){
calData[n][d]={start:existing.start,end:existing.end};
if(tw){tw.style.display='flex';const ss=table.querySelector(`select[data-field="start"][data-tname="${n}"][data-tdate="${d}"]`),es=table.querySelector(`select[data-field="end"][data-tname="${n}"][data-tdate="${d}"]`);if(ss)ss.value=existing.start;if(es)es.value=existing.end;const w=table.querySelector(`[data-warn-name="${n}"][data-warn-date="${d}"]`);if(w)w.textContent=''}
const td=this.closest('td');queueCalSave(td,100);showToast('Times copied');return}
else{calData[n][d]={start:'',end:''};if(!calPending[n])calPending[n]={};calPending[n][d]=true;if(tw){tw.style.display='flex';const w=table.querySelector(`[data-warn-name="${n}"][data-warn-date="${d}"]`);if(w)w.textContent='Times required'}return}}
calData[n][d]={start:'',end:''};if(!calPending[n])calPending[n]={};calPending[n][d]=true;
if(tw){tw.style.display='flex';const w=table.querySelector(`[data-warn-name="${n}"][data-warn-date="${d}"]`);if(w)w.textContent='Times required'}}
else{if(calData[n])delete calData[n][d];if(calPending[n])delete calPending[n][d];if(tw){tw.style.display='none';const ss=table.querySelector(`select[data-field="start"][data-tname="${n}"][data-tdate="${d}"]`),es=table.querySelector(`select[data-field="end"][data-tname="${n}"][data-tdate="${ds}"]`);if(ss)ss.value='';if(es)es.value='';const w=table.querySelector(`[data-warn-name="${n}"][data-warn-date="${d}"]`);if(w)w.textContent=''}queueCalSave(this.closest('td'))}}});

table.querySelectorAll('.cal-time-input').forEach(sel=>{sel.onchange=function(){const n=this.dataset.tname,d=this.dataset.tdate,f=this.dataset.field;if(!calData[n]||!calData[n][d])return;if(typeof calData[n][d]!=='object')calData[n][d]={start:'',end:''};calData[n][d][f]=this.value;const entry=calData[n][d];const w=table.querySelector(`[data-warn-name="${n}"][data-warn-date="${d}"]`);
if(entry.start&&entry.end){this.classList.remove('invalid');if(calPending[n])delete calPending[n][d];if(w)w.textContent='';queueCalSave(this.closest('td'));showToast('Schedule saved')}
else{this.classList.remove('invalid');if(w)w.textContent='Times required';if(!calPending[n])calPending[n]={};calPending[n][d]=true}}});})}