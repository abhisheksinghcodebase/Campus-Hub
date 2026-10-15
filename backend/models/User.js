const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Basic Info ──────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Password is only required if not logging in via Google
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },

    // ── OAuth Providers ──────────────────────────────────────────
    googleId: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['student', 'teacher'],
      default: 'student',
    },

    // ── Personal Details (editable by user) ─────────────────────
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [250, 'Bio cannot exceed 250 characters'],
      default: '',
    },
    avatar: {
      type: String,
      default: '', // URL or base64 string
    },

    // ── Password Reset ───────────────────────────────────────────
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // ── Account Status ───────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// ── Hash password before saving ──────────────────────────────────
userSchema.pre('save', async function () {
  // Only hash if password is provided and was actually modified
  if (!this.password || !this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance method: compare submitted password with stored hash ──
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Instance method: generate password reset token ───────────────
userSchema.methods.getResetPasswordToken = function () {
  const crypto = require('crypto');

  // 1. Generate random 32-byte token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2. Hash & store on user document
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Token expires in 10 minutes
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // 4. Return the UN-hashed token (sent in email)
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
