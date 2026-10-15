const requireTeacher = (req, res, next) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Only authorized teachers can manage resources.',
    });
  }
  return next();
};

module.exports = { requireTeacher };
