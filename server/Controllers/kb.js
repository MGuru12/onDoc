const docsModel = require("../model/DocsModel");
const projectModel = require("../model/ProjectModel");
const { status500, status400 } = require("../utils/const");

const getKB = async(req, res) => {
    try
    {
        const {orgId, projId} = req.params;
        if(!orgId || !projId) res.status(400).json({message: status400});

        const Proj = projectModel(orgId);
        const Docs = docsModel(orgId);
        const data = {proj: await Proj.findOne({_id: projId}), docs: await Docs.find({proj: projId})}
        res.status(200).json({data});

    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    };
};

const getDoc = async(req, res) => {
    try
    {
        const {orgId, docId} = req.params;
        if(!orgId || !docId) req.status(400).json({message: status400});

        const Docs = docsModel(orgId);
        res.status(200).json(await Docs.findOne({_id: docId}));
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
};

module.exports = {getKB, getDoc};