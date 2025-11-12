// translations.js – Global multilingual system for PetVerse
const translations = {
  en: { /* ... your full English dictionary ... */ },
  hi: { /* ... your full Hindi dictionary ... */ },
  kn: { /* ... your full Kannada dictionary ... */ }
};

// ✅ Core translation function
function changeLanguage(lang, showNotice = true) {
  localStorage.setItem('preferred_language', lang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = translations[lang]?.[key];
    if (!value) return;

    if (['INPUT', 'TEXTAREA'].includes(el.tagName)) el.placeholder = value;
    else el.textContent = value;
  });

  const titleEl = document.querySelector('title[data-i18n]');
  if (titleEl) {
    const titleKey = titleEl.getAttribute('data-i18n');
    const titleValue = translations[lang]?.[titleKey];
    if (titleValue) document.title = titleValue;
  }

  // ✅ Show toast only if user manually switched language
  if (showNotice) {
    const readable =
      lang === 'en' ? 'English' :
      lang === 'hi' ? 'Hindi' :
      lang === 'kn' ? 'Kannada' : lang.toUpperCase();
    showToast(`Language changed to ${readable}`);
  }
}

// ✅ Initialize on page load
function initializeLanguage() {
  const saved = localStorage.getItem('preferred_language') || 'en';
  const select = document.getElementById('languageSelect');
  if (select) select.value = saved;

  // ❌ Don’t show toast during auto load
  changeLanguage(saved, false);
}

// ✅ Auto initialize after DOM load
document.addEventListener('DOMContentLoaded', initializeLanguage);
