import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../utils/Providers';
import api from '../../utils/Axios';

const KbSettings = () => {
  const { projId } = useParams();
  const { accessToken, usrType } = useUser();
  const navigate = useNavigate();

  const [selected, setSelected] = useState('users');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [projData, setProjData] = useState({ title: '', description: '' });

  const headers = { headers: { 'x-access-token': accessToken } };

  const sidebarItems = [
    { key: 'users', title: '👥 Users' },
    { key: 'edit', title: '📝 Project' },
    { key: 'delete', title: '🗑️ Delete Project' },
  ];

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserName) return alert('Please provide both name and email.');

    try {
      await api.post(`/member/${projId}/invite`, {
        email: newUserEmail,
        uName: newUserName,
        password: 'TempPass123'  // You can make this dynamic later
      }, headers);
      setNewUserEmail('');
      setNewUserName('');
      alert('User invited!');
      getUsers();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to invite user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/member/${userId}?projId=${projId}`, headers);
      alert('User deleted!');
      getUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user.');
    }
  };

  const handleProjectUpdate = async () => {
    try {
      const payload = {};
      if (projData.title) payload.title = projData.title;
      if (projData.description) payload.description = projData.description;

      await api.put(`project/${projId}/update`, payload, headers);
      alert('Project updated!');
    } catch (err) {
      console.error(err);
      alert('Failed to update project.');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`proj/delete?_id=${projId}`, headers);
      alert('Project deleted!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to delete project.');
    }
  };

  const getUsers = async () => {
    try {
      const response = await api.get(`/member/${projId}`, headers);
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch users.');
    }
  };

  const getProjectData = async () => {
    try
    {
      const res = await api.get(`/project/${projId}`, {
          headers: { 'x-access-token': accessToken },
        });
      setProjData(res.data);
    }
    catch (err) {
      console.error(err);
      alert('Failed to fetch project data.');
    }
  };

  useEffect(() => {
    getUsers();
    getProjectData();
  }, [projId]);

  const renderContent = () => {
    switch (selected) {
      case 'users':
  return (
    <div className="w-full font-[Quicksand] py-4 px-2 sm:px-4">
      <div className="w-full bg-white rounded-2xl shadow-[inset_2px_2px_5px_#e2e2e2,inset_-2px_-2px_5px_#ffffff] p-6 sm:p-8 space-y-6 transition-all duration-300">
        <h2 className="text-2xl font-bold text-violet-900">
          {usrType !== 'Member' ? '👥 Manage Users' : '👥 Users'}
        </h2>

        {usrType !== 'Member' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="User name"
              className="w-full px-4 py-2 border border-violet-200 rounded-xl bg-violet-50 text-gray-800 placeholder-violet-400 shadow-[inset_1px_1px_3px_#ddd,inset_-1px_-1px_2px_#fff] focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
            <input
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="User email"
              className="w-full px-4 py-2 border border-violet-200 rounded-xl bg-violet-50 text-gray-800 placeholder-violet-400 shadow-[inset_1px_1px_3px_#ddd,inset_-1px_-1px_2px_#fff] focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
            <button
              onClick={handleAddUser}
              className="bg-violet-400 hover:bg-violet-500 text-white font-semibold px-4 py-2 rounded-xl transition duration-200 shadow-[2px_2px_4px_#e4e4e4,-2px_-2px_4px_#fff]"
            >
              ➕ Invite
            </button>
          </div>
        )}

        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user._id}
              className="flex justify-between items-center px-4 py-2 bg-violet-50 border border-violet-200 rounded-xl shadow-[inset_1px_1px_3px_#ddd,inset_-1px_-1px_2px_#fff]"
            >
              <div className="relative group cursor-pointer text-violet-700 font-medium">
                {user.username}

                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max bg-violet-400 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  {user.email}
                </div>
              </div>

              {usrType !== 'Member' && (
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="text-red-500 text-sm hover:underline transition-colors"
                >
                  ❌ Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );


      case 'edit':
        return (
          <div className="w-full font-[Quicksand] py-4 px-2 sm:px-4">
            <div className="w-full bg-white rounded-2xl shadow-[inset_2px_2px_5px_#e2e2e2,inset_-2px_-2px_5px_#ffffff] p-6 sm:p-8 space-y-5 transition-all duration-300">
              <h2 className="text-2xl font-bold text-violet-900">
                {usrType === 'Client' ? '🛠️ Edit Project' : '📄 Project Details'}
              </h2>

              {usrType === 'Client' ? (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Project Title</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 bg-violet-50 text-gray-800 placeholder-violet-400 shadow-[inset_1px_1px_3px_#ddd,inset_-1px_-1px_2px_#fff]"
                      placeholder="Enter project title"
                      value={projData.title}
                      onChange={(e) => setProjData({ ...projData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Description</label>
                    <textarea
                      className="w-full px-4 py-2 border border-violet-200 rounded-xl h-24 resize-none focus:outline-none focus:ring-2 focus:ring-violet-200 bg-violet-50 text-gray-800 placeholder-violet-400 shadow-[inset_1px_1px_3px_#ddd,inset_-1px_-1px_2px_#fff]"
                      placeholder="Enter project description"
                      value={projData.description}
                      onChange={(e) => setProjData({ ...projData, description: e.target.value })}
                    />
                  </div>

                  <button
                    onClick={handleProjectUpdate}
                    className="w-full bg-violet-400 hover:bg-violet-500 text-white font-semibold py-2 rounded-xl transition duration-200 shadow-[2px_2px_4px_#e4e4e4,-2px_-2px_4px_#fff]"
                  >
                    💾 Save Changes
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Project Title</label>
                    <div className="px-4 py-2 bg-violet-50 border border-violet-200 rounded-xl text-gray-800 shadow-[inset_1px_1px_3px_#ddd,inset_-1px_-1px_2px_#fff]">
                      {projData.title}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Description</label>
                    <div className="px-4 py-2 bg-violet-50 border border-violet-200 rounded-xl text-gray-800 shadow-[inset_1px_1px_3px_#ddd,inset_-1px_-1px_2px_#fff] whitespace-pre-line">
                      {projData.description}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );



      case 'delete':
        return (
          <div className="w-full font-[Quicksand] py-4 px-2 sm:px-4">
            <div className="w-full bg-white rounded-2xl shadow-[inset_2px_2px_5px_#e2e2e2,inset_-2px_-2px_5px_#ffffff] p-6 sm:p-8 space-y-6 transition-all duration-300">
              <h2 className="text-2xl font-bold text-red-600">⚠️ Danger Zone</h2>

              <p className="text-gray-700">
                This action will permanently delete the project. This cannot be undone.
              </p>

              <button
                onClick={handleDeleteProject}
                className="w-64 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-xl transition duration-200 shadow-[2px_2px_4px_#e4e4e4,-2px_-2px_4px_#fff]"
              >
                🗑️ Delete Project
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-violet-100 via-purple-100 to-yellow-50 font-[Quicksand] overflow-hidden">
      <div className="md:hidden flex items-center justify-between p-4 bg-violet-200 shadow-md">
        <button
          onClick={() => navigate(`/knowledgebase/${projId}`)}
          className="text-violet-900 text-2xl"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-violet-900">⚙️ Settings</h2>
      </div>

      <div className="flex">
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-4 text-violet-900"
      >
        ☰
      </button>

      {/* Sidebar for desktop and toggled mobile */}
      <aside
        className={`fixed md:static z-50 w-64 p-6 bg-violet-100 shadow-inner border-r border-violet-300 overflow-auto
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <h2 className="text-2xl font-bold mb-6 text-violet-900 hidden md:block">⚙️ Settings</h2>
        <div className="md:hidden mb-4">
          <button onClick={() => setMobileMenuOpen(false)} className="text-violet-900">✕ Close</button>
        </div>
        {sidebarItems.map((item) => (
          <div
            key={item.key}
            onClick={() => {
              setSelected(item.key);
              setMobileMenuOpen(false); // close menu on mobile after selection
            }}
            className={`cursor-pointer px-4 py-2 my-1 rounded-2xl transition-all
              ${selected === item.key
                ? 'bg-violet-300 text-violet-900 shadow-lg'
                : 'bg-violet-100 text-violet-800 hover:bg-violet-200'}
            `}
          >
            {item.title}
          </div>
        ))}
      </aside>

      {/* Optional overlay for mobile when menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-25 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </div>

      <main className="flex-1 p-4 md:p-10 overflow-auto bg-purple-50 rounded-t-3xl md:rounded-none transition-all duration-300">
        <div className="prose max-w-none p-6 bg-white rounded-[2rem] shadow-[6px_6px_12px_#ccc,-6px_-6px_12px_#fff]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default KbSettings;
