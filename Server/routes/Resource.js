const router = require("express").Router();
const Resource = require("../model/Resource");

router.get("/allResources", async (req, res) => {
  try {
    const resources = await Resource.find();
    res.status(201).json(resources);
  } catch (error) {
    console.log("Error adding resource:", error);
    res.status(500).json({ message: "Internl error" });
  }
});

router.get("/find/:resourceId", async (req, res) => {
  try {
    const { resourceId } = req.params;
    const resource = await Resource.findById(resourceId);
    res.status(201).json(resource);
  } catch (error) {
    console.log("Error adding resource:", error);
    res.status(500).json({ message: "Internl error" });
  }
});

router.post("/addResource", async (req, res) => {
  try {
    const { title, description, category, url, createdBy } = req.body;
    const addedResource = new Resource({
      title,
      description,
      category,
      url,
      createdBy,
    });
    const savedResource = await addedResource.save();
    res.status(201).json(savedResource);
  } catch (error) {
    console.log("Error adding resource:", error);
    res.status(500).json({ message: "Internl error" });
  }
});

router.put("/incrementViews/:resourceId", async (req, res) => {
  try {
    const { resourceId } = req.params;
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    resource.views += 1;
    await resource.save();
    res.status(200).json({ message: "Views incremented successfully" });
  } catch (error) {
    console.error("Error incrementing views:", error);
    res.status(500).json({ message: "Internal error" });
  }
});

router.put("/incrementLikes/:resourceId", async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { username } = req.body; // Assuming userId is sent in the request body

    console.log(username);
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Check if the user has already liked the resource
    if (!resource.likedUsers.includes(username)) {
      // User hasn't liked the resource before, so increment likes count
      resource.likes += 1;
      resource.likedUsers.push(username); // Add user to liked users list
      const rating = await calculateRating(resource.likes, 1);
      resource.rating = rating;
      await resource.save();
      res.status(200).json({
        message: "Likes incremented successfully",
        likes: resource.likes,
        rating: resource.rating,
      });
    } else {
      // User has already liked the resource, so decrement likes count
      resource.likes -= 1;
      resource.likedUsers = resource.likedUsers.filter(
        (name) => name !== username
      ); // Remove user from liked users list
      const rating = await calculateRating(resource.likes, 0);
      resource.rating = rating;
      await resource.save();
      res.status(200).json({
        message: "Likes decremented successfully",
        likes: resource.likes,
        rating: resource.rating,
      });
    }
  } catch (error) {
    console.error("Error incrementing views:", error);
    res.status(500).json({ message: "Internal error" });
  }
});

router.put("/decrementLikes/:resourceId", async (req, res) => {
  try {
    const { resourceId } = req.params;
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    resource.likes -= 1;
    const rating = await calculateRating(resource.likes);
    console.log(rating + " this is rating");
    resource.rating = rating;
    await resource.save();
    res.status(200).json({
      message: "Likes incremented successfully",
      likes: resource.likes,
    });
  } catch (error) {
    console.error("Error incrementing views:", error);
    res.status(500).json({ message: "Internal error" });
  }
});

// Formula to calculate rating based on likes count
const calculateRating = async (likes, flag) => {
  // Assuming a maximum rating of 5
  const maxRating = 5;

  const maxLikesResourceObj = await Resource.findOne()
    .sort({ likes: -1 })
    .select("likes");
  let maxLikes = maxLikesResourceObj ? maxLikesResourceObj.likes : 1;
  console.log(maxLikes);
  if (flag === 0) maxLikes = maxLikes - 1;
  // If no resource with likes is found, set maxLikes to 1 to avoid division by zero
  // const maxLikes = maxLikesResource ? maxLikesResource.likes : 1;

  const percentage = (likes / maxLikes) * 100;

  let rating = (percentage / 100) * maxRating;
  rating = Math.min(rating, maxRating);

  // Round the rating to two decimal places
  return Math.round(rating * 100) / 100;
};

module.exports = router;
