const express = require("express");
const { db } = require("./db/db");
const StudentModel = require("./model/Student");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());

const session = require("express-session");
//config/objects used in sessions
const sessionConfig = {
  secret: "thisisshiuldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    //by default rahta then to
    httpOnly: true,
    //expiration dates
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
//passport modules And User model
const passport = require("passport");
const LocalStragery = require("passport-local");
const User = require("./model/User");
//to use sessions
app.use(session(sessionConfig));
//to use passport
app.use(passport.initialize());
app.use(passport.session());
//hash kar dega password using 'PBKDf2' algorithm
passport.use(new LocalStragery(User.authenticate()));
//to store in sessions
passport.serializeUser(User.serializeUser());
//to remove from session while logout
passport.deserializeUser(User.deserializeUser());

const user_routes = require("./routes/User");
app.use("/user", user_routes);

// app.use((req,res,next)=>{
//   //req.user returns the object of the user
//   //telling us the user is there or not
//    res.locals.currentUser=req.user;
//    next();
// })

const threads_route = require("./routes/Threads");
app.use("/api/thread", threads_route);
app.use("/api", require("./routes/student"));

const resource_route = require("./routes/Resource");
app.use("/api/resource", resource_route);

db()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Failed to connect" + error);
  });

app.get("/", (req, res) => {
  res.json("running");
});

app.get("/getAllUsers", async (req, res) => {
  try {
    const response = await StudentModel.find();
    res.json(response);
  } catch (error) {
    res.json(error);
  }
});
