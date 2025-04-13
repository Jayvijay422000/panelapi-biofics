const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');
const Plant = require('./plant');
const User = require('./user')

const Digester = sequelize.define('Digester', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    plant_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Plant,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    plant_name: { // Add plant_name column
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    client_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    client_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id',
        },
    },
});

Plant.hasMany(Digester, { foreignKey: 'plant_id' });
Digester.belongsTo(Plant, { foreignKey: 'plant_id' });
// User.hasMany(Plant, { foreignKey: 'client_id', as: 'client' });
// Plant.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

module.exports = Digester;






// const { DataTypes } = require('sequelize');
// const sequelize = require('../Database/sequelize');
// const Plant = require('./plant');

// const Digester = sequelize.define('Digester', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     plant_id: {
//         type: DataTypes.INTEGER,
//         references: {
//             model: Plant,
//             key: 'id',
//         },
//         onDelete: 'SET NULL', // Set plant_id to NULL when a plant is deleted
//     },
//     name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
// });

// // Define relationships
// Plant.hasMany(Digester, { foreignKey: 'plant_id' });
// Digester.belongsTo(Plant, { foreignKey: 'plant_id' });

// module.exports = Digester;


// const { DataTypes } = require('sequelize');
// const sequelize = require('../Database/sequelize');
// const Plant = require('./plant');

// const Digester = sequelize.define('Digester', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     plant_id: {
//         type: DataTypes.INTEGER,
//         references: {
//             model: Plant,
//             key: 'id',
//         },
//     },
//     name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
// });

// Plant.hasMany(Digester, { foreignKey: 'plant_id' });
// Digester.belongsTo(Plant, { foreignKey: 'plant_id' });

// module.exports = Digester;
