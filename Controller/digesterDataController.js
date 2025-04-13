const { DigesterData, Digester, User, Plant } = require('../Models');

const redisClient = require('../Database/redisClient');
const digesterQueue = require('../Queues/digesterDataQueue');
const moment = require('moment');

const { Op } = require('sequelize');
const Joi = require('joi');
const GeneratedGas = require('../Models/generatedGas');

// Validate digester_id function
const isValidId = (id) => {
    return typeof id === 'number' && id > 0;
};

/**
 * Process incoming digester data
 */
const processDigesterData = async (req, res) => {
    const { data } = req.body;

    try {
        // Filter out entries where all data values are null
        const nonEmptyDataEntries = data.filter(d =>
            d.pH !== null || d.pressure !== null || d.temperature !== null || d.generated_gas !== null
        ).map(d => ({
            digester_id: d.digester_id,
            timestamp: new Date(),
            pH: d.pH,
            pressure: d.pressure,
            temperature: d.temperature,
            generated_gas: d.generated_gas,
        }));

        if (nonEmptyDataEntries.length > 0) {
            // Add non-empty data to the queue for background processing
            await digesterQueue.add(nonEmptyDataEntries);

            // Cache the latest non-empty data in Redis
            for (let entry of nonEmptyDataEntries) {
                redisClient.set(`digester:${entry.digester_id}`, JSON.stringify(entry), 'EX', 600); // Set a 10-minute expiry
            }
        }

        res.status(200).json({ message: 'Data queued for processing and cached' });
    } catch (error) {
        console.error('Error processing digester data:', error);
        res.status(500).json({ error: 'An error occurred while processing the data' });
    }
};




// const digesterDataSchema = Joi.object({
//     digester_id: Joi.number().required(),
//     digester_name: Joi.string().required(),
//     pH: Joi.number().required(), // Case-sensitive key as per your model
//     pressure: Joi.number().required(),
//     temperature: Joi.number().required(),
//     generated_gas: Joi.number().required(),
//     feed: Joi.number().required(),
//     timestamp: Joi.date().iso().required()
// });

// const receiveDigesterData = async (req, res) => {
//     try {
//         // Check if the user has admin rights
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
//         }

//         // Ensure the request body is an array
//         const dataArray = req.body;
//         if (!Array.isArray(dataArray)) {
//             return res.status(400).json({ message: 'Data should be an array of objects' });
//         }

//         console.log('Received data:', dataArray);

//         const savedData = [];

//         for (let data of dataArray) {
//             // Remove `id` from data before validation
//             const { id, ...dataWithoutId } = data;

//             // Validate the data schema without `id`
//             const { error } = digesterDataSchema.validate(dataWithoutId);
//             if (error) {
//                 console.error('Validation error:', error.details);
//                 return res.status(400).json({ message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
//             }

//             // Process timestamp
//             let effectiveTimestamp = new Date(data.timestamp);

//             if (isNaN(effectiveTimestamp.getTime())) {
//                 return res.status(400).json({ message: 'Invalid timestamp format' });
//             } else {
//                 // Convert to ISO 8601 format
//                 data.timestamp = effectiveTimestamp.toISOString();
//             }

//             // Check if feed data already exists for the given date and digester
//             const existingFeedData = await DigesterData.findOne({
//                 where: {
//                     digester_id: data.digester_id,
//                     timestamp: {
//                         [Op.gte]: new Date(effectiveTimestamp).setHours(0, 0, 0, 0),
//                         [Op.lt]: new Date(effectiveTimestamp).setHours(23, 59, 59, 999),
//                     }
//                 }
//             });

//             let feedValue = data.feed; // Use provided feed value

//             if (existingFeedData) {
//                 // If feed data exists for this date, reuse it
//                 feedValue = existingFeedData.feed;
//             }

//             // Fetch the most recent record for this digester to calculate final_generated_gas
//             const previousData = await DigesterData.findOne({
//                 where: { digester_id: data.digester_id },
//                 order: [['timestamp', 'DESC']],
//             });

//             // Calculate final_generated_gas based on the previous record
//             let final_generated_gas = 0; // Default to 0 if no previous data exists
//             if (previousData) {
//                 final_generated_gas = Math.abs(data.generated_gas - previousData.generated_gas);
//             }

//             // Update the data object with the calculated values
//             data.feed = feedValue;
//             data.final_generated_gas = final_generated_gas;

//             if (id) {
//                 // Update the existing record if an id is provided
//                 const [affectedRows] = await DigesterData.update({
//                     ...data,
//                     timestamp: data.timestamp // Ensure timestamp is correctly formatted
//                 }, {
//                     where: { id: id },
//                 });

//                 if (affectedRows === 0) {
//                     return res.status(404).json({ message: `Data with id ${id} not found` });
//                 }
//                 savedData.push(await DigesterData.findByPk(id));
//             } else {
//                 // Create a new record if no id is provided
//                 const savedRecord = await DigesterData.create({
//                     ...data,
//                     timestamp: data.timestamp // Ensure timestamp is correctly formatted
//                 });
//                 savedData.push(savedRecord);
//             }
//         }

//         console.log('Data successfully processed:', savedData);
//         res.status(200).json({ message: `${savedData.length} data entries processed successfully`, data: savedData });
//     } catch (err) {
//         console.error('Error receiving digester data:', err);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };















    // const digesterDataSchema = Joi.object({
    //     digester_id: Joi.number().required(),
    //     digester_name: Joi.string().required(),
    //     pH: Joi.number().required(), // Case-sensitive key as per your model
    //     pressure: Joi.number().required(),
    //     temperature: Joi.number().required(),
    //     generated_gas: Joi.number().required(),
    //     timestamp: Joi.date().iso().required()
    // });

   
    
    // const receiveDigesterData = async (req, res) => {
    //     try {
    //         // Check if the user has admin rights
    //         if (req.user.role !== 'admin') {
    //             return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
    //         }
    
    //         // Ensure the request body is an array
    //         const dataArray = req.body;
    //         if (!Array.isArray(dataArray)) {
    //             return res.status(400).json({ message: 'Data should be an array of objects' });
    //         }
    
    //         console.log('Received data:', dataArray);
    
    //         const savedData = [];
    
    //         for (let data of dataArray) {
    //             // Remove `id` from data before validation
    //             const { id, ...dataWithoutId } = data;
    
    //             // Validate the data schema without `id`
    //             const { error } = digesterDataSchema.validate(dataWithoutId);
    //             if (error) {
    //                 console.error('Validation error:', error.details);
    //                 return res.status(400).json({ message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
    //             }
    
    //             // Validate digester_id and check if digester_name matches the database
    //             const digester = await Digester.findByPk(data.digester_id);
    //             if (!digester) {
    //                 return res.status(404).json({ message: `Digester with ID ${data.digester_id} not found` });
    //             }
    
    //             // Check if the digester_name matches the digester found in the database
    //             if (digester.name !== data.digester_name) {
    //                 return res.status(400).json({ message: `Digester name does not match the digester ID ${data.digester_id}` });
    //             }
    
    //             // Process timestamp
    //             let effectiveTimestamp = new Date(data.timestamp);
    //             if (isNaN(effectiveTimestamp.getTime())) {
    //                 return res.status(400).json({ message: 'Invalid timestamp format' });
    //             } else {
    //                 // Convert to ISO 8601 format
    //                 data.timestamp = effectiveTimestamp.toISOString();
    //             }
    
    //             // Fetch the most recent record for this digester to calculate final_generated_gas
    //             const previousData = await DigesterData.findOne({
    //                 where: { digester_id: data.digester_id },
    //                 order: [['timestamp', 'DESC']],
    //             });
    
    //             // Calculate final_generated_gas based on the previous record
    //             let final_generated_gas = 0; // Default to 0 if no previous data exists
    //             if (previousData) {
    //                 final_generated_gas = Math.abs((data.generated_gas || 0) - previousData.generated_gas);
    //             }
    
    //             // Set default values for missing data
    //             data.pH = data.pH !== undefined ? data.pH : 0;
    //             data.pressure = data.pressure !== undefined ? data.pressure : 0;
    //             data.temperature = data.temperature !== undefined ? data.temperature : 0;
    //             data.generated_gas = data.generated_gas !== undefined ? data.generated_gas : 0;
    //             data.final_generated_gas = final_generated_gas;
    
    //             if (id) {
    //                 // Update the existing record if an id is provided
    //                 const [affectedRows] = await DigesterData.update({
    //                     ...data,
    //                     timestamp: data.timestamp, // Ensure timestamp is correctly formatted
    //                 }, {
    //                     where: { id: id },
    //                 });
    
    //                 if (affectedRows === 0) {
    //                     return res.status(404).json({ message: `Data with id ${id} not found` });
    //                 }
    
    //                 savedData.push(await DigesterData.findByPk(id));
    //             } else {
    //                 // Create a new record if no id is provided
    //                 const savedRecord = await DigesterData.create({
    //                     ...data,
    //                     timestamp: data.timestamp, // Ensure timestamp is correctly formatted
    //                 });
    //                 savedData.push(savedRecord);
    //             }
    //         }
    
    //         console.log('Data successfully processed:', savedData);
    //         res.status(201).json({ message: `${savedData.length} data entries processed successfully`, data: savedData });
    //     } catch (err) {
    //         console.error('Error receiving digester data:', err);
    //         res.status(500).json({ message: 'Internal server error' });
    //     }
    // };
        









    const digesterDataSchema = Joi.object({
        digester_id: Joi.number().required(),
        digester_name: Joi.string().required(),
        pH: Joi.number().required(),
        pressure: Joi.number().required(),
        temperature: Joi.number().required(),
        generated_gas: Joi.number().required(),
        timestamp: Joi.date().iso().required(),
        plant_id: Joi.number().required() // Added plant_id validation
    });
    
    // const receiveDigesterData = async (req, res) => {
    //     try {
    //         // Check if the user has admin rights
    //         if (req.user.role !== 'admin') {
    //             return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
    //         }
    
    //         // Ensure the request body is an array
    //         const dataArray = req.body;
    //         if (!Array.isArray(dataArray)) {
    //             return res.status(400).json({ message: 'Data should be an array of objects' });
    //         }
    
    //         console.log('Received data:', dataArray);
    
    //         const savedData = [];
    
    //         for (let data of dataArray) {
    //             // Remove `id` from data before validation
    //             const { id, ...dataWithoutId } = data;
    
    //             // Validate the data schema without `id`
    //             const { error } = digesterDataSchema.validate(dataWithoutId);
    //             if (error) {
    //                 console.error('Validation error:', error.details);
    //                 return res.status(400).json({ message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
    //             }
    
    //             // Validate digester_id and check if digester_name matches the database
    //             const digester = await Digester.findByPk(data.digester_id);
    //             if (!digester) {
    //                 return res.status(404).json({ message: `Digester with ID ${data.digester_id} not found` });
    //             }
    
    //             // Check if the digester_name matches the digester found in the database
    //             if (digester.name !== data.digester_name) {
    //                 return res.status(400).json({ message: `Digester name does not match the digester ID ${data.digester_id}` });
    //             }
    
    //             // Process timestamp
    //             let effectiveTimestamp = new Date(data.timestamp);
    //             if (isNaN(effectiveTimestamp.getTime())) {
    //                 return res.status(400).json({ message: 'Invalid timestamp format' });
    //             } else {
    //                 // Convert to ISO 8601 format
    //                 data.timestamp = effectiveTimestamp.toISOString();
    //             }
    
    //             // Check if there is any previous data for the plant to calculate `final_generated_gas`
    //             const previousData = await DigesterData.findOne({
    //                 where: { plant_id: data.plant_id },
    //                 order: [['timestamp', 'DESC']],
    //             });
    
    //             // Calculate `final_generated_gas` for the plant
    //             let final_generated_gas = 0; // Default to 0 if no previous data exists
    //             if (previousData) {
    //                 final_generated_gas = Math.abs((data.generated_gas || 0) - previousData.generated_gas);
    //             }
    
    //             // Set default values for missing data
    //             data.pH = data.pH !== undefined ? data.pH : 0;
    //             data.pressure = data.pressure !== undefined ? data.pressure : 0;
    //             data.temperature = data.temperature !== undefined ? data.temperature : 0;
    //             data.generated_gas = data.generated_gas !== undefined ? data.generated_gas : 0;
    //             data.final_generated_gas = final_generated_gas;
    
    //             if (id) {
    //                 // Update the existing record if an id is provided
    //                 const [affectedRows] = await DigesterData.update({
    //                     ...data,
    //                     timestamp: data.timestamp, // Ensure timestamp is correctly formatted
    //                 }, {
    //                     where: { id: id },
    //                 });
    
    //                 if (affectedRows === 0) {
    //                     return res.status(404).json({ message: `Data with id ${id} not found` });
    //                 }
    
    //                 savedData.push(await DigesterData.findByPk(id));
    //             } else {
    //                 // Create a new record if no id is provided
    //                 const savedRecord = await DigesterData.create({
    //                     ...data,
    //                     timestamp: data.timestamp, // Ensure timestamp is correctly formatted
    //                 });
    //                 savedData.push(savedRecord);
    //             }
    //         }
    
    //         console.log('Data successfully processed:', savedData);
    //         res.status(201).json({ message: `${savedData.length} data entries processed successfully`, data: savedData });
    //     } catch (err) {
    //         console.error('Error receiving digester data:', err);
    //         res.status(500).json({ message: 'Internal server error' });
    //     }
    // };
    










    // const receiveDigesterData = async (req, res) => {
    //     try {
    //         // Check if the user has admin rights
    //         if (req.user.role !== 'admin') {
    //             return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
    //         }
    
    //         // Ensure the request body is an array
    //         const dataArray = req.body;
    //         if (!Array.isArray(dataArray)) {
    //             return res.status(400).json({ message: 'Data should be an array of objects' });
    //         }
    
    //         console.log('Received data:', dataArray);
    
    //         const savedData = [];
    
    //         for (let data of dataArray) {
    //             // Remove `id` from data before validation
    //             const { id, ...dataWithoutId } = data;
    
    //             // Validate the data schema without `id`
    //             const { error } = digesterDataSchema.validate(dataWithoutId);
    //             if (error) {
    //                 console.error('Validation error:', error.details);
    //                 return res.status(400).json({ message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
    //             }
    
    //             // Validate digester_id and check if digester_name matches the database
    //             const digester = await Digester.findByPk(data.digester_id);
    //             if (!digester) {
    //                 return res.status(404).json({ message: `Digester with ID ${data.digester_id} not found` });
    //             }
    
    //             // Check if the digester_name matches the digester found in the database
    //             if (digester.name !== data.digester_name) {
    //                 return res.status(400).json({ message: `Digester name does not match the digester ID ${data.digester_id}` });
    //             }
    
    //             // Process timestamp
    //             let effectiveTimestamp = new Date(data.timestamp);
    //             if (isNaN(effectiveTimestamp.getTime())) {
    //                 return res.status(400).json({ message: 'Invalid timestamp format' });
    //             } else {
    //                 // Convert to ISO 8601 format
    //                 data.timestamp = effectiveTimestamp.toISOString();
    //             }
    
    //             // **New Logic**: Check if there is any previous data for the plant to calculate `final_generated_gas`
    //             const previousData = await DigesterData.findOne({
    //                 where: { plant_id: data.plant_id },
    //                 order: [['timestamp', 'DESC']], // Get the latest entry for this plant
    //             });
    
    //             // Calculate `final_generated_gas` based on the difference between current and previous `generated_gas`
    //             let final_generated_gas = 0; // Default to 0 if no previous data exists
    //             if (previousData) {
    //                 final_generated_gas = Math.abs((data.generated_gas || 0) - previousData.generated_gas);
    //             }
    
    //             // Set default values for missing data
    //             data.pH = data.pH !== undefined ? data.pH : 0;
    //             data.pressure = data.pressure !== undefined ? data.pressure : 0;
    //             data.temperature = data.temperature !== undefined ? data.temperature : 0;
    //             data.generated_gas = data.generated_gas !== undefined ? data.generated_gas : 0;
    //             data.final_generated_gas = final_generated_gas; // Use calculated value
    
    //             if (id) {
    //                 console.log("==>",id)
    //                 //check
    //                 // Update the existing record if an id is provided
    //                 const [affectedRows] = await DigesterData.update({
    //                     ...data,
    //                     timestamp: data.timestamp, // Ensure timestamp is correctly formatted
    //                 }, {
    //                     where: { id: id },
    //                 });
    
    //                 if (affectedRows === 0) {
    //                     return res.status(404).json({ message: `Data with id ${id} not found` });
    //                 }
    
    //                 savedData.push(await DigesterData.findByPk(id));
    //             } else {

    //                 console.log("===> data",data)
    //                 // Create a new record if no id is provided
    //                 const savedRecord = await DigesterData.create({
    //                     ...data,
    //                     timestamp: data.timestamp, // Ensure timestamp is correctly formatted
    //                 });
    //                 savedData.push(savedRecord);
    //             }
    //         }
    
    //         console.log('Data successfully processed:', savedData);
    //         res.status(201).json({ message: `${savedData.length} data entries processed successfully`, data: savedData });
    //     } catch (err) {
    //         console.error('Error receiving digester data:', err);
    //         res.status(500).json({ message: 'Internal server error' });
    //     }
    // };
    







    /*const receiveDigesterData = async (req, res) => {
        try {
            // Check if the user has admin rights
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
            }
    
            // Ensure the request body is an array
            const dataArray = req.body;
            if (!Array.isArray(dataArray)) {
                return res.status(400).json({ message: 'Data should be an array of objects' });
            }
    
            console.log('Received data:', dataArray);
    
            const savedData = [];
    
            for (let data of dataArray) {
                // Remove id from data before validation
                const { id, ...dataWithoutId } = data;
    
                // Validate the data schema without id
                const { error } = digesterDataSchema.validate(dataWithoutId);
                if (error) {
                    console.error('Validation error:', error.details);
                    return res.status(400).json({
                        message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}`
                    });
                }
    
                // Validate digester_id and check if digester_name matches the database
                const digester = await Digester.findByPk(data.digester_id);
                if (!digester) {
                    return res.status(404).json({
                        message: `Digester with ID ${data.digester_id} not found`
                    });
                }
    
                // Check if the digester_name matches the digester found in the database
                if (digester.name !== data.digester_name) {
                    return res.status(400).json({
                        message: `Digester name does not match the digester ID ${data.digester_id}`
                    });
                }
    
                // Process timestamp
                let effectiveTimestamp = new Date(data.timestamp);
                if (isNaN(effectiveTimestamp.getTime())) {
                    return res.status(400).json({ message: 'Invalid timestamp format' });
                } else {
                    // Convert to ISO 8601 format
                    data.timestamp = effectiveTimestamp.toISOString();
                }
    
                // New Logic: Check if there is any previous data for the plant to calculate final_generated_gas
                const previousData = await DigesterData.findOne({
                    where: {
                        plant_id: data.plant_id,
                        timestamp: { [Op.lt]: data.timestamp } // Use Sequelize's Op.lt for less than
                    },
                    order: [['timestamp', 'DESC']], // Get the most recent previous entry before the current timestamp
                    limit: 1, // Ensure only the last entry before the current one is returned
                });
    
                // Calculate final_generated_gas based on the difference between current and previous generated_gas
                let final_generated_gas = 0; // Default to 0 if no previous data exists
                console.log("===>pvd",previousData)
                if (previousData) {
                    final_generated_gas = Math.abs((data.generated_gas || 0) - previousData.generated_gas);
                }
    
                // Set default values for missing data
                data.pH = data.pH !== undefined ? data.pH : 0;
                data.pressure = data.pressure !== undefined ? data.pressure : 0;
                data.temperature = data.temperature !== undefined ? data.temperature : 0;
                data.generated_gas = data.generated_gas !== undefined ? data.generated_gas : 0;
                data.final_generated_gas = final_generated_gas; // Use calculated value
    
                if (id) {
                    // If an id is provided, update the existing record
                    const [affectedRows] = await DigesterData.update({
                        ...data,
                        timestamp: data.timestamp, // Ensure timestamp is correctly formatted
                    }, {
                        where: { id: id },
                    });
    
                    if (affectedRows === 0) {
                        return res.status(404).json({
                            message: `Data with id ${id} not found`
                        });
                    }
    
                    savedData.push(await DigesterData.findByPk(id));
                } else {
                    // Create a new record if no id is provided
                    const savedRecord = await DigesterData.create({
                        ...data,
                        timestamp: data.timestamp, // Ensure timestamp is correctly formatted
                    });
                    savedData.push(savedRecord);
                }
            }
    
            // After processing the new data, update the row just after the latest entry for the plant
            const lastIndex = savedData.length - 1;
            if (lastIndex >= 0) {
                const latestEntry = savedData[lastIndex];
    
                // Find the next row in the DigesterData table that comes after the new data (based on timestamp) for the same plant
                const nextDataRow = await DigesterData.findOne({
                    where: {
                        plant_id: latestEntry.plant_id,
                        timestamp: { [Op.gt]: latestEntry.timestamp } // Use Sequelize's Op.gt for greater than
                    },
                    order: [['timestamp', 'ASC']], // Get the next row in ascending order by timestamp
                    limit: 1, // Ensure only the next row is returned
                });
    
                // If a next row exists, update its final_generated_gas field
                console.log("===> NDR",nextDataRow) //check pls  de3lete nathi thato
                if (nextDataRow) {
                    const updatedFinalGeneratedGas = Math.abs(nextDataRow.generated_gas - latestEntry.generated_gas);
    
                    await DigesterData.update({
                        final_generated_gas: updatedFinalGeneratedGas
                    }, {
                        where: { id: nextDataRow.id }
                    });
    
                    console.log(`Updated final_generated_gas for next row with ID ${nextDataRow.id}`);
                }
            }
    
            console.log('Data successfully processed:', savedData);
            res.status(201).json({
                message: `${savedData.length} data entries processed successfully`,
                data: savedData
            });
        } catch (err) {
            console.error('Error receiving digester data:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    };*/
    




    const receiveDigesterData = async (req, res) => {
      try {
        // Check if the user has admin rights
        if (req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
        }
    
        // Ensure the request body is an array
        const dataArray = req.body;
        if (!Array.isArray(dataArray)) {
          return res.status(400).json({ message: 'Data should be an array of objects' });
        }
    
        console.log('Received data:', dataArray);
        const savedData = [];
    
        for (let data of dataArray) {
          const { id, ...dataWithoutId } = data;
          const { error } = digesterDataSchema.validate(dataWithoutId);
          if (error) {
            console.error('Validation error:', error.details);
            return res.status(400).json({
              message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}`
            });
          }
    
          const digester = await Digester.findByPk(data.digester_id);
          if (!digester) {
            return res.status(404).json({
              message: `Digester with ID ${data.digester_id} not found`
            });
          }
    
          if (digester.name !== data.digester_name) {
            return res.status(400).json({
              message: `Digester name does not match the digester ID ${data.digester_id}`
            });
          }
    
          let effectiveTimestamp = new Date(data.timestamp);
          if (isNaN(effectiveTimestamp.getTime())) {
            return res.status(400).json({ message: 'Invalid timestamp format' });
          } else {
            data.timestamp = effectiveTimestamp.toISOString();
          }
    
          // Check if the data exists for the provided timestamp
          const existingData = await DigesterData.findOne({
            where: {
              plant_id: data.plant_id,
              timestamp: data.timestamp
            }
          });
    
          // Calculate final_generated_gas based on previous data
          let final_generated_gas = 0;
          if (!existingData) {
            // Only fetch previous data if there is no existing data
            const previousData = await DigesterData.findOne({
              where: {
                plant_id: data.plant_id,
                timestamp: { [Op.lt]: data.timestamp }
              },
              order: [['timestamp', 'DESC']],
              limit: 1,
            });

            console.log("==>ED",existingData)
            console.log("===>PD",previousData);
    
            if (previousData) {
              final_generated_gas = Math.abs((data.generated_gas || 0) - previousData.generated_gas);
            }
          } else {
            // If existing data is found, update final_generated_gas using the existing record's generated_gas
            final_generated_gas = Math.abs((data.generated_gas || 0));
          }
    
          // Set default values for missing data
          data.pH = data.pH !== undefined ? data.pH : 0;
          data.pressure = data.pressure !== undefined ? data.pressure : 0;
          data.temperature = data.temperature !== undefined ? data.temperature : 0;
          data.generated_gas = data.generated_gas !== undefined ? data.generated_gas : 0;
          data.final_generated_gas = final_generated_gas;
    
          if (existingData) {
            // Update existing record if it exists   database ma complete che pan front ma barabar nathi batavata//toh data fetch thaiaave che front ma log karao proper bhai
            await DigesterData.update({
              ...data,
              timestamp: data.timestamp,
            }, {
              where: { id: existingData.id },
            });
    
            savedData.push(await DigesterData.findByPk(existingData.id));
          } else {
            // Create a new record if no existing data is found
            const savedRecord = await DigesterData.create({
              ...data,
              timestamp: data.timestamp,
            });
            savedData.push(savedRecord);
          }
        }
    
        // Update the next row if needed
        const lastIndex = savedData.length - 1;
        if (lastIndex >= 0) {
          const latestEntry = savedData[lastIndex];
    
          const nextDataRow = await DigesterData.findOne({
            where: {
              plant_id: latestEntry.plant_id,
              timestamp: { [Op.gt]: latestEntry.timestamp }
            },
            order: [['timestamp', 'ASC']],
            limit: 1,
          });
    console.log("==>NDR",nextDataRow);
          if (nextDataRow) {
            const updatedFinalGeneratedGas = Math.abs(nextDataRow.generated_gas - latestEntry.generated_gas);
            console.log("updatedFinalGeneratedGas==>NDR",updatedFinalGeneratedGas)
            await DigesterData.update({
              final_generated_gas: updatedFinalGeneratedGas
            }, {
              where: { id: nextDataRow.id }
            });
    
            console.log(`Updated final_generated_gas for next row with ID ${nextDataRow.id}`);
          }
        }
    
        console.log('Data successfully processed:', savedData);
        res.status(201).json({
          message: `${savedData.length} data entries processed successfully`,
          data: savedData
        });
      } catch (err) {
        console.error('Error receiving digester data:', err);
        res.status(500).json({ message: 'Internal server error' });
      }
    };
    







const feedDataSchema = Joi.object({
    digester_id: Joi.number().required(),
    digester_name: Joi.string().required(),
    feed: Joi.number().required(), // Assuming feed_value is a numeric value
    timestamp: Joi.date().iso().required()
});


// const receiveFeedData = async (req, res) => {
//     try {
//         // Check if the user has admin rights
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
//         }

//         // Ensure the request body is an array
//         const dataArray = req.body;
//         if (!Array.isArray(dataArray)) {
//             return res.status(400).json({ message: 'Data should be an array of objects' });
//         }

//         console.log('Received feed data:', dataArray);

//         const savedData = [];

//         for (let data of dataArray) {
//             // Remove id from data before validation
//             const { id, ...dataWithoutId } = data;

//             // Validate the data schema without id
//             const { error } = feedDataSchema.validate(dataWithoutId);
//             if (error) {
//                 console.error('Validation error:', error.details);
//                 return res.status(400).json({ message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
//             }

//             // Process timestamp with Moment.js
//             let effectiveTimestamp = moment(data.timestamp, moment.ISO_8601, true);

//             if (!effectiveTimestamp.isValid()) {
//                 return res.status(400).json({ message: 'Invalid timestamp format. Please use ISO 8601 format.' });
//             }

//             // Convert to ISO 8601 format
//             data.timestamp = effectiveTimestamp.toISOString();

//             // Check if a feed record already exists for the digester on the same day
//             const startOfDay = moment(data.timestamp).startOf('day').toDate();
//             const endOfDay = moment(data.timestamp).endOf('day').toDate();

//             const existingFeed = await DigesterData.findOne({
//                 where: {
//                     digester_id: data.digester_id,
//                     timestamp: {
//                         [Op.between]: [startOfDay, endOfDay],
//                     }
//                 }
//             });

//             if (existingFeed) {
//                 return res.status(400).json({ message: `Feed data already exists for digester ID ${data.digester_id} on ${data.timestamp}` });
//             }

//             // Save the data to the database
//             if (id) {
//                 // Update the existing record if an id is provided
//                 const [affectedRows] = await DigesterData.update({
//                     ...data,
//                     timestamp: data.timestamp // Ensure timestamp is correctly formatted
//                 }, {
//                     where: { id: id },
//                 });

//                 if (affectedRows === 0) {
//                     return res.status(404).json({ message: `Feed data with id ${id} not found` });
//                 }
//                 savedData.push(await DigesterData.findByPk(id));
//             } else {
//                 // Create a new record if no id is provided
//                 const savedRecord = await DigesterData.create({
//                     ...data,
//                     timestamp: data.timestamp, // Ensure timestamp is correctly formatted
//                     feed: data.feed, // Ensure feed is saved
//                     digester_name: data.digester_name // Ensure digester_name is saved
//                 });
//                 savedData.push(savedRecord);
//             }
//         }

//         console.log('Feed data successfully processed:', savedData);
//         res.status(200).json({ message: `${savedData.length} feed data entries processed successfully`, data: savedData });
//     } catch (err) {
//         console.error('Error receiving feed data:', err);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };



const receiveFeedData = async (req, res) => {
    try {
        // Check if the user has admin rights
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
        }

        // Ensure the request body is an array
        const dataArray = req.body;
        if (!Array.isArray(dataArray)) {
            return res.status(400).json({ message: 'Data should be an array of objects' });
        }

        console.log('Received feed data:', dataArray);

        const savedData = [];

        for (let data of dataArray) {
            // Remove id from data before validation
            const { id, ...dataWithoutId } = data;

            // Validate the data schema without id
            const { error } = feedDataSchema.validate(dataWithoutId);
            if (error) {
                console.error('Validation error:', error.details);
                return res.status(400).json({ message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
            }

            // Check if digester_id and digester_name match in the database
            const digester = await Digester.findOne({
                where: {
                    id: data.digester_id,
                    name: data.digester_name
                }
            });

            if (!digester) {
                // If no matching digester is found, return an error
                return res.status(400).json({
                    message: `Digester ID ${data.digester_id} and name "${data.digester_name}" do not match any existing digester in the database.`
                });
            }

            // Process timestamp with Moment.js
            let effectiveTimestamp = moment(data.timestamp, moment.ISO_8601, true);
            if (!effectiveTimestamp.isValid()) {
                return res.status(400).json({ message: 'Invalid timestamp format. Please use ISO 8601 format.' });
            }

            // Convert to ISO 8601 format
            data.timestamp = effectiveTimestamp.toISOString();

            // Check if a feed record already exists for the digester on the same day
            const startOfDay = moment(data.timestamp).startOf('day').toDate();
            const endOfDay = moment(data.timestamp).endOf('day').toDate();

            const existingFeed = await DigesterData.findOne({
                where: {
                    digester_id: data.digester_id,
                    timestamp: {
                        [Op.between]: [startOfDay, endOfDay],
                    }
                }
            });
console.log("feed",id);
if(existingFeed!=null){
            if (existingFeed.feed!=null) {
                return res.status(400).json({
                    message: `Feed data already exists for digester ID ${data.digester_id} on ${data.timestamp}`
                });
            }
        }

            // id = data.digester_id
            // Check if the record should be updated or created
            if (data.digester_id) {
                // Update the existing record if an id is provided
                const [affectedRows] = await DigesterData.update({
                    feed:data.feed
             // Ensure timestamp is correctly formatted
                }, {
                    where: { digester_id: data.digester_id ,timestamp:data.timestamp},
                });

                if (affectedRows === 0) {
                    return res.status(404).json({ message: `Feed data with id ${data.digester_id} not found` });
                }
                savedData.push(await DigesterData.findByPk(id));
            } else {
                // Create a new record if no id is provided
                const newRecord = await DigesterData.create({
                    digester_id: data.digester_id,
                    digester_name: data.digester_name,
                    feed: data.feed,
                    timestamp: data.timestamp,
                    pH: data.pH,
                    pressure: data.pressure,
                    temperature: data.temperature,
                    generated_gas: data.generated_gas,
                    final_generated_gas: data.final_generated_gas
                });

                savedData.push(newRecord);
            }
        }

        console.log('Feed data successfully processed:', savedData);
        // Send success message after all data is processed
      return res.status(201).json({ message: `${savedData.length} feed data entries processed successfully`, feedData: savedData });
    } catch (err) {
        console.error('Error receiving feed data:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
};









// const receiveFeedData = async (req, res) => {
//     try {
//         // Check if the user has admin rights
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
//         }

//         // Ensure the request body is an array
//         const dataArray = req.body;
//         if (!Array.isArray(dataArray)) {
//             return res.status(400).json({ message: 'Data should be an array of objects' });
//         }

//         console.log('Received feed data:', dataArray);

//         const savedData = [];

//         for (let data of dataArray) {
//             // Remove id from data before validation
//             const { id, ...dataWithoutId } = data;

//             // Validate the data schema without id
//             const { error } = feedDataSchema.validate(dataWithoutId);
//             if (error) {
//                 console.error('Validation error:', error.details);
//                 return res.status(400).json({ message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
//             }

//             // Check if digester_id and digester_name match in the database
//             const digester = await Digester.findOne({
//                 where: {
//                     id: data.digester_id,
//                     name: data.digester_name
//                 }
//             });

//             if (!digester) {
//                 // If no matching digester is found, return an error
//                 return res.status(400).json({ 
//                     message: `Digester ID ${data.digester_id} and name "${data.digester_name}" do not match any existing digester in the database.` 
//                 });
//             }

//             // Process timestamp with Moment.js
//             let effectiveTimestamp = moment(data.timestamp, moment.ISO_8601, true);
//             if (!effectiveTimestamp.isValid()) {
//                 return res.status(400).json({ message: 'Invalid timestamp format. Please use ISO 8601 format.' });
//             }

//             // Convert to ISO 8601 format
//             data.timestamp = effectiveTimestamp.toISOString();

//             // Check if a record for the same digester_id and timestamp exists
//             const existingRecord = await DigesterData.findOne({
//                 where: {
//                     digester_id: data.digester_id,
//                     timestamp: data.timestamp,
//                 }
//             });

//             if (existingRecord) {
//                 // If a record exists, update the existing row with new data
//                 const updatedRecord = await existingRecord.update({
//                     feed: data.feed !== undefined ? data.feed : existingRecord.feed,  // Only update feed if it's provided
//                     pH: data.pH !== undefined ? data.pH : existingRecord.pH,
//                     pressure: data.pressure !== undefined ? data.pressure : existingRecord.pressure,
//                     temperature: data.temperature !== undefined ? data.temperature : existingRecord.temperature,
//                     generated_gas: data.generated_gas !== undefined ? data.generated_gas : existingRecord.generated_gas,
//                     final_generated_gas: data.final_generated_gas !== undefined ? data.final_generated_gas : existingRecord.final_generated_gas,
//                     digester_name: data.digester_name !== undefined ? data.digester_name : existingRecord.digester_name, // Only update if provided
//                 });

//                 savedData.push(updatedRecord);
//             } else {
//                 // If no record exists, create a new one
//                 const newRecord = await DigesterData.create({
//                     digester_id: data.digester_id,
//                     digester_name: data.digester_name,
//                     feed: data.feed,
//                     timestamp: data.timestamp,
//                     pH: data.pH,
//                     pressure: data.pressure,
//                     temperature: data.temperature,
//                     generated_gas: data.generated_gas,
//                     final_generated_gas: data.final_generated_gas
//                 });

//                 savedData.push(newRecord);
//             }
//         }

//         console.log('Feed data successfully processed:', savedData);
//         // Send success message after all data is processed
//         res.status(201).json({ message: `Feed data uploaded successfully.`, feedData: savedData 
//         });
//     } catch (err) {
//         console.error('Error receiving feed data:', err);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };












// const receiveFeedData = async (req, res) => {
//     try {
//         // Check if the user has admin rights
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
//         }

//         // Ensure the request body is an array
//         const dataArray = req.body;
//         if (!Array.isArray(dataArray)) {
//             return res.status(400).json({ message: 'Data should be an array of objects' });
//         }

//         console.log('Received feed data:', dataArray);

//         const savedData = [];

//         for (let data of dataArray) {
//             // Remove id from data before validation
//             const { id, ...dataWithoutId } = data;

//             // Validate the data schema without id
//             const { error } = feedDataSchema.validate(dataWithoutId);
//             if (error) {
//                 console.error('Validation error:', error.details);
//                 return res.status(400).json({ message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
//             }

//             // Process timestamp with Moment.js
//             let effectiveTimestamp = moment(data.timestamp, moment.ISO_8601, true);

//             if (!effectiveTimestamp.isValid()) {
//                 return res.status(400).json({ message: 'Invalid timestamp format. Please use ISO 8601 format.' });
//             }

//             // Convert to ISO 8601 format
//             data.timestamp = effectiveTimestamp.toISOString();

//             // Check if a feed record already exists for the digester on the same day
//             const startOfDay = moment(data.timestamp).startOf('day').toDate();
//             const endOfDay = moment(data.timestamp).endOf('day').toDate();

//             const existingFeed = await DigesterData.findOne({
//                 where: {
//                     digester_id: data.digester_id,
//                     timestamp: {
//                         [Op.between]: [startOfDay, endOfDay],
//                     }
//                 }
//             });

//             if (existingFeed) {
//                 return res.status(400).json({ message: `Feed data already exists for digester ID ${data.digester_id} on ${data.timestamp}` });
//             }

//             if (id) {
//                 // Update the existing record if an id is provided
//                 const [affectedRows] = await DigesterData.update({
//                     ...data,
//                     timestamp: data.timestamp // Ensure timestamp is correctly formatted
//                 }, {
//                     where: { id: id },
//                 });

//                 if (affectedRows === 0) {
//                     return res.status(404).json({ message: `Feed data with id ${id} not found` });
//                 }
//                 savedData.push(await DigesterData.findByPk(id));
//             } else {
//                 // Create a new record if no id is provided
//                 const savedRecord = await DigesterData.create({
//                     ...data,
//                     timestamp: data.timestamp // Ensure timestamp is correctly formatted
//                 });
//                 savedData.push(savedRecord);
//             }
//         }

//         console.log('Feed data successfully processed:', savedData);
//         res.status(200).json({ message: `${savedData.length} feed data entries processed successfully`, data: savedData });
//     } catch (err) {
//         console.error('Error receiving feed data:', err);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };



// module.exports = { receiveFeedData };












// const receiveDigesterData = async (req, res) => {
//     try {
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
//         }

//         const dataArray = req.body;
//         if (!Array.isArray(dataArray)) {
//             return res.status(400).json({ message: 'Data should be an array of objects' });
//         }

//         // Log the incoming data for debugging purposes
//         console.log('Received data:', dataArray);

//         for (let data of dataArray) {
//             const { error } = digesterDataSchema.validate(data);
//             if (error) {
//                 console.error('Validation error:', error.details);
//                 return res.status(400).json({ message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
//             }

//             // Convert timestamp to 12-hour format before inserting into the database
//             const date = new Date(data.timestamp);
//             const hours = date.getUTCHours();
//             const minutes = date.getUTCMinutes();
//             const ampm = hours >= 12 ? 'PM' : 'AM';
//             const hours12 = hours % 12 || 12; // Convert to 12-hour format
//             const formattedTime = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

//             // Update the timestamp in the data object
//             data.timestamp = `${date.toISOString().split('T')[0]} ${formattedTime}`;
//         }

//         // Insert data into the database
//         const savedData = await DigesterData.bulkCreate(dataArray);
//         const count = savedData.length;

//         console.log('Data successfully inserted:', savedData); // Log successful insertion
//         res.status(200).json({ message: `${count} data received and saved successfully`, data: savedData });
//     } catch (err) {
//         console.error('Error receiving digester data:', err); // Log the exact error
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };










// const receiveDigesterData = async (req, res) => {
//     try {
//         // Check if the user has the 'admin' role
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
//         }

//         const dataArray = req.body;
//         if (!Array.isArray(dataArray)) {
//             return res.status(400).json({ message: 'Data should be an array of objects' });
//         }

//         // Validate each object in the array against the schema
//         for (const data of dataArray) {
//             const { error } = digesterDataSchema.validate(data);
//             if (error) {
//                 return res.status(400).json({ message: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
//             }
//         }

//         // Insert data into the database
//         const savedData = await DigesterData.insertMany(dataArray); // Ensure this method is compatible with your ORM/ODM
//         const count = savedData.length;
//         res.status(200).json({ message: `${count} Data received and saved successfully`, data: savedData });
//     } catch (err) {
//         console.error('Error receiving digester data:', err);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

// const addDigesterData = async (req, res) => {
//     try {
//         const { digester_id, digester_name, pH, pressure, temperature, generated_gas, timestamp } = req.body;

//         // Validate digester_id
//         if (!isValidId(digester_id)) {
//             return res.status(400).json({ message: 'Invalid digester ID' });
//         }

//         // Check if the digester exists
//         const digester = await Digester.findByPk(digester_id);
//         if (!digester) {
//             return res.status(404).json({ message: 'Digester not found' });
//         }

//         // Use the provided timestamp or fallback to current time
//         const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();

//         // Fetch the previous record for this digester to calculate final_generated_gas
//         const previousData = await DigesterData.findOne({
//             where: { digester_id },
//             order: [['timestamp', 'DESC']],
//         });

//         // Calculate final_generated_gas based on the previous record
//         let final_generated_gas = 0; // Default to 0 if no previous data exists
//         if (previousData) {
//             final_generated_gas = Math.abs(generated_gas - previousData.generated_gas);
//         }

//         // Create new digester data without the feed value
//         const newDigesterData = await DigesterData.create({
//             digester_id,
//             digester_name: digester.name, // Assuming digester_name comes from the Digester model
//             pH,
//             pressure,
//             temperature,
//             generated_gas,
//             final_generated_gas,
//             timestamp: effectiveTimestamp, // Use the provided or current timestamp
//         });

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: newDigesterData });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };











// const addDigesterData = async (req, res) => {
//     try {
//         const { digester_id, digester_name, pH, pressure, temperature, generated_gas, timestamp } = req.body;

//         // Validate digester_id
//         if (!isValidId(digester_id)) {
//             return res.status(400).json({ message: 'Invalid digester ID' });
//         }

//         // Check if the digester exists and if digester_id matches digester_name
//         const digester = await Digester.findByPk(digester_id);
//         if (!digester) {
//             return res.status(404).json({ message: 'Digester not found' });
//         }

       

//         // Use the provided timestamp or fallback to the current time
//         const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();

//         // Fetch the previous record for this digester to calculate final_generated_gas
//         const previousData = await DigesterData.findOne({
//             where: { digester_id },
//             order: [['timestamp', 'DESC']],
//         });

//         // Calculate final_generated_gas based on the previous record
//         let final_generated_gas = 0; // Default to 0 if no previous data exists
//         if (previousData) {
//             final_generated_gas = Math.abs((generated_gas || 0) - previousData.generated_gas);
//         }

//         // Set defaults for missing data
//         const newDigesterData = await DigesterData.create({
//             digester_id,
//             digester_name: digester.name, // Assuming digester_name comes from the Digester model
//             pH: pH !== undefined ? pH : 0, // Set to 0 if missing
//             pressure: pressure !== undefined ? pressure : 0, // Set to 0 if missing
//             temperature: temperature !== undefined ? temperature : 0, // Set to 0 if missing
//             generated_gas: generated_gas !== undefined ? generated_gas : 0, // Set to 0 if missing
//             final_generated_gas,
//             timestamp: effectiveTimestamp, // Use the provided or current timestamp
//         });

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: newDigesterData });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };














// jay bhai logic

// const addDigesterData = async (req, res) => {
//     try {
//         const { digesterDataArray, generated_gas, timestamp } = req.body;

//         // Validate input structure
//         if (!Array.isArray(digesterDataArray) || digesterDataArray.length === 0) {
//             return res.status(400).json({ message: 'Invalid input data' });
//         }

//         const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();

//         // Check if there's already a record for the same timestamp
//         const existingData = await DigesterData.findOne({
//             where: {
//                 timestamp: effectiveTimestamp,
//             },
//         });

//         // Initialize previous generated gas variable
//         let previous_generated_gas = 0;

//         // Loop through each digester data
//         const digesterDataPromises = digesterDataArray.map(async (data, index) => {
//             const { digester_id, pH, pressure, temperature } = data;

//             // Validate digester_id
//             if (!isValidId(digester_id)) {
//                 throw new Error(`Invalid digester ID: ${digester_id}`);
//             }

//             // Check if the digester exists
//             const digester = await Digester.findByPk(digester_id);
//             if (!digester) {
//                 throw new Error(`Digester not found: ${digester_id}`);
//             }

//             // Initialize values for generated_gas and final_generated_gas
//             let current_generated_gas = index === 0 ? (generated_gas || 0) : previous_generated_gas; // Set for the first digester only
//             let final_generated_gas = index === 0 ? 0 : Math.abs(current_generated_gas - previous_generated_gas); // Set final_generated_gas

//             // Create new digester data record
//             const newDigesterData = await DigesterData.create({
//                 digester_id,
//                 digester_name: digester.name,
//                 pH: pH !== undefined ? pH : 0,
//                 pressure: pressure !== undefined ? pressure : 0,
//                 temperature: temperature !== undefined ? temperature : 0,
//                 generated_gas: current_generated_gas, // Set generated_gas
//                 final_generated_gas, // Set final_generated_gas
//                 timestamp: effectiveTimestamp,
//             });

//             // Update previous_generated_gas for the next iteration
//             previous_generated_gas = current_generated_gas;

//             return newDigesterData;
//         });

//         // Wait for all digester data promises to resolve
//         const results = await Promise.all(digesterDataPromises);

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: results });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };














// my logic

// const addDigesterData = async (req, res) => {
//     try {
//         const { digesterDataArray, generated_gas, timestamp } = req.body;

//         // Validate input structure
//         if (!Array.isArray(digesterDataArray) || digesterDataArray.length === 0) {
//             return res.status(400).json({ message: 'Invalid input data' });
//         }

//         const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();

//         // Iterate through each digester and find the one that provides valid data
//         let gasAssigned = false; // To ensure we assign generated_gas only once
//         const digesterDataPromises = digesterDataArray.map(async (data) => {
//             const { digester_id, pH, pressure, temperature } = data;

//             // Validate digester_id
//             if (!isValidId(digester_id)) {
//                 throw new Error(`Invalid digester ID: ${digester_id}`);
//             }

//             // Check if the digester exists
//             const digester = await Digester.findByPk(digester_id);
//             if (!digester) {
//                 throw new Error(`Digester not found: ${digester_id}`);
//             }

//             // Determine whether this digester provides valid data
//             const hasValidData = pH !== null && pressure !== null && temperature !== null;

//             // Set the generated_gas only for the digester with valid data
//             const gas = hasValidData && !gasAssigned ? generated_gas : null;
//             if (gas) {
//                 gasAssigned = true; // Mark that gas has been assigned
//             }

//             // Create or update the digester data record
//             const newDigesterData = await DigesterData.create({
//                 digester_id,
//                 digester_name: digester.name,
//                 pH: hasValidData ? pH : null,
//                 pressure: hasValidData ? pressure : null,
//                 temperature: hasValidData ? temperature : null,
//                 generated_gas: gas, // Set generated_gas only for valid data digester
//                 timestamp: effectiveTimestamp,
//             });

//             return newDigesterData;
//         });

//         // Wait for all digester data promises to resolve
//         const results = await Promise.all(digesterDataPromises);

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: results });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };












// my logic +++

// const addDigesterData = async (req, res) => {
//     try {
//         const { digesterDataArray, generated_gas, timestamp } = req.body;

//         // Validate input structure
//         if (!Array.isArray(digesterDataArray) || digesterDataArray.length === 0) {
//             return res.status(400).json({ message: 'Invalid input data' });
//         }

//         const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();

//         // Iterate through each digester and find the one that provides valid data
//         let gasAssigned = false; // To ensure we assign generated_gas only once
//         const digesterDataPromises = digesterDataArray.map(async (data) => {
//             const { digester_id, pH, pressure, temperature } = data;

//             // Validate digester_id
//             if (!isValidId(digester_id)) {
//                 throw new Error(`Invalid digester ID: ${digester_id}`);
//             }

//             // Check if the digester exists
//             const digester = await Digester.findByPk(digester_id);
//             if (!digester) {
//                 throw new Error(`Digester not found: ${digester_id}`);
//             }
 

//             // Determine whether this digester provides valid data
//             const hasValidData = pH !== null && pressure !== null && temperature !== null;

//             // If the data is not valid, return null (to skip saving this entry)
//             if (!hasValidData) {
//                 return null;
//             }

//             // Set the generated_gas only for the digester with valid data
//             const gas = !gasAssigned ? generated_gas : null;
//             if (gas) {
//                 gasAssigned = true; // Mark that gas has been assigned
//             }

     
//      // Fetch the previous record for this digester to calculate final_generated_gas
//       const previousData = await DigesterData.findOne({
//            where: { digester_id },
//              order: [['timestamp', 'DESC']],
//          });

//          // Calculate final_generated_gas based on the previous record
//          let final_generated_gas = 0; // Default to 0 if no previous data exists
// if (previousData) {
//             final_generated_gas = Math.abs((gas || 0) - previousData.gas);
//         }

//             // Create or update the digester data record
//             const newDigesterData = await DigesterData.create({
//                 digester_id,
//                 digester_name: digester.name,
//                 pH,
//                 pressure,
//                 temperature,
//                 generated_gas: gas, // Set generated_gas only for valid data digester
//                 timestamp: effectiveTimestamp,
//             });

//             return newDigesterData;
//         });

//         // Wait for all digester data promises to resolve
//         const results = await Promise.all(digesterDataPromises);

//         // Filter out any null results (invalid data)
//         const validResults = results.filter(result => result !== null);

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: validResults });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };










//final one
const addDigesterData = async (req, res) => {
    try {
        const { digesterDataArray, generated_gas, timestamp, plant_id } = req.body;

        // Validate input structure
        if (!Array.isArray(digesterDataArray) || digesterDataArray.length === 0 || !plant_id) {
            return res.status(400).json({ message: 'Invalid input data or missing plant_id' });
        }

        const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();

        // Check if there is any previous data for the plant to calculate `final_generated_gas`
        const previousData = await DigesterData.findOne({
            where: { plant_id }, // Fetch the latest record for the plant
            order: [['timestamp', 'DESC']],
        });

        // Calculate `final_generated_gas` for the plant
        let final_generated_gas = 0; // Default to 0 if no previous data exists
        if (previousData) {
            final_generated_gas = Math.abs((generated_gas || 0) - previousData.generated_gas);
        }

        // Iterate over each digester's data in the plant
        const digesterDataPromises = digesterDataArray.map(async (data) => {
            const { digester_id, pH, pressure, temperature } = data;

            // Validate digester_id
            if (!isValidId(digester_id)) {
                throw new Error(`Invalid digester ID: ${digester_id}`);
            }

            // Check if the digester exists
            const digester = await Digester.findByPk(digester_id);
            if (!digester) {
                throw new Error(`Digester not found: ${digester_id}`);
            }

            // Determine whether this digester provides valid data
            const hasValidData = pH !== null && pressure !== null && temperature !== null;
            if (!hasValidData) {
                return null; // Skip saving if the data is not valid
            }

            // Create or update the digester data record
            const newDigesterData = await DigesterData.create({
                digester_id,
                plant_id, // Add plant_id to the data
                digester_name: digester.name,
                pH,
                pressure,
                temperature,
                generated_gas, // Use the same `generated_gas` for all digesters in the plant
                final_generated_gas, // Calculated `final_generated_gas` for the plant
                timestamp: effectiveTimestamp,
            });

            return newDigesterData;
        });

        // Wait for all digester data promises to resolve
        const results = await Promise.all(digesterDataPromises);

        // Filter out any null results (invalid data)
        const validResults = results.filter(result => result !== null);

        res.status(201).json({ message: 'Digester data added successfully', digesterData: validResults });
    } catch (error) {
        console.error('Error adding digester data:', error);
        res.status(500).json({ message: error.message });
    }
};





// const addDigesterData = async (req, res) => {
//     try {
//         const { digesterDataArray, generated_gas, timestamp, plant_id } = req.body;

//         // Validate input structure
//         if (!Array.isArray(digesterDataArray) || digesterDataArray.length === 0 || !plant_id) {
//             return res.status(400).json({ message: 'Invalid input data or missing plant_id' });
//         }

//         // Use the provided timestamp or default to the current timestamp
//         const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();

//         // Iterate over each digester's data in the plant
//         const digesterDataPromises = digesterDataArray.map(async (data) => {
//             const { digester_id, pH, pressure, temperature } = data;

//             // Validate digester_id
//             if (!isValidId(digester_id)) {
//                 throw new Error(`Invalid digester ID: ${digester_id}`);
//             }

//             // Check if the digester exists
//             const digester = await Digester.findByPk(digester_id);
//             if (!digester) {
//                 throw new Error(`Digester not found: ${digester_id}`);
//             }

//             // Check if data already exists for this digester_id and the exact timestamp
//             const existingData = await DigesterData.findOne({
//                 where: {
//                     digester_id,
//                     plant_id,
//                     timestamp: effectiveTimestamp, // Compare with the exact date and time
//                 },
//             });

//             if (existingData) {
//                 throw new Error(`Data already exists for digester ID: ${digester_id} at timestamp: ${effectiveTimestamp.toISOString()}`);
//             }

//             // Determine whether this digester provides valid data
//             const hasValidData = pH !== null && pressure !== null && temperature !== null;
//             if (!hasValidData) {
//                 return null; // Skip saving if the data is not valid
//             }

//             // Create the digester data record
//             const newDigesterData = await DigesterData.create({
//                 digester_id,
//                 plant_id,
//                 digester_name: digester.name,
//                 pH,
//                 pressure,
//                 temperature,
//                 generated_gas, // Use the same `generated_gas` for all digesters in the plant
//                 timestamp: effectiveTimestamp, // Store the provided timestamp, keeping the exact date and time
//             });

//             return newDigesterData;
//         });

//         // Wait for all digester data promises to resolve
//         const results = await Promise.all(digesterDataPromises);

//         // Filter out any null results (invalid data)
//         const validResults = results.filter(result => result !== null);

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: validResults });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };

















// const addDigesterData = async (req, res) => {
//     try {
//         const { digesterDataArray, timestamp } = req.body;

//         // Validate input structure
//         if (!Array.isArray(digesterDataArray) || digesterDataArray.length === 0) {
//             return res.status(400).json({ message: 'Invalid input data' });
//         }

//         const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();

//         // Iterate through each digester and find the one that provides valid data
//         const digesterDataPromises = digesterDataArray.map(async (data) => {
//             const { digester_id, pH, pressure, temperature, generated_gas } = data;

//             // Validate digester_id
//             if (!isValidId(digester_id)) {
//                 throw new Error(`Invalid digester ID: ${digester_id}`);
//             }

//             // Check if the digester exists
//             const digester = await Digester.findByPk(digester_id);
//             if (!digester) {
//                 throw new Error(`Digester not found: ${digester_id}`);
//             }

//             // Determine whether this digester provides valid data
//             const hasValidData = pH !== null && pressure !== null && temperature !== null;

//             // If the data is not valid, return null (to skip saving this entry)
//             if (!hasValidData) {
//                 return null;
//             }

//             // Fetch the previous record for this digester to calculate final_generated_gas
//             const previousData = await DigesterData.findOne({
//                 where: { digester_id },
//                 order: [['timestamp', 'DESC']],
//             });

//             // Calculate final_generated_gas based on the previous record
//             let final_generated_gas = 0; // Default to 0 if no previous data exists
//             if (previousData) {
//                 final_generated_gas = Math.max(0, (generated_gas || 0) - previousData.generated_gas);
//             }

//             // Create or update the digester data record
//             const newDigesterData = await DigesterData.create({
//                 digester_id,
//                 digester_name: digester.name,
//                 pH,
//                 pressure,
//                 temperature,
//                 generated_gas: generated_gas !== undefined ? generated_gas : 0, // Set to 0 if missing
//                 final_generated_gas, // Set calculated final_generated_gas
//                 timestamp: effectiveTimestamp,
//             });

//             return newDigesterData;
//         });

//         // Wait for all digester data promises to resolve
//         const results = await Promise.all(digesterDataPromises);

//         // Filter out any null results (invalid data)
//         const validResults = results.filter(result => result !== null);

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: validResults });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };









// const addDigesterData = async (req, res) => {
//     try {
//         const { plant_id, digesterDataArray, generated_gas, timestamp } = req.body;

//         // Validate input structure
//         if (!Array.isArray(digesterDataArray) || digesterDataArray.length === 0) {
//             return res.status(400).json({ message: 'Invalid input data' });
//         }

//         const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();

//         // Iterate through each digester and find the one that provides valid data
//         let gasAssigned = false; // To ensure we assign generated_gas only once
//         const digesterDataPromises = digesterDataArray.map(async (data) => {
//             const { digester_id, pH, pressure, temperature } = data;

//             // Validate digester_id
//             if (!isValidId(digester_id)) {
//                 throw new Error(`Invalid digester ID: ${digester_id}`);
//             }

//             // Check if the digester exists
//             const digester = await Digester.findByPk(digester_id);
//             if (!digester) {
//                 throw new Error(`Digester not found: ${digester_id}`);
//             }

//             // Determine whether this digester provides valid data
//             const hasValidData = pH !== null && pressure !== null && temperature !== null;

//             // Set the generated_gas only for the digester with valid data
//             const gas = hasValidData && !gasAssigned ? generated_gas : null;
//             if (gas) {
//                 gasAssigned = true; // Mark that gas has been assigned
//             }

//             // Create or update the digester data record
//             const newDigesterData = await DigesterData.create({
//                 digester_id,
//                 digester_name: digester.name,
//                 pH: hasValidData ? pH : null,
//                 pressure: hasValidData ? pressure : null,
//                 temperature: hasValidData ? temperature : null,
//                 generated_gas: gas, // Set generated_gas only for valid data digester
//                 timestamp: effectiveTimestamp,
//             });

//             // Store generated gas and final generated gas in the new model
//             if (gas !== null) {
//                 // Fetch the previous record for this digester to calculate final_generated_gas
//                 const previousData = await DigesterData.findOne({
//                     where: { digester_id },
//                     order: [['timestamp', 'DESC']],
//                 });

//                 // Calculate final_generated_gas based on the previous record
//                 let final_generated_gas = 0; // Default to 0 if no previous data exists
//                 if (previousData) {
//                     final_generated_gas = Math.abs(gas - (previousData.generated_gas || 0));
//                 }

//                 // Create the GeneratedGas record
//                 await GeneratedGas.create({
//                     plant_id,
//                     digester_id,
//                     generated_gas: gas,
//                     final_generated_gas,
//                     timestamp: effectiveTimestamp,
//                 });
//             }

//             return newDigesterData;
//         });

//         // Wait for all digester data promises to resolve
//         const results = await Promise.all(digesterDataPromises);

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: results });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };




// const addDigesterData = async (req, res) => {
//     try {
//         const { plant_id, digesterDataArray, generated_gas, timestamp } = req.body;

//         if (!Array.isArray(digesterDataArray) || digesterDataArray.length === 0) {
//             return res.status(400).json({ message: 'Invalid input data' });
//         }

//         const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();
//         let previousGeneratedGas = null; 

//         const digesterDataPromises = digesterDataArray.map(async (data) => {
//             const { digester_id, pH, pressure, temperature } = data;

//             if (!isValidId(digester_id)) {
//                 throw new Error(`Invalid digester ID: ${digester_id}`);
//             }

//             const digester = await Digester.findByPk(digester_id);
//             if (!digester) {
//                 throw new Error(`Digester not found: ${digester_id}`);
//             }

//             const hasValidData = pH !== null && pressure !== null && temperature !== null;
//             const gas = hasValidData ? generated_gas : null;

//             const previousData = await DigesterData.findOne({
//                 where: { digester_id },
//                 order: [['timestamp', 'DESC']],
//             });

//             let final_generated_gas = 0;

//             if (previousData) {
//                 // Calculate the final_generated_gas as new generated_gas - previous generated_gas
//                 final_generated_gas = Math.abs((gas || 0) - (previousGeneratedGas || 0));
//             }

//             const newDigesterData = await DigesterData.create({
//                 digester_id,
//                 digester_name: digester.name,
//                 pH: hasValidData ? pH : null,
//                 pressure: hasValidData ? pressure : null,
//                 temperature: hasValidData ? temperature : null,
//                 generated_gas: gas,
//                 final_generated_gas,
//                 timestamp: effectiveTimestamp,
//             });

//             // Update previousGeneratedGas for the next iteration
//             if (gas !== null) {
//                 previousGeneratedGas = gas; 
//             }

//             if (gas !== null) {
//                 await GeneratedGas.create({
//                     plant_id,
//                     digester_id,
//                     generated_gas: gas,
//                     final_generated_gas,
//                     timestamp: effectiveTimestamp,
//                 });
//             }

//             return newDigesterData;
//         });

//         const results = await Promise.all(digesterDataPromises);
//         res.status(201).json({ message: 'Digester data added successfully', digesterData: results });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };
















//my logic with final genrated gas
// const addDigesterData = async (req, res) => {
//     try {
//         const { digesterDataArray, generated_gas, timestamp } = req.body;

//         // Validate input structure
//         if (!Array.isArray(digesterDataArray) || digesterDataArray.length === 0) {
//             return res.status(400).json({ message: 'Invalid input data' });
//         }

//         const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();

//         // Iterate through each digester and find the one that provides valid data
//         let gasAssigned = false; // To ensure we assign generated_gas only once
//         const digesterDataPromises = digesterDataArray.map(async (data) => {
//             const { digester_id, pH, pressure, temperature } = data;

//             // Validate digester_id
//             if (!isValidId(digester_id)) {
//                 throw new Error(`Invalid digester ID: ${digester_id}`);
//             }

//             // Check if the digester exists
//             const digester = await Digester.findByPk(digester_id);
//             if (!digester) {
//                 throw new Error(`Digester not found: ${digester_id}`);
//             }

//             // Fetch the previous record for this digester to calculate final_generated_gas
//             const previousData = await DigesterData.findOne({
//                 where: { digester_id },
//                 order: [['timestamp', 'DESC']],
//             });

//             // Determine whether this digester provides valid data
//             const hasValidData = pH !== null && pressure !== null && temperature !== null;

//             // Calculate final_generated_gas based on the previous record
//             let final_generated_gas = 0; // Default to 0 if no previous data exists
//             if (previousData) {
//                 final_generated_gas = Math.abs((generated_gas || 0) - previousData.generated_gas);
//             }

//             // Set the generated_gas only for the digester with valid data
//             const gas = hasValidData && !gasAssigned ? generated_gas : null;
//             if (gas) {
//                 gasAssigned = true; // Mark that gas has been assigned
//             }

//             // Create or update the digester data record
//             const newDigesterData = await DigesterData.create({
//                 digester_id,
//                 digester_name: digester.name,
//                 pH: hasValidData ? pH : null,
//                 pressure: hasValidData ? pressure : null,
//                 temperature: hasValidData ? temperature : null,
//                 generated_gas: gas, // Set generated_gas only for valid data digester
//                 final_generated_gas, // Set the calculated final_generated_gas
//                 timestamp: effectiveTimestamp,
//             });

//             return newDigesterData;
//         });

//         // Wait for all digester data promises to resolve
//         const results = await Promise.all(digesterDataPromises);

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: results });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };







// const addDigesterData = async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const { digesterDataArray, generated_gas, timestamp } = req.body;

//         // Validate input structure
//         if (!Array.isArray(digesterDataArray) || digesterDataArray.length === 0) {
//             return res.status(400).json({ message: 'Invalid input data' });
//         }

//         const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();
//         let gasAssigned = false; // To ensure we assign generated_gas only once

//         const digesterDataPromises = digesterDataArray.map(async (data) => {
//             const { digester_id, pH, pressure, temperature } = data;

//             // Validate digester_id
//             if (!isValidId(digester_id)) {
//                 throw new Error(`Invalid digester ID: ${digester_id}`);
//             }

//             // Check if the digester exists
//             const digester = await Digester.findByPk(digester_id, { transaction });
//             if (!digester) {
//                 throw new Error(`Digester not found: ${digester_id}`);
//             }

//             // Determine whether this digester provides valid data
//             const hasValidData = pH !== null && pressure !== null && temperature !== null;
//             const gas = hasValidData && !gasAssigned ? generated_gas : null;

//             if (gas) {
//                 gasAssigned = true; // Mark that gas has been assigned
//             }

//             // Create or update the digester data record
//             const newDigesterData = await DigesterData.create({
//                 digester_id,
//                 digester_name: digester.name,
//                 pH: hasValidData ? pH : null,
//                 pressure: hasValidData ? pressure : null,
//                 temperature: hasValidData ? temperature : null,
//                 generated_gas: gas, // Set generated_gas only for valid data digester
//                 timestamp: effectiveTimestamp,
//             }, { transaction });

//             return newDigesterData;
//         });

//         // Wait for all digester data promises to resolve
//         const results = await Promise.all(digesterDataPromises);

//         // Commit the transaction
//         await transaction.commit();
//         res.status(201).json({ message: 'Digester data added successfully', digesterData: results });
//     } catch (error) {
//         await transaction.rollback(); // Rollback transaction on error
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };








// const addDigesterData = async (req, res) => {
//     try {
//         const { digester_id, digester_name, pH, pressure, temperature, generated_gas, feed, timestamp } = req.body;

//         console.log('Received digester_id:', digester_id);
//         console.log('Received digester_name:', digester_name);
//         console.log('Received timestamp:', timestamp);

//         // Validate digester_id
//         if (!isValidId(digester_id)) {
//             return res.status(400).json({ message: 'Invalid digester ID' });
//         }

//         // Check if the digester exists
//         const digester = await Digester.findByPk(digester_id);
//         if (!digester) {
//             return res.status(404).json({ message: 'Digester not found' });
//         }

//         // Use the provided timestamp or fallback to current time
//         const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();

//         // Check if feed data already exists for the given date
//         const existingFeedData = await DigesterData.findOne({
//             where: {
//                 digester_id,
//                 timestamp: {
//                     [Op.gte]: new Date(effectiveTimestamp).setHours(0, 0, 0, 0),
//                     [Op.lt]: new Date(effectiveTimestamp).setHours(23, 59, 59, 999),
//                 }
//             }
//         });

//         let feedValue = feed; // Initialize with the provided feed value

//         if (existingFeedData) {
//             // If feed data exists for this date, reuse it
//             feedValue = existingFeedData.feed;
//         }

//         // Fetch the previous record for this digester to calculate final_generated_gas
//         const previousData = await DigesterData.findOne({
//             where: { digester_id },
//             order: [['timestamp', 'DESC']],
//         });

//         // Calculate final_generated_gas based on the previous record
//         let final_generated_gas = 0; // Default to 0 if no previous data exists
//         if (previousData) {
//             final_generated_gas = Math.abs(generated_gas - previousData.generated_gas);
//         }

//         // Create new digester data with the reused or new feed value
//         const newDigesterData = await DigesterData.create({
//             digester_id,
//             digester_name: digester.name, // Assuming digester_name comes from the Digester model
//             pH,
//             pressure,
//             temperature,
//             generated_gas,
//             final_generated_gas,
//             feed: feedValue,
//             timestamp: effectiveTimestamp, // Use the provided or current timestamp
//         });

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: newDigesterData });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };

const fetchFeedDataForDate = async (req, res) => {
    try {
        const { digesterId } = req.params; // Extract digesterId from request params
        const { timestamp } = req.query; // Extract timestamp from query parameters

        // Replace this with your actual database query logic
        const data = await getDataFromDatabaseForDate(digesterId, timestamp); // Define this function to get data from your database

        res.json(data);
    } catch (error) {
        console.error('Error fetching data for date:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
};

const addFeedData = async (req, res) => {
    try {
        const { digester_id, feed, timestamp } = req.body;

        // Validate digester_id
        if (!isValidId(digester_id)) {
            return res.status(400).json({ message: 'Invalid digester ID' });
        }

        // Check if the digester exists
        const digester = await Digester.findByPk(digester_id);
        if (!digester) {
            return res.status(404).json({ message: 'Digester not found' });
        }

        // Use the provided timestamp or fallback to current time
        const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();

        // Check if feed data already exists for the given date
        const existingFeedData = await DigesterData.findOne({
            where: {
                digester_id,
                timestamp: {
                    [Op.gte]: new Date(effectiveTimestamp).setHours(0, 0, 0, 0), // Start of the day
                    [Op.lt]: new Date(effectiveTimestamp).setHours(23, 59, 59, 999), // End of the day
                }
            }
        });

        // If feed data exists for this date, return an error
        if (existingFeedData) {
            return res.status(400).json({
                message: 'Feed data already exists for today. You can only enter feed data once per day.'
            });
        }

        // Create new feed data
        const newFeedData = await DigesterData.create({
            digester_id,
            digester_name: digester.name, // Assuming digester_name comes from the Digester model
            feed,
            timestamp: effectiveTimestamp, // Use the provided or current timestamp
        });

        res.status(201).json({ message: 'Feed data added successfully', feedData: newFeedData });
    } catch (error) {
        console.error('Error adding feed data:', error);
        res.status(500).json({ message: error.message });
    }
};





// Function to convert data to CSV format
const convertToCSV = (data) => {
    const headers = [
        'id', 'digester_id', 'feed', 'digester_name', 'timestamp', 'pH', 'pressure', 'temperature', 'generated_gas', 'final_generated_gas'
    ];
    const rows = data.map(item => [
        item.id, item.digester_id, item.feed, item.digester_name,
        format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss'), // Optional: formatting timestamp
        item.pH, item.pressure, item.temperature, item.generated_gas, item.final_generated_gas
    ]);

    return [headers, ...rows].map(e => e.join(',')).join('\n');
};





















//     try {
//         const { digester_id, digester_name, pH, pressure, temperature, generated_gas, feed, timestamp } = req.body;

//         console.log('Received digester_id:', digester_id);
//         console.log('Received digester_name:', digester_name);
//         console.log('Received timestamp:', timestamp);

//         // Validate digester_id
//         if (!isValidId(digester_id)) {
//             return res.status(400).json({ message: 'Invalid digester ID' });
//         }

//         // Check if the digester exists
//         const digester = await Digester.findByPk(digester_id);
//         if (!digester) {
//             return res.status(404).json({ message: 'Digester not found' });
//         }

//         // Use the provided timestamp or fallback to current time
//         const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();

//         // Fetch the previous record for this digester to calculate final_generated_gas
//         const previousData = await DigesterData.findOne({
//             where: { digester_id },
//             order: [['timestamp', 'DESC']],
//         });

//         // Calculate final_generated_gas based on the previous record
//         let final_generated_gas = 0; // Default to 0 if no previous data exists
//         if (previousData) {
//             final_generated_gas = Math.abs(generated_gas - previousData.generated_gas);
//         }

//         // Create new digester data with final_generated_gas
//         const newDigesterData = await DigesterData.create({
//             digester_id,
//             digester_name: digester.name, // Assuming digester_name comes from the Digester model
//             pH,
//             pressure,
//             temperature,
//             generated_gas,
//             final_generated_gas,
//             feed,
//             timestamp: effectiveTimestamp, // Use the provided or current timestamp
//         });

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: newDigesterData });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };






















// const addDigesterData = async (req, res) => {
//     try {
//         const { digester_id, digester_name, pH, pressure, temperature, generated_gas, feed, timestamp } = req.body;

//         console.log('Received digester_id:', digester_id);
//         console.log('Received digester_name:', digester_name);
//         console.log('Received timestamp:', timestamp);

//         // Validate digester_id
//         if (!isValidId(digester_id)) {
//             return res.status(400).json({ message: 'Invalid digester ID' });
//         }

//         // Check if the digester exists
//         const digester = await Digester.findByPk(digester_id);
//         if (!digester) {
//             return res.status(404).json({ message: 'Digester not found' });
//         }

//         // Use the provided timestamp or fallback to current time
//         const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();

//         // Create new digester data
//         const newDigesterData = await DigesterData.create({
//             digester_id,
//             digester_name:digester.name,
//             pH,
//             pressure,
//             temperature,
//             generated_gas,
//             feed,
//             timestamp: effectiveTimestamp, // Use the provided or current timestamp
//         });

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: newDigesterData });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };


// const uploadDigesterCSV = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: 'No file uploaded' });
//         }

//         const digesterDataArray = [];

//         // Read and parse CSV file
//         fs.createReadStream(req.file.path)
//             .pipe(csv())
//             .on('data', (row) => {
//                 const { digester_id, pH, pressure, temperature, generated_gas } = row;

//                 // Validate digester_id
//                 if (!isValidId(parseInt(digester_id))) {
//                     return res.status(400).json({ message: `Invalid digester ID: ${digester_id}` });
//                 }

//                 digesterDataArray.push({
//                     digester_id: parseInt(digester_id),
//                     timestamp: new Date(),
//                     pH: pH ? parseFloat(pH) : null,
//                     pressure: pressure ? parseFloat(pressure) : null,
//                     temperature: temperature ? parseFloat(temperature) : null,
//                     generated_gas: generated_gas ? parseFloat(generated_gas) : null,
//                 });
//             })
//             .on('end', async () => {
//                 if (digesterDataArray.length > 0) {
//                     // Filter out entries where all data values are null
//                     const nonEmptyDataEntries = digesterDataArray.filter(d =>
//                         d.pH !== null || d.pressure !== null || d.temperature !== null || d.generated_gas !== null
//                     );

//                     if (nonEmptyDataEntries.length > 0) {
//                         // Add non-empty data to the queue for background processing
//                         await digesterQueue.add(nonEmptyDataEntries);

//                         // Cache the latest non-empty data in Redis
//                         for (let entry of nonEmptyDataEntries) {
//                             redisClient.set(`digester:${entry.digester_id}`, JSON.stringify(entry), 'EX', 600); // Set a 10-minute expiry
//                         }

//                         // Insert data into the database
//                         await DigesterData.bulkCreate(nonEmptyDataEntries);
//                     }

//                     res.status(200).json({ message: 'CSV file processed successfully', processedEntries: nonEmptyDataEntries.length });
//                 } else {
//                     res.status(400).json({ message: 'No valid data found in CSV file' });
//                 }
//             })
//             .on('error', (error) => {
//                 console.error('Error processing CSV file:', error);
//                 res.status(500).json({ message: 'An error occurred while processing the CSV file' });
//             });
//     } catch (error) {
//         console.error('Error uploading CSV file:', error);
//         res.status(500).json({ message: error.message });
//     } finally {
//         // Remove the file after processing
//         fs.unlink(req.file.path, (err) => {
//             if (err) {
//                 console.error('Error removing file:', err);
//             }
//         });
//     }
// };












// const addDigesterData = async (req, res) => {
//     try {
//         // Extract digester_id from the request body and ensure it's a primitive value
//         const { digester_id, pH, pressure, temperature, generated_gas } = req.body;

//         // Ensure digester_id is a valid number (or string if that's the case)
//         const digester = await Digester.findByPk(digester_id);
//         if (!digester) {
//             return res.status(404).json({ message: 'digester not found' });
//         }

//         // Find the digester by its primary key (ID)
        
//         // Check if the digester exists
//         if (!digester) {
//             return res.status(404).json({ message: 'Digester not found' });
//         }

//         // Create new digester data
//         const newDigesterData = await DigesterData.create({
//             digester_id,
//             pH,
//             pressure,
//             temperature,
//             generated_gas,
//         });
    

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: newDigesterData });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };


// const addDigesterData = async (req, res) => {
//     try {
//         const { digester_id, pH, pressure, temperature, generated_gas } = req.body;

//         // Check if the digester exists
//         const digester = await Digester.findByPk(digester_id);
//         if (!digester) {
//             return res.status(404).json({ message: 'Digester not found' });
//         }

//         // Create new digester data
//         const newDigesterData = await DigesterData.create({ digester_id, pH, pressure, temperature, generated_gas });

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: newDigesterData });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };












// Add new digester data
// const addDigesterData = async (req, res) => {
//     try {
//         const { digester_id, pH, pressure, temperature, generated_gas } = req.body;

//         console.log('Received digester_id:', digester_id);

//         // Validate digester_id
//         if (!isValidId(digester_id)) {
//             return res.status(400).json({ message: 'Invalid digester ID' });
//         }

//         // Check if the digester exists
//         const digester = await Digester.findByPk(digester_id);
//         if (!digester) {
//             return res.status(404).json({ message: 'Digester not found' });
//         }

//         // Create new digester data
//         const newDigesterData = await DigesterData.create({ digester_id, pH, pressure, temperature, generated_gas });

//         res.status(201).json({ message: 'Digester data added successfully', digesterData: newDigesterData });
//     } catch (error) {
//         console.error('Error adding digester data:', error);
//         res.status(500).json({ message: error.message });
//     }
// };




// Update digester data
const updateDigesterData = async (req, res) => {
    try {
        const { id } = req.params;
        const { pH, pressure, temperature, generated_gas } = req.body;

        console.log('Received digester data id:', id);

        // Validate id
        if (!isValidId(parseInt(id))) {
            return res.status(400).json({ message: 'Invalid digester data ID' });
        }

        // Find the digester data
        const digesterData = await DigesterData.findByPk(id);
        if (!digesterData) {
            return res.status(404).json({ message: 'Digester data not found' });
        }

        // Update digester data details
        digesterData.pH = pH !== undefined ? pH : digesterData.pH;
        digesterData.pressure = pressure !== undefined ? pressure : digesterData.pressure;
        digesterData.temperature = temperature !== undefined ? temperature : digesterData.temperature;
        digesterData.generated_gas = generated_gas !== undefined ? generated_gas : digesterData.generated_gas;

        await digesterData.save();

        res.json({ message: 'Digester data updated successfully', digesterData });
    } catch (error) {
        console.error('Error updating digester data:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete digester data
const deleteDigesterData = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('Received digester data id:', id);

        // Validate id
        if (!isValidId(parseInt(id))) {
            return res.status(400).json({ message: 'Invalid digester data ID' });
        }

        // Find the digester data
        const digesterData = await DigesterData.findByPk(id);
        if (!digesterData) {
            return res.status(404).json({ message: 'Digester data not found' });
        }

        // Delete digester data
        await digesterData.destroy();

        res.json({ message: 'Digester data deleted successfully' });
    } catch (error) {
        console.error('Error deleting digester data:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get digester data by digester ID with pagination
const getDigesterDataByDigesterId = async (req, res) => {
    try {
        const { digester_id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        console.log('Received digester_id:', digester_id);

        // Validate digester_id
        if (!isValidId(parseInt(digester_id))) {
            return res.status(400).json({ message: 'Invalid digester ID' });
        }

        // Check if the digester exists
        const digester = await Digester.findByPk(digester_id);
        if (!digester) {
            return res.status(404).json({ message: 'Digester not found' });
        }

        const { count, rows } = await DigesterData.findAndCountAll({
            where: { digester_id },
            order: [['timestamp', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            digesterData: rows,
        });
    } catch (error) {
        console.error('Error fetching digester data by digester ID:', error);
        res.status(500).json({ message: error.message });
    }
};







// Get digester data by client ID with pagination
// const getDigesterDataByClientId = async (req, res) => {
//     try {
//         const { client_id } = req.params;
//         const { page = 1, limit = 10, startDate, endDate, startTime, endTime } = req.query;
//         const offset = (page - 1) * limit;

//         console.log('Received client_id:', client_id);

//         // Validate client_id
//         if (!isValidId(parseInt(client_id))) {
//             return res.status(400).json({ message: 'Invalid client ID' });
//         }

//         // Check if the client exists
//         const client = await User.findOne({ where: { id: client_id, role: 'client' } });
//         if (!client) {
//             return res.status(404).json({ message: 'Client not found' });
//         }

//         // Fetch all digesters associated with the client
//         const plants = await Plant.findAll({
//             where: { client_id },
//             include: [{
//                 model: Digester,
//                 as: 'Digesters',
//                 attributes: ['id'],
//             }]
//         });

//         // Extract digester IDs from the plants
//         const digesterIds = plants.flatMap(plant => plant.Digesters.map(d => d.id));

//         if (digesterIds.length === 0) {
//             return res.status(404).json({ message: 'No digesters found for this client' });
//         }

//         // Helper function to adjust time based on offset
//         const adjustForTimeZone = (date, offsetMinutes) => {
//             const utcDate = new Date(date.getTime() - offsetMinutes * 60 * 1000);
//             return utcDate;
//         };

//         // Calculate the time zone offset in minutes
//         const timeZoneOffset = 330; // IST is UTC+5:30, so offset is 330 minutes

//         // Build the where clause for date and time filtering
//         const dateFilter = {};
//         if (startDate && endDate) {
//             const start = new Date(startDate);
//             const end = new Date(endDate);

//             if (startTime) {
//                 const [startHour, startMinute] = startTime.split(':');
//                 start.setUTCHours(startHour, startMinute, 0, 0);
//             } else {
//                 start.setUTCHours(0, 0, 0, 0);
//             }

//             if (endTime) {
//                 const [endHour, endMinute] = endTime.split(':');
//                 end.setUTCHours(endHour, endMinute, 59, 999);
//             } else {
//                 end.setUTCHours(23, 59, 59, 999);
//             }

//             // Adjust the start and end dates for the time zone offset
//             const adjustedStart = adjustForTimeZone(start, timeZoneOffset);
//             const adjustedEnd = adjustForTimeZone(end, timeZoneOffset);

//             dateFilter[Op.between] = [adjustedStart, adjustedEnd];
//         } else if (startDate) {
//             const start = new Date(startDate);
//             if (startTime) {
//                 const [startHour, startMinute] = startTime.split(':');
//                 start.setUTCHours(startHour, startMinute, 0, 0);
//             }
//             // Adjust the start date for the time zone offset
//             const adjustedStart = adjustForTimeZone(start, timeZoneOffset);
//             dateFilter[Op.gte] = adjustedStart;
//         } else if (endDate) {
//             const end = new Date(endDate);
//             if (endTime) {
//                 const [endHour, endMinute] = endTime.split(':');
//                 end.setUTCHours(endHour, endMinute, 59, 999);
//             } else {
//                 end.setUTCHours(23, 59, 59, 999);
//             }
//             // Adjust the end date for the time zone offset
//             const adjustedEnd = adjustForTimeZone(end, timeZoneOffset);
//             dateFilter[Op.lte] = adjustedEnd;
//         }

//         const { count, rows } = await DigesterData.findAndCountAll({
//             where: {
//                 digester_id: digesterIds,
//                 ...(startDate || endDate ? { timestamp: dateFilter } : {})
//             },
//             order: [['timestamp', 'DESC']],
//             limit: parseInt(limit),
//             offset: parseInt(offset),
//         });

//         res.json({
//             totalItems: count,
//             totalPages: Math.ceil(count / limit),
//             currentPage: parseInt(page),
//             digesterData: rows,
//         });
//     } catch (error) {
//         console.error('Error fetching digester data by client ID:', error);
//         res.status(500).json({ message: error.message });
//     }
// };








const getDigesterDataByClientId = async (req, res) => {
    try {
        const { client_id } = req.params;
        const { page = 1, limit = 10, startDate, endDate, startTime, endTime } = req.query;
        const offset = (page - 1) * limit;

        console.log('Received client_id:', client_id);

        // Validate client_id
        if (!isValidId(parseInt(client_id))) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        // Check if the client exists
        const client = await User.findOne({ where: { id: client_id, role: 'client' } });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Fetch all digesters associated with the client
        const plants = await Plant.findAll({
            where: { client_id },
            include: [{
                model: Digester,
                as: 'Digesters',
                attributes: ['id'],
            }]
        });

        // Extract digester IDs from the plants
        const digesterIds = plants.flatMap(plant => plant.Digesters.map(d => d.id));

        if (digesterIds.length === 0) {
            return res.status(404).json({ message: 'No digesters found for this client' });
        }

        // Build the where clause for date and time filtering
        const dateFilter = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (startTime) {
                const [startHour, startMinute] = startTime.split(':');
                start.setUTCHours(startHour, startMinute, 0, 0);
            } else {
                start.setUTCHours(0, 0, 0, 0);
            }

            if (endTime) {
                const [endHour, endMinute] = endTime.split(':');
                end.setUTCHours(endHour, endMinute, 59, 999);
            } else {
                end.setUTCHours(23, 59, 59, 999);
            }

            dateFilter[Op.between] = [start, end];
        } else if (startDate) {
            const start = new Date(startDate);
            if (startTime) {
                const [startHour, startMinute] = startTime.split(':');
                start.setUTCHours(startHour, startMinute, 0, 0);
            }
            dateFilter[Op.gte] = start;
        } else if (endDate) {
            const end = new Date(endDate);
            if (endTime) {
                const [endHour, endMinute] = endTime.split(':');
                end.setUTCHours(endHour, endMinute, 59, 999);
            }
            dateFilter[Op.lte] = end;
        }

        const { count, rows } = await DigesterData.findAndCountAll({
            where: {
                digester_id: digesterIds,
                ...(startDate || endDate ? { timestamp: dateFilter } : {}),
                [Op.and]: [
                    { pH: { [Op.ne]: null } }, // pH should not be null
                    { pressure: { [Op.ne]: null } }, // Pressure should not be null
                    { temperature: { [Op.ne]: null } }, // Temperature should not be null
                    { pH: { [Op.or]: [{ [Op.gt]: 0 }, { [Op.eq]: 0 }] } }, // pH should be 0 or greater
                    { pressure: { [Op.or]: [{ [Op.gt]: 0 }, { [Op.eq]: 0 }] } }, // Pressure should be 0 or greater
                    { temperature: { [Op.or]: [{ [Op.gt]: 0 }, { [Op.eq]: 0 }] } } // Temperature should be 0 or greater
                ]
            },
            order: [['timestamp', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        // Check if there are any digester data records
        if (rows.length === 0) {
            return res.status(204).json({ message: 'No digester data available for the selected filters.' });
        }

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            digesterData: rows,
        });
    } catch (error) {
        console.error('Error fetching digester data by client ID:', error);
        res.status(500).json({ message: error.message });
    }
};


const getAllDigesterDataByClientId = async (req, res) => {
    try {
        const { client_id } = req.params;

        console.log('Received client_id:', client_id);

        // Validate client_id
        if (!isValidId(parseInt(client_id))) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        // Check if the client exists
        const client = await User.findOne({ where: { id: client_id, role: 'client' } });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Fetch all digesters associated with the client
        const plants = await Plant.findAll({
            where: { client_id },
            include: [{
                model: Digester,
                as: 'Digesters',
                attributes: ['id'],
            }]
        });

        // Extract digester IDs from the plants
        const digesterIds = plants.flatMap(plant => plant.Digesters.map(d => d.id));
        if (digesterIds.length === 0) {
            return res.status(404).json({ message: 'No digesters found for this client' });
        }

        // Fetch digester data by digester IDs without any date filter
        const digesterData = await DigesterData.findAll({
            where: {
                digester_id: digesterIds,
                [Op.and]: [
                    { pH: { [Op.ne]: null } }, // pH should not be null
                    { pressure: { [Op.ne]: null } }, // Pressure should not be null
                    { temperature: { [Op.ne]: null } }, // Temperature should not be null
                    { pH: { [Op.or]: [{ [Op.gt]: 0 }, { [Op.eq]: 0 }] } }, // pH should be 0 or greater
                    { pressure: { [Op.or]: [{ [Op.gt]: 0 }, { [Op.eq]: 0 }] } }, // Pressure should be 0 or greater
                    { temperature: { [Op.or]: [{ [Op.gt]: 0 }, { [Op.eq]: 0 }] } } // Temperature should be 0 or greater
                ]
            },
            order: [['timestamp', 'DESC']]
        });

        // Check if any digester data was found
        if (digesterData.length === 0) {
            return res.status(204).json({ message: 'No digester data available for this client.' });
        }

        // Convert timestamps to IST
        const formattedData = digesterData.map(data => ({
            ...data.toJSON(),
            timestamp: convertToIST(data.timestamp),  // Convert to IST
        }));

        res.json({
            totalItems: digesterData.length,
            digesterData: formattedData, // Data with converted timestamps
        });
    } catch (error) {
        console.error('Error fetching all digester data by client ID:', error);
        res.status(500).json({ message: error.message });
    }
};



const convertToIST = (date) => {
    const utcDate = new Date(date);
    // Add 5 hours and 30 minutes to convert to IST
    return new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000).toISOString(); // returns in ISO string format
};

// Controller to get feed data by client ID, filters, and pagination
const getFeedDataByClientAndFilters = async (req, res) => {
    try {
        const { client_id } = req.params;
        const { page = 1, limit = 10, startDate, endDate, startTime, endTime, digester_name } = req.query;
        const offset = (page - 1) * limit;

        // Validate client_id
        if (!isValidId(parseInt(client_id))) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        // Check if the client exists
        const client = await User.findOne({ where: { id: client_id, role: 'client' } });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Fetch all plants and digesters associated with the client
        const plants = await Plant.findAll({
            where: { client_id },
            include: [{
                model: Digester,
                as: 'Digesters',
                attributes: ['id', 'name'],
            }]
        });

        // Extract digester IDs and apply digester name filter if provided
        const digesterIds = plants.flatMap(plant => {
            return plant.Digesters
                .filter(d => !digester_name || d.name === digester_name)
                .map(d => d.id);
        });

        if (digesterIds.length === 0) {
            return res.status(404).json({ message: 'No digesters found for this client or digester name' });
        }

        // Build the where clause for date and time filtering
        const dateFilter = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (startTime) {
                const [startHour, startMinute] = startTime.split(':');
                start.setUTCHours(startHour, startMinute, 0, 0);
            } else {
                start.setUTCHours(0, 0, 0, 0);
            }

            if (endTime) {
                const [endHour, endMinute] = endTime.split(':');
                end.setUTCHours(endHour, endMinute, 59, 999);
            } else {
                end.setUTCHours(23, 59, 59, 999);
            }

            dateFilter[Op.between] = [start, end];
        } else if (startDate) {
            const start = new Date(startDate);
            if (startTime) {
                const [startHour, startMinute] = startTime.split(':');
                start.setUTCHours(startHour, startMinute, 0, 0);
            }
            dateFilter[Op.gte] = start;
        } else if (endDate) {
            const end = new Date(endDate);
            if (endTime) {
                const [endHour, endMinute] = endTime.split(':');
                end.setUTCHours(endHour, endMinute, 59, 999);
            }
            dateFilter[Op.lte] = end;
        }

        // Fetch only feed, timestamp, and digester_name, but exclude records where feed is null
        const { count, rows } = await DigesterData.findAndCountAll({
            where: {
                digester_id: digesterIds,
                feed: { [Op.or]: [{ [Op.eq]: 0 }, { [Op.gt]: 0 }] }, // Ensure feed is 0 or greater
                ...(startDate || endDate ? { timestamp: dateFilter } : {}),
            },
            attributes: ['feed', 'timestamp', 'digester_name'], // Select specific attributes
            order: [['timestamp', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        if (rows.length === 0) {
            return res.status(204).json({ message: 'No feed data available for the selected filters.' });
        }

        // Convert timestamp to IST and format the data
        const formattedData = rows.map(data => ({
            ...data.toJSON(),
            timestamp: convertToIST(data.timestamp),  // Convert to IST
        }));

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            feedData: formattedData, // Changed to reflect feed data
        });
    } catch (error) {
        console.error('Error fetching feed data by client ID and filters:', error);
        res.status(500).json({ message: error.message });
    }
};




const getDigesterDataBySelectedDate = async (req, res) => {
    try {
        const { client_id } = req.params;
        const { selectedDate } = req.query; // Assume selectedDate is passed as a query parameter

        console.log("date", selectedDate);
        console.log("id", client_id);

        // Validate client_id
        if (!isValidId(parseInt(client_id))) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        // Check if the client exists
        const client = await User.findOne({ where: { id: client_id, role: 'client' } });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Fetch all digesters associated with the client
        const plants = await Plant.findAll({
            where: { client_id },
            include: [{
                model: Digester,
                as: 'Digesters',
                attributes: ['id'],
            }]
        });

        // Extract digester IDs from the plants
        const digesterIds = plants.flatMap(plant => plant.Digesters.map(d => d.id));

        if (digesterIds.length === 0) {
            return res.status(404).json({ message: 'No digesters found for this client' });
        }

        // Parse the selectedDate and set start and end of the day in UTC
        const startOfDay = new Date(selectedDate);
        startOfDay.setUTCHours(0, 0, 0, 0); // Start of selected date in UTC

        const endOfDay = new Date(selectedDate);
        endOfDay.setUTCHours(23, 59, 59, 999); // End of selected date in UTC

        // Fetch digester data for the selected date
        const digesterData = await DigesterData.findAll({
            where: {
                digester_id: digesterIds,
                timestamp: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                [Op.and]: [
                    { pH: { [Op.ne]: null } }, // pH should not be null
                    { pressure: { [Op.ne]: null } }, // Pressure should not be null
                    { temperature: { [Op.ne]: null } }, // Temperature should not be null
                    { pH: { [Op.or]: [{ [Op.gt]: 0 }, { [Op.eq]: 0 }] } }, // pH should be 0 or greater
                    { pressure: { [Op.or]: [{ [Op.gt]: 0 }, { [Op.eq]: 0 }] } }, // Pressure should be 0 or greater
                    { temperature: { [Op.or]: [{ [Op.gt]: 0 }, { [Op.eq]: 0 }] } } // Temperature should be 0 or greater
                ]
            },
            order: [['timestamp', 'DESC']],
        });

        // Check if there are any digester data records
        if (digesterData.length === 0) {
            return res.status(204).json({ message: 'No digester data available for the selected date.' });
        }

        // Convert UTC timestamp to IST
        const convertUTCtoIST = (timestamp) => {
            const date = new Date(timestamp);
            date.setHours(date.getHours() + 5); // Convert to IST
            date.setMinutes(date.getMinutes() + 30);
            return date.toISOString().replace('T', ' ').substring(0, 19); // Convert to desired format 'YYYY-MM-DD HH:mm:ss'
        };

        // Apply the conversion to each data entry
        const digesterDataWithIST = digesterData.map(item => {
            return {
                ...item.dataValues,
                timestamp: convertUTCtoIST(item.timestamp), // Convert and format timestamp to IST
            };
        });

        res.json({
            totalItems: digesterDataWithIST.length,
            digesterData: digesterDataWithIST,
        });
    } catch (error) {
        console.error('Error fetching digester data by selected date:', error);
        res.status(500).json({ message: error.message });
    }
};




module.exports = {
    addDigesterData,
    updateDigesterData,
    deleteDigesterData,
    getDigesterDataByDigesterId,
    processDigesterData,
    getDigesterDataBySelectedDate,
    getFeedDataByClientAndFilters,
    getAllDigesterDataByClientId,
    // exportDataByDigesterName,
    receiveDigesterData,
    receiveFeedData,
    fetchFeedDataForDate,
    getDigesterDataByClientId,
    addFeedData,
};
