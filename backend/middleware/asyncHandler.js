/**
 * Middleware: wraps async route handlers to avoid try/catch boilerplate.
 * Any thrown error is forwarded to Express's error handler via next().
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
