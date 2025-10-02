const express = require("express");

const { Login } = require("../controllers/adminloginControllers");
const { checkAuth} = require("../controllers/adminloginControllers");
const { Logout} = require("../controllers/adminloginControllers");
const router = express.Router();

router.post("/login", Login);

router.get("/check-auth", checkAuth);

router.get("/logout", Logout);


module.exports = router;
