
const { supabase } = require("../config/supabaseClient");

// Fetch upcoming classes for a logged-in student
exports.fetchUpcomingClasses = async (req, res) => {
  try {
    const userId = req.headers["user_id"];
    if (!userId) {
      return res.status(400).json({ success: false, message: "user_id required" });
    }

   /*  console.log("Fetching upcoming classes for:", userId); */

    // 1️⃣ Fetch classes where user is student1/student2/teacher AND status = upcoming
    const { data: classes, error: classError } = await supabase
      .from("arrangements")
      .select("*")
      .eq("status", "upcoming")
      .or(
        `student1_id.eq.${userId},student2_id.eq.${userId},teacher_id.eq.${userId}`
      );

    if (classError) {
      console.error("Error fetching classes:", classError);
      return res.status(500).json({ success: false, message: "Failed to fetch class details" });
    }

    if (!classes || classes.length === 0) {
      return res.json({ success: true, upcomingClasses: [] });
    }

    // 2️⃣ Collect all involved user IDs
    const userIds = [
      ...new Set(
        classes.flatMap(c => [
          c.student1_id,
          c.student2_id,
          c.teacher_id
        ].filter(Boolean))
      )
    ];

    // 3️⃣ Fetch user details
    const { data: userInfo, error: usersError } = await supabase
      .from("users")
      .select("id, name, profession")
      .in("id", userIds);

    if (usersError) {
      console.error("User fetch error:", usersError);
      return res.status(500).json({ success: false, message: "Failed to fetch user info" });
    }

    const userMap = Object.fromEntries(userInfo.map(u => [u.id, u]));

    // 4️⃣ Build final response
    const upcomingClasses = classes.map(cls => {
      const teacher = userMap[cls.teacher_id] || {};
      const student1 = userMap[cls.student1_id] || {};
      // student2 also available but frontend does not need it

      return {
        id: cls.id,
        class_id: cls.class_id,
        date: cls.date,
        time: cls.time,
        day: cls.day,
        batch_type: cls.batch_type,
        subject: cls.subject,
        link: cls.link,
        rescheduled: cls.rescheduled,
        status: cls.status,

        // FRONTEND REQUIRED FIELDS:
        student1_id: cls.student1_id,
        teacher_id: cls.teacher_id,

        teacher_name: teacher.name || "N/A",
        profession: student1.profession || "",

        // Since DB has no "level" or "plan", send empty string:
        level: "",
        plan: "",

        // Duration always same:
        duration: "45 mins"
      };
    });

    return res.json({
      success: true,
      upcomingClasses
    });

  } catch (err) {
    console.error("Error in fetchUpcomingClasses:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




