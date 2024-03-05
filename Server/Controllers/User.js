const User = require("../model/User");
const passport = require("passport");
const jwt = require("jsonwebtoken");
module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({
      email,
      username,
    });
    //passport has this funcationality
    //where it has a function called register(variable,password) which
    //saves the user in the db
    const registeredUser = await User.register(user, password);

    //abb user jab register karta he should be able to use features
    //par it asking for login
    //therefore theres a methoad called "req.login" which login in the user in the session
  } catch (err) {
    console.log(err);
  }
};
module.exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
      }
      // Generate JWT token
      const token = jwt.sign({ id: user._id }, "your_secret_key", {
        expiresIn: "1h",
      });
      return res.status(200).json({ message: "Login successful", token });
    });
  })(req, res, next);
};
