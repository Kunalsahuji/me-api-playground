const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile');
const { catchAsyncErrors } = require('./catchAyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    let token;
    
    // Check for token in cookies first (matching your logout method)
    if (req.cookies.Token) {
        token = req.cookies.Token;
    }
    // Then check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return next(new ErrorHandler("Please login to access the resource!", 401));
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decoded.id; // Set req.id (not req.user.id)
        next();
    } catch (error) {
        return next(new ErrorHandler("Invalid token. Please login again!", 401));
    }
});