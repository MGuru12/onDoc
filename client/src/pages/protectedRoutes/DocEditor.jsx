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
  const [proj, setProj] = useState({});
  const editorRef = useRef(null);
  const navigate = useNavigate();

  const fetchDocs = async () => {
    try {
      const res = await api.get(`/docs?projId=${projId}`, {
        headers: { 'x-access-token': accessToken },
      });
      setDocs(res.data.docs);
      setProj(res.data.proj[0]);
      const defaultDoc = res.data.docs.find((d) => d.builtIn) || res.data.docs[0] || null;
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
        onChange: () => setUnsaved((prev) => new Set(prev).add(selected._id)),
      });
    }
    init();
    return () => {
      canceled = true;
      editorRef.current?.destroy?.();
    };
  }, [selected, previewMode]);

  const isDuplicate = (title, path, refId, excludeId = null) =>
    docs.some((d) => d.ref === refId && d._id !== excludeId && (d.title === title || d.path === path));

  const handleSave = async () => {
    if (!selected || !editorRef.current) return;
    if (isDuplicate(selected.title, selected.path, selected.ref || null, selected._id)) {
      return toast.warn('Duplicate title or path at this level');
    }
    try {
      const output = await editorRef.current.save();
      await api.put(
        `/docs/${selected._id}`,
        { title: selected.title, path: selected.path, content: output },
        {
          headers: { 'x-access-token': accessToken },
        }
      );
      setUnsaved((prev) => {
        const s = new Set(prev);
        s.delete(selected._id);
        return s;
      });
      setDocs(docs.map((d) => (d._id === selected._id ? { ...d, content: output } : d)));
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
      await api.put(
        `/docs/${selected._id}`,
        {
          title: selected.title,
          path: selected.path,
          content: output,
          deploy: jsxString,
        },
        { headers: { 'x-access-token': accessToken } }
      );
      setUnsaved((prev) => {
        const s = new Set(prev);
        s.delete(selected._id);
        return s;
      });
      setDocs(docs.map((d) => (d._id === selected._id ? { ...d, content: output, deploy: jsxString } : d)));
      toast.success('Knowledge page deployed successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Deploy failed');
    }
  };

  const handleDelete = async (id) => {
    const doc = docs.find((d) => d._id === id);
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
    if (ref && getLevel(docs.find((d) => d._id === ref)) >= MAX_LEVEL) {
      return toast.warn(`Max nesting level ${MAX_LEVEL} reached.`);
    }
    try {
      await api.post(
        '/docs',
        { projId, title, path, ref },
        {
          headers: { 'x-access-token': accessToken },
        }
      );
      await fetchDocs();
      toast.success('Knowledge page created successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Create failed');
    }
  };

  const getLevel = (doc) => {
    const map = Object.fromEntries(docs.map((d) => [d._id, d]));
    let lvl = 1;
    while (doc?.ref && map[doc.ref]) {
      doc = map[doc.ref];
      lvl++;
      if (lvl > MAX_LEVEL) break;
    }
    return lvl;
  };

  const buildTree = (items) => {
    const map = {};
    const roots = [];
    items.forEach((i) => (map[i._id] = { ...i, children: [] }));
    items.forEach((i) => {
      if (i.ref && map[i.ref]) map[i.ref].children.push(map[i._id]);
      else roots.push(map[i._id]);
    });
    return roots;
  };

  const renderSidebar = (nodes, lvl = 0) =>
    nodes.map((n) => (
      <div key={n._id}>
        <div
          onClick={() => {
            setPreviewMode(false);
            setSelected(n);
            setSidebarOpen(false);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({ visible: true, x: e.pageX, y: e.pageY, doc: n });
          }}
          className={`p-3 flex justify-between cursor-pointer transition-all duration-200 rounded-xl mb-2 text-sm font-medium ${
            selected?._id === n._id
              ? 'bg-violet-100 shadow-inner-neu'
              : 'hover:bg-violet-50'
          }`}
          style={{
            paddingLeft: `${lvl * 20 + 12}px`,
            boxShadow: selected?._id === n._id
              ? 'inset 2px 2px 4px #f0f4ff, inset -2px -2px 4px #ffffff'
              : '3px 3px 6px #e0e7ff, -3px -3px 6px #ffffff',
          }}
        >
          <span className={`font-mono ${unsaved.has(n._id) ? 'text-red-500' : 'text-violet-800'}`}>
            {lvl > 0 ? '|__ ' : ''}{n.title}
          </span>
          {!n.builtIn && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(n._id);
              }}
              className="text-red-400 hover:text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ❌
            </button>
          )}
        </div>
        {n.children?.length > 0 && (
          <div className="ml-2 border-l-2 border-violet-200 pl-2 mt-1">
            {renderSidebar(n.children, lvl + 1)}
          </div>
        )}
      </div>
    ));

  const renderContextMenu = () => {
    if (!contextMenu.visible || !contextMenu.doc) return null;
    const { x, y, doc } = contextMenu;
    return (
      <div
        style={{ top: y, left: x }}
        className="absolute z-50 bg-violet-50 rounded-2xl py-2 w-48 border border-violet-200"
        onClick={() => setContextMenu({ visible: false, x: 0, y: 0, doc: null })}
        onMouseLeave={() => setContextMenu({ visible: false, x: 0, y: 0, doc: null })}
      >
        <button
          onClick={() => createPage(null)}
          className="w-full px-4 py-2 text-left font-mono text-violet-800 hover:bg-violet-100 rounded-lg transition-colors"
        >
          ➕ New Page
        </button>
        <button
          onClick={() => createPage(doc._id)}
          disabled={getLevel(doc) >= MAX_LEVEL}
          className="w-full px-4 py-2 text-left font-mono text-violet-800 hover:bg-violet-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📁 Sub Page
        </button>
        {!doc.builtIn && (
          <button
            onClick={() => handleDelete(doc._id)}
            className="w-full px-4 py-2 text-left font-mono text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
    <div className="flex h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 font-[Quicksand] overflow-hidden">
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-violet-50 rounded-full"
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
        {/* Close Button (Mobile Only) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-violet-600 hover:text-violet-800"
        >
          ✕
        </button>

        {/* Header */}
        <h2
          className="text-2xl font-bold mb-6 text-center text-violet-900 lg:block"
          style={{ fontFamily: 'Kaushan Script, cursive' }}
        >
          {proj.title}
        </h2>

        {/* New Page Button */}
        <button
          onClick={() => createPage()}
          className="w-full py-3 mb-6 bg-violet-100 text-violet-800 font-medium rounded-2xl transition-all duration-300 active:scale-[0.98]"
          style={{
            boxShadow: '4px 4px 8px #e0e7ff, -4px -4px 8px #ffffff',
          }}
        >
          + New Page
        </button>

        {/* Navigation Tree */}
        <nav className="space-y-1">{renderSidebar(buildTree(docs))}</nav>

        {/* Settings Button */}
        <button
          onClick={() => navigate(`/project/KnowledgeBase/${projId}/settings`)}
          className="mt-6 w-full py-3 bg-violet-100 text-violet-800 font-medium rounded-2xl transition-all duration-300 active:scale-[0.98]"
          style={{
            boxShadow: '4px 4px 8px #e0e7ff, -4px -4px 8px #ffffff',
          }}
        >
          ⚙️ Settings
        </button>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-violet-100 rounded-t-3xl md:rounded-none">
        {selected ? (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Control Bar */}
            <div
              className="p-5 bg-violet-50 rounded-3xl space-y-4"
              style={{
                boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
              }}
            >
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <input
                  type="text"
                  value={selected.path}
                  disabled={previewMode}
                  onChange={(e) => setSelected({ ...selected, path: e.target.value })}
                  onBlur={() =>
                    isDuplicate(selected.title, selected.path, selected.ref || null, selected._id) &&
                    fetchDocs()
                  }
                  placeholder="Path"
                  className="px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none font-mono"
                  style={{
                    boxShadow: 'inset 3px 3px 6px #f0f4ff, inset -3px -3px 6px #ffffff',
                  }}
                />
                <input
                  type="text"
                  value={selected.title}
                  disabled={previewMode}
                  onChange={(e) => setSelected({ ...selected, title: e.target.value })}
                  onBlur={() =>
                    isDuplicate(selected.title, selected.path, selected.ref || null, selected._id) &&
                    fetchDocs()
                  }
                  placeholder="Title"
                  className="px-5 py-3 bg-violet-100 border-none rounded-2xl text-violet-900 placeholder-violet-500 focus:outline-none font-mono"
                  style={{
                    boxShadow: 'inset 3px 3px 6px #f0f4ff, inset -3px -3px 6px #ffffff',
                  }}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={previewMode}
                    className="flex-1 py-3 bg-green-50 text-green-700 font-medium rounded-2xl transition-all active:scale-[0.98]"
                    style={{
                      boxShadow: '4px 4px 8px #dcfce7, -4px -4px 8px #ffffff',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleDeploy}
                    disabled={previewMode}
                    className="flex-1 py-3 bg-blue-50 text-blue-700 font-medium rounded-2xl transition-all active:scale-[0.98]"
                    style={{
                      boxShadow: '4px 4px 8px #dbeafe, -4px -4px 8px #ffffff',
                    }}
                  >
                    Deploy
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
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
                  className="px-6 py-2 bg-purple-100 text-purple-800 font-medium rounded-2xl transition-all active:scale-[0.98]"
                  style={{
                    boxShadow: '4px 4px 8px #ede9fe, -4px -4px 8px #ffffff',
                  }}
                >
                  {previewMode ? 'Close Preview' : 'Preview'}
                </button>
              </div>
            </div>

            {/* Editor or Preview */}
            {previewMode ? (
              <div
                className="p-8 bg-violet-50 rounded-3xl min-h-96"
                style={{
                  boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
                }}
                dangerouslySetInnerHTML={{ __html: livePreview }}
              />
            ) : (
              <div
                id="editorjs"
                key={selected._id}
                className="p-8 bg-violet-50 rounded-3xl min-h-96"
                style={{
                  boxShadow: 'inset 4px 4px 8px #f0f4ff, inset -4px -4px 8px #ffffff',
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-violet-600 italic">
            👈 Select a document to edit
          </div>
        )}
      </main>

      {/* Context Menu */}
      {renderContextMenu()}
    </div>
  );
};

export default DocEditor;