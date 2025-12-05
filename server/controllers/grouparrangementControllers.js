const { GroupModel } = require("../models/grouparrangementModels.js");
const { supabase } = require("../config/supabaseClient.js");

const GroupController = {
  async fetchUsers(req, res) {
    try {
      const data = await GroupModel.fetchUsers();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { groupData, students, sessions, sessionForWeek, scheduleFor } =
        req.body;

      // Generate a unique arrangement_id to link all sessions of this group
      const arrangementId = `GRP-${Date.now()}`;

      // Create one row per session in group_arrangements
      const createdGroups = [];
      for (const session of sessions) {
        // Extract date and time from sessionAt
        const sessionDate = new Date(session.sessionAt);
        const dateOnly = sessionDate.toISOString().split("T")[0]; // YYYY-MM-DD

        const groupRow = {
          group_name: groupData.group_name,
          batch_type: "group",
          teacher_id: groupData.teacher_id,
          teacher_name: groupData.teacher_name,
          link: groupData.link,
          no_of_sessions_week: sessionForWeek === "2 days" ? 2 : 1,
          no_of_sessions: scheduleFor,
          first_day: groupData.first_day,
          second_day: groupData.second_day || null,
          end_date: groupData.end_date,
          date: dateOnly,
          time: session.sessionAt,
          arrangement_id: arrangementId,
        };

        const created = await GroupModel.createGroup(groupRow);
        createdGroups.push(created);

        // Add students for this arrangement row
        await GroupModel.addStudents(created.id, students);

        // Create class status rows for this session (pass class_id from created group)
        await GroupModel.addClassStatusesForSession(
          created.id,
          created.class_id,
          groupData.teacher_id,
          students,
          session.sessionAt
        );
      }

      res.json({
        message: "Group created",
        arrangementId,
        groupIds: createdGroups.map((g) => g.id),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const data = await GroupModel.getAllGroups();
      res.json(data || []);
    } catch (err) {
      console.error("getAll groups error:", err);
      // Return empty array instead of 500 error to not break the dashboard
      res.json([]);
    }
  },

  async update(req, res) {
    try {
      const groupId = req.params.id;
      const { groupData, students, sessions, sessionForWeek, scheduleFor } =
        req.body;

      // Get the arrangement_id from the existing group
      const existingGroup = await GroupModel.getGroupById(groupId);
      if (!existingGroup) {
        return res.status(404).json({ error: "Group not found" });
      }

      const arrangementId = existingGroup.arrangement_id;

      // Delete all existing groups, students, and statuses with this arrangement_id
      await GroupModel.deleteByArrangementId(arrangementId);

      // Re-create all sessions
      const createdGroups = [];
      for (const session of sessions) {
        const sessionDate = new Date(session.sessionAt);
        const dateOnly = sessionDate.toISOString().split("T")[0];

        const groupRow = {
          group_name: groupData.group_name,
          batch_type: "group",
          teacher_id: groupData.teacher_id,
          teacher_name: groupData.teacher_name,
          link: groupData.link,
          no_of_sessions_week: sessionForWeek === "2 days" ? 2 : 1,
          no_of_sessions: scheduleFor,
          first_day: groupData.first_day,
          second_day: groupData.second_day || null,
          end_date: groupData.end_date,
          date: dateOnly,
          time: session.sessionAt,
          arrangement_id: arrangementId,
        };

        const created = await GroupModel.createGroup(groupRow);
        createdGroups.push(created);

        await GroupModel.addStudents(created.id, students);
        await GroupModel.addClassStatusesForSession(
          created.id,
          created.class_id,
          groupData.teacher_id,
          students,
          session.sessionAt
        );
      }

      res.json({ message: "Group updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async delete(req, res) {
    try {
      // Get the arrangement_id from the group
      const existingGroup = await GroupModel.getGroupById(req.params.id);
      if (!existingGroup) {
        return res.status(404).json({ error: "Group not found" });
      }

      // Delete all groups with this arrangement_id
      await GroupModel.deleteByArrangementId(existingGroup.arrangement_id);

      res.json({ message: "Group deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET student group classes
  async getStudentGroupClasses(req, res) {
    try {
      const studentId = req.userId;
      if (!studentId)
        return res.status(400).json({ error: "user_id is required" });

      const data = await GroupModel.getStudentGroupClasses(studentId);
      res.json({ success: true, classes: data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET ongoing group class for a user
  async getOngoingGroupClass(req, res) {
    try {
      const userId = req.userId;
      const role = req.query.role || "student";

      if (!userId) {
        return res.status(400).json({ error: "user_id is required" });
      }

      const data = await GroupModel.getOngoingGroupClass(userId, role);

      if (!data) {
        return res.json({ success: true, ongoingGroupClass: null });
      }

      // Format the response
      const groupArrangement = data.group_arrangements || {};
      const formatted = {
        classId: data.class_id,
        groupId: data.group_arrangement_id,
        groupName: groupArrangement.group_name || "Group Class",
        teacherId: groupArrangement.teacher_id,
        teacherName: groupArrangement.teacher_name,
        classLink: groupArrangement.link,
        sessionAt: data.start_time,
        entryTime: data.entry_time,
        totalSessions: groupArrangement.no_of_sessions,
        students: data.studentNames || [],
        image: "/images/amj-logo.png",
      };

      res.json({ success: true, ongoingGroupClass: formatted });
    } catch (err) {
      console.error("Error fetching ongoing group class:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // UPDATE group class status (for JOIN)
  async updateGroupClassStatus(req, res) {
    try {
      const { class_id, status} = req.body;
      const user_id = req.userId;

      if (!class_id || !status || !user_id) {
        return res.status(400).json({
          success: false,
          message: "class_id, status, and user_id are required",
        });
      }

      const result = await GroupModel.updateGroupClassStatus(
        class_id,
        user_id,
        status
      );
      res.json({ success: true, data: result });
    } catch (err) {
      console.error("Error updating group class status:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // SUBMIT group class action (leave/cancel) - saves to notifications table like normal classes
  async submitGroupClassAction(req, res) {
    try {
      const {class_id, action_type, reason, role } = req.body;
      const user_id=req.userId;

      if (!user_id || !class_id || !action_type) {
        return res.status(400).json({
          success: false,
          message: "user_id, class_id, and action_type are required",
        });
      }

      // Validate action_type
      if (action_type !== "leave" && action_type !== "cancel") {
        return res.status(400).json({
          success: false,
          message: "Invalid action_type. Must be 'leave' or 'cancel'",
        });
      }

      // Get group arrangement data for extra_details
      const { data: groupData, error: groupError } = await supabase
        .from("group_arrangements")
        .select("*")
        .eq("class_id", class_id)
        .single();

      if (groupError || !groupData) {
        return res.status(404).json({
          success: false,
          message: "Group class not found",
        });
      }

      // Prepare extra_details (exclude status field if exists)
      const { status, ...extraDetails } = groupData;

      // Insert into notifications table (like normal classes)
      const { data: inserted, error: insertError } = await supabase
        .from("notifications")
        .insert([
          {
            class_id,
            issuer_id: user_id,
            role: role || "student",
            action_type,
            reason: reason || null,
            action_time: new Date().toISOString(),
            is_read: false,
            extra_details: {
              ...extraDetails,
              batch_type: "group",
            },
          },
        ])
        .select();

      if (insertError) {
        console.error("Insert notification error:", insertError);
        return res.status(500).json({
          success: false,
          message: "Failed to submit action",
        });
      }

      // Update group_class_statuses
      const newStatus = action_type === "leave" ? "leave" : "cancelled";
      const { error: statusError } = await supabase
        .from("group_class_statuses")
        .update({
          status: newStatus,
        })
        .eq("user_id", user_id)
        .eq("class_id", class_id);

      if (statusError) {
        console.error("Status update error:", statusError);
        return res.status(500).json({
          success: false,
          message: "Action saved BUT failed to update class status",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Action submitted successfully",
        data: inserted,
      });
    } catch (err) {
      console.error("Error submitting group class action:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

module.exports = { GroupController };
