// Pasted_Text_1753286203948.txt (Modified Sections)

import React, { useEffect, useState } from 'react';
import { useUser } from '../../utils/Providers';
import api from '../../utils/Axios';
import { useNavigate } from 'react-router-dom';

const UsrProfile = () => {
   const navigate = useNavigate();
  const { accessToken } = useUser();
  const headers = { headers: { 'x-access-token': accessToken } };
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    organizationName: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'projects', 'users'
  const [users, setUsers] = useState([]);
  // State for mobile menu
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false); // Added for responsive sidebar

  const getUsers = async () => {
    try {
      const response = await api.get(`/member/all`, headers);
      setUsers(response.data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const verifyUser = async (userId) => {
    try {
      const response = await api.get(`/member/verify/user/${userId}`, headers);
      alert(response.data.message);
    } catch (err) {
      console.error("Error verifying user:", err);
      alert(err?.response?.data?.message || 'Failed to verify user.');
    }
  };

  // Fetch profile on mount
  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await api.get('/profile', headers);
        const data = response.data.profile;
        setProfile(data);
        setFormData({
          username: data.usrData.username || '',
          email: data.usrData.email || '',
          organizationName: data.usrData.organizationName || ''
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    getUsers();
    getProfile();
  }, []);

  const handleAddAdmin = async (usrId) => {
    try {
      await api.post(`/admin/addOrgAdmin`, { usrId }, headers);
      alert('User made admin successfully!');
  
      // Update local state: set isAdminProj = true for the user
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === usrId ? { ...user, isAdmin: true } : user
        )
      );
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to make user admin.');
    }
  };
  
  const handleRemoveAdmin = async (usrId) => {
    try {
      await api.delete(`/admin/removeOrgAdmin/${usrId}`, headers);
      alert('User removed from admin successfully!');
  
      // Update local state: set isAdminProj = false for the user
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === usrId ? { ...user, isAdmin: false } : user
        )
      );
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to remove user from admin.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    try {
      const response = await api.put('/profile/update', formData, headers);
      setStatusMsg('Profile updated successfully!');
      setIsEditing(false);
      setProfile((prev) => ({
        ...prev,
        usrData: response.data.usrData
      }));
      setFormData({
        username: response.data.usrData.username || '',
        email: response.data.usrData.email || '',
        organizationName: response.data.usrData.organizationName || ''
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      setStatusMsg('Failed to update profile.');
    }
  };

  const handleRemoveFromOrg = async (userId) => {
    try {
      await api.delete(`/member/remove/${userId}`, headers);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      alert('User removed from organization successfully!');
    } catch (err) {
      console.error("Error removing user from organization:", err);
      alert(err?.response?.data?.message || 'Failed to remove user from organization.');
    }
  };

  if (!profile) return <div className="flex justify-center items-center h-screen"><div className="text-violet-900">Loading profile...</div></div>;

  const { usrType, usrData, projs } = profile;

  // Define sidebar items
  const sidebarItems = [
    { key: 'profile', title: '👤 Profile' },
    { key: 'projects', title: '📂 Projects' },
    { key: 'users', title: '👥 Users' },
  ];

  // Updated Users Section with consistent styling
  const UsersSection = () => (
    <div // Added wrapper div for consistent styling
      className="max-w-4xl mx-auto p-8 bg-violet-50 rounded-3xl"
      style={{
        boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
      }}
    >
      <h2 className="text-2xl font-bold text-violet-900 mb-4">👥 Manage Users</h2>
      <p className="text-violet-700 mb-4">Admin-only section to manage users.</p>
      {/* Added basic table styling */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-2xl overflow-hidden"
         style={{
            boxShadow: '3px 3px 6px #e0e7ff, -3px -3px 6px #ffffff',
          }}>
          <thead className="bg-violet-100 w-auto">
            <tr>
              <th className="text-left py-3 px-4 text-violet-800 font-semibold">Name</th>
              <th className="text-left py-3 px-4 text-violet-800 font-semibold">Email</th>
              <th className="text-left py-3 px-4 text-violet-800 font-semibold">Admin</th>
              {usrType === 'Client' && (<th className="text-left py-3 px-4 text-violet-800 font-semibold">Actions</th>)}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-violet-200 hover:bg-violet-50">
                <td className="py-3 px-4 text-violet-800">{user.username}</td>
                <td className="py-3 px-4 text-violet-600">{user.email}</td>
                <td className="py-3 px-4 text-violet-600">
                  {usrType=== 'Client' ? (<>{user.isAdmin ? 
                  (<><button
                    onClick={() => handleRemoveAdmin(user._id)}
                    className="px-6 py-3 bg-red-100 text-red-700 font-medium rounded-2xl transition-all active:scale-[0.98]"
                    style={{
                      boxShadow: '4px 4px 8px #e0e7ff, -4px -4px 8px #ffffff',
                    }}
                  >
                    Remove Admin
                  </button></>) : 
                  (<><button
                    onClick={() => handleAddAdmin(user._id)}
                    className="px-6 py-3 bg-green-100 text-green-700 font-medium rounded-2xl transition-all active:scale-[0.98]"
                    style={{
                      boxShadow: '4px 4px 8px #e0e7ff, -4px -4px 8px #ffffff',
                    }}
                  >
                    Make Admin
                  </button></>)}</>) : 
                  (<>{user.isAdmin ? 'True' : 'False'}</>)}
                </td>
                {usrType === 'Client' && (
                  <td className="py-3 px-4 text-violet-600">
                    <button
                      onClick={() => handleRemoveFromOrg(user._id)}
                      className="px-6 py-3 bg-red-100 text-red-700 font-medium rounded-2xl transition-all active:scale-[0.98]"
                      style={{
                        boxShadow: '4px 4px 8px #e0e7ff, -4px -4px 8px #ffffff',
                      }}
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Updated Projects Section with consistent styling
  const ProjectsSection = () => (
    <div // Added wrapper div for consistent styling
      className="max-w-4xl mx-auto p-8 bg-violet-50 rounded-3xl"
      style={{
        boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
      }}
    >
      <h2 className="text-2xl font-bold text-violet-900 mb-4">📂 My Projects</h2>
      {projs && projs.length > 0 ? (
        <ul className="space-y-3">
          {projs.map((proj) => (
            <li
              key={proj._id}
              className="p-4 bg-violet-100 rounded-2xl"
              style={{
                boxShadow: '3px 3px 6px #e0e7ff, -3px -3px 6px #ffffff',
              }}
            >
              <div className="font-bold text-violet-800">{proj.title}</div>
              <div className="text-violet-600">{proj.description || "No description"}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-6 text-violet-700 bg-violet-100 rounded-2xl"
          style={{
            boxShadow: 'inset 3px 3px 6px #f0f4ff, inset -3px -3px 6px #ffffff',
          }}
        >
          No projects found.
        </div>
      )}
    </div>
  );

  // Function to render the main content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="max-w-4xl mx-auto p-8 bg-violet-50 rounded-3xl"
            style={{
              boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
            }}
          >
            <h2 className="text-3xl font-bold text-violet-900 mb-6 text-center">👤 User Profile</h2>
            {usrData.isAdmin && (<h1 className="text-3xl font-bold text-violet-900 mb-6 text-center">Admin</h1>)}
            {statusMsg && (
              <div className="mb-4 p-3 rounded-2xl text-center bg-green-50 text-green-700"
                style={{
                  boxShadow: '4px 4px 8px #dcfce7, -4px -4px 8px #ffffff',
                }}
              >
                {statusMsg}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-violet-800 font-medium mb-2">Username</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none ${!isEditing ? 'opacity-75' : ''}`}
                  style={{
                    boxShadow: 'inset 3px 3px 6px #f0f4ff, inset -3px -3px 6px #ffffff',
                  }}
                />
              </div>
              <div>
                <label className="block text-violet-800 font-medium mb-2">Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none ${!isEditing ? 'opacity-75' : ''}`}
                  style={{
                    boxShadow: 'inset 3px 3px 6px #f0f4ff, inset -3px -3px 6px #ffffff',
                  }}
                />
              </div>
              {usrType === 'Client' && (
                <div>
                  <label className="block text-violet-800 font-medium mb-2">Organization Name</label>
                  <input
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none ${!isEditing ? 'opacity-75' : ''}`}
                    style={{
                      boxShadow: 'inset 3px 3px 6px #f0f4ff, inset -3px -3px 6px #ffffff',
                    }}
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-3 mt-6">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="px-6 py-3 bg-blue-50 text-blue-700 font-medium rounded-2xl transition-all active:scale-[0.98]"
                      style={{
                        boxShadow: '4px 4px 8px #dbeafe, -4px -4px 8px #ffffff',
                      }}
                    >
                      💾 Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          username: profile.usrData.username || '',
                          email: profile.usrData.email || '',
                          organizationName: profile.usrData.organizationName || ''
                        });
                        setStatusMsg('');
                      }}
                      className="px-6 py-3 bg-violet-100 text-violet-700 font-medium rounded-2xl transition-all active:scale-[0.98]"
                      style={{
                        boxShadow: '4px 4px 8px #e0e7ff, -4px -4px 8px #ffffff',
                      }}
                    >
                      ❌ Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-violet-100 text-violet-700 font-medium rounded-2xl transition-all active:scale-[0.98]"
                    style={{
                      boxShadow: '4px 4px 8px #e0e7ff, -4px -4px 8px #ffffff',
                    }}
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      case 'projects':
        return <ProjectsSection />;
      case 'users':
        return <UsersSection />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 font-[Quicksand] overflow-hidden">
       {/* Mobile Hamburger Button */}
       <button
        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-18 left-2 z-50 p-2 bg-violet-50 rounded-full"
        style={{
          boxShadow: '4px 4px 8px #e0e7ff, -4px -4px 8px #ffffff',
        }}
      >
        <svg className="w-6 h-6 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 p-6 pt-20 lg:pt-10 bg-violet-50 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:w-72
        `}
        style={{
          boxShadow: 'inset 4px 4px 8px #f0f4ff, inset -4px -4px 8px #ffffff',
          borderRadius: '0 1.5rem 1.5rem 0',
        }}
      >
        {/* Close Button (Mobile Only) */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 text-violet-600 hover:text-violet-800"
        >
          ✕
        </button>
        <h2
          className="text-2xl font-bold mb-6 text-center text-violet-900"
          style={{ fontFamily: 'Kaushan Script, cursive' }}
        >
          Dashboard
        </h2>
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <div
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
                setMobileMenuOpen(false); // Close menu on selection (mobile)
              }}
              className={`p-3 cursor-pointer rounded-xl transition-all duration-200 ${
                activeTab === item.key
                  ? 'bg-violet-100 shadow-inner-neu'
                  : 'hover:bg-violet-100'
              }`}
              style={{
                boxShadow:
                  activeTab === item.key
                    ? 'inset 2px 2px 4px #f0f4ff, inset -2px -2px 4px #ffffff'
                    : '3px 3px 6px #e0e7ff, -3px -3px 6px #ffffff',
              }}
            >
              {item.title}
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-violet-100 rounded-t-3xl md:rounded-none">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default UsrProfile;