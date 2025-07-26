const clientModel = require("../model/ClientModel");
const memberModel = require("../model/MemberModel");
const projectModel = require("../model/ProjectModel");
const userModel = require("../model/UserModel");
const { status500 } = require("../utils/const");

const getProfile = async (req, res) => {
    try {
        const { _id, usrId, usrType } = req.JWT;
        let usrData = null;
        let projs = [];

        const Proj = projectModel(_id);

        if (usrType === "Client") {
            usrData = await clientModel.findById(_id).select('username email organizationName _id').lean();
            projs = await Proj.find({}).select('title description _id').lean();
        } else {
            const User = userModel(_id);
            const oName = await clientModel.findById(_id).select('organizationName').lean();
            usrData = await User.findById(usrId).select('username email _id isAdmin').lean();
            if (!usrData) return res.status(404).json({ message: "User not found" });
            usrData.organizationName = oName ? oName.organizationName : "N/A";
            const Members = memberModel(_id);
            const getProjs = await Members.find({ userId: usrId }).distinct('projId');
            projs = await Proj.find({ _id: { $in: getProjs } }).select('title description _id').lean();
        }

        const profile = { usrId, usrType, usrData, projs };
        res.status(200).json({ message: "Profile fetched successfully", profile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: status500 });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { _id, usrId, usrType } = req.JWT;
        const { username, email, organizationName } = req.body;

        let updatedUser;

        if (usrType === "Client") {
            updatedUser = await clientModel.findByIdAndUpdate(
                _id,
                { $set: { username, email, organizationName } },
                { new: true, runValidators: true }
            ).select('username email organizationName _id').lean();
        } else {
            const User = userModel(_id);
            updatedUser = await User.findByIdAndUpdate(
                usrId,
                { $set: { username, email } },
                { new: true, runValidators: true }
            ).select('username email _id').lean();
        }

        res.status(200).json({ message: "Profile updated successfully", usrData: updatedUser });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: status500 });
    }
};

module.exports = {
    getProfile,
    updateProfile
};
