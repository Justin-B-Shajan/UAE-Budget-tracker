import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log('Auth Middleware - Headers:', req.headers); // DEBUG LOG
    console.log('Auth Middleware - AuthHeader:', authHeader); // DEBUG LOG

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Auth Middleware: No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Add user from payload
        req.userId = decoded.userId;
        console.log('Auth Middleware: Token verified for user', req.userId);
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message); // DEBUG LOG
        res.status(401).json({ message: 'Token is not valid', error: err.message });
    }
};
