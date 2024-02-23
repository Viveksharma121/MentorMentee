const express = require("express");
const db = require("./db/db");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());

const threads_route = require("./routes/Threads");
app.use("/api/thread", threads_route);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.json("running");
});
