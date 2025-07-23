import React, { useEffect, useState } from 'react';
import { useUser } from '../../utils/Providers';
import api from '../../utils/Axios';

const UsrProfile = () => {
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

  // Fetch profile on mount
  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await api.get('/profile', headers);
        const data = response.data.profile;
        setProfile(data);

        // Set initial form values
        setFormData({
          username: data.usrData.username || '',
          email: data.usrData.email || '',
          organizationName: data.usrData.organizationName || ''
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    getProfile();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit update
  const handleUpdate = async () => {
    try {
      const response = await api.put('/profile/update', formData, headers);
      setStatusMsg('Profile updated successfully!');
      setIsEditing(false);

      // Update local profile state
      setProfile((prev) => ({
        ...prev,
        usrData: response.data.usrData
      }));
      
      // Update form data to reflect saved values
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

  if (!profile) return <div className="flex justify-center items-center h-screen"><div className="text-violet-900">Loading profile...</div></div>;

  const { usrType, usrData, projs } = profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 font-[Quicksand] p-6 flex justify-center items-start">
      <div 
        className="max-w-4xl w-full mx-auto p-8 bg-violet-50 rounded-3xl my-10"
        style={{
          boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
        }}
      >
        <h2 className="text-3xl font-bold text-violet-900 mb-6 text-center">👤 User Profile</h2>

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
                    // Reset form data to original values when cancelling
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

        <div className="mt-12">
          <h3 className="text-2xl font-bold text-violet-900 mb-4">📂 Projects</h3>
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
      </div>
    </div>
  );
};

export default UsrProfile;