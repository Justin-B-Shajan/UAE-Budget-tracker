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
        // TEMPORARY DEBUG: Remove date filter to see all expenses
        const query = `
      SELECT * FROM expenses 
      WHERE user_id = ?
      ORDER BY date DESC, created_at DESC
      LIMIT 50
    `;
        const stmt = db.prepare(query);
        stmt.bind([req.userId]); // Bind parameters

        const expenses = [];
        while (stmt.step()) {
            expenses.push(stmt.getAsObject());
        }
        stmt.free();

        console.log(`GET /expenses for user ${req.userId} (ALL). Found: ${expenses.length}`); // DEBUG LOG

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

            console.log('Inserting expense:', { userId: req.userId, date, item, cost }); // DEBUG LOG

            stmt.run([req.userId, date, item, cost, description || '']);
            stmt.free(); // Always free statements

            saveDatabase();

            // Correctly get last insert ID for sql.js
            const lastIdStmt = db.prepare('SELECT last_insert_rowid() as id');
            lastIdStmt.step();
            const lastId = lastIdStmt.getAsObject().id;
            lastIdStmt.free();

            console.log('Inserted Row ID:', lastId); // DEBUG LOG

            // IMMEDIATE VERIFICATION
            const verificationStmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
            verificationStmt.bind([lastId]);
            let savedExpense = null;
            if (verificationStmt.step()) {
                savedExpense = verificationStmt.getAsObject();
            }
            verificationStmt.free();
            console.log('IMMEDIATE VERIFICATION - Retrieved inserted expense:', savedExpense); // DEBUG LOG

            // Check total count for user
            const countStmt = db.prepare('SELECT count(*) as count FROM expenses WHERE user_id = ?');
            countStmt.bind([req.userId]);
            countStmt.step();
            const count = countStmt.getAsObject().count;
            countStmt.free();
            console.log(`IMMEDIATE VERIFICATION - Total expenses for user ${req.userId}:`, count); // DEBUG LOG

            const newExpense = {
                id: lastId,
                user_id: req.userId,
                date,
                item,
                cost,
                description: description || '',
                created_at: new Date().toISOString()
            };

            res.json(newExpense);
        } catch (err) {
            console.error('POST /expenses error:', err);
            res.status(500).json({ message: 'Server Error', error: err.message });
        }
    }
);

// @route   PUT api/expenses/:id
// @desc    Update an expense
// @access  Private
router.put('/:id', authMiddleware, (req, res) => {
    const { date, item, cost, description } = req.body;

    try {
        const db = getDb();

        // Check if expense exists and belongs to user
        const checkStmt = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?');
        const expense = checkStmt.get([req.params.id, req.userId]);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const stmt = db.prepare(
            'UPDATE expenses SET date = ?, item = ?, cost = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
        );

        stmt.run([date, item, cost, description || '', req.params.id, req.userId]);
        saveDatabase();

        const updatedExpense = { ...expense, date, item, cost, description };
        res.json(updatedExpense);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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
