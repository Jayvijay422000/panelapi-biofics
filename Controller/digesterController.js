const { Digester, Plant, User } = require('../Models');

const addDigester = async (req, res) => {
    try {
        const { plant_id, name } = req.body;

        const plant = await Plant.findByPk(plant_id);
        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }

        const newDigester = await Digester.create({
            plant_id,
            plant_name: plant.name,
            client_id:plant.client_id,
            client_name: plant.client_name, // Set plant name
            name,
        });

        res.status(201).json({ message: 'Digester added successfully', digester: newDigester });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// Add a new digester
// const addDigester = async (req, res) => {
//     try {
//         const { plant_id, name } = req.body;

//         // Check if the plant exists
//         const plant = await Plant.findByPk(plant_id);
//         if (!plant) {
//             return res.status(404).json({ message: 'Plant not found' });
//         }

//         // Create new digester
//         const newDigester = await Digester.create({ plant_id, name });

//         res.status(201).json({ message: 'Digester added successfully', digester: newDigester });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// Edit a digester (update details)
const updateDigester = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Find the digester
        const digester = await Digester.findByPk(id);
        if (!digester) {
            return res.status(404).json({ message: 'Digester not found' });
        }

        // Update digester details
        digester.name = name !== undefined ? name : digester.name;

        await digester.save();

        res.json({ message: 'Digester updated successfully', digester });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a digester
const deleteDigester = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the digester
        const digester = await Digester.findByPk(id);
        if (!digester) {
            return res.status(404).json({ message: 'Digester not found' });
        }

        // Delete digester
        await digester.destroy();

        res.json({ message: 'Digester deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get digesters by plant ID
const getDigestersByPlantId = async (req, res) => {
    try {
        const { plant_id } = req.params;

        // Check if the plant exists
        const plant = await Plant.findByPk(plant_id);
        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }

        const digesters = await Digester.findAll({
            where: { plant_id },
            include: [{
                model: Plant,
                attributes: ['id', 'name', 'status'],
            }],
        });

        res.json(digesters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// // Get all digesters for a particular client
// const getDigestersByClientId = async (req, res) => {
//     try {
//         const { client_id } = req.params;


//         // Check if the client exists
//         const client = await User.findOne({ where: { id: client_id, role: 'client' } });
//         if (!client) {
//             return res.status(404).json({ message: 'Client not found' });
//         }


//         // Fetch digesters for the client's plants
//         const plants = await Plant.findAll({
//             where: { client_id },
//             include: [{
//                 model: Digester,
//                 as: 'Digesters',  // Alias should match the one defined in associations
//                 attributes: ['id', 'name', 'plant_id'], // Select relevant digester attributes
//             }]
//         });

//         // Extract digesters from the plants
//         const digesters = plants.flatMap(plant => plant.Digesters);

//         res.json(digesters);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };


const getDigestersByClientId = async (req, res) => {
    try {
        const { client_id } = req.params;

        // Check if the client exists
        const client = await User.findOne({ where: { id: client_id, role: 'client' } });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Fetch digesters for the client's plants
        const plants = await Plant.findAll({
            where: { client_id },
            include: [{
                model: Digester,
                as: 'Digesters',
                attributes: ['id', 'name', 'plant_id'], // Select relevant digester attributes
                include: [{
                    model: Plant,
                    as: 'Plant',
                    attributes: ['name'], // Fetch the plant name
                }]
            }]
        });

        // Extract digesters from the plants
        const digesters = plants.flatMap(plant => 
            plant.Digesters.map(digester => ({
                ...digester.toJSON(),
                plant_name: digester.Plant ? digester.Plant.name : null // Add plant_name to each digester
            }))
        );

        // Return the digesters or the total count
        if (!res) {
            return { totalDigesters: digesters.length };
        }

        res.json(digesters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};











// // Get all digesters for a particular client
// const getDigestersByClientId = async (req, res) => {
//     try {
//         const { client_id } = req.params;

//         // Check if the client exists
//         const client = await User.findOne({ where: { id: client_id, role: 'client' } });
//         if (!client) {
//             return res.status(404).json({ message: 'Client not found' });
//         }

//         // Fetch digesters for the client's plants with plant name
//         const plants = await Plant.findAll({
//             where: { client_id },
//             include: [{
//                 model: Digester,
//                 as: 'Digesters',  // Alias should match the one defined in associations
//                 attributes: ['id', 'name', 'plant_id'], // Select relevant digester attributes
//                 include: [{
//                     model: Plant,
//                     as: 'Plant', // Alias should match the one defined in associations
//                     attributes: ['name', 'status'], // Fetch the plant name
//                 }]
//             }]
//         });

//         // Extract digesters from the plants
//         const digesters = plants.flatMap(plant => {
//             return plant.Digesters.map(digester => ({
//                 ...digester.toJSON(),
//                 plant_name: digester.Plant ? digester.Plant.name : null // Add plant_name to each digester
//             }));
//         });

//         res.json(digesters);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };




const getAllDigesters = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const digesters = await Digester.findAndCountAll({
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            include: [{
                model: Plant,
                attributes: ['id', 'name', 'status', 'client_name'],
            }],
        });

        if (!res) {
            return { totalDigesters: digesters.count };
        }

        res.json({
            totalDigesters: digesters.count,
            totalPages: Math.ceil(digesters.count / parseInt(limit, 10)),
            currentPage: parseInt(page, 10),
            digesters: digesters.rows,
        });
    } catch (error) {
        console.error(error); // Log error for debugging
        if (res && !res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};








// const getAllDigesters = async (req, res) => {
//     try {
//         const { page = 1, limit = 10 } = req.query;
//         const offset = (page - 1) * limit;

//         // Ensure limit and offset are integers
//         const digesters = await Digester.findAndCountAll({
//             limit: parseInt(limit, 10),
//             offset: parseInt(offset, 10),
//             include: [{
//                 model: Plant,
//                 attributes: ['id', 'name', 'status', 'client_name'],
//             }],
//         });

//         res.json({
//             totalDigesters: digesters.count,
//             totalPages: Math.ceil(digesters.count / parseInt(limit, 10)),
//             currentPage: page,
//             digesters: digesters.rows,
//         });
//     } catch (error) {
//         console.error(error); // Log error for debugging
//         res.status(500).json({ message: error.message });
//     }
// };


module.exports = {
    addDigester,
    updateDigester,
    deleteDigester,
    getDigestersByClientId,
    getDigestersByPlantId,
    getAllDigesters
};