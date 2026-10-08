(() => {
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];

  let guideIndex=0;
  let guideTimer=null;
  let soundEnabled=true;
  let audioCtx=null;
  let speechRunId=0;
  let voiceCache=[];

  const tourCopy={
    tr:{
      captions:[
        "Sınıfını, seviyeyi ve öğretim yolunu seç.",
        "Dersin iskeletini oluştur; istediğin aşamayı çıkarabilirsin.",
        "Practice Game'i takımsız veya iki takımlı kullan.",
        "Canlı derste Next ile ilerle; puan tamamen isteğe bağlı."
      ],
      narration:[
        "Hazırsan başlayalım. Önce kimi öğreteceğini seçiyorsun. Bir okul sınıfıyla çalışabilir ya da özel ders öğrencin için hazırlanabilirsin. İstersen MEB programından ilerle, istersen dersi tamamen kendin oluştur.",
        "Şimdi dersin akışını hazırlıyoruz. Süreyi, seviyeyi ve hedefi sen belirliyorsun. Isınma, kelime çalışması, kısa bir oyun, konuşma ve ders sonu kontrolü. İhtiyacın olmayan bölümü çıkarabilir, dersini istediğin gibi düzenleyebilirsin.",
        "Oyun kullanıp kullanmamak da tamamen sana bağlı. İstersen bireysel çalış, istersen öğrencileri eşleştir ya da iki takım oluştur. Sınıfın için hangi yöntem daha uygunsa onu seç.",
        "Ders başladığında ekran seninle birlikte ilerler. Soruyu göster, öğrencilere düşünmeleri için zaman ver ve onları konuştur. Hazır olduğunda sonraki aşamaya geç. Dersin kontrolü her zaman sende."
      ]
    },
    en:{
      captions:[
        "Choose the class, level and teaching path.",
        "Build the lesson structure and remove any stage you do not need.",
        "Run Practice Games with no teams or optional two-team scoring.",
        "Move through the live lesson with Next; scoring is always optional."
      ],
      narration:[
        "Start by choosing who you are teaching. It might be a school class or a private student. Use the curriculum when you want it, or build the lesson freely.",
        "Next, shape the lesson around your time, level and goal. Warm-up, vocabulary, practice game, speaking and exit... keep only the parts your class actually needs.",
        "Games are optional too. No teams, pair work, or two-team scoring... choose the format that fits your classroom.",
        "When class starts, the screen follows your flow. Show the prompt, let students speak, and move on when you are ready. The teacher always stays in control."
      ]
    }
  };

  function lang(){return document.documentElement.lang==="en"?"en":"tr";}
  function copy(){return tourCopy[lang()];}

  function ensureAudio(){
    if(!soundEnabled)return null;
    try{
      audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==="suspended")audioCtx.resume();
      return audioCtx;
    }catch{return null;}
  }
  function tone(freq=560,duration=.08,volume=.035){
    const ctx=ensureAudio(); if(!ctx)return;
    const osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.type="sine";osc.frequency.value=freq;
    gain.gain.setValueAtTime(volume,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
    osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+duration);
  }
  function refreshVoices(){
    if(!("speechSynthesis" in window))return [];
    const voices=window.speechSynthesis.getVoices()||[];
    if(voices.length)voiceCache=voices;
    updateVoiceStatus();
    return voiceCache;
  }

  function voiceScore(v,target){
    const name=(v.name||"").toLowerCase();
    const voiceLang=(v.lang||"").toLowerCase();
    let score=0;
    if(voiceLang===target+"-"+(target==="tr"?"tr":"us"))score+=140;
    else if(voiceLang.startsWith(target))score+=110;
    if(/natural|neural|premium|enhanced/.test(name))score+=90;
    if(target==="tr" && /yelda|emel|seda|selin|filiz|aylin|eda|zeynep|sibel|merve|deniz/.test(name))score+=75;
    if(target==="tr" && /cem|ahmet|mehmet|murat|tolga/.test(name))score-=30;
    if(target==="en" && /ava|samantha|aria|jenny|sonia|victoria|karen|moira|fiona|susan/.test(name))score+=60;
    if(/siri/.test(name))score+=45;
    if(/google/.test(name))score+=24;
    if(/microsoft/.test(name))score+=18;
    if(v.localService)score+=10;
    if(/compact|espeak|festival/.test(name))score-=80;
    return score;
  }

  function voiceCandidates(){
    const target=lang()==="en"?"en":"tr";
    const voices=refreshVoices();
    const preferred=voices
      .filter(v=>(v.lang||"").toLowerCase().startsWith(target))
      .sort((a,b)=>voiceScore(b,target)-voiceScore(a,target));
    const others=voices
      .filter(v=>!preferred.includes(v))
      .sort((a,b)=>voiceScore(b,target)-voiceScore(a,target));
    return [...preferred,...others];
  }

  function naturalLabel(v){
    if(!v)return lang()==="en"?"System default":"Sistem varsayılanı";
    const name=v.name||"System voice";
    const premium=/natural|neural|premium|enhanced|siri|ava|aria|jenny|sonia|deniz|yelda/i.test(name);
    return name+(premium?(lang()==="en"?" · natural":" · doğal"):"");
  }

  function updateVoiceStatus(message){
    const el=$("#guideVoiceStatus");
    if(!el)return;
    if(message){el.textContent=message;return;}
    if(!("speechSynthesis" in window)){
      el.textContent=lang()==="en"?"Voice unavailable in this browser":"Bu tarayıcıda ses motoru kullanılamıyor";
      return;
    }
    const top=voiceCandidatesNoRefresh()[0]||null;
    el.textContent=(lang()==="en"?"Voice: ":"Ses: ")+naturalLabel(top);
  }

  function voiceCandidatesNoRefresh(){
    const target=lang()==="en"?"en":"tr";
    return [...voiceCache]
      .sort((a,b)=>{
        const aMatch=(a.lang||"").toLowerCase().startsWith(target)?1:0;
        const bMatch=(b.lang||"").toLowerCase().startsWith(target)?1:0;
        return (bMatch-aMatch)||(voiceScore(b,target)-voiceScore(a,target));
      });
  }

  function waitForVoices(maxMs=900){
    return new Promise(resolve=>{
      const existing=refreshVoices();
      if(existing.length){resolve(existing);return;}
      let done=false;
      const finish=()=>{
        if(done)return;done=true;
        resolve(refreshVoices());
      };
      const timer=setTimeout(finish,maxMs);
      const onVoices=()=>{
        clearTimeout(timer);
        window.speechSynthesis?.removeEventListener?.("voiceschanged",onVoices);
        finish();
      };
      window.speechSynthesis?.addEventListener?.("voiceschanged",onVoices,{once:true});
    });
  }

  function speechChunks(text){
    const clean=String(text||"").replace(/\.\.\./g,", ").replace(/\s+/g," ").trim();
    return clean?[clean]:[];
  }

  function unlockVoice(){
    if(!("speechSynthesis" in window))return;
    try{
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    }catch{}
  }

  function prosodyFor(chunk,index,total){
    const text=String(chunk||"").trim();
    const questionCount=(text.match(/\?/g)||[]).length;
    const excited=/!/.test(text);

    let rate=lang()==="tr" ? 1.035 : 1.01;
    let pitch=lang()==="tr" ? 1.04 : 1.015;

    if(questionCount) pitch+=.012;
    if(excited){rate+=.008;pitch+=.008;}

    return {
      rate:Math.min(1.065,Math.max(.98,rate)),
      pitch:Math.min(1.075,Math.max(.98,pitch)),
      pause:90
    };
  }

  function speakUtterance(chunk,voice,run,prosody){
    return new Promise(resolve=>{
      if(run!==speechRunId || !soundEnabled){resolve(false);return;}
      let settled=false;
      let started=false;
      const u=new SpeechSynthesisUtterance(chunk);
      u.lang=lang()==="en"?"en-US":"tr-TR";
      if(voice)u.voice=voice;
      u.rate=prosody?.rate || (lang()==="tr"?1.0:.99);
      u.pitch=prosody?.pitch || (lang()==="tr"?1.055:1.025);
      u.volume=1;

      const finish=ok=>{
        if(settled)return;
        settled=true;
        clearTimeout(watchdog);
        $("#guideDemoStage")?.classList.remove("is-speaking");
        resolve(ok);
      };

      const watchdog=setTimeout(()=>{
        if(!started){
          try{window.speechSynthesis.cancel();window.speechSynthesis.resume();}catch{}
          finish(false);
        }
      },1150);

      u.onstart=()=>{
        started=true;
        $("#guideDemoStage")?.classList.add("is-speaking");
        updateVoiceStatus((lang()==="en"?"Speaking: ":"Konuşuyor: ")+naturalLabel(voice));
      };
      u.onend=()=>finish(started);
      u.onerror=()=>finish(false);

      try{
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(u);
      }catch{
        finish(false);
      }
    });
  }

  async function speak(text){
    if(!soundEnabled || !("speechSynthesis" in window))return;
    const run=++speechRunId;
    unlockVoice();

    await waitForVoices();
    if(run!==speechRunId || !soundEnabled)return;

    const candidates=voiceCandidatesNoRefresh();
    const tries=[...candidates.slice(0,5),null];
    const chunks=speechChunks(text);

    for(let i=0;i<chunks.length;i++){
      const chunk=chunks[i];
      if(run!==speechRunId || !soundEnabled)return;
      const prosody=prosodyFor(chunk,i,chunks.length);
      let spoken=false;
      for(const voice of tries){
        if(run!==speechRunId || !soundEnabled)return;
        spoken=await speakUtterance(chunk,voice,run,prosody);
        if(spoken)break;
        await new Promise(r=>setTimeout(r,90));
      }
      if(!spoken){
        updateVoiceStatus(lang()==="en"?"Voice could not start · press Play again":"Ses başlatılamadı · Play'e tekrar bas");
        return;
      }
      await new Promise(r=>setTimeout(r,prosody.pause));
    }
    updateVoiceStatus();
  }

  function stopSpeech(){
    speechRunId++;
    $("#guideDemoStage")?.classList.remove("is-speaking");
    if("speechSynthesis" in window){
      try{window.speechSynthesis.cancel();window.speechSynthesis.resume();}catch{}
    }
  }

  if("speechSynthesis" in window){
    refreshVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged",refreshVoices);
    setTimeout(refreshVoices,250);
    setTimeout(refreshVoices,900);
  }
  function showGuideSlide(i,{narrate=false}={}){
    const slides=$$(".guide-tour-slide");
    const dots=$$("[data-guide-dot]");
    const stage=$("#guideDemoStage");
    if(!slides.length)return;
    guideIndex=(i+slides.length)%slides.length;
    slides.forEach((s,n)=>s.classList.toggle("active",n===guideIndex));
    dots.forEach((d,n)=>d.classList.toggle("active",n===guideIndex));
    if(stage){
      stage.classList.remove("scene-1","scene-2","scene-3","scene-4");
      stage.classList.add("scene-"+(guideIndex+1));
    }
    const caption=$("#guideCaption");
    if(caption)caption.textContent=copy().captions[guideIndex];
    tone([520,620,720,820][guideIndex],.07,.018);
    return narrate?speak(copy().narration[guideIndex]):Promise.resolve();
  }

  function stopGuide(){
    if(guideTimer){clearTimeout(guideTimer);guideTimer=null;}
    stopSpeech();
    const b=$("#guideAutoPlay");
    if(b)b.textContent=lang()==="en"?"▶ Play":"▶ Oynat";
    $("#guideDemoStage")?.classList.remove("is-playing");
  }

  async function playGuideSequence(){
    while(guideTimer && guideIndex<4){
      await showGuideSlide(guideIndex,{narrate:true});
      if(!guideTimer)return;
      await new Promise(resolve=>{
        const visualPause=(soundEnabled && ("speechSynthesis" in window)) ? 900 : 4200;
        guideTimer=setTimeout(resolve,visualPause);
      });
      if(!guideTimer)return;
      if(guideIndex>=3){stopGuide();return;}
      guideIndex++;
    }
  }

  function startGuide(fromStart=false){
    stopGuide();
    ensureAudio();
    refreshVoices();
    if(fromStart)guideIndex=0;
    const b=$("#guideAutoPlay");
    if(b)b.textContent=lang()==="en"?"❚❚ Pause":"❚❚ Duraklat";
    $("#guideDemoStage")?.classList.add("is-playing");
    guideTimer=setTimeout(()=>{},1);
    playGuideSequence();
  }

  $("#guideAutoPlay")?.addEventListener("click",()=>{
    ensureAudio();unlockVoice();
    if(guideTimer)stopGuide(); else startGuide(false);
  });
  $("#guideReplay")?.addEventListener("click",()=>{ensureAudio();unlockVoice();startGuide(true);});
  $("#guideSoundToggle")?.addEventListener("click",e=>{
    soundEnabled=!soundEnabled;
    e.currentTarget.setAttribute("aria-pressed",String(soundEnabled));
    e.currentTarget.textContent=soundEnabled?(lang()==="en"?"🔊 Natural voice":"🔊 Doğal ses"):(lang()==="en"?"🔇 Sound off":"🔇 Ses kapalı");
    if(soundEnabled){ensureAudio();tone(700,.1);speak(copy().narration[guideIndex]);}
    else stopSpeech();
  });
  $$("[data-guide-dot]").forEach((b,i)=>b.addEventListener("click",()=>{
    stopGuide();showGuideSlide(i,{narrate:soundEnabled});
  }));
  $$("[data-open-guide]").forEach(b=>b.addEventListener("click",()=>{
    $("#teacher-guide")?.scrollIntoView({behavior:"smooth",block:"start"});
    setTimeout(()=>startGuide(true),450);
  }));

  const banner=$("#firstUseBanner");
  try{if(localStorage.getItem("escEducatorGuideSeenV1")==="1"&&banner)banner.hidden=true;}catch{}
  $("#closeGuideBanner")?.addEventListener("click",()=>{
    if(banner)banner.hidden=true;
    try{localStorage.setItem("escEducatorGuideSeenV1","1");}catch{}
  });
  $("#bannerOpenGuide")?.addEventListener("click",()=>{
    $("#teacher-guide")?.scrollIntoView({behavior:"smooth",block:"start"});
    setTimeout(()=>startGuide(true),450);
  });

  function setLiveMode(mode){
    const modal=$("#lessonModal");if(!modal)return;
    modal.classList.toggle("solo-mode",mode==="solo");
    $$("[data-live-mode]").forEach(b=>b.classList.toggle("active",b.dataset.liveMode===mode));
    const note=$("#liveModeNote");
    if(note)note.textContent=mode==="solo"
      ?(lang()==="en"?"No teams: move through activities without keeping score.":"Takımsız mod: sadece etkinliği ilerlet. Puan vermek zorunda değilsin.")
      :(lang()==="en"?"2 Teams: split the class into two groups and add points when useful.":"2 Takım modu: sınıfı iki gruba ayır, gerektiğinde puan ekle.");
  }
  $$("[data-live-mode]").forEach(b=>b.addEventListener("click",()=>setLiveMode(b.dataset.liveMode)));

  function teamName(id,fallback){return ($("#"+id)?.value||fallback).trim()||fallback;}
  function paintTeamNames(){
    const one=teamName("teamOneName",lang()==="en"?"Team 1":"Takım 1");
    const two=teamName("teamTwoName",lang()==="en"?"Team 2":"Takım 2");
    if($("#teamOneLabel"))$("#teamOneLabel").textContent=one.toUpperCase();
    if($("#teamTwoLabel"))$("#teamTwoLabel").textContent=two.toUpperCase();
    if($("#addBlue"))$("#addBlue").textContent="+10 "+one;
    if($("#addOrange"))$("#addOrange").textContent="+10 "+two;
    const g1=$("#gameTeamOneLabel"),g2=$("#gameTeamTwoLabel");
    if(g1?.firstChild)g1.firstChild.nodeValue=one.toUpperCase()+" ";
    if(g2?.firstChild)g2.firstChild.nodeValue=two.toUpperCase()+" ";
  }
  ["teamOneName","teamTwoName"].forEach(id=>$("#"+id)?.addEventListener("input",paintTeamNames));

  function setGameMode(mode){
    const modal=$("#gameModal");if(!modal)return;
    modal.classList.toggle("solo-mode",mode==="solo");
    $$("[data-game-mode]").forEach(b=>b.classList.toggle("active",b.dataset.gameMode===mode));
    const note=$("#gameModeNote");
    if(note)note.textContent=mode==="solo"
      ?(lang()==="en"?"No teams: use the activity individually, in pairs or with the whole class.":"Takımsız: etkinliği bireysel, çift veya tüm sınıfla kullan; puan zorunlu değil.")
      :(lang()==="en"?"2 Teams: split the class into two groups and keep score if useful.":"2 Takım: sınıfı iki gruba ayır ve istersen puan tut.");
  }
  $$("[data-game-mode]").forEach(b=>b.addEventListener("click",()=>setGameMode(b.dataset.gameMode)));

  const gameInfo={
    taboo:["Bir öğrenci kelimeyi anlatır; yasak kelimeleri söylemez. Diğerleri tahmin eder.","Vocabulary · 5–10 dk","One student explains the word without saying the taboo clues. Others guess.","Vocabulary · 5–10 min"],
    rather:["İki seçenek gösterilir. Öğrenci birini seçer ve nedenini açıklar.","Speaking · 5–10 dk","Students choose between two options and explain why.","Speaking · 5–10 min"],
    sentence:["Karışık kelimeleri doğru sıraya koyup cümleyi kurarlar.","Grammar · 5–8 dk","Students put shuffled words in the correct order.","Grammar · 5–8 min"],
    wheel:["Speaking sorusunu cevapla; Next ile yeni soruya geç.","Speaking · 5–15 dk","Answer the speaking prompt and use Next for another one.","Speaking · 5–15 min"],
    memory:["Kelime ile anlamı eşleştir; ardından kelimeyi cümlede kullan.","Vocabulary · 5–8 dk","Match the word with its meaning, then use it in a sentence.","Vocabulary · 5–8 min"],
    quiz:["Soruyu göster, düşünme süresi ver, cevabı aç. Takım puanı isteğe bağlı.","Revision · 8–15 dk","Show the question, give thinking time and reveal the answer. Team scoring is optional.","Revision · 8–15 min"],
    scramble:["Karışık harflerden hedef kelimeyi bul.","Vocabulary · 5–8 dk","Unscramble the target word.","Vocabulary · 5–8 min"],
    missing:["Boşluğu uygun kelimeyle tamamla ve nedenini açıkla.","Grammar · 5–10 dk","Complete the gap and explain why the answer fits.","Grammar · 5–10 min"],
    hotseat:["Bir öğrenci kısa sürede art arda sorulara cevap verir.","Fluency · 5–10 dk","One student answers a sequence of quick questions.","Fluency · 5–10 min"],
    category:["Bir kategoride süre içinde olabildiğince çok doğru kelime üret.","Vocabulary · 5 dk","Produce as many correct words as possible in the category.","Vocabulary · 5 min"],
    roleplay:["İki öğrenci verilen gerçek hayat durumunu İngilizce tamamlar.","Speaking · 8–15 dk","Two students complete a real-life scenario in English.","Speaking · 8–15 min"],
    story:["Her öğrenci hikâyeye bir cümle ekler.","Speaking + Grammar · 8–12 dk","Each student adds one sentence to the story.","Speaking + Grammar · 8–12 min"],
    error:["Yanlış cümleyi bul, düzelt ve kuralı açıkla.","Grammar · 5–10 dk","Find the error, correct it and explain the rule.","Grammar · 5–10 min"],
    pictionary:["Bir öğrenci hedef kelimeyi çizer; diğerleri tahmin eder.","Vocabulary · 5–10 dk","One student draws the target word and others guess.","Vocabulary · 5–10 min"],
    findsomeone:["Öğrenciler uygun kişiyi bulur, soru sorar ve cevabı raporlar.","Speaking · 10–15 dk","Students find a matching classmate, ask a follow-up and report the answer.","Speaking · 10–15 min"]
  };

  function enhanceGameCards(){
    $$("#adaptiveGameGrid article").forEach(card=>{
      if(card.querySelector(".edu-game-card-meta"))return;
      const kinds=(card.dataset.kind||"").split(/\s+/).filter(Boolean);
      const meta=document.createElement("div");meta.className="edu-game-card-meta";
      const mode=kinds.includes("team")?(lang()==="en"?"Team-supported":"Takım destekli"):(lang()==="en"?"No teams required":"Takımsız oynanabilir");
      const skill=kinds.includes("speaking")?"Speaking":kinds.includes("grammar")?"Grammar":"Vocabulary";
      meta.innerHTML="<span>"+mode+"</span><span>"+skill+"</span>";
      const button=card.querySelector("[data-launch-game]");
      if(button){button.textContent=lang()==="en"?"Open game →":"Oyunu aç →";card.insertBefore(meta,button);}else card.appendChild(meta);
    });
  }

  $$("[data-launch-game]").forEach(btn=>btn.addEventListener("click",()=>{
    const key=btn.dataset.launchGame;
    const info=gameInfo[key]||["Soruyu göster ve Next ile ilerle.","5–10 dk","Show the prompt and use Next to continue.","5–10 min"];
    const en=lang()==="en";
    if($("#gameHowText"))$("#gameHowText").textContent=en?info[2]:info[0];
    if($("#gameBestFor"))$("#gameBestFor").textContent=en?info[3]:info[1];
    if($("#gameBlueScore"))$("#gameBlueScore").textContent="0";
    if($("#gameOrangeScore"))$("#gameOrangeScore").textContent="0";
    setGameMode("solo");
  }));

  $("#startDemoLesson")?.addEventListener("click",()=>{
    if($("#blueScore"))$("#blueScore").textContent="0";
    if($("#orangeScore"))$("#orangeScore").textContent="0";
    setLiveMode("solo");paintTeamNames();
  });

  const phaseHelp={
    "Warm-up":"Konuyu açar; öğrenciyi derse sokar.",
    "Vocabulary":"Ders içinde kullanılacak hedef kelimeleri hazırlar.",
    "Practice Game":"Kelime/grammar bilgisini kısa ve interaktif biçimde uygulatır.",
    "Speaking":"Öğrencinin dili gerçekten üretmesini sağlar.",
    "Exit":"Ders sonunda ne kaldığını hızlıca kontrol eder."
  };
  function annotatePlan(){
    $$(".generated-plan .plan-row").forEach(row=>{
      const title=$("b",row)?.textContent||"";
      if(phaseHelp[title])row.title=phaseHelp[title];
    });
  }
  $("#lessonForm")?.addEventListener("submit",()=>setTimeout(annotatePlan,420));

  window.addEventListener("esc:languagechange",()=>{
    stopGuide();
    const sound=$("#guideSoundToggle");
    if(sound)sound.textContent=soundEnabled?(lang()==="en"?"🔊 Natural voice":"🔊 Doğal ses"):(lang()==="en"?"🔇 Sound off":"🔇 Ses kapalı");
    updateVoiceStatus();
    showGuideSlide(guideIndex,{narrate:false});
    enhanceGameCards();
    setLiveMode($("#lessonModal")?.classList.contains("solo-mode")?"solo":"team");
    setGameMode($("#gameModal")?.classList.contains("solo-mode")?"solo":"team");
    paintTeamNames();
  });

  paintTeamNames();
  setLiveMode("solo");
  setGameMode("solo");
  enhanceGameCards();
  showGuideSlide(0,{narrate:false});
  annotatePlan();
})();