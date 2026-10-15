const express = require('express');
const router = express.Router();

const {
  register,
  login,
  googleLogin,
  getGoogleClientId,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register', register);              // Create account
router.post('/login', login);                    // Login
router.post('/google', googleLogin);              // Google OAuth login/register
router.get('/google-client-id', getGoogleClientId); // Fetch configured client ID
router.post('/forgot-password', forgotPassword); // Send reset email
router.post('/reset-password/:token', resetPassword); // Reset via token

// ── Private Routes (JWT required) ────────────────────────────────────────────
router.get('/me', protect, getMe);                         // Get own profile
router.put('/update-profile', protect, updateProfile);     // Edit name/phone/bio/avatar
router.put('/change-password', protect, changePassword);   // Change password
router.delete('/delete-account', protect, deleteAccount);  // Delete account

module.exports = router;
