(() => {
  'use strict';
  if (window.ESCSupabase) return;

  let clientPromise = null;

  function config() { return window.ESC_SUPABASE_CONFIG || {}; }
  function isConfigured() {
    const cfg = config();
    return Boolean(cfg.url && cfg.anonKey);
  }

  async function getClient() {
    if (!isConfigured()) return null;
    if (!clientPromise) {
      clientPromise = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm')
        .then(({ createClient }) => createClient(config().url, config().anonKey, {
          auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true }
        }));
    }
    return clientPromise;
  }

  async function ping() {
    const client = await getClient();
    if (!client) return { configured:false, database:false };
    const { data, error } = await client.from('games').select('slug,name').eq('enabled', true).limit(1);
    if (error) return { configured:true, database:false, error };
    return { configured:true, database:true, sample:data || [] };
  }

  async function getSession() {
    const client = await getClient();
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session || null;
  }

  async function onAuthStateChange(callback) {
    const client = await getClient();
    if (!client || typeof callback !== 'function') return () => {};
    const { data } = client.auth.onAuthStateChange((event, session) => callback(event, session));
    return () => data?.subscription?.unsubscribe?.();
  }

  async function signUp(email, password, redirectPath = '/esc-studio/') {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const redirectTo = new URL(redirectPath, window.location.origin).href;
    const { data, error } = await client.auth.signUp({ email, password, options:{ emailRedirectTo:redirectTo } });
    if (error) throw error;
    return data;
  }

  async function resendSignupConfirmation(email, redirectPath = '/esc-studio/') {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const redirectTo = new URL(redirectPath, window.location.origin).href;
    const { data, error } = await client.auth.resend({ type:'signup', email, options:{ emailRedirectTo:redirectTo } });
    if (error) throw error;
    return data;
  }

  async function sendPasswordReset(email, redirectPath = '/esc-studio/') {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const redirectTo = new URL(redirectPath, window.location.origin).href;
    const { data, error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
    return data;
  }

  async function updatePassword(password) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.auth.updateUser({ password });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const client = await getClient();
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  async function claimFirstAdmin(code) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.rpc('claim_first_admin', { p_code:code });
    if (error) throw error;
    return data === true;
  }

  async function isAdmin() {
    const client = await getClient();
    if (!client) return false;
    const { data, error } = await client.rpc('is_esc_admin');
    if (error) throw error;
    return data === true;
  }

  async function getGameContent(gameSlug) {
    const client = await getClient();
    if (!client) return null;
    const { data, error } = await client.from('game_content')
      .select('id,game_slug,content_key,category,kind,payload,sort_order,is_active,updated_at')
      .eq('game_slug', gameSlug).eq('is_active', true)
      .order('sort_order', { ascending:true }).order('id', { ascending:true });
    if (error) throw error;
    return data || [];
  }

  async function replaceGameContent(gameSlug, items) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { error } = await client.rpc('replace_game_content', { p_game_slug:gameSlug, p_items:items });
    if (error) throw error;
  }

  async function getGameSettings(gameSlug) {
    const client = await getClient();
    if (!client) return null;
    const { data, error } = await client.from('game_settings').select('config,updated_at')
      .eq('game_slug', gameSlug).maybeSingle();
    if (error) throw error;
    return data ? data.config : null;
  }

  async function saveGameSettings(gameSlug, settings) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { error } = await client.from('game_settings')
      .upsert({ game_slug:gameSlug, config:settings }, { onConflict:'game_slug' });
    if (error) throw error;
  }

  async function ensureEducatorProfile(displayName) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const clean = String(displayName || session.user.email?.split('@')[0] || 'Teacher').trim().slice(0,80);
    const { data, error } = await client.from('educator_profiles')
      .upsert({ user_id:session.user.id, display_name:clean || 'Teacher' }, { onConflict:'user_id' })
      .select('user_id,display_name,role,plan,preferred_language,teaching_context,default_age_group,default_level,default_duration,country_code,institution_name,onboarding_completed').single();
    if (error) throw error;
    return data;
  }

  async function getEducatorProfile() {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) return null;
    const { data, error } = await client.from('educator_profiles')
      .select('user_id,display_name,role,plan,preferred_language,teaching_context,default_age_group,default_level,default_duration,country_code,institution_name,onboarding_completed').eq('user_id',session.user.id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function updateEducatorProfile(patch = {}) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');

    const clean={ updated_at:new Date().toISOString() };
    if ('display_name' in patch) clean.display_name=String(patch.display_name||'').trim().slice(0,80);
    if ('preferred_language' in patch) clean.preferred_language=['tr','en'].includes(patch.preferred_language)?patch.preferred_language:'tr';
    if ('teaching_context' in patch) clean.teaching_context=['school','private','mixed','general'].includes(patch.teaching_context)?patch.teaching_context:'mixed';
    if ('default_age_group' in patch) clean.default_age_group=['6-8','9-11','12-14','15-17','18+'].includes(patch.default_age_group)?patch.default_age_group:'12-14';
    if ('default_level' in patch) clean.default_level=['Pre-A1','A1','A2','B1','B2'].includes(patch.default_level)?patch.default_level:'A2';
    if ('default_duration' in patch) clean.default_duration=Math.max(20,Math.min(Number(patch.default_duration)||40,120));
    if ('country_code' in patch) {
      const cc=String(patch.country_code||'').trim().toUpperCase().slice(0,2);
      clean.country_code=/^[A-Z]{2}$/.test(cc)?cc:null;
    }
    if ('institution_name' in patch) clean.institution_name=String(patch.institution_name||'').trim().slice(0,120)||null;
    if ('onboarding_completed' in patch) clean.onboarding_completed=patch.onboarding_completed===true;

    const { data, error } = await client.from('educator_profiles')
      .update(clean)
      .eq('user_id',session.user.id)
      .select('user_id,display_name,role,plan,preferred_language,teaching_context,default_age_group,default_level,default_duration,country_code,institution_name,onboarding_completed')
      .single();
    if (error) throw error;
    return data;
  }

  async function listEducatorClasses() {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const { data:classes, error } = await client.from('edu_classes')
      .select('id,name,age_group,level,focus,join_code,max_students,is_active,created_at,updated_at')
      .eq('teacher_id',session.user.id).order('created_at',{ ascending:false });
    if (error) throw error;
    if (!classes?.length) return [];
    const ids = classes.map(c => c.id);
    const { data:students, error:studentError } = await client.from('edu_students')
      .select('id,class_id,display_name,last_seen_at,is_active,teacher_note').in('class_id', ids);
    if (studentError) throw studentError;
    const grouped = new Map();
    (students || []).forEach(s => {
      if (!grouped.has(s.class_id)) grouped.set(s.class_id, []);
      grouped.get(s.class_id).push(s);
    });
    return classes.map(c => {
      const roster=grouped.get(c.id) || [];
      return { ...c, students:roster.filter(s=>s.is_active), all_students:roster };
    });
  }

  async function createEducatorClass(payload) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const row = {
      teacher_id:session.user.id,
      name:String(payload.name || '').trim(),
      age_group:payload.age_group,
      level:payload.level,
      focus:payload.focus || 'speaking',
      max_students:Number(payload.max_students || 40)
    };
    const { data, error } = await client.from('edu_classes').insert(row)
      .select('id,name,age_group,level,focus,join_code,max_students,is_active,created_at').single();
    if (error) throw error;
    return data;
  }

  async function updateEducatorClass(classId, patch = {}) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');

    const clean={ updated_at:new Date().toISOString() };
    if ('name' in patch) clean.name=String(patch.name||'').trim().slice(0,80);
    if ('age_group' in patch) clean.age_group=['6-8','9-11','12-14','15-17','18+'].includes(patch.age_group)?patch.age_group:'12-14';
    if ('level' in patch) clean.level=['Pre-A1','A1','A2','B1','B2'].includes(patch.level)?patch.level:'A2';
    if ('focus' in patch) clean.focus=['speaking','vocabulary','grammar','mixed'].includes(patch.focus)?patch.focus:'speaking';
    if ('max_students' in patch) clean.max_students=Math.max(1,Math.min(Number(patch.max_students)||40,100));
    if ('is_active' in patch) clean.is_active=patch.is_active===true;

    const { data, error } = await client.from('edu_classes')
      .update(clean)
      .eq('id',classId)
      .eq('teacher_id',session.user.id)
      .select('id,name,age_group,level,focus,join_code,max_students,is_active,created_at,updated_at')
      .single();
    if (error) throw error;
    return data;
  }

  async function updateEducatorStudent(studentId, patch = {}) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const clean={};
    if ('display_name' in patch) clean.display_name=String(patch.display_name||'').trim().slice(0,40);
    if ('teacher_note' in patch) clean.teacher_note=String(patch.teacher_note||'').trim().slice(0,1500)||null;
    if ('is_active' in patch) clean.is_active=patch.is_active===true;
    const { data, error } = await client.from('edu_students')
      .update(clean)
      .eq('id',studentId)
      .select('id,class_id,display_name,last_seen_at,is_active,teacher_note')
      .single();
    if (error) throw error;
    return data;
  }

  async function saveEducatorLesson(payload) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const row = { ...payload, teacher_id:session.user.id };
    const { data, error } = await client.from('edu_lessons').insert(row).select('*').single();
    if (error) throw error;
    return data;
  }

  async function updateEducatorLesson(lessonId, payload) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const row = { ...payload, teacher_id:session.user.id, updated_at:new Date().toISOString() };
    const { data, error } = await client.from('edu_lessons')
      .update(row)
      .eq('id',lessonId)
      .eq('teacher_id',session.user.id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }


  async function createEducatorSchool(name) {
    const client=await getClient();
    const session=await getSession();
    if(!client||!session) throw new Error('Teacher login required.');
    const {data,error}=await client.rpc('edu_create_school',{p_name:String(name||'').trim()});
    if(error) throw error;
    return data;
  }

  async function joinEducatorSchool(code) {
    const client=await getClient();
    const session=await getSession();
    if(!client||!session) throw new Error('Teacher login required.');
    const {data,error}=await client.rpc('edu_join_school',{p_join_code:String(code||'').trim().toUpperCase()});
    if(error) throw error;
    return data;
  }

  async function getEducatorSchoolState() {
    const client=await getClient();
    const session=await getSession();
    if(!client||!session) throw new Error('Teacher login required.');
    const {data,error}=await client.rpc('edu_get_school_state');
    if(error) throw error;
    return data||{school:null,members:[],shared_lessons:[]};
  }

  async function shareEducatorSchoolLesson(schoolId,lessonId) {
    const client=await getClient();
    const session=await getSession();
    if(!client||!session) throw new Error('Teacher login required.');
    const {data,error}=await client.rpc('edu_share_school_lesson',{p_school_id:schoolId,p_lesson_id:lessonId});
    if(error) throw error;
    return data===true;
  }

  async function unshareEducatorSchoolLesson(shareId) {
    const client=await getClient();
    const session=await getSession();
    if(!client||!session) throw new Error('Teacher login required.');
    const {data,error}=await client.rpc('edu_unshare_school_lesson',{p_share_id:shareId});
    if(error) throw error;
    return data===true;
  }

  async function copyEducatorSchoolLesson(shareId,classId) {
    const client=await getClient();
    const session=await getSession();
    if(!client||!session) throw new Error('Teacher login required.');
    const {data,error}=await client.rpc('edu_copy_school_lesson',{p_share_id:shareId,p_class_id:classId});
    if(error) throw error;
    return data;
  }

  async function manageEducatorSchoolMember(userId, action) {
    const client=await getClient();
    const session=await getSession();
    if(!client||!session) throw new Error('Teacher login required.');
    const {data,error}=await client.rpc('edu_manage_school_member',{p_user_id:userId,p_action:action});
    if(error) throw error;
    return data===true;
  }

  async function leaveEducatorSchool() {
    const client=await getClient();
    const session=await getSession();
    if(!client||!session) throw new Error('Teacher login required.');
    const {data,error}=await client.rpc('edu_leave_school');
    if(error) throw error;
    return data===true;
  }

  async function generateEducatorAssistantPack(payload = {}) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const { data, error } = await client.functions.invoke('academy-lesson-assistant', { body:payload });
    if (error) throw error;
    if (!data?.ok || !data?.pack) throw new Error(data?.error || 'Assistant could not generate a lesson pack.');

    const pack=data.pack;
    const row={
      teacher_id:session.user.id,
      topic:String(pack.topic || payload.topic || 'English lesson').slice(0,100),
      level:String(pack.level || payload.level || 'A2').slice(0,20),
      age_group:String(pack.age_group || payload.age_group || '12-14').slice(0,30),
      goal:String(pack.goal || payload.goal || 'speaking').slice(0,30),
      duration_minutes:Math.max(20,Math.min(Number(pack.duration_minutes || payload.duration)||40,120)),
      class_size:Math.max(1,Math.min(Number(pack.class_size || payload.class_size)||8,80)),
      brief:payload && typeof payload==='object' ? payload : {},
      pack
    };
    const { error:historyError } = await client.from('edu_assistant_generations').insert(row);
    if (historyError) console.warn('Assistant history save failed',historyError);
    return pack;
  }

  async function listEducatorAssistantHistory(limit = 8) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const safeLimit=Math.max(1,Math.min(Number(limit)||8,30));
    const { data, error } = await client.from('edu_assistant_generations')
      .select('id,topic,level,age_group,goal,duration_minutes,class_size,brief,pack,created_at')
      .eq('teacher_id',session.user.id)
      .order('created_at',{ascending:false})
      .limit(safeLimit);
    if (error) throw error;
    return data || [];
  }

  async function deleteEducatorAssistantHistory(id) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const { error } = await client.from('edu_assistant_generations')
      .delete().eq('id',id).eq('teacher_id',session.user.id);
    if (error) throw error;
    return true;
  }

  async function getEducatorLesson(lessonId) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const { data, error } = await client.from('edu_lessons')
      .select('id,class_id,title,topic,duration_minutes,primary_goal,plan,status,created_at,updated_at')
      .eq('id',lessonId)
      .eq('teacher_id',session.user.id)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function listEducatorLessons(limit = 100) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 250));
    const { data, error } = await client.from('edu_lessons')
      .select('id,class_id,title,topic,duration_minutes,primary_goal,plan,status,created_at,updated_at')
      .eq('teacher_id',session.user.id)
      .order('updated_at',{ ascending:false })
      .limit(safeLimit);
    if (error) throw error;
    return data || [];
  }

  async function deleteEducatorLesson(lessonId) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const { error } = await client.from('edu_lessons')
      .delete().eq('id',lessonId).eq('teacher_id',session.user.id);
    if (error) throw error;
    return true;
  }

  async function gradeEducatorAssignmentResult(resultId, score, feedback) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const numeric = score === '' || score === null || typeof score === 'undefined' ? null : Number(score);
    const { data, error } = await client.rpc('edu_grade_assignment_result', {
      p_result_id:resultId,
      p_score:Number.isFinite(numeric) ? numeric : null,
      p_feedback:String(feedback||'').trim().slice(0,1200)
    });
    if (error) throw error;
    return data === true;
  }

  async function listEducatorResults(limit = 500) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const safeLimit = Math.max(1, Math.min(Number(limit) || 500, 1500));
    const { data, error } = await client.from('edu_student_results')
      .select('id,student_id,class_id,session_id,activity_type,score,payload,created_at')
      .order('created_at',{ ascending:false })
      .limit(safeLimit);
    if (error) throw error;
    return data || [];
  }


  async function listEducatorSessions(limit = 100) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 300));
    const { data, error } = await client.from('edu_live_sessions')
      .select('id,class_id,lesson_id,status,current_index,current_stage,started_at,ended_at,updated_at')
      .eq('teacher_id',session.user.id)
      .order('started_at',{ ascending:false })
      .limit(safeLimit);
    if (error) throw error;
    return data || [];
  }


  async function listPrivateStudents() {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const { data, error } = await client.from('edu_private_students')
      .select('id,display_name,level,school_grade,goals,focus_notes,homework,last_lesson_note,next_lesson_note,next_lesson_at,difficult_topics,is_active,created_at,updated_at')
      .eq('teacher_id',session.user.id)
      .eq('is_active',true)
      .order('updated_at',{ascending:false});
    if (error) throw error;
    return data || [];
  }

  async function createPrivateStudent(payload) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const row = {
      teacher_id:session.user.id,
      display_name:String(payload.display_name||'').trim().slice(0,80),
      level:['Pre-A1','A1','A2','B1','B2'].includes(payload.level)?payload.level:'A2',
      school_grade:payload.school_grade?String(payload.school_grade).trim().slice(0,40):null,
      goals:Array.isArray(payload.goals)?payload.goals.map(x=>String(x).trim()).filter(Boolean).slice(0,12):[],
      focus_notes:payload.focus_notes?String(payload.focus_notes).trim().slice(0,1500):null,
      homework:payload.homework?String(payload.homework).trim().slice(0,1500):null,
      last_lesson_note:payload.last_lesson_note?String(payload.last_lesson_note).trim().slice(0,1500):null,
      next_lesson_note:payload.next_lesson_note?String(payload.next_lesson_note).trim().slice(0,1500):null,
      next_lesson_at:payload.next_lesson_at||null,
      difficult_topics:Array.isArray(payload.difficult_topics)?payload.difficult_topics.map(x=>String(x).trim()).filter(Boolean).slice(0,20):[]
    };
    const { data, error } = await client.from('edu_private_students').insert(row).select('*').single();
    if (error) throw error;
    return data;
  }

  async function updatePrivateStudent(id, patch) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const clean = {};
    if ('display_name' in patch) clean.display_name=String(patch.display_name||'').trim().slice(0,80);
    if ('level' in patch) clean.level=['Pre-A1','A1','A2','B1','B2'].includes(patch.level)?patch.level:'A2';
    if ('school_grade' in patch) clean.school_grade=patch.school_grade?String(patch.school_grade).trim().slice(0,40):null;
    if ('goals' in patch) clean.goals=Array.isArray(patch.goals)?patch.goals.map(x=>String(x).trim()).filter(Boolean).slice(0,12):[];
    if ('focus_notes' in patch) clean.focus_notes=patch.focus_notes?String(patch.focus_notes).trim().slice(0,1500):null;
    if ('homework' in patch) clean.homework=patch.homework?String(patch.homework).trim().slice(0,1500):null;
    if ('last_lesson_note' in patch) clean.last_lesson_note=patch.last_lesson_note?String(patch.last_lesson_note).trim().slice(0,1500):null;
    if ('next_lesson_note' in patch) clean.next_lesson_note=patch.next_lesson_note?String(patch.next_lesson_note).trim().slice(0,1500):null;
    if ('next_lesson_at' in patch) clean.next_lesson_at=patch.next_lesson_at||null;
    if ('difficult_topics' in patch) clean.difficult_topics=Array.isArray(patch.difficult_topics)?patch.difficult_topics.map(x=>String(x).trim()).filter(Boolean).slice(0,20):[];
    clean.updated_at=new Date().toISOString();
    const { data, error } = await client.from('edu_private_students')
      .update(clean).eq('id',id).eq('teacher_id',session.user.id).select('*').single();
    if (error) throw error;
    return data;
  }

  async function deletePrivateStudent(id) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const { error } = await client.from('edu_private_students')
      .delete().eq('id',id).eq('teacher_id',session.user.id);
    if (error) throw error;
    return true;
  }


  async function listAssignments(limit = 150) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const safeLimit=Math.max(1,Math.min(Number(limit)||150,300));
    const { data, error } = await client.from('edu_assignments')
      .select('id,class_id,lesson_id,title,instructions,due_at,status,payload,created_at,updated_at')
      .eq('teacher_id',session.user.id)
      .order('updated_at',{ascending:false})
      .limit(safeLimit);
    if (error) throw error;
    return data || [];
  }

  async function createAssignment(payload) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const row={
      teacher_id:session.user.id,
      class_id:payload.class_id,
      lesson_id:payload.lesson_id||null,
      title:String(payload.title||'').trim().slice(0,120),
      instructions:payload.instructions?String(payload.instructions).trim().slice(0,3000):null,
      due_at:payload.due_at||null,
      status:['draft','published','closed'].includes(payload.status)?payload.status:'draft',
      payload:payload.payload && typeof payload.payload==='object'?payload.payload:{}
    };
    const { data, error } = await client.from('edu_assignments').insert(row).select('*').single();
    if (error) throw error;
    return data;
  }

  async function updateAssignment(id, patch) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const clean={updated_at:new Date().toISOString()};
    if('title' in patch) clean.title=String(patch.title||'').trim().slice(0,120);
    if('instructions' in patch) clean.instructions=patch.instructions?String(patch.instructions).trim().slice(0,3000):null;
    if('due_at' in patch) clean.due_at=patch.due_at||null;
    if('status' in patch) clean.status=['draft','published','closed'].includes(patch.status)?patch.status:'draft';
    if('payload' in patch) clean.payload=patch.payload && typeof patch.payload==='object'?patch.payload:{};
    if('lesson_id' in patch) clean.lesson_id=patch.lesson_id||null;
    if('class_id' in patch) clean.class_id=patch.class_id;
    const { data, error } = await client.from('edu_assignments')
      .update(clean).eq('id',id).eq('teacher_id',session.user.id).select('*').single();
    if (error) throw error;
    return data;
  }

  async function deleteAssignment(id) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const { error } = await client.from('edu_assignments')
      .delete().eq('id',id).eq('teacher_id',session.user.id);
    if (error) throw error;
    return true;
  }


  async function listScheduleEvents(fromIso = null, toIso = null, limit = 200) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const safeLimit=Math.max(1,Math.min(Number(limit)||200,500));
    let query=client.from('edu_schedule_events')
      .select('id,class_id,private_student_id,lesson_id,title,starts_at,duration_minutes,notes,status,created_at,updated_at')
      .eq('teacher_id',session.user.id)
      .order('starts_at',{ascending:true})
      .limit(safeLimit);
    if(fromIso) query=query.gte('starts_at',fromIso);
    if(toIso) query=query.lte('starts_at',toIso);
    const {data,error}=await query;
    if(error) throw error;
    return data||[];
  }

  async function createScheduleEvent(payload) {
    const client=await getClient();
    const session=await getSession();
    if(!client||!session) throw new Error('Teacher login required.');
    const row={
      teacher_id:session.user.id,
      class_id:payload.class_id||null,
      private_student_id:payload.private_student_id||null,
      lesson_id:payload.lesson_id||null,
      title:String(payload.title||'').trim().slice(0,120),
      starts_at:payload.starts_at,
      duration_minutes:Math.max(5,Math.min(Number(payload.duration_minutes)||40,300)),
      notes:payload.notes?String(payload.notes).trim().slice(0,2000):null,
      status:['scheduled','completed','cancelled'].includes(payload.status)?payload.status:'scheduled'
    };
    const {data,error}=await client.from('edu_schedule_events').insert(row).select('*').single();
    if(error) throw error;
    return data;
  }

  async function updateScheduleEvent(id,patch) {
    const client=await getClient();
    const session=await getSession();
    if(!client||!session) throw new Error('Teacher login required.');
    const clean={updated_at:new Date().toISOString()};
    if('class_id' in patch) clean.class_id=patch.class_id||null;
    if('private_student_id' in patch) clean.private_student_id=patch.private_student_id||null;
    if('lesson_id' in patch) clean.lesson_id=patch.lesson_id||null;
    if('title' in patch) clean.title=String(patch.title||'').trim().slice(0,120);
    if('starts_at' in patch) clean.starts_at=patch.starts_at;
    if('duration_minutes' in patch) clean.duration_minutes=Math.max(5,Math.min(Number(patch.duration_minutes)||40,300));
    if('notes' in patch) clean.notes=patch.notes?String(patch.notes).trim().slice(0,2000):null;
    if('status' in patch) clean.status=['scheduled','completed','cancelled'].includes(patch.status)?patch.status:'scheduled';
    const {data,error}=await client.from('edu_schedule_events')
      .update(clean).eq('id',id).eq('teacher_id',session.user.id).select('*').single();
    if(error) throw error;
    return data;
  }

  async function deleteScheduleEvent(id) {
    const client=await getClient();
    const session=await getSession();
    if(!client||!session) throw new Error('Teacher login required.');
    const {error}=await client.from('edu_schedule_events').delete().eq('id',id).eq('teacher_id',session.user.id);
    if(error) throw error;
    return true;
  }

  async function startEducatorSession(payload) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    if (!payload?.class_id) throw new Error('Class is required.');

    const endedAt = new Date().toISOString();
    const { data:openSessions, error:openError } = await client.from('edu_live_sessions')
      .select('id,lesson_id')
      .eq('teacher_id',session.user.id)
      .in('status',['waiting','active','paused']);
    if (openError) throw openError;

    if (openSessions?.length) {
      const { error:closeError } = await client.from('edu_live_sessions')
        .update({ status:'completed', ended_at:endedAt, updated_at:endedAt })
        .eq('teacher_id',session.user.id)
        .in('status',['waiting','active','paused']);
      if (closeError) throw closeError;

      const lessonIds=[...new Set(openSessions.map(x=>x.lesson_id).filter(Boolean))];
      if(lessonIds.length){
        const { error:lessonError } = await client.from('edu_lessons')
          .update({ status:'completed', updated_at:endedAt })
          .eq('teacher_id',session.user.id)
          .in('id',lessonIds);
        if (lessonError) throw lessonError;
      }
    }

    const { data, error } = await client.from('edu_live_sessions')
      .insert({ ...payload, teacher_id:session.user.id }).select('*').single();
    if (error) throw error;
    return data;
  }

  async function updateEducatorSession(sessionId, patch) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.from('edu_live_sessions')
      .update(patch).eq('id',sessionId).select('*').single();
    if (error) throw error;
    return data;
  }

  async function getActiveEducatorSession(classId = null) {
    const client = await getClient();
    if (!client) return null;
    let query=client.from('edu_live_sessions').select('*')
      .in('status',['waiting','active','paused'])
      .order('started_at',{ascending:false})
      .limit(1);
    if(classId) query=query.eq('class_id',classId);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data;
  }

  async function joinEducatorClass(joinCode, displayName, joinToken) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.rpc('edu_join_class', {
      p_join_code:joinCode, p_display_name:displayName, p_join_token:joinToken
    });
    if (error) throw error;
    return data;
  }

  async function getStudentState(joinToken) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.rpc('edu_student_state', { p_join_token:joinToken });
    if (error) throw error;
    return data;
  }

  async function submitStudentResult(joinToken, sessionId, activityType, score, payload = {}) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.rpc('edu_submit_result', {
      p_join_token:joinToken,
      p_session_id:sessionId || null,
      p_activity_type:activityType,
      p_score:score,
      p_payload:payload
    });
    if (error) throw error;
    return data === true;
  }

  window.ESCSupabase = {
    isConfigured,getClient,ping,getSession,onAuthStateChange,signUp,resendSignupConfirmation,sendPasswordReset,
    updatePassword,signIn,signOut,claimFirstAdmin,isAdmin,getGameContent,replaceGameContent,
    getGameSettings,saveGameSettings,ensureEducatorProfile,getEducatorProfile,updateEducatorProfile,createEducatorSchool,joinEducatorSchool,getEducatorSchoolState,shareEducatorSchoolLesson,unshareEducatorSchoolLesson,copyEducatorSchoolLesson,manageEducatorSchoolMember,leaveEducatorSchool,listEducatorClasses,
    createEducatorClass,updateEducatorClass,updateEducatorStudent,saveEducatorLesson,updateEducatorLesson,generateEducatorAssistantPack,listEducatorAssistantHistory,deleteEducatorAssistantHistory,getEducatorLesson,listEducatorLessons,deleteEducatorLesson,gradeEducatorAssignmentResult,listEducatorResults,listEducatorSessions,
    listPrivateStudents,createPrivateStudent,updatePrivateStudent,deletePrivateStudent,
    listAssignments,createAssignment,updateAssignment,deleteAssignment,
    listScheduleEvents,createScheduleEvent,updateScheduleEvent,deleteScheduleEvent,
    startEducatorSession,updateEducatorSession,getActiveEducatorSession,joinEducatorClass,getStudentState,submitStudentResult
  };
})();

;(() => {
  try {
    const path = location.pathname || '/';
    if (path.startsWith('/admin/') || path.startsWith('/esc-studio/')) return;
    if (document.querySelector('script[data-esc-cms-runtime]')) return;
    const script = document.createElement('script');
    script.src = '/esc-cms-runtime.js?v=20261006-eventfix1';
    script.async = true;
    script.dataset.escCmsRuntime = 'true';
    document.head.appendChild(script);
  } catch (_) {}
})();
