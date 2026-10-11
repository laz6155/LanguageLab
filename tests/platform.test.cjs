const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const html=source('platform/index.html'),css=source('platform/platform.css'),js=source('platform/platform.js'),sql=source('database/academy_schema.sql');

test('academy dashboard ships branded real routes and accessible forms',()=>{
  for(const p of ['platform/index.html','platform/platform.js','platform/platform.css','database/academy_schema.sql'])assert.ok(fs.existsSync(path.join(root,p)));
  assert.match(html,/id="catalog-list"/);assert.match(html,/id="auth-form"/);assert.match(html,/id="workspace" hidden/);
  assert.match(html,/id="admin-nav"/);assert.match(html,/id="view-mycourses"/);assert.match(html,/id="view-tasks"/);
  assert.match(html,/id="view-sessions"/);assert.match(html,/id="admin-course-form"/);
  assert.match(html,/src="\.\.\/assets\/icons\/brand-icon\.svg"/);
  assert.match(html,/href="\.\.\/educators\/"/);assert.match(html,/href="\.\.\/learning-path\/"/);
  assert.match(css,/#19305f/i);assert.match(css,/#ea5a56/i);
  assert.doesNotMatch(html,/\bE\x53C\b/);
});

test('all new bilingual platform labels have TR and EN translations',()=>{
  const sandbox={window:{},document:{readyState:'loading',addEventListener(){}},localStorage:{getItem(){return null}}};
  const patched=js.replace("  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();","  globalThis.__labels={TR,EN};");
  vm.runInNewContext(patched,sandbox,{timeout:2000});
  const keys=[...html.matchAll(/data-i18n="([^"]+)"/g)].map(x=>x[1]);
  for(const key of new Set(keys)){
    assert.ok(typeof sandbox.__labels.TR[key]==='string',`Missing Turkish: ${key}`);
    assert.ok(typeof sandbox.__labels.EN[key]==='string',`Missing English: ${key}`);
  }
});

test('student and management state mutations always use Supabase client',()=>{
  for(const table of ['academy_profiles','academy_courses','academy_enrollments','academy_modules','academy_lessons','academy_progress','academy_tasks','academy_announcements','academy_sessions','academy_staff']){
    assert.match(js,new RegExp(table));assert.match(sql,new RegExp('enable row level security;'));
  }
  assert.match(js,/db\.auth\.getUser\(\)/);assert.match(js,/signInWithPassword/);assert.match(js,/auth\.signUp/);
  assert.match(js,/\.from\('academy_progress'\)\.insert/);assert.match(js,/\.from\('academy_enrollments'\)\.insert/);
  assert.match(js,/\.from\('academy_courses'\)\.insert/);
  assert.doesNotMatch(js,/service_role|sb_secret_/);
  assert.doesNotMatch(js,/localStorage\.setItem\([^)]*(?:password|user|role|progress|course)/i);
});

test('backend has isolated role-bound RLS for all new private tables',()=>{
  for(const table of ['staff','profiles','courses','enrollments','modules','lessons','progress','tasks','announcements','sessions']){
    assert.match(sql,new RegExp(`create table if not exists public\\.academy_${table} \\(`));
    assert.match(sql,new RegExp(`alter table public\\.academy_${table} enable row level security;`));
  }
  assert.match(sql,/user_id\s*=\s*\(select auth\.uid\(\)\)/);
  assert.match(sql,/academy_enrollment_own_join/);
  assert.match(sql,/academy_progress_self_insert/);
  assert.match(sql,/academy_staff_self_read/);
  assert.match(sql,/academy_courses_manager/);
  assert.doesNotMatch(sql,/create policy[^;]+using\s*\(true\)/is);
  assert.match(sql,/from public\.esc_admins/);
  assert.doesNotMatch(sql,/drop table|truncate\s+table|delete\s+from\s+public\.edu_/i);
});

test('user-entered and database-originated content uses textContent rather than HTML injection',()=>{
  assert.match(js,/e\.textContent=String\(text\)/);
  assert.doesNotMatch(js,/innerHTML\s*=\s*localized\(/);
  assert.doesNotMatch(js,/eval\(/);
  assert.match(sql,/meeting_url.*https:\/\//);
});

test('password recovery has an accessible form and prevents cross-user stale dashboard data',()=>{
  assert.match(html,/id="password-recovery-panel"[^>]*hidden/);
  assert.match(html,/id="password-recovery-form"/);
  assert.match(html,/id="confirm-password"/);
  assert.match(js,/event==='PASSWORD_RECOVERY'/);
  assert.match(js,/db\.auth\.updateUser\(\{password\}\)/);
  assert.match(js,/password!==elem\('#confirm-password'\)\.value/);
  assert.match(js,/if\(!user\|\|user\.id!==uid\)return/);
  assert.match(js,/if\(loadingSession\)\{sessionRefreshQueued=true;return;\}/);
  assert.match(js,/allCourses=\[\];adminEnrollments=\[\];profileMap=\{\}/);
});

test('student task reminders are sorted by date and cancelled sessions are marked',()=>{
  assert.match(js,/localDateKey\(\)/);
  assert.match(js,/dueSoon/);
  assert.match(js,/due-today/);
  assert.match(js,/session-cancelled/);
  assert.match(css,/\.due-tag\.overdue/);
});


test('self-enrollment policy checks enrollment status, not course status',()=>{
  const start=sql.indexOf('create policy academy_enrollment_own_join');
  const end=sql.indexOf(';',start);
  const policy=sql.slice(start,end);
  assert.match(policy,/academy_enrollments\.status='active'/);
  assert.match(policy,/academy_enrollments\.status='pending'/);
  assert.doesNotMatch(policy,/\band status='active'/);
});

test('startup uses querySelectorAll for list operations and reports initialization errors',()=>{
  assert.match(js,/\$\$\('\[data-lang\]'\)\.forEach/);
  assert.doesNotMatch(js,/(?<!\$)\$\('[^']+'\)\.forEach/);
  assert.match(js,/LanguageLab startup failed/);
  assert.match(js,/document\.addEventListener\('DOMContentLoaded',start\)/);
});

test('learner CEFR self-checks have private ownership policies and no anonymous write permission',()=>{
  const checks=fs.readFileSync(path.join(root,'database/academy_skill_checks.sql'),'utf8');
  assert.match(checks,/enable row level security/);
  assert.match(checks,/revoke all on table public\.academy_skill_checks from anon/);
  assert.match(checks,/using \(user_id = \(select auth\.uid\(\)\)\)/);
  assert.match(checks,/with check \(user_id = \(select auth\.uid\(\)\)\)/);
  assert.match(js,/db\.from\('academy_skill_checks'\)/);
  assert.match(html,/id="skill-check-form"/);
  assert.match(html,/id="skill-check-list"/);
  assert.match(js,/skillChecks=\[\]/);
});


test('signup has stronger password minimum without blocking legacy eight-character sign-ins',()=>{
  assert.match(js,/elem\('#auth-password'\)\.minLength=mode==='signup'\?10:8/);
  assert.match(js,/function authErrorMessage\(error\)/);
  assert.match(js,/authEmailRestricted/);
  assert.match(js,/email_address_not_authorized/);
  assert.match(js,/authRateLimited/);
  assert.match(js,/authInvalid/);
  assert.match(js,/authConfirm/);
});


test('learner lesson view and manager editor use different data stores',()=>{
  const start=(name)=>js.indexOf('  '+name);
  const learner=js.slice(start('function renderCourseDetail('),start('async function toggleLessonDone('));
  const manager=js.slice(start('function renderAdminContent('),start('async function handleModuleSave('));
  assert.match(js,/learnerModules=\[\],learnerLessons=\[\],adminModules=\[\],adminLessons=\[\]/);
  assert.match(learner,/\blearnerModules\b/);
  assert.match(learner,/\blearnerLessons\b/);
  assert.doesNotMatch(learner,/\badminModules\b|\badminLessons\b/);
  assert.match(manager,/\badminModules\b/);
  assert.match(manager,/\badminLessons\b/);
  assert.doesNotMatch(manager,/\blearnerModules\b|\blearnerLessons\b/);
});

test('async course loading ignores stale responses and signs out safely',()=>{
  const learner=js.slice(js.indexOf('  async function openCourse('),js.indexOf('  function renderCourseDetail('));
  const manager=js.slice(js.indexOf('  async function loadAdminContent('),js.indexOf('  function renderAdminContent('));
  assert.match(learner,/requestId=\+\+courseLoadSequence/);
  assert.match(learner,/requestId!==courseLoadSequence/);
  assert.match(learner,/user\.id!==requestingUser/);
  assert.match(learner,/enrollmentFor\(courseId\)\?\.status!=='active'/);
  assert.match(manager,/requestId=\+\+adminContentLoadSequence/);
  assert.match(manager,/requestId!==adminContentLoadSequence/);
  assert.match(manager,/elem\('#content-course'\)\.value!==id/);
  assert.match(js,/courseLoadSequence\+\+;adminContentLoadSequence\+\+;/);
});


test('profile edits survive unrelated rerenders and account switches reset drafts',()=>{
  assert.match(html,/id="profile-draft-status"/);
  assert.match(css,/\.profile-draft-status/);
  assert.match(js,/addEventListener\('input',markProfileDirty\)/);
  assert.match(js,/addEventListener\('change',markProfileDirty\)/);
  assert.match(js,/profileDirty=true;profileRevision\+\+/);
  assert.match(js,/if\(profileDirty\)\{status\.hidden=false;/);
  assert.match(js,/if\(revision===profileRevision\)profileDirty=false/);
  assert.match(js,/if\(changed\)\{(?:managerLoadSequence\+\+;)?profileDirty=false;profileRevision=0;profile=null;staff=null;elem\('#profile-form'\)\.reset\(\)/);
  assert.match(js,/user=null;staff=null;profile=null;profileDirty=false;profileRevision=0;/);
  assert.match(js,/if\(!user\|\|user\.id!==uid\)return;/);
});

test('profile draft rendering preserves unsaved values while repainting language',()=>{
  const m=js.match(/  function markProfileDirty\(\)\{[\s\S]*?(?=  async function handleProfileSave\()/);
  assert.ok(m,'Profile helpers missing');
  const fields={
    '#profile-name':{value:''},
    '#profile-level':{value:''},
    '#profile-goal':{value:''},
    '#profile-draft-status':{hidden:true,textContent:''}
  };
  const sandbox={user:{id:'learner-a'},profile:{full_name:'Previous',target_level:'A1-A2',learning_goal:'Original'},profileDirty:false,profileRevision:0,
    elem:(key)=>fields[key],tr:(key)=>key==='profileDraftPending'?'Unsaved changes':key};
  vm.runInNewContext(m[0]+';globalThis.exercise={markProfileDirty,renderProfile};',sandbox,{timeout:1500});
  sandbox.exercise.renderProfile();
  assert.equal(fields['#profile-goal'].value,'Original');
  fields['#profile-goal'].value='New goal not saved yet';
  sandbox.exercise.markProfileDirty();
  sandbox.exercise.renderProfile();
  assert.equal(fields['#profile-goal'].value,'New goal not saved yet');
  assert.equal(fields['#profile-draft-status'].hidden,false);
  sandbox.profileDirty=false;sandbox.profile={full_name:'Saved',target_level:'B1-B2',learning_goal:'Persisted'};
  sandbox.exercise.renderProfile();
  assert.equal(fields['#profile-goal'].value,'Persisted');
  assert.equal(fields['#profile-draft-status'].hidden,true);
});


test('learner mutations retain initiating actor and do not write into a later session',()=>{
  const portion=(start,end)=>js.slice(js.indexOf('  async function '+start+'('),js.indexOf('  '+end+'(',js.indexOf('  async function '+start+'(')));
  const sections=[
    portion('toggleLessonDone','function renderTasks'),
    portion('handleTaskSave','async function updateTask'),
    portion('updateTask','async function deleteTask'),
    portion('deleteTask','function markProfileDirty'),
    portion('joinCourse','function renderCatalog'),
    portion('setEnrollmentStatus','function clearCourseForm')
  ];
  for(const fragment of sections){
    assert.ok(fragment.length>180,'Missing mutation function under test');
    assert.match(fragment,/user\.id!==uid/,'Must ignore stale response after account switch');
    assert.doesNotMatch(fragment,/\.eq\('user_id',user\.id\)/,'Do not read mutable actor after awaiting');
  }
  assert.match(js,/pendingLessonWrites\.has\(key\)/);
  assert.match(js,/pendingEnrollments\.has\(key\)/);
  assert.match(js,/taskCreatePending=true/);
  assert.match(js,/elem\('#task-form'\)\.reset\(\);elem\('#skill-check-form'\)\.reset\(\)/);
  assert.match(js,/function markProfileDirty\(\)/,'Previous profile fix must survive');
});

test('manager async loading never leaks a previous account into the next dashboard',async()=>{
  const start=js.indexOf('  async function loadManagerData(');
  const end=js.indexOf('  function renderManager(',start);
  assert.ok(start>0&&end>start);
  const managers=js.slice(start,end);
  const values={
    academy_courses:[{id:'sample-course'}],
    academy_enrollments:[{id:'sample-request',user_id:'student-1'}],
    academy_profiles:[{user_id:'student-1',full_name:'Sample Learner'}]
  };
  const ctx={
    user:{id:'manager-a'},staff:{role:'owner'},managerLoadSequence:0,
    allCourses:[],adminEnrollments:[],profileMap:{},
    db:{from(table){return {table,select(){return this;},order(){return this;},limit(){return this;},in(){return this;}};}},
    run:async(query)=>values[query.table],
    isManager:()=>ctx.staff?.role==='owner'
  };
  vm.runInNewContext(managers+';globalThis.loadManagerData=loadManagerData;',ctx,{timeout:2000});
  const pending=ctx.loadManagerData();
  ctx.user={id:'learner-b'};ctx.staff=null;
  await pending;
  assert.equal(ctx.allCourses.length,0,'Manager courses from other user must not be attached');
  assert.equal(ctx.adminEnrollments.length,0);
  ctx.user={id:'manager-a'};ctx.staff={role:'owner'};
  await ctx.loadManagerData();
  assert.equal(ctx.allCourses.length,1);
  assert.equal(ctx.adminEnrollments.length,1);
  assert.equal(ctx.profileMap['student-1'],'Sample Learner');
});


test('date-only due dates respect local calendar day across timezones',()=>{
  const a=js.indexOf('  const formatDate=');
  const b=js.indexOf('\n  function notify(',a);
  assert.ok(a>0&&b>a);
  const code=js.slice(a,b);
  const sandbox={lang:'en',Intl:{DateTimeFormat:(locale,options)=>new Intl.DateTimeFormat(locale,{...options,timeZone:'America/Los_Angeles'})}};
  vm.runInNewContext(code+';globalThis.displayDate=formatDate;',sandbox,{timeout:1500});
  assert.equal(sandbox.displayDate('2026-10-11'),'11 Oct 2026');
  assert.equal(sandbox.displayDate('2026-10-11T00:00:00Z'),'10 Oct 2026');
  assert.match(html,/platform\.js\?v=20261011-qa3/);
  assert.match(html,/platform\.css\?v=20261011-qa3/);
});
