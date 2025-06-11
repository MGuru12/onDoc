import React, { useEffect, useState, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import api from '../../utils/Axios';
import { useParams } from 'react-router-dom';
import { useUser } from '../../utils/Providers';
import { convertToJsxString, tools } from '../../utils/EditorTools';

const MAX_LEVEL = 7;

const DocEditor = () => {
  const { projId } = useParams();
  const { accessToken } = useUser();
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [unsaved, setUnsaved] = useState(new Set());
  const editorRef = useRef(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, doc: null });
  const [deployMode, setDeployMode] = useState(false);
  const [deployContent, setDeployContent] = useState('');

  const fetchDocs = async () => {
    try {
      const res = await api.get(`/docs?projId=${projId}`, {
        headers: { 'x-access-token': accessToken },
      });
      setDocs(res.data);
      setSelected(prevSelected => {
        const stillExists = res.data.find(d => d._id === prevSelected?._id);
        return stillExists || res.data.find(d => d.builtIn) || res.data[0] || null;
      });
    } catch (err) {
      console.error('Failed to fetch docs:', err);
    }
  };

  useEffect(() => {
    fetchDocs();
    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [projId]);

  useEffect(() => {
    if (!selected) return;

    let isCancelled = false;

    const initEditor = async () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        await editorRef.current.destroy();
        editorRef.current = null;
      }

      if (isCancelled) return;

      let data = {};
      try {
        data =
          typeof selected.content === 'string' && selected.content.trim()
            ? JSON.parse(selected.content)
            : typeof selected.content === 'object' && selected.content !== null
            ? selected.content
            : {};
      } catch (e) {
        console.warn('Failed to parse editor content JSON:', e);
        data = {};
      }

      const editor = new EditorJS({
        holder: 'editorjs',
        data,
        onChange: () => {
          setUnsaved(prev => new Set(prev).add(selected._id));
        },
        autofocus: true,
        logLevel: 'ERROR',
        tools,
      });

      editorRef.current = editor;
    };

    if (!deployMode) {
      initEditor();
    } else {
      // If deploy mode ON, destroy editor so no conflict
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    }

    return () => {
      isCancelled = true;
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [selected, deployMode]);

  const isDuplicateAtLevel = (title, path, refId, excludeId = null) => {
    return docs.some(
      d =>
        d.ref === refId &&
        d._id !== excludeId &&
        (d.title === title || d.path === path)
    );
  };

  const handleSave = async () => {
    if (!selected || !editorRef.current) return;

    if (isDuplicateAtLevel(selected.title, selected.path, selected.ref || null, selected._id)) {
      return alert('Duplicate title or path exists in the same level');
    }

    try {
      const output = await editorRef.current.save();
      // const contentStr = JSON.stringify(output);
      let html = edjsParser.parse(editorjs_clean_data);
      console.log(html);
      
      await api.put(
        `/docs/${selected._id}`,
        {
          title: selected.title,
          path: selected.path,
          content: output,
        },
        { headers: { 'x-access-token': accessToken } }
      );

      setUnsaved(prev => {
        const newSet = new Set(prev);
        newSet.delete(selected._id);
        return newSet;
      });

      setDocs(prevDocs =>
        prevDocs.map(doc =>
          doc._id === selected._id
            ? { ...doc, content: output, title: selected.title, path: selected.path }
            : doc
        )
      );

      setSelected(prev => ({ ...prev, content: output }));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save document');
    }
  };

  // ... handleDelete, handleCreateNewPage, handleCreateSubPage, handleContextMenu, etc remain unchanged
  // For brevity, I'll omit them here, but your existing code stays the same

  // --- Deploy: Convert EditorJS JSON blocks to HTML ---
  const renderBlocksToHTML = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return null;

    return blocks.map((block, i) => {
      const { type, data } = block;

      switch (type) {
        case 'header':
          return React.createElement(
            `h${data.level || 2}`,
            { key: i },
            data.text
          );
        case 'paragraph':
          return <p key={i} dangerouslySetInnerHTML={{ __html: data.text }} />;
        case 'list':
          if (data.style === 'ordered') {
            return (
              <ol key={i}>
                {data.items.map((item, idx) => (
                  <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ol>
            );
          }
          return (
            <ul key={i}>
              {data.items.map((item, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          );
        case 'code':
          return (
            <pre key={i}>
              <code>{data.code}</code>
            </pre>
          );
        case 'image':
          return (
            <figure key={i}>
              <img src={data.file.url} alt={data.caption || 'Image'} />
              {data.caption && <figcaption>{data.caption}</figcaption>}
            </figure>
          );
        case 'quote':
          return (
            <blockquote key={i}>
              <p>{data.text}</p>
              {data.caption && <cite>{data.caption}</cite>}
            </blockquote>
          );
        // Add more EditorJS block types here if you use them

        default:
          return <p key={i}>Unsupported block type: {type}</p>;
      }
    });
  };

  const handleDeploy = async () => {
    
    if (!selected || !editorRef.current) return;

    if (isDuplicateAtLevel(selected.title, selected.path, selected.ref || null, selected._id)) {
      return alert('Duplicate title or path exists in the same level');
    }

    try {
      const output = await editorRef.current.save();
      // const contentStr = JSON.stringify(output);
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

      setUnsaved(prev => {
        const newSet = new Set(prev);
        newSet.delete(selected._id);
        return newSet;
      });

      setDocs(prevDocs =>
        prevDocs.map(doc =>
          doc._id === selected._id
            ? { ...doc, content: output, title: selected.title, path: selected.path }
            : doc
        )
      );

      setSelected(prev => ({ ...prev, content: output }));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save document');
    }
};


  // Build tree and renderSidebarTree remain unchanged from your original code

  // For brevity, I'll copy-paste those parts unchanged here

  const handleDelete = async (docId) => {
    const doc = docs.find((d) => d._id === docId);
    if (doc?.builtIn) return alert('Cannot delete root page');

    try {
      await api.delete(`/docs/${docId}`, {
        headers: { 'x-access-token': accessToken },
      });
      await fetchDocs();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleCreateNewPage = async () => {
    const title = prompt('Enter new page title');
    const path = prompt('Enter path for this page');
    if (!title || !path) return alert('Title and path are required');

    if (isDuplicateAtLevel(title, path, null)) {
      return alert('Duplicate title or path exists in the same level');
    }

    try {
      await api.post(
        '/docs',
        {
          projId,
          title,
          path,
          ref: null,
        },
        {
          headers: { 'x-access-token': accessToken },
        }
      );
      await fetchDocs();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create page');
    }
  };

  const getLevel = (doc, map) => {
    let level = 1;
    let current = doc;
    while (current.ref) {
      current = map[current.ref];
      if (!current) break;
      level++;
      if (level > MAX_LEVEL) break;
    }
    return level;
  };

  const handleCreateSubPage = async (parentDoc) => {
    const map = {};
    docs.forEach((d) => {
      map[d._id] = d;
    });

    const parentLevel = getLevel(parentDoc, map);

    if (parentLevel >= MAX_LEVEL) {
      return alert(`Maximum nesting level of ${MAX_LEVEL} reached. Cannot create subpage.`);
    }

    const title = prompt('Enter subpage title');
    const path = prompt('Enter path for subpage');
    if (!title || !path) return alert('Title and path are required');

    if (isDuplicateAtLevel(title, path, parentDoc._id)) {
      return alert('Duplicate title or path exists in the same level');
    }

    try {
      await api.post(
        '/docs',
        {
          projId,
          title,
          path,
          ref: parentDoc._id,
        },
        {
          headers: { 'x-access-token': accessToken },
        }
      );
      await fetchDocs();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create subpage');
    }
  };

  const handleContextMenu = (e, doc) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, doc });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, doc: null });
  };

  useEffect(() => {
    const handleClickOutside = () => handleCloseContextMenu();
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const buildTree = (items) => {
    const map = {};
    const roots = [];

    items.forEach((item) => {
      map[item._id] = { ...item, children: [] };
    });

    items.forEach((item) => {
      if (item.ref) {
        if (map[item.ref]) {
          map[item.ref].children.push(map[item._id]);
        } else {
          roots.push(map[item._id]);
        }
      } else {
        roots.push(map[item._id]);
      }
    });

    return roots;
  };

  const renderSidebarTree = (nodes, level = 0) => {
    return nodes.map((node) => (
      <div key={node._id}>
        <div
          onClick={() => {
            setDeployMode(false); // exit deploy mode if switching document
            setSelected(node);
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
          className={`p-2 cursor-pointer flex justify-between items-center ${
            selected?._id === node._id ? 'bg-gray-200' : ''
          }`}
          style={{ paddingLeft: `${level * 20}px`, userSelect: 'none', whiteSpace: 'nowrap' }}
        >
          <span className={unsaved.has(node._id) ? 'text-red-500' : ''}>
            {level > 0 ? '|__ ' : ''}
            {node.title}
          </span>
          {!node.builtIn && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(node._id);
              }}
              className="text-red-500"
              aria-label={`Delete ${node.title}`}
            >
              ❌
            </button>
          )}
        </div>
        {node.children.length > 0 && renderSidebarTree(node.children, level + 1)}
      </div>
    ));
  };

  const renderContextMenu = () => {
    if (!contextMenu.visible || !contextMenu.doc) return null;
    const { x, y, doc } = contextMenu;

    return (
      <div
        style={{ top: y, left: x }}
        className="absolute z-50 bg-white shadow border rounded py-1 w-48"
        onClick={handleCloseContextMenu}
      >
        <button
          onClick={() => {
            handleCreateNewPage();
            handleCloseContextMenu();
          }}
          className="w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          ➕ Create Page
        </button>
        <button
          onClick={() => {
            handleCreateSubPage(doc);
            handleCloseContextMenu();
          }}
          className="w-full text-left px-4 py-2 hover:bg-gray-100"
          disabled={getLevel(doc, docs.reduce((acc, d) => ({ ...acc, [d._id]: d }), {})) >= MAX_LEVEL}
          title={
            getLevel(doc, docs.reduce((acc, d) => ({ ...acc, [d._id]: d }), {})) >= MAX_LEVEL
              ? `Max nesting level (${MAX_LEVEL}) reached`
              : ''
          }
        >
          📁 Create Sub Page
        </button>
        {!doc.builtIn && (
          <button
            onClick={() => {
              handleDelete(doc._id);
              handleCloseContextMenu();
            }}
            className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
          >
            ❌ Delete Page
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen relative">
      <div
        className="w-64 bg-gray-100 border-r p-4 overflow-auto"
        style={{ maxHeight: '100vh', overflowX: 'auto', overflowY: 'auto' }}
      >
        <button onClick={handleCreateNewPage} className="mb-4 text-blue-500">
          + New Page
        </button>
        <div style={{ minWidth: '300px' }}>{renderSidebarTree(buildTree(docs))}</div>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        {selected ? (
          <>
            <div className="mb-4 flex gap-4 flex-wrap">
              <input
                className="border px-2 py-1"
                value={selected.path}
                onChange={(e) => setSelected({ ...selected, path: e.target.value })}
                onBlur={() => {
                  if (
                    isDuplicateAtLevel(selected.title, selected.path, selected.ref || null, selected._id)
                  ) {
                    alert('Duplicate title or path exists in the same level');
                    fetchDocs();
                  }
                }}
                placeholder="Path"
                disabled={deployMode}
              />
              <input
                className="border px-2 py-1"
                value={selected.title}
                onChange={(e) => setSelected({ ...selected, title: e.target.value })}
                onBlur={() => {
                  if (
                    isDuplicateAtLevel(selected.title, selected.path, selected.ref || null, selected._id)
                  ) {
                    alert('Duplicate title or path exists in the same level');
                    fetchDocs();
                  }
                }}
                placeholder="Title"
                disabled={deployMode}
              />
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-1 rounded"
                disabled={deployMode}
              >
                Save
              </button>
              <button
                onClick={handleDeploy}
                className={`px-4 py-1 rounded text-white ${
                  deployMode ? 'bg-red-600' : 'bg-blue-500'
                }`}
              >
                {deployMode ? 'Close Preview' : 'Deploy'}
              </button>
            </div>

            {deployMode ? (
              <div className="bg-white shadow rounded-lg p-4 min-h-[400px] overflow-auto">
                {deployContent && deployContent.blocks ? (
                  renderBlocksToHTML(deployContent.blocks)
                ) : (
                  <p>No content to display</p>
                )}
              </div>
            ) : (
              <div
                key={selected._id}
                id="editorjs"
                className="bg-white shadow rounded-lg p-4 min-h-[400px]"
              />
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
