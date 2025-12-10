import express from 'express';
import { body, validationResult } from 'express-validator';
import RoomRent from '../models/RoomRent.js';

const router = express.Router();

// Validation middleware
const roomRentValidation = [
    body('date').isISO8601().withMessage('Valid date is required'),
    body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
    body('item').optional().trim(),
    body('description').optional().trim()
];

/**
 * GET /api/room-rents
 * Get all room rents (all months)
 */
router.get('/', (req, res) => {
    try {
        const rents = RoomRent.getAll();
        res.json(rents);
    } catch (error) {
        console.error('Error fetching room rents:', error);
        res.status(500).json({ error: 'Failed to fetch room rents' });
    }
});

/**
 * GET /api/room-rents/:id
 * Get a specific room rent by ID
 */
router.get('/:id', (req, res) => {
    try {
        const rent = RoomRent.getById(req.params.id);
        if (!rent) {
            return res.status(404).json({ error: 'Room rent not found' });
        }
        res.json(rent);
    } catch (error) {
        console.error('Error fetching room rent:', error);
        res.status(500).json({ error: 'Failed to fetch room rent' });
    }
});

/**
 * POST /api/room-rents
 * Create a new room rent entry
 */
router.post('/', roomRentValidation, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newRent = RoomRent.create(req.body);
        res.status(201).json(newRent);
    } catch (error) {
        console.error('Error creating room rent:', error);
        res.status(500).json({ error: 'Failed to create room rent' });
    }
});

/**
 * PUT /api/room-rents/:id
 * Update an existing room rent
 */
router.put('/:id', roomRentValidation, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const rent = RoomRent.getById(req.params.id);
        if (!rent) {
            return res.status(404).json({ error: 'Room rent not found' });
        }

        const updatedRent = RoomRent.update(req.params.id, req.body);
        res.json(updatedRent);
    } catch (error) {
        console.error('Error updating room rent:', error);
        res.status(500).json({ error: 'Failed to update room rent' });
    }
});

/**
 * DELETE /api/room-rents/:id
 * Delete a room rent
 */
router.delete('/:id', (req, res) => {
    try {
        const deleted = RoomRent.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Room rent not found' });
        }
        res.json({ message: 'Room rent deleted successfully' });
    } catch (error) {
        console.error('Error deleting room rent:', error);
        res.status(500).json({ error: 'Failed to delete room rent' });
    }
});

export default router;
