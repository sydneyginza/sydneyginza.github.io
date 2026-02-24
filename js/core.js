/* === CORE UTILITIES & API (Proxy Version) === */

// ✅ No token in frontend! All requests go through your Cloudflare Worker.
// Replace this with your actual worker URL after deploying.
const PROXY = 'https://github-proxy.sydneyginza-api-2.workers.dev';

// Repo paths (no tokens needed)
const DATA_REPO = 'sydneyginza/files';
const SITE_REPO = 'sydneyginza/sydneyginza.github.io';
const DATA_API = `${PROXY}/repos/${DATA_REPO}/contents`;
const SITE_API = `${PROXY}/repos/${SITE_REPO}/contents`;

const DP = 'data/girls.json', AP = 'data/auth.json', KP = 'data/calendar.json', CP = 'data/config.json', RHP = 'data/roster_history.json', ALP = 'data/admin_log.json';
let loggedIn = false, dataSha = null, calSha = null, calData = {}, loggedInUser = null, loggedInRole = null, loggedInEmail = null, loggedInMobile = null, authSha = null, MAX_PHOTOS = 10, profileReturnPage = 'homePage';
function isAdmin(){ return loggedIn && (loggedInRole === 'admin' || loggedInRole === 'owner') }
let rosterHistory = {}, rosterHistorySha = null;
let girls = [];
let GT = true;

// ✅ No auth headers needed — the proxy injects the token server-side
function proxyHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // helps the proxy verify it's a real request
  };
}

/* === Utility functions (unchanged) === */
function showToast(m, t = 'success') { const e = document.getElementById('toast'); e.textContent = m; e.className = 'toast ' + t + ' show'; clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('show'), 3000) }
function getAEDTDate() { return new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' })) }
function fmtDate(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') }
function getWeekDates() { const t = getAEDTDate(), a = []; for (let i = 0; i < 7; i++) { const d = new Date(t); d.setDate(t.getDate() + i); a.push(fmtDate(d)) } return a }
function dispDate(ds) { const d = new Date(ds + 'T00:00:00'); const tFn=typeof t==='function'?t:k=>['date.sun','date.mon','date.tue','date.wed','date.thu','date.fri','date.sat','date.jan','date.feb','date.mar','date.apr','date.may','date.jun','date.jul','date.aug','date.sep','date.oct','date.nov','date.dec'].indexOf(k)<0?k:['Sun','Mon','Tue','Wed','Thu','Fri','Sat','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][['date.sun','date.mon','date.tue','date.wed','date.thu','date.fri','date.sat','date.jan','date.feb','date.mar','date.apr','date.may','date.jun','date.jul','date.aug','date.sep','date.oct','date.nov','date.dec'].indexOf(k)]; const days=['date.sun','date.mon','date.tue','date.wed','date.thu','date.fri','date.sat']; const months=['date.jan','date.feb','date.mar','date.apr','date.may','date.jun','date.jul','date.aug','date.sep','date.oct','date.nov','date.dec']; return { date: d.getDate() + ' ' + tFn(months[d.getMonth()]), day: tFn(days[d.getDay()]) } }
function dec(c) { return JSON.parse(decodeURIComponent(escape(atob(c.replace(/\n/g, ''))))) }
function enc(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o, null, 2)))) }
function fmtTime12(t) { if (!t) return ''; const [h, m] = t.split(':').map(Number); const ap = h < 12 ? 'AM' : 'PM'; const hr = h === 0 ? 12 : h > 12 ? h - 12 : h; return hr + ':' + String(m).padStart(2, '0') + ' ' + ap }
function getCalEntry(name, date) { if (calData[name] && calData[name][date]) { const v = calData[name][date]; return typeof v === 'object' ? v : { start: '', end: '' }; } return null }

/* Check if a girl is available RIGHT NOW based on current AEDT time vs today's scheduled hours */
function isAvailableNow(name) {
  const now = getAEDTDate();
  const today = fmtDate(now);
  const entry = getCalEntry(name, today);
  if (!entry || !entry.start || !entry.end) return false;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = entry.start.split(':').map(Number);
  const [eh, em] = entry.end.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  /* Handle overnight shifts (e.g. 22:00 - 02:00) */
  if (endMins <= startMins) {
    return nowMins >= startMins || nowMins < endMins;
  }
  return nowMins >= startMins && nowMins < endMins;
}

/* Time until a girl's shift starts or ends (for countdown display) */
function getAvailCountdown(name) {
  const now=getAEDTDate();
  const entry=getCalEntry(name,fmtDate(now));
  if(!entry||!entry.start||!entry.end)return null;
  const nowMins=now.getHours()*60+now.getMinutes();
  const [sh,sm]=entry.start.split(':').map(Number);
  const [eh,em]=entry.end.split(':').map(Number);
  const startMins=sh*60+sm,endMins=eh*60+em;
  const fmt=m=>{const h=Math.floor(m/60),mm=m%60;return h>0?`${h}h ${mm}m`:`${mm}m`};
  if(isAvailableNow(name)){let rem=endMins-nowMins;if(rem<=0)rem+=1440;return{type:'ends',str:fmt(rem)}}
  const rem=startMins-nowMins;
  if(rem>0&&rem<=720)return{type:'starts',str:fmt(rem)};
  return null;
}

/* Count how many girls are available right now */
function getAvailableNowCount() {
  return girls.filter(g => g.name && isAvailableNow(g.name)).length;
}

/* Check if a girl has a shift scheduled today (regardless of current time) */
function isAvailableToday(name) {
  const entry = getCalEntry(name, fmtDate(getAEDTDate()));
  return !!(entry && entry.start && entry.end);
}

/* Count how many girls are scheduled today */
function getAvailableTodayCount() {
  return girls.filter(g => g.name && isAvailableToday(g.name)).length;
}

function genFn() { return 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '.jpg' }

/* === Local Cache (stale-while-revalidate) === */
const CACHE_KEY_GIRLS = 'ginza_cache_girls';
const CACHE_KEY_CAL = 'ginza_cache_cal';
const CACHE_KEY_GIRLS_SHA = 'ginza_cache_girls_sha';
const CACHE_KEY_CAL_SHA = 'ginza_cache_cal_sha';
const CACHE_KEY_CAL_TS = 'ginza_cache_cal_ts';
const CAL_CACHE_TTL = 10 * 60 * 1000; // 10 min — availability can change hourly

function cacheGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch (e) { return null; }
}

function cacheSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); }
  catch (e) { /* quota exceeded or unavailable — silently ignore */ }
}

function cacheClear() {
  try { [CACHE_KEY_GIRLS, CACHE_KEY_CAL, CACHE_KEY_GIRLS_SHA, CACHE_KEY_CAL_SHA, CACHE_KEY_CAL_TS].forEach(k => localStorage.removeItem(k)); }
  catch (e) {}
}

function getCachedGirls() { return cacheGet(CACHE_KEY_GIRLS); }
function getCachedCal() { return cacheGet(CACHE_KEY_CAL); }
function getCachedGirlsSha() { try { return localStorage.getItem(CACHE_KEY_GIRLS_SHA) || null; } catch(e) { return null; } }
function getCachedCalSha() { try { return localStorage.getItem(CACHE_KEY_CAL_SHA) || null; } catch(e) { return null; } }

function updateGirlsCache() {
  cacheSet(CACHE_KEY_GIRLS, girls);
  if (dataSha) try { localStorage.setItem(CACHE_KEY_GIRLS_SHA, dataSha); } catch(e) {}
}

function updateCalCache() {
  cacheSet(CACHE_KEY_CAL, calData);
  if (calSha) try { localStorage.setItem(CACHE_KEY_CAL_SHA, calSha); } catch(e) {}
  try { localStorage.setItem(CACHE_KEY_CAL_TS, Date.now().toString()); } catch(e) {}
}

function isCalCacheStale() {
  try { const ts = localStorage.getItem(CACHE_KEY_CAL_TS); return !ts || (Date.now() - parseInt(ts)) > CAL_CACHE_TTL; }
  catch(e) { return true; }
}

/* === Favorites (per-user in auth.json) === */

function getFavorites() {
  if (!loggedIn || !loggedInUser) return [];
  const entry = CRED.find(c => c.user === loggedInUser);
  return entry && Array.isArray(entry.favorites) ? entry.favorites : [];
}

function saveFavorites(favs) {
  if (!loggedIn || !loggedInUser) return;
  const entry = CRED.find(c => c.user === loggedInUser);
  if (entry) { entry.favorites = favs; saveAuth(); }
}

function isFavorite(name) {
  return getFavorites().includes(name);
}

function toggleFavorite(name) {
  const favs = getFavorites();
  const idx = favs.indexOf(name);
  if (idx >= 0) favs.splice(idx, 1); else favs.push(name);
  saveFavorites(favs);
  return idx < 0;
}

function getFavCount() {
  const favs = getFavorites();
  return girls.filter(g => g.name && favs.includes(g.name)).length;
}

/* === Recently Viewed === */
const RV_KEY = 'ginza_recently_viewed';
const RV_MAX = 20;

function getRecentlyViewed() {
  try { const v = localStorage.getItem(RV_KEY); return v ? JSON.parse(v) : []; }
  catch (e) { return []; }
}

function addRecentlyViewed(name) {
  if (!name) return;
  let rv = getRecentlyViewed();
  rv = rv.filter(r => r.name !== name);
  rv.unshift({ name: name, ts: Date.now() });
  if (rv.length > RV_MAX) rv = rv.slice(0, RV_MAX);
  try { localStorage.setItem(RV_KEY, JSON.stringify(rv)); } catch (e) {}
}

function clearRecentlyViewed() {
  try { localStorage.removeItem(RV_KEY); } catch (e) {}
}

/* === API Functions (with retry) === */

async function fetchWithRetry(url, opts = {}, { retries = 3, baseDelay = 600 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await fetch(url, opts);
      // Don't retry client errors (4xx) except 429 (rate limit)
      if (r.ok || (r.status >= 400 && r.status < 500 && r.status !== 429)) return r;
      // Retryable server error or rate limit
      lastErr = new Error(`HTTP ${r.status}`);
      if (attempt < retries) {
        const retryAfter = r.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, attempt);
        await new Promise(res => setTimeout(res, delay));
      }
    } catch (e) {
      // Network error — retryable
      lastErr = e;
      if (attempt < retries) {
        await new Promise(res => setTimeout(res, baseDelay * Math.pow(2, attempt)));
      }
    }
  }
  throw lastErr;
}

async function loadAuth() {
  try {
    const r = await fetchWithRetry(`${DATA_API}/${AP}`, { headers: proxyHeaders() });
    if (r.ok) { const d = await r.json(); authSha = d.sha; return dec(d.content); }
    if (r.status === 404) {
      const d = [{ user: 'admin', pass: 'admin123' }];
      await fetchWithRetry(`${DATA_API}/${AP}`, {
        method: 'PUT',
        headers: proxyHeaders(),
        body: JSON.stringify({ message: 'Create auth', content: enc(d) })
      });
      return d;
    }
  } catch (e) { console.error('loadAuth error:', e); }
  return [];
}

async function saveAuth(retryOnConflict = true) {
  try {
    const body = { message: 'Update auth', content: enc(CRED) };
    if (authSha) body.sha = authSha;
    const r = await fetchWithRetry(`${DATA_API}/${AP}`, {
      method: 'PUT',
      headers: proxyHeaders(),
      body: JSON.stringify(body)
    }, { retries: 2 });
    const rd = await r.json();
    if (!r.ok) {
      if (r.status === 409 && retryOnConflict) {
        const fresh = await fetchWithRetry(`${DATA_API}/${AP}`, { headers: proxyHeaders() });
        if (fresh.ok) { authSha = (await fresh.json()).sha; return saveAuth(false); }
      }
      throw new Error(rd.message || r.status);
    }
    authSha = rd.content.sha;
    return true;
  } catch (e) { showToast('Save failed: ' + e.message, 'error'); return false; }
}

async function loadData() {
  try {
    const r = await fetchWithRetry(`${DATA_API}/${DP}`, { headers: proxyHeaders() });
    if (r.ok) { const d = await r.json(); dataSha = d.sha; return dec(d.content); }
    if (r.status === 404) { dataSha = null; return []; }
  } catch (e) { console.error('loadData error:', e); }
  return null;
}

async function saveData(retryOnConflict = true) {
  try {
    const body = { message: 'Update girls', content: enc(girls) };
    if (dataSha) body.sha = dataSha;
    const r = await fetchWithRetry(`${DATA_API}/${DP}`, {
      method: 'PUT',
      headers: proxyHeaders(),
      body: JSON.stringify(body)
    }, { retries: 2 });
    const rd = await r.json();
    if (!r.ok) {
      // SHA conflict — refetch and retry once
      if (r.status === 409 && retryOnConflict) {
        console.warn('Save conflict — refetching SHA and retrying');
        const fresh = await fetchWithRetry(`${DATA_API}/${DP}`, { headers: proxyHeaders() });
        if (fresh.ok) { dataSha = (await fresh.json()).sha; return saveData(false); }
      }
      throw new Error(rd.message || r.status);
    }
    dataSha = rd.content.sha;
    updateGirlsCache();
    return true;
  } catch (e) { showToast('Save failed: ' + e.message, 'error'); return false; }
}

async function loadCalData() {
  try {
    const r = await fetchWithRetry(`${DATA_API}/${KP}`, { headers: proxyHeaders() });
    if (r.ok) { const d = await r.json(); calSha = d.sha; return dec(d.content); }
    if (r.status === 404) { calSha = null; return {}; }
  } catch (e) { console.error('loadCalData error:', e); }
  return {};
}

async function saveCalData(retryOnConflict = true) {
  try {
    const vd = getWeekDates(), cl = {};
    for (const n in calData) { cl[n] = {}; for (const dt of vd) { if (calData[n] && calData[n][dt]) cl[n][dt] = calData[n][dt] } }
    calData = cl;
    const body = { message: 'Update calendar', content: enc(calData) };
    if (calSha) body.sha = calSha;
    const r = await fetchWithRetry(`${DATA_API}/${KP}`, {
      method: 'PUT',
      headers: proxyHeaders(),
      body: JSON.stringify(body)
    }, { retries: 2 });
    if (!r.ok) {
      if (r.status === 409 && retryOnConflict) {
        console.warn('Calendar save conflict — refetching SHA and retrying');
        const fresh = await fetchWithRetry(`${DATA_API}/${KP}`, { headers: proxyHeaders() });
        if (fresh.ok) { calSha = (await fresh.json()).sha; return saveCalData(false); }
      }
      throw new Error(r.status);
    }
    calSha = (await r.json()).content.sha;
    updateCalCache();
    /* Update roster history for past/today entries */
    const todayStr=fmtDate(getAEDTDate());let histChanged=false;
    for(const n in calData){for(const dt of Object.keys(calData[n]||{})){const ce=calData[n][dt];if(dt<=todayStr&&ce&&ce.start&&ce.end){if(!rosterHistory[n]||dt>rosterHistory[n]){rosterHistory[n]=dt;histChanged=true}}}}
    if(histChanged)saveRosterHistory();
    return true;
  } catch (e) { showToast('Calendar save failed', 'error'); return false; }
}

/* === Roster History === */
async function loadRosterHistory(){
  try{
    const r=await fetchWithRetry(`${DATA_API}/${RHP}`,{headers:proxyHeaders()});
    if(r.ok){const d=await r.json();rosterHistorySha=d.sha;rosterHistory=dec(d.content)||{};return}
    if(r.status===404){rosterHistorySha=null;rosterHistory={}}
  }catch(_){}
}
async function saveRosterHistory(){
  try{
    const body={message:'Update roster history',content:enc(rosterHistory)};
    if(rosterHistorySha)body.sha=rosterHistorySha;
    const r=await fetchWithRetry(`${DATA_API}/${RHP}`,{method:'PUT',headers:proxyHeaders(),body:JSON.stringify(body)});
    if(r.ok)rosterHistorySha=(await r.json()).content.sha;
  }catch(_){}
}
function getLastRostered(name){return rosterHistory[name]||null}

async function uploadToGithub(b64, name, fn) {
  const safe = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `Images/${safe}/${fn}`;
  const pure = b64.split(',')[1];
  let sha;
  try {
    const c = await fetchWithRetry(`${SITE_API}/${path}`, { headers: proxyHeaders() });
    if (c.ok) sha = (await c.json()).sha;
  } catch (e) {}
  const body = { message: `Upload ${path}`, content: pure };
  if (sha) body.sha = sha;
  const r = await fetchWithRetry(`${SITE_API}/${path}`, {
    method: 'PUT',
    headers: proxyHeaders(),
    body: JSON.stringify(body)
  }, { retries: 2 });
  if (!r.ok) throw new Error(r.status);
  return `https://raw.githubusercontent.com/${SITE_REPO}/main/${path}`;
}

async function deleteFromGithub(url) {
  try {
    const m = url.match(/raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/[^/]+\/(.+?)(\?|$)/);
    if (!m) return;
    const repo = m[1];
    const filePath = decodeURIComponent(m[2]);
    const api = `${PROXY}/repos/${repo}/contents/${filePath}`;
    const c = await fetchWithRetry(api, { headers: proxyHeaders() });
    if (!c.ok) return;
    await fetchWithRetry(api, {
      method: 'DELETE',
      headers: proxyHeaders(),
      body: JSON.stringify({ message: 'Delete', sha: (await c.json()).sha })
    }, { retries: 2 });
  } catch (e) { console.error('deleteFromGithub error:', e); }
}

/* === Debounced Calendar Save === */
let _calSaveTimer = null;
let _calSaving = false;
let _calSaveQueued = false;
let _calSavingCells = new Set();

function _markCellSaving(td) {
  if (td) { td.classList.add('cal-saving'); _calSavingCells.add(td); }
}

function _clearSavingCells() {
  _calSavingCells.forEach(td => td.classList.remove('cal-saving'));
  _calSavingCells.clear();
}

async function _execCalSave() {
  if (_calSaving) { _calSaveQueued = true; return; }
  _calSaving = true;
  try {
    await saveCalData();
    renderRoster(); renderGrid(); renderHome();
  } finally {
    _calSaving = false;
    _clearSavingCells();
    if (_calSaveQueued) {
      _calSaveQueued = false;
      _execCalSave();
    }
  }
}

function queueCalSave(td, delay) {
  _markCellSaving(td);
  clearTimeout(_calSaveTimer);
  _calSaveTimer = setTimeout(() => _execCalSave(), delay != null ? delay : 800);
}

function flushCalSave() {
  clearTimeout(_calSaveTimer);
  if (_calSavingCells.size > 0 || _calSaveQueued) { _execCalSave(); }
}

// ✅ loadConfig is no longer needed since the proxy handles the token.
// If you still need config for other settings, simplify it:
async function loadConfig() {
  // No token management needed — just set repo paths
  return true;
}

/* === Error Boundaries === */
function safeRender(name, fn) {
  try { fn(); }
  catch (e) { console.error(`[${name}] render error:`, e); showToast(`${name} render failed`, 'error'); }
}

function safeCardRender(g, idx, fn) {
  try { return fn(g, idx); }
  catch (e) { console.warn(`[Card] skipped index ${idx} (${g&&g.name||'unnamed'}):`, e); return null; }
}

/* === Error State UI === */
function showErrorState(containerId, message, retryFn) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="error-state">
    <div class="error-state-icon">!</div>
    <div class="error-state-msg">${message}</div>
    <button class="error-state-retry">${typeof t === 'function' ? t('ui.retry') : 'Retry'}</button>
  </div>`;
  const btn = el.querySelector('.error-state-retry');
  if (btn && retryFn) {
    btn.onclick = async () => {
      btn.disabled = true;
      btn.textContent = typeof t === 'function' ? t('ui.retrying') : 'Retrying...';
      try { await retryFn(); }
      catch (e) { btn.disabled = false; btn.textContent = typeof t === 'function' ? t('ui.retry') : 'Retry'; }
    };
  }
}

/* === Offline Detection === */
let _isOffline = !navigator.onLine;

function initOfflineDetection() {
  const banner = document.getElementById('offlineBanner');
  if (!banner) return;
  function update() {
    _isOffline = !navigator.onLine;
    banner.classList.toggle('visible', _isOffline);
    if (!_isOffline) showToast(typeof t === 'function' ? t('ui.backOnline') : 'Back online', 'success');
  }
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  if (_isOffline) banner.classList.add('visible');
}

/* === Push Notifications === */

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function getPushSubscription() {
  if (!('PushManager' in window)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

async function subscribeToPush() {
  if (!('PushManager' in window) || !('Notification' in window)) return null;
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return null;
  const reg = await navigator.serviceWorker.ready;
  /* Fetch VAPID public key from worker */
  try {
    const r = await fetch(PROXY + '/vapid-public-key');
    if (!r.ok) return null;
    const { key } = await r.json();
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key)
    });
    /* Store subscription on server */
    await fetch(PROXY + '/push-subscribe', {
      method: 'POST',
      headers: proxyHeaders(),
      body: JSON.stringify({ username: loggedInUser, subscription: sub.toJSON() })
    });
    return sub;
  } catch (e) { console.error('Push subscribe error:', e); return null; }
}

async function unsubscribeFromPush() {
  const sub = await getPushSubscription();
  if (sub) {
    await sub.unsubscribe();
    try {
      await fetch(PROXY + '/push-unsubscribe', {
        method: 'POST',
        headers: proxyHeaders(),
        body: JSON.stringify({ username: loggedInUser })
      });
    } catch (e) {}
  }
}

/* === Lazy Loading === */
const lazyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      const src = img.dataset.src;
      if (src) {
        img.src = src;
        img.onload = () => img.classList.add('lazy-loaded');
        img.onerror = () => { img.classList.add('lazy-loaded'); };
        delete img.dataset.src;
      }
      lazyObserver.unobserve(img);
    }
  });
}, { rootMargin: '200px 0px', threshold: 0.01 });

function observeLazy(container) {
  if (!container) return;
  container.querySelectorAll('img[data-src]').forEach(img => lazyObserver.observe(img));
}

function lazyThumb(src, cls, alt) {
  return `<img class="${cls || 'card-thumb'}" data-src="${src}" alt="${(alt||'').replace(/"/g,'&quot;')}">`;
}

function lazyCalAvatar(src, alt) {
  return `<img data-src="${src}" alt="${(alt||'').replace(/"/g,'&quot;')}">`;
}

/* === Card Entrance Animations === */
const entranceObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const card = entry.target;
      const delay = parseInt(card.style.getPropertyValue('--card-index') || 0) * 60;
      card.classList.add('card-enter');
      setTimeout(() => { card.classList.remove('card-enter'); card.classList.add('card-entered'); }, delay + 500);
      entranceObserver.unobserve(card);
    }
  });
}, { rootMargin: '50px 0px', threshold: 0.05 });

function observeEntrance(container) {
  if (!container) return;
  container.querySelectorAll('.girl-card').forEach((card, i) => {
    card.style.setProperty('--card-index', Math.min(i, 8));
    entranceObserver.observe(card);
  });
}

const calEntranceObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const row = entry.target;
      const delay = parseInt(row.style.getPropertyValue('--row-index') || 0) * 50;
      row.classList.add('cal-row-enter');
      setTimeout(() => { row.classList.remove('cal-row-enter'); row.classList.add('cal-row-entered'); }, delay + 400);
      calEntranceObserver.unobserve(row);
    }
  });
}, { rootMargin: '30px 0px', threshold: 0.05 });

function observeCalEntrance(table) {
  if (!table) return;
  table.querySelectorAll('tbody tr').forEach((row, i) => {
    row.style.setProperty('--row-index', Math.min(i, 10));
    calEntranceObserver.observe(row);
  });
}

/* === URL Router (pushState / popstate) === */
const Router = (function() {
  const PAGE_ROUTES = {
    homePage:       '/',
    rosterPage:     '/roster',
    listPage:       '/girls',
    favoritesPage:  '/favorites',
    valuePage:      '/rates',
    employmentPage: '/employment',
    calendarPage:   '/calendar',
    analyticsPage:  '/analytics',
    profileDbPage:  '/profile-database'
  };
  const PATH_TO_PAGE = {};
  for (const id in PAGE_ROUTES) PATH_TO_PAGE[PAGE_ROUTES[id]] = id;

  function nameToSlug(name) {
    return encodeURIComponent((name || '').trim().replace(/\s+/g, '-'));
  }
  function slugToName(slug) {
    return decodeURIComponent(slug || '').replace(/-/g, ' ');
  }
  function findGirlByName(name) {
    const lower = name.toLowerCase();
    return girls.findIndex(g => g.name && g.name.trim().toLowerCase() === lower);
  }
  function pathForPage(pageId) {
    return PAGE_ROUTES[pageId] || '/';
  }
  function pathForProfile(idx) {
    const g = girls[idx];
    if (!g || !g.name) return '/girls';
    return '/girls/' + nameToSlug(g.name);
  }

  let _suppressPush = false;

  function push(path, title) {
    if (_suppressPush) return;
    const t = title || 'Ginza Empire';
    document.title = t;
    if (window.location.pathname !== path) {
      history.pushState({ path: path }, t, path);
    }
  }

  function replace(path, title) {
    if (_suppressPush) return;
    const t = title || 'Ginza Empire';
    document.title = t;
    history.replaceState({ path: path }, t, path);
  }

  /* Parse current URL and navigate to the right view */
  function resolve() {
    if(typeof queryToFilters==='function')queryToFilters();
    const path = window.location.pathname;

    /* Profile deep link: /girls/Some-Name */
    const profileMatch = path.match(/^\/girls\/(.+)$/);
    if (profileMatch) {
      const name = slugToName(profileMatch[1]);
      const idx = findGirlByName(name);
      if (idx >= 0) {
        _suppressPush = true;
        profileReturnPage = 'listPage';
        showProfile(idx);
        _suppressPush = false;
        return true;
      }
      /* Name not found — fall back to girls list */
      _suppressPush = true;
      showPage('listPage');
      _suppressPush = false;
      replace('/girls', 'Ginza – Girls');
      return true;
    }

    /* Standard pages */
    const pageId = PATH_TO_PAGE[path];
    if (pageId) {
      if (pageId === 'favoritesPage' && !loggedIn) {
        _suppressPush = true;
        showPage('homePage');
        _suppressPush = false;
        replace('/', 'Ginza Empire');
        return true;
      }
      if (pageId === 'calendarPage' && !isAdmin()) {
        _suppressPush = true;
        showPage('homePage');
        _suppressPush = false;
        replace('/', 'Ginza Empire');
        return true;
      }
      if (pageId === 'analyticsPage' && !isAdmin()) {
        _suppressPush = true;
        showPage('homePage');
        _suppressPush = false;
        replace('/', 'Ginza Empire');
        return true;
      }
      if (pageId === 'profileDbPage' && !isAdmin()) {
        _suppressPush = true;
        showPage('homePage');
        _suppressPush = false;
        replace('/', 'Ginza Empire');
        return true;
      }
      _suppressPush = true;
      showPage(pageId);
      _suppressPush = false;
      return true;
    }

    /* Unknown path — home */
    if (path !== '/') {
      _suppressPush = true;
      showPage('homePage');
      _suppressPush = false;
      replace('/', 'Ginza Empire');
    }
    return true;
  }

  window.addEventListener('popstate', function() { resolve(); });

  return { PAGE_ROUTES, push, replace, resolve, pathForPage, pathForProfile, nameToSlug, slugToName, findGirlByName };
})();

/* === Activity Log === */
async function logAdminAction(action,target,meta={}){
  if(!loggedInUser)return;
  let existing=[],sha=null;
  try{const r=await fetch(`${DATA_API}/${ALP}`,{headers:proxyHeaders()});if(r.ok){const d=await r.json();sha=d.sha;existing=dec(d.content)}}catch(_){}
  if(existing.length>=500)existing=existing.slice(existing.length-499);
  existing.push({ts:new Date().toISOString(),admin:loggedInUser,action,target,...meta});
  const body={message:`Log ${action}`,content:enc(existing)};
  if(sha)body.sha=sha;
  try{await fetch(`${DATA_API}/${ALP}`,{method:'PUT',headers:proxyHeaders(),body:JSON.stringify(body)})}catch(_){}
}

