const { getAllEmployees } = require('../Controller/userController');
const { getAllClients } = require('../Controller/userController');
const { getAllPlants } = require('../Controller/plantController');
const { getAllDigesters } = require('../Controller/digesterController');
const { getPlantsByClientId } = require('../Controller/plantController');
const { getDigestersByClientId } = require('../Controller/digesterController');

// Controller function to get aggregated dashboard data
const getDashboardData = async (req, res) => {
    try {
        const [employeesData, plantsData, digestersData, clientsData] = await Promise.all([
            getAllEmployees(req),  // Calls should use req and res as intended
            getAllPlants(req),
            getAllDigesters(req),
            getAllClients(req),
        ]);

        // Ensure response headers are not sent before sending response
        if (!res.headersSent) {
            const response = {
                totalEmployees: employeesData.totalEmployees || 0,
                totalPlants: plantsData.totalPlants || 0,
                totalClients: clientsData.totalClients || 0,
                totalDigesters: digestersData.totalDigesters || 0,
            };

            res.json(response);
        }
    } catch (error) {
        console.error('Error in getDashboardData:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message || 'An unexpected error occurred' });
        }
    }
};


const getDashboardDataByClientId = async (req, res) => {
    try {
        const { client_id } = req.params;

        if (!client_id) {
            return res.status(400).json({ message: 'Client ID is required' });
        }

        const [{ totalPlants }, { totalDigesters }] = await Promise.all([
            getPlantsByClientId({ params: { client_id } }),
            getDigestersByClientId({ params: { client_id } })
        ]);

        res.json({ totalPlants, totalDigesters });
    } catch (error) {
        console.error('Error in getDashboardDataByClientId:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
};








// // Controller function to get dashboard data by client ID
// const getDashboardDataByClientId = async (req, res) => {
//     try {
//         const { client_id } = req.params;

//         if (!client_id) {
//             return res.status(400).json({ message: 'Client ID is required' });
//         }

//         // Fetch plants and digesters data by client_id
//         const [plantsResponse, digestersResponse] = await Promise.all([
//             getPlantsByClientId(req, res), // Use actual req and res here
//             getDigestersByClientId(req, res) // Use actual req and res here
//         ]);

//         // Validate responses
//         if (!plantsResponse || !digestersResponse) {
//             return res.status(500).json({ message: 'Failed to retrieve data' });
//         }

//         const totalPlants = Array.isArray(plantsResponse.plants) ? plantsResponse.plants.length : 0;
//         const totalDigesters = Array.isArray(digestersResponse) ? digestersResponse.length : 0;

//         const response = {
//             totalPlants,
//             totalDigesters
//         };

//         res.json(response);
//     } catch (error) {
//         console.error('Error in getDashboardDataByClientId:', error);
//         if (!res.headersSent) {
//             res.status(500).json({ message: 'An unexpected error occurred' });
//         }
//     }
// };

module.exports = { getDashboardData, getDashboardDataByClientId };













// const { getAllEmployees } = require('../Controller/userController');
// const { getAllClients } = require('../Controller/userController');
// const { getAllPlants } = require('../Controller/plantController');
// const { getAllDigesters } = require('../Controller/digesterController');
// const { getPlantsByClientId } = require('../Controller/plantController');
// const { getDigestersByClientId } = require('../Controller/digesterController');

// const getDashboardData = async (req, res) => {
//     try {
//         const [employeesData, plantsData, digestersData, clientsData] = await Promise.all([
//             getAllEmployees(req),  // Call without passing `res`
//             getAllPlants(req),
//             getAllDigesters(req),
//             getAllClients(req),  // Call without passing `res`
//         ]);

//         if (!res.headersSent) {
//             // Format response as an object
//             const response = {
//                 totalEmployees: employeesData.totalEmployees || 0,
//                 totalPlants: plantsData.totalPlants || 0,
//                 totalClients: clientsData.totalClients || 0,
//                 totalDigesters: digestersData.totalDigesters || 0,
//             };

//             res.json(response);
//         } else {
//             console.error('Response headers already sent in getDashboardData');
//         }
//     } catch (error) {
//         if (!res.headersSent) {
//             res.status(500).json({ message: error.message || 'An unexpected error occurred' });
//         } else {
//             console.error('Response headers already sent in getDashboardData:', error);
//         }
//     }
// };

// module.exports = { getDashboardData };

// const getDashboardDataByClientId = async (req, res) => {
//     try {
//         const { client_id } = req.params;

//         // Ensure client_id is provided
//         if (!client_id) {
//             return res.status(400).json({ message: 'Client ID is required' });
//         }

//         // Fetch plants and digesters data
//         const [plantsResponse, digestersResponse] = await Promise.all([
//             getPlantsByClientId({ params: { client_id } }), // Mock request object
//             getDigestersByClientId({ params: { client_id } }) // Mock request object
//         ]);

//         // Validate responses
//         if (!plantsResponse || !digestersResponse) {
//             return res.status(500).json({ message: 'Failed to retrieve data' });
//         }

//         // Extract data
//         const totalPlants = Array.isArray(plantsResponse.plants) ? plantsResponse.plants.length : 0;
//         const totalDigesters = Array.isArray(digestersResponse) ? digestersResponse.length : 0;

//         // Format response
//         const response = {
//             totalPlants,
//             totalDigesters
//         };

//         res.json(response);
//     } catch (error) {
//         // Log error and send response
//         console.error('Error in getDashboardDataByClientId:', error);
//         res.status(500).json({ message: 'An unexpected error occurred' });
//     }
// };

// module.exports = { getDashboardDataByClientId };








// const { getAllEmployees } = require('../Controller/userController');
    // const { getAllClients } = require('../Controller/userController');
    // const { getAllPlants } = require('../Controller/plantController');
    // const { getAllDigesters } = require('../Controller/digesterController');

    // const getDashboardData = async (req, res) => {
    //     try {
    //         const [employeesData, plantsData, digestersData, clientsData] = await Promise.all([
    //             getAllEmployees(req, res),
    //             getAllPlants(req, res),
    //             getAllDigesters(req, res),
    //             getAllClients(req, res),
    //         ]);

    // console.log(getDashboardData);

    //         if (!res.headersSent) {
    //             const response = {
    //                 totalEmployees: employeesData.totalEmployees.length,
    //                 totalPlants: plantsData.totalPlants,
    //                 totalClients: clientsData.totalClients,
    //                 totalDigesters: digestersData.length,
    //                 employees,
    //                 clients,
    //                 plants ,
    //                 digesters, 
    //             };

    //             res.json(response);
    //         } else {
    //             console.error('Response headers already sent in getDashboardData');
    //         }
    //     } catch (error) {
    //         if (!res.headersSent) {
    //             res.status(500).json({ message: error.message || 'An unexpected error occurred' });
    //         } else {
    //             console.error('Response headers already sent in getDashboardData:', error);
    //         }
    //     }
    // };


    // module.exports = { getDashboardData };















    // const { getAllEmployees } = require('../Controller/userController');
    // const { getAllClients } = require('../Controller/userController');

    // const { getAllPlants } = require('../Controller/plantController');
    // const { getAllDigesters } = require('../Controller/digesterController');

    // const getDashboardData = async (req, res) => {
    //     try {
    //         const [employeesData, plantsData, digestersData, clientsData] = await Promise.all([
    //             getAllEmployees(req, res),
    //             getAllPlants(req, res),
    //             getAllDigesters(req, res),
    //             getAllClients(req, res),
                
    //         ]);

    //         if (!res.headersSent) {
    //             res.json({
    //                 totalEmployees: employeesData.totalEmployees,
    //                 totalPlants: plantsData.length,
    //                 totalClients: clientsData.length,
    //                 totalDigesters: digestersData.length,
    //             });
    //         } else {
    //             console.error('Response headers already sent in getDashboardData');
    //         }
    //     } catch (error) {
    //         // Check if headers are already sent
    //         if (!res.headersSent) {
    //             res.status(500).json({ message: error.message || 'An unexpected error occurred' });
    //         } else {
    //             console.error('Response headers already sent in getDashboardData:', error);
    //         }
    //     }
    // };

    // module.exports = { getDashboardData };
