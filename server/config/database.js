import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine database path
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'budget.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

// Initialize database
const initDatabase = async () => {
  const SQL = await initSqlJs();

  // Try to load existing database or create new one
  try {
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
      console.log('Loaded existing database');
    } else {
      db = new SQL.Database();
      console.log('Created new database');
    }
  } catch (error) {
    console.error('Error loading database:', error);
    db = new SQL.Database();
  }

  // Initialize schema
  const schema = `
    -- Expenses table
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      item TEXT NOT NULL,
      cost REAL NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Room rents table
    CREATE TABLE IF NOT EXISTS room_rents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      item TEXT NOT NULL DEFAULT 'Room Rent',
      cost REAL NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Budget history table (for archived months)
    CREATE TABLE IF NOT EXISTS budget_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT UNIQUE NOT NULL,
      meals_total REAL NOT NULL DEFAULT 0,
      others_total REAL NOT NULL DEFAULT 0,
      monthly_total REAL NOT NULL DEFAULT 0,
      total_days INTEGER NOT NULL DEFAULT 0,
      average_meals_total REAL NOT NULL DEFAULT 0,
      expenses_json TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_room_rents_date ON room_rents(date);
    CREATE INDEX IF NOT EXISTS idx_budget_history_month ON budget_history(month);
  `;

  db.run(schema);
  saveDatabase();
  console.log('Database schema initialized successfully');
};

// Save database to disk
const saveDatabase = () => {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

// Export database instance and utilities
export const getDb = () => db;
export { saveDatabase, initDatabase };

// Initialize on module load (async)
await initDatabase();

export default {
  getDb,
  saveDatabase
};
