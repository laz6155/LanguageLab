const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const source = fs.readFileSync(path.join(root, 'assets/js/translations.js'), 'utf8');
const originalWindow = global.window;
global.window = {};
require('../assets/js/translations.js');
const content = global.window.LanguageLabTranslations;
global.window = originalWindow;

test('site includes all static assets and accessible page structure', () => {
  for (const file of ['assets/css/styles.css', 'assets/js/translations.js', 'assets/js/app.js', 'assets/icons/brand-icon.svg', '.nojekyll']) {
    assert.ok(fs.existsSync(path.join(root, file)), `Missing ${file}`);
  }
  assert.match(html, /<html lang="tr">/);
  assert.match(html, /<main id="main">/);
  assert.match(html, /<nav id="mobile-nav"/);
  assert.match(html, /<form id="interest-form"/);
});

test('Turkish translation covers every localizable element', () => {
  const expressions = [...html.matchAll(/data-i18n(?:-html|-placeholder)?="([^"]+)"/g)];
  const keys = [...new Set(expressions.map((match) => match[1]))];
  const missing = keys.filter((key) => typeof content.tr[key] !== 'string');
  assert.deepEqual(missing, []);
  assert.ok(keys.length >= 85);
  assert.ok(!Object.values(content.tr).some((value) => /[\u0000-\u001f]/.test(value.replace(/<br>/g, ''))), 'Translation contains control characters');
});

test('program filters map to real bilingual cards and roles', () => {
  assert.equal(content.programs.length, 6);
  const ids = content.programs.map((program) => program.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const level of ['a1', 'b1', 'c1', 'educator']) {
    assert.ok(content.programs.some((program) => program.group.includes(level)), `No program for ${level}`);
  }
  for (const program of content.programs) {
    assert.ok(program.en.title && program.en.description);
    assert.ok(program.tr.title && program.tr.description);
    assert.ok(['student', 'educator'].includes(program.role));
    assert.ok(program.group.length);
  }
});

test('every in-page link targets a declared section', () => {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.has(target), `Broken anchor #${target}`);
  }
});

test('interest form is an honest email handoff with input requirements', () => {
  assert.match(html, /type="email" required/);
  assert.match(html, /name="name" type="text" required/);
  assert.match(html, /name="program" required/);
  assert.match(app, /mailto:/);
  assert.match(app, /form\.reportValidity\(\)/);
  assert.doesNotMatch(app, /localStorage\.setItem\([^)]*(name|email|message)/);
  assert.match(source, /not submitted until you send the email/);
});