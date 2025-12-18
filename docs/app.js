const state = {
  user: null,
};

const elements = {
  authTrigger: document.getElementById('authTrigger'),
  authModal: document.getElementById('authModal'),
  authCard: document.getElementById('authCard'),
  tabs: document.querySelectorAll('.tab'),
  tabPanels: document.querySelectorAll('.tab-panel'),
  loginEmail: document.getElementById('loginEmail'),
  loginPassword: document.getElementById('loginPassword'),
  loginFeedback: document.getElementById('loginFeedback'),
  registerName: document.getElementById('registerName'),
  registerEmail: document.getElementById('registerEmail'),
  registerPhone: document.getElementById('registerPhone'),
  registerPassword: document.getElementById('registerPassword'),
  registerFeedback: document.getElementById('registerFeedback'),
  userMenu: document.getElementById('userMenu'),
  userDisplayName: document.getElementById('userDisplayName'),
  logoutBtn: document.getElementById('logoutBtn'),
  openDemo: document.getElementById('openDemo'),
  demoModal: document.getElementById('demoModal'),
  galleryViewport: document.querySelector('.ig-carousel__viewport'),
  galleryTrack: document.getElementById('galleryTrack'),
  galleryNext: document.getElementById('galleryNext'),
  galleryDots: document.querySelectorAll('[data-gallery-dot]'),
  boatModal: document.getElementById('boatModal'),
  boatModalTitle: document.getElementById('boatModalTitle'),
  boatModalDesc: document.getElementById('boatModalDesc'),
  boatCarouselTrack: document.getElementById('boatCarouselTrack'),
  boatCarouselDots: document.getElementById('boatCarouselDots'),
  boatCarouselPrev: document.getElementById('boatCarouselPrev'),
  boatCarouselNext: document.getElementById('boatCarouselNext'),
};

let activeModal = null;
let lastFocusedElement = null;

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  const contentType = response.headers.get('content-type');
  const body = contentType && contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(body?.error || 'Richiesta non riuscita');
    error.status = response.status;
    throw error;
  }

  return body;
}

function resetFeedback(...nodes) {
  nodes.forEach((node) => {
    if (!node) return;
    node.textContent = '';
    node.classList.remove('success', 'error');
  });
}

function openModal(modal) {
  if (!modal || modal === activeModal) return;
  if (activeModal && activeModal !== modal) {
    closeModal(activeModal);
  }
  lastFocusedElement = document.activeElement;
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  activeModal = modal;
  const focusable = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
  focusable?.focus();
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  if (modal === elements.authModal) {
    resetFeedback(elements.loginFeedback, elements.registerFeedback);
    elements.authCard.reset();
    switchTab('login');
  }
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
  if (activeModal === modal) {
    activeModal = null;
  }
  lastFocusedElement = null;
}

function showFeedback(node, message, type = 'error') {
  if (!node) return;
  node.textContent = message;
  node.classList.remove('success', 'error');
  node.classList.add(type);
}

function buildInlineCarousel(card, {
  datasetKey = 'inlineImages',
  imgSelector = 'img',
  containerClass = 'card-carousel',
  interval = 3600,
} = {}) {
  const figure = card.querySelector('figure');
  const baseImg = figure?.querySelector(imgSelector);
  const altText = baseImg?.getAttribute('alt') || card.querySelector('h3')?.textContent || 'Foto';

  if (!figure || !baseImg) return;

  const dataValue = card.dataset?.[datasetKey] || '';
  const images = dataValue
    .split('|')
    .map((src) => src.trim())
    .filter(Boolean);

  if (!images.length && baseImg.getAttribute('src')) {
    images.push(baseImg.getAttribute('src'));
  }

  if (!images.length) return;

  const carousel = document.createElement('div');
  carousel.className = containerClass;

  baseImg.src = images[0];
  baseImg.loading = 'lazy';
  baseImg.classList.add('is-active');
  carousel.appendChild(baseImg);

  images.slice(1).forEach((src) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = altText;
    img.loading = 'lazy';
    carousel.appendChild(img);
  });

  figure.appendChild(carousel);

  const slides = carousel.querySelectorAll('img');
  if (slides.length < 2) return;

  let inlineIndex = 0;
  const showSlide = () => {
    slides.forEach((img, idx) => {
      img.classList.toggle('is-active', idx === inlineIndex);
    });
  };

  const rotate = () => {
    inlineIndex = (inlineIndex + 1) % slides.length;
    showSlide();
  };

  window.setInterval(rotate, interval);
}

function switchTab(tabName) {
  elements.tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  elements.tabPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.panel === tabName);
  });
}

function updateTopbar() {
  const userLogged = Boolean(state.user);
  if (elements.authTrigger) {
    elements.authTrigger.classList.toggle('hidden', userLogged);
  }
  if (elements.userMenu) {
    elements.userMenu.classList.toggle('hidden', !userLogged);
  }
  if (elements.userDisplayName) {
    elements.userDisplayName.textContent = userLogged
      ? (state.user.full_name || state.user.email)
      : '';
  }
}

async function handleLogin() {
  resetFeedback(elements.loginFeedback);
  const email = elements.loginEmail.value.trim();
  const password = elements.loginPassword.value;

  if (!email || !password) {
    showFeedback(elements.loginFeedback, 'Inserisci email e password.', 'error');
    return;
  }

  try {
    const { user } = await fetchJSON('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    state.user = user;
    closeModal(elements.authModal);
    updateTopbar();
  } catch (error) {
    showFeedback(elements.loginFeedback, error.message, 'error');
  }
}

async function handleRegister() {
  resetFeedback(elements.registerFeedback);
  const fullName = elements.registerName.value.trim();
  const email = elements.registerEmail.value.trim();
  const phone = elements.registerPhone.value.trim();
  const password = elements.registerPassword.value;

  if (!fullName || !email || !password) {
    showFeedback(elements.registerFeedback, 'Compila i campi obbligatori.', 'error');
    return;
  }

  try {
    const { user } = await fetchJSON('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName,
        email,
        phone,
        password,
      }),
    });
    state.user = user;
    closeModal(elements.authModal);
    updateTopbar();
  } catch (error) {
    showFeedback(elements.registerFeedback, error.message, 'error');
  }
}

async function handleLogout() {
  try {
    await fetchJSON('/api/logout', { method: 'POST' });
  } catch (error) {
    console.error('Errore logout', error);
  } finally {
    state.user = null;
    updateTopbar();
  }
}

const galleryCarouselState = {
  index: 0,
  position: 0,
  total: 0,
  autoplayTimer: null,
  prefersReducedMotion: false,
  isAnimating: false,
};

const boatCarouselState = {
  index: 0,
  images: [],
};

function initGalleryCarousel() {
  const track = elements.galleryTrack;
  const viewport = elements.galleryViewport;
  if (!track || !viewport || track.dataset.carouselReady === 'true') return;

  const originalSlides = Array.from(track.querySelectorAll('.ig-card'));
  if (!originalSlides.length) return;

  const nextBtn = elements.galleryNext;
  const dots = Array.from(elements.galleryDots || []);

  if (originalSlides.length === 1) {
    nextBtn?.setAttribute('hidden', 'true');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === 0);
      dot.setAttribute('aria-current', idx === 0 ? 'true' : 'false');
      if (idx > 0) dot.setAttribute('hidden', 'true');
    });
    return;
  }

  nextBtn?.removeAttribute('hidden');
  dots.forEach((dot) => dot.removeAttribute('hidden'));

  const baseTransition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

  track.querySelectorAll('.ig-card--clone').forEach((clone) => clone.remove());
  const firstClone = originalSlides[0].cloneNode(true);
  firstClone.classList.add('ig-card--clone');
  track.appendChild(firstClone);

  track.dataset.carouselReady = 'true';
  galleryCarouselState.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  galleryCarouselState.total = originalSlides.length;
  galleryCarouselState.index = 0;
  galleryCarouselState.position = 0;
  galleryCarouselState.isAnimating = false;

  const clearAutoplay = () => {
    if (galleryCarouselState.autoplayTimer) {
      window.clearInterval(galleryCarouselState.autoplayTimer);
      galleryCarouselState.autoplayTimer = null;
    }
  };

  const startAutoplay = () => {
    if (galleryCarouselState.prefersReducedMotion) return;
    clearAutoplay();
    galleryCarouselState.autoplayTimer = window.setInterval(() => {
      goNext();
    }, 6000);
  };

  const restartAutoplay = () => {
    clearAutoplay();
    startAutoplay();
  };

  const applyPosition = (withTransition = true) => {
    track.style.transition = withTransition ? baseTransition : 'none';
    galleryCarouselState.isAnimating = Boolean(withTransition);
    track.style.transform = `translateX(-${galleryCarouselState.position * 100}%)`;
    if (!withTransition) {
      galleryCarouselState.isAnimating = false;
    }
  };

  const updateDots = () => {
    dots.forEach((dot, idx) => {
      const isActive = idx === galleryCarouselState.index;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  const goToIndex = (targetIndex) => {
    if (galleryCarouselState.isAnimating) return;
    const sanitized = ((targetIndex % galleryCarouselState.total) + galleryCarouselState.total) % galleryCarouselState.total;
    galleryCarouselState.index = sanitized;
    galleryCarouselState.position = sanitized;
    applyPosition(false);
    updateDots();
    restartAutoplay();
  };

  const goNext = () => {
    if (galleryCarouselState.isAnimating) return;
    galleryCarouselState.position += 1;
    galleryCarouselState.index = galleryCarouselState.position % galleryCarouselState.total;
    applyPosition(true);
    updateDots();
    restartAutoplay();
  };

  track.addEventListener('transitionend', () => {
    galleryCarouselState.isAnimating = false;
    if (galleryCarouselState.position === galleryCarouselState.total) {
      galleryCarouselState.position = 0;
      galleryCarouselState.index = 0;
      applyPosition(false);
      updateDots();
    }
  });

  nextBtn?.addEventListener('click', goNext);

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = Number(dot.dataset.galleryDot);
      if (!Number.isNaN(target)) {
        goToIndex(target);
      }
    });
  });

  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      goNext();
    }
  });

  let startX = 0;
  let deltaX = 0;
  let isDragging = false;

  const startDrag = (event) => {
    isDragging = true;
    startX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
    deltaX = 0;
    applyPosition(false);
    clearAutoplay();
    viewport.classList.add('is-dragging');
  };

  const moveDrag = (event) => {
    if (!isDragging) return;
    const currentX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
    deltaX = currentX - startX;
    const percentage = (deltaX / viewport.offsetWidth) * 100;
    track.style.transform = `translateX(calc(-${galleryCarouselState.position * 100}% + ${percentage}%))`;
  };

  const endDrag = () => {
    if (!isDragging) return;
    if (Math.abs(deltaX) > viewport.offsetWidth * 0.18 && deltaX < 0) {
      goNext();
    } else {
      applyPosition(false);
      updateDots();
      restartAutoplay();
    }
    isDragging = false;
    startX = 0;
    deltaX = 0;
    viewport.classList.remove('is-dragging');
  };

  viewport.addEventListener('touchstart', startDrag, { passive: true });
  viewport.addEventListener('touchmove', moveDrag, { passive: true });
  viewport.addEventListener('touchend', endDrag);
  viewport.addEventListener('mousedown', (event) => {
    event.preventDefault();
    startDrag(event);
  });
  viewport.addEventListener('mousemove', moveDrag);
  viewport.addEventListener('mouseup', endDrag);
  viewport.addEventListener('mouseleave', endDrag);

  viewport.addEventListener('mouseenter', clearAutoplay);
  viewport.addEventListener('mouseleave', startAutoplay);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearAutoplay();
    } else {
      startAutoplay();
    }
  });

  window.addEventListener('resize', () => {
    applyPosition(false);
    requestAnimationFrame(() => {
      track.style.transition = baseTransition;
    });
  });

  applyPosition(false);
  updateDots();
  requestAnimationFrame(() => {
    track.style.transition = baseTransition;
  });
  startAutoplay();
}

function initBoatCards() {
  const cards = document.querySelectorAll('.boat-card');
  const modal = elements.boatModal;
  if (!cards.length) return;

  const prevBtn = elements.boatCarouselPrev;
  const nextBtn = elements.boatCarouselNext;
  const dotsWrapper = elements.boatCarouselDots;
  const track = elements.boatCarouselTrack;

  if (!modal) {
    cards.forEach((card) => buildInlineCarousel(card, {
      datasetKey: 'boatImages',
      imgSelector: '.boat-card__media img',
      containerClass: 'boat-card__carousel',
    }));
    return;
  }

  const updateDots = () => {
    if (!dotsWrapper) return;
    dotsWrapper.innerHTML = '';
    boatCarouselState.images.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = 'boat-carousel__dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Vai all'immagine ${idx + 1}`);
      dot.classList.toggle('is-active', idx === boatCarouselState.index);
      dot.addEventListener('click', () => {
        boatCarouselState.index = idx;
        applyPosition();
      });
      dotsWrapper.appendChild(dot);
    });
  };

  const applyPosition = () => {
    if (!track) return;
    track.style.transform = `translateX(-${boatCarouselState.index * 100}%)`;
    dotsWrapper?.querySelectorAll('.boat-carousel__dot').forEach((dot, idx) => {
      const isActive = idx === boatCarouselState.index;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  const changeSlide = (delta) => {
    if (!boatCarouselState.images.length) return;
    const total = boatCarouselState.images.length;
    boatCarouselState.index = (boatCarouselState.index + delta + total) % total;
    applyPosition();
  };

  const renderSlides = (title) => {
    if (!track) return;
    track.innerHTML = '';
    boatCarouselState.images.forEach((src, idx) => {
      const slide = document.createElement('div');
      slide.className = 'boat-carousel__slide';
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${title} · foto ${idx + 1}`;
      slide.appendChild(img);
      track.appendChild(slide);
    });
  };

  const openBoatModal = (card) => {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'it';
    const title = lang === 'en'
      ? (card.dataset.boatTitleEn || card.dataset.boatTitle || card.querySelector('h3')?.textContent || 'Boat detail')
      : (card.dataset.boatTitle || card.querySelector('h3')?.textContent || 'Dettaglio gommone');
    const desc = lang === 'en'
      ? (card.dataset.boatDescEn || card.dataset.boatDesc || card.querySelector('p')?.textContent || '')
      : (card.dataset.boatDesc || card.querySelector('p')?.textContent || '');
    const images = (card.dataset.boatImages || '')
      .split('|')
      .map((src) => src.trim())
      .filter(Boolean);
    const fallbackImg = card.querySelector('img')?.getAttribute('src');
    if (!images.length && fallbackImg) images.push(fallbackImg);

    boatCarouselState.index = 0;
    boatCarouselState.images = images;

    if (elements.boatModalTitle) elements.boatModalTitle.textContent = title;
    if (elements.boatModalDesc) elements.boatModalDesc.textContent = desc;

    renderSlides(title);
    updateDots();
    applyPosition();
    openModal(modal);
  };

  cards.forEach((card) => {
    buildInlineCarousel(card, {
      datasetKey: 'boatImages',
      imgSelector: '.boat-card__media img',
      containerClass: 'boat-card__carousel',
    });

    const handleOpen = () => openBoatModal(card);
    card.addEventListener('click', handleOpen);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleOpen();
      }
    });
  });

  prevBtn?.addEventListener('click', () => changeSlide(-1));
  nextBtn?.addEventListener('click', () => changeSlide(1));

  modal.querySelectorAll('[data-boat-close]').forEach((node) => {
    node.addEventListener('click', () => closeModal(modal));
  });
}

function initHomeCardCarousels() {
  const homeFleetCards = document.querySelectorAll('#boats .excursion-card');
  const excursionCards = document.querySelectorAll('#escursioni .excursion-card');

  [...homeFleetCards, ...excursionCards].forEach((card) => {
    buildInlineCarousel(card, {
      datasetKey: 'inlineImages',
      imgSelector: 'img',
      containerClass: 'card-carousel',
      interval: 3200,
    });
  });
}

async function checkSession() {
  try {
    const { user } = await fetchJSON('/api/session');
    state.user = user;
  } catch (error) {
    console.warn('Impossibile recuperare la sessione corrente:', error);
    state.user = null;
  } finally {
    updateTopbar();
  }
}

function initScrollReveal() {
  const reveals = document.querySelectorAll('.scroll-reveal');
  if (!reveals.length) return;

  if (!('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px',
  });

  reveals.forEach((el) => observer.observe(el));
}

function attachEventListeners() {
  const ensureDemoModal = () => {
    if (elements.demoModal) return;
    const modal = document.createElement('div');
    modal.className = 'modal hidden';
    modal.id = 'demoModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'demoModalTitle');
    modal.innerHTML = `
      <div class="modal-backdrop" data-close-modal></div>
      <div class="modal-window demo-window">
        <button class="modal-close" type="button" data-close-modal aria-label="Chiudi demo">&times;</button>
        <article>
          <h3 id="demoModalTitle">Accesso demo</h3>
          <p>Accedi come amministratore con le credenziali di default:</p>
          <pre>email: admin@tropeawavecharter.it
password: admin123</pre>
          <p>Ricorda di aggiornare password e utenti prima del go-live.</p>
          <button class="btn primary" type="button" data-close-modal>Ho capito</button>
        </article>
      </div>
    `;
    document.body.appendChild(modal);
    elements.demoModal = modal;
  };

  const openAuthModal = () => openModal(elements.authModal);
  ensureDemoModal();

  elements.authTrigger?.addEventListener('click', openAuthModal);

  elements.tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  elements.authCard?.addEventListener('submit', (event) => {
    event.preventDefault();
    const activeTab = [...elements.tabs].find((tab) => tab.classList.contains('active'))?.dataset.tab;
    if (activeTab === 'register') {
      handleRegister();
    } else {
      handleLogin();
    }
  });

  elements.logoutBtn?.addEventListener('click', handleLogout);

  document.querySelectorAll('[data-open-demo]').forEach((trigger) => {
    trigger.addEventListener('click', () => openModal(elements.demoModal));
  });

  document.querySelectorAll('[data-close-modal]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const modal = trigger.closest('.modal');
      if (modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeModal) {
      closeModal(activeModal);
    }
  });

  const menuToggle = document.getElementById('menuToggle');
  const primaryNav = document.getElementById('primaryNav');
  const topbarActions = document.querySelector('.topbar__actions');

  if (menuToggle && primaryNav && topbarActions) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      const nextState = !expanded;
      menuToggle.setAttribute('aria-expanded', String(nextState));
      primaryNav.classList.toggle('is-open', nextState);
      topbarActions.classList.toggle('is-open', nextState);
    });

    primaryNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        primaryNav.classList.remove('is-open');
        topbarActions.classList.remove('is-open');
      });
    });

    const desktopQuery = window.matchMedia('(min-width: 1025px)');
    const handleViewportChange = () => {
      if (desktopQuery.matches) {
        menuToggle.setAttribute('aria-expanded', 'false');
        primaryNav.classList.remove('is-open');
        topbarActions.classList.remove('is-open');
      }
    };

    desktopQuery.addEventListener('change', handleViewportChange);
    handleViewportChange();
  }

  document.querySelectorAll('a[href^="index.html#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const [, hash] = link.getAttribute('href').split('#');
      if (!hash) return;
      const isHome = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html');
      if (!isHome) return;
      const target = document.getElementById(hash);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  attachEventListeners();
  initGalleryCarousel();
  initBoatCards();
  initHomeCardCarousels();
  initScrollReveal();
  await checkSession();
});
