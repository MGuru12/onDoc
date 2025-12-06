const mongoose = require("mongoose");

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

const db = (dbName) => {
    const connection = mongoose.createConnection(`mongodb://localhost:27017/${dbName}`);
    return connection;
};

const docsModel = (dbName) => {
    const connection = db(dbName);
    return connection.model('Docs', docsSchema);
};

module.exports = docsModel;