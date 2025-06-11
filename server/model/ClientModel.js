const mongoose = require("mongoose");
const db = require("../db/configDB");
const { onDoc } = require("../utils/const");

const clientSchema = new mongoose.Schema({
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
    organizationName: {
        type: String,
        required: true,
    }
});

const clientModel = db(onDoc).model("client",  clientSchema);

module.exports = clientModel;