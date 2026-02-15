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
function genFn() { return 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '.jpg' }

/* === API Functions (now using proxy) === */

async function loadAuth() {
  try {
    const r = await fetch(`${DATA_API}/${AP}`, { headers: proxyHeaders() });
    if (r.ok) return dec((await r.json()).content);
    if (r.status === 404) {
      const d = [{ user: 'admin', pass: 'admin123' }];
      await fetch(`${DATA_API}/${AP}`, {
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
    const r = await fetch(`${DATA_API}/${DP}`, { headers: proxyHeaders() });
    if (r.ok) { const d = await r.json(); dataSha = d.sha; return dec(d.content); }
    if (r.status === 404) { dataSha = null; return []; }
  } catch (e) { console.error('loadData error:', e); }
  return null;
}

async function saveData() {
  try {
    const body = { message: 'Update girls', content: enc(girls) };
    if (dataSha) body.sha = dataSha;
    const r = await fetch(`${DATA_API}/${DP}`, {
      method: 'PUT',
      headers: proxyHeaders(),
      body: JSON.stringify(body)
    });
    const rd = await r.json();
    if (!r.ok) throw new Error(rd.message || r.status);
    dataSha = rd.content.sha;
    return true;
  } catch (e) { showToast('Save failed: ' + e.message, 'error'); return false; }
}

async function loadCalData() {
  try {
    const r = await fetch(`${DATA_API}/${KP}`, { headers: proxyHeaders() });
    if (r.ok) { const d = await r.json(); calSha = d.sha; return dec(d.content); }
    if (r.status === 404) { calSha = null; return {}; }
  } catch (e) { console.error('loadCalData error:', e); }
  return {};
}

async function saveCalData() {
  try {
    const vd = getWeekDates(), cl = {};
    for (const n in calData) { cl[n] = {}; for (const dt of vd) { if (calData[n] && calData[n][dt]) cl[n][dt] = calData[n][dt] } }
    calData = cl;
    const body = { message: 'Update calendar', content: enc(calData) };
    if (calSha) body.sha = calSha;
    const r = await fetch(`${DATA_API}/${KP}`, {
      method: 'PUT',
      headers: proxyHeaders(),
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(r.status);
    calSha = (await r.json()).content.sha;
    return true;
  } catch (e) { showToast('Calendar save failed', 'error'); return false; }
}

async function uploadToGithub(b64, name, fn) {
  const safe = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `Images/${safe}/${fn}`;
  const pure = b64.split(',')[1];
  let sha;
  try {
    const c = await fetch(`${SITE_API}/${path}`, { headers: proxyHeaders() });
    if (c.ok) sha = (await c.json()).sha;
  } catch (e) {}
  const body = { message: `Upload ${path}`, content: pure };
  if (sha) body.sha = sha;
  const r = await fetch(`${SITE_API}/${path}`, {
    method: 'PUT',
    headers: proxyHeaders(),
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(r.status);
  return `https://raw.githubusercontent.com/${SITE_REPO}/main/${path}`;
}

async function deleteFromGithub(url) {
  try {
    const m = url.match(/raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/[^/]+\/(.+?)(\?|$)/);
    if (!m) return;
    // Determine which proxy path to use based on the repo
    const repo = m[1];
    const filePath = decodeURIComponent(m[2]);
    const api = `${PROXY}/repos/${repo}/contents/${filePath}`;
    const c = await fetch(api, { headers: proxyHeaders() });
    if (!c.ok) return;
    await fetch(api, {
      method: 'DELETE',
      headers: proxyHeaders(),
      body: JSON.stringify({ message: 'Delete', sha: (await c.json()).sha })
    });
  } catch (e) { console.error('deleteFromGithub error:', e); }
}

// ✅ loadConfig is no longer needed since the proxy handles the token.
// If you still need config for other settings, simplify it:
async function loadConfig() {
  // No token management needed — just set repo paths
  return true;
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