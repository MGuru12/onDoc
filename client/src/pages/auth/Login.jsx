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

      await Promise.all([
        db.ur.clear(),
        db.tn.clear(),
      ]);
      await db.ur.add(response.data.data);
      await db.tn.add({ at: accessToken, ut: response.data.usrType });

      setUsrId(response.data.data._i);
      setUsrName(response.data.data.n);
      setUsrEmail(response.data.data.e);
      setAccessToken(response.data.data.at);
      setUsrType(response.data.usrType);

      console.log("Login Successful");
      navigate('/project/list');
    } catch (err) {
      console.error("Login Failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-purple-100 to-yellow-50 font-[Quicksand] p-4">
      <form
        onSubmit={login}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-[6px_6px_12px_#ccc,-6px_-6px_12px_#fff] p-8 space-y-6 transition-transform duration-300 hover:scale-[1.01]"
      >
        <h2 className="text-3xl font-bold text-center text-violet-900 mb-4">🔐 Login to OnDoc</h2>

        <div>
          <label className="block text-violet-800 font-medium mb-1">Organization Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-violet-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 bg-violet-50 text-violet-900 placeholder-violet-400"
            placeholder="Organization"
            value={oName}
            onChange={(e) => setOName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-violet-800 font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-violet-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 bg-violet-50 text-violet-900 placeholder-violet-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-violet-800 font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-violet-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 bg-violet-50 text-violet-900 placeholder-violet-400"
            placeholder="Password"
            value={pwd}
            onChange={(e) => setPWD(e.target.value)}
            required
          />
        </div>

        <div className="pt-2">
          <input
            type="submit"
            value="Login"
            className="w-full bg-violet-400 hover:bg-violet-500 text-white font-semibold py-2 rounded-xl transition-colors cursor-pointer"
          />
        </div>
        <div className="text-center text-sm text-violet-700 mt-4">
          Don't have an account?{" "}
          <Link to="/auth/registration" className="text-violet-900 font-semibold underline hover:text-violet-600">
            Register
          </Link>
        </div>

      </form>
    </div>
  );
};

export default Login;
