const express = require("express");
const router = express.Router();
const studentController = require("../Controllers/studentController");

router.post("/skills", studentController.addUserToDB);
router.get("/skills/:username",studentController.getUser);
router.get("/:username/skills",studentController.getUserSkills);
// router.post("/skills/update",studentController.updateSkills);
module.exports = router;
