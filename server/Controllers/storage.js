const path = require('path');

// Handle file upload
exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: 'No file uploaded' });
  }
  console.log(req.file.originalname);
  
  res.json({
    success: 1,
    file: {
      url: `${req.protocol}://${req.get('host')}/file/${req.file.filename}`
    }
  });
};

// (Optional) Handle file retrieval
exports.getFile = (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '..', 'uploads', filename);
  res.sendFile(filepath);
};
