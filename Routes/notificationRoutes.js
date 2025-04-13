const express = require('express');
const router = express.Router();
const notificationController = require('../Controller/notificationController');
const { authenticateUser, checkUserRole } = require('../Middleware/authMiddleware'); 


router.get('/get-all-notifications', notificationController.getAllNotifications);

router.post('/create-notification', notificationController.createNotification);

module.exports = router;
