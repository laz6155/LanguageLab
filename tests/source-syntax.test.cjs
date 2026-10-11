const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const jsDirs = ['assets/js', 'educators', 'join', 'learning-path', 'platform'];
const jsFiles = ['esc-supabase.js', 'esc-supabase-config.js'];
const htmlFiles = [
  'index.html', 'platform/index.html', 'educators/index.html',
  'join/index.html', 'games/index.html', 'learning-path/index.html',
  'ozel-dersler/index.html'
];

for (const dir of jsDirs) {
  for (const name of fs.readdirSync(path.join(root, dir))) {
    if (name.endsWith('.js')) jsFiles.push(dir + '/' + name);
  }
}

test('every academy frontend JavaScript file has valid syntax', () => {
  assert.ok(jsFiles.length >= 12, 'Expected every educator/student JS asset');
  for (const f of jsFiles) {
    assert.doesNotThrow(() => execFileSync(process.execPath, ['--check', path.join(root, f)], {
      encoding: 'utf8',
      stdio: 'pipe'
    }), 'Syntax error in ' + f);
  }
});

test('HTML page IDs are unique and local script paths exist', () => {
  for (const relative of htmlFiles) {
    const markup = fs.readFileSync(path.join(root, relative), 'utf8');
    const ids = [...markup.matchAll(/\sid=["']([^"']+)["']/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, 'Duplicate ID on ' + relative);
    const scripts = [...markup.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)]
      .map(match => match[1]);
    for (const src of scripts) {
      if (/^https?:\/\//i.test(src)) continue;
      const pathname = src.split(/[?#]/, 1)[0];
      assert.ok(!pathname.startsWith('/'), 'Root-absolute script incompatible with subpath: ' + src);
      const destination = path.resolve(root, path.dirname(relative), pathname);
      assert.ok(destination.startsWith(root + path.sep), 'Script escapes project root: ' + src);
      assert.ok(fs.existsSync(destination), 'Script missing: ' + relative + ' -> ' + src);
    }
  }
});

test('academy educator cache versions reflect Assistant v2', () => {
  const html = fs.readFileSync(path.join(root, 'educators/index.html'), 'utf8');
  assert.match(html, /educators-assistant\.js\?v=20261011-assistant-v2/);
  assert.match(html, /esc-supabase\.js\?v=20261011-academy-v2/);
});
