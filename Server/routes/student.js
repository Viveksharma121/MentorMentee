const express = require("express");
const router = express.Router();
const studentController = require("../Controllers/studentController");

router.post("/skills", studentController.addUserToDB);
router.get("/skills/:username", studentController.getUser);
router.get("/:username/skills", studentController.getUserSkills);
router.get("/search", studentController.searchUser);
router.get("/searchitem", studentController.getSearchUser);
router.post("/:username/followers", studentController.addFollowers);
router.get("/:currentUser/following", studentController.getFollowingUsers);
router.get("/:currentUser/followers", studentController.getFollowerDetails);

// router.post("/skills/update",studentController.updateSkills);
module.exports = router;
