const Queue = require('bull');
const DigesterData = require('../Models/digesterData');

const digesterQueue = new Queue('digesterQueue', {
    redis: {
        host: 'localhost',
        port: 6379
    }
});

digesterQueue.process(async (job) => {
    const digesterDataEntries = job.data;
    await DigesterData.bulkCreate(digesterDataEntries);
});

module.exports = digesterQueue;
