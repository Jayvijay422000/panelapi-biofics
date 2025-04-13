const GasRate = require('../Models/gasRate');

// Create a new gas rate



const addGasRate = async (req, res) => {
    const { price, start_date } = req.body;
    console.log("Received data", req.body);

    try {
        // Create a Date object from the incoming start_date
        const newStartDate = new Date(start_date); // This is in UTC by default
        // Ensure we store the date as UTC in the database
        const utcStartDate = new Date(Date.UTC(newStartDate.getFullYear(), newStartDate.getMonth(), newStartDate.getDate()));
        console.log("kjdkhgasdh",utcStartDate);

        // Check if there's an existing gas rate with a null end date
        const existingGasRate = await GasRate.findOne({
            where: { end_date: null },
            order: [['start_date', 'DESC']],
        });

        if (existingGasRate) {
            // Set the end date of the existing rate to one day before the new rate’s start date
            existingGasRate.end_date = new Date(utcStartDate.getTime() - 24 * 60 * 60 * 1000); // Subtract one day in UTC
            await existingGasRate.save();
        }

        // Create a new gas rate with the provided start date and price, with an end date of null
        const newGasRate = await GasRate.create({ price, start_date: utcStartDate, end_date: null });


        // console.log("dskajdfjdnf",newGasRate);
        res.status(201).json(newGasRate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};






const getAllGasRates = async (req, res) => {
    try {
        // Fetch all gas rates, ordered by start_date
        const gasRates = await GasRate.findAll({
            order: [['start_date', 'ASC']], // Order by start_date in ascending order
        });

        // Format the response to include only relevant fields if needed
        const formattedRates = gasRates.map(rate => ({
            id: rate.id,
            price: rate.price,
            start_date: rate.start_date,
            end_date: rate.end_date,
            isActive: rate.end_date === null // Determine if the rate is active
        }));

        res.status(200).json(formattedRates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




// Get a single gas rate by ID
const getGasRateById = async (req, res) => {
    const { id } = req.params;

    try {
        const gasRate = await GasRate.findByPk(id);
        if (gasRate) {
            res.status(200).json(gasRate);
        } else {
            res.status(404).json({ message: 'Gas rate not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a gas rate by ID
// const editGasRate = async (req, res) => {
//     const { id } = req.params;
//     const { price } = req.body;


//     console.log('Received price:', price);
//     // Validate price
//     if (price == null || isNaN(price)) {
//         return res.status(400).json({ message: 'Invalid price value' });
//     }

//     try {
//         const gasRate = await GasRate.findByPk(id);
//         if (gasRate) {
//             gasRate.price = price; // Update the price
//             await gasRate.save(); // Save changes
//             res.status(200).json(gasRate); // Return updated gas rate
//         } else {
//             res.status(404).json({ message: 'Gas rate not found' }); // Not found
//         }
//     } catch (error) {
//         console.error(error); // Log the error for debugging
//         res.status(500).json({ error: error.message }); // Return error message
//     }
// };


// In your controller file

const editGasRate = async (req, res) => {
    const { id } = req.params;
    const { price } = req.body;

    // console.log('Received price:', price);
    
    // Validate price
    if (price == null || isNaN(price) || price < 0) { // Ensure price is valid
        return res.status(400).json({ message: 'Invalid price value' });
    }

    try {
        const gasRate = await GasRate.findByPk(id);
        if (gasRate) {
            gasRate.price = price; // Update the price
            await gasRate.save(); // Save changes
            res.status(200).json(gasRate); // Return updated gas rate
        } else {
            res.status(404).json({ message: 'Gas rate not found' }); // Not found
        }
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: error.message }); // Return error message
    }
};






// Delete a gas rate by ID


const deleteGasRate = async (req, res) => {
    const { id } = req.params;

    try {
        const gasRate = await GasRate.findByPk(id);
        if (gasRate) {
            await gasRate.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Gas rate not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// const deleteGasRate = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const gasRate = await GasRate.findByPk(id);
//         if (gasRate) {
//             // Set the end_date to the current date instead of deleting
//             await gasRate.update({ end_date: new Date() });
//             res.status(204).send(); // Respond with no content status
//         } else {
//             res.status(404).json({ message: 'Gas rate not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
module.exports = {
    addGasRate,
    getAllGasRates,
    getGasRateById,
    editGasRate,
    deleteGasRate,
};
