const express = require("express");
const { sendOtp } = require("../controllers/otpController");
const { verifyotp } = require("../controllers/otpController");

const router = express.Router();

// POST /api/otp/send
router.post("/send", sendOtp);
router.post("/verify", verifyotp);

module.exports = router;
