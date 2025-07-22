import React, { useEffect, useState, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import api from '../../utils/Axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../utils/Providers';
import { convertToJsxString, tools } from '../../utils/EditorTools';
import { toast } from 'react-toastify';

const MAX_LEVEL = 7;

const DocEditor = () => {
  const { projId } = useParams();
  const { accessToken } = useUser();
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [unsaved, setUnsaved] = useState(new Set());
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, doc: null });
  const [previewMode, setPreviewMode] = useState(false);
  const [livePreview, setLivePreview] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const editorRef = useRef(null);
  const navigate = useNavigate();

  const fetchDocs = async () => {
    try {
      const res = await api.get(`/docs?projId=${projId}`, { headers: { 'x-access-token': accessToken } });
      setDocs(res.data.docs);
      const defaultDoc = res.data.docs.find(d => d.builtIn) || res.data.docs[0] || null;
      setSelected(defaultDoc);
    } catch (err) {
      console.error('Fetch docs failed', err);
    }
  };

  useEffect(() => {
    fetchDocs();
    return () => editorRef.current?.destroy?.();
  }, [projId]);

  useEffect(() => {
    if (!selected || previewMode) return;
    let canceled = false;
    async function init() {
      editorRef.current?.destroy?.();
      let data = {};
      try {
        data = typeof selected.content === 'string' ? JSON.parse(selected.content) : selected.content || {};
      } catch (e) {
        console.warn('Invalid JSON content; starting empty editor', e);
      }
      if (canceled) return;
      editorRef.current = new EditorJS({
        holder: 'editorjs',
        data,
        tools,
        autofocus: true,
        logLevel: 'ERROR',
        onChange: () => setUnsaved(prev => new Set(prev).add(selected._id)),
      });
    }
    init();
    return () => {
      canceled = true;
      editorRef.current?.destroy?.();
    };
  }, [selected, previewMode]);

  const isDuplicate = (title, path, refId, excludeId = null) =>
    docs.some(d => d.ref === refId && d._id !== excludeId && (d.title === title || d.path === path));

  const handleSave = async () => {
    if (!selected || !editorRef.current) return;
    if (isDuplicate(selected.title, selected.path, selected.ref || null, selected._id)) {
      return toast.warn('Duplicate title or path at this level');
    }
    try {
      const output = await editorRef.current.save();
      await api.put(`/docs/${selected._id}`, { title: selected.title, path: selected.path, content: output }, {
        headers: { 'x-access-token': accessToken }
      });
      setUnsaved(prev => {
        const s = new Set(prev);
        s.delete(selected._id);
        return s;
      });
      setDocs(docs.map(d => (d._id === selected._id ? { ...d, content: output } : d)));
      toast.success('Knowledge page saved successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    }
  };

  const handleDeploy = async () => {
    if (!selected || !editorRef.current) return;
    if (isDuplicate(selected.title, selected.path, selected.ref || null, selected._id)) {
      return toast.warn('Duplicate title or path at this level');
    }
    try {
      const output = await editorRef.current.save();
      const jsxString = convertToJsxString(output.blocks);
      await api.put(`/docs/${selected._id}`, {
        title: selected.title,
        path: selected.path,
        content: output,
        deploy: jsxString
      }, { headers: { 'x-access-token': accessToken } });
      setUnsaved(prev => {
        const s = new Set(prev);
        s.delete(selected._id);
        return s;
      });
      setDocs(docs.map(d => (d._id === selected._id ? { ...d, content: output, deploy: jsxString } : d)));
      toast.success('Knowledge page deployed successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Deploy failed');
    }
  };

  const handleDelete = async id => {
    const doc = docs.find(d => d._id === id);
    if (doc?.builtIn) return alert('Cannot delete built-in page');
    try {
      await api.delete(`/docs/${id}`, { headers: { 'x-access-token': accessToken } });
      await fetchDocs();
      toast.success('Knowledge page deleted successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  const createPage = async (ref = null) => {
    const title = prompt('Page title?');
    const path = prompt('Page path?');
    if (!title || !path) return alert('Title and path required');
    if (isDuplicate(title, path, ref)) return alert('Duplicate at this level');
    if (ref && getLevel(docs.find(d => d._id === ref)) >= MAX_LEVEL) {
      return toast.warn(`Max nesting level ${MAX_LEVEL} reached.`);
    }
    try {
      await api.post('/docs', { projId, title, path, ref }, {
        headers: { 'x-access-token': accessToken }
      });
      await fetchDocs();
      toast.success('Knowledge page created successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Create failed');
    }
  };

  const getLevel = doc => {
    const map = Object.fromEntries(docs.map(d => [d._id, d]));
    let lvl = 1;
    while (doc?.ref && map[doc.ref]) {
      doc = map[doc.ref];
      lvl++;
      if (lvl > MAX_LEVEL) break;
    }
    return lvl;
  };

  const buildTree = items => {
    const map = {};
    const roots = [];
    items.forEach(i => (map[i._id] = { ...i, children: [] }));
    items.forEach(i => {
      if (i.ref && map[i.ref]) map[i.ref].children.push(map[i._id]);
      else roots.push(map[i._id]);
    });
    return roots;
  };

  const renderSidebar = (nodes, lvl = 0) =>
    nodes.map(n => (
      <div key={n._id}>
        <div
          onClick={() => { setPreviewMode(false); setSelected(n); setSidebarOpen(false); }}
          onContextMenu={e => {
            e.preventDefault();
            setContextMenu({ visible: true, x: e.pageX, y: e.pageY, doc: n });
          }}
          className={`p-3 flex justify-between cursor-pointer transition-all duration-200 rounded-lg mb-2 ${
            selected?._id === n._id
              ? 'bg-violet-200 dark:bg-violet-800 shadow-inner'
              : 'shadow-neu-flat hover:shadow-neu-pressed dark:bg-violet-900/30'
          }`}
          style={{ paddingLeft: `${lvl * 20 + 12}px` }}
        >
          <span className={`text-sm font-medium font-mono ${unsaved.has(n._id) ? 'text-red-500' : 'text-violet-800 dark:text-violet-300'}`}>
            {lvl > 0 ? '|__ ' : ''}{n.title}
          </span>
          {!n.builtIn && (
            <button
              onClick={e => { e.stopPropagation(); handleDelete(n._id); }}
              className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              ❌
            </button>
          )}
        </div>
        {n.children?.length > 0 && renderSidebar(n.children, lvl + 1)}
      </div>
    ));

  const renderContextMenu = () => {
    if (!contextMenu.visible || !contextMenu.doc) return null;
    const { x, y, doc } = contextMenu;
    return (
      <div
        style={{ top: y, left: x }}
        className="absolute z-50 bg-violet-50 dark:bg-violet-900 shadow-neu-raised rounded-xl py-2 w-48 border border-violet-200 dark:border-violet-700 backdrop-blur-sm"
        onClick={() => setContextMenu({ visible: false, x: 0, y: 0, doc: null })}
      >
        <button
          onClick={() => createPage(null)}
          className="w-full px-4 py-2 hover:bg-violet-100 dark:hover:bg-violet-800 transition-colors text-violet-800 dark:text-violet-300 text-left font-mono"
        >
          ➕ New Page
        </button>
        <button
          onClick={() => createPage(doc._id)}
          className="w-full px-4 py-2 hover:bg-violet-100 dark:hover:bg-violet-800 transition-colors text-violet-800 dark:text-violet-300 text-left font-mono disabled:opacity-50"
          disabled={getLevel(doc) >= MAX_LEVEL}
        >
          📁 Sub Page
        </button>
        {!doc.builtIn && (
          <button
            onClick={() => handleDelete(doc._id)}
            className="w-full px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-left font-mono"
          >
            ❌ Delete
          </button>
        )}
      </div>
    );
  };

  useEffect(() => {
    const close = () => setContextMenu({ visible: false, x: 0, y: 0, doc: null });
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  return (
    <div className={`flex h-screen bg-violet-50 dark:bg-violet-950 text-violet-900 dark:text-violet-100 transition-colors ${darkMode ? 'dark' : ''}`}>
       <>
    {/* Hamburger button - visible only on mobile */}
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="lg:hidden relative top-4 left-4 z-50 p-2 bg-violet-200 dark:bg-violet-800 rounded-lg shadow-neu-flat hover:shadow-neu-pressed transition-all duration-200"
      aria-label="Toggle sidebar menu"
    >
      <svg
        className="w-6 h-6 text-violet-800 dark:text-violet-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    {/* Sidebar */}
    <aside
      className={`
        fixed top-0 left-0 z-40 h-full w-64 bg-violet-100 p-6 pt-16 shadow-neu-inset border-r border-violet-300
        dark:bg-violet-900 dark:border-violet-800
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:transform-none
      `}
      aria-label="Sidebar navigation"
    >
      {/* Close button - mobile only */}
      <button
        onClick={() => setSidebarOpen(false)}
        className="lg:hidden absolute right-4 top-4 p-2 text-violet-600 hover:text-violet-800 dark:text-violet-400"
        aria-label="Close sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Sidebar content */}
      <button
        onClick={() => createPage()}
        className="mb-6 w-full rounded-lg bg-violet-200 px-4 py-3 font-mono font-medium shadow-neu-flat text-violet-800 transition-all duration-200 hover:shadow-neu-pressed dark:bg-violet-800 dark:text-violet-200"
      >
        + New Page
      </button>

      <nav className="flex-grow overflow-y-auto space-y-1">
        {renderSidebar(buildTree(docs))}
      </nav>

      <button
        onClick={() => navigate(`/project/KnowledgeBase/${projId}/settings`)}
        className="mt-4 rounded-lg bg-violet-200 px-4 py-3 font-mono font-medium shadow-neu-flat text-violet-800 transition-all duration-200 hover:shadow-neu-pressed dark:bg-violet-800 dark:text-violet-200"
      >
        ⚙️ Settings
      </button>
    </aside>

    {/* Overlay for mobile */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
    )}
  </>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-6 overflow-auto relative">
        {selected ? (
          <div className="max-w-full">
            {/* Header Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 p-4 bg-violet-50 dark:bg-violet-800/30 rounded-xl shadow-neu-inset">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <input
                  value={selected.path}
                  disabled={previewMode}
                  onChange={e => setSelected({ ...selected, path: e.target.value })}
                  onBlur={() => isDuplicate(selected.title, selected.path, selected.ref || null, selected._id) && fetchDocs()}
                  className="flex-1 px-4 py-2 bg-violet-100 dark:bg-violet-900 border border-violet-200 dark:border-violet-700 rounded-lg shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-violet-400 text-violet-800 dark:text-violet-200 placeholder-violet-400 font-mono"
                  placeholder="Path"
                />
                <input
                  value={selected.title}
                  disabled={previewMode}
                  onChange={e => setSelected({ ...selected, title: e.target.value })}
                  onBlur={() => isDuplicate(selected.title, selected.path, selected.ref || null, selected._id) && fetchDocs()}
                  className="flex-1 px-4 py-2 bg-violet-100 dark:bg-violet-900 border border-violet-200 dark:border-violet-700 rounded-lg shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-violet-400 text-violet-800 dark:text-violet-200 placeholder-violet-400 font-mono"
                  placeholder="Title"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSave}
                  disabled={previewMode}
                  className="px-4 py-2 bg-green-400 dark:bg-green-600 text-white rounded-lg shadow-neu-flat hover:shadow-neu-pressed transition-all duration-200 disabled:opacity-50 font-medium font-mono"
                >
                  Save
                </button>
                <button
                  onClick={handleDeploy}
                  disabled={previewMode}
                  className="px-4 py-2 bg-blue-400 dark:bg-blue-600 text-white rounded-lg shadow-neu-flat hover:shadow-neu-pressed transition-all duration-200 disabled:opacity-50 font-medium font-mono"
                >
                  Deploy
                </button>
                <button
                  onClick={async () => {
                    if (!previewMode && editorRef.current) {
                      try {
                        const output = await editorRef.current.save();
                        const jsx = convertToJsxString(output.blocks);
                        setLivePreview(jsx);
                        setPreviewMode(true);
                      } catch (e) {
                        alert('Error generating live preview');
                      }
                    } else {
                      setPreviewMode(false);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-white font-medium shadow-neu-flat hover:shadow-neu-pressed transition-all duration-200 font-mono ${
                    previewMode ? 'bg-red-400 dark:bg-red-600' : 'bg-purple-400 dark:bg-purple-600'
                  }`}
                >
                  {previewMode ? 'Close Preview' : 'Preview'}
                </button>
              </div>
            </div>

            {/* Editor/Preview Area */}
            {previewMode ? (
              <div className="bg-violet-50 dark:bg-violet-800/30 shadow-neu-inset rounded-xl p-6 min-h-96 overflow-auto font-mono">
                {livePreview ? (
                  <div dangerouslySetInnerHTML={{ __html: livePreview }} />
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-violet-600 dark:text-violet-400 font-medium">Generating preview...</div>
                  </div>
                )}
              </div>
            ) : (
              <div id="editorjs" key={selected._id} className="bg-violet-50 dark:bg-violet-800/30 shadow-neu-inset rounded-xl p-6 min-h-96" />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-violet-600 dark:text-violet-400 font-medium text-lg">No document selected.</div>
          </div>
        )}
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-6 right-6 p-3 bg-violet-200 dark:bg-violet-800 text-violet-800 dark:text-violet-200 rounded-full shadow-lg hover:shadow-xl transition"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {renderContextMenu()}
    </div>
  );
};

export default DocEditor;