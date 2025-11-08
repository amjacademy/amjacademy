const express = require("express");
const { supabase } = require("../config/supabaseClient");
const { adminAuth } = require("../utils/authController");
const router = express.Router();

/* ==========================================================
   ✅ 1. Fetch Notifications (Admin View)
========================================================== */
router.get("/", adminAuth,async (req, res) => {
  try {
    const { filterKind, search } = req.query;

    // Fetch all notifications (both teacher & student)
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .in("role", ["teacher", "student"])
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Normalize action_type
    let messages = data.map((n) => {
      const rawType = (n.action_type || "").trim().toLowerCase();
      let kind = "Notification";

      if (rawType === "leave" || rawType === "leave request") {
        kind = "Leave Request";
      } else if (
        rawType === "lmc" ||
        rawType === "last minute cancellation" ||
        rawType === "last_minute_cancel"
      ) {
        kind = "Last Minute Cancellation";
      }

      return {
        id: n.id,
        class_id: n.class_id,
        kind,
        from: n.issuer_id,
        role: (n.role || "").toLowerCase(), // normalize role
        text: n.reason || "No description provided",
        createdAt: n.created_at,
        to: ["admin"],
        redirectedFrom: n.issuer_id,
        read: n.is_read,
      };
    });

    /* ✅ Filter by kind if provided */
    if (filterKind && filterKind !== "") {
      messages = messages.filter(
        (msg) => (msg.kind || "").toLowerCase() === filterKind.toLowerCase()
      );
    }

    /* ✅ Search filter */
    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      messages = messages.filter(
        (msg) =>
          (msg.from || "").toLowerCase().includes(q) ||
          (msg.text || "").toLowerCase().includes(q) ||
          (msg.kind || "").toLowerCase().includes(q) ||
          (msg.role || "").toLowerCase().includes(q)
      );
    }

    /* ✅ Sort unread first, then by recency */
    const now = new Date();
    messages.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return Math.abs(new Date(b.createdAt) - now) - Math.abs(new Date(a.createdAt) - now);
    });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching notifications:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
   ✅ 2. Mark Notification as Read
========================================================== */
router.put("/mark-read/:id", adminAuth,async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.json({ success: true, updated: data[0] });
  } catch (err) {
    console.error("Error marking notification read:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
