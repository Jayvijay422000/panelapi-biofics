const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');

const Banner = sequelize.define('Banner', {
  // Use STRING if you are storing the file path instead of binary data
  photo: {
    type: DataTypes.STRING, // Store the path to the banner image
    allowNull: false,
  },
}, {
  timestamps: true,
});

// You can add additional methods or hooks if needed, e.g. for handling file uploads

module.exports = Banner;
