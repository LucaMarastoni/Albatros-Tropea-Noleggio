/*
  Boat detail pages read data directly from boats.html cards.
  To add a new boat, update the card in boats.html with data-boat-id and data-boat-images.
  The detail page URL must match the card data-boat-id (e.g., flotta/zar65.html).
*/
(() => {
  const root = document.querySelector('[data-boat-detail]');
  if (!root) return;

  const translations = {
    en: {
      'brand-short': 'Albatros',
      'brand-title': 'Albatros Tropea Noleggio',
      'brand-subtitle': 'RIBs·Excursions·Experiences',
      'nav-home': 'Home',
      'nav-fleet': 'Fleet',
      'nav-tours': 'Excursions',
      'nav-location': 'Where we are',
      'nav-cta': 'Book',
      'portal-login': 'Access the portal',
      'logout-btn': 'Logout',
      'session-active': 'Active session',
      'price-title1': 'Price list',
      'price-title2': 'Price list',
      'price-period1': '📅 June – July',
      'price-period2': '📅 August',
      'price-hg1': 'Half day',
      'price-fd1': 'Full day',
      'price-hg2': 'Half day',
      'price-fd2': 'Full day',
      'price-note': 'Fuel not included',
      'boat-hero-cta': 'Book this RIB',
      'boat-hero-back': 'Back to fleet',
      'boat-section-highlights-eyebrow': 'Highlights',
      'boat-section-highlights-title': 'At-a-glance essentials.',
      'boat-section-gallery-eyebrow': 'Gallery',
      'boat-section-gallery-title': 'Swipe through onboard details.',
      'boat-final-title': 'Book this RIB',
      'boat-final-note': 'Instant confirmation via email · WhatsApp crew',
      'boat-final-cta': 'Book now',
      'boat-final-back': 'Back to fleet',
      'boat-back': '← Back',
      'boat-notfound-title': 'Boat not found',
      'boat-notfound-copy': 'The requested model is not available. Go back to the fleet to choose another boat.',
      'boat-notfound-cta': 'Go to fleet',
      'boat50-badge': 'New 2026',
      'boat50-spec1': '👥 2 seats',
      'boat50-spec2': '🎵 Bluetooth stereo',
      'boat50-spec3': '🧭 Chartplotter GPS + fishfinder',
      'boat65-spec1': '👥 9/10 seats',
      'boat65-spec2': '⚓ Electric anchor + windlass',
      'boat65-spec3': '🚿 Shower + teak platforms',
      'boat65-spec4': '☀️ XL bimini',
      'boat65-spec5': '🧭 Chartplotter GPS + BT audio',
      'boat53-spec1': '👥 8 seats',
      'boat53-spec2': '🚿 Shower + wide bimini',
      'boat53-spec3': '🧭 Fishfinder for safe depths',
      'boat53-spec4': '🛋️ Full cushions',
      'boat49-spec1': '👥 6 seats',
      'boat49-spec2': '☀️ Bimini + sunpad',
      'boat49-spec3': '🚿 Onboard shower',
      'footer-title': 'Albatros Tropea Noleggio',
      'footer-address': 'Viale Raf Vallone, 89861 Tropea (VV) · Italy',
      'footer-desc': 'Premium nautical hub with signature RIBs, tailored experiences and dedicated crew.',
      'footer-fast': 'Quick contacts',
      'footer-desk-label': 'Ops desk',
      'footer-email-label': 'Concierge email',
      'footer-wa-label': 'WhatsApp crew',
      'footer-ops-title': 'Operation desk',
      'footer-ops-hours-label': 'Active hours',
      'footer-ops-hours': 'Daily concierge · 08:00 - 20:00',
      'footer-ops-emergency-label': 'Emergency lines',
      'footer-ops-emergency': 'Skipper & safety team · 24/7',
      'footer-ops-portal-label': 'Client portal',
      'footer-ops-portal-link': 'Access booking control',
      'footer-social-title': 'Social signals',
      'footer-social-ig': 'Instagram',
      'footer-social-tt': 'TikTok',
      'footer-social-ta': 'TripAdvisor',
      'footer-social-yt': 'YouTube',
      'footer-legal': '© 2025 Albatros Tropea Noleggio · VAT 01234567890',
      'footer-privacy': 'Privacy',
      'footer-cookie': 'Cookie Policy',

      'footer-cookie-settings': 'Manage cookies',
      'site-credit': 'Built by Luca Marastoni Digital Solutions',
    },
  };

  const storageKey = 'siteLang';

  const elements = {
    heroImg: document.getElementById('boatHeroImg'),
    title: document.getElementById('boatTitle'),
    tagline: document.getElementById('boatTagline'),
    badges: document.getElementById('boatBadges'),
    highlights: document.getElementById('boatHighlights'),
    gallery: document.getElementById('boatGallery'),
    primaryCta: document.getElementById('boatBookCta'),
    finalCta: document.getElementById('boatFinalCta'),
    notFound: document.getElementById('boatNotFound'),
    langToggle: document.getElementById('langToggle'),
    backBtn: document.getElementById('boatBackBtn'),
  };

  const state = {
    lang: 'it',
    boat: null,
    images: [],
  };

  const getSavedLang = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'en' || saved === 'it') return saved;
    } catch (_) {}
    return 'it';
  };

  const persistLang = (lang) => {
    try {
      localStorage.setItem(storageKey, lang);
    } catch (_) {}
  };

  const t = (lang, key, fallback = '') => {
    if (!key) return fallback;
    if (lang !== 'en') return fallback;
    return translations.en[key] || fallback;
  };

  const applyTranslations = (lang) => {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (!el.dataset.defaultText) {
        el.dataset.defaultText = el.textContent;
      }
      const translation = t(lang, key, el.dataset.defaultText);
      if (translation) el.textContent = translation;
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.dataset.i18nAria;
      if (!el.dataset.defaultAria) {
        el.dataset.defaultAria = el.getAttribute('aria-label') || '';
      }
      const translation = t(lang, key, el.dataset.defaultAria);
      if (translation) el.setAttribute('aria-label', translation);
    });

    if (elements.langToggle) {
      elements.langToggle.textContent = lang === 'en' ? 'ITA' : 'ENG';
      elements.langToggle.setAttribute('aria-label', lang === 'en' ? 'Switch to Italian' : 'Switch to English');
    }

    document.documentElement.lang = lang === 'en' ? 'en' : 'it';
    state.lang = lang;
    renderBoat();
  };

  const getSlug = () => {
    const url = new URL(window.location.href);
    const param = url.searchParams.get('boat');
    if (param) return param;
    const last = url.pathname.split('/').filter(Boolean).pop() || '';
    return last.replace('.html', '');
  };

  const parseTitleParts = (title = '') => {
    return title
      .split('·')
      .map((part) => part.trim())
      .filter(Boolean);
  };

  const extractBadges = (title = '', badgeText = '') => {
    const parts = parseTitleParts(title);
    const badges = parts.filter((part) => /\bcv\b|\bhp\b|posti|seats/i.test(part));
    if (badgeText) badges.unshift(badgeText);
    return badges;
  };

  const buildFleetData = (doc) => {
    const cards = [...doc.querySelectorAll('.boat-card')];
    const boats = cards.map((card) => {
      const titleIt = card.dataset.boatTitle || card.querySelector('h3')?.textContent?.trim() || '';
      const titleEn = card.dataset.boatTitleEn || titleIt;
      const descIt = card.dataset.boatDesc || card.querySelector('p')?.textContent?.trim() || '';
      const descEn = card.dataset.boatDescEn || descIt;
      const images = (card.dataset.boatImages || '')
        .split('|')
        .map((src) => src.trim())
        .filter(Boolean);
      const highlights = [...card.querySelectorAll('.boats__specs li')]
        .map((item) => ({
          key: item.dataset.i18n || '',
          text: item.textContent.trim(),
        }))
        .filter((item) => item.text);
      const badgeEl = card.querySelector('.boat-badge');
      const badgeKey = badgeEl?.dataset?.i18n || '';
      const badgeText = badgeEl?.textContent?.trim() || '';

      return {
        id: card.dataset.boatId,
        title: { it: titleIt, en: titleEn },
        desc: { it: descIt, en: descEn },
        images,
        highlights,
        badgeKey,
        badgeText,
      };
    });

    return { boats };
  };

  const renderNotFound = () => {
    root.querySelectorAll('section').forEach((section) => {
      if (section.id === 'boatNotFound') {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    });
  };

  const renderHighlights = (items) => {
    if (!elements.highlights) return;
    elements.highlights.innerHTML = '';
    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'boat-highlight-card';
      card.textContent = item;
      elements.highlights.appendChild(card);
    });
  };

  const renderGallery = (images, title) => {
    if (!elements.gallery) return;
    elements.gallery.innerHTML = '';
    images.forEach((src, idx) => {
      const figure = document.createElement('figure');
      figure.className = 'boat-gallery__item';
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${title} · foto ${idx + 1}`;
      img.loading = 'lazy';
      figure.appendChild(img);
      elements.gallery.appendChild(figure);
    });
  };


  const getMappedImage = (id) => {
    if (typeof window.getBoatImage !== 'function') return '';
    return window.getBoatImage(id) || '';
  };

  const renderBoat = () => {
    if (!state.boat) return;

    const lang = state.lang;
    const boat = state.boat;
    const title = boat.title[lang] || boat.title.it || 'Dettaglio gommone';
    const desc = boat.desc[lang] || boat.desc.it || '';
    const badgeText = boat.badgeKey ? t(lang, boat.badgeKey, boat.badgeText) : boat.badgeText;

    if (elements.heroImg) {
      elements.heroImg.src = state.images[0] || '';
      elements.heroImg.alt = title;
    }
    if (elements.title) elements.title.textContent = title;
    if (elements.tagline) elements.tagline.textContent = desc;

    const badges = extractBadges(title, badgeText);
    if (elements.badges) {
      elements.badges.innerHTML = '';
      badges.forEach((badge, index) => {
        const span = document.createElement('span');
        span.className = index === 0 && badgeText ? 'boat-pill boat-pill--accent' : 'boat-pill';
        span.textContent = badge;
        elements.badges.appendChild(span);
      });
    }

    const highlights = boat.highlights.map((item) => t(lang, item.key, item.text));
    renderHighlights(highlights);
    renderGallery(state.images, title);

    document.title = `${title} · Albatros Tropea Noleggio`;
  };

  const hydratePage = async () => {
    const slug = getSlug();
    if (!slug) {
      renderNotFound();
      return;
    }

    const response = await fetch('../boats.html');
    if (!response.ok) {
      renderNotFound();
      return;
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const { boats } = buildFleetData(doc);
    const boat = boats.find((item) => item.id === slug);

    if (!boat) {
      renderNotFound();
      return;
    }

    state.boat = boat;
    const mappedImage = getMappedImage(boat.id);
    state.images = mappedImage ? [mappedImage] : [];

    const bookingUrl = `../portal.html?boat=${encodeURIComponent(boat.id)}`;
    if (elements.primaryCta) elements.primaryCta.href = bookingUrl;
    if (elements.finalCta) elements.finalCta.href = bookingUrl;

    applyTranslations(state.lang);
  };

  state.lang = getSavedLang();
  applyTranslations(state.lang);

  elements.backBtn?.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '../boats.html';
    }
  });

  elements.langToggle?.addEventListener('click', () => {
    const next = state.lang === 'en' ? 'it' : 'en';
    persistLang(next);
    applyTranslations(next);
  });

  hydratePage().catch(() => renderNotFound());
})();
