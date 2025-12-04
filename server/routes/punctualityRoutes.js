const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const { supabase } = require("../config/supabaseClient");
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

    // ============================================
    // PART 1: Fetch NORMAL completed classes
    // ============================================
    let query = supabase
      .from("class_statuses")
      .select(
        `
        class_id,
        start_time,
        end_time,
        entry_time,
        exit_time
      `
      )
      .eq("user_id", user_id)
      .eq("status", "completed")
      .order("start_time", { ascending: false });

    // Date Filters
    if (from) query.gte("start_time", `${from}T00:00:00Z`);
    if (to) query.lte("start_time", `${to}T23:59:59Z`);

    const { data: statuses, error } = await query;
    if (error) throw error;

    // ============================================
    // PART 2: Fetch GROUP completed classes
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
        .select(`class_id, date, time, teacher_id, batch_type`)
        .in("class_id", classIds);

      if (arrErr) throw arrErr;

      // Map arrangements
      const arrMap = {};
      arrs.forEach((a) => (arrMap[a.class_id] = a));

      // Fetch teacher names
      const teacherIds = [
        ...new Set(arrs.map((a) => a.teacher_id).filter(Boolean)),
      ];

      let teacherMap = {};
      if (teacherIds.length > 0) {
        const { data: teachers } = await supabase
          .from("users")
          .select(`id, name`)
          .in("id", teacherIds);

        teachers?.forEach((t) => (teacherMap[t.id] = t.name));
      }

      // Build normal rows
      normalRows = statuses.map((s) => {
        const arr = arrMap[s.class_id];

        const teacherName = arr?.teacher_id
          ? teacherMap[arr.teacher_id] || "Unknown"
          : "Unknown";

        const checkinStatus = getCheckinStatus(s.start_time, s.entry_time);
        const checkoutStatus = getCheckoutStatus(s.end_time, s.exit_time);

        const slot = computeSlotStatus(checkinStatus, checkoutStatus);
        const classType = deriveClassType(arr?.batch_type, false);
        const session = deriveSessionType();

        return {
          id: s.class_id,
          type: "normal",
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

      console.log("📋 Group Arrangement IDs:", groupArrangementIds);

      let groupArrMap = {};
      if (groupArrangementIds.length > 0) {
        const { data: groupArrs, error: gaError } = await supabase
          .from("group_arrangements")
          .select(`id, date, time, teacher_id, teacher_name, group_name`)
          .in("id", groupArrangementIds);

        console.log("📋 Group Arrangements fetched:", groupArrs);
        if (gaError) console.error("Group arrangements error:", gaError);

        groupArrs?.forEach((ga) => (groupArrMap[ga.id] = ga));
      }

      // Fetch teacher names for group classes (fallback if teacher_name not in group_arrangements)
      const groupTeacherIds = [
        ...new Set(
          Object.values(groupArrMap)
            .map((ga) => ga.teacher_id)
            .filter(Boolean)
        ),
      ];

      let groupTeacherMap = {};
      if (groupTeacherIds.length > 0) {
        const { data: groupTeachers } = await supabase
          .from("users")
          .select(`id, name`)
          .in("id", groupTeacherIds);

        groupTeachers?.forEach((t) => (groupTeacherMap[t.id] = t.name));
      }

      // Build group rows
      groupRows = groupStatuses.map((gs) => {
        const ga = groupArrMap[gs.group_arrangement_id] || {};

        console.log(
          "📋 Processing group status:",
          gs.id,
          "arrangement_id:",
          gs.group_arrangement_id,
          "ga found:",
          !!groupArrMap[gs.group_arrangement_id]
        );

        // Use teacher_name from group_arrangements first, fallback to users lookup
        const teacherName =
          ga.teacher_name ||
          (ga.teacher_id ? groupTeacherMap[ga.teacher_id] : null) ||
          "Unknown";

        const checkinStatus = getCheckinStatus(gs.start_time, gs.entry_time);
        const checkoutStatus = getCheckoutStatus(gs.end_time, gs.exit_time);

        const slot = computeSlotStatus(checkinStatus, checkoutStatus);
        const classType = deriveClassType(null, true); // isGroup = true
        const session = deriveSessionType();

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
          teacher: teacherName,
          groupName: ga.group_name || "Group Class",
          checkinTime: formatTime(gs.entry_time),
          checkoutTime: formatTime(gs.exit_time),
          checkinStatus,
          checkoutStatus,
          duration: "45 min.",
          slotStatus: slot,
          sessionType: session,
          classType,
        };
      });
    }

    // ============================================
    // PART 5: Combine and apply filters
    // ============================================
    let rows = [...normalRows, ...groupRows];

    // Sort by date (most recent first)
    rows.sort((a, b) => new Date(b.rawDateTime) - new Date(a.rawDateTime));

    // sessionType = All/Regular
    if (sessionType !== "All Classes") {
      rows = rows.filter((r) => r.sessionType === sessionType);
    }

    // slotStatus
    if (slotStatus !== "All Slots") {
      rows = rows.filter((r) => r.slotStatus === slotStatus);
    }

    // keyword -> teacher/classType/groupName
    if (keyword.trim().length > 0) {
      const k = keyword.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.teacher.toLowerCase().includes(k) ||
          r.classType.toLowerCase().includes(k) ||
          (r.groupName && r.groupName.toLowerCase().includes(k))
      );
    }

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
