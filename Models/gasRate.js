const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');

const GasRate = sequelize.define('GasRate', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'gasRate', // Set default name as "gasRate"
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'GasRate', // Explicitly define the table name
});

// Export the model
module.exports = GasRate;
















// const { DataTypes } = require('sequelize');
// const sequelize = require('../Database/sequelize');

// const GasRate = sequelize.define('GasRate', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         defaultValue: 'gasRate', // Set default name as "gasRate"
//     },
//     price: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//     },
// }, {
//     tableName: 'GasRate', // Explicitly define the table name
// });

// // Export the model
// module.exports = GasRate;
