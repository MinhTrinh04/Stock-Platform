const express = require('express');
const { PythonShell } = require('python-shell');
const path = require('path');
const HistoricalDataService = require('../services/historicalDataService');
const Instrument = require('../models/Instrument');

const router = express.Router();

// Get OHLCV data for a specific forex pair
router.get('/ohlcv/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { start_date, end_date, interval = '1H' } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        // Validate interval
        const validIntervals = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W'];
        if (!validIntervals.includes(interval)) {
            return res.status(400).json({ error: 'Invalid interval. Must be one of: ' + validIntervals.join(', ') });
        }

        // Check if instrument exists
        const instrument = await Instrument.findOne({ symbol, type: 'forex' });
        if (!instrument) {
            return res.status(404).json({ error: 'Forex pair not found' });
        }

        const data = await HistoricalDataService.getHistoricalData(
            symbol,
            start_date,
            end_date,
            interval
        );

        res.json(data);
    } catch (error) {
        console.error('Route handler error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get forex pair information
router.get('/info/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;

        // Find instrument in database
        const instrument = await Instrument.findOne({ symbol, type: 'forex' });

        if (!instrument) {
            return res.status(404).json({ error: 'Forex pair not found' });
        }

        // Return formatted forex pair information
        res.json({
            symbol: instrument.symbol,
            name: instrument.name,
            type: instrument.type,
            description: instrument.description,
            baseCurrency: instrument.baseCurrency,
            quoteCurrency: instrument.quoteCurrency,
            pipValue: instrument.pipValue,
            minTradeSize: instrument.minTradeSize
        });
    } catch (error) {
        console.error('Route handler error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all available forex pairs
router.get('/symbols', async (req, res) => {
    try {
        const instruments = await Instrument.find({ type: 'forex' }, 'symbol name type description baseCurrency quoteCurrency');
        res.json(instruments);
    } catch (error) {
        console.error('Route handler error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 