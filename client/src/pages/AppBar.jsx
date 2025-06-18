import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../utils/Providers';
import { useNavigate } from 'react-router-dom';
import api from '../utils/Axios';
import db from '../db/Dexiedb';

const AppBar = () => {
  const { accessToken, UsrName, setAccessToken, setUsrName, setUsrEmail, setUsrId, setUsrType } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
  try {
    await api.post('/auth/logout'); // Server clears cookie

    // Clear IndexedDB
    await Promise.all([
      db.ur.clear(),
      db.tn.clear()
    ]);

    // Clear React Context
    setAccessToken('');
    setUsrName('');
    setUsrEmail('');
    setUsrId('');
    setUsrType('');

    navigate('/auth/login');
  } catch (err) {
    console.error("Logout failed:", err);
  }
};


  const initials = UsrName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="relative top-0 left-0 right-0 flex justify-between items-center px-6 py-4 bg-violet-100 shadow-md font-[Quicksand] z-50 h-16">
      <h1 className="text-2xl font-bold text-violet-900 cursor-pointer" onClick={() => navigate('/')}>
        📚 OnDoc
      </h1>

      {!accessToken ? (
        <button
          onClick={() => navigate('/auth/login')}
          className="bg-violet-500 text-white px-4 py-2 rounded-lg shadow hover:bg-violet-600 transition"
        >
          Login
        </button>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-full bg-violet-400 text-white flex items-center justify-center font-bold text-lg cursor-pointer hover:bg-violet-500 transition"
            title={UsrName}
          >
            {initials || 'U'}
          </div>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 text-sm text-gray-700">
              <button
                onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                className="w-full text-left px-4 py-2 hover:bg-violet-100"
              >
                Profile
              </button>
              <button
                onClick={() => { setMenuOpen(false); navigate('/billing'); }}
                className="w-full text-left px-4 py-2 hover:bg-violet-100"
              >
                Billing
              </button>
              <hr className="my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default AppBar;
