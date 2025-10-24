'use strict';

const Database = require('better-sqlite3');

function createDatabase(filePath) {
  const db = new Database(filePath);

  // Enforce safer defaults for every connection
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
  db.pragma('trusted_schema = OFF');
  db.pragma('secure_delete = ON');
  db.pragma('temp_store = MEMORY');

  return db;
}

module.exports = createDatabase;
