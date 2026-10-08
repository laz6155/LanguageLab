
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  const questionBank = {
    travel: {
      "6-8": {
        "Pre-A1":[["Do you like cars, planes or trains?","Choose one and say the word."],["Where do you want to go: beach or mountains?","Choose one."],["What is in your travel bag?","Say 2 things."]],
        "A1":[["How do you like to travel?","Answer with one short sentence."],["What do you take on a trip?","Name 3 things."],["Where did you go last holiday?","Use 1–2 simple sentences."]],
        "A2":[["Where would you like to travel with your family?","Give one reason."],["What should you pack for a beach holiday?","Name 4 things."],["Which is better: train or plane?","Choose and explain simply."]],
        "B1":[["What makes a family trip fun?","Give two ideas."],["Would you rather visit a big city or nature?","Explain your choice."],["What can go wrong on a trip?","Give an example."]],
        "B2":[["How can families make travel easier for children?","Give two suggestions."],["What can children learn from travelling?","Give an example."],["Is travelling always a good way to learn?","Explain briefly."]]
      },
      "9-11": {
        "Pre-A1":[["Where do you want to go?","Say one place."],["Do you travel by bus, car or plane?","Choose one."],["What is in your bag?","Say 3 travel words."]],
        "A1":[["What is your favorite way to travel?","Answer in 1–2 sentences."],["What do you pack for a weekend trip?","Name 4 things."],["Where did you go on your last trip?","Use simple past if you can."]],
        "A2":[["If you could travel anywhere next weekend, where would you go?","Answer in 2–3 sentences and give one reason."],["What would you pack for a three-day trip?","Name 5 things and explain one choice."],["Which is better for a holiday: city or countryside?","Choose and give two reasons."]],
        "B1":[["What makes a trip memorable?","Answer with an example."],["Should students travel more with school?","Give your opinion and one reason."],["How would you plan a low-cost weekend trip?","Give three steps."]],
        "B2":[["Can travel change the way young people see the world?","Explain with an example."],["Should popular tourist places limit visitor numbers?","Give a short argument."],["How does social media influence where people travel?","Give two effects."]]
      },
      "12-14": {
        "Pre-A1":[["Where do you want to travel?","Use: I want to go to..."],["Plane or train?","Choose one and say why with one word."],["What do you need for a trip?","Say 4 words."]],
        "A1":[["Where would you like to go on holiday?","Answer in 2 short sentences."],["What do you usually pack?","Name 5 items."],["Who do you like travelling with?","Say who and why."]],
        "A2":[["If you could travel anywhere next weekend, where would you go and why?","Answer in 3–4 sentences. Ask one follow-up question to a classmate."],["What would you pack for a three-day trip?","Choose 5 items and explain two choices."],["Would you rather travel alone or with friends?","Choose one and give two reasons."]],
        "B1":[["What can teenagers learn from travelling?","Give two ideas and one example."],["Is it better to plan every detail or be spontaneous?","Take a side and defend it."],["How could a student plan a cheap but interesting trip?","Give a simple plan."]],
        "B2":[["Does tourism benefit every local community?","Give a balanced answer."],["Should teenagers travel independently before university?","Give arguments for and against."],["How can tourism become more sustainable without becoming too expensive?","Suggest practical solutions."]]
      },
      "15-17": {
        "Pre-A1":[["Where do you want to travel?","Answer with one place and one reason word."],["Do you prefer plane or bus?","Choose one."],["What travel word do you know?","Say 5 words with your team."]],
        "A1":[["What country would you like to visit?","Answer in 2 sentences."],["Who would you travel with?","Say who and why."],["What do you do before a trip?","Give 3 actions."]],
        "A2":[["What kind of trip would you plan with your friends?","Describe the place, transport and one activity."],["Would you rather spend money on travel or technology?","Choose and explain."],["What can make a trip stressful?","Give three examples and one solution."]],
        "B1":[["Do people learn more from travelling or from studying?","Compare both and give your view."],["Should schools include more educational trips?","Give two benefits and one challenge."],["How has technology changed the way teenagers travel?","Give concrete examples."]],
        "B2":[["Is mass tourism becoming incompatible with sustainable travel?","Build a short argument and counterargument."],["Should cities charge tourists additional local taxes?","Discuss potential benefits and drawbacks."],["Does international travel meaningfully broaden perspectives, or is that overstated?","Support your position with examples."]]
      },
      "18+": {
        "Pre-A1":[["Where do you want to go?","Use: I want to go to..."],["Car, bus or plane?","Choose one."],["What do you take on a trip?","Say 5 words."]],
        "A1":[["Where do you usually go on holiday?","Answer in 2 sentences."],["What do you always pack?","Name 5 items."],["Do you prefer city trips or beach holidays?","Choose one and say why."]],
        "A2":[["What makes a good short holiday for you?","Describe the place, budget and activities."],["Would you rather travel often for short trips or save for one long trip?","Choose and explain."],["What is one travel problem you have experienced?","Tell the story briefly."]],
        "B1":[["How do budget, time and comfort affect your travel decisions?","Compare the three factors."],["Has travel become better or more stressful because of technology?","Give examples."],["What makes a destination worth returning to?","Give three criteria."]],
        "B2":[["How should cities balance tourism revenue with residents' quality of life?","Give a nuanced response."],["Has low-cost aviation democratized travel at an unacceptable environmental cost?","Present both sides."],["What responsibilities do tourists have toward local communities?","Develop a practical framework."]]
      }
    }
  };

  const generic = {
    food:[
      "What food do you enjoy most?",
      "Describe a meal you would recommend to a classmate.",
      "What food do you think is difficult to cook well?",
      "Which meal is most important during a school or work day?",
      "How does food connect people and cultures?",
      "Should school cafeterias offer more international food?"
    ],
    school:[
      "What is your favorite part of school?",
      "What would make school more enjoyable?",
      "Which school subject is most useful in daily life?",
      "Describe a good classroom activity.",
      "What makes a teacher easy to learn from?",
      "Should students have more choice in what they study?"
    ],
    hobbies:[
      "What hobby would you like to try?",
      "What hobby are you already good at?",
      "Which hobby is easy to start with little money?",
      "How can hobbies help people learn English?",
      "Do hobbies need to be productive to be valuable?",
      "Should teenagers spend more time on hobbies and less time online?"
    ],
    technology:[
      "What technology do you use every day?",
      "Which app saves you the most time?",
      "What piece of technology would be hardest to give up?",
      "How can students use technology better for learning?",
      "What is one problem technology creates in daily life?",
      "Does technology make communication better or worse?"
    ],
    "daily-life":[
      "What do you do after school or work?",
      "What part of your routine would you like to change?",
      "Which part of your day is usually the busiest?",
      "What habit makes your day easier?",
      "How would you design a better weekday routine?",
      "Is a strict daily routine helpful or limiting?"
    ]
  };

  const supports = {
    "Pre-A1":"Use words, pointing or a very short sentence.",
    "A1":"Answer in 1–2 simple sentences.",
    "A2":"Answer in 2–4 sentences and give a reason.",
    "B1":"Explain your idea and support it with an example.",
    "B2":"Develop your answer, consider another perspective and respond to it."
  };

  let questionIndex = 0;
  let liveStageIndex = 0;
  let liveQuestionIndex = 0;
  let generationCount = 0;
  let blue = 0, orange = 0;

  function getQuestions(){
    const age = $("#ageGroup")?.value || "12-14";
    const level = $("#level")?.value || "A2";
    const topic = $("#topic")?.value || "daily-life";
    if (topic === "travel") {
      const exact = questionBank.travel?.[age]?.[level];
      if (Array.isArray(exact) && exact.length) return exact;
      const ageFallback = questionBank.travel?.[age];
      const levelFallback = ageFallback?.A2 || ageFallback?.A1 || ageFallback?.B1;
      if (Array.isArray(levelFallback) && levelFallback.length) return levelFallback;
    }
    if (topic === "custom") {
      const custom = ($("#customTopic")?.value || "your chosen topic").trim() || "your chosen topic";
      const base = [
        `What do you already know about ${custom}?`,
        `What is the most interesting part of ${custom} for you?`,
        `How would you explain ${custom} to a classmate?`,
        `What question would you ask someone who knows a lot about ${custom}?`,
        `How does ${custom} connect to real life?`,
        `What different opinions could people have about ${custom}?`
      ];
      return base.map((q,i)=>[q, supports[level] + (i>=4 && (level==="B1"||level==="B2") ? " Support your answer with an example." : "")]);
    }
    const base = generic[topic] || generic["daily-life"];
    return base.map((q,i)=>[q, (supports[level] || supports.A2) + (i>=4 && (level==="B1"||level==="B2") ? " Give at least two reasons." : "")]);
  }

  function renderQuestion(){
    const raw = getQuestions();
    const qs = Array.isArray(raw) && raw.length ? raw : [["Let’s start with a simple question about today’s topic.", supports.A2]];
    questionIndex = ((questionIndex % qs.length) + qs.length) % qs.length;
    const pair = Array.isArray(qs[questionIndex]) ? qs[questionIndex] : [String(qs[questionIndex] || "Let’s start speaking."), supports.A2];
    const [q,s] = pair;
    $("#adaptiveQuestion").textContent = q;
    $("#adaptiveSupport").textContent = s;
  }

  function renderPlan(){
    const duration = Math.max(10, +$("#duration").value || 40);
    const studentCount = Math.max(1, +$("#studentCount")?.value || 1);
    const preset = $(".lesson-presets button.active")?.dataset.lessonPreset || "balanced";
    const presetWeights = {
      balanced:{warmup:.12,vocabulary:.20,game:.24,speaking:.31,exit:.13},
      speaking:{warmup:.10,vocabulary:.14,game:.14,speaking:.52,exit:.10},
      vocabulary:{warmup:.10,vocabulary:.40,game:.25,speaking:.15,exit:.10},
      grammar:{warmup:.10,vocabulary:.16,game:.29,speaking:.35,exit:.10},
      custom:{warmup:.12,vocabulary:.20,game:.24,speaking:.31,exit:.13}
    };
    const weights=presetWeights[preset]||presetWeights.balanced;
    const stages=[
      {key:"warmup",title:"Warm-up",meta:"Question"},
      {key:"vocabulary",title:"Vocabulary",meta:"Practice"},
      {key:"game",title:"Practice Game",meta:"Optional"},
      {key:"speaking",title:"Speaking",meta:studentCount===1?"1-to-1":studentCount<=4?"Pairs":"Pairs / Groups"},
      {key:"exit",title:"Exit",meta:"Quick check"}
    ];
    let enabled=stages.filter(s=>`#lessonStagePicker [data-lesson-stage="${s.key}"]` && $(`#lessonStagePicker [data-lesson-stage="${s.key}"]`)?.checked);
    if(!enabled.length){
      const speaking=$("#lessonStagePicker [data-lesson-stage='speaking']");
      if(speaking)speaking.checked=true;
      enabled=stages.filter(s=>s.key==="speaking");
    }
    const totalWeight=enabled.reduce((sum,s)=>sum+(weights[s.key]||.1),0)||1;
    const mins=enabled.map(s=>Math.max(2,Math.floor(duration*(weights[s.key]||.1)/totalWeight)));
    let diff=duration-mins.reduce((a,b)=>a+b,0);
    while(diff>0){mins[mins.indexOf(Math.max(...mins))]++;diff--;}
    while(diff<0){
      const idx=mins.findIndex(x=>x>2);
      if(idx<0)break;
      mins[idx]--;diff++;
    }
    $("#generatedPlan").innerHTML = enabled.map((s,i)=>`<div class="plan-row" data-stage-key="${s.key}"><span>${mins[i]} min</span><b>${s.title}</b><small>${s.meta}</small></div>`).join("");
  }

  function syncPreview(){
    $("#previewClass").textContent = `${$("#className").value || "New Class"} · ${$("#level").value}`;
    $("#previewDuration").textContent = `${$("#duration").value} min`;
    $("#previewAge").textContent = $("#ageGroup").value.replace("-", "–") + " YEARS";
    const selectedTopic=$("#topic").value==="custom" ? ($("#customTopic")?.value || "Custom topic") : $("#topic").selectedOptions[0].textContent;
    $("#previewTopic").textContent = selectedTopic.toUpperCase();
    renderQuestion(); renderPlan();
  }

  function showPanel(name){
    $$(".side-item").forEach(b=>b.classList.toggle("active",b.dataset.panel===name));
    $$(".mobile-workspace-tabs [data-panel]").forEach(b=>b.classList.toggle("active",b.dataset.panel===name));
    $$("[data-panel-view]").forEach(p=>p.classList.toggle("active",p.dataset.panelView===name));
    if(name==="builder") syncPreview();
  }

  $$(".side-item").forEach(b=>b.addEventListener("click",()=>showPanel(b.dataset.panel)));
  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-panel-target]");
    if(b) showPanel(b.dataset.panelTarget);
  });
  $("[data-scroll-teacher]")?.addEventListener("click",()=>$("#teacher-demo").scrollIntoView({behavior:"smooth"}));
  // Student view and live class code are handled by educators-core.js using real backend data.

  $("#lessonForm")?.addEventListener("submit", e=>{
    e.preventDefault();
    generationCount++;
    const qs=getQuestions();
    questionIndex = qs.length ? generationCount % qs.length : 0;
    const output=$("#lessonOutput");
    const status=$("#lessonGenerateStatus");
    const button=e.currentTarget.querySelector(".generate-button");
    if(button){
      button.disabled=true;
      button.classList.add("is-working");
      button.innerHTML=(window.ESCEduI18n?.t("Ders hazırlanıyor")||"Ders hazırlanıyor")+' <span>•••</span>';
    }
    if(status){
      status.hidden=false;
      status.className="lesson-generate-status is-working";
      status.textContent=window.ESCEduI18n?.getLang?.()==="en"?"Questions, lesson flow and activities are being rebuilt…":"Soru, ders akışı ve etkinlikler yeniden hazırlanıyor…";
    }
    output?.classList.remove("is-ready");
    output?.classList.add("is-generating");
    window.setTimeout(()=>{
      syncPreview();
      output?.classList.remove("is-generating");
      output?.classList.add("is-ready");
      if(status){
        status.className="lesson-generate-status is-ready";
        status.textContent=window.ESCEduI18n?.getLang?.()==="en"?"New lesson variation ready ✓ You can regenerate again for another version.":"Yeni ders varyasyonu hazır ✓ İstersen tekrar basıp başka bir varyasyon oluşturabilirsin.";
      }
      if(button){
        button.disabled=false;
        button.classList.remove("is-working");
        button.innerHTML=(window.ESCEduI18n?.t("Dersi yeniden oluştur")||"Dersi yeniden oluştur")+' <span>✦</span>';
      }
      window.setTimeout(()=>output?.classList.remove("is-ready"),900);
    },360);
  });
  $("#newQuestion")?.addEventListener("click",()=>{questionIndex++;renderQuestion();});

  function syncCustomTopic(){
    const isCustom=$("#topic")?.value==="custom";
    if($("#customTopicWrap"))$("#customTopicWrap").hidden=!isCustom;
  }
  $("#topic")?.addEventListener("change",()=>{syncCustomTopic();syncPreview();});
  $("#customTopic")?.addEventListener("input",syncPreview);
  ["ageGroup","level","duration","goal","className","studentCount"].forEach(id=>$("#"+id)?.addEventListener("change",syncPreview));

  const presetConfig={
    balanced:{goal:"mixed",stages:["warmup","vocabulary","game","speaking","exit"]},
    speaking:{goal:"speaking",stages:["warmup","vocabulary","game","speaking","exit"]},
    vocabulary:{goal:"vocabulary",stages:["warmup","vocabulary","game","speaking","exit"]},
    grammar:{goal:"grammar",stages:["warmup","vocabulary","game","speaking","exit"]}
  };
  $$("#lessonPresets [data-lesson-preset]").forEach(btn=>btn.addEventListener("click",()=>{
    $$("#lessonPresets [data-lesson-preset]").forEach(x=>x.classList.toggle("active",x===btn));
    const cfg=presetConfig[btn.dataset.lessonPreset];
    if(cfg){
      if($("#goal"))$("#goal").value=cfg.goal;
      $$("#lessonStagePicker [data-lesson-stage]").forEach(c=>c.checked=cfg.stages.includes(c.dataset.lessonStage));
    }
    syncPreview();
  }));
  $$("#lessonStagePicker [data-lesson-stage]").forEach(c=>c.addEventListener("change",()=>{
    $$("#lessonPresets [data-lesson-preset]").forEach(x=>x.classList.toggle("active",x.dataset.lessonPreset==="custom"));
    syncPreview();
  }));
  syncCustomTopic();

  $$("[data-use-class]").forEach(b=>b.addEventListener("click",()=>{
    $("#className").value=b.dataset.useClass;
    $("#ageGroup").value=b.dataset.age;
    $("#level").value=b.dataset.level;
    showPanel("builder");
  }));

  const modal=$("#lessonModal");

  function liveT(tr,en){
    return window.ESCEduI18n?.getLang?.()==="en" ? en : tr;
  }

  function liveRows(){
    return $$("#generatedPlan .plan-row");
  }

  function safeQuestionPairs(){
    const raw=getQuestions();
    const fallback=[
      ["What do you already know about today’s topic?", supports.A2],
      ["What is one example connected to today’s topic?", supports.A2],
      ["What part of this topic is most interesting to you?", supports.A2],
      ["How does this topic connect to real life?", supports.A2],
      ["What would you like to learn or discuss next?", supports.A2]
    ];
    const cleaned=(Array.isArray(raw)?raw:[]).map(item=>{
      if(Array.isArray(item)) return [String(item[0]||"").trim(),String(item[1]||supports.A2).trim()];
      return [String(item||"").trim(),supports.A2];
    }).filter(item=>item[0]);
    return cleaned.length ? cleaned : fallback;
  }

  function takeFiveUnique(primary,extras){
    const out=[];
    [...primary,...extras].forEach(item=>{
      if(out.length>=5)return;
      const pair=Array.isArray(item)?item:[String(item||""),supports.A2];
      const q=String(pair[0]||"").trim();
      if(!q||out.some(x=>x[0]===q))return;
      out.push([q,String(pair[1]||supports.A2)]);
    });
    while(out.length<5){
      const n=out.length+1;
      out.push([
        liveT("Bu konu hakkında "+n+". kısa fikrini paylaş.","Share one more short idea about this topic ("+n+")."),
        supports.A2
      ]);
    }
    return out.slice(0,5);
  }

  function stageQuestionSet(stageKey){
    const qs=safeQuestionPairs();
    const topic=($("#previewTopic")?.textContent||$("#topic")?.selectedOptions?.[0]?.textContent||"this topic").trim();
    const lowerTopic=topic.toLocaleLowerCase("en-US");
    const warmupExtras=[
      [liveT("Bugünkü konu hakkında bildiğin bir şeyi söyle.","Say one thing you already know about today’s topic."),supports.A2],
      [liveT("Bu konuyla ilgili bir örnek ver.","Give one example connected to this topic."),supports.A2],
      [liveT("Bu konunun hangi kısmı sana daha ilginç geliyor?","Which part of this topic is most interesting to you?"),supports.A2],
      [liveT("Bu konu günlük hayatında nerede karşına çıkıyor?","Where does this topic appear in your daily life?"),supports.A2],
      [liveT("Bu konu hakkında bir arkadaşına hangi soruyu sorardın?","What question would you ask a classmate about this topic?"),supports.A2]
    ];

    if(stageKey==="warmup"){
      return takeFiveUnique(qs,warmupExtras).map(([question,instruction])=>({question,instruction}));
    }

    if(stageKey==="vocabulary"){
      return [
        {question:liveT(topic+" ile ilgili bildiğin kelimeleri söyle.","Say the words you already know about "+lowerTopic+"."),instruction:liveT("Her öğrenci 1–2 kelime söylesin; tekrarları tahtada grupla.","Each student says 1–2 words; group repeated words on the board.")},
        {question:liveT("Bu ders için en önemli 5 kelimeyi seç.","Choose the 5 most useful words for this lesson."),instruction:liveT("Anlamı ve telaffuzu hızlıca kontrol et.","Check meaning and pronunciation quickly.")},
        {question:liveT("Hedef kelimelerden biriyle kısa bir cümle kur.","Use one target word in a short sentence."),instruction:liveT("Cümleyi seviyeye uygun ve kısa tut.","Keep the sentence short and level-appropriate.")},
        {question:liveT("Hangi kelime en kolay, hangisi en zor? Neden?","Which word is easiest and which is hardest? Why?"),instruction:liveT("Öğrenciler karşılaştırıp kısa bir gerekçe versin.","Students compare and give a short reason.")},
        {question:liveT("5 kelimeyi hızlı hatırlama turuyla tekrar et.","Review the 5 words with a quick recall round."),instruction:liveT("Bir sonraki aşamaya geçmeden önce son bir tekrar yap.","Do one final review before moving to the next stage.")}
      ];
    }

    if(stageKey==="game"){
      return [
        {
          question:liveT("Kısa Practice Game aşamasını başlat.","Start the short Practice Game stage."),
          instruction:liveT("Takımsız, çiftler halinde veya isteğe bağlı iki takımla oynatabilirsin.","Use solo, pair work, or optional two-team mode.")
        }
      ];
    }

    if(stageKey==="speaking"){
      const speakingExtras=[
        [liveT(topic+" hakkında kendi görüşünü açıkla.","Explain your own view about "+lowerTopic+"."),supports.A2],
        [liveT("Bir sınıf arkadaşının fikrine katılıyor musun? Neden?","Do you agree with a classmate’s idea? Why?"),supports.B1],
        [liveT("Bu konu hakkında iki farklı bakış açısını karşılaştır.","Compare two different perspectives on this topic."),supports.B1],
        [liveT("Gerçek hayattan bir örnek ver.","Give a real-life example."),supports.A2],
        [liveT("Bu konu hakkında bir çözüm veya öneri sun.","Suggest one solution or recommendation about this topic."),supports.B1]
      ];
      return takeFiveUnique(qs.slice().reverse(),speakingExtras).map(([question,instruction])=>({question,instruction}));
    }

    if(stageKey==="exit"){
      return [
        {
          question:liveT("Bugün öğrendiğin veya kullandığın bir şeyi söyle.","What is one thing you learned or used today?"),
          instruction:liveT("Her öğrenci dersten çıkmadan önce tek bir kısa cevap versin.","Each student gives one short answer before the lesson ends.")
        }
      ];
    }

    return [{
      question:liveT("Bir sonraki etkinliğe devam et.","Continue with the next activity."),
      instruction:liveT("Öğretmen gerektiğinde yönergeyi sınıfa göre uyarlayabilir.","The teacher can adapt the instruction to the class when needed.")
    }];
  }

  function stageLabelAt(index){
    const row=liveRows()[index];
    return $("b",row)?.textContent || liveT("Etkinlik","Activity");
  }

  function markPlanProgress(){
    const rows=liveRows();
    rows.forEach((row,i)=>{
      row.classList.toggle("is-live-active",i===liveStageIndex);
      row.classList.toggle("is-live-complete",i<liveStageIndex);
    });
  }

  function paintLiveProgress(stageTotal,questionTotal){
    if($("#liveProgressStage")){
      $("#liveProgressStage").textContent=liveT(
        "Aşama "+Math.min(liveStageIndex+1,stageTotal)+" / "+stageTotal,
        "Stage "+Math.min(liveStageIndex+1,stageTotal)+" / "+stageTotal
      );
    }
    if($("#liveProgressQuestion")){
      $("#liveProgressQuestion").textContent=liveT(
        "Soru "+Math.min(liveQuestionIndex+1,questionTotal)+" / "+questionTotal,
        "Question "+Math.min(liveQuestionIndex+1,questionTotal)+" / "+questionTotal
      );
    }
    const stagePct=stageTotal?((liveStageIndex+(questionTotal?liveQuestionIndex/questionTotal:0))/stageTotal)*100:0;
    if($("#liveProgressFill"))$("#liveProgressFill").style.width=Math.max(0,Math.min(100,stagePct))+"%";
  }

  function finishLiveLesson(){
    const rows=liveRows();
    rows.forEach(row=>{
      row.classList.remove("is-live-active");
      row.classList.add("is-live-complete");
    });
    if(modal){
      modal.dataset.stageIndex=String(rows.length);
      modal.dataset.questionIndex="0";
      modal.dataset.completed="true";
    }
    $("#modalStep").textContent=liveT("Ders tamamlandı","Lesson complete");
    $("#liveStage").textContent=liveT("TAMAMLANDI","FINISHED");
    $("#liveQuestion").textContent=liveT("Ders akışı tamamlandı ✓","Lesson flow completed ✓");
    $("#liveInstruction").textContent=liveT("Tüm aşamaları tamamladın. İstersen dersi kapatabilir veya yeniden başlatabilirsin.","All stages are complete. You can close the lesson or start it again.");
    if($("#liveProgressStage"))$("#liveProgressStage").textContent=liveT("Tüm aşamalar tamamlandı","All stages complete");
    if($("#liveProgressQuestion"))$("#liveProgressQuestion").textContent="";
    if($("#liveProgressFill"))$("#liveProgressFill").style.width="100%";
    const next=$("#nextLiveQuestion");
    if(next){
      next.textContent=liveT("Dersi yeniden başlat ↻","Restart lesson ↻");
      next.dataset.action="restart";
    }
  }

  function updateLive(){
    const rows=liveRows();
    if(!rows.length){
      finishLiveLesson();
      return;
    }
    if(liveStageIndex>=rows.length){
      finishLiveLesson();
      return;
    }

    const row=rows[liveStageIndex];
    const stageKey=row?.dataset.stageKey||"warmup";
    const stageTitle=$("b",row)?.textContent||stageKey;
    const questions=stageQuestionSet(stageKey);
    liveQuestionIndex=Math.max(0,Math.min(liveQuestionIndex,Math.max(0,questions.length-1)));
    const item=questions[liveQuestionIndex]||questions[0];

    if(modal){
      modal.dataset.stageIndex=String(liveStageIndex);
      modal.dataset.questionIndex=String(liveQuestionIndex);
      modal.dataset.stageKey=stageKey;
      modal.dataset.completed="false";
    }

    $("#modalStep").textContent=liveT(
      "Aşama "+(liveStageIndex+1)+"/"+rows.length+" · Soru "+(liveQuestionIndex+1)+"/"+questions.length,
      "Stage "+(liveStageIndex+1)+"/"+rows.length+" · Question "+(liveQuestionIndex+1)+"/"+questions.length
    );
    $("#liveStage").textContent=String(stageTitle).toUpperCase();
    $("#liveQuestion").textContent=item.question;
    $("#liveInstruction").textContent=item.instruction;
    $("#modalClassName").textContent=$("#className").value||"Class";
    paintLiveProgress(rows.length,questions.length);
    markPlanProgress();

    const next=$("#nextLiveQuestion");
    if(next){
      const lastQuestion=liveQuestionIndex===questions.length-1;
      const lastStage=liveStageIndex===rows.length-1;
      next.dataset.action="next";
      if(lastQuestion&&lastStage){
        next.textContent=liveT("Dersi tamamla ✓","Finish lesson ✓");
      }else if(lastQuestion){
        const nextLabel=stageLabelAt(liveStageIndex+1);
        next.textContent=liveT(nextLabel+" aşamasına geç →","Go to "+nextLabel+" →");
      }else{
        next.textContent=liveT("Sonraki soru →","Next question →");
      }
    }
  }

  function startLiveLessonUI(){
    liveStageIndex=0;
    liveQuestionIndex=0;
    blue=0;
    orange=0;
    if($("#blueScore"))$("#blueScore").textContent="0";
    if($("#orangeScore"))$("#orangeScore").textContent="0";
    const next=$("#nextLiveQuestion");
    if(next)next.dataset.action="next";
    updateLive();
    modal?.classList.add("open");
    modal?.setAttribute("aria-hidden","false");
    document.body.classList.add("edu-modal-open");
  }

  function resumeLiveLessonUI(snapshot={}){
    const rows=liveRows();
    const maxStage=Math.max(0,rows.length-1);
    liveStageIndex=Math.max(0,Math.min(Number(snapshot.current_index)||0,maxStage));
    liveQuestionIndex=Math.max(0,Number(snapshot.current_payload?.question_index)||0);
    blue=Number(snapshot.scores?.blue)||0;
    orange=Number(snapshot.scores?.orange)||0;
    if($("#blueScore"))$("#blueScore").textContent=String(blue);
    if($("#orangeScore"))$("#orangeScore").textContent=String(orange);
    const next=$("#nextLiveQuestion");
    if(next)next.dataset.action="next";
    updateLive();
    modal?.classList.add("open");
    modal?.setAttribute("aria-hidden","false");
    document.body.classList.add("edu-modal-open");
  }

  function closeLiveLessonUI(){
    modal?.classList.remove("open");
    modal?.setAttribute("aria-hidden","true");
    document.body.classList.remove("edu-modal-open");
  }

  function advanceLiveLesson(){
    const rows=liveRows();
    if(!rows.length)return finishLiveLesson();

    if($("#nextLiveQuestion")?.dataset.action==="restart"||liveStageIndex>=rows.length){
      $("#startDemoLesson")?.click();
      return;
    }

    const stageKey=rows[liveStageIndex]?.dataset.stageKey||"warmup";
    const questions=stageQuestionSet(stageKey);

    if(liveQuestionIndex<questions.length-1){
      liveQuestionIndex++;
      updateLive();
      return;
    }

    if(liveStageIndex<rows.length-1){
      liveStageIndex++;
      liveQuestionIndex=0;
      updateLive();
      return;
    }

    liveStageIndex=rows.length;
    liveQuestionIndex=0;
    finishLiveLesson();
  }

  window.ESCEduLive={
    start:startLiveLessonUI,
    resume:resumeLiveLessonUI,
    close:closeLiveLessonUI,
    next:advanceLiveLesson,
    refresh:updateLive,
    getState:()=>({
      stageIndex:liveStageIndex,
      questionIndex:liveQuestionIndex,
      completed:modal?.dataset.completed==="true",
      stageKey:modal?.dataset.stageKey||null
    })
  };

  $("#closeLessonModal")?.addEventListener("click",closeLiveLessonUI);
  $("#lessonModal")?.addEventListener("click",e=>{if(e.target===modal)closeLiveLessonUI();});
  $("#nextLiveQuestion")?.addEventListener("click",advanceLiveLesson);
  $("#addBlue")?.addEventListener("click",()=>{$("#blueScore").textContent=blue+=10;});
  $("#addOrange")?.addEventListener("click",()=>{$("#orangeScore").textContent=orange+=10;});

  $("#joinDemoClass")?.addEventListener("click",()=>{
    const name=($("#studentName").value||"Student").trim();
    const code=($("#studentCode").value||"").trim().toUpperCase();
    if(!code){$("#studentCode").focus();return;}
    $("#studentWelcome").textContent=`Hi ${name} 👋`;
    $("#studentAvatar").textContent=(name[0]||"S").toUpperCase();
    $$("[data-student-screen]").forEach(s=>s.classList.remove("active"));
    $('[data-student-screen="waiting"]').classList.add("active");
  });
  $("#studentBack")?.addEventListener("click",()=>{
    $$("[data-student-screen]").forEach(s=>s.classList.remove("active"));
    $('[data-student-screen="join"]').classList.add("active");
  });

  window.addEventListener("esc:languagechange",()=>syncPreview());
  syncPreview();
})();


;(() => {
  "use strict";
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const toolText = (tr,en) => window.ESCEduI18n?.getLang?.()==="en" ? en : tr;
  const STUDENT_KEY = "escEducatorsStudentNamesV2";

  function esc(value){
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[c]);
  }

  function activatePanel(name){
    $$(".side-item").forEach(b => b.classList.toggle("active", b.dataset.panel === name));
    $$(".mobile-workspace-tabs [data-panel]").forEach(b => b.classList.toggle("active", b.dataset.panel === name));
    $$("[data-panel-view]").forEach(p => p.classList.toggle("active", p.dataset.panelView === name));
    if(name === "builder"){
      setTimeout(() => $("#className")?.focus({preventScroll:true}), 0);
    }
  }

  $$(".mobile-workspace-tabs [data-panel]").forEach(b => {
    b.addEventListener("click", () => activatePanel(b.dataset.panel));
  });

  // Classroom tools.
  const studentList = $("#studentListInput");
  if(studentList){
    const savedNames = localStorage.getItem(STUDENT_KEY);
    if(savedNames) studentList.value = savedNames;
    studentList.addEventListener("input", () => localStorage.setItem(STUDENT_KEY, studentList.value));
  }

  function names(){
    return (studentList?.value || "")
      .split(/[\n,;]+/)
      .map(x => x.trim())
      .filter(Boolean);
  }

  $("#pickStudent")?.addEventListener("click", () => {
    const list = names();
    const out = $("#pickedStudent");
    if(!out) return;
    if(!list.length){ out.textContent = toolText("İsim ekle","Add names"); return; }
    let ticks = 0;
    const spin = setInterval(() => {
      out.textContent = list[Math.floor(Math.random()*list.length)];
      ticks++;
      if(ticks >= 9){
        clearInterval(spin);
        out.textContent = list[Math.floor(Math.random()*list.length)];
      }
    }, 70);
  });

  $("#makeTeams")?.addEventListener("click", () => {
    const list = names().sort(() => Math.random() - .5);
    const count = Math.max(2, Number($("#teamCount")?.value)||2);
    const teams = Array.from({length:count},()=>[]);
    list.forEach((n,i)=>teams[i%count].push(n));
    const out = $("#madeTeams");
    if(!out) return;
    out.innerHTML = list.length ? teams.map((t,i)=>`<div class="made-team"><b>${toolText("Takım","Team")} ${i+1}</b><br>${t.map(esc).join(" · ") || "—"}</div>`).join("") : '<div class="made-team">'+toolText("Önce öğrenci isimlerini ekle.","Add student names first.")+'</div>';
  });

  let timerSeconds = 120;
  let timerInitial = 120;
  let timerHandle = null;
  const timerDisplay = $("#timerDisplay");
  function paintTimer(){
    if(!timerDisplay) return;
    const m = Math.floor(timerSeconds/60);
    const s = timerSeconds%60;
    timerDisplay.textContent = String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
  }
  $$("[data-timer-min]").forEach(b=>b.addEventListener("click",()=>{
    timerSeconds = timerInitial = Number(b.dataset.timerMin)*60;
    if(timerHandle){clearInterval(timerHandle);timerHandle=null;}
    $("#timerStart").textContent = toolText("Başlat","Start");
    paintTimer();
  }));
  $("#timerStart")?.addEventListener("click", e=>{
    if(timerHandle){
      clearInterval(timerHandle); timerHandle=null; e.currentTarget.textContent=toolText("Başlat","Start"); return;
    }
    if(timerSeconds<=0){
      timerSeconds=timerInitial;
      paintTimer();
    }
    e.currentTarget.textContent=toolText("Duraklat","Pause");
    timerHandle=setInterval(()=>{
      timerSeconds=Math.max(0,timerSeconds-1);paintTimer();
      if(timerSeconds<=0){
        clearInterval(timerHandle);timerHandle=null;e.currentTarget.textContent=toolText("Başlat","Start");
        if(timerDisplay) timerDisplay.textContent=toolText("SÜRE!","TIME!");
      }
    },1000);
  });
  $("#timerReset")?.addEventListener("click",()=>{
    if(timerHandle){clearInterval(timerHandle);timerHandle=null;}
    timerSeconds=timerInitial;paintTimer();
    if($("#timerStart")) $("#timerStart").textContent=toolText("Başlat","Start");
  });
  paintTimer();

  const quickPrompts = [
    "What was the best part of your week?",
    "What is one thing you would like to learn this year?",
    "Which is more important: free time or money?",
    "Describe a place that makes you feel comfortable.",
    "What is something people your age worry about too much?",
    "What small change could make your school or workplace better?",
    "If you could master one skill instantly, what would it be?",
    "What is one opinion you changed recently?"
  ];
  let qp=0;
  $("#newQuickPrompt")?.addEventListener("click",()=>{
    qp=(qp+1)%quickPrompts.length;
    $("#quickPrompt").textContent=quickPrompts[qp];
  });

  // Game search + category filters.
  let activeFilter = "all";
  const gameSearch = $("#gameSearch");
  function filterGames(){
    const q = (gameSearch?.value || "").toLowerCase().trim();
    $$("#adaptiveGameGrid article").forEach(card=>{
      const kinds = card.dataset.kind || "";
      const text = card.textContent.toLowerCase();
      const okFilter = activeFilter === "all" || kinds.includes(activeFilter);
      const okSearch = !q || text.includes(q);
      card.classList.toggle("hidden", !(okFilter && okSearch));
    });
  }
  gameSearch?.addEventListener("input",filterGames);
  $$("[data-game-filter]").forEach(b=>b.addEventListener("click",()=>{
    activeFilter=b.dataset.gameFilter;
    $$("[data-game-filter]").forEach(x=>x.classList.toggle("active",x===b));
    filterGames();
  }));

  // Adaptive classroom games.
  const vocab = {
    travel:["passport","airport","luggage","ticket","hotel","journey","platform","destination","departure","reservation","itinerary","accommodation"],
    food:["apple","bread","cheese","meal","recipe","ingredient","dessert","spicy","healthy","portion","cuisine","nutrition"],
    school:["book","teacher","classroom","homework","subject","exam","project","schedule","research","assignment","deadline","curriculum"],
    hobbies:["music","drawing","football","reading","gaming","photography","painting","hiking","collecting","practice","creative","competition"],
    technology:["phone","computer","internet","message","website","password","screen","application","device","privacy","algorithm","automation"],
    "daily-life":["breakfast","bus","work","school","shopping","exercise","appointment","routine","commute","chores","habit","schedule"]
  };
  const definitions = {
    passport:"an official document used for international travel",
    airport:"a place where planes arrive and leave",
    luggage:"bags and suitcases used when travelling",
    ticket:"a document or code that lets you travel or enter",
    hotel:"a place where travellers pay to stay",
    journey:"the act of travelling from one place to another",
    platform:"the place where you wait for a train",
    destination:"the place you are travelling to",
    departure:"the act or time of leaving",
    reservation:"an arrangement that keeps a seat, room or table for you",
    itinerary:"a plan showing the places and times of a trip",
    accommodation:"a place where someone stays temporarily",
    recipe:"instructions for preparing food",
    ingredient:"one of the foods used to make a dish",
    cuisine:"a style of cooking connected with a place or culture",
    nutrition:"the process of getting the food needed for health",
    assignment:"a piece of work given by a teacher",
    deadline:"the latest time something must be completed",
    curriculum:"the subjects and content taught in a course",
    privacy:"control over who can access personal information",
    algorithm:"a set of rules a computer follows to solve a problem",
    automation:"using technology to complete tasks with less human action",
    commute:"regular travel between home and work or school",
    chores:"small routine jobs done at home",
    habit:"something you do regularly, often without thinking"
  };

  const topicSentences = {
    travel:["I packed my suitcase before the flight.","We are going to visit a new city next weekend.","She has already booked the hotel online.","If I had more time, I would travel by train."],
    food:["I usually eat breakfast before school.","We are cooking dinner for our friends tonight.","She has never tried this kind of cuisine before.","If people planned meals better, they might waste less food."],
    school:["I finish my homework after dinner.","We are working on a science project this week.","He has already submitted the assignment.","Students would learn differently if every lesson were interactive."],
    hobbies:["I play football with my friends on Saturdays.","She is learning how to take better photos.","I have been reading more this month.","A hobby can become stressful when people only focus on results."],
    technology:["I use my phone to check messages.","We are learning how to use a new application.","Technology has changed the way people communicate.","People might protect their privacy better if apps explained data use clearly."],
    "daily-life":["I get up at seven every morning.","I am meeting a friend after work today.","I have changed my morning routine recently.","Life would feel less rushed if people protected their free time."]
  };

  const roleplays = {
    travel:{
      child:"You are at a train station. Ask where the train goes and what time it leaves.",
      teen:"You and a friend are planning a weekend trip with a limited budget. Agree on transport, accommodation and one activity.",
      adult:"Your hotel room has a problem. Explain it politely and negotiate a practical solution with reception."
    },
    food:{
      child:"You are ordering a snack. Ask for what you want and say thank you.",
      teen:"One person is a customer with a food allergy; the other is a waiter. Ask and answer clear questions.",
      adult:"A restaurant order is incorrect. Explain the problem politely and agree on a solution."
    },
    school:{
      child:"Ask a classmate what homework you have and when it is due.",
      teen:"A student asks a teacher for more time on an assignment. Explain the reason and respond.",
      adult:"Discuss a training course with a colleague and decide which option fits your goals."
    },
    hobbies:{
      child:"Invite a friend to do a hobby with you after school.",
      teen:"Persuade a friend to try your hobby for one month.",
      adult:"Explain a hobby to someone who thinks they are too busy to start anything new."
    },
    technology:{
      child:"Ask a friend for help using a simple app.",
      teen:"One person wants to post a group photo; the other is uncomfortable. Discuss what to do.",
      adult:"Explain a digital service problem to customer support and ask for a specific solution."
    },
    "daily-life":{
      child:"Ask a friend what they do after school.",
      teen:"Two friends are trying to plan a study session around busy schedules.",
      adult:"Two colleagues need to rearrange a meeting because one person's schedule changed."
    }
  };

  function currentProfile(){
    return {
      age: $("#ageGroup")?.value || "12-14",
      level: $("#level")?.value || "A2",
      topic: $("#topic")?.value || "travel"
    };
  }

  function ageBand(age){
    if(age==="6-8" || age==="9-11") return "child";
    if(age==="12-14" || age==="15-17") return "teen";
    return "adult";
  }

  function levelWordCount(level){
    return level==="Pre-A1" ? 5 : level==="A1" ? 6 : level==="A2" ? 8 : level==="B1" ? 10 : 12;
  }

  function profileWords(){
    const p=currentProfile();
    return (vocab[p.topic] || vocab.travel).slice(0, levelWordCount(p.level));
  }

  function shuffleWord(word){
    const clean=String(word||"word");
    const arr=clean.split("");
    for(let i=arr.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    const out=arr.join("");
    return out.toLowerCase()===clean.toLowerCase() ? clean.split("").reverse().join("") : out;
  }

  function shuffleSentence(sentence){
    const original=String(sentence||"").trim().split(/\s+/).filter(Boolean);
    if(original.length<2)return original.join(" / ");
    const arr=[...original];
    for(let i=arr.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    if(arr.join(" ")===original.join(" ")){
      arr.push(arr.shift());
    }
    return arr.join(" / ");
  }

  const tabooOverrides={
    passport:["document","border","visa","country","travel"],
    airport:["plane","flight","terminal","departure","travel"],
    luggage:["bag","suitcase","pack","baggage","travel"],
    ticket:["buy","seat","entry","travel","paper"],
    hotel:["room","stay","guest","reception","booking"],
    journey:["travel","trip","route","distance","destination"],
    platform:["train","station","track","wait","departure"],
    destination:["place","arrive","trip","travel","location"],
    departure:["leave","time","flight","station","arrival"],
    reservation:["booking","room","table","seat","hotel"],
    itinerary:["plan","schedule","trip","route","travel"],
    accommodation:["hotel","room","stay","lodging","place"],
    recipe:["cook","instructions","dish","food","ingredients"],
    ingredient:["recipe","food","cook","dish","part"],
    cuisine:["food","culture","cooking","country","style"],
    nutrition:["health","food","diet","body","healthy"],
    assignment:["homework","teacher","school","task","deadline"],
    deadline:["time","finish","due","assignment","late"],
    curriculum:["school","subjects","course","teach","content"],
    privacy:["personal","information","data","secret","access"],
    algorithm:["computer","rules","steps","data","program"],
    automation:["technology","automatic","tasks","machine","human"],
    commute:["work","home","travel","daily","transport"],
    chores:["home","jobs","clean","routine","house"],
    habit:["regular","routine","often","daily","behavior"]
  };

  const topicTabooFallbacks={
    travel:["trip","travel","place","holiday","go","journey"],
    food:["food","eat","cook","meal","taste","kitchen"],
    school:["school","student","teacher","class","learn","study"],
    hobbies:["hobby","free time","fun","activity","practice","skill"],
    technology:["technology","device","screen","internet","computer","digital"],
    "daily-life":["daily","routine","time","home","work","everyday"]
  };

  function tabooCluesFor(word,topic){
    const target=String(word||"").toLowerCase();
    const direct=tabooOverrides[target]||[];
    const defTokens=String(definitions[target]||"")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g," ")
      .split(/\s+/)
      .filter(x=>x.length>3&&!["that","where","when","with","from","someone","something","used","your","someone"].includes(x));
    const fallback=topicTabooFallbacks[topic]||topicTabooFallbacks.travel;
    const pool=[...direct,...defTokens,...fallback,...(vocab[topic]||[])];
    const out=[];
    pool.forEach(x=>{
      const clean=String(x||"").trim();
      if(!clean||clean.toLowerCase()===target||out.some(y=>y.toLowerCase()===clean.toLowerCase()))return;
      out.push(clean);
    });
    return out.slice(0,5);
  }

  function missingWordChallenge(word,topicName){
    const def=definitions[word];
    if(def){
      return {
        main:"_____ — "+def,
        support:"Which target word matches this definition?",
        answer:[String(word).toUpperCase()]
      };
    }
    return {
      main:"Complete the missing "+topicName+" word: "+String(word).charAt(0).toUpperCase()+" "+"_ ".repeat(Math.max(2,String(word).length-1)).trim(),
      support:"Use the topic and first letter as your clue.",
      answer:[String(word).toUpperCase()]
    };
  }

  function gamePrompt(type, round){
    const p=currentProfile();
    const words=profileWords();
    const safeWords=Array.isArray(words)&&words.length?words:["word"];
    const word=safeWords[Math.abs(Number(round)||0) % safeWords.length];
    const sentenceList=topicSentences[p.topic] || topicSentences.travel;
    const baseSentenceIndex=Math.min(sentenceList.length-1, p.level==="Pre-A1"||p.level==="A1"?0:p.level==="A2"?1:p.level==="B1"?2:3);
    const sentence=sentenceList[(baseSentenceIndex+(Math.abs(Number(round)||0)))%sentenceList.length];
    const topicName=p.topic.replace("-"," ");
    const missing=missingWordChallenge(word,topicName);
    const genericQuestions = {
      travel:["Where would you like to travel next?","What makes a trip enjoyable?","Is it better to plan everything before a trip?"],
      food:["What meal could you eat every week?","What makes food healthy?","How does food connect people and cultures?"],
      school:["Which school activity helps you learn most?","What makes a good teacher?","What should schools change first?"],
      hobbies:["Which hobby would you recommend to a friend?","Why do people stop doing hobbies?","Can hobbies be as important as work or study?"],
      technology:["Which technology saves you the most time?","What is one problem technology creates?","How should people protect their privacy online?"],
      "daily-life":["What part of your daily routine works well?","What would you change about your weekdays?","Are busy routines a sign of productivity?"]
    };
    const questions=genericQuestions[p.topic]||genericQuestions.travel;
    const qIndex = p.level==="Pre-A1"||p.level==="A1" ? 0 : p.level==="A2" ? 1 : 2;
    const roundNo=Math.abs(Number(round)||0);
    const question=questions[(qIndex+roundNo)%questions.length];

    const ratherBank={
      travel:["Travel by PLANE or TRAIN?","Visit a BIG CITY or a QUIET ISLAND?","Plan every detail or travel SPONTANEOUSLY?"],
      food:["Eat the SAME BREAKFAST or the SAME DINNER for a month?","Give up SWEETS or FAST FOOD for a month?","Cook at HOME or eat at a RESTAURANT?"],
      school:["Have MORE HOMEWORK or MORE EXAMS?","Study ALONE or with a GROUP?","Start school EARLIER or finish LATER?"],
      hobbies:["Choose one hobby FOREVER or try a NEW hobby every month?","Do a hobby ALONE or with FRIENDS?","Spend free time OUTSIDE or ONLINE?"],
      technology:["Give up SOCIAL MEDIA or VIDEO GAMES for a month?","Use only a PHONE or only a COMPUTER for a week?","Have MORE PRIVACY or MORE PERSONALIZATION online?"],
      "daily-life":["Have more FREE TIME or more MONEY for experiences?","Wake up VERY EARLY or stay up VERY LATE?","Have a STRICT ROUTINE or a FLEXIBLE ROUTINE?"]
    };
    const ratherOptions=ratherBank[p.topic]||ratherBank["daily-life"];
    const ratherPrompt=ratherOptions[roundNo%ratherOptions.length];

    const categoryBank={
      travel:["travel words","things you pack for a trip","places or services a traveller may use"],
      food:["foods or ingredients","things you find in a kitchen","words that describe taste or food"],
      school:["school objects","school subjects","things students do at school"],
      hobbies:["hobbies or free-time activities","things used for hobbies","verbs connected with free time"],
      technology:["devices or apps","things people do online","online safety or privacy words"],
      "daily-life":["daily activities","places you go during a normal week","things you do before work or school"]
    };
    const categoryOptions=categoryBank[p.topic]||categoryBank["daily-life"];
    const categoryPrompt=categoryOptions[roundNo%categoryOptions.length];

    const findSomeoneBank={
      travel:["has visited a place they want to return to","prefers train travel to flying","has planned a trip completely by themselves"],
      food:["can cook a meal they are proud of","has tried a food they initially disliked","prefers cooking at home to eating out"],
      school:["has learned something useful outside school","has a study technique that really works","would change one rule at school"],
      hobbies:["started a new hobby in the last year","has a hobby most people do not know about","would like to learn a creative hobby"],
      technology:["has deleted an app because it wasted time","uses a tool that saves them time every day","has changed a privacy setting recently"],
      "daily-life":["changed one part of their daily routine recently","has a morning habit they recommend","is trying to spend less time on one daily activity"]
    };
    const findOptions=findSomeoneBank[p.topic]||findSomeoneBank["daily-life"];
    const findPrompt=findOptions[roundNo%findOptions.length];

    const errorBank={
      "Pre-A1":[
        ["She go to school every day.","She goes to school every day."],
        ["He have a blue phone.","He has a blue phone."],
        ["They is very happy today.","They are very happy today."]
      ],
      A1:[
        ["She go to school every day.","She goes to school every day."],
        ["I am play football on Fridays.","I play football on Fridays."],
        ["He don't like spicy food.","He doesn't like spicy food."]
      ],
      A2:[
        ["I have went there last weekend.","I went there last weekend."],
        ["She didn't saw the message.","She didn't see the message."],
        ["We are living here since 2024.","We have lived here since 2024."]
      ],
      B1:[
        ["If I will have time, I will join you.","If I have time, I will join you."],
        ["I suggested him to take the train.","I suggested that he take the train."],
        ["Although it was raining, but we continued.","Although it was raining, we continued."]
      ],
      B2:[
        ["Despite of being tired, she continued working.","Despite being tired, she continued working."],
        ["Had I knew earlier, I would have changed it.","Had I known earlier, I would have changed it."],
        ["The report, which I sent it yesterday, was incomplete.","The report, which I sent yesterday, was incomplete."]
      ]
    };
    const errorOptions=errorBank[p.level]||errorBank.A2;
    const errorItem=errorOptions[roundNo%errorOptions.length];

    const roleplayVariantBank={
      travel:{
        child:["You are at a train station. Ask where the train goes and what time it leaves.","You are buying a ticket. Ask the price and destination.","You are lost on holiday. Ask someone for directions."],
        teen:["You and a friend are planning a weekend trip with a limited budget. Agree on transport, accommodation and one activity.","Your train is delayed. Ask staff for information and decide what to do.","Two friends want different holiday destinations. Negotiate one plan."],
        adult:["Your hotel room has a problem. Explain it politely and negotiate a practical solution with reception.","Your flight is cancelled. Ask the airline for alternatives and explain your priorities.","You are renting a car. Ask about price, insurance and return conditions."]
      },
      food:{
        child:["You are ordering a snack. Ask for what you want and say thank you.","Ask a friend what food they like and choose one snack together.","You are in a café. Ask for a drink and one simple change."],
        teen:["One person is a customer with a food allergy; the other is a waiter. Ask and answer clear questions.","Plan a low-cost meal with a friend and agree on ingredients.","A restaurant order is wrong. Explain the problem politely."],
        adult:["A restaurant order is incorrect. Explain the problem politely and agree on a solution.","Book a table and ask about dietary requirements.","Discuss with a colleague where to eat when you have different preferences."]
      },
      school:{
        child:["Ask a classmate what homework you have and when it is due.","Borrow a school item from a classmate and explain why you need it.","Ask the teacher for help with one task."],
        teen:["A student asks a teacher for more time on an assignment. Explain the reason and respond.","Two students plan how to divide a group project.","Discuss whether a school rule should be changed."],
        adult:["Discuss a training course with a colleague and decide which option fits your goals.","Ask a course administrator to change your schedule.","Give constructive feedback about a training session."]
      },
      hobbies:{
        child:["Invite a friend to do a hobby with you after school.","Explain the rules of your favorite hobby to a friend.","Ask a friend to teach you a simple hobby skill."],
        teen:["Persuade a friend to try your hobby for one month.","Plan a weekend activity when two friends prefer different hobbies.","Explain why your hobby deserves more time in your schedule."],
        adult:["Explain a hobby to someone who thinks they are too busy to start anything new.","Join a local club and ask about schedule, cost and equipment.","Convince a friend to try a new activity with you."]
      },
      technology:{
        child:["Ask a friend for help using a simple app.","Explain how to take and send a photo.","Ask permission before using someone else's device."],
        teen:["One person wants to post a group photo; the other is uncomfortable. Discuss what to do.","A friend spends too much time on an app. Suggest practical changes.","Choose between two devices for school and justify the choice."],
        adult:["Explain a digital service problem to customer support and ask for a specific solution.","Discuss a privacy concern with a service provider.","Negotiate a refund for a subscription you could not use."]
      },
      "daily-life":{
        child:["Ask a friend what they do after school.","Plan an afternoon with a friend and agree on a time.","Explain your morning routine to a classmate."],
        teen:["Two friends are trying to plan a study session around busy schedules.","One friend is always late. Discuss a solution.","Plan a balanced weekday with school, rest and free time."],
        adult:["Two colleagues need to rearrange a meeting because one person's schedule changed.","Call to reschedule an appointment and offer alternatives.","Discuss how to share household tasks fairly."]
      }
    };
    const band=ageBand(p.age);
    const roleplayOptions=(roleplayVariantBank[p.topic]||roleplayVariantBank["daily-life"])[band]||[(roleplays[p.topic]||roleplays.travel)[band]];
    const roleplayPrompt=roleplayOptions[roundNo%roleplayOptions.length];

    const data={
      taboo:{
        label:"TABOO · 60 SEC",
        main:String(word).toUpperCase(),
        support:"Explain the target word without saying any of the forbidden words below.",
        visibleLabel:"DO NOT SAY",
        visible:tabooCluesFor(word,p.topic),
        answer:[],
        timerSeconds:60
      },
      rather:{
        label:"WOULD YOU RATHER?",
        main:ratherPrompt,
        support:p.level==="Pre-A1"||p.level==="A1" ? "Choose one and give a short reason." : "Choose a side, explain why, then ask a follow-up question.",
        visibleLabel:"YOUR TASK",
        visible:["Choose A or B","Give a reason","Ask a follow-up"],
        answer:[]
      },
      sentence:{
        label:"SENTENCE BUILDER",
        main:shuffleSentence(sentence),
        support:"Put the words in the correct order.",
        answer:[sentence],
        revealLabel:"Show correct sentence"
      },
      wheel:{
        label:"SPEAKING WHEEL",
        main:question,
        support:p.level==="Pre-A1" ? "Use words or one short sentence." : p.level==="A1" ? "Answer in 1–2 sentences." : p.level==="A2" ? "Give a reason and ask one follow-up." : "Develop your answer and support it with an example.",
        visibleLabel:"SPEAKING FLOW",
        visible:["Think","Answer","Follow-up"],
        answer:[]
      },
      memory:{
        label:"MEMORY MATCH",
        main:String(word).toUpperCase(),
        support:"Say or choose the meaning of this word.",
        answer:[definitions[word] || ("a useful "+topicName+" word")],
        revealLabel:"Show meaning"
      },
      quiz:{
        label:"TEAM QUIZ · 15 SEC",
        main:"What does “"+word+"” mean?",
        support:"Discuss briefly, then give one clear answer.",
        answer:[definitions[word] || ("It is connected with "+topicName+".")],
        revealLabel:"Reveal answer",
        timerSeconds:15
      },
      scramble:{
        label:"WORD SCRAMBLE",
        main:shuffleWord(word).toUpperCase(),
        support:"Unscramble this "+topicName+" word.",
        answer:[String(word).toUpperCase()],
        revealLabel:"Reveal word"
      },
      missing:{
        label:"MISSING WORD",
        main:missing.main,
        support:missing.support,
        answer:missing.answer,
        revealLabel:"Reveal missing word"
      },
      hotseat:{
        label:"HOT SEAT · 60 SEC",
        main:question,
        support:"Answer quickly, then press Next for another prompt.",
        visibleLabel:"RULES",
        visible:["Keep talking","No long pause","Next = new prompt"],
        answer:[],
        timerSeconds:60
      },
      category:{
        label:"CATEGORY RACE · 30 SEC",
        main:"Name "+(p.level==="Pre-A1"?3:p.level==="A1"?5:p.level==="A2"?6:8)+" "+categoryPrompt+".",
        support:"One point for each correct word. No repeats.",
        answer:safeWords.slice(0,8).map(x=>String(x).toUpperCase()),
        revealLabel:"Show sample answers",
        timerSeconds:30
      },
      roleplay:{
        label:"ROLE PLAY",
        main:roleplayPrompt,
        support:p.level==="Pre-A1"||p.level==="A1" ? "Use the useful phrases you know." : "Stay in role for at least one minute and reach a clear outcome.",
        visibleLabel:"ROLE FLOW",
        visible:["Student A starts","Student B responds","Swap roles"],
        answer:[]
      },
      story:{
        label:"STORY CHAIN",
        main:p.age==="6-8"||p.age==="9-11" ? "Yesterday, I found a strange "+word+"..." : "Everything was normal until someone mentioned the "+word+"...",
        support:"Each student adds one sentence. Keep the story connected.",
        visibleLabel:"RULE",
        visible:[p.level==="B1"||p.level==="B2" ? "Use at least one linking phrase" : "Use complete sentences"],
        answer:[]
      },
      error:{
        label:"ERROR HUNTER",
        main:errorItem[0],
        support:"Find the error, correct it and explain the rule.",
        answer:[errorItem[1]],
        revealLabel:"Show correction"
      },
      pictionary:{
        label:"PICTIONARY · 30 SEC",
        main:String(word).toUpperCase(),
        support:"One student draws the target. Others guess.",
        visibleLabel:"DO NOT",
        visible:["No letters","No numbers","No talking"],
        answer:[],
        timerSeconds:30
      },
      findsomeone:{
        label:"FIND SOMEONE WHO...",
        main:findPrompt,
        support:"Find one person, ask a follow-up question, then report the answer.",
        visibleLabel:"3 STEPS",
        visible:["Find","Ask","Report"],
        answer:[]
      }
    };
    return data[type] || data.wheel;
  }

  const gameNames={
    taboo:"Taboo",rather:"Would You Rather?",sentence:"Sentence Builder",wheel:"Speaking Wheel",
    memory:"Memory Match",quiz:"Team Quiz",scramble:"Word Scramble",missing:"Missing Word",
    hotseat:"Hot Seat",category:"Category Race",roleplay:"Role Play",story:"Story Chain",
    error:"Error Hunter",pictionary:"Pictionary Prompt",findsomeone:"Find Someone Who"
  };

  let activeGame="taboo", gameRound=0, gameBlue=0, gameOrange=0, activeGamePrompt=null;
  let gameTimerId=null, gameTimerInitial=0, gameTimerRemaining=0;
  const gameModal=$("#gameModal");

  function gameLang(tr,en){
    return window.ESCEduI18n?.getLang?.()==="en" ? en : tr;
  }
  function gameFullscreenElement(){
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function updateGameFullscreenButton(){
    const btn=$("#gameFullscreenToggle");
    const label=$("#gameFullscreenLabel");
    if(!btn||!label)return;
    const active=Boolean(gameFullscreenElement());
    label.textContent=active ? gameLang("Tam ekrandan çık","Exit fullscreen") : gameLang("Tam ekran","Fullscreen");
    btn.setAttribute("aria-label",label.textContent);
    btn.title=label.textContent;
    btn.classList.toggle("active",active);
  }

  async function toggleGameFullscreen(){
    const target=$("#gameModalCard") || gameModal;
    if(!target)return;
    try{
      if(gameFullscreenElement()){
        const exit=document.exitFullscreen || document.webkitExitFullscreen;
        if(exit) await exit.call(document);
      }else{
        const request=target.requestFullscreen || target.webkitRequestFullscreen;
        if(request) await request.call(target);
        else throw new Error("FULLSCREEN_NOT_SUPPORTED");
      }
    }catch(err){
      console.warn("Game fullscreen unavailable",err);
      const btn=$("#gameFullscreenToggle");
      if(btn){
        const old=btn.title;
        btn.title=gameLang("Tarayıcı tam ekranı desteklemiyor","Fullscreen is not supported by this browser");
        setTimeout(()=>{btn.title=old;},1800);
      }
    }
    updateGameFullscreenButton();
  }

  function stopGameTimer(){
    if(gameTimerId){
      clearInterval(gameTimerId);
      gameTimerId=null;
    }
    $("#gameTimer")?.classList.remove("running");
  }

  function formatGameTime(seconds){
    const s=Math.max(0,Number(seconds)||0);
    const m=Math.floor(s/60);
    const r=String(s%60).padStart(2,"0");
    return m+":"+r;
  }

  function paintGameTimer(){
    const value=$("#gameTimerValue");
    if(value)value.textContent=formatGameTime(gameTimerRemaining);
    const start=$("#gameTimerStart");
    if(start){
      start.textContent=gameTimerId
        ? gameLang("Duraklat","Pause")
        : gameTimerRemaining<=0
          ? gameLang("Yeniden başlat","Restart")
          : gameLang("Başlat","Start");
    }
    $("#gameTimer")?.classList.toggle("finished",gameTimerInitial>0&&gameTimerRemaining<=0);
  }

  function configureGameTimer(seconds){
    stopGameTimer();
    gameTimerInitial=Math.max(0,Number(seconds)||0);
    gameTimerRemaining=gameTimerInitial;
    const wrap=$("#gameTimer");
    if(wrap)wrap.hidden=!gameTimerInitial;
    paintGameTimer();
  }

  function toggleGameTimer(){
    if(!gameTimerInitial)return;
    if(gameTimerId){
      stopGameTimer();
      paintGameTimer();
      return;
    }
    if(gameTimerRemaining<=0)gameTimerRemaining=gameTimerInitial;
    $("#gameTimer")?.classList.remove("finished");
    gameTimerId=setInterval(()=>{
      gameTimerRemaining=Math.max(0,gameTimerRemaining-1);
      paintGameTimer();
      if(gameTimerRemaining<=0){
        stopGameTimer();
        paintGameTimer();
      }
    },1000);
    $("#gameTimer")?.classList.add("running");
    paintGameTimer();
  }

  function resetGameTimer(){
    stopGameTimer();
    gameTimerRemaining=gameTimerInitial;
    $("#gameTimer")?.classList.remove("finished");
    paintGameTimer();
  }

  function renderGameExtra(d,revealed=false){
    const extra=$("#gameTaskExtra");
    if(!extra)return;
    const visible=Array.isArray(d?.visible)?d.visible.filter(Boolean):[];
    const answers=Array.isArray(d?.answer)?d.answer.filter(Boolean):[];
    let html="";
    if(visible.length){
      html+='<div class="game-extra-group always-visible">';
      html+='<b>'+esc(d.visibleLabel||gameLang("OYUN İPUÇLARI","GAME NOTES"))+'</b>';
      html+='<div>'+visible.map(x=>'<span>'+esc(x)+'</span>').join("")+'</div></div>';
    }
    if(answers.length){
      if(revealed){
        html+='<div class="game-extra-group answer-group">';
        html+='<b>'+esc(gameLang("CEVAP / İPUCU","ANSWER / HINT"))+'</b>';
        html+='<div>'+answers.map(x=>'<span>'+esc(x)+'</span>').join("")+'</div></div>';
      }else{
        html+='<div class="game-hidden-note">'+esc(gameLang("Cevap gizli","Answer hidden"))+'</div>';
      }
    }
    extra.classList.toggle("revealed",revealed);
    extra.innerHTML=html;
  }

  async function closeAdaptiveGame(){
    const wasOpen=gameModal?.classList.contains("open");
    stopGameTimer();
    if(gameFullscreenElement()){
      const exit=document.exitFullscreen || document.webkitExitFullscreen;
      if(exit){
        try{await exit.call(document);}catch{}
      }
    }
    gameModal?.classList.remove("open");
    gameModal?.setAttribute("aria-hidden","true");
    if(wasOpen) document.dispatchEvent(new CustomEvent("esc:game-closed"));
  }

  function paintGame(){
    const p=currentProfile();
    const d=gamePrompt(activeGame,gameRound);
    activeGamePrompt=d;
    $("#gameModalTitle").textContent=gameNames[activeGame]||"Classroom Game";
    $("#gameModalType").textContent="ADAPTIVE GAME";
    $("#gameProfileBadge").textContent=`${p.age.replace("-","–")} · ${p.level} · ${p.topic.replace("-"," ")}`;
    $("#gameTaskLabel").textContent=d.label||"CLASSROOM GAME";
    $("#gameTaskMain").textContent=d.main||"Ready";
    $("#gameTaskSupport").textContent=d.support||"Follow the instructions and continue.";
    renderGameExtra(d,false);

    const reveal=$("#revealGameAnswer");
    const hasAnswer=Array.isArray(d.answer)&&d.answer.length>0;
    if(reveal){
      reveal.hidden=!hasAnswer;
      reveal.textContent=d.revealLabel||gameLang("Cevabı / ipucunu göster","Reveal / Hint");
      reveal.disabled=false;
    }

    $("#nextGameRound").textContent=gameLang("Sonraki tur →","Next round →");
    $("#gameBlueScore").textContent=gameBlue;
    $("#gameOrangeScore").textContent=gameOrange;
    configureGameTimer(d.timerSeconds||0);
  }

  $$("[data-launch-game]").forEach(b=>b.addEventListener("click",()=>{
    activeGame=b.dataset.launchGame;
    gameRound=0;
    gameBlue=0;
    gameOrange=0;
    paintGame();
    gameModal?.classList.add("open");
    gameModal?.setAttribute("aria-hidden","false");
    updateGameFullscreenButton();
  }));

  $("#gameFullscreenToggle")?.addEventListener("click",toggleGameFullscreen);
  document.addEventListener("fullscreenchange",updateGameFullscreenButton);
  document.addEventListener("webkitfullscreenchange",updateGameFullscreenButton);
  window.addEventListener("esc:languagechange",updateGameFullscreenButton);

  $("#closeGameModal")?.addEventListener("click",closeAdaptiveGame);
  $("#gameModal")?.addEventListener("click",e=>{if(e.target===gameModal)closeAdaptiveGame();});

  $("#nextGameRound")?.addEventListener("click",()=>{
    gameRound++;
    paintGame();
  });

  $("#revealGameAnswer")?.addEventListener("click",e=>{
    if(!activeGamePrompt)return;
    renderGameExtra(activeGamePrompt,true);
    e.currentTarget.disabled=true;
    e.currentTarget.textContent=gameLang("Gösterildi ✓","Revealed ✓");
  });

  $("#gameTimerStart")?.addEventListener("click",toggleGameTimer);
  $("#gameTimerReset")?.addEventListener("click",resetGameTimer);

  $("#gameBluePlus")?.addEventListener("click",()=>{$("#gameBlueScore").textContent=++gameBlue;});
  $("#gameBlueMinus")?.addEventListener("click",()=>{$("#gameBlueScore").textContent=gameBlue=Math.max(0,gameBlue-1);});
  $("#gameOrangePlus")?.addEventListener("click",()=>{$("#gameOrangeScore").textContent=++gameOrange;});
  $("#gameOrangeMinus")?.addEventListener("click",()=>{$("#gameOrangeScore").textContent=gameOrange=Math.max(0,gameOrange-1);});

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){
      if(gameFullscreenElement()) return;
      const gameWasOpen=gameModal?.classList.contains("open");
      if(gameWasOpen){
        closeAdaptiveGame();
        return;
      }
      if($("#lessonModal")?.classList.contains("open")){
        $("#closeLessonModal")?.click();
      }
    }
  });
})();
