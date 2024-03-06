const router = require("express").Router();
const db = require("../db/db");
const { Tweet } = require("../db/db");
const { v4: uuidv4 } = require("uuid");
router.get("/", async (req, res) => {
  try {
    const tweets = await Tweet.find();
    
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

module.exports = router;
