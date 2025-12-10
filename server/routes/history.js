import express from 'express';
import BudgetHistory from '../models/BudgetHistory.js';
import Expense from '../models/Expense.js';
import RoomRent from '../models/RoomRent.js';

const router = express.Router();

/**
 * GET /api/history
 * Get all archived monthly summaries
 */
router.get('/', (req, res) => {
    try {
        const history = BudgetHistory.getAll();

        // Format response to match frontend expectations
        const formattedHistory = {};
        history.forEach(item => {
            formattedHistory[item.month] = {
                summary: {
                    mealsTotal: item.meals_total,
                    othersTotal: item.others_total,
                    monthlyTotal: item.monthly_total,
                    totalDays: item.total_days,
                    averageMealsTotal: item.average_meals_total
                }
            };
        });

        res.json(formattedHistory);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

/**
 * GET /api/history/:month
 * Get detailed history for a specific month (YYYY-MM format)
 */
router.get('/:month', (req, res) => {
    try {
        const history = BudgetHistory.getByMonth(req.params.month);

        if (!history) {
            return res.status(404).json({ error: 'History not found for this month' });
        }

        res.json(history);
    } catch (error) {
        console.error('Error fetching month history:', error);
        res.status(500).json({ error: 'Failed to fetch month history' });
    }
});

/**
 * POST /api/history/archive
 * Archive the current or specified month
 */
router.post('/archive', (req, res) => {
    try {
        const { month } = req.body;
        const monthToArchive = month || new Date().toISOString().slice(0, 7);

        // Get expenses and room rents for the month
        const expenses = Expense.getByMonth(monthToArchive);
        const roomRents = RoomRent.getByMonth(monthToArchive);

        // Combine all expenses
        const allExpenses = [...expenses, ...roomRents];

        if (allExpenses.length === 0) {
            return res.status(400).json({
                error: 'No expenses found for this month',
                month: monthToArchive
            });
        }

        // Calculate summary statistics
        const mealsTotal = allExpenses
            .filter(e => e.item.toLowerCase().includes('meal'))
            .reduce((acc, e) => acc + e.cost, 0);

        const monthlyTotal = allExpenses.reduce((acc, e) => acc + e.cost, 0);
        const othersTotal = monthlyTotal - mealsTotal;

        // Count unique days
        const uniqueDates = new Set(allExpenses.map(e => e.date));
        const totalDays = uniqueDates.size;

        const averageMealsTotal = totalDays > 0 ? mealsTotal / totalDays : 0;

        const summaryData = {
            mealsTotal,
            othersTotal,
            monthlyTotal,
            totalDays,
            averageMealsTotal: parseFloat(averageMealsTotal.toFixed(2))
        };

        // Archive the data
        const archived = BudgetHistory.archive(monthToArchive, summaryData, allExpenses);

        res.json({
            message: 'Month archived successfully',
            month: monthToArchive,
            archived
        });
    } catch (error) {
        console.error('Error archiving month:', error);
        res.status(500).json({ error: 'Failed to archive month' });
    }
});

/**
 * DELETE /api/history/:month
 * Delete archived history for a specific month
 */
router.delete('/:month', (req, res) => {
    try {
        const deleted = BudgetHistory.delete(req.params.month);

        if (!deleted) {
            return res.status(404).json({ error: 'History not found for this month' });
        }

        res.json({ message: 'History deleted successfully' });
    } catch (error) {
        console.error('Error deleting history:', error);
        res.status(500).json({ error: 'Failed to delete history' });
    }
});

export default router;
