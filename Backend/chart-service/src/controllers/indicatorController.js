const { EMA, RSI, BollingerBands } = require('technicalindicators');

// Calculate RSI
const calculateRSI = async (prices, period = 14) => {
    try {
        const rsi = new RSI({
            period: period,
            values: prices
        });
        return rsi.getResult();
    } catch (error) {
        throw new Error(`Error calculating RSI: ${error.message}`);
    }
};

// Calculate EMA
const calculateEMA = async (prices, period = 14) => {
    try {
        const ema = new EMA({
            period: period,
            values: prices
        });
        return ema.getResult();
    } catch (error) {
        throw new Error(`Error calculating EMA: ${error.message}`);
    }
};

// Calculate Bollinger Bands
const calculateBollingerBands = async (prices, period = 14, stdDev = 2) => {
    try {
        const bb = new BollingerBands({
            period: period,
            values: prices,
            stdDev: stdDev
        });
        return bb.getResult();
    } catch (error) {
        throw new Error(`Error calculating Bollinger Bands: ${error.message}`);
    }
};

module.exports = {
    calculateRSI,
    calculateEMA,
    calculateBollingerBands
}; 