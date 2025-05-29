const cron = require('node-cron');
const Instrument = require('../models/Instrument');
const HistoricalData = require('../models/HistoricalData');
const HistoricalDataService = require('../services/historicalDataService');
const CacheService = require('../services/cacheService');

class HistoricalDataWorker {
    constructor() {
        this.intervals = ['1H', '1D', '1W', '1M', '1Y'];
        this.setupCronJobs();
    }

    setupCronJobs() {
        // Hourly data update (every 5 minutes during market hours)
        cron.schedule('*/5 9-15 * * 1-5', async () => {
            await this.updateData('1H');
        });

        // Daily data update (after market close)
        cron.schedule('0 16 * * 1-5', async () => {
            await this.updateData('1D');
        });

        // Weekly data update (end of week)
        cron.schedule('0 16 * * 5', async () => {
            await this.updateData('1W');
        });

        // Monthly data update (end of month)
        cron.schedule('0 16 28-31 * *', async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (tomorrow.getDate() === 1) {
                await this.updateData('1M');
            }
        });

        // Yearly data update (end of year)
        cron.schedule('0 16 31 12 *', async () => {
            await this.updateData('1Y');
        });
    }

    async updateData(interval) {
        try {
            console.log(`Starting ${interval} data update...`);

            // Get all active instruments
            const instruments = await Instrument.find({ type: 'stock' });

            for (const instrument of instruments) {
                try {
                    // Get the latest data point for this instrument and interval
                    const latestData = await HistoricalData.findOne({
                        instrumentSymbol: instrument.symbol,
                        interval: interval
                    }).sort({ timestamp: -1 });

                    const startDate = latestData
                        ? new Date(latestData.timestamp.getTime() + this.getIntervalInMs(interval))
                        : new Date(Date.now() - this.getIntervalInMs(interval) * 365); // Default to 1 year ago

                    const endDate = new Date();

                    // Skip if startDate is after endDate
                    if (startDate >= endDate) {
                        console.log(`No new data needed for ${instrument.symbol} ${interval}`);
                        continue;
                    }

                    // Fetch new data
                    const newData = await HistoricalDataService.fetchFromVnstock(
                        instrument.symbol,
                        startDate.toISOString(),
                        endDate.toISOString(),
                        interval
                    );

                    // Save to MongoDB
                    await HistoricalDataService.saveToMongoDB(newData, instrument.symbol, interval);

                    // Invalidate cache
                    await CacheService.invalidateSymbolCache(instrument.symbol, interval);

                    console.log(`Updated ${interval} data for ${instrument.symbol}`);
                } catch (error) {
                    console.error(`Error updating ${interval} data for ${instrument.symbol}:`, error);
                }
            }
        } catch (error) {
            console.error(`Error in ${interval} data update:`, error);
        }
    }

    getIntervalInMs(interval) {
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

module.exports = HistoricalDataWorker; 