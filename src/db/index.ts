import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('coordinate_trainer.db');
    initDatabase(dbInstance);
  }
  return dbInstance;
}

function initDatabase(db: SQLite.SQLiteDatabase): void {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mode TEXT NOT NULL,
      duration INTEGER NOT NULL,
      score INTEGER NOT NULL,
      accuracy REAL NOT NULL,
      total_attempts INTEGER NOT NULL,
      correct_attempts INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_scores_mode_duration ON scores (mode, duration);
  `);
}
