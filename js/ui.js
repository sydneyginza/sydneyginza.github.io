/* === UI: Nav, Auth, Particles, Home, Lightbox, Profile === */
let formNewFiles=[],activeLocation="All",deleteTarget=-1,currentProfileIdx=0;
let rosterDateFilter=null,rosterLocFilter=null,calLocFilter=null,calPending={};
let ngIdx=0,ngList=[];
let copyTimeResolve=null;

/* ── Shared Filter State (resets on refresh) ── */
let sharedFilters={country:null,ageMin:null,ageMax:null,bodyMin:null,bodyMax:null,heightMin:null,heightMax:null,cupSize:null,val1Min:null,val1Max:null,val2Min:null,val2Max:null,val3Min:null,val3Max:null,experience:null,labels:[]};

function applySharedFilters(list){
let f=list;
if(sharedFilters.country)f=f.filter(g=>g.country===sharedFilters.country);
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
return f}

function hasActiveFilters(){return !!(sharedFilters.country||sharedFilters.ageMin!=null||sharedFilters.ageMax!=null||sharedFilters.bodyMin!=null||sharedFilters.bodyMax!=null||sharedFilters.heightMin!=null||sharedFilters.heightMax!=null||sharedFilters.cupSize||sharedFilters.val1Min!=null||sharedFilters.val1Max!=null||sharedFilters.val2Min!=null||sharedFilters.val2Max!=null||sharedFilters.val3Min!=null||sharedFilters.val3Max!=null||sharedFilters.experience||sharedFilters.labels.length)}

function clearAllFilters(){sharedFilters={country:null,ageMin:null,ageMax:null,bodyMin:null,bodyMax:null,heightMin:null,heightMax:null,cupSize:null,val1Min:null,val1Max:null,val2Min:null,val2Max:null,val3Min:null,val3Max:null,experience:null,labels:[]}}

function getDataRange(field,prefix){
const nums=girls.map(g=>parseFloat(g[field])).filter(n=>!isNaN(n)&&n>0);
if(!nums.length)return{min:'Min',max:'Max'};
const p=prefix||'';
return{min:p+Math.min(...nums),max:p+Math.max(...nums)}}

function makeRangeSection(title,minKey,maxKey,dataField,prefix){
const sec=document.createElement('div');sec.className='fp-section';
const r=getDataRange(dataField,prefix);
sec.innerHTML=`<div class="fp-title">${title}</div><div class="fp-range"><div class="fp-range-row"><input class="fp-range-input" type="number" placeholder="${r.min}" data-fkey="${minKey}" value="${sharedFilters[minKey]!=null?sharedFilters[minKey]:''}"><span class="fp-range-sep">to</span><input class="fp-range-input" type="number" placeholder="${r.max}" data-fkey="${maxKey}" value="${sharedFilters[maxKey]!=null?sharedFilters[maxKey]:''}"></div></div>`;
return sec}

function renderFilterPane(containerId){
const pane=document.getElementById(containerId);if(!pane)return;
pane.innerHTML='';
const countries=[...new Set(girls.map(g=>g.country).filter(Boolean))].sort();
const cups=[...new Set(girls.map(g=>g.cup).filter(Boolean))].sort();
const exps=[...new Set(girls.map(g=>g.exp).filter(Boolean))].sort();
const labels=[...new Set(girls.flatMap(g=>g.labels||[]).filter(Boolean))].sort();

/* Country */
if(countries.length){
const sec=document.createElement('div');sec.className='fp-section';
sec.innerHTML=`<div class="fp-title">Country</div><div class="fp-options"></div>`;
pane.appendChild(sec);
const wrap=sec.querySelector('.fp-options');
countries.forEach(c=>{
const btn=document.createElement('button');btn.className='fp-option'+(sharedFilters.country===c?' active':'');
const cnt=girls.filter(g=>g.country===c).length;
btn.innerHTML=`<span class="fp-check">${sharedFilters.country===c?'✓':''}</span>${c}<span class="fp-count">${cnt}</span>`;
btn.onclick=()=>{sharedFilters.country=sharedFilters.country===c?null:c;onFiltersChanged()};
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
const cnt=girls.filter(g=>g.cup===c).length;
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
const cnt=girls.filter(g=>g.exp===e).length;
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
const cnt=girls.filter(g=>g.labels&&g.labels.includes(l)).length;
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
inp.addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(()=>{const key=inp.dataset.fkey;const val=inp.value.trim();sharedFilters[key]=val===''?null:parseFloat(val);onFiltersChanged()},400)})})}

function onFiltersChanged(){
renderFilterPane('girlsFilterPane');
renderFilterPane('rosterFilterPane');
renderFilterPane('calFilterPane');
renderFilters();renderGrid();renderRoster();
if(document.getElementById('calendarPage').classList.contains('active'))renderCalendar()}
const allPages=['homePage','rosterPage','listPage','valuePage','employmentPage','calendarPage','profilePage'].map(id=>document.getElementById(id));

function showPage(id){
if(document.getElementById('calendarPage').classList.contains('active')&&id!=='calendarPage'){let s=false;for(const n in calPending)for(const dt in calPending[n])if(calPending[n][dt]&&calData[n]&&calData[n][dt]){delete calData[n][dt];s=true}if(s){saveCalData();renderRoster();renderGrid()}calPending={}}
allPages.forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');
document.querySelectorAll('.nav-links a').forEach(a=>a.classList.remove('active'));
if(id==='homePage'){document.getElementById('navHome').classList.add('active');renderHome()}
if(id==='rosterPage'){document.getElementById('navRoster').classList.add('active');renderFilterPane('rosterFilterPane');renderRoster()}
if(id==='listPage'){document.getElementById('navGirls').classList.add('active');renderFilterPane('girlsFilterPane');renderGrid()}
if(id==='valuePage'){document.getElementById('navValue').classList.add('active');renderValueTable()}
if(id==='employmentPage'){document.getElementById('navEmployment').classList.add('active')}
if(id==='calendarPage'){document.getElementById('navCalendar').classList.add('active');calPending={};renderFilterPane('calFilterPane');renderCalendar()}
window.scrollTo(0,0)}

document.getElementById('navHome').onclick=e=>{e.preventDefault();showPage('homePage')};
document.getElementById('navRoster').onclick=e=>{e.preventDefault();showPage('rosterPage')};
document.getElementById('navGirls').onclick=e=>{e.preventDefault();showPage('listPage')};
document.getElementById('navValue').onclick=e=>{e.preventDefault();showPage('valuePage')};
document.getElementById('navEmployment').onclick=e=>{e.preventDefault();showPage('employmentPage')};
document.getElementById('navCalendar').onclick=e=>{e.preventDefault();showPage('calendarPage')};

/* Copy Time Modal */
function findExistingTimes(name,excludeDate){const dates=getWeekDates();for(const dt of dates){if(dt===excludeDate)continue;const entry=getCalEntry(name,dt);if(entry&&entry.start&&entry.end)return{date:dt,start:entry.start,end:entry.end}}return null}
function closeCopyTimeModal(result){const modal=document.getElementById('copyTimeModal');modal.classList.remove('open');if(copyTimeResolve){copyTimeResolve(result);copyTimeResolve=null}}
function showCopyTimePrompt(name,sourceDate,start,end){return new Promise(resolve=>{const modal=document.getElementById('copyTimeModal');const f=dispDate(sourceDate);document.getElementById('copyTimeMsg').innerHTML=`<strong style="color:#fff">${name}</strong> has existing times from <strong style="color:#fff">${f.day} ${f.date}</strong>`;document.getElementById('copyTimeDetail').textContent=fmtTime12(start)+' \u2014 '+fmtTime12(end);copyTimeResolve=resolve;modal.classList.add('open')})}
document.getElementById('copyTimeCopy').onclick=()=>closeCopyTimeModal('copy');
document.getElementById('copyTimeNew').onclick=()=>closeCopyTimeModal('new');
document.getElementById('copyTimeCancel').onclick=()=>closeCopyTimeModal('cancel');
document.getElementById('copyTimeModal').onclick=e=>{if(e.target===document.getElementById('copyTimeModal'))closeCopyTimeModal('cancel')};
window.addEventListener('beforeunload',()=>closeCopyTimeModal('cancel'));

/* Home Page */
function getNewGirls(){const now=getAEDTDate();const cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-28);return girls.filter(g=>{if(!g.startDate)return false;const sd=new Date(g.startDate+'T00:00:00');return sd>=cutoff&&sd<=now})}

function renderHome(){
const c=document.getElementById('homeImages');c.innerHTML='';
const baseUrl='https://raw.githubusercontent.com/sydneyginza/sydneyginza.github.io/main/Images/Homepage/Homepage_';
for(let i=1;i<=4;i++){const card=document.createElement('div');card.className='home-img-card';card.style.cursor='default';card.innerHTML=`<img src="${baseUrl}${i}.jpg">`;c.appendChild(card)}
document.getElementById('homeAnnounce').innerHTML='<p></p>';
ngList=getNewGirls();ngIdx=0;renderNewGirls()}

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
let lbPhotos=[],lbIdx=0;const lightbox=document.getElementById('lightbox'),lbImg=document.getElementById('lbImg');
document.getElementById('lbClose').onclick=()=>lightbox.classList.remove('open');
lightbox.onclick=e=>{if(e.target===lightbox)lightbox.classList.remove('open')};
document.getElementById('lbPrev').onclick=()=>{lbIdx=(lbIdx-1+lbPhotos.length)%lbPhotos.length;lbImg.src=lbPhotos[lbIdx]};
document.getElementById('lbNext').onclick=()=>{lbIdx=(lbIdx+1)%lbPhotos.length;lbImg.src=lbPhotos[lbIdx]};
function openLightbox(p,i){lbPhotos=p;lbIdx=i;lbImg.src=p[i];lightbox.classList.add('open')}

/* Profile Nav Rail */
function renderProfileNav(idx){const rail=document.getElementById('profileNavRail'),total=girls.length;rail.innerHTML='';
const up=document.createElement('button');up.className='pnav-arrow';up.innerHTML='<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>';up.onclick=()=>showProfile(idx<=0?total-1:idx-1);rail.appendChild(up);
const dots=document.createElement('div');dots.className='pnav-dots';const mx=5;let st=Math.max(0,idx-Math.floor(mx/2)),en=Math.min(total,st+mx);if(en-st<mx)st=Math.max(0,en-mx);
for(let i=st;i<en;i++){const d=document.createElement('button');d.className='pnav-dot'+(i===idx?' active':'');const g=girls[i];d.innerHTML=g.photos&&g.photos.length?`<div class="dot-inner"><img src="${g.photos[0]}"></div>`:`<div class="dot-inner"><span class="dot-letter">${g.name.charAt(0)}</span></div>`;d.onclick=()=>showProfile(i);dots.appendChild(d)}
rail.appendChild(dots);const ctr=document.createElement('div');ctr.className='pnav-counter';ctr.innerHTML=`<span>${idx+1}</span> / ${total}`;rail.appendChild(ctr);
const dn=document.createElement('button');dn.className='pnav-arrow';dn.innerHTML='<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>';dn.onclick=()=>showProfile(idx>=total-1?0:idx+1);rail.appendChild(dn)}

/* Profile Page */
function showProfile(idx){
const g=girls[idx];if(!g)return;currentProfileIdx=idx;if(!g.photos)g.photos=[];
const mainImg=g.photos.length?`<img src="${g.photos[0]}">`:'<div class="silhouette"></div>';
const admin=loggedIn?`<div class="profile-actions"><button class="btn btn-primary" id="profEdit">Edit Profile</button><button class="btn btn-danger" id="profDelete">Delete</button></div>`:'';
const ts=fmtDate(getAEDTDate());const entry=getCalEntry(g.name,ts);
let availHtml='';if(entry&&entry.start&&entry.end)availHtml='<span class="dim">|</span><span style="color:#00c864;font-weight:600">Available Today ('+fmtTime12(entry.start)+' - '+fmtTime12(entry.end)+')</span>';
const stats=[{l:'Age',v:g.age},{l:'Body Size',v:g.body},{l:'Height',v:g.height+' cm'},{l:'Cup Size',v:g.cup},{l:'Rates 30 mins',v:g.val1||'\u2014'},{l:'Rates 45 mins',v:g.val2||'\u2014'},{l:'Rates 60 mins',v:g.val3||'\u2014'},{l:'Experience',v:g.exp||'\u2014'}];
document.getElementById('profileContent').innerHTML=`<button class="back-btn" id="backBtn"><svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>Back</button>
<div class="profile-layout"><div class="profile-image-area"><div class="profile-main-img" id="profMainImg">${mainImg}</div><div class="profile-thumbs" id="profThumbs"></div></div>
<div class="profile-details"><div class="profile-name">${g.name}</div><div class="profile-meta"><span>${g.location}</span><span class="dim">|</span><span>${g.country}</span>${availHtml}</div><div class="profile-divider"></div>
<div class="profile-stats">${stats.map(s=>`<div class="profile-stat"><div class="p-label">${s.l}</div><div class="p-val">${s.v}</div></div>`).join('')}</div>
<div class="profile-desc-title">Language</div><div class="profile-desc" style="margin-bottom:24px">${g.lang||'\u2014'}</div>
<div class="profile-desc-title">Type</div><div class="profile-desc" style="margin-bottom:24px">${g.type||'\u2014'}</div>
<div class="profile-desc-title">Description</div><div class="profile-desc">${g.desc}</div>
${g.labels&&g.labels.length?`<div class="profile-desc-title" style="margin-top:24px">Labels</div><div class="profile-labels">${g.labels.map(l=>`<span class="profile-label">${l}</span>`).join('')}</div>`:''}${admin}</div></div>`;
document.getElementById('backBtn').onclick=()=>showPage(profileReturnPage);
if(loggedIn){document.getElementById('profEdit').onclick=()=>openForm(idx);document.getElementById('profDelete').onclick=()=>openDelete(idx)}
renderThumbs(idx);renderProfileNav(idx);allPages.forEach(p=>p.classList.remove('active'));document.getElementById('profilePage').classList.add('active');document.querySelectorAll('.nav-links a').forEach(a=>a.classList.remove('active'));window.scrollTo(0,0)}

function renderThumbs(idx){const g=girls[idx],c=document.getElementById('profThumbs');c.innerHTML='';
g.photos.forEach((src,i)=>{const w=document.createElement('div');w.className='thumb-wrap';const t=document.createElement('div');t.className='profile-thumb'+(i===0?' active':'');t.innerHTML=`<img src="${src}">`;
t.onclick=()=>{document.getElementById('profMainImg').innerHTML=`<img src="${src}">`;c.querySelectorAll('.profile-thumb').forEach(x=>x.classList.remove('active'));t.classList.add('active')};
t.ondblclick=()=>openLightbox(g.photos,i);w.appendChild(t);
if(loggedIn){const rm=document.createElement('button');rm.className='profile-thumb-remove';rm.innerHTML='&#x2715;';rm.onclick=async e=>{e.stopPropagation();if(src.includes('githubusercontent.com'))await deleteFromGithub(src);g.photos.splice(i,1);await saveData();showProfile(idx);renderGrid();renderRoster();renderHome();showToast('Photo removed')};w.appendChild(rm)}c.appendChild(w)})}

/* Auth / Login */
const loginIconBtn=document.getElementById('loginIconBtn'),userDropdown=document.getElementById('userDropdown');
function renderDropdown(){
if(loggedIn){loginIconBtn.classList.add('logged-in');userDropdown.innerHTML=`<div class="dropdown-header"><div class="label">Signed in as</div><div class="user">${(loggedInUser||'ADMIN').toUpperCase()}</div></div><button class="dropdown-item danger" id="logoutBtn">Sign Out</button>`;
document.getElementById('logoutBtn').onclick=()=>{loggedIn=false;loggedInUser=null;loginIconBtn.classList.remove('logged-in');userDropdown.classList.remove('open');document.getElementById('navCalendar').style.display='none';if(document.getElementById('calendarPage').classList.contains('active'))showPage('homePage');renderDropdown();renderFilters();renderGrid();renderRoster();renderHome()}}
else{loginIconBtn.classList.remove('logged-in');userDropdown.innerHTML=`<div class="login-form-inline"><div class="lf-title">Sign In</div><div class="lf-group"><label class="lf-label">Username</label><input class="lf-input" id="lfUser" placeholder="Username" autocomplete="off"></div><div class="lf-group"><label class="lf-label">Password</label><input class="lf-input" id="lfPass" type="password" placeholder="Password"></div><button class="lf-btn" id="lfBtn">Access</button><div class="lf-error" id="lfError"></div></div>`;
document.getElementById('lfBtn').onclick=doLogin;document.getElementById('lfPass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()});document.getElementById('lfUser').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('lfPass').focus()})}}
function doLogin(){const u=document.getElementById('lfUser').value.trim(),p=document.getElementById('lfPass').value;const match=CRED.find(c=>c.user===u&&c.pass===p);
if(match){loggedIn=true;loggedInUser=match.user;document.getElementById('navCalendar').style.display='';renderDropdown();renderFilters();renderGrid();renderRoster();renderHome();if(document.getElementById('profilePage').classList.contains('active'))showProfile(currentProfileIdx);setTimeout(()=>userDropdown.classList.remove('open'),600);showToast('Signed in as '+match.user.toUpperCase())}
else{document.getElementById('lfError').textContent='Invalid credentials.';document.getElementById('lfPass').value=''}}
loginIconBtn.onclick=e=>{e.stopPropagation();userDropdown.classList.toggle('open')};
document.addEventListener('click',e=>{if(!e.target.closest('#userDropdown')&&!e.target.closest('#loginIconBtn'))userDropdown.classList.remove('open')});
renderDropdown();

/* Particles */
const particlesEl=document.getElementById('particles');for(let i=0;i<30;i++){const p=document.createElement('div');p.className='particle';p.style.left=Math.random()*100+'%';p.style.animationDuration=(8+Math.random()*12)+'s';p.style.animationDelay=Math.random()*10+'s';p.style.width=p.style.height=(1+Math.random()*2)+'px';particlesEl.appendChild(p)}
