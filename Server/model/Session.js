const mongoose = require('mongoose');

const enrolledStudentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  meetingLink: {
    type: String,
    required: false // Modify as needed
  },
  meetingDate: {
    type: String,
    required: false // Modify as needed
  },
  enrolledStudents: [enrolledStudentSchema], // Array of enrolled students
  image: {
    type: String, // Assuming you're storing image data as base64 string
    required: false // Modify as needed
  }
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
