import React, { useEffect, useState } from 'react';
import api from '../../utils/Axios';
import { useParams } from 'react-router-dom';
import { useUser } from '../../utils/Providers';

const KnowledgeBase = () => {
  const { projId } = useParams();
  const [proj, setProj] = useState({});
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { accessToken } = useUser();
  
  useEffect(() => {
    const fetchDeployedDocs = async () => {
      try {
        const res = await api.get(`/docs?projId=${projId}`, {
          headers: { 'x-access-token': accessToken },
        });
        console.log(res.data.proj[0]);
        
        setProj(res.data.proj[0]);
        const deployed = res.data.docs.filter(doc => doc.deploy);
        setDocs(deployed);
        setSelected(deployed[0] || null);
      } catch (err) {
        console.error('Failed to fetch deployed docs:', err);
      }
    };

    fetchDeployedDocs();
  }, [projId]);

  const buildTree = (items) => {
    const map = {};
    const roots = [];

    items.forEach((item) => {
      map[item._id] = { ...item, children: [] };
    });

    items.forEach((item) => {
      if (item.ref && map[item.ref]) {
        map[item.ref].children.push(map[item._id]);
      } else {
        roots.push(map[item._id]); 
      }
    });

    return roots;
  };

  const renderSidebarTree = (nodes, level = 0) =>
    nodes.map((node) => {
      const hasChildren = node.children.length > 0;

      return (
        <div key={node._id} className="relative group">
          <div
            onClick={() => {
              setSelected(node);
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className={`
              flex items-center gap-3 px-4 py-2 my-1 rounded-2xl cursor-pointer transition-all duration-200
              ${selected?._id === node._id
                ? 'bg-violet-300 text-violet-900 shadow-lg scale-[1.02]'
                : 'bg-violet-100 text-violet-800 hover:bg-violet-200 hover:scale-[1.01]'}
            `}
            style={{ paddingLeft: `${level * 20 + 10}px` }}
          >
            <span className="text-sm">{hasChildren ? '📂' : '📄'}</span>
            <span className="font-medium">{node.title}</span>
          </div>

          {level > 0 && (
            <div
              className="absolute top-0 left-3 bottom-0 w-px bg-violet-300"
              style={{ marginLeft: `${level * 20}px` }}
            />
          )}

          {hasChildren && renderSidebarTree(node.children, level + 1)}
        </div>
      );
    });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-violet-100 via-purple-100 to-yellow-50 font-[Quicksand] overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-violet-200 shadow-md">
        <h2 className="text-xl font-bold text-violet-900">{proj.title}</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-violet-900 text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
     <aside
  className={`
    bg-violet-100 shadow-inner border-r border-violet-300 w-64 h-full overflow-auto p-6 pt-20
    transition-transform duration-300 ease-in-out

    md:relative md:translate-x-0 md:transform-none md:z-auto md:top-auto md:left-auto

    fixed top-0 left-0 z-40 transform
    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  `}
>


        <h2 className="text-2xl font-bold mb-6 text-violet-900 hidden md:block">{proj.title}</h2>
        {renderSidebarTree(buildTree(docs))}
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 md:hidden z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-10 overflow-auto bg-purple-50 rounded-t-3xl md:rounded-none transition-all duration-300">
        {selected ? (
          <div className="prose max-w-none p-6 bg-white rounded-[2rem] shadow-[6px_6px_12px_#ccc,-6px_-6px_12px_#fff] transition-transform duration-300 hover:scale-[1.01]">
            {/* <h1 className="text-violet-700 font-bold">{selected.title}</h1> */}
            <div dangerouslySetInnerHTML={{ __html: selected.deploy }} />
          </div>
        ) : (
          <div className="text-violet-600 text-lg text-center mt-20">
            👈 Select a document from the sidebar to start reading!
          </div>
        )}
      </main>
    </div>
  );
};

export default KnowledgeBase;
