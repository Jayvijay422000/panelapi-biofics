const express = require('express');
const router = express.Router();
const subscriptionController = require('../Controller/subscriptionController');
const { authenticateUser, checkUserRole } = require('../Middleware/authMiddleware');

router.post('/activate-subscription', authenticateUser, checkUserRole(['admin']), subscriptionController.activateSubscription);
router.post('/deactivate-subscription', authenticateUser, checkUserRole(['admin']), subscriptionController.deactivateSubscription);

router.post('/add-subscription-plans', authenticateUser, checkUserRole(['admin']), subscriptionController.createSubscriptionPlan);
router.get('/get-subscription-plans', authenticateUser, checkUserRole(['admin']), subscriptionController.getAllSubscriptionPlans);
router.get('/get-subscription-plan/:id', authenticateUser, checkUserRole(['admin']), subscriptionController.getSubscriptionPlanById);
router.put('/update-subscription-plans/:id', authenticateUser, checkUserRole(['admin']), subscriptionController.updateSubscriptionPlan);
router.delete('/delete-subscription-plans/:id', authenticateUser, checkUserRole(['admin']), subscriptionController.deleteSubscriptionPlan);

module.exports = router;
