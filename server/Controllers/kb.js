const docsModel = require("../model/DocsModel");
const projectModel = require("../model/ProjectModel");
const { status500, status400 } = require("../utils/const");

const getKB = async(req, res) => {
    try
    {
        const {orgId, projId} = req.params;s
        if(!orgId || !projId) res.status(400).json({message: status400});

        const Proj = projectModel(orgId);
        const Docs = docsModel(orgId);
        const allDocs = await Docs.find({proj: projId});
        // De-duplicate by path to prevent multiple roots or redundant docs
        const uniqueDocs = Array.from(new Map(allDocs.map(doc => [doc.path, doc])).values());
        const data = {proj: await Proj.findOne({_id: projId}), docs: uniqueDocs}
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