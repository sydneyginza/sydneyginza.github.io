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
    /* Home welcome article */
    'home.welcomeTitle':"Welcome to Sydney's Premier Asian Bordello",
    'home.welcomeP1':'Our approved venue has been fully renovated with your comfort and pleasure in mind. The luxuriously appointed themed rooms are the perfect place for gentlemen to lose themselves for an hour or more. Each room has a private shower, climate control, and audio-visual setup, plus its own unique theme.',
    'home.welcomeP2':"Ginza Empire's main attraction are the gorgeous ladies whose sole aim is to please. We feature beauties from Japan, Korea, Thailand, China, Singapore, and Malaysia. Headlining our offering is Sydney's most desirable collection of genuine Japanese girls, providing the ultimate GFE and PSE experience.",
    'home.welcomeP3':'Nowhere in Sydney \u2014 or perhaps the world \u2014 will you find such luxurious, comfortable, and spotlessly clean rooms, staffed by ladies of this calibre, at such competitive prices.',
    /* Home location & hours */
    'home.locationHtml':'310 Cleveland St Surry Hills NSW 2010<br>(back entrance from goodlet lane)',
    'home.hoursText':'Monday to Sunday open from 10:30am till 1am.',
    /* Rates page */
    'rates.intro':'Below are the indicative rates charged by the ladies for providing you with their full adult service (inclusive of our flat room hire rates charged by us to the ladies). However, you must negotiate the lady\u2019s payment directly with her. The guide below were provided by the ladies.',
    'rates.legal':'We are a legal Sydney Brothel and safe sex practices must be adhered to. For our service of providing superior private rooms and facilities, we charge the ladies (service providers) a flat room hiring rate as below:',
    'rates.roomTitle':'Room Hire Rates',
    'rates.room30':'30 Minutes $30','rates.room45':'45 Minutes $45','rates.room60':'60 Minutes $60',
    'rates.roomOver':'Over 60 Minutes Negotiable',
    'rates.disclaimer':'All our ladies are INDEPENDENT service providers, they will charge you according to the level of services they provide to you. All services that you would like should be discussed directly with them.',
    /* Employment page */
    'emp.jobTitle':'GINZA EMPIRE \u2014 JOB OPPORTUNITIES',
    'emp.tagline':'Earn $1,500\u20133,000+ per shift in a safe, clean, and professional environment. All nationalities welcome \u2014 no experience necessary.',
    'emp.h2Env':'\u2460 Store Environment & Clientele',
    'emp.p1Env':'Our venue is fully licensed and recently renovated to the highest standard. Each room has its own private en-suite, climate control, and AV system. A professional cleaning team attends weekly \u2014 our environment is always spotless.',
    'emp.p2Env':'Our clients are well-mannered, affluent professionals \u2014 primarily Asian businessmen and corporate guests. We are selective about who we accept; your safety and comfort come first. No rough clients, ever.',
    'emp.p3Env':'No English required. No prior experience required. Your privacy is 100% guaranteed.',
    'emp.h2Work':'\u2461 Work Conditions',
    'emp.p1Work':'Choose your own hours \u2014 work as many or as few days as you like. Short-term and long-term arrangements both welcome. Shifts can be as short as 5\u20136 hours.',
    'emp.p2Work':'Each girl has her own private room. You will not cross paths with other girls. Your work is completely confidential \u2014 no one will find out.',
    'emp.p3Work':'Pay is cash in hand after every shift. AV/talent/model experience earns premium rates: $300\u20131,000+ per hour. With 5\u20136 hours a day, 4 days a week, top earners take home $16,000+ per week.',
    'emp.h2Health':'\u2462 Health & Safety',
    'emp.p1Health':'Safe sex practices are mandatory. Regular free health checks are available at a nearby clinic \u2014 all girls attend routinely. Days off for personal reasons are always accommodated. Your wellbeing is our priority.',
    'emp.p2Health':"A trial shift is available \u2014 same pay, no obligations. If it's not for you, you can walk away at any time.",
    'emp.h2Contact':'Contact Us',
    'emp.p1Contact':'Reach out on any of the platforms below. All enquiries are 100% confidential.',
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
  /* HTML content via data-i18n-html (for elements containing markup like <br>) */
  document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
    var k = el.dataset.i18nHtml; if (k) el.innerHTML = t(k);
  });
  document.documentElement.lang = 'en';
}
