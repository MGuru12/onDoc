const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/colleges')
    .then(() => console.log("Db connected"))
    .catch((err) => console.error("Error connecting to DB:", err));

const db = (dbName) => {
    const connection = mongoose.createConnection(`mongodb://localhost:27017/${dbName}`);
    return connection;
};

module.exports = db;
