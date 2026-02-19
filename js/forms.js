/* === FORMS, DELETE & INIT === */

const formOverlay=document.getElementById('formOverlay');
const formFields=['fName','fLocation','fAge','fBody','fHeight','fCup','fVal1','fVal2','fVal3','fSpecial','fExp','fStartDate','fLang','fOldUrl','fType','fDesc'];
let formLabels=[];
document.getElementById('formClose').onclick=()=>formOverlay.classList.remove('open');
document.getElementById('formCancel').onclick=()=>formOverlay.classList.remove('open');
formOverlay.onclick=e=>{if(e.target===formOverlay)formOverlay.classList.remove('open')};
let formPhotos=[],formPhotosToDelete=[],formNewPhotos=[],formNewFiles=[];
let formCountries=[];
const COUNTRY_OPTIONS=['Chinese','French','Italian','Japanese','Korean','Russian','Thailand','Vietnamese','Other'];

function renderFormCountries(){const wrap=document.getElementById('fCountryOptions');wrap.innerHTML='';
COUNTRY_OPTIONS.forEach(c=>{const btn=document.createElement('div');btn.className='country-opt'+(formCountries.includes(c)?' selected':'');btn.textContent=c;btn.onclick=()=>{if(formCountries.includes(c))formCountries=formCountries.filter(x=>x!==c);else formCountries.push(c);renderFormCountries()};wrap.appendChild(btn)})}

/* Old URL preview helper */
function updateOldUrlPreview(){const inp=document.getElementById('fOldUrl'),prev=document.getElementById('fOldUrlPreview');const url=inp.value.trim();if(url){const slug=url.split('/').filter(Boolean).pop()||url;prev.innerHTML=`<a href="${url}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;cursor:pointer">${slug}</a>`}else{prev.innerHTML=''}}
document.addEventListener('DOMContentLoaded',()=>{const inp=document.getElementById('fOldUrl');if(inp)inp.addEventListener('input',updateOldUrlPreview)});

function renderFormPhotos(){const g=document.getElementById('fPhotoGrid'),count=document.getElementById('fPhotoCount');g.innerHTML='';count.textContent=`(${formPhotos.length} / ${MAX_PHOTOS})`;
formPhotos.forEach((src,i)=>{const w=document.createElement('div');w.style.cssText='position:relative;display:inline-block';const t=document.createElement('div');t.style.cssText='width:64px;height:64px;border:2px solid rgba(255,255,255,0.1);overflow:hidden;clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))';t.innerHTML=`<img src="${src}" style="width:100%;height:100%;object-fit:cover">`;
const rm=document.createElement('button');rm.style.cssText='position:absolute;top:1px;right:1px;width:18px;height:18px;background:rgba(0,0,0,0.85);border:1px solid rgba(255,68,68,0.5);color:#ff4444;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:2px;z-index:2';rm.innerHTML='&#x2715;';rm.onclick=()=>{const removed=formPhotos[i];if(removed.startsWith('data:')){const ni=formNewPhotos.indexOf(removed);if(ni>=0){formNewPhotos.splice(ni,1);formNewFiles.splice(ni,1)}}formPhotosToDelete.push(removed);formPhotos.splice(i,1);renderFormPhotos()};w.appendChild(t);w.appendChild(rm);g.appendChild(w)});
if(formPhotos.length<MAX_PHOTOS){const addBtn=document.createElement('div');addBtn.style.cssText='width:64px;height:64px;border:2px dashed rgba(180,74,255,0.3);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--accent);font-size:22px;clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));transition:all .3s';addBtn.innerHTML='+';addBtn.onmouseenter=()=>{addBtn.style.borderColor='var(--accent)';addBtn.style.background='rgba(180,74,255,0.06)'};addBtn.onmouseleave=()=>{addBtn.style.borderColor='rgba(180,74,255,0.3)';addBtn.style.background='none'};
addBtn.onclick=()=>{const rem=MAX_PHOTOS-formPhotos.length;if(rem<=0)return;const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.multiple=true;inp.onchange=e=>{const files=Array.from(e.target.files).slice(0,rem);let loaded=0;files.forEach(f=>{const r=new FileReader();r.onload=ev=>{formPhotos.push(ev.target.result);formNewPhotos.push(ev.target.result);formNewFiles.push(f.name);loaded++;if(loaded===files.length)renderFormPhotos()};r.readAsDataURL(f)})};inp.click()};g.appendChild(addBtn)}}

function renderFormLabels(){const c=document.getElementById('fLabelTags');c.innerHTML='';
formLabels.forEach((lbl,i)=>{const tag=document.createElement('span');tag.className='label-tag';tag.innerHTML=`${lbl}<button class="label-remove" title="Remove">&times;</button>`;tag.querySelector('.label-remove').onclick=()=>{formLabels.splice(i,1);renderFormLabels()};c.appendChild(tag)})}

document.addEventListener('DOMContentLoaded',()=>{const inp=document.getElementById('fLabelInput');if(inp){inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const v=inp.value.trim();if(v&&!formLabels.includes(v)){formLabels.push(v);renderFormLabels()}inp.value=''}})}});

function openForm(idx=-1){document.getElementById('editIndex').value=idx;formPhotosToDelete=[];formNewPhotos=[];formNewFiles=[];
if(idx>=0){document.getElementById('formTitle').textContent='Edit Profile';const g=girls[idx];document.getElementById('fName').value=g.name;document.getElementById('fLocation').value=g.location;const gc=g.country||'';formCountries=Array.isArray(gc)?[...gc]:(gc?[gc]:[]);document.getElementById('fAge').value=g.age;document.getElementById('fBody').value=g.body;document.getElementById('fHeight').value=g.height;document.getElementById('fCup').value=g.cup;document.getElementById('fVal1').value=g.val1||'';document.getElementById('fVal2').value=g.val2||'';document.getElementById('fVal3').value=g.val3||'';document.getElementById('fSpecial').value=g.special||'';document.getElementById('fExp').value=g.exp||'';document.getElementById('fStartDate').value=g.startDate||fmtDate(getAEDTDate());document.getElementById('fLang').value=g.lang||'';document.getElementById('fOldUrl').value=g.oldUrl||'';document.getElementById('fType').value=g.type||'';document.getElementById('fDesc').value=g.desc;formPhotos=[...(g.photos||[])];formLabels=[...(g.labels||[])]}
else{document.getElementById('formTitle').textContent='Add New Girl';formFields.forEach(id=>document.getElementById(id).value='');document.getElementById('fStartDate').value=fmtDate(getAEDTDate());formPhotos=[];formLabels=[];formCountries=[]}updateOldUrlPreview();renderFormPhotos();renderFormLabels();renderFormCountries();formOverlay.classList.add('open')}

document.getElementById('formSave').onclick=async()=>{
const req=[{id:'fName',label:'Name'},{id:'fLocation',label:'Location'},{id:'fAge',label:'Age'},{id:'fBody',label:'Body Size'},{id:'fHeight',label:'Height'},{id:'fCup',label:'Cup Size'},{id:'fExp',label:'Experience'},{id:'fVal3',label:'Value 3'},{id:'fStartDate',label:'Start Date'},{id:'fLang',label:'Language'},{id:'fType',label:'Type'},{id:'fDesc',label:'Description'}];
for(const f of req){const el=document.getElementById(f.id);if(!el.value.trim()){el.focus();showToast(f.label+' is required','error');return}}
if(formCountries.length===0){showToast('Country is required','error');return}
if(formPhotos.length===0){showToast('At least one photo is required','error');return}
const name=document.getElementById('fName').value.trim();const saveBtn=document.getElementById('formSave');saveBtn.textContent='SAVING...';saveBtn.style.pointerEvents='none';
try{for(const url of formPhotosToDelete){if(url.includes('githubusercontent.com'))await deleteFromGithub(url)}
const finalPhotos=[];for(const src of formPhotos){if(src.startsWith('data:')){if(GT){const ni=formNewPhotos.indexOf(src);finalPhotos.push(await uploadToGithub(src,name,ni>=0?formNewFiles[ni]:genFn()))}else finalPhotos.push(src)}else finalPhotos.push(src)}
const o={name,location:document.getElementById('fLocation').value.trim(),country:[...formCountries],age:document.getElementById('fAge').value.trim(),body:document.getElementById('fBody').value.trim(),height:document.getElementById('fHeight').value.trim(),cup:document.getElementById('fCup').value.trim(),val1:document.getElementById('fVal1').value.trim(),val2:document.getElementById('fVal2').value.trim(),val3:document.getElementById('fVal3').value.trim(),special:document.getElementById('fSpecial').value.trim(),exp:document.getElementById('fExp').value.trim(),startDate:document.getElementById('fStartDate').value.trim(),lang:document.getElementById('fLang').value.trim(),oldUrl:document.getElementById('fOldUrl').value.trim(),type:document.getElementById('fType').value.trim(),desc:document.getElementById('fDesc').value.trim(),photos:finalPhotos,labels:[...formLabels]};
const idx=parseInt(document.getElementById('editIndex').value);if(idx>=0)girls[idx]=o;else girls.push(o);
if(await saveData()){formOverlay.classList.remove('open');renderFilters();renderGrid();renderRoster();renderHome();if(document.getElementById('profilePage').classList.contains('active')&&idx>=0)showProfile(idx);showToast(idx>=0?'Profile updated':'Profile added')}}catch(err){showToast('Error: '+err.message,'error')}finally{saveBtn.textContent='SAVE';saveBtn.style.pointerEvents='auto'}};

/* Delete */
const deleteOverlay=document.getElementById('deleteOverlay');
document.getElementById('deleteCancel').onclick=()=>deleteOverlay.classList.remove('open');
deleteOverlay.onclick=e=>{if(e.target===deleteOverlay)deleteOverlay.classList.remove('open')};
function openDelete(idx){deleteTarget=idx;document.getElementById('deleteMsg').textContent=`Remove "${girls[idx].name}" from the roster?`;deleteOverlay.classList.add('open')}
document.getElementById('deleteConfirm').onclick=async()=>{if(deleteTarget>=0){const g=girls[deleteTarget];if(g.photos&&GT)for(const url of g.photos){if(url.includes('githubusercontent.com'))await deleteFromGithub(url)}girls.splice(deleteTarget,1);await saveData();deleteTarget=-1;deleteOverlay.classList.remove('open');renderFilters();renderGrid();renderRoster();renderHome();if(document.getElementById('profilePage').classList.contains('active'))showPage('homePage');showToast('Profile deleted')}};

/* Init */
function removeSkeletons(){const ids=['homeSkeleton','rosterSkeleton','girlsSkeleton','calSkeleton','rosterFilterSkeleton','girlsFilterSkeleton'];ids.forEach(id=>{const el=document.getElementById(id);if(el){el.classList.add('fade-out');setTimeout(()=>el.remove(),400)}})}

function normalizeCalData(cal){if(!cal)return{};for(const n in cal)for(const dt in cal[n])if(cal[n][dt]===true)cal[n][dt]={start:'',end:''};return cal}

function fullRender(){rosterDateFilter=fmtDate(getAEDTDate());renderFilters();renderGrid();renderRoster();renderHome();updateFavBadge()}

/* Auto-refresh Available Now badges every 60s */
setInterval(()=>{
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
history.replaceState({path:'/'},'Ginza','/');
}
}

(async()=>{
try{
await loadConfig();

/* Phase 1: Instant render from cache */
const cachedGirls=getCachedGirls();
const cachedCal=getCachedCal();
let renderedFromCache=false;

if(cachedGirls&&cachedGirls.length){
girls=cachedGirls;
calData=normalizeCalData(cachedCal||{});
fullRenderAndRoute();
removeSkeletons();
renderedFromCache=true;
}

/* Phase 2: Fetch fresh data in background */
const[authData,freshData,freshCal]=await Promise.all([loadAuth(),loadData(),loadCalData()]);

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
}else if(!renderedFromCache){showToast('Could not load data','error')}

/* Compare and update calendar if changed */
let calChanged=false;
if(freshCal){
const cachedCalSha=getCachedCalSha();
const normalizedCal=normalizeCalData(freshCal);
if(!renderedFromCache||cachedCalSha!==calSha){
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

}catch(e){console.error('Init error:',e);showToast('Init error: '+e.message,'error');removeSkeletons()}
})();