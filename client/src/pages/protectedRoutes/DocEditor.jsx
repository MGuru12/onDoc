import React, { useEffect, useState, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import api from '../../utils/Axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../utils/Providers';
import { convertToJsxString, tools } from '../../utils/EditorTools';

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
  const editorRef = useRef(null);
  const navigate = useNavigate();


  const fetchDocs = async () => {
    try {
      const res = await api.get(`/docs?projId=${projId}`, { headers: { 'x-access-token': accessToken } });
      setDocs(res.data.docs);
      const defaultDoc =
        (selected && res.data.docs.find(d => d._id === selected._id)) ||
        res.data.docs.find(d => d.builtIn) ||
        res.data.docs[0] ||
        null;
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
        data = typeof selected.content === 'string'
          ? JSON.parse(selected.content)
          : selected.content || {};
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
      return alert('Duplicate title or path at this level');
    }
    try {
      const output = await editorRef.current.save();
      await api.put(`/docs/${selected._id}`, { title: selected.title, path: selected.path, content: output }, 
        { headers: { 'x-access-token': accessToken } });
      setUnsaved(prev => { const s = new Set(prev); s.delete(selected._id); return s; });
      setDocs(docs.map(d => d._id === selected._id ? { ...d, content: output } : d));
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    }
  };

  const handleDeploy = async () => {
    if (!selected || !editorRef.current) return;
    if (isDuplicate(selected.title, selected.path, selected.ref || null, selected._id)) {
      return alert('Duplicate title or path at this level');
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
      setUnsaved(prev => { const s = new Set(prev); s.delete(selected._id); return s; });
      setDocs(docs.map(d =>
        d._id === selected._id ? { ...d, content: output, deploy: jsxString } : d
      ));
    } catch (err) {
      alert(err?.response?.data?.message || 'Deploy failed');
    }
  };

  const handleDelete = async id => {
    const doc = docs.find(d => d._id === id);
    if (doc?.builtIn) return alert('Cannot delete built-in page');
    try {
      await api.delete(`/docs/${id}`, { headers: { 'x-access-token': accessToken } });
      await fetchDocs();
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed');
    }
  };

  const createPage = async (ref = null) => {
    const title = prompt('Page title?');
    const path = prompt('Page path?');
    if (!title || !path) return alert('Title and path required');
    if (isDuplicate(title, path, ref)) return alert('Duplicate at this level');
    if (ref && getLevel(docs.find(d => d._id === ref)) >= MAX_LEVEL) {
      return alert(`Max nesting level ${MAX_LEVEL} reached.`);
    }
    try {
      await api.post('/docs', { projId, title, path, ref }, {
        headers: { 'x-access-token': accessToken }
      });
      await fetchDocs();
    } catch (err) {
      alert(err?.response?.data?.message || 'Create failed');
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
          onClick={() => { setPreviewMode(false); setSelected(n); }}
          onContextMenu={e => {
            e.preventDefault();
            setContextMenu({ visible: true, x: e.pageX, y: e.pageY, doc: n });
          }}
          className={`p-2 flex justify-between cursor-pointer ${selected?._id === n._id ? 'bg-gray-200' : ''}`}
          style={{ paddingLeft: `${lvl * 20}px` }}
        >
          <span className={unsaved.has(n._id) ? 'text-red-500' : ''}>
            {lvl > 0 ? '|__ ' : ''}{n.title}
          </span>
          {!n.builtIn && (
            <button onClick={e => { e.stopPropagation(); handleDelete(n._id); }} className="text-red-500">❌</button>
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
        className="absolute z-50 bg-white shadow rounded py-1 w-48"
        onClick={() => setContextMenu({ visible: false, x: 0, y: 0, doc: null })}
      >
        <button onClick={() => createPage(null)} className="w-full px-4 py-2 hover:bg-gray-100">
          ➕ New Page
        </button>
        <button
          onClick={() => createPage(doc._id)}
          className="w-full px-4 py-2 hover:bg-gray-100"
          disabled={getLevel(doc) >= MAX_LEVEL}
        >
          📁 Sub Page
        </button>
        {!doc.builtIn && (
          <button
            onClick={() => handleDelete(doc._id)}
            className="w-full px-4 py-2 text-red-500 hover:bg-gray-100"
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
    <div className="flex h-screen relative">
      <div className="w-64 bg-gray-100 border-r p-4 overflow-auto">
        <button onClick={() => createPage()} className="mb-4 text-blue-500">+ New Page</button>
        {renderSidebar(buildTree(docs))}
        <button
          onClick={() => navigate(`/project/KnowledgeBase/${projId}/Settings`)}
          className="absolute bottom-4 left-4 bg-violet-200 text-violet-900 px-3 py-1 rounded-md shadow hover:bg-violet-300"
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {selected ? (
          <>
            <div className="flex gap-4 mb-4">
              <input
                value={selected.path}
                disabled={previewMode}
                onChange={e => setSelected({ ...selected, path: e.target.value })}
                onBlur={() => isDuplicate(selected.title, selected.path, selected.ref || null, selected._id) && fetchDocs()}
                className="border px-2 py-1"
                placeholder="Path"
              />
              <input
                value={selected.title}
                disabled={previewMode}
                onChange={e => setSelected({ ...selected, title: e.target.value })}
                onBlur={() => isDuplicate(selected.title, selected.path, selected.ref || null, selected._id) && fetchDocs()}
                className="border px-2 py-1"
                placeholder="Title"
              />
              <button onClick={handleSave} disabled={previewMode} className="bg-green-500 text-white px-4 py-1 rounded">
                Save
              </button>
              <button onClick={handleDeploy} disabled={previewMode} className="bg-blue-600 text-white px-4 py-1 rounded">
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
                className={`px-4 py-1 rounded text-white ${previewMode ? 'bg-red-600' : 'bg-purple-600'}`}
              >
                {previewMode ? 'Close Preview' : 'Preview'}
              </button>
            </div>

            {previewMode ? (
              <div className="bg-white shadow rounded p-4 min-h-[400px] overflow-auto">
                {livePreview ? (
                  <div dangerouslySetInnerHTML={{ __html: livePreview }} />
                ) : (
                  <p>Generating preview...</p>
                )}
              </div>
            ) : (
              <div id="editorjs" key={selected._id} className="bg-white shadow rounded p-4 min-h-[400px]" />
            )}
          </>
        ) : (
          <p>No document selected.</p>
        )}
      </div>

      {renderContextMenu()}
    </div>
  );
};

export default DocEditor;
