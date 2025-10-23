const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const cors = require('cors');
const Database = require('better-sqlite3');

const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-please';
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data.sqlite');

const db = new Database(DB_FILE);

function bootstrapDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;

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
      people INTEGER NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'da confermare',
      internal_note TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  const adminExists = db
    .prepare('SELECT COUNT(*) as count FROM users WHERE role = ?')
    .get('admin');

  if (!adminExists.count) {
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(`
      INSERT INTO users (full_name, email, password_hash, role, phone)
      VALUES (@fullName, @email, @password, 'admin', @phone)
    `).run({
      fullName: 'Admin Tropea Wave',
      email: process.env.ADMIN_EMAIL || 'admin@tropeawavecharter.it',
      password: hash,
      phone: '+39 328 000 0000',
    });

    console.log('Admin account created:');
    console.log(`  email   : ${process.env.ADMIN_EMAIL || 'admin@tropeawavecharter.it'}`);
    console.log(`  password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  }
}

bootstrapDatabase();

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
    secure: false,
  },
}));

const catalog = {
  boats: [
    'Gommone Comfort 5.5 m · Yamaha 40cv',
  ],
  tours: [
    'Costa degli Dei Explorer',
    'Capo Vaticano Sunset Romance',
    'Parghelia · Zambrone · Briatico',
  ],
};

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
}

function loadUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
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

app.post('/api/register', (req, res) => {
  const { fullName, email, password, phone } = req.body || {};
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Compila tutti i campi obbligatori' });
  }

  const existing = loadUserByEmail(email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Email già registrata' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db.prepare(`
    INSERT INTO users (full_name, email, password_hash, role, phone)
    VALUES (@fullName, @email, @passwordHash, 'user', @phone)
  `).run({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    phone: phone ? phone.trim() : null,
  });

  req.session.userId = result.lastInsertRowid;

  const user = loadUserById(req.session.userId);
  return res.status(201).json({ user: sanitizeUser(user) });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Inserisci email e password' });
  }

  const user = loadUserByEmail(email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

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
    people,
    boatModel,
    tour,
    notes,
    phone,
  } = req.body || {};

  if (!customerName || !serviceType || !date || !time || !people || !phone) {
    return res.status(400).json({ error: 'Compila i campi obbligatori del modulo' });
  }

  if (!['noleggio', 'escursione'].includes(serviceType)) {
    return res.status(400).json({ error: 'Tipo di servizio non valido' });
  }

  const bookingStmt = db.prepare(`
    INSERT INTO bookings (
      user_id, customer_name, email, phone,
      service_type, boat_model, tour,
      date, time, people, notes
    ) VALUES (
      @userId, @customerName, @email, @phone,
      @serviceType, @boatModel, @tour,
      @date, @time, @people, @notes
    )
  `);

  const result = bookingStmt.run({
    userId: req.user.id,
    customerName: customerName.trim(),
    email: req.user.email,
    phone: phone.trim(),
    serviceType,
    boatModel: serviceType === 'noleggio' ? (boatModel || '') : '',
    tour: serviceType === 'escursione' ? (tour || '') : '',
    date,
    time,
    people: Number(people),
    notes: notes ? notes.trim() : '',
  });

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json({ booking });
});

app.get('/api/bookings', requireAuth, (req, res) => {
  const { serviceType, status } = req.query;

  let query = `
    SELECT b.*, u.full_name as user_full_name
    FROM bookings b
    INNER JOIN users u ON u.id = b.user_id
  `;
  const filters = [];
  const params = [];

  if (req.user.role !== 'admin') {
    filters.push('b.user_id = ?');
    params.push(req.user.id);
  }

  if (serviceType && ['noleggio', 'escursione'].includes(serviceType)) {
    filters.push('b.service_type = ?');
    params.push(serviceType);
  }

  if (status) {
    filters.push('b.status = ?');
    params.push(status);
  }

  if (filters.length) {
    query += ` WHERE ${filters.join(' AND ')}`;
  }

  query += ' ORDER BY b.date ASC, b.time ASC';

  const bookings = db.prepare(query).all(...params);

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
  const { status, internalNote } = req.body || {};

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!booking) {
    return res.status(404).json({ error: 'Prenotazione non trovata' });
  }

  const updates = [];
  const params = {};

  if (status) {
    if (!['da confermare', 'confermato', 'completato', 'annullato'].includes(status)) {
      return res.status(400).json({ error: 'Stato non valido' });
    }
    updates.push('status = @status');
    params.status = status;
  }

  if (typeof internalNote === 'string') {
    updates.push('internal_note = @internalNote');
    params.internalNote = internalNote.trim();
  }

  if (!updates.length) {
    return res.status(400).json({ error: 'Nessun campo aggiornabile fornito' });
  }

  updates.push("updated_at = datetime('now')");
  params.id = id;

  const updateQuery = `
    UPDATE bookings
    SET ${updates.join(', ')}
    WHERE id = @id
  `;

  db.prepare(updateQuery).run(params);

  const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  return res.json({ booking: updated });
});

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  return res.status(404).json({ error: 'Risorsa non trovata' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Errore interno del server' });
});

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
