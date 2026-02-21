/* === INTERNATIONALISATION — EN only === */

const LANG_DICT = {
  en: {
    /* Navigation */
    'nav.home':'Home','nav.roster':'Roster','nav.girls':'Girls','nav.favorites':'Favorites',
    'nav.rates':'Rates','nav.employment':'Employment',
    /* Bottom nav */
    'bnav.home':'Home','bnav.roster':'Roster','bnav.girls':'Browse','bnav.favs':'Favs',
    /* Home page */
    'home.tagline':"Sydney's Premier Experience",
    'home.announcement':'Announcement','home.newGirls':'New Girls',
    'home.location':'Location','home.hours':'Hours',
    'home.announceDefault':"Discover our exclusive selection of stunning girls. Each profile is carefully curated to ensure the highest quality experience. Browse our roster to find your perfect match.",
    /* Section titles */
    'page.roster':'Roster','page.girls':'Girls','page.rates':'Rates',
    'page.employment':'Employment','page.favorites':'Favorites',
    /* Profile field labels */
    'field.age':'Age','field.body':'Body Size','field.height':'Height','field.cup':'Cup Size',
    'field.rates30':'Rates 30 mins','field.rates45':'Rates 45 mins','field.rates60':'Rates 60 mins',
    'field.experience':'Experience','field.language':'Language','field.type':'Type',
    'field.description':'Description','field.special':'Special Requests','field.labels':'Labels',
    /* Availability */
    'avail.now':'Available Now','avail.today':'Available Today',
    'avail.coming':'Coming','avail.lastSeen':'Last seen',
    /* UI actions */
    'ui.back':'Back','ui.share':'Share',
    'ui.addFav':'Add to Favorites','ui.favorited':'Favorited',
    'ui.edit':'Edit Profile','ui.delete':'Delete','ui.compare':'Compare',
    'ui.linkCopied':'Link copied!',
    'ui.alsoAvail':'Also Available Today',
    /* Empty states */
    'ui.favEmpty':'No favorites yet. Tap the heart on any profile to save it here.',
    'ui.noResults':'No girls match your filters.',
    'ui.search':'Search by name...',
    /* Filters */
    'filter.availNow':'Available Now','filter.availToday':'Available Today',
    /* Privacy notice */
    'privacy.title':'Privacy Notice',
    'privacy.body':'We collect anonymous visit data to understand visitor trends. No personal information is collected or shared.',
    'privacy.btn':'Got It',
    /* Footer */
    'footer.rights':'Ginza Empire \u00a9 2026 \u2014 All Rights Reserved',
    'footer.privacy':'This site uses anonymous analytics to understand visitor trends. No personal information is collected or shared with third parties.',
    /* Back to top / compare */
    'ui.backToTop':'Back to Top',
    'compare.selected':'selected',
    'compare.clear':'Clear','compare.open':'Compare','compare.done':'Close',
    /* Employment contacts */
    'emp.contacts':'Contacts',
    /* Admin nav */
    'nav.calendar':'Calendar','nav.analytics':'Analytics','nav.menu':'Menu','ui.admin':'Admin',
    /* Sort buttons */
    'sort.name':'Name','sort.dateAdded':'Date Added','sort.age':'Age','sort.size':'Size','sort.height':'Height','sort.cup':'Cup',
    /* Date & time */
    'ui.today':'Today',
    'date.sun':'Sun','date.mon':'Mon','date.tue':'Tue','date.wed':'Wed','date.thu':'Thu','date.fri':'Fri','date.sat':'Sat',
    'date.jan':'Jan','date.feb':'Feb','date.mar':'Mar','date.apr':'Apr','date.may':'May','date.jun':'Jun',
    'date.jul':'Jul','date.aug':'Aug','date.sep':'Sep','date.oct':'Oct','date.nov':'Nov','date.dec':'Dec',
    /* Availability counts */
    'ui.girlsAvailNow':'{n} girls available now','ui.girlsAvailToday':'{n} girls available today',
    /* Empty states */
    'ui.noGirlsWeek':'No girls available this week','ui.noGirlsDate':'No girls available for this date',
    /* Value table */
    'table.rates':'Rates','table.priceRange':'Price Range',
    /* Filter pane */
    'fp.search':'Search','fp.country':'Country','fp.age':'Age','fp.bodySize':'Body Size',
    'fp.height':'Height (cm)','fp.cupSize':'Cup Size',
    'fp.rates30':'Rates 30 mins','fp.rates45':'Rates 45 mins','fp.rates60':'Rates 60 mins',
    'fp.experience':'Experience','fp.labels':'Labels','fp.clearAll':'Clear All Filters','fp.rangeSep':'to',
    /* Calendar */
    'cal.profile':'Profile','cal.allWeek':'All Week','cal.clear':'Clear',
    'cal.copyTimesTitle':'Copy Times?','cal.setNewTime':'Set New Time','cal.copyTimesBtn':'Copy Times',
    'cal.copyDayTitle':'Copy Day Schedule','cal.copyDaySub':'Duplicate an entire day\'s roster to other days',
    'cal.sourceDay':'Source Day','cal.copyTo':'Copy To','cal.overwrite':'Overwrite existing entries on target days',
    'cal.copyDayBtn':'Copy Schedule','cal.bulkTimeSub':'Set availability for multiple days',
    'cal.days':'Days','cal.startTime':'Start Time','cal.endTime':'End Time','cal.apply':'Apply','cal.all':'All','cal.noScheduled':'No girls scheduled on this day',
    /* Form */
    'ui.addGirl':'Add Girl','form.addGirl':'Add New Girl','form.editGirl':'Edit Profile',
    'form.name':'Name','form.startDate':'Start Date','form.photos':'Photos',
    'form.cancel':'Cancel','form.save':'Save','form.delete':'Delete','form.confirmDelete':'Confirm Delete',
    'form.expSelect':'Select experience','exp.experienced':'Experienced','exp.inexperienced':'Inexperienced',
    /* Analytics */
    'an.days':' Days','an.loading':'Loading visitor data...','an.uniqueVisitors':'Unique Visitors','an.sessions':'Sessions','an.totalPageViews':'Total Page Views','an.totalProfileViews':'Total Profile Views',
    'an.topProfiles':'Top Profiles','an.topHint':'(most viewed this period)','an.uniqueCount':'{n} unique',
    'an.dailyVisitors':'Daily Visitors','an.dailyHint':'(hits vs uniques)','an.noLogs':'No visitor logs found for this period',
    'an.legendHits':'Hits','an.legendUniques':'Uniques',
    'an.peakHours':'Peak Hours Heatmap','an.peakHint':'(AEDT, day × hour)','an.visitCount':'{n} visits',
    'an.pageViews':'Page Views','an.pvHint':'(total / unique visitors)','an.noPV':'No page views recorded yet',
    'an.mostProfiles':'Most Viewed Profiles','an.pfHint':'(total / unique)','an.noPF':'No profile views recorded yet',
    'an.browsers':'Browsers','an.os':'Operating Systems','an.devices':'Devices',
    'an.languages':'Languages','an.timezones':'Timezones','an.referrers':'Referrers','an.noData':'No data',
    'an.recentVisitors':'Recent Unique Visitors','an.recentHint':'(last 20, per day)',
    'an.tableDate':'Date','an.tableBrowser':'Browser','an.tableOS':'OS','an.tableDevice':'Device','an.tableLang':'Lang','an.tableTZ':'Timezone',
    'an.export':'Export Visitor Logs','an.refresh':'Refresh','an.exported':'Visitor logs exported',
  }
};

const siteLanguage = 'en';

function t(key) {
  return LANG_DICT.en[key] !== undefined ? LANG_DICT.en[key] : key;
}

function applyLang() {
  /* Static text via data-i18n */
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var k = el.dataset.i18n; if (k) el.textContent = t(k);
  });
  /* Placeholder text via data-i18n-ph */
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el) {
    var k = el.dataset.i18nPh; if (k) el.placeholder = t(k);
  });
  document.documentElement.lang = 'en';
}
