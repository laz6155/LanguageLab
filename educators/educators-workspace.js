(() => {
  "use strict";

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const escapeHtml = (v="") => String(v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  const langText = (tr,en) => document.documentElement.lang==="en" ? en : tr;

  const themes = {
    "5": ["School Life","Classroom Life","Personal Life","Family Life","Life in the Neighbourhood & City","Life in the World","Life in Nature","Life in the Universe & Future"],
    "6": ["School Life","Classroom Life","Personal Life","Family Life","Life in the Neighbourhood & City","Life in the World & Culture","Life in Nature & Global Problems","Life in the Universe & Future"],
    "7": ["School Life & Education","Classroom Life & Learning","Personal Life & Well-Being","Family Life & Home","Life in the Neighbourhood & City and Social Life","Life in the World & Culture","Life in Nature","Life in the Universe & Future"],
    "8": ["Friendship","Teen Life","In The Kitchen","On The Phone","The Internet","Adventures","Tourism","Chores","Science","Natural Forces"],
    "9": ["School Life","Classroom Life","Personal Life: Physical Appearance & Personality","Family Life","Life in the House & Neighbourhood","Life in the City & Country","Life in the World & Nature","Life in the Universe & Future"],
    "10": ["School Life & Education","Classroom Life & Learning","Personal Life & Well-Being","Family Life & Home","Life in the Neighbourhood, City & Social Life","Life in the World & Culture","Life in Nature & Global Problems","Life in the Universe & Future"],
    "11": ["School Life & Education","Classroom Life & Learning","Personal Life & Well-Being","Family Life & Home","Life in the Neighbourhood, City & Social Life","Life in the World & Culture","Life in Nature & Global Problems","Life in the Universe & Future"],
    "12": ["Music","Friendship","Human Rights","Coming Soon","Psychology","Favors","News Stories","Alternative Energy","Technology","Manners"]
  };

  const upperThemesPrep = ["School Life & Education","Classroom Life & Learning","Personal Life & Well-Being","Family Life & Home","Life in the Neighbourhood, City & Social Life","Life in the World & Culture","Life in Nature & Global Problems","Life in the Universe & Future"];

  const gradeMeta = {
    "5":  {age:"9-11",  statusTr:"TYMM · 2026–27 aktif", statusEn:"TYMM · 2026–27 active"},
    "6":  {age:"9-11",  statusTr:"TYMM · 2026–27 aktif", statusEn:"TYMM · 2026–27 active"},
    "7":  {age:"12-14", statusTr:"TYMM · 2026–27 aktif", statusEn:"TYMM · 2026–27 active"},
    "8":  {age:"12-14", statusTr:"Önceki program · 2026–27", statusEn:"Previous programme · 2026–27"},
    "9":  {age:"15-17", statusTr:"TYMM · 2026–27 aktif", statusEn:"TYMM · 2026–27 active"},
    "10": {age:"15-17", statusTr:"TYMM · 2026–27 aktif", statusEn:"TYMM · 2026–27 active"},
    "11": {age:"15-17", statusTr:"TYMM · 2026–27 aktif", statusEn:"TYMM · 2026–27 active"},
    "12": {age:"15-17", statusTr:"Önceki program · 2026–27", statusEn:"Previous programme · 2026–27"}
  };

  const fallbackThemes = ["Current Unit","Exam Revision","Vocabulary Review","Grammar Review","Speaking Practice","Listening Practice","Writing Task","Mixed Skills"];

  function activatePanel(name) {
    $$(".side-item").forEach(b => b.classList.toggle("active", b.dataset.panel === name));
    $$(".mobile-workspace-tabs [data-panel]").forEach(b => b.classList.toggle("active", b.dataset.panel === name));
    $$("[data-panel-view]").forEach(p => p.classList.toggle("active", p.dataset.panelView === name));
    $("#teacher-demo")?.scrollIntoView({behavior:"smooth", block:"start"});
  }

  $$("[data-workflow]").forEach(btn => btn.addEventListener("click", () => activatePanel(btn.dataset.workflow)));

  const grade = $("#curriculumGrade");
  const track = $("#curriculumTrack");
  const theme = $("#curriculumTheme");
  const skill = $("#curriculumSkill");
  const curriculumLevel = $("#curriculumLevel");
  const upperProgram = $("#curriculumUpperProgram");
  const summaryTitle = $("#curriculumSummaryTitle");
  const summaryMeta = $("#curriculumSummaryMeta");
  const summaryTags = $("#curriculumSummaryTags");

  function currentThemes() {
    if (track?.value === "cefr") return ["Daily Life","Travel","Food & Culture","Technology","School & Education","Work & Career","Relationships","Global Issues"];
    if (track?.value === "private") return ["Student Goal","School Support","Speaking Confidence","Grammar Repair","Vocabulary Growth","Exam Support","Homework Review","Custom Topic"];
    if (track?.value === "custom") return ["Custom Topic","Conversation Lesson","Revision","Exam Preparation","Project / Presentation","Teacher's Choice"];
    const g = Number(grade?.value || 0);
    if (track?.value === "meb" && g >= 9 && g <= 11 && upperProgram?.value === "prep") return upperThemesPrep;
    return themes[grade?.value] || fallbackThemes;
  }

  function renderCurriculum() {
    if (!grade || !track || !theme) return;
    const items = currentThemes();
    const previous = theme.value;
    theme.innerHTML = items.map((x, i) => '<option value="' + x.replace(/"/g, "&quot;") + '">' + (i + 1) + '. ' + x + '</option>').join("");
    if (items.includes(previous)) theme.value = previous;

    const meta = gradeMeta[grade.value] || gradeMeta["7"];
    let badge = "MEB 2026–27";
    if (track.value === "cefr") badge = "GENERAL ENGLISH · CEFR";
    if (track.value === "private") badge = "PRIVATE TUTOR PATH";
    if (track.value === "custom") badge = "CUSTOM / FREE LESSON";

    $("[data-curriculum-grade]")?.toggleAttribute("hidden", track.value !== "meb");
    const gradeNumber = Number(grade.value || 0);
    $("[data-upper-program]")?.toggleAttribute("hidden", !(track.value === "meb" && gradeNumber >= 9 && gradeNumber <= 11));
    $$("[data-track-choice]").forEach(b => b.classList.toggle("active", b.dataset.trackChoice === track.value));

    if (summaryTitle) summaryTitle.textContent = theme.value || items[0];
    const gradePart = track.value === "meb" ? " · " + langText("Sınıf ","Grade ") + grade.value : "";
    const programPart = track.value === "meb" && gradeNumber >= 9 && gradeNumber <= 11
      ? (upperProgram?.value === "prep" ? langText(" · Hazırlık sonrası"," · After Prep") : langText(" · Normal 9–12"," · Regular 9–12"))
      : "";
    if (summaryMeta) summaryMeta.textContent = badge + gradePart + programPart + " · CEFR " + (curriculumLevel?.value || "A2") + " · " + (skill?.value || "Speaking");
    if (summaryTags) {
      const tags = track.value === "meb"
        ? [document.documentElement.lang==="en"?meta.statusEn:meta.statusTr, langText("Öğretmenin seçtiği CEFR","Teacher-selected CEFR"), "Vocabulary", "Grammar", "Speaking", langText("Değerlendirme","Assessment")]
        : [langText("Esnek sıra","Flexible sequence"), langText("Öğretmen kontrolü","Teacher control"), "Speaking", "Vocabulary", "Grammar", langText("Ödev","Homework")];
      summaryTags.innerHTML = tags.map(x => "<span>" + x + "</span>").join("");
    }
  }

  $$("[data-track-choice]").forEach(btn => btn.addEventListener("click", () => {
    if (!track) return;
    track.value = btn.dataset.trackChoice;
    track.dispatchEvent(new Event("change", {bubbles:true}));
  }));

  [grade, track, theme, skill, curriculumLevel, upperProgram].forEach(el => el?.addEventListener("change", renderCurriculum));
  renderCurriculum();

  function mapTopic(name) {
    const t = (name || "").toLowerCase();
    if (t.includes("school") || t.includes("classroom") || t.includes("education")) return "school";
    if (t.includes("world") || t.includes("culture") || t.includes("food")) return "food";
    if (t.includes("technology") || t.includes("universe") || t.includes("future")) return "technology";
    if (t.includes("travel") || t.includes("city") || t.includes("neighbourhood")) return "travel";
    if (t.includes("personal") || t.includes("family") || t.includes("life")) return "daily-life";
    return "daily-life";
  }

  $("#curriculumBuildLesson")?.addEventListener("click", () => {
    const meta = gradeMeta[grade?.value] || gradeMeta["7"];
    const selectedLevel = curriculumLevel?.value || "A2";
    const isMeb = track?.value === "meb";
    const titlePrefix = isMeb ? "Grade " + (grade?.value || "7") + " · " : "";
    if ($("#className")) $("#className").value = titlePrefix + (theme?.value || "Lesson");
    if (isMeb && $("#ageGroup")) $("#ageGroup").value = meta.age;
    if ($("#level")) $("#level").value = selectedLevel;
    const mapped = mapTopic(theme?.value);
    if ($("#topic")) {
      $("#topic").value = track?.value === "custom" ? "custom" : mapped;
      $("#topic").dispatchEvent(new Event("change", {bubbles:true}));
    }
    if ($("#customTopic") && track?.value === "custom") $("#customTopic").value = theme?.value === "Custom Topic" ? "" : (theme?.value || "");
    if ($("#goal")) $("#goal").value = (skill?.value || "").toLowerCase().includes("vocab") ? "vocabulary" : (skill?.value || "").toLowerCase().includes("grammar") ? "grammar" : (skill?.value || "").toLowerCase().includes("mixed") ? "mixed" : "speaking";
    $("#lessonForm")?.dispatchEvent(new Event("submit", {bubbles:true, cancelable:true}));
    activatePanel("builder");
  });

  $("#curriculumOpenResources")?.addEventListener("click", () => {
    const source = $("#resourceSource");
    const prefix = track?.value === "meb" ? "Grade " + (grade?.value || "7") + " · " : "";
    if (source) source.value = prefix + (theme?.value || "Current Unit");
    activatePanel("resources");
    renderResource("worksheet");
  });

  const resourceTemplates = {
    worksheet: {
      title:"Printable Worksheet",
      leadTr:"Tek sayfada öğretmenin kullanacağı hızlı çalışma kâğıdı.", leadEn:"A quick one-page worksheet ready for classroom use.",
      items:["Warm-up: 3 quick questions","Vocabulary: 8 target words","Grammar: 5 contextual items","Speaking: pair task","Exit ticket: 1 reflection"]
    },
    vocab: {
      title:"Vocabulary Pack",
      leadTr:"Kelime öğretimi + tekrar + hızlı kontrol için tek paket.", leadEn:"One compact pack for vocabulary teaching, review and a quick check.",
      items:["8 target words","Student-friendly definitions","Example sentences","Matching round","Speaking challenge"]
    },
    grammar: {
      title:"Grammar in Context",
      leadTr:"Kural ezberinden çok kullanım odaklı mini akış.", leadEn:"A short usage-focused sequence instead of rule memorisation.",
      items:["Notice the form","2 model sentences","Controlled practice","Error hunter","Speaking transfer"]
    },
    speaking: {
      title:"Speaking Cards",
      leadTr:"Aynı konuyu farklı öğrenci tiplerine göre konuştur.", leadEn:"Use the same topic with prompts for different student profiles.",
      items:["Easy prompt","Follow-up prompt","Opinion prompt","Pair role-play","Challenge card"]
    },
    quiz: {
      title:"Mini Quiz",
      leadTr:"Ders sonu veya bir sonraki ders başlangıcı için kontrol.", leadEn:"A quick check for the end of class or the start of the next lesson.",
      items:["3 vocabulary questions","2 grammar questions","1 listening-ready prompt","1 speaking check","Auto-review list"]
    },
    homework: {
      title:"Homework Pack",
      leadTr:"Özel ders ve sınıf öğretmeni için kısa, net ödev.", leadEn:"Short, clear homework for private tutors and classroom teachers.",
      items:["5-minute vocabulary review","Grammar micro-task","Voice-note speaking task","Short writing task","Next lesson check"]
    }
  };

  function renderResource(kind) {
    const data = resourceTemplates[kind] || resourceTemplates.worksheet;
    $$("#resourceTypeButtons button").forEach(b => b.classList.toggle("active", b.dataset.resourceKind === kind));
    if ($("#resourcePreviewTitle")) $("#resourcePreviewTitle").textContent = data.title;
    if ($("#resourcePreviewLead")) $("#resourcePreviewLead").textContent = document.documentElement.lang==="en" ? data.leadEn : data.leadTr;
    if ($("#resourcePreviewItems")) $("#resourcePreviewItems").innerHTML = data.items.map((x, i) => "<li><span>0" + (i+1) + "</span><b>" + x + "</b></li>").join("");
  }

  $$("#resourceTypeButtons [data-resource-kind]").forEach(btn => btn.addEventListener("click", () => renderResource(btn.dataset.resourceKind)));
  renderResource("worksheet");

  $("#copyResourcePlan")?.addEventListener("click", async e => {
    const title = $("#resourcePreviewTitle")?.textContent || "Resource";
    const source = $("#resourceSource")?.value || "Current lesson";
    const items = $$("#resourcePreviewItems b").map(x => "- " + x.textContent).join("\n");
    try {
      await navigator.clipboard.writeText(title + "\n" + source + "\n\n" + items);
      const old = e.currentTarget.textContent;
      e.currentTarget.textContent = uiText("Kopyalandı ✓","Copied ✓");
      setTimeout(() => e.currentTarget.textContent = old, 1200);
    } catch {}
  });

  $("#printResourcePlan")?.addEventListener("click", () => {
    const title = $("#resourcePreviewTitle")?.textContent || "Classroom Resource";
    const lead = $("#resourcePreviewLead")?.textContent || "";
    const source = $("#resourceSource")?.value || "Current lesson";
    const items = $$("#resourcePreviewItems b").map(x => x.textContent);
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return window.alert(uiText("Yazdırma penceresi engellendi. Tarayıcıdan açılır pencerelere izin verin.","The print window was blocked. Allow pop-ups in your browser."));
    const safe = v => String(v || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
    win.document.write('<!doctype html><html lang="'+(document.documentElement.lang==="en"?"en":"tr")+'"><head><meta charset="utf-8"><title>'+safe(title)+'</title><style>body{font-family:Arial,sans-serif;margin:38px;color:#102d4e;line-height:1.5}.brand{font-weight:800;color:#0b2f5b;margin-bottom:28px}h1{font-size:30px;margin:0 0 8px}.source{color:#657b8e;margin-bottom:22px}ol{padding-left:24px}li{padding:10px 0;border-bottom:1px solid #e3e9ee;font-size:16px}@media print{body{margin:18mm}}</style></head><body><div class="brand">English Teacher Platform</div><h1>'+safe(title)+'</h1><p>'+safe(lead)+'</p><div class="source">'+safe(source)+'</div><ol>'+items.map(x=>'<li>'+safe(x)+'</li>').join('')+'</ol><script>window.onload=()=>window.print()<\/script></body></html>');
    win.document.close();
  });


  let privateStudents = [];

  const uiText = (tr,en) => document.documentElement.lang==="en" ? en : tr;

  async function loadPrivateStudents() {
    const grid=$("#privateStudentGrid");
    if(grid) grid.innerHTML='<article class="private-student-card private-loading"><strong>'+uiText("Özel öğrenciler yükleniyor…","Loading private students…")+'</strong></article>';
    try {
      const session=await window.ESCSupabase?.getSession?.();
      if(!session){
        privateStudents=[];
        renderPrivateStudents();
        return;
      }
      privateStudents=await window.ESCSupabase.listPrivateStudents();
      renderPrivateStudents();
    } catch(err) {
      if(grid) grid.innerHTML='<article class="private-student-card private-loading"><strong>'+uiText("Öğrenciler yüklenemedi.","Could not load students.")+'</strong><p>'+escapeHtml(String(err?.message||""))+'</p></article>';
    }
  }

  function renderPrivateStudents() {
    const grid=$("#privateStudentGrid");
    if(!grid) return;
    if(!privateStudents.length){
      grid.innerHTML='<article class="private-student-card private-empty"><div><span>'+uiText("Henüz özel öğrenci yok.","No private students yet.")+'</span><small>'+uiText("HESABA BAĞLI","ACCOUNT SYNCED")+'</small></div><p>'+uiText("İlk öğrencini ekle; seviye, hedef ve sonraki ders notları tüm cihazlarında saklansın.","Add your first learner; level, goals and next-lesson notes will stay synced across devices.")+'</p><button type="button" data-private-empty-add>'+uiText("+ Öğrenci ekle","+ Add student")+'</button></article>';
      grid.querySelector("[data-private-empty-add]")?.addEventListener("click",()=>$("#addPrivateStudent")?.click());
      return;
    }
    grid.innerHTML=privateStudents.map(s=>{
      const goals=Array.isArray(s.goals)&&s.goals.length?s.goals.join(", "):uiText("Hedef belirtilmedi","No goal yet");
      const next=s.next_lesson_note||uiText("Sonraki ders planlanacak","Next lesson to be planned");
      const homework=s.homework?'<small class="private-homework">'+uiText("Ödev: ","Homework: ")+escapeHtml(s.homework)+'</small>':"";
      return '<article class="private-student-card" data-private-id="'+escapeHtml(s.id)+'"><div><span>'+escapeHtml(s.display_name)+'</span><small>'+escapeHtml(s.level)+(s.school_grade?' · '+escapeHtml(s.school_grade):'')+'</small></div><p>'+escapeHtml(goals)+'</p><strong>'+uiText("Sonraki: ","Next: ")+escapeHtml(next)+'</strong>'+homework+'<div class="private-actions"><button type="button" data-private-plan="'+escapeHtml(s.id)+'">'+uiText("Ders planla →","Plan lesson →")+'</button><button type="button" data-private-edit="'+escapeHtml(s.id)+'">'+uiText("Düzenle","Edit")+'</button><button type="button" data-private-delete="'+escapeHtml(s.id)+'">×</button></div></article>';
    }).join("");
  }

  async function addPrivateStudent() {
    const name=window.prompt(uiText("Öğrencinin adı?","Student name?"));
    if(!name?.trim()) return;
    const levelRaw=(window.prompt(uiText("Seviye? (Pre-A1, A1, A2, B1, B2)","Level? (Pre-A1, A1, A2, B1, B2)"),"A2")||"A2").trim();
    const level=["Pre-A1","A1","A2","B1","B2"].includes(levelRaw)?levelRaw:"A2";
    const goal=window.prompt(uiText("Ana hedef?","Main goal?"),uiText("Konuşma özgüveni","Speaking confidence"))||"";
    const next=window.prompt(uiText("Sonraki ders notu?","Next lesson note?"),"")||"";
    const btn=$("#addPrivateStudent"); if(btn) btn.disabled=true;
    try{
      await window.ESCSupabase.createPrivateStudent({
        display_name:name.trim(),level,goals:goal.trim()?[goal.trim()]:[],next_lesson_note:next.trim()||null
      });
      window.ESCAnalytics?.track?.("educator_private_student_created","other");
      await loadPrivateStudents();
    }catch(err){window.alert(err?.message||uiText("Öğrenci eklenemedi.","Could not add student."));}
    finally{if(btn) btn.disabled=false;}
  }

  async function editPrivateStudent(student) {
    const goal=window.prompt(uiText("Ana hedef?","Main goal?"),Array.isArray(student.goals)?student.goals.join(", "):"");
    if(goal===null) return;
    const homework=window.prompt(uiText("Ödev / tekrar notu?","Homework / review note?"),student.homework||"");
    if(homework===null) return;
    const next=window.prompt(uiText("Sonraki ders notu?","Next lesson note?"),student.next_lesson_note||"");
    if(next===null) return;
    try{
      await window.ESCSupabase.updatePrivateStudent(student.id,{
        goals:goal.split(",").map(x=>x.trim()).filter(Boolean),
        homework:homework.trim()||null,
        next_lesson_note:next.trim()||null
      });
      await loadPrivateStudents();
    }catch(err){window.alert(err?.message||uiText("Öğrenci güncellenemedi.","Could not update student."));}
  }

  $("#addPrivateStudent")?.addEventListener("click",addPrivateStudent);

  $("#privateStudentGrid")?.addEventListener("click",async e=>{
    const plan=e.target.closest("[data-private-plan]");
    const edit=e.target.closest("[data-private-edit]");
    const del=e.target.closest("[data-private-delete]");
    const id=plan?.dataset.privatePlan||edit?.dataset.privateEdit||del?.dataset.privateDelete;
    const student=privateStudents.find(x=>x.id===id);
    if(!student) return;
    if(plan){
      if($("#className")) $("#className").value=student.display_name+" · Private";
      if($("#level")) $("#level").value=["Pre-A1","A1","A2","B1","B2"].includes(student.level)?student.level:"A2";
      if($("#ageGroup")) $("#ageGroup").value="18+";
      const goals=(student.goals||[]).join(" ").toLowerCase();
      if($("#goal")) $("#goal").value=goals.includes("grammar")?"grammar":goals.includes("vocab")?"vocabulary":"speaking";
      const custom=$("#customTopic");
      const topic=$("#topic");
      if(topic){topic.value="custom";topic.dispatchEvent(new Event("change",{bubbles:true}));}
      if(custom) custom.value=student.next_lesson_note||student.focus_notes||"";
      $("#lessonForm")?.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));
      activatePanel("builder");
      return;
    }
    if(edit){await editPrivateStudent(student);return;}
    if(del){
      if(!window.confirm(uiText("Bu öğrenci profili silinsin mi?","Delete this student profile?"))) return;
      try{await window.ESCSupabase.deletePrivateStudent(student.id);await loadPrivateStudents();}
      catch(err){window.alert(err?.message||uiText("Öğrenci silinemedi.","Could not delete student."));}
    }
  });

  document.addEventListener("esc:educator-ready",loadPrivateStudents);
  window.addEventListener("esc:languagechange",()=>{
    renderPrivateStudents();
    renderCurriculum();
    const active=$("#resourceTypeButtons [data-resource-kind].active")?.dataset.resourceKind || "worksheet";
    renderResource(active);
  });
  setTimeout(loadPrivateStudents,900);

})();