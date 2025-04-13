// models/accessRight.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');

const AccessRight = sequelize.define('AccessRight', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
}, {
    timestamps: false,
});

module.exports = AccessRight;
