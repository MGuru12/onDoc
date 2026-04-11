const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/';

const docsSchema = new mongoose.Schema({
    proj: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    deploy: {
        type: String,
        default: "",
    },
    ref: {
        type: mongoose.Schema.Types.ObjectId,
    },
    builtIn: {
        type: Boolean,
        default: false,
    },
    visibility: {
        type: String,
        enum: ["private", "public"],
        default: "public",
    }

});

const connectionCache = new Map();

const docsModel = (dbName) => {
    if (!connectionCache.has(dbName)) {
        console.log(`[docModel] Creating connection to ${MONGO_URL}${dbName}`);
        const connection = mongoose.createConnection(`${MONGO_URL}${dbName}`);
        connectionCache.set(dbName, connection.model('Docs', docsSchema));
    }
    return connectionCache.get(dbName);
};

module.exports = docsModel;