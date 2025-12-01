const { supabase } = require("../../config/supabaseClient");

exports.fetch = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const now = new Date();

    const activeAnnouncements = data.filter((a) => {
      if (!a.created_at || !a.end_time) {
        console.warn(
          `⚠️ Missing created_at or end_time for announcement ${a.id}`
        );
        return false;
      }

      const createdAt = new Date(a.created_at);
      const [endHours, endMinutes, endSeconds] = a.end_time
        .split(":")
        .map(Number);

      // Build full expiry time = same day as created_at but at end_time
      const expiryTime = new Date(createdAt);
      expiryTime.setHours(endHours, endMinutes, endSeconds || 0);

      // Only include announcements that haven't expired and are not for teachers
      return expiryTime > now && a.receiver !== "Students";
    });

    res.json(activeAnnouncements);
  } catch (err) {
    console.error(
      "❌ Server error in studentannouncementControllers.fetch:",
      err
    );
    res.status(500).json({ error: "Server error" });
  }
};

// Fetch upcoming classes for a logged-in TEACHER
exports.fetchUpcomingClasses = async (req, res) => {
  try {
    const userId = req.headers["user_id"];
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "user_id required" });
    }

    // 1️⃣ Fetch upcoming classes for teacher
    const { data: statusRows, error: statusError } = await supabase
      .from("class_statuses")
      .select("class_id, start_time, role, status")
      .eq("user_id", userId)
      .eq("role", "teacher")
      .eq("status", "upcoming");

    if (statusError) {
      console.error("Fetch error:", statusError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch classes" });
    }

    if (!statusRows || statusRows.length === 0) {
      return res.json({ success: true, upcomingClasses: [] });
    }

    // Extract class_ids
    const classIds = statusRows.map((r) => r.class_id);

    // 2️⃣ Fetch arrangements
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

    // 3️⃣ Collect all user IDs
    const userIds = [
      ...new Set(
        classes.flatMap((c) =>
          [c.student1_id, c.student2_id, c.teacher_id].filter(Boolean)
        )
      ),
    ];

    // Fetch user info
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

    // Fetch student table info
    const { data: studentInfo, error: studentError } = await supabase
      .from("students")
      .select("id, plan, level, batch_type")
      .in("id", userIds);

    if (studentError) {
      console.log("Student fetch error:", studentError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch student info" });
    }

    // Build lookup maps
    const userMap = Object.fromEntries(userInfo.map((u) => [u.id, u]));
    const studentMap = Object.fromEntries(studentInfo.map((s) => [s.id, s]));

    // 4️⃣ Build final response
    const upcomingClasses = classes.map((cls) => {
      const teacher = userMap[cls.teacher_id] || {};

      const student1 = userMap[cls.student1_id] || {};
      const student2 = userMap[cls.student2_id] || {};

      const student1_details = studentMap[cls.student1_id] || {};
      const student2_details = studentMap[cls.student2_id] || {};

      const classStatus = statusRows.find((s) => s.class_id === cls.class_id);

      return {
        class_id: cls.class_id,

        batch_type: cls.batch_type,

        student1_name: student1.name || "N/A",
        student2_name: student2.name || "",

        student1_profession: student1.profession || "",
        student2_profession: student2.profession || "",

        student1_plan: student1_details.plan || "",
        student1_level: student1_details.level || "",

        student2_plan: student2_details.plan || "",
        student2_level: student2_details.level || "",

        time: cls.time,
        date: cls.date,
        day: cls.day,

        link: cls.link,
        status: classStatus?.status || "upcoming",
        duration: "45mins",
        rescheduled: cls.rescheduled,
      };
    });

    return res.json({
      success: true,
      upcomingClasses,
    });
  } catch (err) {
    console.error("Error in fetchUpcomingClasses:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.ongoingclass = async (req, res) => {
  try {
    const user_id = req.headers["user_id"];

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id required",
      });
    }

    // 1️⃣ fetch ongoing class status for this user
    const { data: statusRows, error: statusError } = await supabase
      .from("class_statuses")
      .select("class_id")
      .eq("user_id", user_id)
      .eq("status", "ongoing")
      .limit(1);

    if (statusError) {
      console.error("Error fetching ongoing class:", statusError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch ongoing class" });
    }

    if (!statusRows || statusRows.length === 0) {
      return res.json({ success: true, ongoingClass: null });
    }

    const classId = statusRows[0].class_id;

    // 2️⃣ fetch full class details
    const { data: cls, error: classError } = await supabase
      .from("arrangements")
      .select("*")
      .eq("class_id", classId)
      .single();

    if (classError) {
      console.error("Error fetching class:", classError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch class details" });
    }

    // 3️⃣ Fetch student name(s)
    let studentIds = [];

    if (cls.batch_type === "dual") {
      studentIds = [cls.student1_id, cls.student2_id].filter(Boolean);
    } else {
      studentIds = [cls.student1_id];
    }
   
    const { data: students, error: studentsError } = await supabase
      .from("users")
      .select("id, name")
      .in("id", studentIds);

    if (studentsError) {
      console.error("Fetch students error:", studentsError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch student names" });
    }
    const student1Id = cls.student1_id;
    const { data: studentProfile, error: profileError } = await supabase
  .from("students")
  .select("plan, level")
  .eq("id", student1Id)
  .single();

if (profileError) {
  console.error("Fetch student profile error:", profileError);
  return res
    .status(500)
    .json({ success: false, message: "Failed to fetch student profile" });
}


    // Convert array → map for easy access
    const studentMap = Object.fromEntries(students.map((s) => [s.id, s.name]));
    return res.json({
  success: true,
  ongoingClass: {
    ...cls,
    students:
      cls.batch_type === "dual"
        ? [
            studentMap[cls.student1_id] || "Student 1",
            studentMap[cls.student2_id] || "Student 2",
          ]
        : [studentMap[cls.student1_id] || "Student"],

    // 👇 FIX: put them INSIDE ongoingClass
    plan: studentProfile?.plan || "",
    level: studentProfile?.level || ""
  }
});

  } catch (err) {
    console.error("ongoing-class error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.fetchgroupclasses = async (req, res) => {
  try {
    const teacherId = req.headers["user_id"];
    if (!teacherId) {
      return res.status(400).json({ success: false, message: "user_id required" });
    }

    // 1️⃣ Fetch all groups taught by this teacher
    const { data: groups, error: groupError } = await supabase
      .from("group_arrangements")
      .select("id, group_name, class_link, schedule_for, session_for_week")
      .eq("teacher_id", teacherId);

    if (groupError) {
      console.error("Group fetch error:", groupError);
      return res.status(500).json({ success: false, message: "Failed to fetch groups" });
    }

    if (!groups || groups.length === 0) {
      return res.json({ success: true, classes: [] });
    }

    const groupIds = groups.map((g) => g.id);

    // 2️⃣ Fetch sessions for these groups
    const now = new Date().toISOString();

    const { data: sessions, error: sessionError } = await supabase
      .from("group_arrangement_sessions")
      .select("*, group_arrangements(*)")
      .in("group_id", groupIds)
      .gte("session_at", now)
      .order("session_at", { ascending: true });

    if (sessionError) {
      console.error("Session fetch error:", sessionError);
      return res.status(500).json({ success: false, message: "Failed to fetch sessions" });
    }

    // 3️⃣ Fetch ALL student_ids for each group from group_arrangement_students
    const { data: groupStudents, error: groupStudentsError } = await supabase
      .from("group_arrangement_students")
      .select("group_id, student_id")
      .in("group_id", groupIds);

    if (groupStudentsError) {
      console.error("Group students error:", groupStudentsError);
      return res.status(500).json({ success: false, message: "Failed to fetch group students" });
    }

    // Create: group_id → [student_id, student_id...]
    const groupStudentMap = {};
    groupStudents.forEach((gs) => {
      if (!groupStudentMap[gs.group_id]) groupStudentMap[gs.group_id] = [];
      groupStudentMap[gs.group_id].push(gs.student_id);
    });

    // 4️⃣ Collect ALL unique student IDs for name lookup
    const allStudentIds = [
      ...new Set(groupStudents.map((gs) => gs.student_id)),
    ];

    const { data: studentNames, error: studentNameErr } = await supabase
      .from("users")
      .select("id, name")
      .in("id", allStudentIds);

    if (studentNameErr) {
      console.error("Student name error:", studentNameErr);
    }

    const studentNameMap = Object.fromEntries(
      studentNames.map((u) => [u.id, u.name])
    );

    // 5️⃣ Build final response
    const final = sessions.map((s) => {
      const studentIds = groupStudentMap[s.group_id] || [];
      const studentNames = studentIds.map((id) => studentNameMap[id] || "Unknown");

      return {
        ...s,
        students: studentNames,   // ARRAY OF FULL STUDENT NAMES
        duration: "50 mins",
        status: "upcoming",
      };
    });

    return res.json({ success: true, classes: final });

  } catch (err) {
    console.error("Error in fetchgroupclasses:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


exports.joinclass = async (req, res) => {
  try {
    const { class_id, status, user_id } = req.body;

    if (!class_id || !status || !user_id) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Missing class_id, status, or user_id",
        });
    }

    // Update only this user's status
    const { data, error: updateError } = await supabase
      .from("class_statuses")
      .update({ status }) // use status from request
      .eq("class_id", class_id)
      .eq("user_id", user_id)
      .select();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to update status" });
    }

    return res.json({
      success: true,
      message: `Class status updated to ${status}`,
      data,
    });
  } catch (err) {
    console.error("Error updating class status:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
