const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { getAccountRole } = require('../utils/teacherAccess');

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: getAccountRole(email),
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Authenticate user & return token
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accountRole = getAccountRole(user.email);
    if (user.role !== accountRole) {
      user.role = accountRole;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logged in successfully',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get current logged-in user's profile
// @access  Private (requires JWT)
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/auth/update-profile
// @desc    Update name, phone, bio, avatar
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, avatar } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/auth/change-password
// @desc    Change password (requires current password)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/forgot-password
// @desc    Generate reset token & email it to user
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email' });
    }

    const user = await User.findOne({ email });

    // Generic message even if email not found (security best practice)
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email exists, a reset link has been sent',
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your account.</p>
        <p>Click the button below to reset your password. This link expires in <strong>10 minutes</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block; padding:12px 24px; background:#4f46e5; color:#fff;
                  text-decoration:none; border-radius:6px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <p style="color: #999; font-size: 12px;">
          Link expires: ${new Date(Date.now() + 10 * 60 * 1000).toUTCString()}
        </p>
      </div>
    `;

    console.log(`\n🔑 [PASSWORD RESET LINK GENERATED] For ${user.email}:`);
    console.log(`🔗 ${resetUrl}\n`);

    try {
      await sendEmail({ to: user.email, subject: 'Password Reset Request', html });
      res.json({
        success: true,
        message: 'If that email exists, a reset link has been sent',
        previewUrl: resetUrl,
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error('Email error:', emailError);
      res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/reset-password/:token
// @desc    Validate token & set new password
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please provide a new password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset token is invalid or has expired' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now log in.',
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/auth/delete-account
// @desc    Permanently delete user account
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account deleted permanently' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/google-client-id
// @desc    Get configured Google Client ID for frontend
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getGoogleClientId = async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.Client_ID || '';
  res.json({ success: true, clientId });
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/google
// @desc    Verify Google ID token & sign in or register user
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential token is required' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.Client_ID;
    if (!clientId) {
      return res.status(500).json({ success: false, message: 'Google Client ID not configured on server' });
    }

    const client = new OAuth2Client(clientId);

    // Verify token with Google public certs
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google token payload' });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find existing user by googleId OR email
    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      let needsSave = false;
      const accountRole = getAccountRole(email);
      if (user.role !== accountRole) {
        user.role = accountRole;
        needsSave = true;
      }
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        needsSave = true;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        avatar: picture || '',
        authProvider: 'google',
        role: getAccountRole(email),
      });
    }

    res.json({
      success: true,
      message: 'Logged in successfully with Google',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        authProvider: user.authProvider || 'google',
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Google Auth Error:', err.message);
    res.status(400).json({
      success: false,
      message: 'Google authentication failed: ' + (err.message || 'Invalid token'),
    });
  }
};

module.exports = {
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
};
