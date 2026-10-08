(() => {
  'use strict';
  const $=q=>document.querySelector(q);
  const TOKEN_KEY='esc-edu-student-token-v1';
  const NAME_KEY='esc-edu-student-name-v1';
  const CLASS_CODE_KEY='esc-edu-student-class-code-v1';
  const LANG_KEY='esc-student-lang-v1';
  let token='', state=null, poll=null, lastSignature='', lang='tr', assignmentHashHandled=false;
  const tx=(tr,en)=>lang==='en'?en:tr;
  const esc=(v='')=>String(v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));

  function randomToken(){
    const a=new Uint8Array(32);crypto.getRandomValues(a);
    return [...a].map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  function showMessage(text,ok=false){const el=$('#joinMessage');el.textContent=text;el.hidden=!text;el.classList.toggle('ok',ok);}
  function friendly(err){
    const s=String(err?.message||err||tx('Katılım tamamlanamadı.','Could not join the class.'));
    if(s.includes('CLASS_NOT_FOUND'))return tx('Bu sınıf kodu bulunamadı veya sınıf kapalı.','This class code was not found or the class is closed.');
    if(s.includes('CLASS_FULL'))return tx('Bu sınıfın kontenjanı dolu.','This class is full.');
    if(s.includes('INVALID_NAME'))return tx('Lütfen adını yaz.','Enter your name.');
    if(s.includes('INVALID_CLASS_CODE'))return tx('Sınıf kodunu kontrol et.','Check the class code.');
    if(s.includes('TOKEN_CLASS_MISMATCH'))return tx('Bu cihazdaki eski sınıf oturumu yenilendi. Tekrar katıl.','Your previous class session was reset. Please join again.');
    if(s.includes('STUDENT_SESSION_NOT_FOUND'))return tx('Öğrenci oturumun bulunamadı. Yeniden katıl.','Your student session was not found. Join again.');
    return s;
  }
  function setConnected(ok){
    const pill=$('.connection-pill');pill?.classList.toggle('offline',!ok);
    $('#connectionText').textContent=ok?tx('Bağlı','Connected'):tx('Yeniden bağlanıyor…','Reconnecting…');
  }
  function signature(d){return JSON.stringify([d?.class?.id,d?.teacher,d?.session?.id,d?.session?.status,d?.session?.current_index,d?.session?.current_stage,d?.session?.current_payload,d?.session?.scores,d?.lesson,d?.student_progress,d?.assignment_summary,d?.upcoming_class,d?.recent_lessons,d?.assignments]);}

  function applyLanguage(next){
    lang=next==='en'?'en':'tr';
    document.documentElement.lang=lang;
    document.title=tx('Sınıfa Katıl · LanguageLab Öğrenci Paneli','Join Class · LanguageLab Öğrenci Paneli');
    const meta=document.querySelector('meta[name="description"]');
    if(meta)meta.setAttribute('content',tx('Öğretmeninin verdiği sınıf koduyla derse ve ödevlere katıl.','Join lessons and assignments with the class code from your teacher.'));
    try{localStorage.setItem(LANG_KEY,lang);}catch{}
    document.querySelectorAll('[data-join-lang]').forEach(b=>b.classList.toggle('active',b.dataset.joinLang===lang));
    const set=(sel,tr,en)=>{const el=$(sel);if(el)el.textContent=tx(tr,en);};
    const setLabel=(sel,tr,en)=>{const el=$(sel);if(el?.firstChild)el.firstChild.nodeValue=tx(tr,en)+' ';};
    set('.join-kicker','ÖĞRENCİ GİRİŞİ','STUDENT JOIN');
    set('.join-card h1','Sınıfına katıl.','Join your class.');
    set('.join-card>p','Öğretmeninin verdiği sınıf kodunu ve adını gir. Öğrenci hesabı veya e-posta gerekmez.','Enter the class code from your teacher and your name. No student account or email is required.');
    setLabel('#joinForm label:nth-of-type(1)','Sınıf kodu','Class code');
    setLabel('#joinForm label:nth-of-type(2)','Adın','Your name');
    set('#joinButton','Sınıfa katıl →','Join class →');
    set('.join-safe b','Basit öğrenci girişi','Simple student access');
    set('.join-safe small','Bu ekran için e-posta, telefon numarası veya şifre istemiyoruz.','No email, phone number or password is required on this screen.');
    set('.join-help p:nth-of-type(1) b','Kodu gir','Enter the code');
    set('.join-help p:nth-of-type(1) small','Öğretmenin verdiği sınıf kodunu kullan.','Use the class code from your teacher.');
    set('.join-help p:nth-of-type(2) b','Adını yaz','Enter your name');
    set('.join-help p:nth-of-type(2) small','Sınıfta görünecek kısa adını kullan.','Use the short name you want shown in class.');
    set('.join-help p:nth-of-type(3) b','Ekranı açık tut','Keep the screen open');
    set('.join-help p:nth-of-type(3) small','Öğretmen soru değiştirdikçe ekranın otomatik yenilenir.','Your screen updates automatically when the teacher changes the activity.');
    set('#completedState small','DERS TAMAMLANDI','CLASS COMPLETED');
    set('#completedState h2','Harika iş!','Good work!');
    set('#completedState p','Ders sona erdi. Öğretmenin yeni bir oturum başlatırsa bu ekran yeniden güncellenebilir.','The lesson has ended. This screen will update again if your teacher starts a new session.');
    set('.sync-note','Ders akışını öğretmen yönetir. Ekranın otomatik güncellenir.','Your teacher controls the lesson flow. Your screen updates automatically.');
    set('#waitingState>small',"BAĞLANDIN","YOU'RE IN");
    set('#waitingState h2','Öğretmenin dersi başlatmasını bekliyoruz.','Waiting for your teacher to start the lesson.');
    set('#waitingState p','Bu ekran açık kalsın. Ders veya oyun başladığında otomatik olarak güncellenecek.','Keep this screen open. It updates automatically when a lesson or game starts.');
    set('[data-jt="joinedAs"]','KATILAN','JOINED AS');
    set('[data-jt="leave"]','Ayrıl','Leave');
    set('[data-jt="assignmentsKicker"]','ÖDEVLER','ASSIGNMENTS');
    set('[data-jt="assignmentsTitle"]','Sınıf ödevlerin','Your class assignments');
    set('#studentHowCard .student-how-head small','BU EKRAN NASIL KULLANILIR?','HOW DO I USE THIS SCREEN?');
    set('#studentHowCard .student-how-head strong','Öğrenci tarafında yapman gerekenler basit.','The student side is intentionally simple.');
    const howTexts=[
      [tx('Ekranı açık tut','Keep the screen open'),tx('Öğretmen aşamayı değiştirdiğinde ekran otomatik yenilenir.','Your screen updates automatically when the teacher changes the stage.')],
      [tx('Ortadaki görevi yap','Do the task in the middle'),tx('O anda yalnızca ekrandaki soru veya etkinliğe odaklan.','Focus only on the current question or activity.')],
      [tx('Cevap verdiysen işaretle','Mark it when you answer'),tx('“Cevap verdim” öğretmene katılım sinyali gönderir.','“I answered” sends a participation signal to your teacher.')],
      [tx('Takıldıysan yardım iste','Ask for help if you are stuck'),tx('“Yardıma ihtiyacım var” öğretmenin sonraki yönlendirmesine yardımcı olur.','“I need help” tells your teacher you need support on this stage.')]
    ];
    document.querySelectorAll('#studentHowBody>div').forEach((row,i)=>{const strong=row.querySelector('strong'),small=row.querySelector('small');if(strong)strong.textContent=howTexts[i]?.[0]||'';if(small)small.textContent=howTexts[i]?.[1]||'';});
    set('#studentLessonKicker','BUGÜNKÜ DERS','TODAY\'S LESSON');
    set('#studentDashboardKicker','SINIFIM','MY CLASS');
    set('#studentDashboardContext','Sınıf bilgilerin ve bugün yapman gerekenler burada.','Your class information and what to do today are here.');
    set('.student-teacher-card small','ÖĞRETMEN','TEACHER');
    const statLabels=document.querySelectorAll('.student-dashboard-stats article');
    if(statLabels[0]){statLabels[0].querySelector('small').textContent=tx('YAPILACAK ÖDEV','ASSIGNMENTS TO DO');statLabels[0].querySelector('span').textContent=tx('bekleyen görev','pending tasks');}
    if(statLabels[1]){statLabels[1].querySelector('small').textContent=tx('TAMAMLANDI','COMPLETED');statLabels[1].querySelector('span').textContent=tx('ödev','assignments');}
    if(statLabels[2]){statLabels[2].querySelector('small').textContent=tx('GERİ BİLDİRİM','FEEDBACK');statLabels[2].querySelector('span').textContent=tx('öğretmenden','from teacher');}
    set('.student-now-card>small','ŞİMDİ NE YAPMALIYIM?','WHAT SHOULD I DO NOW?');
    set('.student-upcoming-card>small','SIRADAKİ PLANLI DERS','NEXT SCHEDULED CLASS');
    set('.student-history-head small','GEÇMİŞ DERSLER','LESSON HISTORY');
    set('.student-history-head strong','Son derslerin','Your recent lessons');
    set('.student-history-head p','Katıldığın dersleri ve kendi katılım işaretlerini burada görebilirsin.','See recent lessons and your own participation signals here.');
    const actionButtons=document.querySelectorAll('#studentAction button');
    if(actionButtons[0]){actionButtons[0].querySelector('span').textContent=tx('Cevap verdim ✓','I answered ✓');actionButtons[0].querySelector('small').textContent=tx('Katıldığını öğretmene bildir','Tell your teacher you participated');}
    if(actionButtons[1]){actionButtons[1].querySelector('span').textContent=tx('Yardıma ihtiyacım var','I need help');actionButtons[1].querySelector('small').textContent=tx('Bu aşamada desteğe ihtiyacın olduğunu bildir','Tell your teacher you need support on this stage');}
    const summary=document.querySelectorAll('.student-activity-summary>div');
    if(summary[0]){summary[0].querySelector('small').textContent=tx('KATILIM','PARTICIPATION');summary[0].querySelector('span').textContent=tx('işaretlenen aşama','marked stages');}
    if(summary[1]){summary[1].querySelector('small').textContent=tx('YARDIM İSTEĞİ','HELP REQUESTS');summary[1].querySelector('span').textContent=tx('işaretlenen aşama','marked stages');}
    const assignmentNote=$('.assignment-zone-head p');if(assignmentNote)assignmentNote.textContent=tx('Canlı dersten ayrı çalışır. Yayınlanmış ödevlerin burada kalır.','Assignments are separate from the live lesson and stay here while published.');
    const link=$('[data-jt="teacherLink"]');if(link)link.innerHTML=tx('Öğretmen misiniz? <b>Öğretmen paneli →</b>','Are you a teacher? <b>Teacher platform →</b>');
    if(state){ renderStudentDashboard(state); renderAssignments(state.assignments||[]); renderLessonOverview(state); renderRecentLessons(state.recent_lessons||[]); }
  }

  function fmtDateTime(value){
    if(!value)return '';
    try{return new Intl.DateTimeFormat(lang==='en'?'en-GB':'tr-TR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value));}catch{return '';}
  }

  function renderStudentDashboard(d){
    const student=d?.student||{};
    const klass=d?.class||{};
    const teacher=d?.teacher||{};
    const summary=d?.assignment_summary||{};
    const session=d?.session;
    const upcoming=d?.upcoming_class;
    const assignments=Array.isArray(d?.assignments)?d.assignments:[];
    const pending=assignments.find(a=>!a.completed&&!a.overdue);

    $('#studentDashboardGreeting').textContent=tx('Merhaba ','Hi ')+(student.display_name||'')+' 👋';
    $('#studentTeacherName').textContent=teacher.display_name||'Teacher';
    $('#studentClassSummary').textContent=[klass.level,String(klass.focus||'').toUpperCase()].filter(Boolean).join(' · ');
    $('#studentTodoCount').textContent=String(Number(summary.todo||0));
    $('#studentCompletedCount').textContent=String(Number(summary.completed||0));
    $('#studentFeedbackCount').textContent=String(Number(summary.feedback_count||0));

    const nowTitle=$('#studentNowTitle'),nowText=$('#studentNowText'),action=$('#studentNowAction');
    let target='';
    if(session && session.status!=='completed'){
      nowTitle.textContent=tx('Canlı dersin devam ediyor.','Your live lesson is in progress.');
      nowText.textContent=tx('Aşağıdaki mevcut etkinliği yap ve öğretmen aşamayı değiştirdikçe ekranı takip et.','Complete the current activity below and follow the screen as your teacher changes stages.');
      action.textContent=tx('Canlı derse git →','Go to live lesson →');
      target='liveState';
    }else if(pending){
      nowTitle.textContent=tx('Bekleyen bir ödevin var.','You have an assignment to do.');
      nowText.textContent=pending.title||tx('Ödevler bölümünü aç ve görevini tamamla.','Open assignments and complete your task.');
      action.textContent=tx('Ödevlere git →','Go to assignments →');
      target='assignmentZone';
    }else if(upcoming){
      nowTitle.textContent=tx('Şimdilik tamam. Sıradaki dersini bekleyebilirsin.','You are caught up. Wait for your next class.');
      nowText.textContent=tx('Sıradaki planlı ders: ','Next scheduled class: ')+fmtDateTime(upcoming.starts_at);
      action.textContent=tx('Geçmiş derslere bak →','View lesson history →');
      target='studentHistoryZone';
    }else{
      nowTitle.textContent=tx('Şu anda yapman gereken zorunlu bir görev yok.','There is nothing urgent to do right now.');
      nowText.textContent=tx('Yeni ders veya ödev geldiğinde bu alan otomatik güncellenecek.','This area will update automatically when a new lesson or assignment appears.');
      action.textContent=tx('Geçmiş derslere bak →','View lesson history →');
      target='studentHistoryZone';
    }
    action.hidden=false;
    action.dataset.target=target;

    const upcomingTitle=$('#studentUpcomingTitle'),upcomingTime=$('#studentUpcomingTime');
    if(upcoming){
      upcomingTitle.textContent=upcoming.title||tx('English dersi','English class');
      upcomingTime.textContent=fmtDateTime(upcoming.starts_at)+' · '+Number(upcoming.duration_minutes||40)+' '+tx('dk','min')+(upcoming.notes?' · '+upcoming.notes:'');
    }else{
      upcomingTitle.textContent=tx('Henüz plan yok','No class scheduled yet');
      upcomingTime.textContent=tx('Öğretmenin yeni bir ders planladığında burada görünecek.','It will appear here when your teacher schedules a new class.');
    }
  }

  function renderRecentLessons(items=[]){
    const zone=$('#studentHistoryZone'),list=$('#studentHistoryList'),count=$('#studentHistoryCount');
    if(!zone||!list)return;
    const rows=Array.isArray(items)?items:[];
    zone.hidden=!rows.length;
    if(count)count.textContent=String(rows.length);
    if(!rows.length){list.innerHTML='';return;}
    list.innerHTML=rows.map(x=>
      '<article class="student-history-card"><div class="student-history-date"><small>'+esc(fmtDateTime(x.ended_at))+'</small><span>'+Number(x.duration_minutes||40)+' '+tx('dk','min')+'</span></div><div class="student-history-copy"><strong>'+esc(x.title||x.topic||'English lesson')+'</strong><p>'+esc(x.topic||'')+' · '+esc(String(x.primary_goal||'speaking').toUpperCase())+'</p></div><div class="student-history-metrics"><span>✓ '+Number(x.participated_count||0)+' '+tx('katılım','participation')+'</span><span>? '+Number(x.need_help_count||0)+' '+tx('yardım','help')+'</span></div></article>'
    ).join('');
  }
  function stageLabel(step,index){
    return String(step?.title||step?.stage||tx('Aşama '+(index+1),'Stage '+(index+1))).trim();
  }

  function renderLessonOverview(d){
    const lesson=d?.lesson;
    const session=d?.session;
    const wrap=$('#studentLessonOverview');
    if(!wrap)return;
    const plan=Array.isArray(lesson?.plan)?lesson.plan:[];
    const hasLesson=Boolean(lesson && (plan.length || lesson.title || lesson.topic));
    wrap.hidden=!hasLesson;
    if(!hasLesson)return;

    const current=Math.max(0,Math.min(Number(session?.current_index)||0,Math.max(0,plan.length-1)));
    const completed=session?.status==='completed';
    const progressCount=completed?plan.length:Math.min(plan.length,current+1);
    const percent=plan.length?Math.round((progressCount/plan.length)*100):0;

    $('#studentLessonTitle').textContent=lesson.title||lesson.topic||tx('English dersi','English lesson');
    $('#studentLessonTopic').textContent=(lesson.topic||tx('Genel İngilizce','General English'));
    $('#studentLessonDuration').textContent=Number(lesson.duration_minutes||40)+' '+tx('dk','min');
    $('#studentLessonGoal').textContent=String(lesson.primary_goal||'speaking').toUpperCase();
    $('#studentLessonProgressLabel').textContent=plan.length?(Math.min(progressCount,plan.length)+' / '+plan.length):'—';
    $('#studentProgressFill').style.width=percent+'%';

    const list=$('#studentStageList');
    if(list){
      list.innerHTML=plan.map((step,i)=>{
        const isDone=completed || i<current;
        const isActive=!completed && i===current;
        return '<div class="student-stage '+(isDone?'done ':'')+(isActive?'active':'')+'>'+
          '<span>'+(isDone?'✓':String(i+1))+'</span>'+
          '<p><strong>'+esc(stageLabel(step,i))+'</strong><small>'+esc(step.duration||'')+(step.mode?' · '+esc(step.mode):'')+'</small></p>'+
        '</div>';
      }).join('');
    }

    const next=plan[current+1];
    const nextCard=$('#studentNextCard');
    if(nextCard){
      nextCard.hidden=completed || !next;
      if(next){
        $('#studentNextTitle').textContent=stageLabel(next,current+1);
        $('#studentNextMeta').textContent=[next.duration,next.mode].filter(Boolean).join(' · ');
      }
    }

    const progress=d?.student_progress||{};
    $('#studentParticipatedCount').textContent=String(Number(progress.participated_count||0));
    $('#studentHelpCount').textContent=String(Number(progress.need_help_count||0));
  }
  function renderAssignments(items=[]){
    const zone=$('#assignmentZone'),list=$('#studentAssignmentList'),count=$('#assignmentCount');
    if(!zone||!list)return;
    zone.hidden=!items.length;
    if(count)count.textContent=String(items.length);
    if(!items.length){list.innerHTML='';return;}
    list.innerHTML=items.map(a=>{
      const due=a.due_at?new Intl.DateTimeFormat(lang==='en'?'en-GB':'tr-TR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(a.due_at)):tx('Son tarih yok','No due date');
      if(a.completed){
        const score=(a.score===null||typeof a.score==='undefined')?'':Math.round(Number(a.score)||0);
        const feedback=a.teacher_feedback||'';
        const review=(score!==''||feedback)
          ? '<div class="student-assignment-feedback"><small>'+tx('ÖĞRETMEN GERİ BİLDİRİMİ','TEACHER FEEDBACK')+'</small>'+(score!==''?'<strong>'+score+'/100</strong>':'')+(feedback?'<p>'+esc(feedback)+'</p>':'')+'</div>'
          : '';
        return '<article class="student-assignment completed"><div class="student-assignment-top"><span>'+tx('TESLİM EDİLDİ','COMPLETED')+'</span><small>'+esc(due)+'</small></div><h3>'+esc(a.title)+'</h3><p>'+esc(a.instructions||'')+'</p><b>✓ '+tx('Bu ödevi tamamladın.','You completed this assignment.')+'</b>'+review+'</article>';
      }
      if(a.overdue)return '<article class="student-assignment overdue"><div class="student-assignment-top"><span>'+tx('SÜRE DOLDU','CLOSED')+'</span><small>'+esc(due)+'</small></div><h3>'+esc(a.title)+'</h3><p>'+esc(a.instructions||'')+'</p><b>'+tx('Son teslim tarihi geçti. Yeni teslim kabul edilmiyor.','The deadline has passed. New submissions are closed.')+'</b></article>';
      return '<article class="student-assignment"><div class="student-assignment-top"><span>'+tx('YAPILACAK','TO DO')+'</span><small>'+esc(due)+'</small></div><h3>'+esc(a.title)+'</h3><p>'+esc(a.instructions||tx('Öğretmeninin verdiği görevi tamamla.','Complete the task from your teacher.'))+'</p><label>'+tx('Kısa cevabın / notun','Your short answer / note')+'<textarea rows="3" maxlength="1200" data-assignment-response="'+esc(a.id)+'" placeholder="'+esc(tx('Buraya yaz…','Write here…'))+'"></textarea></label><button type="button" data-assignment-submit="'+esc(a.id)+'">'+tx('Ödevi teslim et →','Submit assignment →')+'</button></article>';
    }).join('');
    document.querySelectorAll('[data-assignment-submit]').forEach(b=>b.addEventListener('click',()=>submitAssignment(b.dataset.assignmentSubmit,b)));
  }

  async function submitAssignment(id,button){
    if(!token||!id)return;
    const response=document.querySelector('[data-assignment-response="'+CSS.escape(id)+'"]')?.value.trim()||'';
    button.disabled=true;
    const old=button.textContent;button.textContent=tx('Teslim ediliyor…','Submitting…');
    try{
      const ok=await window.ESCSupabase.submitStudentResult(token,null,'assignment',null,{assignment_id:id,response});
      if(!ok)throw new Error('SUBMIT_FAILED');
      button.textContent=tx('Teslim edildi ✓','Submitted ✓');
      await refresh();
    }catch{button.textContent=tx('Tekrar dene','Try again');setTimeout(()=>button.textContent=old,1400);}
    finally{button.disabled=false;}
  }
  function paint(d){
    state=d;
    $('#joinView').hidden=true;$('#classroomView').hidden=false;
    const n=d.student?.display_name||localStorage.getItem(NAME_KEY)||'Student';
    $('#studentDisplayName').textContent=n;$('#studentAvatar').textContent=n.trim().charAt(0).toUpperCase()||'?';
    $('#classroomName').textContent=d.class?.name||'English Class';
    $('#classroomMeta').textContent=`${d.class?.age_group||''} · ${d.class?.level||''} · CODE ${d.class?.join_code||''}`;
    renderStudentDashboard(d);
    renderAssignments(d.assignments||[]);
    renderLessonOverview(d);
    renderRecentLessons(d.recent_lessons||[]);
    if(location.hash==='#assignmentZone'&&!assignmentHashHandled){
      assignmentHashHandled=true;
      setTimeout(()=>$('#assignmentZone')?.scrollIntoView({behavior:'smooth',block:'start'}),80);
    }
    const session=d.session;
    $('#waitingState').hidden=Boolean(session);
    $('#liveState').hidden=!session || session.status==='completed';
    $('#completedState').hidden=!session || session.status!=='completed';
    if(session && session.status!=='completed'){
      const payload=session.current_payload||{};
      $('#liveStage').textContent=session.current_stage||'LIVE';
      $('#liveTitle').textContent=payload.title||session.current_stage||'CLASS ACTIVITY';
      $('#livePrompt').textContent=payload.prompt||'Teacher is preparing the next activity…';
      $('#liveInstruction').textContent=payload.instruction||'Keep this screen open.';
      const blue=Number(session.scores?.blue||0),orange=Number(session.scores?.orange||0);
      $('#studentBlueScore').textContent=blue;
      $('#studentOrangeScore').textContent=orange;
      const scoreboard=$('#studentScoreboard');
      if(scoreboard)scoreboard.hidden=(blue===0&&orange===0);
    }
  }
  async function refresh(){
    if(!token||document.hidden)return;
    if(!navigator.onLine){setConnected(false);return;}
    try{
      const data=await window.ESCSupabase.getStudentState(token);
      setConnected(true);
      const sig=signature(data);
      if(sig!==lastSignature){lastSignature=sig;paint(data);}
    }catch(err){
      setConnected(false);
      const reason=String(err?.message||'');
      if(reason.includes('STUDENT_SESSION_NOT_FOUND')||reason.includes('CLASS_NOT_AVAILABLE')) leave(true);
    }
  }
  async function join(e){
    e.preventDefault();
    const code=$('#joinCode').value.trim().toUpperCase(), name=$('#joinName').value.trim();
    const b=$('#joinButton');b.disabled=true;showMessage(tx('Sınıfa bağlanılıyor…','Joining class…'));
    try{
      token=localStorage.getItem(TOKEN_KEY)||randomToken();
      const data=await window.ESCSupabase.joinEducatorClass(code,name,token);
      localStorage.setItem(TOKEN_KEY,token);localStorage.setItem(NAME_KEY,name);localStorage.setItem(CLASS_CODE_KEY,code);
      showMessage('',true);
      let fullState=null;
      try{fullState=await window.ESCSupabase.getStudentState(token);}catch{}
      const painted=fullState||{student:{display_name:name},...data};
      paint(painted);
      lastSignature=signature(painted);
      startPolling();
    }catch(err){showMessage(friendly(err));}
    finally{b.disabled=false;}
  }
  function startPolling(){if(poll)clearInterval(poll);poll=setInterval(refresh,3500);}
  function leave(reload=true){if(poll)clearInterval(poll);poll=null;token='';state=null;lastSignature='';localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(CLASS_CODE_KEY);if(reload)location.href='./';}
  async function result(kind){
    if(!token||!state?.session?.id)return;
    const button=document.querySelector(`[data-result="${kind}"]`);if(button)button.disabled=true;
    const payload=state.session?.current_payload||{};
    const activityKey=[
      state.session?.current_stage||'',
      payload.stage_key||payload.kind||'',
      payload.question_index ?? '',
      String(payload.prompt||'').slice(0,80)
    ].join('|').slice(0,180);
    try{await window.ESCSupabase.submitStudentResult(token,state.session.id,kind,kind==='participated'?100:0,{stage:state.session.current_stage||'',activity_key:activityKey});if(button){const old=button.textContent;button.textContent=tx('Gönderildi ✓','Sent ✓');setTimeout(()=>button.textContent=old,1200);}}
    catch{}
    finally{if(button)button.disabled=false;}
  }
  async function boot(){
    const params=new URLSearchParams(location.search);const code=params.get('code')||'';
    let savedLang='';try{savedLang=localStorage.getItem(LANG_KEY)||'';}catch{}
    const queryLang=params.get('lang');
    applyLanguage(queryLang==='en'||queryLang==='tr'?queryLang:(savedLang==='en'||savedLang==='tr'?savedLang:((navigator.language||'').toLowerCase().startsWith('tr')?'tr':'en')));
    if(code)$('#joinCode').value=code.toUpperCase();
    const savedName=localStorage.getItem(NAME_KEY)||'';if(savedName)$('#joinName').value=savedName;
    const savedClassCode=(localStorage.getItem(CLASS_CODE_KEY)||'').toUpperCase();
    token=localStorage.getItem(TOKEN_KEY)||'';
    if(code && token && (!savedClassCode || savedClassCode!==code.toUpperCase())){
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(CLASS_CODE_KEY);
      token='';
    }
    if(token){
      try{
        const data=await window.ESCSupabase.getStudentState(token);
        if(data?.class?.join_code)localStorage.setItem(CLASS_CODE_KEY,String(data.class.join_code).toUpperCase());
        paint(data);lastSignature=signature(data);startPolling();return;
      }catch{leave(false);}
    }
    $('#joinView').hidden=false;$('#classroomView').hidden=true;
  }
  document.querySelectorAll('[data-join-lang]').forEach(b=>b.addEventListener('click',()=>applyLanguage(b.dataset.joinLang)));
  $('#studentNowAction')?.addEventListener('click',e=>{
    const id=e.currentTarget.dataset.target;
    if(id)document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
  });
  $('#studentHowToggle')?.addEventListener('click',()=>{
    const body=$('#studentHowBody'),btn=$('#studentHowToggle');
    const opening=body?.hidden!==false;
    if(body)body.hidden=!opening;
    if(btn)btn.setAttribute('aria-expanded',opening?'true':'false');
  });
  $('#joinForm')?.addEventListener('submit',join);
  $('#leaveClass')?.addEventListener('click',()=>leave(true));
  document.querySelectorAll('[data-result]').forEach(b=>b.addEventListener('click',()=>result(b.dataset.result)));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&token)refresh();});
  window.addEventListener('online',()=>{setConnected(true);refresh();});
  window.addEventListener('offline',()=>setConnected(false));
  boot();
})();