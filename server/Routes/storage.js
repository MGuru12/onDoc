const express = require('express');
const multer = require('multer');
const { uploadFile, getFile, deleteCloudinaryMedia } = require('../Controllers/storage');

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// POST /file/upload  - upload a file
router.post('/upload', upload.single('file'), uploadFile);

router.post('/delete', deleteCloudinaryMedia);

// GET /file/:filename  - retrieve a file (optional)
router.get('/:filename', getFile);

module.exports = router;
