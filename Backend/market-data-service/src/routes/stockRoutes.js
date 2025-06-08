const express = require('express');
const { PythonShell } = require('python-shell');
const path = require('path');
const HistoricalDataService = require('../services/historicalDataService');
const Instrument = require('../models/Instrument');

const router = express.Router();

// Get OHLCV data for a specific symbol
router.get('/ohlcv/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { start_date, end_date, interval = '1D' } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        // Validate interval
        const validIntervals = ['1H', '1D', '1W', '1M'];
        if (!validIntervals.includes(interval)) {
            return res.status(400).json({ error: 'Invalid interval. Must be one of: ' + validIntervals.join(', ') });
        }

        // Check if instrument exists
        const instrument = await Instrument.findOne({ symbol, type: 'stock' });
        if (!instrument) {
            return res.status(404).json({ error: 'Instrument not found' });
        }

        const data = await HistoricalDataService.getHistoricalData(
            symbol,
            start_date,
            end_date,
            interval,
            'stock'
        );

        res.json(data);
    } catch (error) {
        console.error('Route handler error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get company information from database
router.get('/company/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;

        // Find instrument in database
        const instrument = await Instrument.findOne({ symbol, type: 'stock' });

        if (!instrument) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Return formatted company information
        res.json({
            symbol: instrument.symbol,
            name: instrument.name,
            type: instrument.type,
            description: instrument.description
        });
    } catch (error) {
        console.error('Route handler error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all available symbols
router.get('/symbols', async (req, res) => {
    try {
        const instruments = await Instrument.find({ type: 'stock' }, 'symbol name type description');
        res.json(instruments);
    } catch (error) {
        console.error('Route handler error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 