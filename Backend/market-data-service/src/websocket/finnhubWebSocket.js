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

                if (message.type === 'trade') {
                    // Store trade data in Redis with timestamp
                    const key = `trades:${message.data[0].s}:${Date.now()}`;
                    await redisClient.setEx(key, 86400, JSON.stringify(message.data)); // Store for 24 hours

                    // Also store in a sorted set for time-based queries
                    const sortedSetKey = `trades:${message.data[0].s}:sorted`;
                    await redisClient.zAdd(sortedSetKey, {
                        score: Date.now(),
                        value: JSON.stringify(message.data)
                    });
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
        const trades = await redisClient.zRangeByScore(key, startTime, endTime);
        return trades.map(trade => JSON.parse(trade));
    }
}

module.exports = FinnhubWebSocket; 