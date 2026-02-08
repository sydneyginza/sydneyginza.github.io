/* === CORE UTILITIES & API === */
let CRED=[];
const BT='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'; 
const BR='sydneyginza/files',BA=`https://api.github.com/repos/${BR}/contents`,CP='data/config.json';
let GT='',GR='',GRD='',GA='',GAD='';
const DP='data/girls.json',AP='data/auth.json',KP='data/calendar.json';
let loggedIn=false,dataSha=null,calSha=null,calData={},loggedInUser=null,MAX_PHOTOS=10,profileReturnPage='homePage';

function showToast(m,t='success'){const e=document.getElementById('toast');e.textContent=m;e.className='toast '+t+' show';clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),3000)}
function getAEDTDate(){return new Date(new Date().toLocaleString('en-US',{timeZone:'Australia/Sydney'}))}
function fmtDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function getWeekDates(){const t=getAEDTDate(),a=[];for(let i=0;i<7;i++){const d=new Date(t);d.setDate(t.getDate()+i);a.push(fmtDate(d))}return a}
function dispDate(ds){const d=new Date(ds+'T00:00:00');return{date:d.getDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()],day:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]}}
function dec(c){return JSON.parse(decodeURIComponent(escape(atob(c.replace(/\n/g,'')))))}
function enc(o){return btoa(unescape(encodeURIComponent(JSON.stringify(o,null,2))))}
function ghH(t){return{'Authorization':`token ${t}`,'Accept':'application/vnd.github.v3+json'}}
function fmtTime12(t){if(!t)return'';const[h,m]=t.split(':').map(Number);const ap=h<12?'AM':'PM';const hr=h===0?12:h>12?h-12:h;return hr+':'+String(m).padStart(2,'0')+' '+ap}
function getCalEntry(name,date){if(calData[name]&&calData[name][date]){const v=calData[name][date];return typeof v==='object'?v:{start:'',end:''};}return null}

async function loadConfig(){
try{const r=await fetch(`${BA}/${CP}`,{headers:ghH(BT)});
if(r.ok){const cfg=dec((await r.json()).content);GT=cfg.token||BT;GR=cfg.site_repo||'sydneyginza/sydneyginza.github.io';GRD=cfg.data_repo||BR;GA=`https://api.github.com/repos/${GR}/contents`;GAD=`https://api.github.com/repos/${GRD}/contents`;return true}
if(r.status===404){const def={token:BT,site_repo:'sydneyginza/sydneyginza.github.io',data_repo:BR};await fetch(`${BA}/${CP}`,{method:'PUT',headers:{'Authorization':`token ${BT}`,'Content-Type':'application/json'},body:JSON.stringify({message:'Create config',content:enc(def)})});GT=def.token;GR=def.site_repo;GRD=def.data_repo;GA=`https://api.github.com/repos/${GR}/contents`;GAD=`https://api.github.com/repos/${GRD}/contents`;return true}
}catch(e){console.error(e)}GT=BT;GR='sydneyginza/sydneyginza.github.io';GRD=BR;GA=`https://api.github.com/repos/${GR}/contents`;GAD=`https://api.github.com/repos/${GRD}/contents`;return false}

async function loadAuth(){try{const r=await fetch(`${GAD}/${AP}`,{headers:ghH(GT)});if(r.ok)return dec((await r.json()).content);if(r.status===404){const d=[{user:'admin',pass:'admin123'}];await fetch(`${GAD}/${AP}`,{method:'PUT',headers:{'Authorization':`token ${GT}`,'Content-Type':'application/json'},body:JSON.stringify({message:'Create auth',content:enc(d)})});return d}}catch(e){}return[]}
async function loadData(){try{const r=await fetch(`${GAD}/${DP}`,{headers:ghH(GT)});if(r.ok){const d=await r.json();dataSha=d.sha;return dec(d.content)}if(r.status===404){dataSha=null;return[]}}catch(e){}return null}
async function saveData(){try{const body={message:'Update girls',content:enc(girls)};if(dataSha)body.sha=dataSha;const r=await fetch(`${GAD}/${DP}`,{method:'PUT',headers:{'Authorization':`token ${GT}`,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error((await r.json()).message||r.status);const rd=await r.json();dataSha=rd.content.sha;return true}catch(e){showToast('Save failed: '+e.message,'error');return false}}
async function loadCalData(){try{const r=await fetch(`${GAD}/${KP}`,{headers:ghH(GT)});if(r.ok){const d=await r.json();calSha=d.sha;return dec(d.content)}if(r.status===404){calSha=null;return{}}}catch(e){}return{}}
async function saveCalData(){try{const vd=getWeekDates(),cl={};for(const n in calData){cl[n]={};for(const dt of vd){if(calData[n]&&calData[n][dt])cl[n][dt]=calData[n][dt]}}calData=cl;const body={message:'Update calendar',content:enc(calData)};if(calSha)body.sha=calSha;const r=await fetch(`${GAD}/${KP}`,{method:'PUT',headers:{'Authorization':`token ${GT}`,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error(r.status);calSha=(await r.json()).content.sha;return true}catch(e){showToast('Calendar save failed','error');return false}}

async function uploadToGithub(b64,name,fn){const safe=name.replace(/[^a-zA-Z0-9_-]/g,'_'),path=`Images/${safe}/${fn}`,pure=b64.split(',')[1];let sha;try{const c=await fetch(`${GA}/${path}`,{headers:{'Authorization':`token ${GT}`}});if(c.ok)sha=(await c.json()).sha}catch(e){}const body={message:`Upload ${path}`,content:pure};if(sha)body.sha=sha;const r=await fetch(`${GA}/${path}`,{method:'PUT',headers:{'Authorization':`token ${GT}`,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error(r.status);return`https://raw.githubusercontent.com/${GR}/main/${path}`}
async function deleteFromGithub(url){try{const m=url.match(/raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/[^/]+\/(.+?)(\?|$)/);if(!m)return;const api=`https://api.github.com/repos/${m[1]}/contents/${decodeURIComponent(m[2])}`;const c=await fetch(api,{headers:{'Authorization':`token ${GT}`}});if(!c.ok)return;await fetch(api,{method:'DELETE',headers:{'Authorization':`token ${GT}`,'Content-Type':'application/json'},body:JSON.stringify({message:'Delete',sha:(await c.json()).sha})})}catch(e){}}
function genFn(){return'img_'+Date.now()+'_'+Math.random().toString(36).substr(2,6)+'.jpg'}
