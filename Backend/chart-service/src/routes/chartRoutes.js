const express = require('express');
const router = express.Router();
const { EMA, RSI, MACD } = require('technicalindicators');

// Calculate EMA
router.post('/ema', async (req, res) => {
    try {
        const { prices, period } = req.body;

        const ema = new EMA({
            period: period || 20,
            values: prices
        });

        const result = ema.getResult();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating EMA', error: error.message });
    }
});

// Calculate RSI
router.post('/rsi', async (req, res) => {
    try {
        const { prices, period } = req.body;

        const rsi = new RSI({
            period: period || 14,
            values: prices
        });

        const result = rsi.getResult();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating RSI', error: error.message });
    }
});

// Calculate MACD
router.post('/macd', async (req, res) => {
    try {
        const { prices, fastPeriod, slowPeriod, signalPeriod } = req.body;

        const macd = new MACD({
            fastPeriod: fastPeriod || 12,
            slowPeriod: slowPeriod || 26,
            signalPeriod: signalPeriod || 9,
            values: prices
        });

        const result = macd.getResult();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating MACD', error: error.message });
    }
});

module.exports = router; 