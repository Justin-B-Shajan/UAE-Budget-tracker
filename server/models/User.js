import { getDb, saveDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = {
    create: async (username, password) => {
        const db = getDb();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        try {
            const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
            stmt.run([username, hashedPassword]);
            saveDatabase();

            // Get the created user
            const user = db.exec('SELECT id, username, created_at FROM users WHERE username = ?', [username]);
            if (user.length > 0 && user[0].values.length > 0) {
                const [id, uname, createdAt] = user[0].values[0];
                return { id, username: uname, monthly_budget: 0, created_at: createdAt };
            }
            return null;
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('Username already exists');
            }
            throw error;
        }
    },

    findByUsername: (username) => {
        const db = getDb();
        const result = db.exec('SELECT * FROM users WHERE username = ?', [username]);

        if (result.length > 0 && result[0].values.length > 0) {
            const columns = result[0].columns;
            const values = result[0].values[0];
            const user = {};

            columns.forEach((col, index) => {
                user[col] = values[index];
            });

            return user;
        }
        return null;
    },

    findById: (id) => {
        const db = getDb();
        const result = db.exec('SELECT id, username, monthly_budget, created_at FROM users WHERE id = ?', [id]);

        if (result.length > 0 && result[0].values.length > 0) {
            const columns = result[0].columns;
            const values = result[0].values[0];
            const user = {};

            columns.forEach((col, index) => {
                user[col] = values[index];
            });

            return user;
        }
        return null;
    },

    updateBudget: (id, budget) => {
        const db = getDb();
        try {
            const stmt = db.prepare('UPDATE users SET monthly_budget = ? WHERE id = ?');
            stmt.run([budget, id]);
            saveDatabase();
            return true;
        } catch (error) {
            console.error('Error updating budget:', error);
            return false;
        }
    }
};

export default User;
