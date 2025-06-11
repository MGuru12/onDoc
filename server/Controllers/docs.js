const docsModel = require("../model/DocsModel");
const { status400, status500 } = require("../utils/const");

const getDocs = async (req, res) => {
  try {
    const {_id} = req.JWT;
    const { projId } = req.query;
    if (!projId) return res.status(400).json({ message: status400 });

    const Docs = docsModel(_id);
    const docs = await Docs.find({ proj: projId });
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: status500 });
  }
};

const createDoc = async (req, res) => {
  try {
    const {_id} = req.JWT;
    const { projId, title, path, ref } = req.body;

    if (!projId || !title || !path) {
      return res.status(400).json({ message: status400 });
    }

    const Docs = docsModel(_id);

    // Uniqueness validation for title/path under the same ref
    const conflict = await Docs.findOne({ proj: projId, ref: ref || null, title });
    if (conflict) return res.status(409).json({ message: 'Title already exists in this level.' });

    const doc = await Docs.create({ proj: projId, title, path, ref: ref || null, content: '' });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: status500 });
  }
};

const updateDoc = async (req, res) => {
  try {
    const {_id} = req.JWT;
    const { id } = req.params;
    const { title, path, content, deploy } = req.body;

    const Docs = docsModel(_id);
    const doc = await Docs.findById(id);

    if (!doc) return res.status(404).json({ message: 'Doc not found' });

    const duplicate = await Docs.findOne({ 
      _id: { $ne: id }, 
      proj: doc.proj, 
      ref: doc.ref || null, 
      title 
    });
    if (duplicate) return res.status(409).json({ message: 'Duplicate title/path in same level' });

    doc.title = title;
    doc.path = path;
    doc.content = content;
    if (deploy !== undefined) doc.deploy = deploy;

    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: status500 });
  }
};

const deleteDoc = async (req, res) => {
  try {
    const {_id} = req.JWT;
    const { id } = req.params;
    const Docs = docsModel(_id);

    const doc = await Docs.findById(id);
    if (!doc) return res.status(404).json({ message: 'Doc not found' });
    if (doc.builtIn) return res.status(403).json({ message: 'Root page cannot be deleted' });

    await Docs.deleteOne({ _id: id });
    res.json({ message: 'Doc deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: status500 });
  }
};

module.exports = { getDocs, createDoc, updateDoc, deleteDoc };
