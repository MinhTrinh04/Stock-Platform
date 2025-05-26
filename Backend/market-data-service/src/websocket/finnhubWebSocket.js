const WebSocket = require('ws');
const redisClient = require('../config/redis');

class FinnhubWebSocket {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.ws = null;
        this.subscriptions = new Set();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect() {
        console.log('Connecting to Finnhub WebSocket...');
        this.ws = new WebSocket(`wss://ws.finnhub.io?token=${this.apiKey}`);

        this.ws.on('open', () => {
            console.log('Connected to Finnhub WebSocket');
            this.reconnectAttempts = 0;

            // Resubscribe to all symbols after reconnection
            this.subscriptions.forEach(symbol => {
                this.subscribe(symbol);
            });
        });

        this.ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data);
                console.log('Received WebSocket message type:', message.type);

                if (message.type === 'trade') {
                    const timestamp = Date.now();
                    console.log('Trade data received:', {
                        symbol: message.data[0].s,
                        price: message.data[0].p,
                        volume: message.data[0].v,
                        timestamp: new Date(timestamp)
                    });

                    // Store trade data in Redis with timestamp
                    const key = `trades:${message.data[0].s}:${timestamp}`;
                    await redisClient.setEx(key, 86400, JSON.stringify(message.data)); // Store for 24 hours
                    console.log('Stored trade data in Redis with key:', key);

                    // Also store in a sorted set for time-based queries
                    const sortedSetKey = `trades:${message.data[0].s}:sorted`;
                    await redisClient.zAdd(sortedSetKey, {
                        score: Number(timestamp), // Ensure score is a number
                        value: JSON.stringify(message.data)
                    });
                    console.log('Added trade data to sorted set:', sortedSetKey);
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        });

        this.ws.on('close', () => {
            console.log('WebSocket connection closed');
            this.handleReconnect();
        });

        this.ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.handleReconnect();
        });
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(), 5000 * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    subscribe(symbol) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ 'type': 'subscribe', 'symbol': symbol }));
            this.subscriptions.add(symbol);
            console.log(`Subscribed to ${symbol}`);
        }
    }

    unsubscribe(symbol) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': symbol }));
            this.subscriptions.delete(symbol);
            console.log(`Unsubscribed from ${symbol}`);
        }
    }

    async getHistoricalTrades(symbol, startTime, endTime) {
        const key = `trades:${symbol}:sorted`;
        console.log('Fetching trades from Redis:', { key, startTime, endTime });

        // Convert timestamps to numbers and ensure they are valid
        const min = Number(startTime);
        const max = Number(endTime);

        if (isNaN(min) || isNaN(max)) {
            throw new Error('Invalid time range provided');
        }

        try {
            // Use zRange instead of zRangeByScore with explicit min/max
            const trades = await redisClient.zRange(key, 0, -1, {
                REV: true,
                BYSCORE: true,
                LIMIT: {
                    offset: 0,
                    count: 100
                }
            });
            console.log('Found trades:', trades.length);
            return trades.map(trade => JSON.parse(trade));
        } catch (error) {
            console.error('Error fetching trades from Redis:', error);
            throw error;
        }
    }
}

module.exports = FinnhubWebSocket; 