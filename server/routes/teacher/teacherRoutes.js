const express = require("express");
const { fetch } = require("../../controllers/teacher/teacherannouncementController");
const { fetchUpcomingClasses } = require("../../controllers/teacher/upcommingclassContoller");
const router = express.Router();


router.get("/fetchannouncements", fetch);
router.get("/upcoming-classes", fetchUpcomingClasses);

module.exports = router;