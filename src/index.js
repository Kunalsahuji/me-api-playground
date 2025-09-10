const express = require('express');
const app = express();

require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
module.exports = app;