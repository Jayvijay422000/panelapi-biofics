// controllers/accessRightController.js
const { AccessRight } = require('../Models');

// Add a new access right
const addAccessRight = async (req, res) => {
    try {
        const { name } = req.body;

        // Create new access right
        const newAccessRight = await AccessRight.create({ name });

        res.status(201).json({ message: 'Access right added successfully', accessRight: newAccessRight });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all access rights
const getAllAccessRights = async (req, res) => {
    try {
        // Extract page and limit from query parameters, defaulting to 1 and 10
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Ensure page and limit are integers
        const pageNumber = parseInt(page, 10);
        const pageLimit = parseInt(limit, 10);

        // Fetch paginated access rights
        const accessRights = await AccessRight.findAndCountAll({
            limit: pageLimit,
            offset: offset,
        });

        // Return paginated data
        res.json({
            totalAccessRights: accessRights.count,
            totalPages: Math.ceil(accessRights.count / pageLimit),
            currentPage: pageNumber,
            accessRights: accessRights.rows,
        });
    } catch (error) {
        console.error(error); // Log error for debugging
        res.status(500).json({ message: error.message });
    }
};


// // Get access right by ID
// const getAccessRightById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const accessRight = await AccessRight.findByPk(id);
//         if (!accessRight) {
//             return res.status(404).json({ message: 'Access right not found' });
//         }

//         res.json(accessRight);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// Update an access right
const updateAccessRight = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const accessRight = await AccessRight.findByPk(id);
        if (!accessRight) {
            return res.status(404).json({ message: 'Access right not found' });
        }

        accessRight.name = name !== undefined ? name : accessRight.name;
       

        await accessRight.save();

        res.json({ message: 'Access right updated successfully', accessRight });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// // Delete an access right
// const deleteAccessRight = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const accessRight = await AccessRight.findByPk(id);
//         if (!accessRight) {
//             return res.status(404).json({ message: 'Access right not found' });
//         }

//         await accessRight.destroy();

//         res.json({ message: 'Access right deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

module.exports = {
    addAccessRight,
    getAllAccessRights,
    // getAccessRightById,
    updateAccessRight

};
