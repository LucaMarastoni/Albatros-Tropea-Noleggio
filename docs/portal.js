const state = {
  user: null,
  catalog: {
    boats: [],
    tours: [],
  },
  bookings: [],
  adminBookings: [],
  staffNotes: [],
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
  adminRefresh: document.getElementById('adminRefresh'),
  adminStatTotal: document.getElementById('adminStatTotal'),
  adminStatPending: document.getElementById('adminStatPending'),
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
  bookingDetailModal: document.getElementById('bookingDetailModal'),
  bookingDetailContent: document.getElementById('bookingDetailContent'),
  portalGuard: document.getElementById('portalGuard'),
  guardLogin: document.getElementById('openAuthFromGuard'),
};

function getCurrentLang() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'it') return saved;
  } catch (_) {}
  return document.documentElement.lang === 'en' ? 'en' : 'it';
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
  const value = elements.boatModel?.value;
  if (!value) return null;
  return state.catalog.boats.find((boat) => boat.label === value || boat.id === value) || null;
}

function getSelectedTour() {
  const value = elements.tour?.value;
  if (!value) return null;
  return state.catalog.tours.find((tour) => tour.label === value || tour.id === value) || null;
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
    return;
  }

  const selectedTour = elements.tour?.value;
  const fixedTime = selectedTour && TOUR_SCHEDULE[selectedTour] ? TOUR_SCHEDULE[selectedTour] : '09:00';
  timeInput.value = fixedTime;
  timeInput.readOnly = true;
  renderTourSummary();
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
}

function formatDateTime(date, time) {
  const iso = `${date}T${time}`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return `${date} · ${time}`;
  }
  return parsed.toLocaleString('it-IT', {
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
  return parsed.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function renderClientBookings() {
  const container = elements.clientBookings;
  if (!container) return;
  container.innerHTML = '';

  if (!state.bookings.length) {
    const empty = document.createElement('p');
    empty.className = 'form-feedback';
    empty.textContent = 'Ancora nessuna prenotazione. Compila il form per fissare la tua prossima uscita.';
    container.appendChild(empty);
    return;
  }

  const sorted = [...state.bookings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  sorted.forEach((booking) => {
    const card = document.createElement('article');
    card.className = 'booking-card';
    const statusClass = `status-${booking.status.replace(/\s/g, '\\ ')}`;
    const coverImage = getBookingImage(booking);
    const subtitle = getBookingSubtitle(booking);
    card.innerHTML = `
      <div class="booking-card__badge status-pill ${statusClass}">${booking.status}</div>
      <div class="booking-card__media">
        <img src="${coverImage}" alt="${subtitle}">
      </div>
      <header class="booking-card__header">
        <p class="booking-card__eyebrow">${booking.service_type === 'noleggio' ? 'Noleggio gommone' : 'Escursione guidata'}</p>
        <h3>${subtitle}</h3>
        <p class="booking-card__time">${formatDateTime(booking.date, booking.time)}</p>
      </header>
      <div class="booking-meta">
        <p><strong>Ospiti</strong><span>${booking.people}</span></p>
        <p><strong>Contatto</strong><span>${booking.phone}</span></p>
        ${booking.notes ? `<p class="booking-note"><strong>Note</strong><span>${booking.notes}</span></p>` : ''}
        <p class="booking-note"><strong>Cos'è compreso</strong><span>${booking.service_type === 'noleggio'
          ? 'Briefing, tendalino, doccia, GPS/eco, dotazioni sicurezza.'
          : 'Skipper, soste programmate, snorkeling kit e briefing di bordo.'}</span></p>
        ${booking.client_message ? `<p class="booking-note"><strong>Messaggio staff</strong><span>${booking.client_message}</span></p>` : ''}
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
    return booking.tour || 'Escursione guidata';
  }
  return booking.boat_model || 'Noleggio gommone';
}

function openBookingDetail(id) {
  if (!elements.bookingDetailModal || !elements.bookingDetailContent) return;
  const booking = state.adminBookings.find((b) => b.id === id);
  if (!booking) return;

  const cover = getBookingImage(booking);
  const subtitle = getBookingSubtitle(booking);
  const isRental = booking.service_type === 'noleggio';

  elements.bookingDetailContent.innerHTML = `
    <div class="booking-detail__cover">
      <img src="${cover}" alt="${subtitle}">
      <div class="booking-detail__cover-info">
        <p class="eyebrow">${isRental ? 'Noleggio' : 'Escursione'}</p>
        <h3 id="bookingDetailTitle">${subtitle}</h3>
        <p>${formatDateLabel(booking.date)} · ${booking.time}${booking.end_time ? ` → ${booking.end_time}` : ''}</p>
      </div>
      <span class="status-pill booking-detail__status ${`status-${booking.status.replace(/\s/g, '\\ ')}`}">${booking.status}</span>
    </div>
    <div class="booking-detail__grid">
      <div class="booking-detail__block">
        <h4>Cliente</h4>
        <p>${booking.customer_name}</p>
        <p>${booking.email}</p>
        <p>${booking.phone}</p>
      </div>
      <div class="booking-detail__block">
        <h4>Servizio</h4>
        <p>${subtitle}</p>
        <p>${booking.people} ospiti</p>
        ${booking.end_time ? `<p>Rientro: ${booking.end_time}</p>` : ''}
      </div>
      <div class="booking-detail__block">
        <h4>Note cliente</h4>
        <p>${booking.notes || '—'}</p>
      </div>
      <div class="booking-detail__block">
        <h4>Messaggio al cliente</h4>
        <textarea id="detailClientMessage" placeholder="Aggiorna il cliente (visibile nel portale prenotazioni)">${booking.client_message || ''}</textarea>
      </div>
      <div class="booking-detail__block">
        <h4>Note interne</h4>
        <textarea id="detailInternalNote" placeholder="Solo staff interno">${booking.internal_note || ''}</textarea>
      </div>
    </div>
    <div class="booking-detail__actions">
      <select id="detailStatus" class="table-select">
        ${['da confermare', 'confermato', 'completato', 'annullato'].map((s) => `<option value="${s}" ${booking.status === s ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
      <button class="btn outline" type="button" id="detailDelete">Elimina</button>
      <button class="btn ghost" type="button" data-close-modal>Chiudi</button>
      <button class="btn primary" type="button" id="detailSave">Salva</button>
    </div>
  `;

  elements.bookingDetailModal.classList.remove('hidden');
  document.body.classList.add('modal-open');

  elements.bookingDetailContent.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', closeBookingDetail);
  });

  elements.bookingDetailContent.querySelector('#detailSave')?.addEventListener('click', async () => {
    const status = elements.bookingDetailContent.querySelector('#detailStatus')?.value;
    const internalNote = elements.bookingDetailContent.querySelector('#detailInternalNote')?.value || '';
    const clientMessage = elements.bookingDetailContent.querySelector('#detailClientMessage')?.value || '';
    await updateBooking(id, { status, internalNote, clientMessage, endTime: booking.end_time });
    closeBookingDetail();
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
  const todayStr = new Date().toISOString().slice(0, 10);

  elements.calendarTitle.textContent = firstDay.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
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
    dayEl.textContent = String(day);
    const hasEvents = getBookingsByDate(dateStr).length > 0;
    if (hasEvents) dayEl.classList.add('has-events');
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
    elements.calendarDayList.innerHTML = '<li>Nessuna prenotazione.</li>';
    return;
  }
  bookings.forEach((booking) => {
    const li = document.createElement('li');
    li.className = 'calendar-day-item';
    li.dataset.bookingId = booking.id;
    li.innerHTML = `
      <strong>${formatDateTime(booking.date, booking.time)}</strong>
      <span>${booking.service_type === 'noleggio' ? booking.boat_model || 'Noleggio' : booking.tour || 'Escursione'}</span>
      <small>${booking.customer_name} · ${booking.people} ospiti</small>
    `;
    li.addEventListener('click', () => openBookingDetail(booking.id));
    elements.calendarDayList.appendChild(li);
  });
}

function renderStaffNotes() {
  if (!elements.staffNotesList) return;
  elements.staffNotesList.innerHTML = '';
  if (!state.staffNotes.length) {
    elements.staffNotesList.innerHTML = '<p class="form-feedback">Nessuna nota interna.</p>';
    return;
  }

  state.staffNotes.forEach((note) => {
    const item = document.createElement('article');
    item.className = 'staff-note';
    const created = note.created_at ? new Date(note.created_at).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
    const updated = note.updated_at ? new Date(note.updated_at).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

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
    editBtn.textContent = 'Modifica';
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn outline';
    deleteBtn.dataset.noteDelete = note.id;
    deleteBtn.textContent = 'Elimina';
    actions.append(editBtn, deleteBtn);

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
        alert(error.message || 'Impossibile eliminare la nota');
      }
    });
  });
}
function renderAdminStats() {
  if (!state.user || state.user.role !== 'admin') return;
  if (!elements.adminStatTotal || !elements.adminStatPending || !elements.adminStatToday) return;
  elements.adminStatTotal.textContent = state.stats.total ?? 0;
  elements.adminStatPending.textContent = state.stats.pending ?? 0;
  elements.adminStatToday.textContent = state.stats.todayTours ?? 0;
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
    cell.textContent = 'Nessuna prenotazione corrispondente ai filtri.';
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
        <small>${booking.phone}</small>
      </td>
      <td>${booking.service_type === 'noleggio' ? 'Noleggio' : 'Escursione'}</td>
      <td>${booking.service_type === 'noleggio' ? (booking.boat_model || '—') : (booking.tour || '—')}</td>
      <td>${booking.people}</td>
      <td></td>
      <td></td>
      <td></td>
    `;

    const statusCell = row.children[5];
    const statusSelect = document.createElement('select');
    statusSelect.className = 'table-select';
    ['da confermare', 'confermato', 'completato', 'annullato'].forEach((status) => {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status;
      if (booking.status === status) option.selected = true;
      statusSelect.appendChild(option);
    });
    statusSelect.addEventListener('change', () => {
      updateBooking(booking.id, { status: statusSelect.value });
    });
    statusCell.appendChild(statusSelect);

    const noteCell = row.children[6];
    const noteArea = document.createElement('textarea');
    noteArea.className = 'table-note';
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
  } catch (error) {
    console.error('Errore aggiornamento booking:', error);
    alert(error.message || 'Impossibile aggiornare la prenotazione');
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
    alert(error.message || 'Impossibile cancellare la prenotazione');
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
    const data = await fetchJSON(endpoint);
    state.adminBookings = data.bookings || [];
    state.stats = data.stats || state.stats;
    renderAdminStats();
    renderAdminTable();
    renderCalendar();
  } catch (error) {
    console.error('Errore caricamento admin bookings:', error);
    renderAdminTable();
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
  }
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  if (!elements.bookingForm) return;
  resetFeedback(elements.bookingFeedback);

  const formData = new FormData(elements.bookingForm);
  const payload = Object.fromEntries(formData.entries());

  if (!payload.customerName || !payload.phone || !payload.serviceType || !payload.date || !payload.time) {
    showFeedback(elements.bookingFeedback, 'Completa i campi obbligatori.', 'error');
    return;
  }

  if (payload.serviceType === 'noleggio' && !payload.boatModel) {
    showFeedback(elements.bookingFeedback, 'Seleziona il gommone ZAR per il noleggio.', 'error');
    return;
  }

  if (payload.serviceType === 'noleggio' && !payload.endTime) {
    showFeedback(elements.bookingFeedback, 'Indica l\'orario di rientro per il noleggio.', 'error');
    return;
  }

  try {
    await fetchJSON('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    elements.bookingForm.reset();
    handleServiceTypeChange('');
    prefillBookingContact();
    showFeedback(elements.bookingFeedback, 'Prenotazione inviata! Il team ti contatterà a breve.', 'success');
    await Promise.all([loadClientBookings(), loadAdminBookings()]);
  } catch (error) {
    showFeedback(elements.bookingFeedback, error.message, 'error');
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
  } catch (error) {
    showFeedback(elements.staffNoteFeedback, error.message, 'error');
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
  } catch (error) {
    console.error('Errore caricamento catalogo:', error);
  }
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
  }

  elements.tour?.addEventListener('change', enforceExcursionTime);
  elements.tour?.addEventListener('change', renderTourSummary);
  elements.boatModel?.addEventListener('change', renderBoatSummary);

  elements.logoutBtn?.addEventListener('click', handleLogout);
  elements.portalAuthTrigger?.addEventListener('click', () => openPortalModal(activePortalTab));
  elements.guardLogin?.addEventListener('click', () => openPortalModal('login'));
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
      loadAdminBookings();
    });
  }

  if (elements.adminFilterStatus) {
    elements.adminFilterStatus.addEventListener('change', (event) => {
      state.filters.status = event.target.value;
      loadAdminBookings();
    });
  }

  elements.adminRefresh?.addEventListener('click', () => {
    loadAdminBookings();
    loadStaffNotes();
  });

  elements.calendarPrev?.addEventListener('click', () => shiftCalendarMonth(-1));
  elements.calendarNext?.addEventListener('click', () => shiftCalendarMonth(1));

  elements.addStaffNote?.addEventListener('click', () => toggleStaffNoteForm(true));
  elements.staffNoteCancel?.addEventListener('click', () => toggleStaffNoteForm(false));
  elements.staffNoteSave?.addEventListener('click', saveStaffNote);

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
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  attachEventListeners();
  updateUserUI();

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
  await checkSession();
});
