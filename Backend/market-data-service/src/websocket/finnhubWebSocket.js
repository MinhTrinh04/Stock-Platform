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
                console.log('Message from server:', message);

                if (message.type === 'trade') {
                    const trades = message.data;
                    const timestamp = Date.now();

                    for (const trade of trades) {
                        // Store trade data in Redis with timestamp
                        const key = `trades:${trade.s}:${timestamp}`;
                        await redisClient.setEx(key, 86400, JSON.stringify(trade)); // Store for 24 hours

                        // Also store in a sorted set for time-based queries
                        const sortedSetKey = `trades:${trade.s}:sorted`;
                        await redisClient.zAdd(sortedSetKey, {
                            score: Number(timestamp),
                            value: JSON.stringify({
                                symbol: trade.s,
                                price: trade.p,
                                volume: trade.v,
                                timestamp: timestamp,
                                conditions: trade.c || [],
                                tradeId: trade.i || null
                            })
                        });
                    }
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
            const message = JSON.stringify({
                'type': 'subscribe',
                'symbol': symbol
            });
            this.ws.send(message);
            this.subscriptions.add(symbol);
            console.log(`Subscribed to ${symbol}`);
        }
    }

    unsubscribe(symbol) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({
                'type': 'unsubscribe',
                'symbol': symbol
            });
            this.ws.send(message);
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
            // Use zRangeByScore with simpler syntax
            // const trades = await redisClient.zRangeByScore(key, min, max);
            const trades = await redisClient.zRange(key, min, max, { BYSCORE: true });
            console.log('Found trades:', trades.length);
            return trades.map(trade => JSON.parse(trade));
        } catch (error) {
            console.error('Error fetching trades from Redis:', error);
            throw error;
        }
    }
}

module.exports = FinnhubWebSocket; 