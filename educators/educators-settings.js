(() => {
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const tx=(tr,en)=>document.documentElement.lang==="en"?en:tr;
  let profile=null;
  let loading=false;

  function showStatus(text,ok=false){
    const el=$("#settingsStatus");
    if(!el)return;
    el.hidden=!text;
    el.textContent=text||"";
    el.className="lesson-generate-status"+(ok?" is-ready":"");
  }

  function renderSummary(){
    if(!profile)return;
    $("#settingsSummaryName").textContent=profile.display_name||"Teacher";
    $("#settingsSummaryMeta").textContent=`${profile.default_level||"A2"} · ${profile.default_age_group||"12-14"} · ${profile.default_duration||40} ${tx("dk","min")}`;
    const tags=$("#settingsSummaryTags");
    if(tags){
      const context={
        school:tx("Okul / sınıf","School / class"),
        private:tx("Özel ders","Private tutoring"),
        mixed:tx("Sınıf + özel ders","Class + private"),
        general:"General English"
      }[profile.teaching_context]||"Mixed";
      const items=[
        context,
        profile.preferred_language==="en"?"English":"Türkçe",
        profile.country_code||null,
        profile.institution_name||null
      ].filter(Boolean);
      tags.innerHTML=items.map(x=>'<span>'+String(x).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]))+'</span>').join("");
    }
  }

  function fill(){
    if(!profile)return;
    $("#settingsDisplayName").value=profile.display_name||"Teacher";
    $("#settingsLanguage").value=profile.preferred_language||"tr";
    $("#settingsContext").value=profile.teaching_context||"mixed";
    $("#settingsAge").value=profile.default_age_group||"12-14";
    $("#settingsLevel").value=profile.default_level||"A2";
    $("#settingsDuration").value=String(profile.default_duration||40);
    $("#settingsCountry").value=profile.country_code||"";
    $("#settingsInstitution").value=profile.institution_name||"";
    renderSummary();
  }

  function setSelectValue(selector,value){
    const el=$(selector);
    if(!el)return;
    const wanted=String(value??"");
    if([...el.options].some(o=>o.value===wanted)) el.value=wanted;
  }

  function applyDefaults(){
    if(!profile)return;
    const form=$("#lessonForm");
    const hasBoundClass=Boolean(form?.dataset.classId);

    if(!hasBoundClass){
      setSelectValue("#ageGroup",profile.default_age_group||"12-14");
      setSelectValue("#level",profile.default_level||"A2");
      setSelectValue("#duration",profile.default_duration||40);
      setSelectValue("#assistantAge",profile.default_age_group||"12-14");
      setSelectValue("#assistantLevel",profile.default_level||"A2");
      setSelectValue("#assistantDuration",profile.default_duration||40);
    }

    setSelectValue("#newClassAge",profile.default_age_group||"12-14");
    setSelectValue("#newClassLevel",profile.default_level||"A2");

    const assistantAge=$("#assistantAge");
    const assistantLevel=$("#assistantLevel");
    const assistantDuration=$("#assistantDuration");
    if(assistantAge && !$("#assistantTopic")?.value.trim()) assistantAge.value=profile.default_age_group||assistantAge.value;
    if(assistantLevel && !$("#assistantTopic")?.value.trim()) assistantLevel.value=profile.default_level||assistantLevel.value;
    if(assistantDuration && !$("#assistantTopic")?.value.trim()) assistantDuration.value=String(profile.default_duration||40);
  }

  async function load(force=false){
    if(loading || (profile && !force))return profile;
    loading=true;
    try{
      const session=await window.ESCSupabase?.getSession?.();
      if(!session)return null;
      profile=await window.ESCSupabase.getEducatorProfile();
      if(!profile)return null;
      fill();
      applyDefaults();
      if(profile.onboarding_completed && profile.preferred_language && window.ESCEduI18n?.getLang?.()!==profile.preferred_language){
        window.ESCEduI18n?.setLang?.(profile.preferred_language);
      }
      return profile;
    }catch(err){
      console.warn("Teacher settings load failed",err);
      return null;
    }finally{
      loading=false;
    }
  }

  async function save(e){
    e.preventDefault();
    const btn=$("#settingsSave");
    if(btn)btn.disabled=true;
    showStatus(tx("Tercihler kaydediliyor…","Saving preferences…"));
    try{
      const patch={
        display_name:$("#settingsDisplayName")?.value.trim(),
        preferred_language:$("#settingsLanguage")?.value||"tr",
        teaching_context:$("#settingsContext")?.value||"mixed",
        default_age_group:$("#settingsAge")?.value||"12-14",
        default_level:$("#settingsLevel")?.value||"A2",
        default_duration:Number($("#settingsDuration")?.value||40),
        country_code:$("#settingsCountry")?.value.trim().toUpperCase()||null,
        institution_name:$("#settingsInstitution")?.value.trim()||null,
        onboarding_completed:true
      };
      profile=await window.ESCSupabase.updateEducatorProfile(patch);
      fill();
      applyDefaults();
      window.dispatchEvent(new CustomEvent("esc:profile-updated",{detail:{profile}}));
      if(window.ESCEduI18n?.getLang?.()!==profile.preferred_language){
        window.ESCEduI18n?.setLang?.(profile.preferred_language);
      }
      showStatus(tx("Tercihler hesabına kaydedildi ✓","Preferences saved to your account ✓"),true);
      window.ESCAnalytics?.track?.("educator_preferences_saved","other");
    }catch(err){
      console.warn("Teacher settings save failed",err);
      showStatus(err?.message||tx("Tercihler kaydedilemedi.","Could not save preferences."));
    }finally{
      if(btn)btn.disabled=false;
    }
  }

  function bind(){
    $("#teacherSettingsForm")?.addEventListener("submit",save);
    $("#settingsCountry")?.addEventListener("input",e=>{e.currentTarget.value=e.currentTarget.value.toUpperCase().replace(/[^A-Z]/g,"").slice(0,2);});
    document.addEventListener("click",e=>{
      if(e.target.closest('[data-panel="settings"]')) load(true);
    });
    document.addEventListener("esc:educator-ready",()=>load(true));
    window.addEventListener("esc:languagechange",renderSummary);
    load(false);
  }

  document.addEventListener("DOMContentLoaded",bind);
})();
