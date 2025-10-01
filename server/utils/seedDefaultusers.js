const { admin, db } = require("../config/firebase");
async function seedDefaultUsers() {
  try {
    const users = [
      {
        username: "Admin",
        name: "Admin",
        email: "amjacademy196015@gmail.com",
        password: "amjacademy@123", // ⚠️ plaintext for demo; hash in production
        role: "admin",
      },
      {
        username: "harsha123",
        name: "harsha",
        email: "harsha123@gmail.com",
        password: "Harsha@123",
        role: "student",
        age: 10,
        contractId: "AMJ00001",
        plan: "Basic Plan",
      },
      {
        username: "teacher1",
        name: "Ms. Lisa",
        email: "teacher1@gmail.com",
        password: "Teacher@123",
        role: "teacher",
        subjects: ["Piano", "Keyboard"],
      },
    ];

    for (const user of users) {
      const snapshot = await db.collection("users")
        .where("email", "==", user.email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        await db.collection("users").add({
          ...user,
          createdAt: new Date(),
        });
        console.log(`✅ Default user added: ${user.username} / ${user.email} (${user.role})`);
      } else {
        console.log(`ℹ️ User already exists: ${user.email}`);
      }
    }
  } catch (err) {
    console.error("Error seeding default users:", err);
  }
}


module.exports =seedDefaultUsers;