/**
 * MongoDB GridFS Storage for PDFs
 * All PDF files are stored directly in MongoDB database
 */

const mongoose = require('mongoose');
const { Readable } = require('stream');
const { randomUUID } = require('crypto');

const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20 MB

const httpError = (message, status) => Object.assign(new Error(message), { status });

const cleanFileName = (name) =>
  name.replace(/[\\/\r\n"]/g, '_').replace(/[^\x20-\x7E]/g, '_').slice(0, 180) || 'resource.pdf';

const getBucket = () => {
  if (!mongoose.connection.db) {
    throw httpError('MongoDB connection not established', 503);
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'resources',
  });
};

/**
 * Upload PDF to MongoDB GridFS
 */
const uploadPdf = async (file, userId) => {
  if (!file || file.mimetype !== 'application/pdf' || file.size > MAX_PDF_SIZE) {
    throw httpError('Upload a PDF file no larger than 20 MB.', 400);
  }
  
  if (file.buffer.length < 5 || file.buffer.toString('ascii', 0, 5) !== '%PDF-') {
    throw httpError('The uploaded file is not a valid PDF.', 400);
  }

  const originalFileName = cleanFileName(file.originalname);
  const fileId = randomUUID();
  const bucket = getBucket();

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(fileId, {
      metadata: {
        originalFileName,
        userId,
        uploadDate: new Date(),
        contentType: 'application/pdf',
        size: file.size,
      },
    });

    Readable.from(file.buffer).pipe(uploadStream)
      .on('error', (error) => {
        console.error('GridFS upload error:', error);
        reject(httpError('Failed to upload PDF', 500));
      })
      .on('finish', () => {
        resolve({
          fileId: uploadStream.id.toString(),
          originalFileName,
        });
      });
  });
};

/**
 * Get download stream for PDF
 */
const getDownloadStream = async (fileId) => {
  const bucket = getBucket();

  try {
    const objectId = new mongoose.Types.ObjectId(fileId);
    const files = await bucket.find({ _id: objectId }).toArray();
    
    if (files.length === 0) {
      throw httpError('PDF file not found', 404);
    }

    const file = files[0];
    const downloadStream = bucket.openDownloadStream(objectId);

    return {
      stream: downloadStream,
      metadata: {
        originalFileName: file.metadata?.originalFileName || 'download.pdf',
        contentType: 'application/pdf',
        size: file.length,
        uploadDate: file.uploadDate,
      },
    };
  } catch (error) {
    if (error.status) throw error;
    console.error('GridFS download error:', error);
    throw httpError('Failed to retrieve PDF', 500);
  }
};

/**
 * List all PDF files
 */
const listPdfFiles = async (limit = 100, skip = 0) => {
  const bucket = getBucket();

  try {
    const files = await bucket
      .find({})
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return files.map((file) => ({
      fileId: file._id.toString(),
      fileName: file.metadata?.originalFileName || file.filename,
      uploadDate: file.uploadDate,
      size: file.length,
      userId: file.metadata?.userId,
    }));
  } catch (error) {
    console.error('GridFS list error:', error);
    throw httpError('Failed to list PDF files', 500);
  }
};

/**
 * Verify PDF file exists
 */
const verifyPdfFile = async (fileId) => {
  const bucket = getBucket();

  try {
    const objectId = new mongoose.Types.ObjectId(fileId);
    const files = await bucket.find({ _id: objectId }).toArray();

    if (files.length === 0) {
      throw httpError('PDF file not found', 404);
    }

    const file = files[0];
    
    if (file.length > MAX_PDF_SIZE) {
      throw httpError('PDF file exceeds maximum size', 400);
    }

    return {
      originalFileName: file.metadata?.originalFileName || file.filename,
    };
  } catch (error) {
    if (error.status) throw error;
    console.error('GridFS verify error:', error);
    throw httpError('Failed to verify PDF file', 500);
  }
};

/**
 * Delete PDF file
 */
const deletePdfFile = async (fileId) => {
  const bucket = getBucket();

  try {
    const objectId = new mongoose.Types.ObjectId(fileId);
    await bucket.delete(objectId);
  } catch (error) {
    console.error('GridFS delete error:', error);
    throw httpError('Failed to delete PDF file', 500);
  }
};

module.exports = {
  MAX_PDF_SIZE,
  uploadPdf,
  getDownloadStream,
  listPdfFiles,
  verifyPdfFile,
  deletePdfFile,
};
