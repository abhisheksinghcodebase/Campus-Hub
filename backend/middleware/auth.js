const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getAccountRole } = require('../utils/teacherAccess');

/**
 * Middleware: protect routes — verifies JWT from Authorization header.
 * Attaches the decoded user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Look for token in "Authorization: Bearer <token>" header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no token provided',
    });
  }

  try {
    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the user from the decoded payload id
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found — token invalid',
      });
    }

    const accountRole = getAccountRole(user.email);
    if (user.role !== accountRole) {
      user.role = accountRole;
      await user.save();
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — token verification failed',
    });
  }
};

module.exports = { protect };
