const clientModel = require("../model/ClientModel");

const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const { status400, status401, status500 } = require("../utils/const");
const userModel = require("../model/UserModel");

const RefreshTokenModel = require("../model/RefreshToken");

const JWT_access_SECRET = process.env.JWT_ACCESS_SECRET || 'your_access_secret';
const JWT_refresh_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret';
const accessExpiresIn = "6h";
const refreshExpiresIn = "30d";

const otpStore = {}; // In-memory OTP storage

const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod",
    sameSite: (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod") ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/"
});

const Register = async(req, res) => {
    try
    {
        const {uName, email, pwd, oName} = req.body;
        if(!uName || !email || !pwd || !oName) return res.status(400).json({message: status400});

        if(await clientModel.exists({email})) return res.status(409).json({message: `Client email ${email} already exists`});
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(pwd, salt);
        await clientModel.create({username: uName, email, password: hashedPassword, organizationName: oName, plan: {currentPlan: "free", createdAt: Date.now(), updatedAt: Date.now(), activeUntil: Date.now() + 30 * 24 * 60 * 60 * 1000, nextPlan: null}});
        res.status(201).json({message: "Client created successfully"});
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
}
 
const Login = async(req, res) => {
    try
    {
        const {email, pwd, oName} = req.body;
        if(!email || !pwd || !oName) return res.status(400).json({message: status400})

        let clientData = await clientModel.findOne({organizationName: oName});
        if(!clientData) return res.status(404).json({message: `Client organization ${oName} not found`});
        let usrType = "Client";
        const _id = clientData._id;
        const plan = clientData.plan;
        if(clientData && clientData.email !== email)
            {
                const User = userModel(clientData._id);
                clientData = await User.findOne({email});
                usrType = "Member";
            }

        if(!clientData) return res.status(404).json({message: `Client email ${email} not found`});
        if(!(await bcrypt.compare(pwd, clientData.password))) return res.status(401).json({message: status401});

        const tokenData = {_id, usrId: clientData._id, usrType, plan};
        const accessToken = jwt.sign(tokenData, JWT_access_SECRET, {expiresIn: accessExpiresIn});
        const refreshToken = jwt.sign(tokenData, JWT_refresh_SECRET, {expiresIn: refreshExpiresIn});
        
        // Store refresh token in database
        await RefreshTokenModel.create({
            userId: clientData._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        const data = {_i: clientData._id, n: clientData.username, e: clientData.email, p: plan};

        res.cookie('refreshToken', refreshToken, getCookieOptions());


        res.setHeader('x-access-token', accessToken).json({message: "Login successfull", data, usrType});
    }
    catch(err)
    {
        console.error("Login Error:", err.message);
        res.status(500).json({
            message: "Internal Server Error",
            debug: err.message
        });
    }
}

const verifyAccessToken = async(req, res, next) => {
    try
    {
        const accessToken = req.headers["x-access-token"];
        
        const decodedData = jwt.verify(accessToken, JWT_access_SECRET);
        
        req.JWT = {_id: decodedData._id, usrId: decodedData.usrId, usrType: decodedData.usrType};
        next();
    }
    catch(err)
    {
        console.error(err);
        
        if(err.name==="TokenExpiredError" || err.name==="JsonWebTokenError" || err.name==="NotBeforeError") return res.status(498).json({message: "Invalid or expired accesstoken"});
        console.error(err);
        res.status(500).json({message: status500});
    }
};

const refreshAccessToken = async(req, res) => {
    try
    {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.status(404).json({message: "Refresh token not found"});

        // Verify token exists in database
        const storedToken = await RefreshTokenModel.findOne({ token: refreshToken });
        if (!storedToken) return res.status(401).json({ message: "Invalid refresh token" });

        const decodedData = jwt.verify(refreshToken, JWT_refresh_SECRET);
        const accessToken = jwt.sign({_id: decodedData._id, usrId: decodedData.usrId, usrType: decodedData.usrType, plan: decodedData.plan}, JWT_access_SECRET, {expiresIn: accessExpiresIn});

        res.setHeader('x-access-token', accessToken).json({message: "New access token created successfully"});
    }
    catch(err)
    {
        if(err.name==="TokenExpiredError" || err.name==="JsonWebTokenError" || err.name==="NotBeforeError") return res.status(401).json({message: status401});
        console.error(err);
        res.status(500).json({message: status500});
    }
};

const Logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        // Remove from database
        await RefreshTokenModel.deleteOne({ token: refreshToken });
    }

    // Clear the cookie storing the refresh token
    res.clearCookie('refreshToken', getCookieOptions());

    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: status500 });
  }
};

const { inviteUser, sendOTP } = require("../utils/mail");

const verifyMail = async (req, res) => {
  const { email, name } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Store OTP in-memory with 10 minute expiry
    otpStore[email] = {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000
    };

    await sendOTP(otp, email, name);
    res.status(200).json({ message: "OTP sent successfully" }); // No OTP in response
  } catch (error) {
    console.error("verifyMail error:", error.message);
    res.status(500).json({ 
      message: "Failed to send OTP", 
      debug: error.message 
    });
  }
};

const validateOTP = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const storedData = otpStore[email];

    if (!storedData) return res.status(400).json({ message: "OTP not found. Please resend." });

    if (Date.now() > storedData.expiresAt) {
        delete otpStore[email];
        return res.status(400).json({ message: "OTP expired. Please resend." });
    }

    if (storedData.otp === otp) {
        delete otpStore[email]; // Clear OTP after successful verification
        return res.status(200).json({ message: "Email verified successfully" });
    } else {
        return res.status(400).json({ message: "Invalid OTP" });
    }
};

const cleanupAll = async (req, res) => {
    try {
        console.log("Starting daily cleanup...");
        
        // 1. Cleanup In-Memory OTPs
        const now = Date.now();
        let otpCount = 0;
        for (const email in otpStore) {
            if (now > otpStore[email].expiresAt) {
                delete otpStore[email];
                otpCount++;
            }
        }

        // 2. Cleanup Expired Refresh Tokens (Handled by Mongo TTL index, but manual fallback)
        const result = await RefreshTokenModel.deleteMany({ expiresAt: { $lt: new Date() } });

        console.log(`Cleanup complete. Removed ${otpCount} OTPs and ${result.deletedCount} refresh tokens.`);
        res.status(200).json({ 
            message: "Cleanup successful", 
            removedOTPs: otpCount, 
            removedTokens: result.deletedCount 
        });
    } catch (err) {
        console.error("Cleanup error:", err);
        res.status(500).json({ message: "Cleanup failed" });
    }
};

const verifyInvite = async(req, res) => {
  try
  {
    const { _id, inviteToken } = req.params;
    const {pwd} = req.body;
    if(!_id || !inviteToken ) return res.status(400).json({message: status400});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pwd, salt);
    
    const User = userModel(_id);
    const existingUser = await User.findOne({inviteToken});
    if(!existingUser) return res.status(404).json({message: "Invite token not found or already used"});
    existingUser.password = hashedPassword;
    existingUser.inviteToken = null; // Clear the invite token after verification
    await existingUser.save();
    res.status(200).json({message: "Invite verified successfully", _id});
  }
  catch(err)
  {
    console.error(err);
    res.status(500).json({message: status500});
  }
};


module.exports = {Register, Login, verifyAccessToken, refreshAccessToken, Logout, verifyMail, validateOTP, cleanupAll, verifyInvite};