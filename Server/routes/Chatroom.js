const express = require("express");
const router = express.Router();
const Chatroom = require("../model/chatroom");

router.get("/chatroom/:chatroomId/session-state", async (req, res) => {
  try {
    const chatroom = await Chatroom.findOne({
      chatroomId: req.params.chatroomId,
    });
    if (!chatroom) {
      return res.status(404).json({ message: "Chatroom not found" });
    }
    res
      .status(200)
      .json({ isMentoringSessionActive: chatroom.isMentoringSessionActive });
  } catch (error) {
    console.error("Error fetching mentoring session state:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/chatroom/:chatroomId/session-state", async (req, res) => {
  try {
    const chatroom = await Chatroom.findOneAndUpdate(
      { chatroomId: req.params.chatroomId },
      { isMentoringSessionActive: req.body.isMentoringSessionActive },
      { new: true }
    );
    if (!chatroom) {
      return res.status(404).json({ message: "Chatroom not found" });
    }
    res
      .status(200)
      .json({ isMentoringSessionActive: chatroom.isMentoringSessionActive });
  } catch (error) {
    console.error("Error updating mentoring session state:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/chatroom/:chatroomId/participants/0", async (req, res) => {
  try {
    const chatroomId = req.params.chatroomId;
    const chatroom = await Chatroom.findOne({ chatroomId });

    if (!chatroom) {
      return res.status(404).json({ message: "Chatroom not found" });
    }

    const participant = chatroom.participants[0];
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    res.status(200).json({ participant });
  } catch (error) {
    console.error("Error fetching participant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/allchatrooms", async (req, res) => {
  try {
    const username = req.query.username;
    console.log("username of all chatrooms request", username);
    const allChats = await Chatroom.find({ participants: username });
    res.status(200).json(allChats);
  } catch (error) {
    console.error("Error fetching chatrooms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
