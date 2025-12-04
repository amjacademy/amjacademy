const { supabase } = require("../config/supabaseClient");

// Fetch upcoming classes for a logged-in student
exports.fetchUpcomingClasses = async (req, res) => {
  try {
    const userId = req.headers["user_id"];
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "user_id required" });
    }

    // 1️⃣ Fetch upcoming class-status entries for this user
    const { data: statusRows, error: statusError } = await supabase
      .from("class_statuses")
      .select("class_id, start_time, role, status")
      .eq("user_id", userId)
      .eq("status", "upcoming"); // <-- KEY CHANGE

    if (statusError) {
      console.error("Fetch error:", statusError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch classes" });
    }

    if (!statusRows || statusRows.length === 0) {
      return res.json({ success: true, upcomingClasses: [] });
    }

    // Extract all class_ids
    const classIds = statusRows.map((r) => r.class_id);

    // 2️⃣ Fetch arrangements details for those class_ids
    const { data: classes, error: classError } = await supabase
      .from("arrangements")
      .select("*")
      .in("class_id", classIds);

    if (classError) {
      console.error("Error fetching class details:", classError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch class details" });
    }

    // 3️⃣ Collect all involved user IDs for name/profession lookup
    const userIds = [
      ...new Set(
        classes.flatMap((c) =>
          [c.student1_id, c.student2_id, c.teacher_id].filter(Boolean)
        )
      ),
    ];

    const { data: userInfo, error: usersError } = await supabase
      .from("users")
      .select("id, name, profession")
      .in("id", userIds);

    if (usersError) {
      console.error("User fetch error:", usersError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch user info" });
    }

    const userMap = Object.fromEntries(userInfo.map((u) => [u.id, u]));

    // 4️⃣ Fetch student details (level, plan, profession) from students table
    const studentIds = [
      ...new Set(
        classes.flatMap((c) => [c.student1_id, c.student2_id].filter(Boolean))
      ),
    ];

    const { data: studentInfo, error: studentError } = await supabase
      .from("students")
      .select("id, level, plan, profession")
      .in("id", studentIds);

    if (studentError) {
      console.error("Student fetch error:", studentError);
    }

    const studentMap = Object.fromEntries(
      (studentInfo || []).map((s) => [s.id, s])
    );

    // 5️⃣ Build final response
    const upcomingClasses = classes.map((cls) => {
      const teacher = userMap[cls.teacher_id] || {};
      const student1 = studentMap[cls.student1_id] || {};

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

        student1_id: cls.student1_id,
        teacher_id: cls.teacher_id,

        teacher_name: teacher.name || "N/A",

        // From students table
        level: student1.level || "",
        plan: student1.plan || "",
        profession: student1.profession || "",

        duration: "45 mins",
      };
    });
    /*  console.log("upcomingClasses:", upcomingClasses); */
    return res.json({
      success: true,
      upcomingClasses,
    });
  } catch (err) {
    console.error("Error in fetchUpcomingClasses:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
