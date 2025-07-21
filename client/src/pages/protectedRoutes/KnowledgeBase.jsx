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
  const [expandedNodes, setExpandedNodes] = useState({});
  const { accessToken } = useUser();

  // Fetch documents
  useEffect(() => {
    const fetchDeployedDocs = async () => {
      try {
        const res = await api.get(`/docs?projId=${projId}`, {
          headers: { 'x-access-token': accessToken },
        });

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

  // Expand parent nodes if a document is selected
  useEffect(() => {
    if (selected) {
      const map = {};
      docs.forEach((doc) => {
        map[doc._id] = doc;
      });

      const expandParents = (nodeId) => {
        const item = map[nodeId];
        if (item?.ref) {
          setExpandedNodes((prev) => ({ ...prev, [item.ref]: true }));
          expandParents(item.ref);
        }
      };

      expandParents(selected._id);
    }
  }, [selected, docs]);

  // Toggle expand/collapse of a folder (node)
  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Build tree structure from flat list
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

  // Recursive function to render the sidebar tree
  const renderSidebarTree = (nodes, level = 0) =>
    nodes.map((node) => {
      const hasChildren = node.children.length > 0;
      const isExpanded = expandedNodes[node._id];
      const isSelected = selected?._id === node._id;

      return (
        <div key={node._id} className="relative group">
          <div
            onClick={() => {
              if (hasChildren) {
                // Toggle folder expansion/collapse
                toggleNode(node._id);
              }
              // Select the node as the current document (page)
              setSelected(node);
              if (window.innerWidth < 768) setSidebarOpen(false); // Close sidebar on mobile
            }}
            className={`flex items-center gap-2 px-3 py-1.5 my-1 rounded-lg cursor-pointer transition-all duration-200
              ${isSelected
                ? 'bg-violet-300 text-violet-900 shadow-neu-pressed'
                : 'hover:bg-violet-200 text-violet-800 shadow-neu-flat'}
            `}
            style={{ paddingLeft: `${level * 20 + 10}px` }}
          >
            <span
              className={`transition-transform duration-200 ${hasChildren ? (isExpanded ? 'rotate-90' : 'rotate-0') : 'opacity-0'}`}
            >
              ▶
            </span>
            <span className="text-sm">{hasChildren ? '📂' : '📄'}</span>
            <span className="font-medium truncate">{node.title}</span>
          </div>

          {level > 0 && (
            <div
              className="absolute top-0 left-3 bottom-0 w-px bg-violet-200"
              style={{ marginLeft: `${level * 20}px` }}
            />
          )}

          {hasChildren && isExpanded && (
            <div className="transition-all duration-300 ease-in-out pl-4">
              {renderSidebarTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-violet-100 via-purple-100 to-yellow-50 font-[Quicksand] overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-violet-200 shadow-neu-flat">
        <h2 className="text-xl font-bold text-violet-900 truncate">{proj.title}</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-violet-900 text-2xl focus:outline-none hover:shadow-neu-pressed rounded-lg p-2 transition-all duration-200"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-violet-100 shadow-neu-inset border-r border-violet-300 w-64 h-full overflow-auto p-6 pt-20
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:transform-none md:z-auto
          fixed top-0 left-0 z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
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
      <main className="flex-1 p-8 md:p-10 overflow-auto bg-violet-50 rounded-t-3xl md:rounded-none transition-all duration-300">
        {selected ? (
          <div className="prose max-w-none p-6 bg-white rounded-[2rem] shadow-neu-content transition-transform duration-300 hover:scale-[1.01]">
            <div dangerouslySetInnerHTML={{ __html: selected.deploy }} />
          </div>
        ) : (
          <div className="text-violet-600 text-lg text-center mt-20">
            👈 Select a document from the sidebar to start reading!
          </div>
        )}
      </main>

      <style jsx>{`
        .shadow-neu-flat {
          box-shadow: 3px 3px 6px rgba(196, 181, 253, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.8);
        }
        .shadow-neu-pressed {
          box-shadow: inset 2px 2px 4px rgba(196, 181, 253, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.7);
        }
        .shadow-neu-raised {
          box-shadow: 4px 4px 8px rgba(196, 181, 253, 0.3), -4px -4px 8px rgba(255, 255, 255, 0.9);
        }
        .shadow-neu-inset {
          box-shadow: inset 3px 3px 6px rgba(196, 181, 253, 0.2), inset -3px -3px 6px rgba(255, 255, 255, 0.8);
        }
        .shadow-neu-content {
          box-shadow: 4px 4px 8px rgba(204, 204, 204, 0.3), -4px -4px 8px rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </div>
  );
};

export default KnowledgeBase;
