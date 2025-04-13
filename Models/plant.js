const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');
const User = require('./user');

const Plant = sequelize.define('Plant', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    client_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id',
        },
    },
    client_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
    },
    creation_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Automatically set to current date
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    manager_contact: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mobile_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Define relationships
User.hasMany(Plant, { foreignKey: 'client_id', as: 'client' });
Plant.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

module.exports = Plant;











// const { DataTypes } = require('sequelize');
// const sequelize = require('../Database/sequelize');
// const User = require('./user');

// const Plant = sequelize.define('Plant', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     client_id: {
//         type: DataTypes.INTEGER,
//         references: {
//             model: User,
//             key: 'id',
//         },
//     },
//     client_name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     status: {
//         type: DataTypes.ENUM('active', 'inactive'),
//         defaultValue: 'active',
//     },
// });

// // Define relationships
// User.hasMany(Plant, { foreignKey: 'client_id', as: 'client' });
// Plant.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

// module.exports = Plant;


















// const { DataTypes } = require('sequelize');
// const sequelize = require('../Database/sequelize');
// const User = require('./user');

// const Plant = sequelize.define('Plant', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     client_id: {
//         type: DataTypes.INTEGER,
//         references: {
//             model: User,
//             key: 'id',
//         },
//     },
//     name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     status: {
//         type: DataTypes.ENUM('active', 'inactive'),
//         defaultValue: 'active',
//     },
// });

// // Define relationships
// User.hasMany(Plant, { foreignKey: 'client_id', as: 'Plants' });
// Plant.belongsTo(User, { foreignKey: 'client_id', as: 'User' });

// module.exports = Plant;



// const { DataTypes } = require('sequelize');
// const sequelize = require('../Database/sequelize');
// const User = require('./user');

// const Plant = sequelize.define('Plant', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     client_id: {
//         type: DataTypes.INTEGER,
//         references: {
//             model: User,
//             key: 'id',
//         },
//     },
//     name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     status: {
//         type: DataTypes.ENUM('active', 'inactive'),
//         defaultValue: 'active',
//     },
// });

// User.hasMany(Plant, { foreignKey: 'client_id', as: 'Plants' });
// Plant.belongsTo(User, { foreignKey: 'client_id', as: 'Plants'  });

// module.exports = Plant;
