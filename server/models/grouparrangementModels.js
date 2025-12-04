const { supabase } = require("../config/supabaseClient.js");

const GroupModel = {
  async fetchUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, role");

    if (error) throw error;

    return {
      teachers: data.filter((u) => u.role === "teacher"),
      students: data.filter((u) => u.role === "student"),
    };
  },

  async createGroup(groupData) {
    const { data, error } = await supabase
      .from("group_arrangements")
      .insert([groupData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getGroupById(id) {
    const { data, error } = await supabase
      .from("group_arrangements")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  },

  async addStudents(groupId, students) {
    if (!students || students.length === 0) return;

    const rows = students.map((sid) => ({
      group_arrangement_id: groupId,
      student_id: sid,
    }));

    const { error } = await supabase
      .from("group_arrangement_students")
      .insert(rows);

    if (error) throw error;
  },

  // Create class status rows for a single session (one arrangement row)
  // classId is the auto-generated class_id from group_arrangements table
  async addClassStatusesForSession(
    groupId,
    classId,
    teacherId,
    students,
    sessionAt
  ) {
    const rows = [];

    // Add rows for each student
    for (const studentId of students) {
      rows.push({
        batch_type: "group",
        user_id: studentId,
        group_arrangement_id: groupId,
        class_id: classId,
        role: "student",
        status: "upcoming",
        start_time: sessionAt,
        end_time: null,
        entry_time: null,
        exit_time: null,
      });
    }

    // Add row for teacher
    rows.push({
      batch_type: "group",
      user_id: teacherId,
      group_arrangement_id: groupId,
      class_id: classId,
      role: "teacher",
      status: "upcoming",
      start_time: sessionAt,
      end_time: null,
      entry_time: null,
      exit_time: null,
    });

    const { error } = await supabase.from("group_class_statuses").insert(rows);

    if (error) throw error;
  },

  async getAllGroups() {
    try {
      const { data: groups, error } = await supabase
        .from("group_arrangements")
        .select("*");

      if (error) {
        console.error("Error fetching groups:", error);
        return []; // Return empty array instead of throwing
      }

      if (!groups || groups.length === 0) return [];

      const { data: students, error: studentsError } = await supabase
        .from("group_arrangement_students")
        .select("*");

      if (studentsError) {
        console.error("Error fetching students:", studentsError);
      }

      // Group by arrangement_id to show as single group in UI
      const groupedByArrangement = {};

      for (const g of groups) {
        // Use arrangement_id if exists, otherwise use id as fallback for old data
        const arrId = g.arrangement_id || `legacy-${g.id}`;

        if (!groupedByArrangement[arrId]) {
          groupedByArrangement[arrId] = {
            ...g,
            students: [],
            sessions: [],
          };
        }

        // Add this as a session
        groupedByArrangement[arrId].sessions.push({
          id: g.id,
          session_number: groupedByArrangement[arrId].sessions.length + 1,
          session_at: g.time,
          date: g.date,
          class_id: g.class_id,
        });

        // Merge students from all arrangement rows
        const thisStudents = (students || [])
          .filter((s) => s.group_arrangement_id === g.id)
          .map((s) => s.student_id);

        groupedByArrangement[arrId].students = [
          ...new Set([
            ...groupedByArrangement[arrId].students,
            ...thisStudents,
          ]),
        ];
      }

      return Object.values(groupedByArrangement);
    } catch (err) {
      console.error("getAllGroups error:", err);
      return []; // Return empty array on error
    }
  },

  async deleteByArrangementId(arrangementId) {
    // Get all group IDs with this arrangement_id
    const { data: groups } = await supabase
      .from("group_arrangements")
      .select("id")
      .eq("arrangement_id", arrangementId);

    if (groups && groups.length > 0) {
      const groupIds = groups.map((g) => g.id);

      // Delete class statuses
      await supabase
        .from("group_class_statuses")
        .delete()
        .in("group_arrangement_id", groupIds);

      // Delete students
      await supabase
        .from("group_arrangement_students")
        .delete()
        .in("group_arrangement_id", groupIds);

      // Delete the arrangement rows
      await supabase
        .from("group_arrangements")
        .delete()
        .eq("arrangement_id", arrangementId);
    }
  },

  async getStudentGroupClasses(studentId) {
    // Fetch upcoming classes for this student from group_class_statuses
    // Show classes until start_time + 15 minutes
    const now = new Date();
    const fifteenMinsAgo = new Date(
      now.getTime() - 15 * 60 * 1000
    ).toISOString();

    const { data: statuses, error } = await supabase
      .from("group_class_statuses")
      .select("*")
      .eq("user_id", studentId)
      .eq("role", "student")
      .eq("status", "upcoming")
      .gte("start_time", fifteenMinsAgo)
      .order("start_time", { ascending: true });

    if (error) throw error;

    if (!statuses || statuses.length === 0) return [];

    // Get unique group_arrangement_ids
    const groupIds = [...new Set(statuses.map((s) => s.group_arrangement_id))];

    // Fetch group arrangements separately
    const { data: groups, error: groupError } = await supabase
      .from("group_arrangements")
      .select("*")
      .in("id", groupIds);

    if (groupError) throw groupError;

    // Create a map for quick lookup
    const groupMap = Object.fromEntries((groups || []).map((g) => [g.id, g]));

    // Get all arrangement_ids to fetch all sessions for session number calculation
    const arrangementIds = [
      ...new Set((groups || []).map((g) => g.arrangement_id).filter(Boolean)),
    ];

    // Fetch all sessions for these arrangements to calculate session numbers
    let allSessions = [];
    if (arrangementIds.length > 0) {
      const { data: sessionsData } = await supabase
        .from("group_arrangements")
        .select("id, arrangement_id, time, class_id")
        .in("arrangement_id", arrangementIds)
        .order("time", { ascending: true });

      allSessions = sessionsData || [];
    }

    // Create a map: class_id -> session_number within its arrangement
    const sessionNumberMap = {};
    const arrangementSessionsMap = {};

    // Group sessions by arrangement_id
    for (const session of allSessions) {
      if (!session.arrangement_id) continue;
      if (!arrangementSessionsMap[session.arrangement_id]) {
        arrangementSessionsMap[session.arrangement_id] = [];
      }
      arrangementSessionsMap[session.arrangement_id].push(session);
    }

    // Calculate session number for each class_id
    for (const arrId in arrangementSessionsMap) {
      const sessions = arrangementSessionsMap[arrId];
      // Sort by time to get correct order
      sessions.sort((a, b) => new Date(a.time) - new Date(b.time));
      sessions.forEach((s, idx) => {
        sessionNumberMap[s.class_id] = idx + 1;
      });
    }

    // Merge the data with session numbers
    return statuses.map((status) => {
      const groupArrangement = groupMap[status.group_arrangement_id] || null;
      return {
        ...status,
        group_arrangements: groupArrangement,
        session_number: sessionNumberMap[status.class_id] || 1,
      };
    });
  },

  // Update group class status for a specific user and class_id
  async updateGroupClassStatus(classId, userId, status) {
    const updateData = {
      status: status,
    };

    // Add entry_time for ongoing status
    if (status === "ongoing") {
      updateData.entry_time = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("group_class_statuses")
      .update(updateData)
      .eq("class_id", classId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get ongoing group class for a user (status = 'ongoing')
  async getOngoingGroupClass(userId, role = "student") {
    const { data: statuses, error } = await supabase
      .from("group_class_statuses")
      .select("*")
      .eq("user_id", userId)
      .eq("role", role)
      .eq("status", "ongoing")
      .order("entry_time", { ascending: false })
      .limit(1);

    if (error) throw error;

    if (!statuses || statuses.length === 0) return null;

    const status = statuses[0];

    // Fetch group arrangement data
    const { data: groupData, error: groupError } = await supabase
      .from("group_arrangements")
      .select("*")
      .eq("id", status.group_arrangement_id)
      .single();

    if (groupError) {
      console.error("Error fetching group arrangement:", groupError);
      return null;
    }

    // Fetch students in this group
    const { data: students } = await supabase
      .from("group_arrangement_students")
      .select("student_id")
      .eq("group_arrangement_id", status.group_arrangement_id);

    // Fetch student names
    let studentNames = [];
    if (students && students.length > 0) {
      const studentIds = students.map((s) => s.student_id);
      const { data: users } = await supabase
        .from("users")
        .select("id, name")
        .in("id", studentIds);

      studentNames = (users || []).map((u) => u.name);
    }

    return {
      ...status,
      group_arrangements: groupData,
      studentNames,
    };
  },
};

module.exports = { GroupModel };
