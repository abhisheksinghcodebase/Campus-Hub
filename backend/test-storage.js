// Test storage configuration
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const gridfs = require('./utils/gridfs');

async function testStorage() {
  console.log('\n========================================');
  console.log('📦 STORAGE SYSTEM TEST');
  console.log('========================================\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    console.log(`📦 Active Storage Backend: GRIDFS\n`);

    // Create a test PDF buffer
    const testPdf = Buffer.from('%PDF-1.4\n%Test PDF file for storage\n%%EOF\n');
    
    const mockFile = {
      buffer: testPdf,
      mimetype: 'application/pdf',
      originalname: 'test-storage.pdf',
      size: testPdf.length,
    };

    console.log('📤 Testing PDF Upload...');
    const uploadResult = await gridfs.uploadPdf(mockFile, 'test-user-123');
    console.log('   ✅ Upload Successful!');
    console.log('   File ID:', uploadResult.fileId);
    console.log('   Original Name:', uploadResult.originalFileName);
    console.log();

    console.log('🔍 Verifying Uploaded File...');
    const verifyResult = await gridfs.verifyPdfFile(uploadResult.fileId);
    console.log('   ✅ Verification Successful!');
    console.log('   File Name:', verifyResult.originalFileName);
    console.log();

    console.log('📥 Testing File Download Stream...');
    const { stream, metadata } = await gridfs.getDownloadStream(uploadResult.fileId);
    console.log('   ✅ Stream Created Successfully!');
    console.log('   Metadata:', metadata);
    
    // Consume the stream
    stream.on('data', () => {});
    await new Promise((resolve) => stream.on('end', resolve));
    console.log('   ✅ File downloaded successfully');
    console.log();

    console.log('📋 Listing Stored Files...');
    const files = await gridfs.listPdfFiles(10, 0);
    console.log(`   ✅ Found ${files.length} file(s)`);
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.fileName} (${(file.size / 1024).toFixed(2)} KB)`);
    });
    console.log();

    console.log('========================================');
    console.log('✅ ALL STORAGE TESTS PASSED!');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Storage Test Failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testStorage();
