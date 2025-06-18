const mongoose = require("mongoose");
const db = require("../db/configDB");

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        requires: true,
    },
    description: {
        type: String,
        default: "",
    }
});

const projectModel = (dbName) => {
    const connection = db(dbName);
    return connection.model('Project', projectSchema);
};

module.exports = projectModel;