import express from 'express';
import { body, validationResult } from 'express-validator';
import Expense from '../models/Expense.js';

const router = express.Router();

// Validation middleware
const expenseValidation = [
    body('date').isISO8601().withMessage('Valid date is required'),
    body('item').trim().notEmpty().withMessage('Item name is required'),
    body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
    body('description').optional().trim()
];

/**
 * GET /api/expenses
 * Get all expenses (all months)
 */
router.get('/', (req, res) => {
    try {
        const expenses = Expense.getAll();
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

/**
 * GET /api/expenses/:id
 * Get a specific expense by ID
 */
router.get('/:id', (req, res) => {
    try {
        const expense = Expense.getById(req.params.id);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json(expense);
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ error: 'Failed to fetch expense' });
    }
});

/**
 * POST /api/expenses
 * Create a new expense
 */
router.post('/', expenseValidation, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newExpense = Expense.create(req.body);
        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

/**
 * PUT /api/expenses/:id
 * Update an existing expense
 */
router.put('/:id', expenseValidation, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const expense = Expense.getById(req.params.id);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        const updatedExpense = Expense.update(req.params.id, req.body);
        res.json(updatedExpense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Failed to update expense' });
    }
});

/**
 * DELETE /api/expenses/:id
 * Delete an expense
 */
router.delete('/:id', (req, res) => {
    try {
        const deleted = Expense.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

export default router;
