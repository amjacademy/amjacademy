// controllers/group_arrangementsControllers.js
const{ GroupModel }=require ("../models/grouparrangementModels.js");

const GroupController = {

  // GET teachers + students
  async fetchUsers(req, res) {
    try {
      const data = await GroupModel.fetchUsers();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // CREATE new group
  async create(req, res) {
    try {
      const { groupData, students, sessions } = req.body;

      // 1. Create main group record
      const group = await GroupModel.createGroup(groupData);

      // 2. Insert many students
      await GroupModel.addStudents(group.id, students);

      // 3. Insert many sessions
      await GroupModel.addSessions(group.id, sessions);

      res.json({ message: "Group created", groupId: group.id });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET all groups
  async getAll(req, res) {
    try {
      const data = await GroupModel.getAllGroups();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // UPDATE group
  async update(req, res) {
    try {
      const groupId = req.params.id;
      const { groupData, students, sessions } = req.body;

      // 1. Update main group info
      await GroupModel.updateGroup(groupId, groupData);

      // 2. Replace students
      await GroupModel.deleteStudents(groupId);
      await GroupModel.addStudents(groupId, students);

      // 3. Replace sessions
      await GroupModel.deleteSessions(groupId);
      await GroupModel.addSessions(groupId, sessions);

      res.json({ message: "Group updated" });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE group
  async delete(req, res) {
    try {
      const groupId = req.params.id;
      await GroupModel.deleteGroup(groupId);
      res.json({ message: "Group deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
module.exports = { GroupController };