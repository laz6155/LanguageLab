const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const js = fs.readFileSync(path.join(root, 'platform/platform.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'platform/index.html'), 'utf8');
const section = (from, to) => {
  const start = js.indexOf('  ' + from), end = js.indexOf('  ' + to, start);
  assert.ok(start > 0 && end > start, 'Missing auth script: ' + from);
  return js.slice(start, end);
};

test('Academy startup attaches actual form handlers even when backend is offline', async () => {
  const registered = new Map(), messages = [];
  const make = key => ({
    addEventListener: type => {
      const events = registered.get(key) || [];
      events.push(type);
      registered.set(key, events);
    }
  });
  const elements = new Map();
  const elem = key => {
    if (!elements.has(key)) elements.set(key, make(key));
    return elements.get(key);
  };
  const ctx = {
    location: { search: '', hash: '' },
    window: { ESCSupabase: { isConfigured: () => false } },
    recoveryMode: false,
    lang: 'tr',
    $$: selector => [make(selector)],
    elem,
    setLang: () => messages.push('language-ready'),
    tr: key => key,
    notify: (message, isError) => messages.push([message, isError]),
    empty: () => messages.push('catalog-offline'),
    setAuthMode: () => {},
    handleAuth: () => {},
    handleReset: () => {},
    handlePasswordUpdate: () => {},
    runAuth: () => {},
    showUnauthed: () => {},
    setView: () => {},
    setAdminTab: () => {},
    renderCatalog: () => {},
    handleTaskSave: () => {},
    handleProfileSave: () => {},
    markProfileDirty: () => {},
    handleSkillCheckSave: () => {},
    handleCourseSave: () => {},
    clearCourseForm: () => {},
    loadAdminContent: () => {},
    renderAdminContent: () => {},
    handleModuleSave: () => {},
    handleLessonSave: () => {},
    handleAnnouncementSave: () => {},
    handleSessionSave: () => {}
  };
  vm.runInNewContext(section('async function init(', 'async function runAuth(') +
    ';globalThis.startAcademy=init;', ctx, { timeout: 2000 });
  await ctx.startAcademy();
  for (const [selector, event] of [
    ['#auth-form', 'submit'], ['#reset-password', 'click'],
    ['#password-recovery-form', 'submit'], ['#profile-form', 'input'],
    ['#module-form', 'submit'], ['#lesson-form', 'submit']
  ]) {
    assert.ok((registered.get(selector) || []).includes(event), selector + ' ' + event);
    const id = selector.slice(1);
    assert.ok(html.includes('id="' + id + '"'), 'Missing form in HTML: ' + id);
  }
  assert.ok(messages.includes('language-ready'));
  assert.ok(messages.includes('catalog-offline'));
  assert.ok(messages.some(item => Array.isArray(item) && item[0] === 'missingConfig'));
});

test('Sign-up and sign-in keep the intended callback path and button recovery', async () => {
  const messages = [], calls = [];
  const fields = {
    '#auth-submit': { disabled: false },
    '#auth-email': { value: ' Test@example.com ' },
    '#auth-password': { value: 'a-secure-password-123' }
  };
  const ctx = {
    db: { auth: {
      signUp: async args => {
        calls.push(['signup', args]);
        return { data: { user: { id: 'synthetic' }, session: null }, error: null };
      },
      signInWithPassword: async args => {
        calls.push(['signin', args]);
        return { data: { session: { access_token: 'fake' } }, error: null };
      }
    } },
    authMode: 'signup',
    location: { origin: 'https://example.github.io', pathname: '/LanguageLab/platform/' },
    elem: selector => fields[selector],
    runAuth: async result => {
      const r = await result;
      if (r.error) throw r.error;
      return r.data;
    },
    refreshSession: async () => { calls.push('refreshed'); },
    notify: (message, isError) => messages.push({ message, isError: Boolean(isError) }),
    tr: key => key,
    setAuthMode: mode => { ctx.authMode = mode; },
    authErrorMessage: error => error?.code || 'error',
    console: { error() {} }
  };
  vm.runInNewContext(section('async function handleAuth(', 'async function handleReset(') +
    ';globalThis.submitAcademy=handleAuth;', ctx, { timeout: 2000 });
  let prevented = 0;
  await ctx.submitAcademy({ preventDefault() { prevented++; } });
  assert.equal(prevented, 1);
  assert.equal(calls[0][0], 'signup');
  assert.equal(calls[0][1].email, 'test@example.com');
  assert.equal(calls[0][1].options.emailRedirectTo, 'https://example.github.io/LanguageLab/platform/');
  assert.equal(ctx.authMode, 'signin');
  assert.equal(messages.at(-1).message, 'signupSent');
  assert.equal(fields['#auth-submit'].disabled, false);
  assert.equal(fields['#auth-password'].value, '');

  fields['#auth-password'].value = 'password-again';
  await ctx.submitAcademy({ preventDefault() {} });
  assert.equal(calls.find(a => Array.isArray(a) && a[0] === 'signin')[1].email, 'test@example.com');
  assert.ok(calls.includes('refreshed'));
  assert.equal(fields['#auth-submit'].disabled, false);
});

test('Email restrictions and auth errors never masquerade as successful registrations', async () => {
  const messages = [];
  const fields = {
    '#auth-submit': { disabled: false },
    '#auth-email': { value: 'learner@example.com' },
    '#auth-password': { value: 'valid-password-123' }
  };
  const ctx = {
    db: { auth: {
      signUp: async () => ({
        data: null,
        error: { code: 'email_address_not_authorized', message: 'Address is not authorized' }
      })
    } },
    authMode: 'signup',
    location: { origin: 'https://example.github.io', pathname: '/LanguageLab/platform/' },
    elem: selector => fields[selector],
    runAuth: async result => {
      const r = await result;
      if (r.error) throw r.error;
      return r.data;
    },
    refreshSession: () => { throw Error('Should not refresh'); },
    setAuthMode: () => { throw Error('Should remain in sign-up mode'); },
    notify: (message, isError) => messages.push([message, isError]),
    tr: key => key,
    console: { error() {} }
  };
  const authErrCode = section('function authErrorMessage(', 'async function handleAuth(');
  const authCode = section('async function handleAuth(', 'async function handleReset(');
  vm.runInNewContext(authErrCode + authCode +
    ';globalThis.submitAcademy=handleAuth;', ctx, { timeout: 2000 });
  await ctx.submitAcademy({ preventDefault() {} });
  assert.deepEqual(messages, [['authEmailRestricted', true]]);
  assert.equal(fields['#auth-submit'].disabled, false);
  assert.equal(fields['#auth-password'].value, '');
});

test('New registrations require ten characters without locking out legacy passwords', () => {
  const field = { value: '', minLength: 8, autocomplete: '' },
    submit = { textContent: '' },
    modeSwitch = { dataset: { authMode: 'signup' }, classList: { toggle() {} },
      setAttribute() {} };
  const ctx = {
    authMode: 'signin',
    $$: () => [modeSwitch],
    elem: selector => selector === '#auth-submit' ? submit : field,
    tr: key => key
  };
  vm.runInNewContext(section('function setAuthMode(', 'function authErrorMessage(') +
    ';globalThis.switchMode=setAuthMode;', ctx, { timeout: 1000 });
  ctx.switchMode('signup');
  assert.equal(field.minLength, 10);
  assert.equal(field.autocomplete, 'new-password');
  ctx.switchMode('signin');
  assert.equal(field.minLength, 8);
  assert.equal(field.autocomplete, 'current-password');
});
