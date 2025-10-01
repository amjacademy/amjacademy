const { admin, db } = require("./config/firebase");
async function releaseExpiredSlots() {
  const now = new Date();
  const snapshot = await db.collection("slots").where("status", "==", "blocked").get();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.expiresAt && data.expiresAt.toDate() < now) {
      await doc.ref.update({
        status: "open",
        blockedBy: null,
        blockedAt: null,
        selectedDate: null,
        selectedTime: null,
        expiresAt: null
      });
    }
  }
}


module.exports = releaseExpiredSlots;