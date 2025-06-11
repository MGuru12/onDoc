const clientModel = require("../model/ClientModel");

const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { status400, status401, status500 } = require("../utils/const");
const userModel = require("../model/UserModel");

const JWT_access_SECRET = 'your_secret_key';
const JWT_refresh_SECRET = 'your_secret_key';
const accessExpiresIn = "6h";
const refreshExpiresIn = "30d";

const Register = async(req, res) => {
    try
    {
        const {uName, email, pwd, oName} = req.body;
        if(!uName || !email || !pwd || !oName) return res.status(400).json({message: status400});

        if(await clientModel.exists({email})) return res.status(409).json({message: `Client email ${email} already exists`});
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(pwd, salt);
        await clientModel.create({username: uName, email, password: hashedPassword, organizationName: oName});
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
        let usrType = "Client";
        const _id = clientData._id;

        if(clientData && clientData.email !== email)
            {
                const User = userModel(clientData._id);
                clientData = await User.findOne({email});
                usrType = "Member";
            }

        if(!clientData) return res.status(404).json({message: `Client email ${email} not found`});
        if(!(await bcrypt.compare(pwd, clientData.password))) return res.status(401).json({message: status401});

        const accessToken = jwt.sign({_id}, JWT_access_SECRET, {expiresIn: accessExpiresIn});
        const refreshToken = jwt.sign({_id}, JWT_refresh_SECRET, {expiresIn: refreshExpiresIn});

        const data = {_i: clientData._id, n: clientData.username, e: clientData.email};

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,           // explicitly false for local HTTP
            sameSite: 'lax',         // prevents most CSRF, but works fine with localhost
            maxAge: 30 * 24 * 60 * 60 * 1000
        });


        res.setHeader('x-access-token', accessToken).json({message: "Login successfull", data, usrType});
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message: status500});
    }
}

const verifyAccessToken = async(req, res, next) => {
    try
    {
        const accessToken = req.headers["x-access-token"];
        
        const decodedData = jwt.verify(accessToken, JWT_access_SECRET);
        
        req.JWT = {_id: decodedData._id};
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
        const decodedData = jwt.verify(refreshToken, JWT_refresh_SECRET);
        const accessToken = jwt.sign({_id: decodedData._id}, JWT_access_SECRET, {expiresIn: accessExpiresIn});

        res.setHeader('x-access-token', accessToken).json({message: "New access token created successfully"});
    }
    catch(err)
    {
        if(err.name==="TokenExpiredError" || err.name==="JsonWebTokenError" || err.name==="NotBeforeError") return res.status(401).json({message: status401});
        console.error(err);
        res.status(500).json({message: status500});
    }
};

module.exports = {Register, Login, verifyAccessToken, refreshAccessToken};