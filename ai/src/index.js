require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./controllers/userController");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

app.use("/user", userRouter);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mydb";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });