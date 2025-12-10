import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDb, saveDatabase } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/room-rents
// @desc    Get all room rents for the authenticated user
// @access  Private
router.get('/', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        // Get current month rents by default
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

        // Filter by user_id
        const query = `
      SELECT * FROM room_rents 
      WHERE user_id = ? AND date >= ?
      ORDER BY date DESC, created_at DESC
    `;
        const stmt = db.prepare(query);
        stmt.bind([req.userId, startOfMonth]);

        const rents = [];
        while (stmt.step()) {
            rents.push(stmt.getAsObject());
        }
        stmt.free();

        res.json(rents);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/room-rents
// @desc    Add new room rent
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
                'INSERT INTO room_rents (user_id, date, item, cost, description) VALUES (?, ?, ?, ?, ?)'
            );

            stmt.run([req.userId, date, item, cost, description || '']);
            stmt.free();
            saveDatabase();

            // Correctly get last insert ID for sql.js
            const lastIdStmt = db.prepare('SELECT last_insert_rowid() as id');
            lastIdStmt.step();
            const lastId = lastIdStmt.getAsObject().id;
            lastIdStmt.free();

            const newRent = {
                id: lastId,
                user_id: req.userId,
                date,
                item,
                cost,
                description: description || '',
                created_at: new Date().toISOString()
            };

            res.json(newRent);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE api/room-rents/:id
// @desc    Delete room rent
// @access  Private
router.delete('/:id', authMiddleware, (req, res) => {
    try {
        const db = getDb();

        // Ensure entry belongs to user
        const checkStmt = db.prepare('SELECT * FROM room_rents WHERE id = ? AND user_id = ?');
        const rent = checkStmt.get([req.params.id, req.userId]);

        if (!rent) {
            return res.status(404).json({ message: 'Room rent not found' });
        }

        const stmt = db.prepare('DELETE FROM room_rents WHERE id = ?');
        stmt.run([req.params.id]);
        saveDatabase();

        res.json({ message: 'Room rent removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
