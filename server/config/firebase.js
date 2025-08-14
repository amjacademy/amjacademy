const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_KEY)
    : require("./firebaseServiceKey.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Example: Add document with createdAt field for TTL
async function addDocumentWithTTL() {
  const docRef = db.collection("yourCollection").doc(); // auto-generated ID

  await docRef.set({
    name: "Sample Data",
    createdAt: admin.firestore.FieldValue.serverTimestamp() // important for TTL
  });

  console.log(`Document created with ID: ${docRef.id}`);
}

addDocumentWithTTL().catch(console.error);

module.exports = admin;
