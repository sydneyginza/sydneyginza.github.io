/* === GIRLS GRID, ROSTER, CALENDAR & VALUE === */

/* Girls Grid */
function renderFilters(){const locs=["All",...new Set(girls.map(g=>g.location))];const fb=document.getElementById('filterBar');fb.innerHTML='';
locs.forEach(c=>{const b=document.createElement('button');b.className='filter-btn'+(c===activeLocation?' active':'');b.textContent=c;b.onclick=()=>{activeLocation=c;renderFilters();renderGrid()};fb.appendChild(b)});
if(loggedIn){const ab=document.createElement('button');ab.className='add-btn';ab.innerHTML='+ Add Girl';ab.onclick=()=>openForm();fb.appendChild(ab)}}

const grid=document.getElementById('girlsGrid');
function renderGrid(){
let filtered=activeLocation==='All'?[...girls]:girls.filter(g=>g.location===activeLocation);
if(!loggedIn)filtered=filtered.filter(g=>g.name&&String(g.name).trim().length>0);
filtered.sort((a,b)=>{const an=(a.name||'').trim();const bn=(b.name||'').trim();const aEmpty=an.length===0;const bEmpty=bn.length===0;if(aEmpty&&bEmpty)return 0;if(aEmpty)return 1;if(bEmpty)return -1;return an.toLowerCase().localeCompare(bn.toLowerCase())});
grid.innerHTML='';const ts=fmtDate(getAEDTDate());
filtered.forEach(g=>{const ri=girls.indexOf(g);const card=document.createElement('div');card.className='girl-card';
const act=loggedIn?`<div class="card-actions"><button class="card-action-btn edit" title="Edit" data-idx="${ri}">&#x270E;</button><button class="card-action-btn delete" title="Delete" data-idx="${ri}">&#x2715;</button></div>`:'';
const img=g.photos&&g.photos.length?`<img class="card-thumb" src="${g.photos[0]}">`:'<div class="silhouette"></div>';const entry=getCalEntry(g.name,ts);
const avail=entry&&entry.start&&entry.end?`<div class="card-avail">Available Today (${fmtTime12(entry.start)} - ${fmtTime12(entry.end)})</div>`:'';
card.innerHTML=`<div class="card-img" style="background:linear-gradient(135deg,rgba(180,74,255,0.06),rgba(255,111,0,0.03))">${img}${act}</div><div class="card-info"><div class="card-name">${g.name||''}</div><div class="card-country">${g.country||''}</div>${avail}<div class="card-hover-line"></div></div>`;
card.onclick=e=>{if(e.target.closest('.card-action-btn'))return;profileReturnPage='listPage';showProfile(ri)};
if(loggedIn){card.querySelector('.edit').onclick=e=>{e.stopPropagation();openForm(ri)};card.querySelector('.delete').onclick=e=>{e.stopPropagation();openDelete(ri)}}grid.appendChild(card)})}

/* Roster */
function hasGirlsOnDate(ds,loc){return girls.some(g=>{if(loc&&loc!=='All'&&g.location!==loc)return false;const e=getCalEntry(g.name,ds);return e&&e.start&&e.end})}

function renderRosterFilters(){const fb=document.getElementById('rosterFilterBar');fb.innerHTML='';const dates=getWeekDates();const ts=dates[0];if(!rosterDateFilter)rosterDateFilter=ts;
const availDates=dates.filter(ds=>hasGirlsOnDate(ds,rosterLocFilter));
if(availDates.length&&!availDates.includes(rosterDateFilter))rosterDateFilter=availDates[0];
if(!availDates.length)rosterDateFilter=null;
availDates.forEach(ds=>{const f=dispDate(ds);const b=document.createElement('button');b.className='filter-btn'+(ds===rosterDateFilter?' date-active':'');b.textContent=ds===ts?'Today':f.day+' '+f.date;b.onclick=()=>{rosterDateFilter=ds;renderRosterFilters();renderRosterGrid()};fb.appendChild(b)});
const sep=document.createElement('div');sep.className='filter-sep';fb.appendChild(sep);const locs=["All",...new Set(girls.map(g=>g.location))];if(!rosterLocFilter)rosterLocFilter='All';
locs.forEach(loc=>{const b=document.createElement('button');b.className='filter-btn'+(rosterLocFilter===loc?' active':'');b.textContent=loc;b.onclick=()=>{rosterLocFilter=loc;renderRosterFilters();renderRosterGrid()};fb.appendChild(b)})}

function renderRosterGrid(){const rg=document.getElementById('rosterGrid');rg.innerHTML='';
if(!rosterDateFilter){rg.innerHTML='<div class="empty-msg">No girls available this week</div>';return}
const ts=fmtDate(getAEDTDate());const ds=rosterDateFilter;
let filtered=[...girls].filter(g=>{const e=getCalEntry(g.name,ds);return e&&e.start&&e.end});
if(!loggedIn)filtered=filtered.filter(g=>g.name&&String(g.name).trim().length>0);
if(rosterLocFilter&&rosterLocFilter!=='All')filtered=filtered.filter(g=>g.location===rosterLocFilter);
filtered.sort((a,b)=>{const an=a.name&&a.name.trim(),bn=b.name&&b.name.trim();if(!an&&!bn)return 0;if(!an)return 1;if(!bn)return -1;return an.toLowerCase().localeCompare(bn.toLowerCase())});
if(!filtered.length){rg.innerHTML='<div class="empty-msg">No girls available for this date</div>';return}
filtered.forEach(g=>{const ri=girls.indexOf(g);const card=document.createElement('div');card.className='girl-card';const img=g.photos&&g.photos.length?`<img class="card-thumb" src="${g.photos[0]}">`:'<div class="silhouette"></div>';const isToday=ds===ts;const entry=getCalEntry(g.name,ds);
const timeStr=entry&&entry.start&&entry.end?' ('+fmtTime12(entry.start)+' - '+fmtTime12(entry.end)+')':'';
const avail=isToday?`<div class="card-avail">Available Today${timeStr}</div>`:`<div class="card-avail" style="color:var(--accent)">${timeStr.trim()}</div>`;
card.innerHTML=`<div class="card-img" style="background:linear-gradient(135deg,rgba(180,74,255,0.06),rgba(255,111,0,0.03))">${img}</div><div class="card-info"><div class="card-name">${g.name||''}</div><div class="card-country">${g.country||''}</div>${avail}<div class="card-hover-line"></div></div>`;
card.onclick=()=>{profileReturnPage='rosterPage';showProfile(ri)};rg.appendChild(card)})}
function renderRoster(){renderRosterFilters();renderRosterGrid()}

/* Value Table */
function renderValueTable(){
const table=document.getElementById('valueTable');
const vals=[
{label:'30 mins',key:'val1'},
{label:'45 mins',key:'val2'},
{label:'60 mins',key:'val3'}
];
let html='<thead><tr><th style="text-align:left">Rates</th><th style="text-align:left">Price Range</th></tr></thead><tbody>';
vals.forEach(v=>{
const nums=girls.map(g=>parseFloat(g[v.key])).filter(n=>!isNaN(n)&&n>0);
let range='\u2014';
if(nums.length){
const min=Math.min(...nums);
const max=Math.max(...nums);
range=min===max?'$'+min:'$'+min+' - $'+max;
}
html+=`<tr><td style="text-align:left;font-family:'Orbitron',sans-serif;font-size:13px;letter-spacing:2px;color:#fff;text-transform:uppercase">${v.label}</td><td style="text-align:left;font-family:'Orbitron',sans-serif;font-size:16px;letter-spacing:2px;color:var(--accent)">${range}</td></tr>`;
});
html+='</tbody>';
table.innerHTML=html;
}

/* Calendar */
function generateTimeOptions(){const o=['<option value="">--:--</option>'];for(let h=0;h<24;h++)for(let m=0;m<60;m+=30){const v=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');const h12=h===0?12:h>12?h-12:h;o.push(`<option value="${v}">${h12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}</option>`)}return o.join('')}

function renderCalendar(){const fb=document.getElementById('calFilterBar');fb.innerHTML='';const locs=["All",...new Set(girls.map(g=>g.location))];if(!calLocFilter)calLocFilter='All';
locs.forEach(loc=>{const b=document.createElement('button');b.className='filter-btn'+(calLocFilter===loc?' active':'');b.textContent=loc;b.onclick=()=>{calLocFilter=loc;renderCalendar()};fb.appendChild(b)});
const fg=(calLocFilter==='All'?[...girls]:girls.filter(g=>g.location===calLocFilter)).filter(g=>g.name&&String(g.name).trim().length>0).sort((a,b)=>(a.name||'').trim().toLowerCase().localeCompare((b.name||'').trim().toLowerCase()));const table=document.getElementById('calTable');const dates=getWeekDates();const ts=dates[0];const tOpts=generateTimeOptions();
let html='<thead><tr><th>Profile</th>';dates.forEach((ds,i)=>{const f=dispDate(ds);html+=`<th class="${i===0?'cal-today':''}">${f.date}<span class="cal-day-name">${f.day}${i===0?' (Today)':''}</span></th>`});html+='</tr></thead><tbody>';
fg.forEach(g=>{const gi=girls.indexOf(g);const av=g.photos&&g.photos.length?`<img src="${g.photos[0]}">`:`<span class="cal-letter">${g.name.charAt(0)}</span>`;
html+=`<tr><td><div class="cal-profile" data-idx="${gi}"><div class="cal-avatar">${av}</div><div><div class="cal-name">${g.name}</div><div class="cal-loc">${g.location}</div></div></div></td>`;
dates.forEach((ds,di)=>{const entry=getCalEntry(g.name,ds);const ck=entry?'checked':'';const sh=!!entry;
html+=`<td class="${di===0?'cal-today':''}"><div class="cal-cell-inner"><input type="checkbox" class="cal-check" data-name="${g.name}" data-date="${ds}" ${ck}><div class="cal-time-wrap" style="display:${sh?'flex':'none'}" data-time-name="${g.name}" data-time-date="${ds}"><div class="cal-time-row"><label>Start</label><select class="cal-time-input" data-field="start" data-tname="${g.name}" data-tdate="${ds}">${tOpts}</select></div><div class="cal-time-row"><label>End</label><select class="cal-time-input" data-field="end" data-tname="${g.name}" data-tdate="${ds}">${tOpts}</select></div><div class="cal-time-warn" data-warn-name="${g.name}" data-warn-date="${ds}"></div></div></div></td>`});html+='</tr>'});html+='</tbody>';table.innerHTML=html;

fg.forEach(g=>{getWeekDates().forEach(ds=>{const entry=getCalEntry(g.name,ds);if(entry){const ss=table.querySelector(`select[data-field="start"][data-tname="${g.name}"][data-tdate="${ds}"]`),es=table.querySelector(`select[data-field="end"][data-tname="${g.name}"][data-tdate="${ds}"]`);if(ss&&entry.start)ss.value=entry.start;if(es&&entry.end)es.value=entry.end;
if(!entry.start||!entry.end){if(!calPending[g.name])calPending[g.name]={};calPending[g.name][ds]=true;const w=table.querySelector(`[data-warn-name="${g.name}"][data-warn-date="${ds}"]`);if(w)w.textContent='Times required'}}})});

table.querySelectorAll('.cal-profile').forEach(el=>{el.onclick=()=>{profileReturnPage='calendarPage';showProfile(parseInt(el.dataset.idx))}});

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
const td=this.closest('td');td.classList.add('cal-saving');await saveCalData();td.classList.remove('cal-saving');renderRoster();renderGrid();renderHome();showToast('Times copied');return}
else{calData[n][d]={start:'',end:''};if(!calPending[n])calPending[n]={};calPending[n][d]=true;if(tw){tw.style.display='flex';const w=table.querySelector(`[data-warn-name="${n}"][data-warn-date="${d}"]`);if(w)w.textContent='Times required'}return}}
calData[n][d]={start:'',end:''};if(!calPending[n])calPending[n]={};calPending[n][d]=true;
if(tw){tw.style.display='flex';const w=table.querySelector(`[data-warn-name="${n}"][data-warn-date="${d}"]`);if(w)w.textContent='Times required'}}
else{if(calData[n])delete calData[n][d];if(calPending[n])delete calPending[n][d];if(tw){tw.style.display='none';const ss=table.querySelector(`select[data-field="start"][data-tname="${n}"][data-tdate="${d}"]`),es=table.querySelector(`select[data-field="end"][data-tname="${n}"][data-tdate="${ds}"]`);if(ss)ss.value='';if(es)es.value='';const w=table.querySelector(`[data-warn-name="${n}"][data-warn-date="${d}"]`);if(w)w.textContent=''}this.closest('td').classList.add('cal-saving');await saveCalData();this.closest('td').classList.remove('cal-saving');renderRoster();renderGrid();renderHome()}}});

table.querySelectorAll('.cal-time-input').forEach(sel=>{sel.onchange=async function(){const n=this.dataset.tname,d=this.dataset.tdate,f=this.dataset.field;if(!calData[n]||!calData[n][d])return;if(typeof calData[n][d]!=='object')calData[n][d]={start:'',end:''};calData[n][d][f]=this.value;const entry=calData[n][d];const w=table.querySelector(`[data-warn-name="${n}"][data-warn-date="${d}"]`);
if(entry.start&&entry.end){this.classList.remove('invalid');if(calPending[n])delete calPending[n][d];if(w)w.textContent='';const td=this.closest('td');td.classList.add('cal-saving');await saveCalData();td.classList.remove('cal-saving');renderRoster();renderGrid();renderHome();showToast('Schedule saved')}
else{this.classList.remove('invalid');if(w)w.textContent='Times required';if(!calPending[n])calPending[n]={};calPending[n][d]=true}}});}