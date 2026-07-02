const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'غير مصرح' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'لا تملك صلاحية للوصول لهذه الصفحة' });
    }
    next();
  };
};

module.exports = requireRole;
