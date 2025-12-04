const express = require("express");
const {
  GroupController,
} = require("../controllers/grouparrangementControllers.js");

const router = express.Router();

// GET teachers + students
router.get("/fetchusers", GroupController.fetchUsers);

// CREATE group
router.post("/", GroupController.create);

// GET all groups
router.get("/", GroupController.getAll);

// GET student group classes
router.get("/student/classes", GroupController.getStudentGroupClasses);

// GET ongoing group class for a user
router.get("/ongoing", GroupController.getOngoingGroupClass);

// UPDATE group class status (for JOIN) - MUST be before /:id route
router.put("/class-status", GroupController.updateGroupClassStatus);

// SUBMIT group class action (leave/cancel)
router.post("/actions/submit", GroupController.submitGroupClassAction);

// UPDATE group - must be AFTER specific routes
router.put("/:id", GroupController.update);

// DELETE group
router.delete("/:id", GroupController.delete);

module.exports = router;
