(() => {
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const tx=(tr,en)=>document.documentElement.lang==="en"?en:tr;
  const esc=(v="")=>String(v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  let state={school:null,members:[],shared_lessons:[]};
  let lessons=[],classes=[],loading=false,currentUserId="";

  function status(text,ok=false,entry=false){
    const el=$(entry?"#schoolEntryStatus":"#schoolStatus");
    if(!el)return;
    el.hidden=!text;
    el.textContent=text||"";
    el.className="lesson-generate-status"+(ok?" is-ready":"");
  }

  function humanError(err){
    const raw=String(err?.message||err||"");
    if(raw.includes("SCHOOL_MEMBERSHIP_EXISTS"))return tx("Zaten bir School Workspace üyesisin.","You already belong to a School Workspace.");
    if(raw.includes("SCHOOL_NOT_FOUND"))return tx("Bu ekip koduyla aktif bir workspace bulunamadı.","No active workspace was found with this team code.");
    if(raw.includes("SCHOOL_FULL"))return tx("Bu workspace'in öğretmen kontenjanı dolu.","This workspace has reached its teacher seat limit.");
    if(raw.includes("INVALID_SCHOOL_NAME"))return tx("Okul / ekip adını kontrol et.","Check the school or team name.");
    if(raw.includes("OWNER_CANNOT_LEAVE"))return tx("Workspace sahibi doğrudan ayrılamaz. Önce sahiplik devri gerekir.","The workspace owner cannot leave until ownership is transferred.");
    if(raw.includes("OWNER_REQUIRED"))return tx("Bu işlem yalnızca workspace sahibi tarafından yapılabilir.","Only the workspace owner can perform this action.");
    if(raw.includes("MEMBER_NOT_FOUND"))return tx("Öğretmen artık bu workspace içinde bulunmuyor.","This teacher is no longer in the workspace.");
    if(raw.includes("OWNER_SELF_ACTION_DENIED"))return tx("Workspace sahibi kendi rolünü bu işlemle değiştiremez.","The workspace owner cannot change their own role with this action.");
    if(raw.includes("SCHOOL_ACCESS_DENIED"))return tx("Bu workspace için erişim iznin yok.","You do not have access to this workspace.");
    if(raw.includes("CLASS_ACCESS_DENIED"))return tx("Hedef sınıf bulunamadı veya sana ait değil.","The target class was not found or does not belong to you.");
    return raw||tx("İşlem tamamlanamadı.","The action could not be completed.");
  }

  function roleLabel(role){
    return {owner:tx("Sahip","Owner"),admin:tx("Yönetici","Admin"),teacher:tx("Öğretmen","Teacher")}[role]||role;
  }

  function renderEntry(){
    const has=Boolean(state.school);
    $("#schoolEmptyState").hidden=has;
    $("#schoolActiveState").hidden=!has;
  }

  function renderMembers(){
    const list=$("#schoolMemberList");
    if(!list)return;
    const members=state.members||[];
    const ownerMode=state.school?.role==="owner";
    $("#schoolMemberBadge").textContent=String(members.length);
    list.innerHTML=members.map(m=>{
      const manageable=ownerMode && m.user_id!==currentUserId;
      const roleButton=m.role==="admin"
        ? '<button type="button" data-school-member-action="demote" data-user-id="'+esc(m.user_id)+'">'+tx("Teacher yap","Make teacher")+'</button>'
        : m.role==="teacher"
          ? '<button type="button" data-school-member-action="promote" data-user-id="'+esc(m.user_id)+'">'+tx("Admin yap","Make admin")+'</button>'
          : '';
      const actions=manageable
        ? '<div class="school-member-actions">'+roleButton+'<button type="button" data-school-member-action="transfer" data-user-id="'+esc(m.user_id)+'">'+tx("Sahipliği devret","Transfer ownership")+'</button><button type="button" class="danger-lite" data-school-member-action="remove" data-user-id="'+esc(m.user_id)+'">'+tx("Çıkar","Remove")+'</button></div>'
        : '';
      return '<div class="school-member-row"><span>'+esc((m.display_name||"T").trim().charAt(0).toUpperCase())+'</span><p><b>'+esc(m.display_name||"Teacher")+'</b><small>'+esc(roleLabel(m.role))+'</small></p>'+actions+'</div>';
    }).join("") || '<p class="school-empty-copy">'+tx("Henüz ekip üyesi yok.","No team members yet.")+'</p>';

    $$("[data-school-member-action]",list).forEach(b=>b.addEventListener("click",()=>manageMember(b.dataset.userId,b.dataset.schoolMemberAction,b)));
  }

  function populateControls(){
    const own=$("#schoolOwnLesson"),target=$("#schoolTargetClass");
    const sharedIds=new Set((state.shared_lessons||[]).map(x=>x.lesson_id));

    if(own){
      const prev=own.value;
      own.innerHTML='<option value="">'+tx("Kaydedilmiş ders seç","Choose a saved lesson")+'</option>'
        +lessons.map(l=>'<option value="'+esc(l.id)+'" '+(sharedIds.has(l.id)?'disabled':'')+'>'+esc(l.title||l.topic||"English lesson")+(sharedIds.has(l.id)?' · '+tx("paylaşıldı","shared"):'')+'</option>').join("");
      if([...own.options].some(o=>o.value===prev&&!o.disabled))own.value=prev;
    }

    if(target){
      const prev=target.value;
      const active=classes.filter(c=>c.is_active);
      target.innerHTML='<option value="">'+tx("Önce sınıf seç","Choose a class first")+'</option>'
        +active.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+' · '+esc(c.level)+'</option>').join("");
      if([...target.options].some(o=>o.value===prev))target.value=prev;
    }
  }

  function renderSharedLessons(){
    const wrap=$("#schoolSharedLessons");
    if(!wrap)return;
    const items=state.shared_lessons||[];
    if(!items.length){
      wrap.innerHTML='<div class="school-library-empty"><strong>'+tx("Henüz ekip dersi yok.","No shared team lessons yet.")+'</strong><span>'+tx("İlk dersi yukarıdan paylaş; ekip arkadaşların kendi sınıflarına kopyalayabilsin.","Share the first lesson above so teammates can copy it into their own classes.")+'</span></div>';
      return;
    }

    wrap.innerHTML=items.map(x=>
      '<article class="school-lesson-card"><div class="school-lesson-top"><span>'+esc(String(x.primary_goal||"speaking").toUpperCase())+'</span><small>'+Number(x.duration_minutes||40)+' '+tx("dk","min")+'</small></div><h4>'+esc(x.title||x.topic||"English lesson")+'</h4><p>'+esc(x.topic||"")+' · '+tx("Paylaşan: ","Shared by: ")+esc(x.shared_by_name||"Teacher")+'</p><div><button type="button" data-school-copy="'+esc(x.share_id)+'">'+tx("Sınıfıma kopyala","Copy to my class")+'</button>'+(x.can_unshare?'<button type="button" class="danger-lite" data-school-unshare="'+esc(x.share_id)+'">'+tx("Paylaşımı kaldır","Remove share")+'</button>':'')+'</div></article>'
    ).join("");

    $$("[data-school-copy]",wrap).forEach(b=>b.addEventListener("click",()=>copyLesson(b.dataset.schoolCopy,b)));
    $$("[data-school-unshare]",wrap).forEach(b=>b.addEventListener("click",()=>unshare(b.dataset.schoolUnshare,b)));
  }

  function renderSchool(){
    renderEntry();
    if(!state.school)return;

    $("#schoolName").textContent=state.school.name||"School Workspace";
    $("#schoolRole").textContent=roleLabel(state.school.role);
    $("#schoolSeatCount").textContent=`${state.school.member_count||0} / ${state.school.seats||20} ${tx("öğretmen","teachers")}`;
    $("#schoolJoinCodeDisplay").textContent=state.school.join_code||"--------";

    const leave=$("#schoolLeave");
    if(leave){
      leave.hidden=state.school.role==="owner";
      leave.disabled=false;
    }

    renderMembers();
    populateControls();
    renderSharedLessons();
  }

  async function load(force=false){
    if(loading)return;
    if(state.school && !force){renderSchool();return;}
    loading=true;
    try{
      const session=await window.ESCSupabase?.getSession?.();
      if(!session)return;
      currentUserId=session.user?.id||"";
      const results=await Promise.all([
        window.ESCSupabase.getEducatorSchoolState(),
        window.ESCSupabase.listEducatorLessons(150),
        window.ESCSupabase.listEducatorClasses()
      ]);
      state=results[0]||{school:null,members:[],shared_lessons:[]};
      lessons=results[1]||[];
      classes=results[2]||[];
      renderSchool();
    }catch(err){
      console.warn("School Workspace load failed",err);
      status(humanError(err));
    }finally{
      loading=false;
    }
  }

  async function createSchool(e){
    e.preventDefault();
    const button=e.currentTarget.querySelector('button[type="submit"]');
    if(button)button.disabled=true;
    status(tx("Workspace oluşturuluyor…","Creating workspace…"),false,true);
    try{
      await window.ESCSupabase.createEducatorSchool($("#schoolCreateName")?.value.trim());
      status(tx("Workspace hazır ✓","Workspace ready ✓"),true,true);
      await load(true);
      window.ESCAnalytics?.track?.("educator_school_created","other");
    }catch(err){status(humanError(err),false,true);}
    finally{if(button)button.disabled=false;}
  }

  async function joinSchool(e){
    e.preventDefault();
    const button=e.currentTarget.querySelector('button[type="submit"]');
    if(button)button.disabled=true;
    status(tx("Workspace'e katılınıyor…","Joining workspace…"),false,true);
    try{
      await window.ESCSupabase.joinEducatorSchool($("#schoolJoinCode")?.value.trim());
      status(tx("Ekibe katıldın ✓","Joined the team ✓"),true,true);
      await load(true);
      window.ESCAnalytics?.track?.("educator_school_joined","other");
    }catch(err){status(humanError(err),false,true);}
    finally{if(button)button.disabled=false;}
  }

  async function shareLesson(){
    const lessonId=$("#schoolOwnLesson")?.value||"";
    if(!state.school?.id || !lessonId)return status(tx("Önce paylaşacağın dersi seç.","Choose a lesson to share first."));
    const b=$("#schoolShareLesson");if(b)b.disabled=true;
    status(tx("Ders ekip kütüphanesine ekleniyor…","Adding lesson to the team library…"));
    try{
      await window.ESCSupabase.shareEducatorSchoolLesson(state.school.id,lessonId);
      status(tx("Ders ekiple paylaşıldı ✓","Lesson shared with the team ✓"),true);
      await load(true);
      window.ESCAnalytics?.track?.("educator_school_lesson_shared","other");
    }catch(err){status(humanError(err));}
    finally{if(b)b.disabled=false;}
  }

  async function copyLesson(shareId,button){
    const classId=$("#schoolTargetClass")?.value||"";
    if(!classId)return status(tx("Önce hedef sınıfı seç.","Choose the target class first."));
    button.disabled=true;
    status(tx("Ders sınıfına kopyalanıyor…","Copying lesson to your class…"));
    try{
      await window.ESCSupabase.copyEducatorSchoolLesson(shareId,classId);
      status(tx("Ders kendi kütüphanene kopyalandı ✓","Lesson copied to your library ✓"),true);
      $("#refreshLessonLibrary")?.click();
      window.ESCAnalytics?.track?.("educator_school_lesson_copied","other");
    }catch(err){status(humanError(err));}
    finally{button.disabled=false;}
  }

  async function unshare(shareId,button){
    if(!confirm(tx("Bu ders ekip kütüphanesinden kaldırılsın mı?","Remove this lesson from the team library?")))return;
    button.disabled=true;
    try{
      await window.ESCSupabase.unshareEducatorSchoolLesson(shareId);
      await load(true);
    }catch(err){status(humanError(err));}
    finally{button.disabled=false;}
  }

  async function manageMember(userId,action,button){
    if(!userId||!action)return;
    const prompts={
      remove:tx("Bu öğretmen ekipten çıkarılsın mı?","Remove this teacher from the team?"),
      promote:tx("Bu öğretmen admin yapılsın mı?","Make this teacher an admin?"),
      demote:tx("Bu admin tekrar teacher rolüne alınsın mı?","Change this admin back to teacher?"),
      transfer:tx("School Workspace sahipliğini bu öğretmene devretmek istediğine emin misin? Sen admin rolüne geçeceksin.","Transfer School Workspace ownership to this teacher? You will become an admin.")
    };
    if(!confirm(prompts[action]||tx("Bu işlem uygulansın mı?","Apply this action?")))return;
    button.disabled=true;
    status(tx("Ekip güncelleniyor…","Updating team…"));
    try{
      await window.ESCSupabase.manageEducatorSchoolMember(userId,action);
      status(tx("Ekip güncellendi ✓","Team updated ✓"),true);
      await load(true);
      window.ESCAnalytics?.track?.("educator_school_member_"+action,"other");
    }catch(err){status(humanError(err));}
    finally{button.disabled=false;}
  }

  async function leave(){
    if(!confirm(tx("Bu School Workspace'ten ayrılmak istiyor musun?","Leave this School Workspace?")))return;
    const b=$("#schoolLeave");if(b)b.disabled=true;
    try{
      await window.ESCSupabase.leaveEducatorSchool();
      state={school:null,members:[],shared_lessons:[]};
      renderSchool();
      status("",false);
    }catch(err){status(humanError(err));}
    finally{if(b)b.disabled=false;}
  }

  async function copyCode(e){
    const code=state.school?.join_code||"";
    if(!code)return;
    const b=e.currentTarget,old=b.textContent;
    try{
      await navigator.clipboard.writeText(code);
      b.textContent=tx("Kopyalandı ✓","Copied ✓");
      setTimeout(()=>b.textContent=old,1200);
    }catch{}
  }

  function bind(){
    $("#schoolCreateForm")?.addEventListener("submit",createSchool);
    $("#schoolJoinForm")?.addEventListener("submit",joinSchool);
    $("#schoolShareLesson")?.addEventListener("click",shareLesson);
    $("#schoolLeave")?.addEventListener("click",leave);
    $("#schoolCopyCode")?.addEventListener("click",copyCode);
    $("#schoolJoinCode")?.addEventListener("input",e=>{e.currentTarget.value=e.currentTarget.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8);});
    document.addEventListener("click",e=>{if(e.target.closest('[data-panel="school"]'))load(true);});
    document.addEventListener("esc:educator-ready",()=>load(true));
    window.addEventListener("esc:languagechange",()=>renderSchool());
  }

  document.addEventListener("DOMContentLoaded",bind);
})();
