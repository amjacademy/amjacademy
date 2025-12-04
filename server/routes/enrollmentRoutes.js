const express = require("express");
const router = express.Router();
const { adminAuth } = require("../utils/authController");
const {
  getAll,
  create,
  remove,
  update,
  getById
} = require("../controllers/enrollmentController");

// Protect all enrollment routes
router.get("/getall", adminAuth, getAll);
router.post("/addusers", adminAuth, create);
router.put("/update/:id", adminAuth, update);
router.delete("/delete/:id", adminAuth, remove);
router.get("/get/:id", adminAuth, getById); // ✅ new route
module.exports = router;
