const multer = require('multer');

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const uploadNewsImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      cb(new Error('Solo se permiten archivos de imagen.'));
      return;
    }
    cb(null, true);
  },
});

function handleNewsImageUpload(req, res, next) {
  uploadNewsImage.single('imagen')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'La imagen supera los 10 MB.' });
      }
      return res
        .status(400)
        .json({ error: err.message || 'No se pudo procesar la imagen.' });
    }
    next();
  });
}

module.exports = {
  handleCreateUpload: handleNewsImageUpload,
  handleNewsImageUpload,
};
