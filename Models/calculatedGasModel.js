const { fn, col, where, Op } = require('sequelize');
const sequelize = require('../Database/sequelize');
const DigesterData = require('./digesterData');
const GasRate = require('./gasRate');

// Helper function to convert UTC timestamp to IST
function convertToIST(utcDate) {
    const istOffset = 5 * 60 + 30; // IST is UTC +5:30
    const istDate = new Date(utcDate.getTime() + istOffset * 60 * 1000);
    return istDate;
}

const CalculatedGas = {
    async getAllGasRates() {
        const gasRates = await GasRate.findAll({
            order: [['start_date', 'ASC']],
            attributes: ['price', 'start_date', 'end_date']
        });
        return gasRates.map(rate => ({
            price: rate.price,
            startDate: new Date(rate.start_date),
            endDate: rate.end_date ? new Date(rate.end_date) : null,
        }));
    },

    async getFinalGeneratedGas(plantId) {
        try {
            const digesterData = await DigesterData.findAll({
                where: {
                    plant_id: plantId,
                    
                    
                },
                order: [['timestamp', 'ASC']],
                attributes: ['timestamp', 'final_generated_gas'],
            });

            const finalGasData = digesterData.map(data => {
                const utcDate = new Date(data.timestamp);
                const istDate = convertToIST(utcDate);
                return {
                    utc: utcDate.toISOString().slice(0, 19).replace('T', ' '),
                    final_generated_gas: data.final_generated_gas,
                    ist: istDate.toISOString().slice(0, 19).replace('T', ' '),
                };
            });
            console.log("dfgdfhgjhdfgjdf",finalGasData);

            return finalGasData;

        } catch (error) {
            console.error('Error fetching digester data:', error);
            throw error;
        }
    },

    async getDailyGas(plantId) {
        const gasRates = await this.getAllGasRates(); 
        const finalGasData = await this.getFinalGeneratedGas(plantId);
        // console.log("Gas Rates:", gasRates);

        // Create a map to aggregate daily totals
        const dailyTotals = {};
    
        finalGasData.forEach(entry => {
            const date = entry.ist.split(' ')[0]; // Get the date part (YYYY-MM-DD)
            const generatedGas = entry.final_generated_gas;
    
            if (!dailyTotals[date]) {
                dailyTotals[date] = { total: 0, calculated: 0 }; // Initialize if not already present
            }
            dailyTotals[date].total += generatedGas; 
            
            const price = this.getGasRateForDate(gasRates, new Date(date));
            // console.log(`Price for ${date}:`, price); // Log to verify price // Log to verify price
            dailyTotals[date].calculated += generatedGas * price;
            // Sum the generated gas for the day
        });
    
        // Convert the dailyTotals object to an array of results
        const dailyGasSummary = Object.entries(dailyTotals).map(([date, totals]) => ({
            date,
            total_generated_gas: totals.total,
            total_generated_gas_calculated: totals.calculated, // Placeholder for daily calculated gas
        }));
    
        console.log("sdkjgjdgh",dailyGasSummary);
        return dailyGasSummary; // Return the daily gas summary
    },
    
    async getMonthlyGas(year, plantId) {
        const dailyGasData = await this.getDailyGas(plantId);
        // console.log("Daily Gas Data:", dailyGasData); 
        // Create a map to aggregate monthly totals
        const monthlyTotals = {};
    
        dailyGasData.forEach(entry => {
            const date = new Date(entry.date);
            const month = date.getMonth() + 1; // Months are 0-indexed
            const yearKey = date.getFullYear();
    
            const monthKey = `${yearKey}-${month < 10 ? '0' + month : month}`; // Format YYYY-MM
    
            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = { total: 0, calculated: 0 }; // Initialize if not already present
            }
            monthlyTotals[monthKey].total += entry.total_generated_gas; // Sum the total generated gas for the month
            monthlyTotals[monthKey].calculated += entry.total_generated_gas_calculated; // Sum the calculated gas for the month
        });
    
        // Convert the monthlyTotals object to an array of results
        const monthlyGasSummary = Object.entries(monthlyTotals).map(([monthKey, totals]) => {
            // console.log(`Monthly Total Calculated for ${monthKey}: ${totals.calculated}`);
            return {
            month: monthKey,
            monthly_total: totals.total,
            monthly_total_calculated: totals.calculated, // Include calculated monthly total
            };
        });
    
        return monthlyGasSummary; // Return the monthly gas summary
    },
    
    async getYearlyGas(plantId) {
        const monthlyGasData = await this.getMonthlyGas(null, plantId);
        
        // Create a map to aggregate yearly totals
        const yearlyTotals = {};
    
        monthlyGasData.forEach(entry => {
            const [year, month] = entry.month.split('-');
            if (!yearlyTotals[year]) {
                yearlyTotals[year] = { total: 0, calculated: 0 }; // Initialize if not already present
            }
            yearlyTotals[year].total += entry.monthly_total; // Sum the monthly total gas for the year
            yearlyTotals[year].calculated += entry.monthly_total_calculated; // Sum the calculated monthly total gas for the year
        });
    
        // Convert the yearlyTotals object to an array of results
        const yearlyGasSummary = Object.entries(yearlyTotals).map(([year, totals]) => {
            console.log(`Yearly Total Calculated for ${year}: ${totals.calculated}`);
            return {
            year,
            yearly_total: totals.total,
            yearly_total_calculated: totals.calculated, // Include calculated yearly total
            };
        });
    
        return yearlyGasSummary; // Return the yearly gas summary
    },
    

    getGasRateForDate(gasRates, targetDate) {
        for (let rate of gasRates) {
            const startDate = rate.startDate;
            const endDate = rate.endDate || new Date();

            if (targetDate >= startDate && (!endDate || targetDate <= endDate)) {
                return rate.price;
            }
        }
        return 0;
    },

    async getAllGasData(year, plantId) {
        const gasRates = await this.getAllGasRates();
        const dailyGasData = await this.getDailyGas(plantId);
        
        // Get daily gas data for a specific year and plant ID
        const dailyGasCalculated = dailyGasData.map(item => {
            const utcDate = new Date(item.date); // Use the actual date for conversion
            const dateIST = convertToIST(utcDate); // Convert UTC date to IST
            const gasRate = this.getGasRateForDate(gasRates, dateIST); // Calculate gas rate using the converted date
    
            return {
                date: dateIST.toISOString().split('T')[0], // Format date to YYYY-MM-DD
                day_total: item.total_generated_gas || 0,
                day_total_calculated: (item.total_generated_gas || 0) * gasRate,
                price: gasRate,
                timestamp: dateIST // Include the IST timestamp for logging or further processing
            };
        });
    
        // Remove duplicates and aggregate daily gas totals
        const uniqueDailyGas = {};
        dailyGasCalculated.forEach(item => {
            if (!uniqueDailyGas[item.date]) {
                uniqueDailyGas[item.date] = {
                    date: item.date,
                    day_total: item.day_total,
                    day_total_calculated: item.day_total_calculated,
                    price: item.price,
                };
            } else {
                uniqueDailyGas[item.date].day_total += item.day_total;
                uniqueDailyGas[item.date].day_total_calculated += item.day_total_calculated;
            }
        });
    
        const dailyGasFinal = Object.values(uniqueDailyGas);
    
        // Prepare the final response
        const finalResponse = {
            gasRates,
            dailyGas: [],
            monthlyGas: [],
            yearlyGas: []
        };
    
        // Calculate Monthly gas totals
        const monthlyGasData = await this.getMonthlyGas(year, plantId);
        finalResponse.monthlyGas = monthlyGasData;
    
        // Calculate Yearly gas totals
        const yearlyGasData = await this.getYearlyGas(plantId);
        finalResponse.yearlyGas = yearlyGasData;
    
        // Populate daily gas data
        finalResponse.dailyGas = dailyGasFinal;
    
        return finalResponse; // Return the final response with all gas data
    },

};

// Example usage
// getFinalGeneratedGas('yourPlantIdHere').then(data => {
//     console.log(data);
// }).catch(err => {
//     console.error(err);
// });

module.exports = CalculatedGas;


















// const { fn, col, where, Op } = require('sequelize');
// const sequelize = require('../Database/sequelize');
// const DigesterData = require('./digesterData');
// const GasRate = require('./gasRate');

// // Helper function to convert UTC timestamp to IST
// function convertToIST(utcDate) {
//     const istOffset = 5 * 60 + 30; // IST is UTC +5:30
//     const istDate = new Date(utcDate.getTime() + istOffset * 60 * 1000);
//     return istDate;
// }

// const CalculatedGas = {
//     async getAllGasRates() {
//         const gasRates = await GasRate.findAll({
//             order: [['start_date', 'ASC']],
//             attributes: ['price', 'start_date', 'end_date']
//         });
//         return gasRates.map(rate => ({
//             price: rate.price,
//             startDate: new Date(rate.start_date), // Keep start_date in original format
//             endDate: rate.end_date ? new Date(rate.end_date) : null, // Keep end_date in original format if it exists
//         }));
//     },

//     async getDailyGas(year, plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('DATE', col('timestamp')), 'date'],
//                 [fn('SUM', col('final_generated_gas')), 'day_total'],
//                 [col('timestamp'), 'timestamp'] // Fetch the actual timestamp for conversion
//             ],
//             where: {
//                 ...(year && { [Op.and]: where(fn('YEAR', col('timestamp')), year) }),
//                 ...(plantId && { plant_id: plantId })
//             },
//             group: [fn('DATE', col('timestamp'))] // Group by date
//         });
//     },

//     async getMonthlyGas(year, plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('MONTH', col('timestamp')), 'month'],
//                 [fn('SUM', col('final_generated_gas')), 'monthly_total']
//             ],
//             where: {
//                 ...(year && { [Op.and]: where(fn('YEAR', col('timestamp')), year) }),
//                 ...(plantId && { plant_id: plantId })
//             },
//             group: [fn('MONTH', col('timestamp'))]
//         });
//     },

//     async getYearlyGas(plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('YEAR', col('timestamp')), 'year'],
//                 [fn('SUM', col('final_generated_gas')), 'yearly_total']
//             ],
//             where: plantId ? { plant_id: plantId } : {},
//             group: [fn('YEAR', col('timestamp'))]
//         });
//     },

//     getGasRateForDate(gasRates, targetDate) {
//         for (let rate of gasRates) {
//             const startDate = rate.startDate;
//             const endDate = rate.endDate || new Date();

//             if (targetDate >= startDate && (!endDate || targetDate <= endDate)) {
//                 return rate.price;
//             }
//         }
//         return 0;
//     },

//     async getAllGasData(year, plantId) {
//         const gasRates = await this.getAllGasRates();

//         // Calculate daily gas with IST conversion
//         const dailyGasData = await this.getDailyGas(year, plantId);
//         const dailyGasCalculated = dailyGasData.map(item => {
//             const utcDate = new Date(item.dataValues.timestamp); // Use the actual timestamp for conversion
//             const dateIST = convertToIST(utcDate); // Convert UTC timestamp to IST
//             const gasRate = this.getGasRateForDate(gasRates, dateIST); // Calculate gas rate using the converted date

//             return {
//                 date: dateIST.toISOString().split('T')[0], // Format date to YYYY-MM-DD
//                 day_total: item.dataValues.day_total || 0,
//                 day_total_calculated: (item.dataValues.day_total || 0) * gasRate,
//                 price: gasRate,
//             };
//         });

//         // Remove duplicates and aggregate daily gas totals
//         const uniqueDailyGas = {};
//         dailyGasCalculated.forEach(item => {
//             if (!uniqueDailyGas[item.date]) {
//                 uniqueDailyGas[item.date] = {
//                     date: item.date,
//                     day_total: item.day_total,
//                     day_total_calculated: item.day_total_calculated,
//                     price: item.price,
//                 };
//             } else {
//                 uniqueDailyGas[item.date].day_total += item.day_total;
//                 uniqueDailyGas[item.date].day_total_calculated += item.day_total_calculated;
//             }
//         });

//         const dailyGasFinal = Object.values(uniqueDailyGas);

//         // Filter and format the response for the required dates
//         const finalResponse = {
//             gasRates,
//             dailyGas: [],
//             monthlyGas: [],
//             yearlyGas: []
//         };

//         // Dates for which we need gas data
//         const requiredDates = ["2024-10-23", "2024-10-24"];

//         requiredDates.forEach(date => {
//             const gasForDate = dailyGasFinal.find(gas => gas.date === date);
//             finalResponse.dailyGas.push({
//                 date: gasForDate ? gasForDate.date : date,
//                 day_total: gasForDate ? gasForDate.day_total : 0,
//                 day_total_calculated: gasForDate ? gasForDate.day_total_calculated : 0,
//                 price: gasForDate ? gasForDate.price : 0,
//             });
//         });

//         // Monthly gas calculation if needed
//         const month = new Date(requiredDates[0]).getMonth() + 1; // Getting month from the first date
//         const monthlyTotal = dailyGasFinal
//             .filter(d => new Date(d.date).getMonth() + 1 === month)
//             .reduce((acc, curr) => ({
//                 day_total: acc.day_total + curr.day_total,
//                 day_total_calculated: acc.day_total_calculated + curr.day_total_calculated
//             }), { day_total: 0, day_total_calculated: 0 });

//         finalResponse.monthlyGas.push({
//             month,
//             monthly_total: monthlyTotal.day_total,
//             monthly_total_calculated: monthlyTotal.day_total_calculated,
//         });

//         // Yearly gas calculation
//         const yearlyTotal = dailyGasFinal.reduce((acc, curr) => ({
//             day_total: acc.day_total + curr.day_total,
//             day_total_calculated: acc.day_total_calculated + curr.day_total_calculated
//         }), { day_total: 0, day_total_calculated: 0 });

//         finalResponse.yearlyGas.push({
//             year: year,
//             yearly_total: yearlyTotal.day_total,
//             yearly_total_calculated: yearlyTotal.day_total_calculated,
//         });

//         return finalResponse;
//     },
// };

// module.exports = CalculatedGas;








// date chnge 
// const { fn, col, where, Op } = require('sequelize');
// const sequelize = require('../Database/sequelize');
// const DigesterData = require('./digesterData'); 
// const GasRate = require('./gasRate'); 

// // Helper function to convert UTC timestamp to IST
// function convertToIST(utcDate) {
//     const istOffset = 5 * 60 + 30; // IST is UTC +5:30
//     const istDate = new Date(utcDate.getTime() + istOffset * 60 * 1000);
//     return istDate;
// }

// const CalculatedGas = {
//     async getAllGasRates() {
//         const gasRates = await GasRate.findAll({
//             order: [['start_date', 'ASC']],
//             attributes: ['price', 'start_date', 'end_date']
//         });
//         return gasRates.map(rate => ({
//             price: rate.price,
//             startDate: new Date(rate.start_date), // Keep start_date in original format
//             endDate: rate.end_date ? new Date(rate.end_date) : null, // Keep end_date in original format if it exists
//         }));
//     },

//     async getDailyGas(year, plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('DATE', col('timestamp')), 'date'],
//                 [fn('SUM', col('final_generated_gas')), 'day_total'],
//                 [col('timestamp'), 'timestamp'] // Fetch the actual timestamp for conversion
//             ],
//             where: {
//                 ...(year && { [Op.and]: where(fn('YEAR', col('timestamp')), year) }),
//                 ...(plantId && { plant_id: plantId })
//             },
//             group: [fn('DATE', col('timestamp'))] // Group by date
//         });
//     },

//     async getMonthlyGas(year, plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('MONTH', col('timestamp')), 'month'],
//                 [fn('SUM', col('final_generated_gas')), 'monthly_total']
//             ],
//             where: {
//                 ...(year && { [Op.and]: where(fn('YEAR', col('timestamp')), year) }),
//                 ...(plantId && { plant_id: plantId })
//             },
//             group: [fn('MONTH', col('timestamp'))]
//         });
//     },

//     async getYearlyGas(plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('YEAR', col('timestamp')), 'year'],
//                 [fn('SUM', col('final_generated_gas')), 'yearly_total']
//             ],
//             where: plantId ? { plant_id: plantId } : {},
//             group: [fn('YEAR', col('timestamp'))]
//         });
//     },

//     getGasRateForDate(gasRates, targetDate) {
//         for (let rate of gasRates) {
//             const startDate = rate.startDate;
//             const endDate = rate.endDate || new Date();

//             if (targetDate >= startDate && (!endDate || targetDate <= endDate)) {
//                 return rate.price;
//             }
//         }
//         return 0;
//     },

//     async getAllGasData(year, plantId) {
//         const gasRates = await this.getAllGasRates();
        
//         // Calculate daily gas with IST conversion
//         const dailyGasData = await this.getDailyGas(year, plantId);
//         const dailyGasCalculated = dailyGasData.map(item => {
//             const utcDate = new Date(item.dataValues.timestamp); // Use the actual timestamp for conversion
//             const dateIST = convertToIST(utcDate); // Convert UTC timestamp to IST
//             const gasRate = this.getGasRateForDate(gasRates, dateIST); // Calculate gas rate using the converted date

//             return {
//                 date: dateIST.toISOString().split('T')[0], // Format date to YYYY-MM-DD
//                 day_total: item.dataValues.day_total || 0,
//                 day_total_calculated: (item.dataValues.day_total || 0) * gasRate,
//                 price: gasRate,
//             };
//         });

//         // Remove duplicates and aggregate daily gas totals
//         const uniqueDailyGas = {};
//         dailyGasCalculated.forEach(item => {
//             if (!uniqueDailyGas[item.date]) {
//                 uniqueDailyGas[item.date] = {
//                     date: item.date,
//                     day_total: item.day_total,
//                     day_total_calculated: item.day_total_calculated,
//                     price: item.price,
//                 };
//             } else {
//                 uniqueDailyGas[item.date].day_total += item.day_total;
//                 uniqueDailyGas[item.date].day_total_calculated += item.day_total_calculated;
//             }
//         });

//         const dailyGasFinal = Object.values(uniqueDailyGas);

//         // Filter and format the response for the required dates
//         const finalResponse = {
//             gasRates,
//             dailyGas: [],
//             monthlyGas: [],
//             yearlyGas: []
//         };

//         // Dates for which we need gas data
//         const requiredDates = ["2024-10-23", "2024-10-24"];

//         requiredDates.forEach(date => {
//             const gasForDate = dailyGasFinal.find(gas => gas.date === date);
//             finalResponse.dailyGas.push({
//                 date: gasForDate ? gasForDate.date : date,
//                 day_total: gasForDate ? gasForDate.day_total : 0,
//                 day_total_calculated: gasForDate ? gasForDate.day_total_calculated : 0,
//                 price: gasForDate ? gasForDate.price : 0,
//             });
//         });

//         // Monthly gas calculation if needed
//         const month = new Date(requiredDates[0]).getMonth() + 1; // Getting month from the first date
//         const monthlyTotal = dailyGasFinal
//             .filter(d => new Date(d.date).getMonth() + 1 === month)
//             .reduce((acc, curr) => ({
//                 day_total: acc.day_total + curr.day_total,
//                 day_total_calculated: acc.day_total_calculated + curr.day_total_calculated
//             }), { day_total: 0, day_total_calculated: 0 });

//         finalResponse.monthlyGas.push({
//             month,
//             monthly_total: monthlyTotal.day_total,
//             monthly_total_calculated: monthlyTotal.day_total_calculated,
//         });

//         // Yearly gas calculation
//         const yearlyTotal = dailyGasFinal.reduce((acc, curr) => ({
//             day_total: acc.day_total + curr.day_total,
//             day_total_calculated: acc.day_total_calculated + curr.day_total_calculated
//         }), { day_total: 0, day_total_calculated: 0 });

//         finalResponse.yearlyGas.push({
//             year: year,
//             yearly_total: yearlyTotal.day_total,
//             yearly_total_calculated: yearlyTotal.day_total_calculated,
//         });

//         return finalResponse;
//     },
// };

// module.exports = CalculatedGas;











// const { fn, col, where, Op } = require('sequelize');
// const sequelize = require('../Database/sequelize');
// const DigesterData = require('./digesterData'); 
// const GasRate = require('./gasRate'); 

// // Helper function to convert UTC timestamp to IST
// function convertToIST(utcDate) {
//     const istOffset = 5 * 60 + 30; // IST is UTC +5:30
//     const istDate = new Date(utcDate.getTime() + istOffset * 60 * 1000);
//     return istDate;
// }

// const CalculatedGas = {
//     async getAllGasRates() {
//         const gasRates = await GasRate.findAll({
//             order: [['start_date', 'ASC']],
//             attributes: ['price', 'start_date', 'end_date']
//         });
//         return gasRates.map(rate => ({
//             price: rate.price,
//             startDate: new Date(rate.start_date), // Keep start_date in original format
//             endDate: rate.end_date ? new Date(rate.end_date) : null, // Keep end_date in original format if it exists
//         }));
//     },

//     async getDailyGas(year, plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('DATE', col('timestamp')), 'date'],
//                 [fn('SUM', col('final_generated_gas')), 'day_total'],
//                 [col('timestamp'), 'timestamp'] // Fetch the actual timestamp for conversion
//             ],
//             where: {
//                 ...(year && { [Op.and]: where(fn('YEAR', col('timestamp')), year) }),
//                 ...(plantId && { plant_id: plantId })
//             },
//             group: [fn('DATE', col('timestamp'))]
//         });
//     },

//     async getMonthlyGas(year, plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('MONTH', col('timestamp')), 'month'],
//                 [fn('SUM', col('final_generated_gas')), 'monthly_total']
//             ],
//             where: {
//                 ...(year && { [Op.and]: where(fn('YEAR', col('timestamp')), year) }),
//                 ...(plantId && { plant_id: plantId })
//             },
//             group: [fn('MONTH', col('timestamp'))]
//         });
//     },

//     async getYearlyGas(plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('YEAR', col('timestamp')), 'year'],
//                 [fn('SUM', col('final_generated_gas')), 'yearly_total']
//             ],
//             where: plantId ? { plant_id: plantId } : {},
//             group: [fn('YEAR', col('timestamp'))]
//         });
//     },

//     // Get gas rate based on date (keep gas rate dates in original format)
//     getGasRateForDate(gasRates, targetDate) {
//         for (let rate of gasRates) {
//             const startDate = rate.startDate; // Keep startDate in original format
//             const endDate = rate.endDate || new Date(); // Use today's date if no end date is defined

//             if (targetDate >= startDate && (!endDate || targetDate <= endDate)) {
//                 return rate.price;
//             }
//         }
//         return 0;
//     },

//     async getAllGasData(year, plantId) {
//         const gasRates = await this.getAllGasRates();
        
//         // Calculate daily gas with IST conversion
//         const dailyGasData = await this.getDailyGas(year, plantId);
//         const dailyGasCalculated = dailyGasData.map(item => {
//             const utcDate = new Date(item.dataValues.timestamp); // Use the actual timestamp for conversion
//             const dateIST = convertToIST(utcDate); // Convert UTC timestamp to IST
//             console.log(`Daily Data Date (IST): ${dateIST}`); // Log the date after conversion to IST
//             const gasRate = this.getGasRateForDate(gasRates, dateIST); // Calculate gas rate using the converted date

//             return {
//                 date: dateIST, // Store date in IST
//                 day_total: item.dataValues.day_total || 0,
//                 day_total_calculated: (item.dataValues.day_total || 0) * gasRate,
//                 price: gasRate,
//             };
//         });

//         // Calculate monthly gas with IST conversion
//         const monthlyGasData = await this.getMonthlyGas(year, plantId);
//         const monthlyGasCalculated = monthlyGasData.map(item => {
//             const month = item.dataValues.month;
//             const monthlyTotal = dailyGasCalculated
//                 .filter(d => new Date(d.date).getMonth() + 1 === month)
//                 .reduce((acc, curr) => ({
//                     day_total: acc.day_total + curr.day_total,
//                     day_total_calculated: acc.day_total_calculated + curr.day_total_calculated
//                 }), { day_total: 0, day_total_calculated: 0 });
            
//             return {
//                 month,
//                 monthly_total: monthlyTotal.day_total,
//                 monthly_total_calculated: monthlyTotal.day_total_calculated,
//             };
//         });

//         // Calculate yearly gas with IST conversion
//         const yearlyGasData = await this.getYearlyGas(plantId);
//         const yearlyGasCalculated = yearlyGasData.map(item => {
//             const year = item.dataValues.year;
//             const yearlyTotal = monthlyGasCalculated.reduce((acc, curr) => ({
//                 monthly_total: acc.monthly_total + curr.monthly_total,
//                 monthly_total_calculated: acc.monthly_total_calculated + curr.monthly_total_calculated
//             }), { monthly_total: 0, monthly_total_calculated: 0 });
            
//             return {
//                 year,
//                 yearly_total: yearlyTotal.monthly_total,
//                 yearly_total_calculated: yearlyTotal.monthly_total_calculated,
//             };
//         });

//         return {
//             gasRates,
//             dailyGas: dailyGasCalculated,
//             monthlyGas: monthlyGasCalculated,
//             yearlyGas: yearlyGasCalculated
//         };
//     },
// };

// module.exports = CalculatedGas;








// const CalculatedGas = {
//     async getAllGasRates() {
//         const gasRates = await GasRate.findAll({
//             order: [['start_date', 'ASC']],
//             attributes: ['price', 'start_date', 'end_date']
//         });
//         return gasRates.map(rate => ({
//             price: rate.price,
//             startDate: new Date(rate.start_date),
//             endDate: rate.end_date ? new Date(rate.end_date) : null,
//         }));
//     },

//     async getDailyGas(year, plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('DATE', col('timestamp')), 'date'],
//                 [fn('SUM', col('final_generated_gas')), 'day_total']
//             ],
//             where: {
//                 ...(year && { [Op.and]: where(fn('YEAR', col('timestamp')), year) }),
//                 ...(plantId && { plant_id: plantId })
//             },
//             group: [fn('DATE', col('timestamp'))]
//         });
//     },

//     async getMonthlyGas(year, plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('MONTH', col('timestamp')), 'month'],
//                 [fn('SUM', col('final_generated_gas')), 'monthly_total']
//             ],
//             where: {
//                 ...(year && { [Op.and]: where(fn('YEAR', col('timestamp')), year) }),
//                 ...(plantId && { plant_id: plantId })
//             },
//             group: [fn('MONTH', col('timestamp'))]
//         });
//     },

//     async getYearlyGas(plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('YEAR', col('timestamp')), 'year'],
//                 [fn('SUM', col('final_generated_gas')), 'yearly_total']
//             ],
//             where: plantId ? { plant_id: plantId } : {},
//             group: [fn('YEAR', col('timestamp'))]
//         });
//     },

//     // Get gas rate based on date
//     getGasRateForDate(gasRates, targetDate) {
//         for (let rate of gasRates) {
//             const startDate = rate.startDate;
//             const endDate = rate.endDate || new Date(); // Use today's date if no end date is defined

//             if (targetDate >= startDate && (!endDate || targetDate <= endDate)) {
//                 return rate.price;
//             }
//         }
//         return 0;
//     },

//     async getAllGasData(year, plantId) {
//         const gasRates = await this.getAllGasRates();
        
//         // Calculate daily gas
//         const dailyGasData = await this.getDailyGas(year, plantId);
//         const dailyGasCalculated = dailyGasData.map(item => {
//             const date = new Date(item.dataValues.date); // Ensure date object format
//             const gasRate = this.getGasRateForDate(gasRates, date); // Get rate for each date

//             return {
//                 date: item.dataValues.date,
//                 day_total: item.dataValues.day_total || 0,
//                 day_total_calculated: (item.dataValues.day_total || 0) * gasRate,
//                 price: gasRate,
//             };
//         });

//         // Calculate monthly gas
//         const monthlyGasData = await this.getMonthlyGas(year, plantId);
//         const monthlyGasCalculated = monthlyGasData.map(item => {
//             const month = item.dataValues.month;
//             const monthlyTotal = dailyGasCalculated
//                 .filter(d => new Date(d.date).getMonth() + 1 === month)
//                 .reduce((acc, curr) => ({
//                     day_total: acc.day_total + curr.day_total,
//                     day_total_calculated: acc.day_total_calculated + curr.day_total_calculated
//                 }), { day_total: 0, day_total_calculated: 0 });
            
//             return {
//                 month,
//                 monthly_total: monthlyTotal.day_total,
//                 monthly_total_calculated: monthlyTotal.day_total_calculated,
//             };
//         });

//         // Calculate yearly gas
//         const yearlyGasData = await this.getYearlyGas(plantId);
//         const yearlyGasCalculated = yearlyGasData.map(item => {
//             const year = item.dataValues.year;
//             const yearlyTotal = monthlyGasCalculated.reduce((acc, curr) => ({
//                 monthly_total: acc.monthly_total + curr.monthly_total,
//                 monthly_total_calculated: acc.monthly_total_calculated + curr.monthly_total_calculated
//             }), { monthly_total: 0, monthly_total_calculated: 0 });
            
//             return {
//                 year,
//                 yearly_total: yearlyTotal.monthly_total,
//                 yearly_total_calculated: yearlyTotal.monthly_total_calculated,
//             };
//         });

//         return {
//             gasRates,
//             dailyGas: dailyGasCalculated,
//             monthlyGas: monthlyGasCalculated,
//             yearlyGas: yearlyGasCalculated
//         };
//     },
// };

// module.exports = CalculatedGas;






















// const { fn, col, where, Op } = require('sequelize');
// const sequelize = require('../Database/sequelize');
// const DigesterData = require('./digesterData'); 
// const GasRate = require('./gasRate'); 

// const CalculatedGas = {
//     async getAllGasRates() {
//         const gasRates = await GasRate.findAll({
//             order: [['start_date', 'ASC']],
//             attributes: ['price', 'start_date', 'end_date']
//         });
//         return gasRates.map(rate => ({
//             price: rate.price,
//             startDate: new Date(rate.start_date),
//             endDate: rate.end_date ? new Date(rate.end_date) : null,
//         }));
//     },

//     async getDailyGas(year, plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('DATE', col('timestamp')), 'date'],
//                 [fn('SUM', col('final_generated_gas')), 'day_total']
//             ],
//             where: {
//                 ...(year && { [Op.and]: where(fn('YEAR', col('timestamp')), year) }),
//                 ...(plantId && { plant_id: plantId })
//             },
//             group: [fn('DATE', col('timestamp'))]
//         });
//     },

//     async getMonthlyGas(year, plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('MONTH', col('timestamp')), 'month'],
//                 [fn('SUM', col('final_generated_gas')), 'monthly_total']
//             ],
//             where: {
//                 ...(year && { [Op.and]: where(fn('YEAR', col('timestamp')), year) }),
//                 ...(plantId && { plant_id: plantId })
//             },
//             group: [fn('MONTH', col('timestamp'))]
//         });
//     },

//     async getYearlyGas(plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('YEAR', col('timestamp')), 'year'],
//                 [fn('SUM', col('final_generated_gas')), 'yearly_total']
//             ],
//             where: plantId ? { plant_id: plantId } : {},
//             group: [fn('YEAR', col('timestamp'))]
//         });
//     },

//     getGasRateForDate(gasRates, targetDate) {
//         for (let rate of gasRates) {
//             const startDate = new Date(rate.startDate);
//             const endDate = rate.endDate ? new Date(rate.endDate) : null;
    
//             if (
//                 (targetDate >= startDate) &&
//                 (!endDate || targetDate <= endDate)
//             ) {
//                 return rate.price;
//             }
//         }
//         return 0;
//     },
//     async getAllGasData(year, plantId) {
//         const gasRates = await this.getAllGasRates();
        
//         const dailyGasData = await this.getDailyGas(year, plantId);
//         const dailyGasCalculated = dailyGasData.map(item => {
//             const date = item.dataValues.date;
//             const gasRate = this.getGasRateForDate(gasRates, date);

//             console.log("sdhnvbgsj",date);
            
//             return {
//                 date,
//                 day_total: item.dataValues.day_total || 0,
//                 day_total_calculated: (item.dataValues.day_total || 0) * gasRate,
//                 price: gasRate,
//             };
//         });

//         const monthlyGasData = await this.getMonthlyGas(year, plantId);
//         const monthlyGasCalculated = monthlyGasData.map(item => {
//             const month = item.dataValues.month;
//             const monthlyTotal = dailyGasCalculated
//                 .filter(d => new Date(d.date).getMonth() + 1 === month)
//                 .reduce((acc, curr) => ({
//                     day_total: acc.day_total + curr.day_total,
//                     day_total_calculated: acc.day_total_calculated + curr.day_total_calculated
//                 }), { day_total: 0, day_total_calculated: 0 });
            
//             return {
//                 month,
//                 monthly_total: monthlyTotal.day_total,
//                 monthly_total_calculated: monthlyTotal.day_total_calculated,
//             };
//         });

//         const yearlyGasData = await this.getYearlyGas(plantId);
//         const yearlyGasCalculated = yearlyGasData.map(item => {
//             const year = item.dataValues.year;
//             const yearlyTotal = monthlyGasCalculated.reduce((acc, curr) => ({
//                 monthly_total: acc.monthly_total + curr.monthly_total,
//                 monthly_total_calculated: acc.monthly_total_calculated + curr.monthly_total_calculated
//             }), { monthly_total: 0, monthly_total_calculated: 0 });
            
//             return {
//                 year,
//                 yearly_total: yearlyTotal.monthly_total,
//                 yearly_total_calculated: yearlyTotal.monthly_total_calculated,
//             };
//         });

//         return {
//             gasRates,
//             dailyGas: dailyGasCalculated,
//             monthlyGas: monthlyGasCalculated,
//             yearlyGas: yearlyGasCalculated
//         };
//     },
// };

// module.exports = CalculatedGas;















//29-10
// const { fn, col, where, Op } = require('sequelize');
// const sequelize = require('../Database/sequelize');
// const DigesterData = require('./digesterData'); 
// const GasRate = require('./gasRate'); 

// const CalculatedGas = {
//     async getAllGasRates() {
//         const gasRates = await GasRate.findAll({
//             order: [['start_date', 'ASC']],
//             attributes: ['price', 'start_date', 'end_date']
//         });
//         return gasRates.map(rate => ({
//             price: rate.price,
//             startDate: rate.start_date,
//             endDate: rate.end_date || null,
//         }));
//     },

//     async getDailyGas(year, plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('DATE', col('timestamp')), 'date'],
//                 [fn('SUM', col('final_generated_gas')), 'day_total']
//             ],
//             where: {
//                 ...(year && { [Op.and]: where(fn('YEAR', col('timestamp')), year) }),
//                 ...(plantId && { plant_id: plantId })
//             },
//             group: [fn('DATE', col('timestamp'))]
//         });
//     },

//     async getMonthlyGas(year, plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('MONTH', col('timestamp')), 'month'],
//                 [fn('SUM', col('final_generated_gas')), 'monthly_total']
//             ],
//             where: {
//                 ...(year && { [Op.and]: where(fn('YEAR', col('timestamp')), year) }),
//                 ...(plantId && { plant_id: plantId })
//             },
//             group: [fn('MONTH', col('timestamp'))]
//         });
//     },

//     async getYearlyGas(plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('YEAR', col('timestamp')), 'year'],
//                 [fn('SUM', col('final_generated_gas')), 'yearly_total']
//             ],
//             where: plantId ? { plant_id: plantId } : {},
//             group: [fn('YEAR', col('timestamp'))]
//         });
//     },

//     getGasRateForDate(gasRates, date) {
//         return gasRates.find(rate => {
//             const startDate = new Date(rate.startDate);
//             const endDate = rate.endDate ? new Date(rate.endDate) : null;
//             return date >= startDate && (!endDate || date <= endDate);
//         })?.price || 0;
//     },

//     async getAllGasData(year, plantId) {
//         const gasRates = await this.getAllGasRates();
        
//         const dailyGasData = await this.getDailyGas(year, plantId);
//         const dailyGasCalculated = dailyGasData.map(item => {
//             const date = new Date(item.dataValues.date);
//             const gasRate = this.getGasRateForDate(gasRates, date);
            
//             return {
//                 date: item.dataValues.date,
//                 day_total: item.dataValues.day_total || 0,
//                 day_total_calculated: (item.dataValues.day_total || 0) * gasRate,
//                 price: gasRate,
//             };
//         });

//         const monthlyGasData = await this.getMonthlyGas(year, plantId);
//         const monthlyGasCalculated = monthlyGasData.map(item => {
//             const month = item.dataValues.month;
//             const monthlyTotal = dailyGasCalculated
//                 .filter(d => new Date(d.date).getMonth() + 1 === month)
//                 .reduce((acc, curr) => ({
//                     day_total: acc.day_total + curr.day_total,
//                     day_total_calculated: acc.day_total_calculated + curr.day_total_calculated
//                 }), { day_total: 0, day_total_calculated: 0 });
            
//             return {
//                 month,
//                 monthly_total: monthlyTotal.day_total,
//                 monthly_total_calculated: monthlyTotal.day_total_calculated,
//             };
//         });

//         const yearlyGasData = await this.getYearlyGas(plantId);
//         const yearlyGasCalculated = yearlyGasData.map(item => {
//             const year = item.dataValues.year;
//             const yearlyTotal = monthlyGasCalculated.reduce((acc, curr) => ({
//                 monthly_total: acc.monthly_total + curr.monthly_total,
//                 monthly_total_calculated: acc.monthly_total_calculated + curr.monthly_total_calculated
//             }), { monthly_total: 0, monthly_total_calculated: 0 });
            
//             return {
//                 year,
//                 yearly_total: yearlyTotal.monthly_total,
//                 yearly_total_calculated: yearlyTotal.monthly_total_calculated,
//             };
//         });

//         return {
//             gasRates,
//             dailyGas: dailyGasCalculated,
//             monthlyGas: monthlyGasCalculated,
//             yearlyGas: yearlyGasCalculated
//         };
//     },
// };

// module.exports = CalculatedGas;







// // latest code
// const { fn, col, where, Op } = require('sequelize'); // Added Op for operators
// const sequelize = require('../Database/sequelize');
// const DigesterData = require('./digesterData'); 
// const GasRate = require('./gasRate'); 

// const CalculatedGas = {
//     async getGasRate() {
//         const result = await GasRate.findOne({
//             order: [['createdAt', 'DESC']]
//         });
//         return result ? result.price : 0;
//     },

//     async getDailyGas(year, plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('DAY', col('timestamp')), 'day'],
//                 [fn('SUM', col('final_generated_gas')), 'daily_gas_production'], // Use final_generated_gas here
//             ],
//             where: {
//                 ...(year && { [Op.and]: where(fn('YEAR', col('timestamp')), year) }),
//                 ...(plantId && { plant_id: plantId })
//             },
//             group: [fn('DAY', col('timestamp'))],
//         });
//     },

//     async getMonthlyGas(year, plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('MONTH', col('timestamp')), 'month'],
//                 [fn('SUM', col('final_generated_gas')), 'monthly_gas_production'], // Use final_generated_gas here
//             ],
//             where: {
//                 ...(year && { [Op.and]: where(fn('YEAR', col('timestamp')), year) }),
//                 ...(plantId && { plant_id: plantId })
//             },
//             group: [fn('MONTH', col('timestamp'))],
//         });
//     },

//     async getYearlyGas(plantId) {
//         return await DigesterData.findAll({
//             attributes: [
//                 [fn('YEAR', col('timestamp')), 'year'],
//                 [fn('SUM', col('final_generated_gas')), 'yearly_gas_production'], // Use final_generated_gas here
//             ],
//             where: plantId ? { plant_id: plantId } : {},
//             group: [fn('YEAR', col('timestamp'))],
//         });
//     },

//     async getAllGasData(year, plantId) {
//         const gasRate = await this.getGasRate();
        
//         const dailyGas = await this.getDailyGas(year, plantId);
//         const monthlyGas = await this.getMonthlyGas(year, plantId);
//         const yearlyGas = await this.getYearlyGas(plantId);

//         const dailyGasCalculated = dailyGas.map(item => ({
//             day: item.dataValues.day,
//             day_total: item.dataValues.daily_gas_production || 0,
//             day_total_calculated: (item.dataValues.daily_gas_production || 0) * gasRate,
//         }));

//         const monthlyGasWithRate = monthlyGas.map(item => ({
//             month: item.dataValues.month,
//             monthly_total: item.dataValues.monthly_gas_production || 0,
//             monthly_total_calculated: (item.dataValues.monthly_gas_production || 0) * gasRate,
//         }));

//         const yearlyGasWithRate = yearlyGas.map(item => ({
//             year: item.dataValues.year,
//             yearly_total: item.dataValues.yearly_gas_production || 0,
//         }));




// // async getAllGasData(year, plantId) {
// //     // Fetch all gas rate entries ordered by start_date
// //     const gasRates = await GasRate.findAll({
// //         order: [['start_date', 'ASC']],
// //     });

// //     // Fetch daily, monthly, and yearly gas production data
// //     const dailyGas = await this.getDailyGas(year, plantId);
// //     const monthlyGas = await this.getMonthlyGas(year, plantId);
// //     const yearlyGas = await this.getYearlyGas(plantId);

// //     // Helper function to get the appropriate gas rate for a given date
// //     const getGasRateForDate = (date) => {
// //         const applicableRate = gasRates.find(rate => {
// //             const startDate = new Date(rate.start_date);
// //             const endDate = rate.end_date ? new Date(rate.end_date) : null;
// //             return date >= startDate && (!endDate || date <= endDate);
// //         });
// //         return applicableRate ? applicableRate.price : 0;
// //     };

// //     // Map through daily gas and apply the gas rate for each date
// //     const dailyGasCalculated = dailyGas.map(item => {
// //         const date = new Date(item.dataValues.day); // assuming day is a Date or timestamp
// //         const gasRate = getGasRateForDate(date);
        
// //         return {
// //             day: item.dataValues.day,
// //             day_total: item.dataValues.daily_gas_production || 0,
// //             day_total_calculated: (item.dataValues.daily_gas_production || 0) * gasRate,
// //         };
// //     });

// //     // Map through monthly gas and apply the gas rate based on the first day of the month
// //     const monthlyGasWithRate = monthlyGas.map(item => {
// //         const date = new Date(item.dataValues.month + '-01'); // assuming month is in YYYY-MM format
// //         const gasRate = getGasRateForDate(date);
        
// //         return {
// //             month: item.dataValues.month,
// //             monthly_total: item.dataValues.monthly_gas_production || 0,
// //             monthly_total_calculated: (item.dataValues.monthly_gas_production || 0) * gasRate,
// //         };
// //     });

// //     // Yearly gas data might not need a calculation per date if it's an annual sum
// //     const yearlyGasWithRate = yearlyGas.map(item => ({
// //         year: item.dataValues.year,
// //         yearly_total: item.dataValues.yearly_gas_production || 0,
// //     }));

//         return { gasRate, dailyGas: dailyGasCalculated, monthlyGas: monthlyGasWithRate, yearlyGas: yearlyGasWithRate };
//     },
// };




// module.exports = CalculatedGas;

