const superAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'غير مصرح' });
  }
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'هذه الصفحة مخصصة للمدير العام فقط' });
  }
  next();
};

module.exports = superAdmin;
