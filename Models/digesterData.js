const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');
const Digester = require('./digester');
const Plant = require('./plant');

const DigesterData = sequelize.define('DigesterData', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    digester_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Digester,
            key: 'id',
        },
        allowNull: true,
    },
    plant_id: {
        type: DataTypes.INTEGER,  // Add plant_id to the model
        references: {
            model: Plant,
            key: 'id',
        },
        allowNull: true,
    },
    feed: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    digester_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    pH: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,  // Set default to 0
    },
    pressure: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,  // Set default to 0
    },
    temperature: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,  // Set default to 0
    },
    generated_gas: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,  // Set default to 0
    },
    final_generated_gas: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['digester_id', 'timestamp'],  // Add unique constraint on digester_id and timestamp
        },
    ],
});

Digester.hasMany(DigesterData, { foreignKey: 'digester_id' });
DigesterData.belongsTo(Digester, { foreignKey: 'digester_id' });

module.exports = DigesterData;









//  const { DataTypes } = require('sequelize');
//  const sequelize = require('../Database/sequelize');
//  const Digester = require('./digester');



// const DigesterData = sequelize.define('DigesterData', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     digester_id: {
//         type: DataTypes.INTEGER,
//         references: {
//             model: Digester,
//             key: 'id',
//         },
//         allowNull: true,
//     },
//     feed: {
//         type: DataTypes.FLOAT,
//         allowNull: true,
//     },
//     digester_name: {
//         type: DataTypes.STRING,
//         allowNull: true,
//     },
//     timestamp: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//     },
//     pH: {
//         type: DataTypes.FLOAT,
//         allowNull: true,
//     },
//     pressure: {
//         type: DataTypes.FLOAT,
//         allowNull: true,
//     },
//     temperature: {
//         type: DataTypes.FLOAT,
//         allowNull: true,
//     },
//     generated_gas: {
//         type: DataTypes.FLOAT,
//         allowNull: true,
//     },
//     final_generated_gas: {
//         type: DataTypes.FLOAT,
//         allowNull: true,
//     },
// }, {
//     indexes: [
//         {
//             unique: true,
//             fields: ['digester_id', 'timestamp'],  // Add unique constraint on digester_id and timestamp
//         },
//     ],
// });

// Digester.hasMany(DigesterData, { foreignKey: 'digester_id' });
// DigesterData.belongsTo(Digester, { foreignKey: 'digester_id' });

// module.exports = DigesterData;













// const { DataTypes } = require('sequelize');
// const sequelize = require('../Database/sequelize');
// const Digester = require('./digester');

// const DigesterData = sequelize.define('DigesterData', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     digester_id: {
//         type: DataTypes.INTEGER,
//         references: {
//             model: Digester,
//             key: 'id',
//         },
//         allowNull: true,
//     },
//     feed:{
//         type: DataTypes.FLOAT,
//         allowNull:true,
//     },

// digester_name: { // Add plant_name column
//         type: DataTypes.STRING,
//         allowNull: true,
//     },
//     timestamp: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//     },
//     pH: {
//         type: DataTypes.FLOAT,
//         allowNull: true,
//     },
//     pressure: {
//         type: DataTypes.FLOAT,
//         allowNull: true,
//     },
//     temperature: {
//         type: DataTypes.FLOAT,
//         allowNull: true,
//     },
    
//     generated_gas: {
//         type: DataTypes.FLOAT,
//         allowNull: true,
//     },

//     final_generated_gas: {
//         type: DataTypes.FLOAT,
//         allowNull: true,
//     },

// });

// Digester.hasMany(DigesterData, { foreignKey: 'digester_id' });
// DigesterData.belongsTo(Digester, { foreignKey: 'digester_id' });

// module.exports = DigesterData;








// const { DataTypes } = require('sequelize');
// const sequelize = require('../Database/sequelize');
// const Digester = require('./digester');

// const DigesterData = sequelize.define('DigesterData', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     digester_id: {
//         type: DataTypes.INTEGER,
//         references: {
//             model: Digester,
//             key: 'id',
//         },
//     },
//     timestamp: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//     },
//     pH: {
//         type: DataTypes.FLOAT,
//     },
//     pressure: {
//         type: DataTypes.FLOAT,
//     },
//     temperature: {
//         type: DataTypes.FLOAT,
//     },
//     generated_gas: {
//         type: DataTypes.FLOAT,
//     },
// });

// Digester.hasMany(DigesterData, { foreignKey: 'digester_id' });
// DigesterData.belongsTo(Digester, { foreignKey: 'digester_id' });

// module.exports = DigesterData;
