const express = require('express');
const plantController = require('../Controller/plantController');
const { authenticateUser, checkUserRole } = require('../Middleware/authMiddleware');


const router = express.Router();

// Add plant
router.post('/add-plant', authenticateUser, checkUserRole(['admin']), plantController.addPlant);

// Update plant
router.put('/update-plant/:id', authenticateUser, checkUserRole(['admin']), plantController.updatePlant);

// Delete plant
router.delete('/delete-plant/:id', authenticateUser, checkUserRole(['admin']), plantController.deletePlant);

// Get all plants
router.get('/get-plants', authenticateUser, plantController.getAllPlants);

// Get plant by ID
router.get('/get-plant/:id', authenticateUser, plantController.getPlantById);

// Get plants by client ID
router.get('/get-plant/client/:client_id', authenticateUser, plantController.getPlantsByClientId);

module.exports = router;
