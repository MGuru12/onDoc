import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../utils/Providers';
import api from '../../utils/Axios';

const KbSettings = () => {
  const { projId } = useParams();
  const { accessToken } = useUser();
  const navigate = useNavigate();

  const [selected, setSelected] = useState('users'); // 'users', 'edit', 'delete'
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState('');
  const [projData, setProjData] = useState({ title: '', description: '' });

  const headers = { headers: { 'x-access-token': accessToken } };

  // Dummy sidebar tree-like structure
  const sidebarItems = [
    { key: 'users', title: '👥 Manage Users' },
    { key: 'edit', title: '📝 Edit Project' },
    { key: 'delete', title: '🗑️ Delete Project' },
  ];

  const handleAddUser = async () => {
    try {
      await api.post(`proj/${projId}/member/add`, { email: newUser }, headers);
      setNewUser('');
      alert('User invited!');
    } catch (err) {
      console.error(err);
      alert('Failed to invite user.');
    }
  };

  const handleDeleteUser = async (_id) => {
    try {
      await api.delete(`proj/${projId}/member/delete?_id=${_id}`, headers);
      alert('User deleted!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleProjectUpdate = async () => {
    try {
      const payload = {};
      if (projData.title) payload.title = projData.title;
      if (projData.description) payload.description = projData.description;

      await api.put(`proj/${projId}/update`, payload, headers);
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

  const renderContent = () => {
    switch (selected) {
      case 'users':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Manage Users</h2>
            <div className="flex gap-3 mb-4">
              <input
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                placeholder="User email"
                className="border p-2 rounded w-full"
              />
              <button onClick={handleAddUser} className="bg-violet-500 text-white px-4 rounded">Invite</button>
            </div>
            {/* Placeholder user list */}
            <ul>
              {users.map((user) => (
                <li key={user._id} className="flex justify-between items-center mb-2 bg-violet-100 p-2 rounded">
                  {user.email}
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'edit':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Edit Project</h2>
            <input
              className="block mb-3 w-full p-2 border rounded"
              placeholder="Title"
              value={projData.title}
              onChange={(e) => setProjData({ ...projData, title: e.target.value })}
            />
            <textarea
              className="block mb-3 w-full p-2 border rounded"
              placeholder="Description"
              value={projData.description}
              onChange={(e) => setProjData({ ...projData, description: e.target.value })}
            />
            <button onClick={handleProjectUpdate} className="bg-green-500 text-white px-4 py-2 rounded">Save Changes</button>
          </div>
        );
      case 'delete':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h2>
            <p className="mb-4">This action will permanently delete the project.</p>
            <button onClick={handleDeleteProject} className="bg-red-600 text-white px-4 py-2 rounded">Delete Project</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-violet-100 via-purple-100 to-yellow-50 font-[Quicksand] overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-violet-200 shadow-md">
        <button
          onClick={() => navigate(`/knowledgebase/${projId}`)}
          className="text-violet-900 text-2xl"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-violet-900">⚙️ Settings</h2>
      </div>

      {/* Sidebar */}
      <aside className="w-64 p-6 bg-violet-100 shadow-inner border-r border-violet-300 overflow-auto">
        <h2 className="text-2xl font-bold mb-6 text-violet-900 hidden md:block">⚙️ Settings</h2>
        {sidebarItems.map((item) => (
          <div
            key={item.key}
            onClick={() => setSelected(item.key)}
            className={`
              cursor-pointer px-4 py-2 my-1 rounded-2xl transition-all
              ${selected === item.key
                ? 'bg-violet-300 text-violet-900 shadow-lg'
                : 'bg-violet-100 text-violet-800 hover:bg-violet-200'}
            `}
          >
            {item.title}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-auto bg-purple-50 rounded-t-3xl md:rounded-none transition-all duration-300">
        <div className="prose max-w-none p-6 bg-white rounded-[2rem] shadow-[6px_6px_12px_#ccc,-6px_-6px_12px_#fff]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default KbSettings;
