const express = require("express");
const router = express.Router();
const { adminAuth } = require("../controllers/adminloginControllers");
const {
  getAll,
  create,
  remove,
} = require("../controllers/enrollmentController");

// Protect all enrollment routes
router.get("/getall", adminAuth, getAll);
router.post("/addusers", adminAuth, create);
router.delete("/delete/:id", adminAuth, remove);

module.exports = router;
