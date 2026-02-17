/* =========================================
   ADDITIONS: ui-additions.js
   Patches to apply to ui.js
   ========================================= */

/* === MODIFIED showPage() with transitions, routing, analytics === 
   Replace the existing showPage function with this one:
*/

/*
function showPage(id, skipPush) {
  // Flush calendar saves when leaving calendar
  if (document.getElementById('calendarPage').classList.contains('active') && id !== 'calendarPage') {
    flushCalSave();
    var s = false;
    for (var n in calPending) {
      for (var dt in calPending[n]) {
        if (calPending[n][dt] && calData[n] && calData[n][dt]) {
          delete calData[n][dt]; s = true;
        }
      }
    }
    if (s) { saveCalData(); renderRoster(); renderGrid(); }
    calPending = {};
  }

  // Page exit transition
  var currentPage = allPages.find(function(p) { return p.classList.contains('active'); });
  if (currentPage && currentPage.id !== id) {
    currentPage.classList.add('page-exit');
    setTimeout(function() { currentPage.classList.remove('active', 'page-exit'); }, 200);
  }

  // Activate new page with slight delay for transition
  setTimeout(function() {
    allPages.forEach(function(p) { p.classList.remove('active', 'page-exit'); });
    document.getElementById(id).classList.add('active');

    closeFilterPanel();
    var paneMap = {
      rosterPage: 'rosterFilterPane',
      listPage: 'girlsFilterPane',
      calendarPage: 'calFilterPane',
      profilePage: 'profileFilterPane'
    };
    _activeFilterPaneId = paneMap[id] || null;

    document.querySelectorAll('.nav-dropdown a').forEach(function(a) { a.classList.remove('active'); });
    if (id === 'homePage') { document.getElementById('navHome').classList.add('active'); renderHome(); }
    if (id === 'rosterPage') { document.getElementById('navRoster').classList.add('active'); renderFilterPane('rosterFilterPane'); renderRoster(); }
    if (id === 'listPage') { document.getElementById('navGirls').classList.add('active'); renderFilterPane('girlsFilterPane'); renderGrid(); }
    if (id === 'favoritesPage') { document.getElementById('navFavorites').classList.add('active'); renderFavoritesGrid(); }
    if (id === 'valuePage') { document.getElementById('navValue').classList.add('active'); renderValueTable(); }
    if (id === 'employmentPage') { document.getElementById('navEmployment').classList.add('active'); }
    if (id === 'calendarPage') { document.getElementById('navCalendar').classList.add('active'); calPending = {}; renderFilterPane('calFilterPane'); renderCalendar(); }

    updateFilterToggle();
    updateMobileNav(id);
    window.scrollTo(0, 0);

    // URL routing
    if (!skipPush) pushRoute(id);

    // Analytics
    GinzaAnalytics.trackPageView(id);

    // Available Now on home
    if (id === 'homePage') renderAvailableNow();
  }, currentPage && currentPage.id !== id ? 200 : 0);
}
*/


/* === MODIFIED showProfile() with tabs, routing, analytics ===
   In the showProfile function, after building the profile HTML,
   wrap the details section in tabs. Here is the tab structure to add:
*/

/*
  // After building stats, special, lang, type, desc HTML:
  // Replace the flat layout with tabbed layout:
  
  var tabsHtml = '<div class="profile-tabs">' +
    '<button class="profile-tab active" data-tab="details">Details</button>' +
    '<button class="profile-tab" data-tab="photos">Photos</button>' +
    '<button class="profile-tab" data-tab="availability">Availability</button>' +
  '</div>';

  // Details tab content (existing stats + desc)
  var detailsTab = '<div class="profile-tab-content active" data-tab-content="details">' +
    statsHtml + specialHtml + langHtml + typeHtml + descHtml + labelsHtml +
  '</div>';

  // Photos tab content (gallery thumbs moved here)
  var photosTab = '<div class="profile-tab-content" data-tab-content="photos">' +
    '<div class="gallery-thumbs" id="galThumbs"></div>' +
  '</div>';

  // Availability tab content (weekly mini-calendar)
  var calHtml = buildProfileWeekCal(g.name);
  var availTab = '<div class="profile-tab-content" data-tab-content="availability">' +
    calHtml +
  '</div>';

  // Combine
  profileDetailsHtml = tabsHtml + detailsTab + photosTab + availTab;

  // Bind tab clicks after render:
  document.querySelectorAll('.profile-tab').forEach(function(tab) {
    tab.onclick = function() {
      document.querySelectorAll('.profile-tab').forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.profile-tab-content').forEach(function(c) { c.classList.remove('active'); });
      tab.classList.add('active');
      var target = tab.dataset.tab;
      var content = document.querySelector('[data-tab-content="' + target + '"]');
      if (content) content.classList.add('active');
    };
  });

  // Push route
  pushRoute('profilePage', g.name);

  // Analytics
  GinzaAnalytics.trackProfileView(g.name);
*/


/* === Profile Weekly Mini-Calendar Builder === */

function buildProfileWeekCal(name) {
  var dates = getWeekDates();
  var todayStr = fmtDate(getAEDTDate());
  var html = '<div class="profile-week-cal">';
  
  dates.forEach(function(ds) {
    var f = dispDate(ds);
    var entry = getCalEntry(name, ds);
    var hasEntry = entry && entry.start && entry.end;
    var isToday = ds === todayStr;
    var cls = 'profile-day';
    if (hasEntry) cls += ' available';
    if (isToday) cls += ' is-today';

    html += '<div class="' + cls + '">';
    html += '<div class="profile-day-name">' + f.day + '</div>';
    html += '<div class="profile-day-date">' + f.date + '</div>';
    if (hasEntry) {
      html += '<div class="profile-day-time">' + fmtTime12(entry.start) + '<br>' + fmtTime12(entry.end) + '</div>';
    } else {
      html += '<div class="profile-day-off">Off</div>';
    }
    html += '</div>';
  });

  html += '</div>';
  return html;
}


/* === Updated updateFavBadge to include mobile badge === */

/*
  Replace existing updateFavBadge with:

  function updateFavBadge() {
    var b = document.getElementById('navFavBadge');
    var mb = document.getElementById('mobFavBadge');
    var c = getFavCount();
    var text = c > 0 ? c : '';
    if (b) b.textContent = text;
    if (mb) mb.textContent = text;
  }
*/


/* === Updated toggleFavorite to include analytics === */

/*
  In bindCardFavs and profile fav button click handlers, add:
  GinzaAnalytics.trackFavorite(name, nowFav);
*/


/* === Route-based initialization ===
   Add to the end of init (in forms.js), after fullRender():
*/

/*
  // Initialize from URL hash
  if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
    handleRouteChange();
  }
*/
