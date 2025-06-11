const express = require('express');
const multer = require('multer');
const { uploadFile, getFile } = require('../Controllers/storage');

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// POST /file/upload  - upload a file
router.post('/upload', upload.single('file'), uploadFile);

// GET /file/:filename  - retrieve a file (optional)
router.get('/:filename', getFile);

module.exports = router;
