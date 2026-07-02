const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح — يرجى تسجيل الدخول' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'elbharah_jwt_secret_key_2026');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'انتهت الجلسة — يرجى إعادة تسجيل الدخول' });
  }
};

module.exports = auth;
