const mysql = require('mysql2');
require('dotenv').config();

let pool;
try {
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT
    });

} catch (error) {
    console.error('Error creating mysql connection pool:', error)
}

module.exports = pool;