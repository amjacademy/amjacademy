const express = require("express");
const { updateSlot } = require("../controllers/slotController");
const { releaseSlot } = require("../controllers/slotController");
const { finalizeSlot } = require("../controllers/slotController");
const { getSlotsByDate } = require("../controllers/slotController");

const router = express.Router();

// POST /api/otp/update
router.get("/get-slots/:date", getSlotsByDate);
router.post("/update", updateSlot);
router.post("/release", releaseSlot);
router.post("/finalize", finalizeSlot);

module.exports = router;