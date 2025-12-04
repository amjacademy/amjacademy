const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const { supabase } = require("../../config/supabaseClient");

// -------------------- Helper Functions ---------------------

function formatDateTime(date, time) {
  if (!date && !time) return "-";

  let dt;

  // If time is already a full ISO timestamp (like start_time from group_class_statuses)
  if (time && time.includes("T")) {
    dt = new Date(time);
  }
  // If we have date and time as separate values (like from group_arrangements)
  else if (date && time) {
    // time might be "HH:MM" format
    dt = new Date(`${date}T${time}`);
  }
  // If we only have date or time is in ISO format
  else if (date) {
    dt = new Date(date);
  } else if (time) {
    dt = new Date(time);
  } else {
    return "-";
  }

  // Check if date is valid
  if (isNaN(dt.getTime())) {
    console.log("⚠️ Invalid date:", { date, time });
    return "-";
  }

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
function deriveClassType(batch, isGroup = false) {
  if (isGroup) return "Group Class";
  if (!batch) return "Individual Class";
  return batch.toLowerCase() === "dual" ? "Dual Class" : "Individual Class";
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
      return res
        .status(400)
        .json({ error: "user_id (teacher_id) is required" });
    }

    // ============================================
    // PART 1: Fetch NORMAL completed classes for the TEACHER
    // ============================================
    let query = supabase
      .from("class_statuses")
      .select(
        `id, class_id, start_time, end_time, entry_time, exit_time, user_id`
      )
      .eq("status", "completed")
      .eq("user_id", user_id)
      .order("start_time", { ascending: false });

    // Date Filters
    if (from) query.gte("start_time", `${from}T00:00:00Z`);
    if (to) query.lte("start_time", `${to}T23:59:59Z`);

    const { data: statuses, error } = await query;
    if (error) throw error;

    // ============================================
    // PART 2: Fetch GROUP completed classes for the TEACHER
    // ============================================
    let groupQuery = supabase
      .from("group_class_statuses")
      .select(
        `
        id,
        class_id,
        group_arrangement_id,
        start_time,
        end_time,
        entry_time,
        exit_time
      `
      )
      .eq("user_id", user_id)
      .eq("status", "completed")
      .order("start_time", { ascending: false });

    // Date Filters for group classes
    if (from) groupQuery.gte("start_time", `${from}T00:00:00Z`);
    if (to) groupQuery.lte("start_time", `${to}T23:59:59Z`);

    const { data: groupStatuses, error: groupError } = await groupQuery;
    if (groupError) console.error("Group statuses error:", groupError);

    // ============================================
    // PART 3: Fetch arrangements for NORMAL classes
    // ============================================
    let normalRows = [];

    if (statuses && statuses.length > 0) {
      const classIds = statuses.map((c) => c.class_id);

      const { data: arrs, error: arrErr } = await supabase
        .from("arrangements")
        .select(
          `
          id,
          class_id,
          date,
          time,
          teacher_id,
          batch_type,
          student1_id,
          student2_id
        `
        )
        .eq("teacher_id", user_id)
        .in("class_id", classIds);

      if (arrErr) throw arrErr;

      // Create map
      const arrMap = {};
      arrs.forEach((a) => (arrMap[a.class_id] = a));

      // Fetch STUDENT NAMES
      const studentIds = [
        ...new Set([
          ...arrs.map((a) => a.student1_id),
          ...arrs.map((a) => a.student2_id),
        ]),
      ].filter(Boolean);

      let studentMap = {};
      if (studentIds.length > 0) {
        const { data: students } = await supabase
          .from("users")
          .select(`id, name`)
          .in("id", studentIds);

        students?.forEach((s) => (studentMap[s.id] = s.name));
      }

      // Build normal rows
      normalRows = statuses
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
            id: `${s.id}-${studentNames.join("-")}`,
            type: "normal",
            rawDateTime: s.start_time,
            dateTime: formatDateTime(arr.date, arr.time),
            students: studentNames,
            checkinTime: formatTime(s.entry_time),
            checkoutTime: formatTime(s.exit_time),
            checkinStatus,
            checkoutStatus,
            duration: "45 min.",
            classType: deriveClassType(arr.batch_type, false),
            slotStatus: computeSlotStatus(checkinStatus, checkoutStatus),
            sessionType: deriveSessionType(),
          };
        });
    }

    // ============================================
    // PART 4: Fetch group_arrangements for GROUP classes
    // ============================================
    let groupRows = [];

    if (groupStatuses && groupStatuses.length > 0) {
      const groupArrangementIds = [
        ...new Set(
          groupStatuses.map((g) => g.group_arrangement_id).filter(Boolean)
        ),
      ];

      console.log("📋 Teacher - Group Arrangement IDs:", groupArrangementIds);

      let groupArrMap = {};
      if (groupArrangementIds.length > 0) {
        const { data: groupArrs, error: gaError } = await supabase
          .from("group_arrangements")
          .select(`id, date, time, teacher_id, teacher_name, group_name`)
          .in("id", groupArrangementIds);

        console.log("📋 Teacher - Group Arrangements fetched:", groupArrs);
        if (gaError)
          console.error("Teacher - Group arrangements error:", gaError);

        groupArrs?.forEach((ga) => (groupArrMap[ga.id] = ga));
      }

      // Fetch students enrolled in group classes
      const { data: groupStudents } = await supabase
        .from("group_arrangement_students")
        .select("group_arrangement_id, student_id")
        .in("group_arrangement_id", groupArrangementIds);

      // Get unique student IDs
      const groupStudentIds = [
        ...new Set(
          (groupStudents || []).map((gs) => gs.student_id).filter(Boolean)
        ),
      ];

      let groupStudentMap = {};
      if (groupStudentIds.length > 0) {
        const { data: studentData } = await supabase
          .from("users")
          .select(`id, name`)
          .in("id", groupStudentIds);

        studentData?.forEach((s) => (groupStudentMap[s.id] = s.name));
      }

      // Map students to group arrangements
      const groupStudentsByArrangement = {};
      (groupStudents || []).forEach((gs) => {
        if (!groupStudentsByArrangement[gs.group_arrangement_id]) {
          groupStudentsByArrangement[gs.group_arrangement_id] = [];
        }
        const name = groupStudentMap[gs.student_id] || "Unknown";
        groupStudentsByArrangement[gs.group_arrangement_id].push(name);
      });

      // Build group rows
      groupRows = groupStatuses.map((gs) => {
        const ga = groupArrMap[gs.group_arrangement_id] || {};

        console.log(
          "📋 Teacher - Processing group status:",
          gs.id,
          "arrangement_id:",
          gs.group_arrangement_id,
          "ga found:",
          !!groupArrMap[gs.group_arrangement_id]
        );

        const studentNames = groupStudentsByArrangement[
          gs.group_arrangement_id
        ] || ["Group Students"];

        const checkinStatus = getCheckinStatus(gs.start_time, gs.entry_time);
        const checkoutStatus = getCheckoutStatus(gs.end_time, gs.exit_time);

        // Use group_class_statuses.start_time for date/time if group_arrangements not found
        const classDate =
          ga.date ||
          (gs.start_time
            ? new Date(gs.start_time).toISOString().split("T")[0]
            : null);
        const classTime = ga.time || gs.start_time;

        return {
          id: `group-${gs.id}`,
          type: "group",
          rawDateTime: gs.start_time,
          dateTime: formatDateTime(classDate, classTime),
          students: studentNames,
          groupName: ga.group_name || "Group Class",
          checkinTime: formatTime(gs.entry_time),
          checkoutTime: formatTime(gs.exit_time),
          checkinStatus,
          checkoutStatus,
          duration: "45 min.",
          classType: deriveClassType(null, true), // isGroup = true
          slotStatus: computeSlotStatus(checkinStatus, checkoutStatus),
          sessionType: deriveSessionType(),
        };
      });
    }

    // ============================================
    // PART 5: Combine and apply filters
    // ============================================
    let rows = [...normalRows, ...groupRows];

    // Sort by date (most recent first)
    rows.sort((a, b) => new Date(b.rawDateTime) - new Date(a.rawDateTime));

    // Apply Filters
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
          r.students.some((s) => s.toLowerCase().includes(k)) ||
          r.classType.toLowerCase().includes(k) ||
          (r.groupName && r.groupName.toLowerCase().includes(k))
      );
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
