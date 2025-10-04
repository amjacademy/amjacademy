const express = require("express");
const router = express.Router();
const { adminAuth } = require("../controllers/adminloginControllers");
const {
  getAll,
  create,
  remove,
  update,
} = require("../controllers/enrollmentController");

// Protect all enrollment routes
router.get("/getall", adminAuth, getAll);
router.post("/addusers", adminAuth, create);
router.put("/update/:id", adminAuth, update);
router.delete("/delete/:id", adminAuth, remove);

module.exports = router;
