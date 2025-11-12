const { supabase } = require("../config/supabaseClient");

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
        console.warn(`⚠️ Missing created_at or end_time for announcement ${a.id}`);
        return false;
      }

      const createdAt = new Date(a.created_at);
      const [endHours, endMinutes, endSeconds] = a.end_time.split(":").map(Number);

      // Build full expiry time = same day as created_at but at end_time
      const expiryTime = new Date(createdAt);
      expiryTime.setHours(endHours, endMinutes, endSeconds || 0);

      // Only include announcements that haven't expired and are not for teachers
      return expiryTime > now && a.receiver !== "teachers";
    });

    res.json(activeAnnouncements);
  } catch (err) {
    console.error("❌ Server error in studentannouncementControllers.fetch:", err);
    res.status(500).json({ error: "Server error" });
  }
};

