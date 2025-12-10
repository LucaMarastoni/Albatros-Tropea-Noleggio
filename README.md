# Albatros Tropea Noleggio · Portale e API

Applicazione Node/Express con front-end statico (landing + portale prenotazioni) e database SQLite. Gestisce registrazione/login utenti, prenotazioni di noleggi/escursioni e una dashboard admin con aggiornamento stato e note interne.

## Stack
- Node.js + Express 5, sessioni `express-session`
- Database SQLite via `better-sqlite3`
- Sicurezza base: `helmet`, `cors` (origin chiuso), hashing password `bcryptjs`
- Front-end statico in `docs/` (HTML/CSS/JS vanilla), servito dallo stesso server

## Prerequisiti
- Node.js 18+ consigliato
- Nessun servizio esterno richiesto; DB locale file-based

## Installazione e avvio
```bash
npm install
npm run dev           # avvia su http://localhost:3000
# oppure
npm start             # NODE_ENV=production node server.js
```

## Configurazione
Variabili d’ambiente utili:
- `PORT` (default 3000)
- `SESSION_SECRET` (cambia prima del go-live)
- `DB_FILE` (per puntare a un file SQLite diverso, default `./data.sqlite`)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (creazione admin iniziale se non esiste)

Sessione: cookie `connect.sid`, `sameSite=lax`, `secure=false` (pensato per ambiente locale; abilita `secure` dietro HTTPS in produzione).

## Database
Creato al boot (`bootstrapDatabase` in `server.js`).
- `users`: `full_name`, `email` univoca, `password_hash`, `role` (`user`/`admin`), `phone`, timestamp.
- `bookings`: lega l’utente, dati contatto, `service_type` (`noleggio`/`escursione`), `boat_model`/`tour`, `date`, `time`, `people`, `notes`, `status` (da confermare, confermato, completato, annullato), `internal_note`, timestamp.

Seed admin automatico se non esiste: email `admin@tropeawavecharter.it`, password `admin123` (sovrascrivibili via env). Cambiali subito in produzione.

## API (sintesi)
- `POST /api/register` — crea utente `role=user`, valida email/telefono/password≥8, logga in sessione.
- `POST /api/login` — login email/password.
- `POST /api/logout` — chiude sessione.
- `GET /api/session` — restituisce utente attivo (sanitizzato) o `null`.
- `GET /api/catalog` — ritorna `boats` e `tours` statici.
- `POST /api/bookings` — utente autenticato; crea prenotazione con validazioni su data/ora/ospiti/telefono.
- `GET /api/bookings` — utente autenticato; admin vede tutto, user solo le proprie; filtri `serviceType`, `status`; include statistiche base.
- `PATCH /api/bookings/:id` — solo admin; aggiorna `status` e/o `internalNote`.

Errori in JSON con messaggi in italiano; validazioni su email, telefono, data (`YYYY-MM-DD`), ora (`HH:MM`), persone (1-12).

## Front-end
- `docs/index.html` (+ `styles.css`, `app.js`): landing marketing con modale login/registrazione, ticker, carousel, CTA verso il portale.
- `docs/portal.html` (+ `portal.css`, `portal.js`): control room prenotazioni. Se loggato:
  - Area cliente: invio nuova prenotazione, lista personali, refresh.
  - Area admin: dashboard con filtri, stats (totali, pending, escursioni oggi), tabella con update stato/nota.
- Assets multimediali in `docs/assets/`.

## Script npm
- `npm run dev` — `node server.js` (dev)
- `npm start` — `NODE_ENV=production node server.js`
- `npm test` — placeholder

## Note per la produzione
- Imposta `SESSION_SECRET`, credenziali admin e `secure: true` sui cookie dietro HTTPS.
- Valuta CORS esplicito se servirai il front-end da dominio diverso.
- Esegui backup/permessi sicuri sul file SQLite; in scenari multi-istanza considera un DB server.

## Struttura cartelle (top-level)
- `server.js` — API + static serving
- `db.js` — init SQLite con pragma sicuri
- `docs/` — front-end statico (landing + portale)
- `data.sqlite` — database (generato)

