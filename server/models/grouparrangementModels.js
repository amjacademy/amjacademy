// models/group_arrangementsModels.js
const{ supabase }=require("../config/supabaseClient.js");

const GroupModel = {

  // ---------------------------
  // FETCH TEACHERS + STUDENTS
  // ---------------------------
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

  // ---------------------------
  // CREATE GROUP
  // ---------------------------
  async createGroup(groupData) {
    const { data, error } = await supabase
      .from("group_arrangements")
      .insert([groupData])
      .select()
      .single();

    if (error) throw error;
    return data; // contains group.id
  },

  async addStudents(groupId, students) {
    if (!students || students.length === 0) return;

    const rows = students.map((sid) => ({
      group_id: groupId,
      student_id: sid,
    }));

    const { error } = await supabase
      .from("group_arrangement_students")
      .insert(rows);

    if (error) throw error;
  },

  async addSessions(groupId, sessions) {
    if (!sessions || sessions.length === 0) return;

    const rows = sessions.map((s) => ({
      group_id: groupId,
      session_number: s.sessionNumber,
      session_at: s.sessionAt, // timestamptz
      day: s.day,
    }));

    const { error } = await supabase
      .from("group_arrangement_sessions")
      .insert(rows);

    if (error) throw error;
  },

  // ---------------------------
  // GET ALL GROUPS
  // ---------------------------
  async getAllGroups() {
    const { data: groups, error } = await supabase
      .from("group_arrangements")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    const { data: students } = await supabase
      .from("group_arrangement_students")
      .select("*");

    const { data: sessions } = await supabase
      .from("group_arrangement_sessions")
      .select("*");

    return groups.map((g) => ({
      ...g,
      students: students
        .filter((s) => s.group_id === g.id)
        .map((s) => s.student_id),
      sessions: sessions.filter((s) => s.group_id === g.id),
    }));
  },

  // ---------------------------
  // UPDATE GROUP
  // ---------------------------
  async updateGroup(id, groupData) {
    const { error } = await supabase
      .from("group_arrangements")
      .update(groupData)
      .eq("id", id);

    if (error) throw error;
  },

  async deleteStudents(id) {
    const { error } = await supabase
      .from("group_arrangement_students")
      .delete()
      .eq("group_id", id);

    if (error) throw error;
  },

  async deleteSessions(id) {
    const { error } = await supabase
      .from("group_arrangement_sessions")
      .delete()
      .eq("group_id", id);

    if (error) throw error;
  },

  // ---------------------------
  // DELETE GROUP
  // ---------------------------
  async deleteGroup(id) {
    const { error } = await supabase
      .from("group_arrangements")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

module.exports = { GroupModel };