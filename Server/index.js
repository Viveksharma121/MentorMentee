const express = require("express");
const { db } = require("./db/db");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());

const threads_route = require("./routes/Threads");
app.use("/api/thread", threads_route);
app.use("/api", require("./routes/student"));
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
