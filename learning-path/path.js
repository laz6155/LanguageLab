(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const copy = {
    tr: {
      navTeacher: 'Eğitmen Platformu', navStudent: 'Öğrenci Paneli', navPrivate: 'Özel Dersler',
      eyebrow: 'ULUSLARARASI ÖĞRENME & ÖĞRETME REHBERİ',
      heroTitle: 'Ne yapacağını bil.<br><span>Doğru sırayla ilerle.</span>',
      heroText: 'Dil öğrenimi, ders hazırlama ve kurumsal eğitim yönetimi için anlaşılır, adım adım yol haritaları. CEFR seviyelerini ortak referans olarak kullan; yerel müfredatını ayrıca değerlendir.',
      heroAction: 'Kendi yolunu seç ↘', diagram1:'Hedefini belirle', diagram2:'Adım adım uygula', diagram3:'Gelişimini kontrol et',
      pathKicker:'SENİN ROLÜN NEDİR?', pathTitle:'Bir hedef seç.<br><span>Yol haritanı gör.</span>',
      pathInfo:'Bir eğitimci, öğrenci veya kurum olarak ihtiyacına göre ilerle. Burada işaretlediğin adımlar yalnızca bu tarayıcıda saklanır.',
      student:'Öğrenciyim',teacher:'Eğitmenim',school:'Kurum / Okul', progress:'TAMAMLANDI',
      clear:'Bu cihazdaki işaretleri sıfırla', saved:'İşaretler yalnızca tarayıcına kaydedilir; öğrenci veya öğretmen hesabına aktarılmaz.',
      doTitle:'Yapılacaklar',dontTitle:'Kaçınılacaklar',cefrNote:'Ortak Avrupa Dil Referans Çerçevesi (CEFR) seviye belirlemek için yol gösterir; tek başına sertifika veya resmi akreditasyon anlamına gelmez.',
      quickKicker:'DOĞRUDAN BAŞLA',quickTitle:'Yol haritasından<br><span>uygulamaya geç.</span>',
      teacherTools:'Ders, sınıf, ödev ve etkinlik araçları',studentTools:'Sınıf koduyla katılım, ders ve ödevler',privateTools:'Birebir online İngilizce ders başvurusu',foot:'Dil eğitimi, konuşma pratiği ve eğitimci araçları aynı akademide.',back:'Ana sayfaya dön ↗',open:'İlgili sayfayı aç →',
      roles: {
        student: {eyebrow:'ÖĞRENEN YOLCULUĞU',title:'Kendi öğrenme yolunu oluştur.',intro:'Öğretmenin verdiği sınıf kodundan gerçek konuşma pratiğine kadar altı net adım.',do:['A1–C2 seviyeni ve öğrenme hedefini ayrı ayrı belirle.','Sınıf kodunu yalnızca öğretmeninden al; bağlantıyı kontrol et.','Ödevleri düzenli yap, anlamadığın noktalar için geri bildirim iste.'],dont:['Sadece seviye etiketine göre kurs seçme.','Başkalarının sınıf kodlarını veya kişisel bilgilerini paylaşma.','Bir dersle sonuç bekleme; tekrar ve pratik olmadan ilerleme sınırlıdır.'],steps:[
          ['Hedefini ve seviyeni belirle','Konuşma, iş hayatı, sınav veya günlük iletişim hedefini yaz. CEFR seviyeni bir başlangıç göstergesi olarak ele al.','Programları gör','../#programs'],
          ['Bir öğrenme yolu seç','Grup programını, birebir İngilizce özel dersi veya konuşma buluşmalarını ihtiyacına göre karşılaştır.','Özel dersleri incele','../ozel-dersler/'],
          ['Öğretmenin sınıfına katıl','Öğretmeninden aldığın sınıf kodunu gir; adınla sınıfa katıl. Bu ekranda e-posta hesabı şart değildir.','Öğrenci panelini aç','../join/'],
          ['Ders akışına katıl','Canlı etkinlikte öğretmenin yönlendirdiği aşamaları takip et; soruları yanıtla ve yardım iste.','Sınıfa git','../join/'],
          ['Ödevini tamamla','Atanan çalışmaları tamamla, son teslim tarihini kontrol et ve mümkün olduğunda geri bildirimden yararlan.','Ödevlerini gör','../join/'],
          ['İlerlemeni gözden geçir','Ders ve ödev geçmişine bak. Konuşma pratiğini düzenli buluşmalarla destekle.','Speaking Club','../#speaking-club']
        ]},
        teacher: {eyebrow:'EĞİTMEN YOLCULUĞU',title:'Dersi baştan sona yönet.',intro:'Hesaptan sınıf yönetimine, ders tasarımından ilerleme takibine uzanan öğretmen akışı.',do:['Dersi yaş, seviye, hedef ve ders süresine göre oluştur.','CEFR ve gerektiğinde ilgili ulusal müfredatı karşılaştır.','Etkinlik sonunda geri bildirim ve gelişim kaydı bırak.'],dont:['Her yaş grubuna aynı soru seviyesini sunma.','Öğrenci verisini veya katılım kodlarını kamuya açık paylaşma.','Oyunları pedagojik hedef olmadan arka arkaya kullanma.'],steps:[
          ['Öğretmen hesabına gir','Eğitmen platformunda hesabını aç veya mevcut hesabınla giriş yap. Giriş sırasında e-postanı doğrula.','Eğitmen platformu','../educators/'],
          ['Sınıf ve öğrenci profili oluştur','Yaş aralığı, CEFR seviyesi, öğrenci sayısı ve hedef beceriyi tanımla. Birebir öğrencilerini de düzenleyebilirsin.','Sınıflar','../educators/#teacherApp'],
          ['Dersi bir hedefe göre planla','İhtiyaçlarına uygun konu ve etkinlik seç; konuşma, kelime, gramer ve üretim aşamalarını dengele.','Ders tasarımı','../educators/#teacherApp'],
          ['Öğrenciyi derse davet et','Sınıfın oluşturduğu kodu öğrencilerle özel olarak paylaş; derse katılımı kontrol et.','Öğrenci katılımı','../join/'],
          ['Canlı dersi ve oyunları yönet','Aşamaları sırayla aç; soru, oyun ve görevleri seviyeye göre uygula. Çalışmayı geri bildirimle bitir.','Etkinlikleri aç','../educators/#teacherApp'],
          ['Ödev ver, sonucu değerlendir','Ders sonrası ödev hazırla, gelen çalışmaları ve sınıf ilerlemesini gözden geçir. Gelecek dersi buna göre düzenle.','Öğretmen paneli','../educators/']
        ]},
        school: {eyebrow:'KURUM YOLCULUĞU',title:'Ekip, sınıf ve kaynakları düzenle.',intro:'Uluslararası kullanılabilecek esnek bir iş akışı; ülkelerin kendi resmi müfredatları ayrı değerlendirilir.',do:['Eğitmen rollerini ve öğrenci veri erişimini netleştir.','CEFR’ı ortak dil hedefi için kullan, yerel müfredatı ayrıca eşleştir.','Önce küçük bir sınıfla pilot uygulama yap ve ölç.'],dont:['Öğretmen hesaplarını ortak şifreyle kullandırma.','Davet kodlarını herkesin görebileceği ortamlarda yayınlama.','CEFR veya platform içi değerlendirmeyi resmi akreditasyon yerine sunma.'],steps:[
          ['Eğitim hedeflerini tanımla','Okul, kurs veya takımın hangi yaş, dil, hedef ve sınıf türlerine odaklanacağını belirle.','Platforma git','../educators/'],
          ['Eğitimci ekibini oluştur','Okul çalışma alanını ve ekip katılımını yönet; erişim yetkilerinin uygunluğunu kontrol et.','Ekip alanı','../educators/'],
          ['Seviye ve müfredat yolunu belirle','Küresel CEFR seviyelerini ortak gösterge al; Türkiye’de MEB/TYMM veya diğer ülkelerde yerel çerçevelerle eşleştir.','Yol haritası','../#method'],
          ['Paylaşılan ders havuzu oluştur','Hazırlanan planları ekip içinde paylaş; aynı materyalleri yaş ve seviyeye göre uyarlamaya özen göster.','Materyaller','../educators/'],
          ['Sınıf bazında pilot dene','Bir öğretmen ve sınıfla canlı etkinlik, öğrenci katılımı ve ödev akışını test ederek ilerle.','Öğrenci girişi','../join/'],
          ['Verilerle değerlendirme yap','Ödev tamamlama, katılım ve geri bildirimleri izleyerek geliştirme ihtiyaçlarını belirle.','Raporlar','../educators/']
        ]}
      }
    },
    en: {
      navTeacher:'Educator platform',navStudent:'Student classroom',navPrivate:'Private lessons',
      eyebrow:'GLOBAL LEARNING & TEACHING GUIDE',heroTitle:'Know what to do.<br><span>Move forward with purpose.</span>',
      heroText:'Clear, step-by-step pathways for language learning, teaching and school teams. Use CEFR as a shared reference, then align with local curriculum requirements.',heroAction:'Choose your pathway ↘',diagram1:'Define your goal',diagram2:'Follow clear steps',diagram3:'Review your progress',
      pathKicker:'WHAT IS YOUR ROLE?',pathTitle:'Choose your direction.<br><span>See the steps.</span>',pathInfo:'Follow a pathway for learners, teachers or institutions. Any steps you check are saved only on this device.',student:'I am a student',teacher:'I am an educator',school:'School / Institution',progress:'COMPLETE',clear:'Reset steps on this device',saved:'Checklist status is stored only in this browser, not in your school or teacher account.',doTitle:'Recommended actions',dontTitle:'Things to avoid',cefrNote:'The Common European Framework of Reference (CEFR) can help describe language levels. It does not by itself provide official certification or accreditation.',quickKicker:'LAUNCH WORKSPACE',quickTitle:'From guidance<br><span>to practical tools.</span>',teacherTools:'Lessons, classes, assignments and activities',studentTools:'Join class by code and access lessons and tasks',privateTools:'Apply for one-to-one online English lessons',foot:'Language learning, conversation practice and educator tools under one academy.',back:'Back to homepage ↗',open:'Open page →',
      roles: {
        student:{eyebrow:'LEARNER JOURNEY',title:'Build your personal learning path.',intro:'Six clear steps from receiving a class code to growing your speaking confidence.',do:['Define both your language level and practical goals.','Get your class code directly from your teacher.','Complete homework regularly and ask for feedback.'],dont:['Choose solely based on a level badge.','Share private class codes or classmates’ details publicly.','Expect progress without consistent practice.'],steps:[
          ['Find your level and goal','Set a communication, professional or examination goal. Treat CEFR as a useful starting reference.','Explore programs','../#programs'],
          ['Choose your learning format','Compare group courses, one-to-one English lessons and speaking meetups.','Private lessons','../ozel-dersler/'],
          ['Join your teacher’s class','Enter the code from your teacher and your display name. No student email account is required for this join screen.','Student classroom','../join/'],
          ['Participate in each lesson','Follow the live stages, respond to questions and request help whenever needed.','Open classroom','../join/'],
          ['Complete your assignments','Check due dates, submit work and use teacher feedback when it is available.','See assignments','../join/'],
          ['Review and keep practising','Review completed lessons and assignments. Keep speaking through regular meetups.','Speaking Club','../#speaking-club']
        ]},
        teacher:{eyebrow:'TEACHING JOURNEY',title:'Run every stage of teaching.',intro:'A clear flow from teacher login and planning to classroom delivery and progress checks.',do:['Adapt activities to age, language level and lesson goals.','Use CEFR alongside any required local curriculum.','Collect feedback after activities and adjust the next lesson.'],dont:['Give identical prompts to every age or ability group.','Post class codes or personal student information publicly.','Use games without a clear learning outcome.'],steps:[
          ['Access your educator account','Sign in to the educator platform or create an account. Confirm email when required.','Educator workspace','../educators/'],
          ['Create a class and learner profile','Set age range, CEFR level, class size and learning goals. Organize private students as needed.','Manage classes','../educators/#teacherApp'],
          ['Plan a purposeful lesson','Select goals and activities; balance speaking, vocabulary, grammar and output.','Plan lesson','../educators/#teacherApp'],
          ['Invite students securely','Share generated class codes privately and verify participation.','Student access','../join/'],
          ['Run live activities and games','Progress through stages, present age-appropriate prompts and end with useful feedback.','Open activities','../educators/#teacherApp'],
          ['Assign work and check outcomes','Set assignments, review results and adapt the next lesson accordingly.','Teacher platform','../educators/']
        ]},
        school:{eyebrow:'INSTITUTION JOURNEY',title:'Coordinate your team and resources.',intro:'A flexible global workflow, with national curriculum requirements assessed separately.',do:['Define teaching roles and permitted student data access.','Use CEFR as a language reference, then map local curriculum.','Pilot with a small class and measure outcomes.'],dont:['Share logins across educators.','Publish invitation codes to unrestricted channels.','Treat CEFR or internal assessment as formal accreditation.'],steps:[
          ['Set the learning goals','Determine the languages, levels, age groups and class formats your institution will support.','Educator platform','../educators/'],
          ['Organize the educator team','Configure your school workspace and team membership; review account permissions.','School workspace','../educators/'],
          ['Select levels and curriculum','Map CEFR learning aims to local frameworks, such as MEB/TYMM in Türkiye where relevant.','Learning approach','../#method'],
          ['Share reusable lesson resources','Build an internal library of lesson plans and adapt materials by level and student group.','Teaching resources','../educators/'],
          ['Pilot the classroom workflow','Test with one teacher and class: live activity, student join and assignments.','Student join','../join/'],
          ['Measure and improve','Review attendance, assignment progress and feedback before expanding.','Reports','../educators/']
        ]}
      }
    }
  };
  let lang='tr';let role='student';
  try{if(localStorage.getItem('languagelab-language')==='en')lang='en';}catch(_){}
  const params=new URLSearchParams(location.search);
  if(['teacher','student','school'].includes(params.get('role')))role=params.get('role');
  function getProgress(){try{return JSON.parse(localStorage.getItem('languagelab-path-'+role)||'[]')}catch{return []}}
  function setProgress(array){try{localStorage.setItem('languagelab-path-'+role,JSON.stringify(array))}catch(_){}}
  function setStatic(){document.documentElement.lang=lang;const c=copy[lang];$$('[data-i18n]').forEach(el=>{const v=c[el.dataset.i18n];if(typeof v==='string')el.textContent=v});$$('[data-i18n-html]').forEach(el=>{const v=c[el.dataset.i18nHtml];if(typeof v==='string')el.innerHTML=v});$$('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===lang)));document.title=lang==='tr'?'Yol Haritası | LanguageLab Akademi':'Learning Roadmap | LanguageLab Academy';}
  function updateRing(count,total){const n=Math.round((count/total)*100);$('#progress-percent').textContent=n+'%';$('.progress-ring').style.background=`conic-gradient(var(--red) 0% ${n}%,#e9edf4 ${n}% 100%)`;}
  function render(){const c=copy[lang],data=c.roles[role];$$('[data-role]').forEach(b=>{const active=b.dataset.role===role;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});$('#role-panel').setAttribute('aria-labelledby','tab-'+role);$('#role-overline').textContent=data.eyebrow;$('#role-heading').textContent=data.title;$('#role-intro').textContent=data.intro;
    for(const [sel,arr] of [['#do-list',data.do],['#dont-list',data.dont]]){const parent=$(sel);parent.replaceChildren(...arr.map(t=>{const li=document.createElement('li');li.textContent=t;return li}))}
    const checked=new Set(getProgress().filter(x=>Number.isInteger(x)&&x>=0&&x<data.steps.length));const cards=data.steps.map((s,i)=>{const item=document.createElement('article');item.className='step-card'+(checked.has(i)?' done':'');const input=document.createElement('input');input.type='checkbox';input.checked=checked.has(i);input.id='path-step-'+i;input.setAttribute('aria-label',s[0]);const contents=document.createElement('div');contents.className='step-copy';const heading=document.createElement('div');heading.className='step-topline';const number=document.createElement('span');number.className='step-num';number.textContent=String(i+1).padStart(2,'0')+' / 06';const anchor=document.createElement('a');anchor.textContent=s[2]+' ↗';anchor.href=s[3];heading.append(number,anchor);const title=document.createElement('h4');title.textContent=s[0];const desc=document.createElement('p');desc.textContent=s[1];contents.append(heading,title,desc);item.append(input,contents);input.addEventListener('change',()=>{if(input.checked)checked.add(i);else checked.delete(i);setProgress([...checked].sort((a,b)=>a-b));item.classList.toggle('done',input.checked);updateRing(checked.size,data.steps.length)});return item});$('#step-list').replaceChildren(...cards);updateRing(checked.size,data.steps.length);
  }
  $$('[data-role]').forEach(button=>button.addEventListener('click',()=>{role=button.dataset.role;history.replaceState(null,'',location.pathname+'?role='+role);render()}));
  $$('[data-language]').forEach(button=>button.addEventListener('click',()=>{lang=button.dataset.language;try{localStorage.setItem('languagelab-language',lang)}catch(_){}setStatic();render()}));
  $('#clear-progress').addEventListener('click',()=>{setProgress([]);render()});
  $('.role-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const roles=['student','teacher','school'];let n=roles.indexOf(role);if(e.key==='Home')n=0;else if(e.key==='End')n=2;else if(e.key==='ArrowRight')n=(n+1)%3;else n=(n+2)%3;role=roles[n];history.replaceState(null,'',location.pathname+'?role='+role);render();$('#tab-'+role).focus()});
  setStatic();render();
})();