const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/dashboard.controller');

router.get('/today', auth, ctrl.today);
router.get('/month', auth, ctrl.month);
router.get('/charts', auth, ctrl.charts);
router.get('/insights', auth, ctrl.insights);
router.get('/notifications', auth, ctrl.notifications);

module.exports = router;
