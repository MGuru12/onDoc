import React, { useState } from 'react';
import api from '../../utils/Axios';
import { useUser } from '../../utils/Providers';
import db from '../../db/Dexiedb';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [pwd, setPWD] = useState('');
  const [oName, setOName] = useState('');

  const { setUsrId, setUsrName, setUsrEmail, setAccessToken, setUsrType } = useUser();
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/auth/login', { email, pwd, oName });
      const accessToken = response.headers['x-access-token'];

      await Promise.all([db.ur.clear(), db.tn.clear()]);
      await db.ur.add(response.data.data);
      await db.tn.add({ at: accessToken, ut: response.data.usrType });

      setUsrId(response.data.data._i);
      setUsrName(response.data.data.n);
      setUsrEmail(response.data.data.e);
      setAccessToken(accessToken);
      setUsrType(response.data.usrType);

      console.log("Login Successful");
      navigate('/project/list');
    } catch (err) {
      console.error("Login Failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Main Card with Inner Gradient */}
      <form
        onSubmit={login}
        className="w-full max-w-md rounded-3xl p-8 space-y-6 relative overflow-hidden"
        style={{
          // Soft outer shadow for neumorphism
          boxShadow: '12px 12px 24px #e0e7ff, -12px -12px 24px #ffffff',
          // Subtle inner gradient: violet → soft purple
          background: 'linear-gradient(135deg, #f5f3ff, #faf5ff)',
        }}
      >
        {/* Optional: Very subtle pattern overlay for depth */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B5CF6' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Content Layer */}
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
              🔐
            </div>
            <h2
              className="text-3xl font-bold text-violet-900"
              style={{ fontFamily: 'Kaushan Script, cursive' }}
            >
              Welcome Back
            </h2>
            <p className="text-sm text-violet-700 mt-1">Sign in to continue to OnDoc</p>
          </div>

          {/* Organization Field */}
          <div>
            <label className="block text-violet-800 font-medium mb-1.5">Organization Name</label>
            <input
              type="text"
              value={oName}
              onChange={(e) => setOName(e.target.value)}
              placeholder="Your organization"
              required
              className="w-full px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none transition-all duration-300"
              style={{
                boxShadow: '6px 6px 12px #f0f4ff, -6px -6px 12px #ffffff',
              }}
            />
          </div>

          {/* Email Field */}
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
          </div>

          {/* Password Field */}
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

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full py-3 font-semibold rounded-2xl text-violet-700 transition-all duration-300 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #ede9fe, #f3e8ff)',
                boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
              }}
            >
              Login
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center text-sm text-violet-700 mt-4">
            Don't have an account?{' '}
            <Link
              to="/auth/registration"
              className="font-semibold text-violet-900 underline hover:text-violet-600 transition-colors"
            >
              Register here
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;