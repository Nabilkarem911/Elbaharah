const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const reports = require('../controllers/reports.controller');

router.get('/sales', auth, reports.sales);
router.get('/fish', auth, reports.fish);
router.get('/delivery', auth, reports.delivery);
router.get('/suppliers', auth, reports.suppliers);
router.get('/expenses', auth, reports.expenses);
router.get('/profit', auth, reports.profit);
router.get('/pos', auth, reports.pos);
router.get('/credit', auth, reports.credit);
router.get('/tax', auth, reports.tax);
router.get('/waste', auth, reports.waste);

module.exports = router;
