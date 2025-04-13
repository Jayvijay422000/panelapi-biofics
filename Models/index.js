const sequelize = require('../Database/sequelize');
const User = require('./user')
const Plant = require('./plant');
const Digester = require('./digester');
const DigesterData = require('./digesterData');
const AccessRight = require('./AccessRights');
const GeneratedGas = require('./generatedGas');


const initModels = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully');
    } catch (error) {
        console.error('Error syncing database or Connecting to Database:', error);
    }
};

module.exports = {
    initModels,
    User,
    Plant,
    Digester,
    DigesterData,
    AccessRight,
    GeneratedGas,


};
