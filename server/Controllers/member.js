const crypto = require('crypto');
const clientModel = require("../model/ClientModel");
const projectModel = require("../model/ProjectModel");
const userModel = require("../model/UserModel");
const { status500, status400 } = require("../utils/const");
const { inviteUser } = require('../utils/mail');

const inviteMember = async(req, res) => {
    try
    {
        const {projId} = req.params;
        const {_id} = req.JWT;
        const {uName, email, password} = req.body;
        if(!projId || !uName || !email || !password) return res.status(400).json({message: status400});

        const Proj = projectModel(_id);
        if(!(await Proj.exists({_id: projId}))) return res.status(404).json({message: "Invalid project"});

        if(await clientModel.exists({email})) return res.status(409).json({message: `Client email cant be registered as team member`});
        const User = userModel(_id);
        if(await User.findOne({email, proj: projId})) return res.status(409).json({message: "User already added"});
        const inviteToken = crypto.randomBytes(32).toString('hex');
        await User.create({username: uName, email, password, inviteToken});
        const registerLink = `http://localhost:5173/${_id}/${projId}/register/${inviteToken}`;

        await inviteUser(registerLink, email, uName);

        res.status(201).json({message: "User invited successfully"});
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
};

const ResendInviteMail = async(req, res) => {
    try
    {
        const {projId} = req.params;
        const {_id} = req.JWT;
        const {email, name, inviteToken} = req.body;
        if(!projId || !email || !name || !inviteToken) return res.status(400).json({message: status400});

        const registerLink = `http://localhost:5173/${_id}/${projId}/register/${inviteToken}`;
        await inviteUser(registerLink, email, name);
        res.json({message: "Resended invite to the user successfully"});      
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
};

const deleteMember = async(req, res) => {
    try
    {
        const {projId} = req.params;
        const {_id} = req.JWT;
        const {userId} = req.query;
        if(!userId) return res.status(400).json({message: status400});

        const User = userModel(_id);
        await User.deleteOne({_id: userId, proj: projId});
        res.json({message: "User deleted successfully"});
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
};

const getMembers = async(req, res) => {
    try
    {
        const {projId} = req.params;
        const {_id} = req.JWT;
        if(!projId) return res.status(400).json({message: status400});

        const User = userModel(_id);
        res.json(await User.find({proj: projId}));
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
};

module.exports ={inviteMember, ResendInviteMail, deleteMember, getMembers};