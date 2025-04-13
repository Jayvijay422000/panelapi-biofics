async function cronJobFunction() {
    const now = new Date();

    try {
        const expiredClients = await User.findAll({
            where: {
                role: 'client',
                subscription_end: { [Op.lte]: now },
                subscription_status: 'active'
            }
        });

        if (expiredClients.length === 0) {
            console.log('No expired subscriptions found.');
            return;
        }

        for (const client of expiredClients) {
            client.subscription_status = 'inactive';
            client.access_rights = null; // Set access_rights to null
            await client.save({
                fields: ['subscription_status', 'access_rights']
            });
        }

        console.log(`Updated subscription statuses to inactive and cleared access rights for ${expiredClients.length} expired clients.`);
    } catch (error) {
        console.error('Error updating expired subscriptions and access rights:', error.message);
    }
}










// const cron = require('node-cron');
// const User = require('../Models/user');
// const { Op } = require('sequelize');

// // Define the cron job function
// async function cronJobFunction() {
//     const now = new Date(); 
//     const transaction = await User.sequelize.transaction();

//     try {
//         const expiredClients = await User.findAll({
//             where: {
//                 role: 'client',
//                 subscription_end: { [Op.lte]: now },
//                 subscription_status: 'active'
//             },
//             transaction
//         });

//         if (expiredClients.length === 0) {
//             console.log('No expired subscriptions found.');
//             return;
//         }

//         for (const client of expiredClients) {
//             client.subscription_status = 'inactive';
//             client.access_rights = null; // Set access_rights to null
//             await client.save({
//                 transaction,
//                 fields: ['subscription_status', 'access_rights']
//             });
//         }

//         await transaction.commit();
//         console.log(`Updated subscription statuses to inactive and cleared access rights for ${expiredClients.length} expired clients.`);
//     } catch (error) {
//         await transaction.rollback();
//         console.error('Error updating expired subscriptions and access rights:', error.message);
//     }
// }

// // Test the function manually
// (async () => {
//     await cronJobFunction();
// })();

// // Schedule the function to run every day at midnight
// cron.schedule('0 0 * * *', async () => {
//     await cronJobFunction();
// });















// const cron = require('node-cron');
// const User = require('../Models/user');
// const { Op } = require('sequelize');

// // Schedule the task to run every day at midnight
// cron.schedule('0 0 * * *', async () => {
//     const now = new Date(); // Current date and time
//     const transaction = await User.sequelize.transaction();

//     try {
//         // Find users with active subscriptions that have expired based on both date and time
//         const expiredClients = await User.findAll({
//             where: {
//                 role: 'client',
//                 subscription_end: {
//                     [Op.lte]: now // Op.lte means 'less than or equal to'
//                 },
//                 subscription_status: 'active' // Process only active subscriptions
//             },
//             transaction
//         });

//         // Update subscription status to inactive and clear access rights
//         for (const client of expiredClients) {
//             client.subscription_status = 'inactive'; // Set subscription status to inactive
//             client.access_rights = []; // Clear access rights

//             // Save the updates to both fields
//             await client.save({
//                 transaction,
//                 fields: ['subscription_status', 'access_rights']
//             });
//         }

//         await transaction.commit();
//         console.log(`Updated subscription statuses to inactive and cleared access rights for ${expiredClients.length} expired clients.`);
//     } catch (error) {
//         await transaction.rollback();
//         console.error('Error updating expired subscriptions and access rights:', error.message);
//     }
// });










// const cron = require('node-cron');
// const User = require('../Models/user');
// const { Sequelize } = require('sequelize');

// // Schedule the task to run every day at midnight
// cron.schedule('0 0 * * *', async () => {
//     const now = new Date();
//     try {
//         // Find users with active subscriptions that have expired
//         const users = await User.findAll({
//             where: {
//                 subscription_status: 'active',
//                 subscription_end: {
//                     [Sequelize.Op.lt]: now
//                 }
//             }
//         });

//         // Update the subscription status to inactive for expired subscriptions
//         for (const user of users) {
//             user.subscription_status = 'inactive';
//             await user.save();
//         }

//         console.log('Subscription statuses updated successfully.');
//     } catch (error) {
//         console.error('Error updating subscription statuses:', error);
//     }
// });
