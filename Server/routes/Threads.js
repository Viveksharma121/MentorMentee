const router = require("express").Router();
const db = require("../db/db");

router.get("/", async (req, res) => {
  try {
    const tweets = await db.getAllTweets();
    res.status(200).json(tweets);
  } catch (error) {
    console.error("Error fetching tweets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/threads", async (req, res) => {
  try {
    const { id, user_name, content } = req.body;
    const result = await db.createTweets(id, user_name, content);
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
    const userId = req.body;
    const posts = await db.getAllTweets();
    // console.log(posts);
    const post = posts.find((post) => post.id == postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.userIdLists = JSON.parse(post.userIdLists || "[]");
    const likedIndex = post.userIdLists.findIndex(
      (item) => item.userId === userId.userId
    );

    console.log(likedIndex + "liked");
    if (likedIndex == -1) {
      post.userIdLists.push(userId);
      post.likes++;
    } else {
      post.userIdLists.splice(likedIndex, 1);
      post.likes--;
    }
    await db.updateLikes(post);
    res.json(post);
  } catch (error) {
    console.error("Error putting likes ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
