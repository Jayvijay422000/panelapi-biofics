const express = require('express');
const router = express.Router();
const GasRateController = require('../Controller/GasRateController');
const { authenticateUser, checkUserRole } = require('../Middleware/authMiddleware');

// Routes for gas rate management
router.post('/add-gas-rate', authenticateUser, checkUserRole(['admin']), GasRateController.addGasRate);
router.get('/get-gas-rates', authenticateUser, GasRateController.getAllGasRates);
router.get('/get-gas-rate/:id', authenticateUser, checkUserRole(['admin']), GasRateController.getGasRateById);
router.put('/edit-gas-rate/:id', authenticateUser, checkUserRole(['admin']), GasRateController.editGasRate);
router.delete('/delete-gas-rate/:id', authenticateUser, checkUserRole(['admin']), GasRateController.deleteGasRate);

module.exports = router;
