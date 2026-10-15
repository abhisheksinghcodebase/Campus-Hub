const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters'],
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      maxlength: [100, 'Topic cannot exceed 100 characters'],
    },
    type: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: ['notes', 'pyq', 'important-questions'],
    },
    s3Key: {
      type: String,
      required: [true, 'A PDF file is required'],
      trim: true,
      // Stores MongoDB GridFS file ID
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
      maxlength: [255, 'File name cannot exceed 255 characters'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ subject: 1, topic: 1, type: 1 });
resourceSchema.index({ title: 'text', subject: 'text', topic: 'text', description: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
