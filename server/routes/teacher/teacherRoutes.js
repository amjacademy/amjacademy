const express = require("express");
const { fetch ,fetchUpcomingClasses, ongoingclass, fetchgroupclasses, joinclass} = require("../../controllers/teacher/teacherControllers");
const router = express.Router();
const {userAuth} = require("../../utils/authController");


router.get("/fetchannouncements",userAuth("teacher"), fetch);
router.get("/upcoming-classes", userAuth("teacher"), fetchUpcomingClasses);
router.get("/ongoing-class", userAuth("teacher"), ongoingclass);
router.get("/fetchgroupclasses",userAuth(), fetchgroupclasses);
router.put("/joinclass",userAuth("teacher"), joinclass);
module.exports = router;