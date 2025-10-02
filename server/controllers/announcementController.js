const { supabase } = require("../config/supabaseClient");

// 1️⃣ Send announcement
exports.send = async (req, res) => {
  try {
    const { title, message, receiver, duration, created_by } = req.body;

    if (!title || !message || !receiver || !duration) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("announcements")
      .insert([
        {
          title,
          message,
          receiver, // "Students", "Teachers", "All"
          duration,
          
        },
      ])
      .select(); // return inserted row

    if (error) throw error;

    res.status(201).json({ success: true, announcement: data[0] });
  } catch (err) {
    console.error("Send Announcement Error:", err);
    res.status(500).json({ error: "Failed to create announcement" });
  }
};

// 2️⃣ Receive announcements for a role
exports.receive = async (req, res) => {
  try {
    const role = req.params.role; // "Students", "Teachers", or "All"
    let query = supabase.from("announcements").select("*").order("created_at", { ascending: false });

    if (role === "All") {
      // fetch everything (no filter needed)
    } else {
      query = query.or(`receiver.eq.${role},receiver.eq.All`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error("Receive Announcements Error:", err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
};


// 3️⃣ Delete announcement
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete Announcement Error:", err);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
};
