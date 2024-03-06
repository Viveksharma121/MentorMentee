const StudentModel = require("../model/Student");

exports.addUserToDB = async (req, res) => {
  const { name, position, description, skills, projects } = req.body;

  try {
    // Check if the user already exists
    let userData = await StudentModel.findOne({ name });

    if (!userData) {
      // If the user doesn't exist, create a new record
      userData = new StudentModel({ name, position, description, skills, projects });
    } else {
      // If the user exists, update the existing record
      userData.position = position;
      userData.description = description;
      userData.skills = skills;
      userData.projects = projects;
    }

    // Save the data to the database
    await userData.save();

    res.json({ success: true, message: 'User data saved successfully' });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getUser=async(req,res)=>{
  const { username } = req.params;
  console.log(username);
  try {
    // Find user data by username
    const userData = await StudentModel.findOne({ name: username });
    console.log(userData);
    res.json(userData || null);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

}

exports.getUserSkills=async(req,res)=>{
  try {
    const {username} = req.params;
    console.log('skills ka ',username);
    // Fetch the user by username
    const user = await StudentModel.findOne({ name:username });
    console.log("skills ka ",user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if(user.skills &&user.projects ==null)
    {
      res.json({ skills: null, projects: null});
    }
    console.log("from skills",user.skills,user.projects);
    // Return the skills and projects
    res.json({ skills: user.skills, projects: user.projects});

  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

