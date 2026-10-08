(function () {
  'use strict';

  const source = window.LanguageLabTranslations;
  if (!source) return;

  const contactEmail = 'eryamanspeakingclub@gmail.com';
  let language = 'tr';
  try {
    if (localStorage.getItem('languagelab-language') === 'en') language = 'en';
  } catch (_) { /* Browser storage may be unavailable. */ }
  let filter = 'all';
  let role = 'student';
  let emailDraft = '';

  const englishText = {};
  const englishHtml = {};
  const englishPlaceholders = {};
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    if (!(key in englishText)) englishText[key] = element.textContent.trim();
  });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    const key = element.dataset.i18nHtml;
    if (!(key in englishHtml)) englishHtml[key] = element.innerHTML;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (!(key in englishPlaceholders)) englishPlaceholders[key] = element.placeholder;
  });

  function localized(key, html = false) {
    const fallback = html ? englishHtml : englishText;
    return language === 'tr' ? (source.tr[key] ?? fallback[key] ?? '') : (fallback[key] ?? '');
  }

  function misc(key) { return source.misc[language][key]; }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function renderPrograms() {
    const visible = source.programs.filter((program) => filter === 'all' || program.group.includes(filter));
    document.getElementById('program-grid').innerHTML = visible.map((program) => {
      const title = escapeHtml(program[language].title);
      return `<article class="program-card">
        <span class="program-icon ${program.theme}" aria-hidden="true">${program.icon}</span>
        <h3>${title}</h3>
        <p>${escapeHtml(program[language].description)}</p>
        <div class="program-meta">
          <span class="program-level">${escapeHtml(program.level === 'EDUCATORS' ? localized('filters.educators') : program.level)}</span>
          <span class="program-status${program.status === 'active' ? ' is-active' : ''}">${escapeHtml(misc(program.status === 'active' ? 'active' : 'planned'))}</span>
        </div>
        <button class="program-link" type="button" data-program="${program.id}" aria-label="${escapeHtml(misc('interest') + ': ' + program[language].title)}">
          <span>${escapeHtml(misc('interest'))}</span><span aria-hidden="true">&nearr;</span>
        </button>
      </article>`;
    }).join('');
    document.getElementById('program-count').textContent = misc('count')(visible.length);
  }

  function renderProgramChoices() {
    const select = document.getElementById('program');
    const selected = select.value;
    const studentPrograms = source.programs.filter((program) => program.role === 'student');
    select.innerHTML = `<option value="">${escapeHtml(localized('form.select'))}</option>` + studentPrograms.map((program) =>
      `<option value="${program.id}">${escapeHtml(program[language].title)}</option>`
    ).join('');
    if (studentPrograms.some((program) => program.id === selected)) select.value = selected;
  }

  function renderLanguage(nextLanguage) {
    if (!['tr', 'en'].includes(nextLanguage)) return;
    language = nextLanguage;
    document.documentElement.lang = language;
    document.title = language === 'tr' ? 'LanguageLab Akademi | Dilin \u00f6tesinde' : 'LanguageLab Academy | Beyond language';
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = localized(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach((element) => {
      // Translation HTML is static, locally version-controlled content only.
      element.innerHTML = localized(element.dataset.i18nHtml, true);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      element.placeholder = language === 'tr' ? (source.tr[key] ?? englishPlaceholders[key]) : englishPlaceholders[key];
    });
    document.querySelectorAll('[data-language]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    const menuButton = document.getElementById('menu-button');
    menuButton.setAttribute('aria-label', misc(menuButton.getAttribute('aria-expanded') === 'true' ? 'menuClose' : 'menuOpen'));
    renderPrograms();
    renderProgramChoices();
    showFeedback(false);
    try { localStorage.setItem('languagelab-language', language); } catch (_) { /* Optional preference only. */ }
  }

  function setFilter(nextFilter) {
    filter = nextFilter;
    document.querySelectorAll('[data-filter]').forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderPrograms();
  }

  function showFeedback(visible, message = '') {
    document.getElementById('form-response').hidden = !visible;
    document.getElementById('form-response-text').textContent = message;
  }

  function setRole(nextRole) {
    if (!['student', 'educator'].includes(nextRole)) return;
    role = nextRole;
    document.querySelectorAll('[data-role]').forEach((button) => {
      const active = role === button.dataset.role;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const student = role === 'student';
    document.getElementById('level-label').hidden = !student;
    document.getElementById('program-label').hidden = !student;
    document.getElementById('specialty-label').hidden = student;
    document.getElementById('level').required = student;
    document.getElementById('program').required = student;
    document.getElementById('specialty').required = !student;
    showFeedback(false);
  }

  function closeMenu() {
    const button = document.getElementById('menu-button');
    document.getElementById('mobile-nav').hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', misc('menuOpen'));
  }

  document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => renderLanguage(button.dataset.language));
  });
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
  });
  document.querySelectorAll('[data-role]').forEach((button) => {
    button.addEventListener('click', () => setRole(button.dataset.role));
  });
  document.querySelectorAll('[data-choose-role]').forEach((link) => {
    link.addEventListener('click', () => setRole(link.dataset.chooseRole));
  });
  document.querySelectorAll('[data-choose-program]').forEach((link) => {
    link.addEventListener('click', () => {
      setRole('student');
      document.getElementById('program').value = link.dataset.chooseProgram;
    });
  });
  document.getElementById('program-grid').addEventListener('click', (event) => {
    const button = event.target.closest('[data-program]');
    if (!button) return;
    const program = source.programs.find((item) => item.id === button.dataset.program);
    if (!program) return;
    setRole(program.role);
    if (role === 'student') document.getElementById('program').value = program.id;
    document.getElementById('apply').scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  });

  document.getElementById('menu-button').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    document.getElementById('mobile-nav').hidden = isOpen;
    button.setAttribute('aria-expanded', String(!isOpen));
    button.setAttribute('aria-label', misc(isOpen ? 'menuOpen' : 'menuClose'));
  });
  document.querySelectorAll('#mobile-nav a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 960) closeMenu(); });
  document.getElementById('current-year').textContent = String(new Date().getFullYear());

  document.getElementById('interest-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const name = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const lines = [
      [misc('formRole'), role === 'student' ? misc('formStudent') : misc('formEducator')],
      [misc('formName'), name],
      [misc('formEmail'), email]
    ];
    if (role === 'student') {
      const program = source.programs.find((item) => item.id === document.getElementById('program').value);
      lines.push([misc('formLevel'), document.getElementById('level').value]);
      lines.push([misc('formProgram'), program ? program[language].title : '']);
    } else {
      lines.push([misc('formSpecialty'), document.getElementById('specialty').value]);
    }
    if (message) lines.push([misc('formMessage'), message]);
    emailDraft = lines.map(([label, value]) => `${label}: ${value}`).join('\n');
    const subject = misc(role === 'student' ? 'emailSubjectStudent' : 'emailSubjectEducator');
    showFeedback(true, misc('emailDraft'));
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailDraft)}`;
  });

  document.getElementById('copy-email').addEventListener('click', async () => {
    if (!emailDraft) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(emailDraft);
      showFeedback(true, misc('copied'));
    } catch (_) {
      showFeedback(true, misc('copyFailed'));
    }
  });

  renderLanguage(language);
  setRole('student');
})();