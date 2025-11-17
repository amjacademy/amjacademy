// routes/group_arrangementsRoutes.js
const express = require("express");
const { GroupController } =require("../controllers/grouparrangementControllers.js");

const router = express.Router();

// GET teachers + students
router.get("/fetchusers", GroupController.fetchUsers);

// CREATE group
router.post("/", GroupController.create);

// GET all groups
router.get("/", GroupController.getAll);

// UPDATE group
router.put("/:id", GroupController.update);

// DELETE group
router.delete("/:id", GroupController.delete);

router.get("/student/classes", GroupController.getStudentGroupClasses);

module.exports = router;
