const Redis = require('ioredis');
const config = require('../config');

const redis = new Redis(config.redis.url);

const CACHE_TTL = {
    '1H': 60 * 5, // 5 minutes for hourly data
    '1D': 60 * 60, // 1 hour for daily data
    '1W': 60 * 60 * 24, // 24 hours for weekly data
    '1M': 60 * 60 * 24 * 7, // 7 days for monthly data
    '1Y': 60 * 60 * 24 * 30 // 30 days for yearly data
};

class CacheService {
    static generateCacheKey(symbol, interval, startDate, endDate) {
        return `historicaldata:${symbol}:${interval}:${startDate}-${endDate}`;
    }

    static async get(key) {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    }

    static async set(key, data, interval) {
        try {
            const ttl = CACHE_TTL[interval] || CACHE_TTL['1D'];
            await redis.setex(key, ttl, JSON.stringify(data));
        } catch (error) {
            console.error('Redis set error:', error);
        }
    }

    static async invalidatePattern(pattern) {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(keys);
            }
        } catch (error) {
            console.error('Redis invalidate error:', error);
        }
    }

    static async invalidateSymbolCache(symbol, interval) {
        const pattern = `historicaldata:${symbol}:${interval}:*`;
        await this.invalidatePattern(pattern);
    }
}

module.exports = CacheService; 