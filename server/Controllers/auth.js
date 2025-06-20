const clientModel = require("../model/ClientModel");

const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const axios = require("axios");
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

const Logout = async (req, res) => {
  try {
    // Clear the cookie storing the refresh token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax'
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: status500 });
  }
};

const verifyMail = async (req, res) => {
  const { email, name } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const html = `
    <!DOCTYPE html>
      <html><head><meta charset="UTF-8"><title>OnDoc OTP Verification</title></head>
      <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
        <table width="100%" bgcolor="#f4f4f4" cellpadding="0" cellspacing="0">
          <tr><td>
            <table align="center" width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="margin:40px auto; border-radius:8px; overflow:hidden;">
              <tr><td style="background-color:#1e90ff; padding:20px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">OnDoc</h1>
                <p style="color:#ffffff; margin:5px 0 0; font-size:14px;">Your Knowledgebase Companion</p>
              </td></tr>
              <tr><td style="padding:30px 40px;">
                <h2 style="color:#333333; font-size:20px;">Your OTP Code</h2>
                <p style="color:#555555; font-size:16px;">Use the following One-Time Password (OTP) to complete your login or verification:</p>
                <div style="background-color:#f0f8ff; border:1px dashed #1e90ff; border-radius:6px; padding:20px; text-align:center; margin:20px 0;">
                  <span style="font-size:28px; color:#1e90ff; letter-spacing:4px; font-weight:bold;">${otp}</span>
                </div>
                <p style="color:#888888; font-size:14px;">This code is valid for 10 minutes. Do not share it with anyone.</p>
                <p style="color:#555555; font-size:14px;">If you didn’t request this, please ignore this email.</p>
              </td></tr>
              <tr><td style="background-color:#f4f4f4; padding:20px; text-align:center; font-size:12px; color:#aaaaaa;">
                &copy; 2025 OnDoc. All rights reserved.
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>`;

  const payload = {
    from: { email: "OnDoc_Dont_Reply@demomailtrap.co", name: "OnDoc - Don't Reply" },
    to: [{ email, name }],
    subject: "OTP from OnDoc",
    html
  };

  try {
    await axios.post(process.env.MAIL_API, payload, {
      headers: {
        "Content-Type": "application/json",
        "Api-Token": 'ce0f2b6b7bdd6580c971fea3f9bdcecc'
      }
    });

    res.status(200).json({ message: "OTP sent", otp });
  } catch (error) {
    console.error("Mailtrap send error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};


module.exports = {Register, Login, verifyAccessToken, refreshAccessToken, Logout, verifyMail};