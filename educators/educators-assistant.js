(() => {
  "use strict";

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=(v="")=>String(v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  const tx=(tr,en)=>document.documentElement.lang==="en"?en:tr;
  let pack=null;
  let history=[];

  function status(text,ok=false){
    const el=$("#assistantStatus");
    if(!el)return;
    el.hidden=!text;
    el.textContent=text||"";
    el.className="lesson-generate-status"+(ok?" is-ready":"");
  }

  function mappedTopic(topic){
    const t=String(topic||"").toLowerCase();
    if(/travel|trip|holiday|tourism|journey|airport|hotel/.test(t))return "travel";
    if(/food|meal|restaurant|cook|kitchen|recipe/.test(t))return "food";
    if(/school|education|classroom|exam|study|student/.test(t))return "school";
    if(/hobby|music|sport|game|reading|photography/.test(t))return "hobbies";
    if(/technology|internet|phone|computer|digital|\bai\b/.test(t))return "technology";
    if(/daily|routine|home|family|life|habit/.test(t))return "daily-life";
    return "custom";
  }

  function stageKey(stage=""){
    const s=String(stage).toLowerCase();
    if(s.includes("warm"))return "warmup";
    if(s.includes("vocab"))return "vocabulary";
    if(s.includes("game"))return "game";
    if(s.includes("speak"))return "speaking";
    if(s.includes("exit"))return "exit";
    return s.replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"activity";
  }

  function syncFromBuilder(force=false){
    if(!force && $("#assistantTopic")?.value.trim())return;
    const builderTopic=$("#topic");
    const custom=$("#customTopic")?.value.trim();
    const topic=builderTopic?.value==="custom"
      ? custom
      : builderTopic?.selectedOptions?.[0]?.textContent || "";

    if($("#assistantTopic"))$("#assistantTopic").value=topic||"";
    if($("#assistantAge") && $("#ageGroup"))$("#assistantAge").value=$("#ageGroup").value;
    if($("#assistantLevel") && $("#level"))$("#assistantLevel").value=$("#level").value;
    if($("#assistantGoal") && $("#goal"))$("#assistantGoal").value=$("#goal").value;
    if($("#assistantClassSize") && $("#studentCount"))$("#assistantClassSize").value=$("#studentCount").value||8;

    const d=Number($("#duration")?.value||40);
    const duration=$("#assistantDuration");
    if(duration){
      const options=[...duration.options].map(o=>Number(o.value));
      duration.value=String(options.includes(d)?d:options.reduce((a,b)=>Math.abs(b-d)<Math.abs(a-d)?b:a,40));
    }
  }

  function render(){
    if(!pack)return;
    $("#assistantEmpty").hidden=true;
    $("#assistantResult").hidden=false;
    $("#assistantResultTitle").textContent=pack.title||tx("Ders paketi","Lesson pack");
    $("#assistantResultMeta").textContent=`${pack.level||""} · ${pack.age_group||""} · ${pack.duration_minutes||40} min · ${String(pack.goal||"speaking").toUpperCase()}`;
    $("#assistantObjective").textContent=pack.objective||"";

    $("#assistantVocab").innerHTML=(pack.target_vocabulary||[]).slice(0,10)
      .map(x=>'<span>'+esc(x)+'</span>').join("");

    $("#assistantPlan").innerHTML=(pack.plan||[]).map((step,i)=>
      '<div class="assistant-plan-row"><span>'+String(i+1).padStart(2,"0")+'</span><p><b>'+esc(step.title||step.stage||"Activity")+'</b><small>'+esc(step.duration||"")+' · '+esc(step.mode||"")+'</small><em>'+esc(step.prompt||"")+'</em></p></div>'
    ).join("");

    const fillList=(sel,items)=>{$(sel).innerHTML=(items||[]).map(x=>'<li>'+esc(x)+'</li>').join("");};
    fillList("#assistantSpeaking",pack.speaking_questions);
    fillList("#assistantWorksheet",pack.worksheet);
    fillList("#assistantHomework",pack.homework);

    $("#assistantGameName").textContent=pack.game?.name||tx("Sınıf oyunu","Classroom game");
    $("#assistantGameText").textContent=[pack.game?.instructions,pack.game?.prompt].filter(Boolean).join(" ");

    status(tx("Ders paketi hazır ✓","Lesson pack ready ✓"),true);
  }

  function historyDate(value){
    try{
      return new Intl.DateTimeFormat(document.documentElement.lang==="en"?"en-GB":"tr-TR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(value));
    }catch{return "";}
  }

  function renderHistory(){
    const wrap=$("#assistantHistoryList");
    if(!wrap)return;
    if(!history.length){
      wrap.innerHTML='<div class="assistant-history-empty">'+tx("Henüz kayıtlı Teacher Assistant paketin yok.","No saved Teacher Assistant packs yet.")+'</div>';
      return;
    }
    wrap.innerHTML=history.map(item=>
      '<article class="assistant-history-card" data-history-id="'+esc(item.id)+'">'+
        '<div class="assistant-history-main"><small>'+esc(String(item.goal||"speaking").toUpperCase())+'</small><strong>'+esc(item.pack?.title||item.topic||"Lesson pack")+'</strong><span>'+esc(item.level||"")+' · '+esc(item.age_group||"")+' · '+Number(item.duration_minutes||40)+' min · '+esc(historyDate(item.created_at))+'</span></div>'+
        '<div class="assistant-history-actions"><button type="button" data-history-open="'+esc(item.id)+'">'+tx("Aç","Open")+'</button><button type="button" data-history-delete="'+esc(item.id)+'" class="danger-lite">'+tx("Sil","Delete")+'</button></div>'+
      '</article>'
    ).join("");

    $("[data-history-open]",wrap).forEach(btn=>btn.addEventListener("click",()=>{
      const item=history.find(x=>x.id===btn.dataset.historyOpen);
      if(!item?.pack)return;
      pack=item.pack;
      render();
      $("#assistantOutput")?.scrollIntoView({behavior:"smooth",block:"start"});
      window.ESCAnalytics?.track?.("educator_assistant_history_opened","other");
    }));
    $("[data-history-delete]",wrap).forEach(btn=>btn.addEventListener("click",()=>removeHistory(btn.dataset.historyDelete,btn)));
  }

  async function loadHistory(){
    const wrap=$("#assistantHistoryList");
    if(wrap)wrap.innerHTML='<div class="assistant-history-empty">'+tx("Geçmiş yükleniyor…","Loading history…")+'</div>';
    try{
      const session=await window.ESCSupabase?.getSession?.();
      if(!session){
        history=[];
        renderHistory();
        return;
      }
      history=await window.ESCSupabase.listEducatorAssistantHistory(10);
      renderHistory();
    }catch(err){
      console.warn("Assistant history load failed",err);
      if(wrap)wrap.innerHTML='<div class="assistant-history-empty">'+tx("Geçmiş yüklenemedi.","Could not load history.")+'</div>';
    }
  }

  async function removeHistory(id,button){
    if(!id)return;
    if(!confirm(tx("Bu Teacher Assistant paketi geçmişten silinsin mi?","Delete this Teacher Assistant pack from history?")))return;
    button.disabled=true;
    try{
      await window.ESCSupabase.deleteEducatorAssistantHistory(id);
      history=history.filter(x=>x.id!==id);
      renderHistory();
    }catch(err){
      console.warn("Assistant history delete failed",err);
      status(err?.message||tx("Paket silinemedi.","Could not delete the pack."));
      button.disabled=false;
    }
  }

  function toPlainText(){
    if(!pack)return "";
    const lines=[
      pack.title,
      pack.objective,
      "",
      tx("HEDEF KELİMELER","TARGET VOCABULARY")+": "+(pack.target_vocabulary||[]).join(", "),
      tx("DİL ODAĞI","LANGUAGE FOCUS")+": "+(pack.language_focus||""),
      "",
      tx("DERS AKIŞI","LESSON FLOW")
    ];
    (pack.plan||[]).forEach((s,i)=>lines.push(`${i+1}. ${s.title||s.stage} · ${s.duration||""} · ${s.mode||""}\n   ${s.prompt||""}`));
    lines.push("",tx("SPEAKING SORULARI","SPEAKING QUESTIONS"));
    (pack.speaking_questions||[]).forEach((x,i)=>lines.push(`${i+1}. ${x}`));
    lines.push("",tx("WORKSHEET TASLAĞI","WORKSHEET BLUEPRINT"));
    (pack.worksheet||[]).forEach((x,i)=>lines.push(`${i+1}. ${x}`));
    lines.push("",tx("ÖDEV","HOMEWORK"));
    (pack.homework||[]).forEach((x,i)=>lines.push(`${i+1}. ${x}`));
    lines.push("",tx("OYUN","GAME")+": "+(pack.game?.name||""));
    lines.push(pack.game?.instructions||"",pack.game?.prompt||"");
    return lines.join("\n");
  }

  async function generate(e){
    e.preventDefault();
    const btn=$("#assistantGenerate");
    if(btn)btn.disabled=true;
    status(tx("Ders paketi hazırlanıyor…","Building your lesson pack…"));
    try{
      const session=await window.ESCSupabase?.getSession?.();
      if(!session)throw new Error(tx("Teacher Assistant için öğretmen hesabına giriş yapın.","Sign in to your teacher account to use Teacher Assistant."));
      const payload={
        topic:$("#assistantTopic")?.value.trim(),
        age_group:$("#assistantAge")?.value,
        level:$("#assistantLevel")?.value,
        duration:Number($("#assistantDuration")?.value||40),
        class_size:Number($("#assistantClassSize")?.value||8),
        goal:$("#assistantGoal")?.value||"speaking",
        context:$("#assistantContext")?.value.trim()||""
      };
      pack=await window.ESCSupabase.generateEducatorAssistantPack(payload);
      render();
      await loadHistory();
      window.ESCAnalytics?.track?.("educator_assistant_generated","other");
    }catch(err){
      console.warn("Teacher Assistant failed",err);
      status(err?.message||tx("Ders paketi oluşturulamadı.","Could not generate the lesson pack."));
    }finally{
      if(btn)btn.disabled=false;
    }
  }

  function applyToBuilder(){
    if(!pack)return;
    const form=$("#lessonForm");
    if(form)delete form.dataset.editingLessonId;

    if($("#ageGroup"))$("#ageGroup").value=pack.age_group||"12-14";
    if($("#level"))$("#level").value=pack.level||"A2";
    if($("#duration")){
      const d=String(pack.duration_minutes||40);
      if(![...$("#duration").options].some(o=>o.value===d)){
        const o=document.createElement("option");o.value=d;o.textContent=d+" min";$("#duration").appendChild(o);
      }
      $("#duration").value=d;
    }
    if($("#goal"))$("#goal").value=pack.goal||"speaking";
    if($("#studentCount"))$("#studentCount").value=String(pack.class_size||8);

    const topic=mappedTopic(pack.topic);
    if($("#topic")){
      $("#topic").value=topic;
      $("#topic").dispatchEvent(new Event("change",{bubbles:true}));
    }
    if(topic==="custom" && $("#customTopic")){
      $("#customTopic").value=pack.topic||"";
      $("#customTopic").dispatchEvent(new Event("input",{bubbles:true}));
    }

    const plan=$("#generatedPlan");
    if(plan){
      plan.innerHTML=(pack.plan||[]).map(step=>
        '<div class="plan-row" data-stage-key="'+esc(stageKey(step.stage||step.title))+'" data-prompt="'+esc(step.prompt||"")+'"><span>'+esc(step.duration||"")+'</span><b>'+esc(step.title||step.stage||"Activity")+'</b><small>'+esc(step.mode||"")+'</small></div>'
      ).join("");
    }

    const first=pack.plan?.[0];
    if($("#adaptiveQuestion"))$("#adaptiveQuestion").textContent=first?.prompt||pack.speaking_questions?.[0]||"";
    if($("#adaptiveSupport"))$("#adaptiveSupport").textContent=pack.teacher_note||pack.differentiation?.support||"";
    if($("#lessonGenerateStatus")){
      $("#lessonGenerateStatus").hidden=false;
      $("#lessonGenerateStatus").className="lesson-generate-status is-ready";
      $("#lessonGenerateStatus").textContent=tx("Teacher Assistant paketi aktarıldı ✓ Düzenleyebilir, kaydedebilir veya başlatabilirsin.","Teacher Assistant pack imported ✓ Edit, save or start the lesson.");
    }

    document.querySelector('.side-item[data-panel="builder"]')?.click();
    setTimeout(()=>$("#lessonForm")?.scrollIntoView({behavior:"smooth",block:"start"}),80);
    window.ESCAnalytics?.track?.("educator_assistant_applied","other");
  }

  async function copyPack(e){
    if(!pack)return;
    const btn=e.currentTarget,old=btn.textContent;
    try{
      await navigator.clipboard.writeText(toPlainText());
      btn.textContent=tx("Kopyalandı ✓","Copied ✓");
      setTimeout(()=>btn.textContent=old,1200);
    }catch{
      btn.textContent=tx("Kopyalanamadı","Copy failed");
      setTimeout(()=>btn.textContent=old,1200);
    }
  }

  function bind(){
    $("#assistantForm")?.addEventListener("submit",generate);
    $("#assistantApplyBuilder")?.addEventListener("click",applyToBuilder);
    $("#assistantCopyPack")?.addEventListener("click",copyPack);
    $("#assistantHistoryRefresh")?.addEventListener("click",loadHistory);

    document.addEventListener("click",e=>{
      const trigger=e.target.closest('[data-panel="assistant"],[data-workflow="assistant"]');
      if(trigger)setTimeout(()=>{syncFromBuilder(false);loadHistory();},40);
    });

    window.addEventListener("esc:languagechange",()=>{
      if(pack)render();
      renderHistory();
    });

    syncFromBuilder(false);
    loadHistory();
  }

  document.addEventListener("DOMContentLoaded",bind);
})();
