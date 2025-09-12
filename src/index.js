const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('./middleware/rateLimit')
const connectDB = require('./config/db');
connectDB();

const ProfileRoutes = require('./routes/profileRoutes')
const ProjectRoutes = require('./routes/projectRoutes')
const authRoutes = require('./routes/authRoutes')

//middlewares
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(morgan('dev'))
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(rateLimit)
// body parser
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// session - cookie
const sessioin = require('express-session')
app.use(sessioin({
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRET
}))
const cookieparser = require('cookie-parser');
app.use(cookieparser())
const ErrorHandler = require('./utils/ErrorHandler');

//routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/profile', ProfileRoutes)
app.use('/api/v1/project', ProjectRoutes)

app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'OK', uptime: process.uptime() })
})

// error handling
// Matches everything
app.use((req, res, next) => {
    next(new ErrorHandler(`Requested URL Not Found ${req.url}`, 404))
})

// generatedErrors Middleware
const { generatedErrors } = require('./middleware/generatedErrors');
app.use(generatedErrors)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log('Server is running on port 3000');
});
module.exports = app;