const router = require("express").Router();
const db = require("../db/db");
const { Tweet } = require("../db/db");
const { v4: uuidv4 } = require("uuid");
const User = require("../model/User");
router.get("/", async (req, res) => {
  try {
    const tweets = await Tweet.find();
    res.status(200).json(tweets);
  } catch (error) {
    console.error("Error fetching tweets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/userthread", async (req, res) => {
  try {
    const { username } = req.query;
    const tweets = await Tweet.find({ user_name: username });
    res.status(200).json(tweets);
  } catch (error) {
    console.error("Error fetching tweets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/threads", async (req, res) => {
  try {
    const { user_name, content } = req.body;
    const id = uuidv4();
    const newTweet = new Tweet({
      id,
      user_name,
      content,
      likes: 0,
      created_at: new Date(),
    });

    const result = await newTweet.save();
    console.log(result);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating tweet:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/threads/:postId/like", async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.body.userId;
    const post = await Tweet.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.userIdLists.some((item) => item.userId === userId);
    console.log("====================================");
    console.log(isLiked);
    console.log("====================================");
    if (isLiked === false) {
      post.userIdLists.push({ userId });
      post.likes++;
    } else {
      const indexToRemove = post.userIdLists.findIndex(
        (item) => item.userId === userId
      );
      post.userIdLists.splice(indexToRemove, 1);
      post.likes--;
    }

    const updatedPost = await post.save();

    res.json(updatedPost);
  } catch (error) {
    console.error("Error putting likes ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/threads/:postId/comments", async (req, res) => {
  const postId = req.params.postId;
  console.log(postId);
  const { user_name, content } = req.body;
  console.log(user_name, content);

  try {
    const tweet = await Tweet.findOne({ id: postId });
    console.log(tweet);
    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    const newComment = { user_name, content };
    tweet.comments.push(newComment);

    await tweet.save();

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.post("/save-tweet", async (req, res) => {
  const { user_name, content } = req.body;

  try {
    const tweet = await Tweet.findOne({ content });

    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    const isSaved = tweet.savedBy.some(
      (savedBy) => savedBy.userId === user_name
    );
    if (isSaved) {
      const tweet = await Tweet.findOneAndUpdate(
        { content },
        { $pull: { savedBy: { userId: user_name } } },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Tweet unsaved successfully", tweet: tweet });
    } else {
      const tweet = await Tweet.findOneAndUpdate(
        { content },
        { $addToSet: { savedBy: { userId: user_name } } },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Tweet saved successfully", tweet: tweet });
    }
  } catch (error) {
    console.error("Error saving tweet:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/:username/saved-tweets", async (req, res) => {
  try {
    const username = req.params.username;
    console.log("saved tweets ka ", username);
    // Assuming you have a User model with a method to find by username
    // and a Tweet model with a method to find by IDs
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Assuming 'savedBy' in Tweet documents references User documents
    const savedTweets = await Tweet.find({ "savedBy.userId": username });
    console.log("saved tweets ", savedTweets);
    res.json(savedTweets);
  } catch (error) {
    console.error("Failed to fetch saved tweets:", error);
    res.status(500).send("Internal server error");
  }
});
router.delete("/:user_name/:tweetId/delete-saved-tweet", async (req, res) => {
  const { user_name, tweetId } = req.params;
  console.log("delete ", user_name, tweetId);
  try {
    const tweet = await Tweet.findOneAndUpdate(
      { id: tweetId },
      { $pull: { savedBy: { userId: user_name } } },
      { new: true }
    );
    console.log(tweet);

    if (tweet) {
      res
        .status(200)
        .json({ message: "Tweet removed from saved list successfully" });
    } else {
      res.status(404).json({ error: "Tweet not found" });
    }
  } catch (error) {
    console.error("Error deleting saved tweet:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
