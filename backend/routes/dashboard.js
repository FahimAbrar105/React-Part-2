const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const preventCache = require('../middleware/preventCache');

router.get('/', protect, preventCache, getDashboardData);

module.exports = router;
