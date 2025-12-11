const state = {
  user: null,
  catalog: {
    boats: [],
    tours: [],
  },
  bookings: [],
  adminBookings: [],
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
  boatSummary: document.getElementById('boatSummary'),
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
};

function toggleHidden(node, shouldHide) {
  if (!node) return;
  node.classList.toggle('hidden', shouldHide);
}

function getSelectedBoat() {
  const value = elements.boatModel?.value;
  if (!value) return null;
  return state.catalog.boats.find((boat) => boat.label === value || boat.id === value) || null;
}

function renderBoatSummary() {
  if (!elements.boatSummary) return;
  const boat = getSelectedBoat();
  if (!boat || elements.serviceType?.value !== 'noleggio') {
    elements.boatSummary.innerHTML = '';
    toggleHidden(elements.boatSummary, true);
    return;
  }

  const featuresList = (boat.features || []).map((item) => `<li>${item}</li>`).join('');
  elements.boatSummary.innerHTML = `
    <div class="boat-summary__media">
      <img src="${boat.image}" alt="${boat.label}" loading="lazy">
    </div>
    <div class="boat-summary__body">
      <h4>${boat.label}</h4>
      <p class="boat-summary__meta">${boat.power || ''}</p>
      ${featuresList ? `<ul class="boat-summary__features">${featuresList}</ul>` : ''}
    </div>
  `;
  toggleHidden(elements.boatSummary, false);
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
  elements.serviceType.innerHTML = '<option value="">Seleziona</option>';
  [
    { value: 'noleggio', label: 'Noleggio gommone' },
    { value: 'escursione', label: 'Escursione guidata' },
  ].forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    elements.serviceType.appendChild(option);
  });

  elements.boatModel.innerHTML = '';
  if (elements.boatModel) {
    elements.boatModel.innerHTML = '<option value="">Seleziona gommone</option>';
    state.catalog.boats.forEach((boat) => {
      const option = document.createElement('option');
      option.value = boat.label;
      option.textContent = boat.label;
      elements.boatModel.appendChild(option);
    });
  }

  elements.tour.innerHTML = '';
  if (elements.tour) {
    state.catalog.tours.forEach((experience) => {
      const option = document.createElement('option');
      option.value = experience;
      option.textContent = experience;
      elements.tour.appendChild(option);
    });
  }

  renderBoatSummary();
}

function handleServiceTypeChange(value) {
  const isRental = value === 'noleggio';
  const isTour = value === 'escursione';
  toggleHidden(elements.boatField, !isRental);
  toggleHidden(elements.tourField, !isTour);
  if (!isRental) {
    renderBoatSummary();
  } else {
    renderBoatSummary();
  }
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
    card.innerHTML = `
      <header>
        <div>
          <strong>${formatDateTime(booking.date, booking.time)}</strong>
          <p>${booking.service_type === 'noleggio' ? 'Noleggio gommone' : 'Escursione guidata'}</p>
        </div>
        <span class="status-pill ${statusClass}">${booking.status}</span>
      </header>
      <p><strong>Ospiti:</strong> ${booking.people}</p>
      <p><strong>Dettagli:</strong> ${booking.service_type === 'noleggio' ? (booking.boat_model || 'Modello da definire') : (booking.tour || 'Itinerario da definire')}</p>
      <p><strong>Contatto:</strong> ${booking.phone}</p>
      ${booking.notes ? `<p><strong>Note:</strong> ${booking.notes}</p>` : ''}
    `;
    container.appendChild(card);
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
      <td>${formatDateTime(booking.date, booking.time)}</td>
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
      <td>—</td>
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
  } catch (error) {
    console.error('Errore caricamento admin bookings:', error);
    renderAdminTable();
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
    updateUserUI();
    const loaders = [];
    if (isBookingPage) loaders.push(loadClientBookings());
    if (isDashboardPage) loaders.push(loadAdminBookings());
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
    updateUserUI();
    const loaders = [];
    if (isBookingPage) loaders.push(loadClientBookings());
    if (isDashboardPage) loaders.push(loadAdminBookings());
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
      if (isDashboardPage) loaders.push(loadAdminBookings());
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

  if (elements.bookingForm) {
    elements.bookingForm.addEventListener('submit', handleBookingSubmit);
  }

  elements.boatModel?.addEventListener('change', renderBoatSummary);

  elements.refreshClientBookings?.addEventListener('click', loadClientBookings);
  elements.logoutBtn?.addEventListener('click', handleLogout);
  elements.portalAuthTrigger?.addEventListener('click', () => openPortalModal(activePortalTab));
  elements.guardLogin?.addEventListener('click', () => openPortalModal('login'));
  elements.portalCloseTriggers.forEach((trigger) => {
    trigger.addEventListener('click', closePortalModal);
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

  elements.adminRefresh?.addEventListener('click', loadAdminBookings);
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
