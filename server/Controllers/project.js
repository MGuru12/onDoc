const docsModel = require("../model/DocsModel");
const memberModel = require("../model/MemberModel");
const projectModel = require("../model/ProjectModel");
const { status500, status400, blocks } = require("../utils/const");

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
        await Docs.create({proj: proj._id, title: "root", path: '/', content: {blocks}, builtIn: true});

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
        const {_id, usrId, usrType} = req.JWT;

        const Member = memberModel(_id);
        const projIds = await Member.find({userId: usrId}).distinct('projId');
        
        const Proj = projectModel(_id);
        let query = usrType === "Client" ? {} : {_id: {$in: projIds}};
        res.json(await Proj.find(query).select('title _id').lean());
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
};

const getProjById = async(req, res) => {
    try
    {
        const {projId} = req.params;
        const {_id} = req.JWT;
        if(!projId) return res.status(400).json({message: status400});

        const Proj = projectModel(_id);
        const proj = await Proj.findOne({_id: projId}).select('title description').lean();

        res.json(proj);
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
};

const updateProj = async(req, res) => {
    try
    {
        const {projId} = req.params;
        const {_id} = req.JWT;
        const {title, description} = req.body;
        if(!projId || !title) return res.status(400).json({message: status400});

        const Proj = projectModel(_id);
        await Proj.updateOne({_id: projId}, {title, description});
        res.json({message: "Project updated successfully"});
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
};

module.exports = {addProj, delProj, getAllProj, getProjById, updateProj};