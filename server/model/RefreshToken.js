const mongoose = require("mongoose");
const db = require("../db/configDB");
const { onDoc } = require("../utils/const");

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'client'
    },
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    }
});

// Automatically remove expired tokens from DB
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshTokenModel = db(onDoc).model("RefreshToken", refreshTokenSchema);

module.exports = RefreshTokenModel;
