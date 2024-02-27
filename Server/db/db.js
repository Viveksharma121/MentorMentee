const mongoose = require("mongoose");

const db = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose
      .connect(
        "mongodb+srv://vivekksharma369:e4Ib6fbR3jMPPlFp@cluster0.c9s0xnu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
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
});

const Tweet = mongoose.model("Tweet", tweetSchema);

module.exports = { Tweet, db };
