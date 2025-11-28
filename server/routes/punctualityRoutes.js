const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const { supabase } = require("../config/supabaseClient");
// -------------------- Helper Functions ---------------------

function formatDateTime(date, time) {
  if (!date) return "-";
  const dt = time ? new Date(time) : new Date(date);
  return dt.toLocaleString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatTime(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Checkin Status
function getCheckinStatus(start, entry) {
  if (!entry) return "No Entry";

  const diff = (new Date(entry) - new Date(start)) / 60000;

  if (diff > 1) return "Late-In";
  if (diff < -1) return "Early-In";
  return "On-time";
}

// Checkout Status
function getCheckoutStatus(end, exit) {
  if (!exit) return "No Exit";

  const diff = (new Date(exit) - new Date(end)) / 60000;

  if (diff > 1) return "Late-Out";
  if (diff < -1) return "Early-Out";
  return "On-time";
}

// Combined slotStatus
function computeSlotStatus(ci, co) {
  if (ci === "Late-In") return "Late-In";
  if (ci === "Early-In") return "Early-In";
  if (co === "Late-Out") return "Late-Out";
  if (co === "Early-Out") return "Early-Out";
  return "On-time";
}

// classType → from batch_type
function deriveClassType(batch) {
  if (!batch) return "Individual Class";
  return batch.toLowerCase() === "group" ? "Group Class" : "Individual Class";
}

// sessionType → always Regular for now
function deriveSessionType() {
  return "Regular";
}

// -------------------- MAIN API ----------------------------

router.get("/fetchreport", async (req, res) => {
  try {
    const {
      user_id,
      from,
      to,
      sessionType = "All Classes",
      slotStatus = "All Slots",
      keyword = "",
    } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // 1️⃣ Fetch completed classes for the user
    let query = supabase
      .from("class_statuses")
      .select(`
        class_id,
        start_time,
        end_time,
        entry_time,
        exit_time
      `)
      .eq("user_id", user_id)
      .eq("status", "completed")
      .order("start_time", { ascending: false });

    // Date Filters
    if (from) query.gte("start_time", `${from}T00:00:00Z`);
    if (to) query.lte("start_time", `${to}T23:59:59Z`);

    const { data: statuses, error } = await query;
    if (error) throw error;

    if (statuses.length === 0) return res.json([]);

    // 2️⃣ Fetch arrangements rows
    const classIds = statuses.map((c) => c.class_id);

    const { data: arrs, error: arrErr } = await supabase
      .from("arrangements")
      .select(`class_id, date, time, teacher_id, batch_type`)
      .in("class_id", classIds);

    if (arrErr) throw arrErr;

    // Map arrangements
    const arrMap = {};
    arrs.forEach((a) => (arrMap[a.class_id] = a));

    // 3️⃣ Fetch teacher names
    const teacherIds = [...new Set(arrs.map((a) => a.teacher_id))];

    const { data: teachers } = await supabase
      .from("users")
      .select(`id, name`)
      .in("id", teacherIds);

    const teacherMap = {};
    teachers.forEach((t) => (teacherMap[t.id] = t.name));

    // 4️⃣ Build full rows
    let rows = statuses.map((s) => {
      const arr = arrMap[s.class_id];

      const teacherName = arr?.teacher_id
        ? teacherMap[arr.teacher_id] || "Unknown"
        : "Unknown";

      const checkinStatus = getCheckinStatus(s.start_time, s.entry_time);
      const checkoutStatus = getCheckoutStatus(s.end_time, s.exit_time);

      const slot = computeSlotStatus(checkinStatus, checkoutStatus);
      const classType = deriveClassType(arr?.batch_type);
      const session = deriveSessionType();

      return {
        id: s.class_id,   // ✅ FIX ADDED
        rawDateTime: s.start_time,   
        dateTime: formatDateTime(arr?.date, arr?.time || s.start_time),
        teacher: teacherName,
        checkinTime: formatTime(s.entry_time),
        checkoutTime: formatTime(s.exit_time),
        checkinStatus,
        checkoutStatus,
        duration: "45 min.",
        slotStatus: slot,
        sessionType: session,
        classType,
      };
    });

    // 5️⃣ Apply filters (sessionType, slotStatus, keyword)

    // sessionType = All/Regular
    if (sessionType !== "All Classes") {
      rows = rows.filter((r) => r.sessionType === sessionType);
    }

    // slotStatus
    if (slotStatus !== "All Slots") {
      rows = rows.filter((r) => r.slotStatus === slotStatus);
    }

    // keyword -> teacher/classType
    if (keyword.trim().length > 0) {
      const k = keyword.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.teacher.toLowerCase().includes(k) ||
          r.classType.toLowerCase().includes(k)
      );
    }

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
