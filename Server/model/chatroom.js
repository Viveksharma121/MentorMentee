const mongoose = require("mongoose");

// Define the schema for the chatroom
const chatroomSchema = new mongoose.Schema({
  chatroomId: {
    type: String,
    unique: true,
    required: true,
  },
  participants: [
    {
      type: String,
      required: true,
    },
  ],
  lastMessage: {
    type: String,
    default: "",
  },
});

// Create the Chatroom model
const Chatroom = mongoose.model("Chatroom", chatroomSchema);

module.exports = Chatroom;
