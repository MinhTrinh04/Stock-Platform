const express = require('express');
const router = express.Router();

module.exports = (finnhubClient, redisClient, finnhubWebSocket) => {
    // Get stock quote
    router.get('/quote/:symbol', async (req, res) => {
        try {
            const { symbol } = req.params;

            // Check Redis cache first
            const cachedQuote = await redisClient.get(`quote:${symbol}`);
            if (cachedQuote) {
                return res.json(JSON.parse(cachedQuote));
            }

            // Get fresh data from Finnhub
            finnhubClient.quote(symbol, (error, data, response) => {
                if (error) {
                    return res.status(500).json({ message: 'Error fetching quote', error: error.message });
                }

                // Cache the result for 1 minute
                redisClient.setEx(`quote:${symbol}`, 60, JSON.stringify(data));
                res.json(data);
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching quote', error: error.message });
        }
    });

    // Get stock candles
    router.get('/candles/:symbol', async (req, res) => {
        try {
            const { symbol } = req.params;
            const { resolution, from, to } = req.query;

            // Check Redis cache first
            const cacheKey = `candles:${symbol}:${resolution}:${from}:${to}`;
            const cachedCandles = await redisClient.get(cacheKey);
            if (cachedCandles) {
                return res.json(JSON.parse(cachedCandles));
            }

            // Get fresh data from Finnhub
            finnhubClient.stockCandles(symbol, resolution, from, to, (error, data, response) => {
                if (error) {
                    return res.status(500).json({ message: 'Error fetching candles', error: error.message });
                }

                // Cache the result for 5 minutes
                redisClient.setEx(cacheKey, 300, JSON.stringify(data));
                res.json(data);
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching candles', error: error.message });
        }
    });

    // Get company profile
    router.get('/profile/:symbol', async (req, res) => {
        try {
            const { symbol } = req.params;

            // Check Redis cache first
            const cachedProfile = await redisClient.get(`profile:${symbol}`);
            if (cachedProfile) {
                return res.json(JSON.parse(cachedProfile));
            }

            // Get fresh data from Finnhub
            finnhubClient.companyProfile2({ symbol }, (error, data, response) => {
                if (error) {
                    return res.status(500).json({ message: 'Error fetching profile', error: error.message });
                }

                // Cache the result for 1 hour
                redisClient.setEx(`profile:${symbol}`, 3600, JSON.stringify(data));
                res.json(data);
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching profile', error: error.message });
        }
    });

    // Get company news
    router.get('/news/:symbol', async (req, res) => {
        try {
            const { symbol } = req.params;
            const { from, to } = req.query;

            // Check Redis cache first
            const cacheKey = `news:${symbol}:${from}:${to}`;
            const cachedNews = await redisClient.get(cacheKey);
            if (cachedNews) {
                return res.json(JSON.parse(cachedNews));
            }

            // Get fresh data from Finnhub
            finnhubClient.companyNews(symbol, from, to, (error, data, response) => {
                if (error) {
                    return res.status(500).json({ message: 'Error fetching news', error: error.message });
                }

                // Cache the result for 1 hour
                redisClient.setEx(cacheKey, 3600, JSON.stringify(data));
                res.json(data);
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching news', error: error.message });
        }
    });

    // Get technical indicators
    router.get('/indicators/:symbol', async (req, res) => {
        try {
            const { symbol } = req.params;
            const { resolution, from, to, indicator } = req.query;

            // Check Redis cache first
            const cacheKey = `indicators:${symbol}:${resolution}:${from}:${to}:${indicator}`;
            const cachedIndicators = await redisClient.get(cacheKey);
            if (cachedIndicators) {
                return res.json(JSON.parse(cachedIndicators));
            }

            // Get fresh data from Finnhub
            finnhubClient.technicalIndicator(symbol, resolution, from, to, indicator, {}, (error, data, response) => {
                if (error) {
                    return res.status(500).json({ message: 'Error fetching indicators', error: error.message });
                }

                // Cache the result for 5 minutes
                redisClient.setEx(cacheKey, 300, JSON.stringify(data));
                res.json(data);
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching indicators', error: error.message });
        }
    });

    // Subscribe to real-time trades
    router.post('/subscribe/:symbol', (req, res) => {
        try {
            const { symbol } = req.params;
            finnhubWebSocket.subscribe(symbol);
            res.json({ message: `Subscribed to ${symbol}` });
        } catch (error) {
            res.status(500).json({ message: 'Error subscribing to symbol', error: error.message });
        }
    });

    // Unsubscribe from real-time trades
    router.post('/unsubscribe/:symbol', (req, res) => {
        try {
            const { symbol } = req.params;
            finnhubWebSocket.unsubscribe(symbol);
            res.json({ message: `Unsubscribed from ${symbol}` });
        } catch (error) {
            res.status(500).json({ message: 'Error unsubscribing from symbol', error: error.message });
        }
    });

    // Get historical trades
    router.get('/trades/:symbol', async (req, res) => {
        try {
            const { symbol } = req.params;
            const { startTime, endTime } = req.query;

            const trades = await finnhubWebSocket.getHistoricalTrades(
                symbol,
                parseInt(startTime),
                parseInt(endTime)
            );

            res.json(trades);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching trades', error: error.message });
        }
    });

    return router;
}; 