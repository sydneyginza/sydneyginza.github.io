/* === CORE UTILITIES & API (Proxy Version) === */

// ✅ No token in frontend! All requests go through your Cloudflare Worker.
// Replace this with your actual worker URL after deploying.
const PROXY = 'https://github-proxy.sydneyginza-api-2.workers.dev';

// Repo paths (no tokens needed)
const DATA_REPO = 'sydneyginza/files';
const SITE_REPO = 'sydneyginza/sydneyginza.github.io';
const DATA_API = `${PROXY}/repos/${DATA_REPO}/contents`;
const SITE_API = `${PROXY}/repos/${SITE_REPO}/contents`;

const DP = 'data/girls.json', AP = 'data/auth.json', KP = 'data/calendar.json', CP = 'data/config.json';
let loggedIn = false, dataSha = null, calSha = null, calData = {}, loggedInUser = null, MAX_PHOTOS = 10, profileReturnPage = 'homePage';
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
function dispDate(ds) { const d = new Date(ds + 'T00:00:00'); return { date: d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()], day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] } }
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

/* Count how many girls are available right now */
function getAvailableNowCount() {
  return girls.filter(g => g.name && isAvailableNow(g.name)).length;
}

function genFn() { return 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '.jpg' }

/* === Local Cache (stale-while-revalidate) === */
const CACHE_KEY_GIRLS = 'ginza_cache_girls';
const CACHE_KEY_CAL = 'ginza_cache_cal';
const CACHE_KEY_GIRLS_SHA = 'ginza_cache_girls_sha';
const CACHE_KEY_CAL_SHA = 'ginza_cache_cal_sha';

function cacheGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch (e) { return null; }
}

function cacheSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); }
  catch (e) { /* quota exceeded or unavailable — silently ignore */ }
}

function cacheClear() {
  try { [CACHE_KEY_GIRLS, CACHE_KEY_CAL, CACHE_KEY_GIRLS_SHA, CACHE_KEY_CAL_SHA].forEach(k => localStorage.removeItem(k)); }
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
}

/* === Favorites === */
const FAV_KEY = 'ginza_favorites';

function getFavorites() {
  try { const v = localStorage.getItem(FAV_KEY); return v ? JSON.parse(v) : []; }
  catch (e) { return []; }
}

function saveFavorites(favs) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) {}
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
    if (r.ok) return dec((await r.json()).content);
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
    return true;
  } catch (e) { showToast('Calendar save failed', 'error'); return false; }
}

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

function lazyThumb(src, cls) {
  return `<img class="${cls || 'card-thumb'}" data-src="${src}">`;
}

function lazyCalAvatar(src) {
  return `<img data-src="${src}">`;
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
    analyticsPage:  '/analytics'
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
    const t = title || 'Ginza';
    document.title = t;
    if (window.location.pathname !== path) {
      history.pushState({ path: path }, t, path);
    }
  }

  function replace(path, title) {
    if (_suppressPush) return;
    const t = title || 'Ginza';
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
      if (pageId === 'calendarPage' && !loggedIn) {
        _suppressPush = true;
        showPage('homePage');
        _suppressPush = false;
        replace('/', 'Ginza');
        return true;
      }
      if (pageId === 'analyticsPage' && !loggedIn) {
        _suppressPush = true;
        showPage('homePage');
        _suppressPush = false;
        replace('/', 'Ginza');
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
      replace('/', 'Ginza');
    }
    return true;
  }

  window.addEventListener('popstate', function() { resolve(); });

  return { PAGE_ROUTES, push, replace, resolve, pathForPage, pathForProfile, nameToSlug, slugToName, findGirlByName };
})();