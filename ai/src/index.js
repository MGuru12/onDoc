require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./controllers/userController");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

// Handle MongoDB connection for serverless
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mydb";
let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  cachedDb = await mongoose.connect(MONGO_URI);
  return cachedDb;
};

// Middleware to ensure DB is connected before handling request
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).send("Internal Server Error: Database connection failed");
  }
});

app.get("/ai", (req, res) => res.json({ message: "AI service connected" }));
app.use("/ai/user", userRouter);
app.use("/user", userRouter);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  connectToDatabase()
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
}

module.exports = app;