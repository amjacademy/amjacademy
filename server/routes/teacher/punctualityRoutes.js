const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const { supabase } = require("../../config/supabaseClient");

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
      user_id, // teacher_id
      from,
      to,
      sessionType = "All Classes",
      slotStatus = "All Slots",
      keyword = "",
    } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id (teacher_id) is required" });
    }

    // 1️⃣ Fetch completed classes for the TEACHER
    let query = supabase
      .from("class_statuses")
      .select(`id,class_id, start_time, end_time, entry_time, exit_time, user_id`)
      .eq("status", "completed")
      .eq("user_id", user_id)
      .order("start_time", { ascending: false });

    // Date Filters
    if (from) query.gte("start_time", `${from}T00:00:00Z`);
    if (to) query.lte("start_time", `${to}T23:59:59Z`);

    const { data: statuses, error } = await query;
    if (error) throw error;

    if (statuses.length === 0) return res.json([]);

    // 2️⃣ Fetch arrangements for these classes but for this teacher only
    const classIds = statuses.map((c) => c.class_id);

    const { data: arrs, error: arrErr } = await supabase
      .from("arrangements")
      .select(`
        id,
        class_id,
        date,
        time,
        teacher_id,
        batch_type,
        student1_id,
        student2_id
      `)
      .eq("teacher_id", user_id)
      .in("class_id", classIds);

    if (arrErr) throw arrErr;

    // Create map
    const arrMap = {};
    arrs.forEach((a) => (arrMap[a.class_id] = a));

    // 3️⃣ Fetch STUDENT NAMES (modified)
    const studentIds = [
      ...new Set([
        ...arrs.map((a) => a.student1_id),
        ...arrs.map((a) => a.student2_id),
      ]),
    ].filter(Boolean);

    const { data: students } = await supabase
      .from("users")
      .select(`id, name`)
      .in("id", studentIds);

    const studentMap = {};
    students?.forEach((s) => (studentMap[s.id] = s.name));

    // 4️⃣ Build full rows
    let rows = statuses
      .filter((s) => arrMap[s.class_id]) // only classes of this teacher
      .map((s) => {
        const arr = arrMap[s.class_id];

        let studentNames = [];

if (arr.batch_type === "dual") {
  const s1 = studentMap[arr.student1_id] || "Unknown";
  const s2 = studentMap[arr.student2_id] || "Unknown";
  studentNames = [s1, s2];
} else {
  const s1 = studentMap[arr.student1_id] || "Unknown";
  studentNames = [s1];
}


        const checkinStatus = getCheckinStatus(s.start_time, s.entry_time);
        const checkoutStatus = getCheckoutStatus(s.end_time, s.exit_time);

        return {
          id:`${s.id}-${studentNames.join("-")}`,
          rawDateTime: s.start_time,
          dateTime: formatDateTime(arr.date, arr.time),
          students: studentNames, // ⬅️ REPLACED teacher → students
          checkinTime: formatTime(s.entry_time),
          checkoutTime: formatTime(s.exit_time),
          checkinStatus,
          checkoutStatus,
          duration: "45 min.",
          classType: deriveClassType(arr.batch_type),
          slotStatus: computeSlotStatus(checkinStatus, checkoutStatus),
          sessionType: deriveSessionType(),
        };
      });

    // 5️⃣ Apply Filters (same logic)
    if (sessionType !== "All Classes") {
      rows = rows.filter((r) => r.sessionType === sessionType);
    }

    if (slotStatus !== "All Slots") {
      rows = rows.filter((r) => r.slotStatus === slotStatus);
    }

    if (keyword.trim().length > 0) {
      const k = keyword.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.students.some(s => s.toLowerCase().includes(k)) ||
          r.classType.toLowerCase().includes(k)
      );
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;