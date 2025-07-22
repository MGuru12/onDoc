const crypto = require('crypto');
const clientModel = require("../model/ClientModel");
const projectModel = require("../model/ProjectModel");
const userModel = require("../model/UserModel");
const { status500, status400 } = require("../utils/const");
const { inviteUser } = require('../utils/mail');
const { log } = require('console');
const memberModel = require('../model/MemberModel');

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
        const Member = memberModel(_id);
        // if(await User.findOne({email, proj: projId})) return res.status(409).json({message: "User already added"});
        let user = await User.findOne({email});
        let newUsr = false;
        const inviteToken = crypto.randomBytes(32).toString('hex');
        if(!user) 
            {
                user = await User.create({username: uName, email, password, inviteToken});
                newUsr = true;
            }

        const member = await Member.findOne({userId: user._id, projId});

        if(member) return res.status(409).json({message: "User already added to the project"});
        await Member.create({userId: user._id, projId});

        const registerLink = `http://localhost:5173/${_id}/register/${inviteToken}`;
        console.log(`Invite link: ${registerLink}`);
        // await inviteUser(registerLink, email, uName);
        const message = newUsr ?
            "User invited successfully. Please ask them to reset the password using the invite link." :
            "User added successfully.";
        res.status(201).json({message});
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
        const {userId} = req.params;
        const {_id} = req.JWT;
        const {projId} = req.query;
        if(!userId) return res.status(400).json({message: status400});

        const User = userModel(_id);

        if(projId)
            {
                const Member = memberModel(_id);
                const member = await Member.findOne({userId, projId});
                if(!member) return res.status(404).json({message: "Member not found in the project"});
                await Member.deleteOne({userId, projId});
                return res.json({message: "Member removed from the project successfully"});
            }

        await User.deleteOne({_id: userId});
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
        const Member = memberModel(_id);
        const usersId = await Member.find({projId}).distinct('userId');

        res.json(await User.find({_id: {$in: usersId}}, {password: 0, inviteToken: 0, __v: 0}));
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
};

module.exports ={inviteMember, ResendInviteMail, deleteMember, getMembers};