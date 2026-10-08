(() => {
  'use strict';

  const HELP = {
    overview:{tr:'Bugün ekranı sana hızlı başlangıç verir: yaklaşan dersleri, son derslerini ve en sık kullandığın öğretmen akışlarını burada görürsün.',en:'Today is your starting point: see upcoming lessons, recent lessons and the teacher workflows you use most.'},
    planner:{tr:'Planlayıcı ders tarihlerini ve saatlerini düzenlemek içindir. Sınıf veya özel öğrenci için yaklaşan ders ekleyebilirsin.',en:'Planner is for lesson dates and times. Add upcoming lessons for a class or a private student.'},
    curriculum:{tr:'Müfredat bölümü MEB veya CEFR hedefinden derse geçiş yapar. Sınıf, tema ve beceriyi seçip Lesson Builder’a aktarabilirsin.',en:'Curriculum turns MEB or CEFR targets into lessons. Choose grade, theme and skill, then send it to Lesson Builder.'},
    classes:{tr:'Sınıflarım bölümünde sınıf oluşturur, öğrenci katılım kodunu görür, öğrenci listesini ve sınıf durumunu yönetirsin.',en:'Classes is where you create classes, view join codes, manage students and control class status.'},
    private:{tr:'Özel Öğrenciler, bire bir öğrenciler için seviye, hedef, zorlandığı konular, ödev ve sonraki ders notlarını saklar.',en:'Private Students stores level, goals, difficult topics, homework and next-lesson notes for one-to-one learners.'},
    assistant:{tr:'Teacher Assistant konu, seviye ve hedef bilgisine göre ders akışı, speaking soruları, worksheet, ödev ve oyun taslağı üretir. Sonucu Builder’a aktarabilirsin.',en:'Teacher Assistant creates a lesson flow, speaking questions, worksheet, homework and game draft from your topic, level and goal.'},
    builder:{tr:'Ders Oluşturucu, canlı derste kullanacağın asıl ders akışını hazırlar. Yaş, seviye, konu, süre ve öğrenci sayısına göre aşamalar oluşturur.',en:'Lesson Builder creates the actual flow you use in class. It builds stages from age, level, topic, duration and class size.'},
    library:{tr:'Derslerim, kaydettiğin derslerin kütüphanesidir. Eski dersi açabilir, düzenleyebilir, kopyalayabilir, yazdırabilir veya tekrar kullanabilirsin.',en:'My Lessons is your saved lesson library. Open, edit, copy, print or reuse previous lessons.'},
    assignments:{tr:'Ödevler bölümünden sınıfa görev yayınlar, son tarih belirlersin. Öğrenci cevaplarını ve öğretmen geri bildirimini aynı yerde yönetirsin.',en:'Assignments lets you publish work to a class, set deadlines, review student responses and give feedback.'},
    resources:{tr:'Materyal Stüdyosu, worksheet ve sınıfta kullanabileceğin ek materyalleri hazırlamak için kullanılan alandır.',en:'Material Studio is the area for preparing worksheets and extra classroom materials.'},
    games:{tr:'Oyun Kütüphanesi dersin tamamı değildir. Speaking, vocabulary veya grammar pratiği için kısa etkinlikler açmak içindir.',en:'Game Library is not the whole lesson. Use it for short speaking, vocabulary or grammar practice activities.'},
    tools:{tr:'Sınıf Araçları; timer, rastgele öğrenci seçimi, takım oluşturma ve hızlı speaking prompt gibi küçük yardımcı araçları içerir.',en:'Classroom Tools includes a timer, random student picker, team maker and quick speaking prompts.'},
    reports:{tr:'Raporlar öğrenci katılımı ve etkinlik sonuçlarını özetler. Sonraki derste hangi alanı tekrar etmenin daha mantıklı olduğunu görmene yardım eder.',en:'Reports summarizes participation and activity results to help decide what to revisit in the next lesson.'},
    school:{tr:'School Workspace öğretmen ekipleri içindir. Öğretmenleri aynı workspace’e alır, ortak dersleri paylaşır ve ekip içinde tekrar kullanmanı sağlar.',en:'School Workspace is for teacher teams. Add teachers to one workspace, share lessons and reuse them across the team.'},
    settings:{tr:'Ayarlar bölümünde varsayılan yaş grubu, seviye, ders süresi, dil ve kurum bilgilerini kaydedersin. Yeni derslerde bu tercihler otomatik kullanılır.',en:'Settings stores your default age group, level, duration, language and institution so new lessons start with your preferences.'}
  };

  function lang(){ return document.documentElement.lang==='en'?'en':'tr'; }

  function closeAll(except=null){
    document.querySelectorAll('.edu-help-dot.help-open').forEach(x=>{if(x!==except)x.classList.remove('help-open');});
  }

  function render(){
    const l=lang();
    document.querySelectorAll('[data-panel-view]').forEach(panel=>{
      const key=panel.dataset.panelView;
      const item=HELP[key];
      const header=panel.querySelector('.panel-header');
      if(!item||!header)return;
      let btn=header.querySelector('.edu-help-dot');
      if(!btn){
        btn=document.createElement('button');
        btn.type='button';
        btn.className='edu-help-dot';
        btn.textContent='?';
        btn.addEventListener('click',e=>{
          e.stopPropagation();
          const next=!btn.classList.contains('help-open');
          closeAll(btn);
          btn.classList.toggle('help-open',next);
        });
        header.appendChild(btn);
      }
      btn.dataset.helpText=item[l];
      btn.setAttribute('aria-label',l==='en'?'What is this section?':'Bu bölüm ne işe yarıyor?');
    });

    document.querySelectorAll('.side-item[data-panel],.mobile-workspace-tabs [data-panel]').forEach(btn=>{
      const item=HELP[btn.dataset.panel];
      if(item) btn.title=item[l];
    });
  }

  document.addEventListener('click',()=>closeAll());
  window.addEventListener('esc:languagechange',render);
  document.addEventListener('DOMContentLoaded',render);
})();