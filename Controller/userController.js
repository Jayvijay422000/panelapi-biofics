const User = require('../Models/user');
const SubscriptionPlan = require('../Models/subscriptionPlan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AccessRight = require('../Models/AccessRights');
const moment = require('moment'); 
const cron = require('node-cron');
const { Op } = require('sequelize');


// const login = async (req, res) => {
//     const { usernameOrEmail, password } = req.body;

//     try {
//         // Find user by username or email
//         const user = await User.findOne({
//             where: {
//                 [Op.or]: [
//                     { username: usernameOrEmail },
//                     { email: usernameOrEmail }
//                 ]
//             }
//         });

//         // Check if user exists
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Compare provided password with stored password
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             return res.status(401).json({ message: 'Invalid Password' });
//         }

//         // Generate JWT token
//         const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         // Convert subscription dates to IST and format without timezone offset
//         const subscriptionStart = user.subscription_start ? moment(user.subscription_start).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss') : null;
//         const subscriptionEnd = user.subscription_end ? moment(user.subscription_end).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss') : null;


//         const servicingExecutivesArray = Array.isArray(user.servicing_executive) ? user.servicing_executive : [user.servicing_executive];

//         // Respond with token and user data, including subscription details
//         res.status(200).json({
//             message: 'Login successful',
//             user: {
//                 _id: user.id,
//                 username: user.username,
//                 email: user.email,
//                 mobile: user.mobile,
//                 role: user.role,
//                 accessrights: user.access_rights,
//                 subscription_plan_name: user.subscription_plan_name,
//                 subscription_status: user.subscription_status,
//                 servicingexecutives: servicingExecutivesArray,
//                 subscription_start: subscriptionStart, // Formatted without timezone offset
//                 subscription_end: subscriptionEnd // Formatted without timezone offset
//             },
//             token
//         });
//     } catch (error) {
//         console.error(error); // Log the error for debugging
//         res.status(500).json({ message: 'Server error' });
//     }
// };

    
const login = async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    try {
        // Find user by username or email
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: usernameOrEmail },
                    { email: usernameOrEmail }
                ]
            }
        });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare provided password with stored password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid Password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '240h' });

        // Convert subscription dates to IST and format without timezone offset
        const subscriptionStart = user.subscription_start ? moment(user.subscription_start).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss') : null;
        const subscriptionEnd = user.subscription_end ? moment(user.subscription_end).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss') : null;

        // Parse servicing_executive as array (handling case where it might be stored as a string)
        const servicingExecutivesArray = Array.isArray(user.servicing_executive)
            ? user.servicing_executive
            : JSON.parse(user.servicing_executive || '[]'); // Parse stringified array, or default to empty array if null

        // Respond with token and user data, including subscription details
        res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user.id,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                accessrights: user.access_rights,
                subscription_plan_name: user.subscription_plan_name,
                subscription_status: user.subscription_status,
                servicingexecutives: servicingExecutivesArray, // Return as array
                subscription_start: subscriptionStart, // Formatted without timezone offset
                subscription_end: subscriptionEnd // Formatted without timezone offset
            },
            token
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = login;







// const login = async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         // Find user by username
//         const user = await User.findOne({ where: { username } });

//         // Check if user exists
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Compare provided password with stored password
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             return res.status(401).json({ message: 'Invalid Password' });
//         }

//         // Generate JWT token
//         const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

//         // Respond with token and user data, including subscription_status
//         res.status(200).json({
//             message: 'Login successful',
//             user: {
//                 _id: user.id,
//                 username: user.username,
//                 email: user.email,
//                 mobile: user.mobile,
//                 role: user.role,
//                 accessrights: user.access_rights,
//                 subscription_plan_name: user.subscription_plan_name,
//                 subscription_status: user.subscription_status,  // Added subscription_status
//             },
//             token
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };










// Login function for user authentication
// const login = async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         // Find user by username
//         const user = await User.findOne({ where: { username } });

//         // Check if user exists
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Compare provided password with stored password
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             return res.status(401).json({ message: 'Invalid Password' });
//         }

//         // Generate JWT token
//         const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

//         // Respond with token and user data
//         // res.json({ token, user });

//         res.status(200).json({
//             message: 'Login successful',
//             user: {
//                 _id: user.id,
//                 username: user.username,
//                 email: user.email,
//                 mobile: user.mobile,
//                 // position: user.position,
//                 // branch: user.branch,
//                 role: user.role,
//                 accessrights: user.access_rights,
//                 subscription_plan_name: user.subscription_plan_name,
//                 // currentMonthAttendance : user.currentMonthAttendance,
//                 // salary: user.salary
//             },
//             token
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// Function to add a new employee
// const addEmployee = async (req, res) => {
//     try {
//         // Check if the request is made by an admin
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         const { username, password, email, mobile } = req.body;

//         // Validate required fields
//         if (!username || !password || !email) {
//             return res.status(400).json({ message: 'Username, password, and email are required' });
//         }

//         // Check if username already exists
//         const existingUser = await User.findOne({ where: { username } });
//         if (existingUser) {
//             return res.status(409).json({ message: 'Username already exists' });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create new employee user
//         const newEmployee = await User.create({
//             username,
//             password: hashedPassword,
//             email,
//             mobile,
//             role: 'employee',
//         });

//         // Respond with success message and new employee data
//         res.status(201).json({ message: 'Employee added successfully', employee: newEmployee });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };



const addEmployee = async (req, res) => {
    try {
        // Check if the user has admin privileges
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { username, password, email, mobile,  } = req.body;

        // Validate required fields
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Username, password, email, selection are required' });
        }

        // Check if the username already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        // Check if the email already exists
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // Check if the mobile number already exists
        const existingMobile = await User.findOne({ where: { mobile } });
        if (existingMobile) {
            return res.status(409).json({ message: 'Mobile number already exists' });
        }

    

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new employee
        const newEmployee = await User.create({
            username,
            password: hashedPassword,
            email,
            mobile,
            role: 'employee',
            // Set the client username as servicing executive
        });

        res.status(201).json({ message: 'Employee added successfully', employee: newEmployee });
    } catch (error) {
        console.error('Error adding employee:', error); // Log the full error object
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};





const assignClientToEmployee = async (req, res) => {
    try {
        // Check if the user has admin privileges
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { employeeId, clientUsername } = req.body;

        // Validate required fields
        if (!employeeId || !clientUsername) {
            return res.status(400).json({ message: 'Employee ID and client username are required' });
        }

        // Check if the employee exists
        const employee = await User.findByPk(employeeId);
        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Check if the client exists
        const client = await User.findOne({ where: { username: clientUsername } });
        if (!client || client.role !== 'client') {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Update the employee with the assigned client
        await employee.update({ servicing_executive: clientUsername });

        res.status(200).json({ message: 'Client assigned to employee successfully', employee });
    } catch (error) {
        console.error('Error assigning client to employee:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};




// const updateEmployee = async (req, res) => {
//     try {
//         // Check if the user has admin privileges
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         const { id, username, password, email, mobile, client_username } = req.body;

//         // Validate required fields
//         if (!id || !username || !email || !client_username) {
//             return res.status(400).json({ message: 'ID, username, email, and client selection are required' });
//         }

//         // Find the existing employee by ID
//         const employee = await User.findByPk(id);
//         if (!employee) {
//             return res.status(404).json({ message: 'Employee not found' });
//         }

//         // Check if the username already exists (and is not the current employee's username)
//         if (username !== employee.username) {
//             const existingUser = await User.findOne({ where: { username } });
//             if (existingUser) {
//                 return res.status(409).json({ message: 'Username already exists' });
//             }
//         }

//         // Check if the email already exists (and is not the current employee's email)
//         if (email !== employee.email) {
//             const existingEmail = await User.findOne({ where: { email } });
//             if (existingEmail) {
//                 return res.status(409).json({ message: 'Email already exists' });
//             }
//         }

//         // Check if the mobile number already exists (and is not the current employee's mobile)
//         if (mobile && mobile !== employee.mobile) {
//             const existingMobile = await User.findOne({ where: { mobile } });
//             if (existingMobile) {
//                 return res.status(409).json({ message: 'Mobile number already exists' });
//             }
//         }

//         // Check if the client exists
//         const client = await User.findOne({ where: { username: client_username } });
//         if (!client) {
//             return res.status(404).json({ message: 'Client not found' });
//         }

//         // Update the employee details
//         const updatedEmployee = await employee.update({
//             username,
//             password: password ? await bcrypt.hash(password, 10) : employee.password, // Update password only if provided
//             email,
//             mobile,
//             servicing_executive: client_username, // Set the client username as servicing executive
//             role: 'employee', // Ensure role is set to 'employee'
//         });

//         res.status(200).json({ message: 'Employee updated successfully', employee: updatedEmployee });
//     } catch (error) {
//         console.error('Error updating employee:', error); // Log the full error object
//         res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };








// const addClient = async (req, res) => {
//     try {
//         console.log('Request Payload:', req.body);

//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         const { username, password, email, mobile, subscription_status, subscription_plan } = req.body;

//         if (!username || !password || !email) {
//             return res.status(400).json({ message: 'Username, password, and email are required' });
//         }

//         const existingUser = await User.findOne({ where: { username } });
//         if (existingUser) {
//             return res.status(409).json({ message: 'Username already exists' });
//         }

//         console.log('Looking for Subscription Plan with ID:', subscription_plan);
//         const subscriptionPlan = await SubscriptionPlan.findByPk(subscription_plan);
//         console.log('Found Subscription Plan:', subscriptionPlan);

//         if (!subscriptionPlan) {
//             return res.status(404).json({ message: 'Subscription plan not found', subscription_plan });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newClient = await User.create({
//             username,
//             password: hashedPassword,
//             email,
//             mobile,
//             role: 'client',
//             subscription_status,
//             subscription_plan_name: subscriptionPlan.name, // Save the subscription plan name
//         });

//         res.status(201).json({ message: 'Client added successfully', client: newClient });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ message: error.message });
//     }
// };










// const addClient = async (req, res) => {
//     try {
//         // Check if the user has admin privileges
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         const { username, password, email, mobile, subscription_status, subscription_plan, access_rights } = req.body;

//         // Validate required fields
//         if (!username || !password || !email) {
//             return res.status(400).json({ message: 'Username, password, and email are required' });
//         }

//         // Check if the username already exists
//         const existingUser = await User.findOne({ where: { username } });
//         if (existingUser) {
//             return res.status(409).json({ message: 'Username already exists' });
//         }

//         // Check if the email already exists
//         const existingEmail = await User.findOne({ where: { email } });
//         if (existingEmail) {
//             return res.status(409).json({ message: 'Email already exists' });
//         }

//         // Check if the mobile number already exists
//         const existingMobile = await User.findOne({ where: { mobile } });
//         if (existingMobile) {
//             return res.status(409).json({ message: 'Mobile number already exists' });
//         }

//         // Validate the subscription plan
//         const subscriptionPlan = await SubscriptionPlan.findByPk(subscription_plan);
//         if (!subscriptionPlan) {
//             return res.status(404).json({ message: 'Subscription plan not found' });
//         }

//         // Calculate the subscription start and end dates
//         const subscription_start = moment().toDate(); // Current date and time
//         const subscription_end = moment().add(subscriptionPlan.duration, 'days').toDate(); // Add duration to current date

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create the new client
//         const newClient = await User.create({
//             username,
//             password: hashedPassword,
//             email,
//             mobile,
//             role: 'client',
//             subscription_status,
//             subscription_start,
//             subscription_end,
//             subscription_plan_name: subscriptionPlan.name,
//             access_rights,
//         });

//         // Check if the current date is past the subscription end date
//         if (moment().isAfter(subscription_end)) {
//             newClient.access_rights = []; // Clear access rights if the subscription has ended
//             await newClient.save(); // Save the updated client
//         }

//         res.status(201).json({ message: 'Client added successfully', client: newClient });
//     } catch (error) {
//         console.error('Error adding client:', error.message); // Log the error for debugging
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };














// const addClient = async (req, res) => {
//     try {
//         // Check if the user has admin privileges
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         const { username, password, email, mobile, subscription_plan, access_rights } = req.body;

//         // Validate required fields
//         if (!username || !password || !email) {
//             return res.status(400).json({ message: 'Username, password, and email are required' });
//         }

//         // Check if the username already exists
//         const existingUser = await User.findOne({ where: { username } });
//         if (existingUser) {
//             return res.status(409).json({ message: 'Username already exists' });
//         }

//         // Check if the email already exists
//         const existingEmail = await User.findOne({ where: { email } });
//         if (existingEmail) {
//             return res.status(409).json({ message: 'Email already exists' });
//         }

//         // Check if the mobile number already exists
//         const existingMobile = await User.findOne({ where: { mobile } });
//         if (existingMobile) {
//             return res.status(409).json({ message: 'Mobile number already exists' });
//         }

//         // Validate the subscription plan
//         const subscriptionPlan = await SubscriptionPlan.findByPk(subscription_plan);
//         if (!subscriptionPlan) {
//             return res.status(404).json({ message: 'Subscription plan not found' });
//         }

//         // Calculate the subscription start and end dates
//         const subscription_start = moment().toDate(); // Current date and time
//         const subscription_end = moment().add(subscriptionPlan.duration, 'days').toDate(); // Add duration to current date

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create the new client
//         const newClient = await User.create({
//             username,
//             password: hashedPassword,
//             email,
//             mobile,
//             role: 'client',
//             subscription_status: 'active', // Set initial status to active
//             subscription_start,
//             subscription_end,
//             subscription_plan_name: subscriptionPlan.name,
//             access_rights, // Set access rights as provided
//         });

//         res.status(201).json({ message: 'Client added successfully', client: newClient });
//     } catch (error) {
//         console.error('Error adding client:', error.message); // Log the error for debugging
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };









const addClient = async (req, res) => {
    try {
        // Check if the user has admin privileges
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { username, password, email, mobile, subscription_plan, access_rights, address } = req.body;

        // Validate required fields
        if (!username || !password || !email || !address) {
            return res.status(400).json({ message: 'Username, password, email, and address are required' });
        }

        // Check if the username already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        // Check if the email already exists
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // Check if the mobile number already exists
        const existingMobile = await User.findOne({ where: { mobile } });
        if (existingMobile) {
            return res.status(409).json({ message: 'Mobile number already exists' });
        }

        // Validate the subscription plan
        const subscriptionPlan = await SubscriptionPlan.findByPk(subscription_plan);
        if (!subscriptionPlan) {
            return res.status(404).json({ message: 'Subscription plan not found' });
        }

        // Calculate the subscription start and end dates
        const subscription_start = moment().toDate(); // Current date and time
        const subscription_end = moment().add(subscriptionPlan.duration, 'days').toDate(); // Add duration to current date

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new client
        const newClient = await User.create({
            username,
            password: hashedPassword,
            email,
            mobile,
            role: 'client',
            subscription_status: 'active', // Set initial status to active
            subscription_start,
            subscription_end,
            subscription_plan_name: subscriptionPlan.name,
            access_rights, // Set access rights as provided
            address, // Set the client's address
            // creation_date: moment().toDate(), // Set the creation date
        });

        res.status(201).json({ message: 'Client added successfully', client: newClient });
    } catch (error) {
        console.error('Error adding client:', error.message); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error' });
    }
};




// Adjust the path based on your project structure

const sendMailToAdmin = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate the request body
        if (!email) {
            return res.status(400).json({ message: 'email is required' });
        }

        // Find the admin's email from the User model
        const adminUser = await User.findOne({ where: { role: 'admin' } });

        if (!adminUser) {
            return res.status(404).json({ message: 'Admin user not found' });
        }

        const adminEmail = adminUser.email;

        // Create a nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Change this to your email service (e.g., SMTP server, etc.)
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASSWORD, // Your email password or app password
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender email address
            to: adminEmail, // Admin email address
            subject: 'Password Change Request',
            text: `You have received the following message:\n\n${message}`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent successfully to admin' });
    } catch (error) {
        console.error('Error sending email to admin:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = sendMailToAdmin;











// const addClient = async (req, res) => {
//     try {
//         // Check if the user has admin privileges
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         const { username, password, email, mobile, subscription_status, subscription_plan, access_rights } = req.body;

//         // Validate required fields
//         if (!username || !password || !email) {
//             return res.status(400).json({ message: 'Username, password, and email are required' });
//         }

//         // Check if the username already exists
//         const existingUser = await User.findOne({ where: { username } });
//         if (existingUser) {
//             return res.status(409).json({ message: 'Username already exists' });
//         }

//         // Check if the email already exists
//         const existingEmail = await User.findOne({ where: { email } });
//         if (existingEmail) {
//             return res.status(409).json({ message: 'Email already exists' });
//         }

//         // Check if the mobile number already exists
//         const existingMobile = await User.findOne({ where: { mobile } });
//         if (existingMobile) {
//             return res.status(409).json({ message: 'Mobile number already exists' });
//         }

//         // Validate the subscription plan
//         const subscriptionPlan = await SubscriptionPlan.findByPk(subscription_plan);
//         if (!subscriptionPlan) {
//             return res.status(404).json({ message: 'Subscription plan not found' });
//         }

//         // Calculate the subscription start and end dates
//         const subscription_start = moment().toDate(); // Current date and time
//         const subscription_end = moment().add(subscriptionPlan.duration, 'days').toDate(); // Add duration to current date

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create the new client
//         const newClient = await User.create({
//             username,
//             password: hashedPassword,
//             email,
//             mobile,
//             role: 'client',
//             subscription_status,
//             subscription_start,
//             subscription_end,
//             subscription_plan_name: subscriptionPlan.name,
//             access_rights, // Store access rights
//         });

//         res.status(201).json({ message: 'Client added successfully', client: newClient });
//     } catch (error) {
//         console.error('Error adding client:', error.message); // Log the error for debugging
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };











//     try {
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         const { username, password, email, mobile, subscription_status, subscription_plan, access_rights } = req.body;

//         if (!username || !password || !email) {
//             return res.status(400).json({ message: 'Username, password, and email are required' });
//         }

//         const existingUser = await User.findOne({ where: { username } });
//         if (existingUser) {
//             return res.status(409).json({ message: 'Username already exists' });
//         }

//         const subscriptionPlan = await SubscriptionPlan.findByPk(subscription_plan);
//         if (!subscriptionPlan) {
//             return res.status(404).json({ message: 'Subscription plan not found' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newClient = await User.create({
//             username,
//             password: hashedPassword,
//             email,
//             mobile,
//             role: 'client',
//             subscription_status,
//             subscription_plan_name: subscriptionPlan.name,
//             access_rights, // Store access rights
//         });

//         res.status(201).json({ message: 'Client added successfully', client: newClient });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };




// const addClient = async (req, res) => {
//     try {
//         // Check if the user has admin privileges
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         const { username, password, email, mobile, subscription_status, subscription_plan, access_rights } = req.body;

//         // Validate required fields
//         if (!username || !password || !email) {
//             return res.status(400).json({ message: 'Username, password, and email are required' });
//         }

//         // Check if the username already exists
//         const existingUser = await User.findOne({ where: { username } });
//         if (existingUser) {
//             return res.status(409).json({ message: 'Username already exists' });
//         }

//         // Check if the email already exists
//         const existingEmail = await User.findOne({ where: { email } });
//         if (existingEmail) {
//             return res.status(409).json({ message: 'Email already exists' });
//         }

//         // Check if the mobile number already exists
//         const existingMobile = await User.findOne({ where: { mobile } });
//         if (existingMobile) {
//             return res.status(409).json({ message: 'Mobile number already exists' });
//         }

//         // Validate the subscription plan
//         const subscriptionPlan = await SubscriptionPlan.findByPk(subscription_plan);
//         if (!subscriptionPlan) {
//             return res.status(404).json({ message: 'Subscription plan not found' });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create the new client
//         const newClient = await User.create({
//             username,
//             password: hashedPassword,
//             email,
//             mobile,
//             role: 'client',
//             subscription_status,
//             subscription_plan_name: subscriptionPlan.name,
//             access_rights, // Store access rights
//         });

//         res.status(201).json({ message: 'Client added successfully', client: newClient });
//     } catch (error) {
//         console.error('Error adding client:', error.message); // Log the error for debugging
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };











// Function to add a new client
// const addClient = async (req, res) => {
//     try {
//         // Check if the request is made by an admin
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         const { username, password, email, mobile, subscription_status, subscription_plan,} = req.body;

//         // Validate required fields
//         if (!username || !password || !email) {
//             return res.status(400).json({ message: 'Username, password, and email are required' });
//         }

//         // Check if username already exists
//         const existingUser = await User.findOne({ where: { username } });
//         if (existingUser) {
//             return res.status(409).json({ message: 'Username already exists' });
//         }

//         // Check if subscription plan exists
//         const subscriptionPlan = await SubscriptionPlan.findByPk(subscription_plan);
//         if (!subscriptionPlan) {
//             return res.status(404).json({ message: 'Subscription plan not found' });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create new client user
//         const newClient = await User.create({
//             username,
//             password: hashedPassword,
//             email,
//             mobile,
//             role: 'client',
//             subscription_status,
//             subscription_plan,
//         });

//         // Respond with success message and new client data
//         res.status(201).json({ message: 'Client added successfully', client: newClient });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// Function to initialize an admin user if none exists



const initializeAdmin = async (req, res) => {
    try {
        // Check if an admin user already exists
        const adminExists = await User.findOne({ where: { role: 'admin' } });

        // If no admin exists, create the initial admin user
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const accessRightsArray = [
                'Dashboard',
                'AllEmployees',
                'AllClients',
                'AllPlants',
                'AllDigesters',
                'Subscription Plan',
                'Access Rights'
            ];

            // Create the initial admin user
            const initadmin = await User.create({
                username: 'admin',
                password: hashedPassword,
                email: 'admin@example.com',
                role: 'admin',
                access_rights: accessRightsArray // Store as JSON
            });

            res.status(201).json({ message: 'Initial admin user created successfully', initadmin });
        } else {
            res.status(401).json({ message: 'Admin user already exists' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// Function to get all users with pagination
const getAllUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        // Find and count all users with pagination
        const { count, rows: users } = await User.findAndCountAll({
            limit,
            offset,
        });

        // Calculate total pages
        const totalPages = Math.ceil(count / limit);

        // Respond with paginated users data
        res.json({
            page,
            limit,
            totalPages,
            totalUsers: count,
            users,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to get user by ID
const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        // Find user by primary key
        const user = await User.findByPk(id);

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with user data
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getUserByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        // Find user by username
        const user = await User.findOne({
            where: { username },
        });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with only id and username
        res.json({
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// module.exports = getUserByUsername;







// const getUserByUsername = async (req, res) => {
//     const { username } = req.params;

//     try {
//         // Find user by username
//         const user = await User.findOne({
//             where: { username }, // Query by username
//         });

//         // Check if user exists
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Respond with user data
//         res.json({ user });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };










// const updateUser = async (req, res) => {
//     const { id } = req.params;
//     const { username, password, email, mobile, role, subscription_status, subscription_plan, access_rights } = req.body;

//     try {
//         // Find user by primary key
//         const user = await User.findByPk(id);

//         // Check if user exists
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Update user fields if provided
//         if (username) user.username = username;
//         if (email) user.email = email;
//         if (mobile) user.mobile = mobile;
//         if (role) user.role = role;
//         if (subscription_status !== undefined) user.subscription_status = subscription_status;

//         // Check and update subscription plan if provided
//         if (subscription_plan) {
//             const plan = await SubscriptionPlan.findByPk(subscription_plan);
//             if (!plan) {
//                 return res.status(404).json({ message: 'Subscription plan not found' });
//             }
//             user.subscription_plan_name = plan.name;
//             user.subscription_start = moment().toDate();
//             user.subscription_end = moment().add(plan.duration, 'days').toDate();
//         }

//         // Hash and update password if provided
//         if (password) {
//             user.password = await bcrypt.hash(password, 10);
//         }

//         // Handle access rights
//         if (access_rights) {
//             // Validate access rights names and update
//             const validAccessRights = await AccessRight.findAll({
//                 where: {
//                     name: access_rights
//                 }
//             });
//             const validAccessRightIds = validAccessRights.map(right => right.id);
//             if (access_rights.length !== validAccessRightIds.length) {
//                 return res.status(400).json({ message: 'Some access rights are invalid' });
//             }
//             await user.setAccessRights(validAccessRightIds);
//         }

//         // Save updated user
//         await user.save();

//         // Respond with success message and updated user data
//         res.json({ message: 'User updated successfully', user });
//     } catch (error) {
//         console.error('Error updating user:', error);
//         res.status(500).json({ message: error.message });
//     }
// };




// const updateUser = async (req, res) => {
//     const { id } = req.params;
//     const { username, password, email, mobile, role, subscription_status, subscription_plan, access_rights } = req.body;

//     try {
//         // Find user by primary key
//         const user = await User.findByPk(id);

//         // Check if user exists
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Update user fields if provided
//         if (username) user.username = username;
//         if (email) user.email = email;
//         if (mobile) user.mobile = mobile;
//         if (role) user.role = role;
//         if (subscription_status !== undefined) user.subscription_status = subscription_status;

//         // Check and update subscription plan if provided
//         if (subscription_plan) {
//             const plan = await SubscriptionPlan.findByPk(subscription_plan);
//             if (!plan) {
//                 return res.status(404).json({ message: 'Subscription plan not found' });
//             }
//             user.subscription_plan_name = plan.name;
//             user.subscription_start = moment().toDate();
//             user.subscription_end = moment().add(plan.duration, 'days').toDate();
//         }

//         // Hash and update password if provided
//         if (password) {
//             user.password = await bcrypt.hash(password, 10);
//         }

//         // Handle access rights
//         if (access_rights) {
//             // Validate access rights names and update
//             const validAccessRights = await AccessRight.findAll({
//                 where: {
//                     name: access_rights.split(', ') // Split the string to match names
//                 }
//             });
//             const validAccessRightIds = validAccessRights.map(right => right.id);
//             if (access_rights.split(', ').length !== validAccessRightIds.length) {
//                 return res.status(400).json({ message: 'Some access rights are invalid' });
//             }
//             await user.setAccessRights(validAccessRightIds);
//         }

//         // Save updated user
//         await user.save();

//         // Respond with success message and updated user data
//         res.json({ message: 'User updated successfully', user });
//     } catch (error) {
//         console.error('Error updating user:', error);
//         res.status(500).json({ message: error.message });
//     }
// };



// const updateEmployee = async (req, res) => {
//     const { id } = req.params; // Get employee ID from route parameters
//     const { username, password, email, mobile } = req.body; // Employee-specific fields in request body

//     try {
//         // Ensure only admins can update employees
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         // Find employee by primary key (ID)
//         const employee = await User.findByPk(id);

//         // Check if employee exists
//         if (!employee || employee.role !== 'employee') {
//             return res.status(404).json({ message: 'Employee not found' });
//         }

//         // Update employee fields if provided
//         if (username) employee.username = username;
//         if (email) employee.email = email;
//         if (mobile) employee.mobile = mobile;

//         // Update password if provided
//         if (password) {
//             const hashedPassword = await bcrypt.hash(password, 10);
//             employee.password = hashedPassword;
//         }

//         // Save the updates to the database
//         await employee.save();

//         return res.status(200).json({ message: 'Employee updated successfully' });
//     } catch (error) {
//         console.error('Error updating employee:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };




// const updateEmployee = async (req, res) => {
//     const { id } = req.params;
//     const { username, password, email, mobile, clientUsernames } = req.body;

//     try {
//         // Ensure the user has admin privileges
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         const employee = await User.findByPk(id);

//         // Check if the employee exists and is not an admin
//         if (!employee || employee.role !== 'employee') {
//             return res.status(404).json({ message: 'Employee not found' });
//         }

//         // Update basic employee information if provided
//         if (username) employee.username = username;
//         if (email) employee.email = email;
//         if (mobile) employee.mobile = mobile;

//         // Hash the new password if provided
//         if (password) {
//             const hashedPassword = await bcrypt.hash(password, 10);
//             employee.password = hashedPassword;
//         }

//         // If client usernames are provided, add them to the employee
//         if (clientUsernames && clientUsernames.length > 0) {
//             // Fetch clients based on the provided usernames
//             const clients = await User.findAll({
//                 where: {
//                     username: clientUsernames,
//                     role: 'client',
//                 },
//             });

//             // Check if all provided clients exist
//             if (clients.length !== clientUsernames.length) {
//                 return res.status(404).json({ message: 'One or more clients not found' });
//             }

//             // Merge existing clients with the new ones, ensuring no duplicates
//             const currentClients = Array.isArray(employee.servicing_executive) ? employee.servicing_executive : [];
//             const updatedClients = Array.from(new Set([...currentClients, ...clientUsernames]));

//             // Update the employee's servicing executives
//             employee.servicing_executive = updatedClients;
//         }

//         // Save the updated employee
//         await employee.save();

//         return res.status(200).json({ message: 'Employee updated successfully', employee });
//     } catch (error) {
//         console.error('Error updating employee:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };












// const updateEmployee = async (req, res) => {
//     const { id } = req.params;
//     const { username, password, email, mobile, clientUsernames } = req.body;

//     try {
//         // Ensure the user has admin privileges
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         // Find the employee by ID
//         const employee = await User.findByPk(id);

//         // Check if the employee exists and is not an admin
//         if (!employee || employee.role !== 'employee') {
//             return res.status(404).json({ message: 'Employee not found' });
//         }

//         // Update employee details if provided
//         if (username) employee.username = username;
//         if (email) employee.email = email;
//         if (mobile) employee.mobile = mobile;

//         // Hash and update password if provided
//         if (password) {
//             const hashedPassword = await bcrypt.hash(password, 10);
//             employee.password = hashedPassword;
//         }

//         // If client usernames are provided, process the update
//         if (clientUsernames && clientUsernames.length > 0) {
//             // Fetch clients based on the provided usernames
//             const clients = await User.findAll({
//                 where: {
//                     username: clientUsernames,
//                     role: 'client',
//                 },
//             });

//             // Check if all provided clients exist
//             if (clients.length !== clientUsernames.length) {
//                 return res.status(404).json({ message: 'One or more clients not found' });
//             }

//             // Get the existing clients from the employee's servicing executives field
//             const currentClients = Array.isArray(employee.servicing_executive)
//                 ? employee.servicing_executive
//                 : [];

//             // Combine the existing clients with the new clients, avoiding duplicates
//             const updatedClients = Array.from(new Set([...currentClients, ...clientUsernames]));

//             // Update the employee's servicing executives with the merged list
//             employee.servicing_executive = updatedClients;
//         }

//         // Save the updated employee in the database
//         await employee.save();

//         // Return success response
//         return res.status(200).json({ message: 'Employee updated successfully', employee });
//     } catch (error) {
//         console.error('Error updating employee:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };

















const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { username, password, email, mobile, clientUsernames } = req.body;

    try {
        // Ensure the user has admin privileges
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Find the employee by ID
        const employee = await User.findByPk(id);

        // Check if the employee exists and is not an admin
        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Update employee details if provided
        if (username) employee.username = username;
        if (email) employee.email = email;
        if (mobile) employee.mobile = mobile;

        // Hash and update password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            employee.password = hashedPassword;
        }

        // If client usernames are provided, process the update
        if (clientUsernames && clientUsernames.length > 0) {
            // Fetch clients based on the provided usernames
            const clients = await User.findAll({
                where: {
                    username: clientUsernames,
                    role: 'client',
                },
            });

            // Check if all provided clients exist
            if (clients.length !== clientUsernames.length) {
                return res.status(404).json({ message: 'One or more clients not found' });
            }

            // Check if any of the clients are already assigned to other employees
            const existingAssignments = await User.findAll({
                where: {
                    servicing_executive: {
                        [Op.overlap]: clientUsernames,
                    },
                    id: {
                        [Op.ne]: id, // Exclude the current employee being updated
                    },
                },
            });

            if (existingAssignments.length > 0) {
                const assignedClients = existingAssignments.map((emp) => emp.servicing_executive).flat();
                const alreadyAssignedClients = clientUsernames.filter((client) =>
                    assignedClients.includes(client)
                );
                return res.status(400).json({
                    message: `The following clients are already assigned: ${alreadyAssignedClients.join(', ')}`,
                });
            }

            // Get the existing clients from the employee's servicing executives field
            const currentClients = Array.isArray(employee.servicing_executive)
                ? employee.servicing_executive
                : [];

            // Combine the existing clients with the new clients, avoiding duplicates
            const updatedClients = Array.from(new Set([...currentClients, ...clientUsernames]));

            // Update the employee's servicing executives with the merged list
            employee.servicing_executive = updatedClients;
        }

        // Save the updated employee in the database
        await employee.save();

        // Return success response
        return res.status(200).json({ message: 'Employee updated successfully', employee });
    } catch (error) {
        console.error('Error updating employee:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


























// const updateEmployee = async (req, res) => {
//     const { id } = req.params;
//     const { username, password, email, mobile, clientUsernames } = req.body;

//     try {
//         // Ensure only admins can update employees
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         // Find employee by primary key (ID)
//         const employee = await User.findByPk(id);

//         if (!employee || employee.role !== 'employee') {
//             return res.status(404).json({ message: 'Employee not found' });
//         }

//         // Update employee fields
//         if (username) employee.username = username;
//         if (email) employee.email = email;
//         if (mobile) employee.mobile = mobile;

//         if (password) {
//             const hashedPassword = await bcrypt.hash(password, 10);
//             employee.password = hashedPassword;
//         }

//         if (clientUsernames && clientUsernames.length > 0) {
//             const clients = await User.findAll({
//                 where: {
//                     username: clientUsernames,
//                     role: 'client',
//                 },
//             });

//             if (clients.length !== clientUsernames.length) {
//                 return res.status(404).json({ message: 'One or more clients not found' });
//             }

//             employee.servicing_executive = clientUsernames;
//         }

//         await employee.save();

//         return res.status(200).json({ message: 'Employee updated successfully', employee });
//     } catch (error) {
//         console.error('Error updating employee:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };









// const updateUser = async (req, res) => {
//     const { id } = req.params;
//     const { username, password, email, mobile, role, subscription_status, subscription_plan, access_rights } = req.body;

//     try {
//         // Find user by primary key
//         const user = await User.findByPk(id);

//         // Check if user exists
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Update user fields if provided
//         if (username) user.username = username;
//         if (email) user.email = email;
//         if (mobile) user.mobile = mobile;
//         if (role) user.role = role;
//         if (subscription_status !== undefined) user.subscription_status = subscription_status;

//         // Check and update subscription plan if it is provided
//         if (subscription_plan) {
//             const plan = await SubscriptionPlan.findByPk(subscription_plan);
//             if (!plan) {
//                 return res.status(404).json({ message: 'Subscription plan not found' });
//             }
//             user.subscription_plan_name = plan.name;
//             user.subscription_start = moment().toDate(); // Current date
//             user.subscription_end = moment().add(plan.duration, 'days').toDate(); // Plan duration from the current date
//         }

//         // Validate and update access rights if provided
//         if (access_rights) {
//             const rightsArray = access_rights.split(', ');
//             const validRights = await AccessRight.findAll({
//                 where: {
//                     name: rightsArray
//                 }
//             });

//             if (validRights.length !== rightsArray.length) {
//                 return res.status(400).json({ message: 'Some access rights are invalid' });
//             }

//             user.access_rights = access_rights;
//         }

//         // Update password if provided
//         if (password) {
//             const hashedPassword = await bcrypt.hash(password, 10);
//             user.password = hashedPassword;
//         }

//         // Save updates to the database
//         await user.save();

//         return res.status(200).json({ message: 'User updated successfully' });
//     } catch (error) {
//         console.error('Error updating user:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };















const updateUser = async (req, res) => {
    const { id } = req.params;
    const {
        username,
        password,
        email,
        mobile,
        role,
        subscription_status,
        subscription_plan,
        access_rights,
        address,          // New field
        creation_date,    // New field
        status            // New field (e.g., active/inactive)
    } = req.body;

    try {
        // Find user by primary key
        const user = await User.findByPk(id);

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields if provided
        if (username) user.username = username;
        if (email) user.email = email;
        if (mobile) user.mobile = mobile;
        if (role) user.role = role;
        if (subscription_status !== undefined) user.subscription_status = subscription_status;

        // Check and update subscription plan if provided
        if (subscription_plan) {
            const plan = await SubscriptionPlan.findByPk(subscription_plan);
            if (!plan) {
                return res.status(404).json({ message: 'Subscription plan not found' });
            }
            user.subscription_plan_name = plan.name;
            user.subscription_start = moment().toDate(); // Current date
            user.subscription_end = moment().add(plan.duration, 'days').toDate(); // Plan duration from the current date
        }

        // Validate and update access rights if provided
        if (access_rights) {
            const rightsArray = access_rights.split(', ');
            const validRights = await AccessRight.findAll({
                where: {
                    name: rightsArray
                }
            });

            if (validRights.length !== rightsArray.length) {
                return res.status(400).json({ message: 'Some access rights are invalid' });
            }

            user.access_rights = access_rights;
        }

        // Update address if provided
        if (address) {
            user.address = address; // Assuming 'address' is a field in your User model
        }

        // Update creation date if provided
        if (creation_date) {
            user.creation_date = moment(creation_date).toDate(); // Convert to Date object
        }

        // Update status if provided
        if (status !== undefined) {
            user.status = status; // Assuming 'status' is a field in your User model
        }

        // Update password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Save updates to the database
        await user.save();

        return res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};








// Function to delete user by ID
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Find user by primary key
        const user = await User.findByPk(id);

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete user
        await user.destroy();

        // Respond with success message
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to assign multiple clients to an employee
const assignClientsToEmployee = async (req, res) => {
    try {
        const { employeeId, clientIds } = req.body;

        // Find employee by ID
        const employee = await User.findByPk(employeeId);
        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({ message: 'Employee not found or not an employee' });
        }

        // Find clients by IDs
        const clients = await User.findAll({
            where: {
                id: clientIds,
                role: 'client',
            },
        });

        // Check if all clients are found
        if (clients.length !== clientIds.length) {
            return res.status(404).json({ message: 'One or more clients not found' });
        }

        // Assign employee ID to clients
        await User.update(
            { employeeId },
            { where: { id: clientIds } }
        );

        // Respond with success message
        res.json({ message: 'Clients assigned successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const getAllEmployees = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        // Find and count all employees with pagination
        const { count, rows: employees } = await User.findAndCountAll({
            where: { role: 'employee' },
            limit,
            offset,
        });

        // Calculate total pages
        const totalPages = Math.ceil(count / limit);

        // Return result if used in another function
        if (!res) {
            return { totalEmployees: count };
        }

        // Respond with paginated employees data
        res.json({
            page,
            limit,
            totalPages,
            totalEmployees: count,
            employees,
        });
    } catch (error) {
        // Check if headers are already sent
        if (res && !res.headersSent) {
            res.status(500).json({ message: error.message || 'An unexpected error occurred' });
        } else {
            console.error('Response headers already sent in getAllEmployees:', error);
        }
    }
};

// module.exports = { getAllEmployees };













// // Function to get all employees with pagination
// const getAllEmployees = async (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;

//     try {
//         // Find and count all employees with pagination
//         const { count, rows: employees } = await User.findAndCountAll({
//             where: { role: 'employee' },
//             limit,
//             offset,
//         });

//         // Calculate total pages
//         const totalPages = Math.ceil(count / limit);

//         // Respond with paginated employees data
//         res.json({
//             page,
//             limit,
//             totalPages,
//             totalEmployees: count,
//             employees,
//         });
//     } catch (error) {
//         // Check if headers are already sent
//         if (!res.headersSent) {
//             res.status(500).json({ message: error.message || 'An unexpected error occurred' });
//         } else {
//             console.error('Response headers already sent in getAllEmployees:', error);
//         }
//     }
// };

  

// Function to get all clients without pagination
const getAllClientsWithoutPagination = async (req, res) => {
    try {
        // Find all clients where the role is 'client'
        const clients = await User.findAll({
            where: { role: 'client' },
        });

        // Return result if used in another function
        if (!res) {
            return { totalClients: clients.length, clients };
        }

        // Respond with all clients data
        res.json({
            totalClients: clients.length,
            clients,
        });
    } catch (error) {
        // Check if headers are already sent
        if (res && !res.headersSent) {
            res.status(500).json({ message: error.message || 'An unexpected error occurred' });
        } else {
            console.error('Response headers already sent in getAllClientsWithoutPagination:', error);
        }
    }
};






// Function to get all clients with pagination
const getAllClients = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        // Find and count all clients with pagination
        const { count, rows: clients } = await User.findAndCountAll({
            where: { role: 'client' },
            limit,
            offset,
        });

        // Calculate total pages
        const totalPages = Math.ceil(count / limit);

        // Return result if used in another function
        if (!res) {
            return { totalClients: count };
        }

        // Respond with paginated clients data
        res.json({
            page,
            limit,
            totalPages,
            totalClients: count,
            clients,
        });
    } catch (error) {
        // Check if headers are already sent
        if (res && !res.headersSent) {
            res.status(500).json({ message: error.message || 'An unexpected error occurred' });
        } else {
            console.error('Response headers already sent in getAllClients:', error);
        }
    }
};


const removeExpiredSubscriptions = async () => {
    try {
        const now = new Date();
        const clientsWithExpiredSubscriptions = await User.findAll({
            where: {
                subscription_end: {
                    [Op.lt]: now, // Check for subscriptions that have ended
                },
                access_rights: {
                    [Op.not]: null // Ensure access_rights is not already null
                }
            }
        });

        for (const client of clientsWithExpiredSubscriptions) {
            await client.update({
                access_rights: null, // Remove access rights
                subscription_status: 'inactive' // Optionally update status
            });
        }

        console.log('Expired subscriptions processed successfully.');
    } catch (error) {
        console.error('Error processing expired subscriptions:', error.message);
    }
};

// Schedule the job to run daily at midnight
cron.schedule('0 0 * * *', removeExpiredSubscriptions);


// Controller method to get admin details
const getAdminDetails = async (req, res) => {
    try {
        // Find the user with the role 'admin'
        const admin = await User.findOne({ where: { role: 'admin' } });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Extract relevant fields for the response
        const { email, username } = admin; // Assuming 'username' is the field for admin's name
        
        // Send the response with admin details
        res.json({ email, username });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};




const getSubscriptionDetails = async (req, res) => {
    const { clientId } = req.params;

    try {
        // Find the user with the specified client ID
        const client = await User.findOne({
            where: { id: clientId },
            attributes: ['subscription_start', 'subscription_end'], // Fetch only the relevant fields
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Extract relevant fields for the response
        const { subscription_start, subscription_end } = client;

        // Send the response with subscription details
        res.json({ subscription_start, subscription_end });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    login,
    initializeAdmin,
    addEmployee,
    addClient,
    // updateEmployee,
    getAllUsers,
    getUserById,
    updateEmployee,
    getUserByUsername,
    assignClientToEmployee,
    getAllClientsWithoutPagination,
    updateUser,
    getAdminDetails,
    deleteUser,
    assignClientsToEmployee,
    removeExpiredSubscriptions,
    getAllEmployees,
    getAllClients,
    getSubscriptionDetails,
    
};
