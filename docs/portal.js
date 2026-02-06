const state = {
  user: null,
  catalog: {
    boats: [],
    tours: [],
  },
  bookings: [],
  adminBookings: [],
  staffNotes: [],
  staffNoteQuery: '',
  staffNotePins: new Set(),
  calendar: {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    selectedDay: null,
  },
  staffNoteEditingId: null,
  stats: {
    total: 0,
    pending: 0,
    todayTours: 0,
  },
  filters: {
    type: 'all',
    status: 'all',
  },
};

const portalPage = document.body?.dataset?.portalPage || 'booking';
const isDashboardPage = portalPage === 'dashboard';
const isBookingPage = portalPage === 'booking';
const LANG_STORAGE_KEY = 'siteLang';
const TOUR_SCHEDULE = {
  'Costa degli Dei Explorer': '09:00',
  'Capo Vaticano Sunset Romance': '18:00',
  'Parghelia · Zambrone · Briatico': '09:30',
};

const optionTranslations = {
  select: { it: 'Seleziona', en: 'Select' },
  selectBoat: { it: 'Seleziona gommone', en: 'Select boat' },
  selectTour: { it: 'Seleziona escursione', en: 'Select excursion' },
  rental: { it: 'Noleggio gommone', en: 'RIB rental' },
  tour: { it: 'Escursione guidata', en: 'Guided excursion' },
};

const boatLabelTranslations = {
  'Gommone senza patente (2 posti)': 'No-license RIB (2 seats)',
  'ZAR 65 (9/10 posti)': 'ZAR 65 (9/10 seats)',
  'ZAR 53 (8 posti)': 'ZAR 53 (8 seats)',
  'ZAR 49 (6 posti)': 'ZAR 49 (6 seats)',
};

const boatFeatureTranslations = {
  'Senza patente': 'No license',
  'Stereo bluetooth': 'Bluetooth stereo',
  'GPS cartografico': 'Chartplotter GPS',
  Ecoscandaglio: 'Fishfinder',
  '2 posti': '2 seats',
  Doccia: 'Shower',
  'GPS cartografico': 'Chartplotter GPS',
  Tendalino: 'Bimini top',
  'Ancora elettrica': 'Electric anchor',
  '9/10 posti comodi': '9/10 comfy seats',
  '8 posti comodi': '8 comfy seats',
  '6 posti comodi': '6 comfy seats',
  Ancora: 'Anchor',
  Ecoscandaglio: 'Fishfinder',
};

const tourLabelTranslations = {
  'Costa degli Dei Explorer': 'Coast of the Gods Explorer',
  'Capo Vaticano Sunset Romance': 'Capo Vaticano Sunset Romance',
  'Parghelia · Zambrone · Briatico': 'Parghelia · Zambrone · Briatico',
};

const tourFeatureTranslations = {
  '3 ore tra Tropea e Capo Vaticano': '3-hour route between Tropea and Capo Vaticano',
  'Snorkeling allo Scoglio di Riaci': 'Snorkeling at Riaci Rock',
  'Soste in calette accessibili solo via mare': 'Stops in coves reachable only by sea',
  'Tour al tramonto': 'Sunset cruise',
  'Grotta degli Innamorati': 'Lovers’ Cave',
  'Aperitivo romantico a bordo': 'Romantic aperitif on board',
  '3 ore di tour personalizzato': '3-hour custom tour',
  'Vardanello, Michelino e Baia della Tonnara': 'Vardanello, Michelino and Baia della Tonnara',
  'Snorkeling e acque trasparenti': 'Snorkeling and crystal waters',
};

const STATUS_META = {
  'da confermare': { tone: 'pending', label: { it: 'Da confermare', en: 'Pending' } },
  confermato: { tone: 'confirmed', label: { it: 'Confermato', en: 'Confirmed' } },
  completato: { tone: 'completed', label: { it: 'Completato', en: 'Completed' } },
  annullato: { tone: 'canceled', label: { it: 'Annullato', en: 'Canceled' } },
};

const SERVICE_LABELS = {
  noleggio: { it: 'Noleggio gommone', en: 'RIB rental' },
  escursione: { it: 'Escursione guidata', en: 'Guided excursion' },
};

const INCLUDED_COPY = {
  noleggio: {
    it: 'Briefing, tendalino, doccia, GPS/eco, dotazioni sicurezza.',
    en: 'Briefing, canopy, shower, GPS/fishfinder, safety gear.',
  },
  escursione: {
    it: 'Skipper, soste programmate, snorkeling kit e briefing di bordo.',
    en: 'Skipper, planned stops, snorkeling kit, onboard briefing.',
  },
};

const SUMMARY_LABELS = {
  contact: { it: 'Contatto', en: 'Contact' },
  service: { it: 'Servizio', en: 'Service' },
  date: { it: 'Data', en: 'Date' },
  time: { it: 'Partenza', en: 'Departure' },
  endTime: { it: 'Rientro', en: 'Return' },
  guests: { it: 'Ospiti', en: 'Guests' },
  notes: { it: 'Note', en: 'Notes' },
};

const FORM_LIMITS = {
  minPeople: 1,
  maxPeople: 12,
  minTime: '08:00',
  maxTime: '20:00',
};

const STAFF_PINS_KEY = 'staffNotePins';
const TOAST_DURATION = 4200;

const elements = {
  portalModal: document.getElementById('portalAuthModal'),
  portalCloseTriggers: Array.from(document.querySelectorAll('#portalAuthModal [data-close-modal]')),
  portalTabs: Array.from(document.querySelectorAll('#portalAuthModal .tab')),
  portalTabPanels: Array.from(document.querySelectorAll('#portalAuthModal [data-panel]')),
  authForm: document.getElementById('portalAuthCard'),
  loginEmail: document.getElementById('portalLoginEmail'),
  loginPassword: document.getElementById('portalLoginPassword'),
  loginFeedback: document.getElementById('portalLoginFeedback'),
  registerName: document.getElementById('portalRegisterName'),
  registerEmail: document.getElementById('portalRegisterEmail'),
  registerPhone: document.getElementById('portalRegisterPhone'),
  registerPassword: document.getElementById('portalRegisterPassword'),
  registerFeedback: document.getElementById('portalRegisterFeedback'),
  portalAuthTrigger: document.getElementById('portalAuthTrigger'),
  logoutBtn: document.getElementById('portalLogout'),
  topUserName: document.getElementById('topUserName'),
  topUserRole: document.getElementById('topUserRole'),
  clientArea: document.getElementById('clientArea'),
  adminArea: document.getElementById('adminArea'),
  adminGuard: document.getElementById('adminGuard'),
  guardLogin: document.getElementById('openAuthFromGuard'),
  bookingForm: document.getElementById('bookingForm'),
  bookingFeedback: document.getElementById('bookingFeedback'),
  bookingRecap: document.getElementById('bookingRecap'),
  bookingRecapList: document.getElementById('bookingRecapList'),
  bookingRecapStatus: document.getElementById('bookingRecapStatus'),
  bookingSubmit: document.getElementById('bookingSubmit'),
  peopleInput: document.getElementById('bookingPeople'),
  peopleHint: document.getElementById('peopleHint'),
  serviceType: document.getElementById('serviceType'),
  boatField: document.getElementById('boatField'),
  boatModel: document.getElementById('boatModel'),
  tourField: document.getElementById('tourField'),
  tour: document.getElementById('tour'),
  endTimeField: document.getElementById('endTimeField'),
  boatSummary: document.getElementById('boatSummary'),
  tourSummary: document.getElementById('tourSummary'),
  clientBookings: document.getElementById('clientBookings'),
  refreshClientBookings: document.getElementById('refreshClientBookings'),
  adminFilterType: document.getElementById('adminFilterType'),
  adminFilterStatus: document.getElementById('adminFilterStatus'),
  adminFilterChips: document.getElementById('adminFilterChips'),
  adminResetFilters: document.getElementById('adminResetFilters'),
  adminRefresh: document.getElementById('adminRefresh'),
  adminStatTotal: document.getElementById('adminStatTotal'),
  adminStatToday: document.getElementById('adminStatToday'),
  adminTableBody: document.getElementById('adminTableBody'),
  adminNavLinks: Array.from(document.querySelectorAll('[data-role="admin"]')),
  calendarGrid: document.getElementById('calendarGrid'),
  calendarTitle: document.getElementById('calendarTitle'),
  calendarPrev: document.getElementById('calendarPrev'),
  calendarNext: document.getElementById('calendarNext'),
  calendarDayLabel: document.getElementById('calendarDayLabel'),
  calendarDayList: document.getElementById('calendarDayList'),
  staffNotesList: document.getElementById('staffNotesList'),
  staffNoteForm: document.getElementById('staffNoteForm'),
  staffNoteInput: document.getElementById('staffNoteInput'),
  staffNoteFeedback: document.getElementById('staffNoteFeedback'),
  staffNoteSave: document.getElementById('staffNoteSave'),
  staffNoteCancel: document.getElementById('staffNoteCancel'),
  addStaffNote: document.getElementById('addStaffNote'),
  staffNoteSearch: document.getElementById('staffNoteSearch'),
  bookingDetailModal: document.getElementById('bookingDetailModal'),
  bookingDetailContent: document.getElementById('bookingDetailContent'),
  portalGuard: document.getElementById('portalGuard'),
  toastContainer: document.getElementById('toastContainer'),
};

function getCurrentLang() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'it') return saved;
  } catch (_) {}
  return document.documentElement.lang === 'en' ? 'en' : 'it';
}

function getLocale() {
  return getCurrentLang() === 'en' ? 'en-GB' : 'it-IT';
}

function translateFromMap(map, key, fallback = '') {
  const lang = getCurrentLang();
  if (!key || !map[key]) return fallback;
  return map[key][lang] || map[key].it || fallback;
}

function getStatusMeta(status) {
  const meta = STATUS_META[status] || null;
  if (!meta) {
    return { tone: 'default', label: status || '' };
  }
  const lang = getCurrentLang();
  const label = meta.label?.[lang] || meta.label?.it || status;
  return { tone: meta.tone, label };
}

function getServiceLabel(serviceType) {
  return translateFromMap(SERVICE_LABELS, serviceType, serviceType || '');
}

function getIncludedCopy(serviceType) {
  return translateFromMap(INCLUDED_COPY, serviceType, '');
}

function getSummaryLabel(key) {
  return translateFromMap(SUMMARY_LABELS, key, key);
}

function createStatusBadgeElement(status) {
  const meta = getStatusMeta(status);
  const badge = document.createElement('span');
  badge.className = `status-pill status-pill--${meta.tone}`;
  badge.textContent = meta.label;
  return badge;
}

function translateOption(key) {
  const lang = getCurrentLang();
  return optionTranslations[key]?.[lang] || optionTranslations[key]?.it || '';
}

function translateBoatLabel(label) {
  const lang = getCurrentLang();
  if (lang !== 'en') return label;
  return boatLabelTranslations[label] || label;
}

function translateBoatFeature(feature) {
  const lang = getCurrentLang();
  if (lang !== 'en') return feature;
  return boatFeatureTranslations[feature] || feature;
}

function translateTourLabel(label) {
  const lang = getCurrentLang();
  if (lang !== 'en') return label;
  return tourLabelTranslations[label] || label;
}

function translateTourFeature(feature) {
  const lang = getCurrentLang();
  if (lang !== 'en') return feature;
  return tourFeatureTranslations[feature] || feature;
}

function toggleHidden(node, shouldHide) {
  if (!node) return;
  node.classList.toggle('hidden', shouldHide);
}

function getSelectedBoat() {
  return findBoatByValue(elements.boatModel?.value);
}

function getSelectedTour() {
  return findTourByValue(elements.tour?.value);
}

function findBoatByValue(value) {
  if (!value) return null;
  return state.catalog.boats.find((boat) => boat.label === value || boat.id === value) || null;
}

function findTourByValue(value) {
  if (!value) return null;
  return state.catalog.tours.find((tour) => tour.label === value || tour.id === value) || null;
}

function extractNumbersFromText(text = '') {
  const matches = String(text).match(/\d+/g);
  if (!matches) return [];
  return matches.map((value) => Number(value)).filter((value) => Number.isFinite(value));
}

function extractCapacityFromText(text = '') {
  const normalized = String(text).toLowerCase();
  const matches = [];
  const regex = /(\d+)\s*(?:\/\s*(\d+))?\s*(posti|seats)/g;
  let match = regex.exec(normalized);
  while (match) {
    matches.push(Number(match[1]));
    if (match[2]) matches.push(Number(match[2]));
    match = regex.exec(normalized);
  }
  return matches.filter((value) => Number.isFinite(value));
}

function inferMaxPeopleFromBoat(boat) {
  if (!boat) return null;
  const explicit = Number(boat.maxPeople ?? boat.max_people ?? boat.capacity);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const capacityMatches = [
    ...extractCapacityFromText(boat.label),
    ...(boat.features || []).flatMap((feature) => extractCapacityFromText(feature)),
  ];
  if (capacityMatches.length) {
    return Math.max(...capacityMatches);
  }
  const fallbackCandidates = [
    ...extractNumbersFromText(boat.label),
    ...(boat.features || []).flatMap((feature) => extractNumbersFromText(feature)),
  ].filter((value) => value > 0 && value <= 20);
  if (!fallbackCandidates.length) return null;
  return Math.max(...fallbackCandidates);
}

function inferMaxPeopleFromTour(tour) {
  if (!tour) return null;
  const explicit = Number(tour.maxPeople ?? tour.max_people ?? tour.capacity);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const capacityMatches = [
    ...extractCapacityFromText(tour.label),
    ...(tour.features || []).flatMap((feature) => extractCapacityFromText(feature)),
  ];
  if (capacityMatches.length) {
    return Math.max(...capacityMatches);
  }
  const fallbackCandidates = [
    ...extractNumbersFromText(tour.label),
    ...(tour.features || []).flatMap((feature) => extractNumbersFromText(feature)),
  ].filter((value) => value > 0 && value <= 20);
  if (!fallbackCandidates.length) return null;
  return Math.max(...fallbackCandidates);
}

function resolvePeopleLimits({ serviceType, boatValue, tourValue } = {}) {
  const min = FORM_LIMITS.minPeople;
  let max = FORM_LIMITS.maxPeople;

  if (serviceType === 'noleggio') {
    const boat = findBoatByValue(boatValue);
    const inferred = inferMaxPeopleFromBoat(boat);
    if (Number.isFinite(inferred)) {
      max = Math.min(inferred, FORM_LIMITS.maxPeople);
    }
  } else if (serviceType === 'escursione') {
    const tour = findTourByValue(tourValue);
    const inferred = inferMaxPeopleFromTour(tour);
    if (Number.isFinite(inferred)) {
      max = Math.min(inferred, FORM_LIMITS.maxPeople);
    }
  }

  return { min, max };
}

function getPeopleMessages(min, max) {
  const lang = getCurrentLang();
  const t = (it, en) => (lang === 'en' ? en : it);
  return {
    invalid: t('Inserisci un numero valido.', 'Enter a valid number.'),
    min: t(`Minimo: ${min} persona${min === 1 ? '' : 'e'}.`, `Minimum: ${min} guest${min === 1 ? '' : 's'}.`),
    max: t(`Massimo: ${max} persone (incl. bambini).`, `Maximum: ${max} people (incl. children).`),
  };
}

function getPeopleHintText({ serviceType, boatValue, tourValue, max }) {
  const lang = getCurrentLang();
  const t = (it, en) => (lang === 'en' ? en : it);
  if (!serviceType) {
    return t('Seleziona un servizio per vedere il massimo.', 'Select a service to see the maximum.');
  }
  if (serviceType === 'noleggio' && !boatValue) {
    return t('Seleziona il gommone per vedere il massimo.', 'Select the boat to see the maximum.');
  }
  return t(`Massimo: ${max} persone (incl. bambini).`, `Maximum: ${max} people (incl. children).`);
}

function syncPeopleConstraints() {
  const input = elements.peopleInput || elements.bookingForm?.elements?.people;
  if (!input) return;
  const serviceType = elements.serviceType?.value || '';
  const boatValue = elements.boatModel?.value || '';
  const tourValue = elements.tour?.value || '';
  const { min, max } = resolvePeopleLimits({ serviceType, boatValue, tourValue });
  const placeholder = getCurrentLang() === 'en' ? 'Select' : 'Seleziona';

  input.min = String(min);
  input.max = String(max);
  input.step = '1';
  input.setAttribute('placeholder', placeholder);

  if (elements.peopleHint) {
    elements.peopleHint.textContent = getPeopleHintText({ serviceType, boatValue, tourValue, max });
  }

  const rawValue = input.value.trim();
  if (!rawValue) {
    setFieldError('people', '');
    return;
  }

  const numericValue = Number(rawValue);
  const messages = getPeopleMessages(min, max);
  if (!Number.isFinite(numericValue)) {
    setFieldError('people', messages.invalid);
    return;
  }

  let clamped = numericValue;
  let errorMessage = '';
  if (numericValue < min) {
    clamped = min;
    errorMessage = messages.min;
  } else if (numericValue > max) {
    clamped = max;
    errorMessage = messages.max;
  }

  if (clamped !== numericValue) {
    input.value = String(clamped);
  }
  setFieldError('people', errorMessage);
}

function adjustPeopleValue(delta) {
  const input = elements.peopleInput || elements.bookingForm?.elements?.people;
  if (!input) return;
  const current = Number(input.value);
  const nextValue = Number.isFinite(current) ? current + delta : FORM_LIMITS.minPeople;
  input.value = String(nextValue);
  syncPeopleConstraints();
  updateBookingRecap();
}

function renderBoatSummary() {
  if (!elements.boatSummary) return;
  const boat = getSelectedBoat();
  if (!boat || elements.serviceType?.value !== 'noleggio') {
    elements.boatSummary.innerHTML = '';
    toggleHidden(elements.boatSummary, true);
    return;
  }

  const featuresList = (boat.features || []).map((item) => `<li>${translateBoatFeature(item)}</li>`).join('');
  const boatLabel = translateBoatLabel(boat.label);
  elements.boatSummary.innerHTML = `
    <div class="boat-summary__media">
      <img src="${boat.image}" alt="${boatLabel}" loading="lazy">
    </div>
    <div class="boat-summary__body">
      <h4>${boatLabel}</h4>
      <p class="boat-summary__meta">${boat.power || ''}</p>
      ${featuresList ? `<ul class="boat-summary__features">${featuresList}</ul>` : ''}
    </div>
  `;
  toggleHidden(elements.boatSummary, false);
}

function renderTourSummary() {
  if (!elements.tourSummary) return;
  const isTour = elements.serviceType?.value === 'escursione';
  const tour = getSelectedTour();
  if (!isTour || !tour) {
    elements.tourSummary.innerHTML = '';
    toggleHidden(elements.tourSummary, true);
    return;
  }

  const featuresList = (tour.features || []).map((item) => `<li>${translateTourFeature(item)}</li>`).join('');
  const tourLabel = translateTourLabel(tour.label);
  const timeInfo = tour.time ? `<p class="tour-summary__meta">${getCurrentLang() === 'en' ? 'Departure' : 'Partenza'}: ${tour.time}</p>` : '';
  elements.tourSummary.innerHTML = `
    <div class="tour-summary__media">
      <img src="${tour.image}" alt="${tourLabel}" loading="lazy">
    </div>
    <div class="tour-summary__body">
      <h4>${tourLabel}</h4>
      ${timeInfo}
      ${featuresList ? `<ul class="tour-summary__features">${featuresList}</ul>` : ''}
    </div>
  `;
  toggleHidden(elements.tourSummary, false);
}

function enforceExcursionTime() {
  const timeInput = elements.bookingForm?.elements?.time;
  if (!timeInput) return;

  const isTour = elements.serviceType?.value === 'escursione';
  if (!isTour) {
    timeInput.readOnly = false;
    timeInput.value = timeInput.value || '';
    renderTourSummary();
    syncTimeConstraints();
    updateBookingRecap();
    return;
  }

  const selectedTour = elements.tour?.value;
  const fixedTime = selectedTour && TOUR_SCHEDULE[selectedTour] ? TOUR_SCHEDULE[selectedTour] : '09:00';
  timeInput.value = fixedTime;
  timeInput.readOnly = true;
  renderTourSummary();
  syncTimeConstraints();
  updateBookingRecap();
}

function shiftCalendarMonth(delta) {
  const date = new Date(state.calendar.year, state.calendar.month + delta, 1);
  state.calendar.year = date.getFullYear();
  state.calendar.month = date.getMonth();
  state.calendar.selectedDay = `${state.calendar.year}-${String(state.calendar.month + 1).padStart(2, '0')}-01`;
  renderCalendar();
}

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

function showFeedback(node, message, type = 'error') {
  if (!node) return;
  node.textContent = message;
  node.classList.remove('success', 'error');
  node.classList.add(type);
}

function showToast(message, type = 'info') {
  if (!elements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, TOAST_DURATION);
}

let activePortalTab = 'login';
let lastFocusedElement = null;

function switchPortalTab(tabName) {
  activePortalTab = tabName;
  elements.portalTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  elements.portalTabPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.panel === tabName);
  });
}

function focusPortalField(tabName) {
  if (tabName === 'register') {
    elements.registerName?.focus();
  } else {
    elements.loginEmail?.focus();
  }
}

function openPortalModal(tabName = 'login') {
  if (!elements.portalModal) return;
  const wasHidden = elements.portalModal.classList.contains('hidden');
  if (wasHidden) {
    lastFocusedElement = document.activeElement;
    elements.portalModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    resetFeedback(elements.loginFeedback, elements.registerFeedback);
    elements.authForm?.reset();
  }
  switchPortalTab(tabName);
  focusPortalField(tabName);
}

function closePortalModal() {
  if (!elements.portalModal || elements.portalModal.classList.contains('hidden')) {
    return;
  }
  elements.portalModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  resetFeedback(elements.loginFeedback, elements.registerFeedback);
  elements.authForm?.reset();
  switchPortalTab('login');
  updateUserUI();
  let focusTarget = null;
  if (state.user && elements.logoutBtn && !elements.logoutBtn.classList.contains('hidden') && elements.logoutBtn.offsetParent) {
    focusTarget = elements.logoutBtn;
  } else if (!state.user && elements.portalAuthTrigger?.offsetParent) {
    focusTarget = elements.portalAuthTrigger;
  } else {
    focusTarget = lastFocusedElement;
  }
  focusTarget?.focus();
  lastFocusedElement = null;
}

function formatRole(role) {
  if (role === 'admin') return 'Admin';
  return 'Cliente';
}

function initialsFromName(name = '') {
  const parts = name.trim().split(/\s+/);
  if (!parts.length || !parts[0]) return '⛵';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function prefillBookingContact() {
  if (!elements.bookingForm) return;

  const nameInput = elements.bookingForm.elements.customerName;
  const phoneInput = elements.bookingForm.elements.phone;

  if (nameInput) {
    if (state.user?.full_name) {
      nameInput.value = state.user.full_name;
      nameInput.setAttribute('readonly', 'readonly');
    } else if (state.user) {
      nameInput.value = state.user.email || '';
      nameInput.removeAttribute('readonly');
    } else {
      nameInput.value = '';
      nameInput.removeAttribute('readonly');
    }
  }

  if (phoneInput) {
    if (state.user?.phone) {
      phoneInput.value = state.user.phone;
      phoneInput.setAttribute('readonly', 'readonly');
    } else {
      if (!state.user) {
        phoneInput.value = '';
      }
      phoneInput.removeAttribute('readonly');
    }
  }

  updateBookingRecap();
}

function setButtonLoading(button, isLoading, loadingText = '') {
  if (!button) return;
  if (isLoading) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }
    if (loadingText) {
      button.textContent = loadingText;
    }
    button.classList.add('is-loading');
    button.disabled = true;
    return;
  }
  button.classList.remove('is-loading');
  button.disabled = false;
  if (button.dataset.originalText) {
    button.textContent = button.dataset.originalText;
    delete button.dataset.originalText;
  }
}

function normalizePhone(value = '') {
  let cleaned = value.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = `+${cleaned.slice(2)}`;
  }
  return cleaned;
}

function formatPhone(value = '') {
  const normalized = normalizePhone(value);
  const digits = normalized.replace(/\D/g, '');
  if (!digits) return '';
  if (normalized.startsWith('+')) {
    const match = normalized.match(/^\+\d{1,3}/);
    const country = match ? match[0] : '+';
    const countryDigits = country.replace('+', '');
    const rest = digits.slice(countryDigits.length);
    const grouped = rest.replace(/(\d{3})(?=\d)/g, '$1 ');
    return `${country} ${grouped}`.trim();
  }
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}

function isValidPhone(value = '') {
  const digits = normalizePhone(value).replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

function timeToMinutes(value = '') {
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function isDateInPast(dateStr = '') {
  if (!dateStr) return false;
  const selected = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(selected.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected < today;
}

function getFieldWrapper(fieldName) {
  return elements.bookingForm?.querySelector(`[data-field="${fieldName}"]`);
}

function setFieldError(fieldName, message = '') {
  const wrapper = getFieldWrapper(fieldName);
  if (!wrapper) return;
  const errorNode = wrapper.querySelector('.field__error');
  const control = wrapper.querySelector('input, select, textarea');
  if (errorNode) errorNode.textContent = message;
  wrapper.classList.toggle('is-error', Boolean(message));
  if (control) {
    if (message) {
      control.setAttribute('aria-invalid', 'true');
    } else {
      control.removeAttribute('aria-invalid');
    }
  }
}

function clearAllFieldErrors() {
  if (!elements.bookingForm) return;
  elements.bookingForm.querySelectorAll('.field').forEach((field) => {
    field.classList.remove('is-error');
    const errorNode = field.querySelector('.field__error');
    if (errorNode) errorNode.textContent = '';
    const control = field.querySelector('input, select, textarea');
    control?.removeAttribute('aria-invalid');
  });
}

function validateBookingPayload(payload = {}) {
  const lang = getCurrentLang();
  const t = (it, en) => (lang === 'en' ? en : it);
  const errors = {};
  const nameValue = (payload.customerName || '').trim();
  const phoneValue = (payload.phone || '').trim();

  if (!nameValue) {
    errors.customerName = t('Inserisci il nome del referente.', 'Enter the contact name.');
  }

  if (!phoneValue) {
    errors.phone = t('Inserisci un numero di telefono.', 'Enter a phone number.');
  } else if (!isValidPhone(phoneValue)) {
    errors.phone = t('Numero non valido. Usa solo cifre e prefisso.', 'Invalid phone number. Use digits and country code.');
  }

  if (!payload.serviceType) {
    errors.serviceType = t('Seleziona il tipo di servizio.', 'Select a service type.');
  }

  if (!payload.date) {
    errors.date = t('Seleziona una data.', 'Select a date.');
  } else if (isDateInPast(payload.date)) {
    errors.date = t('La data non può essere nel passato.', 'Date cannot be in the past.');
  }

  if (!payload.time) {
    errors.time = t('Indica l\'orario di partenza.', 'Select a departure time.');
  } else {
    const timeValue = timeToMinutes(payload.time);
    const minTime = timeToMinutes(FORM_LIMITS.minTime);
    const maxTime = timeToMinutes(FORM_LIMITS.maxTime);
    if (timeValue !== null && (timeValue < minTime || timeValue > maxTime)) {
      errors.time = t('Orario fuori fascia 08:00 - 20:00.', 'Time must be between 08:00 and 20:00.');
    }
  }

  if (payload.serviceType === 'noleggio') {
    if (!payload.boatModel) {
      errors.boatModel = t('Seleziona il gommone per il noleggio.', 'Select the RIB for rental.');
    }
    if (!payload.endTime) {
      errors.endTime = t('Indica l\'orario di rientro.', 'Add the expected return time.');
    } else {
      const startMinutes = timeToMinutes(payload.time);
      const endMinutes = timeToMinutes(payload.endTime);
      const maxTime = timeToMinutes(FORM_LIMITS.maxTime);
      if (startMinutes !== null && endMinutes !== null && endMinutes <= startMinutes) {
        errors.endTime = t('Il rientro deve essere successivo alla partenza.', 'Return time must be after departure.');
      } else if (endMinutes !== null && maxTime !== null && endMinutes > maxTime) {
        errors.endTime = t('Il rientro deve essere entro le 20:00.', 'Return time must be by 20:00.');
      }
    }
  }

  if (payload.serviceType === 'escursione' && !payload.tour) {
    errors.tour = t('Seleziona l\'itinerario dell\'escursione.', 'Select the excursion itinerary.');
  }

  const peopleValue = Number(payload.people);
  const { min: peopleMin, max: peopleMax } = resolvePeopleLimits({
    serviceType: payload.serviceType,
    boatValue: payload.boatModel,
    tourValue: payload.tour,
  });
  const peopleMessages = getPeopleMessages(peopleMin, peopleMax);
  if (!Number.isFinite(peopleValue)) {
    errors.people = peopleMessages.invalid;
  } else if (peopleValue < peopleMin || peopleValue > peopleMax) {
    errors.people = peopleValue < peopleMin ? peopleMessages.min : peopleMessages.max;
  }

  const normalizedPayload = {
    ...payload,
    customerName: nameValue,
    phone: normalizePhone(payload.phone || ''),
    people: Number.isFinite(peopleValue) ? peopleValue : payload.people,
    notes: payload.notes?.trim() || '',
  };

  return { errors, normalizedPayload };
}

function updateBookingRecap() {
  if (!elements.bookingForm || !elements.bookingRecapList) return;
  const form = elements.bookingForm;
  const name = form.elements.customerName?.value.trim() || '';
  const phone = form.elements.phone?.value.trim() || '';
  const serviceType = form.elements.serviceType?.value || '';
  const boat = form.elements.boatModel?.value || '';
  const tour = form.elements.tour?.value || '';
  const date = form.elements.date?.value || '';
  const time = form.elements.time?.value || '';
  const endTime = form.elements.endTime?.value || '';
  const people = form.elements.people?.value || '';
  const notes = form.elements.notes?.value.trim() || '';

  const serviceDetail = serviceType === 'noleggio' ? boat : serviceType === 'escursione' ? tour : '';
  const serviceLabel = serviceType ? `${getServiceLabel(serviceType)}${serviceDetail ? ` · ${serviceDetail}` : ''}` : '—';

  const formattedPhone = formatPhone(phone) || phone;
  const summaryItems = [
    { label: getSummaryLabel('contact'), value: [name, formattedPhone].filter(Boolean).join(' · ') || '—' },
    { label: getSummaryLabel('service'), value: serviceLabel || '—' },
    { label: getSummaryLabel('date'), value: date ? formatDateLabel(date) : '—' },
    { label: getSummaryLabel('time'), value: time || '—' },
  ];

  if (serviceType === 'noleggio') {
    summaryItems.push({ label: getSummaryLabel('endTime'), value: endTime || '—' });
  }

  summaryItems.push({ label: getSummaryLabel('guests'), value: people || '—' });
  summaryItems.push({ label: getSummaryLabel('notes'), value: notes || '—' });

  elements.bookingRecapList.innerHTML = summaryItems
    .map((item) => `<div class="booking-recap__item"><span>${item.label}</span><strong>${item.value}</strong></div>`)
    .join('');

  const missingRequired = !name || !phone || !serviceType || !date || !time
    || (serviceType === 'noleggio' && (!boat || !endTime))
    || (serviceType === 'escursione' && !tour);
  if (elements.bookingRecapStatus) {
    elements.bookingRecapStatus.textContent = missingRequired
      ? (getCurrentLang() === 'en'
        ? 'Complete required fields to send your request.'
        : 'Completa i campi obbligatori per inviare la richiesta.')
      : '';
  }
}

function syncTimeConstraints() {
  if (!elements.bookingForm) return;
  const timeInput = elements.bookingForm.elements.time;
  const endInput = elements.bookingForm.elements.endTime;
  if (timeInput) {
    timeInput.min = FORM_LIMITS.minTime;
    timeInput.max = FORM_LIMITS.maxTime;
  }
  if (endInput) {
    endInput.min = timeInput?.value || FORM_LIMITS.minTime;
    endInput.max = FORM_LIMITS.maxTime;
  }
}

function applyDateConstraints() {
  if (!elements.bookingForm) return;
  const dateInput = elements.bookingForm.elements.date;
  if (!dateInput) return;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  dateInput.min = today;
  if (dateInput.value && dateInput.value < today) {
    dateInput.value = today;
  }
}

function handleBookingFormInput(event) {
  const fieldName = event?.target?.name;
  if (!fieldName) return;
  if (fieldName === 'people') {
    syncPeopleConstraints();
  } else {
    setFieldError(fieldName, '');
  }
  if (fieldName === 'time') {
    syncTimeConstraints();
  }
  updateBookingRecap();
}

function handlePhoneBlur(event) {
  const input = event?.target;
  if (!input || input.name !== 'phone') return;
  const formatted = formatPhone(input.value);
  if (formatted) {
    input.value = formatted;
  }
  updateBookingRecap();
}

function updateUserUI() {
  const isLoggedIn = Boolean(state.user);
  const isAdmin = state.user?.role === 'admin';
  const displayName = state.user?.full_name || state.user?.email || 'Ospite';

  if (elements.topUserName) elements.topUserName.textContent = displayName;
  if (elements.topUserRole) elements.topUserRole.textContent = isLoggedIn ? formatRole(state.user.role) : '—';

  toggleHidden(elements.portalAuthTrigger, isLoggedIn);
  toggleHidden(elements.logoutBtn, !isLoggedIn);

  elements.adminNavLinks.forEach((link) => {
    toggleHidden(link, !isAdmin);
  });

  toggleHidden(elements.clientArea, !isLoggedIn);
  toggleHidden(elements.portalGuard, isLoggedIn);

  if (isDashboardPage) {
    toggleHidden(elements.adminArea, !isAdmin);
    toggleHidden(elements.adminGuard, isAdmin);
  } else {
    toggleHidden(elements.adminArea, true);
    toggleHidden(elements.adminGuard, true);
  }

  prefillBookingContact();
}

function populateServiceOptions() {
  if (!elements.serviceType) return;
  const prevService = elements.serviceType.value;
  elements.serviceType.innerHTML = `<option value="">${translateOption('select')}</option>`;
  [
    { value: 'noleggio', labelKey: 'rental' },
    { value: 'escursione', labelKey: 'tour' },
  ].forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = translateOption(opt.labelKey);
    elements.serviceType.appendChild(option);
  });
  if (prevService) elements.serviceType.value = prevService;

  elements.boatModel.innerHTML = '';
  if (elements.boatModel) {
    const prevBoat = elements.boatModel.value;
    elements.boatModel.innerHTML = `<option value="">${translateOption('selectBoat')}</option>`;
    state.catalog.boats.forEach((boat) => {
      const option = document.createElement('option');
      option.value = boat.label;
      option.textContent = translateBoatLabel(boat.label);
      elements.boatModel.appendChild(option);
    });
    if (prevBoat) elements.boatModel.value = prevBoat;
  }

  elements.tour.innerHTML = '';
  if (elements.tour) {
    const prevTour = elements.tour.value;
    elements.tour.innerHTML = `<option value="">${translateOption('selectTour')}</option>`;
    state.catalog.tours.forEach((experience) => {
      const option = document.createElement('option');
      option.value = experience.label;
      option.textContent = translateTourLabel(experience.label);
      elements.tour.appendChild(option);
    });
    if (prevTour) elements.tour.value = prevTour;
  }

  renderBoatSummary();
  renderTourSummary();
}

function handleServiceTypeChange(value) {
  const isRental = value === 'noleggio';
  const isTour = value === 'escursione';
  toggleHidden(elements.boatField, !isRental);
  toggleHidden(elements.tourField, !isTour);
  toggleHidden(elements.endTimeField, !isRental);
  enforceExcursionTime();
  renderBoatSummary();
  renderTourSummary();
  syncPeopleConstraints();
  updateBookingRecap();
}

function formatDateTime(date, time) {
  const iso = `${date}T${time}`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return `${date} · ${time}`;
  }
  return parsed.toLocaleString(getLocale(), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateLabel(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(getLocale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function renderClientBookings() {
  const container = elements.clientBookings;
  if (!container) return;
  container.innerHTML = '';

  if (!state.bookings.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = getCurrentLang() === 'en'
      ? 'No bookings yet. Complete the form to plan your next outing.'
      : 'Ancora nessuna prenotazione. Compila il form per fissare la tua prossima uscita.';
    container.appendChild(empty);
    return;
  }

  const sorted = [...state.bookings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  sorted.forEach((booking) => {
    const lang = getCurrentLang();
    const t = (it, en) => (lang === 'en' ? en : it);
    const card = document.createElement('article');
    card.className = 'booking-card';
    const statusMeta = getStatusMeta(booking.status);
    const statusClass = `status-pill--${statusMeta.tone}`;
    const coverImage = getBookingImage(booking);
    const subtitle = getBookingSubtitle(booking);
    const serviceLabel = getServiceLabel(booking.service_type);
    card.innerHTML = `
      <div class="booking-card__badge status-pill ${statusClass}">${statusMeta.label}</div>
      <div class="booking-card__media">
        <img src="${coverImage}" alt="${subtitle}">
      </div>
      <header class="booking-card__header">
        <p class="booking-card__eyebrow">${serviceLabel}</p>
        <h3>${subtitle}</h3>
        <p class="booking-card__time">${formatDateTime(booking.date, booking.time)}</p>
      </header>
      <div class="booking-meta">
        <p><strong>${t('Ospiti', 'Guests')}</strong><span>${booking.people}</span></p>
        <p><strong>${t('Contatto', 'Contact')}</strong><span>${formatPhone(booking.phone || '') || booking.phone}</span></p>
        ${booking.notes ? `<p class="booking-note"><strong>${t('Note', 'Notes')}</strong><span>${booking.notes}</span></p>` : ''}
        <p class="booking-note"><strong>${t('Cos\'è compreso', 'Included')}</strong><span>${getIncludedCopy(booking.service_type)}</span></p>
        ${booking.client_message ? `<p class="booking-note"><strong>${t('Messaggio staff', 'Staff message')}</strong><span>${booking.client_message}</span></p>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

function getBookingImage(booking) {
  if (booking.service_type === 'escursione') {
    const matchTour = state.catalog.tours.find((tour) => tour.label === booking.tour || tour.id === booking.tour);
    if (matchTour?.image) return matchTour.image;
  }
  if (booking.service_type === 'noleggio') {
    const matchBoat = state.catalog.boats.find((boat) => boat.label === booking.boat_model || boat.id === booking.boat_model);
    if (matchBoat?.image) return matchBoat.image;
  }
  return 'assets/img/14.jpg';
}

function getBookingSubtitle(booking) {
  if (booking.service_type === 'escursione') {
    return booking.tour || (getCurrentLang() === 'en' ? 'Guided excursion' : 'Escursione guidata');
  }
  return booking.boat_model || (getCurrentLang() === 'en' ? 'RIB rental' : 'Noleggio gommone');
}

const scrollLock = {
  active: false,
  y: 0,
};

function lockBodyScroll() {
  if (scrollLock.active) return;
  scrollLock.y = window.scrollY || window.pageYOffset || 0;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollLock.y}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  scrollLock.active = true;
}

function unlockBodyScroll() {
  if (!scrollLock.active) return;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, scrollLock.y);
  scrollLock.active = false;
}

function openBookingDetail(id) {
  if (!elements.bookingDetailModal || !elements.bookingDetailContent) return;
  const booking = state.adminBookings.find((b) => b.id === id);
  if (!booking) return;

  const cover = getBookingImage(booking);
  const subtitle = getBookingSubtitle(booking);
  const isRental = booking.service_type === 'noleggio';
  const statusMeta = getStatusMeta(booking.status);
  const serviceLabel = getServiceLabel(booking.service_type);

  const dateTimeLabel = `${formatDateLabel(booking.date)} · ${booking.time}${booking.end_time ? ` → ${booking.end_time}` : ''}`;
  const serviceFullLabel = `${serviceLabel}${subtitle ? ` · ${subtitle}` : ''}`;

  elements.bookingDetailContent.innerHTML = `
    <div class="booking-detail">
      <header class="booking-detail__header">
        <div class="booking-detail__header-main">
          <p class="booking-detail__service">${serviceLabel}</p>
          <h3 id="bookingDetailTitle" class="booking-detail__title">${subtitle}</h3>
          <p class="booking-detail__datetime">${dateTimeLabel}</p>
        </div>
        <span class="status-pill status-pill--${statusMeta.tone}">${statusMeta.label}</span>
        <button class="booking-detail__close" type="button" data-close-modal aria-label="Chiudi">&times;</button>
      </header>

      <div class="booking-detail__body">
        <div class="booking-detail__content">
          <section class="booking-detail__section booking-detail__summary">
            <h4>Riepilogo</h4>
            <div class="booking-detail__summary-grid">
              <div class="booking-detail__summary-item">
                <span>Servizio</span>
                <p>${serviceFullLabel}</p>
              </div>
              <div class="booking-detail__summary-item">
                <span>Data + Orari</span>
                <p>${dateTimeLabel}</p>
              </div>
              <div class="booking-detail__summary-item">
                <span>Ospiti</span>
                <p class="booking-detail__summary-value">${booking.people}</p>
              </div>
              <div class="booking-detail__summary-item">
                <span>Stato</span>
                <p>${statusMeta.label}</p>
              </div>
            </div>
          </section>

          <section class="booking-detail__section booking-detail__customer">
            <h4>Cliente</h4>
            <div class="booking-detail__list">
              <div>
                <span>Nome</span>
                <p>${booking.customer_name}</p>
              </div>
              <div>
                <span>Email</span>
                <p>${booking.email}</p>
              </div>
              <div>
                <span>Telefono</span>
                <p>${formatPhone(booking.phone || '') || booking.phone}</p>
              </div>
            </div>
          </section>

          <section class="booking-detail__section booking-detail__notes">
            <h4>Note</h4>
            <div class="booking-detail__note">
              <span>Note cliente</span>
              <p>${booking.notes || '—'}</p>
            </div>
            <div class="booking-detail__note-grid">
              <label class="booking-detail__field">
                <span>Messaggio al cliente</span>
                <textarea id="detailClientMessage" placeholder="Aggiorna il cliente (visibile nel portale prenotazioni)">${booking.client_message || ''}</textarea>
              </label>
              <label class="booking-detail__field">
                <span>Note interne</span>
                <textarea id="detailInternalNote" placeholder="Solo staff interno">${booking.internal_note || ''}</textarea>
              </label>
            </div>
          </section>
        </div>
      </div>

      <footer class="booking-detail__actions">
        <div class="booking-detail__actions-meta">
          <select id="detailStatus" class="table-select">
            ${['da confermare', 'confermato', 'completato', 'annullato'].map((s) => `<option value="${s}" ${booking.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
          <button class="btn outline danger" type="button" id="detailDelete">Elimina</button>
        </div>
        <div class="booking-detail__actions-main">
          <button class="btn ghost" type="button" data-close-modal>Chiudi</button>
          <button class="btn primary" type="button" id="detailSave">Salva</button>
        </div>
      </footer>
    </div>
  `;

  elements.bookingDetailModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  lockBodyScroll();

  elements.bookingDetailContent.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', closeBookingDetail);
  });

  elements.bookingDetailContent.querySelector('#detailSave')?.addEventListener('click', async () => {
    const status = elements.bookingDetailContent.querySelector('#detailStatus')?.value;
    const internalNote = elements.bookingDetailContent.querySelector('#detailInternalNote')?.value || '';
    const clientMessage = elements.bookingDetailContent.querySelector('#detailClientMessage')?.value || '';
    const ok = await updateBooking(id, { status, internalNote, clientMessage, endTime: booking.end_time });
    if (ok) closeBookingDetail();
  });

  elements.bookingDetailContent.querySelector('#detailDelete')?.addEventListener('click', () => {
    deleteBooking(id);
    closeBookingDetail();
  });
}

function closeBookingDetail() {
  if (!elements.bookingDetailModal) return;
  elements.bookingDetailModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  unlockBodyScroll();
}

function getBookingsByDate(dateStr) {
  return state.adminBookings.filter((booking) => booking.date === dateStr);
}

function renderCalendar() {
  if (!elements.calendarGrid || !elements.calendarTitle) return;
  const { year, month } = state.calendar;
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

  elements.calendarTitle.textContent = firstDay.toLocaleDateString(getLocale(), { month: 'long', year: 'numeric' });
  elements.calendarGrid.innerHTML = '';

  for (let i = 0; i < startDay; i += 1) {
    const placeholder = document.createElement('div');
    elements.calendarGrid.appendChild(placeholder);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEl = document.createElement('button');
    dayEl.type = 'button';
    dayEl.className = 'calendar-day';
    const count = getBookingsByDate(dateStr).length;
    if (count > 0) {
      dayEl.classList.add('has-events');
    }
    dayEl.innerHTML = `<span class="calendar-day__number">${day}</span>`;
    if (dateStr === todayStr) dayEl.classList.add('is-today');
    if (state.calendar.selectedDay === dateStr) dayEl.classList.add('is-active');
    dayEl.addEventListener('click', () => {
      state.calendar.selectedDay = dateStr;
      renderCalendar();
      renderCalendarDayDetail();
    });
    elements.calendarGrid.appendChild(dayEl);
  }

  if (!state.calendar.selectedDay) {
    state.calendar.selectedDay = todayStr;
  }
  renderCalendarDayDetail();
}

function renderCalendarDayDetail() {
  if (!elements.calendarDayLabel || !elements.calendarDayList) return;
  const day = state.calendar.selectedDay;
  if (!day) {
    elements.calendarDayLabel.textContent = 'Seleziona un giorno';
    elements.calendarDayList.innerHTML = '';
    return;
  }
  elements.calendarDayLabel.textContent = formatDateLabel(day);
  const bookings = getBookingsByDate(day);
  elements.calendarDayList.innerHTML = '';
  if (!bookings.length) {
    const message = getCurrentLang() === 'en'
      ? 'No bookings for this date.'
      : 'Nessuna prenotazione per questa data.';
    elements.calendarDayList.innerHTML = `<li class="empty-state">${message}</li>`;
    return;
  }
  bookings.forEach((booking) => {
    const li = document.createElement('li');
    li.className = 'calendar-day-item';
    li.dataset.bookingId = booking.id;
    const statusMeta = getStatusMeta(booking.status);
    const lang = getCurrentLang();
    const t = (it, en) => (lang === 'en' ? en : it);
    li.innerHTML = `
      <strong>${formatDateTime(booking.date, booking.time)}</strong>
      <span>${booking.service_type === 'noleggio' ? booking.boat_model || 'Noleggio' : booking.tour || 'Escursione'}</span>
      <span class="status-pill status-pill--${statusMeta.tone}">${statusMeta.label}</span>
      <small>${booking.customer_name} · ${booking.people} ${t('ospiti', 'guests')}</small>
    `;
    li.addEventListener('click', () => openBookingDetail(booking.id));
    elements.calendarDayList.appendChild(li);
  });
}

function loadStaffNotePins() {
  try {
    const stored = localStorage.getItem(STAFF_PINS_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      state.staffNotePins = new Set(parsed);
    }
  } catch (_) {}
}

function saveStaffNotePins() {
  try {
    const values = Array.from(state.staffNotePins);
    localStorage.setItem(STAFF_PINS_KEY, JSON.stringify(values));
  } catch (_) {}
}

function toggleStaffNotePin(noteId) {
  if (state.staffNotePins.has(noteId)) {
    state.staffNotePins.delete(noteId);
  } else {
    state.staffNotePins.add(noteId);
  }
  saveStaffNotePins();
  renderStaffNotes();
}

function renderStaffNotes() {
  if (!elements.staffNotesList) return;
  elements.staffNotesList.innerHTML = '';
  if (!state.staffNotes.length) {
    const message = getCurrentLang() === 'en'
      ? 'No internal notes yet. Add an operational reminder.'
      : 'Nessuna nota interna. Aggiungi un promemoria operativo.';
    elements.staffNotesList.innerHTML = `<p class="empty-state">${message}</p>`;
    return;
  }

  const query = state.staffNoteQuery.trim().toLowerCase();
  const pinned = state.staffNotePins;
  const filtered = state.staffNotes.filter((note) => {
    if (!query) return true;
    const content = `${note.content || ''} ${note.author || ''}`.toLowerCase();
    return content.includes(query);
  });

  if (!filtered.length) {
    const message = getCurrentLang() === 'en'
      ? 'No notes match your search.'
      : 'Nessuna nota corrispondente alla ricerca.';
    elements.staffNotesList.innerHTML = `<p class="empty-state">${message}</p>`;
    return;
  }

  filtered.sort((a, b) => {
    const pinnedA = pinned.has(a.id);
    const pinnedB = pinned.has(b.id);
    if (pinnedA !== pinnedB) return pinnedA ? -1 : 1;
    const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
    const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
    return dateB - dateA;
  });

  const lang = getCurrentLang();
  const t = (it, en) => (lang === 'en' ? en : it);

  filtered.forEach((note) => {
    const item = document.createElement('article');
    item.className = `staff-note${pinned.has(note.id) ? ' is-pinned' : ''}`;
    const created = note.created_at ? new Date(note.created_at).toLocaleString(getLocale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
    const updated = note.updated_at ? new Date(note.updated_at).toLocaleString(getLocale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

    const meta = document.createElement('div');
    meta.className = 'staff-note__meta';
    const authorSpan = document.createElement('span');
    authorSpan.textContent = note.author || 'Staff';
    const timeSpan = document.createElement('span');
    timeSpan.textContent = `${created}${updated && updated !== created ? ` · upd ${updated}` : ''}`;
    meta.append(authorSpan, timeSpan);

    const contentP = document.createElement('p');
    contentP.className = 'staff-note__content';
    contentP.textContent = note.content;

    const actions = document.createElement('div');
    actions.className = 'staff-note__actions';
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn ghost';
    editBtn.dataset.noteEdit = note.id;
    editBtn.textContent = t('Modifica', 'Edit');
    const pinBtn = document.createElement('button');
    pinBtn.type = 'button';
    pinBtn.className = 'btn ghost';
    pinBtn.dataset.notePin = note.id;
    pinBtn.textContent = pinned.has(note.id) ? t('Rimuovi pin', 'Unpin') : t('Fissa', 'Pin');
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn outline';
    deleteBtn.dataset.noteDelete = note.id;
    deleteBtn.textContent = t('Elimina', 'Delete');
    actions.append(editBtn, pinBtn, deleteBtn);

    item.append(meta, contentP, actions);
    elements.staffNotesList.appendChild(item);
  });

  elements.staffNotesList.querySelectorAll('[data-note-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const noteId = Number(btn.dataset.noteEdit);
      const note = state.staffNotes.find((n) => n.id === noteId);
      if (!note) return;
      state.staffNoteEditingId = noteId;
      elements.staffNoteInput.value = note.content;
      toggleHidden(elements.staffNoteForm, false);
      elements.staffNoteInput.focus();
    });
  });

  elements.staffNotesList.querySelectorAll('[data-note-pin]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const noteId = Number(btn.dataset.notePin);
      if (!Number.isInteger(noteId)) return;
      toggleStaffNotePin(noteId);
    });
  });

  elements.staffNotesList.querySelectorAll('[data-note-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const noteId = Number(btn.dataset.noteDelete);
      if (!Number.isInteger(noteId)) return;
      const ok = window.confirm('Eliminare questa nota?');
      if (!ok) return;
      try {
        await fetchJSON(`/api/staff-notes/${noteId}`, { method: 'DELETE' });
        await loadStaffNotes();
      } catch (error) {
        showToast(error.message || 'Impossibile eliminare la nota', 'error');
      }
    });
  });
}
function renderAdminStats() {
  if (!state.user || state.user.role !== 'admin') return;
  if (elements.adminStatTotal) {
    elements.adminStatTotal.textContent = state.stats.total ?? 0;
  }
  if (elements.adminStatToday) {
    elements.adminStatToday.textContent = state.stats.todayTours ?? 0;
  }
}

function normalizePhoneForLink(phone = '') {
  return normalizePhone(phone);
}

function buildWhatsappLink(phone = '') {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('39')) return `https://wa.me/${digits}`;
  if (digits.length <= 10) return `https://wa.me/39${digits}`;
  return `https://wa.me/${digits}`;
}

function syncAdminFiltersUI() {
  if (elements.adminFilterType) {
    elements.adminFilterType.value = state.filters.type;
  }
  if (elements.adminFilterStatus) {
    elements.adminFilterStatus.value = state.filters.status;
  }
  if (elements.adminFilterChips) {
    elements.adminFilterChips.querySelectorAll('[data-filter-status]').forEach((chip) => {
      chip.classList.toggle('is-active', chip.dataset.filterStatus === state.filters.status);
    });
  }
}

function renderAdminTable() {
  if (!state.user || state.user.role !== 'admin') return;

  const tbody = elements.adminTableBody;
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!state.adminBookings?.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 8;
    cell.textContent = getCurrentLang() === 'en'
      ? 'No bookings match the current filters.'
      : 'Nessuna prenotazione corrispondente ai filtri.';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  state.adminBookings.forEach((booking) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDateTime(booking.date, booking.time)}${booking.end_time ? `<br><small>Rientro ${booking.end_time}</small>` : ''}</td>
      <td>
        <strong>${booking.customer_name}</strong><br>
        <small>${booking.email}</small><br>
        <small>${formatPhone(booking.phone || '') || booking.phone}</small>
      </td>
      <td>${booking.service_type === 'noleggio' ? 'Noleggio' : 'Escursione'}</td>
      <td>${booking.service_type === 'noleggio' ? (booking.boat_model || '—') : (booking.tour || '—')}</td>
      <td>${booking.people}</td>
      <td></td>
      <td></td>
      <td></td>
    `;

    const statusCell = row.children[5];
    const statusWrap = document.createElement('div');
    statusWrap.className = 'status-control';
    const statusBadge = createStatusBadgeElement(booking.status);
    const statusSelect = document.createElement('select');
    statusSelect.className = 'table-select';
    statusSelect.setAttribute('aria-label', 'Stato prenotazione');
    let currentStatus = booking.status;
    ['da confermare', 'confermato', 'completato', 'annullato'].forEach((status) => {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status;
      if (booking.status === status) option.selected = true;
      statusSelect.appendChild(option);
    });
    statusSelect.addEventListener('change', async () => {
      const nextStatus = statusSelect.value;
      const ok = await updateBooking(booking.id, { status: nextStatus });
      if (!ok) {
        statusSelect.value = currentStatus;
        return;
      }
      currentStatus = nextStatus;
      const meta = getStatusMeta(nextStatus);
      statusBadge.className = `status-pill status-pill--${meta.tone}`;
      statusBadge.textContent = meta.label;
    });
    statusWrap.append(statusBadge, statusSelect);
    statusCell.appendChild(statusWrap);

    const noteCell = row.children[6];
    const noteArea = document.createElement('textarea');
    noteArea.className = 'table-note';
    noteArea.setAttribute('aria-label', 'Note interne');
    noteArea.value = booking.internal_note || '';
    let debounceId;
    noteArea.addEventListener('input', () => {
      clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        updateBooking(booking.id, { internalNote: noteArea.value });
      }, 500);
    });
    noteCell.appendChild(noteArea);

    const actionsCell = row.children[7];
    const detailBtn = document.createElement('button');
    detailBtn.type = 'button';
    detailBtn.className = 'btn ghost';
    detailBtn.textContent = 'Dettagli';
    detailBtn.addEventListener('click', () => openBookingDetail(booking.id));
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn outline';
    deleteBtn.textContent = 'Elimina';
    deleteBtn.addEventListener('click', () => deleteBooking(booking.id));
    actionsCell.append(detailBtn, deleteBtn);

    tbody.appendChild(row);
  });
}

async function updateBooking(id, payload) {
  try {
    await fetchJSON(`/api/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await Promise.all([loadClientBookings(), loadAdminBookings()]);
    return true;
  } catch (error) {
    console.error('Errore aggiornamento booking:', error);
    showToast(error.message || 'Impossibile aggiornare la prenotazione', 'error');
    return false;
  }
}

async function deleteBooking(id) {
  const confirmDelete = window.confirm('Vuoi eliminare definitivamente questa prenotazione?');
  if (!confirmDelete) return;
  try {
    await fetchJSON(`/api/bookings/${id}`, { method: 'DELETE' });
    await Promise.all([loadClientBookings(), loadAdminBookings()]);
  } catch (error) {
    console.error('Errore cancellazione booking:', error);
    showToast(error.message || 'Impossibile cancellare la prenotazione', 'error');
  }
}

async function loadClientBookings() {
  try {
    const data = await fetchJSON('/api/bookings');
    state.bookings = data.bookings || [];
    if (state.user?.role === 'admin') {
      state.stats = data.stats || state.stats;
      renderAdminStats();
    }
    renderClientBookings();
  } catch (error) {
    console.error('Errore caricamento prenotazioni cliente:', error);
    renderClientBookings();
  }
}

async function loadAdminBookings() {
  if (!state.user || state.user.role !== 'admin' || !elements.adminTableBody) return;

  const params = new URLSearchParams();
  if (state.filters.type !== 'all') params.set('serviceType', state.filters.type);
  if (state.filters.status !== 'all') params.set('status', state.filters.status);

  const endpoint = params.toString() ? `/api/bookings?${params.toString()}` : '/api/bookings';

  try {
    setButtonLoading(elements.adminRefresh, true, getCurrentLang() === 'en' ? 'Refreshing...' : 'Aggiorno...');
    if (elements.adminTableBody) {
      elements.adminTableBody.innerHTML = '<tr><td colspan="8">Caricamento prenotazioni...</td></tr>';
    }
    const data = await fetchJSON(endpoint);
    state.adminBookings = data.bookings || [];
    state.stats = data.stats || state.stats;
    renderAdminStats();
    renderAdminTable();
    renderCalendar();
  } catch (error) {
    console.error('Errore caricamento admin bookings:', error);
    renderAdminTable();
    showToast(error.message || 'Errore caricamento dashboard.', 'error');
  } finally {
    setButtonLoading(elements.adminRefresh, false);
  }
}

async function loadStaffNotes() {
  if (!state.user || state.user.role !== 'admin') return;
  try {
    const data = await fetchJSON('/api/staff-notes');
    state.staffNotes = data.notes || [];
    renderStaffNotes();
  } catch (error) {
    console.error('Errore caricamento note staff', error);
    renderStaffNotes();
    showToast(error.message || 'Errore caricamento note staff.', 'error');
  }
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  if (!elements.bookingForm) return;
  resetFeedback(elements.bookingFeedback);
  clearAllFieldErrors();

  const formData = new FormData(elements.bookingForm);
  const payload = Object.fromEntries(formData.entries());
  const { errors, normalizedPayload } = validateBookingPayload(payload);

  if (Object.keys(errors).length) {
    Object.entries(errors).forEach(([field, message]) => setFieldError(field, message));
    const message = getCurrentLang() === 'en'
      ? 'Please review the highlighted fields.'
      : 'Controlla i campi evidenziati.';
    showFeedback(elements.bookingFeedback, message, 'error');
    showToast(message, 'error');
    const firstField = Object.keys(errors)[0];
    const wrapper = getFieldWrapper(firstField);
    const control = wrapper?.querySelector('input, select, textarea');
    control?.focus();
    return;
  }

  try {
    setButtonLoading(elements.bookingSubmit, true, getCurrentLang() === 'en' ? 'Sending...' : 'Invio in corso...');
    elements.bookingForm.setAttribute('aria-busy', 'true');
    await fetchJSON('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(normalizedPayload),
    });
    elements.bookingForm.reset();
    handleServiceTypeChange('');
    applyDateConstraints();
    prefillBookingContact();
    const successMessage = getCurrentLang() === 'en'
      ? 'Booking sent! We will contact you for confirmation.'
      : 'Prenotazione inviata! Ti contatteremo per conferma.';
    showFeedback(elements.bookingFeedback, successMessage, 'success');
    showToast(successMessage, 'success');
    await Promise.all([loadClientBookings(), loadAdminBookings()]);
  } catch (error) {
    showFeedback(elements.bookingFeedback, error.message, 'error');
    showToast(error.message || 'Errore durante l\'invio.', 'error');
  } finally {
    elements.bookingForm.removeAttribute('aria-busy');
    setButtonLoading(elements.bookingSubmit, false);
    updateBookingRecap();
  }
}

function toggleStaffNoteForm(show = false) {
  if (!elements.staffNoteForm) return;
  toggleHidden(elements.staffNoteForm, !show);
  if (show) {
    elements.staffNoteInput.value = '';
    state.staffNoteEditingId = null;
    resetFeedback(elements.staffNoteFeedback);
    elements.staffNoteInput.focus();
  } else {
    state.staffNoteEditingId = null;
  }
}

async function saveStaffNote() {
  if (!elements.staffNoteInput) return;
  const content = elements.staffNoteInput.value.trim();
  if (!content) {
    showFeedback(elements.staffNoteFeedback, 'Scrivi la nota prima di salvare.', 'error');
    return;
  }
  try {
    setButtonLoading(elements.staffNoteSave, true, getCurrentLang() === 'en' ? 'Saving...' : 'Salvataggio...');
    if (state.staffNoteEditingId) {
      await fetchJSON(`/api/staff-notes/${state.staffNoteEditingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      });
    } else {
      await fetchJSON('/api/staff-notes', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    }
    toggleStaffNoteForm(false);
    await loadStaffNotes();
    showToast(getCurrentLang() === 'en' ? 'Note saved.' : 'Nota salvata.', 'success');
  } catch (error) {
    showFeedback(elements.staffNoteFeedback, error.message, 'error');
    showToast(error.message || 'Errore salvataggio nota.', 'error');
  } finally {
    setButtonLoading(elements.staffNoteSave, false);
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
    closePortalModal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateUserUI();
    const loaders = [];
    if (isBookingPage) loaders.push(loadClientBookings());
    if (isDashboardPage) {
      loaders.push(loadAdminBookings());
      loaders.push(loadStaffNotes());
    }
    await Promise.all(loaders);
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
    showFeedback(elements.registerFeedback, 'Compila nome, email e password.', 'error');
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
    closePortalModal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateUserUI();
    const loaders = [];
    if (isBookingPage) loaders.push(loadClientBookings());
    if (isDashboardPage) {
      loaders.push(loadAdminBookings());
      loaders.push(loadStaffNotes());
    }
    await Promise.all(loaders);
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
    state.bookings = [];
    state.adminBookings = [];
    state.staffNotes = [];
    updateUserUI();
    prefillBookingContact();
    renderClientBookings();
    openPortalModal('login');
  }
}

async function checkSession() {
  try {
    const { user } = await fetchJSON('/api/session');
    if (user) {
      state.user = user;
      updateUserUI();
      closePortalModal();
      const loaders = [];
      if (isBookingPage) loaders.push(loadClientBookings());
      if (isDashboardPage) {
        loaders.push(loadAdminBookings());
        loaders.push(loadStaffNotes());
      }
      await Promise.all(loaders);
    } else {
      updateUserUI();
      openPortalModal('login');
    }
  } catch (error) {
    console.warn('Sessione non disponibile:', error);
    updateUserUI();
    openPortalModal('login');
  }
}

async function loadCatalog() {
  if (!elements.serviceType) return;
  try {
    const catalog = await fetchJSON('/api/catalog', { method: 'GET' });
    state.catalog = catalog;
    if (Array.isArray(catalog.tours)) {
      catalog.tours.forEach((tour) => {
        if (tour?.label && tour?.time) {
          TOUR_SCHEDULE[tour.label] = tour.time;
        }
      });
    }
    populateServiceOptions();
    syncPeopleConstraints();
  } catch (error) {
    console.error('Errore caricamento catalogo:', error);
  }
}

function applyBoatPreselect() {
  if (!elements.serviceType || !elements.boatModel) return;
  const params = new URLSearchParams(window.location.search);
  const boatParam = params.get('boat');
  if (!boatParam) return;

  elements.serviceType.value = 'noleggio';
  handleServiceTypeChange('noleggio');

  const boats = state.catalog?.boats || [];
  const matched = boats.find((boat) => boat?.id === boatParam || boat?.label === boatParam);
  const nextValue = matched?.label || boatParam;
  if ([...elements.boatModel.options].some((opt) => opt.value === nextValue)) {
    elements.boatModel.value = nextValue;
  }

  renderBoatSummary();
  syncPeopleConstraints();
}

function attachEventListeners() {
  if (elements.serviceType) {
    elements.serviceType.addEventListener('change', (event) => {
      handleServiceTypeChange(event.target.value);
    });
  }

  elements.guardLogin?.addEventListener('click', () => openPortalModal('login'));

  if (elements.bookingForm) {
    elements.bookingForm.addEventListener('submit', handleBookingSubmit);
    elements.bookingForm.addEventListener('input', handleBookingFormInput);
    elements.bookingForm.addEventListener('change', handleBookingFormInput);
    elements.bookingForm.addEventListener('blur', handlePhoneBlur, true);
  }

  elements.tour?.addEventListener('change', enforceExcursionTime);
  elements.tour?.addEventListener('change', renderTourSummary);
  elements.tour?.addEventListener('change', syncPeopleConstraints);
  elements.boatModel?.addEventListener('change', renderBoatSummary);
  elements.boatModel?.addEventListener('change', syncPeopleConstraints);
  elements.bookingForm?.elements?.time?.addEventListener('change', syncTimeConstraints);
  elements.bookingForm?.elements?.endTime?.addEventListener('change', updateBookingRecap);

  document.querySelectorAll('[data-people-stepper]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const delta = btn.dataset.peopleStepper === 'decrement' ? -1 : 1;
      adjustPeopleValue(delta);
    });
  });

  elements.logoutBtn?.addEventListener('click', handleLogout);
  elements.portalAuthTrigger?.addEventListener('click', () => openPortalModal(activePortalTab));
  elements.portalCloseTriggers.forEach((trigger) => {
    trigger.addEventListener('click', closePortalModal);
  });
  document.querySelectorAll('#bookingDetailModal [data-close-modal]').forEach((trigger) => {
    trigger.addEventListener('click', closeBookingDetail);
  });
  elements.portalTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const nextTab = tab.dataset.tab;
      switchPortalTab(nextTab);
      focusPortalField(nextTab);
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !elements.portalModal?.classList.contains('hidden')) {
      closePortalModal();
    }
  });

  elements.authForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (activePortalTab === 'register') {
      handleRegister();
    } else {
      handleLogin();
    }
  });

  if (elements.adminFilterType) {
    elements.adminFilterType.addEventListener('change', (event) => {
      state.filters.type = event.target.value;
      syncAdminFiltersUI();
      loadAdminBookings();
    });
  }

  if (elements.adminFilterStatus) {
    elements.adminFilterStatus.addEventListener('change', (event) => {
      state.filters.status = event.target.value;
      syncAdminFiltersUI();
      loadAdminBookings();
    });
  }

  elements.adminFilterChips?.querySelectorAll('[data-filter-status]').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.filters.status = chip.dataset.filterStatus;
      syncAdminFiltersUI();
      loadAdminBookings();
    });
  });

  elements.adminResetFilters?.addEventListener('click', () => {
    state.filters.type = 'all';
    state.filters.status = 'all';
    syncAdminFiltersUI();
    loadAdminBookings();
  });

  elements.adminRefresh?.addEventListener('click', () => {
    loadAdminBookings();
    loadStaffNotes();
  });

  elements.calendarPrev?.addEventListener('click', () => shiftCalendarMonth(-1));
  elements.calendarNext?.addEventListener('click', () => shiftCalendarMonth(1));

  elements.addStaffNote?.addEventListener('click', () => toggleStaffNoteForm(true));
  elements.staffNoteCancel?.addEventListener('click', () => toggleStaffNoteForm(false));
  elements.staffNoteSave?.addEventListener('click', saveStaffNote);
  elements.staffNoteSearch?.addEventListener('input', (event) => {
    state.staffNoteQuery = event.target.value || '';
    renderStaffNotes();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeBookingDetail();
    }
  });

  window.addEventListener('language:change', () => {
    populateServiceOptions();
    renderBoatSummary();
    renderTourSummary();
    enforceExcursionTime();
    renderClientBookings();
    renderAdminTable();
    renderCalendar();
    renderStaffNotes();
    syncPeopleConstraints();
    updateBookingRecap();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  attachEventListeners();
  updateUserUI();
  applyDateConstraints();
  syncTimeConstraints();
  syncPeopleConstraints();
  updateBookingRecap();
  loadStaffNotePins();
  syncAdminFiltersUI();

  const portalMenuToggle = document.getElementById('portalMenuToggle');
  const portalNav = document.getElementById('portalNav');
  const portalUserActions = document.getElementById('portalUserActions');

  if (portalMenuToggle && portalNav && portalUserActions) {
    const closePortalMenu = () => {
      portalMenuToggle.setAttribute('aria-expanded', 'false');
      portalNav.classList.remove('is-open');
      portalUserActions.classList.remove('is-open');
    };

    portalMenuToggle.addEventListener('click', () => {
      const expanded = portalMenuToggle.getAttribute('aria-expanded') === 'true';
      const nextState = !expanded;
      portalMenuToggle.setAttribute('aria-expanded', String(nextState));
      portalNav.classList.toggle('is-open', nextState);
      portalUserActions.classList.toggle('is-open', nextState);
    });

    portalNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closePortalMenu);
    });

    const portalDesktopQuery = window.matchMedia('(min-width: 1025px)');
    const handlePortalViewport = () => {
      if (portalDesktopQuery.matches) {
        closePortalMenu();
      }
    };

    portalDesktopQuery.addEventListener('change', handlePortalViewport);
    handlePortalViewport();
  }

  if (elements.serviceType) handleServiceTypeChange('');
  await loadCatalog();
  applyBoatPreselect();
  await checkSession();
});
