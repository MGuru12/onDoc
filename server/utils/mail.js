const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const inviteUser = async (registerLink, email, name) => {
    console.log("Sending invitation to:", email);
    console.log("Link:", registerLink);

    const html = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>OnDoc Team Member Invitation</title>
            </head>
            <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
            <table width="100%" bgcolor="#f4f4f4" cellpadding="0" cellspacing="0">
                <tr><td>
                <table align="center" width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="margin:40px auto; border-radius:8px; overflow:hidden;">
                    <tr><td style="background-color:#1e90ff; padding:20px; text-align:center;">
                    <h1 style="color:#ffffff; margin:0; font-size:24px;">OnDoc</h1>
                    <p style="color:#ffffff; margin:5px 0 0; font-size:14px;">You're Invited to Join a Team</p>
                    </td></tr>
                    <tr><td style="padding:30px 40px;">
                    <h2 style="color:#333333; font-size:20px;">Welcome to OnDoc</h2>
                    <p style="color:#555555; font-size:16px;">You've been invited to join a team on OnDoc. Click the button below to complete your registration and get started:</p>
                    <div style="text-align:center; margin:30px 0;">
                        <a href="${registerLink}" style="background-color:#1e90ff; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:5px; font-size:16px;">Register Now</a>
                    </div>
                    <p style="color:#888888; font-size:14px;">If you didn’t expect this invitation, you can safely ignore this email.</p>
                    </td></tr>
                    <tr><td style="background-color:#f4f4f4; padding:20px; text-align:center; font-size:12px; color:#aaaaaa;">
                    &copy; 2025 OnDoc. All rights reserved.
                    </td></tr>
                </table>
                </td></tr>
            </table>
            </body>
            </html>`;

    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'OnDoc'}" <${process.env.MAIL_FROM}>`,
        to: `"${name}" <${email}>`,
        subject: "OnDoc - User Register",
        html: html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
const sendOTP = async (otp, email, name) => {
    console.log("Sending OTP to:", email);

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

    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'OnDoc'}" <${process.env.MAIL_FROM}>`,
        to: `"${name}" <${email}>`,
        subject: "OTP from OnDoc",
        html: html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("OTP Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw error;
    }
};

module.exports = { inviteUser, sendOTP };