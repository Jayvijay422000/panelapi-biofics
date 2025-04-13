const express = require('express');
const digesterController = require('../Controller/digesterController');
const { authenticateUser, checkUserRole } = require('../Middleware/authMiddleware');

const router = express.Router();

// Add digester (Admin only)
router.post('/add-digester', authenticateUser, checkUserRole(['admin']), digesterController.addDigester);

// Update digester (Admin only)
router.put('/update-digester/:id', authenticateUser, checkUserRole(['admin']), digesterController.updateDigester);

// Delete digester (Admin only)
router.delete('/delete-digester/:id', authenticateUser, checkUserRole(['admin']), digesterController.deleteDigester);

// Get digesters by plant ID (Admin only)
router.get('/get-digester/plant/:plant_id', authenticateUser, digesterController.getDigestersByPlantId);


router.get('/get-digester/client/:client_id', authenticateUser, digesterController.getDigestersByClientId);
router.get('/get-all-digesters', authenticateUser, digesterController.getAllDigesters);


module.exports = router;
