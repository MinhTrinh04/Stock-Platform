require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const redisClient = require('./config/redis');

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

// Routes
app.use('/api/stock', require('./routes/stockRoutes'));
app.use('/api/crypto', require('./routes/cryptoRoutes'));
app.use('/api/forex', require('./routes/forexRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Market data service running on port ${PORT}`);
}); 