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

  // Initialize schema - Tables
  const tableSchema = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      monthly_budget REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Expenses table
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL DEFAULT 1,
      date TEXT NOT NULL,
      item TEXT NOT NULL,
      cost REAL NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Room rents table
    CREATE TABLE IF NOT EXISTS room_rents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL DEFAULT 1,
      date TEXT NOT NULL,
      item TEXT NOT NULL DEFAULT 'Room Rent',
      cost REAL NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Budget history table (for archived months)
    CREATE TABLE IF NOT EXISTS budget_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL DEFAULT 1,
      month TEXT NOT NULL,
      meals_total REAL NOT NULL DEFAULT 0,
      others_total REAL NOT NULL DEFAULT 0,
      monthly_total REAL NOT NULL DEFAULT 0,
      total_days INTEGER NOT NULL DEFAULT 0,
      average_meals_total REAL NOT NULL DEFAULT 0,
      expenses_json TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, month)
    );
  `;

  db.run(tableSchema);

  // Migration: Check if monthly_budget column exists in users table
  try {
    const tableInfo = db.exec("PRAGMA table_info(users)");
    const columns = tableInfo[0].values.map(col => col[1]);
    if (!columns.includes('monthly_budget')) {
      console.log('Migrating: Adding monthly_budget column to users table...');
      db.run("ALTER TABLE users ADD COLUMN monthly_budget REAL DEFAULT 0");
    }
  } catch (err) {
    console.error('Migration error (users):', err);
  }

  // Migration: Check for user_id in expenses
  try {
    const tableInfo = db.exec("PRAGMA table_info(expenses)");
    const columns = tableInfo[0].values.map(col => col[1]);
    if (!columns.includes('user_id')) {
      console.log('Migrating: Adding user_id column to expenses table...');
      db.run("ALTER TABLE expenses ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1");
    }
  } catch (err) {
    console.error('Migration error (expenses):', err);
  }

  // Migration: Check for user_id in room_rents
  try {
    const tableInfo = db.exec("PRAGMA table_info(room_rents)");
    const columns = tableInfo[0].values.map(col => col[1]);
    if (!columns.includes('user_id')) {
      console.log('Migrating: Adding user_id column to room_rents table...');
      db.run("ALTER TABLE room_rents ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1");
    }
  } catch (err) {
    console.error('Migration error (room_rents):', err);
  }

  // Migration: Check for user_id in budget_history
  try {
    const tableInfo = db.exec("PRAGMA table_info(budget_history)");
    if (tableInfo.length > 0) {
      const columns = tableInfo[0].values.map(col => col[1]);
      if (!columns.includes('user_id')) {
        console.log('Migrating: Adding user_id column to budget_history table...');
        db.run("ALTER TABLE budget_history ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1");
      }
    }
  } catch (err) {
    console.error('Migration error (budget_history):', err);
  }

  // Create indexes for better performance
  const indexSchema = `
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
    CREATE INDEX IF NOT EXISTS idx_room_rents_date ON room_rents(date);
    CREATE INDEX IF NOT EXISTS idx_room_rents_user ON room_rents(user_id);
    CREATE INDEX IF NOT EXISTS idx_budget_history_month ON budget_history(month);
    CREATE INDEX IF NOT EXISTS idx_budget_history_user ON budget_history(user_id);
  `;

  try {
    db.run(indexSchema);
  } catch (err) {
    console.error('Index creation error:', err);
  }

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
