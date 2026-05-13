const admin = require("firebase-admin");
const path = require("path");

// 1. Use an absolute path or Environment Variables for the service account
// Pro-tip: Never commit serviceAccountKey.json to version control!
const serviceAccountPath = process.env.FIREBASE_CONFIG_PATH || "./serviceAccountKey.json";
const serviceAccount = require(path.resolve(__dirname, serviceAccountPath));

// 2. Prevent "App already exists" errors during hot-reloads (common in development)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // 3. Add your database URL if you plan to use Realtime Database or specific storage buckets
        // databaseURL: "https://your-project-id.firebaseio.com"
    });
    console.log("Firebase Admin initialized successfully.");
}

// 4. Export the specific services you need (optional but cleaner)
const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
