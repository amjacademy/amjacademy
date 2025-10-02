const express = require("express");

const { Login } = require("../controllers/loginControllers");
const { checkAuth} = require("../controllers/loginControllers");
const { Logout} = require("../controllers/loginControllers");
const router = express.Router();

router.post("/login", Login);

router.get("/check-auth", checkAuth);

router.get("/logout", Logout);


module.exports = router;
