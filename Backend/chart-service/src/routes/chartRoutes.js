const express = require('express');
const router = express.Router();
const { calculateRSI, calculateEMA, calculateBollingerBands } = require('../controllers/indicatorController');

// RSI endpoint
router.post('/rsi', async (req, res) => {
    try {
        const { prices, period } = req.body;
        const result = await calculateRSI(prices, period);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating RSI', error: error.message });
    }
});

// EMA endpoint
router.post('/ema', async (req, res) => {
    try {
        const { prices, period } = req.body;
        const result = await calculateEMA(prices, period);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating EMA', error: error.message });
    }
});

// Bollinger Bands endpoint
router.post('/bollinger-bands', async (req, res) => {
    try {
        const { prices, period, stdDev } = req.body;
        const result = await calculateBollingerBands(prices, period, stdDev);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating Bollinger Bands', error: error.message });
    }
});

module.exports = router; 