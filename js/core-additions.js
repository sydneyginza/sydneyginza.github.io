/* =========================================
   ADDITIONS: core-additions.js
   Add these functions/changes to core.js
   ========================================= */

/* === 1. SECURITY HARDENING ===
   Move authentication server-side in your Cloudflare Worker.
   The proxy worker should expose:
     POST /auth/login  { user, pass } -> { token, user } or 401
     GET  /auth/verify  (with session cookie) -> { user } or 401
*/

let _sessionToken = null;
const USE_SECURE_AUTH = false; // Set true when worker is updated

async function secureLogin(user, pass) {
  try {
    const r = await fetchWithRetry(PROXY + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass })
    });
    if (r.ok) {
      const data = await r.json();
      _sessionToken = data.token;
      sessionStorage.setItem('ginza_session', _sessionToken);
      return { success: true, user: data.user };
    }
    return { success: false };
  } catch (e) {
    console.error('Login error:', e);
    return { success: false };
  }
}

async function secureVerifySession() {
  const token = sessionStorage.getItem('ginza_session');
  if (!token) return null;
  try {
    const r = await fetchWithRetry(PROXY + '/auth/verify', {
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    });
    if (r.ok) { _sessionToken = token; return (await r.json()).user; }
  } catch (e) {}
  sessionStorage.removeItem('ginza_session');
  return null;
}

function secureLogout() {
  _sessionToken = null;
  sessionStorage.removeItem('ginza_session');
}


/* === 2. URL ROUTING / DEEP LINKING === */

const ROUTES = {
  '/': 'homePage',
  '/roster': 'rosterPage',
  '/girls': 'listPage',
  '/favorites': 'favoritesPage',
  '/rates': 'valuePage',
  '/employment': 'employmentPage',
  '/calendar': 'calendarPage'
};

const PAGE_TITLES = {
  homePage: "Ginza - Sydney's Premier Experience",
  rosterPage: 'Roster - Ginza',
  listPage: 'Girls - Ginza',
  favoritesPage: 'Favorites - Ginza',
  valuePage: 'Rates - Ginza',
  employmentPage: 'Employment - Ginza',
  calendarPage: 'Calendar - Ginza',
  profilePage: 'Profile - Ginza'
};

function getRouteForPage(pageId) {
  for (const route in ROUTES) { if (ROUTES[route] === pageId) return route; }
  return '/';
}

function getPageForRoute(hash) {
  const path = hash.replace(/^#/, '') || '/';
  if (path.startsWith('/profile/')) {
    return { page: 'profilePage', profileName: decodeURIComponent(path.replace('/profile/', '')) };
  }
  return { page: ROUTES[path] || 'homePage' };
}

function pushRoute(pageId, profileName) {
  let hash;
  if (pageId === 'profilePage' && profileName) {
    hash = '#/profile/' + encodeURIComponent(profileName);
  } else {
    hash = '#' + getRouteForPage(pageId);
  }
  if (window.location.hash !== hash) {
    history.pushState(null, '', hash);
  }
  document.title = PAGE_TITLES[pageId] || 'Ginza';
  if (pageId === 'profilePage' && profileName) {
    document.title = profileName + ' - Ginza';
  }
}

function handleRouteChange() {
  var result = getPageForRoute(window.location.hash);
  var page = result.page;
  var profileName = result.profileName;
  if (page === 'profilePage' && profileName) {
    var idx = girls.findIndex(function(g) { return g.name === profileName; });
    if (idx >= 0) { showProfile(idx); return; }
  }
  if (page === 'calendarPage' && !loggedIn) { page = 'homePage'; }
  showPage(page, true); // true = skipPush (don't double-push to history)
}

// Listen for back/forward navigation
window.addEventListener('popstate', handleRouteChange);


/* === 3. "AVAILABLE NOW" FEATURE === */

function isAvailableNow(name) {
  var now = getAEDTDate();
  var todayStr = fmtDate(now);
  var entry = getCalEntry(name, todayStr);
  if (!entry || !entry.start || !entry.end) return false;

  var currentMinutes = now.getHours() * 60 + now.getMinutes();
  var startParts = entry.start.split(':');
  var endParts = entry.end.split(':');
  var startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
  var endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

  // Handle overnight shifts (e.g. 22:00 - 01:00)
  if (endMin <= startMin) {
    return currentMinutes >= startMin || currentMinutes <= endMin;
  }
  return currentMinutes >= startMin && currentMinutes <= endMin;
}

function getAvailableNowGirls() {
  return girls.filter(function(g) {
    return g.name && String(g.name).trim().length > 0 && isAvailableNow(g.name);
  });
}

function renderAvailableNow() {
  var banner = document.getElementById('availableNowBanner');
  var grid = document.getElementById('availableNowGrid');
  if (!banner || !grid) return;

  var available = getAvailableNowGirls();
  if (available.length === 0) {
    banner.style.display = 'none';
    return;
  }

  banner.style.display = 'block';
  grid.innerHTML = '';

  available.forEach(function(g) {
    var idx = girls.indexOf(g);
    var todayStr = fmtDate(getAEDTDate());
    var entry = getCalEntry(g.name, todayStr);
    var timeStr = entry ? fmtTime12(entry.start) + ' - ' + fmtTime12(entry.end) : '';
    var avatar = g.photos && g.photos.length
      ? '<img src="' + g.photos[0] + '" alt="' + g.name + '">'
      : '';

    var chip = document.createElement('div');
    chip.className = 'avnow-chip';
    chip.setAttribute('role', 'button');
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('aria-label', g.name + ' available now');
    chip.innerHTML =
      '<div class="avnow-chip-avatar">' + avatar + '</div>' +
      '<div class="avnow-chip-info">' +
        '<div class="avnow-chip-name">' + g.name + '</div>' +
        '<div class="avnow-chip-time">' + timeStr + '</div>' +
      '</div>';

    chip.onclick = function() { profileReturnPage = 'homePage'; showProfile(idx); };
    chip.onkeydown = function(e) { if (e.key === 'Enter') { profileReturnPage = 'homePage'; showProfile(idx); } };
    grid.appendChild(chip);
  });
}

// Refresh "Available Now" every 60 seconds
setInterval(renderAvailableNow, 60000);


/* === 4. PERFORMANCE: DEBOUNCED RENDER BATCHING === */

var _renderQueued = false;
var _renderParts = {};

function queueRender(parts) {
  // parts is an object like { grid: true, roster: true, home: true }
  Object.assign(_renderParts, parts);
  if (!_renderQueued) {
    _renderQueued = true;
    requestAnimationFrame(function() {
      _renderQueued = false;
      var p = _renderParts;
      _renderParts = {};
      if (p.filters) safeRender('Filters', renderFilters);
      if (p.grid) safeRender('Grid', renderGrid);
      if (p.roster) safeRender('Roster', renderRoster);
      if (p.home) safeRender('Home', renderHome);
      if (p.favorites) safeRender('Favorites', renderFavoritesGrid);
      if (p.calendar && document.getElementById('calendarPage').classList.contains('active')) {
        safeRender('Calendar', renderCalendar);
      }
      if (p.availableNow) renderAvailableNow();
    });
  }
}

// Replace repeated renderFilters();renderGrid();renderRoster();renderHome(); calls with:
// queueRender({ filters:true, grid:true, roster:true, home:true, availableNow:true });


/* === 5. ANALYTICS (Privacy-Respecting) === */

var GinzaAnalytics = {
  _events: [],
  _sessionId: null,

  init: function() {
    this._sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
    this.track('session_start', { referrer: document.referrer || 'direct' });
  },

  track: function(event, data) {
    var entry = {
      event: event,
      timestamp: new Date().toISOString(),
      session: this._sessionId,
      data: data || {}
    };
    this._events.push(entry);

    // Batch send every 10 events or on unload
    if (this._events.length >= 10) this.flush();
  },

  flush: function() {
    if (!this._events.length) return;
    var batch = this._events.splice(0);

    // Send to your analytics endpoint (replace with your actual URL)
    // navigator.sendBeacon is reliable even on page unload
    var endpoint = PROXY + '/analytics';
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, JSON.stringify(batch));
      } else {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batch),
          keepalive: true
        }).catch(function() {});
      }
    } catch (e) {
      // Analytics should never break the app
    }
  },

  trackPageView: function(pageId) {
    this.track('page_view', { page: pageId });
  },

  trackProfileView: function(name) {
    this.track('profile_view', { name: name });
  },

  trackFilter: function(filterType, value) {
    this.track('filter_used', { type: filterType, value: value });
  },

  trackFavorite: function(name, added) {
    this.track('favorite', { name: name, action: added ? 'add' : 'remove' });
  }
};

// Flush on page unload
window.addEventListener('beforeunload', function() { GinzaAnalytics.flush(); });
window.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden') GinzaAnalytics.flush();
});

// Initialize analytics
GinzaAnalytics.init();


/* === 7. MOBILE BOTTOM NAV SYNC === */

function updateMobileNav(pageId) {
  var items = document.querySelectorAll('.mob-nav-item');
  items.forEach(function(item) {
    var isActive = item.dataset.page === pageId;
    item.classList.toggle('active', isActive);
  });
}

function updateMobileFavBadge() {
  var badge = document.getElementById('mobFavBadge');
  if (!badge) return;
  var count = getFavCount();
  badge.textContent = count > 0 ? count : '';
}

// Bind mobile nav clicks
document.addEventListener('DOMContentLoaded', function() {
  var mobNav = document.getElementById('mobileBottomNav');
  if (mobNav) {
    mobNav.querySelectorAll('.mob-nav-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        var pageId = this.dataset.page;
        if (pageId) showPage(pageId);
      });
    });
  }
});
