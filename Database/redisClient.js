const redis = require('redis');
const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

module.exports = redisClient;
