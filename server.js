const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
let argon2 = null;
try {
  // Optional dependency; preferred when available
  argon2 = require('argon2');
} catch (_error) {
  argon2 = null;
}
const helmet = require('helmet');
const cors = require('cors');
const createDatabase = require('./db');

const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-please';
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data.sqlite');

const db = createDatabase(DB_FILE);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const PHONE_REGEX = /^[+0-9\s().-]{6,20}$/;
const BOOKING_STATUSES = new Set(['da confermare', 'confermato', 'completato', 'annullato']);
const PASSWORD_MIN_LENGTH = 8;
const BCRYPT_COST = 12;
const LOGIN_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LIMIT_MAX = 6;
const MAX_FULLNAME_LENGTH = 120;
const MAX_GENERIC_LENGTH = 160;
const MAX_NOTE_LENGTH = 1000;
const MAX_INTERNAL_NOTE_LENGTH = 2000;
const MAX_PHONE_LENGTH = 32;
const MAX_STAFF_NOTE_LENGTH = 3000;
const MAX_CLIENT_MESSAGE_LENGTH = 2000;

const loginAttempts = new Map();

const USER_SCHEMA = {
  hasLegacyPassword: false,
  hasPasswordAlgo: false,
  hasPasswordUpdatedAt: false,
};

const PASSWORD_ALGO = argon2 ? 'argon2id' : 'bcrypt';

function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

function sanitizeName(name = '', maxLength = MAX_FULLNAME_LENGTH) {
  return name.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function sanitizeOptionalText(value, maxLength = MAX_GENERIC_LENGTH) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function sanitizePhone(phone = '') {
  if (typeof phone !== 'string') return '';
  return phone.replace(/[^+\d().\-\s]/g, '').trim().slice(0, MAX_PHONE_LENGTH);
}

function getTableColumns(table) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return new Set(rows.map((row) => row.name));
}

function ensureUserSchema() {
  const columns = getTableColumns('users');

  if (!columns.has('password_hash')) {
    db.prepare('ALTER TABLE users ADD COLUMN password_hash TEXT').run();
  }
  if (!columns.has('password_algo')) {
    db.prepare('ALTER TABLE users ADD COLUMN password_algo TEXT').run();
  }
  if (!columns.has('password_updated_at')) {
    db.prepare('ALTER TABLE users ADD COLUMN password_updated_at TEXT').run();
  }

  USER_SCHEMA.hasLegacyPassword = columns.has('password');
  USER_SCHEMA.hasPasswordAlgo = true;
  USER_SCHEMA.hasPasswordUpdatedAt = true;
}

async function hashPassword(plainText) {
  if (argon2) {
    return argon2.hash(plainText, {
      type: argon2.argon2id,
      timeCost: 3,
      memoryCost: 2 ** 16,
      parallelism: 1,
    });
  }
  return Promise.resolve(bcrypt.hashSync(plainText, BCRYPT_COST));
}

async function verifyPassword(plainText, user) {
  if (!user) return false;
  if (user.password_hash) {
    if (user.password_hash.startsWith('$argon2')) {
      return argon2 ? argon2.verify(user.password_hash, plainText) : false;
    }
    if (user.password_hash.startsWith('$2')) {
      return Promise.resolve(bcrypt.compareSync(plainText, user.password_hash));
    }
    return Promise.resolve(bcrypt.compareSync(plainText, user.password_hash));
  }
  if (USER_SCHEMA.hasLegacyPassword && user.password) {
    return plainText === user.password;
  }
  return false;
}

async function upgradePasswordIfNeeded(user, plainText) {
  if (!user) return;
  const usesLegacy = USER_SCHEMA.hasLegacyPassword && user.password && !user.password_hash;
  const needsAlgoUpgrade = user.password_hash && PASSWORD_ALGO === 'argon2id' && user.password_hash.startsWith('$2');
  if (!usesLegacy && !needsAlgoUpgrade) return;

  const nextHash = await hashPassword(plainText);
  const updates = ['password_hash = @passwordHash'];
  const params = {
    passwordHash: nextHash,
    id: user.id,
  };

  if (USER_SCHEMA.hasPasswordAlgo) {
    updates.push('password_algo = @passwordAlgo');
    params.passwordAlgo = PASSWORD_ALGO;
  }
  if (USER_SCHEMA.hasPasswordUpdatedAt) {
    updates.push('password_updated_at = @passwordUpdatedAt');
    params.passwordUpdatedAt = new Date().toISOString();
  }
  if (USER_SCHEMA.hasLegacyPassword) {
    updates.push('password = NULL');
  }

  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = @id`).run(params);
}

function registerLoginFailure(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, resetAt: now + LOGIN_LIMIT_WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + LOGIN_LIMIT_WINDOW_MS;
  }
  entry.count += 1;
  loginAttempts.set(ip, entry);
  return entry.count > LOGIN_LIMIT_MAX;
}

function clearLoginFailures(ip) {
  loginAttempts.delete(ip);
}

function isLoginRateLimited(ip) {
  const entry = loginAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    loginAttempts.delete(ip);
    return false;
  }
  return entry.count >= LOGIN_LIMIT_MAX;
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

async function bootstrapDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'admin')),
      phone TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      service_type TEXT NOT NULL CHECK(service_type IN ('noleggio', 'escursione')),
      boat_model TEXT,
      tour TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      end_time TEXT,
      people INTEGER NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'da confermare',
      internal_note TEXT DEFAULT '',
      client_message TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS staff_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  ensureUserSchema();

  try {
    db.prepare("ALTER TABLE bookings ADD COLUMN client_message TEXT DEFAULT ''").run();
  } catch (error) {
    // column may already exist
  }

  try {
    db.prepare("ALTER TABLE bookings ADD COLUMN end_time TEXT").run();
  } catch (error) {
    // column may already exist
  }

  const adminExists = db
    .prepare('SELECT COUNT(*) as count FROM users WHERE role = ?')
    .get('admin');

  if (!adminExists.count) {
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const hash = await hashPassword(password);
    db.prepare(`
      INSERT INTO users (full_name, email, password_hash, password_algo, password_updated_at, role, phone)
      VALUES (@fullName, @email, @passwordHash, @passwordAlgo, @passwordUpdatedAt, 'admin', @phone)
    `).run({
      fullName: 'Admin Tropea Wave',
      email: process.env.ADMIN_EMAIL || 'admin@tropeawavecharter.it',
      passwordHash: hash,
      passwordAlgo: PASSWORD_ALGO,
      passwordUpdatedAt: new Date().toISOString(),
      phone: '+39 328 000 0000',
    });

    console.log('Admin account created:');
    console.log(`  email   : ${process.env.ADMIN_EMAIL || 'admin@tropeawavecharter.it'}`);
    console.log('  password: (set via ADMIN_PASSWORD env var)');
  }
}

const app = express();

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: false,
}));
app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
}));

const TOUR_MAX_PEOPLE = 12;

const catalog = {
  boats: [
    {
      id: 'zar50-2024',
      label: 'Gommone senza patente (2 posti)',
      power: '40 cv',
      features: ['Senza patente', 'Stereo bluetooth', 'GPS cartografico', 'Ecoscandaglio', '2 posti'],
      image: 'assets/img/32.jpg',
    },
    {
      id: 'zar65',
      label: 'ZAR 65 (9/10 posti)',
      power: '150 cv',
      features: ['Doccia', 'GPS cartografico', 'Tendalino', 'Ancora elettrica', '9/10 posti comodi'],
      image: 'assets/img/2.jpg',
    },
    {
      id: 'zar53',
      label: 'ZAR 53 (8 posti)',
      power: '90 cv',
      features: ['Doccia', 'Tendalino', 'Ancora', 'Ecoscandaglio', '8 posti comodi'],
      image: 'assets/img/3.jpg',
    },
    {
      id: 'zar49',
      label: 'ZAR 49 (6 posti)',
      power: '40 cv',
      features: ['Doccia', 'Ecoscandaglio', 'Tendalino', '6 posti comodi'],
      image: 'assets/img/4.jpg',
    },
  ],
  tours: [
    {
      id: 'costa-degli-dei',
      label: 'Costa degli Dei Explorer',
      image: 'assets/img/6.jpg',
      features: ['3 ore tra Tropea e Capo Vaticano', 'Snorkeling allo Scoglio di Riaci', 'Soste in calette accessibili solo via mare'],
      time: '09:00',
      maxPeople: TOUR_MAX_PEOPLE,
    },
    {
      id: 'sunset-romance',
      label: 'Capo Vaticano Sunset Romance',
      image: 'assets/img/7.jpg',
      features: ['Tour al tramonto', 'Grotta degli Innamorati', 'Aperitivo romantico a bordo'],
      time: '18:00',
      maxPeople: TOUR_MAX_PEOPLE,
    },
    {
      id: 'parghelia-tour',
      label: 'Parghelia · Zambrone · Briatico',
      image: 'assets/img/9.jpg',
      features: ['3 ore di tour personalizzato', 'Vardanello, Michelino e Baia della Tonnara', 'Snorkeling e acque trasparenti'],
      time: '09:30',
      maxPeople: TOUR_MAX_PEOPLE,
    },
  ],
};

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, password, password_algo, password_updated_at, ...rest } = user;
  return rest;
}

function loadUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(normalizeEmail(email));
}

function loadUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non autenticato' });
  }
  const user = loadUserById(req.session.userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'Sessione non valida' });
  }
  req.user = user;
  return next();
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permesso negato' });
  }
  return next();
}

app.post('/api/register', async (req, res) => {
  const { fullName, email, password, phone } = req.body || {};
  const sanitizedFullName = sanitizeName(typeof fullName === 'string' ? fullName : '');
  const normalizedEmail = normalizeEmail(typeof email === 'string' ? email : '');
  const passwordValue = typeof password === 'string' ? password.trim() : '';
  const rawPhone = typeof phone === 'string' ? phone.trim() : '';

  if (!sanitizedFullName || !normalizedEmail || !passwordValue) {
    return res.status(400).json({ error: 'Compila tutti i campi obbligatori' });
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Formato email non valido' });
  }

  if (passwordValue.length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({ error: 'La password deve contenere almeno 8 caratteri' });
  }

  if (rawPhone && !PHONE_REGEX.test(rawPhone)) {
    return res.status(400).json({ error: 'Numero di telefono non valido' });
  }

  const existing = loadUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'Email già registrata' });
  }

  let passwordHash = '';
  try {
    passwordHash = await hashPassword(passwordValue);
  } catch (error) {
    console.error('Errore hashing password', error);
    return res.status(500).json({ error: 'Errore salvataggio utente' });
  }
  try {
    const result = db.prepare(`
      INSERT INTO users (full_name, email, password_hash, password_algo, password_updated_at, role, phone)
      VALUES (@fullName, @email, @passwordHash, @passwordAlgo, @passwordUpdatedAt, 'user', @phone)
    `).run({
      fullName: sanitizedFullName,
      email: normalizedEmail,
      passwordHash,
      passwordAlgo: PASSWORD_ALGO,
      passwordUpdatedAt: new Date().toISOString(),
      phone: rawPhone ? sanitizePhone(rawPhone) : null,
    });

    req.session.userId = result.lastInsertRowid;
  } catch (error) {
    console.error('Errore registrazione utente', error);
    return res.status(500).json({ error: 'Errore salvataggio utente' });
  }

  const user = loadUserById(req.session.userId);
  return res.status(201).json({ user: sanitizeUser(user) });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = normalizeEmail(typeof email === 'string' ? email : '');
  const passwordValue = typeof password === 'string' ? password : '';
  const clientIp = getClientIp(req);

  if (!normalizedEmail || !passwordValue) {
    return res.status(400).json({ error: 'Inserisci email e password' });
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Formato email non valido' });
  }

  if (isLoginRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Troppi tentativi. Riprova più tardi.' });
  }

  const user = loadUserByEmail(normalizedEmail);
  const valid = await verifyPassword(passwordValue, user);
  if (!user || !valid) {
    registerLoginFailure(clientIp);
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  await upgradePasswordIfNeeded(user, passwordValue);
  clearLoginFailures(clientIp);

  req.session.userId = user.id;
  return res.json({ user: sanitizeUser(user) });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Impossibile chiudere la sessione' });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});

app.get('/api/session', (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }
  const user = loadUserById(req.session.userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.json({ user: null });
  }
  return res.json({ user: sanitizeUser(user) });
});

app.get('/api/catalog', (_req, res) => {
  res.json(catalog);
});

app.post('/api/bookings', requireAuth, (req, res) => {
  const {
    customerName,
    serviceType,
    date,
    time,
    endTime,
    people,
    boatModel,
    tour,
    notes,
    phone,
  } = req.body || {};

  const sanitizedName = sanitizeName(typeof customerName === 'string' ? customerName : '');
  const normalizedServiceType = typeof serviceType === 'string' ? serviceType.trim() : '';
  const sanitizedDate = typeof date === 'string' ? date.trim() : '';
  const sanitizedTime = typeof time === 'string' ? time.trim() : '';
  const sanitizedEndTime = typeof endTime === 'string' ? endTime.trim() : '';
  const rawPhone = typeof phone === 'string' ? phone.trim() : '';
  const peopleCount = Number.parseInt(people, 10);
  const sanitizedBoatModel = sanitizeOptionalText(boatModel, MAX_GENERIC_LENGTH);
  const sanitizedTour = sanitizeOptionalText(tour, MAX_GENERIC_LENGTH);
  const sanitizedNotes = sanitizeOptionalText(notes, MAX_NOTE_LENGTH);

  if (!sanitizedName || !normalizedServiceType || !sanitizedDate || !sanitizedTime || Number.isNaN(peopleCount) || !rawPhone) {
    return res.status(400).json({ error: 'Compila i campi obbligatori del modulo' });
  }

  if (!['noleggio', 'escursione'].includes(normalizedServiceType)) {
    return res.status(400).json({ error: 'Tipo di servizio non valido' });
  }

  if (!DATE_REGEX.test(sanitizedDate)) {
    return res.status(400).json({ error: 'Data non valida' });
  }

  if (!TIME_REGEX.test(sanitizedTime)) {
    return res.status(400).json({ error: 'Orario non valido' });
  }

  if (normalizedServiceType === 'noleggio') {
    if (!sanitizedEndTime) {
      return res.status(400).json({ error: 'Inserisci l\'orario di rientro' });
    }
    if (!TIME_REGEX.test(sanitizedEndTime)) {
      return res.status(400).json({ error: 'Orario di rientro non valido' });
    }
  }

  if (!Number.isInteger(peopleCount) || peopleCount < 1 || peopleCount > 12) {
    return res.status(400).json({ error: 'Numero di ospiti non valido' });
  }

  if (!PHONE_REGEX.test(rawPhone)) {
    return res.status(400).json({ error: 'Numero di telefono non valido' });
  }

  const bookingStmt = db.prepare(`
    INSERT INTO bookings (
      user_id, customer_name, email, phone,
      service_type, boat_model, tour,
      date, time, end_time, people, notes, client_message
    ) VALUES (
      @userId, @customerName, @email, @phone,
      @serviceType, @boatModel, @tour,
      @date, @time, @endTime, @people, @notes, ''
    )
  `);

  try {
    const result = bookingStmt.run({
      userId: req.user.id,
      customerName: sanitizedName,
      email: req.user.email,
      phone: sanitizePhone(rawPhone),
      serviceType: normalizedServiceType,
      boatModel: normalizedServiceType === 'noleggio' ? sanitizedBoatModel : '',
      tour: normalizedServiceType === 'escursione' ? sanitizedTour : '',
      date: sanitizedDate,
      time: sanitizedTime,
      endTime: sanitizedEndTime || null,
      people: peopleCount,
      notes: sanitizedNotes,
    });

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ booking });
  } catch (error) {
    console.error('Errore salvataggio prenotazione', error);
    return res.status(500).json({ error: 'Errore salvataggio prenotazione' });
  }
});

app.get('/api/bookings', requireAuth, (req, res) => {
  const { serviceType, status } = req.query;

  let query = `
    SELECT b.*, u.full_name as user_full_name
    FROM bookings b
    INNER JOIN users u ON u.id = b.user_id
    WHERE 1=1
  `;
  const params = {};

  if (req.user.role !== 'admin') {
    query += ' AND b.user_id = @userId';
    params.userId = req.user.id;
  }

  if (serviceType && ['noleggio', 'escursione'].includes(serviceType)) {
    query += ' AND b.service_type = @serviceType';
    params.serviceType = serviceType;
  }

  if (status) {
    if (!BOOKING_STATUSES.has(status)) {
      return res.status(400).json({ error: 'Stato non valido' });
    }
    query += ' AND b.status = @status';
    params.status = status;
  }

  query += ' ORDER BY b.date ASC, b.time ASC';

  let bookings = [];
  try {
    bookings = db.prepare(query).all(params);
  } catch (error) {
    console.error('Errore recupero prenotazioni', error);
    return res.status(500).json({ error: 'Errore recupero prenotazioni' });
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'da confermare').length,
    todayTours: bookings.filter((b) => {
      if (b.service_type !== 'escursione') return false;
      const today = new Date().toISOString().slice(0, 10);
      return b.date === today;
    }).length,
  };

  return res.json({ bookings, stats });
});

app.patch('/api/bookings/:id', requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, internalNote, clientMessage, endTime } = req.body || {};
  const bookingId = Number.parseInt(id, 10);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return res.status(400).json({ error: 'ID prenotazione non valido' });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Prenotazione non trovata' });
  }

  const updates = [];
  const params = {};

  if (typeof status !== 'undefined') {
    if (!BOOKING_STATUSES.has(status)) {
      return res.status(400).json({ error: 'Stato non valido' });
    }
    updates.push('status = @status');
    params.status = status;
  }

  if (typeof internalNote === 'string') {
    const sanitizedInternalNote = sanitizeOptionalText(internalNote, MAX_INTERNAL_NOTE_LENGTH);
    updates.push('internal_note = @internalNote');
    params.internalNote = sanitizedInternalNote;
  }

  if (typeof clientMessage === 'string') {
    const sanitizedClientMessage = sanitizeOptionalText(clientMessage, MAX_CLIENT_MESSAGE_LENGTH);
    updates.push('client_message = @clientMessage');
    params.clientMessage = sanitizedClientMessage;
  }

  if (typeof endTime === 'string' && endTime) {
    if (!TIME_REGEX.test(endTime.trim())) {
      return res.status(400).json({ error: 'Orario di rientro non valido' });
    }
    updates.push('end_time = @endTime');
    params.endTime = endTime.trim();
  }

  if (!updates.length) {
    return res.status(400).json({ error: 'Nessun campo aggiornabile fornito' });
  }

  updates.push("updated_at = datetime('now')");
  params.id = bookingId;

  const updateQuery = `
    UPDATE bookings
    SET ${updates.join(', ')}
    WHERE id = @id
  `;

  try {
    db.prepare(updateQuery).run(params);
  } catch (error) {
    console.error('Errore aggiornamento prenotazione', error);
    return res.status(500).json({ error: 'Errore aggiornamento prenotazione' });
  }

  const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
  return res.json({ booking: updated });
});

app.delete('/api/bookings/:id', requireAuth, requireAdmin, (req, res) => {
  const bookingId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return res.status(400).json({ error: 'ID prenotazione non valido' });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Prenotazione non trovata' });
  }

  try {
    db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
  } catch (error) {
    console.error('Errore cancellazione prenotazione', error);
    return res.status(500).json({ error: 'Errore cancellazione prenotazione' });
  }

  return res.json({ success: true });
});

app.get('/api/staff-notes', requireAuth, requireAdmin, (_req, res) => {
  try {
    const notes = db.prepare(`
      SELECT sn.*, u.full_name AS author
      FROM staff_notes sn
      INNER JOIN users u ON u.id = sn.user_id
      ORDER BY sn.created_at DESC
    `).all();
    return res.json({ notes });
  } catch (error) {
    console.error('Errore recupero note staff', error);
    return res.status(500).json({ error: 'Errore recupero note staff' });
  }
});

app.post('/api/staff-notes', requireAuth, requireAdmin, (req, res) => {
  const { content } = req.body || {};
  const sanitizedContent = sanitizeOptionalText(typeof content === 'string' ? content : '', MAX_STAFF_NOTE_LENGTH);
  if (!sanitizedContent) {
    return res.status(400).json({ error: 'Inserisci il testo della nota' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO staff_notes (user_id, content)
      VALUES (@userId, @content)
    `).run({ userId: req.user.id, content: sanitizedContent });
    const note = db.prepare(`
      SELECT sn.*, u.full_name AS author
      FROM staff_notes sn
      INNER JOIN users u ON u.id = sn.user_id
      WHERE sn.id = ?
    `).get(result.lastInsertRowid);
    return res.status(201).json({ note });
  } catch (error) {
    console.error('Errore creazione nota staff', error);
    return res.status(500).json({ error: 'Errore salvataggio nota staff' });
  }
});

app.patch('/api/staff-notes/:id', requireAuth, requireAdmin, (req, res) => {
  const noteId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(noteId) || noteId <= 0) {
    return res.status(400).json({ error: 'ID nota non valido' });
  }
  const { content } = req.body || {};
  const sanitizedContent = sanitizeOptionalText(typeof content === 'string' ? content : '', MAX_STAFF_NOTE_LENGTH);
  if (!sanitizedContent) {
    return res.status(400).json({ error: 'Inserisci il testo della nota' });
  }

  const existing = db.prepare('SELECT * FROM staff_notes WHERE id = ?').get(noteId);
  if (!existing) {
    return res.status(404).json({ error: 'Nota non trovata' });
  }

  try {
    db.prepare(`
      UPDATE staff_notes
      SET content = @content, updated_at = datetime('now')
      WHERE id = @id
    `).run({ id: noteId, content: sanitizedContent });
    const note = db.prepare(`
      SELECT sn.*, u.full_name AS author
      FROM staff_notes sn
      INNER JOIN users u ON u.id = sn.user_id
      WHERE sn.id = ?
    `).get(noteId);
    return res.json({ note });
  } catch (error) {
    console.error('Errore aggiornamento nota staff', error);
    return res.status(500).json({ error: 'Errore aggiornamento nota staff' });
  }
});

app.delete('/api/staff-notes/:id', requireAuth, requireAdmin, (req, res) => {
  const noteId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(noteId) || noteId <= 0) {
    return res.status(400).json({ error: 'ID nota non valido' });
  }
  const existing = db.prepare('SELECT * FROM staff_notes WHERE id = ?').get(noteId);
  if (!existing) {
    return res.status(404).json({ error: 'Nota non trovata' });
  }

  try {
    db.prepare('DELETE FROM staff_notes WHERE id = ?').run(noteId);
    return res.json({ success: true });
  } catch (error) {
    console.error('Errore cancellazione nota staff', error);
    return res.status(500).json({ error: 'Errore cancellazione nota staff' });
  }
});

app.use(express.static(path.join(__dirname, 'docs')));

app.use((req, res) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, 'docs', 'index.html'));
  }
  return res.status(404).json({ error: 'Risorsa non trovata' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Errore interno del server' });
});

async function startServer() {
  try {
    await bootstrapDatabase();
    app.listen(PORT, () => {
      console.log(`Server avviato su http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Errore avvio server', error);
    process.exit(1);
  }
}

startServer();
