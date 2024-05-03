const mongoose = require("mongoose");

const skillsSchema = new mongoose.Schema({
  name: String,
  followers: [{ type: String, ref: "User" }],
  following: [{ type: String, ref: "User" }],
  position: String,
  description: String,
  skills: [String],
  projects: [
    {
      title: String,
      githubLink: String,
    },
  ],
});

module.exports = mongoose.model("Student", skillsSchema);
