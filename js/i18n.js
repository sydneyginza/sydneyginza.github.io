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
    /* Privacy notice */
    'privacy.title':'プライバシー通知',
    'privacy.body':'当サイトでは、訪問者の傾向を把握するために匿名の訪問データを収集しています。個人情報の収集・第三者への提供は一切行いません。',
    'privacy.btn':'了解',
    /* Footer */
    'footer.rights':'銀座帝国 \u00a9 2026 \u2014 無断転載禁止',
    'footer.privacy':'当サイトでは、訪問傾向を把握するために匿名のアナリティクスを使用しています。個人情報の収集・第三者への提供は一切行いません。',
    /* Back to top / compare */
    'ui.backToTop':'トップへ',
    'compare.selected':'件選択中',
    'compare.clear':'クリア','compare.open':'比較','compare.done':'閉じる',
    /* Employment contacts */
    'emp.contacts':'お問い合わせ',
    /* Admin nav */
    'nav.calendar':'カレンダー','nav.analytics':'分析','nav.menu':'メニュー','ui.admin':'管理',
    /* Sort buttons */
    'sort.name':'名前','sort.dateAdded':'登録日','sort.age':'年齢','sort.size':'サイズ','sort.height':'身長','sort.cup':'カップ',
    /* Date & time */
    'ui.today':'今日',
    'date.sun':'日','date.mon':'月','date.tue':'火','date.wed':'水','date.thu':'木','date.fri':'金','date.sat':'土',
    'date.jan':'1月','date.feb':'2月','date.mar':'3月','date.apr':'4月','date.may':'5月','date.jun':'6月',
    'date.jul':'7月','date.aug':'8月','date.sep':'9月','date.oct':'10月','date.nov':'11月','date.dec':'12月',
    /* Availability counts */
    'ui.girlsAvailNow':'現在{n}人出勤中','ui.girlsAvailToday':'本日{n}人出勤',
    /* Empty states */
    'ui.noGirlsWeek':'今週の出勤予定はありません','ui.noGirlsDate':'この日の出勤予定はありません',
    /* Value table */
    'table.rates':'料金','table.priceRange':'料金範囲',
    /* Filter pane */
    'fp.search':'検索','fp.country':'国籍','fp.age':'年齢','fp.bodySize':'体型',
    'fp.height':'身長 (cm)','fp.cupSize':'カップサイズ',
    'fp.rates30':'料金 30分','fp.rates45':'料金 45分','fp.rates60':'料金 60分',
    'fp.experience':'経験','fp.labels':'ラベル','fp.clearAll':'フィルターをすべて解除','fp.rangeSep':'〜',
    /* Calendar */
    'cal.profile':'女の子','cal.allWeek':'全日','cal.clear':'クリア',
    'cal.copyTimesTitle':'時間をコピー？','cal.setNewTime':'新しい時間を設定','cal.copyTimesBtn':'時間をコピー',
    'cal.copyDayTitle':'日程をコピー','cal.copyDaySub':'1日のシフトを他の日にコピー',
    'cal.sourceDay':'コピー元','cal.copyTo':'コピー先','cal.overwrite':'コピー先の既存データを上書き',
    'cal.copyDayBtn':'スケジュールをコピー','cal.bulkTimeSub':'複数日の出勤時間を設定',
    'cal.days':'日程','cal.startTime':'開始時間','cal.endTime':'終了時間','cal.apply':'適用','cal.all':'全て','cal.noScheduled':'本日は予定なし',
    /* Form */
    'ui.addGirl':'女の子を追加','form.addGirl':'新規プロフィール追加','form.editGirl':'プロフィール編集',
    'form.name':'名前','form.startDate':'開始日','form.photos':'写真',
    'form.cancel':'キャンセル','form.save':'保存','form.delete':'削除','form.confirmDelete':'削除確認',
    'form.expSelect':'経験を選択','exp.experienced':'経験あり','exp.inexperienced':'未経験',
    /* Analytics */
    'an.days':'日間','an.loading':'訪問者データを読み込み中...','an.uniqueVisitors':'ユニーク訪問者','an.sessions':'セッション','an.totalPageViews':'総ページビュー','an.totalProfileViews':'総プロフィールビュー',
    'an.topProfiles':'人気プロフィール','an.topHint':'（期間内最多閲覧）','an.uniqueCount':'{n}件ユニーク',
    'an.dailyVisitors':'日別訪問者','an.dailyHint':'（ヒット数 vs ユニーク数）','an.noLogs':'この期間の訪問者ログがありません',
    'an.legendHits':'ヒット数','an.legendUniques':'ユニーク数',
    'an.peakHours':'ピーク時間帯ヒートマップ','an.peakHint':'（AEDT、曜日×時間）','an.visitCount':'{n}回',
    'an.pageViews':'ページビュー','an.pvHint':'（合計 / ユニーク）','an.noPV':'ページビューの記録がありません',
    'an.mostProfiles':'最多閲覧プロフィール','an.pfHint':'（合計 / ユニーク）','an.noPF':'プロフィールビューの記録がありません',
    'an.browsers':'ブラウザ','an.os':'OS','an.devices':'デバイス',
    'an.languages':'言語','an.timezones':'タイムゾーン','an.referrers':'リファラー','an.noData':'データなし',
    'an.recentVisitors':'最近のユニーク訪問者','an.recentHint':'（直近20件、日別）',
    'an.tableDate':'日付','an.tableBrowser':'ブラウザ','an.tableOS':'OS','an.tableDevice':'デバイス','an.tableLang':'言語','an.tableTZ':'タイムゾーン',
    'an.export':'訪問者ログをエクスポート','an.refresh':'更新','an.exported':'ログをエクスポートしました',
  },
  ko: {
    'nav.home':'홈','nav.roster':'스케줄','nav.girls':'여자들','nav.favorites':'즐겨찾기',
    'nav.rates':'요금','nav.employment':'채용',
    'bnav.home':'홈','bnav.roster':'스케줄','bnav.girls':'탐색','bnav.favs':'즐겨찾기',
    'home.tagline':'시드니 최고의 경험',
    'home.announcement':'공지사항','home.newGirls':'신규',
    'home.location':'위치','home.hours':'영업시간',
    'page.roster':'스케줄','page.girls':'여자들','page.rates':'요금표',
    'page.employment':'채용정보','page.favorites':'즐겨찾기',
    'field.age':'나이','field.body':'체형','field.height':'키','field.cup':'컵',
    'field.rates30':'30분 요금','field.rates45':'45분 요금','field.rates60':'60분 요금',
    'field.experience':'경력','field.language':'언어','field.type':'타입',
    'field.description':'프로필','field.special':'특별 요청','field.labels':'태그',
    'avail.now':'출근 중','avail.today':'오늘 출근',
    'avail.coming':'출근 예정','avail.lastSeen':'마지막 출근',
    'ui.back':'뒤로','ui.share':'공유',
    'ui.addFav':'즐겨찾기 추가','ui.favorited':'즐겨찾기됨',
    'ui.edit':'편집','ui.delete':'삭제','ui.compare':'비교',
    'ui.linkCopied':'링크 복사됨!',
    'ui.alsoAvail':'오늘 출근 중',
    'ui.favEmpty':'즐겨찾기가 없습니다. 프로필의 하트를 탭하여 저장하세요.',
    'ui.noResults':'조건에 맞는 여자가 없습니다.',
    'ui.search':'이름으로 검색...',
    'filter.availNow':'출근 중','filter.availToday':'오늘 출근',
    'privacy.title':'개인정보 공지',
    'privacy.body':'방문자 추세 파악을 위해 익명 방문 데이터를 수집합니다. 개인정보는 수집하지 않으며 제3자에게 공유하지 않습니다.',
    'privacy.btn':'확인',
    'footer.rights':'긴자 엠파이어 \u00a9 2026 \u2014 모든 권리 보호',
    'footer.privacy':'이 사이트는 익명 분석을 사용하여 방문자 추세를 파악합니다. 개인정보는 수집하지 않으며 제3자에게 공유하지 않습니다.',
    'ui.backToTop':'맨 위로',
    'compare.selected':'개 선택됨',
    'compare.clear':'초기화','compare.open':'비교','compare.done':'닫기',
    'emp.contacts':'연락처',
    'nav.calendar':'캘린더','nav.analytics':'분석','nav.menu':'메뉴','ui.admin':'관리자',
    'sort.name':'이름','sort.dateAdded':'등록일','sort.age':'나이','sort.size':'사이즈','sort.height':'키','sort.cup':'컵',
    'ui.today':'오늘',
    'date.sun':'일','date.mon':'월','date.tue':'화','date.wed':'수','date.thu':'목','date.fri':'금','date.sat':'토',
    'date.jan':'1월','date.feb':'2월','date.mar':'3월','date.apr':'4월','date.may':'5월','date.jun':'6월',
    'date.jul':'7월','date.aug':'8월','date.sep':'9월','date.oct':'10월','date.nov':'11월','date.dec':'12월',
    'ui.girlsAvailNow':'현재 {n}명 출근 중','ui.girlsAvailToday':'오늘 {n}명 출근',
    'ui.noGirlsWeek':'이번 주 출근 예정이 없습니다','ui.noGirlsDate':'해당 날짜 출근 예정이 없습니다',
    'table.rates':'요금','table.priceRange':'요금 범위',
    'fp.search':'검색','fp.country':'국적','fp.age':'나이','fp.bodySize':'체형',
    'fp.height':'키 (cm)','fp.cupSize':'컵 사이즈',
    'fp.rates30':'30분 요금','fp.rates45':'45분 요금','fp.rates60':'60분 요금',
    'fp.experience':'경력','fp.labels':'태그','fp.clearAll':'모든 필터 초기화','fp.rangeSep':'~',
    'cal.profile':'여자들','cal.allWeek':'전체 주','cal.clear':'초기화',
    'cal.copyTimesTitle':'시간 복사?','cal.setNewTime':'새 시간 설정','cal.copyTimesBtn':'시간 복사',
    'cal.copyDayTitle':'일정 복사','cal.copyDaySub':'하루의 스케줄을 다른 날에 복사',
    'cal.sourceDay':'원본 날짜','cal.copyTo':'복사 대상','cal.overwrite':'대상 날짜의 기존 항목 덮어쓰기',
    'cal.copyDayBtn':'스케줄 복사','cal.bulkTimeSub':'여러 날의 출근 시간 설정',
    'cal.days':'날짜','cal.startTime':'시작 시간','cal.endTime':'종료 시간','cal.apply':'적용','cal.all':'전체','cal.noScheduled':'오늘 스케줄 없음',
    'ui.addGirl':'여자 추가','form.addGirl':'새 프로필 추가','form.editGirl':'프로필 편집',
    'form.name':'이름','form.startDate':'시작일','form.photos':'사진',
    'form.cancel':'취소','form.save':'저장','form.delete':'삭제','form.confirmDelete':'삭제 확인',
    'form.expSelect':'경력 선택','exp.experienced':'경력 있음','exp.inexperienced':'경력 없음',
    'an.days':'일','an.loading':'방문자 데이터 로딩 중...','an.uniqueVisitors':'고유 방문자','an.sessions':'세션','an.totalPageViews':'총 페이지뷰','an.totalProfileViews':'총 프로필 뷰',
    'an.topProfiles':'인기 프로필','an.topHint':'(이번 기간 최다 조회)','an.uniqueCount':'{n}건 고유',
    'an.dailyVisitors':'일별 방문자','an.dailyHint':'(조회수 vs 고유 방문자)','an.noLogs':'이 기간의 방문자 로그가 없습니다',
    'an.legendHits':'조회수','an.legendUniques':'고유 방문자',
    'an.peakHours':'피크 시간대 히트맵','an.peakHint':'(AEDT, 요일×시간)','an.visitCount':'{n}회',
    'an.pageViews':'페이지뷰','an.pvHint':'(합계 / 고유 방문자)','an.noPV':'페이지뷰 기록이 없습니다',
    'an.mostProfiles':'최다 조회 프로필','an.pfHint':'(합계 / 고유)','an.noPF':'프로필 뷰 기록이 없습니다',
    'an.browsers':'브라우저','an.os':'운영체제','an.devices':'기기',
    'an.languages':'언어','an.timezones':'시간대','an.referrers':'리퍼러','an.noData':'데이터 없음',
    'an.recentVisitors':'최근 고유 방문자','an.recentHint':'(최근 20건, 일별)',
    'an.tableDate':'날짜','an.tableBrowser':'브라우저','an.tableOS':'OS','an.tableDevice':'기기','an.tableLang':'언어','an.tableTZ':'시간대',
    'an.export':'방문자 로그 내보내기','an.refresh':'새로고침','an.exported':'로그 내보내기 완료',
  },
  zh: {
    'nav.home':'首页','nav.roster':'排班','nav.girls':'女孩','nav.favorites':'收藏',
    'nav.rates':'价格','nav.employment':'招聘',
    'bnav.home':'首页','bnav.roster':'排班','bnav.girls':'浏览','bnav.favs':'收藏',
    'home.tagline':'悉尼最高端的体验',
    'home.announcement':'公告','home.newGirls':'新人',
    'home.location':'地址','home.hours':'营业时间',
    'page.roster':'排班','page.girls':'女孩','page.rates':'价格表',
    'page.employment':'招聘信息','page.favorites':'收藏夹',
    'field.age':'年龄','field.body':'身材','field.height':'身高','field.cup':'罩杯',
    'field.rates30':'30分钟价格','field.rates45':'45分钟价格','field.rates60':'60分钟价格',
    'field.experience':'经验','field.language':'语言','field.type':'类型',
    'field.description':'简介','field.special':'特殊要求','field.labels':'标签',
    'avail.now':'出勤中','avail.today':'今日出勤',
    'avail.coming':'即将出勤','avail.lastSeen':'上次出勤',
    'ui.back':'返回','ui.share':'分享',
    'ui.addFav':'添加收藏','ui.favorited':'已收藏',
    'ui.edit':'编辑','ui.delete':'删除','ui.compare':'对比',
    'ui.linkCopied':'链接已复制！',
    'ui.alsoAvail':'今日出勤中',
    'ui.favEmpty':'暂无收藏。点击任意档案的心形图标保存。',
    'ui.noResults':'没有符合条件的女孩。',
    'ui.search':'按名字搜索...',
    'filter.availNow':'出勤中','filter.availToday':'今日出勤',
    'privacy.title':'隐私声明',
    'privacy.body':'我们收集匿名访问数据以了解访客趋势。不收集任何个人信息，也不与第三方共享。',
    'privacy.btn':'知道了',
    'footer.rights':'银座帝国 \u00a9 2026 \u2014 版权所有',
    'footer.privacy':'本网站使用匿名分析来了解访客趋势。不收集个人信息，也不与第三方共享。',
    'ui.backToTop':'返回顶部',
    'compare.selected':'个已选择',
    'compare.clear':'清除','compare.open':'对比','compare.done':'关闭',
    'emp.contacts':'联系方式',
    'nav.calendar':'日历','nav.analytics':'分析','nav.menu':'菜单','ui.admin':'管理员',
    'sort.name':'姓名','sort.dateAdded':'添加日期','sort.age':'年龄','sort.size':'尺码','sort.height':'身高','sort.cup':'罩杯',
    'ui.today':'今天',
    'date.sun':'日','date.mon':'一','date.tue':'二','date.wed':'三','date.thu':'四','date.fri':'五','date.sat':'六',
    'date.jan':'1月','date.feb':'2月','date.mar':'3月','date.apr':'4月','date.may':'5月','date.jun':'6月',
    'date.jul':'7月','date.aug':'8月','date.sep':'9月','date.oct':'10月','date.nov':'11月','date.dec':'12月',
    'ui.girlsAvailNow':'现有{n}位出勤中','ui.girlsAvailToday':'今日{n}位出勤',
    'ui.noGirlsWeek':'本周无出勤安排','ui.noGirlsDate':'该日期无出勤安排',
    'table.rates':'价格','table.priceRange':'价格范围',
    'fp.search':'搜索','fp.country':'国籍','fp.age':'年龄','fp.bodySize':'身材',
    'fp.height':'身高(cm)','fp.cupSize':'罩杯尺码',
    'fp.rates30':'30分钟价格','fp.rates45':'45分钟价格','fp.rates60':'60分钟价格',
    'fp.experience':'经验','fp.labels':'标签','fp.clearAll':'清除所有筛选','fp.rangeSep':'至',
    'cal.profile':'女孩','cal.allWeek':'全周','cal.clear':'清除',
    'cal.copyTimesTitle':'复制时间？','cal.setNewTime':'设置新时间','cal.copyTimesBtn':'复制时间',
    'cal.copyDayTitle':'复制日程','cal.copyDaySub':'将某天的排班复制到其他天',
    'cal.sourceDay':'源日期','cal.copyTo':'复制到','cal.overwrite':'覆盖目标日期现有记录',
    'cal.copyDayBtn':'复制日程','cal.bulkTimeSub':'设置多天出勤时间',
    'cal.days':'日期','cal.startTime':'开始时间','cal.endTime':'结束时间','cal.apply':'应用','cal.all':'全部','cal.noScheduled':'今日无排班',
    'ui.addGirl':'添加女孩','form.addGirl':'添加新档案','form.editGirl':'编辑档案',
    'form.name':'姓名','form.startDate':'开始日期','form.photos':'照片',
    'form.cancel':'取消','form.save':'保存','form.delete':'删除','form.confirmDelete':'确认删除',
    'form.expSelect':'选择经验','exp.experienced':'有经验','exp.inexperienced':'无经验',
    'an.days':'天','an.loading':'正在加载访客数据...','an.uniqueVisitors':'独立访客','an.sessions':'会话','an.totalPageViews':'总页面浏览量','an.totalProfileViews':'总档案浏览量',
    'an.topProfiles':'热门档案','an.topHint':'（本期最多浏览）','an.uniqueCount':'{n}个独立',
    'an.dailyVisitors':'每日访客','an.dailyHint':'（点击数 vs 独立访客）','an.noLogs':'本期无访客日志',
    'an.legendHits':'点击数','an.legendUniques':'独立数',
    'an.peakHours':'高峰时段热力图','an.peakHint':'（AEDT，星期×小时）','an.visitCount':'{n}次访问',
    'an.pageViews':'页面浏览量','an.pvHint':'（合计 / 独立访客）','an.noPV':'暂无页面浏览记录',
    'an.mostProfiles':'最多浏览档案','an.pfHint':'（合计 / 独立）','an.noPF':'暂无档案浏览记录',
    'an.browsers':'浏览器','an.os':'操作系统','an.devices':'设备',
    'an.languages':'语言','an.timezones':'时区','an.referrers':'来源','an.noData':'暂无数据',
    'an.recentVisitors':'近期独立访客','an.recentHint':'（最近20条，按日）',
    'an.tableDate':'日期','an.tableBrowser':'浏览器','an.tableOS':'操作系统','an.tableDevice':'设备','an.tableLang':'语言','an.tableTZ':'时区',
    'an.export':'导出访客日志','an.refresh':'刷新','an.exported':'访客日志已导出',
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
  var wrap = document.getElementById('langSelectWrap');
  if (wrap) wrap.classList.remove('open');
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
  if (typeof renderPageContent === 'function') { renderPageContent('home'); renderPageContent('rates'); renderPageContent('employment'); }
  if (typeof renderValueTable === 'function') renderValueTable();
  if (typeof renderFilterPane === 'function') {
    renderFilterPane('girlsFilterPane');renderFilterPane('rosterFilterPane');
    renderFilterPane('calFilterPane');renderFilterPane('profileFilterPane');
  }
  const _calP=document.getElementById('calendarPage');
  if (_calP&&_calP.classList.contains('active')&&typeof renderCalendar==='function') renderCalendar();
  const _anP=document.getElementById('analyticsPage');
  if (_anP&&_anP.classList.contains('active')&&typeof renderAnalytics==='function') renderAnalytics();
}

/* Auto-translate EN content via MyMemory (free, no key) */
const _atCache = new Map();
const _atLangPairs = {ja:'en|ja', ko:'en|ko', zh:'en|zh-CN'};
async function autoTranslate(text) {
  const tl = siteLanguage;
  const pair = _atLangPairs[tl];
  if (!text || !text.trim() || !pair) return text || '';
  const k = tl + ':' + text.trim();
  if (_atCache.has(k)) return _atCache.get(k);
  try {
    const r = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text.trim().slice(0, 500)) + '&langpair=' + pair);
    const d = await r.json();
    const result = (d.responseStatus === 200 && d.responseData && d.responseData.translatedText) ? d.responseData.translatedText : text;
    _atCache.set(k, result);
    return result;
  } catch (e) { _atCache.set(k, text); return text; }
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
  /* Bilingual lang-section elements — KO/ZH fall back to lang-en */
  var knownLangs = ['en', 'ja'];
  document.querySelectorAll('.lang-section').forEach(function(el) {
    var match = el.classList.contains('lang-' + siteLanguage);
    var fallback = !knownLangs.includes(siteLanguage) && el.classList.contains('lang-en');
    el.style.display = (match || fallback) ? '' : 'none';
  });
  /* Lang selector button label + active state */
  var labels = {en:'EN', ja:'JP', ko:'KO', zh:'ZH'};
  var btn = document.getElementById('langToggleBtn');
  if (btn) btn.textContent = labels[siteLanguage] || 'EN';
  document.querySelectorAll('.lang-select-drop button[data-lang]').forEach(function(b) {
    b.classList.toggle('active', b.dataset.lang === siteLanguage);
  });
  /* HTML lang attribute */
  var htmlLangs = {en:'en', ja:'ja', ko:'ko', zh:'zh-CN'};
  document.documentElement.lang = htmlLangs[siteLanguage] || 'en';
}

document.addEventListener('DOMContentLoaded', function() {
  var wrap = document.getElementById('langSelectWrap');
  var btn = document.getElementById('langToggleBtn');
  if (btn && wrap) {
    btn.addEventListener('click', function(e) { e.stopPropagation(); wrap.classList.toggle('open'); });
    document.addEventListener('click', function() { wrap.classList.remove('open'); });
  }
});
