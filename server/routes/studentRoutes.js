const express = require("express");
const { fetch } = require("../controllers/studentannouncementControllers");
const { fetchUpcomingClasses } = require("../controllers/upcomingclassController");
const router = express.Router();

router.get("/fetchannouncements", fetch);
router.get("/upcoming-classes", fetchUpcomingClasses);

module.exports = router;