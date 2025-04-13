// routes/accessRightRoutes.js
const express = require('express');
const accessRightsController = require('../Controller/accessRightsController');
const { authenticateUser, checkUserRole } = require('../Middleware/authMiddleware');

const router = express.Router();

router.post('/addaccessrights', authenticateUser, checkUserRole(['admin']), accessRightsController.addAccessRight);
router.get('/getallaccessrights',authenticateUser, checkUserRole(['admin']), accessRightsController.getAllAccessRights);
// router.get('/:id', getAccessRightById);
router.put('/update-access-right/:id',authenticateUser, accessRightsController.updateAccessRight);
// router.delete('/:id', deleteAccessRight);

module.exports = router;
