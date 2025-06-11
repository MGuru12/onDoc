const docsModel = require("../model/DocsModel");
const projectModel = require("../model/ProjectModel");
const { status500, status400 } = require("../utils/const");

const addProj = async(req, res) => {
    try
    {
        const {title} = req.body;
        const {_id} = req.JWT;
        if(!title) return res.status(400).json({message: status400});

        const Proj = projectModel(_id);
        const Docs = docsModel(_id);

        if(await Proj.findOne({title})) return res.status(409).json({message: `Project ${title} already exists`});

        const proj = await Proj.create({title});
        await Docs.create({proj: proj._id, title: "root", path: '/', content: {
            blocks: [
            {
                type: "paragraph",
                data: { text: "Welcome to the root page" }
            }
            ]
        }, builtIn: true});

        res.status(201).json({message: `project ${title} created successfully`});
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500})
    }
};

const delProj = async(req, res) => {
    try
    {
        const {projId} = req.query;
        const {_id} = req.JWT;
        if(!projId) return res.status(400).json({message: status400});

        const Proj = projectModel(_id);
        const Docs = docsModel(_id);
        await Proj.deleteOne({_id: projId});
        await Docs.deleteMany({proj: projId});
        res.json({message: "Project deleted successfully"});
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
};

const getAllProj = async(req, res) => {
    try
    {
        const {_id} = req.JWT;

        const Proj = projectModel(_id);
        res.json(await Proj.find());
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
};

module.exports = {addProj, delProj, getAllProj};