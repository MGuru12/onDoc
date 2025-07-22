const mongoose = require("mongoose");
const db = require("../db/configDB");

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    // proj: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Project',
    // },
    inviteToken: {
        type: String,
        default: null,
    }
});

const userModel = (dbName) => {
    const connection = db(dbName);
    return connection.model('User', userSchema);
};

module.exports = userModel;