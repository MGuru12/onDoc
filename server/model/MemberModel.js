const mongoose = require("mongoose");
const db = require("../db/configDB");

const memberSchema = new mongoose.Schema({
    projId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
});

const memberModel = (dbName) => {
    const connection = db(dbName);
    return connection.model('Member', memberSchema);
};

module.exports = memberModel;