const StudentModel = require("../model/Student");

exports.addUserToDB = async (req, res) => {
  const { name, position, description, skills, projects } = req.body;

  try {
    // Check if the user already exists
    let userData = await StudentModel.findOne({ name });

    if (!userData) {
      // If the user doesn't exist, create a new record
      userData = new StudentModel({
        name,
        position,
        description,
        skills,
        projects,
      });
    } else {
      // If the user exists, update the existing record
      userData.position = position;
      userData.description = description;
      userData.skills = skills;
      userData.projects = projects;
    }

    // Save the data to the database
    await userData.save();

    res.json({ success: true, message: "User data saved successfully" });
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUser = async (req, res) => {
  const { username } = req.params;
  console.log(username);
  try {
    // Find user data by username
    const userData = await StudentModel.findOne({ name: username });
    console.log(userData);
    res.json(userData || null);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUserSkills = async (req, res) => {
  try {
    const { username } = req.params;
    console.log("skills ka ", username);
    // Fetch the user by username
    const user = await StudentModel.findOne({ name: username });
    console.log("skills ka ", user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.skills && user.projects == null) {
      res.json({ skills: null, projects: null });
    }
    console.log("from skills", user.skills, user.projects);
    // Return the skills and projects
    res.json({ skills: user.skills, projects: user.projects });
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.searchUser = async (req, res) => {
  const { query } = req.query;

  try {
    // Search for students with matching username or skills
    const results = await StudentModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Case-insensitive username search
        { skills: { $in: [query] } }, // Search in skills array
      ],
    });

    res.json(results);
  } catch (error) {
    console.error("Error searching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSearchUser = async (req, res) => {
  const { username } = req.query;
  console.log("backend username", username);
  try {
    const user = await StudentModel.findOne({ name: username });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//follower following
exports.addFollowers = async (req, res) => {
  try {
    const { username } = req.params;
    const { followername } = req.body;

    // Find the user to follow
    const user = await StudentModel.findOne({ name: username });
    // Find the follower
    const follower = await StudentModel.findOne({ name: followername });

    // Check if both user and follower exist
    if (!user || !follower) {
      return res.status(404).json({ message: "User or follower not found." });
    }

    // Check if the follower is already following the user
    console.log(user.followers);
    console.log(follower.name);
    const isFollowing = user.followers.includes(follower.name);
    console.log(isFollowing);
    if (isFollowing) {
      const followerIndex = user.followers.indexOf(follower.name);
      if (followerIndex !== -1) {
        user.followers.splice(followerIndex, 1); // Remove follower from user's followers list
        const userIndex = follower.following.indexOf(user.name);
        if (userIndex !== -1) {
          follower.following.splice(userIndex, 1); // Remove user from follower's following list
          await user.save();
          await follower.save();
          return res.json({ message: "User unfollowed successfully." });
        }
      }
    } else {
      user.followers.push(follower.name);
      follower.following.push(user.name);
      await user.save();
      await follower.save();
      res.json({ message: "User followed successfully." });
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getFollowingUsers = async (req, res) => {
  try {
    const { currentUser } = req.params;
    console.log(currentUser);
    // Find the current user
    const user = await StudentModel.findOne({ name: currentUser });

    // Check if the current user exists
    if (!user) {
      return res.status(404).json({ message: "Current user not found." });
    }

    // Fetch the users followed by the current user
    const followingUsers = await StudentModel.find({ followers: currentUser });
    const names = followingUsers.map((user) => user.name);
    console.log(names);
    res.json(names);
  } catch (error) {
    console.error("Error fetching following users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getFollowerDetails = async (req, res) => {
  try {
    const { currentUser } = req.params;
    console.log(currentUser);

    // Find the current user
    const user = await StudentModel.findOne({ name: currentUser });

    // Check if the current user exists
    if (!user) {
      return res.status(404).json({ message: "Current user not found." });
    }

    // Get the followers for the current user
    const followerDetails = await StudentModel.find({ following: currentUser });
    const followerCount = followerDetails.length;

    console.log("Follower count:", followerCount);
    console.log("Follower details:", followerDetails);
    const names = followerDetails.map((user) => user.name);
    res.json(names);
  } catch (error) {
    console.error("Error fetching follower details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
