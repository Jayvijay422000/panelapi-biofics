const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // description: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    // },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER, // Duration in days, or 0 for unlimited
        allowNull: false,
    },
});



module.exports = SubscriptionPlan;
