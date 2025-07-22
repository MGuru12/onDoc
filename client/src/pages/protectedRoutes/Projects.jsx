import React, { useEffect, useState } from 'react';
import api from '../../utils/Axios';
import { useUser } from '../../utils/Providers';
import { RefreshAccessToken } from '../../utils/Services';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const { accessToken, usrType } = useUser();
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
          await fetchProjects(true);
        } else {
          toast.error('Session expired. Please login again.');
          navigate('/auth/login');
        }
      } else {
        toast.error('Failed to load projects.');
      }
    }
  };

  useEffect(() => {
    if (accessToken) fetchProjects();
  }, [accessToken]);

  const createProject = async () => {
    const title = prompt('Enter project title');
    if (!title || title.trim() === '') return toast.warn('Title cannot be empty');

    try {
      await api.post(
        '/project',
        { title },
        {
          headers: { 'x-access-token': accessToken },
        }
      );
      fetchProjects();
      toast.success('Project created successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create project');
    }
  };

  const deleteProject = async (_id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/project/?projId=${_id}`, {
        headers: { 'x-access-token': accessToken },
      });
      setProjects((prev) => prev.filter((p) => p._id !== _id));
      toast.success('Project deleted');
    } catch (err) {
      console.error(err);
      toast.error('Could not delete project');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-6 font-[Quicksand]">
      <h1
        className="text-3xl font-bold text-center mb-8 text-violet-900"
        style={{ fontFamily: 'Kaushan Script, cursive' }}
      >
        Your Projects
      </h1>

      <div className="flex flex-wrap gap-6 justify-start">
        {/* Project Cards */}
        {projects.map((proj) => (
          <div
            key={proj._id}
            onClick={() => navigate(`/project/doc/${proj._id}`)}
            className="cursor-pointer w-full sm:w-[47%] md:w-[30%] lg:w-[22%] group relative"
          >
            {/* Neumorphic Card */}
            <div
              className="bg-violet-50 p-6 rounded-3xl h-full transition-all duration-300 group-hover:scale-105"
              style={{
                boxShadow: '8px 8px 16px #e0e7ff, -8px -8px 16px #ffffff',
              }}
            >
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold text-violet-900 truncate">{proj.title}</h2>
                {usrType !== 'Member' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(proj._id);
                    }}
                    className="text-red-500 hover:text-red-700 text-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Project"
                  >
                    🗑️
                  </button>
                )}
              </div>

              <p className="text-sm text-violet-600 mt-2">Click to manage documents →</p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/project/knowledgebase/${proj._id}`);
                }}
                className="mt-3 inline-block text-sm font-medium text-violet-700 hover:text-violet-900 transition-colors"
              >
                Visit Knowledge Base
              </button>
            </div>
          </div>
        ))}

        {/* Add New Project Card */}
        {usrType !== 'Member' && (
          <div
            onClick={createProject}
            className="cursor-pointer w-full sm:w-[47%] md:w-[30%] lg:w-[22%] flex items-center justify-center group relative"
          >
            <div
              className="bg-violet-50 border border-violet-200 p-6 rounded-3xl hover:bg-violet-100 transition-all duration-300 group-hover:scale-105 text-violet-600 font-bold text-4xl"
              style={{
                boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
              }}
            >
              +
            </div>
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity pointer-events-none">
              Add New Project
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;