const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');
const SubscriptionPlan = require('./subscriptionPlan');
const AccessRight = require('./AccessRights');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mobile: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: DataTypes.ENUM('admin', 'employee', 'client'),
        allowNull: true,
    },
    subscription_status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
    },
    subscription_start: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    subscription_end: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    access_rights: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [], // Default to an empty array
    },
    subscription_plan_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    servicing_executive: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    creation_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Automatically set to current date
    },
});

// Define relationships
User.hasMany(User, { as: 'Clients', foreignKey: 'employee_Id' });
User.belongsTo(User, { as: 'Employee', foreignKey: 'employee_Id' });

User.belongsToMany(AccessRight, { through: 'UserAccessRights' });
AccessRight.belongsToMany(User, { through: 'UserAccessRights' });

// Uncomment if using SubscriptionPlan relationship
// SubscriptionPlan.hasMany(User, { foreignKey: 'subscription_plan' });
// User.belongsTo(SubscriptionPlan, { foreignKey: 'subscription_plan' });

module.exports = User;














// const { DataTypes } = require('sequelize');
// const sequelize = require('../Database/sequelize');
// const SubscriptionPlan = require('./subscriptionPlan');
// const AccessRight = require('./AccessRights');

// const User = sequelize.define('User', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     username: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     mobile: {
//         type: DataTypes.BIGINT,
//         allowNull: true,
//     },
//     password: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     email: {
//         type: DataTypes.STRING,
//         allowNull: true,
//     },
//     role: {
//         type: DataTypes.ENUM('admin', 'employee', 'client'),
//         allowNull: true,
//     },
//     subscription_status: {
//         type: DataTypes.ENUM('active', 'inactive'),
//         defaultValue: 'active',
//     },
//     subscription_start: {
//         type: DataTypes.DATE,
//         allowNull: true,
//     },
//     subscription_end: {
//         type: DataTypes.DATE,
//         allowNull: true,
//     },
//     access_rights: {
//         type: DataTypes.JSON,
//         allowNull: true,
//         defaultValue: [], // Default to an empty array
//     },
//     subscription_plan_name: {
//         type: DataTypes.STRING,
//         allowNull: true,
//     },
//     servicing_executive: {
//         type: DataTypes.JSON,
//         defaultValue:[]
//     },
// });

// // Define relationships
// User.hasMany(User, { as: 'Clients', foreignKey: 'employee_Id' });
// User.belongsTo(User, { as: 'Employee', foreignKey: 'employee_Id' });

// User.belongsToMany(AccessRight, { through: 'UserAccessRights' });
// AccessRight.belongsToMany(User, { through: 'UserAccessRights' });

// // Uncommenqt if using SubscriptionPlan relationship
// // SubscriptionPlan.hasMany(User, { foreignKey: 'subscription_plan' });
// // User.belongsTo(SubscriptionPlan, { foreignKey: 'subscription_plan' });

// module.exports = User;










// const { DataTypes } = require('sequelize');
    // const sequelize = require('../Database/sequelize');
    // const SubscriptionPlan = require('./subscriptionPlan');
    // const AccessRight = require('./AccessRights');

    // const User = sequelize.define('User', {
    //     id: {
    //         type: DataTypes.INTEGER,
    //         autoIncrement: true,
    //         primaryKey: true,
    //     },
    //     username: {
    //         type: DataTypes.STRING,
    //         allowNull: false,
    //     },
    //     mobile: {
    //         type: DataTypes.BIGINT,
    //         allowNull: true,
    //     },
    //     password: {
    //         type: DataTypes.STRING,
    //         allowNull: false,
    //     },
    //     email: {
    //         type: DataTypes.STRING,
    //         allowNull: true,
    //     },
    //     role: {
    //         type: DataTypes.ENUM('admin', 'employee', 'client'),
    //         allowNull: true,
    //     },
    //     subscription_status: {
    //         type: DataTypes.ENUM('active', 'inactive'),
    //         defaultValue: 'active',
    //     },
    //     subscription_start: {
    //         type: DataTypes.DATE,
    //         allowNull: true,
    //     },
    //     subscription_end: {
    //         type: DataTypes.DATE,
    //         allowNull: true,
    //     },
    //     access_rights: {
    //         type: DataTypes.JSON,
    //         allowNull: true,
    //         defaultValue: [], // Default to an empty array
    //     },
    //     subscription_plan_name: {
    //         type: DataTypes.STRING,
    //         allowNull: true,
    //     },
    //     servicing_executive: {
    //         type: DataTypes.JSON,
    //         allowNull: true,
    //     },
        
        
    // });

    // // Define relationships
    // User.hasMany(User, { as: 'Clients', foreignKey: 'employee_Id' });
    // User.belongsTo(User, { as: 'Employee', foreignKey: 'employee_Id' });
    // // User.belongsTo(User, { as: 'ServicingExecutive', foreignKey: 'servicing_executive_id' });

    // User.belongsToMany(AccessRight, { through: 'UserAccessRights' });
    // AccessRight.belongsToMany(User, { through: 'UserAccessRights' });

    // // Uncomment if using SubscriptionPlan relationship
    // // SubscriptionPlan.hasMany(User, { foreignKey: 'subscription_plan' });
    // // User.belongsTo(SubscriptionPlan, { foreignKey: 'subscription_plan' });

    // module.exports = User;











// const { DataTypes } = require('sequelize');
// const sequelize = require('../Database/sequelize');
// const SubscriptionPlan = require('./subscriptionPlan');
// const AccessRight = require('./AccessRights');

// const User = sequelize.define('User', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     username: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     mobile: {
//         type: DataTypes.BIGINT,
//         allowNull: true,
//     },
//     password: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     email: {
//         type: DataTypes.STRING,
//         allowNull: true,
//     },
//     role: {
//         type: DataTypes.ENUM('admin', 'employee', 'client'),
//         allowNull: true,
//     },
//     subscription_status: {
//         type: DataTypes.ENUM('active', 'inactive'),
//         defaultValue: 'active',
//     },
//     subscription_start: {
//         type: DataTypes.DATE,
//         allowNull: true,
//     },
//     subscription_end: {
//         type: DataTypes.DATE,
//         allowNull: true,
//     },
//     access_rights: {
//         type: DataTypes.JSON,
//         allowNull: true,
//         defaultValue: [] // Default to an empty array
//     },
//     subscription_plan_name: { // Store the subscription plan name
//         type: DataTypes.STRING,
//         allowNull: true,
//     }
// });

// // Define relationships
// User.hasMany(User, { as: 'Clients', foreignKey: 'employee_Id' });
// User.belongsTo(User, { as: 'Employee', foreignKey: 'employee_Id' });
// User.belongsToMany(AccessRight, { through: 'UserAccessRights' });
// AccessRight.belongsToMany(User, { through: 'UserAccessRights' });

// // Uncomment if using SubscriptionPlan relationship
// // SubscriptionPlan.hasMany(User, { foreignKey: 'subscription_plan' });
// // User.belongsTo(SubscriptionPlan, { foreignKey: 'subscription_plan' });

// module.exports = User;



// const { DataTypes } = require('sequelize');
// const sequelize = require('../Database/sequelize');

// const User = sequelize.define('User', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     username: {
//         type: DataTypes.STRING,
//         allowNull: false, // Ensure username is unique
//     },
//     mobile: {
//         type: DataTypes.BIGINT,
//         allowNull: true,
//     },
//     password: { 
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     email: {
//         type: DataTypes.STRING,
//         allowNull: true,
//     },
//     role: {
//         type: DataTypes.ENUM('admin', 'employee', 'client'),
//         allowNull: true,
//     },
//     subscription_status: {
//         type: DataTypes.ENUM('active', 'inactive'),
//         defaultValue: 'active',
//     },
//     subscription_start: {
//         type: DataTypes.DATE,
//         allowNull: true,
//     },
//     subscription_end: {
//         type: DataTypes.DATE,
//         allowNull: true,
//     },
// });

// // Define relationships
// User.hasMany(User, { as: 'Clients', foreignKey: 'employee_Id' });
// User.belongsTo(User, { as: 'Employee', foreignKey: 'employee_Id' });

// module.exports = User;
