const express = require('express');
const router = express.Router();
const calculatedGasController = require('../Controller/calculatedGasController');

router.get('/daily/calculated', calculatedGasController.getCalculatedDailyGas);
router.get('/daily/non-calculated', calculatedGasController.getNonCalculatedDailyGas);
router.get('/monthly', calculatedGasController.getMonthlyGas);
router.get('/yearly', calculatedGasController.getYearlyGas);
router.get('/totals', calculatedGasController.getGasTotalsWithRate);
router.get('/all', calculatedGasController.getAllGasData);

module.exports = router;
