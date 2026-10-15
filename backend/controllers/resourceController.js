const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const asyncHandler = require('../middleware/asyncHandler');
const gridfs = require('../utils/gridfs');

const RESOURCE_TYPES = ['notes', 'pyq', 'important-questions'];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listResources = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
  const query = {};
  const { q, subject, topic, type } = req.query;

  if (type && type !== 'all') {
    if (!RESOURCE_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid resource type.' });
    }
    query.type = type;
  }
  if (subject) query.subject = new RegExp(escapeRegex(String(subject).trim()), 'i');
  if (topic) query.topic = new RegExp(escapeRegex(String(topic).trim()), 'i');
  if (req.query.mine === 'true') query.uploadedBy = req.user._id;
  if (q) {
    const search = new RegExp(escapeRegex(String(q).trim()), 'i');
    query.$or = [{ title: search }, { description: search }, { subject: search }, { topic: search }];
  }

  const [resources, total] = await Promise.all([
    Resource.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('uploadedBy', 'name'),
    Resource.countDocuments(query),
  ]);
  res.json({
    success: true,
    resources,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const listStoredFiles = asyncHandler(async (req, res) => {
  const skip = req.query.cursor ? parseInt(req.query.cursor, 10) : 0;
  const files = await gridfs.listPdfFiles(50, skip);
  
  res.json({ 
    success: true,
    files: files.map(file => ({
      key: file.fileId,
      fileName: file.fileName,
      lastModified: file.uploadDate,
      size: file.size,
    })),
    nextCursor: files.length === 50 ? (skip + 50).toString() : null,
  });
});

const uploadResourceFile = asyncHandler(async (req, res) => {
  const result = await gridfs.uploadPdf(req.file, req.user._id.toString());
  res.status(201).json({ 
    success: true,
    key: result.fileId,
    originalFileName: result.originalFileName,
  });
});

const createResource = asyncHandler(async (req, res) => {
  const { title, description = '', subject, topic, type, s3Key } = req.body;
  if (!title || !subject || !topic || !type || !s3Key) {
    return res.status(400).json({
      success: false,
      message: 'Title, subject, topic, resource type, and PDF file are required.',
    });
  }
  if (!RESOURCE_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid resource type.' });
  }

  const file = await gridfs.verifyPdfFile(s3Key);
  const resource = await Resource.create({
    title,
    description,
    subject,
    topic,
    type,
    s3Key,
    originalFileName: file.originalFileName,
    uploadedBy: req.user._id,
  });
  await resource.populate('uploadedBy', 'name');
  res.status(201).json({ success: true, resource });
});

const updateResource = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid resource ID.' });
  }
  const resource = await Resource.findOne({ _id: req.params.id, uploadedBy: req.user._id });
  if (!resource) {
    return res.status(404).json({ success: false, message: 'Resource not found.' });
  }

  const { title, description, subject, topic, type, s3Key } = req.body;
  if (type !== undefined && !RESOURCE_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid resource type.' });
  }
  for (const field of ['title', 'description', 'subject', 'topic', 'type']) {
    if (req.body[field] !== undefined) resource[field] = req.body[field];
  }
  if (s3Key !== undefined && s3Key !== resource.s3Key) {
    const file = await gridfs.verifyPdfFile(s3Key);
    resource.s3Key = s3Key;
    resource.originalFileName = file.originalFileName;
  }
  await resource.save();
  await resource.populate('uploadedBy', 'name');
  res.json({ success: true, resource });
});

const deleteResource = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid resource ID.' });
  }
  const resource = await Resource.findOne({ _id: req.params.id, uploadedBy: req.user._id });
  if (!resource) {
    return res.status(404).json({ success: false, message: 'Resource not found.' });
  }
  await resource.deleteOne();
  res.json({ success: true, message: 'Resource deleted.' });
});

const getDownloadUrl = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid resource ID.' });
  }
  const resource = await Resource.findById(req.params.id).select('s3Key originalFileName');
  if (!resource) {
    return res.status(404).json({ success: false, message: 'Resource not found.' });
  }
  
  const { stream, metadata } = await gridfs.getDownloadStream(resource.s3Key);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${metadata.originalFileName}"`);
  stream.pipe(res);
});

module.exports = {
  createResource,
  deleteResource,
  getDownloadUrl,
  listResources,
  listStoredFiles,
  updateResource,
  uploadResourceFile,
};
