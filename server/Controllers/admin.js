const memberModel = require("../model/MemberModel");
const userModel = require("../model/UserModel");
const { status500, status400 } = require("../utils/const");

const addProjAdmin = async (req, res) => {
    try
    {
        const {_id} = req.JWT;
        const {projId} = req.params;
        const {userId} = req.body;
        if(!userId || !projId) return res.status(400).json({message: status400});

        const Member = memberModel(_id);
        const member = await Member.findOne({userId, projId});
        if(!member) return res.status(404).json({message: "User not found"});
        if(member.isAdmin) return res.status(400).json({message: "User is already an admin"});
        member.isAdmin = true;
        await member.save();
        res.status(200).json({message: "User added as admin successfully"});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: status500});
    }
};

const removeProjAdmin = async (req, res) => {
    try
    {
        const {_id} = req.JWT;
        const {userId, projId} = req.params;
        if(!userId || !projId) return res.status(400).json({message: status400});

        const Member = memberModel(_id);
        const member = await Member.findOne({userId, projId});
        if(!member) return res.status(404).json({message: "User not found"});
        if(!member.isAdmin) return res.status(400).json({message: "User is not an admin"});
        member.isAdmin = false;
        await member.save();
        res.status(200).json({message: "User removed from admin successfully"});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: status500});
    }
};

const addOrgAdmin = async (req, res) => {
    try
    {
        const {_id} = req.JWT;
        const {usrId} = req.body;
        if(!usrId) return res.status(400).json({message: status400});

        const User = userModel(_id);
        const user = await User.findById(usrId);
        if(!user) return res.status(404).json({message: "User not found"});
        if(user.isAdmin) return res.status(400).json({message: "User is already an admin"});
        user.isAdmin = true;
        await user.save();
        res.status(200).json({message: "User added as organization admin successfully"});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: status500});
    }
};

const removeOrgAdmin = async (req, res) => {
    try
    {
        const {_id} = req.JWT;
        const {usrId} = req.params;
        if(!usrId) return res.status(400).json({message: status400});

        const User = userModel(_id);
        const user = await User.findById(usrId);
        if(!user) return res.status(404).json({message: "User not found"});
        if(!user.isAdmin) return res.status(400).json({message: "User is not an admin"});
        user.isAdmin = false;
        await user.save();
        res.status(200).json({message: "User removed from organization admin successfully"});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: status500});
    }
};

module.exports = {addProjAdmin, removeProjAdmin, addOrgAdmin, removeOrgAdmin};