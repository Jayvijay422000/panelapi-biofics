const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');

// Define the Notification model
const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    timestamps: true, 
});

module.exports = Notification;
