const mongoose = require("mongoose");

mongoose.connect(`${process.env.MONGODBURL}OnDoc`)
    .then(() => console.log("Db connected"))
    .catch((err) => console.error("Error connecting to DB:", err));

const db = (dbName) => {
    const connection = mongoose.createConnection(`${process.env.MONGODBURL}${dbName}`);
    return connection;
};

module.exports = db;
