const { default: axios } = require("axios");

const inviteUser = async (registerLink, email, name) => {
    console.log(registerLink);
    
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

        const payload = {
        from: { email: "OnDoc_Dont_Reply@demomailtrap.co", name: "OnDoc - Don't Reply" },
        to: [{ email, name }],
        subject: "OnDoc - User Register",
        html
        };

        return await axios.post(process.env.MAIL_API, payload, {
              headers: {
                "Content-Type": "application/json",
                "Api-Token": 'ce0f2b6b7bdd6580c971fea3f9bdcecc'
              }
            });
};

module.exports = {inviteUser};