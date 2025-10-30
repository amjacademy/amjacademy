const express = require("express");
const { supabase } = require("../config/supabaseClient");
const {userAuth, roleAuth } = require("../utils/authController");
const router = express.Router();

// ✅ Fetch classes for a specific user (student1_id or student2_id)
router.get("/fetchclasses",userAuth, roleAuth(["Student"]), async (req, res) => {
  try {
    const { user_id, status, subject, startDate, endDate } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // Fetch all class_participant_status for this user
    let cpsQuery = supabase
      .from("class_participant_status")
      .select("*, arrangements(*)") // include arrangements data
      .eq("user_id", user_id);

    // Apply status filter
    if (status && status !== "all") {
      cpsQuery = cpsQuery.eq("status", status);
    }

    // Apply batch_type / subject filters via arrangements if needed
    if (subject && subject !== "all" && subject !== "All Subjects") {
      cpsQuery = cpsQuery.eq("arrangements.subject", subject);
    }

    // Apply date filters
    if (startDate && endDate) {
      cpsQuery = cpsQuery
        .gte("arrangements.date", startDate)
        .lte("arrangements.date", endDate);
    }

    // Execute query
    const { data, error } = await cpsQuery;

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }

    // Sort by arrangements.date in JS
    const sortedData = data.sort(
      (a, b) => new Date(a.arrangements.date) - new Date(b.arrangements.date)
    );

    console.log("✅ Found classes:", sortedData.length);
    console.log("User:", user_id, "Filters:", { status, subject });
    res.json(sortedData);
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




router.get("/",userAuth, roleAuth(["Student"]), async (req, res) => {
  const { subject, startDate, endDate } = req.query;
  let query = supabase.from("arrangements").select("*");

  if (subject && subject !== "all") query = query.eq("subject", subject);
  if (startDate && endDate) query = query.gte("date", startDate).lte("date", endDate);

  const { data, error } = await query.order("date", { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});


module.exports = router;