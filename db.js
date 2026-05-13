const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 1. Use an absolute path for the database file
// This prevents issues when running the script from different directories
const dbPath = path.resolve(__dirname, 'project.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error('Connection Error:', err.message);
    }
    console.log('Connected to the SQLite database.');
});

// 2. Setup the "users" table with additional constraints
db.serialize(() => {
    // Added 'created_at' to track user registration timing
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Table Creation Error:', err.message);
    });
});

// 3. Graceful Shutdown
// Ensures the database connection closes when the Node process ends
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) return console.error(err.message);
        console.log('Closed the SQLite database connection.');
        process.exit(0);
    });
});

module.exports = db;