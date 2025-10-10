
const { supabase } = require("../config/supabaseClient");

// Fetch upcoming classes for a logged-in student
exports.fetchUpcomingClasses = async (req, res) => {
  try {
    const userId = req.headers["user_id"];
    if (!userId) return res.status(400).json({ success: false, message: "user_id required" });

    console.log("Fetching upcoming classes for user:", userId);

const currentTime = new Date(); // current time

// Convert 15 minutes to milliseconds
const fifteenMinutesAgo = new Date(currentTime.getTime() - 15 * 60 * 1000).toISOString();

const { data: classes, error } = await supabase
  .from("arrangements")
  .select("*")
  .or(`student1_id.eq.${userId},student2_id.eq.${userId}`)
  .eq("status", "upcoming")
  .gte("time", fifteenMinutesAgo); // fetch classes started within last 15 mins or upcoming

if (error) {
  console.error("Error fetching upcoming classes:", error);
}


    const upcomingClasses = await Promise.all(
      classes.map(async (cls) => {
        const { data: studentData } = await supabase
          .from("enrollments")
          .select("profession, level, plan")
          .eq("id", cls.student1_id)
          .single();

        const { data: teacherData } = await supabase
          .from("enrollments")
          .select("name")
          .eq("id", cls.teacher_id)
          .single();

        return {
          id: cls.id,
          time: cls.time,
          date: cls.date,
          day: cls.day,
          batch_type: cls.batch_type,
          profession: studentData?.profession || "",
          level: studentData?.level || "",
          plan: studentData?.plan || "",
          teacher_name: teacherData?.name || "N/A",
          link: cls.link,
          duration: "45mins",
          contract_id: "ic-405",
          status: "not started",
          class_id: cls.class_id,
          rescheduled: cls.rescheduled,
        };
      })
    );

    res.json({ success: true, upcomingClasses });
  } catch (err) {
    console.error("Error fetching upcoming classes:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


