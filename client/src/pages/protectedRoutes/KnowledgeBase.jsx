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

  // Fetch deployed documents
  useEffect(() => {
    const fetchDeployedDocs = async () => {
      try {
        const res = await api.get(`/docs?projId=${projId}`, {
          headers: { 'x-access-token': accessToken },
        });

        setProj(res.data.proj[0]);
        const deployed = res.data.docs.filter((doc) => doc.deploy);
        setDocs(deployed);
        setSelected(deployed[0] || null);
      } catch (err) {
        console.error('Failed to fetch deployed docs:', err);
      }
    };

    fetchDeployedDocs();
  }, [projId, accessToken]);

  // Expand parent nodes when a document is selected
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

  // Toggle folder expansion
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

  // Render sidebar tree recursively
  const renderSidebarTree = (nodes, level = 0) =>
    nodes.map((node) => {
      const hasChildren = node.children.length > 0;
      const isExpanded = expandedNodes[node._id];
      const isSelected = selected?._id === node._id;

      return (
        <div key={node._id} className="relative group">
          {/* Tree Node */}
          <div
            onClick={() => {
              if (hasChildren) toggleNode(node._id);
              setSelected(node);
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 my-1 rounded-xl cursor-pointer transition-all duration-200 text-sm font-medium truncate
              ${isSelected
                ? 'text-violet-900 bg-violet-100 shadow-inner-neu'
                : 'text-violet-800 hover:bg-violet-50'}
            `}
            style={{ paddingLeft: `${level * 20 + 10}px` }}
          >
            <span
              className={`transition-transform duration-200 text-xs ${
                hasChildren ? (isExpanded ? 'rotate-90' : 'rotate-0') : 'opacity-0'
              }`}
            >
              ▶
            </span>
            <span>{hasChildren ? '📂' : '📄'}</span>
            <span className="truncate">{node.title}</span>
          </div>

          {/* Vertical connector line */}
          {level > 0 && (
            <div
              className="absolute top-0 left-3 bottom-0 w-px bg-gradient-to-b from-transparent via-violet-200 to-transparent"
              style={{ marginLeft: `${level * 20}px` }}
            />
          )}

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="pl-4 mt-0.5 transition-all duration-300 ease-in-out">
              {renderSidebarTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 font-[Quicksand] overflow-hidden">
      {/* Mobile Header */}
      <div
        className="md:hidden flex items-center justify-between p-4 bg-violet-50 shadow-md z-30"
        style={{
          boxShadow: '4px 4px 8px #e0e7ff, -4px -4px 8px #ffffff',
        }}
      >
        <h2
          className="text-xl font-bold text-violet-900 truncate"
          style={{ fontFamily: 'Kaushan Script, cursive' }}
        >
          {proj.title || 'Knowledge Base'}
        </h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-violet-800 hover:text-violet-900 focus:outline-none p-2 rounded-full"
          style={{
            boxShadow: 'inset 2px 2px 4px #f0f4ff, inset -2px -2px 4px #ffffff',
          }}
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative transform transition-transform duration-300 ease-in-out 
          w-64 h-full z-40 bg-violet-50 overflow-auto border-r border-violet-200 pt-4 pb-6 px-4
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{
          boxShadow: 'inset 4px 4px 8px #f0f4ff, inset -4px -4px 8px #ffffff',
        }}
      >
        <h2
          className="text-2xl font-bold mb-6 text-violet-900 hidden md:block text-center"
          style={{ fontFamily: 'Kaushan Script, cursive' }}
        >
          {proj.title}
        </h2>

        <div className="space-y-1 px-1">{renderSidebarTree(buildTree(docs))}</div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-auto bg-violet-100 rounded-t-3xl md:rounded-none transition-all duration-300">
        {selected ? (
          <div
            className="prose max-w-none p-8 bg-violet-50 rounded-3xl transition-all duration-300 hover:shadow-lg"
            style={{
              boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
            }}
          >
            <div
              className="text-violet-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: selected.deploy }}
            />
          </div>
        ) : (
          <div
            className="text-center mt-20 text-violet-700 text-lg italic"
            style={{ fontFamily: 'Quicksand' }}
          >
            👈 Select a document from the sidebar to start reading!
          </div>
        )}
      </main>
    </div>
  );
};

export default KnowledgeBase;