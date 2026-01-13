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
    },
    plan: {
        currentPlan: {
            type: String,
            default: "free",
            enum: [null, "free", "basic", "standard", "premium"]
        },
        activeUntil: {
            type: Date,
            default: null,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date
        },
        nextPlan: {
            type: String,
            default: null,
            enum: [null, "basic", "standard", "premium"]
        }
    }
});

const clientModel = db(onDoc).model("client",  clientSchema);

module.exports = clientModel;