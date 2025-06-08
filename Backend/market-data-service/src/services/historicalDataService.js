const { PythonShell } = require('python-shell');
const path = require('path');
const HistoricalData = require('../models/HistoricalData');
const CacheService = require('./cacheService');

class HistoricalDataService {
    static async getHistoricalData(symbol, startDate, endDate, interval, marketType = 'stock') {
        try {
            // Generate cache key
            const cacheKey = CacheService.generateCacheKey(symbol, interval, startDate, endDate);

            // Try to get from cache first
            const cachedData = await CacheService.get(cacheKey);
            if (cachedData) {
                return cachedData;
            }

            // If not in cache, get from MongoDB
            const mongoData = await HistoricalData.find({
                instrumentSymbol: symbol,
                interval: interval,
                timestamp: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }).sort({ timestamp: 1 });

            // Check if we have all the data we need
            const hasAllData = this.checkDataCompleteness(mongoData, startDate, endDate, interval);

            if (hasAllData) {
                // Cache the MongoDB data
                await CacheService.set(cacheKey, mongoData, interval);
                return mongoData;
            }

            // If we don't have all data, fetch from external source
            const externalData = await this.fetchFromExternalSource(symbol, startDate, endDate, interval, marketType);

            // Save to MongoDB
            await this.saveToMongoDB(externalData, symbol, interval);

            // Cache the complete dataset
            const completeData = await HistoricalData.find({
                instrumentSymbol: symbol,
                interval: interval,
                timestamp: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }).sort({ timestamp: 1 });

            await CacheService.set(cacheKey, completeData, interval);
            return completeData;

        } catch (error) {
            console.error('Error in getHistoricalData:', error);
            throw error;
        }
    }

    static async fetchFromExternalSource(symbol, startDate, endDate, interval, marketType) {
        return new Promise((resolve, reject) => {
            const options = {
                mode: 'text',
                pythonPath: 'python3',
                pythonOptions: ['-u'],
                scriptPath: path.join(__dirname, '..'),
                args: ['ohlcv', symbol, startDate, endDate, interval, marketType]
            };

            PythonShell.run('stock_data.py', options)
                .then(messages => {
                    try {
                        const data = JSON.parse(messages[0]);
                        if (data.error) {
                            reject(new Error(data.error));
                        } else {
                            resolve(data);
                        }
                    } catch (error) {
                        reject(error);
                    }
                })
                .catch(reject);
        });
    }

    static async saveToMongoDB(data, symbol, interval) {
        const operations = data.map(item => ({
            updateOne: {
                filter: {
                    instrumentSymbol: symbol,
                    timestamp: new Date(item.timestamp),
                    interval: interval
                },
                update: {
                    $set: {
                        open: item.open,
                        high: item.high,
                        low: item.low,
                        close: item.close,
                        volume: item.volume
                    }
                },
                upsert: true
            }
        }));

        await HistoricalData.bulkWrite(operations);
    }

    static checkDataCompleteness(data, startDate, endDate, interval) {
        if (!data || data.length === 0) return false;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const intervalMs = this.getIntervalInMs(interval);

        // Check if we have data points at regular intervals
        for (let current = start; current <= end; current = new Date(current.getTime() + intervalMs)) {
            const hasDataPoint = data.some(point =>
                point.timestamp.getTime() === current.getTime()
            );
            if (!hasDataPoint) return false;
        }

        return true;
    }

    static getIntervalInMs(interval) {
        const [value, unit] = interval.match(/(\d+)([HDWYM])/).slice(1);
        const numValue = parseInt(value);

        switch (unit) {
            case 'H': return numValue * 60 * 60 * 1000;
            case 'D': return numValue * 24 * 60 * 60 * 1000;
            case 'W': return numValue * 7 * 24 * 60 * 60 * 1000;
            case 'M': return numValue * 30 * 24 * 60 * 60 * 1000;
            case 'Y': return numValue * 365 * 24 * 60 * 60 * 1000;
            default: throw new Error(`Invalid interval: ${interval}`);
        }
    }
}

module.exports = HistoricalDataService; 