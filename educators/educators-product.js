(() => {
  'use strict';

  const $ = (q, root=document) => root.querySelector(q);
  const $$ = (q, root=document) => [...root.querySelectorAll(q)];
  const state = { lessons:[], classes:[], results:[], sessions:[], assignments:[], privateStudents:[], schedule:[], ready:false };
  const en = () => document.documentElement.lang === 'en';
  const tx = (tr,enText) => en() ? enText : tr;

  const esc = (v='') => String(v).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[ch]));

  function fmtDate(value) {
    if (!value) return '';
    try {
      return new Intl.DateTimeFormat(en()?'en-GB':'tr-TR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(value));
    } catch { return ''; }
  }

  function openPanel(name) {
    const desktop = document.querySelector('.side-item[data-panel="'+name+'"]');
    const mobile = document.querySelector('.mobile-workspace-tabs [data-panel="'+name+'"]');
    (desktop || mobile)?.click();
    document.querySelector('#teacher-demo')?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function classNameFor(id) {
    return state.classes.find(c => c.id === id)?.name || tx('Sınıf','Class');
  }

  function lessonGoalLabel(goal) {
    const map = {speaking:'Speaking',vocabulary:'Vocabulary',grammar:'Grammar',mixed:'Mixed'};
    return map[goal] || goal || 'English';
  }

  function lessonStatusLabel(status){
    const map={
      draft:tx('Taslak','Draft'),
      ready:tx('Hazır','Ready'),
      active:tx('Aktif','Active'),
      completed:tx('Tamamlandı','Completed'),
      archived:tx('Arşiv','Archived')
    };
    return map[status]||status||tx('Hazır','Ready');
  }

  function studentNameFor(id){
    for(const cls of state.classes){
      const found=(cls.all_students||cls.students||[]).find(s=>s.id===id);
      if(found) return found.display_name||tx('Öğrenci','Student');
    }
    return tx('Öğrenci','Student');
  }

  function renderSetup() {
    const done = {
      account:true,
      class:state.classes.length > 0,
      lesson:state.lessons.length > 0,
      live:state.sessions.length > 0
    };
    const complete = Object.values(done).filter(Boolean).length;
    const percent = Math.round((complete / 4) * 100);
    const label = $('#teacherSetupPercent');
    const bar = $('#teacherSetupProgress');
    if (label) label.textContent = percent + '%';
    if (bar) bar.style.width = percent + '%';

    $$('[data-setup-step]').forEach(btn => {
      const key = btn.dataset.setupStep;
      btn.classList.toggle('done', !!done[key]);
      const em = $('em', btn);
      if (em) em.textContent = done[key] ? '✓' : '→';
    });
  }

  function setupActions() {
    $$('[data-setup-step]').forEach(btn => btn.addEventListener('click', () => {
      const step = btn.dataset.setupStep;
      if (step === 'account') return;
      if (step === 'class') openPanel('classes');
      if (step === 'lesson') openPanel(state.classes.length ? 'builder' : 'classes');
      if (step === 'live') openPanel(state.lessons.length ? 'library' : 'builder');
    }));
  }

  function recentLessonCard(lesson) {
    return `<button class="recent-lesson-item" type="button" data-open-lesson="${esc(lesson.id)}">
      <span><b>${esc(lesson.title || lesson.topic || 'English lesson')}</b><small>${esc(classNameFor(lesson.class_id))} · ${esc(lessonGoalLabel(lesson.primary_goal))} · ${Number(lesson.duration_minutes || 0)} ${tx('dk','min')}</small></span>
      <em>→</em>
    </button>`;
  }

  function renderRecent() {
    const wrap = $('#recentLessonList');
    if (!wrap) return;
    if (!state.lessons.length) {
      wrap.innerHTML = '<div class="recent-empty"><strong>'+tx('Henüz kaydedilmiş ders yok.','No saved lessons yet.')+'</strong><span>'+tx('İlk dersini oluşturup kaydettiğinde burada görünecek.','Your first saved lesson will appear here.')+'</span><button type="button" data-open-builder>'+tx('İlk dersi oluştur →','Create your first lesson →')+'</button></div>';
      $('[data-open-builder]', wrap)?.addEventListener('click',()=>openPanel('builder'));
      return;
    }
    wrap.innerHTML = state.lessons.slice(0,3).map(recentLessonCard).join('');
    $$('[data-open-lesson]',wrap).forEach(b=>b.addEventListener('click',()=>{
      const lesson=state.lessons.find(x=>x.id===b.dataset.openLesson);
      if(lesson) loadLessonIntoBuilder(lesson);
    }));
  }

  function lessonCard(lesson) {
    const planCount = Array.isArray(lesson.plan) ? lesson.plan.length : 0;
    return `<article class="lesson-library-card" data-library-card data-search="${esc(((lesson.title||'')+' '+(lesson.topic||'')+' '+(lesson.primary_goal||'')).toLowerCase())}" data-goal="${esc(lesson.primary_goal||'')}">
      <div class="library-card-top">
        <span>${esc(lessonGoalLabel(lesson.primary_goal))}</span>
        <small>${esc(fmtDate(lesson.updated_at || lesson.created_at))}</small>
      </div>
      <h4>${esc(lesson.title || lesson.topic || 'English lesson')}</h4>
      <p>${esc(classNameFor(lesson.class_id))} · ${esc(lesson.topic || 'English')} · ${Number(lesson.duration_minutes || 0)} ${tx('dk','min')}</p>
      <div class="library-card-meta"><span>${planCount} ${tx('aşama','stages')}</span><span>${esc(lessonStatusLabel(lesson.status))}</span></div>
      <div class="library-card-actions">
        <button type="button" data-lesson-use="${esc(lesson.id)}">${tx('Düzenle / kullan','Edit / use')}</button>
        <button type="button" data-lesson-duplicate="${esc(lesson.id)}">${tx('Kopyala','Duplicate')}</button>
        <button type="button" data-lesson-print="${esc(lesson.id)}">${tx('Yazdır','Print')}</button>
        <button type="button" class="danger-lite" data-lesson-delete="${esc(lesson.id)}">${tx('Sil','Delete')}</button>
      </div>
    </article>`;
  }

  function renderLibrary() {
    const grid = $('#lessonLibraryGrid');
    if (!grid) return;
    if (!state.lessons.length) {
      grid.innerHTML = '<div class="library-empty"><strong>'+tx('Henüz kayıtlı dersin yok.','Your lesson library is empty.')+'</strong><span>'+tx('Lesson Builder ile ilk dersini oluştur, kaydet ve bundan sonra tekrar tekrar kullan.','Create and save your first lesson, then reuse it whenever you need.')+'</span><button type="button" data-empty-create>'+tx('+ İlk dersi oluştur','+ Create your first lesson')+'</button></div>';
      $('[data-empty-create]',grid)?.addEventListener('click',()=>openPanel('builder'));
      return;
    }
    grid.innerHTML = state.lessons.map(lessonCard).join('');

    $$('[data-lesson-use]',grid).forEach(b=>b.addEventListener('click',()=>{
      const lesson=state.lessons.find(x=>x.id===b.dataset.lessonUse);
      if(lesson) loadLessonIntoBuilder(lesson);
    }));
    $$('[data-lesson-duplicate]',grid).forEach(b=>b.addEventListener('click',async()=>{
      const lesson=state.lessons.find(x=>x.id===b.dataset.lessonDuplicate);
      if(!lesson) return;
      b.disabled=true;
      try{
        await window.ESCSupabase.saveEducatorLesson({
          class_id:lesson.class_id,
          title:((lesson.title||lesson.topic||'English lesson')+' · '+tx('Kopya','Copy')).slice(0,120),
          topic:lesson.topic||'English',
          duration_minutes:Number(lesson.duration_minutes||40),
          primary_goal:lesson.primary_goal||'speaking',
          plan:Array.isArray(lesson.plan)?lesson.plan:[],
          status:'ready'
        });
        window.ESCAnalytics?.track?.('educator_lesson_duplicated','other');
        await refreshData();
      }catch(err){alert(err?.message||tx('Ders kopyalanamadı.','Could not duplicate lesson.'));}
      finally{b.disabled=false;}
    }));
    $$('[data-lesson-print]',grid).forEach(b=>b.addEventListener('click',()=>{
      const lesson=state.lessons.find(x=>x.id===b.dataset.lessonPrint);
      if(lesson) printLesson(lesson);
    }));
    $$('[data-lesson-delete]',grid).forEach(b=>b.addEventListener('click',async()=>{
      const lesson=state.lessons.find(x=>x.id===b.dataset.lessonDelete);
      if(!lesson) return;
      b.disabled=true;
      try {
        await window.ESCSupabase.deleteEducatorLesson(lesson.id);
        const form=$('#lessonForm');
        if(form?.dataset.editingLessonId===lesson.id) delete form.dataset.editingLessonId;
        await refreshData();
      } catch (err) {
        alert(err?.message || tx('Ders silinemedi.','Could not delete lesson.'));
      } finally { b.disabled=false; }
    }));
    applyLibraryFilters();
  }

  function applyLibraryFilters() {
    const q = ($('#lessonLibrarySearch')?.value || '').trim().toLowerCase();
    const goal = $('#lessonLibraryGoal')?.value || 'all';
    $$('[data-library-card]').forEach(card => {
      const text = card.dataset.search || '';
      const matchText = !q || text.includes(q);
      const matchGoal = goal === 'all' || card.dataset.goal === goal;
      card.hidden = !(matchText && matchGoal);
    });
  }

  function mapTopic(topic) {
    const t=String(topic||'').toLowerCase();
    const known=['travel','food','school','hobbies','technology','daily-life'];
    if(known.includes(t)) return t;
    if(t.includes('travel')||t.includes('city')||t.includes('journey')) return 'travel';
    if(t.includes('food')||t.includes('culture')) return 'food';
    if(t.includes('school')||t.includes('education')) return 'school';
    if(t.includes('hobby')||t.includes('hobbies')) return 'hobbies';
    if(t.includes('tech')||t.includes('future')) return 'technology';
    if(t.includes('daily')||t.includes('life')) return 'daily-life';
    return 'custom';
  }

  function loadLessonIntoBuilder(lesson) {
    window.ESCAnalytics?.track?.('educator_lesson_reused','other');
    const form=$('#lessonForm');
    if(form){
      form.dataset.editingLessonId=lesson.id;
      form.dataset.classId=lesson.class_id;
    }
    const klass = state.classes.find(c=>c.id===lesson.class_id);
    const className = $('#className');
    const age = $('#ageGroup');
    const level = $('#level');
    const duration = $('#duration');
    const goal = $('#goal');
    const topic = $('#topic');
    const custom = $('#customTopic');

    if(className) className.value = klass?.name || className.value;
    if(age && klass?.age_group) age.value = klass.age_group;
    if(level && klass?.level) level.value = klass.level;
    if(duration) duration.value = String(lesson.duration_minutes || 40);
    if(goal && lesson.primary_goal) goal.value = lesson.primary_goal;

    const mapped = mapTopic(lesson.topic);
    if(topic) {
      topic.value = mapped;
      topic.dispatchEvent(new Event('change',{bubbles:true}));
    }
    if(mapped === 'custom' && custom) {
      custom.value = lesson.topic || '';
      custom.dispatchEvent(new Event('input',{bubbles:true}));
    }

    openPanel('builder');
    setTimeout(()=>{
      const plan=Array.isArray(lesson.plan)?lesson.plan:[];
      const planEl=$('#generatedPlan');
      if(planEl && plan.length){
        planEl.innerHTML=plan.map((step,i)=>{
          const duration=esc(step.duration||'');
          const title=esc(step.title||step.stage||('Stage '+(i+1)));
          const mode=esc(step.mode||'Saved');
          return '<div class="plan-row" data-stage-key="'+esc(String(step.stage||step.title||i).toLowerCase())+'" data-prompt="'+esc(step.prompt||'')+'"><span>'+duration+'</span><b>'+title+'</b><small>'+mode+'</small></div>';
        }).join('');
      }
      const first=plan[0]||{};
      if(first.prompt && $('#adaptiveQuestion')) $('#adaptiveQuestion').textContent=first.prompt;
      if($('#lessonGenerateStatus')){
        $('#lessonGenerateStatus').hidden=false;
        $('#lessonGenerateStatus').className='lesson-generate-status is-ready';
        $('#lessonGenerateStatus').textContent=tx('Kaydedilmiş ders yüklendi ✓ Değiştirip yeniden kaydedebilir veya doğrudan başlatabilirsin.','Saved lesson loaded ✓ Edit and save it again, or start it directly.');
      }
      document.querySelector('#lessonForm')?.scrollIntoView({behavior:'smooth',block:'start'});
    },180);
  }

  function printLesson(lesson) {
    window.ESCAnalytics?.track?.('educator_lesson_printed','other');
    const plan = Array.isArray(lesson.plan) ? lesson.plan : [];
    const rows = plan.map((step,i)=>`<tr><td>${i+1}</td><td>${esc(step.stage||step.title||'Stage')}</td><td>${esc(step.duration||'')}</td><td>${esc(step.prompt||step.mode||'')}</td></tr>`).join('');
    const emptyRow = '<tr><td colspan="4">'+esc(tx('Ders planı içeriği bulunamadı.','No lesson-plan content found.'))+'</td></tr>';
    const popup = window.open('','_blank','width=900,height=700');
    if(!popup) return alert(tx('Yazdırma penceresi engellendi. Tarayıcıdan açılır pencerelere izin verin.','The print window was blocked. Allow pop-ups in your browser.'));
    popup.document.write(`<!doctype html><html lang="${en()?'en':'tr'}"><head><meta charset="utf-8"><title>${esc(lesson.title||tx('Ders Planı','Lesson Plan'))}</title><style>
      body{font-family:Arial,sans-serif;color:#102d4e;margin:40px;line-height:1.5}h1{font-size:28px;margin:0 0 6px}.meta{color:#667b8e;margin-bottom:24px}
      table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #dce5ed;padding:10px;text-align:left;vertical-align:top}th{background:#f4f7fa}
      .brand{font-weight:800;margin-bottom:28px;color:#0b2f5b}@media print{body{margin:20mm}}
    </style></head><body><div class="brand">English Teacher Platform</div><h1>${esc(lesson.title||lesson.topic||tx('Ders Planı','Lesson Plan'))}</h1><div class="meta">${esc(classNameFor(lesson.class_id))} · ${esc(lesson.topic||'')} · ${esc(lessonGoalLabel(lesson.primary_goal))} · ${Number(lesson.duration_minutes||0)} ${tx('dk','min')}</div><table><thead><tr><th>#</th><th>${tx('Aşama','Stage')}</th><th>${tx('Süre','Duration')}</th><th>${tx('Not / Prompt','Note / Prompt')}</th></tr></thead><tbody>${rows||emptyRow}</tbody></table><script>window.onload=()=>window.print()<\/script></body></html>`);
    popup.document.close();
  }

  function renderReports() {
    const selectedClass=$('#reportClassFilter')?.value||'all';
    const reportRows=selectedClass==='all'?state.results:state.results.filter(r=>r.class_id===selectedClass);
    const attempts = reportRows.length;
    const scored = reportRows.filter(r => r.activity_type!=='assignment' && r.score !== null && r.score !== undefined && Number.isFinite(Number(r.score)));
    const avg = scored.length ? scored.reduce((s,r)=>s+Number(r.score),0)/scored.length : null;
    const students = new Set(reportRows.map(r=>r.student_id).filter(Boolean)).size;
    const groups = new Map();

    reportRows.forEach(r=>{
      const key=String(r.activity_type||'activity');
      if(!groups.has(key)) groups.set(key,{count:0,scores:[]});
      const g=groups.get(key); g.count++;
      if(r.activity_type!=='assignment' && r.score!==null && r.score!==undefined && Number.isFinite(Number(r.score))) g.scores.push(Number(r.score));
    });

    const sorted=[...groups.entries()].sort((a,b)=>b[1].count-a[1].count);
    const top=sorted[0]?.[0] || '—';

    if($('#reportAttemptCount')) $('#reportAttemptCount').textContent=String(attempts);
    if($('#reportAverageScore')) $('#reportAverageScore').textContent=avg===null?'—':Math.round(avg)+'%';
    if($('#reportStudentCount')) $('#reportStudentCount').textContent=String(students);
    if($('#reportTopActivity')) $('#reportTopActivity').textContent=top==='—'?'—':top.replace(/[-_]/g,' ');

    const bars=$('#reportActivityBars');
    if(bars){
      if(!sorted.length) bars.innerHTML='<div class="report-empty-line">'+tx('Henüz öğrenci sonucu yok.','No student results yet.')+'</div>';
      else bars.innerHTML=sorted.slice(0,5).map(([name,g])=>{
        const gavg=g.scores.length?g.scores.reduce((a,b)=>a+b,0)/g.scores.length:null;
        const pct=gavg===null?Math.min(100,Math.round((g.count/Math.max(1,attempts))*100)):Math.max(0,Math.min(100,Math.round(gavg)));
        const label=gavg===null?g.count+' '+tx('kayıt','records'):Math.round(gavg)+'%';
        return '<div><b>'+esc(name.replace(/[-_]/g,' '))+'</b><i><span style="--v:'+pct+'%"></span></i><em>'+esc(label)+'</em></div>';
      }).join('');
    }

    const scope=$('#reportScopeLabel');
    if(scope) scope.textContent=selectedClass==='all'?tx('TÜM SINIFLAR','ALL CLASSES'):(classNameFor(selectedClass)+' · '+tx('SINIF VERİSİ','CLASS DATA'));
    const headline=$('#reportHeadline'), sub=$('#reportSubline');
    if(headline) headline.textContent=attempts ? (avg===null ? attempts+' '+tx('öğrenci sonucu','student results') : Math.round(avg)+'% '+tx('genel ortalama','overall average')) : tx('Henüz yeterli veri yok','Not enough data yet');
    if(sub) sub.textContent=attempts ? tx('Bu özet gerçek öğrenci sonuçlarından hesaplanır.','This summary is calculated from real student results.') : tx('Öğrenciler etkinlik tamamladıkça sonuçlar burada gerçek zamanlı özetlenir.','Results are summarised here as students complete activities.');

    const scoredGroups=sorted.map(([name,g])=>({name,avg:g.scores.length?g.scores.reduce((a,b)=>a+b,0)/g.scores.length:null,count:g.count})).filter(x=>x.avg!==null).sort((a,b)=>a.avg-b.avg);
    const weakest=scoredGroups[0];
    const title=$('#reportInsightTitle'), text=$('#reportInsightText'), tags=$('#reportInsightTags');
    if(weakest){
      if(title) title.textContent=weakest.name.replace(/[-_]/g,' ')+' '+tx('tekrarını planla.','needs review.');
      if(text) text.textContent=tx('Bu etkinlik türünde ortalama ','Average for this activity: ')+Math.round(weakest.avg)+'%. '+tx('Sonraki derste kısa bir tekrar veya farklılaştırılmış etkinlik eklemek mantıklı.','A short review or differentiated activity in the next lesson may help.');
      if(tags) tags.innerHTML='<span>'+esc(weakest.name.replace(/[-_]/g,' '))+'</span><span>'+Math.round(weakest.avg)+'%</span>';
    } else {
      if(title) title.textContent=attempts?tx('Daha fazla puanlı etkinlik çalıştır.','Run more scored activities.'):tx('Önce bir canlı etkinlik çalıştır.','Run a live activity first.');
      if(text) text.textContent=attempts?tx('Sonuç kaydı var; puanlı etkinlikler arttıkça zayıf beceriyi otomatik belirleyebiliriz.','Results exist; more scored activities will make skill recommendations more reliable.'):tx('Platform, sonuçlar geldikçe hangi beceriyi tekrar etmenin daha mantıklı olduğunu gösterecek.','As results arrive, the platform will suggest what may need review.');
      if(tags) tags.innerHTML='';
    }
  }


  function dueLabel(value){
    if(!value) return tx('Son tarih yok','No due date');
    try{
      return new Intl.DateTimeFormat(en()?'en-GB':'tr-TR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
    }catch{return '';}
  }

  function populateAssignmentControls(){
    const cls=$('#assignmentClass'), lesson=$('#assignmentLesson');
    if(cls){
      const prev=cls.value;
      cls.innerHTML='<option value="">'+tx('Önce sınıf seç','Choose a class')+'</option>'+state.classes.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join('');
      if([...cls.options].some(o=>o.value===prev)) cls.value=prev;
    }
    if(lesson){
      const prev=lesson.value;
      const classId=cls?.value||'';
      const lessons=classId?state.lessons.filter(x=>x.class_id===classId):[];
      lesson.disabled=!classId;
      lesson.innerHTML='<option value="">'+(classId?tx('Ders seçmeden devam et','Continue without a saved lesson'):tx('Önce sınıf seç','Choose a class first'))+'</option>'+lessons.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.title||x.topic||'English lesson')+'</option>').join('');
      if([...lesson.options].some(o=>o.value===prev)) lesson.value=prev;
    }
  }

  function renderAssignments(){
    populateAssignmentControls();
    const wrap=$('#assignmentList');
    if(!wrap) return;
    if(!state.assignments.length){
      wrap.innerHTML='<div class="assignment-empty"><strong>'+tx('Henüz ödev yok.','No assignments yet.')+'</strong><span>'+tx('İlk görevi oluşturduğunda öğrencilerin sınıf ekranında görünecek.','Your first published task will appear automatically on the student class screen.')+'</span></div>';
      return;
    }
    wrap.innerHTML=state.assignments.map(a=>{
      const klass=classNameFor(a.class_id);
      const status=a.status==='published'?tx('Yayında','Published'):a.status==='closed'?tx('Kapalı','Closed'):tx('Taslak','Draft');
      const code=state.classes.find(x=>x.id===a.class_id)?.join_code||'';
      const submissionRows=state.results.filter(r=>r.activity_type==='assignment' && r.payload?.assignment_id===a.id);
      const uniqueMap=new Map();
      submissionRows.forEach(r=>{if(!uniqueMap.has(r.student_id))uniqueMap.set(r.student_id,r);});
      const submissions=[...uniqueMap.values()];
      const detail=submissions.length?'<details class="assignment-submissions"><summary>'+tx('Teslimleri gör','View submissions')+' <b>'+submissions.length+'</b></summary><div>'+submissions.map(r=>{
        const score=(r.score===null||typeof r.score==='undefined')?'':String(Math.round(Number(r.score)||0));
        const feedback=r.payload?.teacher_feedback||'';
        return '<article class="assignment-submission-item"><div class="assignment-submission-head"><strong>'+esc(studentNameFor(r.student_id))+'</strong><small>'+esc(fmtDate(r.created_at))+'</small></div><span class="assignment-response">'+esc(r.payload?.response||tx('Not bırakmadı.','No written note.'))+'</span><div class="assignment-grade-box"><label>'+tx('Puan','Score')+'<input type="number" min="0" max="100" step="1" value="'+esc(score)+'" data-grade-score="'+esc(r.id)+'" placeholder="—"></label><label>'+tx('Öğretmen geri bildirimi','Teacher feedback')+'<textarea rows="2" maxlength="1200" data-grade-feedback="'+esc(r.id)+'" placeholder="'+esc(tx('Kısa ve uygulanabilir geri bildirim yaz.','Write short, actionable feedback.'))+'">'+esc(feedback)+'</textarea></label><button type="button" data-assignment-grade="'+esc(r.id)+'">'+tx('Geri bildirimi kaydet','Save feedback')+'</button></div></article>';
      }).join('')+'</div></details>':'';
      return '<article class="assignment-card"><div class="assignment-card-top"><span class="assignment-status '+esc(a.status)+'">'+esc(status)+'</span><small>'+esc(dueLabel(a.due_at))+'</small></div><h4>'+esc(a.title)+'</h4><p>'+esc(klass)+(a.instructions?' · '+esc(a.instructions):'')+'</p><div class="assignment-submission-count"><b>'+submissions.length+'</b><span>'+tx('teslim','submissions')+'</span></div>'+detail+'<div class="assignment-card-actions"><button type="button" data-assignment-share="'+esc(a.id)+'" data-class-code="'+esc(code)+'">'+tx('Öğrenci linkini kopyala','Copy student link')+'</button><button type="button" data-assignment-toggle="'+esc(a.id)+'">'+(a.status==='published'?tx('Kapat','Close'):tx('Yayınla','Publish'))+'</button><button type="button" class="danger-lite" data-assignment-delete="'+esc(a.id)+'">'+tx('Sil','Delete')+'</button></div></article>';
    }).join('');

    $$('[data-assignment-share]',wrap).forEach(b=>b.addEventListener('click',async()=>{
      const code=b.dataset.classCode||'';
      const url=new URL('../join/?code='+encodeURIComponent(code)+'#assignmentZone',location.href).href;
      try{
        await navigator.clipboard.writeText(url);
        const old=b.textContent;b.textContent=tx('Kopyalandı ✓','Copied ✓');setTimeout(()=>b.textContent=old,1200);
      }catch{}
    }));
    $$('[data-assignment-grade]',wrap).forEach(b=>b.addEventListener('click',async()=>{
      const id=b.dataset.assignmentGrade;
      const score=wrap.querySelector('[data-grade-score="'+CSS.escape(id)+'"]')?.value ?? '';
      const feedback=wrap.querySelector('[data-grade-feedback="'+CSS.escape(id)+'"]')?.value.trim() || '';
      const old=b.textContent;
      b.disabled=true;b.textContent=tx('Kaydediliyor…','Saving…');
      try{
        await window.ESCSupabase.gradeEducatorAssignmentResult(id,score,feedback);
        b.textContent=tx('Kaydedildi ✓','Saved ✓');
        setTimeout(()=>{b.textContent=old;},1100);
        await refreshData();
        window.ESCAnalytics?.track?.('educator_assignment_feedback_saved','other');
      }catch(err){
        b.textContent=tx('Tekrar dene','Try again');
        setTimeout(()=>{b.textContent=old;},1300);
        alert(err?.message||tx('Geri bildirim kaydedilemedi.','Could not save feedback.'));
      }finally{b.disabled=false;}
    }));

    $$('[data-assignment-toggle]',wrap).forEach(b=>b.addEventListener('click',async()=>{
      const a=state.assignments.find(x=>x.id===b.dataset.assignmentToggle);if(!a)return;
      b.disabled=true;
      try{await window.ESCSupabase.updateAssignment(a.id,{status:a.status==='published'?'closed':'published'});await refreshData();}
      catch(err){alert(err?.message||tx('Ödev güncellenemedi.','Could not update assignment.'));}
      finally{b.disabled=false;}
    }));
    $$('[data-assignment-delete]',wrap).forEach(b=>b.addEventListener('click',async()=>{
      const a=state.assignments.find(x=>x.id===b.dataset.assignmentDelete);if(!a)return;
      if(!confirm(tx('Bu ödev silinsin mi?','Delete this assignment?')))return;
      b.disabled=true;
      try{await window.ESCSupabase.deleteAssignment(a.id);await refreshData();}
      catch(err){alert(err?.message||tx('Ödev silinemedi.','Could not delete assignment.'));}
      finally{b.disabled=false;}
    }));
  }

  async function submitAssignmentForm(e){
    e.preventDefault();
    const classId=$('#assignmentClass')?.value||'';
    const lessonId=$('#assignmentLesson')?.value||'';
    const title=$('#assignmentTitle')?.value.trim()||'';
    if(!classId||!title)return;
    const button=$('#assignmentSubmit');if(button)button.disabled=true;
    try{
      const lesson=state.lessons.find(x=>x.id===lessonId);
      const dueRaw=$('#assignmentDue')?.value||'';
      await window.ESCSupabase.createAssignment({
        class_id:classId,
        lesson_id:lessonId||null,
        title,
        instructions:$('#assignmentInstructions')?.value.trim()||null,
        due_at:dueRaw?new Date(dueRaw).toISOString():null,
        status:$('#assignmentStatus')?.value||'published',
        payload:lesson?{lesson_title:lesson.title||lesson.topic,topic:lesson.topic,goal:lesson.primary_goal,plan:lesson.plan||[]}:{}
      });
      window.ESCAnalytics?.track?.('educator_assignment_created','other');
      e.currentTarget.reset();
      await refreshData();
    }catch(err){alert(err?.message||tx('Ödev oluşturulamadı.','Could not create assignment.'));}
    finally{if(button)button.disabled=false;}
  }


  function fmtTime(value){
    try{return new Intl.DateTimeFormat(en()?'en-GB':'tr-TR',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value));}
    catch{return '';}
  }

  function plannerTargetLabel(event){
    if(event.class_id)return classNameFor(event.class_id);
    if(event.private_student_id)return state.privateStudents.find(s=>s.id===event.private_student_id)?.display_name||tx('Özel öğrenci','Private student');
    return tx('Serbest ders','Independent lesson');
  }

  function populatePlannerTargets(){
    const select=$('#plannerTarget');if(!select)return;
    const prev=select.value;
    select.innerHTML='<option value="">'+tx('Serbest ders / bağlantısız','Independent lesson / no link')+'</option>'
      +state.classes.map(x=>'<option value="class:'+esc(x.id)+'">'+tx('Sınıf: ','Class: ')+esc(x.name)+'</option>').join('')
      +state.privateStudents.map(x=>'<option value="private:'+esc(x.id)+'">'+tx('Özel: ','Private: ')+esc(x.display_name)+'</option>').join('');
    if([...select.options].some(o=>o.value===prev))select.value=prev;
  }

  function renderPlanner(){
    populatePlannerTargets();
    const list=$('#plannerList');if(!list)return;
    const active=state.schedule.filter(x=>x.status!=='cancelled');
    if(!active.length){
      list.innerHTML='<div class="planner-empty"><strong>'+tx('Takvimde ders yok.','No lessons scheduled.')+'</strong><span>'+tx('İlk dersini eklediğinde burada kronolojik olarak görünecek.','Your upcoming lessons will appear here in chronological order.')+'</span></div>';
      return;
    }
    list.innerHTML=active.map(ev=>{
      const status=ev.status==='completed'?tx('Tamamlandı','Completed'):tx('Planlandı','Scheduled');
      return '<article class="planner-event '+esc(ev.status)+'"><div class="planner-event-time"><b>'+esc(fmtTime(ev.starts_at))+'</b><span>'+Number(ev.duration_minutes||40)+' '+tx('dk','min')+'</span></div><div class="planner-event-copy"><small>'+esc(plannerTargetLabel(ev))+'</small><strong>'+esc(ev.title)+'</strong><p>'+esc(ev.notes||'')+'</p></div><div class="planner-event-actions">'+(ev.status==='completed'?'':'<button type="button" data-planner-complete="'+esc(ev.id)+'">'+tx('Tamamla','Complete')+'</button>')+'<button type="button" class="danger-lite" data-planner-delete="'+esc(ev.id)+'">'+tx('Sil','Delete')+'</button></div></article>';
    }).join('');
    $$('[data-planner-complete]',list).forEach(b=>b.addEventListener('click',async()=>{
      b.disabled=true;try{await window.ESCSupabase.updateScheduleEvent(b.dataset.plannerComplete,{status:'completed'});await refreshData();}catch(err){alert(err?.message||tx('Plan güncellenemedi.','Could not update event.'));}finally{b.disabled=false;}
    }));
    $$('[data-planner-delete]',list).forEach(b=>b.addEventListener('click',async()=>{
      if(!confirm(tx('Bu plan silinsin mi?','Delete this event?')))return;
      b.disabled=true;try{await window.ESCSupabase.deleteScheduleEvent(b.dataset.plannerDelete);await refreshData();}catch(err){alert(err?.message||tx('Plan silinemedi.','Could not delete event.'));}finally{b.disabled=false;}
    }));
  }

  function renderTodayPlanner(){
    const wrap=$('#todayPlannerList');if(!wrap)return;
    const now=new Date();
    const upcoming=state.schedule.filter(x=>x.status==='scheduled'&&new Date(x.starts_at)>=new Date(now.getTime()-60*60*1000)).slice(0,3);
    if(!upcoming.length){
      wrap.innerHTML='<div class="today-planner-empty"><span>○</span><p><b>'+tx('Yaklaşan ders yok.','No upcoming lessons.')+'</b><small>'+tx('Planlayıcıdan bugünün veya haftanın derslerini ekle.','Add today’s or this week’s lessons from Planner.')+'</small></p></div>';
      return;
    }
    wrap.innerHTML=upcoming.map(ev=>'<button type="button" class="today-plan-item" data-panel-target="planner"><span>'+esc(new Intl.DateTimeFormat(en()?'en-GB':'tr-TR',{hour:'2-digit',minute:'2-digit'}).format(new Date(ev.starts_at)))+'</span><p><b>'+esc(ev.title)+'</b><small>'+esc(plannerTargetLabel(ev))+' · '+Number(ev.duration_minutes||40)+' '+tx('dk','min')+'</small></p><em>→</em></button>').join('');

    const first=upcoming[0],card=$('.next-lesson-card');
    if(card&&first){
      const head=$('.card-head b',card);if(head)head.textContent=fmtTime(first.starts_at);
      const h=$('h3',card);if(h)h.textContent=first.title;
      const p=$('p',card);if(p)p.textContent=plannerTargetLabel(first)+' · '+Number(first.duration_minutes||40)+' '+tx('dk','min');
    }
  }

  async function submitPlannerForm(e){
    e.preventDefault();
    const rawTarget=$('#plannerTarget')?.value||'';
    const title=$('#plannerTitle')?.value.trim()||'';
    const start=$('#plannerStart')?.value||'';
    if(!title||!start)return;
    const payload={
      title,starts_at:new Date(start).toISOString(),duration_minutes:Number($('#plannerDuration')?.value||40),
      notes:$('#plannerNotes')?.value.trim()||null,status:'scheduled'
    };
    if(rawTarget.startsWith('class:'))payload.class_id=rawTarget.slice(6);
    if(rawTarget.startsWith('private:'))payload.private_student_id=rawTarget.slice(8);
    const b=$('#plannerSubmit');if(b)b.disabled=true;
    try{
      await window.ESCSupabase.createScheduleEvent(payload);
      window.ESCAnalytics?.track?.('educator_schedule_created','other');
      e.currentTarget.reset();
      setPlannerDefaultStart();
      await refreshData();
    }catch(err){alert(err?.message||tx('Plan eklenemedi.','Could not add event.'));}
    finally{if(b)b.disabled=false;}
  }

  function setPlannerDefaultStart(){
    const input=$('#plannerStart');if(!input||input.value)return;
    const d=new Date();d.setMinutes(Math.ceil(d.getMinutes()/15)*15+60);
    const local=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
    input.value=local;
  }

  async function refreshData() {
    if(!window.ESCSupabase?.isConfigured?.()) return;
    const session=await window.ESCSupabase.getSession().catch(()=>null);
    if(!session) return;
    try {
      const fromDate=new Date();
      fromDate.setHours(0,0,0,0);
      const from=fromDate.toISOString();
      const to=new Date(Date.now()+90*24*60*60*1000).toISOString();
      const [classes,lessons,results,sessions,assignments,privateStudents,schedule]=await Promise.all([
        window.ESCSupabase.listEducatorClasses(),
        window.ESCSupabase.listEducatorLessons(150),
        window.ESCSupabase.listEducatorResults(1000),
        window.ESCSupabase.listEducatorSessions(150),
        window.ESCSupabase.listAssignments(150),
        window.ESCSupabase.listPrivateStudents(),
        window.ESCSupabase.listScheduleEvents(from,to,300)
      ]);
      state.classes=classes||[];
      state.lessons=lessons||[];
      state.results=results||[];
      state.sessions=sessions||[];
      state.assignments=assignments||[];
      state.privateStudents=privateStudents||[];
      state.schedule=schedule||[];
      state.ready=true;
      const reportSelect=$('#reportClassFilter');
      if(reportSelect){
        const previous=reportSelect.value||'all';
        reportSelect.innerHTML='<option value="all">'+tx('Tüm sınıflar','All classes')+'</option>'+state.classes.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join('');
        if([...reportSelect.options].some(o=>o.value===previous)) reportSelect.value=previous;
      }
      renderSetup();renderRecent();renderLibrary();renderAssignments();renderPlanner();renderTodayPlanner();renderReports();
    } catch(err) {
      console.warn('Educators product refresh failed',err);
    }
  }

  function bind() {
    const dateLabel = $('#workspaceDateLabel');
    if (dateLabel) {
      const now = new Date();
      const locale=en()?'en-GB':'tr-TR';
      const label = new Intl.DateTimeFormat(locale,{weekday:'long',day:'numeric',month:'long'}).format(now);
      dateLabel.textContent = label.toLocaleUpperCase(locale) + ' · '+tx('ÖĞRETMEN ALANI','TEACHER SPACE');
    }
    setupActions();
    setPlannerDefaultStart();

    document.addEventListener('click',e=>{
      const fresh=e.target.closest('[data-panel-target="builder"],[data-open-builder],[data-empty-create],#curriculumBuildLesson');
      if(!fresh)return;
      const form=$('#lessonForm');
      if(form) delete form.dataset.editingLessonId;
    });
    $('#lessonLibrarySearch')?.addEventListener('input',applyLibraryFilters);
    $('#lessonLibraryGoal')?.addEventListener('change',applyLibraryFilters);
    $('#refreshLessonLibrary')?.addEventListener('click',refreshData);
    $('#reportClassFilter')?.addEventListener('change',renderReports);
    $('#refreshReports')?.addEventListener('click',refreshData);
    $('#refreshAssignments')?.addEventListener('click',refreshData);
    $('#assignmentForm')?.addEventListener('submit',submitAssignmentForm);
    $('#assignmentClass')?.addEventListener('change',()=>{
      const title=$('#assignmentTitle'), instructions=$('#assignmentInstructions');
      if($('#assignmentLesson')) $('#assignmentLesson').value='';
      if(title) title.value='';
      if(instructions) instructions.value='';
      populateAssignmentControls();
    });
    $('#plannerForm')?.addEventListener('submit',submitPlannerForm);
    $('#refreshPlanner')?.addEventListener('click',refreshData);
    $('#plannerTarget')?.addEventListener('change',()=>{
      const raw=$('#plannerTarget')?.value||'';
      if($('#plannerTitle')?.value.trim())return;
      if(raw.startsWith('class:'))$('#plannerTitle').value=state.classes.find(x=>x.id===raw.slice(6))?.name||'';
      if(raw.startsWith('private:'))$('#plannerTitle').value=(state.privateStudents.find(x=>x.id===raw.slice(8))?.display_name||'')+' · Private';
    });
    $('#assignmentLesson')?.addEventListener('change',()=>{
      const lesson=state.lessons.find(x=>x.id===$('#assignmentLesson')?.value);
      if(lesson && $('#assignmentTitle') && !$('#assignmentTitle').value.trim()) $('#assignmentTitle').value=lesson.title||lesson.topic||'';
      if(lesson && $('#assignmentInstructions') && !$('#assignmentInstructions').value.trim()) $('#assignmentInstructions').value=tx('Ders planındaki görevi tamamla ve derste tekrar konuşmaya hazır gel.','Complete the task from this lesson and come ready to use it again in class.');
    });

    ['saveDemoClass','startDemoLesson'].forEach(id=>{
      $('#'+id)?.addEventListener('click',()=>setTimeout(refreshData,1100));
    });

    document.addEventListener('esc:educator-ready',refreshData);
    window.addEventListener('esc:languagechange',()=>{
      const date=$('#workspaceDateLabel');
      if(date){const now=new Date(),locale=en()?'en-GB':'tr-TR';date.textContent=new Intl.DateTimeFormat(locale,{weekday:'long',day:'numeric',month:'long'}).format(now).toLocaleUpperCase(locale)+' · '+tx('ÖĞRETMEN ALANI','TEACHER SPACE');}
      renderRecent();renderLibrary();renderAssignments();renderPlanner();renderTodayPlanner();renderReports();
    });
    document.addEventListener('visibilitychange',()=>{if(!document.hidden) refreshData();});
    setTimeout(refreshData,500);
    setTimeout(refreshData,1800);
  }

  window.ESCEduProduct={
    async loadLessonById(id){
      let lesson=state.lessons.find(x=>x.id===id);
      if(!lesson){
        lesson=await window.ESCSupabase.getEducatorLesson(id).catch(()=>null);
        if(lesson){
          state.lessons=[lesson,...state.lessons.filter(x=>x.id!==lesson.id)];
        }
      }
      if(!lesson)return false;
      loadLessonIntoBuilder(lesson);
      return true;
    }
  };

  document.addEventListener('DOMContentLoaded',bind);
})();