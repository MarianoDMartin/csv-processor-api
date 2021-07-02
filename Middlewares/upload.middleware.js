const multer = require('multer');

const maxSize = 2 * 1024 * 1024;
const uploadMiddleware = multer({
  dest: 'uploads/',
  limits: { fileSize: maxSize },
});

module.exports = uploadMiddleware;
