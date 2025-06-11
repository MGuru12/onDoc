import React, { useEffect, useState } from 'react';
import api from '../../utils/Axios';
import { useUser } from '../../utils/Providers';
import { RefreshAccessToken } from '../../utils/Services';
import { Link } from 'react-router-dom';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const { accessToken } = useUser();

  useEffect(() => {
    const getAllProj = async () => {
      try {
        const response = await api.get('/project/all', {
          headers: {
            'x-access-token': accessToken,
          },
        });
        setProjects(response.data);
      } catch (err) {
        console.error(err);
        if(err.response.status && err.response.status===498)
          {
            const refresh = confirm("Your Access token expired or invalid. Click ok to Generate new one");
            if(refresh) {
              const success = await RefreshAccessToken();
              if(success) alert("New access token generated successfully");
              else if(success==null) alert("Login first");
              else if(!success) alert("Cant generate new access token");
            }
          }
      }
    };

    getAllProj();
  }, []);

  const addProj = async () => {
    try {
      let title = prompt('Enter the new project title');
      if (!title || title.trim() === '') return alert('Title should not be empty');

      await api.post(
        '/project',
        { title },
        {
          headers: {
            'x-access-token': accessToken,
          },
        }
      );
      alert('New project created successfully');
      // Refresh projects
      const response = await api.get('/project/all', {
        headers: { 'x-access-token': accessToken },
      });
      setProjects(response.data);
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  const delProj = async (_id) => {
    try {
      await api.delete(`/project/?projId=${_id}`, {
        headers: {
          'x-access-token': accessToken,
        },
      });
      alert('Project deleted successfully');
      // Refresh projects
      setProjects(projects.filter((p) => p._id !== _id));
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {projects.map((proj) => (
        <Link to={`/project/doc/${proj._id}`}>
          <div
          key={proj._id}
          className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"
          >
            <div className="text-lg font-semibold text-gray-800 mb-2">{proj.title}</div>
            <button
              onClick={() => delProj(proj._id)}
              className="self-end text-red-500 hover:text-red-700 transition-colors duration-200"
              title="Delete Project"
            >
              🗑️
            </button>
          </div>
        </Link>
      ))}

      <div
        onClick={addProj}
        className="cursor-pointer bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-4xl font-bold text-gray-600 transition-colors duration-300"
        title="Add New Project"
      >
        +
      </div>
    </div>
  );
};

export default Projects;
