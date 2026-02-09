const state = {
  catalog: { boats: [], tours: [] },
};

const portalPage = document.body?.dataset?.portalPage || 'booking';
const LANG_STORAGE_KEY = 'siteLang';
const EXCURSION_WHATSAPP_PHONE = '393486646762';

const optionTranslations = {
  select: { it: 'Seleziona', en: 'Select' },
  selectBoat: { it: 'Seleziona gommone', en: 'Select boat' },
  selectTour: { it: 'Seleziona escursione', en: 'Select excursion' },
  rental: { it: 'Noleggio gommone', en: 'RIB rental' },
  tour: { it: 'Escursione guidata', en: 'Guided excursion' },
};

const SERVICE_LABELS = {
  noleggio: { it: 'Noleggio gommone', en: 'RIB rental' },
  escursione: { it: 'Escursione guidata', en: 'Guided excursion' },
};

const SUMMARY_LABELS = {
  contact: { it: 'Contatto', en: 'Contact' },
  service: { it: 'Servizio', en: 'Service' },
  date: { it: 'Data', en: 'Date' },
  time: { it: 'Orario', en: 'Time' },
  guests: { it: 'Ospiti', en: 'Guests' },
  notes: { it: 'Note', en: 'Notes' },
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

const TOUR_SCHEDULE = {
  'Costa degli Dei Explorer': '09:00',
  'Capo Vaticano Sunset Romance': '18:00',
  'Parghelia · Zambrone · Briatico': '09:30',
  'Tour Palmi Bagnara Scilla': '10:00',
};

const FORM_LIMITS = {
  minPeople: 1,
  maxPeople: 12,
  minTime: '08:00',
  maxTime: '20:00',
};

const RENTAL_TIME_SLOTS = {
  MORNING: { start: '09:00', end: '13:00', label: { it: 'Mattina', en: 'Morning' } },
  AFTERNOON: { start: '14:00', end: '18:00', label: { it: 'Pomeriggio', en: 'Afternoon' } },
  FULL_DAY: { start: '10:00', end: '18:00', label: { it: 'Intera giornata', en: 'Full day' } },
};

const elements = {
  bookingForm: document.getElementById('bookingForm'),
  bookingFeedback: document.getElementById('bookingFeedback'),
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
  timeField: document.getElementById('timeField'),
  timeSlotField: document.getElementById('timeSlotField'),
  timeSlotInputs: Array.from(document.querySelectorAll('input[name=\"timeSlot\"]')),
  endTimeField: document.getElementById('endTimeField'),
  boatSummary: document.getElementById('boatSummary'),
  tourSummary: document.getElementById('tourSummary'),
  bookingRecap: document.getElementById('bookingRecap'),
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

function getServiceLabel(serviceType) {
  return translateFromMap(SERVICE_LABELS, serviceType, serviceType || '');
}

function translateOption(key) {
  const lang = getCurrentLang();
  return optionTranslations[key]?.[lang] || optionTranslations[key]?.it || '';
}

function showToast(message, type = 'info') {
  if (!elements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

function normalizePhone(value = '') {
  let cleaned = value.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('00')) cleaned = `+${cleaned.slice(2)}`;
  return cleaned;
}

function formatPhone(value = '') {
  const normalized = normalizePhone(value);
  const digits = normalized.replace(/\D/g, '');
  if (!digits) return '';
  if (normalized.startsWith('+')) {
    const match = normalized.match(/^\\+\\d{1,3}/);
    const country = match ? match[0] : '+';
    const countryDigits = country.replace('+', '');
    const rest = digits.slice(countryDigits.length);
    const grouped = rest.replace(/(\\d{3})(?=\\d)/g, '$1 ');
    return `${country} ${grouped}`.trim();
  }
  return digits.replace(/(\\d{3})(?=\\d)/g, '$1 ').trim();
}

function isValidPhone(value = '') {
  const digits = normalizePhone(value).replace(/\\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

function findBoatByValue(value) {
  if (!value) return null;
  return state.catalog.boats.find((boat) => boat.label === value || boat.id === value) || null;
}

function findTourByValue(value) {
  if (!value) return null;
  return state.catalog.tours.find((tour) => tour.label === value || tour.id === value) || null;
}

function resolvePeopleLimits({ serviceType, boatValue, tourValue } = {}) {
  const min = FORM_LIMITS.minPeople;
  let max = FORM_LIMITS.maxPeople;

  if (serviceType === 'noleggio') {
    const boat = findBoatByValue(boatValue);
    const explicit = Number(boat?.maxPeople ?? boat?.max_people ?? boat?.capacity);
    if (Number.isFinite(explicit) && explicit > 0) {
      max = Math.min(explicit, FORM_LIMITS.maxPeople);
    }
  } else if (serviceType === 'escursione') {
    const tour = findTourByValue(tourValue);
    const explicit = Number(tour?.maxPeople ?? tour?.max_people ?? tour?.capacity);
    if (Number.isFinite(explicit) && explicit > 0) {
      max = Math.min(explicit, FORM_LIMITS.maxPeople);
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
  if (!serviceType) return t('Seleziona un servizio per vedere il massimo.', 'Select a service to see the maximum.');
  if (serviceType === 'noleggio' && !boatValue) return t('Seleziona il gommone per vedere il massimo.', 'Select the boat to see the maximum.');
  return t(`Massimo: ${max} persone (incl. bambini).`, `Maximum: ${max} people (incl. children).`);
}

function setFieldError(fieldName, message = '') {
  const wrapper = elements.bookingForm?.querySelector(`[data-field=\"${fieldName}\"]`);
  if (!wrapper) return;
  const errorNode = wrapper.querySelector('.field__error');
  const control = wrapper.querySelector('input, select, textarea');
  if (errorNode) errorNode.textContent = message;
  wrapper.classList.toggle('is-error', Boolean(message));
  if (control) {
    if (message) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
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
  const boat = findBoatByValue(elements.boatModel?.value);
  if (!boat || elements.serviceType?.value !== 'noleggio') {
    elements.boatSummary.innerHTML = '';
    elements.boatSummary.classList.add('hidden');
    return;
  }
  const featuresList = (boat.features || []).map((item) => `<li>${item}</li>`).join('');
  elements.boatSummary.innerHTML = `
    <div class=\"boat-summary__media\">
      <img src=\"${boat.image}\" alt=\"${boat.label}\" loading=\"lazy\">
    </div>
    <div class=\"boat-summary__body\">
      <h4>${boat.label}</h4>
      <p class=\"boat-summary__meta\">${boat.power || ''}</p>
      ${featuresList ? `<ul class=\"boat-summary__features\">${featuresList}</ul>` : ''}
    </div>
  `;
  elements.boatSummary.classList.remove('hidden');
}

function renderTourSummary() {
  if (!elements.tourSummary) return;
  const isTour = elements.serviceType?.value === 'escursione';
  const tour = findTourByValue(elements.tour?.value);
  if (!isTour || !tour) {
    elements.tourSummary.innerHTML = '';
    elements.tourSummary.classList.add('hidden');
    return;
  }
  const featuresList = (tour.features || []).map((item) => `<li>${item}</li>`).join('');
  const timeInfo = tour.time ? `<p class=\"tour-summary__meta\">${getCurrentLang() === 'en' ? 'Departure' : 'Partenza'}: ${tour.time}</p>` : '';
  elements.tourSummary.innerHTML = `
    <div class=\"tour-summary__media\">
      <img src=\"${tour.image}\" alt=\"${tour.label}\" loading=\"lazy\">
    </div>
    <div class=\"tour-summary__body\">
      <h4>${tour.label}</h4>
      ${timeInfo}
      ${featuresList ? `<ul class=\"tour-summary__features\">${featuresList}</ul>` : ''}
    </div>
  `;
  elements.tourSummary.classList.remove('hidden');
}

function getSlotInfo(slotValue = '') {
  return RENTAL_TIME_SLOTS[slotValue] || null;
}

function applyTimeSlotSelection(slotValue) {
  const form = elements.bookingForm;
  if (!form) return;
  const timeInput = form.elements.time;
  const endInput = form.elements.endTime;
  if (!timeInput || !endInput) return;
  const slot = getSlotInfo(slotValue || form.elements.timeSlot?.value || '');
  if (!slot) {
    timeInput.value = '';
    endInput.value = '';
    return;
  }
  timeInput.value = slot.start;
  endInput.value = slot.end;
  syncTimeConstraints();
}

function clearTimeSlotSelection() {
  elements.timeSlotInputs?.forEach((input) => {
    input.checked = false;
  });
  applyTimeSlotSelection('');
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

function enforceExcursionTime() {
  const timeInput = elements.bookingForm?.elements?.time;
  if (!timeInput) return;
  const isTour = elements.serviceType?.value === 'escursione';
  if (!isTour) {
    timeInput.readOnly = false;
    syncTimeConstraints();
    updateBookingRecap();
    return;
  }
  const selectedTour = elements.tour?.value;
  const fixedTime = selectedTour && TOUR_SCHEDULE[selectedTour] ? TOUR_SCHEDULE[selectedTour] : '09:00';
  timeInput.value = fixedTime;
  timeInput.readOnly = true;
  syncTimeConstraints();
  updateBookingRecap();
}

function formatDateLabel(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(getLocale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatSlotLabel(slotValue, lang) {
  const slot = getSlotInfo(slotValue);
  if (!slot) return '';
  const label = slot.label[lang] || slot.label.it;
  return `${slot.start}–${slot.end} (${label})`;
}

function setButtonLoading(button, isLoading, loadingText = '') {
  if (!button) return;
  if (isLoading) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }
    if (loadingText) button.textContent = loadingText;
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
  const timeSlot = form.elements.timeSlot?.value || '';
  const people = form.elements.people?.value || '';
  const notes = form.elements.notes?.value.trim() || '';

  const serviceDetail = serviceType === 'noleggio' ? boat : serviceType === 'escursione' ? tour : '';
  const serviceLabel = serviceType ? `${getServiceLabel(serviceType)}${serviceDetail ? ` · ${serviceDetail}` : ''}` : '—';

  const formattedPhone = formatPhone(phone) || phone;
  const slotLabel = timeSlot ? formatSlotLabel(timeSlot, getCurrentLang()) : '';
  const timeDisplay = serviceType === 'noleggio' ? (slotLabel || '—') : (time || '—');

  const summaryItems = [
    { label: translateFromMap(SUMMARY_LABELS, 'contact', 'Contatto'), value: [name, formattedPhone].filter(Boolean).join(' · ') || '—' },
    { label: translateFromMap(SUMMARY_LABELS, 'service', 'Servizio'), value: serviceLabel || '—' },
    { label: translateFromMap(SUMMARY_LABELS, 'date', 'Data'), value: date ? formatDateLabel(date) : '—' },
    { label: translateFromMap(SUMMARY_LABELS, 'time', 'Orario'), value: timeDisplay },
    { label: translateFromMap(SUMMARY_LABELS, 'guests', 'Ospiti'), value: people || '—' },
    { label: translateFromMap(SUMMARY_LABELS, 'notes', 'Note'), value: notes || '—' },
  ];

  elements.bookingRecapList.innerHTML = summaryItems
    .map((item) => `<div class=\"booking-recap__item\"><span>${item.label}</span><strong>${item.value}</strong></div>`)
    .join('');

  const missingRequired = !name || !phone || !serviceType || !date
    || (serviceType === 'noleggio' && (!boat || !timeSlot))
    || (serviceType === 'escursione' && (!tour || !time));
  if (elements.bookingRecapStatus) {
    elements.bookingRecapStatus.textContent = missingRequired
      ? (getCurrentLang() === 'en'
        ? 'Complete required fields to send your request.'
        : 'Completa i campi obbligatori per inviare la richiesta.')
      : '';
  }
}

function validateBookingPayload(payload = {}) {
  const lang = getCurrentLang();
  const t = (it, en) => (lang === 'en' ? en : it);
  const errors = {};
  const nameValue = (payload.customerName || '').trim();
  const phoneValue = (payload.phone || '').trim();

  if (!nameValue) errors.customerName = t('Inserisci il nome del referente.', 'Enter the contact name.');

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
  }

  const isRental = payload.serviceType === 'noleggio';
  if (isRental) {
    const slotInfo = getSlotInfo(payload.timeSlot);
    if (!slotInfo) {
      errors.timeSlot = t('Seleziona una fascia oraria.', 'Select a time slot.');
    } else {
      payload.time = slotInfo.start;
      payload.endTime = slotInfo.end;
    }
  }

  if (payload.serviceType === 'noleggio' && !payload.boatModel) {
    errors.boatModel = t('Seleziona il gommone per il noleggio.', 'Select the RIB for rental.');
  }

  if (payload.serviceType === 'escursione' && !payload.tour) {
    errors.tour = t('Seleziona l\'itinerario dell\'escursione.', 'Select the excursion itinerary.');
  }

  if (!payload.time && !isRental) {
    errors.time = t('Indica l\'orario di partenza.', 'Select a departure time.');
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

function buildWhatsappMessage(payload = {}) {
  const serviceLabel = getServiceLabel(payload.serviceType) || 'Servizio';
  const detail = payload.serviceType === 'noleggio'
    ? (payload.boatModel || '')
    : (payload.tour || '');
  const dateLabel = payload.date ? formatDateLabel(payload.date) : '';
  const timeLabel = payload.serviceType === 'noleggio'
    ? formatSlotLabel(payload.timeSlot, getCurrentLang()) || payload.time
    : payload.time;
  const notesSection = payload.notes ? `\nNote: ${payload.notes}` : '';
  const detailSection = detail
    ? `\n${payload.serviceType === 'noleggio' ? 'Gommone' : 'Escursione'}: ${detail}`
    : '';

  return `Buongiorno,
vorrei prenotare il seguente servizio:

Servizio: ${serviceLabel}${detailSection}
Data: ${dateLabel}
Orario: ${timeLabel}
Partecipanti: ${payload.people}

Nome: ${payload.customerName}
Telefono: ${payload.phone}${notesSection}

Grazie!`;
}

function buildWhatsappLink(payload = {}) {
  const message = buildWhatsappMessage(payload);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${EXCURSION_WHATSAPP_PHONE}?text=${encoded}`;
}

function openWhatsappLink(url) {
  try {
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      window.location.href = url;
    }
    return true;
  } catch (error) {
    console.error('Impossibile aprire WhatsApp:', error);
    return false;
  }
}

function handleBookingFormInput(event) {
  const fieldName = event?.target?.name;
  if (!fieldName) return;
  if (fieldName === 'people') {
    syncPeopleConstraints();
  } else if (fieldName === 'timeSlot') {
    applyTimeSlotSelection();
    setFieldError('timeSlot', '');
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
  if (formatted) input.value = formatted;
  updateBookingRecap();
}

function populateServiceOptions() {
  if (!elements.serviceType) return;
  const prevService = elements.serviceType.value;
  elements.serviceType.innerHTML = `<option value=\"\">${translateOption('select')}</option>`;
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

  if (elements.boatModel) {
    const prevBoat = elements.boatModel.value;
    elements.boatModel.innerHTML = `<option value=\"\">${translateOption('selectBoat')}</option>`;
    state.catalog.boats.forEach((boat) => {
      const option = document.createElement('option');
      option.value = boat.label;
      option.textContent = boat.label;
      elements.boatModel.appendChild(option);
    });
    if (prevBoat) elements.boatModel.value = prevBoat;
  }

  if (elements.tour) {
    const prevTour = elements.tour.value;
    elements.tour.innerHTML = `<option value=\"\">${translateOption('selectTour')}</option>`;
    state.catalog.tours.forEach((experience) => {
      const option = document.createElement('option');
      option.value = experience.label;
      option.textContent = experience.label;
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
  elements.boatField?.classList.toggle('hidden', !isRental);
  elements.tourField?.classList.toggle('hidden', !isTour);
  elements.timeSlotField?.classList.toggle('hidden', !isRental);
  elements.timeField?.classList.toggle('hidden', isRental);
  elements.endTimeField?.classList.toggle('hidden', true);
  if (isRental) {
    applyTimeSlotSelection();
  } else {
    clearTimeSlotSelection();
  }
  enforceExcursionTime();
  renderBoatSummary();
  renderTourSummary();
  syncPeopleConstraints();
  updateBookingRecap();
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  if (!elements.bookingForm) return;
  elements.bookingFeedback.textContent = '';
  elements.bookingFeedback.classList.remove('success', 'error');
  clearAllFieldErrors();

  const formData = new FormData(elements.bookingForm);
  const payload = Object.fromEntries(formData.entries());
  const { errors, normalizedPayload } = validateBookingPayload(payload);

  if (Object.keys(errors).length) {
    Object.entries(errors).forEach(([field, message]) => setFieldError(field, message));
    const message = getCurrentLang() === 'en'
      ? 'Please review the highlighted fields.'
      : 'Controlla i campi evidenziati.';
    elements.bookingFeedback.textContent = message;
    elements.bookingFeedback.classList.add('error');
    showToast(message, 'error');
    const firstField = Object.keys(errors)[0];
    const wrapper = elements.bookingForm.querySelector(`[data-field=\"${firstField}\"]`);
    const control = wrapper?.querySelector('input, select, textarea');
    control?.focus();
    return;
  }

  setButtonLoading(elements.bookingSubmit, true, getCurrentLang() === 'en' ? 'Apro WhatsApp…' : 'Apro WhatsApp…');
  elements.bookingForm.setAttribute('aria-busy', 'true');

  const whatsappLink = buildWhatsappLink(normalizedPayload);
  const opened = openWhatsappLink(whatsappLink);
  if (!opened) {
    const errMsg = getCurrentLang() === 'en'
      ? 'Unable to open WhatsApp. Please try again.'
      : 'Impossibile aprire WhatsApp. Riprova.';
    elements.bookingFeedback.textContent = errMsg;
    elements.bookingFeedback.classList.add('error');
    showToast(errMsg, 'error');
    elements.bookingForm.removeAttribute('aria-busy');
    setButtonLoading(elements.bookingSubmit, false);
    return;
  }

  elements.bookingForm.reset();
  handleServiceTypeChange('');
  applyDateConstraints();
  const successMessage = getCurrentLang() === 'en'
    ? 'WhatsApp aperto. Controlla il messaggio e premi Invia.'
    : 'WhatsApp aperto. Controlla il messaggio e premi Invia.';
  elements.bookingFeedback.textContent = successMessage;
  elements.bookingFeedback.classList.add('success');
  showToast(successMessage, 'success');

  elements.bookingForm.removeAttribute('aria-busy');
  setButtonLoading(elements.bookingSubmit, false);
  updateBookingRecap();
}

async function loadCatalog() {
  if (!elements.serviceType) return;
  try {
    const catalog = window.CATALOG || { boats: [], tours: [] };
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
    showToast(error.message || 'Impossibile caricare i servizi', 'error');
  }
}

function applyServicePreselect() {
  if (!elements.serviceType) return;
  const params = new URLSearchParams(window.location.search);
  const tourParam = params.get('tour') || params.get('escursione');
  const boatParam = params.get('boat');
  if (tourParam) {
    elements.serviceType.value = 'escursione';
    handleServiceTypeChange('escursione');
    const tours = state.catalog?.tours || [];
    const matched = tours.find((tour) => tour?.id === tourParam || tour?.label === tourParam);
    const nextValue = matched?.label || tourParam;
    if ([...elements.tour.options].some((opt) => opt.value === nextValue)) {
      elements.tour.value = nextValue;
    }
  } else if (boatParam) {
    elements.serviceType.value = 'noleggio';
    handleServiceTypeChange('noleggio');
    const boats = state.catalog?.boats || [];
    const matched = boats.find((boat) => boat?.id === boatParam || boat?.label === boatParam);
    const nextValue = matched?.label || boatParam;
    if ([...elements.boatModel.options].some((opt) => opt.value === nextValue)) {
      elements.boatModel.value = nextValue;
    }
  }
  renderBoatSummary();
  renderTourSummary();
  syncPeopleConstraints();
  updateBookingRecap();
}

function attachEventListeners() {
  elements.serviceType?.addEventListener('change', (event) => {
    handleServiceTypeChange(event.target.value);
  });

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

  document.querySelectorAll('[data-people-stepper]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const delta = btn.dataset.peopleStepper === 'decrement' ? -1 : 1;
      adjustPeopleValue(delta);
    });
  });

  window.addEventListener('language:change', () => {
    populateServiceOptions();
    renderBoatSummary();
    renderTourSummary();
    enforceExcursionTime();
    syncPeopleConstraints();
    updateBookingRecap();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  if (portalPage !== 'booking') return;
  attachEventListeners();
  applyDateConstraints();
  syncTimeConstraints();
  syncPeopleConstraints();
  updateBookingRecap();
  await loadCatalog();
  applyServicePreselect();
});
