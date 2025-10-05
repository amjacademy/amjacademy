const express = require("express");
const { supabase } = require("../config/supabaseClient");
const router = express.Router();

// ✅ Fetch classes for a specific user (student1_id or student2_id)
router.get("/fetchclasses", async (req, res) => {
  try {
    const { user_id, status, subject, startDate, endDate } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // Base query: match either student1_id or student2_id
    let query = supabase
      .from("arrangements")
      .select("*")
      .or(`student1_id.eq.${user_id},student2_id.eq.${user_id}`);

    // Apply optional filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (subject && subject !== "all" && subject !== "All Subjects") {
      query = query.eq("subject", subject);
    }

    if (startDate && endDate) {
      query = query.gte("date", startDate).lte("date", endDate);
    }

    // Sort by date ascending
    const { data, error } = await query.order("date", { ascending: true });

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }
    console.log("✅ Found classes:", data.length);
console.log("User:", user_id, "Filters:", { status, subject });

    res.json(data);
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/", async (req, res) => {
  const { subject, startDate, endDate } = req.query;
  let query = supabase.from("arrangements").select("*");

  if (subject && subject !== "all") query = query.eq("subject", subject);
  if (startDate && endDate) query = query.gte("date", startDate).lte("date", endDate);

  const { data, error } = await query.order("date", { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});


module.exports = router;