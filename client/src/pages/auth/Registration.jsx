import { useState } from "react";
import api from "../../utils/Axios";
import { useNavigate, Link } from "react-router-dom";
import { sendOtp } from "../../utils/Services";

const Registration = () => {
  const [uName, setUName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPWD] = useState('');
  const [cPWD, setCPWD] = useState('');
  const [oName, setOName] = useState('');

  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSentTime, setOtpSentTime] = useState(null);
  const [otpVerified, setOtpVerified] = useState(false);

  const navigate = useNavigate();

  const verifyMail = async () => {
    if (!email || !uName) {
      alert("Please enter your username and email before verifying.");
      return;
    }

    try {
      // await sendOtp(otpCode, email, uName);
      const response = await api.post('/auth/verifyMail',{email, name: uName});
      const otpCode = response.data.otp;
      alert("OTP sent to your email. Valid for 10 minutes.");
      setGeneratedOtp(otpCode);
      setOtpSentTime(Date.now());
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP.");
    }
  };

  const validateOtp = () => {
    const now = Date.now();
    if (!generatedOtp || !otpSentTime || now - otpSentTime > 10 * 60 * 1000) {
      alert("OTP expired. Please resend.");
      return;
    }

    if (otp === generatedOtp) {
      setOtpVerified(true);
      alert("Email verified successfully!");
    } else {
      alert("Invalid OTP.");
    }
  };

  const register = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      alert("Please verify your email before registering.");
      return;
    }

    if (pwd !== cPWD) {
      alert("Passwords do not match.");
      return;
    }

    if (pwd.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      await api.post('/auth/Register', { uName, email, pwd, oName });
      alert("Registered successfully!");
      navigate('/auth/login');
    } catch (err) {
      if (err.response?.status && err.response.status !== 500) {
        alert(err.response.data.message);
      } else {
        console.error(err);
        alert("Something went wrong");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-purple-100 to-yellow-50 font-[Quicksand] p-4">
      <form
        onSubmit={register}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-[6px_6px_12px_#ccc,-6px_-6px_12px_#fff] p-8 space-y-6 transition-transform duration-300 hover:scale-[1.01]"
      >
        <h2 className="text-3xl font-bold text-center text-violet-900 mb-4">📝 Register on OnDoc</h2>

        {/* Username */}
        <div>
          <label className="block text-violet-800 font-medium mb-1">Username</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-violet-300 rounded-xl bg-violet-50 text-violet-900 placeholder-violet-400"
            placeholder="Username"
            value={uName}
            onChange={(e) => setUName(e.target.value)}
            required
          />
        </div>

        {/* Email + OTP */}
        <div>
          <label className="block text-violet-800 font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-violet-300 rounded-xl bg-violet-50 text-violet-900 placeholder-violet-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={verifyMail}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Send OTP
            </button>
            {otpSentTime && !otpVerified && (
              <span className="text-sm text-gray-600">OTP sent, valid for 10 min</span>
            )}
          </div>

          {generatedOtp && !otpVerified && (
            <div className="mt-3">
              <input
                type="text"
                className="w-full px-4 py-2 border border-violet-300 rounded-xl bg-violet-50 text-violet-900 placeholder-violet-400"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                type="button"
                onClick={validateOtp}
                className="mt-2 w-full bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Verify OTP
              </button>
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-violet-800 font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-violet-300 rounded-xl bg-violet-50 text-violet-900 placeholder-violet-400"
            placeholder="Password"
            value={pwd}
            onChange={(e) => setPWD(e.target.value)}
            required
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-violet-800 font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-violet-300 rounded-xl bg-violet-50 text-violet-900 placeholder-violet-400"
            placeholder="Confirm Password"
            value={cPWD}
            onChange={(e) => setCPWD(e.target.value)}
            required
          />
        </div>

        {/* Organization Name */}
        <div>
          <label className="block text-violet-800 font-medium mb-1">Organization Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-violet-300 rounded-xl bg-violet-50 text-violet-900 placeholder-violet-400"
            placeholder="Organization"
            value={oName}
            onChange={(e) => setOName(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <input
            type="submit"
            value="Register"
            className="w-full bg-violet-400 hover:bg-violet-500 text-white font-semibold py-2 rounded-xl transition-colors cursor-pointer"
          />
        </div>

        {/* Redirect to login */}
        <div className="text-center text-sm text-violet-700 mt-4">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-violet-900 font-semibold underline hover:text-violet-600">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Registration;
