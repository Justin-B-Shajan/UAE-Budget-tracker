import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
    '/register',
    [
        body('username', 'Username is required').not().isEmpty(),
        body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        try {
            // Check if user already exists
            let user = User.findByUsername(username);
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Create user
            user = await User.create(username, password);
            if (!user) {
                return res.status(500).json({ message: 'Error creating user' });
            }

            // Create JWT payload
            const payload = {
                userId: user.id
            };

            // Sign token
            jwt.sign(
                payload,
                JWT_SECRET,
                { expiresIn: '7d' }, // Token valid for 7 days
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/login',
    [
        body('username', 'Username is required').exists(),
        body('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        try {
            // Check if user exists
            let user = User.findByUsername(username);
            if (!user) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            // Create JWT payload
            const payload = {
                userId: user.id
            };

            // Sign token
            jwt.sign(
                payload,
                JWT_SECRET,
                { expiresIn: '7d' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/profile
// @desc    Update user profile (budget)
// @access  Private
router.put(
    '/profile',
    [
        authMiddleware,
        [
            body('monthly_budget', 'Monthly budget must be a number').isFloat({ min: 0 })
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { monthly_budget } = req.body;

        try {
            const success = User.updateBudget(req.userId, monthly_budget);
            if (!success) {
                return res.status(500).json({ message: 'Error updating profile' });
            }

            const user = User.findById(req.userId);
            res.json(user);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

export default router;
