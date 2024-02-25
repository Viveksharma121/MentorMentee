const express = require("express");
const router = express.Router();
const studentController = require("../Controllers/studentController");

router.post("/skills", studentController.addUserToDB);
module.exports = router;
