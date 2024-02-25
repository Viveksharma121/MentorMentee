const StudentModel = require('../model/Student');

exports.addUserToDB = async (req, res) => {
  const { name, position, description, skills, projects } = req.body;

  const user = new StudentModel({
    name,
    position,
    description,
    skills,
    projects,
  });

  try {
    await StudentModel.create(user);
    res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
