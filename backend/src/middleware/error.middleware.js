const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'بيانات غير صحيحة',
      details: err.errors.map(e => e.message),
    });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'القيمة موجودة مسبقاً',
      details: err.errors.map(e => e.message),
    });
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'لا يمكن الحذف — العنصر مرتبط ببيانات أخرى',
    });
  }
  res.status(err.status || 500).json({
    error: err.message || 'خطأ في الخادم',
  });
};

module.exports = errorHandler;
