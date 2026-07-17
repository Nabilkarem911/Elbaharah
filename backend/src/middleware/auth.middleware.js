const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح — يرجى تسجيل الدخول' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'انتهت الجلسة — يرجى إعادة تسجيل الدخول' });
  }
};

module.exports = auth;
