/* === INTERNATIONALISATION — EN / JP === */

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
  },
  ja: {
    /* Navigation */
    'nav.home':'ホーム','nav.roster':'シフト','nav.girls':'女の子','nav.favorites':'お気に入り',
    'nav.rates':'料金','nav.employment':'求人',
    /* Bottom nav */
    'bnav.home':'ホーム','bnav.roster':'シフト','bnav.girls':'検索','bnav.favs':'お気に入り',
    /* Home page */
    'home.tagline':'シドニー最高のエクスペリエンス',
    'home.announcement':'お知らせ','home.newGirls':'新人',
    'home.location':'場所','home.hours':'営業時間',
    /* Section titles */
    'page.roster':'シフト','page.girls':'女の子','page.rates':'料金表',
    'page.employment':'求人情報','page.favorites':'お気に入り',
    /* Profile field labels */
    'field.age':'年齢','field.body':'体型','field.height':'身長','field.cup':'カップ',
    'field.rates30':'料金 30分','field.rates45':'料金 45分','field.rates60':'料金 60分',
    'field.experience':'経験','field.language':'言語','field.type':'タイプ',
    'field.description':'プロフィール','field.special':'特別リクエスト','field.labels':'ラベル',
    /* Availability */
    'avail.now':'出勤中','avail.today':'本日出勤',
    'avail.coming':'出勤予定','avail.lastSeen':'最終出勤',
    /* UI actions */
    'ui.back':'戻る','ui.share':'シェア',
    'ui.addFav':'お気に入りに追加','ui.favorited':'お気に入り済み',
    'ui.edit':'編集','ui.delete':'削除','ui.compare':'比較',
    'ui.linkCopied':'リンクをコピーしました！',
    'ui.alsoAvail':'本日出勤中',
    /* Empty states */
    'ui.favEmpty':'お気に入りはまだありません。プロフィールのハートをタップして保存してください。',
    'ui.noResults':'条件に合う女の子がいません。',
    'ui.search':'名前で検索...',
    /* Filters */
    'filter.availNow':'出勤中','filter.availToday':'本日出勤',
  }
};

let siteLanguage = localStorage.getItem('ginza_lang') || 'en';

function t(key) {
  return (LANG_DICT[siteLanguage] && LANG_DICT[siteLanguage][key] !== undefined)
    ? LANG_DICT[siteLanguage][key]
    : (LANG_DICT.en[key] !== undefined ? LANG_DICT.en[key] : key);
}

function setLang(lang) {
  siteLanguage = lang;
  localStorage.setItem('ginza_lang', lang);
  applyLang();
  /* Re-render dynamic sections */
  if (typeof renderGrid === 'function') renderGrid();
  if (typeof renderRoster === 'function') renderRoster();
  if (typeof renderHome === 'function') renderHome();
  if (typeof renderFavoritesGrid === 'function') renderFavoritesGrid();
  const profPage = document.getElementById('profilePage');
  if (profPage && profPage.classList.contains('active') && typeof currentProfileIdx !== 'undefined' && currentProfileIdx >= 0) {
    if (typeof showProfile === 'function') showProfile(currentProfileIdx);
  }
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
  /* Employment page bilingual sections */
  document.querySelectorAll('.lang-section').forEach(function(el) {
    el.style.display = el.classList.contains('lang-' + siteLanguage) ? '' : 'none';
  });
  /* Lang toggle button label */
  var btn = document.getElementById('langToggleBtn');
  if (btn) btn.textContent = siteLanguage === 'en' ? 'JP' : 'EN';
  /* HTML lang attribute */
  document.documentElement.lang = siteLanguage === 'ja' ? 'ja' : 'en';
}
