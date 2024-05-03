const mongoose = require("mongoose");

const db = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose
      .connect(
        "mongodb+srv://student:student123@cluster0.vpqpeal.mongodb.net/studentDB",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          bufferCommands: false,
        }
      )
      .then(() => {
        console.log("Db connected");
      })
      .catch((error) => {
        console.error("Failed to connect db" + error);
      });
  } catch (error) {
    console.log("DB Connection failed" + error);
  }
};

const commentSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const tweetSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  user_name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: { // Updated field
    type: [String],
    default: [],
  },
  likes: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    required: true,
  },
  userIdLists: [
    {
      userId: {
        type: String,
        required: true,
      },
    },
  ],
  comments: [commentSchema],
  savedBy: [{ userId: String, _id: mongoose.Schema.Types.ObjectId }],
});

const Tweet = mongoose.model("Tweet", tweetSchema);

module.exports = { Tweet, db };
