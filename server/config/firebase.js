const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_KEY)
    : require("./firebaseServiceKey.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Firestore instance
const db = admin.firestore(); // ✅ This works with correct import

module.exports = { admin, db };
