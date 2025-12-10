import express from 'express';
import { getDb, saveDatabase } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/history
// @desc    Get all archived months for authenticated user
// @access  Private
router.get('/', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const stmt = db.prepare('SELECT * FROM budget_history WHERE user_id = ? ORDER BY month DESC');
        stmt.bind([req.userId]);

        const history = [];
        while (stmt.step()) {
            history.push(stmt.getAsObject());
        }
        stmt.free();

        // Parse the stored JSON
        const parsedHistory = history.map(h => ({
            ...h,
            expenses: JSON.parse(h.expenses_json)
        }));

        res.json(parsedHistory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/history/:month
// @desc    Get specific month history for authenticated user
// @access  Private
router.get('/:month', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const stmt = db.prepare('SELECT * FROM budget_history WHERE month = ? AND user_id = ?');
        stmt.bind([req.params.month, req.userId]);

        let history = null;
        if (stmt.step()) {
            history = stmt.getAsObject();
        }
        stmt.free();

        if (!history) {
            return res.status(404).json({ message: 'History not found for this month' });
        }

        history.expenses = JSON.parse(history.expenses_json);
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/history/archive
// @desc    Archive a specific month
// @access  Private
router.post('/archive', authMiddleware, async (req, res) => {
    try {
        const { month } = req.body; // Format: 'YYYY-MM'

        if (!month) {
            return res.status(400).json({ message: 'Month is required (YYYY-MM)' });
        }

        const db = getDb();

        // Check if already archived
        const existing = db.prepare('SELECT * FROM budget_history WHERE month = ? AND user_id = ?').get([month, req.userId]);
        if (existing) {
            return res.status(400).json({ message: 'Month already archived' });
        }

        // Get all expenses for that month matching user
        const expenses = db.prepare(
            'SELECT * FROM expenses WHERE strftime("%Y-%m", date) = ? AND user_id = ?'
        ).all([month, req.userId]);

        const roomRents = db.prepare(
            'SELECT * FROM room_rents WHERE strftime("%Y-%m", date) = ? AND user_id = ?'
        ).all([month, req.userId]);

        const allExpenses = [...expenses, ...roomRents];

        if (allExpenses.length === 0) {
            return res.status(400).json({ message: 'No expenses found to archive for this month' });
        }

        // Calculate summaries
        let mealsTotal = 0;
        let othersTotal = 0;

        const mealKeywords = ["Breakfast", "Lunch", "Dinner", "Snacks"];

        allExpenses.forEach(exp => {
            if (mealKeywords.includes(exp.item)) {
                mealsTotal += exp.cost;
            } else {
                othersTotal += exp.cost;
            }
        });

        const monthlyTotal = mealsTotal + othersTotal;

        // Calculate total unique days
        const totalDays = new Set(
            allExpenses.filter(e => e.item !== "Others" && e.item !== "Room Rent").map(e => e.date)
        ).size;

        const averageMealsTotal = totalDays > 0 ? mealsTotal / totalDays : 0;

        // Create history record
        const result = db.prepare(`
      INSERT INTO budget_history (
        user_id, month, meals_total, others_total, monthly_total, 
        total_days, average_meals_total, expenses_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run([
            req.userId,
            month,
            mealsTotal,
            othersTotal,
            monthlyTotal,
            totalDays,
            averageMealsTotal,
            JSON.stringify(allExpenses)
        ]);

        saveDatabase();

        const newHistory = {
            id: result.lastInsertRowid,
            user_id: req.userId,
            month,
            meals_total: mealsTotal,
            others_total: othersTotal,
            monthly_total: monthlyTotal,
            total_days: totalDays,
            average_meals_total: averageMealsTotal,
            expenses: allExpenses,
            created_at: new Date().toISOString()
        };

        res.json(newHistory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/history/:month
// @desc    Delete archived history for a specific month
// @access  Private
router.delete('/:month', authMiddleware, (req, res) => {
    try {
        const db = getDb();

        const stmt = db.prepare('DELETE FROM budget_history WHERE month = ? AND user_id = ?');
        const result = stmt.run([req.params.month, req.userId]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'History not found for this month' });
        }

        saveDatabase();

        res.json({ message: 'History deleted successfully' });
    } catch (error) {
        console.error('Error deleting history:', error);
        res.status(500).json({ error: 'Failed to delete history' });
    }
});

export default router;
