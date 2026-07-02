const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const authCtrl = require('../controllers/auth.controller');

router.post('/login', authCtrl.login);
router.get('/me', auth, authCtrl.me);
router.put('/password', auth, authCtrl.changePassword);

module.exports = router;
