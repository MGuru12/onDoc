import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/Axios';

const VerifyInvite = () => {
  const { _id, inviteToken } = useParams();
  const navigate = useNavigate();

  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pwd !== confirmPwd) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await api.post(`/auth/verifyInvite/${_id}/${inviteToken}`, { pwd });

      console.log('Password set successfully');
      navigate('/auth/login'); // or to project/dashboard
    } catch (err) {
        console.error('Failed to set password:', err);
        if(err.response.data.message) setError(err.response.data.message);
        else setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-purple-100 to-yellow-50 font-[Quicksand] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-[6px_6px_12px_#ccc,-6px_-6px_12px_#fff] p-8 space-y-6 transition-transform duration-300 hover:scale-[1.01]"
      >
        <h2 className="text-3xl font-bold text-center text-violet-900 mb-4">🔑 Set Your Password</h2>

        {error && (
          <div className="text-red-600 text-sm text-center font-medium bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-violet-800 font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-violet-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 bg-violet-50 text-violet-900 placeholder-violet-400"
            placeholder="Enter new password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-violet-800 font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-violet-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 bg-violet-50 text-violet-900 placeholder-violet-400"
            placeholder="Confirm new password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            required
          />
        </div>

        <div className="pt-2">
          <input
            type="submit"
            value="Set Password"
            className="w-full bg-violet-400 hover:bg-violet-500 text-white font-semibold py-2 rounded-xl transition-colors cursor-pointer"
          />
        </div>
      </form>
    </div>
  );
};

export default VerifyInvite;
