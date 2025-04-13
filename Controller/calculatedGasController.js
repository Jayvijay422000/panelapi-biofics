const CalculatedGas = require('../Models/calculatedGasModel');

exports.getCalculatedDailyGas = async (req, res) => {
    const { year, plantId } = req.query; // Accept year and plantId as query parameters
    try {
        const result = await CalculatedGas.getDailyGas(year, plantId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getNonCalculatedDailyGas = async (req, res) => {
    const { year, plantId } = req.query; // Accept year and plantId as query parameters
    try {
        const dailyGas = await CalculatedGas.getDailyGas(year, plantId);
        const dailyGasNonCalculated = dailyGas.map(item => ({
            day: item.dataValues.day,
            day_total: item.dataValues.daily_gas_production
        }));
        res.json(dailyGasNonCalculated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMonthlyGas = async (req, res) => {
    const { year, plantId } = req.query; // Accept year and plantId as query parameters
    try {
        const result = await CalculatedGas.getMonthlyGas(year, plantId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getYearlyGas = async (req, res) => {
    const { plantId } = req.query; // Accept plantId as query parameter
    try {
        const result = await CalculatedGas.getYearlyGas(plantId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getGasTotalsWithRate = async (req, res) => {
    const { plantId } = req.query; // Accept plantId as query parameter
    try {
        const totals = await CalculatedGas.getGasTotalsWithRate(plantId);
        res.json(totals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// exports.getAllGasData = async (req, res) => {
//     const { year, plantId } = req.query; // Accept year and plantId as query parameters

//     try {
//         const result = await CalculatedGas.getAllGasData(year, plantId);
//         res.json(result);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };



exports.getAllGasData = async (req, res) => {
    const { year, plantId } = req.query; // Accept year and plantId as query parameters

    // Validate the query parameters
    if (!year || !plantId) {
        return res.status(400).json({ error: 'Year and plantId are required query parameters.' });
    }

    try {
        const result = await CalculatedGas.getAllGasData(year, plantId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
