// ============================================================================
// Mahfaza — Theme & Language Helper
// Shared dark/light + AR/EN logic across all pages
// ============================================================================

const MahfazaUI = {

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mahfaza_theme', theme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☾' : '☀';
  },

  applyLanguage(lang, strings) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('mahfaza_lang', lang);

    if (strings && strings[lang]) {
      const dict = strings[lang];
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = dict[key];
          } else {
            el.innerHTML = dict[key];
          }
        }
      });
    }

    const btn = document.getElementById('langToggle');
    if (btn) btn.textContent = lang === 'ar' ? 'EN' : 'ع';
  },

  initToggleButtons(strings) {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'dark';
        this.applyTheme(cur === 'dark' ? 'light' : 'dark');
      });
    }

    const langBtn = document.getElementById('langToggle');
    if (langBtn && strings) {
      langBtn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('lang') || 'ar';
        this.applyLanguage(cur === 'ar' ? 'en' : 'ar', strings);
      });
    }
  },

  init(strings) {
    this.applyTheme(localStorage.getItem('mahfaza_theme') || 'dark');
    this.applyLanguage(localStorage.getItem('mahfaza_lang') || 'ar', strings);
    this.initToggleButtons(strings);
  }
};

window.MahfazaUI = MahfazaUI;
