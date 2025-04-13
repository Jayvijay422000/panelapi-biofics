const express = require('express');
const router = express.Router();

const dashboardController = require('../Controller/dashboardController');
// const { checkUserRole } = require('../Middleware/authMiddleware');

// Route for aggregated dashboard data
router.get('/dashboarddata', dashboardController.getDashboardData);

// Route for dashboard data by client ID
router.get('/dashboard-data/:client_id', dashboardController.getDashboardDataByClientId);

module.exports = router;








// const express = require('express');
// const router = express.Router();

// const dashboardController = require('../Controller/dashboardController');

// // Route for aggregated dashboard data
// router.get('/dashboarddata', dashboardController.getDashboardData);

// router.get('/dashboard-data/:client_id', dashboardController.getDashboardDataByClientId);

// module.exports = router;
