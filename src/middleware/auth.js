const jwt = require('jsonwebtoken');

exports.requireAuth = async (req, res, next) => {
    const header = req.headers.authorization
    if (!header) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }
    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Invalid authorization header format' });
    }
    const token = parts[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
        req.user = payload; // Attach user info to request object
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}