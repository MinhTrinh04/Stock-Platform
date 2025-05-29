const mongoose = require('mongoose');

const historicalDataSchema = new mongoose.Schema({
    instrumentSymbol: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        required: true,
        index: true
    },
    open: {
        type: Number,
        required: true
    },
    high: {
        type: Number,
        required: true
    },
    low: {
        type: Number,
        required: true
    },
    close: {
        type: Number,
        required: true
    },
    volume: {
        type: Number,
        required: true
    },
    interval: {
        type: String,
        required: true,
        enum: ['1H', '1D', '1W', '1M', '1Y'],
        index: true
    }
}, {
    timestamps: true
});

// Create a compound index for efficient querying
historicalDataSchema.index({ instrumentSymbol: 1, timestamp: 1, interval: 1 }, { unique: true });

module.exports = mongoose.model('HistoricalData', historicalDataSchema); 