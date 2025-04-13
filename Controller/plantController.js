const { Plant, Digester, User } = require('../Models');


// const addPlant = async (req, res) => {
//     try {
//         const { client_id, name, status } = req.body;

//         // Check if the client exists
//         const client = await User.findByPk(client_id);
//         if (!client || client.role !== 'client') {
//             return res.status(404).json({ message: 'Client not found or not a client' });
//         }

//         // Create new plant
//         const newPlant = await Plant.create({ 
//             client_id, 
//             client_name: client.username, // Set client name
//             name, 
//             status 
//         });

//         res.status(201).json({ message: 'Plant added successfully', plant: newPlant });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };










const addPlant = async (req, res) => {
    try {
        const { client_id, name, status, address, manager_contact, mobile_number } = req.body;

        // Check if the client exists
        const client = await User.findByPk(client_id);
        if (!client || client.role !== 'client') {
            return res.status(404).json({ message: 'Client not found or not a client' });
        }

        // Create new plant
        const newPlant = await Plant.create({ 
            client_id, 
            client_name: client.username, // Set client name
            name, 
            status,
            address, // Add address
            manager_contact, // Add manager contact
            mobile_number, // Add mobile number
        });

        res.status(201).json({ message: 'Plant added successfully', plant: newPlant });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
















// Add a new plant
// const addPlant = async (req, res) => {
//     try {
//         const { client_id, name, status } = req.body;

//         // Check if the client exists
//         const client = await User.findByPk(client_id);
//         if (!client || client.role !== 'client') {
//             return res.status(404).json({ message: 'Client not found or not a client' });
//         }

//         // Create new plant
//         const newPlant = await Plant.create({ client_id, name, status });

//         res.status(201).json({ message: 'Plant added successfully', plant: newPlant });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// Edit a plant (update details)
// const updatePlant = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, status } = req.body;

//         // Find the plant
//         const plant = await Plant.findByPk(id);
//         if (!plant) {
//             return res.status(404).json({ message: 'Plant not found' });
//         }

//         // Update plant details
//         plant.name = name !== undefined ? name : plant.name;
//         plant.status = status !== undefined ? status : plant.status;

//         await plant.save();

//         res.json({ message: 'Plant updated successfully', plant });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };







const updatePlant = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status, address, manager_contact, mobile_number } = req.body; // Add new fields

        // Find the plant
        const plant = await Plant.findByPk(id);
        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }

        // Update plant details
        plant.name = name !== undefined ? name : plant.name;
        plant.status = status !== undefined ? status : plant.status;
        plant.address = address !== undefined ? address : plant.address; // Update address
        plant.manager_contact = manager_contact !== undefined ? manager_contact : plant.manager_contact; // Update manager contact
        plant.mobile_number = mobile_number !== undefined ? mobile_number : plant.mobile_number; // Update mobile number

        await plant.save();

        res.json({ message: 'Plant updated successfully', plant });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};








// Delete a plant
const deletePlant = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the plant
        const plant = await Plant.findByPk(id);
        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }

        // Update digesters to set plant_id to NULL
        await Digester.update({ plant_id: null }, { where: { plant_id: id } });

        // Delete plant
        await plant.destroy();

        res.json({ message: 'Plant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const getAllPlants = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const plants = await Plant.findAndCountAll({
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            include: [{
                model: User,
                as: 'client',
                attributes: ['id', 'username', 'email'],
            }],
        });

        if (!res) {
            return { totalPlants: plants.count };
        }

        res.json({
            totalPlants: plants.count,
            totalPages: Math.ceil(plants.count / parseInt(limit, 10)),
            currentPage: parseInt(page, 10),
            plants: plants.rows,
        });
    } catch (error) {
        console.error(error); // Log error for debugging
        if (res && !res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};















// // Get all plants with pagination
// const getAllPlants = async (req, res) => {
//     try {
//         const { page = 1, limit = 10 } = req.query;
//         const offset = (page - 1) * limit;

//         // Ensure limit and offset are integers
//         const plants = await Plant.findAndCountAll({
//             limit: parseInt(limit, 10),
//             offset: parseInt(offset, 10),
//             include: [{
//                 model: User,
//                 as: 'client',
//                 attributes: ['id', 'username', 'email'],
//             }],
//         });

//         res.json({
//             totalPlants: plants.count,
//             totalPages: Math.ceil(plants.count / parseInt(limit, 10)),
//             currentPage: page,
//             plants: plants.rows,
//         });
//     } catch (error) {
//         console.error(error); // Log error for debugging
//         res.status(500).json({ message: error.message });
//     }
// };


// Get plant by ID
const getPlantById = async (req, res) => {
    try {
        const { id } = req.params;

        const plant = await Plant.findByPk(id, {
            include: [{
                model: User,
                as: 'client',
                attributes: ['id', 'username', 'email'],
            }],
        });

        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }

        res.json(plant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getPlantsByClientId = async (req, res) => {
    try {
        const { client_id } = req.params;

        // Check if the client exists
        const client = await User.findByPk(client_id);
        if (!client || client.role !== 'client') {
            return res.status(404).json({ message: 'Client not found or not a client' });
        }

        // Fetch the plants for the client
        const plants = await Plant.findAll({
            where: { client_id },
        });

        // Return the plants or the total count
        if (!res) {
            return { totalPlants: plants.length };
        }

        res.json({ plants });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};








// // Get plants by client ID
// const getPlantsByClientId = async (req, res) => {
//     try {
//         const { client_id } = req.params;

//         // Check if the client exists
//         const client = await User.findByPk(client_id);
//         if (!client || client.role !== 'client') {
//             return res.status(404).json({ message: 'Client not found or not a client' });
//         }

//         const plants = await Plant.findAll({
//             where: { client_id },
//         });

//         res.json({ plants });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

module.exports = {
    addPlant,
    updatePlant,
    deletePlant,
    getAllPlants,
    getPlantById,
    getPlantsByClientId,
};















// const { Plant, User } = require('../Models');

// // Add a new plant
// const addPlant = async (req, res) => {
//     try {
//         const { client_id, name, status } = req.body;

//         // Check if the client exists
//         const client = await User.findByPk(client_id);
//         if (!client || client.role !== 'client') {
//             return res.status(404).json({ message: 'Client not found or not a client' });
//         }

//         // Create new plant
//         const newPlant = await Plant.create({ client_id, name, status });

//         res.status(201).json({ message: 'Plant added successfully', plant: newPlant });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Edit a plant (update details)
// const updatePlant = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, status } = req.body;

//         // Find the plant
//         const plant = await Plant.findByPk(id);
//         if (!plant) {
//             return res.status(404).json({ message: 'Plant not found' });
//         }

//         // Update plant details
//         plant.name = name !== undefined ? name : plant.name;
//         plant.status = status !== undefined ? status : plant.status;

//         await plant.save();

//         res.json({ message: 'Plant updated successfully', plant });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Delete a plant
// const deletePlant = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Find the plant
//         const plant = await Plant.findByPk(id);
//         if (!plant) {
//             return res.status(404).json({ message: 'Plant not found' });
//         }

//         // Delete plant
//         await plant.destroy();

//         res.json({ message: 'Plant deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Get all plants with pagination
// const getAllPlants = async (req, res) => {
//     try {
//         const { page = 1, limit = 10 } = req.query;
//         const offset = (page - 1) * limit;

//         const plants = await Plant.findAndCountAll({
//             limit,
//             offset,
//             include: [{
//                 model: User,
//                 as: 'client',
//                 attributes: ['id', 'username', 'email'],
//             }],
//         });

//         res.json({
//             totalItems: plants.count,
//             totalPages: Math.ceil(plants.count / limit),
//             currentPage: page,
//             plants: plants.rows,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Get plant by ID
// const getPlantById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const plant = await Plant.findByPk(id, {
//             include: [{
//                 model: User,
//                 as: 'client',
//                 attributes: ['id', 'username', 'email'],
//             }],
//         });

//         if (!plant) {
//             return res.status(404).json({ message: 'Plant not found' });
//         }

//         res.json(plant);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };


// const getPlantsByClientId = async (req, res) => {
//     try {
//         const { client_id } = req.params;

//         // Check if the client exists
//         const client = await User.findByPk(client_id);
//         if (!client || client.role !== 'client') {
//             return res.status(404).json({ message: 'Client not found or not a client' });
//         }

//         const plants = await Plant.findAll({
//             where: { client_id },
            
//         });

//         res.json({plants : plants});
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// module.exports = {
//     addPlant,
//     updatePlant,
//     deletePlant,
//     getAllPlants,
//     getPlantById,
//     getPlantsByClientId,
// };
