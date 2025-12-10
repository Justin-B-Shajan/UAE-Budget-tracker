import { getDb, saveDatabase } from '../config/database.js';

class BudgetHistory {
    /**
     * Get all archived months
     */
    static getAll() {
        const db = getDb();
        const stmt = db.prepare(`
      SELECT 
        id,
        month,
        meals_total,
        others_total,
        monthly_total,
        total_days,
        average_meals_total,
        created_at
      FROM budget_history 
      ORDER BY month DESC
    `);

        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }

    /**
     * Get history for a specific month with full expense details
     */
    static getByMonth(month) {
        const db = getDb();
        const stmt = db.prepare(`
      SELECT * FROM budget_history WHERE month = ?
    `);
        stmt.bind([month]);

        let result = null;
        if (stmt.step()) {
            result = stmt.getAsObject();
            if (result && result.expenses_json) {
                result.expenses = JSON.parse(result.expenses_json);
                delete result.expenses_json;
            }
        }
        stmt.free();
        return result;
    }

    /**
     * Archive a month's data
     */
    static archive(month, summaryData, expensesArray) {
        const db = getDb();
        const {
            mealsTotal,
            othersTotal,
            monthlyTotal,
            totalDays,
            averageMealsTotal
        } = summaryData;

        const stmt = db.prepare(`
      INSERT OR REPLACE INTO budget_history 
      (month, meals_total, others_total, monthly_total, total_days, average_meals_total, expenses_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.bind([
            month,
            mealsTotal,
            othersTotal,
            monthlyTotal,
            totalDays,
            averageMealsTotal,
            JSON.stringify(expensesArray)
        ]);
        stmt.step();
        stmt.free();

        saveDatabase();
        return this.getByMonth(month);
    }

    /**
     * Delete history for a specific month
     */
    static delete(month) {
        const db = getDb();
        const stmt = db.prepare('DELETE FROM budget_history WHERE month = ?');
        stmt.bind([month]);
        stmt.step();
        const changes = db.getRowsModified();
        stmt.free();

        saveDatabase();
        return changes > 0;
    }

    /**
     * Check if a month has been archived
     */
    static isArchived(month) {
        const db = getDb();
        const stmt = db.prepare('SELECT COUNT(*) as count FROM budget_history WHERE month = ?');
        stmt.bind([month]);

        let count = 0;
        if (stmt.step()) {
            count = stmt.getAsObject().count;
        }
        stmt.free();
        return count > 0;
    }
}

export default BudgetHistory;
