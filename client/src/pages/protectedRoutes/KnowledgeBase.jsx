import React, { useEffect, useState } from 'react';
import api from '../../utils/Axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../utils/Providers';

const KnowledgeBase = () => {
  const { projId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken } = useUser();

  const [proj, setProj] = useState({});
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState({});

  const basePath = `/project/knowledgebase/${projId}/`;
  const currentPath = decodeURIComponent(location.pathname.replace(basePath, '')) || '/';
  
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

        // Match by path
        const matchedDoc = deployed.find((doc) => doc.path === currentPath);
        setSelected(matchedDoc || deployed[0] || null);

        // Optional: redirect if no matching path
        if (!matchedDoc && deployed.length > 0) {
          navigate(`/project/knowledgebase/${projId}/${deployed[0].path}`, { replace: true });
        }
      } catch (err) {
        console.error('Failed to fetch deployed docs:', err);
      }
    };

    fetchDeployedDocs();
  }, [projId, accessToken]);

  // Expand parent nodes when a document is selected
  useEffect(() => {
    if (selected && docs.length > 0) {
      const map = Object.fromEntries(docs.map((doc) => [doc._id, doc]));
      const expanded = {};

      const expandParents = (id) => {
        const node = map[id];
        if (node?.ref) {
          expanded[node.ref] = true;
          expandParents(node.ref);
        }
      };

      expandParents(selected._id);
      setExpandedNodes((prev) => ({ ...prev, ...expanded }));
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
          <div
            onClick={() => {
              if (hasChildren && isSelected) {
                toggleNode(node._id);
              } else {
                setSelected(node);
                navigate(`/project/knowledgebase/${projId}/${node.path === '/' ? '' : node.path}`, { replace: true });
                if (window.innerWidth < 768) setSidebarOpen(false);
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 my-1 rounded-xl cursor-pointer transition-all duration-200 text-sm font-medium truncate ${
              isSelected ? 'bg-violet-100 shadow-inner-neu' : 'hover:bg-violet-50'
            }`}
            style={{
              paddingLeft: `${level * 20 + 12}px`,
              boxShadow: isSelected
                ? 'inset 2px 2px 4px #f0f4ff, inset -2px -2px 4px #ffffff'
                : '3px 3px 6px #e0e7ff, -3px -3px 6px #ffffff',
            }}
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

          {level > 0 && (
            <div
              className="absolute top-0 left-3 bottom-0 w-px bg-gradient-to-b from-transparent via-violet-200 to-transparent"
              style={{ marginLeft: `${level * 20 + 12}px`, height: '100%' }}
            />
          )}

          {hasChildren && isExpanded && (
            <div className="ml-2 border-l-2 border-violet-200 pl-2 mt-1">
              {renderSidebarTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });

  return (
    <div className="flex h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 font-[Quicksand] overflow-hidden">
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-18 left-2 z-50 p-2 bg-violet-50 rounded-full"
        style={{
          boxShadow: '4px 4px 8px #e0e7ff, -4px -4px 8px #ffffff',
        }}
        aria-label="Toggle sidebar"
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
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:w-72
        `}
        style={{
          boxShadow: 'inset 4px 4px 8px #f0f4ff, inset -4px -4px 8px #ffffff',
          borderRadius: '0 1.5rem 1.5rem 0',
        }}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-violet-600 hover:text-violet-800"
        >
          ✕
        </button>

        {/* Header */}
        <h2
          className="text-2xl font-bold mb-6 text-center text-violet-900"
          style={{ fontFamily: 'Kaushan Script, cursive' }}
        >
          {proj.title || 'Knowledge Base'}
        </h2>

        {/* Sidebar Tree */}
        <nav className="space-y-1">
          {docs.length > 0 ? renderSidebarTree(buildTree(docs)) : (
            <p className="text-sm text-gray-500 px-3">No documents available.</p>
          )}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-violet-100 rounded-t-3xl md:rounded-none">
        {selected ? (
          <div
            className="max-w-5xl mx-auto p-8 bg-violet-50 rounded-3xl min-h-96"
            style={{
              boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
            }}
            dangerouslySetInnerHTML={{ __html: selected.deploy }}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-violet-600 italic">
            👈 Select a document to read
          </div>
        )}
      </main>
    </div>
  );
};

export default KnowledgeBase;
