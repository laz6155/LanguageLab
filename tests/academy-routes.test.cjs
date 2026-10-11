const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

const portals = [
  'educators/index.html','join/index.html','ozel-dersler/index.html',
  'learning-path/index.html','games/index.html'
];

test('academy owns educator, student, private lesson and pathway routes', () => {
  portals.forEach(p => assert.ok(fs.existsSync(path.join(root,p)), 'Missing '+p));
  const homepage=read('index.html');
  portals.slice(0,4).forEach(p => assert.ok(homepage.includes('./'+p.replace('index.html','')),'Missing link '+p));
});

test('migrated portals load required local scripts and styles', () => {
  const educator=read('educators/index.html');
  const student=read('join/index.html');
  const privateLesson=read('ozel-dersler/index.html');
  const required=[
    'educators/educators.js','educators/educators-core.js','educators/educators-product.js',
    'educators/educators-i18n.js','educators/educators-workspace.js',
    'educators/educators-assistant.js','educators/educators-school.js',
    'join/join.css','join/join.js','ozel-dersler/styles.css',
    'esc-supabase-config.js','esc-supabase.js','assets/css/academy-portals.css',
    'assets/css/portal-brand.css','ozel-dersler/yagmur-full.svg',
  ];
  required.forEach(p => assert.ok(fs.existsSync(path.join(root,p)), 'Missing '+p));
  assert.match(educator,/educators-core\.js/);
  assert.match(student,/join\.js/);
  assert.match(privateLesson,/formsubmit\.co/);
  assert.match(educator,/academy-portals\.css/);
  assert.match(privateLesson,/academy-portals\.css/);
});

test('first party routes and links work with GitHub Pages project subpath', () => {
  const core=read('educators/educators-core.js');
  const product=read('educators/educators-product.js');
  assert.doesNotMatch(core,/location\.origin\s*\+\s*['"]\/join\//);
  assert.doesNotMatch(product,/location\.origin\s*\+\s*['"]\/join\//);
  assert.match(core,/new URL\(['"]\.\.\/join\//);
  const privateLesson=read('ozel-dersler/index.html');
  assert.doesNotMatch(privateLesson,/eryamanspeakingclub\.com/);
  assert.match(privateLesson,/laz6155\.github\.io\/LanguageLab\/ozel-dersler\//);
});

test('public academy pages use own logo and not the forbidden abbreviation', () => {
  const acro=String.fromCharCode(69,83,67);
  portals.forEach(p => {
    const html=read(p);
    assert.ok(html.includes('LanguageLab'), 'Missing academy brand in '+p);
    assert.doesNotMatch(html,new RegExp('\\b'+acro+'\\b'), 'Forbidden abbreviated brand '+p);
  });
  assert.match(read('educators/index.html'),/assets\/icons\/brand-icon\.svg/);
  assert.match(read('join/index.html'),/assets\/icons\/brand-icon\.svg/);
  assert.match(read('ozel-dersler/index.html'),/assets\/icons\/brand-icon\.svg/);
});

test('learning path supplies separate learner, teacher and school flows with local-only checks', () => {
  const script=read('learning-path/path.js');
  const html=read('learning-path/index.html');
  assert.match(html,/data-role="student"/);
  assert.match(html,/data-role="teacher"/);
  assert.match(html,/data-role="school"/);
  assert.match(script,/languagelab-path-/);
  assert.match(script,/localStorage\.setItem/);
  assert.match(script,/CEFR/);
  assert.match(html,/href="\.\/path\.css"/); // local stylesheet is linked
});

test('auditable P0 release criteria and the editorial pilot syllabus exist',()=>{
  const gate=read('docs/RELEASE_GATE.md');
  const syllabus=read('docs/PILOT_CURRICULUM.md');
  const readme=read('README.md');
  assert.match(gate,/Negative authorization tests/);
  assert.match(gate,/Auth/);
  assert.match(gate,/Legal notice/);
  assert.match(syllabus,/Everyday Speaking Missions/);
  assert.match(syllabus,/English at Work/);
  assert.match(syllabus,/Advanced Discussion/);
  assert.match(readme,/12 published speaking-starter lessons/);
  assert.match(readme,/not yet connected to the Academy database/);
});


test('educator assistant history binds events using a collection selector',()=>{
 const script=read('educators/educators-assistant.js');
 assert.match(script,/\$\$\("\[data-history-open\]",wrap\)\.forEach/);
 assert.match(script,/\$\$\("\[data-history-delete\]",wrap\)\.forEach/);
 assert.doesNotMatch(script,/(?<!\$)\$\("\[data-history-(?:open|delete)\]",wrap\)\.forEach/);
});


test('advanced teacher assistant is Academy-specific and honest about builder B2 limit',()=>{
  const html=read('educators/index.html');
  const client=read('esc-supabase.js');
  const assistant=read('educators/educators-assistant.js');
  const edge=read('supabase/functions/academy-lesson-assistant/index.ts');
  assert.match(client,/invoke\('academy-lesson-assistant'/);
  assert.match(html,/<option>C1<\/option><option>C2<\/option>/);
  assert.match(assistant,/\['C1','C2'\]\.includes\(pack\.level\)/);
  assert.match(assistant,/BAŞARI ÖLÇÜTLERİ/);
  assert.match(assistant,/\$\$\("\[data-history-open\]",wrap\)\.forEach/);
  assert.match(edge,/smart-rules-v2/);
  assert.match(edge,/"C1"/);
  assert.match(edge,/"C2"/);
  assert.doesNotMatch(edge,/OPENAI_API_KEY|ANTHROPIC_API_KEY/);
});
