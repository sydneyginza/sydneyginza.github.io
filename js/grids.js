/* === GIRLS GRID, ROSTER, CALENDAR & VALUE === */

/* Roster-only availability filter (local, not shared) */
let rosterAvailFilter=null; /* null | 'now' | 'later' | 'finished' */

/* Girls Grid */
function renderFilters(){const fb=document.getElementById('filterBar');fb.innerHTML='';
/* Sort buttons */
const sep=document.createElement('div');sep.className='filter-sep';fb.appendChild(sep);
const sorts=[{key:'name',label:t('sort.name')},{key:'newest',label:t('sort.dateAdded')},{key:'age',label:t('sort.age')},{key:'body',label:t('sort.size')},{key:'height',label:t('sort.height')},{key:'cup',label:t('sort.cup')},{key:'lastSeen',label:t('sort.lastSeen')}];
sorts.forEach(s=>{const b=document.createElement('button');b.className='sort-btn'+(gridSort===s.key?' active':'');b.textContent=s.label;b.onclick=()=>{if(gridSort===s.key){gridSortDir=gridSortDir==='asc'?'desc':'asc'}else{gridSort=s.key;gridSortDir=(s.key==='newest'||s.key==='lastSeen')?'desc':'asc'}_persistSort();renderFilters();renderGrid();renderRoster();renderFavoritesGrid();pushFiltersToURL()};fb.appendChild(b)});
const dirBtn=document.createElement('button');dirBtn.className='sort-dir-btn';dirBtn.title=gridSortDir==='asc'?'Ascending':'Descending';dirBtn.innerHTML=gridSortDir==='asc'?'<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg><span class="sort-dir-label">ASC</span>':'<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg><span class="sort-dir-label">DESC</span>';dirBtn.onclick=()=>{gridSortDir=gridSortDir==='asc'?'desc':'asc';_persistSort();renderFilters();renderGrid();renderRoster();renderFavoritesGrid();pushFiltersToURL()};fb.appendChild(dirBtn);
if(hasActiveFilters()){const sep3=document.createElement('div');sep3.className='filter-sep';fb.appendChild(sep3);const clr=document.createElement('button');clr.className='filter-btn clear-filters-btn';clr.innerHTML='&#10005; Clear';clr.onclick=()=>{clearAllFilters();onFiltersChanged()};fb.appendChild(clr)}
if(isAdmin()){const ab=document.createElement('button');ab.className='add-btn';ab.innerHTML='+ '+t('ui.addGirl');ab.onclick=()=>openForm();fb.appendChild(ab)}}

function renderAvailNowBar(){
const bar=document.getElementById('rosterAvailBar');
if(!bar)return;
const ts=fmtDate(getAEDTDate());
if(rosterDateFilter!==ts){rosterAvailFilter=null;bar.innerHTML='';bar.style.display='none';return}
const now=getAEDTDate();const nowMins=now.getHours()*60+now.getMinutes();
const rostered=girls.filter(g=>{const e=getCalEntry(g.name,ts);return e&&e.start&&e.end});
let nowCount=0,laterCount=0,finishedCount=0;
rostered.forEach(g=>{
const e=getCalEntry(g.name,ts);const[sh,sm]=e.start.split(':').map(Number);const[eh,em]=e.end.split(':').map(Number);
const sMins=sh*60+sm,eMins=eh*60+em;
const isNow=eMins<=sMins?(nowMins>=sMins||nowMins<eMins):(nowMins>=sMins&&nowMins<eMins);
if(isNow){nowCount++}
else if(eMins>sMins&&nowMins>=eMins){finishedCount++}
else{laterCount++}
});
bar.innerHTML='';
if(!nowCount&&!laterCount&&!finishedCount){bar.style.display='none';return}
bar.style.display='';
if(nowCount>0){const btn=document.createElement('button');btn.className='avail-now-pill'+(rosterAvailFilter==='now'?' active':'');const lbl=(nowCount===1&&siteLanguage==='en')?'1 girl available now':t('ui.girlsAvailNow').replace('{n}',nowCount);btn.innerHTML=`<span class="avail-now-dot"></span>${lbl}`;btn.onclick=()=>{rosterAvailFilter=rosterAvailFilter==='now'?null:'now';renderAvailNowBar();renderRosterGrid()};bar.appendChild(btn)}
if(laterCount>0){const btn=document.createElement('button');btn.className='avail-today-pill'+(rosterAvailFilter==='later'?' active':'');const lbl=(laterCount===1&&siteLanguage==='en')?'1 girl available later today':t('ui.girlsAvailLater').replace('{n}',laterCount);btn.innerHTML=`<span class="avail-today-dot"></span>${lbl}`;btn.onclick=()=>{rosterAvailFilter=rosterAvailFilter==='later'?null:'later';renderAvailNowBar();renderRosterGrid()};bar.appendChild(btn)}
if(finishedCount>0){const btn=document.createElement('button');btn.className='avail-finished-pill'+(rosterAvailFilter==='finished'?' active':'');btn.textContent=finishedCount+(finishedCount===1?' girl ':' girls ')+t('avail.finished').toLowerCase();btn.onclick=()=>{rosterAvailFilter=rosterAvailFilter==='finished'?null:'finished';renderAvailNowBar();renderRosterGrid()};bar.appendChild(btn)}
}

function applySortOrder(list){
const dir=gridSortDir==='desc'?-1:1;
const emptyLast=(a,b,cmp)=>{const an=(a.name||'').trim(),bn=(b.name||'').trim();if(!an&&!bn)return 0;if(!an)return 1;if(!bn)return -1;return cmp(a,b)*dir};
if(gridSort==='age')return list.sort((a,b)=>emptyLast(a,b,()=>{const aa=parseFloat(a.age)||999,ba=parseFloat(b.age)||999;return aa-ba}));
if(gridSort==='newest')return list.sort((a,b)=>emptyLast(a,b,()=>{const ad=a.startDate||'',bd=b.startDate||'';if(!ad&&!bd)return 0;if(!ad)return 1;if(!bd)return -1;return bd.localeCompare(ad)}));
if(gridSort==='body')return list.sort((a,b)=>emptyLast(a,b,()=>{const av=parseFloat(a.body)||999,bv=parseFloat(b.body)||999;return av-bv}));
if(gridSort==='height')return list.sort((a,b)=>emptyLast(a,b,()=>{const av=parseFloat(a.height)||999,bv=parseFloat(b.height)||999;return av-bv}));
if(gridSort==='cup')return list.sort((a,b)=>emptyLast(a,b,()=>(a.cup||'').toLowerCase().localeCompare((b.cup||'').toLowerCase())));
if(gridSort==='lastSeen')return list.sort((a,b)=>emptyLast(a,b,()=>{const ad=getLastRostered(a.name)||'',bd=getLastRostered(b.name)||'';if(!ad&&!bd)return 0;if(!ad)return 1;if(!bd)return -1;return bd.localeCompare(ad)}));
return list.sort((a,b)=>emptyLast(a,b,()=>(a.name||'').trim().toLowerCase().localeCompare((b.name||'').trim().toLowerCase())))}

function daysAgo(iso){const d=Math.floor((Date.now()-new Date(iso))/(864e5));return d===0?'Today':d===1?'Yesterday':d+' days ago'}
const grid=document.getElementById('girlsGrid');
function cardFavBtn(name){if(!loggedIn)return '';const fav=name&&isFavorite(name);return `<button class="card-fav${fav?' active':''}" data-fav-name="${name||''}" title="${fav?'Remove from favorites':'Add to favorites'}">${favHeartSvg(fav)}</button>`}
function bindCardFavs(container){container.querySelectorAll('.card-fav').forEach(btn=>{btn.onclick=e=>{e.stopPropagation();const name=btn.dataset.favName;if(!name)return;const nowFav=toggleFavorite(name);btn.classList.toggle('active',nowFav);btn.innerHTML=favHeartSvg(nowFav);btn.title=nowFav?'Remove from favorites':'Add to favorites';btn.classList.remove('fav-pop');void btn.offsetWidth;btn.classList.add('fav-pop');updateFavBadge()}})}
function cardRatingHtml(g){const rvs=g.reviews||[];if(!rvs.length)return '';const avg=rvs.reduce((s,r)=>s+r.rating,0)/rvs.length;return '<div class="card-rating">'+renderStarsStatic(Math.round(avg))+'<span class="card-rating-num">'+avg.toFixed(1)+'</span><span class="card-rating-count">('+rvs.length+')</span></div>'}
function cardCompareBtn(name){if(!name)return '';const sel=isCompareSelected(name);const cnt=compareSelected.length;return `<button class="card-compare${sel?' active':''}" data-compare-name="${name}" title="${sel?'Remove from compare':'Add to compare'}"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 3H3.5A1.5 1.5 0 002 4.5V9a1.5 1.5 0 001.5 1.5H9A1.5 1.5 0 0010.5 9V4.5A1.5 1.5 0 009 3zm11 0h-5.5A1.5 1.5 0 0013 4.5V9a1.5 1.5 0 001.5 1.5H20A1.5 1.5 0 0021.5 9V4.5A1.5 1.5 0 0020 3zM9 13.5H3.5A1.5 1.5 0 002 15v4.5A1.5 1.5 0 003.5 21H9a1.5 1.5 0 001.5-1.5V15A1.5 1.5 0 009 13.5zm11 0h-5.5A1.5 1.5 0 0013 15v4.5a1.5 1.5 0 001.5 1.5H20a1.5 1.5 0 001.5-1.5V15a1.5 1.5 0 00-1.5-1.5z"/></svg><span class="compare-badge" style="${sel&&cnt>0?'':'display:none'}">${cnt}/${COMPARE_MAX}</span></button>`}
function bindCardCompare(container){container.querySelectorAll('.card-compare').forEach(btn=>{btn.onclick=e=>{e.stopPropagation();const name=btn.dataset.compareName;if(!name)return;toggleCompare(name)}})}
function renderGrid(){safeRender('Girls Grid',()=>{
let filtered=[...girls];
if(!isAdmin())filtered=filtered.filter(g=>!g.hidden);
filtered=applySharedFilters(filtered);
if(!loggedIn)filtered=filtered.filter(g=>g.name&&String(g.name).trim().length>0);
applySortOrder(filtered);
grid.innerHTML='';const ts=fmtDate(getAEDTDate());let _hoverTimer;
if(!filtered.length&&hasActiveFilters()){grid.innerHTML=`<div class="fav-empty"><div class="fav-empty-icon" style="opacity:.15">&#x1F50D;</div><div class="fav-empty-text">${t('ui.noResults')}</div><button class="empty-state-cta" onclick="clearAllFilters();onFiltersChanged()">${t('ui.clearFilters')}</button></div>`;return}
filtered.forEach((g,fi)=>{const card=safeCardRender(g,fi,()=>{const ri=girls.indexOf(g);const el=document.createElement('div');el.className='girl-card'+(g.hidden?' card-hidden':'');
const hideIcon=g.hidden?'&#x1F441;':'&#x1F6AB;';const hideTitle=g.hidden?t('ui.showGirl'):t('ui.hideGirl');
const act=isAdmin()?`<div class="card-actions"><button class="card-action-btn hide-toggle${g.hidden?' active':''}" title="${hideTitle}" data-idx="${ri}">${hideIcon}</button><button class="card-action-btn edit" title="Edit" data-idx="${ri}">&#x270E;</button><button class="card-action-btn delete" title="Delete" data-idx="${ri}">&#x2715;</button></div>`:'';
const img=g.photos&&g.photos.length?lazyThumb(g.photos[0],'card-thumb',g.name):'<div class="silhouette"></div>';const entry=getCalEntry(g.name,ts);
const liveNow=g.name&&isAvailableNow(g.name);
const now=getAEDTDate();
const _todayShiftEnded=entry&&entry.start&&entry.end&&!liveNow&&(()=>{const nm=now.getHours()*60+now.getMinutes();const[eh,em]=entry.end.split(':').map(Number);const[sh,sm]=entry.start.split(':').map(Number);return eh*60+em>sh*60+sm&&nm>=eh*60+em})();
const _gcd=g.name?getAvailCountdown(g.name):null;
const _gcdText=_gcd?(' <span style="opacity:.65;font-size:.85em">·</span> '+(_gcd.type==='ends'?t('avail.endsIn'):t('avail.startsIn')).replace('{t}',_gcd.str)):'';
const avail=liveNow?`<div class="card-avail card-avail-live"><span class="avail-now-dot"></span><span>${t('avail.now')} (${fmtTime12(entry.start)} - ${fmtTime12(entry.end)})${_gcdText}</span></div>`:(!_todayShiftEnded&&entry&&entry.start&&entry.end?`<div class="card-avail">${t('avail.laterToday')} (${fmtTime12(entry.start)} - ${fmtTime12(entry.end)})${_gcdText}</div>`:'');
/* Last-seen / coming-up label when not available today */
let schedLabel='';
if(!avail&&g.name){
  const wdates=getWeekDates();
  const upcoming=wdates.find(dt=>dt>ts&&(getCalEntry(g.name,dt)||{}).start);
  if(upcoming){const dayName=dispDate(upcoming).day;const upEnt=getCalEntry(g.name,upcoming);const timeStr=upEnt&&upEnt.start&&upEnt.end?` (${fmtTime12(upEnt.start)} - ${fmtTime12(upEnt.end)})`:'';const _fmtD=m=>{const d=Math.floor(m/1440),h=Math.floor((m%1440)/60),mm=m%60;return d>0?`${d}d ${h}h`:h>0?`${h}h ${mm}m`:`${mm}m`};const daysUntil=Math.round((new Date(upcoming+' 00:00')-new Date(ts+' 00:00'))/86400000);const nowMins=now.getHours()*60+now.getMinutes();const[ush,usm]=(upEnt&&upEnt.start||'00:00').split(':').map(Number);const totalMins=daysUntil*1440+ush*60+usm-nowMins;const comingCd=totalMins>0?` <span style="opacity:.65;font-size:.85em">·</span> `+t('avail.startsIn').replace('{t}',_fmtD(totalMins)):'';schedLabel=`<div class="card-coming">${t('avail.coming')} ${dayName}${timeStr}${comingCd}</div>`}
  else{const lr=getLastRostered(g.name);if(lr){const diff=Math.round((new Date(ts+' 00:00')-new Date(lr+' 00:00'))/86400000);const rel=diff===0?'today':diff===1?'yesterday':diff+' days ago';schedLabel=`<div class="card-last-seen">${t('avail.lastSeen')} ${rel}</div>`}}
}
const fav=g.name?cardFavBtn(g.name):'';const cmp=g.name?cardCompareBtn(g.name):'';
el.innerHTML=`<div class="card-img" style="background:linear-gradient(135deg,rgba(180,74,255,0.06),rgba(255,111,0,0.03))">${img}${fav}${cmp}${act}</div><div class="card-info"><div class="card-name">${g.name||''}</div><div class="card-country">${Array.isArray(g.country)?g.country.join(', '):(g.country||'')}</div>${g.special?'<div class="card-special">'+g.special+'</div>':''}${cardRatingHtml(g)}${avail||schedLabel}${isAdmin()&&g.lastModified?`<div style="font-size:10px;color:rgba(255,255,255,0.28);letter-spacing:1px;margin-top:2px">${daysAgo(g.lastModified)}</div>`:''}<div class="card-hover-line"></div></div>`;
el.onclick=e=>{if(e.target.closest('.card-action-btn')||e.target.closest('.card-fav')||e.target.closest('.card-compare'))return;_savedScrollY=window.scrollY;sessionStorage.setItem('ginza_scroll',window.scrollY);profileReturnPage='listPage';showProfile(ri)};
if(isAdmin()){el.querySelector('.hide-toggle').onclick=async e=>{e.stopPropagation();g.hidden=!g.hidden;if(await saveData()){renderGrid();renderRoster();renderHome();showToast(g.hidden?t('ui.girlHidden'):t('ui.girlVisible'))}};el.querySelector('.edit').onclick=e=>{e.stopPropagation();openForm(ri)};el.querySelector('.delete').onclick=e=>{e.stopPropagation();openDelete(ri)}}
el.addEventListener('mouseenter',()=>{clearTimeout(_hoverTimer);_hoverTimer=setTimeout(()=>{const prev=document.getElementById('cardHoverPreview');if(!prev)return;const availEl=el.querySelector('.card-avail,.card-coming,.card-last-seen');const availHtml=availEl?availEl.innerHTML:'';const chpCls=availEl?(availEl.classList.contains('card-avail-live')?'chp-avail chp-avail-live':availEl.classList.contains('card-coming')?'chp-avail chp-avail-coming':availEl.classList.contains('card-last-seen')?'chp-avail chp-avail-last':'chp-avail'):'chp-avail';prev.innerHTML=`<div class="chp-name">${g.name||''}</div><div class="chp-country">${Array.isArray(g.country)?g.country.join(', '):(g.country||'')}</div>${g.special?'<div class="chp-special">'+g.special+'</div>':''}${cardRatingHtml(g)?'<div class="chp-rating">'+cardRatingHtml(g)+'</div>':''}${availHtml?'<div class="'+chpCls+'">'+availHtml+'</div>':''}<div class="chp-stats"><div class="chp-row"><span>${t('field.age')}</span><span>${g.age||'—'}</span></div><div class="chp-row"><span>${t('field.body')}</span><span>${g.body||'—'}</span></div><div class="chp-row"><span>${t('field.height')}</span><span>${g.height?g.height+' cm':'—'}</span></div><div class="chp-row"><span>${t('field.cup')}</span><span>${g.cup||'—'}</span></div><div class="chp-divider"></div><div class="chp-row"><span>${t('field.rates30')}</span><span>${g.val1||'—'}</span></div><div class="chp-row"><span>${t('field.rates45')}</span><span>${g.val2||'—'}</span></div><div class="chp-row"><span>${t('field.rates60')}</span><span>${g.val3||'—'}</span></div><div class="chp-row"><span>${t('field.experience')}</span><span>${g.exp||'—'}</span></div></div>`;prev.classList.add('visible')},180)});
el.addEventListener('mouseleave',()=>{clearTimeout(_hoverTimer);document.getElementById('cardHoverPreview')?.classList.remove('visible')});
el.addEventListener('mousemove',e=>{const prev=document.getElementById('cardHoverPreview');if(!prev||!prev.classList.contains('visible'))return;const vw=window.innerWidth,vh=window.innerHeight,pw=prev.offsetWidth||220,ph=prev.offsetHeight||280;let x=e.clientX+16,y=e.clientY+16;if(x+pw>vw-8)x=e.clientX-pw-12;if(y+ph>vh-8)y=e.clientY-ph-12;prev.style.left=x+'px';prev.style.top=y+'px'});
return el});if(card)grid.appendChild(card)});bindCardFavs(grid);bindCardCompare(grid);observeLazy(grid);observeEntrance(grid)})}

/* Roster */
function hasGirlsOnDate(ds){return girls.some(g=>{const e=getCalEntry(g.name,ds);return e&&e.start&&e.end})}

function renderRosterFilters(){const fb=document.getElementById('rosterFilterBar');fb.innerHTML='';const dates=getWeekDates();const ts=dates[0];if(!rosterDateFilter)rosterDateFilter=ts;
const availDates=dates.filter(ds=>hasGirlsOnDate(ds));
if(availDates.length&&!availDates.includes(rosterDateFilter))rosterDateFilter=availDates[0];
if(!availDates.length)rosterDateFilter=null;
availDates.forEach(ds=>{const f=dispDate(ds);const b=document.createElement('button');b.className='filter-btn'+(ds===rosterDateFilter?' date-active':'');b.textContent=ds===ts?t('ui.today'):f.day+' '+f.date;b.onclick=()=>{rosterDateFilter=ds;rosterAvailFilter=null;renderRosterFilters();renderRosterGrid()};fb.appendChild(b)});

/* Available Now / Today quick-filters */
renderAvailNowBar()}
function renderRosterGrid(){safeRender('Roster Grid',()=>{const rg=document.getElementById('rosterGrid');rg.innerHTML='';
if(!rosterDateFilter){rg.innerHTML=`<div class="empty-msg">${t('ui.noGirlsWeek')}</div>`;return}
const ts=fmtDate(getAEDTDate());const ds=rosterDateFilter;
let filtered=[...girls].filter(g=>{const e=getCalEntry(g.name,ds);return e&&e.start&&e.end});
if(!isAdmin())filtered=filtered.filter(g=>!g.hidden);
filtered=applySharedFilters(filtered);
if(!loggedIn)filtered=filtered.filter(g=>g.name&&String(g.name).trim().length>0);
if(ds===ts&&rosterAvailFilter){const _now=getAEDTDate(),_nm=_now.getHours()*60+_now.getMinutes();if(rosterAvailFilter==='now')filtered=filtered.filter(g=>g.name&&isAvailableNow(g.name));else if(rosterAvailFilter==='later')filtered=filtered.filter(g=>{if(!g.name)return false;if(isAvailableNow(g.name))return false;const e=getCalEntry(g.name,ts);if(!e||!e.start||!e.end)return false;const[sh,sm]=e.start.split(':').map(Number);const sMins=sh*60+sm;const[eh,em]=e.end.split(':').map(Number);const eMins=eh*60+em;if(eMins<=sMins)return _nm<sMins;return _nm<sMins});else if(rosterAvailFilter==='finished')filtered=filtered.filter(g=>{const e=getCalEntry(g.name,ts);if(!e||!e.start||!e.end)return false;const[sh,sm]=e.start.split(':').map(Number);const[eh,em]=e.end.split(':').map(Number);const sMins=sh*60+sm,eMins=eh*60+em;if(eMins<=sMins)return false;return _nm>=eMins&&!isAvailableNow(g.name)})}

applySortOrder(filtered);
if(!filtered.length){rg.innerHTML=`<div class="empty-msg">${t('ui.noGirlsDate')}</div>`;return}
let _rosterHoverTimer;filtered.forEach((g,fi)=>{const card=safeCardRender(g,fi,()=>{const ri=girls.indexOf(g);const el=document.createElement('div');el.className='girl-card';const img=g.photos&&g.photos.length?lazyThumb(g.photos[0],'card-thumb',g.name):'<div class="silhouette"></div>';const isToday=ds===ts;const entry=getCalEntry(g.name,ds);
const liveNow=isToday&&g.name&&isAvailableNow(g.name);
const _rNow=getAEDTDate();
const _todayShiftEnded=isToday&&entry&&entry.start&&entry.end&&!liveNow&&(()=>{const nm=_rNow.getHours()*60+_rNow.getMinutes();const[eh,em]=entry.end.split(':').map(Number);const[sh,sm]=entry.start.split(':').map(Number);return eh*60+em>sh*60+sm&&nm>=eh*60+em})();
const timeStr=entry&&entry.start&&entry.end?' ('+fmtTime12(entry.start)+' - '+fmtTime12(entry.end)+')':'';
const avail=liveNow?`<div class="card-avail card-avail-live"><span class="avail-now-dot"></span><span>${t('avail.now')}${timeStr}</span></div>`:(_todayShiftEnded?`<div class="card-avail card-avail-finished">${t('avail.finished')}</div>`:(isToday?`<div class="card-avail">${t('avail.laterToday')}${timeStr}</div>`:`<div class="card-avail" style="color:var(--accent)">${timeStr.trim()}</div>`));
const fav=g.name?cardFavBtn(g.name):'';const cmp=g.name?cardCompareBtn(g.name):'';
el.innerHTML=`<div class="card-img" style="background:linear-gradient(135deg,rgba(180,74,255,0.06),rgba(255,111,0,0.03))">${img}${fav}${cmp}</div><div class="card-info"><div class="card-name">${g.name||''}</div><div class="card-country">${Array.isArray(g.country)?g.country.join(', '):(g.country||'')}</div>${g.special?'<div class="card-special">'+g.special+'</div>':''}${cardRatingHtml(g)}${avail}<div class="card-hover-line"></div></div>`;
el.onclick=e=>{if(e.target.closest('.card-fav')||e.target.closest('.card-compare'))return;_savedScrollY=window.scrollY;sessionStorage.setItem('ginza_scroll',window.scrollY);profileReturnPage='rosterPage';showProfile(ri)};el.addEventListener('mouseenter',()=>{clearTimeout(_rosterHoverTimer);_rosterHoverTimer=setTimeout(()=>{const prev=document.getElementById('cardHoverPreview');if(!prev)return;const availEl=el.querySelector('.card-avail,.card-coming,.card-last-seen');const availHtml=availEl?availEl.innerHTML:'';const chpCls=availEl?(availEl.classList.contains('card-avail-live')?'chp-avail chp-avail-live':availEl.classList.contains('card-coming')?'chp-avail chp-avail-coming':availEl.classList.contains('card-last-seen')?'chp-avail chp-avail-last':'chp-avail'):'chp-avail';prev.innerHTML=`<div class="chp-name">${g.name||''}</div><div class="chp-country">${Array.isArray(g.country)?g.country.join(', '):(g.country||'')}</div>${g.special?'<div class="chp-special">'+g.special+'</div>':''}${cardRatingHtml(g)?'<div class="chp-rating">'+cardRatingHtml(g)+'</div>':''}${availHtml?'<div class="'+chpCls+'">'+availHtml+'</div>':''}<div class="chp-stats"><div class="chp-row"><span>${t('field.age')}</span><span>${g.age||'—'}</span></div><div class="chp-row"><span>${t('field.body')}</span><span>${g.body||'—'}</span></div><div class="chp-row"><span>${t('field.height')}</span><span>${g.height?g.height+' cm':'—'}</span></div><div class="chp-row"><span>${t('field.cup')}</span><span>${g.cup||'—'}</span></div><div class="chp-divider"></div><div class="chp-row"><span>${t('field.rates30')}</span><span>${g.val1||'—'}</span></div><div class="chp-row"><span>${t('field.rates45')}</span><span>${g.val2||'—'}</span></div><div class="chp-row"><span>${t('field.rates60')}</span><span>${g.val3||'—'}</span></div><div class="chp-row"><span>${t('field.experience')}</span><span>${g.exp||'—'}</span></div></div>`;prev.classList.add('visible')},180)});el.addEventListener('mouseleave',()=>{clearTimeout(_rosterHoverTimer);document.getElementById('cardHoverPreview')?.classList.remove('visible')});el.addEventListener('mousemove',e=>{const prev=document.getElementById('cardHoverPreview');if(!prev||!prev.classList.contains('visible'))return;const vw=window.innerWidth,vh=window.innerHeight,pw=prev.offsetWidth||220,ph=prev.offsetHeight||280;let x=e.clientX+16,y=e.clientY+16;if(x+pw>vw-8)x=e.clientX-pw-12;if(y+ph>vh-8)y=e.clientY-ph-12;prev.style.left=x+'px';prev.style.top=y+'px'});return el});if(card)rg.appendChild(card)});bindCardFavs(rg);bindCardCompare(rg);observeLazy(rg);observeEntrance(rg);renderAvailNowBar()})}
function renderRoster(){renderRosterFilters();renderRosterGrid()}

/* Favorites Grid */
function renderFavoritesGrid(){safeRender('Favorites Grid',()=>{const fg=document.getElementById('favoritesGrid');fg.innerHTML='';
const favs=getFavorites();const ts=fmtDate(getAEDTDate());
let filtered=girls.filter(g=>g.name&&favs.includes(g.name));
if(!isAdmin())filtered=filtered.filter(g=>!g.hidden);
applySortOrder(filtered);
if(!filtered.length){fg.innerHTML=`<div class="fav-empty"><div class="fav-empty-icon">&hearts;</div><div class="fav-empty-text">${t('ui.favEmpty')}</div><button class="empty-state-cta" onclick="showPage('listPage');Router.push('/girls')">${t('ui.favBrowse')}</button></div>`;return}
let _favHoverTimer;filtered.forEach((g,fi)=>{const card=safeCardRender(g,fi,()=>{const ri=girls.indexOf(g);const el=document.createElement('div');el.className='girl-card';
const img=g.photos&&g.photos.length?lazyThumb(g.photos[0],'card-thumb',g.name):'<div class="silhouette"></div>';
const entry=getCalEntry(g.name,ts);
const liveNow=g.name&&isAvailableNow(g.name);
const avail=liveNow?`<div class="card-avail card-avail-live"><span class="avail-now-dot"></span><span>${t('avail.now')} (${fmtTime12(entry.start)} - ${fmtTime12(entry.end)})</span></div>`:(entry&&entry.start&&entry.end?`<div class="card-avail">${t('avail.laterToday')} (${fmtTime12(entry.start)} - ${fmtTime12(entry.end)})</div>`:'');
const fav=cardFavBtn(g.name);const cmp=cardCompareBtn(g.name);
el.innerHTML=`<div class="card-img" style="background:linear-gradient(135deg,rgba(180,74,255,0.06),rgba(255,111,0,0.03))">${img}${fav}${cmp}</div><div class="card-info"><div class="card-name">${g.name||''}</div><div class="card-country">${Array.isArray(g.country)?g.country.join(', '):(g.country||'')}</div>${g.special?'<div class="card-special">'+g.special+'</div>':''}${cardRatingHtml(g)}${avail}<div class="card-hover-line"></div></div>`;
el.onclick=e=>{if(e.target.closest('.card-fav')||e.target.closest('.card-compare'))return;_savedScrollY=window.scrollY;sessionStorage.setItem('ginza_scroll',window.scrollY);profileReturnPage='favoritesPage';showProfile(ri)};
el.addEventListener('mouseenter',()=>{clearTimeout(_favHoverTimer);_favHoverTimer=setTimeout(()=>{const prev=document.getElementById('cardHoverPreview');if(!prev)return;const availEl=el.querySelector('.card-avail,.card-coming,.card-last-seen');const availHtml=availEl?availEl.innerHTML:'';const chpCls=availEl?(availEl.classList.contains('card-avail-live')?'chp-avail chp-avail-live':availEl.classList.contains('card-coming')?'chp-avail chp-avail-coming':availEl.classList.contains('card-last-seen')?'chp-avail chp-avail-last':'chp-avail'):'chp-avail';prev.innerHTML=`<div class="chp-name">${g.name||''}</div><div class="chp-country">${Array.isArray(g.country)?g.country.join(', '):(g.country||'')}</div>${g.special?'<div class="chp-special">'+g.special+'</div>':''}${cardRatingHtml(g)?'<div class="chp-rating">'+cardRatingHtml(g)+'</div>':''}${availHtml?'<div class="'+chpCls+'">'+availHtml+'</div>':''}<div class="chp-stats"><div class="chp-row"><span>${t('field.age')}</span><span>${g.age||'—'}</span></div><div class="chp-row"><span>${t('field.body')}</span><span>${g.body||'—'}</span></div><div class="chp-row"><span>${t('field.height')}</span><span>${g.height?g.height+' cm':'—'}</span></div><div class="chp-row"><span>${t('field.cup')}</span><span>${g.cup||'—'}</span></div><div class="chp-divider"></div><div class="chp-row"><span>${t('field.rates30')}</span><span>${g.val1||'—'}</span></div><div class="chp-row"><span>${t('field.rates45')}</span><span>${g.val2||'—'}</span></div><div class="chp-row"><span>${t('field.rates60')}</span><span>${g.val3||'—'}</span></div><div class="chp-row"><span>${t('field.experience')}</span><span>${g.exp||'—'}</span></div></div>`;prev.classList.add('visible')},180)});
el.addEventListener('mouseleave',()=>{clearTimeout(_favHoverTimer);document.getElementById('cardHoverPreview')?.classList.remove('visible')});
el.addEventListener('mousemove',e=>{const prev=document.getElementById('cardHoverPreview');if(!prev||!prev.classList.contains('visible'))return;const vw=window.innerWidth,vh=window.innerHeight,pw=prev.offsetWidth||220,ph=prev.offsetHeight||280;let x=e.clientX+16,y=e.clientY+16;if(x+pw>vw-8)x=e.clientX-pw-12;if(y+ph>vh-8)y=e.clientY-ph-12;prev.style.left=x+'px';prev.style.top=y+'px'});
return el});if(card)fg.appendChild(card)});
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
let html=`<thead><tr><th style="text-align:left">${t('table.rates')}</th><th style="text-align:left">${t('table.priceRange')}</th></tr></thead><tbody>`;
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
let calMobileDay=0; // 0–6, which day column is shown on mobile

function updateMobileCalView(table,dates){
  const activeCol=String(calMobileDay+1);
  table.querySelectorAll('[data-cal-col]').forEach(el=>{el.classList.toggle('cal-col-active',el.dataset.calCol===activeCol)});
  const lbl=document.getElementById('calMobileDayLabel');
  if(lbl){const f=dispDate(dates[calMobileDay]);lbl.textContent=(calMobileDay===0?'Today \u00b7 ':'')+f.day+' '+f.date}
}

function generateTimeOptions(){const o=['<option value="">--:--</option>'];for(let h=0;h<24;h++)for(let m=0;m<60;m+=30){const v=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');const h12=h===0?12:h>12?h-12:h;o.push(`<option value="${v}">${h12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}</option>`)}return o.join('')}

function renderCalendar(){safeRender('Calendar',()=>{const fb=document.getElementById('calFilterBar');fb.innerHTML='';
if(isAdmin()){const cpb=document.createElement('button');cpb.className='add-btn';cpb.innerHTML='&#x2398; Copy Day';cpb.onclick=()=>openCopyDayModal();fb.appendChild(cpb)}
const fg=applySharedFilters([...girls].filter(g=>g.name&&String(g.name).trim().length>0)).sort((a,b)=>(a.name||'').trim().toLowerCase().localeCompare((b.name||'').trim().toLowerCase()));const table=document.getElementById('calTable');const dates=getWeekDates();const ts=dates[0];const tOpts=generateTimeOptions();
let html=`<thead><tr><th>${t('cal.profile')}</th>`;dates.forEach((ds,i)=>{const f=dispDate(ds);html+=`<th class="${i===0?'cal-today':''}" data-cal-col="${i+1}">${f.date}<span class="cal-day-name">${f.day}${i===0?` (${t('ui.today')})`:''}</span></th>`});html+='</tr></thead><tbody>';
fg.forEach(g=>{const gi=girls.indexOf(g);const av=g.photos&&g.photos.length?lazyCalAvatar(g.photos[0],g.name):`<span class="cal-letter">${g.name.charAt(0)}</span>`;
const bulkActions=isAdmin()?`<div class="cal-bulk-actions"><button class="cal-bulk-btn cal-bulk-all" data-bulk-name="${g.name}" title="Mark available all week">${t('cal.allWeek')}</button><button class="cal-bulk-btn cal-bulk-clear" data-bulk-name="${g.name}" title="Clear entire week">${t('cal.clear')}</button></div>`:'';
html+=`<tr><td><div class="cal-profile" data-idx="${gi}"><div class="cal-avatar">${av}</div><div><div class="cal-name">${g.name}</div>${bulkActions}</div></div></td>`;
dates.forEach((ds,di)=>{const entry=getCalEntry(g.name,ds);const ck=entry?'checked':'';const sh=!!entry;
html+=`<td class="${di===0?'cal-today':''}" data-cal-col="${di+1}"><div class="cal-cell-inner"><input type="checkbox" class="cal-check" data-name="${g.name}" data-date="${ds}" ${ck}><div class="cal-time-wrap" style="display:${sh?'flex':'none'}" data-time-name="${g.name}" data-time-date="${ds}"><div class="cal-time-row"><label>Start</label><select class="cal-time-input" data-field="start" data-tname="${g.name}" data-tdate="${ds}">${tOpts}</select></div><div class="cal-time-row"><label>End</label><select class="cal-time-input" data-field="end" data-tname="${g.name}" data-tdate="${ds}">${tOpts}</select></div><div class="cal-time-warn" data-warn-name="${g.name}" data-warn-date="${ds}"></div></div></div></td>`});html+='</tr>'});html+='</tbody>';table.innerHTML=html;observeLazy(table);observeCalEntrance(table);
/* Mobile day nav */
{const mn=document.getElementById('calMobileNav');if(mn){mn.innerHTML='<div class="cal-mobile-nav"><button class="cal-mobile-btn" id="calMobilePrev">&#8249;</button><div class="cal-mobile-label" id="calMobileDayLabel"></div><button class="cal-mobile-btn" id="calMobileNext">&#8250;</button></div>';const pd=document.getElementById('calMobilePrev'),nd=document.getElementById('calMobileNext');if(pd)pd.onclick=()=>{if(calMobileDay>0){calMobileDay--;updateMobileCalView(table,dates)}};if(nd)nd.onclick=()=>{if(calMobileDay<6){calMobileDay++;updateMobileCalView(table,dates)}};updateMobileCalView(table,dates)}}

fg.forEach(g=>{getWeekDates().forEach(ds=>{const entry=getCalEntry(g.name,ds);if(entry){const ss=table.querySelector(`select[data-field="start"][data-tname="${g.name}"][data-tdate="${ds}"]`),es=table.querySelector(`select[data-field="end"][data-tname="${g.name}"][data-tdate="${ds}"]`);if(ss&&entry.start)ss.value=entry.start;if(es&&entry.end)es.value=entry.end;
if(!entry.start||!entry.end){if(!calPending[g.name])calPending[g.name]={};calPending[g.name][ds]=true;const w=table.querySelector(`[data-warn-name="${g.name}"][data-warn-date="${ds}"]`);if(w)w.textContent='Times required'}}})});

table.querySelectorAll('.cal-profile').forEach(el=>{el.onclick=e=>{if(e.target.closest('.cal-bulk-btn'))return;profileReturnPage='calendarPage';showProfile(parseInt(el.dataset.idx))}});

/* Bulk calendar actions */
if(isAdmin()){
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

