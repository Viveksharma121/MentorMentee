const mongoose = require("mongoose");

// Define the schema for the message
const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    unique: true,
    required: true,
  },
  chatroomId: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});

// Create the Message model
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
