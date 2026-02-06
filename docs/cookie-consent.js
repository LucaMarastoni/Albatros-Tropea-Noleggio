(() => {
  const STORAGE_KEY = 'cookieConsent';
  const VERSION = 1;

  const TEXTS = {
    it: {
      bannerTitle: 'Preferenze cookie',
      bannerBody: 'Usiamo cookie tecnici per il funzionamento del sito. Puoi accettare i cookie facoltativi o gestire le preferenze.',
      acceptAll: 'Accetta tutti',
      reject: 'Rifiuta',
      manage: 'Gestisci preferenze',
      modalTitle: 'Preferenze cookie',
      modalBody: 'Scegli quali cookie opzionali attivare. I cookie essenziali sono sempre attivi.',
      essentialTitle: 'Essenziali',
      essentialDesc: 'Necessari per navigazione, lingua e prenotazioni.',
      functionalTitle: 'Funzionali',
      functionalDesc: 'Migliorano l’esperienza ricordando preferenze.',
      analyticsTitle: 'Analytics',
      analyticsDesc: 'Misurazioni anonime per migliorare il servizio.',
      noMarketing: 'Nessun cookie di marketing o profilazione.',
      save: 'Salva preferenze',
      close: 'Chiudi',
    },
    en: {
      bannerTitle: 'Cookie preferences',
      bannerBody: 'We use technical cookies to run the site. You can accept optional cookies or manage your preferences.',
      acceptAll: 'Accept all',
      reject: 'Reject',
      manage: 'Manage preferences',
      modalTitle: 'Cookie preferences',
      modalBody: 'Choose which optional cookies to enable. Essential cookies are always active.',
      essentialTitle: 'Essential',
      essentialDesc: 'Needed for navigation, language and bookings.',
      functionalTitle: 'Functional',
      functionalDesc: 'Improve the experience by remembering preferences.',
      analyticsTitle: 'Analytics',
      analyticsDesc: 'Anonymous measurements to improve the service.',
      noMarketing: 'No marketing or profiling cookies.',
      save: 'Save preferences',
      close: 'Close',
    },
  };

  const defaultConsent = {
    essential: true,
    functional: false,
    analytics: false,
    version: VERSION,
    timestamp: null,
  };

  const getLang = () => {
    const docLang = document.documentElement.lang;
    if (docLang && docLang.startsWith('en')) return 'en';
    try {
      const saved = localStorage.getItem('siteLang');
      if (saved === 'en') return 'en';
    } catch (_) {}
    return 'it';
  };

  const normalizeConsent = (value = {}) => ({
    ...defaultConsent,
    ...value,
    essential: true,
    version: VERSION,
  });

  const getStoredConsent = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return normalizeConsent(parsed);
    } catch (_) {
      return null;
    }
  };

  const applyConsentFlags = (consent) => {
    document.documentElement.dataset.cookieFunctional = consent.functional ? 'true' : 'false';
    document.documentElement.dataset.cookieAnalytics = consent.analytics ? 'true' : 'false';
  };

  const saveConsent = (consent) => {
    const next = normalizeConsent(consent);
    next.timestamp = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (_) {}
    applyConsentFlags(next);
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: next }));
    return next;
  };

  const createBanner = () => {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner hidden';
    banner.innerHTML = `
      <div class="cookie-banner__inner" role="region" aria-label="Cookie banner">
        <div class="cookie-banner__copy">
          <strong data-cookie-key="bannerTitle"></strong>
          <p data-cookie-key="bannerBody"></p>
        </div>
        <div class="cookie-banner__actions">
          <button class="btn outline" type="button" data-cookie-action="reject"></button>
          <button class="btn outline" type="button" data-cookie-action="manage"></button>
          <button class="btn primary" type="button" data-cookie-action="accept"></button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    return banner;
  };

  const createModal = () => {
    const modal = document.createElement('div');
    modal.className = 'cookie-modal hidden';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'cookieModalTitle');
    modal.innerHTML = `
      <div class="cookie-modal__backdrop" data-cookie-action="close"></div>
      <div class="cookie-modal__panel" role="document">
        <header class="cookie-modal__header">
          <h3 id="cookieModalTitle" data-cookie-key="modalTitle"></h3>
          <p data-cookie-key="modalBody"></p>
        </header>
        <div class="cookie-modal__options">
          <div class="cookie-option">
            <div>
              <strong data-cookie-key="essentialTitle"></strong>
              <p data-cookie-key="essentialDesc"></p>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" checked disabled>
              <span class="cookie-switch__track"></span>
            </label>
          </div>
          <div class="cookie-option">
            <div>
              <strong data-cookie-key="functionalTitle"></strong>
              <p data-cookie-key="functionalDesc"></p>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" id="cookieFunctional">
              <span class="cookie-switch__track"></span>
            </label>
          </div>
          <div class="cookie-option">
            <div>
              <strong data-cookie-key="analyticsTitle"></strong>
              <p data-cookie-key="analyticsDesc"></p>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" id="cookieAnalytics">
              <span class="cookie-switch__track"></span>
            </label>
          </div>
          <p class="cookie-modal__note" data-cookie-key="noMarketing"></p>
        </div>
        <footer class="cookie-modal__actions">
          <button class="btn outline" type="button" data-cookie-action="close"></button>
          <button class="btn primary" type="button" data-cookie-action="save"></button>
        </footer>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  };

  const applyTexts = (lang) => {
    const dict = TEXTS[lang] || TEXTS.it;
    document.querySelectorAll('[data-cookie-key]').forEach((node) => {
      const key = node.dataset.cookieKey;
      if (dict[key]) node.textContent = dict[key];
    });
    document.querySelectorAll('[data-cookie-action="accept"]').forEach((node) => {
      if (node.tagName === 'BUTTON') node.textContent = dict.acceptAll;
    });
    document.querySelectorAll('[data-cookie-action="reject"]').forEach((node) => {
      if (node.tagName === 'BUTTON') node.textContent = dict.reject;
    });
    document.querySelectorAll('[data-cookie-action="manage"]').forEach((node) => {
      if (node.tagName === 'BUTTON') node.textContent = dict.manage;
    });
    document.querySelectorAll('[data-cookie-action="save"]').forEach((node) => {
      if (node.tagName === 'BUTTON') node.textContent = dict.save;
    });
    document.querySelectorAll('[data-cookie-action="close"]').forEach((node) => {
      if (node.tagName === 'BUTTON') node.textContent = dict.close;
    });
  };

  const banner = document.querySelector('.cookie-banner') || createBanner();
  const modal = document.querySelector('.cookie-modal') || createModal();
  const functionalInput = modal.querySelector('#cookieFunctional');
  const analyticsInput = modal.querySelector('#cookieAnalytics');

  const openModal = () => {
    const stored = getStoredConsent() || defaultConsent;
    if (functionalInput) functionalInput.checked = Boolean(stored.functional);
    if (analyticsInput) analyticsInput.checked = Boolean(stored.analytics);
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  };

  const showBannerIfNeeded = () => {
    const stored = getStoredConsent();
    if (!stored) {
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
      applyConsentFlags(stored);
    }
  };

  banner.addEventListener('click', (event) => {
    const action = event.target?.dataset?.cookieAction;
    if (!action) return;
    if (action === 'accept') {
      saveConsent({ functional: true, analytics: true });
      banner.classList.add('hidden');
      closeModal();
    }
    if (action === 'reject') {
      saveConsent({ functional: false, analytics: false });
      banner.classList.add('hidden');
      closeModal();
    }
    if (action === 'manage') {
      openModal();
    }
  });

  modal.addEventListener('click', (event) => {
    const action = event.target?.dataset?.cookieAction;
    if (!action) return;
    if (action === 'close') {
      closeModal();
    }
    if (action === 'save') {
      saveConsent({
        functional: Boolean(functionalInput?.checked),
        analytics: Boolean(analyticsInput?.checked),
      });
      banner.classList.add('hidden');
      closeModal();
    }
  });

  document.querySelectorAll('.js-cookie-settings').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openModal();
    });
  });

  let currentLang = getLang();
  applyTexts(currentLang);
  showBannerIfNeeded();

  const observer = new MutationObserver(() => {
    const nextLang = getLang();
    if (nextLang !== currentLang) {
      currentLang = nextLang;
      applyTexts(currentLang);
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  window.cookieConsent = {
    get: () => getStoredConsent(),
    open: () => openModal(),
  };
})();
