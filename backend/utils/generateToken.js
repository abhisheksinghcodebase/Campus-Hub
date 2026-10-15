const jwt = require('jsonwebtoken');

/**
 * generateToken - Signs a JWT with user id as payload.
 * @param {string} id - MongoDB user _id
 * @returns {string}   Signed JWT string
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },                          // payload
    process.env.JWT_SECRET,          // secret key
    { expiresIn: process.env.JWT_EXPIRE } // options
  );
};

module.exports = generateToken;
