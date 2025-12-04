const express = require("express");
const {
  GroupController,
} = require("../controllers/grouparrangementControllers.js");
const {userAuth} = require("../utils/authController.js");

const router = express.Router();

// GET teachers + students (Admin only - no middleware)
router.get("/fetchusers", GroupController.fetchUsers);

// CREATE group (Admin only - no middleware)
router.post("/", GroupController.create);

// GET all groups (Admin only - no middleware)
router.get("/", GroupController.getAll);

// GET student group classes (Student only)
router.get(
  "/student/classes",
  userAuth("student"),
  GroupController.getStudentGroupClasses
);

// GET ongoing group class for a user (Both Student & Teacher)
router.get("/ongoing", userAuth(), GroupController.getOngoingGroupClass);

// UPDATE group class status (for JOIN) - MUST be before /:id route (Both Student & Teacher)
router.put("/class-status", userAuth(), GroupController.updateGroupClassStatus);

// SUBMIT group class action (leave/cancel) (Both Student & Teacher)
router.post(
  "/actions/submit",
  userAuth(),
  GroupController.submitGroupClassAction
);

// UPDATE group - must be AFTER specific routes (Admin only - no middleware)
router.put("/:id", GroupController.update);

// DELETE group (Admin only - no middleware)
router.delete("/:id", GroupController.delete);

module.exports = router;
