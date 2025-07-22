import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../utils/Providers';
import { useNavigate } from 'react-router-dom';
import api from '../utils/Axios';
import db from '../db/Dexiedb';
import logo from '../assets/logo.png'; // Adjust path if needed

const AppBar = () => {
  const {
    accessToken,
    UsrName,
    setAccessToken,
    setUsrName,
    setUsrEmail,
    setUsrId,
    setUsrType,
  } = useUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
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
      await api.post('/auth/logout');
      await Promise.all([db.ur.clear(), db.tn.clear()]);
      setAccessToken('');
      setUsrName('');
      setUsrEmail('');
      setUsrId('');
      setUsrType('');
      navigate('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const initials = UsrName?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-3 bg-violet-50"
      style={{
        fontFamily: 'Quicksand, sans-serif',
        boxShadow: 'inset 4px 4px 10px #e0e7ff, inset -4px -4px 10px #ffffff',
        borderRadius: '0 0 1rem 1rem',
        height: '64px',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      {/* Logo */}
      <div
        className="cursor-pointer flex items-center select-none"
        onClick={() => navigate('/')}
      >
        <img
          src={logo}
          alt="OnDoc Logo"
          className="h-40 w-auto object-contain drop-shadow-sm"
        />
      </div>

      {/* Right Side: Login or User Avatar */}
      {!accessToken ? (
        <button
          onClick={() => navigate('/auth/login')}
          className="text-violet-700 bg-violet-100 border border-violet-200 px-5 py-2 rounded-full font-medium shadow-md hover:shadow-lg active:shadow-inner transition-all duration-200 transform hover:scale-105 focus:outline-none"
          style={{
            boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
          }}
        >
          Login
        </button>
      ) : (
        <div className="relative" ref={dropdownRef}>
          {/* User Avatar Button */}
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full cursor-pointer select-none flex items-center justify-center font-bold text-white shadow-md hover:shadow-lg active:shadow-inner transform hover:scale-105 transition-all duration-200"
            style={{
              backgroundImage: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
              boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
            }}
            title={UsrName}
          >
            {initials || 'U'}
          </div>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div
              className="absolute right-0 mt-3 w-48 rounded-xl overflow-hidden bg-violet-50"
              style={{
                boxShadow: '8px 8px 16px #e0e7ff, -8px -8px 16px #ffffff',
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-5 py-3 text-gray-700 hover:bg-violet-100 transition-colors duration-200 text-sm font-medium"
                style={{
                  boxShadow: 'inset 2px 2px 6px #f3f4f6, inset -2px -2px 6px #ffffff',
                }}
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/billing');
                }}
                className="w-full text-left px-5 py-3 text-gray-700 hover:bg-violet-100 transition-colors duration-200 text-sm font-medium"
                style={{
                  boxShadow: 'inset 2px 2px 6px #f3f4f6, inset -2px -2px 6px #ffffff',
                }}
              >
                Billing
              </button>
              <hr
                className="border-t border-violet-200 my-1"
                style={{
                  boxShadow: 'inset 0 1px 0 #ffffff, inset 0 -1px 0 #e0e7ff',
                }}
              />
              <button
                onClick={handleLogout}
                className="w-full text-left px-5 py-3 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 text-sm font-medium"
                style={{
                  boxShadow: 'inset 2px 2px 6px #f3f4f6, inset -2px -2px 6px #ffffff',
                }}
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