const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const authCtrl = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');

router.post('/login', [
  body('username').trim().notEmpty().withMessage('اسم المستخدم مطلوب'),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
], validate, authCtrl.login);
router.get('/me', auth, authCtrl.me);
router.put('/password', [
  body('current_password').notEmpty().withMessage('كلمة المرور الحالية مطلوبة'),
  body('new_password').isLength({ min: 6 }).withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
], validate, auth, authCtrl.changePassword);

module.exports = router;
