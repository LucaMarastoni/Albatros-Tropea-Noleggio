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
  sidebarName: document.getElementById('sidebarName'),
  sidebarRole: document.getElementById('sidebarRole'),
  sidebarAvatar: document.getElementById('sidebarAvatar'),
  welcomePanel: document.getElementById('welcomePanel'),
  clientArea: document.getElementById('clientArea'),
  adminArea: document.getElementById('adminArea'),
  bookingForm: document.getElementById('bookingForm'),
  bookingFeedback: document.getElementById('bookingFeedback'),
  serviceType: document.getElementById('serviceType'),
  boatField: document.getElementById('boatField'),
  boatModel: document.getElementById('boatModel'),
  tourField: document.getElementById('tourField'),
  tour: document.getElementById('tour'),
  clientBookings: document.getElementById('clientBookings'),
  refreshClientBookings: document.getElementById('refreshClientBookings'),
  adminFilterType: document.getElementById('adminFilterType'),
  adminFilterStatus: document.getElementById('adminFilterStatus'),
  adminRefresh: document.getElementById('adminRefresh'),
  adminStatTotal: document.getElementById('adminStatTotal'),
  adminStatPending: document.getElementById('adminStatPending'),
  adminStatToday: document.getElementById('adminStatToday'),
  adminTableBody: document.getElementById('adminTableBody'),
};

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
  if (!state.user) {
    elements.topUserName.textContent = 'Ospite';
    elements.topUserRole.textContent = '—';
    elements.sidebarName.textContent = 'Benvenuto';
    elements.sidebarRole.textContent = 'ospite';
    elements.sidebarAvatar.textContent = '⛵';
    elements.clientArea.classList.add('hidden');
    elements.adminArea.classList.add('hidden');
    elements.portalAuthTrigger?.classList.remove('hidden');
    elements.logoutBtn?.classList.add('hidden');
    prefillBookingContact();
    return;
  }

  const { full_name: fullName, email, role } = state.user;
  const displayName = fullName || email;

  elements.topUserName.textContent = displayName;
  elements.topUserRole.textContent = formatRole(role);
  elements.sidebarName.textContent = displayName;
  elements.sidebarRole.textContent = role;
  elements.sidebarAvatar.textContent = initialsFromName(displayName);

  elements.clientArea.classList.remove('hidden');
  if (role === 'admin') {
    elements.adminArea.classList.remove('hidden');
  } else {
    elements.adminArea.classList.add('hidden');
  }
  elements.portalAuthTrigger?.classList.add('hidden');
  elements.logoutBtn?.classList.remove('hidden');

  prefillBookingContact();
}

function populateServiceOptions() {
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
  state.catalog.boats.forEach((boat) => {
    const option = document.createElement('option');
    option.value = boat;
    option.textContent = boat;
    elements.boatModel.appendChild(option);
  });

  elements.tour.innerHTML = '';
  state.catalog.tours.forEach((experience) => {
    const option = document.createElement('option');
    option.value = experience;
    option.textContent = experience;
    elements.tour.appendChild(option);
  });
}

function handleServiceTypeChange(value) {
  const isRental = value === 'noleggio';
  const isTour = value === 'escursione';
  elements.boatField.classList.toggle('hidden', !isRental);
  elements.tourField.classList.toggle('hidden', !isTour);
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
  elements.adminStatTotal.textContent = state.stats.total ?? 0;
  elements.adminStatPending.textContent = state.stats.pending ?? 0;
  elements.adminStatToday.textContent = state.stats.todayTours ?? 0;
}

function renderAdminTable() {
  if (!state.user || state.user.role !== 'admin') return;

  const tbody = elements.adminTableBody;
  tbody.innerHTML = '';

  if (!state.adminBookings?.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
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
  if (!state.user || state.user.role !== 'admin') return;

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
  resetFeedback(elements.bookingFeedback);

  const formData = new FormData(elements.bookingForm);
  const payload = Object.fromEntries(formData.entries());

  if (!payload.customerName || !payload.phone || !payload.serviceType || !payload.date || !payload.time) {
    showFeedback(elements.bookingFeedback, 'Completa i campi obbligatori.', 'error');
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
    await Promise.all([loadClientBookings(), loadAdminBookings()]);
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
    await loadClientBookings();
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
      await Promise.all([loadClientBookings(), loadAdminBookings()]);
    } else {
      openPortalModal('login');
    }
  } catch (error) {
    console.warn('Sessione non disponibile:', error);
    openPortalModal('login');
  }
}

async function loadCatalog() {
  try {
    const catalog = await fetchJSON('/api/catalog', { method: 'GET' });
    state.catalog = catalog;
    populateServiceOptions();
  } catch (error) {
    console.error('Errore caricamento catalogo:', error);
  }
}

function attachEventListeners() {
  elements.serviceType.addEventListener('change', (event) => {
    handleServiceTypeChange(event.target.value);
  });

  elements.bookingForm.addEventListener('submit', handleBookingSubmit);
  elements.refreshClientBookings.addEventListener('click', loadClientBookings);
  elements.logoutBtn.addEventListener('click', handleLogout);
  elements.portalAuthTrigger?.addEventListener('click', () => openPortalModal(activePortalTab));
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

  elements.adminFilterType.addEventListener('change', (event) => {
    state.filters.type = event.target.value;
    loadAdminBookings();
  });

  elements.adminFilterStatus.addEventListener('change', (event) => {
    state.filters.status = event.target.value;
    loadAdminBookings();
  });

  elements.adminRefresh.addEventListener('click', loadAdminBookings);
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

  handleServiceTypeChange('');
  await loadCatalog();
  await checkSession();
});
