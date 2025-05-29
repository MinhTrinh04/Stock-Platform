const express = require('express');
const { PythonShell } = require('python-shell');
const path = require('path');

const router = express.Router();

// Get OHLCV data for a specific symbol
router.get('/ohlcv/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { start_date, end_date, interval = '1D' } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        let options = {
            mode: 'text',
            pythonPath: 'python3',
            pythonOptions: ['-u'],
            scriptPath: path.join(__dirname, '..'),
            args: [symbol, start_date, end_date, interval]
        };

        PythonShell.run('stock_data.py', options).then(messages => {
            try {
                const data = JSON.parse(messages[0]);
                if (data.error) {
                    return res.status(500).json({ error: data.error });
                }
                res.json(data);
            } catch (error) {
                res.status(500).json({ error: 'Failed to parse Python script output' });
            }
        }).catch(err => {
            res.status(500).json({ error: 'Failed to execute Python script' });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get company overview
router.get('/company/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        let options = {
            mode: 'text',
            pythonPath: 'python3',
            pythonOptions: ['-u'],
            scriptPath: path.join(__dirname, '..'),
            args: ['company', symbol]
        };

        PythonShell.run('stock_data.py', options).then(messages => {
            try {
                const data = JSON.parse(messages[0]);
                if (data.error) {
                    return res.status(500).json({ error: data.error });
                }
                res.json(data);
            } catch (error) {
                res.status(500).json({ error: 'Failed to parse Python script output' });
            }
        }).catch(err => {
            res.status(500).json({ error: 'Failed to execute Python script' });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get financial statements
router.get('/financial/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { type = 'year', statement = 'balance' } = req.query;

        let options = {
            mode: 'text',
            pythonPath: 'python3',
            pythonOptions: ['-u'],
            scriptPath: path.join(__dirname, '..'),
            args: ['financial', symbol, type, statement]
        };

        PythonShell.run('stock_data.py', options).then(messages => {
            try {
                const data = JSON.parse(messages[0]);
                if (data.error) {
                    return res.status(500).json({ error: data.error });
                }
                res.json(data);
            } catch (error) {
                res.status(500).json({ error: 'Failed to parse Python script output' });
            }
        }).catch(err => {
            res.status(500).json({ error: 'Failed to execute Python script' });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get market indices
router.get('/indices', async (req, res) => {
    try {
        let options = {
            mode: 'text',
            pythonPath: 'python3',
            pythonOptions: ['-u'],
            scriptPath: path.join(__dirname, '..'),
            args: ['indices']
        };

        PythonShell.run('stock_data.py', options).then(messages => {
            try {
                const data = JSON.parse(messages[0]);
                if (data.error) {
                    return res.status(500).json({ error: data.error });
                }
                res.json(data);
            } catch (error) {
                res.status(500).json({ error: 'Failed to parse Python script output' });
            }
        }).catch(err => {
            res.status(500).json({ error: 'Failed to execute Python script' });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all available symbols
router.get('/symbols', async (req, res) => {
    try {
        let options = {
            mode: 'text',
            pythonPath: 'python3',
            pythonOptions: ['-u'],
            scriptPath: path.join(__dirname, '..'),
            args: ['symbols']
        };

        PythonShell.run('stock_data.py', options).then(messages => {
            try {
                const data = JSON.parse(messages[0]);
                if (data.error) {
                    return res.status(500).json({ error: data.error });
                }
                res.json(data);
            } catch (error) {
                res.status(500).json({ error: 'Failed to parse Python script output' });
            }
        }).catch(err => {
            res.status(500).json({ error: 'Failed to execute Python script' });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 