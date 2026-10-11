/* LanguageLab Akademi | learner portal and manager console.
   Authentication and authorization are enforced by Supabase Auth + Postgres RLS.
   Never derive access from a UI role selector or browser storage. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const LANGUAGE_KEY = 'languagelab-language';
  const TR = {
    navPath:'Yol haritası',navTeacher:'Eğitimci platformu',logout:'Çıkış',introTag:'LANGUAGELAB ÖĞRENME PLATFORMU',introTitle:'Derslerini keşfet.\nGelişimini gör.',introLead:'Öğrenme planın, derslerin ve ilerlemen tek yerde. Eğitimciler için sınıf araçları da burada başlıyor.',discover:'Programları keşfet →',privateLink:'Özel dersleri incele',memberTag:'ÖĞRENCİ VE EĞİTİMCİ HESAPLARI',authHeading:'Hesabınla devam et.',authDescription:'Ders ilerlemen, kişisel hedeflerin ve kayıt taleplerin güvenli hesabında tutulur. Daha önce eğitimci hesabı oluşturduysan aynı bilgilerle giriş yapabilirsin.',authBenefit1:'✓ Kaydedilen ders ilerlemesi',authBenefit2:'✓ Kişisel çalışma listesi',authBenefit3:'✓ Kurs başvurularını takip etme',signIn:'Giriş yap',signUp:'Hesap oluştur',email:'E-posta',password:'Şifre',reset:'Şifremi unuttum',authLegal:'Üyelik ücretli bir programa otomatik kayıt veya ödeme anlamına gelmez.',workspaceTag:'SENİN ALANIN',workspaceTitle:'Öğrenme panelim',signedIn:'Hesap bağlı',dashboard:'Genel bakış',myCourses:'Derslerim',myTasks:'Hedef ve görevler',calendar:'Takvim',profile:'Profilim',admin:'Akademi yönetimi',teacherStudio:'Eğitimci çalışma alanı ↗',joinClass:'Sınıf koduyla katıl ↗',overviewTitle:'Bugünkü öğrenme planın',latestCourses:'Programların',announcements:'Duyurular',taskHeading:'Küçük adımlar, düzenli gelişim',taskIntro:'Kendi çalışma görevlerini ekle; tamamladıkların hesabında saklanır.',taskTitle:'Yapılacak iş',dateOptional:'Tarih (isteğe bağlı)',add:'Ekle',sessionsDesc:'Kayıtlı olduğun programlar için planlanan dersler burada görünür. Toplantı bağlantılarını yalnızca ilgili katılımcılar görür.',fullName:'Ad soyad',level:'Seviye',undecided:'Henüz emin değilim',goal:'Öğrenme hedefim',save:'Kaydet',adminProtected:'Yetkili hesap',adminIntro:'Programları, kayıt taleplerini ve ders içeriklerini buradan yönet. Değişiklikler veritabanına kaydedilir.',requests:'Kayıt talepleri',manageCourses:'Kurs yönetimi',courseContent:'Ders içerikleri',communications:'Duyuru & takvim',courseStatus:'Yayın durumu',courseTr:'Başlık (TR)',courseEn:'Başlık (EN)',format:'Format',category:'Kategori',joinMode:'Katılım modeli',descriptionTr:'Açıklama (TR)',descriptionEn:'Açıklama (EN)',saveCourse:'Programı kaydet',newCourse:'Yeni program',pickCourse:'Düzenlenecek program',moduleTitleTr:'Modül adı (TR)',moduleTitleEn:'Modül adı (EN)',publish:'Yayınla',addModule:'Modül ekle',pickModule:'Ders eklenecek modül',lessonTitleTr:'Ders adı (TR)',lessonTitleEn:'Ders adı (EN)',minutes:'Dakika',lessonBodyTr:'İçerik (TR)',lessonBodyEn:'İçerik (EN)',addLesson:'Ders ekle',newAnnouncement:'Yeni duyuru',audience:'Hedef program (tümü için boş bırak)',addAnnouncement:'Duyuru yayımla',newSession:'Yeni ders oturumu',sessionTime:'Başlangıç tarihi ve saati',location:'Yer / bağlantı bilgisi',meetingUrl:'Özel toplantı URL (yalnızca kayıtlı üyeler)',scheduleSession:'Dersi takvime ekle',catalogTag:'PROGRAM KATALOĞU',catalogTitle:'Sana uygun yolu seç.',catalogDesc:'Açık programlara kayıt talebi gönderebilir, bekleme listesine katılabilir veya ücretsiz başlangıç içeriğiyle hemen başlayabilirsin.',searchLabel:'Ara',allLevels:'Tüm seviyeler',notSure:'NEREDEN BAŞLAYACAĞINI BİLMİYOR MUSUN?',roadmapTitle:'Adım adım ilerle.',roadmapDesc:'Öğrenci, öğretmen veya kurum olabilirsin: her rol için neyi ne zaman yapacağını gösteren bir yol haritamız var.',roadmapCta:'Yol haritasına git ↗',
    emptyCourses:'Henüz program bulunmuyor.',nothingEnrolled:'Henüz bir programa katılmadın. Aşağıdaki katalogdan başlayabilirsin.',nothingTasks:'Henüz görev eklemedin.',nothingAnnouncements:'Şu anda duyuru yok.',nothingSessions:'Henüz planlanmış ders bulunmuyor.',nothingRequests:'Kayıt talebi bulunmuyor.',waiting:'Yükleniyor…',needLogin:'Bu işlem için hesabına giriş yapmalısın.',signupSent:'Kayıt isteği gönderildi. E-posta onayı gerekiyorsa gelen kutunu kontrol et.',resetSent:'Şifre yenileme e-postası gönderildi. Lütfen gelen kutunu kontrol et.',saved:'Değişiklikler kaydedildi.',missingConfig:'Bağlantı yapılandırması bulunamadı. Lütfen yöneticiyle iletişime geç.',loadError:'İçerik yüklenemedi. Biraz sonra yeniden dene.',actionFailed:'İşlem tamamlanamadı. Lütfen tekrar dene.',enrollmentSaved:'Kayıt talebin alındı.',enrollmentActive:'Programa katıldın. İlk dersini açabilirsin.',alreadyActive:'Derslerime git',request:'Katılım talebi gönder',freeJoin:'Ücretsiz başla',pending:'Onay bekliyor',active:'Kayıtlı',rejected:'Başvuru sonuçlandı',completed:'Tamamlandı',open:'Açık',waitlist:'Ön talep',draft:'Taslak',archived:'Arşiv',status:'Durum',lessonsDone:'Tamamlanan ders',courseCount:'Kayıtlı program',todoCount:'Açık görev',progressSummary:'ders tamamlandı',openCourse:'Programı aç',moduleEmpty:'Bu program için yayımlanan içerik henüz bulunmuyor.',startLesson:'Dersi aç',markDone:'Tamamladım ✓',markUndone:'Tamamlandı işaretini kaldır',noAccess:'Ders içeriğini görmek için katılım onayı gerekiyor.',back:'← Ders listesine dön',lessonTime:'dk',notFound:'Sonuç bulunamadı.',owner:'Yönetici',manager:'Yönetici',educator:'Eğitimci',learner:'Öğrenci',approve:'Onayla',reject:'Reddet',activate:'Etkinleştir',edit:'Düzenle',cancel:'İptal',delete:'Sil',confirmDelete:'Bu kaydı silmek istiyor musun?',confirmReject:'Bu başvuruyu reddetmek istiyor musun?',noAdmin:'Bu işlem için yönetici izni gerekli.',createCourse:'Yeni kurs oluşturuldu.',managerCourses:'Toplam program',managerPending:'Bekleyen başvuru',managerActive:'Aktif kayıt',dateLabel:'Tarih',joinMeeting:'Toplantıya katıl ↗',done:'Bitti',todo:'Yapılacak',updated:'Güncellendi',selectCourseFirst:'Önce bir program seç.',selectModuleFirst:'Önce bir modül seç.',dangerSelfEnroll:'Bekleme listesindeki kurslar doğrudan katılıma açılamaz. Onay ile katılımı seç.',validation:'Lütfen zorunlu alanları doldur.',noLesson:'Bu modülde henüz ders yok.',securityNote:'Yetki veritabanı tarafından denetlenir.',mentorTools:'Ders planlama, sınıf yönetimi ve oyun araçlarını aç',duration:'Süre',formatSelf:'Kendi hızında',formatOnline:'Online',formatPerson:'Yüz yüze',formatHybrid:'Karma',progress:'İlerleme',levelAll:'Tüm seviyeler',saveProfile:'Profilin kaydedildi.',recoveryTag:'HESAP GÜVENLİĞİ',recoveryHeading:'Yeni şifreni belirle.',recoveryDescription:'E-postana gönderilen bağlantıyla hesabın için yeni bir şifre oluştur.',newPassword:'Yeni şifre',confirmPassword:'Yeni şifre (tekrar)',updatePassword:'Şifreyi güncelle',backToSignIn:'Giriş ekranına dön',passwordMismatch:'Şifreler eşleşmiyor.',passwordChanged:'Şifren güncellendi.',passwordExpired:'Yenileme bağlantısı geçersiz veya süresi dolmuş. Yeniden talep oluştur.',dueSoon:'Yaklaşan / geciken',overdue:'Gecikti',dueToday:'Bugün',cancelled:'İptal edildi',passwordTooShort:'En az 10 karakterli bir şifre oluştur.',authEmailRestricted:'Bu e-posta adresine doğrulama mesajı gönderilemiyor. Akademi yöneticisi e-posta gönderim servisini yapılandırmalıdır.',authRateLimited:'Çok fazla e-posta işlemi denendi. Biraz bekleyip tekrar dene.',authInvalid:'E-posta veya şifre hatalı.',authConfirm:'Hesabına giriş yapmadan önce e-postanı doğrulamalısın.',skillCheckTitle:'Beceri öz değerlendirmem',skillCheckDescription:'Bu bir resmi seviye testi değildir. Bugünkü algını kaydet, zaman içindeki değişimi gözlemle.',skillCheckSkill:'Beceri',skillCheckLevel:'Çalıştığın CEFR seviyesi',skillCheckConfidence:'Kendini ne kadar rahat hissediyorsun?',skillCheckNote:'Bugünkü deneyimin (isteğe bağlı)',skillCheckSave:'Değerlendirmemi kaydet',skillCheckEmpty:'Henüz bir öz değerlendirme kaydetmedin.',skillSpeaking:'Konuşma',skillListening:'Dinleme',skillReading:'Okuma',skillWriting:'Yazma',skillCheckSaved:'Beceri öz değerlendirmen kaydedildi.',skillCheckConfirmDelete:'Bu öz değerlendirmeyi silmek istiyor musun?',confidence1:'1 · Çok zorlanıyorum',confidence2:'2 · Zorlanıyorum',confidence3:'3 · Bazen rahatım',confidence4:'4 · Genelde rahatım',confidence5:'5 · Rahatım'
  };
  const EN = {
    navPath:'Learning roadmap',navTeacher:'Educator platform',logout:'Sign out',introTag:'LANGUAGELAB LEARNING PLATFORM',introTitle:'Explore courses.\nTrack your progress.',introLead:'Your learning plan, lessons, and progress in one place. Classroom tools for educators are also available.',discover:'Explore programs →',privateLink:'Discover private lessons',memberTag:'STUDENT & EDUCATOR ACCOUNTS',authHeading:'Continue with your account.',authDescription:'Your progress, goals and enrollment requests live in your secure account. If you already have an educator account, use the same credentials.',authBenefit1:'✓ Saved lesson progress',authBenefit2:'✓ Personal study tasks',authBenefit3:'✓ Enrollment request tracking',signIn:'Sign in',signUp:'Create account',email:'Email',password:'Password',reset:'Forgot password?',authLegal:'Creating an account does not enroll you in a paid program or charge you.',workspaceTag:'YOUR SPACE',workspaceTitle:'My learning dashboard',signedIn:'Account connected',dashboard:'Overview',myCourses:'My courses',myTasks:'Goals & tasks',calendar:'Calendar',profile:'My profile',admin:'Academy management',teacherStudio:'Educator workspace ↗',joinClass:'Join with class code ↗',overviewTitle:'Your learning plan',latestCourses:'Your programs',announcements:'Announcements',taskHeading:'Small steps, steady progress',taskIntro:'Add your own study tasks. Completed tasks are saved to your account.',taskTitle:'Task',dateOptional:'Date (optional)',add:'Add',sessionsDesc:'Scheduled classes for enrolled programs appear here. Meeting links are only available to approved participants.',fullName:'Full name',level:'Level',undecided:'Not sure yet',goal:'My learning goal',save:'Save',adminProtected:'Authorized account',adminIntro:'Manage programs, enrollment requests and lesson content. Changes are saved to the database.',requests:'Enrollment requests',manageCourses:'Manage courses',courseContent:'Lesson content',communications:'Announcements & calendar',courseStatus:'Publication status',courseTr:'Title (TR)',courseEn:'Title (EN)',format:'Format',category:'Category',joinMode:'Enrollment mode',descriptionTr:'Description (TR)',descriptionEn:'Description (EN)',saveCourse:'Save course',newCourse:'New course',pickCourse:'Course to edit',moduleTitleTr:'Module title (TR)',moduleTitleEn:'Module title (EN)',publish:'Publish',addModule:'Add module',pickModule:'Module for new lesson',lessonTitleTr:'Lesson title (TR)',lessonTitleEn:'Lesson title (EN)',minutes:'Minutes',lessonBodyTr:'Content (TR)',lessonBodyEn:'Content (EN)',addLesson:'Add lesson',newAnnouncement:'New announcement',audience:'Target course (leave blank for all)',addAnnouncement:'Publish announcement',newSession:'New class session',sessionTime:'Start date and time',location:'Location / details',meetingUrl:'Private meeting URL (enrolled students only)',scheduleSession:'Schedule session',catalogTag:'PROGRAM CATALOG',catalogTitle:'Find your learning path.',catalogDesc:'Request a place in open programs, join a waitlist, or begin with the free introductory lessons right away.',searchLabel:'Search',allLevels:'All levels',notSure:'NOT SURE WHERE TO BEGIN?',roadmapTitle:'Move forward, step by step.',roadmapDesc:'Student, educator or institution: find a role-based roadmap showing what to do and when.',roadmapCta:'Open learning roadmap ↗',
    emptyCourses:'There are no courses yet.',nothingEnrolled:'You have not joined a program yet. Start from the catalog below.',nothingTasks:'You have no study tasks yet.',nothingAnnouncements:'No announcements yet.',nothingSessions:'There are no scheduled classes yet.',nothingRequests:'No enrollment requests.',waiting:'Loading…',needLogin:'Please sign in to continue.',signupSent:'Registration submitted. Check your inbox if email confirmation is required.',resetSent:'A password reset email has been sent. Check your inbox.',saved:'Changes saved.',missingConfig:'Backend is not configured. Contact the administrator.',loadError:'Unable to load content. Please try again later.',actionFailed:'Unable to complete this action. Please try again.',enrollmentSaved:'Your enrollment request was received.',enrollmentActive:'You have joined this program. You can start learning now.',alreadyActive:'Go to my courses',request:'Request a place',freeJoin:'Start for free',pending:'Pending review',active:'Enrolled',rejected:'Application processed',completed:'Completed',open:'Open',waitlist:'Waitlist',draft:'Draft',archived:'Archived',status:'Status',lessonsDone:'Lessons completed',courseCount:'Enrolled programs',todoCount:'Open tasks',progressSummary:'lessons completed',openCourse:'Open course',moduleEmpty:'There is no published content for this course yet.',startLesson:'Open lesson',markDone:'Mark completed ✓',markUndone:'Mark as not completed',noAccess:'Your enrollment must be approved before accessing these lessons.',back:'← Back to my courses',lessonTime:'min',notFound:'No results found.',owner:'Manager',manager:'Manager',educator:'Educator',learner:'Learner',approve:'Approve',reject:'Reject',activate:'Activate',edit:'Edit',cancel:'Cancel',delete:'Delete',confirmDelete:'Do you want to delete this entry?',confirmReject:'Do you want to reject this enrollment?',noAdmin:'Administrator permission is required.',createCourse:'New course created.',managerCourses:'Total courses',managerPending:'Pending requests',managerActive:'Active enrollments',dateLabel:'Date',joinMeeting:'Open meeting ↗',done:'Completed',todo:'To do',updated:'Updated',selectCourseFirst:'Choose a course first.',selectModuleFirst:'Choose a module first.',dangerSelfEnroll:'A waitlisted course cannot be open for immediate enrollment. Choose approval.',validation:'Complete all required fields.',noLesson:'No lessons in this module yet.',securityNote:'Access is enforced by the database.',mentorTools:'Open lesson planning, classroom management and activity tools',duration:'Duration',formatSelf:'Self-paced',formatOnline:'Online',formatPerson:'In person',formatHybrid:'Hybrid',progress:'Progress',levelAll:'All levels',saveProfile:'Your profile was saved.',recoveryTag:'ACCOUNT SECURITY',recoveryHeading:'Choose a new password.',recoveryDescription:'Set a new password for your account using the link sent to your email.',newPassword:'New password',confirmPassword:'Confirm new password',updatePassword:'Update password',backToSignIn:'Back to sign in',passwordMismatch:'Passwords do not match.',passwordChanged:'Your password has been updated.',passwordExpired:'This recovery link is invalid or expired. Request a new one.',dueSoon:'Due soon / overdue',overdue:'Overdue',dueToday:'Today',cancelled:'Cancelled',passwordTooShort:'Use a password with at least 10 characters.',authEmailRestricted:'Confirmation emails cannot currently be sent to this address. The academy administrator must configure an email sending service.',authRateLimited:'Too many email requests. Please wait and try again.',authInvalid:'Incorrect email or password.',authConfirm:'Please confirm your email before signing in.',skillCheckTitle:'My skill self-checks',skillCheckDescription:'This is not a certified proficiency test. Record how confident you feel today and observe changes over time.',skillCheckSkill:'Skill',skillCheckLevel:'CEFR level you practised',skillCheckConfidence:'How confident did you feel?',skillCheckNote:'What did you notice? (optional)',skillCheckSave:'Save my self-check',skillCheckEmpty:'No self-checks yet.',skillSpeaking:'Speaking',skillListening:'Listening',skillReading:'Reading',skillWriting:'Writing',skillCheckSaved:'Your self-check has been saved.',skillCheckConfirmDelete:'Delete this self-check?',confidence1:'1 · Very difficult',confidence2:'2 · Difficult',confidence3:'3 · Sometimes comfortable',confidence4:'4 · Usually comfortable',confidence5:'5 · Comfortable'
  };

  let lang='tr';try{lang=localStorage.getItem(LANGUAGE_KEY)==='en'?'en':'tr';}catch{}
  let authMode='signin';let db=null;let user=null;let staff=null;let currentView='overview';let currentAdminTab='enrollments';let selectedCourseId=null;let selectedLessonId=null;let editCourseId=null;let editModuleId=null;let editLessonId=null;
  let publishedCourses=[],allCourses=[],enrollments=[],profile=null,progress=[],tasks=[],skillChecks=[],announcements=[],sessions=[],adminEnrollments=[],profileMap={},learnerModules=[],learnerLessons=[],adminModules=[],adminLessons=[];
  let courseLoadSequence=0,adminContentLoadSequence=0;
  let loadingSession=false;let sessionRefreshQueued=false;let recoveryMode=false;
  function localDateKey(date=new Date()){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');}
  const tr=key=>(lang==='tr'?TR:EN)[key]||key;
  const localized=(obj,field='title')=>obj?.[`${field}_${lang}`] || obj?.[`${field}_tr`] || '';
  const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
  const elem=(sel)=>$(sel);
  const clear=el=>{if(el)el.replaceChildren();};
  const formatDate=(value,withTime=false)=>{if(!value)return '';try{return new Intl.DateTimeFormat(lang==='tr'?'tr-TR':'en-GB',withTime?{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}:{day:'numeric',month:'short',year:'numeric'}).format(new Date(value));}catch{return String(value);}};
  function notify(message,error=false){const el=elem('#notification');el.textContent=message;el.classList.toggle('error',Boolean(error));el.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>{el.hidden=true;},6500);}
  async function run(query){const r=await query;if(r.error)throw r.error;return r.data;}
  async function attempt(operation){try{return await operation();}catch(e){console.error('LanguageLab action failed',e);notify(e?.message||tr('actionFailed'),true);return null;}}
  function empty(parent,text){clear(parent);const e=node('div','empty',text);parent.append(e);}
  function button(text,fn,style='small-btn'){const b=node('button',style,text);b.type='button';b.addEventListener('click',fn);return b;}
  function statPill(status){const el=node('span','pill-status '+(status==='active'||status==='open'?'good':status==='pending'||status==='waitlist'?'pending':''),tr(status));return el;}
  function metric(label,value){const el=node('div','metric');el.append(node('strong','',value),node('span','',label));return el;}
  function setLang(next){if(!['tr','en'].includes(next))return;lang=next;document.documentElement.lang=lang;try{localStorage.setItem(LANGUAGE_KEY,lang)}catch{}
    $$('[data-i18n]').forEach(e=>{const v=tr(e.dataset.i18n);e.textContent=v;});
    // Preserve approved HTML layout using real newlines only (no user-provided HTML).
    ['introTitle'].forEach(key=>{const e=$(`[data-i18n="${key}"]`);if(e)e.innerHTML=tr(key).split('\n').map(s=>{const sp=node('span','',s);return sp.outerHTML}).join('<br>');});
    $$('[data-lang]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.lang===lang)));
    renderCatalog();if(user&&!recoveryMode){renderDashboard();if(selectedCourseId)renderCourseDetail();}setAuthMode(authMode);document.title=lang==='tr'?'LanguageLab Akademi | Öğrenme Platformu':'LanguageLab Academy | Learning Platform';
  }
  function courseOf(id){return allCourses.find(c=>c.id===id)||publishedCourses.find(c=>c.id===id);}
  function enrollmentFor(id){return enrollments.find(e=>e.course_id===id);}
  function publicCourses(){return publishedCourses.filter(c=>c.status==='open'||c.status==='waitlist').sort((a,b)=>a.position-b.position);}
  async function init(){
    recoveryMode=/(?:^|[?&#])type=recovery(?:&|$)/.test(location.search+location.hash);
    $$('[data-lang]').forEach(e=>e.addEventListener('click',()=>setLang(e.dataset.lang)));
    $$('[data-auth-mode]').forEach(e=>e.addEventListener('click',()=>setAuthMode(e.dataset.authMode)));
    elem('#auth-form').addEventListener('submit',handleAuth);
    elem('#reset-password').addEventListener('click',handleReset);
    elem('#password-recovery-form').addEventListener('submit',handlePasswordUpdate);
    elem('#password-recovery-cancel').addEventListener('click',async()=>{
      if(!db){recoveryMode=false;showUnauthed();return;}
      try{await runAuth(db.auth.signOut());recoveryMode=false;showUnauthed();}
      catch(e){notify(e?.message||tr('actionFailed'),true);}
    });
    elem('#logout-btn').addEventListener('click',async()=>{
      if(!db)return;
      try{await runAuth(db.auth.signOut());showUnauthed();}
      catch(e){notify(e?.message||tr('actionFailed'),true);}
    });
    $$('[data-view]').forEach(e=>e.addEventListener('click',()=>setView(e.dataset.view)));
    $$('[data-admin-tab]').forEach(e=>e.addEventListener('click',()=>setAdminTab(e.dataset.adminTab)));
    elem('#catalog-level').addEventListener('change',renderCatalog);elem('#course-search').addEventListener('input',renderCatalog);
    elem('#task-form').addEventListener('submit',handleTaskSave);elem('#profile-form').addEventListener('submit',handleProfileSave);
    elem('#skill-check-form').addEventListener('submit',handleSkillCheckSave);
    elem('#admin-course-form').addEventListener('submit',handleCourseSave);elem('#course-new').addEventListener('click',clearCourseForm);
    elem('#content-course').addEventListener('change',()=>loadAdminContent(true));elem('#content-module').addEventListener('change',renderAdminContent);
    elem('#module-form').addEventListener('submit',handleModuleSave);elem('#lesson-form').addEventListener('submit',handleLessonSave);
    elem('#announcement-form').addEventListener('submit',handleAnnouncementSave);elem('#session-form').addEventListener('submit',handleSessionSave);
    setLang(lang);
    if(recoveryMode)showRecovery();
    if(!window.ESCSupabase?.isConfigured?.()){notify(tr('missingConfig'),true);empty(elem('#catalog-list'),tr('loadError'));return;}
    try{db=await window.ESCSupabase.getClient();}catch(e){console.error(e);notify(tr('loadError'),true);return;}
    await attempt(loadCatalog);
    db.auth.onAuthStateChange((event)=>{
      if(event==='PASSWORD_RECOVERY'){recoveryMode=true;showRecovery();}
      if(['SIGNED_IN','SIGNED_OUT','TOKEN_REFRESHED','PASSWORD_RECOVERY'].includes(event)){
        // Schedule outside the auth callback to avoid blocking Supabase refresh handling.
        setTimeout(()=>refreshSession(),0);
      }
    });
    await refreshSession();
  }
  async function runAuth(promise){const r=await promise;if(r.error)throw r.error;return r.data;}
  function setAuthMode(mode){authMode=mode;$$('[data-auth-mode]').forEach(e=>{const active=e.dataset.authMode===mode;e.classList.toggle('active',active);e.setAttribute('aria-pressed',String(active));});elem('#auth-submit').textContent=tr(mode==='signin'?'signIn':'signUp');elem('#auth-password').autocomplete=mode==='signup'?'new-password':'current-password';elem('#auth-password').minLength=mode==='signup'?10:8;}
  function authErrorMessage(error){
    const code=String(error?.code||'').toLowerCase();
    const message=String(error?.message||'');
    if(code==='email_address_not_authorized'||/email address not authorized/i.test(message))return tr('authEmailRestricted');
    if(code.includes('rate_limit')||/rate limit|too many requests/i.test(message))return tr('authRateLimited');
    if(code==='invalid_credentials'||/invalid login credentials/i.test(message))return tr('authInvalid');
    if(code==='email_not_confirmed'||/email not confirmed/i.test(message))return tr('authConfirm');
    return message||tr('actionFailed');
  }
  async function handleAuth(event){event.preventDefault();if(!db)return;const submit=elem('#auth-submit');submit.disabled=true;const email=elem('#auth-email').value.trim().toLowerCase(),password=elem('#auth-password').value;
    try{if(authMode==='signin'){await runAuth(db.auth.signInWithPassword({email,password}));await refreshSession();}else{
      const signup=await runAuth(db.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}}));
      if(signup?.session){await refreshSession();}else{notify(tr('signupSent'));setAuthMode('signin');}
    }}catch(e){console.error('Academy auth error:',e?.code||'unclassified');notify(authErrorMessage(e),true);}finally{submit.disabled=false;elem('#auth-password').value='';}
  }
  async function handleReset(){if(!db)return;const email=elem('#auth-email').value.trim();if(!email){notify(tr('email'),true);return;}await attempt(async()=>{await runAuth(db.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname}));notify(tr('resetSent'));});}
  function showRecovery(){
    elem('#password-recovery-panel').hidden=!recoveryMode;
    if(recoveryMode){
      elem('#auth-panel').hidden=true;elem('#workspace').hidden=true;elem('#logout-btn').hidden=true;
    }
  }
  async function handlePasswordUpdate(event){
    event.preventDefault();if(!db||!recoveryMode)return;
    const password=elem('#new-password').value;
    if(password!==elem('#confirm-password').value){notify(tr('passwordMismatch'),true);return;}
    if(password.length<10){notify(tr('passwordTooShort'),true);return;}
    const submit=elem('#password-recovery-submit');submit.disabled=true;
    try{
      const result=await db.auth.getUser();
      if(result.error||!result.data?.user)throw Error(tr('passwordExpired'));
      await runAuth(db.auth.updateUser({password}));
      elem('#password-recovery-form').reset();
      recoveryMode=false;showRecovery();
      await refreshSession();
      notify(tr('passwordChanged'));
    }catch(e){console.error(e);notify(e?.message||tr('actionFailed'),true);}
    finally{submit.disabled=false;}
  }
  async function refreshSession(){
    if(!db)return;
    if(loadingSession){sessionRefreshQueued=true;return;}
    loadingSession=true;
    try{
      const r=await db.auth.getUser();
      const fresh=r?.data?.user||null;
      if(!fresh){
        user=null;
        if(recoveryMode)showRecovery();else showUnauthed();
        return;
      }
      const changed=user?.id!==fresh.id;
      user=fresh;
      if(recoveryMode){showRecovery();return;}
      elem('#password-recovery-panel').hidden=true;
      elem('#auth-panel').hidden=true;elem('#workspace').hidden=false;elem('#logout-btn').hidden=false;
      elem('#member-name').textContent=user.email||'';
      if(changed||!profile)await loadDashboardData();else renderDashboard();
    }catch(e){console.error(e);notify(tr('loadError'),true);}
    finally{
      loadingSession=false;
      if(sessionRefreshQueued){sessionRefreshQueued=false;void refreshSession();}
    }
  }
  function showUnauthed(){
    user=null;staff=null;profile=null;enrollments=[];progress=[];tasks=[];skillChecks=[];announcements=[];sessions=[];
    allCourses=[];adminEnrollments=[];profileMap={};learnerModules=[];learnerLessons=[];adminModules=[];adminLessons=[];
    courseLoadSequence++;adminContentLoadSequence++;
    selectedCourseId=null;selectedLessonId=null;editCourseId=null;editModuleId=null;editLessonId=null;
    currentView='overview';currentAdminTab='enrollments';
    elem('#course-detail').hidden=true;elem('#password-recovery-panel').hidden=true;
    elem('#auth-panel').hidden=false;elem('#workspace').hidden=true;elem('#logout-btn').hidden=true;
    renderCatalog();
  }
  async function loadCatalog(){publishedCourses=await run(db.from('academy_courses').select('id,slug,title_tr,title_en,description_tr,description_en,level_group,category,delivery_format,access_mode,status,position').in('status',['open','waitlist']).order('position'));renderCatalog();}
  async function loadDashboardData(){if(!user)return;
    const uid=user.id;
    const [pr,st,en,pg,ts,sc,an,ss]=await Promise.all([
      run(db.from('academy_profiles').select('*').eq('user_id',uid).maybeSingle()),
      run(db.from('academy_staff').select('role').eq('user_id',uid).maybeSingle()),
      run(db.from('academy_enrollments').select('id,course_id,user_id,status,created_at').eq('user_id',uid).order('created_at',{ascending:false})),
      run(db.from('academy_progress').select('lesson_id,completed_at').eq('user_id',uid)),
      run(db.from('academy_tasks').select('id,title,due_date,is_done,created_at').eq('user_id',uid).order('created_at',{ascending:false})),
      run(db.from('academy_skill_checks').select('id,skill,cefr_level,confidence,note,created_at').eq('user_id',uid).order('created_at',{ascending:false}).limit(40)),
      run(db.from('academy_announcements').select('*').order('created_at',{ascending:false}).limit(20)),
      run(db.from('academy_sessions').select('*').gte('starts_at',new Date(Date.now()-86400000).toISOString()).order('starts_at').limit(50))
    ]);
    if(!user||user.id!==uid)return;
    profile=pr;staff=st;enrollments=en||[];progress=pg||[];tasks=ts||[];skillChecks=sc||[];announcements=an||[];sessions=ss||[];
    if(!profile){profile=await run(db.from('academy_profiles').insert({user_id:uid,full_name:'',target_level:'Not sure',language:lang}).select('*').single());}
    if(isManager()) await loadManagerData();
    renderDashboard();renderCatalog();
  }
  function isManager(){return !!staff&&['owner','manager'].includes(staff.role);}
  function renderDashboard(){if(!user)return;elem('#admin-nav').hidden=!isManager();$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===currentView));$$('.view').forEach(v=>v.hidden=v.id!==`view-${currentView}`);if(currentView==='admin'&&!isManager()){setView('overview');return;}
    elem('#member-name').textContent=(profile?.full_name||user.email||'')+' · '+tr(staff?.role||'learner');
    const m=elem('#metrics');clear(m);m.append(metric(tr('courseCount'),enrollments.filter(x=>x.status==='active'||x.status==='completed').length),metric(tr('lessonsDone'),progress.length),metric(tr('todoCount'),tasks.filter(x=>!x.is_done).length),metric(tr('dueSoon'),tasks.filter(x=>!x.is_done&&x.due_date&&x.due_date<=localDateKey(new Date(Date.now()+7*86400000))).length));
    const recent=elem('#overview-courses');clear(recent);if(!enrollments.length)empty(recent,tr('nothingEnrolled'));else enrollments.slice(0,3).forEach(e=>recent.append(enrollmentCard(e,false)));
    renderEnrollments();renderTasks();renderAnnouncements();renderSessions();renderProfile();renderSkillChecks();if(isManager())renderManager();
  }
  function setView(view){if(!user){notify(tr('needLogin'));elem('#auth-panel').scrollIntoView({behavior:'smooth'});return;}if(view==='admin'&&!isManager()){notify(tr('noAdmin'),true);return;}currentView=view;renderDashboard();elem('#workspace-title').scrollIntoView({behavior:'smooth',block:'start'});}
  function enrollmentCard(en,withAction=true){const course=courseOf(en.course_id);const c=node('article','data-card');const top=node('div','row');top.append(node('h4','',course?localized(course):en.course_id),statPill(en.status));c.append(top,node('p','',course?localized(course,'description'):''));if(withAction&&en.status==='active')c.append(button(tr('openCourse'),()=>openCourse(en.course_id),'small-btn primary'));return c;}
  function renderEnrollments(){const el=elem('#enrollment-list');clear(el);if(!enrollments.length){empty(el,tr('nothingEnrolled'));return;}enrollments.forEach(e=>el.append(enrollmentCard(e)));}
  async function openCourse(courseId){
    const en=enrollmentFor(courseId);
    if(!user||!en||en.status!=='active'){notify(tr('noAccess'),true);return;}
    const requestingUser=user.id,requestId=++courseLoadSequence;
    await attempt(async()=>{
      const nextModules=await run(db.from('academy_modules').select('id,course_id,title_tr,title_en,position,is_published').eq('course_id',courseId).order('position'));
      const nextLessons=nextModules.length
        ?await run(db.from('academy_lessons').select('id,module_id,title_tr,title_en,content_tr,content_en,estimated_minutes,position,is_published').in('module_id',nextModules.map(x=>x.id)).order('position')):[];
      // A stale response must never replace a newly chosen course or another account's state.
      if(!user||user.id!==requestingUser||requestId!==courseLoadSequence||enrollmentFor(courseId)?.status!=='active')return;
      learnerModules=nextModules;learnerLessons=nextLessons;
      selectedCourseId=courseId;selectedLessonId=null;
      renderCourseDetail();setView('mycourses');
    });
  }
  function renderCourseDetail(){const detail=elem('#course-detail');clear(detail);detail.hidden=!selectedCourseId;if(!selectedCourseId)return;const course=courseOf(selectedCourseId);const top=node('div','detail-title');top.append(node('h3','',localized(course)));top.append(button(tr('back'),()=>{selectedCourseId=null;detail.hidden=true;},'small-btn'));detail.append(top);
    if(!learnerModules.length){detail.append(node('div','empty',tr('moduleEmpty')));return;}
    for(const mod of learnerModules){const block=node('div','module-block');block.append(node('strong','',localized(mod)));const group=learnerLessons.filter(l=>l.module_id===mod.id);
      if(!group.length)block.append(node('div','empty',tr('noLesson')));
      for(const lesson of group){const row=node('div','lesson-item');const texts=node('div');texts.append(node('span','',localized(lesson)),node('small','',`${lesson.estimated_minutes} ${tr('lessonTime')}${progress.some(x=>x.lesson_id===lesson.id)?' · ✓ '+tr('completed'):''}`));row.append(texts,button(tr('startLesson'),()=>{selectedLessonId=lesson.id;renderCourseDetail();},'small-btn'));block.append(row)}detail.append(block)}
    if(selectedLessonId){const l=learnerLessons.find(x=>x.id===selectedLessonId);if(!l)return;const section=node('section','lesson-body');section.append(node('h4','',localized(l)),node('div','',localized(l,'content')));const actions=node('div','actions');const done=progress.some(x=>x.lesson_id===l.id);actions.append(button(tr(done?'markUndone':'markDone'),()=>toggleLessonDone(l.id,done),'small-btn primary'));section.append(actions);detail.append(section);section.scrollIntoView({behavior:'smooth',block:'center'});}
  }
  async function toggleLessonDone(lessonId,alreadyDone){await attempt(async()=>{
    if(alreadyDone){await run(db.from('academy_progress').delete().eq('user_id',user.id).eq('lesson_id',lessonId));progress=progress.filter(p=>p.lesson_id!==lessonId);}else{
      await run(db.from('academy_progress').insert({user_id:user.id,lesson_id:lessonId}));progress.push({lesson_id:lessonId,completed_at:new Date().toISOString()});}
    notify(tr('saved'));renderDashboard();renderCourseDetail();
  });}
  function renderTasks(){const list=elem('#task-list');clear(list);if(!tasks.length){empty(list,tr('nothingTasks'));return;}
    const today=localDateKey();
    tasks.sort((a,b)=>Number(a.is_done)-Number(b.is_done)||String(a.due_date||'9999-12-31').localeCompare(String(b.due_date||'9999-12-31'))||String(b.created_at).localeCompare(String(a.created_at)));
    for(const t of tasks){const row=node('div','data-card task-row'+(t.is_done?' done':''));const check=node('input');check.type='checkbox';check.checked=t.is_done;check.setAttribute('aria-label',t.title);check.addEventListener('change',()=>updateTask(t.id,check.checked));const desc=node('span','task-text',t.title);row.append(check,desc);if(t.due_date){const state=!t.is_done&&(t.due_date<today?'overdue':t.due_date===today?'dueToday':'');row.append(node('small','due-tag '+(state==='overdue'?'overdue':state==='dueToday'?'due-today':''),formatDate(t.due_date)+(state?' · '+tr(state):'')));}row.append(button(tr('delete'),()=>deleteTask(t.id),'small-btn danger'));list.append(row);}
  }
  async function handleTaskSave(event){event.preventDefault();if(!user)return;const title=elem('#task-title').value.trim();if(title.length<2)return;await attempt(async()=>{await run(db.from('academy_tasks').insert({user_id:user.id,title,due_date:elem('#task-date').value||null}));elem('#task-form').reset();tasks=await run(db.from('academy_tasks').select('id,title,due_date,is_done,created_at').eq('user_id',user.id).order('created_at',{ascending:false}));notify(tr('saved'));renderDashboard();});}
  async function updateTask(id,checked){await attempt(async()=>{await run(db.from('academy_tasks').update({is_done:checked}).eq('id',id).eq('user_id',user.id));tasks=tasks.map(x=>x.id===id?{...x,is_done:checked}:x);renderDashboard();});}
  async function deleteTask(id){if(!confirm(tr('confirmDelete')))return;await attempt(async()=>{await run(db.from('academy_tasks').delete().eq('id',id).eq('user_id',user.id));tasks=tasks.filter(x=>x.id!==id);renderDashboard();});}
  function renderProfile(){elem('#profile-name').value=profile?.full_name||'';elem('#profile-level').value=profile?.target_level||'Not sure';elem('#profile-goal').value=profile?.learning_goal||'';}
  async function handleProfileSave(event){event.preventDefault();if(!user)return;const payload={full_name:elem('#profile-name').value.trim(),target_level:elem('#profile-level').value,learning_goal:elem('#profile-goal').value.trim(),language:lang,updated_at:new Date().toISOString()};await attempt(async()=>{profile=await run(db.from('academy_profiles').update(payload).eq('user_id',user.id).select('*').single());notify(tr('saveProfile'));renderDashboard();});}
  function renderSkillChecks(){
    const list=elem('#skill-check-list');
    if(!list)return;
    clear(list);
    if(!skillChecks.length){empty(list,tr('skillCheckEmpty'));return;}
    for(const check of skillChecks.slice(0,12)){
      const card=node('article','data-card skill-check-card');
      const top=node('div','row');
      top.append(node('h4','',tr('skill'+check.skill.charAt(0).toUpperCase()+check.skill.slice(1))+' · '+check.cefr_level),node('small','',formatDate(check.created_at)));
      card.append(top,node('p','',tr('skillCheckConfidence')+': '+check.confidence+'/5'));
      if(check.note)card.append(node('p','skill-check-note',check.note));
      const controls=node('div','actions');
      controls.append(button(tr('delete'),()=>deleteSkillCheck(check.id),'small-btn danger'));
      card.append(controls);
      list.append(card);
    }
  }
  async function handleSkillCheckSave(event){
    event.preventDefault();
    if(!user)return;
    const uid=user.id;
    const skill=elem('#skill-check-skill').value;
    const cefr_level=elem('#skill-check-level').value;
    const confidence=Number(elem('#skill-check-confidence').value);
    const note=elem('#skill-check-note').value.trim();
    if(!['speaking','listening','reading','writing'].includes(skill)||
      !['A1','A2','B1','B2','C1','C2'].includes(cefr_level)||
      !Number.isInteger(confidence)||confidence<1||confidence>5||note.length>500)return;
    const submit=elem('#skill-check-submit');submit.disabled=true;
    try{
      const row=await run(db.from('academy_skill_checks').insert({user_id:uid,skill,cefr_level,confidence,note}).select('id,skill,cefr_level,confidence,note,created_at').single());
      if(!user||user.id!==uid)return;
      skillChecks.unshift(row);skillChecks=skillChecks.slice(0,40);
      elem('#skill-check-note').value='';
      renderSkillChecks();notify(tr('skillCheckSaved'));
    }catch(e){console.error(e);notify(e?.message||tr('actionFailed'),true);}
    finally{submit.disabled=false;}
  }
  async function deleteSkillCheck(id){
    if(!user||!window.confirm(tr('skillCheckConfirmDelete')))return;
    const uid=user.id;
    await attempt(async()=>{
      await run(db.from('academy_skill_checks').delete().eq('id',id).eq('user_id',uid));
      if(!user||user.id!==uid)return;
      skillChecks=skillChecks.filter(x=>x.id!==id);
      renderSkillChecks();notify(tr('saved'));
    });
  }
  function renderAnnouncements(){const list=elem('#announcement-list');clear(list);if(!announcements.length){empty(list,tr('nothingAnnouncements'));return;}for(const a of announcements.slice(0,5)){const card=node('article','data-card');card.append(node('h4','',localized(a)),node('p','',localized(a,'body')));list.append(card);}}
  function renderSessions(){const list=elem('#session-list');clear(list);if(!sessions.length){empty(list,tr('nothingSessions'));return;}for(const s of sessions){const card=node('article','data-card');const top=node('div','row');top.append(node('h4','',localized(s)),node('span','pill-status',formatDate(s.starts_at,true)));card.append(top,node('p','',`${localized(courseOf(s.course_id))} · ${s.duration_minutes} ${tr('lessonTime')} · ${s.location_text||''}`));if(s.status==='cancelled')card.append(node('small','session-cancelled',tr('cancelled')));if(s.meeting_url&&s.status==='scheduled'){const link=node('a','small-btn',tr('joinMeeting'));link.href=s.meeting_url;link.rel='noopener noreferrer';link.target='_blank';link.style.display='inline-block';link.style.marginTop='12px';card.append(link);}list.append(card);}}
  async function joinCourse(c){if(!user){notify(tr('needLogin'));elem('#auth-panel').scrollIntoView({behavior:'smooth'});return;}if(enrollmentFor(c.id)){if(enrollmentFor(c.id).status==='active')setView('mycourses');return;}const status=c.status==='open'&&c.access_mode==='self_enroll'?'active':'pending';await attempt(async()=>{await run(db.from('academy_enrollments').insert({user_id:user.id,course_id:c.id,status}));enrollments=await run(db.from('academy_enrollments').select('id,course_id,user_id,status,created_at').eq('user_id',user.id).order('created_at',{ascending:false}));notify(tr(status==='active'?'enrollmentActive':'enrollmentSaved'));renderCatalog();renderDashboard();if(status==='active')setView('mycourses');});}
  function renderCatalog(){const target=elem('#catalog-list');clear(target);const term=elem('#course-search').value.trim().toLocaleLowerCase(lang==='tr'?'tr-TR':'en-GB');const level=elem('#catalog-level').value;let filtered=publicCourses().filter(c=>(level==='ALL'||c.level_group==='ALL'||c.level_group===level)&&(!term||(localized(c)+' '+localized(c,'description')).toLocaleLowerCase(lang==='tr'?'tr-TR':'en-GB').includes(term)));
    if(!filtered.length){empty(target,tr('notFound'));return;}for(const c of filtered){const card=node('article','course-card');const top=node('div','course-card-top');top.append(node('span','course-icon',c.category==='private'?'◎':c.category==='educator'?'✦':c.category==='professional'?'↗':'◌'),statPill(c.status));card.append(top,node('h3','',localized(c)),node('p','',localized(c,'description')));const meta=node('div','course-meta');meta.append(node('span','tag',c.level_group==='ALL'?tr('levelAll'):c.level_group),node('span','tag',tr(({online:'formatOnline',in_person:'formatPerson',hybrid:'formatHybrid',self_paced:'formatSelf'})[c.delivery_format])));card.append(meta);
      const existing=enrollmentFor(c.id);const label=existing?existing.status==='active'?tr('alreadyActive'):tr(existing.status):c.access_mode==='self_enroll'?tr('freeJoin'):tr('request');const btn=button(label,()=>joinCourse(c),'button '+(existing&&existing.status!=='active'?'outlined':'primary'));if(existing&&existing.status!=='active')btn.disabled=true;card.append(btn);target.append(card);}
  }
  async function loadManagerData(){if(!isManager())return;const [courses,e]=await Promise.all([
    run(db.from('academy_courses').select('*').order('position')),
    run(db.from('academy_enrollments').select('id,user_id,course_id,status,created_at').order('created_at',{ascending:false}).limit(300))
  ]);allCourses=courses||[];adminEnrollments=e||[];profileMap={};const ids=[...new Set(adminEnrollments.map(x=>x.user_id))];if(ids.length){const people=await run(db.from('academy_profiles').select('user_id,full_name').in('user_id',ids));for(const p of people||[])profileMap[p.user_id]=p.full_name;}}
  function renderManager(){const summary=elem('#admin-summary');clear(summary);summary.append(metric(tr('managerCourses'),allCourses.length),metric(tr('managerPending'),adminEnrollments.filter(x=>x.status==='pending').length),metric(tr('managerActive'),adminEnrollments.filter(x=>x.status==='active').length));setAdminTab(currentAdminTab,false);renderAdminRequests();renderAdminCourses();populateAdminSelects();}
  function setAdminTab(tab,clearForms=false){currentAdminTab=tab;$$('[data-admin-tab]').forEach(b=>b.classList.toggle('active',b.dataset.adminTab===tab));$$('.admin-panel').forEach(p=>p.hidden=p.id!=='admin-'+tab);if(tab==='content'&&clearForms)loadAdminContent(true);}
  function renderAdminRequests(){const target=elem('#admin-request-list');clear(target);if(!adminEnrollments.length){empty(target,tr('nothingRequests'));return;}for(const e of adminEnrollments){const card=node('article','data-card');const top=node('div','row');top.append(node('h4','',profileMap[e.user_id]||'Learner'),statPill(e.status));card.append(top,node('p','',`${localized(courseOf(e.course_id))} · ${formatDate(e.created_at)}`));const actions=node('div','actions');if(e.status==='pending'||e.status==='rejected'){actions.append(button(tr('approve'),()=>setEnrollmentStatus(e,'active'),'small-btn primary'));if(e.status==='pending')actions.append(button(tr('reject'),()=>setEnrollmentStatus(e,'rejected'),'small-btn danger'));}if(e.status==='active')actions.append(button(tr('completed'),()=>setEnrollmentStatus(e,'completed')));card.append(actions);target.append(card);}}
  async function setEnrollmentStatus(e,status){if(status==='rejected'&&!confirm(tr('confirmReject')))return;await attempt(async()=>{await run(db.from('academy_enrollments').update({status,updated_at:new Date().toISOString()}).eq('id',e.id));await loadManagerData();renderManager();notify(tr('saved'));});}
  function clearCourseForm(){editCourseId=null;elem('#admin-course-form').reset();elem('#course-id').value='';elem('#course-slug').disabled=false;}
  function renderAdminCourses(){const target=elem('#admin-course-list');clear(target);for(const course of allCourses){const card=node('article','data-card');const row=node('div','row');row.append(node('h4','',localized(course)),statPill(course.status));card.append(row,node('p','',course.slug+' · '+course.level_group));const actions=node('div','actions');actions.append(button(tr('edit'),()=>editCourse(course)));card.append(actions);target.append(card);}}
  function editCourse(c){editCourseId=c.id;const values={'course-id':c.id,'course-slug':c.slug,'course-title-tr':c.title_tr,'course-title-en':c.title_en,'course-desc-tr':c.description_tr,'course-desc-en':c.description_en,'course-status':c.status,'course-level':c.level_group,'course-format':c.delivery_format,'course-category':c.category,'course-access':c.access_mode};for(const [id,val]of Object.entries(values))elem('#'+id).value=val;elem('#course-slug').disabled=true;elem('#admin-course-form').scrollIntoView({behavior:'smooth'});}
  async function handleCourseSave(event){event.preventDefault();if(!isManager())return;const data={slug:elem('#course-slug').value.trim().toLowerCase(),title_tr:elem('#course-title-tr').value.trim(),title_en:elem('#course-title-en').value.trim(),description_tr:elem('#course-desc-tr').value.trim(),description_en:elem('#course-desc-en').value.trim(),status:elem('#course-status').value,level_group:elem('#course-level').value,category:elem('#course-category').value,delivery_format:elem('#course-format').value,access_mode:elem('#course-access').value,updated_at:new Date().toISOString()};if(data.status==='waitlist'&&data.access_mode==='self_enroll'){notify(tr('dangerSelfEnroll'),true);return;}await attempt(async()=>{if(editCourseId)await run(db.from('academy_courses').update(data).eq('id',editCourseId));else await run(db.from('academy_courses').insert(data));await loadManagerData();await loadCatalog();renderManager();clearCourseForm();notify(tr('saved'));});}
  function populateAdminSelects(){const sets=[['#content-course',false],['#session-course',false],['#announcement-course',true]];for(const [selector,emptyAllowed]of sets){const select=elem(selector),chosen=select.value;clear(select);if(emptyAllowed)select.append(new Option(lang==='tr'?'Tüm öğrenciler':'All learners',''));for(const c of allCourses)select.append(new Option(localized(c),c.id));if([...select.options].some(o=>o.value===chosen))select.value=chosen;}}
  async function loadAdminContent(reset){
    if(!isManager())return;
    const id=elem('#content-course').value,requestingUser=user.id,requestId=++adminContentLoadSequence;
    editModuleId=null;editLessonId=null;elem('#module-form').reset();elem('#lesson-form').reset();
    if(!id){adminModules=[];adminLessons=[];clear(elem('#content-module'));renderAdminContent();return;}
    await attempt(async()=>{
      const nextModules=await run(db.from('academy_modules').select('*').eq('course_id',id).order('position'));
      const nextLessons=nextModules.length
        ?await run(db.from('academy_lessons').select('*').in('module_id',nextModules.map(x=>x.id)).order('position')):[];
      if(!user||user.id!==requestingUser||!isManager()||requestId!==adminContentLoadSequence||elem('#content-course').value!==id)return;
      adminModules=nextModules;adminLessons=nextLessons;
      const select=elem('#content-module'),chosen=reset?'':select.value;clear(select);
      for(const m of adminModules)select.append(new Option(localized(m),m.id));
      if([...select.options].some(o=>o.value===chosen))select.value=chosen;
      renderAdminContent();
    });
  }
  function renderAdminContent(){const target=elem('#content-list');clear(target);if(!adminModules.length){empty(target,tr('moduleEmpty'));return;}for(const m of adminModules){const box=node('article','data-card');const top=node('div','row');top.append(node('h4','',localized(m)),statPill(m.is_published?'active':'draft'));box.append(top);const actions=node('div','actions');actions.append(button(tr('edit'),()=>{editModuleId=m.id;elem('#module-title-tr').value=m.title_tr;elem('#module-title-en').value=m.title_en;elem('#module-published').checked=m.is_published;elem('#module-form').scrollIntoView({behavior:'smooth'});}));box.append(actions);for(const l of adminLessons.filter(x=>x.module_id===m.id)){const line=node('div','lesson-item');line.append(node('span','',localized(l)+' · '+l.estimated_minutes+' '+tr('lessonTime')));line.append(button(tr('edit'),()=>{editLessonId=l.id;elem('#content-module').value=m.id;elem('#lesson-title-tr').value=l.title_tr;elem('#lesson-title-en').value=l.title_en;elem('#lesson-body-tr').value=l.content_tr;elem('#lesson-body-en').value=l.content_en;elem('#lesson-minutes').value=l.estimated_minutes;elem('#lesson-published').checked=l.is_published;elem('#lesson-form').scrollIntoView({behavior:'smooth'});}));box.append(line)}target.append(box);}}
  async function handleModuleSave(event){event.preventDefault();if(!isManager())return;const course_id=elem('#content-course').value;if(!course_id){notify(tr('selectCourseFirst'),true);return;}const payload={course_id,title_tr:elem('#module-title-tr').value.trim(),title_en:elem('#module-title-en').value.trim(),is_published:elem('#module-published').checked};await attempt(async()=>{if(editModuleId)await run(db.from('academy_modules').update(payload).eq('id',editModuleId));else await run(db.from('academy_modules').insert(payload));editModuleId=null;elem('#module-form').reset();await loadAdminContent(false);notify(tr('saved'));});}
  async function handleLessonSave(event){event.preventDefault();if(!isManager())return;const module_id=elem('#content-module').value;if(!module_id){notify(tr('selectModuleFirst'),true);return;}const payload={module_id,title_tr:elem('#lesson-title-tr').value.trim(),title_en:elem('#lesson-title-en').value.trim(),content_tr:elem('#lesson-body-tr').value.trim(),content_en:elem('#lesson-body-en').value.trim(),is_published:elem('#lesson-published').checked,estimated_minutes:Number(elem('#lesson-minutes').value)};await attempt(async()=>{if(editLessonId)await run(db.from('academy_lessons').update(payload).eq('id',editLessonId));else await run(db.from('academy_lessons').insert(payload));editLessonId=null;elem('#lesson-form').reset();await loadAdminContent(false);notify(tr('saved'));});}
  async function handleAnnouncementSave(event){event.preventDefault();if(!isManager())return;const payload={title_tr:elem('#announcement-title-tr').value.trim(),title_en:elem('#announcement-title-en').value.trim(),body_tr:elem('#announcement-body-tr').value.trim(),body_en:elem('#announcement-body-en').value.trim(),course_id:elem('#announcement-course').value||null,is_published:elem('#announcement-published').checked};await attempt(async()=>{await run(db.from('academy_announcements').insert(payload));elem('#announcement-form').reset();notify(tr('saved'));});}
  async function handleSessionSave(event){event.preventDefault();if(!isManager())return;const start=elem('#session-start').value;const meetingUrl=elem('#session-url').value.trim();if(meetingUrl&&!/^https:\/\//i.test(meetingUrl)){notify('https://',true);return;}const payload={course_id:elem('#session-course').value,title_tr:elem('#session-title-tr').value.trim(),title_en:elem('#session-title-en').value.trim(),starts_at:new Date(start).toISOString(),duration_minutes:Number(elem('#session-minutes').value),location_text:elem('#session-location').value.trim(),meeting_url:meetingUrl};await attempt(async()=>{await run(db.from('academy_sessions').insert(payload));elem('#session-form').reset();notify(tr('saved'));});}

  const start=()=>{init().catch(e=>{console.error('LanguageLab startup failed',e);notify(tr('loadError'),true);});};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();