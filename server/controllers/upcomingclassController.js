
const { supabase } = require("../config/supabaseClient");

// Fetch upcoming classes for a logged-in student
exports.fetchUpcomingClasses = async (req, res) => {
  try {
    const userId = req.headers["user_id"];
    if (!userId) {
      return res.status(400).json({ success: false, message: "user_id required" });
    }

    console.log("Fetching upcoming classes for user:", userId);

    // 1. Fetch participant statuses for the user
    const { data: participantStatus, error: statusError } = await supabase
      .from("class_participant_status")
      .select("class_id, status, role, batch_type")
      .eq("user_id", userId)
      .eq("status", "upcoming");

    if (statusError) {
      console.error("Error fetching participant status:", statusError);
      return res.status(500).json({ success: false, message: "Failed to fetch status" });
    }

    if (!participantStatus || participantStatus.length === 0) {
      return res.json({ success: true, upcomingClasses: [] });
    }

    // 2. Extract class IDs
    const classIds = participantStatus.map(ps => ps.class_id);

    // 3. Fetch arrangements details for those class IDs
    const { data: classes, error: classError } = await supabase
      .from("arrangements")
      .select("id,time,date,day,batch_type,student1_id,student2_id,teacher_id,link,class_id,rescheduled")
      .in("class_id", classIds);

    if (classError) {
      console.error("Error fetching class details:", classError);
      return res.status(500).json({ success: false, message: "Failed to fetch class details" });
    }

    // 4. Fetch student & teacher info efficiently
    const studentIds = [...new Set(classes.map(c => c.student1_id))];
    const teacherIds = [...new Set(classes.map(c => c.teacher_id))];

    const { data: allStudents } = await supabase
      .from("enrollments")
      .select("id, profession, level, plan")
      .in("id", studentIds);

    const { data: allTeachers } = await supabase
      .from("enrollments")
      .select("id, name")
      .in("id", teacherIds);

    const studentMap = Object.fromEntries(allStudents.map(s => [s.id, s]));
    const teacherMap = Object.fromEntries(allTeachers.map(t => [t.id, t]));

    // 5. Combine data
    const upcomingClasses = classes.map(cls => {
      const participant = participantStatus.find(ps => ps.class_id === cls.class_id);
      const studentData = studentMap[cls.student1_id] || {};
      const teacherData = teacherMap[cls.teacher_id] || {};

      return {
        id: cls.id,
        time: cls.time,
        date: cls.date,
        day: cls.day,
        batch_type: cls.batch_type,
        profession: studentData.profession || "",
        level: studentData.level || "",
        plan: studentData.plan || "",
        teacher_name: teacherData.name || "N/A",
        link: cls.link,
        duration: "45mins",
        contract_id: "ic-405",
        status: participant?.status || "N/A",
        class_id: cls.class_id,
        rescheduled: cls.rescheduled,
        role: participant?.role || "student",
      };
    });

    return res.json({ success: true, upcomingClasses });

  } catch (err) {
    console.error("Error fetching upcoming classes:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



