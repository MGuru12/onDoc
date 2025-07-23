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

const getMembers = async (req, res) => {
    try {
        const { projId } = req.params;
        const { _id } = req.JWT;
        if (!projId) return res.status(400).json({ message: status400 });

        const User = userModel(_id);
        const Member = memberModel(_id);

        // Fetch members of the project
        const members = await Member.find({ projId }, { userId: 1, isAdmin: 1, _id: 0 });

        const usersId = members.map(m => m.userId);

        // Fetch user info
        const users = await User.find({ _id: { $in: usersId } })
                                .select('username email _id isAdmin')
                                .lean();

        // Create a lookup for isAdmin by userId
        const adminMap = new Map(members.map(m => [m.userId.toString(), m.isAdmin]));

        // Add isAdminProj to each user
        const usersWithAdminFlag = users.map(user => ({
            ...user,
            isAdminProj: adminMap.get(user._id.toString()) || false
        }));

        res.json({
            message: "Members fetched successfully",
            members: usersWithAdminFlag,
            isAdmin: members.find(m => m.userId.toString() === _id.toString())?.isAdmin || false
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: status500 });
    }
};

const getProjOwnerDetails = async(req, res) => {
    try
    {
        const { _id } = req.JWT;
        const owner = await clientModel.findById(_id).select('username email _id').lean();
        if (!owner) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "Owner details fetched successfully", owner });
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
};

const getMyDetailsProj = async(req, res) => {
    try
    {
        const { _id, usrId, usrType } = req.JWT;
        console.log(req.JWT);
        
        const {projId} = req.params;

        if (!projId) return res.status(400).json({ message: status400 });
        if(usrType==='Client') res.status(200).json({ message: "My details fetched successfully", myDetails: {isAdmin: true, isAdminProj: true} });

        const User = userModel(_id);
        const Member = memberModel(_id);
        const user = await User.findById(usrId).select('isAdmin').lean();
        const member = await Member.findOne({ projId, userId: usrId }).select('isAdmin').lean();
        if (!member) return res.status(404).json({ message: "Member not found in the project" });
        const myDetails = { isAdmin: user.isAdmin, isAdminProj: member.isAdmin};
        res.status(200).json({ message: "My details fetched successfully", myDetails });
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
};

module.exports ={inviteMember, ResendInviteMail, deleteMember, getMembers, getProjOwnerDetails, getMyDetailsProj};