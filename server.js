const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const admin = require('./firebase-config'); // Firebase Admin SDK
const db = require('./db'); // Your SQLite configuration
const app = express();

// --- Middleware ---
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to verify the Firebase ID Token (for API calls)
async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "No token provided" });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken; // Contains user email, uid, etc.
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid Token" });
    }
}

// --- Routes ---

/**
 * 1. LOGIN ROUTE (SQLite + Bcrypt)
 * If you are using SQLite for login instead of Firebase Auth, 
 * you MUST compare hashed passwords.
 */
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    
    db.get(sql, [username], async (err, user) => {
        if (err) return res.status(500).send("Database error");
        if (!user) return res.status(401).send("Invalid username or password.");

        // Compare the provided password with the hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (isMatch) {
            // In a real app, you'd generate a JWT here or use a session
            res.json({ message: "Login successful", redirect: "/dashboard" });
        } else {
            res.status(401).send("Invalid username or password.");
        }
    });
});

/**
 * 2. SECURE API ROUTE (Firebase)
 * Used by your dashboard frontend to fetch data via AJAX
 */
app.get('/api/dashboard-data', verifyToken, (req, res) => {
    const sql = "SELECT username, email FROM users";
    
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({
            churchName: "MOUTKU",
            currentUser: req.user.email,
            allUsers: rows
        });
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
const express = require('express');
const app = express();

app.use(express.json()); // Parses JSON bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies

