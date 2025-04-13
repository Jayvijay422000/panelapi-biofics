const express = require('express');
const upload = require('../Middleware/upload');
const digesterDataController = require('../Controller/digesterDataController');
const { authenticateUser, checkUserRole } = require('../Middleware/authMiddleware');
const checkSubscription = require('../Middleware/checkSubscription ');

const router = express.Router();

// Route to handle incoming digester data
router.post('/new-digesterdata', digesterDataController.processDigesterData);

// Add digester data
router.post('/add-digesterdata', digesterDataController.addDigesterData);


router.post('/add-feeddata', digesterDataController.addFeedData);

// router.post('/add-feed', digesterDataController.addFeedValue);

// Update digester data
router.put('/update-digesterdata/:id', authenticateUser, checkUserRole(['admin']), digesterDataController.updateDigesterData);



router.get('/:client_id', digesterDataController.getDigesterDataBySelectedDate);


// Delete digester data
router.delete('/delete-digesterdata/:id', authenticateUser, checkUserRole(['admin']), digesterDataController.deleteDigesterData);

router.get('/feed-data/:digesterId', digesterDataController.fetchFeedDataForDate);

router.post('/adddigesterdata', authenticateUser, checkUserRole(["admin"]), digesterDataController.receiveDigesterData);

// router.get('/export-by-digester', digesterDataController.exportDataByDigesterName);

router.post('/addfeeddata', authenticateUser, checkUserRole(["admin"]), digesterDataController.receiveFeedData);



// Get digester data by digester ID
router.get('/get-digesterdata/digester/:digester_id', authenticateUser, checkSubscription, digesterDataController.getDigesterDataByDigesterId);

// Get digester data by client ID
router.get('/get-digesterdata/client/:client_id', authenticateUser, checkSubscription, digesterDataController.getDigesterDataByClientId);




router.get('/get-data/client/:client_id', digesterDataController.getAllDigesterDataByClientId);




router.get('/feed-dataa/:client_id', digesterDataController.getFeedDataByClientAndFilters);




module.exports = router;
