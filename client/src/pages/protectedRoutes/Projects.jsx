import React, { useEffect, useState } from 'react';
import api from '../../utils/Axios';
import { useUser } from '../../utils/Providers';
import { RefreshAccessToken } from '../../utils/Services';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const { accessToken } = useUser();
  const navigate = useNavigate();

  const fetchProjects = async (retry = false) => {
    try {
      const res = await api.get('/project/all', {
        headers: { 'x-access-token': accessToken },
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 498 && !retry) {
        const refreshed = await RefreshAccessToken();
        if (refreshed) {
          console.log('Access token refreshed.');
          await fetchProjects(true); // Retry once after refresh
        } else {
          alert('Session expired. Please login again.');
          navigate('/login');
        }
      }
    }
  };

  useEffect(() => {
    if (accessToken) fetchProjects();
  }, [accessToken]);

  const createProject = async () => {
    const title = prompt('Enter project title');
    if (!title || title.trim() === '') return alert('Title cannot be empty');

    try {
      await api.post('/project', { title }, {
        headers: { 'x-access-token': accessToken },
      });
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Failed to create project');
    }
  };

  const deleteProject = async (_id) => {
    try {
      await api.delete(`/project/?projId=${_id}`, {
        headers: { 'x-access-token': accessToken },
      });
      setProjects((prev) => prev.filter((p) => p._id !== _id));
    } catch (err) {
      console.error(err);
      alert('Could not delete project');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-100 to-yellow-50 p-6 font-[Quicksand]">
      <div className="flex flex-wrap gap-6 justify-start">
        {projects.map((proj) => (
          <div
            key={proj._id}
            onClick={() => navigate(`/project/doc/${proj._id}`)}
            className="cursor-pointer w-full sm:w-[47%] md:w-[30%] lg:w-[22%] bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold text-violet-900 truncate">{proj.title}</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(proj._id);
                }}
                className="text-red-500 hover:text-red-700 text-sm"
                title="Delete Project"
              >
                🗑️
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-gray-700 transition">
              Click to manage documents →
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/project/knowledgebase/${proj._id}`);
              }}
              className="text-md font-semibold text-violet-600 hover:text-violet-400"
            >
              Visit Knowledge Base
            </button>
          </div>
        ))}

        <div
          onClick={createProject}
          className="cursor-pointer w-full sm:w-[47%] md:w-[30%] lg:w-[22%] p-6 rounded-2xl border-4 border-dashed border-violet-300 flex items-center justify-center text-violet-500 hover:bg-violet-100 hover:border-violet-400 hover:scale-[1.02] transition-all duration-300 text-4xl font-bold"
          title="Add New Project"
        >
          +
        </div>
      </div>
    </div>
  );
};

export default Projects;
