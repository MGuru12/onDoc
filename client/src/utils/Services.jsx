import axios from "axios";
import api from "./Axios";
import { useUser } from "./Providers";

export const RefreshAccessToken = async() => {
    try
    {
        const {setAccessToken} = useUser();

        const response = await api.post('/auth/Refresh');  
        const firstRecord = await db.tn.toCollection().first();

        if (firstRecord) {
            await db.tn.update(firstRecord.at, { at: response.headers['x-access-token'] });
            setAccessToken(response.headers['x-access-token']);
            return true;
        }
        return null;
    }
    catch(err)
    {
        console.error(err);
        return false;
    }
};

export const sendOtp = async (otp, toAddress, name) => {
  try {
    console.log("Preparing to send OTP...");

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

    const body = {
      from: {
        email: "OnDoc_Dont_Reply@demomailtrap.co",
        name: "OnDoc - Don't Reply"
      },
      to: [
        {
          email: toAddress,
          name: name
        }
      ],
      subject: "OTP from OnDoc",
      html
    };

    await axios.post("https://send.api.mailtrap.io/api/send", body, {
      headers: {
        "Content-Type": "application/json",
        "Api-Token": "ce0f2b6b7bdd6580c971fea3f9bdcecc"
      }
    });

    console.log("OTP email sent successfully!");
  } catch (err) {
    console.error("Failed to send OTP:", err.response?.data || err.message);
  }
};