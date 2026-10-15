const express = require('express');
const multer = require('multer');
const {
  createResource,
  deleteResource,
  getDownloadUrl,
  listResources,
  listStoredFiles,
  updateResource,
  uploadResourceFile,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const { requireTeacher } = require('../middleware/teacher');
const gridfs = require('../utils/gridfs');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: gridfs.MAX_PDF_SIZE, files: 1 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype !== 'application/pdf') {
      const error = new Error('Only PDF files can be uploaded.');
      error.status = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});

router.use(protect);
router.get('/', listResources);
router.get('/stored-files', requireTeacher, listStoredFiles);
router.post('/upload', requireTeacher, upload.single('file'), uploadResourceFile);
router.post('/', requireTeacher, createResource);
router.get('/:id/download', getDownloadUrl);
router.patch('/:id', requireTeacher, updateResource);
router.delete('/:id', requireTeacher, deleteResource);

module.exports = router;
