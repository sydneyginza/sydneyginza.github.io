/* === FORMS, DELETE & INIT === */

const formOverlay=document.getElementById('formOverlay');
const formFields=['fName','fAge','fBody','fHeight','fCup','fVal1','fVal2','fVal3','fSpecial','fExp','fStartDate','fLang','fType','fDesc'];
let formLabels=[];
document.getElementById('formClose').onclick=()=>formOverlay.classList.remove('open');
document.getElementById('formCancel').onclick=()=>formOverlay.classList.remove('open');
formOverlay.onclick=e=>{if(e.target===formOverlay)formOverlay.classList.remove('open')};
let formPhotos=[],formPhotosToDelete=[],formNewPhotos=[],formNewFiles=[];
let formCountries=[];
let selectedPhotoIdx=null;
const COUNTRY_OPTIONS=['Chinese','French','Italian','Japanese','Korean','Russian','Thailand','Vietnamese','Other'];

function renderFormCountries(){const wrap=document.getElementById('fCountryOptions');wrap.innerHTML='';
COUNTRY_OPTIONS.forEach(c=>{const btn=document.createElement('div');btn.className='country-opt'+(formCountries.includes(c)?' selected':'');btn.textContent=c;btn.onclick=()=>{if(formCountries.includes(c))formCountries=formCountries.filter(x=>x!==c);else formCountries.push(c);renderFormCountries()};wrap.appendChild(btn)})}


function renderFormPhotos(){const g=document.getElementById('fPhotoGrid'),count=document.getElementById('fPhotoCount');g.innerHTML='';count.textContent=`(${formPhotos.length} / ${MAX_PHOTOS})`;
if(formPhotos.length>1){const hint=document.createElement('div');hint.style.cssText='width:100%;font-family:"Rajdhani",sans-serif;font-size:11px;color:rgba(255,255,255,0.25);letter-spacing:1px;margin-bottom:6px';hint.textContent='Click to select · ← → to move · Drag to reorder';g.appendChild(hint)}
let _dragIdx=null;
formPhotos.forEach((src,i)=>{const w=document.createElement('div');w.style.cssText='position:relative;display:inline-block;cursor:grab';w.draggable=true;
const t=document.createElement('div');t.style.cssText='width:64px;height:64px;border:2px solid rgba(255,255,255,0.1);overflow:hidden;clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));transition:border-color .15s';if(selectedPhotoIdx===i)t.style.borderColor='var(--accent)';t.innerHTML=`<img src="${src}" style="width:100%;height:100%;object-fit:cover;pointer-events:none">`;
w.onclick=e=>{if(e.target===rm||rm.contains(e.target))return;selectedPhotoIdx=(selectedPhotoIdx===i)?null:i;renderFormPhotos()};
const rm=document.createElement('button');rm.style.cssText='position:absolute;top:1px;right:1px;width:18px;height:18px;background:rgba(0,0,0,0.85);border:1px solid rgba(255,68,68,0.5);color:#ff4444;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:2px;z-index:2';rm.innerHTML='&#x2715;';rm.onclick=e=>{e.stopPropagation();if(selectedPhotoIdx===i)selectedPhotoIdx=null;else if(selectedPhotoIdx>i)selectedPhotoIdx--;const removed=formPhotos[i];if(removed.startsWith('data:')){const ni=formNewPhotos.indexOf(removed);if(ni>=0){formNewPhotos.splice(ni,1);formNewFiles.splice(ni,1)}}formPhotosToDelete.push(removed);formPhotos.splice(i,1);renderFormPhotos()};
w.ondragstart=e=>{_dragIdx=i;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',String(i));setTimeout(()=>{w.style.opacity='0.35'},0)};
w.ondragend=()=>{w.style.opacity='';_dragIdx=null;g.querySelectorAll('div[draggable]').forEach(el=>{const inner=el.querySelector('div');if(inner)inner.style.borderColor='rgba(255,255,255,0.1)'})};
w.ondragover=e=>{e.preventDefault();e.dataTransfer.dropEffect='move';if(_dragIdx!==null&&_dragIdx!==i)t.style.borderColor='var(--accent)'};
w.ondragleave=()=>{t.style.borderColor='rgba(255,255,255,0.1)'};
w.ondrop=e=>{e.preventDefault();t.style.borderColor='rgba(255,255,255,0.1)';const from=parseInt(e.dataTransfer.getData('text/plain'));const to=i;if(from===to||isNaN(from))return;const moved=formPhotos.splice(from,1)[0];formPhotos.splice(to,0,moved);renderFormPhotos()};
w.appendChild(t);w.appendChild(rm);g.appendChild(w)});
if(formPhotos.length<MAX_PHOTOS){const addBtn=document.createElement('div');addBtn.style.cssText='width:64px;height:64px;border:2px dashed rgba(180,74,255,0.3);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--accent);font-size:22px;clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));transition:all .3s';addBtn.innerHTML='+';addBtn.onmouseenter=()=>{addBtn.style.borderColor='var(--accent)';addBtn.style.background='rgba(180,74,255,0.06)'};addBtn.onmouseleave=()=>{addBtn.style.borderColor='rgba(180,74,255,0.3)';addBtn.style.background='none'};
addBtn.onclick=()=>{const rem=MAX_PHOTOS-formPhotos.length;if(rem<=0)return;const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.multiple=true;inp.onchange=e=>{const files=Array.from(e.target.files).slice(0,rem);let loaded=0;files.forEach(f=>{const r=new FileReader();r.onload=ev=>{formPhotos.push(ev.target.result);formNewPhotos.push(ev.target.result);formNewFiles.push(f.name);loaded++;if(loaded===files.length)renderFormPhotos()};r.readAsDataURL(f)})};inp.click()};g.appendChild(addBtn)}}

function renderFormLabels(){const c=document.getElementById('fLabelTags');c.innerHTML='';
formLabels.forEach((lbl,i)=>{const tag=document.createElement('span');tag.className='label-tag';tag.innerHTML=`${lbl}<button class="label-remove" title="Remove">&times;</button>`;tag.querySelector('.label-remove').onclick=()=>{formLabels.splice(i,1);renderFormLabels()};c.appendChild(tag)})}

document.addEventListener('DOMContentLoaded',()=>{
const inp=document.getElementById('fLabelInput');if(inp){inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const v=sanitize(inp.value);if(v&&!formLabels.includes(v)){formLabels.push(v);renderFormLabels()}inp.value=''}})}
document.addEventListener('keydown',e=>{
  if(!formOverlay.classList.contains('open'))return;
  if(selectedPhotoIdx===null)return;
  if(document.activeElement&&document.activeElement.matches('input,textarea,select'))return;
  if(e.key==='ArrowLeft'&&selectedPhotoIdx>0){e.preventDefault();const moved=formPhotos.splice(selectedPhotoIdx,1)[0];selectedPhotoIdx--;formPhotos.splice(selectedPhotoIdx,0,moved);renderFormPhotos()}
  else if(e.key==='ArrowRight'&&selectedPhotoIdx<formPhotos.length-1){e.preventDefault();const moved=formPhotos.splice(selectedPhotoIdx,1)[0];selectedPhotoIdx++;formPhotos.splice(selectedPhotoIdx,0,moved);renderFormPhotos()}
});
});

function sanitize(s){return(s||'').replace(/<[^>]+>/g,'').trim()}

function openForm(idx=-1){document.getElementById('editIndex').value=idx;formPhotosToDelete=[];formNewPhotos=[];formNewFiles=[];selectedPhotoIdx=null;
if(idx>=0){document.getElementById('formTitle').textContent=t('form.editGirl');const g=girls[idx];document.getElementById('fName').value=g.name;const gc=g.country||'';formCountries=Array.isArray(gc)?[...gc]:(gc?[gc]:[]);document.getElementById('fAge').value=g.age;document.getElementById('fBody').value=g.body;document.getElementById('fHeight').value=g.height;document.getElementById('fCup').value=g.cup;document.getElementById('fVal1').value=g.val1||'';document.getElementById('fVal2').value=g.val2||'';document.getElementById('fVal3').value=g.val3||'';document.getElementById('fSpecial').value=g.special||'';document.getElementById('fExp').value=g.exp||'';document.getElementById('fStartDate').value=g.startDate||fmtDate(getAEDTDate());document.getElementById('fLang').value=g.lang||'';document.getElementById('fType').value=g.type||'';document.getElementById('fDesc').value=g.desc;formPhotos=[...(g.photos||[])];formLabels=[...(g.labels||[])]}
else{document.getElementById('formTitle').textContent=t('form.addGirl');formFields.forEach(id=>document.getElementById(id).value='');document.getElementById('fStartDate').value=fmtDate(getAEDTDate());formPhotos=[];formLabels=[];formCountries=[]}renderFormPhotos();renderFormLabels();renderFormCountries();formOverlay.classList.add('open')}

document.getElementById('formSave').onclick=async()=>{
const req=[{id:'fName',label:'Name'},{id:'fAge',label:'Age'},{id:'fBody',label:'Body Size'},{id:'fHeight',label:'Height'},{id:'fCup',label:'Cup Size'},{id:'fExp',label:'Experience'},{id:'fVal3',label:'Value 3'},{id:'fStartDate',label:'Start Date'},{id:'fLang',label:'Language'},{id:'fType',label:'Type'},{id:'fDesc',label:'Description'}];
for(const f of req){const el=document.getElementById(f.id);if(!el.value.trim()){el.focus();showToast(f.label+' is required','error');return}}
if(formCountries.length===0){showToast('Country is required','error');return}
if(formPhotos.length===0){showToast('At least one photo is required','error');return}
const name=sanitize(document.getElementById('fName').value);const saveBtn=document.getElementById('formSave');saveBtn.textContent='SAVING...';saveBtn.style.pointerEvents='none';
try{for(const url of formPhotosToDelete){if(url.includes('githubusercontent.com'))await deleteFromGithub(url)}
const finalPhotos=[];for(const src of formPhotos){if(src.startsWith('data:')){if(GT){const ni=formNewPhotos.indexOf(src);finalPhotos.push(await uploadToGithub(src,name,ni>=0?formNewFiles[ni]:genFn()))}else finalPhotos.push(src)}else finalPhotos.push(src)}
const special=document.getElementById('fSpecial').value.trim(),lang=document.getElementById('fLang').value.trim(),type=document.getElementById('fType').value.trim(),desc=sanitize(document.getElementById('fDesc').value);
const o={name,location:'Empire',country:[...formCountries],age:document.getElementById('fAge').value.trim(),body:document.getElementById('fBody').value.trim(),height:document.getElementById('fHeight').value.trim(),cup:document.getElementById('fCup').value.trim(),val1:document.getElementById('fVal1').value.trim(),val2:document.getElementById('fVal2').value.trim(),val3:document.getElementById('fVal3').value.trim(),special,exp:document.getElementById('fExp').value.trim(),startDate:document.getElementById('fStartDate').value.trim(),lang,type,desc,specialJa:special,langJa:lang,typeJa:type,descJa:desc,photos:finalPhotos,labels:[...formLabels],labelsJa:[...formLabels],lastModified:new Date().toISOString()};
const idx=parseInt(document.getElementById('editIndex').value);if(idx>=0)girls[idx]=o;else girls.push(o);
if(await saveData()){logAdminAction(idx>=0?'profile_edit':'profile_add',name);formOverlay.classList.remove('open');renderFilters();renderGrid();renderRoster();renderHome();if(document.getElementById('profilePage').classList.contains('active')&&idx>=0)showProfile(idx);showToast(idx>=0?'Profile updated':'Profile added')}}catch(err){showToast('Error: '+err.message,'error')}finally{saveBtn.textContent='SAVE';saveBtn.style.pointerEvents='auto'}};

/* Delete */
const deleteOverlay=document.getElementById('deleteOverlay');
document.getElementById('deleteCancel').onclick=()=>deleteOverlay.classList.remove('open');
deleteOverlay.onclick=e=>{if(e.target===deleteOverlay)deleteOverlay.classList.remove('open')};
function openDelete(idx){deleteTarget=idx;document.getElementById('deleteMsg').textContent=`Remove "${girls[idx].name}" from the roster?`;deleteOverlay.classList.add('open')}
document.getElementById('deleteConfirm').onclick=async()=>{if(deleteTarget>=0){const g=girls[deleteTarget];if(g.photos&&GT)for(const url of g.photos){if(url.includes('githubusercontent.com'))await deleteFromGithub(url)}const deletedName=g.name;girls.splice(deleteTarget,1);await saveData();logAdminAction('profile_delete',deletedName);deleteTarget=-1;deleteOverlay.classList.remove('open');renderFilters();renderGrid();renderRoster();renderHome();if(document.getElementById('profilePage').classList.contains('active'))showPage('homePage');showToast('Profile deleted')}};

/* Init */
function removeSkeletons(){const ids=['homeSkeleton','rosterSkeleton','girlsSkeleton','calSkeleton','rosterFilterSkeleton','girlsFilterSkeleton','favoritesSkeleton','valueTableSkeleton'];ids.forEach(id=>{const el=document.getElementById(id);if(el){el.classList.add('fade-out');setTimeout(()=>el.remove(),400)}})}

function normalizeCalData(cal){if(!cal)return{};for(const n in cal)for(const dt in cal[n])if(cal[n][dt]===true)cal[n][dt]={start:'',end:''};return cal}

function fullRender(){rosterDateFilter=fmtDate(getAEDTDate());renderFilters();renderGrid();renderRoster();renderHome();updateFavBadge()}

/* Auto-refresh Available Now badges every 60s; re-fetch calendar every 5 min */
let _refreshTick=0;
setInterval(async()=>{
_refreshTick++;
if(_refreshTick%5===0){
  try{
    const prevSha=calSha;
    const freshCal=await loadCalData();
    if(calSha&&calSha!==prevSha){
      calData=normalizeCalData(freshCal);
      updateCalCache();
      const ap=document.querySelector('.page.active');
      if(ap){const id=ap.id;if(id==='rosterPage')renderRoster();else if(id==='listPage')renderGrid();else if(id==='favoritesPage')renderFavoritesGrid();else if(id==='homePage')renderHome();else if(id==='profilePage'&&currentProfileIdx>=0)showProfile(currentProfileIdx)}
    }
  }catch(e){/* silent */}
}
try{
const activePage=document.querySelector('.page.active');
if(!activePage)return;
const id=activePage.id;
if(id==='rosterPage'){renderRoster()}
else if(id==='listPage'){renderGrid()}
else if(id==='favoritesPage'){renderFavoritesGrid()}
else if(id==='homePage'){renderHome()}
else if(id==='profilePage'&&currentProfileIdx>=0){showProfile(currentProfileIdx)}
}catch(e){/* silent */}
},60000);

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