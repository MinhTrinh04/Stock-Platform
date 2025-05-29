require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const redisClient = require('./config/redis');
const { PythonShell } = require('python-shell');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Redis connection check
redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Test Redis connection
async function testRedisConnection() {
    try {
        await redisClient.set('test', 'Hello Redis');
        const value = await redisClient.get('test');
        console.log('Redis test value:', value);
    } catch (error) {
        console.error('Redis test failed:', error);
    }
}

testRedisConnection();

// Get OHLCV data
app.get('/api/ohlcv/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        let options = {
            mode: 'text',
            pythonPath: 'python3',
            pythonOptions: ['-u'],
            scriptPath: path.join(__dirname),
            args: [symbol, start_date, end_date]
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Market data service running on port ${PORT}`);
}); 