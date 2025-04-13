const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');
const Plant = require('./plant');  // Make sure to import the Plant model

const GeneratedGas = sequelize.define('GeneratedGas', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    plant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
   
    generated_gas: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    final_generated_gas: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'GeneratedGas', // Add this line to explicitly define the table name
});

// Associations
Plant.hasMany(GeneratedGas, { foreignKey: 'plant_id' });
GeneratedGas.belongsTo(Plant, { foreignKey: 'plant_id' });

module.exports = GeneratedGas;
