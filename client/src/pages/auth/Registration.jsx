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
      const response = await api.post('/auth/verifyMail', { email, name: uName });
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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Main Card with Soft Gradient Background */}
      <form
        onSubmit={register}
        className="w-full max-w-md rounded-3xl p-8 space-y-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f7f5ff, #fdf9ff)',
          boxShadow: '12px 12px 24px #e0e7ff, -12px -12px 24px #ffffff',
        }}
      >
        {/* Optional: Subtle dot texture overlay */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Ccircle cx='30' cy='30' r='1' fill='%238B5CF6' fill-opacity='0.1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full text-violet-700"
              style={{
                background: 'linear-gradient(135deg, #ede9fe, #f3e8ff)',
                boxShadow: 'inset 4px 4px 8px #f9f7ff, inset -4px -4px 8px #ffffff',
              }}
            >
              📝
            </div>
            <h2
              className="text-3xl font-bold text-violet-900"
              style={{ fontFamily: 'Kaushan Script, cursive' }}
            >
              Create Account
            </h2>
            <p className="text-sm text-violet-700 mt-1">Join OnDoc today</p>
          </div>

          {/* Username */}
          <div>
            <label className="block text-violet-800 font-medium mb-1.5">Username</label>
            <input
              type="text"
              value={uName}
              onChange={(e) => setUName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none transition-all duration-300"
              style={{
                boxShadow: '6px 6px 12px #f0f4ff, -6px -6px 12px #ffffff',
              }}
            />
          </div>

          {/* Email + OTP Section */}
          <div>
            <label className="block text-violet-800 font-medium mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none transition-all duration-300"
              style={{
                boxShadow: '6px 6px 12px #f0f4ff, -6px -6px 12px #ffffff',
              }}
            />

            <div className="flex gap-3 mt-3">
              <button
                type="button"
                onClick={verifyMail}
                className="flex-1 py-2 bg-violet-100 text-violet-700 font-medium rounded-xl transition-all duration-300 active:scale-[0.98]"
                style={{
                  boxShadow: '4px 4px 8px #e0e7ff, -4px -4px 8px #ffffff',
                }}
              >
                Send OTP
              </button>
              {otpSentTime && !otpVerified && (
                <span className="text-xs text-violet-600 self-center">Valid 10 min</span>
              )}
            </div>

            {generatedOtp && !otpVerified && (
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none"
                  style={{
                    boxShadow: '6px 6px 12px #f0f4ff, -6px -6px 12px #ffffff',
                  }}
                />
                <button
                  type="button"
                  onClick={validateOtp}
                  className="w-full py-2 bg-green-50 text-green-700 font-medium rounded-xl transition-all duration-300 hover:shadow-md active:scale-[0.98]"
                  style={{
                    boxShadow: '4px 4px 8px #d1fae5, -4px -4px 8px #ffffff',
                  }}
                >
                  Verify OTP
                </button>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-violet-800 font-medium mb-1.5">Password</label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPWD(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none transition-all duration-300"
              style={{
                boxShadow: '6px 6px 12px #f0f4ff, -6px -6px 12px #ffffff',
              }}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-violet-800 font-medium mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={cPWD}
              onChange={(e) => setCPWD(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none transition-all duration-300"
              style={{
                boxShadow: '6px 6px 12px #f0f4ff, -6px -6px 12px #ffffff',
              }}
            />
          </div>

          {/* Organization Name */}
          <div>
            <label className="block text-violet-800 font-medium mb-1.5">Organization Name</label>
            <input
              type="text"
              value={oName}
              onChange={(e) => setOName(e.target.value)}
              placeholder="Your team or company"
              required
              className="w-full px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none transition-all duration-300"
              style={{
                boxShadow: '6px 6px 12px #f0f4ff, -6px -6px 12px #ffffff',
              }}
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={!otpVerified}
              className={`w-full py-3 font-semibold rounded-2xl text-violet-700 transition-all duration-300 active:scale-[0.98] ${
                otpVerified
                  ? 'hover:shadow-lg'
                  : 'opacity-60 cursor-not-allowed'
              }`}
              style={{
                background: 'linear-gradient(135deg, #ede9fe, #f3e8ff)',
                boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
              }}
            >
              Register
            </button>
          </div>

          {/* Login Redirect */}
          <div className="text-center text-sm text-violet-700 mt-4">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="font-semibold text-violet-900 underline hover:text-violet-600 transition-colors"
            >
              Login here
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Registration;