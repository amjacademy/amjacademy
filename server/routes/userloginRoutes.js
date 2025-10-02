const express = require("express");

const { sendOtp } = require("../controllers/userloginController");
const { verifyOtp } = require("../controllers/userloginController");
const { Login } = require("../controllers/userloginController");
const { Logout } = require("../controllers/userloginController");
const { userAuth } = require("../controllers/userloginController");
const { checkAuth } = require("../controllers/userloginController");
const router = express.Router();

router.post("/sendotp", sendOtp);

router.post("/verifyotp", verifyOtp);

router.post("/login", Login);

router.post("/logout", Logout);

router.get("/userauth", userAuth);

router.get("/checkauth", checkAuth);


module.exports = router;
