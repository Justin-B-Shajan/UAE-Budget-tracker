import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDb, saveDatabase } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/expenses
// @desc    Get all expenses for the authenticated user
// @access  Private
router.get('/', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        // Get current month expenses by default
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

        // Filter by user_id
        const query = `
      SELECT * FROM expenses 
      WHERE user_id = ? AND date >= ?
      ORDER BY date DESC, created_at DESC
    `;
        const stmt = db.prepare(query);
        const expenses = stmt.all([req.userId, startOfMonth]);

        res.json(expenses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/expenses
// @desc    Add new expense
// @access  Private
router.post(
    '/',
    [
        authMiddleware,
        [
            body('date', 'Date is required').not().isEmpty(),
            body('item', 'Item name is required').not().isEmpty(),
            body('cost', 'Cost must be a number').isFloat({ min: 0 })
        ]
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { date, item, cost, description } = req.body;

        try {
            const db = getDb();
            const stmt = db.prepare(
                'INSERT INTO expenses (user_id, date, item, cost, description) VALUES (?, ?, ?, ?, ?)'
            );

            const result = stmt.run([req.userId, date, item, cost, description || '']);
            saveDatabase();

            const newExpense = {
                id: result.lastInsertRowid,
                user_id: req.userId,
                date,
                item,
                cost,
                description: description || '',
                created_at: new Date().toISOString()
            };

            res.json(newExpense);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', authMiddleware, (req, res) => {
    try {
        const db = getDb();

        // Ensure expense belongs to user
        const checkStmt = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?');
        const expense = checkStmt.get([req.params.id, req.userId]);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
        stmt.run([req.params.id]);
        saveDatabase();

        res.json({ message: 'Expense removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
