import React, { useState, useEffect, use } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../utils/Providers';
import api from '../../utils/Axios';
import { toast } from 'react-toastify';

const KbSettings = () => {
  const { projId } = useParams();
  const { accessToken, usrType, usrId } = useUser();
  const navigate = useNavigate();

  const [selected, setSelected] = useState('users');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [projData, setProjData] = useState({ title: '', description: '' });
  const [ownerDetails, setOwnerDetails] = useState({});
  const [mydetails, setMyDetails] = useState({});

  const headers = { headers: { 'x-access-token': accessToken } };

  const sidebarItems = [
    { key: 'users', title: '👥 Users' },
    { key: 'edit', title: '📝 Project' },
    { key: 'delete', title: '🗑️ Delete Project' },
  ];

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserName) return alert('Please provide both name and email.');
    try {
      await api.post(
        `/member/${projId}/invite`,
        {
          email: newUserEmail,
          uName: newUserName,
          password: 'TempPass123',
        },
        headers
      );
      setNewUserEmail('');
      setNewUserName('');
      alert('User invited!');
      getUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to invite user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/member/${userId}?projId=${projId}`, headers);
      toast.success('User deleted!');
      getUsers();
    } catch (err) {
      toast.error('Failed to delete user.');
    }
  };

  const handleProjectUpdate = async () => {
    try {
      const payload = {};
      if (projData.title) payload.title = projData.title;
      if (projData.description) payload.description = projData.description;
      await api.put(`project/${projId}/update`, payload, headers);
      toast.success('Project updated!');
    } catch (err) {
      toast.error('Failed to update project.');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    try {
      await api.delete(`proj/delete?_id=${projId}`, headers);
      toast.success('Project deleted!');
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete project.');
    }
  };

  const handleAddAdmin = async (userId) => {
  try {
    await api.post(`/admin/addProjAdmin/${projId}`, { userId }, headers);
    toast.success('User made admin successfully!');

    // Update local state: set isAdminProj = true for the user
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === userId ? { ...user, isAdminProj: true } : user
      )
    );
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to make user admin.');
  }
};

const handleRemoveAdmin = async (userId) => {
  try {
    await api.delete(`/admin/removeProjAdmin/${projId}/${userId}`, headers);
    toast.success('User removed from admin successfully!');

    // Update local state: set isAdminProj = false for the user
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === userId ? { ...user, isAdminProj: false } : user
      )
    );
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to remove user from admin.');
  }
};


  const getUsers = async () => {
    try {
      const response = await api.get(`/member/${projId}`, headers);
      setUsers(response.data.members);
    } catch (err) {
      toast.error('Failed to fetch users.');
    }
  };

  const getProjectData = async () => {
    try {
      const res = await api.get(`/project/${projId}`, headers);
      setProjData(res.data);
    } catch (err) {
      toast.error('Failed to fetch project data.');
    }
  };

  const getOwnerDetails = async () => {
    try {
      const res = await api.get(`/member/owner`, headers);
      setOwnerDetails(res.data.owner);
    } catch (err) {
      console.error('Failed to fetch project owner details:', err);
      toast.error('Failed to fetch project owner details.');
    }
  };

  const getMyDetails = async () => {
    try {
      const res = await api.get(`/member/mydetails/${projId}`, headers);
      setMyDetails(res.data.myDetails);
    } catch (err) {
      console.error('Failed to fetch my details:', err);
      toast.error('Failed to fetch your details.');
    }
  };

  const verifyMember = async () => {
      try {
        const res = await api.get(`/member/verify/${projId}`, {
          headers: { 'x-access-token': accessToken },
        });
        if (!res.data) {
          toast.error('You are not a member of this project');
          navigate('/projects/list');
        }
      } catch (err) {
        console.error('Verification failed', err);
        toast.error('Failed to verify project membership');
        navigate('/project/list');
      } 
    };

  useEffect(() => {
    verifyMember();
    getMyDetails();
    getOwnerDetails();
    getUsers();
    getProjectData();
  }, [projId]);

  const renderContent = () => {
    switch (selected) {
      case 'users':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-violet-900">
              {usrType !== 'Member' ? '👥 Manage Users' : '👥 Users'}
            </h2>
            {(usrType === 'Client' || mydetails.isAdmin || mydetails.isAdminProj) && (
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3">
                <input
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="User name"
                  className="px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none font-mono"
                  style={{
                    boxShadow: 'inset 3px 3px 6px #f0f4ff, inset -3px -3px 6px #ffffff',
                  }}
                />
                <input
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="User email"
                  className="px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none font-mono"
                  style={{
                    boxShadow: 'inset 3px 3px 6px #f0f4ff, inset -3px -3px 6px #ffffff',
                  }}
                />
                <button
                  onClick={handleAddUser}
                  className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 font-medium rounded-2xl transition-all active:scale-[0.98]"
                  style={{
                    boxShadow: '4px 4px 8px #dcfce7, -4px -4px 8px #ffffff',
                  }}
                >
                  ➕ Invite
                </button>
              </div>
            )}
            <ul className="space-y-4">
              <li
                key={ownerDetails._id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-violet-50 rounded-2xl shadow-md"
                style={{
                  boxShadow: '3px 3px 6px #e0e7ff, -3px -3px 6px #ffffff',
                }}
              >
                {/* Username + Tooltip */}
                <div className="relative group cursor-pointer text-violet-700 font-semibold text-lg">
                  {ownerDetails.username}
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max bg-violet-600 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 whitespace-nowrap">
                    {ownerDetails.email}
                  </div>
                </div>
              </li>
              {users.map((user) => (
                <li
                  key={user._id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-violet-50 rounded-2xl shadow-md"
                  style={{
                    boxShadow: '3px 3px 6px #e0e7ff, -3px -3px 6px #ffffff',
                  }}
                >
                  {/* Username + Tooltip */}
                  <div className="relative group cursor-pointer text-violet-700 font-semibold text-lg">
                    {user.username}{user.isAdminProj && (<span className="text-blue-600 font-medium"> - Admin</span>)}
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max bg-violet-600 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 whitespace-nowrap">
                      {user.email}
                    </div>
                  </div>
                  
                  {/* Admin & Delete Actions */}
                  <div className="flex items-center gap-4">
                    {usrType === 'Client' && (
                      user.isAdminProj ? (
                        <button
                          onClick={() => handleRemoveAdmin(user._id)}
                          className="text-sm text-red-600 hover:text-red-800 font-medium transition"
                        >
                          Remove Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddAdmin(user._id)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                        >
                          Make Admin
                        </button>
                      )
                    )}

                    {(usrType === 'Client' || mydetails.isAdmin || mydetails.isAdminProj || usrId == user._id) && (
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
                      >
                        ❌ Remove
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

          </div>
        );

      case 'edit':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-violet-900">
              {usrType === 'Client' ? '🛠️ Edit Project' : '📄 Project Details'}
            </h2>
            {usrType === 'Client' ? (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Project Title</label>
                  <input
                    type="text"
                    placeholder="Enter project title"
                    value={projData.title}
                    onChange={(e) => setProjData({ ...projData, title: e.target.value })}
                    className="w-full px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none"
                    style={{
                      boxShadow: 'inset 3px 3px 6px #f0f4ff, inset -3px -3px 6px #ffffff',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Description</label>
                  <textarea
                    placeholder="Enter project description"
                    value={projData.description}
                    onChange={(e) => setProjData({ ...projData, description: e.target.value })}
                    className="w-full px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none resize-none h-32"
                    style={{
                      boxShadow: 'inset 3px 3px 6px #f0f4ff, inset -3px -3px 6px #ffffff',
                    }}
                  />
                </div>
                <button
                  onClick={handleProjectUpdate}
                  className="px-6 py-3 bg-blue-50 text-blue-700 font-medium rounded-2xl transition-all active:scale-[0.98]"
                  style={{
                    boxShadow: '4px 4px 8px #dbeafe, -4px -4px 8px #ffffff',
                  }}
                >
                  💾 Save Changes
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium">Project Title</label>
                  <div
                    className="px-5 py-3 bg-violet-100 rounded-2xl text-violet-900 mt-1"
                    style={{
                      boxShadow: 'inset 3px 3px 6px #f0f4ff, inset -3px -3px 6px #ffffff',
                    }}
                  >
                    {projData.title}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Description</label>
                  <div
                    className="px-5 py-3 bg-violet-100 rounded-2xl text-violet-900 mt-1 whitespace-pre-line"
                    style={{
                      boxShadow: 'inset 3px 3px 6px #f0f4ff, inset -3px -3px 6px #ffffff',
                    }}
                  >
                    {projData.description}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'delete':
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-red-600">⚠️ Danger Zone</h2>
            <p className="text-gray-700">
              This action will permanently delete the project. This cannot be undone.
            </p>
            <button
              onClick={handleDeleteProject}
              className="px-6 py-3 bg-red-50 text-red-700 font-medium rounded-2xl transition-all active:scale-[0.98]"
              style={{
                boxShadow: '4px 4px 8px #fee2e2, -4px -4px 8px #ffffff',
              }}
            >
              🗑️ Delete Project
            </button>
          </div>
        );

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
          Settings
        </h2>

        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            // If the item is "delete" and the user is not a "Client", skip rendering
            if (item.key === 'delete' && usrType !== 'Client') return null;

            return (
              <div
                key={item.key}
                onClick={() => {
                  setSelected(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`p-3 cursor-pointer rounded-xl transition-all duration-200 ${
                  selected === item.key
                    ? 'bg-violet-100 shadow-inner-neu'
                    : 'hover:bg-violet-100'
                }`}
                style={{
                  boxShadow:
                    selected === item.key
                      ? 'inset 2px 2px 4px #f0f4ff, inset -2px -2px 4px #ffffff'
                      : '3px 3px 6px #e0e7ff, -3px -3px 6px #ffffff',
                }}
              >
                {item.title}
              </div>
            );
          })}
        </nav>

        <button
          onClick={() => navigate(`/project/doc/${projId}`)}
          className="mt-6 w-full py-3 bg-violet-100 text-violet-800 font-medium rounded-2xl transition-all duration-300 active:scale-[0.98]"
          style={{
            boxShadow: '4px 4px 8px #e0e7ff, -4px -4px 8px #ffffff',
          }}
        >
          ◀ Back to OnDoc Editor
        </button>
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
        <div
          className="max-w-6xl mx-auto p-8 bg-violet-50 rounded-3xl"
          style={{
            boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
          }}
        >
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default KbSettings;