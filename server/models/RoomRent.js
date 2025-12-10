import { getDb, saveDatabase } from '../config/database.js';

class RoomRent {
    /**
     * Get all room rents for the current month
     */
    static getCurrentMonthRents() {
        const db = getDb();
        const currentMonth = new Date().toISOString().slice(0, 7);
        const stmt = db.prepare(`
      SELECT * FROM room_rents 
      WHERE strftime('%Y-%m', date) = ? 
      ORDER BY date DESC
    `);
        stmt.bind([currentMonth]);

        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }

    /**
     * Get all room rents
     */
    static getAll() {
        const db = getDb();
        const stmt = db.prepare('SELECT * FROM room_rents ORDER BY date DESC');

        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }

    /**
     * Get room rent by ID
     */
    static getById(id) {
        const db = getDb();
        const stmt = db.prepare('SELECT * FROM room_rents WHERE id = ?');
        stmt.bind([id]);

        let result = null;
        if (stmt.step()) {
            result = stmt.getAsObject();
        }
        stmt.free();
        return result;
    }

    /**
     * Create new room rent
     */
    static create(rentData) {
        const db = getDb();
        const { date, item = 'Room Rent', cost, description } = rentData;
        const stmt = db.prepare(`
      INSERT INTO room_rents (date, item, cost, description, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
        stmt.bind([date, item, cost, description || null]);
        stmt.step();
        stmt.free();

        saveDatabase();

        // Get the last inserted row
        const lastIdStmt = db.prepare('SELECT last_insert_rowid() as id');
        lastIdStmt.step();
        const lastId = lastIdStmt.getAsObject().id;
        lastIdStmt.free();

        return this.getById(lastId);
    }

    /**
     * Update room rent
     */
    static update(id, rentData) {
        const db = getDb();
        const { date, item = 'Room Rent', cost, description } = rentData;
        const stmt = db.prepare(`
      UPDATE room_rents 
      SET date = ?, item = ?, cost = ?, description = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
        stmt.bind([date, item, cost, description || null, id]);
        stmt.step();
        stmt.free();

        saveDatabase();
        return this.getById(id);
    }

    /**
     * Delete room rent
     */
    static delete(id) {
        const db = getDb();
        const stmt = db.prepare('DELETE FROM room_rents WHERE id = ?');
        stmt.bind([id]);
        stmt.step();
        const changes = db.getRowsModified();
        stmt.free();

        saveDatabase();
        return changes > 0;
    }

    /**
     * Get room rents for a specific month
     */
    static getByMonth(month) {
        const db = getDb();
        const stmt = db.prepare(`
      SELECT * FROM room_rents 
      WHERE strftime('%Y-%m', date) = ? 
      ORDER BY date DESC
    `);
        stmt.bind([month]);

        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }

    /**
     * Delete room rents for a specific month
     */
    static deleteByMonth(month) {
        const db = getDb();
        const stmt = db.prepare(`
      DELETE FROM room_rents 
      WHERE strftime('%Y-%m', date) = ?
    `);
        stmt.bind([month]);
        stmt.step();
        const changes = db.getRowsModified();
        stmt.free();

        saveDatabase();
        return changes;
    }
}

export default RoomRent;
