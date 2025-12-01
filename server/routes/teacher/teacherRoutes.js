const express = require("express");
const { fetch ,fetchUpcomingClasses, ongoingclass, fetchgroupclasses, joinclass} = require("../../controllers/teacher/teacherControllers");
const router = express.Router();


router.get("/fetchannouncements", fetch);
router.get("/upcoming-classes", fetchUpcomingClasses);
router.get("/ongoing-class", ongoingclass);
router.get("/fetchgroupclasses",fetchgroupclasses);
router.put("/joinclass",joinclass);

module.exports = router;