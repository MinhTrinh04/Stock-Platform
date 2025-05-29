module.exports = {
    mongodb: {
        url: process.env.MONGODB_URL || 'mongodb://localhost:27017/stock_platform',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    market: {
        tradingHours: {
            start: '09:00',
            end: '15:00',
            timezone: 'Asia/Ho_Chi_Minh'
        }
    }
}; 