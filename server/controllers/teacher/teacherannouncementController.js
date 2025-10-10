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
      const createdAt = new Date(a.created_at);
      const [hours, minutes, seconds] = a.duration.split(":").map(Number);

      const expiryTime = new Date(createdAt);
      expiryTime.setHours(expiryTime.getHours() + hours);
      expiryTime.setMinutes(expiryTime.getMinutes() + minutes);
      expiryTime.setSeconds(expiryTime.getSeconds() + seconds);

      // Only include announcements that haven't expired and are not for Student
      return expiryTime > now && a.receiver !== "Students";
    });

    res.json(activeAnnouncements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

