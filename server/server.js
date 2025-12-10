import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import expensesRouter from './routes/expenses.js';
import roomRentsRouter from './routes/roomRents.js';
import historyRouter from './routes/history.js';

// Import database to ensure initialization
import './config/database.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api/expenses', expensesRouter);
app.use('/api/room-rents', roomRentsRouter);
app.use('/api/history', historyRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Budget Tracker API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Budget Tracker API',
        version: '1.0.0',
        endpoints: {
            expenses: '/api/expenses',
            roomRents: '/api/room-rents',
            history: '/api/history',
            health: '/api/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Budget Tracker API Server is running!`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`\n💡 Available endpoints:`);
    console.log(`   - GET/POST    /api/expenses`);
    console.log(`   - GET/PUT/DEL /api/expenses/:id`);
    console.log(`   - GET/POST    /api/room-rents`);
    console.log(`   - GET/PUT/DEL /api/room-rents/:id`);
    console.log(`   - GET         /api/history`);
    console.log(`   - GET/DEL     /api/history/:month`);
    console.log(`   - POST        /api/history/archive\n`);
});

export default app;
