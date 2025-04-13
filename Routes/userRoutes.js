const express = require('express');
const router = express.Router();
const { authenticateUser, checkUserRole } = require('../Middleware/authMiddleware');
const userController = require('../Controller/userController');

// Route to handle login
router.post('/login-user', userController.login);

// Route to handle initializeAdmin
router.post('/initial-admin', userController.initializeAdmin);

// Route to assign clients to an employee
router.post('/assign-clients', userController.assignClientsToEmployee);


// router.put('/update-employee/:id', userController.updateEmployee);
// Route to add a client
router.post('/add-client', authenticateUser, checkUserRole(['admin']), userController.addClient);

// Route to add an employee
router.post('/add-employee', authenticateUser, checkUserRole(['admin']), userController.addEmployee);

// Route to get all users with pagination
router.get('/get-users', authenticateUser, userController.getAllUsers);

// Route to get all getAllClients  with pagination
router.get('/get-allclients', authenticateUser, userController.getAllClients);



router.get('/getallclients', authenticateUser, userController.getAllClientsWithoutPagination);


// Route to get all allemployee with pagination
router.get('/get-allemployees', authenticateUser, userController.getAllEmployees);

// router.put('/update-employee/:id', authenticateUser, checkUserRole(['admin']), userController.updateEmployee);


router.post('/employee/assign-client/:employeeId', userController.assignClientToEmployee);



// Route to get a user by ID
router.get('/get-user/:id', authenticateUser, userController.getUserById);


router.get('/username/:username', userController.getUserByUsername);

// Route to update a user by ID
router.put('/update-user/:id', authenticateUser, checkUserRole(['admin']), userController.updateUser);

router.put('/update-employee/:id', authenticateUser, checkUserRole(['admin']), userController.updateEmployee);


// Route to delete a user by ID
router.delete('/delete-user/:id', authenticateUser, checkUserRole(['admin']), userController.deleteUser);


router.get('/admin-details', userController.getAdminDetails);


router.get('/subscription-details/:clientId', userController.getSubscriptionDetails);

module.exports = router;