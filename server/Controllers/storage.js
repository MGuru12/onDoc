const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

exports.deleteCloudinaryMedia = async (req, res) => {
  const { publicId, resource_type } = req.body;

  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// (Optional) Handle file retrieval
exports.getFile = (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '..', 'uploads', filename);
  res.sendFile(filepath);
};
