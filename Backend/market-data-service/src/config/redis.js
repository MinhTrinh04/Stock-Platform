const Redis = require('redis');

const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379',
    socket: {
        reconnectStrategy: (retries) => {
            console.log(`Redis reconnecting... Attempt ${retries}`);
            return Math.min(retries * 100, 3000);
        }
    }
});

redisClient.on('connect', () => {
    console.log('Redis client connected');
});

redisClient.on('ready', () => {
    console.log('Redis client ready');
});

redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
});

redisClient.on('end', () => {
    console.log('Redis client connection ended');
});

redisClient.connect().catch(err => {
    console.error('Redis connection error:', err);
});

module.exports = redisClient; 