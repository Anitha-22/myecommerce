// backend/config/db.js
const mysql = require('mysql');
require('dotenv').config(); // Load environment variables

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Anitha#22#11',
    database: process.env.DB_NAME || 'auth_db'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL as ID:', connection.threadId);
});

module.exports = connection;