const express = require("express");
const { db, Tweet } = require("./db/db");
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
const Notification=require("./model/Notification");
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

let messages = [];

app.post("/sendMessage", async (req, res) => {
  console.log("chat hitted");
  const { input } = req.body;

  // Add user message to the chat
  messages.push({ text: input, user: "user" });

  try {
    // Make a request to the OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/engines/davinci-codex/completions",
      {
        prompt:
          messages.map((message) => message.text).join("\n") + "\n" + input,
        max_tokens: 150,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer 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",
        },
      }
    );

    // Add the chatbot's response to the chat
    const botResponse = response.data.choices[0].text.trim();
    messages.push({ text: botResponse, user: "bot" });

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching response from OpenAI API:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

const crypto = require("crypto");
const Chatroom = require("./model/chatroom");
const Message = require("./model/message");
const uuid = crypto.randomUUID();
const { v4: uuidv4 } = require("uuid");
const Resource = require("./model/Resource");

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "x-access-token, Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

// app.get("/", (req, res) => {
//   res.send("App is running");
// });

app.get("/users", async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await Model.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// app.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     console.log(name, email, password);
//     const result = await Model.create({ name, email, password });
//     console.log(result);
//     res.json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// });

// app.post("/login", async (req, res) => {
//   try {
//     const result = await Model.findOne({
//       email: req.body.email,
//       password: req.body.password,
//     });
//     if (result) {
//       // res.status(404).json({ message: "User exists" });
//       res.status(200).send("User exists");

//       // Create JWT token
//       // jwt.sign({ user }, secretKey, { expiresIn: "1h" }, (err, token) => {
//       //   if (err) {
//       //     res.status(500).json({ error: "Failed to create token" });
//       //   } else {
//       //     res.json({ token });
//       //   }
//       // });
//     } else {
//       res.status(404).send("User does not exist");
//       // res.status(404).json({ message: "User does not exist." });
//     }
//   } catch (err) {
//     res.status(500).send("Error getting data: ");
//   }
// });

app.post("/search", async (req, res) => {
  try {
    const result = await User.findOne({ email: req.body.username });
    if (result) {
      res.status(200).send({ userName: result.username });
    } else {
      res.status(404).send("user not found.");
    }
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).send("Internal Server Error");
  }
});

// This will search a chatroom if it already exists, if not then creates a chatroom
app.post("/chatroom", async (req, res) => {
  try {
    const { userName, myUsername } = req.body;
    console.log(req.body);
    // Check if a chatroom already exists for the participants
    let existingChatroom = await Chatroom.findOne({
      participants: { $all: [userName, myUsername] },
    });
    console.log(existingChatroom + "exist");
    if (!existingChatroom) {
      const chatroomId = uuidv4();
      // If a chatroom doesn't exist, create a new one
      const newChatroom = new Chatroom({
        chatroomId: chatroomId, // You can generate a unique ID using a library like `uuid` or any other method
        participants: [userName, myUsername],
      });

      // Save the new chatroom to the database
      existingChatroom = await newChatroom.save();
    }

    res.json({
      chatroomId: existingChatroom.chatroomId,
      message: "New Chatroom created",
    });
  } catch (error) {
    console.error("Error creating or finding chatroom:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// app.post("/homepage", async (req, res) => {
//   const email = req.body.email;
//   try {
//     // Find chatrooms where the participants array includes your email
//     const chatrooms = await Chatroom.find({ participants: email });

//     // Extract other user's email from chatrooms
//     const otherUsers = chatrooms.map((chatroom) => {
//       return chatroom.participants.find((participant) => participant !== email);
//     });

//     res.json(otherUsers);
//   } catch (error) {
//     console.error("Error fetching chatrooms:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.post("/homepage", async (req, res) => {
//   const email = req.body.email;
//   try {
//     // Find chatrooms where the participants array includes your email
//     const chatrooms = await Chatroom.find({ participants: email });

//     // Construct the response with the other user's email for each chatroom
//     const chatroomsWithOtherUsers = chatrooms.map((chatroom) => {
//       // Find the email of the other participant
//       const otherUser = chatroom.participants.find(
//         (participant) => participant !== email
//       );
//       return {
//         chatroomId: chatroom.chatroomId,
//         otherUser: otherUser, // Include the other user's email in the response
//       };
//     });

//     res.json(chatroomsWithOtherUsers); // Send the response with chatrooms and other users' emails
//   } catch (error) {
//     console.error("Error fetching chatrooms:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.post("/homepage", async (req, res) => {
  const username = req.body.username;
  console.log(username);
  try {
    // Find chatrooms where the participants array includes your email
    const chatrooms = await Chatroom.find({ participants: username });

    // Construct the response with the other user's name for each chatroom
    const chatroomsWithOtherUsers = [];
    for (const chatroom of chatrooms) {
      // Find the email of the other participant
      const otherUserName = chatroom.participants.find(
        (participant) => participant !== username
      );
      console.log(otherUserName);
      // Find the name associated with the other user's email
      // const otherUser = await User.findOne({ username: otherUserName });
      chatroomsWithOtherUsers.push({
        chatroomId: chatroom.chatroomId,
        otherUserName: otherUserName,
      });
    }

    res.json(chatroomsWithOtherUsers); // Send the response with chatrooms, other users' and names
  } catch (error) {
    console.error("Error fetching chatrooms:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// This is to render all the messages when between 2 users at the start as well when any msg is sent.
app.post("/messages", async (req, res) => {
  try {
    const { chatroomId } = req.body;
    const messages = await Message.find({ chatroomId });

    if (messages.length === 0) {
      // If no messages found, return a custom response
      return res
        .status(404)
        .json({ message: "No messages found for this chatroom" });
    }
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// This will be activated when any of the 2 users send a message
app.post("/message", async (req, res) => {
  try {
    const { chatroomId, sender, text } = req.body;
    const messageId = uuidv4();

    // Create a new message
    const newMessage = new Message({
      messageId,
      chatroomId,
      sender,
      text,
    });

    // Save the message to the database
    await newMessage.save();

    // Send a success response
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/credits/:postId',async(req,res)=>{
  try {
    const postId=req.params.postId;
    console.log(postId);
    const credituser= await Tweet.find({id:postId});
    console.log("credit of the user in backend ",credituser);
    res.status(200).json(credituser);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

app.get('/credits/:resId', async (req, res) => {
  try {
    const resId = req.params.resId;
    console.log("Received resId:", resId);

    const credituser = await Resource.findById(mongoose.Types.ObjectId(resId));
    console.log("credit of the user in backend ", credituser);

    res.status(200).json(credituser);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/update-credits', async (req, res) => {
  const { username, actionType, rating } = req.body;
  console.log(username, actionType, rating);

  try {
    let creditsToAdd = 0;

    switch (actionType) {
      case 'comment':
        creditsToAdd = 5;
        break;
      case 'like':
        creditsToAdd = 1;
        break;
      case 'resourcelike':
        creditsToAdd = 10;
        break;
      case 'resourceAdd':
        creditsToAdd = 50;
        break;
      case 'Rating':
        // Adjust the conversion from rating to credits as per your requirement
        // This is just an example, adjust it based on your business logic
        creditsToAdd = rating * 20;
        break;
      default:
        break;
    }

    if (creditsToAdd > 0) {
      const user = await User.findOneAndUpdate(
        { username },
        { $inc: { credits: creditsToAdd } },
        { new: true }
      );

      console.log(`${username} ke credit => ${user.credits}`);
      return res.json({ success: true, credits: user.credits });
    } else {
      return res.json({ success: false, message: 'Invalid action type' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


app.get('/chatroomId', async (req, res) => {
  const { participant1, participant2 } = req.query;

  try {
    const chatroom = await Chatroom.findOne({
      participants: { $all: [participant1, participant2] }
    });

    if (!chatroom) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }

    res.json({ chatroomId: chatroom.chatroomId });
  } catch (error) {
    console.error('Error fetching chatroomId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/:username/credits', async (req, res) => {
  const { username } = req.params;
  try {
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.json({ credits: user.credits });
  } catch (error) {
      console.error('Error fetching user credits:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to deduct credits from user's account
app.post('/deduct-credits', async (req, res) => {
  const { username, price } = req.body;
  try {
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      if (user.credits < price) {
          return res.status(400).json({ message: 'Insufficient credits' });
      }
      user.credits -= price;
      await user.save();
      res.json({ message: 'Credits deducted successfully' });
  } catch (error) {
      console.error('Error deducting credits:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/send-notification', async (req, res) => {
  try {
    // Extract sender, receiver, and message from request body
    const { sender, receiver, message } = req.body;

    // Create a new notification object
    const notification = new Notification({
      sender,
      receiver,
      message
    });

    // Save the notification to the database
    await notification.save();
    console.log("notification saved ",notification);
    // Respond with a success message
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    // If an error occurs, respond with an error message
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/notifications/:username', async (req, res) => {
  const { username } = req.params;
  console.log("backend notification USername ",username);
  try {
    // Query the database to find notifications where the receiver is the provided username
    const notifications = await Notification.find({ receiver: username });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete("/notifications/:id", async (req, res) => {
  const notificationId = req.params.id;

  try {
    // Find the notification by ID and delete it
    const deletedNotification = await Notification.findByIdAndDelete(
      notificationId
    );

    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});