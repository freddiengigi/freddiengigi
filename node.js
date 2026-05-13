const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 1. Use absolute paths to avoid directory confusion
const dbPath = path.resolve(__dirname, 'my_database.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error('Connection Error:', err.message);
    console.log('Connected to the SQLite database.');
});

// 2. Use db.serialize to ensure the table exists before the insert runs
db.serialize(() => {
    // Fixed: Ensure the table is created properly
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
    )`, (err) => {
        if (err) console.error('Table Creation Error:', err.message);
    });

    // 3. Example: Inserting a user
    // Note: In a real app, 'password' would be a real hash (e.g., from bcrypt)
    const username = 'DevUser';
    const passwordHash = 'hashed_password_123';

    // It is best practice to use the callback to handle results/errors
    const sql = `INSERT INTO users(username, password_hash) VALUES(?, ?)`;
    
    db.run(sql, [username, passwordHash], function(err) {
        if (err) {
            // Handle unique constraint errors (e.g., user already exists)
            return console.error('Insert Error:', err.message);
        }
        console.log(`User created successfully! ID: ${this.lastID}`);
    });
});

// 4. Proper Closing Logic
// If you close the DB immediately at the bottom of the script, 
// the async 'INSERT' above might fail. Only close when the app shuts down.
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error(err.message);
        console.log('Database connection closed.');
        process.exit(0);
    });
});

module.exports = db;